import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Services from './pages/Services';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rotas Protegidas (ADMIN) */}
            <Route path="/dashboard" element={
              <ProtectedRoute roleRequired="ADMIN">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/agendamentos" element={
              <ProtectedRoute roleRequired="ADMIN">
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/servicos" element={
              <ProtectedRoute roleRequired="ADMIN">
                <Services />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
