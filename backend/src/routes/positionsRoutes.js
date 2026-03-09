// routes/positionsRoutes.js
const express = require('express');
const router = express.Router();
const positionsController = require('../controllers/positionsController');

router.post('/', positionsController.create);
router.get('/', positionsController.getAll);
router.get('/:id', positionsController.getById);
router.put('/:id', positionsController.update);
router.delete('/:id', positionsController.delete);

module.exports = router;