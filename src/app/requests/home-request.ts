// app/requests/home-components.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { allFamousNames, getComposerCuriosities } from './utils';

// Função para buscar épocas com compositores representativos
export const getEpochsWithComposers = unstable_cache(
  async () => {
    const epochs = await prisma.epoch.findMany({
      select: {
        id: true,
        name: true,
        composers: {
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
            portraitUrl: true,
          },
          take: 8,
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return epochs.filter((epoch) => epoch.composers.length > 0);
  },
  ['epochs-with-composers'],
  {
    revalidate: 86400, // 24 horas
    tags: ['epochs', 'composers'],
  }
);

// Compositor em destaque (muda a cada 24h)
export const getFeaturedComposer = unstable_cache(
  async () => {
    // Usar data para gerar um índice determinístico que muda a cada 24h
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Tentar encontrar um compositor válido
    let composer = null;
    let attempts = 0;
    const maxAttempts = allFamousNames.length; // Evita loop infinito

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
        // Adicionar curiosidades
        const curiosities = getComposerCuriosities(selectedName);

        return {
          ...composer,
          epochName: composer.epochName,
          curiosities,
        };
      }

      attempts++;
    }

    // Se chegou até aqui, não encontrou nenhum compositor da lista
    // Como último recurso, pegar qualquer compositor do banco
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
      // Usar curiosidades padrão para compositores não listados
      const curiosities = getComposerCuriosities(fallbackComposer.fullName);

      return {
        ...fallbackComposer,
        epochName: fallbackComposer.epoch.name,
        curiosities,
      };
    }

    // Se nem mesmo isso funcionar, retorna null
    return null;
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
    // Buscar compositores menos conhecidos
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

    // Buscar obras aleatórias (evitando as muito conhecidas)
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

    // Randomizar ambos
    const shuffledComposers = lesserKnownComposers.sort(
      () => 0.5 - Math.random()
    );
    const shuffledWorks = randomWorks.sort(() => 0.5 - Math.random());

    return {
      composers: shuffledComposers.slice(0, 6).map((composer) => ({
        ...composer,
        epochName: composer.epoch.name,
      })),
      works: shuffledWorks.slice(0, 6).map((work) => ({
        ...work,
        epochName: work.epoch.name,
        instrumentName: work.instrument.name,
        composerName: work.composer.name,
      })),
    };
  },
  ['random-discoveries'],
  {
    revalidate: 3600, // 1 hora para variar mais
    tags: ['composers', 'works', 'random'],
  }
);

// Últimas adições (compositores mais recentemente adicionados)
export const getRecentAdditions = unstable_cache(
  async () => {
    const recentComposers = await prisma.composer.findMany({
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
        portraitUrl: true,
        createdAt: true,
        epoch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    return recentComposers.map((composer) => ({
      ...composer,
      epochName: composer.epoch.name,
    }));
  },
  ['recent-additions'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers', 'recent'],
  }
);

// Curiosidades musicais e fatos interessantes
export const getMusicalFacts = unstable_cache(
  async () => {
    const facts = [
      {
        id: '1',
        type: 'curiosity',
        icon: '🎼',
        title: 'Você sabia?',
        content:
          'Mozart compôs sua primeira sinfonia aos 8 anos de idade, demonstrando um talento extraordinário desde muito jovem.',
        category: 'História',
      },
      {
        id: '2',
        type: 'anniversary',
        icon: '🎂',
        title: 'Aniversário',
        content:
          'Bach nasceu em 21 de março de 1685, há mais de 300 anos, e suas obras continuam influenciando músicos até hoje.',
        category: 'Efeméride',
      },
      {
        id: '3',
        type: 'instrument',
        icon: '🎹',
        title: 'Instrumentos',
        content:
          'O piano moderno tem 88 teclas, mas os primeiros pianos tinham apenas 54 teclas.',
        category: 'Instrumentos',
      },
      {
        id: '4',
        type: 'technique',
        icon: '🎵',
        title: 'Técnica',
        content:
          'A técnica de contraponto, desenvolvida no período barroco, ainda é fundamental para compositores contemporâneos.',
        category: 'Teoria',
      },
      {
        id: '5',
        type: 'record',
        icon: '⏰',
        title: 'Recorde',
        content:
          'A "Sinfonia dos Mil" de Mahler é uma das peças que exige o maior número de músicos para sua execução.',
        category: 'Curiosidades',
      },
      {
        id: '6',
        type: 'innovation',
        icon: '💡',
        title: 'Inovação',
        content:
          'Beethoven foi um dos primeiros compositores a usar indicações de dinâmica muito detalhadas em suas partituras.',
        category: 'Inovação',
      },
    ];

    // Randomizar as curiosidades para variar o conteúdo
    return facts.sort(() => 0.5 - Math.random()).slice(0, 4);
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
  revalidateTag('epochs');
  revalidateTag('composers');
  revalidateTag('featured');
  revalidateTag('random');
  revalidateTag('recent');
  revalidateTag('facts');
}
