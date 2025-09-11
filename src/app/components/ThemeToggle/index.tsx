// components/ThemeToggle.tsx
'use client';

import { useTheme } from '@/app/stores/themeStore';
import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'navbar';
  showLabel?: boolean;
  showSystemIndicator?: boolean; // 🆕 Mostrar se está seguindo o sistema
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'default',
  showLabel = false,
  showSystemIndicator = false, // 🆕 Padrão false para não quebrar componentes existentes
  className = '',
}) => {
  const {
    mode,
    toggleTheme,
    isTransitioning,
    isSystemControlled, // 🆕
  } = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'w-10 h-10 p-2';
      case 'navbar':
        return 'w-10 h-10 p-1.5';
      default:
        return 'w-12 h-12 p-2.5';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
      case 'navbar':
        return 'w-5 h-5';
      default:
        return 'w-6 h-6';
    }
  };

  const getThemeLabel = () => {
    const baseLabel = mode === 'dark' ? 'Escuro' : 'Claro';

    // 🆕 Adicionar indicador se está seguindo o sistema
    if (showSystemIndicator && isSystemControlled) {
      return `${baseLabel} (Sistema)`;
    }

    return baseLabel;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-theme-secondary text-sm font-medium">
          {getThemeLabel()}
        </span>
      )}

      <button
        onClick={toggleTheme}
        disabled={isTransitioning}
        className={`
          ${getVariantClasses()}
          relative
          bg-theme-elevated
          border border-theme-primary
          rounded-xl
          hover:border-theme-accent
          hover:bg-interactive-hover
          active:scale-95
          transition-all duration-300
          group
          disabled:opacity-50
          disabled:cursor-not-allowed
          focus:outline-none
          focus:ring-2
          focus:ring-brand-primary/50
          focus:ring-offset-2
          focus:ring-offset-bg-primary
        `}
        aria-label={`Alternar para tema ${
          mode === 'dark' ? 'claro' : 'escuro'
        }`}
        title={`Trocar para tema ${mode === 'dark' ? 'claro' : 'escuro'}`}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" />

        {/* Icon container */}
        <div className="relative flex items-center justify-center">
          {/* Sun icon */}
          <FiSun
            className={`
              ${getIconSize()}
              absolute
              text-brand-secondary
              transition-all duration-500
              ${
                mode === 'light'
                  ? 'opacity-100 rotate-0 scale-100'
                  : 'opacity-0 rotate-180 scale-50'
              }
            `}
          />

          {/* Moon icon */}
          <FiMoon
            className={`
              ${getIconSize()}
              absolute
              text-brand-primary
              transition-all duration-500
              ${
                mode === 'dark'
                  ? 'opacity-100 rotate-0 scale-100'
                  : 'opacity-0 -rotate-180 scale-50'
              }
            `}
          />
        </div>

        {/* Loading indicator */}
        {isTransitioning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* 🆕 Indicador de sistema (apenas se showSystemIndicator = true) */}
        {showSystemIndicator && isSystemControlled && (
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-accent-blue rounded-full opacity-75 animate-pulse" />
        )}

        {/* Subtle animation indicator */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
      </button>
    </div>
  );
};

// 🆕 Componente adicional para mostrar status do sistema
export const ThemeSystemStatus: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { mode, hasUserPreference } = useTheme();

  if (hasUserPreference) {
    return (
      <div
        className={`flex items-center gap-2 text-xs text-theme-tertiary ${className}`}
      >
        <div className="w-2 h-2 bg-accent-green rounded-full" />
        <span>Tema personalizado: {mode === 'dark' ? 'Escuro' : 'Claro'}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-xs text-theme-tertiary ${className}`}
    >
      <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
      <span>Seguindo sistema: {mode === 'dark' ? 'Escuro' : 'Claro'}</span>
    </div>
  );
};

// 🆕 Hook avançado com mais informações
export const useThemeAdvanced = () => {
  const themeData = useTheme();
  const [systemTheme, setSystemTheme] = React.useState<'dark' | 'light'>(
    'dark'
  );

  // Detectar mudanças no tema do sistema
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    updateSystemTheme(); // Atualizar inicialmente
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  return {
    ...themeData,
    systemTheme,
    isFollowingSystem: themeData.isSystemControlled,
    isDifferentFromSystem:
      themeData.hasUserPreference && themeData.mode !== systemTheme,
  };
};
