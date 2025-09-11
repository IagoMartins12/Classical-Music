'use client';

import { useLanguageWithRefresh } from '@/app/stores/useLanguageStore';
import React from 'react';
import { FiGlobe } from 'react-icons/fi';
import { TranslationLoadingModal } from '../TranslationLoadingModal';

interface LanguageToggleProps {
  variant?: 'default' | 'compact' | 'navbar' | 'globe';
  showLabel?: boolean;
  showSystemIndicator?: boolean; // 🆕 Mostrar se está seguindo o sistema
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'default',
  showLabel = false,
  showSystemIndicator = false, // 🆕 Padrão false para não quebrar componentes existentes
  className = '',
}) => {
  const {
    language,
    toggleLanguage,
    isTranslating,
    onModalComplete,
    hasUserPreference, // 🆕 Nova propriedade
  } = useLanguageWithRefresh();

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'w-10 h-10 p-2';
      case 'navbar':
        return 'w-9 h-9 p-1.5';
      case 'globe':
        return 'w-10 h-10 p-2';
      default:
        return 'w-12 h-12 p-2.5';
    }
  };

  const getFlagSize = () => {
    switch (variant) {
      case 'compact':
      case 'navbar':
        return 'text-sm'; // ~14px
      case 'globe':
        return 'text-base'; // ~16px
      default:
        return 'text-lg'; // ~18px
    }
  };

  const getGlobeIconSize = () => {
    switch (variant) {
      case 'compact':
      case 'navbar':
        return 'w-5 h-5';
      case 'globe':
        return 'w-6 h-6';
      default:
        return 'w-6 h-6';
    }
  };

  const getCurrentFlag = () => {
    if (variant === 'globe') {
      return (
        <div className="relative flex items-center justify-center">
          <FiGlobe
            className={`${getGlobeIconSize()} text-brand-primary transition-all duration-300`}
          />
          <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3 h-3 bg-theme-elevated rounded-full border border-theme-secondary">
            <span className="text-xs leading-none">
              {language === 'pt' ? '🇧🇷' : '🇺🇸'}
            </span>
          </div>
        </div>
      );
    }

    // Usar a mesma estrutura do ThemeToggle com container centralizado
    return (
      <div className="relative flex items-center justify-center">
        {/* Bandeira PT */}
        <span
          className={`
            ${getFlagSize()}
            absolute
            transition-all duration-500
            ${
              language === 'pt'
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 rotate-180 scale-50'
            }
          `}
          style={{
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🇧🇷
        </span>

        {/* Bandeira US */}
        <span
          className={`
            ${getFlagSize()}
            absolute
            transition-all duration-500
            ${
              language === 'en'
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-180 scale-50'
            }
          `}
          style={{
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🇺🇸
        </span>
      </div>
    );
  };

  const getLanguageLabel = () => {
    const baseLabel = language === 'pt' ? 'Português' : 'English';

    // 🆕 Adicionar indicador se está seguindo o sistema
    if (showSystemIndicator && !hasUserPreference) {
      return `${baseLabel} (Sistema)`;
    }

    return baseLabel;
  };

  return (
    <>
      {/* Modal de tradução */}
      <TranslationLoadingModal
        isOpen={isTranslating}
        currentLanguage={language}
        onComplete={onModalComplete}
      />

      {/* Toggle button */}
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-theme-secondary text-sm font-medium">
            {getLanguageLabel()}
          </span>
        )}

        <button
          onClick={toggleLanguage}
          disabled={isTranslating}
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
            ${isTranslating ? 'animate-pulse cursor-wait' : ''}
          `}
          aria-label={`Alterar para ${
            language === 'pt' ? 'inglês' : 'português'
          }`}
          title={`Trocar para ${language === 'pt' ? 'English' : 'Português'}`}
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" />

          {/* Flag container - mesma estrutura do ThemeToggle */}
          {getCurrentFlag()}

          {/* Loading indicator */}
          {isTranslating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 🆕 Indicador de sistema (apenas se showSystemIndicator = true) */}
          {showSystemIndicator && !hasUserPreference && (
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-accent-blue rounded-full opacity-75 animate-pulse" />
          )}

          {/* Subtle animation indicator */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
        </button>
      </div>
    </>
  );
};

// Versão alternativa com ícone de globo e dropdown
export const LanguageDropdown: React.FC<{
  className?: string;
  showSystemIndicator?: boolean; // 🆕
}> = ({ className = '', showSystemIndicator = false }) => {
  const { language, changeLanguage, hasUserPreference } =
    useLanguageWithRefresh();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    {
      code: 'pt' as const,
      name: 'Português',
      flag: '🇧🇷',
    },
    {
      code: 'en' as const,
      name: 'English',
      flag: '🇺🇸',
    },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-theme-elevated border border-theme-primary rounded-lg hover:bg-interactive-hover transition-colors duration-200 disabled:opacity-50"
      >
        <div className="relative">
          <FiGlobe className="w-4 h-4 text-brand-primary" />
          {/* 🆕 Indicador de sistema */}
          {showSystemIndicator && !hasUserPreference && (
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent-blue rounded-full opacity-75" />
          )}
        </div>
        {currentLanguage && (
          <>
            {currentLanguage.flag}
            <span className="text-sm font-medium text-theme-primary hidden sm:block">
              {currentLanguage.name}
              {/* 🆕 Mostrar (Sistema) se aplicável */}
              {showSystemIndicator && !hasUserPreference && (
                <span className="text-xs text-theme-tertiary ml-1">
                  (Sistema)
                </span>
              )}
            </span>
          </>
        )}
        <svg
          className={`w-3 h-3 text-theme-tertiary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 bg-theme-tertiary border border-theme-secondary rounded-lg shadow-xl z-20 overflow-hidden min-w-[140px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-interactive-hover transition-colors duration-200
                  ${
                    lang.code === language
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-theme-primary'
                  }
                `}
              >
                {lang.flag}
                <span className="font-medium">{lang.name}</span>
                {lang.code === language && (
                  <div className="ml-auto w-2 h-2 bg-brand-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
