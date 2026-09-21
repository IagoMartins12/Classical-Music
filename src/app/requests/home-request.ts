// app/requests/home-request.ts — blocos da home, pela API (Etapa 3)
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { unstable_cache } from 'next/cache';
import { getComposerCuriosities, musicalFacts } from '../utils/utils';

/**
 * Cache do `fetch` do Next. O dado vem do cache da API (Redis); ela avisa pelas
 * tags quando algo muda. São blocos secundários da home: se a API falhar, o
 * bloco some (vazio ou nulo), como no legado, e a página abre.
 */
const CACHE = {
  // A escolha do dia é da API (muda à meia-noite); uma hora é o atraso máximo.
  FEATURED: { revalidate: 3600, tags: ['composers'] },
  DISCOVERIES: { revalidate: 3600, tags: ['discovery', 'composers', 'works'] },
  RECENT: { revalidate: 600, tags: ['discovery', 'composers', 'works'] },
};

// Compositor em destaque (o mesmo para todos durante o dia)
export async function getFeaturedComposer() {
  try {
    const composer = await apiFetch<ApiSchema<'FeaturedComposerResponseDto'>>(
      '/composers/featured',
      { next: CACHE.FEATURED }
    );

    return {
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName,
      birthDate: composer.birthDate ?? null,
      deathDate: composer.deathDate ?? null,
      portraitUrl: composer.portraitUrl ?? null,
      bio: composer.bio ?? null,
      permLinkImslp: composer.permLinkImslp ?? null,
      wikipediaLink: composer.wikipediaLink ?? null,
      epochName: composer.epochName || 'Clássico',
      isVerified: composer.isVerified,
      works: composer.works,
      // As curiosidades são conteúdo do front, pelo nome do compositor.
      curiosities: getComposerCuriosities(composer.fullName) || [],
    };
  } catch (error) {
    console.error('Error in getFeaturedComposer:', error);
    return null;
  }
}

// Descobertas aleatórias - compositores e obras menos conhecidos
export async function getRandomDiscoveries() {
  try {
    const discoveries = await apiFetch<ApiSchema<'DiscoveryResponseDto'>>(
      '/catalog/discoveries',
      { next: CACHE.DISCOVERIES }
    );

    return {
      composers: discoveries.composers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName ?? composer.name,
        portraitUrl: composer.portraitUrl ?? null,
        epochName: composer.epochName,
      })),
      works: discoveries.works.map((work) => ({
        id: work.id,
        title: work.title,
        imslpPermlink: work.imslpPermlink ?? '',
        opOrCatalog: work.opOrCatalog ?? null,
        tone: work.tone ?? null,
        epochName: work.epochName,
        instrumentName: work.instrumentName,
        composerName: work.composer.name,
        composer: {
          id: work.composer.id,
          name: work.composer.name,
          fullName: work.composer.fullName ?? work.composer.name,
          portraitUrl: work.composer.portraitUrl ?? null,
        },
      })),
    };
  } catch (error) {
    console.error('Error in getRandomDiscoveries:', error);
    return { composers: [], works: [] };
  }
}

// Últimas adições
export async function getRecentAdditions() {
  try {
    const recent = await apiFetch<ApiSchema<'RecentAdditionsResponseDto'>>(
      '/catalog/recent',
      { next: CACHE.RECENT }
    );

    return {
      composers: recent.composers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName ?? composer.name,
        portraitUrl: composer.portraitUrl ?? null,
        createdAt: new Date(composer.createdAt),
        epochName: composer.epochName ?? null,
      })),
      works: recent.works.map((work) => ({
        id: work.id,
        title: work.title,
        mediaDuration: work.mediaDuration ?? null,
        createdAt: new Date(work.createdAt),
        composer: { fullName: work.composerFullName ?? '' },
        instrument: { name: work.instrumentName ?? '' },
        epoch: { name: work.epochName ?? '' },
      })),
    };
  } catch (error) {
    console.error('Error in getRecentAdditions:', error);
    return { composers: [], works: [] };
  }
}

// Curiosidades musicais — conteúdo estático do front, sorteado a cada 6 h
export const getMusicalFacts = unstable_cache(
  async () => {
    try {
      return musicalFacts.sort(() => 0.5 - Math.random()).slice(0, 4);
    } catch (error) {
      console.error('Error in getMusicalFacts:', error);
      return [];
    }
  },
  ['musical-facts'],
  {
    revalidate: 21600, // 6 horas
    tags: ['facts', 'curiosities'],
  }
);
