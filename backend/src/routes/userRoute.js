const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// Создание полного пользователя
router.post('/full', userController.createFullUser);
// Получение списка пользователей
router.get('/', userController.getUsers);
// Получение пользователя по ID
router.get('/:id', userController.getUserById);
module.exports = router;


