const express = require('express');
const serviceController = require('../controllers/service.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, serviceController.list);

// Rotas protegidas
router.use(authMiddleware, roleMiddleware(['ADMIN']));
router.post('/', serviceController.create);
router.put('/:id', serviceController.update);
router.delete('/:id', serviceController.delete);

module.exports = router;
