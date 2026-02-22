const authService = require('../services/authService');
class AuthController {
    async login(req, res) {
      try {
        const { login, password } = req.body;
        const data = await authService.login(login, password);

        res.cookie('refreshToken', data.refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          secure: false,
          sameSite: 'lax'
        })

        res.json(data);
      } catch (e) {
        res.status(401).json({ message: e.message });
      }
    }

    async logout(req,res) {
      try {
        const {refreshToken} = req.cookies
        if (!refreshToken) {
          throw new Error('Нет токена')
        }
        await authService.logout(refreshToken)

        res.clearCookie('refreshToken')

        res.json({message: "Выход выполнен"})
      } catch (e) {
        res.status(400).json({message: e.message})
      }
    }

    async refresh (req, res) {
      try {
        const {refreshToken} = req.body
        const data = await authService.refresh(refreshToken)

        res.cookie('refreshToken', data.refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          secure: false,
          sameSite: 'lax'
        })

        res.json(data)
      } catch (e) {
        res.status(401).json({message: e.message})
      }
    }
}

module.exports = new AuthController();
