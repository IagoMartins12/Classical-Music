// app/requests/cached-home-functions.ts - Versões cacheadas das funções
import { cachePresets } from '@/app/libs/hybrid-cache';
import {
  getFeaturedComposer,
  getMusicalFacts,
  getRandomDiscoveries,
  getRecentAdditions,
} from '../home-request';
import {
  getEpochsCache,
  getRecomendadedComposers,
  getTop20FamousComposers,
} from '../composers';
const isDev = process.env.NODE_ENV === 'development';

/**
 * CACHED VERSIONS - Versões com cache Redis híbrido
 * Funciona com ou sem Redis disponível
 */

// Cache diário - muda a cada 24h (featuredComposer)
export const getCachedFeaturedComposer = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getFeaturedComposer();
  }

  return cachePresets.daily(getFeaturedComposer, 'featured-composer');
};

// Cache curto - atualiza a cada 30 min (dados que mudam frequentemente)
export const getCachedRecentAdditions = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getRecentAdditions();
  }

  return cachePresets.short(getRecentAdditions, 'recent-additions');
};

// Cache de 4h - dados que mudam moderadamente
export const getCachedRandomDiscoveries = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getRandomDiscoveries();
  }

  return cachePresets.hourly(getRandomDiscoveries, 'random-discoveries');
};

export const getCachedMusicalFacts = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getMusicalFacts();
  }

  return cachePresets.hourly(getMusicalFacts, 'musical-facts');
};

// Cache semanal - dados muito estáveis
export const getCachedEpochs = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getEpochsCache();
  }

  return cachePresets.weekly(getEpochsCache, 'epochs');
};

export const getCachedTop20FamousComposers = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getTop20FamousComposers();
  }

  return cachePresets.weekly(getTop20FamousComposers, 'top20-composers');
};

export const getCachedRecommendedComposers = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getRecomendadedComposers();
  }

  return cachePresets.weekly(getRecomendadedComposers, 'recommended-composers');
};

/**
 * FUNÇÕES DE INVALIDAÇÃO
 * Para forçar refresh quando necessário
 */

export const invalidateHomeCache = async () => {
  const { invalidateCacheByPrefix } = await import('@/app/libs/hybrid-cache');

  // Invalidar caches que podem precisar de refresh
  await invalidateCacheByPrefix('short:'); // Recent additions
  await invalidateCacheByPrefix('hourly:'); // Random discoveries, musical facts

  console.log('🔄 Home cache invalidated');
};

export const invalidateFeaturedComposer = async () => {
  const { invalidateCache } = await import('@/app/libs/hybrid-cache');
  await invalidateCache('daily:featured-composer');
  console.log('🎭 Featured composer cache invalidated');
};
