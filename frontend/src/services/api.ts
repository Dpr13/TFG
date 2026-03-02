import axios from 'axios';

/**
 * API CLIENT CONFIGURATION
 * 
 * EXPANSIÓN: Mejoras de seguridad y performance:
 * - Autenticación JWT con tokens de acceso/refresh
 * - Retry automático con exponencial backoff
 * - Cache HTTP con estrategia de invalidación
 * - Request deduplication (evitar duplicados)
 * - Compresión de payloads
 * - Encriptación de datos sensibles
 * - Rate limiting del cliente
 * - Request tracing/correlation IDs
 * - Logging centralizando con timestamp
 * - Analytics de latencia por endpoint
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
