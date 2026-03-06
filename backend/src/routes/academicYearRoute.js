const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const validate = require('../middleware/validationMiddleware')

const {createAcademicYearSchema} = require('../validators/academicYearValidator')

router.post('/', validate(createAcademicYearSchema), academicYearController.create)
router.get('/', academicYearController.getAll)
router.get('/:id', academicYearController.getOne)
router.delete('/:id', academicYearController.delete)


module.exports = router