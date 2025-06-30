//work-requests - Updated with new properties
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

export interface WorkDetails {
  id: string;
  title: string;
  subtitle?: string; // 🆕 New property
  opOrCatalog?: string;
  compositionYear?: string;
  firstPublishDate?: string;
  tone?: string;
  mediaDuration?: string;
  imslpPermlink: string;
  imslpId: string;
  videoUrl?: string;
  workStyle?: string;
  moviment?: string;
  dedicateTo?: string;
  dedicationComposerLink?: string;
  instrumentation?: string;
  workType: string;
  isPartOfCollection: boolean;
  parentWorkId?: string;
  movementNumber?: number;
  createdAt: Date;

  // 🆕 New properties
  timeSignature?: string;
  tempoMarking?: string;
  movementsDetailed?: any; // JSON field
  imslpTags?: string[];
  difficultyLevel?: string;

  composer: {
    id: string;
    name: string;
    fullName: string;
    epochName: string | null;
  };
  instrument: {
    id: string;
    name: string;
  } | null;
  epoch: {
    id: string;
    name: string;
  } | null;
  categoryNames: string[];
  workGenresArr?: string[];
}

export interface WorkListItem {
  id: string;
  title: string;
  subtitle?: string; // 🆕 New property
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  workType: string;
  isPartOfCollection: boolean;
  difficultyLevel?: string; // 🆕 New property
  composer: {
    id: string;
    name: string;
    fullName: string | null;
    epochName: string | null;
  };
  instrument: {
    id: string;
    name: string;
  } | null;
  epoch: {
    id: string;
    name: string;
  };
}

