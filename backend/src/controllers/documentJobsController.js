// backend/src/controllers/documentJobsController.js
const documentService = require('../services/documentService');
const db = require('../config/db');
const DocumentEditJob = require('../models/documentEditJobs');
const DocumentEditJobLog = require('../models/documentEditJobLogs');
const DocumentAttachment = require('../models/documentAttachments');

class DocumentJobsController {
    /**
     * Создание нового задания на массовое редактирование
     */
    async createJob(req, res) {
    try {
        const { searchText, replaceText, filters } = req.body;
        const userId = req.user?.id;
        
        console.log('>>> [CONTROLLER] Создание задания:', {
            searchText,
            replaceText,
            filtersCount: Object.keys(filters).length,
            userId
        });

        // Проверка наличия userId
        if (!userId) {
            console.error('Отсутствует userId в req.user');
            return res.status(401).json({
                error: 'Пользователь не аутентифицирован'
            });
        }

        // Находим сотрудника по user_id
        const employeeResult = await db.query(
            `SELECT id FROM employees WHERE user_id = :userId`,
            { replacements: { userId }, type: db.QueryTypes.SELECT }
        );

        console.log('Результат поиска сотрудника для userId:', userId, employeeResult);

        // Проверяем наличие сотрудника
        if (!employeeResult || employeeResult.length === 0) {
            console.error('Сотрудник не найден для userId:', userId);
            
            // Дополнительная диагностика
            const userCheck = await db.query(
                `SELECT id, login, role_id FROM users WHERE id = :userId`,
                { replacements: { userId }, type: db.QueryTypes.SELECT }
            );
            
            console.log('Проверка пользователя:', userCheck);
            
            return res.status(400).json({
                error: 'Сотрудник не найден',
                details: `Пользователь с ID ${userId} не имеет связанной записи сотрудника`,
                userExists: userCheck.length > 0
            });
        }

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

        // Находим документы по фильтрам
        const documents = await documentService.findDocumentsByCriteria(filters);
        console.log(`Найдено документов: ${documents.length}`);

        if (documents.length === 0) {
            return res.status(404).json({ 
                error: 'Документы не найдены',
                filters: filters
            });
        }

        // Извлекаем ID сотрудника из результата
        const employeeId = employeeResult[0].id;
        console.log('ID сотрудника:', employeeId);

        // Создаем запись в таблице заданий
        const [jobResult] = await db.query(
            `INSERT INTO document_edit_jobs
             (id, search_text, replace_text, filter_criteria, created_by_employee_id, total_count, status, created_at)
             VALUES (gen_random_uuid(), :searchText, :replaceText, :filters, :employeeId, :total, 'pending', NOW())
             RETURNING id, created_at, status`,
            {
                replacements: {
                    searchText,
                    replaceText,
                    filters: JSON.stringify(filters),
                    employeeId,
                    total: documents.length
                },
                type: db.QueryTypes.INSERT
            }
        );

        console.log('Результат INSERT:', jobResult);

        // Исправляем получение jobId
        let jobId;
        if (Array.isArray(jobResult) && jobResult.length > 0) {
            // Если jobResult - массив результатов
            if (Array.isArray(jobResult[0])) {
                // Если первый элемент - тоже массив (результаты)
                jobId = jobResult[0][0]?.id;
            } else {
                // Если первый элемент - объект
                jobId = jobResult[0]?.id;
            }
        } else if (jobResult && jobResult.id) {
            // Если jobResult - объект
            jobId = jobResult.id;
        }

        console.log('Полученный jobId:', jobId);

        if (!jobId) {
            throw new Error('Не удалось получить ID созданного задания');
        }

        // Возвращаем информацию о созданном задании
        res.status(202).json({
            message: 'Задание принято',
            id: jobId,
            totalDocuments: documents.length,
            status: 'pending',
            created_at: jobResult[0]?.created_at || new Date().toISOString()
        });
    } catch (error) {
        console.error('!!! [CONTROLLER] Ошибка при создании задания:', error);
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
        console.log('>>> [CONTROLLER] Начало previewJob');
        try {
            const { searchText, filters } = req.body;
            console.log('Параметры из body:', { searchText, filtersCount: Object.keys(filters).length });
            
            const previewResults = await documentService.previewChanges(searchText, filters);
            console.log(`[CONTROLLER] Получено результатов из сервиса: ${previewResults.length}`);
            
            const statistics = {
                totalDocuments: previewResults.length,
                totalMatches: previewResults.reduce((sum, doc) => sum + doc.matches, 0),
                documentsWithMatches: previewResults.filter(doc => doc.matches > 0).length,
            };
            statistics.documentsWithoutMatches = statistics.totalDocuments - statistics.documentsWithMatches;
            
            res.json({ searchText, filters, statistics, documents: previewResults });
        } catch (error) {
            console.error('!!! [CONTROLLER] Ошибка в previewJob:', error);
            res.status(500).json({
                error: 'Ошибка при предпросмотре изменений',
                details: error.message
            });
        }
    }
    
    /**
     * Получение статуса выполнения задания
     */
    async getJobStatus(req, res) {
        try {
            const { id } = req.params;
            
            // Проверка на валидность UUID перед запросом к БД
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Неверный формат ID задания' });
            }
            
            // Используем модель Sequelize с правильными алиасами
            const job = await DocumentEditJob.findOne({
                where: { id },
                include: [
                    {
                        model: DocumentEditJobLog,
                        as: 'logs',
                        include: [
                            {
                                model: DocumentAttachment,
                                as: 'document',
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            });
            
            if (!job) {
                return res.status(404).json({ error: 'Задание не найдено' });
            }
            
            // Преобразуем в JSON для работы
            const jobData = job.toJSON();
            
            res.json({
                id: jobData.id,
                status: jobData.status,
                search_text: jobData.search_text,
                replace_text: jobData.replace_text,
                filter_criteria: jobData.filter_criteria,
                total_count: jobData.total_count || 0,
                processed_count: jobData.processed_count || 0,
                success_count: jobData.success_count || 0,
                failed_count: jobData.failed_count || 0,
                skipped_count: jobData.skipped_count || 0,
                created_at: jobData.created_at,
                started_at: jobData.started_at,
                completed_at: jobData.completed_at,
                logs: jobData.logs || []
            });
            
        } catch (error) {
            console.error('Ошибка при получении статуса задания:', error);
            res.status(500).json({
                error: 'Ошибка при получении статуса задания',
                details: error.message
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
            const departments = await db.query('SELECT id, name FROM departments ORDER BY name', { type: db.QueryTypes.SELECT });
            const disciplines = await db.query('SELECT id, name FROM disciplines ORDER BY name', { type: db.QueryTypes.SELECT });
            const documentTypes = await db.query('SELECT id, name FROM document_types ORDER BY name', { type: db.QueryTypes.SELECT });
            const eduPrograms = await db.query(
                `SELECT ep.id, ep.name, d.name as department_name
                 FROM edu_programs ep
                 JOIN departments d ON ep.department_id = d.id`,
                { type: db.QueryTypes.SELECT }
            );
            
            res.json({
                departments,
                disciplines,
                documentTypes,
                eduPrograms
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