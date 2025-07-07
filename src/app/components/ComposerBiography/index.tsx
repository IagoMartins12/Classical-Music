// ComposerBiography.tsx - Premium version with theme system
'use client';

import { useBiographyGenerator } from '@/app/hooks/useBiographyGenerator';
import { useState, useEffect, useRef } from 'react';
import {
  FiRefreshCw,
  FiAlertCircle,
  FiBookOpen,
  FiZap,
  FiX,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';

interface ComposerBiographyProps {
  composerId: string;
  initialBio?: string;
  composerName: string;
}

export default function ComposerBiography({
  composerId,
  initialBio,
  composerName,
}: ComposerBiographyProps) {
  const [displayBio, setDisplayBio] = useState(initialBio || '');
  const { biography, isGenerating, error, generateBiography } =
    useBiographyGenerator();

  // Usar refs para controlar se já tentamos gerar e evitar loops
  const hasTriedGeneration = useRef(false);
  const lastComposerId = useRef(composerId);

  // Reset quando trocar de compositor
  useEffect(() => {
    if (lastComposerId.current !== composerId) {
      hasTriedGeneration.current = false;
      lastComposerId.current = composerId;
      setDisplayBio(initialBio || '');
    }
  }, [composerId, initialBio]);

  // Verificar se precisa gerar biografia automaticamente - APENAS UMA VEZ
  useEffect(() => {
    const shouldGenerateBio = !initialBio || initialBio.trim().length < 50;

    if (
      shouldGenerateBio &&
      !isGenerating &&
      !biography &&
      !hasTriedGeneration.current &&
      !error // Não tentar se já deu erro
    ) {
      hasTriedGeneration.current = true;
      console.log(
        `Iniciando geração automática para compositor: ${composerId}`
      );
      generateBiography(composerId);
    }
  }, [
    composerId,
    initialBio,
    isGenerating,
    biography,
    generateBiography,
    error,
  ]);

  // Atualizar biografia quando gerada
  useEffect(() => {
    if (biography) {
      setDisplayBio(biography);
    }
  }, [biography]);

  // Função para tentar novamente manualmente
  const handleRetry = () => {
    hasTriedGeneration.current = false; // Reset para permitir nova tentativa
    generateBiography(composerId);
  };

  if (isGenerating) {
    return (
      <div className="space-y-6">
        {/* Header do loading */}
        {/* <div className="flex items-center justify-center space-x-3 p-6  rounded-2xl">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
              style={{
                animationDirection: 'reverse',
                animationDuration: '1.5s',
              }}
            ></div>
          </div>
          <div className="text-center">
            <p className="text-theme-primary font-semibold">
              Gerando biografia para {composerName}...
            </p>
            <p className="text-theme-tertiary text-sm">
              Analisando dados históricos e musicais
            </p>
          </div>
          <FiZap className="w-6 h-6 text-brand-primary animate-pulse" />
        </div> */}

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
            <span className="text-xs">Buscando dados</span>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar erro apenas se não conseguiu gerar E não tem biografia
  if (error) {
    return (
      <div className=" rounded-2xl p-6 flex justify-center  shadow-theme-medium">
        <div className="flex flex-col gap-4 items-center space-x-4">
          <div className="w-10 h-10 bg-accent-red/20 border border-accent-red/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiAlertCircle className="w-5 h-5 text-accent-red" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FiX className="w-4 h-4 text-accent-red" />
              <p className="text-accent-red font-semibold">
                Erro ao gerar biografia
              </p>
            </div>
            <p className="text-accent-red/80 text-sm mb-4 leading-relaxed">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="btn-classical-secondary flex items-center space-x-2 group"
            >
              <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Tentar novamente</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none relative">
      {/* Badge de biografia gerada por IA (se foi gerada) */}
      {/* {biography && (
        <div className="flex items-center justify-between mb-6 p-3 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/30 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-accent-green/20 border border-accent-green/40 rounded-lg flex items-center justify-center">
              <FiCheck className="w-3 h-3 text-accent-green" />
            </div>
            <span className="text-accent-green text-sm font-medium">
              Biografia gerada por IA
            </span>
          </div>
          <FiZap className="w-4 h-4 text-accent-green" />
        </div>
      )} */}

      {/* Conteúdo da biografia */}
      <div className="relative">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gradient opacity-5 rounded-full blur-3xl"></div>

        <div className="relative z-10 whitespace-pre-line text-theme-secondary leading-relaxed text-base classical-body">
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
