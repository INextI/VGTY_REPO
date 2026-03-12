// routes/employeeGradesRoutes.js
const express = require('express');
const router = express.Router();
const employeeGradesController = require('../controllers/employeeGradesController');

router.post('/', employeeGradesController.create);
router.get('/', employeeGradesController.getAll);
router.get('/:id', employeeGradesController.getById);
router.put('/:id', employeeGradesController.update);
router.delete('/:id', employeeGradesController.delete);

module.exports = router;