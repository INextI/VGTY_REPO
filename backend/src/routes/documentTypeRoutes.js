// routes/documentTypeRoutes.js
const express = require('express');
const router = express.Router();
const documentTypeController = require('../controllers/documentTypeController');

router.post('/', documentTypeController.create);
router.get('/', documentTypeController.getAll);
router.get('/:id', documentTypeController.getById);
router.put('/:id', documentTypeController.update);
router.delete('/:id', documentTypeController.delete);

module.exports = router;
