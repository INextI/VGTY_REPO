const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User  = require('../models/userModel');
const UserDto = require('../dtos/userDto');
const TokenService = require('./tokenService');

class AuthService {
    async login(login, password) {
        const user = await User.findOne({ where: { login } });
        if (!user) throw new Error('Неверный логин или пароль');

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) throw new Error('Неверный логин или пароль');

        // Обновляем last_login
        user.last_login = new Date();
        await user.save();

        const userDto = new UserDto(user)

        const tokens = TokenService.generateTokens({...userDto})

        await TokenService.saveToken(userDto.id, tokens.refreshToken)

        return { ...tokens, user:  userDto };
    }

    async logout(refreshToken) {
        await TokenService.removeToken(refreshToken)
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new Error('Пользователь не авторизован')
        }

        const userData = TokenService.validateRefreshToken(refreshToken)
        const tokenFromDB = await TokenService.findToken(refreshToken)

        if (!userData || !tokenFromDB) {
            throw new Error('Пользователь не авторизован')
        }

        const userDto = new UserDto(userData)

        const tokens = TokenService.generateTokens({...userDto})

        await TokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        }
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
}

module.exports = new AuthService();
