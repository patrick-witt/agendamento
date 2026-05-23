import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Scissors, ArrowDown, Sparkles, User, Mail, Phone, Lock } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function Home() {
  const { signed, user, register: registerUser } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/api/services').then(res => setServices(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      api.get(`/api/availability?date=${selectedDate}&service_id=${selectedService.id}`)
        .then(res => setAvailableTimes(res.data.available_times || []))
        .catch(console.error);
      setSelectedTime(''); 
    }
  }, [selectedService, selectedDate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');

      if (!signed) {
        await registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone
        });
      }

      await api.post('/api/appointments', {
        service_id: selectedService.id,
        appointment_date: selectedDate,
        start_time: selectedTime,
        notes: data.notes || ''
      });

      setSuccess(true);
      setStep(4);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Ocorreu um erro ao processar o agendamento.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('corte') || n.includes('cabelo')) return <Scissors size={32} />;
    return <Sparkles size={32} />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-darkblue to-brandgreen rounded-3xl p-10 md:p-16 text-center text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
          <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold tracking-wider mb-6 border border-white/30 backdrop-blur-sm">
            BEM-VINDO AO
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">Studio Bella</h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-green-50">Agende seu horário com quem entende de beleza</h2>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-10">
            Escolha o serviço, a data e o horário ideal para você. Rápido, fácil e sem filas.
          </p>
          <a href="#agendamento-wizard" className="animate-bounce bg-white text-darkblue p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow">
            <ArrowDown size={24} />
          </a>
        </div>
      </div>

      <div id="agendamento-wizard" className="bg-white rounded-2xl shadow-xl p-6 md:p-12 border border-gray-100 relative">
        
        {/* WIZARD PROGRESS */}
        <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
          {step > 1 && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brandgreen -z-10 transition-all duration-500 rounded-full" style={{ width: step === 2 ? '50%' : '100%' }}></div>}
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300 bg-white shadow-sm ${
              step >= num 
                ? 'border-brandgreen text-brandgreen scale-110' 
                : 'border-gray-200 text-gray-400'
            }`}>
              {step > num || success ? <CheckCircle2 size={24} /> : num}
            </div>
          ))}
        </div>

        {errorMsg && <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md font-medium">{errorMsg}</div>}

        {/* PASSO 1: SERVIÇOS */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-darkblue flex items-center justify-center gap-2">
                <Scissors className="text-brandgreen" /> Escolha o Serviço
              </h2>
              <p className="text-gray-500 mt-2">Qual tratamento você deseja hoje?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedService?.id === service.id 
                    ? 'border-brandgreen bg-green-50 shadow-md ring-2 ring-brandgreen/20' 
                    : 'border-gray-100 hover:border-brandgreen/50 hover:shadow-sm bg-white'
                  }`}
                >
                  <div className={`mb-4 ${selectedService?.id === service.id ? 'text-brandgreen' : 'text-gray-400'}`}>
                    {getServiceIcon(service.name)}
                  </div>
                  <h3 className="text-lg font-bold text-darkblue mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description || 'Tratamento especializado'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{service.duration} min</span>
                    <span className="font-bold text-brandgreen text-lg">R$ {parseFloat(service.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedService} className={`px-8 py-3 text-lg ${!selectedService ? 'opacity-50' : 'shadow-lg hover:shadow-xl'}`}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 2: DATA E HORA */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-darkblue flex items-center justify-center gap-2">
                <CalendarIcon className="text-brandgreen" /> Data e Horário
              </h2>
              <p className="text-gray-500 mt-2">Quando você gostaria de ser atendido?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-darkblue mb-3 uppercase tracking-wider">Escolha o dia</label>
                <input 
                  type="date" 
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brandgreen shadow-sm"
                />
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-darkblue mb-3 uppercase tracking-wider">Horários Disponíveis</label>
                <div className="grid grid-cols-3 gap-3">
                  {availableTimes.length > 0 ? (
                    availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg border font-medium transition-all ${
                          selectedTime === time 
                          ? 'bg-brandgreen text-white border-brandgreen shadow-md scale-105' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-brandgreen hover:text-brandgreen'
                        }`}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <p className="col-span-3 text-sm text-gray-500 py-4 text-center bg-white rounded-lg border border-dashed border-gray-300">Nenhum horário disponível nesta data.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="px-6 py-3">Voltar</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className={`px-8 py-3 text-lg ${(!selectedDate || !selectedTime) ? 'opacity-50' : 'shadow-lg hover:shadow-xl'}`}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 3: DADOS DO CLIENTE */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-darkblue flex items-center justify-center gap-2">
                <Clock className="text-brandgreen" /> Confirmação
              </h2>
              <p className="text-gray-500 mt-2">Preencha seus dados para finalizar</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-8 border border-green-100 shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-green-800 uppercase font-bold tracking-wider mb-1">Resumo do Agendamento</p>
                <p className="text-lg text-darkblue"><strong>{selectedService?.name}</strong></p>
              </div>
              <div className="text-right">
                <p className="text-darkblue font-medium">{format(new Date(selectedDate + 'T00:00:00'), 'dd/MM/yyyy')}</p>
                <p className="text-2xl font-black text-brandgreen">{selectedTime}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl mx-auto">
              {!signed ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input icon={User} label="Nome Completo" placeholder="João da Silva" className="md:col-span-2" {...register('name', { required: 'Nome é obrigatório' })} error={errors.name?.message} />
                  <Input icon={Mail} label="E-mail" type="email" placeholder="joao@example.com" className="md:col-span-2" {...register('email', { required: 'E-mail é obrigatório' })} error={errors.email?.message} />
                  <Input icon={Phone} label="Telefone" placeholder="11999999999" {...register('phone', { required: 'Telefone é obrigatório' })} error={errors.phone?.message} />
                  <Input icon={Lock} label="Crie uma Senha" type="password" placeholder="******" {...register('password', { required: 'Senha é obrigatória' })} error={errors.password?.message} />
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3 text-blue-800">
                  <div className="bg-white p-2 rounded-full"><User size={20} className="text-blue-500"/></div>
                  <div>
                    <p className="text-sm">Agendando como:</p>
                    <p className="font-bold">{user?.name} <span className="font-normal text-blue-600">({user?.email})</span></p>
                  </div>
                </div>
              )}
              
              <Input label="Observações (Opcional)" placeholder="Alguma preferência especial?" {...register('notes')} />

              <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <Button variant="outline" onClick={() => setStep(2)} className="px-6 py-3">Voltar</Button>
                <Button type="submit" isLoading={loading} className="px-8 py-3 text-lg shadow-lg hover:shadow-xl bg-brandgreen">
                  Confirmar Agendamento
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* SUCESSO */}
        {step === 4 && (
          <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-brandgreen to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-200">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-darkblue to-brandgreen mb-4">Agendamento Confirmado!</h2>
            <p className="text-xl text-gray-600 mb-2">Seu horário foi reservado com sucesso.</p>
            <p className="text-lg font-bold text-darkblue mb-10">Te esperamos no dia {format(new Date(selectedDate + 'T00:00:00'), 'dd/MM/yyyy')} às {selectedTime}.</p>
            <Button onClick={() => {
              setStep(1);
              setSelectedService(null);
              setSelectedTime('');
              setSuccess(false);
            }} className="px-8 py-3 text-lg">Agendar outro serviço</Button>
          </div>
        )}

      </div>
    </div>
  );
}
