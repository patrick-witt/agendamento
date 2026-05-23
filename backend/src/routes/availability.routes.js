const express = require('express');
const availabilityController = require('../controllers/availability.controller');

const router = express.Router();

router.get('/', availabilityController.getAvailability);

module.exports = router;
