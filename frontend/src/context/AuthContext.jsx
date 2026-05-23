import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoragedData = () => {
      const storagedUser = localStorage.getItem('@Agendamento:user');
      const storagedToken = localStorage.getItem('@Agendamento:token');

      if (storagedUser && storagedToken) {
        setUser(JSON.parse(storagedUser));
        // api.defaults.headers.Authorization is handled by interceptor
      }
      setLoading(false);
    };
    loadStoragedData();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { user, token } = response.data;

    localStorage.setItem('@Agendamento:user', JSON.stringify(user));
    localStorage.setItem('@Agendamento:token', token);

    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    const { user, token } = response.data;

    localStorage.setItem('@Agendamento:user', JSON.stringify(user));
    localStorage.setItem('@Agendamento:token', token);

    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('@Agendamento:user');
    localStorage.removeItem('@Agendamento:token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
