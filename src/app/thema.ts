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

  light: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.4)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
    },
    brand: {
      primary: '#c49b3d',
      secondary: '#d97706',
      gradient: 'linear-gradient(135deg, #c49b3d 0%, #d97706 100%)',
    },
    accent: {
      gold: '#c49b3d',
      amber: '#d97706',
      purple: '#7c3aed',
      blue: '#2563eb',
      green: '#059669',
      red: '#dc2626',
    },
    border: {
      primary: 'rgba(196, 155, 61, 0.3)',
      secondary: 'rgba(71, 85, 105, 0.2)',
      accent: '#c49b3d',
    },
    interactive: {
      hover: 'rgba(196, 155, 61, 0.1)',
      active: 'rgba(196, 155, 61, 0.2)',
      focus: 'rgba(196, 155, 61, 0.3)',
      disabled: 'rgba(100, 116, 139, 0.3)',
    },
    shadow: {
      small: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
      large: '0 8px 25px rgba(0, 0, 0, 0.15)',
      glow: '0 4px 20px rgba(196, 155, 61, 0.25)',
    },
  },
};

// Gradients específicos para cada tema
export const THEME_GRADIENTS = {
  dark: {
    primary: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    card: 'linear-gradient(135deg, rgba(45, 55, 72, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)',
    card2:
      'linear-gradient(90deg, rgba(51, 65, 85, 0.3) 0%, rgba(30, 41, 59, 0.3) 50%, rgba(51, 65, 85, 0.3) 100%)',

    hero: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    overlay:
      'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
  },
  light: {
    primary: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
    card: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
    card2:
      'linear-gradient(90deg, rgba(241, 245, 249, 0.3) 0%, rgba(226, 232, 240, 0.3) 50%, rgba(241, 245, 249, 0.3) 100%)',
    hero: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    overlay:
      'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
  },
};
