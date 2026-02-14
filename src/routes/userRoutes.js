const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Middleware для проверки, что залогиненный пользователь — администратор
const adminOnly = [authMiddleware, checkRole(['admin'])];

// Получить информацию о себе (остается /api/admin/me)
router.get('/me', authMiddleware, userController.getMe);

// Создать нового пользователя (теперь /api/admin/users)
router.post('/users', adminOnly, userController.adminCreateUser);

// Получить список всех пользователей (теперь /api/admin/users)
router.get('/', adminOnly, userController.getAllUsers);

// Обновить пользователя по ID (теперь /api/admin/users/:id)
router.put('/users/:id', adminOnly, userController.updateUser);

// Удалить пользователя по ID (теперь /api/admin/users/:id)
router.delete('/users/:id', adminOnly, userController.deleteUser);

module.exports = router;

