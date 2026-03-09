// routes/documentAttachmentRoutes.js
const express = require('express');
const router = express.Router();
const documentAttachmentController = require('../controllers/documentAttachmentController');

router.post('/', documentAttachmentController.create);
router.get('/', documentAttachmentController.getAll);
router.get('/:id', documentAttachmentController.getById);
router.put('/:id', documentAttachmentController.update);
router.delete('/:id', documentAttachmentController.delete);

// Дополнительные маршруты
router.get('/department/:departmentId', documentAttachmentController.getByDepartmentId);
router.get('/discipline/:disciplineId', documentAttachmentController.getByDisciplineId);
router.get('/session/:sessionId', documentAttachmentController.getBySessionId);

module.exports = router;