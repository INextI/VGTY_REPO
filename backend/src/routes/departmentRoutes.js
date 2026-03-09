// routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.post('/', departmentController.create);
router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.delete);

module.exports = router;