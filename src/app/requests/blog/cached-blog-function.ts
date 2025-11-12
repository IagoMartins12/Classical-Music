import { cachePresets } from '@/app/libs/hybrid-cache';
import {
  getFeaturedArticles,
  getLatestArticles,
  getMostReadArticles,
  getCategories,
  getFeaturedAuthors,
  getTrendingTopics,
} from './blog-requests';

const isDev = process.env.NODE_ENV === 'development';

/**
 * ✅ CACHED VERSIONS - Usa cache apenas em produção
 */

// Artigos em destaque - cache de 30 min
export const getCachedFeaturedArticles = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured articles without cache');
    return getFeaturedArticles();
  }
  return cachePresets.short(getFeaturedArticles, 'blog-featured-articles');
};

// Últimos artigos - cache de 15 min
export const getCachedLatestArticles = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching latest articles without cache');
    return getLatestArticles();
  }
  return cachePresets.short(getLatestArticles, 'blog-latest-articles');
};

// Mais lidos - cache de 1 hora
export const getCachedMostReadArticles = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching most read articles without cache');
    return getMostReadArticles();
  }
  return cachePresets.hourly(getMostReadArticles, 'blog-most-read');
};

// Categorias - cache de 4 horas (mudam raramente)
export const getCachedCategories = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching categories without cache');
    return getCategories();
  }
  return cachePresets.hourly(getCategories, 'blog-categories');
};

// Autores em destaque - cache de 1 hora
export const getCachedFeaturedAuthors = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching featured authors without cache');
    return getFeaturedAuthors();
  }
  return cachePresets.hourly(getFeaturedAuthors, 'blog-featured-authors');
};

// Tópicos em alta - cache de 30 min
export const getCachedTrendingTopics = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Fetching trending topics without cache');
    return getTrendingTopics();
  }
  return cachePresets.short(getTrendingTopics, 'blog-trending-topics');
};

/**
 * FUNÇÕES DE INVALIDAÇÃO
 */
export const invalidateBlogCache = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Cache invalidation skipped');
    return;
  }

  const { invalidateCacheByPrefix } = await import('@/app/libs/hybrid-cache');

  await invalidateCacheByPrefix('short:blog-');
  await invalidateCacheByPrefix('hourly:blog-');

  console.log('🔄 Blog cache invalidated');
};

export const invalidateBlogCategories = async () => {
  if (isDev) {
    console.log('🔧 DEV MODE: Cache invalidation skipped');
    return;
  }

  const { invalidateCacheByPrefix } = await import('@/app/libs/hybrid-cache');
  await invalidateCacheByPrefix('hourly:blog-categories');

  console.log('🔄 Blog categories cache invalidated');
};
