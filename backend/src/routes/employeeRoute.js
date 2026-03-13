const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

const validate = require('../middleware/validationMiddlewaree')
const {
    createEmployeeSchema,
    updateEmployeeSchema
} = require('../validators/employeeValidator')

const {idParamSchema} = require('../validators/common/idParamSchema')

router.post('/', validate(createEmployeeSchema), employeeController.create)
router.get('/', employeeController.getAll)
router.get('/:id', validate(idParamSchema, 'params'), employeeController.getOne)
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateEmployeeSchema),
    employeeController.update)
router.delete('/:id', validate(idParamSchema, 'params'), employeeController.delete)


module.exports = router