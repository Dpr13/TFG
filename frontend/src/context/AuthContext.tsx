import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authService, type AuthUser, type LoginCredentials, type RegisterCredentials, type RegisterResponse } from '../services/auth.service';
import { useTheme } from './ThemeContext';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ requiere_verificacion?: boolean; email_enmascarado?: string; email?: string }>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setDarkMode } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar el tema cuando el usuario cambia
  useEffect(() => {
    if (user) {
      setDarkMode(user.darkMode);
    }
  }, [user?.darkMode, setDarkMode]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);

      // Si el usuario no ha verificado su email
      if (data.requiere_verificacion) {
        return {
          requiere_verificacion: true,
          email_enmascarado: data.email_enmascarado,
          email: data.email,
        };
      }

      // Login normal – guardar sesión
      if (data.user && data.token) {
        authService.saveSession({ user: data.user, token: data.token }, credentials.remember ?? false);
        setUser(data.user);
      }

      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const data = await authService.register(credentials);
      // No se auto-loguea, se devuelve la respuesta para redirigir a verificación
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
    authService.updateStoredUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
      authService.updateStoredUser(updatedUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
