const AppError = require('../utils/AppError');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Acesso negado. Permissão insuficiente.', 403));
    }
    next();
  };
};

module.exports = roleMiddleware;
