import axios from 'axios';

const SESSION_KEY = 'booking_session_id';
const TOKEN_KEY = 'product_token';

export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const getProductToken = () => localStorage.getItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor : priorité au token produit, sinon sessionId
api.interceptors.request.use((config) => {
  const token = getProductToken();
  if (token) {
    config.headers['X-Product-Token'] = token;
  } else {
    config.headers['X-Session-Id'] = getSessionId();
  }
  return config;
});

export default api;