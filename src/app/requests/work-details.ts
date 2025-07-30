// app/requests/work-details.ts - VERSÃO HÍBRIDA ULTRA OTIMIZADA
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

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
  tempoMarking?: string;
  movementsDetailed?: any;
  difficultyLevel?: string | null;
  createdAt: Date;
  isVerified: boolean;

  // 🆕 CAMPOS DE MÍDIA
  spotifyTrackId?: string | null;
  spotifyTrackUrl?: string | null;
  youtubeVideoId?: string | null;
  youtubeVideoUrl?: string | null;
  youtubeTitle?: string | null;
  videoAulaUrl?: string | null;
  videoAulaFile?: string | null;
  videoAulaTitle?: string | null;
  videoAulaType?: string | null;
  videoAulaAddedBy?: string | null;
  videoAulaAddedAt?: Date | null;
  videoAulaMetadata?: any | null;
  lastMediaSearch?: Date | null;
  mediaSearchError?: string | null;

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
  } | null;

  categoryNames: string[];
  workGenresArr: string[];
}

export interface WorkListItem {
  id: string;
  title: string;
  subtitle?: string | null;
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  workType: string;
  isPartOfCollection: boolean;
  isVerified: boolean;
  epoch?: {
    id?: string;
    name?: string;
  };
  composer: {
    id: string;
    name: string;
    fullName?: string | null;
    epochName: string | null;
  };
  instrument: {
    name: string;
  } | null;
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

// 🚀 CACHE CONFIG - Diferentes TTLs por tipo de busca
const CACHE_CONFIG = {
  WORKS_DEFAULT: 3600, // 1 hora - sem filtros (mais estável)
  WORKS_FILTERED: 1800, // 30 min - com filtros (mais dinâmica)
  WORKS_SEARCH: 900, // 15 min - busca textual (mais dinâmica)
  FILTERS: 7200, // 2 horas - filtros mudam pouco
  COUNT: 3600, // 1 hora - contagem total
};

// 🚀 FUNÇÃO PRINCIPAL HÍBRIDA - Detecção automática de estratégia
export const getWorks = async (
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
    const filterType = determineFilterType(filters);

    console.log('🎯 getWorks híbrido:', {
      page,
      limit,
      filterType,
      hasFilters: !!filters && Object.keys(filters).length > 0,
    });

    // 🚀 ESTRATÉGIA HÍBRIDA: Escolher função otimizada baseada no tipo
    switch (filterType) {
      case 'NONE':
        return await getCachedWorksDefault(skip, limit);
      case 'SIMPLE':
        return await getCachedWorksSimpleFilter(skip, limit, filters!);
      case 'SEARCH':
        return await getCachedWorksWithSearch(skip, limit, filters!);
      case 'COMPLEX':
        return await getCachedWorksComplexFilter(skip, limit, filters!);
      default:
        return await getCachedWorksDefault(skip, limit);
    }
  } catch (error) {
    console.error('❌ Erro na busca híbrida de obras:', error);
    return { works: [], totalCount: 0, hasMore: false };
  }
};

// 🚀 HELPER: Determinar tipo de filtro para otimização
function determineFilterType(
  filters?: any
): 'NONE' | 'SIMPLE' | 'SEARCH' | 'COMPLEX' {
  if (!filters || Object.keys(filters).length === 0) {
    return 'NONE';
  }

  // Se tem busca textual
  if (filters.search) {
    return 'SEARCH';
  }

  // Contar filtros ativos
  const activeFilters = Object.keys(filters).filter((key) => filters[key]);

  // Se tem múltiplos filtros ou arrays
  if (
    activeFilters.length > 1 ||
    filters.categoryNames ||
    filters.workGenresArr
  ) {
    return 'COMPLEX';
  }

  // Filtro simples (apenas um campo)
  return 'SIMPLE';
}

