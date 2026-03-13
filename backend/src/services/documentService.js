const { Worker } = require('bullmq');
const JSZip = require('jszip');
const db = require('../config/db');
const { QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

async function findDocumentsByCriteria(criteria) {
    let query = `
        SELECT DISTINCT da.id, da.name, da.type_id, dt.name as "document_type"
        FROM document_attachments da
        JOIN document_types dt ON da.type_id = dt.id
    `;
    const wheres = [];
    const replacements = {};
    
    if (criteria.departmentIds?.length) {
        wheres.push(`da.department_id IN (:departmentIds)`);
        replacements.departmentIds = criteria.departmentIds;
    }
    if (criteria.disciplineIds?.length) {
        wheres.push(`da.discipline_id IN (:disciplineIds)`);
        replacements.disciplineIds = criteria.disciplineIds;
    }
    if (criteria.eduProgramIds?.length) {
        wheres.push(`da.edu_program_id IN (:eduProgramIds)`);
        replacements.eduProgramIds = criteria.eduProgramIds;
    }
    if (criteria.documentTypeIds?.length) {
        wheres.push(`da.type_id IN (:documentTypeIds)`);
        replacements.documentTypeIds = criteria.documentTypeIds;
    }
    
    // Если есть фильтры, объединяем их через OR (как в вашей логике) или AND
    if (wheres.length > 0) {
        query += ' WHERE ' + wheres.join(' OR ');
    }
    
    query += ' ORDER BY da.name';

    try {
        const results = await db.query(query, {
            replacements: replacements,
            type: db.QueryTypes.SELECT
        });
        return results;
    } catch (error) {
        console.error('Ошибка при поиске документов:', error);
        throw error;
    }
}

/**
 * Безопасная замена текста в DOCX файле с учетом XML структуры
 */
async function replaceTextInDocx(buffer, searchText, replaceText) {
    const zip = await JSZip.loadAsync(buffer);
    const contentXml = zip.file("word/document.xml");
    
    if (!contentXml) {
        throw new Error("Неверный формат DOCX: отсутствует word/document.xml");
    }
    
    let content = await contentXml.async("string");
    
    // Безопасная замена текста только внутри <w:t> тегов
    const regex = new RegExp(`(<w:t[^>]*>)([^<]*?)(${escapeRegExp(searchText)})([^<]*?)(</w:t>)`, 'gi');
    
    let newContent = content.replace(regex, (match, openTag, before, found, after, closeTag) => {
        const replacement = before + found.replace(new RegExp(escapeRegExp(searchText), 'gi'), replaceText) + after;
        return openTag + replacement + closeTag;
    });
    
    // Также заменяем в других местах, где может быть текст
    const simpleRegex = new RegExp(escapeRegExp(searchText), 'gi');
    newContent = newContent.replace(simpleRegex, replaceText);
    
    zip.file("word/document.xml", newContent);
    
    // Обновляем также другие XML файлы, которые могут содержать текст
    const filesToCheck = [
        "word/header1.xml",
        "word/header2.xml",
        "word/header3.xml",
        "word/footer1.xml",
        "word/footer2.xml",
        "word/footer3.xml"
    ];
    
    for (const filePath of filesToCheck) {
        const file = zip.file(filePath);
        if (file) {
            let fileContent = await file.async("string");
            fileContent = fileContent.replace(simpleRegex, replaceText);
            zip.file(filePath, fileContent);
        }
    }
    
    return await zip.generateAsync({ type: "nodebuffer" });
}

/**
 * Обработка других типов файлов
 */
async function replaceTextInFile(buffer, fileName, searchText, replaceText) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'docx':
            return await replaceTextInDocx(buffer, searchText, replaceText);
        case 'txt':
        case 'md':
        case 'html':
        case 'htm':
            const textContent = buffer.toString('utf-8');
            const newText = textContent.replace(new RegExp(escapeRegExp(searchText), 'gi'), replaceText);
            return Buffer.from(newText, 'utf-8');
        case 'pdf':
            throw new Error("Редактирование PDF файлов требует дополнительных библиотек");
        default:
            throw new Error(`Неподдерживаемый формат файла: ${extension}`);
    }
}

/**
 * Логирование результата обработки документа
 */
async function logResult(jobId, documentId, status, message = null) {
    await db.query(
        `INSERT INTO document_edit_job_logs
         (job_id, document_attachment_id, status, message, created_at)
         VALUES (:jobId, :documentId, :status, :message, NOW())`,
        {
            replacements: { jobId, documentId, status, message },
            type: QueryTypes.INSERT
        }
    );
}

/**
 * Создание резервной копии документа
 * ИСПРАВЛЕНО: Генерируем новый UUID для резервной копии
 */
async function createBackup(documentId) {
    const newId = uuidv4(); // Генерируем новый UUID для резервной копии
    
    const result = await db.query(
        `INSERT INTO document_attachments
         (id, name, type_id, doc, upload_date, department_id, discipline_id, edu_program_id, session_id)
         SELECT :newId, name, type_id, doc, upload_date, department_id, discipline_id, edu_program_id, session_id
         FROM document_attachments WHERE id = :documentId
         RETURNING id`,
        {
            replacements: { newId, documentId },
            type: QueryTypes.INSERT
        }
    );
    return result[0].id;
}

