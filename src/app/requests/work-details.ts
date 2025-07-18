// app/requests/work-details.ts - VERSÃO ULTRA OTIMIZADA COMPLETA
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

// Interfaces mantidas (com novos campos)
export interface WorkDetails {
  id: string;
  title: string;
  subtitle?: string;
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
  timeSignature?: string;
  tempoMarking?: string;
  movementsDetailed?: any;
  imslpTags?: string[];
  difficultyLevel?: string;
  isVerified: boolean;

  // 🆕 CAMPOS DE MÍDIA AUTOMÁTICA
  spotifyTrackId?: string;
  spotifyTrackUrl?: string;
  spotifyPreviewUrl?: string;
  spotifyAlbumArt?: string;
  spotifyArtists?: string[];
  spotifyAlbumName?: string;
  spotifyDuration?: number;
  spotifyPopularity?: number;

  youtubeVideoId?: string;
  youtubeVideoUrl?: string;
  youtubeThumbnail?: string;
  youtubeTitle?: string;
  youtubeChannel?: string;
  youtubePublishedAt?: Date;

  mediaSearchStatus?: string;
  mediaQualityScore?: number;
  lastMediaSearch?: Date;

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
  subtitle?: string;
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  workType: string;
  isPartOfCollection: boolean;
  difficultyLevel?: string;
  isVerified: boolean;
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
  difficultyLevels: { value: string; label: string }[];
}

// 🚀 NOVA VERSÃO ULTRA OTIMIZADA DO getWorks
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
      difficultyLevel?: string;
    }
  ): Promise<WorksListResponse> => {
    try {
      const skip = (page - 1) * limit;

      console.log('🔍 getWorks otimizado:', { page, limit, filters });

      // 🚀 OTIMIZAÇÃO 1: Query condicional baseada em filtros
      if (!filters || Object.keys(filters).length === 0) {
        // SEM FILTROS: Query super otimizada
        return await getWorksWithoutFilters(skip, limit);
      }

      // COM FILTROS: Query específica otimizada
      return await getWorksWithFilters(skip, limit, filters);
    } catch (error) {
      console.error('❌ Erro na busca otimizada de obras:', error);
      return { works: [], totalCount: 0, hasMore: false };
    }
  },
  ['works-ultra-optimized'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['works-ultra-optimized'],
  }
);

