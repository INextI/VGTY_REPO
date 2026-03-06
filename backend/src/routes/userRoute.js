const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

const validate = require('../middleware/validationMiddleware')
const {
    createUserSchema,
    updateUserSchema,
    idParamSchema,
    createFullUserSchema
} = require('../validators/userValidator')

router.post('/', validate(createUserSchema), userController.create)
router.get('/', userController.getAll)

router.post('/full', validate(createFullUserSchema),userController.createFull);

/**
 * @route GET /api/user/{id}
 * @param {string} id.path.required - ID пользователя
 * @returns {object} 200 - Пользователь
 * @returns {404}  - Пользователь не найден
 */
router.get('/:id', validate(idParamSchema, 'params'), userController.getOne)
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateUserSchema),
    userController.update)

router.delete('/:id', validate(idParamSchema, 'params'), userController.delete)




module.exports = router;

