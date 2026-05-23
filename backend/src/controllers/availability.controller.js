const availabilityService = require('../services/availability.service');

class AvailabilityController {
  async getAvailability(req, res, next) {
    try {
      const { date, service_id } = req.query;
      const availability = await availabilityService.getAvailability(date, service_id);
      res.status(200).json(availability);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AvailabilityController();
