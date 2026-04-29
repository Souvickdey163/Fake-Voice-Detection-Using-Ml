import axios from 'axios';

// Use deployed backend if available, otherwise localhost.
// Accept either a root URL or a URL that already includes /api.
const API_ROOT = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_URL = API_ROOT.replace(/\/$/, '').replace(/\/api$/, '') + '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Auto attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
