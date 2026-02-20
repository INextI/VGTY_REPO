const Router = require('express');
const router = new Router
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login', authController.login);

router.post('/logout', authMiddleware, authController.logout)
router.get('/refresh', authMiddleware, authController.refresh)


module.exports = router