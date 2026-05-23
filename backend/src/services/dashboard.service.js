const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const { format } = require('date-fns');

class DashboardService {
  async getSummary(date) {
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');

    // Buscar agendamentos do dia
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        status,
        service:services(name, price),
        user:users(name)
      `)
      .eq('appointment_date', targetDate)
      .order('start_time', { ascending: true });

    if (error) throw new AppError('Erro ao buscar resumo', 500);

    const metrics = {
      total_appointments: appointments.length,
      confirmed_appointments: 0,
      pending_appointments: 0,
      cancelled_appointments: 0,
      estimated_revenue: 0
    };

    const upcoming_appointments = [];

    appointments.forEach(appt => {
      if (appt.status === 'CONFIRMED') {
        metrics.confirmed_appointments++;
        metrics.estimated_revenue += Number(appt.service.price);
      } else if (appt.status === 'PENDING') {
        metrics.pending_appointments++;
      } else if (appt.status === 'CANCELLED') {
        metrics.cancelled_appointments++;
      }

      if (appt.status !== 'CANCELLED') {
        upcoming_appointments.push({
          id: appt.id,
          time: appt.start_time,
          client_name: appt.user.name,
          service_name: appt.service.name,
          status: appt.status
        });
      }
    });

    return {
      date: targetDate,
      metrics,
      upcoming_appointments
    };
  }
}

module.exports = new DashboardService();
