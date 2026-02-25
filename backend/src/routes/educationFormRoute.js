const express = require('express');
const router = express.Router();
const educationFormController = require('../controllers/educationFormController');

router.post('/', educationFormController.create)
router.get('/', educationFormController.getAll)
router.get('/:id', educationFormController.getOne)
router.put('/:id', educationFormController.update)
router.delete('/:id', educationFormController.delete)


module.exports = router