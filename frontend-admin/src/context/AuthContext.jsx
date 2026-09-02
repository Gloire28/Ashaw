import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .get('/api/admin/me')
      .then(({ data }) => setAdmin(data))
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/api/admin/login', { username, password });
    setAdmin(data);
  };

  const logout = async () => {
    await api.post('/api/admin/logout');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};
