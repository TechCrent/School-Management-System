import React, { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'theme';
const themes = ['light', 'dark', 'system'] as const;
type Theme = typeof themes[number];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/**
 * Provides theme context and management for the application.
 *
 * @param children - React children to be wrapped by the provider.
 * @returns Theme context provider.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored && themes.includes(stored)) return stored;
    }
    return 'system';
  });

  useEffect(() => {
    let appliedTheme = theme;
    if (theme === 'system') {
      appliedTheme = getSystemTheme();
    }
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(appliedTheme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Listen to system theme changes if 'system' is selected
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const appliedTheme = getSystemTheme();
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(appliedTheme);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access and set the current theme.
 * @returns { theme, setTheme }
 * @throws Error if used outside ThemeProvider.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
} 