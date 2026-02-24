const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');

router.post('/', academicYearController.create)
router.get('/', academicYearController.getAll)
router.get('/:id', academicYearController.getOne)
router.delete('/:id', academicYearController.delete)


module.exports = router