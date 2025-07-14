// app/requests/composers-optimized.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

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

// Cache de épocas por 24 horas (dados raramente mudam)
export const getEpochsCache = unstable_cache(
  async () => {
    const epochs = await prisma.epoch.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return epochs.filter((epoch) => epoch.name !== 'Desconhecido');
  },
  ['epochs-list'],
  {
    revalidate: 86400, // 24 horas
    tags: ['epochs'],
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

  // Caso tenha search OU epochId, os filtros de role vão dentro de AND
  if ((search && search.trim()) || (epochId && epochId.trim())) {
    where.AND = [
      {
        OR: roleFilter,
      },
    ];

    if (search && search.trim()) {
      where.AND.push({
        OR: [
          {
            name: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
          {
            fullName: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (epochId && epochId.trim()) {
      where.AND.push({
        epochId: epochId.trim(),
      });
    }
  } else {
    // Caso não tenha search nem epochId, o filtro de role fica no OR da raiz
    where.OR = roleFilter;
  }

  return where;
}

// Paginação otimizada com cache condicional
export const getComposersWithPagination = unstable_cache(
  async ({ page, limit, search, epochId }: PaginationParams) => {
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

    // Transformar dados para incluir epochName
    return composers.map((composer) => ({
      ...composer,
      epochName: composer.epoch.name,
    }));
  },
  ['composers-paginated-2'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers'],
  }
);

export const getTop20FamousComposers = unstable_cache(
  async () => {
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
    }));
  },
  ['top-20-famous-composers'],
  {
    revalidate: 86400, // 24 horas
    tags: ['composers', 'famous'],
  }
);

export const getRecomendadedComposers = unstable_cache(
  async () => {
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
    }));
  },
  ['get-recomendaded-composers'],
  {
    revalidate: 86400, // 24 horas
    tags: ['composers', 'famous'],
  }
);

// Count otimizado com cache
export const getComposersCount = unstable_cache(
  async ({ search, epochId }: CountParams) => {
    const where = buildWhereClause(search, epochId);

    const count = await prisma.composer.count({
      where,
    });

    return count;
  },
  ['composers-count'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers'],
  }
);

// Função para invalidar cache quando necessário
export async function revalidateComposersCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('composers');
  revalidateTag('epochs');
}
