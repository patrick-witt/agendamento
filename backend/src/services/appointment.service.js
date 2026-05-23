const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const { parseISO, addMinutes, format, isBefore, differenceInHours } = require('date-fns');

class AppointmentService {
  async createAppointment(userId, { service_id, appointment_date, start_time, notes }) {
    // 1. Bloquear datas passadas
    const requestedDate = parseISO(`${appointment_date}T${start_time}`);
    if (isBefore(requestedDate, new Date())) {
      throw new AppError('Não é possível agendar em datas passadas', 400);
    }

    // 2. Obter duração do serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration, is_active')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) throw new AppError('Serviço não encontrado', 404);
    if (!service.is_active) throw new AppError('Este serviço não está ativo no momento', 400);

    // Calcular end_time
    const endDate = addMinutes(requestedDate, service.duration);
    const end_time = format(endDate, 'HH:mm');

    // 3. Checar conflitos de horário (Double-Booking)
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', appointment_date)
      .in('status', ['PENDING', 'CONFIRMED'])
      .lt('start_time', end_time)
      .gt('end_time', start_time);

    if (conflictError) throw new AppError('Erro ao checar disponibilidade', 500);
    if (conflicts && conflicts.length > 0) {
      throw new AppError('Horário indisponível devido a conflito', 409);
    }

    // 4. Criar
    const { data: newAppointment, error: insertError } = await supabase
      .from('appointments')
      .insert([{
        user_id: userId,
        service_id,
        appointment_date,
        start_time,
        end_time,
        notes,
        status: 'PENDING'
      }])
      .select('*')
      .single();

    if (insertError) throw new AppError('Erro ao criar agendamento', 500);
    return newAppointment;
  }

  async listAppointments(userId, role, status, date) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        service:services(id, name),
        user:users(id, name)
      `)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: true });

    if (role !== 'ADMIN') {
      query = query.eq('user_id', userId);
    }
    if (status) query = query.eq('status', status);
    if (date) query = query.eq('appointment_date', date);

    const { data, error } = await query;
    if (error) throw new AppError('Erro ao listar agendamentos', 500);
    return data;
  }

  async cancelAppointment(appointmentId, userId, role) {
    // Obter agendamento
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) throw new AppError('Agendamento não encontrado', 404);

    if (role !== 'ADMIN' && appointment.user_id !== userId) {
      throw new AppError('Acesso negado', 403);
    }

    // Regra de Cancelamento para Customer
    if (role !== 'ADMIN') {
      const aptDateTime = parseISO(`${appointment.appointment_date}T${appointment.start_time}`);
      const limitHours = parseInt(process.env.CANCEL_LIMIT_HOURS || '24', 10);
      const hoursUntil = differenceInHours(aptDateTime, new Date());

      if (hoursUntil < limitHours) {
        throw new AppError(`Cancelamento não permitido. Faltam menos de ${limitHours}h para o agendamento.`, 400);
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'CANCELLED' })
      .eq('id', appointmentId)
      .select('*')
      .single();

    if (error) throw new AppError('Erro ao cancelar agendamento', 500);
    return data;
  }

  async confirmAppointment(appointmentId) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'CONFIRMED' })
      .eq('id', appointmentId)
      .select('*')
      .single();

    if (error) throw new AppError('Erro ao confirmar agendamento', 500);
    return data;
  }
}

module.exports = new AppointmentService();
