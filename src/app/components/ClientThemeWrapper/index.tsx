// app/components/ClientThemeWrapper.tsx
'use client';

import { useThemeStore } from '@/app/stores/themeStore';
import React, { useEffect, useState } from 'react';

interface ClientThemeWrapperProps {
  children: React.ReactNode;
}

export const ClientThemeWrapper: React.FC<ClientThemeWrapperProps> = ({
  children,
}) => {
  const { mode, applyTheme } = useThemeStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Evita hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Aplica o tema quando o componente monta ou o tema muda
  useEffect(() => {
    if (isHydrated) {
      applyTheme(mode);
    }
  }, [mode, applyTheme, isHydrated]);

  // Detecta preferência do sistema
  useEffect(() => {
    if (!isHydrated) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Só segue a preferência do sistema se não houver preferência manual
      const hasUserPreference = localStorage.getItem('classical-music-theme');
      if (!hasUserPreference) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, isHydrated]);

  // Previne flash durante hidratação
  if (!isHydrated) {
    return <div className="classical-theme opacity-0">{children}</div>;
  }

  return (
    <div className="bg-theme-primary transition-opacity duration-300 opacity-100">
      {children}
    </div>
  );
};

// Hook adicional para verificar se está hidratado
export const useIsHydrated = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
