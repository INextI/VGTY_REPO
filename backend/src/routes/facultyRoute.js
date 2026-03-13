const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

const validate = require('../middleware/validationMiddlewaree')
const { 
    createFacultySchema,
    updateFacultySchema
 } = require('../validators/facultyValidator');
const  {idParamSchema} = require('../validators/common/idParamSchema');

router.post('/', validate(createFacultySchema), facultyController.create)
router.get('/', facultyController.getAll)
router.get('/:id', validate(idParamSchema), facultyController.getOne)
router.put(
    '/:id', 
    validate(idParamSchema, 'params'),
    validate(updateFacultySchema),
    facultyController.update)
router.delete('/:id', validate(idParamSchema), facultyController.delete)


module.exports = router