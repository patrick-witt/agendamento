import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { format, subDays } from 'date-fns';
import { Users, CheckSquare, Clock, XCircle, DollarSign, BarChart2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeFilter, setActiveFilter] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/dashboard/summary?date=${selectedDate}`);
        setData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchChartData = async () => {
      try {
        const response = await api.get('/api/appointments');
        const allApts = response.data;
        
        const last7DaysMap = {};
        for (let i = 6; i >= 0; i--) {
          const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
          last7DaysMap[dateStr] = 0;
        }
        
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const cutoffDateStr = format(subDays(new Date(), 6), 'yyyy-MM-dd');

        allApts.forEach(apt => {
          if (apt.appointment_date >= cutoffDateStr && apt.appointment_date <= todayStr) {
            if (last7DaysMap[apt.appointment_date] !== undefined) {
              last7DaysMap[apt.appointment_date]++;
            }
          }
        });

        const newChartData = Object.keys(last7DaysMap).map(dateStr => ({
          label: format(new Date(dateStr + 'T00:00:00'), 'dd/MM'),
          value: last7DaysMap[dateStr]
        }));
        
        setChartData(newChartData);
      } catch (error) {
        console.error('Erro ao buscar dados para o gráfico', error);
      }
    };

    fetchSummary();
    fetchChartData();
  }, [selectedDate]);

  if (loading && !data) return <div className="text-center py-20 animate-pulse text-gray-500">Carregando métricas...</div>;
  if (!data) return null;

  const { metrics, upcoming_appointments } = data;

  const handleCardClick = (statusFilter) => {
    if (activeFilter === statusFilter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(statusFilter);
    }
  };

  const filteredAppointments = activeFilter && activeFilter !== 'TOTAL' 
    ? upcoming_appointments.filter(apt => apt.status === activeFilter) 
    : upcoming_appointments;

  const StatCard = ({ title, value, icon: Icon, colorFrom, colorTo, textColor, filterValue }) => {
    const isActive = activeFilter === filterValue;
    return (
      <div 
        onClick={() => handleCardClick(filterValue)}
        className={`bg-white p-6 rounded-2xl shadow-sm border flex items-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer ${
          isActive ? 'border-brandgreen ring-2 ring-brandgreen/30 scale-[1.02]' : 'border-gray-100'
        }`}
      >
        <div className={`p-4 rounded-xl mr-4 bg-gradient-to-br ${colorFrom} ${colorTo} text-white shadow-inner`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-black ${textColor}`}>{value}</p>
        </div>
      </div>
    );
  };

  const statusLabels = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Concluído'
  };

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-darkblue tracking-tight">Visão Geral do Dia</h1>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100 focus-within:border-brandgreen focus-within:ring-1 focus-within:ring-brandgreen transition-all">
          <CalendarIcon size={18} className="text-brandgreen" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none outline-none text-gray-700 font-medium bg-transparent cursor-pointer"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard filterValue="TOTAL" title="Total" value={metrics.total_appointments} icon={Users} colorFrom="from-blue-400" colorTo="to-blue-600" textColor="text-blue-900" />
        <StatCard filterValue="CONFIRMED" title="Confirmados" value={metrics.confirmed_appointments} icon={CheckSquare} colorFrom="from-emerald-400" colorTo="to-emerald-600" textColor="text-emerald-900" />
        <StatCard filterValue="PENDING" title="Pendentes" value={metrics.pending_appointments} icon={Clock} colorFrom="from-yellow-400" colorTo="to-yellow-600" textColor="text-yellow-900" />
        <StatCard filterValue="CANCELLED" title="Cancelados" value={metrics.cancelled_appointments} icon={XCircle} colorFrom="from-red-400" colorTo="to-red-600" textColor="text-red-900" />
        
        {/* Receita is not a filter */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="p-4 rounded-xl mr-4 bg-gradient-to-br from-darkblue to-blue-900 text-white shadow-inner">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Receita (R$)</p>
            <p className="text-2xl font-black text-darkblue">{parseFloat(metrics.estimated_revenue).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CSS Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-darkblue flex items-center gap-2">
              <BarChart2 className="text-brandgreen" /> Agendamentos (7 dias)
            </h2>
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 h-48 mt-auto border-b border-gray-100 pb-2 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-gray-300 w-full"></div>
              <div className="border-t border-gray-300 w-full"></div>
              <div className="border-t border-gray-300 w-full"></div>
            </div>

            {chartData.map((day, idx) => {
              const heightPercent = maxValue > 0 ? Math.max((day.value / maxValue) * 100, 5) : 5; // Ensure min height
              return (
                <div key={idx} className="flex flex-col items-center justify-end h-full flex-1 group z-10 relative">
                  {day.value > 0 && (
                    <div className="text-xs font-bold text-gray-600 mb-1 transition-all">
                      {day.value}
                    </div>
                  )}
                  <div 
                    className="w-full bg-gradient-to-t from-brandgreen to-emerald-400 rounded-t-sm transition-all duration-500 group-hover:from-darkblue group-hover:to-blue-600" 
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <div className="text-[10px] text-gray-500 mt-2 font-medium truncate w-full text-center">{day.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-darkblue">Próximos Agendamentos {selectedDate === format(new Date(), 'yyyy-MM-dd') ? '(Hoje)' : ''}</h2>
            {activeFilter && activeFilter !== 'TOTAL' && (
              <span className="bg-brandgreen/10 text-brandgreen text-xs font-bold px-3 py-1 rounded-full border border-brandgreen/20">
                Filtro: {statusLabels[activeFilter]}
              </span>
            )}
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Horário</th>
                  <th className="p-4 font-bold">Cliente</th>
                  <th className="p-4 font-bold">Serviço</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b last:border-0 even:bg-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-black text-darkblue">{apt.time}</td>
                    <td className="p-4 text-gray-700 font-medium">{apt.client_name}</td>
                    <td className="p-4 text-gray-600">{apt.service_name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                        apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {statusLabels[apt.status] || apt.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400 font-medium">Nenhum agendamento encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const CalendarIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
