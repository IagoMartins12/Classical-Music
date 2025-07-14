// app/api/admin/works/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface WorkFilters {
  search?: string;
  composerId?: string;
  epochId?: string;
  instrumentId?: string;
  workType?: string;
  difficultyLevel?: string;
  sortBy?: 'title' | 'createdAt' | 'favoritesCount' | 'annotationsCount';
  sortOrder?: 'asc' | 'desc';
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
  mostPopular: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    annotationsCount: number;
  }>;
  recentlyAdded: number;
}

const getCachedWorkStats = unstable_cache(
  async (): Promise<WorkStats> => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      byEpoch,
      byInstrument,
      byDifficulty,
      totalScores,
      mostPopular,
      recentlyAdded,
    ] = await Promise.all([
      prisma.work.count(),
      prisma.work.groupBy({
        by: ['epochId'],
        _count: { id: true },
      }),
      prisma.work.groupBy({
        by: ['instrumentId'],
        _count: { id: true },
      }),
      prisma.work.groupBy({
        by: ['difficultyLevel'],
        _count: { id: true },
      }),
      prisma.workScore.count({ where: { isActive: true } }),
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
        orderBy: {
          favoriteBy: { _count: 'desc' },
        },
        take: 10,
      }),
      prisma.work.count({
        where: { createdAt: { gte: lastWeek } },
      }),
    ]);

    // Buscar nomes das épocas, instrumentos
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
      mostPopular: mostPopular.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer.name,
        favoritesCount: work._count.favoriteBy,
        annotationsCount: work._count.workAnnotations,
      })),
      recentlyAdded,
    };
  },
  ['admin-work-stats'],
  { revalidate: 600 }
);

const getWorksList = async (filters: WorkFilters) => {
  const {
    search,
    composerId,
    epochId,
    instrumentId,
    workType,
    difficultyLevel,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { opOrCatalog: { contains: search, mode: 'insensitive' } },
      { composer: { name: { contains: search, mode: 'insensitive' } } },
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
            studySessions: true,
          },
        },
      },
      orderBy: {
        [sortBy === 'favoritesCount'
          ? 'favoriteBy'
          : sortBy === 'annotationsCount'
          ? 'workAnnotations'
          : sortBy]:
          sortBy === 'favoritesCount' || sortBy === 'annotationsCount'
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
      studySessionsCount: work._count.studySessions,
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
      const stats = await getCachedWorkStats();
      return NextResponse.json({
        success: true,
        stats,
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
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
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

// Endpoints UPDATE e DELETE similares ao de compositores...
