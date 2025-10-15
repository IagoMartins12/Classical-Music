// app/requests/cached-music-history-functions.ts - Versões com cache híbrido
import { cachePresets } from '@/app/libs/hybrid-cache';
import { Language } from '@/app/stores/useLanguageStore';
import {
  ComposerPreferences,
  getInstrumentsStatsTranslated,
  getInstrumentsWithWorksTranslated,
  getTopComposersByInstrumentTranslated,
  WorksPreferences,
} from '../instruments-history-translated';

/**
 * CACHED VERSIONS - Music History com Redis híbrido
 * Funciona com ou sem Redis disponível
 */

// Cache de 4h - dados de compositores por época (queries pesadas com filtragem específica)
export const getCachedInstrumentsStatsTranslated = async () => {
  return cachePresets.weekly(
    () => getInstrumentsStatsTranslated(),
    `instrument-stats`
  );
};

// Cache semanal - dados históricos das épocas (muito estáveis, só tradução muda)
export const getCachedInstrumentsWithWorksTranslated = async (
  language: Language,
  composerPreferences: ComposerPreferences,
  worksPreferences: WorksPreferences
) => {
  return cachePresets.weekly(
    () =>
      getInstrumentsWithWorksTranslated(
        language,
        composerPreferences,
        worksPreferences
      ),
    `instruments-with-works-${language}`
  );
};

// Cache diário - timeline de compositores (query complexa com filtragem, mas pode ter updates)
export const getCachedTopComposersByInstrumentTranslated = async (
  composerPreferences: ComposerPreferences
) => {
  return cachePresets.weekly(
    () => getTopComposersByInstrumentTranslated(composerPreferences),
    `top-composers-by-intruments`
  );
};
