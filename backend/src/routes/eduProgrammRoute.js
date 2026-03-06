const express = require('express');
const router = express.Router();
const eduProgrammController = require('../controllers/eduProgrammController');

const validate = require('../middleware/validationMiddleware')

const { 
    createEduProgrammSchema,
    updateEduProgrammSchema,
 } = require('../validators/eduProgrammValidator')

 const {idParamSchema} = require('../validators/common/idParamSchema')

router.post('/', validate(createEduProgrammSchema), eduProgrammController.create)
router.get('/', eduProgrammController.getAll)
router.get('/:id', validate(idParamSchema, 'params'), eduProgrammController.getOne)
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateEduProgrammSchema),
    eduProgrammController.update)
router.delete('/:id', validate(idParamSchema, 'params'), eduProgrammController.delete)


module.exports = router