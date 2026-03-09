// routes/documentEditJobRoutes.js
const express = require('express');
const router = express.Router();
const documentEditJobController = require('../controllers/documentEditJobController');

router.post('/', documentEditJobController.create);
router.get('/', documentEditJobController.getAll);
router.get('/:id', documentEditJobController.getById);
router.put('/:id', documentEditJobController.update);
router.delete('/:id', documentEditJobController.delete);

// Дополнительные маршруты
router.patch('/:id/status', documentEditJobController.updateStatus);
router.get('/status/:status', documentEditJobController.getByStatus);

module.exports = router;