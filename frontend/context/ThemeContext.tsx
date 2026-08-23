'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'system' | 'pink';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

function getResolved(t: Theme): 'dark' | 'light' | 'pink' {
  if (t === 'system') {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }
  return t;
}

function applyTheme(t: Theme) {
  const resolved = getResolved(t);
  const html = document.documentElement;

  // Strip all theme classes and attrs
  html.classList.remove('dark', 'light', 'pink');
  html.setAttribute('data-theme', resolved);
  html.classList.add(resolved);

  // Reset #theme-root filter
  const root = document.getElementById('theme-root');
  if (root) {
    root.style.filter = '';
    root.style.backgroundColor = '';
  }

  // Light theme uses CSS filter inversion
  if (resolved === 'light') {
    const isAdmin = document.body.getAttribute('data-page') === 'admin';
    if (root && !isAdmin) {
      root.style.filter = 'invert(1) hue-rotate(180deg) sepia(15%) brightness(1.05)';
      root.style.backgroundColor = '#050f0b';
    }
  }
  // Pink and dark use CSS variables only — no filter
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('nha_theme') as Theme) || 'dark';
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme(theme); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('nha_theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
