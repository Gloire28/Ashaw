import axios from 'axios';

// Le sessionId n'est plus un cookie (bloqué cross-site par défaut sur
// Safari/iOS) : on le génère une fois côté client, on le garde en
// localStorage, et on l'envoie explicitement sur chaque requête.
const SESSION_KEY = 'booking_session_id';

export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Header attaché dynamiquement à chaque requête (pas figé à la création de
// l'instance), pour être sûr d'avoir toujours la valeur courante.
api.interceptors.request.use((request) => {
  request.headers['X-Session-Id'] = getSessionId();
  return request;
});

export default api;
