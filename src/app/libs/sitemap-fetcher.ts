// app/libs/sitemap-fetcher.ts - Buscar dados reais do banco para sitemap
import prisma from '@/app/libs/prismadb';
import { cacheHelper } from './redis';

// Types para sitemap
export interface SitemapComposer {
  id: string;
  name: string;
  updatedAt: Date;
}

export interface SitemapWork {
  id: string;
  title: string;
  updatedAt: Date;
}

export interface SitemapData {
  composers: SitemapComposer[];
  works: SitemapWork[];
  totalCount: number;
  lastUpdated: Date;
}

// Cache keys
const CACHE_KEYS = {
  composers: 'sitemap:composers',
  works: 'sitemap:works',
  complete: 'sitemap:complete',
} as const;

// Cache TTL (10 minutos)
const CACHE_TTL = 600;

/**
 * Buscar compositores famosos para sitemap
 * Prioriza compositores verificados e com mais obras
 */
export async function getComposersForSitemap(): Promise<SitemapComposer[]> {
  try {
    // Verificar cache primeiro
    const cached = await cacheHelper.get<SitemapComposer[]>(
      CACHE_KEYS.composers
    );
    if (cached) {
      console.log(`📦 Cache hit: ${cached.length} composers from Redis`);
      return cached;
    }

    console.log('🔍 Fetching composers from database for sitemap...');

    // Buscar compositores principais
    const composers = await prisma.composer.findMany({
      select: {
        id: true,
        fullName: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            works: true,
          },
        },
      },
      where: {
        // Filtros para compositores relevantes
        OR: [
          { isVerified: true },
          { hasValidImage: true },
          { dataQuality: 'high' },
        ],
      },
      orderBy: [
        { isVerified: 'desc' }, // Verificados primeiro
        { works: { _count: 'desc' } }, // Mais obras primeiro
        { updatedAt: 'desc' }, // Mais recentes primeiro
      ],
      take: 500, // Limitar para performance (ajuste conforme necessário)
    });

    // Transformar para formato do sitemap
    const sitemapComposers: SitemapComposer[] = composers.map((composer) => ({
      id: composer.id,
      name: composer.fullName,
      updatedAt: composer.updatedAt || composer.createdAt,
    }));

    // Cache por 10 minutos
    await cacheHelper.set(CACHE_KEYS.composers, sitemapComposers, CACHE_TTL);

    console.log(
      `✅ Sitemap composers: ${sitemapComposers.length} loaded and cached`
    );
    return sitemapComposers;
  } catch (error) {
    console.error('❌ Error fetching composers for sitemap:', error);

    // Fallback para dados básicos se der erro
    return [
      {
        id: '685d8f9a8803000f9b61d151',
        name: 'Johann Sebastian Bach',
        updatedAt: new Date(),
      },
      {
        id: '685ef349c6bd886c5b497f8f',
        name: 'Wolfgang Amadeus Mozart',
        updatedAt: new Date(),
      },
    ];
  }
}

/**
 * Buscar obras populares para sitemap
 * Prioriza obras com mais favoritos e de compositores famosos
 */
