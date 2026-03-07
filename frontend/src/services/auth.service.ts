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
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
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
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    authService.clearSession();
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/register', {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
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
