const TokenService = require('../services/tokenService')

module.exports = function (req, res, next) {
    try {
        let token

        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Доступ запрещен. Токен не предоставлен.' });
        }

        token = authHeader.split(' ')[1]

        if (!token)
            return res.status(401).json({message: 'Не авторизован'})

        const userData = TokenService.validateAccessToken(token)

        if (!userData) {
            return res.status(401).json({message: 'Токен не действителен'})
        }

        req.user = userData
        next()
    } catch (e) {
        return res.status(401).json({ message: 'Не авторизован'})
    }
}




























/*
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Доступ запрещен. Токен не предоставлен.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Ошибка верификации токена:', error.message);
        return res.status(401).json({ message: 'Невалидный или просроченный токен.' });
    }
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Доступ запрещен: роль не определена.' });
        }

        const userRole = req.user.role;

        if (Array.isArray(allowedRoles) && allowedRoles.includes(userRole)) {
            next();
        } else {
            return res.status(403).json({ message: 'Доступ запрещен: недостаточно прав.' });
        }
    };
};

module.exports = { authMiddleware, checkRole };



/*

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Доступ запрещен. Токен не предоставлен.' });
    }

    const token = authHeader.split(' ')[1]; // Правильно извлекаем токен

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        console.error('Ошибка верификации токена:', error.message);
        return res.status(401).json({ message: 'Невалидный или просроченный токен.' });
    }
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Доступ запрещен: роль не определена.' });
        }

        const userRole = req.user.role;

        if (Array.isArray(allowedRoles) && allowedRoles.includes(userRole)) {
            next();
        } else {
            return res.status(403).json({ message: 'Доступ запрещен: недостаточно прав.' });
        }
    };
};

module.exports = { authMiddleware, checkRole };

*/

/*const jwt = require('jsonwebtoken');

    const authMiddleware = (req, res, next) => {
        // 1. Получаем токен из заголовка Authorization
        // Формат заголовка: "Bearer <ТОКЕН>"
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Доступ запрещен. Токен не предоставлен.' });
        }

        const token = authHeader.split(' ')[1];// Берем вторую часть 'Bearer <ТОКЕН>'

        try {
            // 2. Верифицируем токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Добавляем данные пользователя (payload) в объект запроса `req`
            // Теперь в любом следующем обработчике мы будем иметь доступ к req.user
            req.user = decoded; // Например, { userId: 123, role: 'student' }

            // 4. Передаем управление следующему middleware или контроллеру
            next();
        } catch (error) {
            console.error('Ошибка верификации токена:', error.message);
            return res.status(401).json({ message: 'Невалидный или просроченный токен.' });
        }
    };

// Создает middleware, который проверяет конкретную роль
const checkRole = (allowedRoles) => {
    // Эта функция возвращает другую функцию - сам middleware
    return (req, res, next) => {
        // Мы предполагаем, что authMiddleware уже отработал и добавил req.user
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Доступ запрещен: роль не определена.' });
        }

        const userRole = req.user.role;

        // Проверяем, есть ли роль пользователя в массиве разрешенных ролей
        if (allowedRoles.includes(userRole)) {
            next(); // Роль подходит, разрешаем доступ к следующему обработчику
        } else {
            return res.status(403).json({ message: 'Доступ запрещен: недостаточно прав.' });
        }
    };
};

module.exports = { authMiddleware, checkRole };*/