// 🚀 CACHE 1: SEM FILTROS - Ultra otimizado (mais comum)
const getCachedWorksDefault = unstable_cache(
  async (skip: number, limit: number): Promise<WorksListResponse> => {
    console.log('⚡ Query SEM filtros (ultra otimizada)');

    try {
      // 🔥 ESTRATÉGIA 1: Query minimalista com select otimizado
      const works = await prisma.work.findMany({
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
          composerId: true,
          instrumentId: true,
          epochId: true,
        },
        orderBy: [{ createdAt: 'desc' }], // Ordenação otimizada com índice
        skip,
        take: limit,
      });

      // 🔥 ESTRATÉGIA 2: Batch loading de relacionamentos
      const [composers, instruments, epochs, totalCount] = await Promise.all([
        getBatchComposers([...new Set(works.map((w) => w.composerId))]),
        getBatchInstruments([
          ...new Set(works.map((w) => w.instrumentId).filter(Boolean)),
        ]),
        getBatchEpochs([...new Set(works.map((w) => w.epochId))]),
        getCachedTotalCount(),
      ]);

      // 🔥 ESTRATÉGIA 3: Maps para lookup O(1)
      const composerMap = new Map(composers.map((c) => [c.id, c]));
      const instrumentMap = new Map(instruments.map((i) => [i.id, i]));
      const epochMap = new Map(epochs.map((e) => [e.id, e]));

      const formattedWorks = works.map((work) => ({
        id: work.id,
        title: work.title,
        subtitle: work.subtitle || undefined,
        opOrCatalog: work.opOrCatalog || undefined,
        compositionYear: work.compositionYear || undefined,
        tone: work.tone || undefined,
        mediaDuration: work.mediaDuration || undefined,
        workType: work.workType,
        isPartOfCollection: work.isPartOfCollection,
        isVerified: work.isVerified,
        composer: composerMap.get(work.composerId) || {
          id: '',
          name: 'Desconhecido',
          fullName: null,
          epochName: null,
        },
        instrument: work.instrumentId
          ? instrumentMap.get(work.instrumentId) || null
          : null,
        epoch: epochMap.get(work.epochId) || { id: '', name: 'Desconhecida' },
      }));

      console.log(
        `✅ Query default ultra rápida: ${formattedWorks.length} obras`
      );

      return {
        works: formattedWorks,
        totalCount,
        hasMore: skip + works.length < totalCount,
      };
    } catch (error) {
      console.error('❌ Erro na query default:', error);
      return { works: [], totalCount: 0, hasMore: false };
    }
  },
  ['works-default-hybrid'],
  {
    revalidate: CACHE_CONFIG.WORKS_DEFAULT,
    tags: ['works-default-hybrid'],
  }
);

