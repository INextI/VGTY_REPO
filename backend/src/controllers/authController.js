const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        try {
            console.log('AuthController.login: Начало обработки запроса', req.body);
            const { login, password } = req.body;
            console.log('AuthController.login: Данные из запроса', { login, password });

            const data = await authService.login(login, password);
            console.log('AuthController.login: Успешная аутентификация', data);

            res.cookie('refreshToken', data.refreshToken, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                secure: false,
                sameSite: 'lax'
            });

            res.json(data);
        } catch (e) {
            console.error('AuthController.login: Ошибка во время аутентификации', e);
            res.status(401).json({ message: e.message });
        }
    }

    async logout(req, res) {
        try {
            console.log('AuthController.logout: Начало обработки запроса');
            const { refreshToken } = req.cookies;
            console.log('AuthController.logout: refreshToken из cookies', refreshToken);

            if (!refreshToken) {
                console.warn('AuthController.logout: refreshToken отсутствует');
                throw new Error('Нет токена');
            }

            await authService.logout(refreshToken);
            console.log('AuthController.logout: Успешный выход');

            res.clearCookie('refreshToken');

            res.json({ message: "Выход выполнен" });
        } catch (e) {
            console.error('AuthController.logout: Ошибка во время выхода', e);
            res.status(400).json({ message: e.message });
        }
    }

    async refresh(req, res) {
        try {
            console.log('AuthController.refresh: Начало обработки запроса');
            const { refreshToken } = req.cookies;
            console.log('AuthController.refresh: refreshToken из cookies', refreshToken);

            const data = await authService.refresh(refreshToken);
            console.log('AuthController.refresh: Успешное обновление токена', data);

            res.cookie('refreshToken', data.refreshToken, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                secure: false,
                sameSite: 'lax'
            });

            res.json(data);
        } catch (e) {
            console.error('AuthController.refresh: Ошибка во время обновления токена', e);
            res.status(401).json({ message: e.message });
        }
    }
}

module.exports = new AuthController();
