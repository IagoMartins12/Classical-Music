// types/theme.ts
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };

  // Text Colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  // Brand Colors
  brand: {
    primary: string;
    secondary: string;
    gradient: string;
  };

  // Accent Colors
  accent: {
    gold: string;
    amber: string;
    purple: string;
    blue: string;
    green: string;
    red: string;
  };

  // UI Elements
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Interactive States
  interactive: {
    hover: string;
    active: string;
    focus: string;
    disabled: string;
  };

  // Shadows
  shadow: {
    small: string;
    medium: string;
    large: string;
    glow: string;
  };
}

// config/theme.ts
export const THEME_CONFIG: Record<ThemeMode, ThemeColors> = {
  // DARK MODE - MANTIDO EXATAMENTE COMO ESTAVA
  dark: {
    background: {
      primary: '#0a0a0a',
      secondary: '#1a1a2e',
      tertiary: '#16213e',
      elevated: '#2d3748',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e5e7eb',
      tertiary: '#9ca3af',
      inverse: '#0a0a0a',
    },
    brand: {
      primary: '#d4af37',
      secondary: '#fbbf24',
      gradient: 'linear-gradient(135deg, #d4af37 0%, #fbbf24 100%)',
    },
    accent: {
      gold: '#d4af37',
      amber: '#fbbf24',
      purple: '#6366f1',
      blue: '#3b82f6',
      green: '#10b981',
      red: '#ef4444',
    },
    border: {
      primary: 'rgba(212, 175, 55, 0.2)',
      secondary: 'rgba(229, 231, 235, 0.1)',
      accent: '#d4af37',
    },
    interactive: {
      hover: 'rgba(212, 175, 55, 0.1)',
      active: 'rgba(212, 175, 55, 0.2)',
      focus: 'rgba(212, 175, 55, 0.3)',
      disabled: 'rgba(156, 163, 175, 0.3)',
    },
    shadow: {
      small: '0 4px 6px rgba(0, 0, 0, 0.3)',
      medium: '0 8px 32px rgba(0, 0, 0, 0.3)',
      large: '0 20px 40px rgba(0, 0, 0, 0.4)',
      glow: '0 8px 32px rgba(212, 175, 55, 0.2)',
    },
  },

  // LIGHT MODE - APRIMORADO E MAIS ELEGANTE
  light: {
    background: {
      primary: '#faf9f6', // Cream muito suave em vez de branco puro
      secondary: '#f4f1eb', // Tom de papel antigo
      tertiary: '#ede8df', // Pergaminho suave
      elevated: '#ffffff', // Branco para elementos elevados
      overlay: 'rgba(45, 42, 35, 0.75)', // Overlay mais elegante
    },
    text: {
      primary: '#2d2a23', // Marrom escuro elegante em vez de preto
      secondary: '#4a453c', // Tom intermediário aquecido
      tertiary: '#6b6358', // Cinza aquecido
      inverse: '#faf9f6', // Cream para texto em backgrounds escuros
    },
    brand: {
      primary: '#b8941f', // Dourado mais profundo e elegante
      secondary: '#d4af37', // Dourado clássico
      gradient:
        'linear-gradient(135deg, #b8941f 0%, #d4af37 50%, #e6c554 100%)',
    },
    accent: {
      gold: '#b8941f',
      amber: '#d4af37',
      purple: '#5b21b6', // Roxo mais profundo
      blue: '#1e40af', // Azul mais elegante
      green: '#059669', // Verde mais sofisticado
      red: '#dc2626', // Vermelho mais refinado
    },
    border: {
      primary: 'rgba(184, 148, 31, 0.25)', // Dourado suave
      secondary: 'rgba(107, 99, 88, 0.15)', // Cinza aquecido muito suave
      accent: '#b8941f', // Dourado para acentos
    },
    interactive: {
      hover: 'rgba(184, 148, 31, 0.08)', // Hover dourado muito suave
      active: 'rgba(184, 148, 31, 0.15)', // Active um pouco mais visível
      focus: 'rgba(184, 148, 31, 0.25)', // Focus bem visível
      disabled: 'rgba(107, 99, 88, 0.25)', // Disabled cinza aquecido
    },
    shadow: {
      small: '0 2px 8px rgba(45, 42, 35, 0.08)',
      medium: '0 8px 24px rgba(45, 42, 35, 0.12)',
      large: '0 16px 40px rgba(45, 42, 35, 0.15)',
      glow: '0 8px 32px rgba(184, 148, 31, 0.15)',
    },
  },
};

// Gradients específicos para cada tema
export const THEME_GRADIENTS = {
  // DARK MODE - MANTIDO EXATAMENTE COMO ESTAVA
  dark: {
    primary: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    card: 'linear-gradient(135deg, rgba(45, 55, 72, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)',
    card2:
      'linear-gradient(90deg, rgba(51, 65, 85, 0.3) 0%, rgba(30, 41, 59, 0.3) 50%, rgba(51, 65, 85, 0.3) 100%)',
    hero: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    overlay:
      'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
  },

  // LIGHT MODE - GRADIENTES ELEGANTES E CREMOSOS
  light: {
    primary: 'linear-gradient(135deg, #faf9f6 0%, #f4f1eb 50%, #ede8df 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(244, 241, 235, 0.6) 100%)',
    card2:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(244, 241, 235, 0.4) 50%, rgba(255, 255, 255, 0.4) 100%)',
    hero: 'linear-gradient(135deg, #faf9f6 0%, #f4f1eb 100%)',
    overlay:
      'linear-gradient(to bottom, transparent 0%, rgba(45, 42, 35, 0.4) 100%)',
  },
};