// 🚀 QUERY OTIMIZADA SEM FILTROS (mais comum) - VERSÃO ULTRA RÁPIDA
async function getWorksWithoutFilters(
  skip: number,
  limit: number
): Promise<WorksListResponse> {
  console.log('⚡ Executando query SEM filtros (ultra rápida)');

  try {
    // 🔥 ESTRATÉGIA 1: Usar select mínimo e ordenação otimizada
    const worksPromise = prisma.work.findMany({
      select: {
        id: true,
        title: true,
        subtitle: true,
        opOrCatalog: true,
        compositionYear: true,
        tone: true,
        mediaDuration: true,
        workType: true,
        isPartOfCollection: true,
        difficultyLevel: true,
        // 🚀 OTIMIZAÇÃO: Apenas IDs para relacionamentos
        composerId: true,
        instrumentId: true,
        epochId: true,
        isVerified: true,
      },
      // 🔥 ORDENAÇÃO SIMPLES (evita joins complexos)
      orderBy: [
        { title: 'asc' }, // Ordenação mais simples possível
      ],
      skip,
      take: limit,
    });

    // 🔥 ESTRATÉGIA 2: Executar count e works em paralelo
    const [works, totalCount] = await Promise.all([
      worksPromise,
      getCachedTotalCount(),
    ]);

    // 🔥 ESTRATÉGIA 3: Buscar dados relacionados em lote (batch loading)
    const composerIds = [...new Set(works.map((w) => w.composerId))];
    const instrumentIds = [
      ...new Set(works.map((w) => w.instrumentId).filter(Boolean)),
    ];
    const epochIds = [...new Set(works.map((w) => w.epochId))];

    console.log(
      `📊 Batch loading: ${composerIds.length} compositores, ${instrumentIds.length} instrumentos, ${epochIds.length} épocas`
    );

    const [composers, instruments, epochs] = await Promise.all([
      // Composers
      composerIds.length > 0
        ? prisma.composer.findMany({
            where: { id: { in: composerIds } },
            select: {
              id: true,
              name: true,
              fullName: true,
              epochName: true,
            },
          })
        : [],
      // Instruments
      instrumentIds.length > 0
        ? prisma.instrument.findMany({
            where: { id: { in: instrumentIds } },
            select: {
              id: true,
              name: true,
            },
          })
        : [],
      // Epochs
      epochIds.length > 0
        ? prisma.epoch.findMany({
            where: { id: { in: epochIds } },
            select: {
              id: true,
              name: true,
            },
          })
        : [],
    ]);

    // 🔥 ESTRATÉGIA 4: Criar maps para lookup O(1)
    const composerMap = new Map(composers.map((c) => [c.id, c]));
    const instrumentMap = new Map(instruments.map((i) => [i.id, i]));
    const epochMap = new Map(epochs.map((e) => [e.id, e]));

    // 🔥 ESTRATÉGIA 5: Montar resultado final
    const formattedWorks = works.map((work) => {
      const composer = composerMap.get(work.composerId);
      const instrument = work.instrumentId
        ? instrumentMap.get(work.instrumentId)
        : null;
      const epoch = epochMap.get(work.epochId);

      return {
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
        isVerified: work.isVerified,
        composer: composer || {
          id: '',
          name: 'Desconhecido',
          fullName: null,
          epochName: null,
        },
        instrument: instrument || null,
        epoch: epoch || { id: '', name: 'Desconhecida' },
      };
    });

    console.log(
      `✅ Query ultra otimizada concluída: ${formattedWorks.length} obras`
    );

    return {
      works: formattedWorks,
      totalCount,
      hasMore: skip + works.length < totalCount,
    };
  } catch (error) {
    console.error('❌ Erro na query ultra otimizada:', error);

    // 🚀 FALLBACK: Query tradicional se ultra otimizada falhar
    return await getWorksWithFilters(skip, limit, {});
  }
}

// 🚀 CACHE PARA CONTAGEM TOTAL (atualiza menos frequentemente)
const getCachedTotalCount = unstable_cache(
  async (): Promise<number> => {
    console.log('📊 Calculando total count (cache miss)');

    try {
      // 🔥 Usar aggregate para count mais eficiente
      const result = await prisma.work.aggregate({
        _count: {
          id: true,
        },
      });

      return result._count.id;
    } catch (error) {
      console.error('❌ Erro no count otimizado, usando fallback:', error);
      // Fallback para método tradicional
      return await prisma.work.count();
    }
  },
  ['total-works-count'],
  {
    revalidate: 3600, // 1 hora
    tags: ['total-works-count'],
  }
);

// 🚀 QUERY OTIMIZADA COM FILTROS
async function getWorksWithFilters(
  skip: number,
  limit: number,
  filters: any
): Promise<WorksListResponse> {
  console.log('🔍 Executando query COM filtros');

  // Construir whereClause de forma mais eficiente
  const whereClause: any = {};

  // 🚀 OTIMIZAÇÃO: Filtros diretos (mais rápidos)
  if (filters.composerId) whereClause.composerId = filters.composerId;
  if (filters.instrumentId) whereClause.instrumentId = filters.instrumentId;
  if (filters.epochId) whereClause.epochId = filters.epochId;
  if (filters.difficultyLevel)
    whereClause.difficultyLevel = filters.difficultyLevel;

  // 🚀 OTIMIZAÇÃO: Arrays usando 'has' (mais eficiente que 'hasSome')
  if (filters.categoryNames) {
    whereClause.categoryNames = { has: filters.categoryNames };
  }
  if (filters.workGenresArr) {
    whereClause.workGenresArr = { has: filters.workGenresArr };
  }

  // 🚀 OTIMIZAÇÃO: Busca textual otimizada
  if (filters.search) {
    const searchTerm = filters.search.trim();

    // Para termos curtos, busca mais específica
    if (searchTerm.length < 3) {
      whereClause.OR = [
        { title: { startsWith: searchTerm, mode: 'insensitive' } },
        { opOrCatalog: { startsWith: searchTerm, mode: 'insensitive' } },
      ];
    } else {
      // Para termos maiores, busca mais ampla
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { subtitle: { contains: searchTerm, mode: 'insensitive' } },
        { opOrCatalog: { contains: searchTerm, mode: 'insensitive' } },
        {
          composer: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { fullName: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }
  }

  const [works, totalCount] = await Promise.all([
    prisma.work.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        subtitle: true,
        opOrCatalog: true,
        compositionYear: true,
        tone: true,
        mediaDuration: true,
        workType: true,
        isPartOfCollection: true,
        difficultyLevel: true,
        isVerified: true,
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
        { title: 'asc' }, // Ordenação simples para performance
      ],
      skip,
      take: limit,
    }),
    prisma.work.count({ where: whereClause }),
  ]);

  return {
    works: works.map(formatWorkItem),
    totalCount,
    hasMore: skip + works.length < totalCount,
  };
}

