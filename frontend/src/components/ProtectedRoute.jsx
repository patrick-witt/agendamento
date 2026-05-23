import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roleRequired }) {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user?.role !== roleRequired) {
    // Se exige admin e usuário não é admin, manda pra home
    return <Navigate to="/" replace />;
  }

  return children;
}