/**
 * НОВАЯ ФУНКЦИЯ: Обработка замены текста в одном документе
 * Эта функция вызывается из documentJobProcessor.js
 */
async function processDocumentReplacement(documentId, searchText, replaceText) {
    let backupId = null;
    
    try {
        console.log(`🔍 Обработка замены в документе ${documentId}`);
        console.log(`📝 Поиск: "${searchText}", Замена: "${replaceText}"`);

        // Получаем данные документа с использованием правильного синтаксиса Sequelize
        const docData = await db.query(
            'SELECT doc, name FROM document_attachments WHERE id = :documentId',
            {
                replacements: { documentId },
                type: QueryTypes.SELECT
            }
        );

        if (docData.length === 0) {
            throw new Error(`Документ с ID ${documentId} не найден`);
        }

        const { doc: buffer, name: fileName } = docData[0];
        
        // Создаем резервную копию
        backupId = await createBackup(documentId);
        
        // Обрабатываем файл
        const newBuffer = await replaceTextInFile(buffer, fileName, searchText, replaceText);
        
        // Обновляем документ в БД
        await db.query(
            'UPDATE document_attachments SET doc = :newBuffer WHERE id = :documentId',
            {
                replacements: { newBuffer, documentId },
                type: QueryTypes.UPDATE
            }
        );

        // Подсчитываем количество замен
        const extension = fileName.split('.').pop().toLowerCase();
        let replacements = 0;
        
        if (extension === 'docx') {
            const zip = await JSZip.loadAsync(buffer);
            const contentXml = zip.file("word/document.xml");
            if (contentXml) {
                const xmlContent = await contentXml.async("string");
                const regex = new RegExp(escapeRegExp(searchText), 'gi');
                const matches = xmlContent.match(regex) || [];
                replacements = matches.length;
            }
        } else if (['txt', 'md', 'html', 'htm'].includes(extension)) {
            const textContent = buffer.toString('utf-8');
            const regex = new RegExp(escapeRegExp(searchText), 'gi');
            const matches = textContent.match(regex) || [];
            replacements = matches.length;
        }

        console.log(`✅ Успешно заменено ${replacements} вхождений в документе ${fileName}`);

        return {
            success: true,
            replacements: replacements,
            backupId: backupId
        };

    } catch (error) {
        console.error(`❌ Ошибка при обработке документа ${documentId}:`, error);
        
        // Восстанавливаем из резервной копии, если она была создана
        if (backupId) {
            try {
                // Проверяем, существует ли оригинальный документ
                const originalExists = await db.query(
                    'SELECT id FROM document_attachments WHERE id = :documentId',
                    {
                        replacements: { documentId },
                        type: QueryTypes.SELECT
                    }
                );
                
                if (originalExists.length === 0) {
                    // Документ был удален, восстанавливаем из резервной копии
                    await db.query(
                        'UPDATE document_attachments SET id = :documentId WHERE id = :backupId',
                        {
                            replacements: { documentId, backupId },
                            type: QueryTypes.UPDATE
                        }
                    );
                }
            } catch (restoreError) {
                console.error('❌ Ошибка при восстановлении документа:', restoreError);
            }
        }

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Основной обработчик задачи массового редактирования (для BullMQ)
 */
const processJob = async (job) => {
    const { jobId } = job.data;
    
    try {
        // 1. Получаем детали задания из БД
        const jobDetails = await db.query(
            'SELECT * FROM document_edit_jobs WHERE id = :jobId',
            {
                replacements: { jobId },
                type: QueryTypes.SELECT
            }
        );
        
        if (jobDetails.length === 0) {
            throw new Error(`Задание с ID ${jobId} не найдено`);
        }
        
        const {
            search_text,
            replace_text,
            filter_criteria,
            created_by_employee_id
        } = jobDetails[0];

        // 2. Обновляем статус задания на 'in_progress'
        await db.query(
            `UPDATE document_edit_jobs
             SET status = 'in_progress', started_at = NOW()
             WHERE id = :jobId`,
            {
                replacements: { jobId },
                type: QueryTypes.UPDATE
            }
        );

        // 3. Находим все документы, подходящие под фильтры
        const documents = await findDocumentsByCriteria(filter_criteria);
        console.log(`Найдено ${documents.length} документов для обработки`);

        // 4. Обрабатываем каждый документ
        let processedCount = 0;
        let successCount = 0;
        let failedCount = 0;
        let skippedCount = 0;

        for (const doc of documents) {
            processedCount++;
            
            try {
                // Обновляем прогресс в БД
                await db.query(
                    `UPDATE document_edit_jobs
                     SET processed_count = :processedCount, total_count = :totalCount
                     WHERE id = :jobId`,
                    {
                        replacements: { processedCount, totalCount: documents.length, jobId },
                        type: QueryTypes.UPDATE
                    }
                );

                // Получаем бинарные данные документа
                const docData = await db.query(
                    'SELECT doc, name FROM document_attachments WHERE id = :documentId',
                    {
                        replacements: { documentId: doc.id },
                        type: QueryTypes.SELECT
                    }
                );
                
                if (docData.length === 0) {
                    await logResult(jobId, doc.id, 'failed', 'Документ не найден в БД');
                    failedCount++;
                    continue;
                }

                const { doc: buffer, name: fileName } = docData[0];
                
                // Создаем резервную копию
                const backupId = await createBackup(doc.id);
                
                try {
                    // Обрабатываем файл в зависимости от типа
                    const newBuffer = await replaceTextInFile(
                        buffer,
                        fileName,
                        search_text,
                        replace_text
                    );
                    
                    // Обновляем документ в БД
                    await db.query(
                        'UPDATE document_attachments SET doc = :newBuffer WHERE id = :documentId',
                        {
                            replacements: { newBuffer, documentId: doc.id },
                            type: QueryTypes.UPDATE
                        }
                    );
                    
                    // Сохраняем ссылку на резервную копию в логе
                    await logResult(
                        jobId,
                        doc.id,
                        'success',
                        `Успешно обработан. Резервная копия: ${backupId}`
                    );
                    
                    successCount++;
                    
                } catch (processError) {
                    // В случае ошибки восстанавливаем из резервной копии
                    await db.query(
                        'DELETE FROM document_attachments WHERE id = :documentId',
                        {
                            replacements: { documentId: doc.id },
                            type: QueryTypes.DELETE
                        }
                    );
                    await db.query(
                        'UPDATE document_attachments SET id = :documentId WHERE id = :backupId',
                        {
                            replacements: { documentId: doc.id, backupId },
                            type: QueryTypes.UPDATE
                        }
                    );
                    
                    await logResult(
                        jobId,
                        doc.id,
                        'failed',
                        `Ошибка обработки: ${processError.message}. Документ восстановлен из резервной копии.`
                    );
                    
                    failedCount++;
                }
                
            } catch (error) {
                await logResult(jobId, doc.id, 'failed', error.message);
                failedCount++;
            }
        }

        // 5. Обновляем финальный статус задания
        await db.query(
            `UPDATE document_edit_jobs
             SET status = 'completed',
                 completed_at = NOW(),
                 success_count = :successCount,
                 failed_count = :failedCount,
                 skipped_count = :skippedCount
             WHERE id = :jobId`,
            {
                replacements: { successCount, failedCount, skippedCount, jobId },
                type: QueryTypes.UPDATE
            }
        );
        
        console.log(`Задание ${jobId} завершено. Успешно: ${successCount}, Ошибок: ${failedCount}`);
        
    } catch (error) {
        console.error(`Ошибка при выполнении задания ${jobId}:`, error);
        
        await db.query(
            `UPDATE document_edit_jobs
             SET status = 'failed',
                 error_message = :errorMessage,
                 completed_at = NOW()
             WHERE id = :jobId`,
            {
                replacements: { errorMessage: error.message, jobId },
                type: QueryTypes.UPDATE
            }
        );
    }
};

/**
 * Вспомогательная функция для экранирования спецсимволов в регулярных выражениях
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Функция для предпросмотра изменений
 */
async function previewChanges(searchText, filterCriteria) {
    const documents = await findDocumentsByCriteria(filterCriteria);
    const previewResults = [];
    
    for (const doc of documents) {
        try {
            const docData = await db.query(
                'SELECT doc, name FROM document_attachments WHERE id = :id',
                { replacements: { id: doc.id }, type: QueryTypes.SELECT }
            );
            
            if (docData.length > 0) {
                const { doc: buffer, name: fileName } = docData[0];
                const extension = fileName.split('.').pop().toLowerCase();
                let content = '';
                let matches = 0;
                
                if (extension === 'docx') {
                    const zip = await JSZip.loadAsync(buffer);
                    const contentXml = zip.file("word/document.xml");
                    if (contentXml) {
                        const xmlContent = await contentXml.async("string");
                        const textMatches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/gi) || [];
                        content = textMatches.map(m => m.replace(/<w:t[^>]*>([^<]+)<\/w:t>/i, '$1')).join(' ');
                        const regex = new RegExp(escapeRegExp(searchText), 'gi');
                        matches = (content.match(regex) || []).length;
                    }
                } else if (['txt', 'md', 'html'].includes(extension)) {
                    content = buffer.toString('utf-8');
                    const regex = new RegExp(escapeRegExp(searchText), 'gi');
                    matches = (content.match(regex) || []).length;
                }
                
                previewResults.push({
                    id: doc.id,
                    name: doc.name,
                    document_type: doc.document_type,
                    matches: matches,
                    preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
                });
            }
        } catch (error) {
            console.error(`Ошибка при предпросмотре документа ${doc.id}:`, error);
        }
    }
    
    return previewResults;
}

module.exports = {
    findDocumentsByCriteria,
    replaceTextInDocx,
    replaceTextInFile,
    processJob,
    previewChanges,
    logResult,
    createBackup,
    processDocumentReplacement
};