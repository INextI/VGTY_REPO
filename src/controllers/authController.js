const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).json({ message: 'Необходимо указать логин и пароль' });
        }

        const user = await userModel.findUserByLogin(login);
        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const userWithRole = await userModel.findUserWithRoleById(user.id);
        if (!userWithRole) {
            return res.status(500).json({ message: 'Не удалось определить роль пользователя.' });
        }

        const payload = {
            userId: userWithRole.id,
            role: userWithRole.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, user: userWithRole });

    } catch (error) {
        console.error('Ошибка в контроллере входа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = { login };






/*

const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // --- ШАГ 1: Найти пользователя по логину ---
        const user = await userModel.findUserByLogin(login);

        // --- ШАГ 2: Проверить, существует ли пользователь и совпадает ли пароль ---
        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }

        // --- ШАГ 3: Пароль верный. Теперь получим данные пользователя с его ролью ---
        const userWithRole = await userModel.findUserWithRoleById(user.id);

        if (!userWithRole) {
            console.error(`Пользователь с ID ${user.id} прошел проверку пароля, но не был найден с ролью.`);
            return res.status(500).json({ message: 'Не удалось определить роль пользователя.' });
        }

        // --- ШАГ 4: Создать "полезную нагрузку" (payload) для JWT токена ---
        const payload = {
            userId: userWithRole.id,
            role: userWithRole.role
        };

        // --- ШАГ 5: Сгенерировать JWT токен ---
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // --- ШАГ 6: Отправить успешный ответ клиенту ---
        res.json({ token, user: userWithRole });

    } catch (error) {
        console.error('Ошибка в контроллере входа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = { login };

*/




/*


const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // --- ШАГ 1: Найти пользователя по логину ---
        // Эта функция вернет все поля из таблицы users, включая password_hash
        const user = await userModel.findUserByLogin(login);

        // --- ШАГ 2: Проверить, существует ли пользователь и совпадает ли пароль ---
        // Мы объединяем проверку пользователя и пароля в одно условие.
        // Если user не найден (user равен null), то левая часть `!user` будет true, и bcrypt.compare даже не вызовется.
        // Это более безопасный и компактный способ.
        const isMatch = user && (await bcrypt.compare(password, user.password_hash));

        if (!user || !isMatch) {
            // Отправляем общий ответ, чтобы не раскрывать, что именно неверно: логин или пароль.
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        // --- ШАГ 3: Пароль верный. Теперь получим данные пользователя с его ролью ---
        // Используем функцию findUser, которая делает JOIN с таблицами students/employees
        // и не возвращает хеш пароля.
        const userWithRole = await userModel.findUser(user.id);

        if (!userWithRole) {
            // Эта ошибка маловероятна, но это хорошая практика для защиты
            console.error(`Пользователь с ID ${user.id} прошел проверку пароля, но не был найден с ролью.`);
            return res.status(500).json({ message: 'Не удалось определить роль пользователя.' });
        }

        // --- ШАГ 4: Создать "полезную нагрузку" (payload) для JWT токена ---
        // В токен мы помещаем только самую необходимую информацию для идентификации
        // пользователя и проверки его прав на других маршрутах.
        const payload = {
            userId: userWithRole.id,
            role: userWithRole.role // Например, 'student', 'teacher' или 'admin'
        };

        // --- ШАГ 5: Сгенерировать JWT токен ---
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Убедитесь, что у вас есть JWT_SECRET в .env файле!
            { expiresIn: '8h' } // Токен будет действителен 8 часов
        );

        // --- ШАГ 6: Отправить успешный ответ клиенту ---
        // Мы отправляем и токен, и информацию о пользователе (без пароля)
        // чтобы фронтенд мог сразу отобразить имя пользователя и перенаправить его куда нужно.
        res.json({ token, user: userWithRole });

    } catch (error) {
        console.error('Ошибка в контроллере входа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = { login };
*/