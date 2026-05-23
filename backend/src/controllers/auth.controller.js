const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ message: 'Usuário registrado com sucesso', ...result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ message: 'Login realizado com sucesso', ...result });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Em uma API JWT stateless, o logout é gerenciado deletando o token no frontend.
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
