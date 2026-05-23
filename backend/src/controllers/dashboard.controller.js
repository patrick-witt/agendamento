const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const { date } = req.query;
      const summary = await dashboardService.getSummary(date);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
