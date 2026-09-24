import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
export const apiClient = axios.create({ baseURL: baseURL || '/api', timeout: 15_000, headers: { 'Content-Type': 'application/json' } });
apiClient.interceptors.request.use((config) => { const token = window.localStorage.getItem('aegis-session'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export const isApiConfigured = Boolean(baseURL);
