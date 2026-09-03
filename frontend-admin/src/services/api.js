import axios from 'axios';

// Le token admin n'est plus un cookie (bloqué cross-site par défaut sur
// Safari/iOS) : on le garde en localStorage et on l'envoie explicitement
// en "Authorization: Bearer <token>".
const TOKEN_KEY = 'booking_admin_token';

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

export const setAdminToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((request) => {
  const token = getAdminToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

export default api;