// 🚀 HELPER: Formatar item de trabalho
function formatWorkItem(work: any): WorkListItem {
  return {
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
    isVerified: work.isVerified,
  };
}

// 🚀 CACHE ULTRA OTIMIZADO PARA FILTROS - Carregamento em paralelo
export const getFilterOptions = unstable_cache(
  async (): Promise<FilterOptions> => {
    try {
      console.log('🔍 Carregando opções de filtro (otimizado)');

      // 🚀 EXECUÇÃO EM PARALELO de todas as consultas de filtro
      const [instruments, epochs, workGenres, popularComposers] =
        await Promise.all([
          getCachedInstruments(),
          getCachedEpochs(),
          getCachedWorkGenres(),
          getCachedPopularComposers(),
        ]);

      return {
        instruments,
        epochs,
        workGenres,
        popularComposers,
        difficultyLevels: DIFFICULTY_LEVELS,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar opções de filtro:', error);
      return {
        instruments: [],
        epochs: [],
        workGenres: [],
        popularComposers: [],
        difficultyLevels: DIFFICULTY_LEVELS,
      };
    }
  },
  ['filter-options-ultra'],
  {
    revalidate: 3600, // 1 hora
    tags: ['filter-options-ultra'],
  }
);

// 🚀 CACHES INDIVIDUAIS PARA CADA TIPO DE FILTRO
const getCachedInstruments = unstable_cache(
  async () => {
    return await prisma.instrument.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 50, // Limitar para performance
    });
  },
  ['instruments-cache'],
  { revalidate: 7200, tags: ['instruments-cache'] }
);

const getCachedEpochs = unstable_cache(
  async () => {
    return await prisma.epoch.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  },
  ['epochs-cache'],
  { revalidate: 7200, tags: ['epochs-cache'] }
);

const getCachedWorkGenres = unstable_cache(
  async () => {
    return await prisma.workGenre.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 30, // Limitar para performance
    });
  },
  ['work-genres-cache'],
  { revalidate: 7200, tags: ['work-genres-cache'] }
);

// 🚀 COMPOSITORES POPULARES ULTRA OTIMIZADO
const getCachedPopularComposers = unstable_cache(
  async () => {
    // 🚀 QUERY AGREGADA para compositores mais eficiente
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
        _count: { select: { works: true } },
      },
      orderBy: { works: { _count: 'desc' } },
      take: 25, // Top 25 compositores
    });

    return popularComposers.map((composer) => ({
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName || undefined,
      worksCount: composer._count.works,
    }));
  },
  ['popular-composers-cache'],
  { revalidate: 3600, tags: ['popular-composers-cache'] }
);

// 🚀 CONSTANTES OTIMIZADAS
const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

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

// 🚀 FUNÇÃO OTIMIZADA PARA INVALIDAÇÃO DE CACHE
export async function revalidateWorkCache(workId?: string) {
  const { revalidateTag } = await import('next/cache');

  // Invalidar caches relacionados
  revalidateTag('works-ultra-optimized');
  revalidateTag('total-works-count');
  revalidateTag('filter-options-ultra');
  revalidateTag('instruments-cache');
  revalidateTag('epochs-cache');
  revalidateTag('work-genres-cache');
  revalidateTag('popular-composers-cache');

  if (workId) {
    revalidateTag(`work-${workId}`);
  }

  console.log('🔄 Cache de obras invalidado (ultra otimizado)');
}