// 🚀 CACHE 2: FILTRO SIMPLES - Otimizado com MongoDB Aggregation
const getCachedWorksSimpleFilter = unstable_cache(
  async (
    skip: number,
    limit: number,
    filters: any
  ): Promise<WorksListResponse> => {
    console.log('🎯 Query com filtro SIMPLES (aggregation)');

    try {
      // 🔥 ESTRATÉGIA: MongoDB Aggregation para filtros simples
      const filterKey = Object.keys(filters).find((key) => filters[key]);

      if (!filterKey) {
        console.log('Nenhum filtro válido encontrado');
      }

      const filterValue = filters[filterKey!];

      // Converter para ObjectId se necessário
      const matchStage: any = {};

      if (filterKey === 'composerId') {
        matchStage.composerId = { $oid: filterValue };
      } else if (filterKey === 'instrumentId') {
        matchStage.instrumentId = { $oid: filterValue };
      } else if (filterKey === 'epochId') {
        matchStage.epochId = { $oid: filterValue };
      } else {
        if (filterKey) {
          matchStage[filterKey] = filterValue;
        }
      }

      const result = await prisma.work.aggregateRaw({
        pipeline: [
          { $match: matchStage },
          {
            $lookup: {
              from: 'Composer',
              localField: 'composerId',
              foreignField: '_id',
              as: 'composer',
              pipeline: [
                {
                  $project: {
                    _id: { $toString: '$_id' },
                    name: 1,
                    fullName: 1,
                    epochName: 1,
                  },
                },
              ],
            },
          },
          { $unwind: '$composer' },
          // Lookup condicional para instrument (só se existe)
          {
            $lookup: {
              from: 'Instrument',
              localField: 'instrumentId',
              foreignField: '_id',
              as: 'instrument',
              pipeline: [
                {
                  $project: {
                    _id: { $toString: '$_id' },
                    name: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'Epoch',
              localField: 'epochId',
              foreignField: '_id',
              as: 'epoch',
              pipeline: [
                {
                  $project: {
                    _id: { $toString: '$_id' },
                    name: 1,
                  },
                },
              ],
            },
          },
          { $unwind: { path: '$epoch', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: { $toString: '$_id' },
              title: 1,
              subtitle: 1,
              opOrCatalog: 1,
              compositionYear: 1,
              tone: 1,
              mediaDuration: 1,
              workType: 1,
              isPartOfCollection: 1,
              isVerified: 1,
              composer: {
                id: '$composer._id',
                name: '$composer.name',
                fullName: '$composer.fullName',
                epochName: '$composer.epochName',
              },
              instrument: {
                $cond: {
                  if: { $gt: [{ $size: '$instrument' }, 0] },
                  then: { $arrayElemAt: ['$instrument', 0] },
                  else: null,
                },
              },
              epoch: {
                $cond: {
                  if: '$epoch',
                  then: { id: '$epoch._id', name: '$epoch.name' },
                  else: { id: '', name: 'Desconhecida' },
                },
              },
            },
          },
          { $sort: { title: 1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      });

      const works = Array.isArray(result) ? result : [];

      // Count separado para performance
      const totalCount = await prisma.work.count({
        where: buildWhereClause(filters),
      });

      const formattedWorks = works.map((work: any) => ({
        id: work._id,
        title: work.title,
        subtitle: work.subtitle || undefined,
        opOrCatalog: work.opOrCatalog || undefined,
        compositionYear: work.compositionYear || undefined,
        tone: work.tone || undefined,
        mediaDuration: work.mediaDuration || undefined,
        workType: work.workType,
        isPartOfCollection: work.isPartOfCollection,
        isVerified: work.isVerified,
        composer: work.composer,
        instrument: work.instrument,
        epoch: work.epoch,
      }));

      console.log(
        `✅ Query filtro simples (aggregation): ${formattedWorks.length} obras`
      );

      return {
        works: formattedWorks,
        totalCount,
        hasMore: skip + works.length < totalCount,
      };
    } catch (error) {
      console.error('❌ Agregação simples falhou, usando fallback:', error);
      return await fallbackPrismaQuery(skip, limit, filters);
    }
  },
  ['works-simple-filter-hybrid'],
  {
    revalidate: CACHE_CONFIG.WORKS_FILTERED,
    tags: ['works-simple-filter-hybrid'],
  }
);

// 🚀 CACHE 3: COM BUSCA TEXTUAL - Otimizado para texto
const getCachedWorksWithSearch = unstable_cache(
  async (
    skip: number,
    limit: number,
    filters: any
  ): Promise<WorksListResponse> => {
    console.log('🔍 Query com BUSCA textual (aggregation otimizada)');

    try {
      const searchTerm = filters.search.trim();
      const searchPattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const result = await prisma.work.aggregateRaw({
        pipeline: [
          // Match inicial por texto
          {
            $match: {
              $or: [
                { title: { $regex: searchPattern, $options: 'i' } },
                { subtitle: { $regex: searchPattern, $options: 'i' } },
                { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
              ],
            },
          },
          // Lookup para composer
          {
            $lookup: {
              from: 'Composer',
              localField: 'composerId',
              foreignField: '_id',
              as: 'composer',
              pipeline: [
                {
                  $project: {
                    _id: { $toString: '$_id' },
                    name: 1,
                    fullName: 1,
                    epochName: 1,
                  },
                },
              ],
            },
          },
          { $unwind: '$composer' },
          // Match adicional incluindo compositor
          {
            $match: {
              $or: [
                { title: { $regex: searchPattern, $options: 'i' } },
                { subtitle: { $regex: searchPattern, $options: 'i' } },
                { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
                { 'composer.name': { $regex: searchPattern, $options: 'i' } },
                {
                  'composer.fullName': { $regex: searchPattern, $options: 'i' },
                },
              ],
            },
          },
          // Lookups para instrument e epoch
          {
            $lookup: {
              from: 'Instrument',
              localField: 'instrumentId',
              foreignField: '_id',
              as: 'instrument',
            },
          },
          {
            $lookup: {
              from: 'Epoch',
              localField: 'epochId',
              foreignField: '_id',
              as: 'epoch',
            },
          },
          // Project com priorização de resultados
          {
            $project: {
              _id: { $toString: '$_id' },
              title: 1,
              subtitle: 1,
              opOrCatalog: 1,
              compositionYear: 1,
              tone: 1,
              mediaDuration: 1,
              workType: 1,
              isPartOfCollection: 1,
              isVerified: 1,
              composer: {
                id: '$composer._id',
                name: '$composer.name',
                fullName: '$composer.fullName',
                epochName: '$composer.epochName',
              },
              instrument: {
                $cond: {
                  if: { $gt: [{ $size: '$instrument' }, 0] },
                  then: {
                    $let: {
                      vars: { inst: { $arrayElemAt: ['$instrument', 0] } },
                      in: { name: '$$inst.name' },
                    },
                  },
                  else: null,
                },
              },
              epoch: {
                $cond: {
                  if: { $gt: [{ $size: '$epoch' }, 0] },
                  then: {
                    $let: {
                      vars: { ep: { $arrayElemAt: ['$epoch', 0] } },
                      in: { id: { $toString: '$$ep._id' }, name: '$$ep.name' },
                    },
                  },
                  else: { id: '', name: 'Desconhecida' },
                },
              },
              // Prioridade: título > opus > compositor
              sortPriority: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: '$title',
                      regex: searchPattern,
                      options: 'i',
                    },
                  },
                  then: 1,
                  else: {
                    $cond: {
                      if: {
                        $regexMatch: {
                          input: '$opOrCatalog',
                          regex: searchPattern,
                          options: 'i',
                        },
                      },
                      then: 2,
                      else: 3,
                    },
                  },
                },
              },
            },
          },
          { $sort: { sortPriority: 1, title: 1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      });

      const works = Array.isArray(result) ? result : [];

      // Count otimizado para busca
      const totalCount = await getSearchCount(searchTerm);

      const formattedWorks = works.map((work: any) => ({
        id: work._id,
        title: work.title,
        subtitle: work.subtitle || undefined,
        opOrCatalog: work.opOrCatalog || undefined,
        compositionYear: work.compositionYear || undefined,
        tone: work.tone || undefined,
        mediaDuration: work.mediaDuration || undefined,
        workType: work.workType,
        isPartOfCollection: work.isPartOfCollection,
        isVerified: work.isVerified,
        composer: work.composer,
        instrument: work.instrument,
        epoch: work.epoch,
      }));

      console.log(`✅ Query busca textual: ${formattedWorks.length} obras`);

      return {
        works: formattedWorks,
        totalCount,
        hasMore: skip + works.length < totalCount,
      };
    } catch (error) {
      console.error('❌ Busca textual falhou, usando fallback:', error);
      return await fallbackPrismaQuery(skip, limit, filters);
    }
  },
  ['works-search-hybrid'],
  {
    revalidate: CACHE_CONFIG.WORKS_SEARCH,
    tags: ['works-search-hybrid'],
  }
);

// 🚀 CACHE 4: FILTROS COMPLEXOS - Para múltiplos filtros
const getCachedWorksComplexFilter = unstable_cache(
  async (
    skip: number,
    limit: number,
    filters: any
  ): Promise<WorksListResponse> => {
    console.log('🔧 Query com filtros COMPLEXOS (fallback otimizado)');

    // Para filtros complexos, usar Prisma otimizado
    return await fallbackPrismaQuery(skip, limit, filters);
  },
  ['works-complex-filter-hybrid'],
  {
    revalidate: CACHE_CONFIG.WORKS_FILTERED,
    tags: ['works-complex-filter-hybrid'],
  }
);

// 🚀 HELPERS OTIMIZADOS

// Batch loading de compositores
const getBatchComposers = async (composerIds: string[]) => {
  if (composerIds.length === 0) return [];

  return await prisma.composer.findMany({
    where: { id: { in: composerIds } },
    select: {
      id: true,
      name: true,
      fullName: true,
      epochName: true,
    },
  });
};

// Batch loading de instrumentos
const getBatchInstruments = async (instrumentIds: string[]) => {
  if (instrumentIds.length === 0) return [];

  return await prisma.instrument.findMany({
    where: { id: { in: instrumentIds } },
    select: {
      id: true,
      name: true,
    },
  });
};

// Batch loading de épocas
const getBatchEpochs = async (epochIds: string[]) => {
  if (epochIds.length === 0) return [];

  return await prisma.epoch.findMany({
    where: { id: { in: epochIds } },
    select: {
      id: true,
      name: true,
    },
  });
};

// Count otimizado para busca
const getSearchCount = async (searchTerm: string): Promise<number> => {
  const searchPattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    const result = await prisma.work.aggregateRaw({
      pipeline: [
        {
          $match: {
            $or: [
              { title: { $regex: searchPattern, $options: 'i' } },
              { subtitle: { $regex: searchPattern, $options: 'i' } },
              { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
            ],
          },
        },
        {
          $lookup: {
            from: 'Composer',
            localField: 'composerId',
            foreignField: '_id',
            as: 'composer',
          },
        },
        { $unwind: '$composer' },
        {
          $match: {
            $or: [
              { title: { $regex: searchPattern, $options: 'i' } },
              { subtitle: { $regex: searchPattern, $options: 'i' } },
              { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
              { 'composer.name': { $regex: searchPattern, $options: 'i' } },
              { 'composer.fullName': { $regex: searchPattern, $options: 'i' } },
            ],
          },
        },
        { $count: 'total' },
      ],
    });

    return Array.isArray(result) && result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('❌ Count otimizado falhou:', error);
    return 0;
  }
};

// Build where clause para Prisma
const buildWhereClause = (filters: any) => {
  const whereClause: any = {};

  if (filters.composerId) whereClause.composerId = filters.composerId;
  if (filters.instrumentId) whereClause.instrumentId = filters.instrumentId;
  if (filters.epochId) whereClause.epochId = filters.epochId;
  if (filters.difficultyLevel)
    whereClause.difficultyLevel = filters.difficultyLevel;

  if (filters.categoryNames) {
    whereClause.categoryNames = { has: filters.categoryNames };
  }
  if (filters.workGenresArr) {
    whereClause.workGenresArr = { has: filters.workGenresArr };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
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

  return whereClause;
};

// Fallback otimizado com Prisma
const fallbackPrismaQuery = async (
  skip: number,
  limit: number,
  filters: any
): Promise<WorksListResponse> => {
  console.log('🔄 Usando fallback Prisma otimizado');

  const whereClause = buildWhereClause(filters);

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
      orderBy: [{ title: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.work.count({ where: whereClause }),
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
      isVerified: work.isVerified,
      composer: {
        id: work.composer.id,
        name: work.composer.name,
        fullName: work.composer.fullName,
        epochName: work.composer.epochName,
      },
      instrument: work.instrument,
      epoch: work.epoch,
    })),
    totalCount,
    hasMore: skip + works.length < totalCount,
  };
};

// 🚀 CACHE PARA CONTAGEM TOTAL
const getCachedTotalCount = unstable_cache(
  async (): Promise<number> => {
    console.log('📊 Calculando total count (cache miss)');

    try {
      const result = await prisma.work.aggregate({
        _count: { id: true },
      });
      return result._count.id;
    } catch (error) {
      console.error('❌ Erro no count:', error);
      return await prisma.work.count();
    }
  },
  ['total-works-count-hybrid'],
  {
    revalidate: CACHE_CONFIG.COUNT,
    tags: ['total-works-count-hybrid'],
  }
);

// 🚀 FILTROS ULTRA OTIMIZADOS - Mantém compatibilidade mas melhora performance
export const getFilterOptions = unstable_cache(
  async (): Promise<FilterOptions> => {
    try {
      console.log('🔍 Carregando filtros (híbrido otimizado)');

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
      console.error('❌ Erro ao buscar filtros:', error);
      return {
        instruments: [],
        epochs: [],
        workGenres: [],
        popularComposers: [],
        difficultyLevels: DIFFICULTY_LEVELS,
      };
    }
  },
  ['filter-options-hybrid'],
  {
    revalidate: CACHE_CONFIG.FILTERS,
    tags: ['filter-options-hybrid'],
  }
);

// Caches individuais para filtros
const getCachedInstruments = unstable_cache(
  async () => {
    return await prisma.instrument.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 50,
    });
  },
  ['instruments-cache-hybrid'],
  { revalidate: CACHE_CONFIG.FILTERS, tags: ['instruments-cache-hybrid'] }
);

const getCachedEpochs = unstable_cache(
  async () => {
    return await prisma.epoch.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  },
  ['epochs-cache-hybrid'],
  { revalidate: CACHE_CONFIG.FILTERS, tags: ['epochs-cache-hybrid'] }
);

const getCachedWorkGenres = unstable_cache(
  async () => {
    return await prisma.workGenre.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 30,
    });
  },
  ['work-genres-cache-hybrid'],
  { revalidate: CACHE_CONFIG.FILTERS, tags: ['work-genres-cache-hybrid'] }
);

const getCachedPopularComposers = unstable_cache(
  async () => {
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
      take: 25,
    });

    return popularComposers.map((composer) => ({
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName || undefined,
      worksCount: composer._count.works,
    }));
  },
  ['popular-composers-cache-hybrid'],
  { revalidate: CACHE_CONFIG.FILTERS, tags: ['popular-composers-cache-hybrid'] }
);

// Constantes
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
];

