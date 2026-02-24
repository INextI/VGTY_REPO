const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.post('/', groupController.create)
router.get('/', groupController.getAll)
router.get('/:id', groupController.getOne)
router.put('/:id', groupController.update)
router.delete('/:id', groupController.delete)


module.exports = router