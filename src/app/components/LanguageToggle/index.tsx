'use client';

import {
  useLanguageStore,
  useLanguageWithRefresh,
} from '@/app/stores/useLanguageStore';
import React from 'react';
import { PiGlobe } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface LanguageToggleProps {
  variant?: 'default' | 'compact' | 'navbar' | 'globe';
  showLabel?: boolean;
  showSystemIndicator?: boolean; // 🆕 Mostrar se está seguindo o sistema
  className?: string;
  /**
   * Troca de idioma por rota (o blog vai de `/blog` a `/en/blog`). Sem ela,
   * a troca grava o cookie e recarrega a página no mesmo endereço.
   */
  aoTrocar?: (idioma: 'pt' | 'en') => void;
  /** O idioma da página, quando ele vem do endereço (ver `aoTrocar`). */
  idioma?: 'pt' | 'en';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'default',
  showLabel = false,
  showSystemIndicator = false, // 🆕 Padrão false para não quebrar componentes existentes
  className = '',
  aoTrocar,
  idioma: idiomaForcado,
}) => {
  const {
    language: idiomaDoStore,
    toggleLanguage: recarregarNoOutroIdioma,
    isTranslating,
    hasUserPreference, // 🆕 Nova propriedade
  } = useLanguageWithRefresh();
  const setTranslating = useLanguageStore((s) => s.setTranslating);
  const setStoreLanguage = useLanguageStore((s) => s.setLanguage);
  // Com troca por rota, quem manda é o endereço: `/en/blog` é inglês mesmo
  // que o cookie diga outra coisa.
  const language = idiomaForcado ?? idiomaDoStore;
  const toggleLanguage = () => {
    if (!aoTrocar) return recarregarNoOutroIdioma();
    const novo = language === 'pt' ? 'en' : 'pt';
    setTranslating(true);
    setStoreLanguage(novo, true);
    aoTrocar(novo);
  };

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
          <PiGlobe
            className={`${getGlobeIconSize()} text-ouro-texto transition-all duration-300`}
          />
          <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3 h-3 bg-theme-elevated rounded-full">
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
      {/* O aviso de "traduzindo" é desenhado uma vez só, na raiz
          (`TranslationLoadingGate`): este componente aparece duas vezes no
          Navbar e cada cópia abria o seu. */}

      {/* Toggle button */}
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <Text papel="rotulo" tom="suave" className="font-medium">
            {getLanguageLabel()}
          </Text>
        )}

        <button
          onClick={toggleLanguage}
          disabled={isTranslating}
          className={`
            ${getVariantClasses()}
            relative fundo-sup-2 border border-linha-forte rounded-xl active:scale-95 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isTranslating ? 'animate-pulse cursor-wait' : ''}
          `}
          aria-label={`Alterar para ${
            language === 'pt' ? 'inglês' : 'português'
          }`}
          title={`Trocar para ${language === 'pt' ? 'English' : 'Português'}`}
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" />

          {/* Flag container - mesma estrutura do ThemeToggle */}
          {getCurrentFlag()}

          {/* Loading indicator */}
          {isTranslating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
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
      <Inline
        as="button"
        gap={2}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-theme-elevated rounded-lg transition-colors duration-200 disabled:opacity-50"
      >
        <div className="relative">
          <PiGlobe className="w-4 h-4 text-ouro-texto" />
          {/* 🆕 Indicador de sistema */}
          {showSystemIndicator && !hasUserPreference && (
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full opacity-75" />
          )}
        </div>
        {currentLanguage && (
          <>
            {currentLanguage.flag}
            <Text
              papel="rotulo"
              tom="forte"
              className="font-medium hidden sm:block"
            >
              {currentLanguage.name}
              {/* 🆕 Mostrar (Sistema) se aplicável */}
              {showSystemIndicator && !hasUserPreference && (
                <Text papel="legenda" tom="fraco" className="ml-1">
                  (Sistema)
                </Text>
              )}
            </Text>
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
      </Inline>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 bg-theme-tertiary rounded-lg shadow-xl z-menu overflow-hidden min-w-[140px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center space-x-3 w-full px-4 py-3 text-left transition-colors duration-200
                  ${
                    lang.code === language
                      ? 'text-ouro-texto'
                      : 'text-theme-primary'
                  }
                `}
              >
                {lang.flag}
                <span className="font-medium">{lang.name}</span>
                {lang.code === language && (
                  <div className="ml-auto w-2 h-2 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
