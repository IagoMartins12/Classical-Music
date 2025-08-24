import { useState, useCallback } from 'react';
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

interface UseBiographyGeneratorResult {
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
  generateBiography: (composerId: string) => Promise<void>;
  clearError: () => void;
}

// Cache de requests em andamento para evitar duplicação
const activeRequests = new Map<string, Promise<BiographyResponse>>();

// Debounce cache para evitar múltiplas requisições
const debounceCache = new Map<string, number>();
const DEBOUNCE_TIME = 2000; // 2 segundos

export function useBiographyGenerator(): UseBiographyGeneratorResult {
  const [biography, setBiography] = useState<string | null>(null);
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

  const generateBiography = useCallback(
    async (composerId: string) => {
      // Gerar chave única para request (incluindo idioma)
      const requestKey = `${composerId}_${language}`;

      // Verificar debounce
      const now = Date.now();
      const lastRequest = debounceCache.get(requestKey);
      if (lastRequest && now - lastRequest < DEBOUNCE_TIME) {
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
          setError(
            'Limite de requisições atingido. Tente novamente mais tarde.'
          );
        } else {
          setError(errorMessage);
        }

        setBiography(null);
        setMetadata(null);
      } finally {
        setIsGenerating(false);
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
    },
    [language]
  );

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
  };
}
