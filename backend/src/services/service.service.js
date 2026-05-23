const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

class ServiceService {
  async listServices(role) {
    let query = supabase.from('services').select('*').order('created_at', { ascending: false });
    
    // Customers só veem serviços ativos
    if (role !== 'ADMIN') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw new AppError('Erro ao listar serviços', 500);
    return data;
  }

  async createService(data) {
    const { data: newService, error } = await supabase
      .from('services')
      .insert([data])
      .select('*')
      .single();

    if (error) throw new AppError('Erro ao criar serviço', 500);
    return newService;
  }

  async updateService(id, data) {
    const { data: updatedService, error } = await supabase
      .from('services')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new AppError('Erro ao atualizar serviço', 500);
    return updatedService;
  }

  async deleteService(id) {
    // Check for existing appointments
    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', id);

    if (countError) throw new AppError('Erro ao checar agendamentos', 500);
    if (count > 0) {
      throw new AppError('Não é possível deletar um serviço que possui agendamentos. Considere inativá-lo.', 400);
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw new AppError('Erro ao deletar serviço', 500);
  }
}

module.exports = new ServiceService();
