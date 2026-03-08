// backend/src/routes/documentJobs.js
const express = require('express');
const router = express.Router();
const documentJobsController = require('../controllers/documentJobsController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

/**
 * @route POST /api/document-jobs/preview
 * @desc Предпросмотр изменений перед запуском задания
 * @access Private (только для сотрудников с правами редактирования)
 */
router.post(
    '/preview',
    validationMiddleware.validateDocumentJobPreview,
    documentJobsController.previewJob
);

/**
 * @route POST /api/document-jobs
 * @desc Создание нового задания на массовое редактирование
 * @access Private (только для администраторов/редакторов)
 */
router.post(
    '/',
    validationMiddleware.validateDocumentJobCreate,
    documentJobsController.createJob
);

/**
 * @route GET /api/document-jobs
 * @desc Получение списка всех заданий
 * @access Private
 */
router.get('/', documentJobsController.getJobs);

/**
 * @route GET /api/document-jobs/filters
 * @desc Получение справочных данных для фильтров
 * @access Private
 */
router.get('/filters', documentJobsController.getFilterData);

/**
 * @route GET /api/document-jobs/:id
 * @desc Получение статуса выполнения задания
 * @access Private
 */
router.get('/:id', documentJobsController.getJobStatus);

/**
 * @route POST /api/document-jobs/:id/cancel
 * @desc Отмена выполнения задания
 * @access Private (только создатель задания или администратор)
 */
router.post('/:id/cancel', documentJobsController.cancelJob);

/**
 * @route GET /api/document-jobs/documents/:documentId/preview
 * @desc Получение детального предпросмотра документа
 * @access Private
 */
router.get('/documents/:documentId/preview', documentJobsController.getDocumentPreview);

module.exports = router;


/* 
// POST /api/document-jobs
// Создание нового задания на редактирование
router.post('/', async (req, res) => {
    const { searchText, replaceText, filters } = req.body;
    // ... валидация данных ...

    // 1. Создаем запись в таблице document_edit_jobs
    const job = await db.query(
        `INSERT INTO document_edit_jobs (search_text, replace_text, filter_criteria, created_by_employee_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [searchText, replaceText, filters, req.user.id]
    );
    const jobId = job.rows[0].id;

    // 2. Добавляем задачу в очередь BullMQ
    await documentEditQueue.add('process-job', { jobId });

    // 3. Отвечаем клиенту немедленно, не дожидаясь выполнения
    res.status(202).json({ message: "Задание принято в обработку.", jobId });
});

// GET /api/document-jobs/:id/status
// Получение статуса выполнения задания
router.get('/:id/status', async (req, res) => {
    const { id } = req.params;
    // ... логика получения статуса из БД, подсчета обработанных файлов из document_edit_job_logs ...
    res.json({ jobStatus, progress, logs });
}); */