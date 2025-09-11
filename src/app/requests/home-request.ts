// app/requests/home-components.ts - VERSÃO SIMPLIFICADA E EFICIENTE
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { allFamousNames, getComposerCuriosities, musicalFacts } from './utils';

// Compositor em destaque (muda a cada 24h)
export const getFeaturedComposer = unstable_cache(
  async () => {
    try {
      // Usar data para gerar um índice determinístico que muda a cada 24h
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Tentar encontrar um compositor válido
      let composer = null;
      let attempts = 0;
      const maxAttempts = allFamousNames.length;

      while (!composer && attempts < maxAttempts) {
        const selectedIndex = (dayOfYear + attempts) % allFamousNames.length;
        const selectedName = allFamousNames[selectedIndex];

        composer = await prisma.composer.findFirst({
          where: {
            fullName: selectedName,
          },
          select: {
            id: true,
            name: true,
            fullName: true,
            birthDate: true,
            deathDate: true,
            portraitUrl: true,
            bio: true,
            permLinkImslp: true,
            wikipediaLink: true,
            epochName: true,
            isVerified: true,
            works: {
              select: {
                id: true,
                title: true,
                imslpPermlink: true,
              },
              take: 3,
              orderBy: {
                title: 'asc',
              },
            },
          },
        });

        if (composer) {
          const curiosities = getComposerCuriosities(selectedName);
          return {
            ...composer,
            epochName: composer.epochName || 'Clássico',
            curiosities: curiosities || [],
            works: composer.works || [],
          };
        }

        attempts++;
      }

      // Fallback compositor
      const fallbackComposer = await prisma.composer.findFirst({
        where: {
          OR: [
            { primaryRoleId: '6839e5a5eba93979e36ad88b' },
            { roles: { contains: '6839e5a5eba93979e36ad88b' } },
          ],
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          birthDate: true,
          deathDate: true,
          portraitUrl: true,
          bio: true,
          permLinkImslp: true,
          wikipediaLink: true,
          epoch: {
            select: {
              name: true,
            },
          },
          works: {
            select: {
              id: true,
              title: true,
              imslpPermlink: true,
            },
            take: 3,
            orderBy: {
              title: 'asc',
            },
          },
        },
      });

      if (fallbackComposer) {
        const curiosities = getComposerCuriosities(fallbackComposer.fullName);
        return {
          ...fallbackComposer,
          epochName: fallbackComposer.epoch?.name || 'Clássico',
          curiosities: curiosities || [],
          works: fallbackComposer.works || [],
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getFeaturedComposer:', error);
      return null;
    }
  },
  ['featured-composer'],
  {
    revalidate: 86400, // 24 horas
    tags: ['composers', 'featured'],
  }
);

// Descobertas aleatórias - compositores e obras menos conhecidos
export const getRandomDiscoveries = unstable_cache(
  async () => {
    try {
      const lesserKnownComposers = await prisma.composer.findMany({
        where: {
          AND: [
            {
              OR: [
                { primaryRoleId: '6839e5a5eba93979e36ad88b' },
                { roles: { contains: '6839e5a5eba93979e36ad88b' } },
              ],
            },
            {
              fullName: {
                notIn: [
                  'Ludwig van Beethoven',
                  'Wolfgang Amadeus Mozart',
                  'Johann Sebastian Bach',
                  'Richard Wagner',
                  'Joseph Haydn',
                  'Johannes Brahms',
                  'Franz Schubert',
                  'Peter Ilyich Tchaikovsky',
                  'George Frideric Handel',
                  'Igor Stravinsky',
                  'Robert Schumann',
                  'Felix Mendelssohn',
                  'Claude Debussy',
                  'Gustav Mahler',
                  'Franz Liszt',
                  'Maurice Ravel',
                  'Antonín Dvořák',
                  'Antonio Vivaldi',
                  'Dmitri Shostakovich',
                  'Frédéric Chopin',
                ],
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          portraitUrl: true,
          epoch: {
            select: {
              name: true,
            },
          },
        },
        take: 50,
      });

      const randomWorks = await prisma.work.findMany({
        where: {
          composer: {
            OR: [
              { primaryRoleId: '6839e5a5eba93979e36ad88b' },
              { roles: { contains: '6839e5a5eba93979e36ad88b' } },
            ],
          },
        },
        select: {
          id: true,
          title: true,
          imslpPermlink: true,
          opOrCatalog: true,
          tone: true,
          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
              portraitUrl: true,
            },
          },
          epoch: {
            select: {
              name: true,
            },
          },
          instrument: {
            select: {
              name: true,
            },
          },
        },
        take: 50,
      });

      // Randomizar e retornar
      const shuffledComposers = lesserKnownComposers.sort(
        () => 0.5 - Math.random()
      );
      const shuffledWorks = randomWorks.sort(() => 0.5 - Math.random());

      return {
        composers: shuffledComposers.slice(0, 6).map((composer) => ({
          ...composer,
          epochName: composer.epoch?.name || 'Clássico',
        })),
        works: shuffledWorks.slice(0, 6).map((work) => ({
          ...work,
          epochName: work.epoch?.name || 'Clássico',
          instrumentName: work.instrument?.name || 'Piano',
          composerName: work.composer?.name || 'Anônimo',
        })),
      };
    } catch (error) {
      console.error('Error in getRandomDiscoveries:', error);
      return {
        composers: [],
        works: [],
      };
    }
  },
  ['random-discoveries'],
  {
    revalidate: 3600, // 1 hora
    tags: ['composers', 'works', 'random'],
  }
);

// Últimas adições
export const getRecentAdditions = unstable_cache(
  async () => {
    try {
      const recentComposers = await prisma.composer.findMany({
        select: {
          id: true,
          name: true,
          fullName: true,
          portraitUrl: true,
          createdAt: true,
          epochName: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 4,
      });

      const recentWorks = await prisma.work.findMany({
        select: {
          id: true,
          title: true,
          mediaDuration: true,
          createdAt: true,
          composer: {
            select: {
              fullName: true,
            },
          },
          instrument: {
            select: {
              name: true,
            },
          },
          epoch: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 4,
      });

      return {
        composers: recentComposers,
        works: recentWorks,
      };
    } catch (error) {
      console.error('Error in getRecentAdditions:', error);
      return {
        composers: [],
        works: [],
      };
    }
  },
  ['recent-additions'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers', 'recent'],
  }
);

// Curiosidades musicais
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

// Função para invalidar caches
export async function revalidateHomeComponentsCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('composers');
  revalidateTag('featured');
  revalidateTag('random');
  revalidateTag('recent');
  revalidateTag('facts');
}