// 🚀 INVALIDAÇÃO INTELIGENTE DE CACHE
export async function revalidateWorkCache(workId?: string) {
  const { revalidateTag } = await import('next/cache');

  // Tags híbridas
  revalidateTag('works-default-hybrid');
  revalidateTag('works-simple-filter-hybrid');
  revalidateTag('works-search-hybrid');
  revalidateTag('works-complex-filter-hybrid');
  revalidateTag('total-works-count-hybrid');
  revalidateTag('filter-options-hybrid');

  // Tags individuais de filtros
  revalidateTag('instruments-cache-hybrid');
  revalidateTag('epochs-cache-hybrid');
  revalidateTag('work-genres-cache-hybrid');
  revalidateTag('popular-composers-cache-hybrid');

  if (workId) {
    revalidateTag(`work-${workId}`);
  }

  console.log('🔄 Cache híbrido de obras invalidado');
}

// 🚀 FUNÇÕES DE COMPATIBILIDADE (mantidas para não quebrar código existente)
export const getWorkById = async (
  workId: string
): Promise<WorkDetails | null> => {
  // Implementação mantida igual...
  try {
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: {
        composer: true,
        instrument: true,
        epoch: true,
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
      tempoMarking: work.tempoMarking || undefined,
      movementsDetailed: work.movementsDetailed || undefined,
      difficultyLevel: work.difficultyLevel || undefined,
      createdAt: work.createdAt,
      composer: work.composer,
      instrument: work.instrument,
      epoch: work.epoch,
      categoryNames: work.categoryNames,
      workGenresArr: work.workGenresArr,
      isVerified: work.isVerified,
      spotifyTrackId: work.spotifyTrackId || undefined,
      spotifyTrackUrl: work.spotifyTrackUrl || undefined,
      youtubeVideoId: work.youtubeVideoId || undefined,
      youtubeVideoUrl: work.youtubeVideoUrl || undefined,
      youtubeTitle: work.youtubeTitle || undefined,
      videoAulaUrl: work.videoAulaUrl || undefined,
      videoAulaFile: work.videoAulaFile || undefined,
      videoAulaTitle: work.videoAulaTitle || undefined,
      videoAulaType: work.videoAulaType || undefined,
      videoAulaAddedBy: work.videoAulaAddedBy || undefined,
      videoAulaAddedAt: work.videoAulaAddedAt || undefined,
      videoAulaMetadata: work.videoAulaMetadata || undefined,
      lastMediaSearch: work.lastMediaSearch || undefined,
      mediaSearchError: work.mediaSearchError || undefined,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar obra:', error);
    return null;
  }
};

export const searchWorkGenres = async (
  searchTerm: string = '',
  limit: number = 20
) => {
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

export const getAllWorkGenres = unstable_cache(
  async () => {
    try {
      return await prisma.workGenre.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('❌ Erro ao buscar todos os gêneros:', error);
      return [];
    }
  },
  ['all-work-genres-hybrid'],
  { revalidate: CACHE_CONFIG.FILTERS, tags: ['all-work-genres-hybrid'] }
);

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
  ['instruments-list-hybrid'],
  { revalidate: CACHE_CONFIG.FILTERS, tags: ['instruments-list-hybrid'] }
);
