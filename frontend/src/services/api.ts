import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Añadir JWT token a todas las peticiones excepto login y register
apiClient.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url?.includes('/users/login') || config.url?.includes('/users/register');
  if (!isAuthEndpoint) {
    const token =
      localStorage.getItem('tfg_auth_token') ||
      sessionStorage.getItem('tfg_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Manejar errores: si el token expira, limpiar sesión y redirigir al login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/users/login') || error.config?.url?.includes('/users/register');
    const isChangePassword = error.config?.url?.includes('/users/change-password');
    
    // Solo limpiar sesión y redirigir si:
    // - Es un error 401
    // - NO es un endpoint de autenticación (login/register)
    // - NO es el endpoint de cambio de contraseña (el 401 significa contraseña incorrecta, no token inválido)
    if (error.response?.status === 401 && !isAuthEndpoint && !isChangePassword) {
      localStorage.removeItem('tfg_auth_token');
      localStorage.removeItem('tfg_auth_user');
      sessionStorage.removeItem('tfg_auth_token');
      sessionStorage.removeItem('tfg_auth_user');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
