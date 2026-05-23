import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Lock, Mail, Scissors } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const user = await login(data.email, data.password);
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -m-4 sm:-m-8 bg-gray-50">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-darkblue to-brandgreen"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-darkblue to-blue-900 p-4 rounded-full text-white mb-4 shadow-lg">
            <Scissors size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-darkblue to-brandgreen tracking-tight">Studio Bella</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Área do Profissional</p>
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="admin@studiobella.com"
            icon={Mail}
            {...register('email', { required: 'E-mail é obrigatório' })}
            error={errors.email?.message}
          />
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••"
            icon={Lock}
            {...register('password', { required: 'Senha é obrigatória' })}
            error={errors.password?.message}
          />
          <Button type="submit" className="w-full mt-6 bg-gradient-to-r from-darkblue to-brandgreen hover:from-blue-900 hover:to-emerald-600 border-none shadow-md hover:shadow-lg transition-all py-3 text-lg" isLoading={loading}>
            Entrar no Sistema
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-darkblue transition-colors font-medium flex items-center justify-center gap-1">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