// 🚀 BUSCAR DETALHES DE UMA OBRA ESPECÍFICA (MANTIDO)
export const getWorkById = unstable_cache(
  async (workId: string): Promise<WorkDetails | null> => {
    try {
      const work = await prisma.work.findUnique({
        where: { id: workId },
        select: {
          id: true,
          title: true,
          subtitle: true,
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
          timeSignature: true,
          tempoMarking: true,
          movementsDetailed: true,
          imslpTags: true,
          difficultyLevel: true,
          isVerified: true,
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

      if (!work) return null;

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
        timeSignature: work.timeSignature || undefined,
        tempoMarking: work.tempoMarking || undefined,
        movementsDetailed: work.movementsDetailed || undefined,
        imslpTags: work.imslpTags || undefined,
        difficultyLevel: work.difficultyLevel || undefined,
        composer: work.composer,
        instrument: work.instrument,
        epoch: work.epoch,
        isVerified: work.isVerified,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar obra por ID:', error);
      return null;
    }
  },
  ['work-details-ultra'],
  {
    revalidate: 3600,
    tags: ['work-details-ultra'],
  }
);

// 🚀 BUSCAR GÊNEROS COM FILTRO (MANTIDO)
export const searchWorkGenres = async (
  searchTerm: string = '',
  limit: number = 20
): Promise<{ id: string; name: string }[]> => {
  try {
    const whereClause = searchTerm
      ? { name: { contains: searchTerm, mode: 'insensitive' as const } }
      : {};

    return await prisma.workGenre.findMany({
      where: whereClause,
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar gêneros:', error);
    return [];
  }
};

// 🚀 BUSCAR TODOS OS GÊNEROS (MANTIDO PARA COMPATIBILIDADE)
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
      console.error('❌ Erro ao buscar todos os gêneros:', error);
      return [];
    }
  },
  ['all-work-genres'],
  {
    revalidate: 7200, // 2 horas
    tags: ['all-work-genres'],
  }
);

// 🚀 BUSCAR INSTRUMENTOS (MANTIDO PARA COMPATIBILIDADE)
export const getInstruments = unstable_cache(
  async () => {
    try {
      const { instruments } = await getFilterOptions();
      return instruments;
    } catch (error) {
      console.error('❌ Erro ao buscar instrumentos:', error);
      return [];
    }
  },
  ['instruments-list'],
  {
    revalidate: 7200,
    tags: ['instruments-list'],
  }
);

// 🚀 BUSCAR ÉPOCAS (MANTIDO PARA COMPATIBILIDADE)
export const getEpochs = unstable_cache(
  async () => {
    try {
      const { epochs } = await getFilterOptions();
      return epochs;
    } catch (error) {
      console.error('❌ Erro ao buscar épocas:', error);
      return [];
    }
  },
  ['epochs-list'],
  {
    revalidate: 7200,
    tags: ['epochs-list'],
  }
);

// 🚀 BUSCAR COMPOSITORES POPULARES (MANTIDO PARA COMPATIBILIDADE)
export const getPopularComposers = unstable_cache(
  async (): Promise<
    { id: string; name: string; fullName?: string; worksCount?: number }[]
  > => {
    try {
      const { popularComposers } = await getFilterOptions();
      return popularComposers;
    } catch (error) {
      console.error('❌ Erro ao buscar compositores populares:', error);
      return [];
    }
  },
  ['popular-composers-list'],
  {
    revalidate: 3600,
    tags: ['popular-composers-list'],
  }
);

// 🚀 VERIFICAR CACHE DE PARTITURAS (MANTIDO PARA COMPATIBILIDADE)
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
      console.error('❌ Erro ao verificar cache de partituras:', error);
      return { hasCache: false, cacheInfo: null };
    }
  },
  ['work-scores-cache'],
  {
    revalidate: 300, // Cache por 5 minutos
    tags: ['work-scores-cache'],
  }
);

// 🚀 INVALIDAR CACHE DE PARTITURAS (MANTIDO PARA COMPATIBILIDADE)
export async function revalidateWorkScoreCache(workId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('work-scores-cache');
  revalidateTag(`work-cache-${workId}`);
  console.log(`🔄 Cache de partituras invalidado para obra: ${workId}`);
}
