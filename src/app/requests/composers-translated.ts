// app/requests/composers-optimized-translated.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { Language } from '@/app/stores/useLanguageStore';
import { translateEpochStatic } from '../utils/translations/epochTranslationComposer';

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  epochId?: string;
}

interface CountParams {
  search?: string;
  epochId?: string;
}

interface ComposerTranslated {
  epochName: string;
  name: string;
  id: string;
  bio: string | null;
  epoch: {
    name: string;
  };
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
  epochId: string;
  permLinkImslp: string | null;
  wikipediaLink: string | null;
  imslpId: string | null;
  isVerified: boolean;
}

interface EpochTranslated {
  id: string;
  name: string;
}

// Cache de épocas por 24 horas (dados raramente mudam) - COM TRADUÇÃO
export const getEpochsCacheTranslated = unstable_cache(
  async (language: Language) => {
    const epochs = await prisma.epoch.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Filtra épocas desconhecidas e retorna com nomes traduzidos
    return epochs
      .filter((epoch) => epoch.name !== 'Desconhecido')
      .map((epoch) => ({
        id: epoch.id,
        name: epoch.name, // Mantém o nome original para a busca funcionar
        translatedName: translateEpochStatic(epoch.name, language), // Nome traduzido para exibição
      }));
  },
  ['epochs-list-translated'],
  {
    revalidate: 86400, // 24 horas
    tags: ['epochs', 'translated'],
  }
);

// Função para construir filtros WHERE reutilizável
function buildWhereClause(search?: string, epochId?: string) {
  const where: any = {};

  const roleFilter = [
    {
      primaryRoleId: '685d591c1e3db0c5aaa893e4',
    },
    {
      roles: {
        contains: '685d591c1e3db0c5aaa893e4',
      },
    },
  ];

  const hasSearch = search && search.trim();
  const hasEpochId = epochId && epochId.trim();

  if (hasSearch || hasEpochId) {
    where.AND = [
      {
        OR: roleFilter,
      },
    ];

    if (hasSearch) {
      const terms = search.trim().split(/\s+/);

      where.AND.push({
        OR: [
          {
            AND: terms.map((term) => ({
              name: {
                contains: term,
                mode: 'insensitive',
              },
            })),
          },
          {
            AND: terms.map((term) => ({
              fullName: {
                contains: term,
                mode: 'insensitive',
              },
            })),
          },
        ],
      });
    }

    if (hasEpochId) {
      where.AND.push({
        epochId: epochId.trim(),
      });
    }
  } else {
    where.OR = roleFilter;
  }

  return where;
}

