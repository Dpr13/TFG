import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Añadir JWT token a todas las peticiones excepto login y register
apiClient.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url?.includes('/users/login') || config.url?.includes('/users/register') || config.url?.includes('/users/verificar-email') || config.url?.includes('/users/reenviar-codigo');
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
    const isAuthEndpoint = error.config?.url?.includes('/users/login') || error.config?.url?.includes('/users/register') || error.config?.url?.includes('/users/verificar-email') || error.config?.url?.includes('/users/reenviar-codigo');
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
      return Promise.reject(error);
    }

    // --- Lógica de reintento ---
    const config = error.config;
    
    // Si no hay config o ya superamos los intentos (máximo 3 peticiones en total = 2 reintentos)
    // El usuario pidió "máximo de 3 peticiones", eso significa la original + 2 reintentos.
    if (!config || (config.__retryCount || 0) >= 2) {
      console.error('API Error (Max retries reached or non-retryable):', error.response?.data || error.message);
      return Promise.reject(error);
    }

    // Inicializar contador de reintentos
    config.__retryCount = config.__retryCount || 0;

    // Solo reintentar en ciertos errores:
    // - Errores de red (sin respuesta)
    // - Errores 5xx del servidor
    // - Timeouts
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
    const isTimeout = error.code === 'ECONNABORTED';

    if (isNetworkError || isServerError || isTimeout) {
      config.__retryCount += 1;
      console.warn(`Retrying request (${config.__retryCount + 1}/3): ${config.url}`);
      
      // Esperar 1 segundo antes del reintento
      return new Promise(resolve => setTimeout(resolve, 1000))
        .then(() => apiClient(config));
    }
    // ---------------------------

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
