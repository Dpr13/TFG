import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authService, type AuthUser, type LoginCredentials, type RegisterCredentials } from '../services/auth.service';
import { useTheme } from './ThemeContext';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
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
      authService.saveSession(data, credentials.remember ?? false);
      setUser(data.user);
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
      authService.saveSession(data, false);
      setUser(data.user);
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
