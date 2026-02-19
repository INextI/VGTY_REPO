const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { login, password } = req.body;
      const result = await authService.login(login, password);
      res.json(result);
    } catch (e) {
      res.status(401).json({ message: e.message });
    }
  }
}

module.exports = new AuthController();
