const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// Создание полного пользователя
router.post('/full', userController.createFull);
// Получение списка пользователей
router.get('/', userController.getAll);
// Получение пользователя по ID
router.get('/:id', userController.getOne);
module.exports = router;


