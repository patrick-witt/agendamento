import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { Plus, Edit2, ToggleLeft, ToggleRight, Sparkles, Scissors } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openModal = (service = null) => {
    setEditingService(service);
    if (service) {
      reset({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price
      });
    } else {
      reset({ name: '', description: '', duration: '', price: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const onSubmit = async (data) => {
    try {
      if (editingService) {
        await api.put(`/api/services/${editingService.id}`, data);
      } else {
        await api.post('/api/services', data);
      }
      fetchServices();
      closeModal();
    } catch (error) {
      alert('Erro ao salvar serviço. Tente novamente.');
    }
  };

  const toggleStatus = async (service) => {
    try {
      await api.put(`/api/services/${service.id}`, { is_active: !service.is_active });
      fetchServices();
    } catch (error) {
      alert('Erro ao alterar status');
    }
  };

  const getServiceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('corte') || n.includes('cabelo') || n.includes('barba')) return <Scissors size={24} />;
    return <Sparkles size={24} />;
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-gray-500">Carregando serviços...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-darkblue tracking-tight">Catálogo de Serviços</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2 shadow-md hover:shadow-lg bg-brandgreen hover:bg-emerald-600 transition-all rounded-full px-6">
          <Plus size={20} /> <span className="hidden sm:inline">Novo Serviço</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map(service => (
          <div key={service.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${service.is_active ? 'border-gray-100' : 'border-red-100 bg-gray-50 opacity-80 grayscale-[30%]'}`}>
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl shadow-sm ${service.is_active ? 'bg-gradient-to-br from-green-50 to-emerald-100 text-brandgreen' : 'bg-gray-200 text-gray-500'}`}>
                {getServiceIcon(service.name)}
              </div>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${service.is_active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                {service.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <h3 className="text-xl font-black text-darkblue mb-2 line-clamp-1" title={service.name}>{service.name}</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-3">{service.description || 'Sem descrição detalhada para este serviço.'}</p>
            
            <div className="flex justify-between items-end mb-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Duração</span>
                <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg text-sm">{service.duration} min</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Preço</span>
                <span className="text-xl font-black text-brandgreen">R$ {parseFloat(service.price).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-auto border-t border-gray-100 pt-4">
              <button 
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-semibold border transition-colors text-darkblue border-gray-200 hover:bg-gray-50"
                onClick={() => openModal(service)}
              >
                <Edit2 size={16} /> Editar
              </button>
              <button 
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${!service.is_active ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50' : 'text-red-600 border-red-200 hover:bg-red-50'}`} 
                onClick={() => toggleStatus(service)}
              >
                {service.is_active ? <><ToggleLeft size={16} /> Desativar</> : <><ToggleRight size={16} /> Ativar</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-darkblue/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-darkblue mb-6 border-b pb-4">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nome do Serviço" placeholder="Ex: Corte Degrade" {...register('name', { required: 'Nome é obrigatório' })} error={errors.name?.message} />
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brandgreen transition-colors resize-none h-24"
                  placeholder="Detalhes sobre o serviço..."
                  {...register('description')} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Duração (minutos)" type="number" {...register('duration', { required: 'Obrigatório', valueAsNumber: true })} error={errors.duration?.message} />
                <Input label="Preço (R$)" type="number" step="0.01" {...register('price', { required: 'Obrigatório', valueAsNumber: true })} error={errors.price?.message} />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <Button variant="outline" onClick={closeModal} className="px-6 rounded-xl">Cancelar</Button>
                <Button type="submit" className="px-8 rounded-xl shadow-md">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
