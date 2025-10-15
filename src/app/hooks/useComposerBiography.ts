// hooks/useComposerBiography.ts
import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

interface BiographyCache {
  ptBr: Record<string, string>;
  en: Record<string, string>;
}

interface UseComposerBiographyResult {
  biography: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Gera chave única para o compositor (versão client-side)
 */
function generateComposerBioKey(
  composerName: string,
  composerId: string
): string {
  const cleanName = composerName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();

  return `${cleanName}_${composerId}`;
}

/**
 * Busca cache de biografias (versão client-side)
 */
async function loadBiographyCache(): Promise<BiographyCache> {
  try {
    const response = await fetch('/translations/composers-bio.json');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const cache: BiographyCache = await response.json();
    return cache;
  } catch (error) {
    console.warn('Erro ao carregar cache de biografias:', error);
    return { ptBr: {}, en: {} };
  }
}

/**
 * Hook simples para buscar biografia do compositor no cache baseado no idioma atual
 * Versão client-side - busca o JSON via fetch
 */
export function useComposerBiography(
  composerId: string,
  composerName: string,
  fallbackBio?: string | null // Biografia de fallback (ex: do banco de dados)
): UseComposerBiographyResult {
  const [biography, setBiography] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguageStore();

  useEffect(() => {
    if (!composerId || !composerName) {
      setBiography(null);
      setError('ID ou nome do compositor não fornecido');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const loadBiography = async () => {
      try {
        // Carregar cache de biografias
        const cache = await loadBiographyCache();

        // Gerar chave do compositor
        const key = generateComposerBioKey(composerName, composerId);

        // Buscar biografia baseada no idioma
        const langKey = language === 'pt' ? 'ptBr' : 'en';
        const cachedBio = cache[langKey]?.[key];

        if (cachedBio) {
          setBiography(cachedBio);
          console.log(
            `Biografia encontrada no cache para ${composerName} (${language})`
          );
        } else if (fallbackBio && language === 'pt') {
          // Se não tem no cache mas tem fallback em português
          setBiography(fallbackBio);
          console.log(
            `Usando biografia fallback para ${composerName} (${language})`
          );
        } else {
          setBiography(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setBiography(null);
        console.error('Erro ao buscar biografia:', errorMessage);

        // Fallback em caso de erro
        if (fallbackBio) {
          setBiography(fallbackBio);
          console.log('Usando fallback devido a erro no cache');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBiography();
  }, [composerId, composerName, language, fallbackBio]);

  return {
    biography,
    isLoading,
    error,
  };
}

/**
 * Hook para verificar se uma biografia existe no cache
 * Versão client-side
 */
export function useComposerBiographyAvailability(
  composerId: string,
  composerName: string
): {
  ptAvailable: boolean;
  enAvailable: boolean;
  currentLanguageAvailable: boolean;
  isLoading: boolean;
} {
  const [availability, setAvailability] = useState({
    ptAvailable: false,
    enAvailable: false,
    currentLanguageAvailable: false,
    isLoading: true,
  });

  const { language } = useLanguageStore();

  useEffect(() => {
    if (!composerId || !composerName) {
      setAvailability({
        ptAvailable: false,
        enAvailable: false,
        currentLanguageAvailable: false,
        isLoading: false,
      });
      return;
    }

    const checkAvailability = async () => {
      try {
        const cache = await loadBiographyCache();
        const key = generateComposerBioKey(composerName, composerId);

        const ptBio = cache.ptBr?.[key];
        const enBio = cache.en?.[key];
        const currentBio = language === 'pt' ? ptBio : enBio;

        setAvailability({
          ptAvailable: !!ptBio,
          enAvailable: !!enBio,
          currentLanguageAvailable: !!currentBio,
          isLoading: false,
        });
      } catch (error) {
        console.error('Erro ao verificar disponibilidade de biografia:', error);
        setAvailability({
          ptAvailable: false,
          enAvailable: false,
          currentLanguageAvailable: false,
          isLoading: false,
        });
      }
    };

    checkAvailability();
  }, [composerId, composerName, language]);

  return availability;
}

/**
 * Hook para buscar biografias em ambos idiomas
 * Versão client-side
 */
export function useComposerBiographyBothLanguages(
  composerId: string,
  composerName: string
): {
  ptBiography: string | null;
  enBiography: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const [ptBiography, setPtBiography] = useState<string | null>(null);
  const [enBiography, setEnBiography] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!composerId || !composerName) {
      setPtBiography(null);
      setEnBiography(null);
      setError('ID ou nome do compositor não fornecido');
      setIsLoading(false);
      return;
    }

    const loadBothBiographies = async () => {
      try {
        const cache = await loadBiographyCache();
        const key = generateComposerBioKey(composerName, composerId);

        const ptBio = cache.ptBr?.[key] || null;
        const enBio = cache.en?.[key] || null;

        setPtBiography(ptBio);
        setEnBiography(enBio);

        console.log(`Biografias carregadas para ${composerName}:`, {
          pt: !!ptBio,
          en: !!enBio,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setPtBiography(null);
        setEnBiography(null);
        console.error('Erro ao buscar biografias:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadBothBiographies();
  }, [composerId, composerName]);

  return {
    ptBiography,
    enBiography,
    isLoading,
    error,
  };
}
