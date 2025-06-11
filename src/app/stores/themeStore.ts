// stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';
import { THEME_CONFIG, THEME_GRADIENTS, ThemeMode } from '../thema';

interface ThemeState {
  mode: ThemeMode;
  isTransitioning: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  applyTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      isTransitioning: false,

      toggleTheme: () => {
        const currentMode = get().mode;
        const newMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
        get().setTheme(newMode);
      },

      setTheme: (mode: ThemeMode) => {
        set({ isTransitioning: true });

        // Delay para transição suave
        setTimeout(() => {
          get().applyTheme(mode);
          set({ mode, isTransitioning: false });
        }, 50);
      },

      applyTheme: (mode: ThemeMode) => {
        const theme = THEME_CONFIG[mode];
        const gradients = THEME_GRADIENTS[mode];
        const root = document.documentElement;

        // Background colors
        root.style.setProperty('--bg-primary', theme.background.primary);
        root.style.setProperty('--bg-secondary', theme.background.secondary);
        root.style.setProperty('--bg-tertiary', theme.background.tertiary);
        root.style.setProperty('--bg-elevated', theme.background.elevated);
        root.style.setProperty('--bg-overlay', theme.background.overlay);

        // Text colors
        root.style.setProperty('--text-primary', theme.text.primary);
        root.style.setProperty('--text-secondary', theme.text.secondary);
        root.style.setProperty('--text-tertiary', theme.text.tertiary);
        root.style.setProperty('--text-inverse', theme.text.inverse);

        // Brand colors
        root.style.setProperty('--brand-primary', theme.brand.primary);
        root.style.setProperty('--brand-secondary', theme.brand.secondary);
        root.style.setProperty('--brand-gradient', theme.brand.gradient);

        // Accent colors
        root.style.setProperty('--accent-gold', theme.accent.gold);
        root.style.setProperty('--accent-amber', theme.accent.amber);
        root.style.setProperty('--accent-purple', theme.accent.purple);
        root.style.setProperty('--accent-blue', theme.accent.blue);
        root.style.setProperty('--accent-green', theme.accent.green);
        root.style.setProperty('--accent-red', theme.accent.red);

        // Border colors
        root.style.setProperty('--border-primary', theme.border.primary);
        root.style.setProperty('--border-secondary', theme.border.secondary);
        root.style.setProperty('--border-accent', theme.border.accent);

        // Interactive states
        root.style.setProperty('--interactive-hover', theme.interactive.hover);
        root.style.setProperty(
          '--interactive-active',
          theme.interactive.active
        );
        root.style.setProperty('--interactive-focus', theme.interactive.focus);
        root.style.setProperty(
          '--interactive-disabled',
          theme.interactive.disabled
        );

        // Shadows
        root.style.setProperty('--shadow-small', theme.shadow.small);
        root.style.setProperty('--shadow-medium', theme.shadow.medium);
        root.style.setProperty('--shadow-large', theme.shadow.large);
        root.style.setProperty('--shadow-glow', theme.shadow.glow);

        // Gradients
        root.style.setProperty('--gradient-primary', gradients.primary);
        root.style.setProperty('--gradient-card', gradients.card);
        root.style.setProperty('--gradient-card-2', gradients.card2);

        root.style.setProperty('--gradient-hero', gradients.hero);
        root.style.setProperty('--gradient-overlay', gradients.overlay);

        // Update data attribute for CSS selectors
        root.setAttribute('data-theme', mode);
      },
    }),
    {
      name: 'classical-music-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on page load
        if (state?.applyTheme && state?.mode) {
          state.applyTheme(state.mode);
        }
      },
    }
  )
);

// Hook for theme initialization
export const useThemeInitializer = () => {
  const { mode, applyTheme } = useThemeStore();

  // Apply theme on mount
  React.useEffect(() => {
    applyTheme(mode);

    // eslint-disable-next-line
  }, []);

  // Handle system theme preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Optional: automatically follow system preference
      // if user hasn't manually set a preference
      const hasUserPreference = localStorage.getItem('classical-music-theme');
      if (!hasUserPreference) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);
};
