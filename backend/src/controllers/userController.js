const userService = require('../services/userService')

class UserController {
    async create(req, res, next) {
        try{
            const user = await userService.createUser(req.body)
            return res.status(201).json(user)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const users = await userService.getAllUsers()
            return res.json(users)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const user = await userService.updateUser(req.params.id, req.body)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await userService.deleteUser(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }

    async createFull(req, res, next) {
    try {
        const user = await userService.createFullUser(req.body);
        return res.status(201).json(user);
    } catch (e) {
        next(e);
    }
    }

}


module.exports = new UserController()






























/*
// Импорт модели для работы с пользователями
const userModel = require('../models/userModel');
// Импорт пула подключений к базе данных из конфигурации
const pool = require('../config/db');

// Контроллер для получения данных о текущем авторизованном пользователе
const getMe = async (req, res) => {
    try {
        // Ищем пользователя и его роль по ID, который был извлечен из токена в middleware
        const user = await userModel.findUserWithRoleById(req.user.userId);
        // Если пользователь не найден в базе данных
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        // Возвращаем данные пользователя в формате JSON
        res.json(user);
    } catch (error) {
        // Логируем ошибку и отправляем статус 500 при сбое сервера
        console.error('Ошибка при получении данных о себе:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Контроллер для создания нового пользователя администратором
const adminCreateUser = async (req, res) => {
    // Получаем отдельное соединение из пула для управления транзакцией (или безопасного выполнения)
    const client = await pool.connect(); 
    try {
        // Извлекаем необходимые данные из тела запроса
        const { firstName, lastName, login, password, role } = req.body;

        // Проверяем наличие всех обязательных полей
        if (!firstName || !lastName || !login || !password || !role) {
            return res.status(400).json({ message: 'Заполните обязательные поля' });
        }

        // Список допустимых ролей в системе
        const allowedRoles = ['student', 'teacher', 'admin'];
        // Проверяем, соответствует ли переданная роль разрешенным
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Недопустимая роль' });
        }

        // Проверяем, не занят ли уже такой логин в системе
        const existingUser = await userModel.findUserByLogin(login);
        if (existingUser) {
            return res.status(409).json({ message: 'Логин занят' });
        }

        // Вызываем функцию модели для создания записи, передавая клиент БД и данные
        const newUser = await userModel.createUser(client, req.body);

        // Возвращаем статус 201 (Создано) и данные нового пользователя
        res.status(201).json({ message: 'Пользователь создан', user: newUser });
    } catch (error) {
        // Выводим ошибку в консоль сервера
        console.error('Ошибка в контроллере:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    } finally {
        // Обязательно возвращаем клиента в пул соединений, чтобы избежать утечек
        client.release(); 
    }
};

// Контроллер для получения списка всех пользователей системы
const getAllUsers = async (req, res) => {
    try {
        // Запрашиваем из модели список всех пользователей
        const users = await userModel.getAllUsers();
        // Отправляем список в ответе
        res.json(users);
    } catch (error) {
        // Обработка ошибок при получении списка
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении пользователей' });
    }
};

// Контроллер для обновления данных существующего пользователя
const updateUser = async (req, res) => {
    try {
        // Получаем ID пользователя из параметров URL
        const userId = req.params.id;
        // Получаем новые данные из тела запроса
        const userData = req.body;

        // Если в данных на обновление пришел логин, нужно проверить его уникальность
        if (userData.login) {
            const existingUser = await userModel.findUserByLogin(userData.login);
            // Если логин найден у другого пользователя (ID не совпадает) — возвращаем ошибку
            if (existingUser && existingUser.id != userId) {
                return res.status(409).json({ message: 'Этот логин уже используется другим пользователем' });
            }
        }

        // Вызываем обновление в базе данных через модель
        const updatedUser = await userModel.updateUserById(userId, userData);
        // Если запись для обновления не найдена
        if (!updatedUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        // Возвращаем обновленные данные со статусом 200
        res.status(200).json(updatedUser);
    } catch (error) {
        // Обработка непредвиденных ошибок при обновлении
        console.error('Ошибка при обновлении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении пользователя' });
    }
};

// Контроллер для удаления пользователя
const deleteUser = async (req, res) => {
    try {
        // Преобразуем ID из параметров запроса в число
        const userIdToDelete = Number(req.params.id);
        // Получаем ID администратора, выполняющего действие (из токена)
        const adminId = req.user.userId;

        // Защита от "самоубийства" аккаунта: админ не может удалить сам себя
        if (userIdToDelete === adminId) {
            return res.status(403).json({ message: 'Вы не можете удалить свою собственную учетную запись' });
        }

        // Вызываем функцию удаления в модели
        const deletedUser = await userModel.deleteUserById(userIdToDelete);
        // Если пользователь для удаления
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.status(200).json({ message: `Пользователь с ID ${userIdToDelete} успешно удален` });
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
    }
};

module.exports = {
    getMe,
    adminCreateUser,
    getAllUsers,
    updateUser,
    deleteUser
};


/*

const userModel = require('../models/userModel');
const validator = require('validator');

const getMe = async (req, res) => {
    try {
        const user = await userModel.findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const adminCreateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Некорректный формат email' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Пароль должен содержать не менее 6 символов' });
        }

        const allowedRoles = ['student', 'teacher', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Указана недопустимая роль' });
        }

        // 2. Проверка на существование пользователя
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Пользователь с таким email уже существует' }); // 409 Conflict
        }

        // 3. Создание пользователя
        const newUser = await userModel.createUser({
            firstName,
            lastName,
            email,
            password,
            role
        });

        // 4. Отправка успешного ответа
        res.status(201).json({
            message: 'Пользователь успешно создан',
            user: newUser
        });

    } catch (error) {
        console.error('Ошибка в контроллере создания пользователя:', error);
        res.status(500).json({ message: 'Ошибка на сервере при создании пользователя' });
    }
	};




// Получить всех пользователей
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении пользователей' });
    }
};

// Обновить пользователя
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        // Важно: если админ меняет email, нужно проверить, не занят ли новый email
        if (userData.email) {
            const existingUser = await userModel.findUserByEmail(userData.email);
            if (existingUser && existingUser.id != userId) {
                return res.status(409).json({ message: 'Этот email уже используется другим пользователем' });
            }
        }

        const updatedUser = await userModel.updateUserById(userId, userData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при обновлении пользователя' });
    }
};

// Удалить пользователя
const deleteUser = async (req, res) => {
    try {
        const userIdToDelete = Number(req.params.id);
        const adminId = req.user.userId;

        // Критически важная проверка: не позволяем админу удалить самого себя
        if (userIdToDelete === adminId) {
            return res.status(403).json({ message: 'Вы не можете удалить свою собственную учетную запись' });
        }

        const deletedUser = await userModel.deleteUserById(userIdToDelete);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.status(200).json({ message: `Пользователь с ID ${userIdToDelete} успешно удален` });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
    }
};


module.exports = {
     getMe,
    adminCreateUser,
    getAllUsers,
    updateUser,
    deleteUser
};
*/