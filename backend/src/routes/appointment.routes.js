const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', appointmentController.create);
router.get('/', appointmentController.list);
router.put('/:id/cancel', appointmentController.cancel);

router.put('/:id/confirm', roleMiddleware(['ADMIN']), appointmentController.confirm);

module.exports = router;