export interface WorksListResponse {
  works: WorkListItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface FilterOptions {
  instruments: { id: string; name: string }[];
  epochs: { id: string; name: string }[];
  workGenres: { id: string; name: string }[];
  popularComposers: {
    id: string;
    name: string;
    fullName?: string;
    worksCount?: number;
  }[];
  difficultyLevels: { value: string; label: string }[]; // 🆕 New filter
}

// Buscar detalhes de uma obra específica - UPDATED with new properties
export const getWorkById = unstable_cache(
  async (workId: string): Promise<WorkDetails | null> => {
    try {
      const work = await prisma.work.findUnique({
        where: {
          id: workId,
        },
        select: {
          id: true,
          title: true,
          subtitle: true, // 🆕
          opOrCatalog: true,
          compositionYear: true,
          firstPublishDate: true,
          tone: true,
          mediaDuration: true,
          imslpPermlink: true,
          imslpId: true,
          videoUrl: true,
          workStyle: true,
          moviment: true,
          dedicateTo: true,
          dedicationComposerLink: true,
          instrumentation: true,
          workType: true,
          isPartOfCollection: true,
          parentWorkId: true,
          movementNumber: true,
          createdAt: true,
          categoryNames: true,
          workGenresArr: true,

          // 🆕 New properties
          timeSignature: true,
          tempoMarking: true,
          movementsDetailed: true,
          imslpTags: true,
          difficultyLevel: true,

          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
              epochName: true,
            },
          },
          instrument: {
            select: {
              id: true,
              name: true,
            },
          },
          epoch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!work) {
        return null;
      }

      return {
        id: work.id,
        title: work.title,
        subtitle: work.subtitle || undefined,
        opOrCatalog: work.opOrCatalog || undefined,
        compositionYear: work.compositionYear || undefined,
        firstPublishDate: work.firstPublishDate || undefined,
        tone: work.tone || undefined,
        mediaDuration: work.mediaDuration || undefined,
        imslpPermlink: work.imslpPermlink,
        imslpId: work.imslpId,
        videoUrl: work.videoUrl || undefined,
        workStyle: work.workStyle || undefined,
        moviment: work.moviment || undefined,
        dedicateTo: work.dedicateTo || undefined,
        dedicationComposerLink: work.dedicationComposerLink || undefined,
        instrumentation: work.instrumentation || undefined,
        workType: work.workType,
        isPartOfCollection: work.isPartOfCollection,
        parentWorkId: work.parentWorkId || undefined,
        movementNumber: work.movementNumber || undefined,
        createdAt: work.createdAt,
        categoryNames: work.categoryNames,
        workGenresArr: work.workGenresArr,

        // 🆕 New properties
        timeSignature: work.timeSignature || undefined,
        tempoMarking: work.tempoMarking || undefined,
        movementsDetailed: work.movementsDetailed || undefined,
        imslpTags: work.imslpTags || undefined,
        difficultyLevel: work.difficultyLevel || undefined,

        composer: work.composer,
        instrument: work.instrument,
        epoch: work.epoch,
      };
    } catch (error) {
      console.error('Erro ao buscar obra:', error);
      return null;
    }
  },
  ['work-details'],
  {
    revalidate: 3600, // 1 hora
    tags: ['work-details'],
  }
);

// Buscar todas as obras com paginação - UPDATED with new properties
export const getWorks = unstable_cache(
  async (
    page: number = 1,
    limit: number = 32,
    filters?: {
      composerId?: string;
      instrumentId?: string;
      epochId?: string;
      workGenreId?: string;
      search?: string;
      categoryNames?: string;
      workGenresArr?: string;
      difficultyLevel?: string; // 🆕 New filter
    }
  ): Promise<WorksListResponse> => {
    try {
      const skip = (page - 1) * limit;

      // Construir filtros WHERE de forma mais eficiente
      const whereClause: any = {};

      if (filters?.composerId) {
        whereClause.composerId = filters.composerId;
      }

      if (filters?.instrumentId) {
        whereClause.instrumentId = filters.instrumentId;
      }

      if (filters?.epochId) {
        whereClause.epochId = filters.epochId;
      }

      if (filters?.categoryNames) {
        whereClause.categoryNames = {
          has: filters.categoryNames,
        };
      }

      if (filters?.workGenresArr) {
        whereClause.workGenresArr = {
          has: filters.workGenresArr,
        };
      }

      // 🆕 New filter for difficulty level
      if (filters?.difficultyLevel) {
        whereClause.difficultyLevel = filters.difficultyLevel;
      }

      if (filters?.search) {
        whereClause.OR = [
          {
            title: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            subtitle: {
              // 🆕 Include subtitle in search
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            opOrCatalog: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            composer: {
              OR: [
                {
                  name: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  fullName: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ];
      }

      // OTIMIZAÇÃO PRINCIPAL: Uma única consulta com includes otimizados
      const [works, totalCount] = await Promise.all([
        prisma.work.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            subtitle: true, // 🆕
            opOrCatalog: true,
            compositionYear: true,
            tone: true,
            mediaDuration: true,
            workType: true,
            isPartOfCollection: true,
            difficultyLevel: true, // 🆕
            // Incluir dados relacionados diretamente na consulta
            composer: {
              select: {
                id: true,
                name: true,
                fullName: true,
                epochName: true,
              },
            },
            instrument: {
              select: {
                id: true,
                name: true,
              },
            },
            epoch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            {
              composer: {
                name: 'asc',
              },
            },
            {
              title: 'asc',
            },
          ],
          skip,
          take: limit,
        }),
        // Consulta de contagem otimizada (apenas conta, não busca dados)
        prisma.work.count({
          where: whereClause,
        }),
      ]);

      return {
        works: works.map((work) => ({
          id: work.id,
          title: work.title,
          subtitle: work.subtitle || undefined,
          opOrCatalog: work.opOrCatalog || undefined,
          compositionYear: work.compositionYear || undefined,
          tone: work.tone || undefined,
          mediaDuration: work.mediaDuration || undefined,
          workType: work.workType,
          isPartOfCollection: work.isPartOfCollection,
          difficultyLevel: work.difficultyLevel || undefined,
          composer: work.composer,
          instrument: work.instrument,
          epoch: work.epoch,
        })),
        totalCount,
        hasMore: skip + works.length < totalCount,
      };
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
      return {
        works: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  },
  ['works-list'],
  {
    revalidate: 3600, // 1 hora
    tags: ['works-list'],
  }
);

// 🆕 Difficulty levels for filtering
const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

// Buscar todas as opções de filtro em uma única função otimizada - UPDATED
export const getFilterOptions = unstable_cache(
  async (): Promise<FilterOptions> => {
    try {
      // Executar todas as consultas em paralelo para máxima eficiência
      const [instruments, epochs, workGenres, popularComposers] =
        await Promise.all([
          // Instrumentos
          prisma.instrument.findMany({
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: 'asc',
            },
          }),

          // Épocas
          prisma.epoch.findMany({
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: 'asc',
            },
          }),

          // Gêneros de trabalho (apenas os primeiros 20 para performance)
          prisma.workGenre.findMany({
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: 'asc',
            },
            take: 20,
          }),

          // Compositores populares
          getPopularComposers(),
        ]);

      return {
        instruments,
        epochs,
        workGenres,
        popularComposers,
        difficultyLevels: DIFFICULTY_LEVELS, // 🆕 New filter option
      };
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
      return {
        instruments: [],
        epochs: [],
        workGenres: [],
        popularComposers: [],
        difficultyLevels: DIFFICULTY_LEVELS,
      };
    }
  },
  ['filter-options'],
  {
    revalidate: 7200, // 2 horas - dados relativamente estáticos
    tags: ['filter-options'],
  }
);

// Rest of the functions remain the same...
const FAMOUS_COMPOSERS = [
  'Ludwig van Beethoven',
  'Wolfgang Amadeus Mozart',
  'Johann Sebastian Bach',
  'Frédéric Chopin',
  'Franz Liszt',
  'Pyotr Ilyich Tchaikovsky',
  'Claude Debussy',
  'Johannes Brahms',
  'Antonio Vivaldi',
  'Franz Schubert',
  'Robert Schumann',
  'Sergei Rachmaninoff',
  'Maurice Ravel',
  'Giuseppe Verdi',
  'Richard Wagner',
  'Felix Mendelssohn',
  'Dmitri Shostakovich',
  'Igor Stravinsky',
  'George Frideric Handel',
  'Joseph Haydn',
];

// Buscar compositores populares
export const getPopularComposers = unstable_cache(
  async (): Promise<
    { id: string; name: string; fullName?: string; worksCount?: number }[]
  > => {
    try {
      // Buscar compositores famosos com contagem de obras
      const popularComposers = await prisma.composer.findMany({
        where: {
          OR: FAMOUS_COMPOSERS.map((name) => ({
            OR: [
              { name: { contains: name, mode: 'insensitive' } },
              { fullName: { contains: name, mode: 'insensitive' } },
            ],
          })),
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          _count: {
            select: {
              works: true,
            },
          },
        },
        orderBy: {
          works: {
            _count: 'desc',
          },
        },
        take: 20,
      });

      return popularComposers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName || undefined,
        worksCount: composer._count.works,
      }));
    } catch (error) {
      console.error('Erro ao buscar compositores populares:', error);
      return [];
    }
  },
  ['popular-composers'],
  {
    revalidate: 7200, // 2 horas
    tags: ['popular-composers'],
  }
);

