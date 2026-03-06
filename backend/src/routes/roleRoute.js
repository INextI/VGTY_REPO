const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const validate = require('../middleware/validationMiddleware')
const {createRoleSchema} = require('../validators/roleValidator')

router.post('/', validate(createRoleSchema), roleController.create)
router.get('/', roleController.getAll)
router.get('/:id', roleController.getOne)
router.put('/:id', roleController.update)
router.delete('/:id', roleController.delete)


module.exports = router