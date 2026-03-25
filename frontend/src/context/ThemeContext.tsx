import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    // Intentar cargar del localStorage, si no existe verificar preferencia del sistema
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Usa la preferencia del sistema si está disponible
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Efecto para aplicar la clase 'dark' al elemento html
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
    }
    // Guardar en localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const setDarkMode = useCallback((isDark: boolean) => {
    setDarkModeState(isDark);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkModeState((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ darkMode, setDarkMode, toggleDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
