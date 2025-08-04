// app/api/admin/scores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface ScoreFilters {
  search?: string;
  workId?: string;
  source?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: 'title' | 'createdAt' | 'accessCount' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface ScoreStats {
  total: number;
  active: number;
  bySource: Array<{
    source: string;
    count: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
  }>;
  totalSize: string;
  averagePerWork: number;
  mostAccessed: Array<{
    id: string;
    title: string;
    workTitle: string;
    accessCount: number;
  }>;
  recentlyAdded: number;
}

const getCachedScoreStats = unstable_cache(
  async (): Promise<ScoreStats> => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      active,
      bySource,
      byType,
      mostAccessed,
      recentlyAdded,
      totalWorks,
    ] = await Promise.all([
      prisma.workScore.count(),
      prisma.workScore.count({ where: { isActive: true } }),
      prisma.workScore.groupBy({
        by: ['source'],
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.workScore.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.workScore.findMany({
        select: {
          id: true,
          title: true,
          accessCount: true,
          work: {
            select: { title: true },
          },
        },
        where: { isActive: true },
        orderBy: { accessCount: 'desc' },
        take: 10,
      }),
      prisma.workScore.count({
        where: {
          createdAt: { gte: lastWeek },
          isActive: true,
        },
      }),
      prisma.work.count(),
    ]);

    // Calcular tamanho total (simulado)
    const totalSizeGB = total * 1; // Estimativa de 2.5MB por partitura
    const totalSize =
      totalSizeGB > 1000
        ? `${(totalSizeGB / 1000).toFixed(1)} TB`
        : `${totalSizeGB.toFixed(1)} GB`;

    return {
      total,
      active,
      bySource: bySource.map((item) => ({
        source: item.source,
        count: item._count.id,
      })),
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
      totalSize,
      averagePerWork: totalWorks > 0 ? active / totalWorks : 0,
      mostAccessed: mostAccessed.map((score) => ({
        id: score.id,
        title: score.title,
        workTitle: score.work.title,
        accessCount: score.accessCount,
      })),
      recentlyAdded,
    };
  },
  ['admin-score-stats'],
  { revalidate: 600 }
);

const getScoresList = async (filters: ScoreFilters) => {
  const {
    search,
    workId,
    source,
    type,
    isActive,
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
      { work: { title: { contains: search, mode: 'insensitive' } } },
      {
        work: { composer: { name: { contains: search, mode: 'insensitive' } } },
      },
    ];
  }

  if (workId && workId !== 'all') {
    whereClause.workId = workId;
  }

  if (source && source !== 'all') {
    whereClause.source = source;
  }

  if (type && type !== 'all') {
    whereClause.type = type;
  }

  if (isActive !== undefined) {
    whereClause.isActive = isActive;
  }

  const [scores, totalCount] = await Promise.all([
    prisma.workScore.findMany({
      where: whereClause,
      include: {
        work: {
          select: {
            id: true,
            title: true,
            composer: { select: { name: true } },
          },
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.workScore.count({ where: whereClause }),
  ]);

  return {
    scores: scores.map((score) => ({
      id: score.id,
      title: score.title,
      workTitle: score.work.title,
      composerName: score.work.composer.name,
      source: score.source,
      type: score.type,
      fileSize: score.fileSize,
      pageCount: score.pageCount,
      downloadUrl: score.downloadUrl,
      thumbnailUrl: score.thumbnailUrl,
      isActive: score.isActive,
      accessCount: score.accessCount,
      createdAt: score.createdAt,
      uploader: score.createdByUser
        ? `${score.createdByUser.firstName || ''} ${
            score.createdByUser.lastName || ''
          }`.trim() || score.createdByUser.email
        : null,
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasMore: skip + scores.length < totalCount,
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
      const stats = await getCachedScoreStats();
      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      const filters: ScoreFilters = {
        search: searchParams.get('search') || undefined,
        workId: searchParams.get('workId') || undefined,
        source: searchParams.get('source') || undefined,
        type: searchParams.get('type') || undefined,
        isActive:
          searchParams.get('isActive') === 'true'
            ? true
            : searchParams.get('isActive') === 'false'
            ? false
            : undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
      };

      const result = await getScoresList(filters);

      return NextResponse.json({
        success: true,
        ...result,
        filters,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de partituras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar partitura
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('id');

    if (!scoreId) {
      return NextResponse.json({ error: 'Score ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { isActive, qualityScore, dataQuality } = body;

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (qualityScore !== undefined) updateData.qualityScore = qualityScore;
    if (dataQuality !== undefined) updateData.dataQuality = dataQuality;

    const updatedScore = await prisma.workScore.update({
      where: { id: scoreId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      score: updatedScore,
      message: 'Partitura atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
