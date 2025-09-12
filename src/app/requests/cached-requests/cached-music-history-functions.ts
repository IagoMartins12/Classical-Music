// app/requests/cached-music-history-functions.ts - Versões com cache híbrido
import { cachePresets } from '@/app/libs/hybrid-cache';
import { Language } from '@/app/stores/useLanguageStore';
import {
  getComposersByEpochTranslated,
  getEpochsHistoricalDataTranslated,
  getComposersTimelineTranslated,
} from '../music-history-translated';

/**
 * CACHED VERSIONS - Music History com Redis híbrido
 * Funciona com ou sem Redis disponível
 */

// Cache de 4h - dados de compositores por época (queries pesadas com filtragem específica)
export const getCachedComposersByEpochTranslated = async (
  language: Language
) => {
  return cachePresets.weekly(
    () => getComposersByEpochTranslated(language),
    `composers-by-epoch-${language}`
  );
};

// Cache semanal - dados históricos das épocas (muito estáveis, só tradução muda)
export const getCachedEpochsHistoricalDataTranslated = async (
  language: Language
) => {
  return cachePresets.weekly(
    () => getEpochsHistoricalDataTranslated(language),
    `epochs-historical-${language}`
  );
};

// Cache diário - timeline de compositores (query complexa com filtragem, mas pode ter updates)
export const getCachedComposersTimelineTranslated = async (
  language: Language
) => {
  return cachePresets.weekly(
    () => getComposersTimelineTranslated(language),
    `composers-timeline-${language}`
  );
};

/**
 * FUNÇÕES DE INVALIDAÇÃO
 * Para forçar refresh quando necessário
 */

export const invalidateMusicHistoryCache = async (language?: Language) => {
  const { invalidateCache } = await import('@/app/libs/hybrid-cache');

  if (language) {
    // Invalidar cache específico de um idioma
    await Promise.all([
      invalidateCache(`hourly:composers-by-epoch-${language}`),
      invalidateCache(`weekly:epochs-historical-${language}`),
      invalidateCache(`daily:composers-timeline-${language}`),
    ]);
    console.log(`Music history cache invalidated for ${language}`);
  } else {
    // Invalidar cache de todos os idiomas
    await Promise.all([
      invalidateCache('hourly:composers-by-epoch-pt'),
      invalidateCache('hourly:composers-by-epoch-en'),
      invalidateCache('weekly:epochs-historical-pt'),
      invalidateCache('weekly:epochs-historical-en'),
      invalidateCache('daily:composers-timeline-pt'),
      invalidateCache('daily:composers-timeline-en'),
    ]);
    console.log('Music history cache invalidated for all languages');
  }
};
