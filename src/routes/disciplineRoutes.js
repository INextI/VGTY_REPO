const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Получить курсы текущего пользователя (преподавателя или студента)
router.get('/my', authMiddleware, disciplineController.getMyDisciplines);

// Получить все курсы (для каталога)
router.get('/', authMiddleware, disciplineController.getAllDisciplines);

// Получить конкретный курс по ID
router.get('/:id', authMiddleware, disciplineController.getDisciplineById);

// Создать новый курс (только преподаватель и админ)
router.post('/', authMiddleware, checkRole(['teacher', 'admin']), disciplineController.createDiscipline);

// Обновить курс (только преподаватель и админ)
router.put('/:id', authMiddleware, checkRole(['teacher', 'admin']), disciplineController.updateDiscipline);

// Удалить курс (только преподаватель и админ)
router.delete('/:id', authMiddleware, checkRole(['teacher', 'admin']), disciplineController.deleteDiscipline);

module.exports = router;



/*
const express = require('express');
const router = express.Router();

// 1. Все импорты перенесены в начало файла
const disciplineController = require('../controllers/disciplineController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// --- Маршруты для студентов (и других ролей) ---

// GET /api/disciplines/my - получить курсы, на которые записан текущий пользователь
// Доступно всем аутентифицированным пользователям
router.get('/my', authMiddleware, disciplineController.getMydisciplines);

// GET /api/disciplines - получить список всех курсов
// Доступно всем аутентифицированным пользователям
router.get('/', authMiddleware, disciplineController.getAlldisciplines);

// GET /api/disciplines/:id - получить один курс по ID
// Доступно всем аутентифицированным пользователям
router.get('/:id', authMiddleware, disciplineController.getdisciplineById);


// --- Маршруты только для преподавателей и администраторов ---

// POST /api/disciplines - создать новый курс
router.post(
    '/',
    authMiddleware,
    checkRole(['teacher', 'admin']), // Только учитель или админ
    disciplineController.creatediscipline
);

// PUT /api/disciplines/:id - обновить курс
router.put(
    '/:id',
    authMiddleware,
    checkRole(['teacher', 'admin']),
    disciplineController.updatediscipline
);

// DELETE /api/disciplines/:id - удалить курс
router.delete(
    '/:id',
    authMiddleware,
    checkRole(['teacher', 'admin']),
    disciplineController.deletediscipline
);

module.exports = router;
*/