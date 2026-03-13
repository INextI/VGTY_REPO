const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

const validate = require('../middleware/validationMiddlewaree')

const { 
    createGroupSchema,
    updateGroupSchema,
} = require('../validators/groupValidator')

const {idParamSchema} = require('../validators/common/idParamSchema')

router.post('/', validate(createGroupSchema), groupController.create)
router.get('/', groupController.getAll)
router.get('/:id', validate(idParamSchema), groupController.getOne)
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateGroupSchema),
    groupController.update)
router.delete('/:id', validate(idParamSchema, 'params'), groupController.delete)


module.exports = router