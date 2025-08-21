'use client';

// 3. components/LanguageToggle.tsx - ATUALIZADO com Modal e Portal
// ===================================================================

'use client';

import { useLanguageWithRefresh } from '@/app/stores/useLanguageStore';
import React from 'react';
import { FiGlobe } from 'react-icons/fi';
import { TranslationLoadingModal } from '../TranslationLoadingModal';

interface LanguageToggleProps {
  variant?: 'default' | 'compact' | 'navbar' | 'globe';
  showLabel?: boolean;
  className?: string;
}

// Componentes de bandeira (mantém os mesmos)
const FlagBR: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <div
    className={`${className} relative overflow-hidden rounded border border-theme-secondary`}
  >
    <div className="absolute inset-0 bg-green-500" />
    <div
      className="absolute inset-0 bg-yellow-400"
      style={{ top: '30%', bottom: '30%' }}
    />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
  </div>
);

const FlagUS: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <div
    className={`${className} relative overflow-hidden rounded border border-theme-secondary`}
  >
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className={`absolute left-0 right-0 h-1/7 ${
          i % 2 === 0 ? 'bg-red-600' : 'bg-white'
        }`}
        style={{ top: `${(i / 7) * 100}%` }}
      />
    ))}
    <div className="absolute top-0 left-0 bg-blue-800 w-2/5 h-2/5" />
  </div>
);

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'default',
  showLabel = false,
  className = '',
}) => {
  const { language, toggleLanguage, isTranslating, onModalComplete } =
    useLanguageWithRefresh();

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

  const getIconSize = () => {
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
            className={`${getIconSize()} text-brand-primary transition-all duration-300`}
          />
          <div className="absolute -bottom-1 -right-1">
            {language === 'pt' ? (
              <FlagBR className="w-3 h-3" />
            ) : (
              <FlagUS className="w-3 h-3" />
            )}
          </div>
        </div>
      );
    }

    return language === 'pt' ? (
      <FlagBR className={getIconSize()} />
    ) : (
      <FlagUS className={getIconSize()} />
    );
  };

  const getLanguageLabel = () => {
    return language === 'pt' ? 'Português' : 'English';
  };

  return (
    <>
      {/* ✅ Modal de tradução com Portal e callback */}
      <TranslationLoadingModal
        isOpen={isTranslating}
        currentLanguage={language}
        onComplete={onModalComplete} // ✅ Callback para finalizar
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
            relative bg-theme-elevated border border-theme-primary rounded-xl 
            hover:border-theme-accent hover:bg-interactive-hover 
            active:scale-95 transition-all duration-300 group 
            disabled:opacity-50 disabled:cursor-not-allowed 
            focus:outline-none focus:ring-2 focus:ring-brand-primary/50 
            focus:ring-offset-2 focus:ring-offset-bg-primary
            ${isTranslating ? 'animate-pulse cursor-wait' : ''}
          `}
          aria-label={`Alterar para ${
            language === 'pt' ? 'inglês' : 'português'
          }`}
          title={`Trocar para ${language === 'pt' ? 'English' : 'Português'}`}
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" />

          {/* Flag/Globe container */}
          <div className="relative flex items-center justify-center">
            {getCurrentFlag()}
          </div>

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
}> = ({ className = '' }) => {
  const { language, changeLanguage } = useLanguageWithRefresh();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    {
      code: 'pt' as const,
      name: 'Português',
      flag: <FlagBR className="w-4 h-4" />,
    },
    {
      code: 'en' as const,
      name: 'English',
      flag: <FlagUS className="w-4 h-4" />,
    },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-theme-elevated border border-theme-primary rounded-lg hover:bg-interactive-hover transition-colors duration-200 disabled:opacity-50"
      >
        <FiGlobe className="w-4 h-4 text-brand-primary" />
        {currentLanguage && (
          <>
            {currentLanguage.flag}
            <span className="text-sm font-medium text-theme-primary hidden sm:block">
              {currentLanguage.name}
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
