// backend/src/services/documentService.js 
const { Worker } = require('bullmq');
const JSZip = require('jszip');
const db = require('../config/db');
const { QueryTypes } = require('sequelize');

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
        return results; // Sequelize возвращает массив объектов напрямую
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
            // Для PDF потребуется специальная библиотека
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
         VALUES ($1, $2, $3, $4, NOW())`,
        [jobId, documentId, status, message]
    );
}

/**
 * Создание резервной копии документа
 */
async function createBackup(documentId) {
    const result = await db.query(
        `INSERT INTO document_attachments 
         (name, type_id, doc, upload_date, department_id, discipline_id, edu_program_id, session_id)
         SELECT name, type_id, doc, upload_date, department_id, discipline_id, edu_program_id, session_id
         FROM document_attachments WHERE id = $1
         RETURNING id`,
        [documentId]
    );
    
    return result.rows[0].id;
}

/**
 * Основной обработчик задачи массового редактирования
 */
const processJob = async (job) => {
    const { jobId } = job.data;
    
    try {
        // 1. Получаем детали задания из БД
        const jobDetails = await db.query(
            'SELECT * FROM document_edit_jobs WHERE id = $1',
            [jobId]
        );
        
        if (jobDetails.rows.length === 0) {
            throw new Error(`Задание с ID ${jobId} не найдено`);
        }
        
        const { 
            search_text, 
            replace_text, 
            filter_criteria,
            created_by_employee_id 
        } = jobDetails.rows[0];
        
        // 2. Обновляем статус задания на 'in_progress'
        await db.query(
            `UPDATE document_edit_jobs 
             SET status = 'in_progress', started_at = NOW() 
             WHERE id = $1`,
            [jobId]
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
                     SET processed_count = $1, total_count = $2 
                     WHERE id = $3`,
                    [processedCount, documents.length, jobId]
                );
                
                // Получаем бинарные данные документа
                const docData = await db.query(
                    'SELECT doc, name FROM document_attachments WHERE id = $1',
                    [doc.id]
                );
                
                if (docData.rows.length === 0) {
                    await logResult(jobId, doc.id, 'failed', 'Документ не найден в БД');
                    failedCount++;
                    continue;
                }
                
                const { doc: buffer, name: fileName } = docData.rows[0];
                
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
                        'UPDATE document_attachments SET doc = $1 WHERE id = $2',
                        [newBuffer, doc.id]
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
                        'DELETE FROM document_attachments WHERE id = $1',
                        [doc.id]
                    );
                    
                    await db.query(
                        'UPDATE document_attachments SET id = $1 WHERE id = $2',
                        [doc.id, backupId]
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
                 success_count = $1,
                 failed_count = $2,
                 skipped_count = $3
             WHERE id = $4`,
            [successCount, failedCount, skippedCount, jobId]
        );
        
        console.log(`Задание ${jobId} завершено. Успешно: ${successCount}, Ошибок: ${failedCount}`);
        
    } catch (error) {
        console.error(`Ошибка при выполнении задания ${jobId}:`, error);
        
        await db.query(
            `UPDATE document_edit_jobs 
             SET status = 'failed', 
                 error_message = $1,
                 completed_at = NOW()
             WHERE id = $2`,
            [error.message, jobId]
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
            // Исправляем получение данных (Sequelize возвращает массив)
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
    createBackup
};

// // Запускаем воркер для обработки очереди
// new Worker('document-edit-queue', processJob, { 
//     connection: { 
//         host: process.env.REDIS_HOST || "localhost", 
//         port: process.env.REDIS_PORT || 6379 
//     },
//     concurrency: 3 // Обрабатываем 3 документа одновременно
// });



/* 

const { Worker } = require('bullmq');
const JSZip = require('jszip');
const db = require('../config/db'); 

// Обработчик задачи
const processJob = async (job) => {
    const { jobId } = job.data;

    // 1. Получаем детали задания из БД
    const jobDetails = await db.query('SELECT * FROM document_edit_jobs WHERE id = $1', [jobId]);
    const { search_text, replace_text, filter_criteria } = jobDetails.rows[0];

    // 2. Находим все документы, подходящие под фильтры
    // (Этот SQL-запрос будет сложным, с JOIN'ами на departments, disciplines и т.д.)
    const documents = await findDocumentsByCriteria(filter_criteria);

    // 3. Обновляем статус задания на 'in_progress'
    await db.query(`UPDATE document_edit_jobs SET status = 'in_progress' WHERE id = $1`, [jobId]);

    // 4. Обрабатываем каждый документ
    for (const doc of documents) {
        try {
            // Получаем бинарные данные документа из БД
            const docData = await db.query('SELECT doc FROM document_attachments WHERE id = $1', [doc.id]);
            const buffer = docData.rows[0].doc;

            // РАБОТА С DOCX
            const zip = await JSZip.loadAsync(buffer);
            const contentXml = zip.file("word/document.xml");

            if (!contentXml) {
                throw new Error("Неверный формат docx: отсутствует word/document.xml");
            }

            let content = await contentXml.async("string");
            
            // Проверяем, есть ли что заменять
            if (content.includes(search_text)) {
                // ВАЖНО: Простая замена может сломать XML-теги.
                // Безопаснее заменять текст только внутри <w:t> тегов.
                const newContent = content.replace(new RegExp(search_text, 'g'), replace_text);

                zip.file("word/document.xml", newContent);

                const newBuffer = await zip.generateAsync({ type: "nodebuffer" });

                // Обновляем документ в БД
                await db.query('UPDATE document_attachments SET doc = $1 WHERE id = $2', [newBuffer, doc.id]);

                // Логируем успех
                await logResult(jobId, doc.id, 'success');
            } else {
                 // Логируем, что текст не найден и замена не требовалась
                await logResult(jobId, doc.id, 'skipped', 'Текст для замены не найден');
            }

        } catch (error) {
            // Логируем ошибку для конкретного файла
            await logResult(jobId, doc.id, 'failed', error.message);
        }
    }

    // 5. Обновляем статус задания на 'completed'
    await db.query(`UPDATE document_edit_jobs SET status = 'completed', completed_at = NOW() WHERE id = $1`, [jobId]);
};

// Запускаем воркер
new Worker('document-edit-queue', processJob, { connection: { host: "localhost", port: 6379 } });
 */