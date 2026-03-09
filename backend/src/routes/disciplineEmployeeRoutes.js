// routes/disciplineEmployeeRoutes.js
const express = require('express');
const router = express.Router();
const disciplineEmployeeController = require('../controllers/disciplineEmployeeController');

router.post('/', disciplineEmployeeController.create);
router.get('/', disciplineEmployeeController.getAll);
router.get('/:id', disciplineEmployeeController.getById);
router.put('/:id', disciplineEmployeeController.update);
router.delete('/:id', disciplineEmployeeController.delete);

// Дополнительные маршруты
router.get('/discipline/:disciplineId', disciplineEmployeeController.getByDisciplineId);
router.get('/employee/:employeeId', disciplineEmployeeController.getByEmployeeId);

module.exports = router;