// ComposerBiography.tsx - ATUALIZADO com hook de controle de idioma
'use client';

import { useState, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiMusicNotes,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import { useBiographyWithLanguage } from '@/app/hooks/useBiographyWithLanguage';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
    generateBiography,
    clearError,
  } = useBiographyWithLanguage(composerId, initialBio);

  const { t } = useTranslation({ sections: ['pages/composerId'] });

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

  // Renderizar estado de loading
  if (isGenerating) {
    return (
      <Stack gap={6}>
        {/* Skeleton animado da biografia */}
        <Stack>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-4 rounded-full animate-shimmer"
              style={{
                width: `${Math.random() * 30 + 70}%`,
                animationDelay: `${index * 0.1}s`,
              }}
            ></div>
          ))}
        </Stack>

        {/* Indicadores de progresso */}
        {/* <div className="flex items-center justify-center space-x-6 pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse"></div>
            <span className="text-xs">
              {language === 'pt' ? t('loading') : 'Generating biography...'}
            </span>
          </div>
          {language === 'en' && (
            <div className="flex items-center space-x-2">
              <FiGlobe className="w-3 h-3 animate-spin" />
              <span className="text-xs">Translating...</span>
            </div>
          )}
        </div> */}
      </Stack>
    );
  }

  // Mostrar erro apenas se não conseguiu gerar E não tem biografia
  if (error && !displayBio) {
    return (
      <div className="rounded-2xl p-6 flex justify-center">
        <div className="flex flex-col gap-4 justify-center items-center space-x-4">
          <div className="w-10 h-10 border rounded-xl flex items-center justify-center flex-shrink-0">
            <PiWarningCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 items-center justify-center">
            <Inline gap={2} className="mb-2">
              <PiX className="w-4 h-4" />
              <p className="font-semibold">{t('error_generating_bio')}</p>
            </Inline>

            <div className="flex justify-center mt-4 gap-2">
              <Inline
                as="button"
                gap={2}
                onClick={handleRetry}
                className="btn-classical-secondary group"
              >
                <PiArrowsClockwise className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>{t('try_again')}</span>
              </Inline>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none relative">
      {/* ✅ Badge de informações sobre a biografia com refresh manual */}
      {/* {(metadata?.isGenerated || metadata?.isTranslated) && (
        <div className="flex items-center justify-between mb-6 p-3 border rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border rounded-lg flex items-center justify-center">
              {metadata?.isTranslated ? (
                <FiGlobe className="w-3 h-3" />
              ) : (
                <FiZap className="w-3 h-3" />
              )}
            </div>
            <span className="text-sm font-medium">
              {metadata?.isTranslated
                ? `Biography translated to ${
                    language === 'pt' ? 'Portuguese' : 'English'
                  }`
                : 'AI-generated biography'}
              {metadata?.isFromCache && ' (cached)'}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isGenerating}
            className="ml-2 p-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh biography"
          >
            <PiArrowsClockwise
              className={`w-3 h-3 ${
 isGenerating ?'animate-spin':'hover:rotate-180'
 } transition-transform duration-500`}
            />
          </button>
        </div>
      )} */}

      {/* Warning se houver fallback */}
      {warning && (
        <div className="mb-6 p-3 border rounded-xl">
          <Inline gap={2}>
            <PiWarningCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{warning}</span>
          </Inline>
        </div>
      )}

      {/* ✅ Mostrar erro como warning se tiver biografia para fallback */}
      {error && displayBio && (
        <div className="mb-6 p-3 border rounded-xl">
          <div className="flex items-center justify-between">
            <Inline gap={2}>
              <PiWarningCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Translation error - showing previous version
              </span>
            </Inline>
            <button
              onClick={handleRetry}
              className="text-xs px-2 py-1 rounded transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo da biografia */}
      <div className="relative">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl"></div>

        <Text
          papel="corpo"
          tom="suave"
          as="div"
          className="relative z-10 break-all whitespace-pre-line leading-relaxed classical-body"
        >
          {displayBio.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 animate-fade-in-up">
              {paragraph}
            </p>
          ))}
        </Text>

        {/* Gradient fade no final */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t to-transparent pointer-events-none"></div>
      </div>

      {/* Linha decorativa */}
      <div className="mt-6 pt-6 border-t border-theme-secondary">
        <Inline gap={2} className="justify-center text-theme-tertiary">
          <div className="w-1 h-1 rounded-full animate-pulse"></div>
          <PiMusicNotes className="w-4 h-4" />
          <div
            className="w-1 h-1 rounded-full animate-pulse"
            style={{ animationDelay: '0.5s' }}
          ></div>
        </Inline>
      </div>
    </div>
  );
}
