const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const validate = require('../middleware/validationMiddleware')

const {
    createStudentSchema,
    updateStudentSchema
} = require('../validators/studentValidator')
const {idParamSchema} = require('../validators/common/idParamSchema')

router.post('/', validate(createStudentSchema), studentController.create)
router.get('/', studentController.getAll)
router.get('/:id', validate(idParamSchema, 'params'), studentController.getOne)
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateStudentSchema),
    studentController.update)
router.delete('/:id', validate(idParamSchema, 'params'), studentController.delete)


module.exports = router