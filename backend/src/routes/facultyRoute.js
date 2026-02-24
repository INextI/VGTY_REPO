const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

router.post('/', facultyController.create)
router.get('/', facultyController.getAll)
router.get('/:id', facultyController.getOne)
router.put('/:id', facultyController.update)
router.delete('/:id', facultyController.delete)


module.exports = router