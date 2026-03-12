const express = require('express');
const router = express.Router();
const educationFormController = require('../controllers/educationFormController');

const validate = require('../middleware/validationMiddleware')

const { 
    createEducationFormSchema,
    updateEducationFormSchema
 } = require('../validators/educationFormValidator')
const {idParamSchema} = require('../validators/common/idParamSchema')

router.post('/', validate(createEducationFormSchema), educationFormController.create)
router.get('/', educationFormController.getAll)
router.get('/:id', validate(idParamSchema, 'params'), educationFormController.getOne)
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateEducationFormSchema), 
    educationFormController.update)
router.delete('/:id',  validate(idParamSchema, 'params'), educationFormController.delete)


module.exports = router