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
