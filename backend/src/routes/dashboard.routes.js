const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['ADMIN']));
router.get('/summary', dashboardController.getSummary);

module.exports = router;
