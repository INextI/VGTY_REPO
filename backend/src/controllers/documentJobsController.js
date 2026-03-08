// backend/src/controllers/documentJobsController.js
const documentService = require('../services/documentService');
const db = require('../config/db');
const { Queue } = require('bullmq');

// Создаем очередь для обработки заданий
const documentEditQueue = new Queue('document-edit-queue', {
    connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379
    }
});

class DocumentJobsController {
    /**
     * Создание нового задания на массовое редактирование
     */
    async createJob(req, res) {
        try {
            const { searchText, replaceText, filters } = req.body;
            const employeeId = req.user.id; // Из middleware аутентификации
            
            // Валидация входных данных
            if (!searchText || searchText.trim() === '') {
                return res.status(400).json({
                    error: 'Текст для поиска не может быть пустым'
                });
            }
            
            if (!filters || Object.keys(filters).length === 0) {
                return res.status(400).json({
                    error: 'Необходимо указать хотя бы один фильтр для поиска документов'
                });
            }
            
            // Проверяем, есть ли документы по указанным фильтрам
            const documents = await documentService.findDocumentsByCriteria(filters);
            
            if (documents.length === 0) {
                return res.status(404).json({
                    error: 'По указанным фильтрам документы не найдены'
                });
            }
            
            // Создаем запись в таблице заданий
            const jobResult = await db.query(
                `INSERT INTO document_edit_jobs 
                 (search_text, replace_text, filter_criteria, created_by_employee_id, total_count)
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id, created_at, status`,
                [searchText, replaceText, filters, employeeId, documents.length]
            );
            
            const jobId = jobResult.rows[0].id;
            
            // Добавляем задачу в очередь
            await documentEditQueue.add('process-job', { jobId }, {
                jobId: jobId.toString(),
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000
                }
            });
            
            // Возвращаем информацию о созданном задании
            res.status(202).json({
                message: 'Задание принято в обработку',
                jobId,
                totalDocuments: documents.length,
                createdAt: jobResult.rows[0].created_at,
                status: jobResult.rows[0].status
            });
            
        } catch (error) {
            console.error('Ошибка при создании задания:', error);
            res.status(500).json({
                error: 'Внутренняя ошибка сервера',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    /**
     * Предпросмотр изменений перед запуском задания
     */
    async previewJob(req, res) {
        try {
            const { searchText, filters } = req.body;
            
            if (!searchText || searchText.trim() === '') {
                return res.status(400).json({
                    error: 'Текст для поиска не может быть пустым'
                });
            }
            
            if (!filters || Object.keys(filters).length === 0) {
                return res.status(400).json({
                    error: 'Необходимо указать фильтры для поиска'
                });
            }
            
            // Получаем предпросмотр изменений
            const previewResults = await documentService.previewChanges(searchText, filters);
            
            // Получаем общую статистику
            const totalDocuments = previewResults.length;
            const totalMatches = previewResults.reduce((sum, doc) => sum + doc.matches, 0);
            const documentsWithMatches = previewResults.filter(doc => doc.matches > 0).length;
            
            res.json({
                searchText,
                filters,
                statistics: {
                    totalDocuments,
                    totalMatches,
                    documentsWithMatches,
                    documentsWithoutMatches: totalDocuments - documentsWithMatches
                },
                documents: previewResults
            });
            
        } catch (error) {
            console.error('Ошибка при предпросмотре:', error);
            res.status(500).json({
                error: 'Ошибка при предпросмотре изменений',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    /**
     * Получение статуса выполнения задания
     */
    async getJobStatus(req, res) {
        try {
            const { id } = req.params;
            
            // Получаем информацию о задании
            const jobResult = await db.query(
                `SELECT 
                    id, search_text, replace_text, filter_criteria,
                    status, created_at, started_at, completed_at,
                    created_by_employee_id, total_count, processed_count,
                    success_count, failed_count, skipped_count, error_message
                 FROM document_edit_jobs 
                 WHERE id = $1`,
                [id]
            );
            
            if (jobResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Задание не найдено'
                });
            }
            
            const job = jobResult.rows[0];
            
            // Получаем логи обработки документов
            const logsResult = await db.query(
                `SELECT 
                    l.id, l.document_attachment_id, l.status, l.message, l.created_at,
                    da.name as document_name, dt.name as document_type
                 FROM document_edit_job_logs l
                 JOIN document_attachments da ON l.document_attachment_id = da.id
                 JOIN document_types dt ON da.type_id = dt.id
                 WHERE l.job_id = $1
                 ORDER BY l.created_at DESC
                 LIMIT 100`,
                [id]
            );
            
            // Рассчитываем прогресс
            let progress = 0;
            if (job.total_count > 0) {
                progress = Math.round((job.processed_count || 0) / job.total_count * 100);
            }
            
            // Формируем ответ
            const response = {
                jobId: job.id,
                searchText: job.search_text,
                replaceText: job.replace_text,
                filters: job.filter_criteria,
                status: job.status,
                timestamps: {
                    created: job.created_at,
                    started: job.started_at,
                    completed: job.completed_at
                },
                statistics: {
                    total: job.total_count,
                    processed: job.processed_count || 0,
                    success: job.success_count || 0,
                    failed: job.failed_count || 0,
                    skipped: job.skipped_count || 0
                },
                progress: {
                    percentage: progress,
                    processed: job.processed_count || 0,
                    total: job.total_count
                },
                error: job.error_message,
                logs: logsResult.rows
            };
            
            res.json(response);
            
        } catch (error) {
            console.error('Ошибка при получении статуса задания:', error);
            res.status(500).json({
                error: 'Ошибка при получении статуса задания'
            });
        }
    }
    
    /**
     * Получение списка всех заданий
     */
    async getJobs(req, res) {
        try {
            const { status, limit = 50, offset = 0 } = req.query;
            
            let query = `
                SELECT 
                    id, search_text, replace_text, status,
                    created_at, started_at, completed_at,
                    total_count, processed_count, success_count,
                    failed_count, skipped_count,
                    e.first_name || ' ' || e.last_name as created_by
                FROM document_edit_jobs dej
                LEFT JOIN employees e ON dej.created_by_employee_id = e.id
            `;
            
            const params = [];
            let paramIndex = 1;
            
            if (status) {
                query += ` WHERE status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }
            
            query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(parseInt(limit), parseInt(offset));
            
            const jobsResult = await db.query(query, params);
            
            // Получаем общее количество
            const countQuery = status 
                ? `SELECT COUNT(*) FROM document_edit_jobs WHERE status = $1`
                : `SELECT COUNT(*) FROM document_edit_jobs`;
            
            const countParams = status ? [status] : [];
            const countResult = await db.query(countQuery, countParams);
            
            res.json({
                jobs: jobsResult.rows,
                pagination: {
                    total: parseInt(countResult.rows[0].count),
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
            
        } catch (error) {
            console.error('Ошибка при получении списка заданий:', error);
            res.status(500).json({
                error: 'Ошибка при получении списка заданий'
            });
        }
    }
    
    /**
     * Отмена выполнения задания
     */
    async cancelJob(req, res) {
        try {
            const { id } = req.params;
            
            // Проверяем существование задания
            const jobResult = await db.query(
                'SELECT status FROM document_edit_jobs WHERE id = $1',
                [id]
            );
            
            if (jobResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Задание не найдено'
                });
            }
            
            const currentStatus = jobResult.rows[0].status;
            
            // Можно отменять только задания в статусе pending или in_progress
            if (currentStatus === 'completed' || currentStatus === 'failed') {
                return res.status(400).json({
                    error: `Невозможно отменить задание в статусе "${currentStatus}"`
                });
            }
            
            // Обновляем статус задания
            await db.query(
                `UPDATE document_edit_jobs 
                 SET status = 'cancelled', completed_at = NOW()
                 WHERE id = $1`,
                [id]
            );
            
            // Пытаемся удалить задание из очереди
            try {
                const job = await documentEditQueue.getJob(id);
                if (job) {
                    await job.remove();
                }
            } catch (queueError) {
                console.warn('Не удалось удалить задание из очереди:', queueError);
            }
            
            res.json({
                message: 'Задание успешно отменено',
                jobId: id
            });
            
        } catch (error) {
            console.error('Ошибка при отмене задания:', error);
            res.status(500).json({
                error: 'Ошибка при отмене задания'
            });
        }
    }
    
    /**
     * Получение детальной информации о документе для предпросмотра
     */
    async getDocumentPreview(req, res) {
        try {
            const { documentId } = req.params;
            const { searchText } = req.query;
            
            // Получаем информацию о документе
            const docResult = await db.query(
                `SELECT 
                    da.id, da.name, da.doc, dt.name as document_type,
                    d.name as department_name, dis.name as discipline_name,
                    ep.name as program_name
                 FROM document_attachments da
                 JOIN document_types dt ON da.type_id = dt.id
                 LEFT JOIN departments d ON da.department_id = d.id
                 LEFT JOIN disciplines dis ON da.discipline_id = dis.id
                 LEFT JOIN edu_programs ep ON da.edu_program_id = ep.id
                 WHERE da.id = $1`,
                [documentId]
            );
            
            if (docResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Документ не найден'
                });
            }
            
            const document = docResult.rows[0];
            const buffer = document.doc;
            const fileName = document.name;
            const extension = fileName.split('.').pop().toLowerCase();
            
            let content = '';
            let highlightedContent = '';
            let matches = [];
            
            // Обрабатываем в зависимости от типа файла
            if (extension === 'docx') {
                // Для DOCX используем mammoth для извлечения текста
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer: buffer });
                content = result.value;
                
            } else if (['txt', 'md', 'html', 'htm'].includes(extension)) {
                content = buffer.toString('utf-8');
            }
            
            // Если указан текст для поиска, подсвечиваем его
            if (searchText && searchText.trim() !== '') {
                const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
                highlightedContent = content.replace(regex, '<mark class="highlight">$1</mark>');
                
                // Находим все совпадения
                const matchRegex = new RegExp(escapeRegExp(searchText), 'gi');
                let match;
                while ((match = matchRegex.exec(content)) !== null) {
                    matches.push({
                        position: match.index,
                        length: match[0].length,
                        context: getContext(content, match.index, match[0].length)
                    });
                }
            } else {
                highlightedContent = content;
            }
            
            res.json({
                document: {
                    id: document.id,
                    name: document.name,
                    type: document.document_type,
                    department: document.department_name,
                    discipline: document.discipline_name,
                    program: document.program_name
                },
                content: {
                    raw: content.substring(0, 5000), // Ограничиваем размер
                    highlighted: highlightedContent.substring(0, 5000),
                    totalLength: content.length
                },
                search: {
                    text: searchText,
                    matches: matches.length,
                    details: matches.slice(0, 20) // Ограничиваем количество деталей
                }
            });
            
        } catch (error) {
            console.error('Ошибка при получении предпросмотра документа:', error);
            res.status(500).json({
                error: 'Ошибка при получении предпросмотра документа'
            });
        }
    }
    
    /**
     * Получение справочных данных для фильтров
     */
    async getFilterData(req, res) {
        try {
            // Получаем все возможные фильтры
            const [
                departments,
                disciplines,
                documentTypes,
                eduPrograms
            ] = await Promise.all([
                db.query('SELECT id, name FROM departments ORDER BY name'),
                db.query('SELECT id, name FROM disciplines ORDER BY name'),
                db.query('SELECT id, name FROM document_types ORDER BY name'),
                db.query(`
                    SELECT ep.id, ep.name, d.name as department_name 
                    FROM edu_programs ep
                    JOIN departments d ON ep.department_id = d.id
                    ORDER BY d.name, ep.name
                `)
            ]);
            
            res.json({
                departments: departments.rows,
                disciplines: disciplines.rows,
                documentTypes: documentTypes.rows,
                eduPrograms: eduPrograms.rows
            });
            
        } catch (error) {
            console.error('Ошибка при получении данных фильтров:', error);
            res.status(500).json({
                error: 'Ошибка при получении данных фильтров'
            });
        }
    }
}

// Вспомогательные функции
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getContext(text, position, length, contextLength = 50) {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + length + contextLength);
    const before = text.substring(start, position);
    const match = text.substring(position, position + length);
    const after = text.substring(position + length, end);
    
    return {
        before: start > 0 ? '...' + before : before,
        match: match,
        after: end < text.length ? after + '...' : after
    };
}

module.exports = new DocumentJobsController();