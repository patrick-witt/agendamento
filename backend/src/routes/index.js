const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const authRoutes = require('./auth.routes');
const serviceRoutes = require('./service.routes');
const availabilityRoutes = require('./availability.routes');
const appointmentRoutes = require('./appointment.routes');
const dashboardRoutes = require('./dashboard.routes');

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/availability', availabilityRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
