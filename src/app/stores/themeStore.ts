// stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';
import { THEME_CONFIG, THEME_GRADIENTS, ThemeMode } from '../thema';

interface ThemeState {
  mode: ThemeMode;
  isTransitioning: boolean;
  hasUserPreference: boolean; // 🆕 Flag para indicar se usuário fez escolha manual
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode, isUserChoice?: boolean) => void;
  applyTheme: (mode: ThemeMode) => void;
  initializeFromSystem: () => void; // 🆕 Método para inicializar do sistema
}

// Função para detectar tema do sistema
function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// Função para aplicar tema imediatamente (evita flash)
function applyThemeImmediate(mode: ThemeMode) {
  if (typeof document === 'undefined') return;

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
  root.style.setProperty('--interactive-active', theme.interactive.active);
  root.style.setProperty('--interactive-focus', theme.interactive.focus);
  root.style.setProperty('--interactive-disabled', theme.interactive.disabled);

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
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark', // Padrão temporário
      isTransitioning: false,
      hasUserPreference: false,

      toggleTheme: () => {
        const currentMode = get().mode;
        const newMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
        get().setTheme(newMode, true); // 🆕 Sempre marca como escolha do usuário
      },

      setTheme: (mode: ThemeMode, isUserChoice = true) => {
        const currentMode = get().mode;
        const currentHasUserPreference = get().hasUserPreference;

        if (currentMode !== mode || currentHasUserPreference !== isUserChoice) {
          set({ isTransitioning: true, hasUserPreference: isUserChoice });

          // Delay para transição suave apenas se é escolha do usuário
          const delay = isUserChoice ? 50 : 0;

          setTimeout(() => {
            get().applyTheme(mode);
            set({ mode, isTransitioning: false });
          }, delay);
        }
      },

      applyTheme: applyThemeImmediate,

      // 🆕 Método para inicializar do sistema
      initializeFromSystem: () => {
        const { hasUserPreference } = get();

        // Se usuário já fez uma escolha manual, não alterar
        if (hasUserPreference) return;

        const systemTheme = getSystemTheme();
        const currentTheme = get().mode;

        // Se o tema do sistema é diferente do atual, atualizar
        if (systemTheme !== currentTheme) {
          get().setTheme(systemTheme, false);
        }
      },
    }),
    {
      name: 'classical-music-theme',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          // Verificar se há uma preferência salva do usuário
          const savedData = localStorage.getItem('classical-music-theme');

          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              const savedHasUserPreference = parsed.state?.hasUserPreference;

              if (savedHasUserPreference) {
                // Se usuário fez escolha manual, usar ela
                if (state.applyTheme && state.mode) {
                  state.applyTheme(state.mode);
                }
              } else {
                // Se não há preferência do usuário, usar tema do sistema
                const systemTheme = getSystemTheme();
                state.setTheme(systemTheme, false);
              }
            } catch {
              // Se erro ao parsear, usar tema do sistema
              const systemTheme = getSystemTheme();
              state.setTheme(systemTheme, false);
            }
          } else {
            // Se não há dados salvos, usar tema do sistema
            const systemTheme = getSystemTheme();
            state.setTheme(systemTheme, false);
          }
        }
      },
    }
  )
);

// Hook for theme initialization
export const useThemeInitializer = () => {
  const { mode, applyTheme, initializeFromSystem } = useThemeStore();

  // Apply theme on mount
  React.useEffect(() => {
    applyTheme(mode);
    initializeFromSystem(); // 🆕 Inicializar do sistema se necessário
  }, []);

  // 🆕 Handle system theme preference changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const { hasUserPreference } = useThemeStore.getState();

      // Apenas seguir mudanças do sistema se usuário não fez escolha manual
      if (!hasUserPreference) {
        const newTheme = e.matches ? 'dark' : 'light';
        useThemeStore.getState().setTheme(newTheme, false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
};

// 🆕 Hook para facilitar o uso com informações extras
export const useTheme = () => {
  const { mode, toggleTheme, setTheme, isTransitioning, hasUserPreference } =
    useThemeStore();

  return {
    mode,
    toggleTheme,
    setTheme: (mode: ThemeMode) => setTheme(mode, true), // Sempre marca como escolha do usuário
    isTransitioning,
    hasUserPreference, // 🆕 Exposar flag
    isDark: mode === 'dark',
    isLight: mode === 'light',
    isSystemControlled: !hasUserPreference, // 🆕 Indica se está seguindo o sistema
  };
};
