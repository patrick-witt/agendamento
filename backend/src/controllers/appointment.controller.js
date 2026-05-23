const appointmentService = require('../services/appointment.service');

class AppointmentController {
  async create(req, res, next) {
    try {
      const newAppointment = await appointmentService.createAppointment(req.user.id, req.body);
      res.status(201).json({ message: 'Agendamento realizado com sucesso', appointment: newAppointment });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { status, date } = req.query;
      const appointments = await appointmentService.listAppointments(req.user.id, req.user.role, status, date);
      res.status(200).json(appointments);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const appointmentId = req.params.id;
      const cancelledAppointment = await appointmentService.cancelAppointment(appointmentId, req.user.id, req.user.role);
      res.status(200).json({ message: 'Agendamento cancelado com sucesso', appointment: cancelledAppointment });
    } catch (error) {
      next(error);
    }
  }

  async confirm(req, res, next) {
    try {
      const appointmentId = req.params.id;
      const confirmedAppointment = await appointmentService.confirmAppointment(appointmentId);
      res.status(200).json({ message: 'Agendamento confirmado', appointment: confirmedAppointment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();
