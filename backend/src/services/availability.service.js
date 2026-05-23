const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const { parseISO, addMinutes, format, isBefore, isSameDay } = require('date-fns');

class AvailabilityService {
  async getAvailability(date, serviceId) {
    if (!date || !serviceId) {
      throw new AppError('Data e service_id são obrigatórios', 400);
    }

    // 1. Obter duração do serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration, is_active')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) throw new AppError('Serviço não encontrado', 404);
    if (!service.is_active) throw new AppError('Serviço inativo', 400);

    // 2. Definir limites de horário de funcionamento
    const startHourStr = process.env.BUSINESS_START || '09:00';
    const endHourStr = process.env.BUSINESS_END || '18:00';

    const businessStart = parseISO(`${date}T${startHourStr}`);
    const businessEnd = parseISO(`${date}T${endHourStr}`);

    // Não permitir agendamento no passado para o dia atual
    const now = new Date();
    let currentSlot = businessStart;
    
    // Se a data solicitada for hoje e a hora de início do negócio já passou, ajustar o currentSlot para a próxima meia hora
    if (isSameDay(parseISO(`${date}T00:00:00`), now) && isBefore(businessStart, now)) {
        // Uma heurística simples para não oferecer horários passados hoje
        currentSlot = addMinutes(now, 30 - (now.getMinutes() % 30));
    }

    // Se o dia solicitado já passou por completo
    if (isBefore(parseISO(`${date}T23:59:59`), now)) {
         return { date, available_times: [] }; 
    }


    // 3. Buscar agendamentos do dia (PENDING ou CONFIRMED)
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('appointment_date', date)
      .in('status', ['PENDING', 'CONFIRMED']);

    if (apptError) throw new AppError('Erro ao buscar agendamentos', 500);

    const availableTimes = [];
    const increment = 30; // Oferecer slots a cada 30 minutos

    while (isBefore(addMinutes(currentSlot, service.duration), businessEnd) || addMinutes(currentSlot, service.duration).getTime() === businessEnd.getTime()) {
      const slotStartStr = format(currentSlot, 'HH:mm');
      const slotEndStr = format(addMinutes(currentSlot, service.duration), 'HH:mm');

      // Checar conflito com algum appointment
      const hasConflict = appointments.some(appt => {
        return slotStartStr < appt.end_time && slotEndStr > appt.start_time;
      });

      if (!hasConflict) {
        availableTimes.push(slotStartStr);
      }

      // Avança o slot
      currentSlot = addMinutes(currentSlot, increment);
    }

    return {
      date,
      available_times: availableTimes
    };
  }
}

module.exports = new AvailabilityService();
