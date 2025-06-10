// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS custom properties
        theme: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
          overlay: 'var(--bg-overlay)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          50: '#fefdf7',
          100: '#fdf9e8',
          200: '#faf0c5',
          300: '#f5e297',
          400: '#edcf67',
          500: 'var(--brand-primary)', // #d4af37
          600: '#c49b3d',
          700: '#a67f35',
          800: '#896633',
          900: '#72542d',
          950: '#432e15',
        },
        accent: {
          gold: 'var(--accent-gold)',
          amber: 'var(--accent-amber)',
          purple: 'var(--accent-purple)',
          blue: 'var(--accent-blue)',
          green: 'var(--accent-green)',
          red: 'var(--accent-red)',
        },
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          accent: 'var(--border-accent)',
        },
        interactive: {
          hover: 'var(--interactive-hover)',
          active: 'var(--interactive-active)',
          focus: 'var(--interactive-focus)',
          disabled: 'var(--interactive-disabled)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-overlay': 'var(--gradient-overlay)',
        'gradient-brand': 'var(--brand-gradient)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-small)',
        'theme-md': 'var(--shadow-medium)',
        'theme-lg': 'var(--shadow-large)',
        'theme-glow': 'var(--shadow-glow)',
        'brand-glow': '0 0 20px var(--brand-primary)',
        'brand-glow-lg': '0 0 40px var(--brand-primary)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
        classical: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.4s ease-out forwards',
        shimmer: 'shimmer 2s infinite',
        glow: 'glow 2s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInScale: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px var(--brand-primary)',
          },
          '50%': {
            boxShadow: '0 0 40px var(--brand-primary)',
          },
        },
        bounceGentle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Plugin personalizado para utilitários de tema
    //@ts-ignore
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Backgrounds temáticos
        '.bg-theme-primary': {
          backgroundColor: 'var(--bg-primary)',
        },
        '.bg-theme-secondary': {
          backgroundColor: 'var(--bg-secondary)',
        },
        '.bg-theme-tertiary': {
          backgroundColor: 'var(--bg-tertiary)',
        },
        '.bg-theme-elevated': {
          backgroundColor: 'var(--bg-elevated)',
        },

        // Textos temáticos
        '.text-theme-primary': {
          color: 'var(--text-primary)',
        },
        '.text-theme-secondary': {
          color: 'var(--text-secondary)',
        },
        '.text-theme-tertiary': {
          color: 'var(--text-tertiary)',
        },
        '.text-theme-inverse': {
          color: 'var(--text-inverse)',
        },

        // Bordas temáticas
        '.border-theme-primary': {
          borderColor: 'var(--border-primary)',
        },
        '.border-theme-secondary': {
          borderColor: 'var(--border-secondary)',
        },
        '.border-theme-accent': {
          borderColor: 'var(--border-accent)',
        },

        // Sombras temáticas
        '.shadow-theme-sm': {
          boxShadow: 'var(--shadow-small)',
        },
        '.shadow-theme-md': {
          boxShadow: 'var(--shadow-medium)',
        },
        '.shadow-theme-lg': {
          boxShadow: 'var(--shadow-large)',
        },
        '.shadow-theme-glow': {
          boxShadow: 'var(--shadow-glow)',
        },

        // Gradientes de texto
        '.text-gradient-brand': {
          background: 'var(--brand-gradient)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          display: 'inline-block',
        },

        // Transições suaves
        '.transition-theme': {
          transition: 'var(--transition-theme)',
        },
        '.transition-smooth': {
          transition: 'var(--transition-smooth)',
        },
        '.transition-fast': {
          transition: 'var(--transition-fast)',
        },
        '.transition-slow': {
          transition: 'var(--transition-slow)',
        },

        // Glass effect
        '.glass': {
          backgroundColor: 'var(--bg-elevated)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-primary)',
        },

        // Card variants
        '.card-classical': {
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-primary)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1.5rem',
          transition: 'var(--transition-smooth)',
        },

        '.card-classical:hover': {
          borderColor: 'var(--border-accent)',
          boxShadow: 'var(--shadow-glow)',
          transform: 'translateY(-2px)',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

export default config;
