'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolved: 'dark' | 'light'; // actual applied theme
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolved: 'dark',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolved, setResolved] = useState<'dark' | 'light'>('dark');

  // Load saved preference
  useEffect(() => {
    const saved = (localStorage.getItem('nha_theme') as Theme) || 'dark';
    setThemeState(saved);
  }, []);

  // Apply theme to <html> whenever theme or system pref changes
  useEffect(() => {
    const apply = (t: Theme) => {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = t === 'dark' || (t === 'system' && sysDark);
      const actual: 'dark' | 'light' = isDark ? 'dark' : 'light';
      setResolved(actual);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('light', !isDark);
      document.documentElement.setAttribute('data-theme', actual);

      // Apply/remove filter on #theme-root (not body) so fixed modals work
      const root = document.getElementById('theme-root');
      const isAdmin = document.body.getAttribute('data-page') === 'admin';
      if (root && !isDark && !isAdmin) {
        root.style.filter = 'invert(1) hue-rotate(180deg) sepia(15%) brightness(1.05)';
        root.style.backgroundColor = '#050f0b';
      } else if (root) {
        root.style.filter = '';
        root.style.backgroundColor = '';
      }
    };

    apply(theme);

    // Re-apply when system preference changes (only relevant for 'system' mode)
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') apply(theme); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('nha_theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
