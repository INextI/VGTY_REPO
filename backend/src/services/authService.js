const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User  = require('../models/userModel');

class AuthService {
    async login(login, password) {
        const user = await User.findOne({ where: { login } });
        if (!user) throw new Error('Неверный логин или пароль');

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) throw new Error('Неверный логин или пароль');

        // Обновляем last_login
        user.last_login = new Date();
        await user.save();

        // Создаём JWT
        const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
        );

        return { token, user };
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
}

module.exports = new AuthService();
