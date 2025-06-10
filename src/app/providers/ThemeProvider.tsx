'use client';

import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { mode, applyTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(mode);
    }
  }, [mode, applyTheme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const hasUserPreference = localStorage.getItem('classical-music-theme');
      if (!hasUserPreference) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, mounted]);

  // Durante a hidratação, renderiza com classe neutra
  if (!mounted) {
    return (
      <div className="bg-gray-950 text-white min-h-screen">{children}</div>
    );
  }

  return (
    <div className="classical-theme min-h-screen transition-theme">
      {children}
    </div>
  );
};
