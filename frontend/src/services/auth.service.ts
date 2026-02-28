// import apiClient from './api'; // TODO: descomentar cuando exista el endpoint de auth

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

const STORAGE_KEY = 'tfg_auth_token';
const USER_KEY = 'tfg_auth_user';

export const authService = {
  /**
   * Inicia sesión contra el backend.
   * TODO: conectar al endpoint real cuando haya backend de autenticación.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // --- Placeholder hasta que exista el endpoint de auth ---
    // Simula un login exitoso para desarrollo.
    // Reemplazar con:
    //   const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    //   return response.data;
    await new Promise((r) => setTimeout(r, 800)); // simula latencia

    if (
      credentials.email === 'admin@tfg.com' &&
      credentials.password === 'admin123'
    ) {
      const mockResponse: AuthResponse = {
        user: { id: '1', name: 'Administrador TFG', email: credentials.email, role: 'admin' },
        token: 'mock-jwt-token-placeholder',
      };
      return mockResponse;
    }

    // Cualquier email/contraseña válida redirige (modo demo)
    if (credentials.email && credentials.password.length >= 6) {
      const name = credentials.email.split('@')[0];
      const mockResponse: AuthResponse = {
        user: {
          id: '2',
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: credentials.email,
          role: 'user',
        },
        token: 'mock-jwt-token-placeholder',
      };
      return mockResponse;
    }

    throw new Error('Credenciales incorrectas');
  },

  logout: async (): Promise<void> => {
    // TODO: apiClient.post('/api/auth/logout');
    authService.clearSession();
  },

  /**
   * Registra un nuevo usuario.
   * TODO: conectar al endpoint real cuando haya backend de autenticación.
   * Reemplazar con:
   *   const response = await apiClient.post<AuthResponse>('/api/auth/register', credentials);
   *   return response.data;
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await new Promise((r) => setTimeout(r, 900)); // simula latencia

    const mockResponse: AuthResponse = {
      user: {
        id: Date.now().toString(),
        name: credentials.name,
        email: credentials.email,
        role: 'user',
      },
      token: 'mock-jwt-token-placeholder',
    };
    return mockResponse;
  },

  saveSession: (data: AuthResponse, remember: boolean): void => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
  },

  clearSession: (): void => {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(STORAGE_KEY);
      s.removeItem(USER_KEY);
    });
  },

  getStoredUser: (): AuthUser | null => {
    const raw =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      sessionStorage.getItem(STORAGE_KEY)
    );
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
};
