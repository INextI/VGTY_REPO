const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.post('/', userController.create)
router.get('/', userController.getAll)

router.post('/full', userController.createFull);

/**
 * @route GET /api/user/{id}
 * @param {string} id.path.required - ID пользователя
 * @returns {object} 200 - Пользователь
 * @returns {404}  - Пользователь не найден
 */
router.get('/:id', userController.getOne)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)




module.exports = router;

