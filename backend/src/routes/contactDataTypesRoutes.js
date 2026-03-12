// routes/contactDataTypesRoutes.js
const express = require('express');
const router = express.Router();
const contactDataTypesController = require('../controllers/contactDataTypesController');

router.post('/', contactDataTypesController.create);
router.get('/', contactDataTypesController.getAll);
router.get('/:id', contactDataTypesController.getById);
router.put('/:id', contactDataTypesController.update);
router.delete('/:id', contactDataTypesController.delete);

module.exports = router;

