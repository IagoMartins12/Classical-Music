// app/api/admin/works/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import { getPeriodDate } from '@/app/utils/adminUtils';

interface WorkFilters {
  search?: string;
  composerId?: string;
  epochId?: string;
  instrumentId?: string;
  workType?: string;
  difficultyLevel?: string;
  minFavorites?: number;
  minWantToLearn?: number;
  minLearned?: number;
  minScores?: number;
  maxScores?: number;
  hasScores?: boolean;
  sortBy?:
    | 'title'
    | 'createdAt'
    | 'favoritesCount'
    | 'annotationsCount'
    | 'wantToLearnCount'
    | 'learnedCount'
    | 'scoresCount';
  sortOrder?: 'asc' | 'desc';
  period?: TimePeriod;
  page?: number;
  limit?: number;
}

interface WorkStats {
  total: number;
  byEpoch: Array<{
    epoch: string;
    count: number;
  }>;
  byInstrument: Array<{
    instrument: string;
    count: number;
  }>;
  byDifficulty: Array<{
    difficulty: string;
    count: number;
  }>;
  avgScoresPerWork: number;
  avgFavoritesPerWork: number;
  mostPopular: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    annotationsCount: number;
  }>;
  mostWantedToLearn: Array<{
    id: string;
    title: string;
    composer: string;
    wantToLearnCount: number;
  }>;
  mostLearned: Array<{
    id: string;
    title: string;
    composer: string;
    learnedCount: number;
  }>;
  recentlyAdded: number;
  withoutScores: number;
  topByScores: Array<{
    id: string;
    title: string;
    composer: string;
    scoresCount: number;
  }>;
}

const getCachedWorkStats = async (
  period: TimePeriod = '7d'
): Promise<WorkStats> => {
  const periodDate = getPeriodDate(period);
  const whereClause = periodDate ? { createdAt: { gte: periodDate } } : {};
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    total,
    byEpoch,
    byInstrument,
    byDifficulty,
    totalScores,
    totalFavorites,
    mostPopular,
    mostWantedToLearn,
    mostLearned,
    recentlyAdded,
    withoutScores,
    topByScores,
  ] = await Promise.all([
    // Total de obras no período
    prisma.work.count({ where: whereClause }),

    // Por época
    prisma.work.groupBy({
      by: ['epochId'],
      _count: { id: true },
      where: whereClause,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Por instrumento
    prisma.work.groupBy({
      by: ['instrumentId'],
      _count: { id: true },
      where: whereClause,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Por dificuldade
    prisma.work.groupBy({
      by: ['difficultyLevel'],
      _count: { id: true },
      where: whereClause,
    }),

    // Total de partituras ativas
    prisma.workScore.count({
      where: {
        isActive: true,
        work: whereClause,
      },
    }),

    // Total de favoritos
    prisma.favoriteWork.count({
      where: {
        work: whereClause,
      },
    }),

    // Mais populares por favoritos
    prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
        _count: {
          select: {
            favoriteBy: true,
            workAnnotations: { where: { isPublic: true } },
          },
        },
      },
      where: whereClause,
      orderBy: {
        favoriteBy: { _count: 'desc' },
      },
      take: 10,
    }),

    // Mais queridas para aprender
    prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
        _count: {
          select: {
            wantToLearners: true,
          },
        },
      },
      where: whereClause,
      orderBy: {
        wantToLearners: { _count: 'desc' },
      },
      take: 10,
    }),

    // Mais aprendidas
    prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
        _count: {
          select: {
            learners: true,
          },
        },
      },
      where: whereClause,
      orderBy: {
        learners: { _count: 'desc' },
      },
      take: 10,
    }),

    // Adicionadas na última semana (sempre)
    prisma.work.count({
      where: { createdAt: { gte: lastWeek } },
    }),

    // Obras sem partituras
    prisma.work.count({
      where: {
        ...whereClause,
        cachedScores: { none: { isActive: true } },
      },
    }),

    // Top por número de partituras
    prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
        _count: {
          select: {
            cachedScores: { where: { isActive: true } },
          },
        },
      },
      where: whereClause,
      orderBy: {
        cachedScores: { _count: 'desc' },
      },
      take: 10,
    }),
  ]);

  // Buscar nomes das épocas e instrumentos
  const [epochs, instruments] = await Promise.all([
    prisma.epoch.findMany({ select: { id: true, name: true } }),
    prisma.instrument.findMany({ select: { id: true, name: true } }),
  ]);

  const epochMap = new Map(epochs.map((e) => [e.id, e.name]));
  const instrumentMap = new Map(instruments.map((i) => [i.id, i.name]));

  return {
    total,
    byEpoch: byEpoch.map((item) => ({
      epoch: epochMap.get(item.epochId) || 'Desconhecido',
      count: item._count.id,
    })),
    byInstrument: byInstrument.map((item) => ({
      instrument: instrumentMap.get(item.instrumentId) || 'Desconhecido',
      count: item._count.id,
    })),
    byDifficulty: byDifficulty.map((item) => ({
      difficulty: item.difficultyLevel || 'Não definido',
      count: item._count.id,
    })),
    avgScoresPerWork: total > 0 ? totalScores / total : 0,
    avgFavoritesPerWork: total > 0 ? totalFavorites / total : 0,
    mostPopular: mostPopular.map((work) => ({
      id: work.id,
      title: work.title,
      composer: work.composer.name,
      favoritesCount: work._count.favoriteBy,
      annotationsCount: work._count.workAnnotations,
    })),
    mostWantedToLearn: mostWantedToLearn.map((work) => ({
      id: work.id,
      title: work.title,
      composer: work.composer.name,
      wantToLearnCount: work._count.wantToLearners,
    })),
    mostLearned: mostLearned.map((work) => ({
      id: work.id,
      title: work.title,
      composer: work.composer.name,
      learnedCount: work._count.learners,
    })),
    recentlyAdded,
    withoutScores,
    topByScores: topByScores.map((work) => ({
      id: work.id,
      title: work.title,
      composer: work.composer.name,
      scoresCount: work._count.cachedScores,
    })),
  };
};

