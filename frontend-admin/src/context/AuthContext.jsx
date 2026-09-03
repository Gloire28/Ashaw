import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAdminToken } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .get('/api/admin/me')
      .then(({ data }) => setAdmin(data))
      .catch(() => {
        setAdmin(null);
        setAdminToken(null); // token périmé/invalide, on nettoie
      })
      .finally(() => setChecking(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/api/admin/login', { username, password });
    const { token, ...adminInfo } = data;
    setAdminToken(token);
    setAdmin(adminInfo);
  };

  const logout = async () => {
    await api.post('/api/admin/logout');
    setAdminToken(null);
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
