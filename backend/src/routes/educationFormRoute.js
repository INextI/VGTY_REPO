const express = require('express');
const router = express.Router();
const educationFormController = require('../controllers/educationFormController');

const validate = require('../middleware/validationMiddleware')

const { createEducationFormSchema } = require('../validators/educationFormValidator')

router.post('/', validate(createEducationFormSchema), educationFormController.create)
router.get('/', educationFormController.getAll)
router.get('/:id', educationFormController.getOne)
router.put('/:id', educationFormController.update)
router.delete('/:id', educationFormController.delete)


module.exports = router