const getWorksList = async (filters: WorkFilters) => {
  const {
    search,
    composerId,
    epochId,
    instrumentId,
    workType,
    difficultyLevel,
    minFavorites,
    minWantToLearn,
    minLearned,
    minScores,
    maxScores,
    hasScores,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    period = '7d',
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause: any = {};

  // Aplicar filtro de período
  const periodDate = getPeriodDate(period);
  if (periodDate) {
    whereClause.createdAt = { gte: periodDate };
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { opOrCatalog: { contains: search, mode: 'insensitive' } },
      { composer: { name: { contains: search, mode: 'insensitive' } } },
      { instrumentation: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (composerId && composerId !== 'all') {
    whereClause.composerId = composerId;
  }

  if (epochId && epochId !== 'all') {
    whereClause.epochId = epochId;
  }

  if (instrumentId && instrumentId !== 'all') {
    whereClause.instrumentId = instrumentId;
  }

  if (workType && workType !== 'all') {
    whereClause.workType = workType;
  }

  if (difficultyLevel && difficultyLevel !== 'all') {
    whereClause.difficultyLevel = difficultyLevel;
  }

  // Filtros por contagens
  if (
    minFavorites !== undefined ||
    minWantToLearn !== undefined ||
    minLearned !== undefined ||
    minScores !== undefined ||
    maxScores !== undefined ||
    hasScores !== undefined
  ) {
    whereClause.AND = [];

    if (minFavorites !== undefined) {
      whereClause.AND.push({
        favoriteBy: { _count: { gte: minFavorites } },
      });
    }

    if (minWantToLearn !== undefined) {
      whereClause.AND.push({
        wantToLearners: { _count: { gte: minWantToLearn } },
      });
    }

    if (minLearned !== undefined) {
      whereClause.AND.push({
        learners: { _count: { gte: minLearned } },
      });
    }

    if (minScores !== undefined || maxScores !== undefined) {
      const scoresFilter: any = {};
      if (minScores !== undefined) scoresFilter.gte = minScores;
      if (maxScores !== undefined) scoresFilter.lte = maxScores;

      whereClause.AND.push({
        cachedScores: {
          _count: scoresFilter,
          where: { isActive: true },
        },
      });
    }

    if (hasScores !== undefined) {
      if (hasScores) {
        whereClause.AND.push({
          cachedScores: { some: { isActive: true } },
        });
      } else {
        whereClause.AND.push({
          cachedScores: { none: { isActive: true } },
        });
      }
    }
  }

  const [works, totalCount] = await Promise.all([
    prisma.work.findMany({
      where: whereClause,
      include: {
        composer: { select: { name: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
        createdByUser: {
          select: { firstName: true, lastName: true, email: true },
        },
        _count: {
          select: {
            favoriteBy: true,
            workAnnotations: { where: { isPublic: true } },
            cachedScores: { where: { isActive: true } },
            wantToLearners: true,
            learners: true,
          },
        },
      },
      orderBy: {
        [sortBy === 'favoritesCount'
          ? 'favoriteBy'
          : sortBy === 'annotationsCount'
          ? 'workAnnotations'
          : sortBy === 'scoresCount'
          ? 'cachedScores'
          : sortBy === 'wantToLearnCount'
          ? 'wantToLearners'
          : sortBy === 'learnedCount'
          ? 'learners'
          : sortBy]: [
          'favoritesCount',
          'annotationsCount',
          'scoresCount',
          'wantToLearnCount',
          'learnedCount',
        ].includes(sortBy)
          ? { _count: sortOrder }
          : sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.work.count({ where: whereClause }),
  ]);

  return {
    works: works.map((work) => ({
      id: work.id,
      title: work.title,
      composer: work.composer.name,
      epoch: work.epoch.name,
      instrument: work.instrument.name,
      opOrCatalog: work.opOrCatalog,
      compositionYear: work.compositionYear,
      workType: work.workType,
      difficultyLevel: work.difficultyLevel,
      favoritesCount: work._count.favoriteBy,
      annotationsCount: work._count.workAnnotations,
      scoresCount: work._count.cachedScores,
      wantToLearnCount: work._count.wantToLearners,
      learnedCount: work._count.learners,
      createdAt: work.createdAt,
      uploader: work.createdByUser
        ? `${work.createdByUser.firstName || ''} ${
            work.createdByUser.lastName || ''
          }`.trim() || work.createdByUser.email
        : null,
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasMore: skip + works.length < totalCount,
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    if (action === 'stats') {
      const period = (searchParams.get('period') as TimePeriod) || '7d';
      const stats = await getCachedWorkStats(period);
      return NextResponse.json({
        success: true,
        stats,
        period,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      const filters: WorkFilters = {
        search: searchParams.get('search') || undefined,
        composerId: searchParams.get('composerId') || undefined,
        epochId: searchParams.get('epochId') || undefined,
        instrumentId: searchParams.get('instrumentId') || undefined,
        workType: searchParams.get('workType') || undefined,
        difficultyLevel: searchParams.get('difficultyLevel') || undefined,
        minFavorites: searchParams.get('minFavorites')
          ? parseInt(searchParams.get('minFavorites')!)
          : undefined,
        minWantToLearn: searchParams.get('minWantToLearn')
          ? parseInt(searchParams.get('minWantToLearn')!)
          : undefined,
        minLearned: searchParams.get('minLearned')
          ? parseInt(searchParams.get('minLearned')!)
          : undefined,
        minScores: searchParams.get('minScores')
          ? parseInt(searchParams.get('minScores')!)
          : undefined,
        maxScores: searchParams.get('maxScores')
          ? parseInt(searchParams.get('maxScores')!)
          : undefined,
        hasScores:
          searchParams.get('hasScores') === 'true'
            ? true
            : searchParams.get('hasScores') === 'false'
            ? false
            : undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        period: (searchParams.get('period') as TimePeriod) || '7d',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
      };

      const result = await getWorksList(filters);

      return NextResponse.json({
        success: true,
        ...result,
        filters,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de obras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoints UPDATE e DELETE permanecem similares...
