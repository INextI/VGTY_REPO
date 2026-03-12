// routes/documentEditJobLogRoutes.js
const express = require('express');
const router = express.Router();
const documentEditJobLogController = require('../controllers/documentEditJobLogController');

router.post('/', documentEditJobLogController.create);
router.get('/', documentEditJobLogController.getAll);
router.get('/:id', documentEditJobLogController.getById);
router.put('/:id', documentEditJobLogController.update);
router.delete('/:id', documentEditJobLogController.delete);

// Дополнительные маршруты
router.get('/job/:jobId', documentEditJobLogController.getByJobId);

module.exports = router;