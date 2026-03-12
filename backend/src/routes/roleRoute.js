const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const validate = require('../middleware/validationMiddleware')
const {
    createRoleSchema,
    updateRoleSchema
} = require('../validators/roleValidator');
const {idParamSchema} = require('../validators/common/idParamSchema');

router.post('/', validate(createRoleSchema), roleController.create)
router.get('/', roleController.getAll)
router.get('/:id', validate(idParamSchema, 'params'), roleController.getOne)
router.put(
    '/:id', 
    validate(idParamSchema, 'params'),
    validate(updateRoleSchema),
    roleController.update)
router.delete('/:id', validate(idParamSchema, 'params'), roleController.delete)


module.exports = router