import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, Settings, Lock } from 'lucide-react';

export default function Layout() {
  const { user, logout, signed } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-darkblue text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold tracking-wider flex items-center gap-2">
                <Calendar className="h-6 w-6 text-brandgreen" />
                Agendamento<span className="text-brandgreen">Pro</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              {signed ? (
                <>
                  <span className="text-sm text-gray-300 hidden md:block">Olá, {user.name}</span>
                  {user?.role === 'ADMIN' && (
                    <>
                      <Link to="/dashboard" className="hover:text-brandgreen transition-colors px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                      <Link to="/agendamentos" className="hover:text-brandgreen transition-colors px-3 py-2 rounded-md text-sm font-medium">Agendamentos</Link>
                      <Link to="/servicos" className="hover:text-brandgreen transition-colors px-3 py-2 rounded-md text-sm font-medium">Serviços</Link>
                    </>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  <Lock size={16} />
                  Área do Profissional
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} AgendamentoPro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
