// components/ThemeToggle.tsx
'use client';

import { useThemeStore } from '@/app/stores/themeStore';
import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'navbar';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'default',
  showLabel = false,
  className = '',
}) => {
  const { mode, toggleTheme, isTransitioning } = useThemeStore();

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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-theme-secondary text-sm font-medium">
          {mode === 'dark' ? 'Escuro' : 'Claro'}
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
      </button>
    </div>
  );
};

// Hook para facilitar o uso
export const useTheme = () => {
  const { mode, toggleTheme, setTheme, isTransitioning } = useThemeStore();

  return {
    mode,
    toggleTheme,
    setTheme,
    isTransitioning,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };
};
