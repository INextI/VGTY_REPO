// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.create);
router.get('/', sessionController.getAll);
router.get('/:id', sessionController.getById);
router.put('/:id', sessionController.update);
router.delete('/:id', sessionController.delete);

// Дополнительные маршруты
router.get('/discipline/:disciplineId', sessionController.getByDisciplineId);
router.get('/teacher/:teacherId', sessionController.getByTeacherId);

module.exports = router;