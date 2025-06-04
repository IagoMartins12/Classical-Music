'use client';

import { useBiographyGenerator } from '@/app/hooks/useBiographyGenerator';
import { useState, useEffect, useRef } from 'react';

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
      <div className="space-y-4">
        <div className="flex items-center justify-center  space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Buscando biografia para {composerName}...
          </p>
        </div>

        {/* Skeleton da biografia */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  // Mostrar erro apenas se não conseguiu gerar E não tem biografia
  if (error && !displayBio) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-700 font-medium">Erro ao gerar biografia</p>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!displayBio) {
    return (
      <div className="space-y-4">
        <div className="text-gray-500 italic">
          Biografia não disponível para este compositor.
        </div>

        {/* Botão para tentar gerar manualmente */}
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Gerar biografia
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
        {displayBio}
      </div>
    </div>
  );
}
