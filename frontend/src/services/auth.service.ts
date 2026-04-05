import apiClient from './api';

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
  notificationsEnabled: boolean;
  darkMode: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterResponse {
  ok: boolean;
  mensaje: string;
  email_enmascarado: string;
  email: string;
}

export interface LoginResponse {
  // Successful login
  user?: AuthUser;
  token?: string;
  // Unverified user
  ok?: boolean;
  requiere_verificacion?: boolean;
  mensaje?: string;
  email_enmascarado?: string;
  email?: string;
}

export interface VerifyEmailResponse {
  ok: boolean;
  mensaje: string;
}

export interface ResendCodeResponse {
  ok: boolean;
  mensaje: string;
  email_enmascarado: string;
}

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  notificationsEnabled?: boolean;
  darkMode?: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

const STORAGE_KEY = 'tfg_auth_token';
const USER_KEY = 'tfg_auth_user';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/users/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    authService.clearSession();
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/users/register', {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  verificarEmail: async (email: string, codigo: string): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post<VerifyEmailResponse>('/users/verificar-email', {
      email,
      codigo,
    });
    return response.data;
  },

  reenviarCodigo: async (email: string): Promise<ResendCodeResponse> => {
    const response = await apiClient.post<ResendCodeResponse>('/users/reenviar-codigo', {
      email,
    });
    return response.data;
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDTO): Promise<AuthUser> => {
    const response = await apiClient.put<AuthUser>('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDTO): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/users/change-password', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ ok: boolean; mensaje: string }> => {
    const response = await apiClient.post<{ ok: boolean; mensaje: string }>('/users/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ ok: boolean; mensaje: string }> => {
    const response = await apiClient.post<{ ok: boolean; mensaje: string }>('/users/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  saveSession: (data: AuthResponse, remember: boolean): void => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
  },

  clearSession: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  },

  getStoredUser: (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  updateStoredUser: (user: AuthUser): void => {
    const hasLocal = localStorage.getItem(USER_KEY);
    const hasSession = sessionStorage.getItem(USER_KEY);
    
    if (hasLocal) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    if (hasSession) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
};
