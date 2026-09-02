import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // indispensable : le sessionId voyage en cookie cross-site
});

export default api;