// Continue with existing functions...
export const getInstruments = unstable_cache(
  async () => {
    try {
      const { instruments } = await getFilterOptions();
      return instruments;
    } catch (error) {
      console.error('Erro ao buscar instrumentos:', error);
      return [];
    }
  },
  ['instruments-list'],
  {
    revalidate: 7200,
    tags: ['instruments-list'],
  }
);

export const getEpochs = unstable_cache(
  async () => {
    try {
      const { epochs } = await getFilterOptions();
      return epochs;
    } catch (error) {
      console.error('Erro ao buscar épocas:', error);
      return [];
    }
  },
  ['epochs-list'],
  {
    revalidate: 7200,
    tags: ['epochs-list'],
  }
);

// Continue with rest of existing functions...
export const searchWorkGenres = async (
  searchTerm: string = '',
  limit: number = 20
): Promise<{ id: string; name: string }[]> => {
  try {
    const whereClause = searchTerm
      ? {
          name: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        }
      : {};

    return await prisma.workGenre.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('Erro ao buscar gêneros com filtro:', error);
    return [];
  }
};

export const getAllWorkGenres = unstable_cache(
  async (): Promise<{ id: string; name: string }[]> => {
    try {
      return await prisma.workGenre.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar todos os gêneros:', error);
      return [];
    }
  },
  ['all-work-genres'],
  {
    revalidate: 7200, // 2 horas - dados mais estáticos
    tags: ['all-work-genres'],
  }
);

export const hasScoresInCache = unstable_cache(
  async (
    workId: string
  ): Promise<{
    hasCache: boolean;
    cacheInfo: {
      totalScores: number;
      lastUpdated: Date | null;
      types: string[];
    } | null;
  }> => {
    try {
      const cachedScores = await prisma.workScore.findMany({
        where: {
          workId,
          isActive: true,
          OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
        },
        select: {
          type: true,
          updatedAt: true,
        },
      });

      if (cachedScores.length === 0) {
        return { hasCache: false, cacheInfo: null };
      }

      const lastUpdated = cachedScores.reduce((latest, score) => {
        const scoreDate = new Date(score.updatedAt);
        return latest > scoreDate ? latest : scoreDate;
      }, new Date(0));

      const types = [...new Set(cachedScores.map((score) => score.type))];

      return {
        hasCache: true,
        cacheInfo: {
          totalScores: cachedScores.length,
          lastUpdated: lastUpdated > new Date(0) ? lastUpdated : null,
          types,
        },
      };
    } catch (error) {
      console.error('Erro ao verificar cache de partituras:', error);
      return { hasCache: false, cacheInfo: null };
    }
  },
  ['work-scores-cache'],
  {
    revalidate: 300, // Cache por 5 minutos
    tags: ['work-scores-cache'],
  }
);

export async function revalidateWorkCache(workId?: string) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('works-list');
  revalidateTag('work-basic-data');
  revalidateTag('related-works');
  revalidateTag('filter-options');
  revalidateTag('instruments-list');
  revalidateTag('epochs-list');
  revalidateTag('work-genres-list');
  revalidateTag('works-stats');
  revalidateTag('work-scores-cache');
  revalidateTag('global-cache-stats');

  if (workId) {
    revalidateTag(`work-${workId}`);
    revalidateTag(`work-cache-${workId}`);
  }
}

export async function revalidateWorkScoreCache(workId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('work-scores-cache');
  revalidateTag(`work-cache-${workId}`);
  console.log(`🔄 Cache de partituras invalidado para obra: ${workId}`);
}