// Paginação otimizada com cache condicional - COM TRADUÇÃO
export const getComposersWithPaginationTranslated = unstable_cache(
  async (
    { page, limit, search, epochId }: PaginationParams,
    language: Language
  ): Promise<ComposerTranslated[]> => {
    const skip = (page - 1) * limit;
    const where = buildWhereClause(search, epochId);

    const composers = await prisma.composer.findMany({
      where,
      select: {
        id: true,
        name: true,
        fullName: true,
        birthDate: true,
        deathDate: true,
        portraitUrl: true,
        epochId: true,
        bio: true,
        permLinkImslp: true,
        wikipediaLink: true,
        imslpId: true,
        isVerified: true,
        epoch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit,
    });

    // Transformar dados para incluir epochName traduzido
    return composers.map((composer) => ({
      ...composer,
      epochName: composer.epoch.name, // Mantém o original para compatibilidade
      translatedEpochName: translateEpochStatic(composer.epoch.name, language), // Nome traduzido
    })) as ComposerTranslated[];
  },
  ['composers-paginated-translated'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers', 'translated'],
  }
);

export const getTop20FamousComposersTranslated = unstable_cache(
  async (language: Language) => {
    const famousComposerNames = [
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
      'Franz Liszt ',
      'Maurice Ravel',
      'Antonín Dvořák',
      'Antonio Vivaldi',
      'Dmitri Shostakovich',
      'Steve Reich',
      'Frédéric Chopin',
    ];

    const composers = await prisma.composer.findMany({
      where: {
        fullName: {
          in: famousComposerNames,
        },
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        portraitUrl: true,
        isVerified: true,
        epoch: {
          select: {
            name: true,
          },
        },
      },
    });

    return composers.map((composer) => ({
      ...composer,
      epochName: composer.epoch.name,
      translatedEpochName: translateEpochStatic(composer.epoch.name, language),
    }));
  },
  ['top-20-famous-composers-translated'],
  {
    revalidate: 86400, // 24 horas
    tags: ['composers', 'famous', 'translated'],
  }
);

export const getRecomendadedComposersTranslated = unstable_cache(
  async (language: Language) => {
    const remainingComposerNames = [
      'Serge Prokofiev',
      'Dmitri Shostakovich',
      'Béla Bartók',
      'Hector Berlioz',
      'Anton Bruckner',
      'Giovanni Pierluigi da Palestrina',
      'Claudio Monteverdi',
      'Jean Sibelius',
      'Maurice Ravel',
      'Ralph Vaughan Williams',
      'Modest Mussorgsky',
      'Giacomo Puccini',
      'Henry Purcell',
      'Gioacchino Rossini',
      'Edward Elgar',
      'Sergei Rachmaninoff',
      'Camille Saint-Saëns',
      'Josquin Des Prez',
      'Nikolai Rimsky-Korsakov',
      'Carl Maria von Weber',
      'Jean-Philippe Rameau',
      'Jean-Baptiste Lully',
      'Gabriel Fauré',
      'Edvard Grieg',
      'Christoph Willibald Gluck',
      'Arnold Schoenberg',
      'Charles Ives',
      'Paul Hindemith',
      'Olivier Messiaen',
      'Aaron Copland',
      'Francois Couperin',
      'William Byrd',
      'Erik Satie',
      'Benjamin Britten',
      'Bedrick Smetana',
      'César Franck',
      'Alexander Nikolayevich Scriabin',
      'Georges Bizet',
      'Domenico Scarlatti',
      'Georg Philipp Telemann',
      'Anton Webern',
      'Roland de Lassus',
      'George Gershwin',
      'Gaetano Donizetti',
      'Carl Philipp Emanuel Bach',
      'Archangelo Corelli',
      'Thomas Tallis',
      'Johann Strauss II',
      'Leos Janácek',
      'Guillaume de Machaut',
      'Alban Berg',
      'Alexander Borodin',
      'Vincenzo Bellini',
      'Charles Gounod',
      'Jules Massenet',
      'Francis Poulenc',
      'Giovanni Gabrieli',
      'Pérotin',
      'Heinrich Schütz',
      'John Cage',
      'Giovanni Battista Pergolesi',
      'John Dowland',
      'Gustav Holst',
      'Dietrich Buxtehude',
      'Ottorino Respighi',
      'Guillaume Dufay',
      'Hugo Wolf',
      'Carl Nielsen',
      'William Walton',
      'Darius Milhaud',
      'Orlando Gibbons',
      'Giacomo Meyerbeer',
      'Samuel Barber',
      'Tomás Luis de Victoria',
      'Léonin',
      'Manuel de Falla',
      'Hildegard von Bingen',
      'Mikhail Glinka',
      'Alexander Glazunov',
      'Don Carlo Gesualdo',
    ];

    const composers = await prisma.composer.findMany({
      where: {
        fullName: {
          in: remainingComposerNames,
        },
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        portraitUrl: true,
        isVerified: true,
        epoch: {
          select: {
            name: true,
          },
        },
      },
    });

    return composers.map((composer) => ({
      ...composer,
      epochName: composer.epoch.name,
      translatedEpochName: translateEpochStatic(composer.epoch.name, language),
    }));
  },
  ['get-recomendaded-composers-translated'],
  {
    revalidate: 86400, // 24 horas
    tags: ['composers', 'famous', 'translated'],
  }
);

// Count otimizado com cache - NÃO PRECISA DE TRADUÇÃO
export const getComposersCountTranslated = unstable_cache(
  async ({ search, epochId }: CountParams) => {
    const where = buildWhereClause(search, epochId);

    const count = await prisma.composer.count({
      where,
    });

    return count;
  },
  ['composers-count-translated'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers', 'translated'],
  }
);

// Função para invalidar cache quando necessário
export async function revalidateComposersCacheTranslated() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('composers');
  revalidateTag('epochs');
  revalidateTag('translated');
  revalidateTag('famous');
}