export async function getWorksForSitemap(): Promise<SitemapWork[]> {
  try {
    // Verificar cache primeiro
    const cached = await cacheHelper.get<SitemapWork[]>(CACHE_KEYS.works);
    if (cached) {
      console.log(`📦 Cache hit: ${cached.length} works from Redis`);
      return cached;
    }

    console.log('🎵 Fetching works from database for sitemap...');

    // Buscar obras principais
    const works = await prisma.work.findMany({
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            favoriteBy: true,
            annotations: true,
          },
        },
        composer: {
          select: {
            isVerified: true,
            hasValidImage: true,
          },
        },
      },
      where: {
        // Filtros para obras relevantes
        OR: [
          { favoriteBy: { some: {} } }, // Tem pelo menos 1 favorito
          { annotations: { some: {} } }, // Tem pelo menos 1 anotação
          { composer: { isVerified: true } }, // Compositor verificado
          { composer: { hasValidImage: true } }, // Compositor com imagem
        ],
      },
      orderBy: [
        { favoriteBy: { _count: 'desc' } }, // Mais favoritadas primeiro
        { annotations: { _count: 'desc' } }, // Mais anotadas depois
        { updatedAt: 'desc' }, // Mais recentes por último
      ],
      take: 2000, // Limitar para performance (ajuste conforme necessário)
    });

    // Transformar para formato do sitemap
    const sitemapWorks: SitemapWork[] = works.map((work) => ({
      id: work.id,
      title: work.title,
      updatedAt: work.updatedAt || work.createdAt,
    }));

    // Cache por 10 minutos
    await cacheHelper.set(CACHE_KEYS.works, sitemapWorks, CACHE_TTL);

    console.log(`✅ Sitemap works: ${sitemapWorks.length} loaded and cached`);
    return sitemapWorks;
  } catch (error) {
    console.error('❌ Error fetching works for sitemap:', error);

    // Fallback para dados básicos se der erro
    return [
      {
        id: '6879bfbc68d244782048d0fc',
        title: 'Œuvres célèbres pour orgue, Walter Kraft',
        updatedAt: new Date(),
      },
    ];
  }
}

/**
 * Buscar dados completos do sitemap com cache inteligente
 */
export async function getCompleteSitemapData(): Promise<SitemapData> {
  try {
    // Verificar cache completo primeiro
    const cached = await cacheHelper.get<SitemapData>(CACHE_KEYS.complete);
    if (cached) {
      console.log(`📦 Complete sitemap cache hit: ${cached.totalCount} URLs`);
      return cached;
    }

    console.log('🌍 Generating complete sitemap data...');

    // Buscar dados em paralelo para performance
    const [composers, works] = await Promise.all([
      getComposersForSitemap(),
      getWorksForSitemap(),
    ]);

    const sitemapData: SitemapData = {
      composers,
      works,
      totalCount: composers.length + works.length,
      lastUpdated: new Date(),
    };

    // Cache completo por 10 minutos
    await cacheHelper.set(CACHE_KEYS.complete, sitemapData, CACHE_TTL);

    console.log(
      `✅ Complete sitemap generated: ${sitemapData.totalCount} URLs total`
    );
    return sitemapData;
  } catch (error) {
    console.error('❌ Error generating complete sitemap data:', error);

    // Fallback minimalista
    return {
      composers: [],
      works: [],
      totalCount: 0,
      lastUpdated: new Date(),
    };
  }
}

/**
 * Invalidar cache do sitemap (útil para updates)
 */
export async function invalidateSitemapCache(): Promise<void> {
  try {
    await Promise.all([
      cacheHelper.del(CACHE_KEYS.composers),
      cacheHelper.del(CACHE_KEYS.works),
      cacheHelper.del(CACHE_KEYS.complete),
    ]);
    console.log('🗑️ Sitemap cache invalidated');
  } catch (error) {
    console.error('❌ Error invalidating sitemap cache:', error);
  }
}

/**
 * Verificar saúde do sistema de cache
 */
export async function checkSitemapCacheHealth(): Promise<{
  redis: boolean;
  cacheKeys: Record<string, boolean>;
  stats: {
    composers: number;
    works: number;
    total: number;
  } | null;
}> {
  try {
    const redisHealth = await cacheHelper.ping();

    const cacheKeys = {
      composers: await cacheHelper.exists(CACHE_KEYS.composers),
      works: await cacheHelper.exists(CACHE_KEYS.works),
      complete: await cacheHelper.exists(CACHE_KEYS.complete),
    };

    let stats = null;
    if (cacheKeys.complete) {
      const data = await cacheHelper.get<SitemapData>(CACHE_KEYS.complete);
      if (data) {
        stats = {
          composers: data.composers.length,
          works: data.works.length,
          total: data.totalCount,
        };
      }
    }

    return {
      redis: redisHealth,
      cacheKeys,
      stats,
    };
  } catch (error) {
    console.error('❌ Error checking sitemap cache health:', error);
    return {
      redis: false,
      cacheKeys: { composers: false, works: false, complete: false },
      stats: null,
    };
  }
}
