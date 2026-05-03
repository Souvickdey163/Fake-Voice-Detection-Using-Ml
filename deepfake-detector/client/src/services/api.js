import axios from 'axios';

// Use deployed backend if available, otherwise localhost.
// Keep the base at the backend root; request paths include /api explicitly.
const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_ROOT = envApiUrl || 'http://127.0.0.1:8000';
export const API_URL = API_ROOT.replace(/\/$/, '').replace(/\/api$/, '');
export const API_CONFIG_ERROR =
  import.meta.env.PROD && !envApiUrl
    ? 'Missing VITE_API_URL. Add it in Vercel Environment Variables and redeploy.'
    : '';

if (API_CONFIG_ERROR) {
  console.error(API_CONFIG_ERROR);
} else {
  console.info('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// Auto attach JWT token
api.interceptors.request.use(
  (config) => {
    console.debug('API request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
