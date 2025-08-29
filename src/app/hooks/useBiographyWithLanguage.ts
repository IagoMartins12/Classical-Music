// hooks/useBiographyWithLanguage.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguageWithRefresh } from '@/app/stores/useLanguageStore';

interface BiographyResponse {
  success: boolean;
  biography: string;
  generated?: boolean;
  translated?: boolean;
  fromCache?: boolean;
  fromDatabase?: boolean;
  savedToDatabase?: boolean;
  fallback?: boolean;
  warning?: string;
  message?: string;
  error?: string;
  canRetry?: boolean;
  retryAfter?: number;
}

interface UseBiographyWithLanguageResult {
  biography: string | null;
  isGenerating: boolean;
  error: string | null;
  warning: string | null;
  metadata: {
    isTranslated?: boolean;
    isGenerated?: boolean;
    isFromCache?: boolean;
    isFallback?: boolean;
  } | null;
  generateBiography: () => Promise<void>;
  clearError: () => void;
  refreshBiography: () => Promise<void>; // Nova função para forçar refresh
}

// Cache de requests em andamento para evitar duplicação
const activeRequests = new Map<string, Promise<BiographyResponse>>();

// Debounce cache para evitar múltiplas requisições
const debounceCache = new Map<string, number>();
const DEBOUNCE_TIME = 1000; // Reduzido para 1 segundo para mudanças de idioma

export function useBiographyWithLanguage(
  composerId: string,
  initialBio?: string | null
): UseBiographyWithLanguageResult {
  const [biography, setBiography] = useState<string | null>(initialBio || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    isTranslated?: boolean;
    isGenerated?: boolean;
    isFromCache?: boolean;
    isFallback?: boolean;
  } | null>(null);

  const { language } = useLanguageWithRefresh();

  // Refs para controlar geração automática
  const hasTriedGeneration = useRef(false);
  const lastComposerId = useRef(composerId);
  const lastLanguage = useRef(language);
  const forceRefresh = useRef(false);

  // Função principal de geração
  const generateBiography = useCallback(async () => {
    const requestKey = `${composerId}_${language}`;

    // Verificar debounce
    const now = Date.now();
    const lastRequest = debounceCache.get(requestKey);
    if (
      lastRequest &&
      now - lastRequest < DEBOUNCE_TIME &&
      !forceRefresh.current
    ) {
      console.log(`Debounce ativo para ${requestKey}, ignorando request`);
      return;
    }

    // Verificar se já há request ativo
    if (activeRequests.has(requestKey)) {
      console.log(`Request já ativo para ${requestKey}, aguardando...`);
      try {
        const result = await activeRequests.get(requestKey)!;
        processResult(result);
      } catch (err) {
        console.error('Erro ao aguardar request ativo:', err);
      }
      return;
    }

    // Limpar estados anteriores
    setError(null);
    setWarning(null);
    setIsGenerating(true);

    // Atualizar debounce
    debounceCache.set(requestKey, now);

    // Criar nova promise para request
    const requestPromise = fetch(`/api/composer/${composerId}/generate-bio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (response) => {
      const data: BiographyResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      return data;
    });

    // Armazenar request ativo
    activeRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      processResult(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';

      // Tratar erros específicos
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('já está sendo gerada')
      ) {
        setError('Biografia já está sendo gerada. Aguarde alguns momentos.');
      } else if (
        errorMessage.includes('503') ||
        errorMessage.includes('temporariamente indisponível')
      ) {
        setError(
          'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
        );
      } else if (errorMessage.includes('Limite de requisições')) {
        setError('Limite de requisições atingido. Tente novamente mais tarde.');
      } else {
        setError(errorMessage);
      }

      setBiography(null);
      setMetadata(null);
    } finally {
      setIsGenerating(false);
      forceRefresh.current = false;
      // Limpar request ativo
      activeRequests.delete(requestKey);
    }

    function processResult(result: BiographyResponse) {
      if (result.success && result.biography) {
        setBiography(result.biography);
        setMetadata({
          isTranslated: result.translated || false,
          isGenerated: result.generated || false,
          isFromCache: result.fromCache || false,
          isFallback: result.fallback || false,
        });

        // Mostrar warning se houver
        if (result.warning) {
          setWarning(result.warning);
        }

        // Log para debug
        console.log('Biografia processada:', {
          composerId,
          language,
          source: result.fromCache
            ? 'cache'
            : result.fromDatabase
            ? 'database'
            : result.generated
            ? 'generated'
            : 'unknown',
          translated: result.translated,
          fallback: result.fallback,
        });
      } else {
        throw new Error(result.error || 'Falha ao processar biografia');
      }
    }
  }, [composerId, language]);

  // Função para forçar refresh da biografia
  const refreshBiography = useCallback(async () => {
    console.log(`🔄 Forçando refresh da biografia para idioma: ${language}`);
    forceRefresh.current = true;
    hasTriedGeneration.current = false;
    await generateBiography();
  }, [generateBiography, language]);

  // Effect para detectar mudanças de compositor ou idioma
  useEffect(() => {
    const composerChanged = lastComposerId.current !== composerId;
    const languageChanged = lastLanguage.current !== language;

    if (composerChanged || languageChanged) {
      console.log('🔄 Detectada mudança:', {
        composerChanged,
        languageChanged,
        newLanguage: language,
        oldLanguage: lastLanguage.current,
      });

      // Reset estados
      hasTriedGeneration.current = false;
      lastComposerId.current = composerId;

      // Se apenas idioma mudou, forçar refresh
      if (languageChanged && !composerChanged) {
        lastLanguage.current = language;
        setBiography(null); // Limpar biografia atual
        refreshBiography();
      } else {
        lastLanguage.current = language;
        setError(null);
        setWarning(null);
        if (composerChanged) {
          setBiography(initialBio || null);
        }
      }
    }
  }, [composerId, language, initialBio, refreshBiography]);

  // Effect para geração automática inicial
  useEffect(() => {
    const shouldGenerateBio = !biography || biography.trim().length < 50;

    if (
      shouldGenerateBio &&
      !isGenerating &&
      !hasTriedGeneration.current &&
      !error
    ) {
      hasTriedGeneration.current = true;
      console.log(
        `🤖 Iniciando geração automática para compositor: ${composerId} (${language})`
      );
      generateBiography();
    }
  }, [biography, isGenerating, generateBiography, error, composerId, language]);

  const clearError = useCallback(() => {
    setError(null);
    setWarning(null);
  }, []);

  return {
    biography,
    isGenerating,
    error,
    warning,
    metadata,
    generateBiography,
    clearError,
    refreshBiography,
  };
}
