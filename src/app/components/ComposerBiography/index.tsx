// ComposerBiography.tsx - ATUALIZADO com hook de controle de idioma
'use client';

import { useState, useEffect } from 'react';
import {
  FiRefreshCw,
  FiAlertCircle,
  FiX,
  FiGlobe,
  FiZap,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { useTranslation } from '@/app/context/TranslationContext';
import { useLanguageWithRefresh } from '@/app/stores/useLanguageStore';
import { useBiographyWithLanguage } from '@/app/hooks/useBiographyWithLanguage';

interface ComposerBiographyProps {
  composerId: string;
  initialBio?: string;
}

export default function ComposerBiography({
  composerId,
  initialBio,
}: ComposerBiographyProps) {
  // ✅ Usar o novo hook que controla mudanças de idioma
  const {
    biography,
    isGenerating,
    error,
    warning,
    metadata,
    generateBiography,
    clearError,
    refreshBiography, // ✅ Nova função de refresh
  } = useBiographyWithLanguage(composerId, initialBio);

  const { t } = useTranslation({ sections: ['pages/composerId'] });
  const { language } = useLanguageWithRefresh();

  // Estado local para controlar a biografia exibida
  const [displayBio, setDisplayBio] = useState(initialBio || '');

  // ✅ Atualizar biografia quando o hook retornar nova biografia
  useEffect(() => {
    if (biography) {
      setDisplayBio(biography);
    } else if (!biography && !isGenerating && !error) {
      // Se não tem biografia e não está gerando nem com erro, manter inicial
      setDisplayBio(initialBio || '');
    }
  }, [biography, initialBio, isGenerating, error]);

  // Função para tentar novamente manualmente
  const handleRetry = () => {
    clearError();
    generateBiography();
  };

  // Função para forçar refresh manual (botão opcional)
  const handleManualRefresh = () => {
    refreshBiography();
  };

  // Renderizar estado de loading
  if (isGenerating) {
    return (
      <div className="space-y-6">
        {/* Skeleton animado da biografia */}
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-4 bg-gradient-to-r from-theme-elevated via-interactive-hover to-theme-elevated rounded-full animate-shimmer"
              style={{
                width: `${Math.random() * 30 + 70}%`,
                animationDelay: `${index * 0.1}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Indicadores de progresso */}
        <div className="flex items-center justify-center space-x-6 pt-4">
          <div className="flex items-center space-x-2 text-accent-green">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            <span className="text-xs">
              {language === 'pt' ? t('loading') : 'Generating biography...'}
            </span>
          </div>
          {language === 'en' && (
            <div className="flex items-center space-x-2 text-accent-blue">
              <FiGlobe className="w-3 h-3 animate-spin" />
              <span className="text-xs">Translating...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mostrar erro apenas se não conseguiu gerar E não tem biografia
  if (error && !displayBio) {
    return (
      <div className="rounded-2xl p-6 flex justify-center shadow-theme-medium">
        <div className="flex flex-col gap-4 items-center space-x-4">
          <div className="w-10 h-10 bg-accent-red/20 border border-accent-red/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiAlertCircle className="w-5 h-5 text-accent-red" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FiX className="w-4 h-4 text-accent-red" />
              <p className="text-accent-red font-semibold">
                {t('error_generating_bio')}
              </p>
            </div>
            <p className="text-accent-red/80 text-sm mb-4 leading-relaxed">
              {error}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="btn-classical-secondary flex items-center space-x-2 group"
              >
                <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>{t('try_again')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none relative">
      {/* ✅ Badge de informações sobre a biografia com refresh manual */}
      {(metadata?.isGenerated || metadata?.isTranslated) && (
        <div className="flex items-center justify-between mb-6 p-3 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/30 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-accent-green/20 border border-accent-green/40 rounded-lg flex items-center justify-center">
              {metadata?.isTranslated ? (
                <FiGlobe className="w-3 h-3 text-accent-green" />
              ) : (
                <FiZap className="w-3 h-3 text-accent-green" />
              )}
            </div>
            <span className="text-accent-green text-sm font-medium">
              {metadata?.isTranslated
                ? `Biography translated to ${
                    language === 'pt' ? 'Portuguese' : 'English'
                  }`
                : 'AI-generated biography'}
              {metadata?.isFromCache && ' (cached)'}
            </span>
          </div>

          {/* ✅ Botão de refresh manual opcional */}
          <button
            onClick={handleManualRefresh}
            disabled={isGenerating}
            className="ml-2 p-1 rounded-md hover:bg-accent-green/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh biography"
          >
            <FiRefreshCw
              className={`w-3 h-3 text-accent-green ${
                isGenerating ? 'animate-spin' : 'hover:rotate-180'
              } transition-transform duration-500`}
            />
          </button>
        </div>
      )}

      {/* Warning se houver fallback */}
      {warning && (
        <div className="mb-6 p-3 bg-gradient-to-r from-accent-orange/10 to-accent-red/10 border border-accent-orange/30 rounded-xl">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="w-4 h-4 text-accent-orange" />
            <span className="text-accent-orange text-sm font-medium">
              {warning}
            </span>
          </div>
        </div>
      )}

      {/* ✅ Mostrar erro como warning se tiver biografia para fallback */}
      {error && displayBio && (
        <div className="mb-6 p-3 bg-gradient-to-r from-accent-orange/10 to-accent-red/10 border border-accent-orange/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="w-4 h-4 text-accent-orange" />
              <span className="text-accent-orange text-sm font-medium">
                Translation error - showing previous version
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="text-xs px-2 py-1 bg-accent-orange/20 text-accent-orange rounded hover:bg-accent-orange/30 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo da biografia */}
      <div className="relative">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gradient opacity-5 rounded-full blur-3xl"></div>

        <div className="relative z-10 break-all whitespace-pre-line text-theme-secondary leading-relaxed text-base classical-body">
          {displayBio.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 animate-fade-in-up">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Gradient fade no final */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-theme-primary to-transparent pointer-events-none"></div>
      </div>

      {/* Linha decorativa */}
      <div className="mt-6 pt-6 border-t border-theme-secondary">
        <div className="flex items-center justify-center space-x-2 text-theme-tertiary">
          <div className="w-1 h-1 bg-brand-primary rounded-full animate-pulse"></div>
          <GiMusicalNotes className="w-4 h-4" />
          <div
            className="w-1 h-1 bg-brand-primary rounded-full animate-pulse"
            style={{ animationDelay: '0.5s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
