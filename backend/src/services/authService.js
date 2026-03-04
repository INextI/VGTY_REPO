const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const UserDto = require('../dtos/userDto');
const TokenService = require('./tokenService');
const Role = require('../models/roleModel');

class AuthService {
    async login(login, password) {
        try {
            console.log('AuthService.login: Начало аутентификации', { login });

             const user = await User.findOne({
                where: { login },
                include: [{ model: Role, as: 'role' }]
                });

            if (!user) {
                console.warn('AuthService.login: Пользователь не найден', { login });
                throw new Error('Неверный логин или пароль');
            }

            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                console.warn('AuthService.login: Неверный пароль', { login });
                throw new Error('Неверный логин или пароль');
            }

            user.last_login = new Date();
            await user.save();
            console.log('AuthService.login: last_login обновлен для пользователя', { login });

            const userDto = new UserDto(user);
            console.log('AuthService.login: Создан userDto', userDto);

            const tokens = TokenService.generateTokens({ ...userDto });
            console.log('AuthService.login: Сгенерированы токены', tokens);

            await TokenService.saveToken(userDto.id, tokens.refreshToken);
            console.log('AuthService.login: Токен сохранен');

            return { ...tokens, user: userDto };
        } catch (e) {
            console.error('AuthService.login: Ошибка во время аутентификации', e);
            throw e;
        }
    }

    async logout(refreshToken) {
        try {
            console.log('AuthService.logout: Начало выхода', { refreshToken });
            await TokenService.removeToken(refreshToken);
            console.log('AuthService.logout: Токен удален');
        } catch (e) {
            console.error('AuthService.logout: Ошибка во время выхода', e);
            throw e;
        }
    }

    async refresh(refreshToken) {
        try {
            console.log('AuthService.refresh: Начало обновления токена', { refreshToken });

            if (!refreshToken) {
                console.warn('AuthService.refresh: refreshToken отсутствует');
                throw new Error('Пользователь не авторизован');
            }

            const userData = TokenService.validateRefreshToken(refreshToken);
            console.log('AuthService.refresh: Данные пользователя из refreshToken', userData);

            const tokenFromDB = await TokenService.findToken(refreshToken);
            console.log('AuthService.refresh: Токен из базы данных', tokenFromDB);

            if (!userData || !tokenFromDB) {
                console.warn('AuthService.refresh: Пользователь не авторизован (userData или tokenFromDB отсутствуют)');
                throw new Error('Пользователь не авторизован');
            }

            const userDto = new UserDto(userData);
            console.log('AuthService.refresh: Создан userDto', userDto);

            const tokens = TokenService.generateTokens({ ...userDto });
            console.log('AuthService.refresh: Сгенерированы токены', tokens);

            await TokenService.saveToken(userDto.id, tokens.refreshToken);
            console.log('AuthService.refresh: Токен сохранен');

            return { ...tokens, user: userDto };
        } catch (e) {
            console.error('AuthService.refresh: Ошибка во время обновления токена', e);
            throw e;
        }
    }

    async hashPassword(password) {
        console.log('AuthService.hashPassword: Хэширование пароля');
        return await bcrypt.hash(password, 10);
    }
}

module.exports = new AuthService();

