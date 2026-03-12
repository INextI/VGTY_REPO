const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const validate = require('../middleware/validationMiddlewaree')

const {createAcademicYearSchema} = require('../validators/academicYearValidator')

const {idParamSchema} = require('../validators/common/idParamSchema')

router.post('/', validate(createAcademicYearSchema), academicYearController.create)
router.get('/', academicYearController.getAll)
router.get('/:id', validate(idParamSchema, 'params'), academicYearController.getOne)
router.delete('/:id', validate(idParamSchema, 'params'), academicYearController.delete)


module.exports = router