// routes/contactDataRoutes.js
const express = require('express');
const router = express.Router();
const contactDataController = require('../controllers/contactDataController');

router.post('/', contactDataController.create);
router.get('/', contactDataController.getAll);
router.get('/:id', contactDataController.getById);
router.put('/:id', contactDataController.update);
router.delete('/:id', contactDataController.delete);

// Дополнительные маршруты
router.get('/person/:personId/:personType', contactDataController.getByPerson);

module.exports = router;