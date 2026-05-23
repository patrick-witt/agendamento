import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import Button from '../components/Button';
import { Check, X, Calendar as CalendarIcon, Filter } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/api/appointments';
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterStatus) params.append('status', filterStatus);
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus]);

  const handleStatusUpdate = async (id, action) => {
    try {
      await api.put(`/api/appointments/${id}/${action}`);
      fetchAppointments();
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-darkblue mb-8 tracking-tight">Gerenciar Agendamentos</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider flex items-center gap-1">
            <CalendarIcon size={16} className="text-brandgreen"/> Filtrar por Data
          </label>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brandgreen outline-none text-gray-700 shadow-sm"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider flex items-center gap-1">
            <Filter size={16} className="text-brandgreen"/> Filtrar por Status
          </label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brandgreen outline-none text-gray-700 shadow-sm appearance-none bg-white"
          >
            <option value="">Todos os Status</option>
            <option value="PENDING">Pendentes</option>
            <option value="CONFIRMED">Confirmados</option>
            <option value="CANCELLED">Cancelados</option>
            <option value="COMPLETED">Concluídos</option>
          </select>
        </div>
        <div className="w-full md:w-auto">
          <Button variant="outline" onClick={() => { setFilterDate(''); setFilterStatus(''); }} className="w-full md:w-auto py-3 px-6 rounded-xl font-semibold">
            Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandgreen"></div>
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b">
                <th className="p-5 font-bold">Data / Hora</th>
                <th className="p-5 font-bold">Cliente</th>
                <th className="p-5 font-bold">Serviço</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? appointments.map((apt) => (
                <tr key={apt.id} className="border-b last:border-0 even:bg-gray-50 hover:bg-blue-50/50 transition-colors">
                  <td className="p-5 text-gray-900">
                    <span className="font-black text-darkblue">{format(new Date(apt.appointment_date + 'T00:00:00'), 'dd/MM/yyyy')}</span> <br/>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">{apt.start_time.substring(0,5)} - {apt.end_time.substring(0,5)}</span>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-gray-800">{apt.user.name}</p>
                  </td>
                  <td className="p-5 text-gray-700 font-medium">{apt.service.name}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                      apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status === 'PENDING' ? 'Pendente' : 
                       apt.status === 'CONFIRMED' ? 'Confirmado' : 
                       apt.status === 'CANCELLED' ? 'Cancelado' : 
                       apt.status === 'COMPLETED' ? 'Concluído' : apt.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2 flex justify-end">
                    {apt.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusUpdate(apt.id, 'confirm')}
                        title="Confirmar Agendamento" 
                        className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition-all hover:shadow-sm"
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                    )}
                    {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                      <button 
                        onClick={() => handleStatusUpdate(apt.id, 'cancel')}
                        title="Cancelar Agendamento" 
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all hover:shadow-sm"
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 font-medium">Nenhum agendamento encontrado para este filtro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
