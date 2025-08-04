// app/api/admin/composers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import { getPeriodDate } from '@/app/utils/adminUtils';

interface ComposerFilters {
  search?: string;
  epoch?: string;
  verified?: boolean;
  dataQuality?: string;
  hasImage?: boolean;
  minWorks?: number;
  maxWorks?: number;
  minFavorites?: number;
  sortBy?: 'name' | 'createdAt' | 'worksCount' | 'favoritesCount';
  sortOrder?: 'asc' | 'desc';
  period?: TimePeriod;
  page?: number;
  limit?: number;
}

const getCachedComposerStats = async (period: TimePeriod = '7d') => {
  const periodDate = getPeriodDate(period);
  const whereClause = periodDate ? { createdAt: { gte: periodDate } } : {};

  const [
    total,
    verified,
    withImages,
    withoutImages,
    byEpochRaw,
    byQuality,
    recentlyAdded,
    mostPopular,
    totalWorks,
    topByWorks,
  ] = await Promise.all([
    // Total de compositores no período
    prisma.composer.count({ where: whereClause }),

    // Verificados no período
    prisma.composer.count({
      where: { ...whereClause, isVerified: true },
    }),

    // Com imagens válidas
    prisma.composer.count({
      where: { ...whereClause, hasValidImage: true },
    }),

    // Sem imagens válidas
    prisma.composer.count({
      where: { ...whereClause, hasValidImage: false },
    }),

    // Por época
    prisma.composer.groupBy({
      by: ['epochId'],
      _count: { id: true },
      where: whereClause,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Por qualidade
    prisma.composer.groupBy({
      by: ['dataQuality'],
      _count: { id: true },
      where: whereClause,
    }),

    // Adicionados na última semana (sempre)
    prisma.composer.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Mais populares por favoritos
    prisma.composer.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            works: true,
            favoriteByUsers: true,
          },
        },
      },
      where: whereClause,
      orderBy: {
        favoriteByUsers: { _count: 'desc' },
      },
      take: 10,
    }),

    // Total de obras para calcular média
    prisma.work.count({
      where: periodDate
        ? {
            composer: whereClause,
          }
        : {},
    }),

    // Top por número de obras
    prisma.composer.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { works: true },
        },
      },
      where: whereClause,
      orderBy: {
        works: { _count: 'desc' },
      },
      take: 10,
    }),
  ]);

  // Buscar os nomes das épocas
  const epochIds = byEpochRaw.map((e) => e.epochId);
  const epochNames = await prisma.epoch.findMany({
    where: { id: { in: epochIds } },
    select: { id: true, name: true },
  });
  const epochMap = new Map(epochNames.map((e) => [e.id, e.name]));

  return {
    total,
    verified,
    withImages,
    withoutImages,
    byEpoch: byEpochRaw.map((item) => ({
      epoch: epochMap.get(item.epochId) || 'Desconhecido',
      count: item._count.id,
    })),
    byQuality: byQuality.map((item) => ({
      quality: item.dataQuality || 'unknown',
      count: item._count.id,
    })),
    recentlyAdded,
    mostPopular: mostPopular.map((composer) => ({
      id: composer.id,
      name: composer.name,
      worksCount: composer._count.works,
      favoritesCount: composer._count.favoriteByUsers,
    })),
    avgWorksPerComposer: total > 0 ? totalWorks / total : 0,
    topByWorks: topByWorks.map((composer) => ({
      id: composer.id,
      name: composer.name,
      worksCount: composer._count.works,
    })),
  };
};

const getComposersList = async (filters: ComposerFilters) => {
  const {
    search,
    epoch,
    verified,
    dataQuality,
    hasImage,
    minWorks,
    maxWorks,
    minFavorites,
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
      { name: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { otherName: { contains: search, mode: 'insensitive' } },
      { nationality: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (epoch && epoch !== 'all') {
    whereClause.epoch = { name: epoch };
  }

  if (verified !== undefined) {
    whereClause.isVerified = verified;
  }

  if (dataQuality && dataQuality !== 'all') {
    whereClause.dataQuality = dataQuality;
  }

  if (hasImage !== undefined) {
    whereClause.hasValidImage = hasImage;
  }

  // Filtros por contagem de obras e favoritos
  if (
    minWorks !== undefined ||
    maxWorks !== undefined ||
    minFavorites !== undefined
  ) {
    whereClause.AND = [];

    if (minWorks !== undefined || maxWorks !== undefined) {
      const worksFilter: any = {};
      if (minWorks !== undefined) worksFilter.gte = minWorks;
      if (maxWorks !== undefined) worksFilter.lte = maxWorks;

      whereClause.AND.push({
        works: { _count: worksFilter },
      });
    }

    if (minFavorites !== undefined) {
      whereClause.AND.push({
        favoriteByUsers: { _count: { gte: minFavorites } },
      });
    }
  }

  const [composers, totalCount] = await Promise.all([
    prisma.composer.findMany({
      where: whereClause,
      include: {
        epoch: { select: { name: true } },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            works: true,
            favoriteByUsers: true,
          },
        },
      },
      orderBy: {
        [sortBy === 'worksCount'
          ? 'works'
          : sortBy === 'favoritesCount'
          ? 'favoriteByUsers'
          : sortBy]:
          sortBy === 'worksCount' || sortBy === 'favoritesCount'
            ? { _count: sortOrder }
            : sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.composer.count({ where: whereClause }),
  ]);

  return {
    composers: composers.map((composer) => ({
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName,
      epoch: composer.epoch?.name || 'Não definido',
      birthDate: composer.birthDate,
      deathDate: composer.deathDate,
      nationality: composer.nationality,
      isVerified: composer.isVerified,
      dataQuality: composer.dataQuality,
      worksCount: composer._count.works,
      favoritesCount: composer._count.favoriteByUsers,
      portraitUrl: composer.portraitUrl,
      hasValidImage: composer.hasValidImage,
      createdAt: composer.createdAt,
      uploader: composer.createdByUser
        ? `${composer.createdByUser.firstName || ''} ${
            composer.createdByUser.lastName || ''
          }`.trim() || composer.createdByUser.email
        : null,
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasMore: skip + composers.length < totalCount,
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
      const stats = await getCachedComposerStats(period);
      return NextResponse.json({
        success: true,
        stats,
        period,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      const filters: ComposerFilters = {
        search: searchParams.get('search') || undefined,
        epoch: searchParams.get('epoch') || undefined,
        verified:
          searchParams.get('verified') === 'true'
            ? true
            : searchParams.get('verified') === 'false'
            ? false
            : undefined,
        dataQuality: searchParams.get('dataQuality') || undefined,
        hasImage:
          searchParams.get('hasImage') === 'true'
            ? true
            : searchParams.get('hasImage') === 'false'
            ? false
            : undefined,
        minWorks: searchParams.get('minWorks')
          ? parseInt(searchParams.get('minWorks')!)
          : undefined,
        maxWorks: searchParams.get('maxWorks')
          ? parseInt(searchParams.get('maxWorks')!)
          : undefined,
        minFavorites: searchParams.get('minFavorites')
          ? parseInt(searchParams.get('minFavorites')!)
          : undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        period: (searchParams.get('period') as TimePeriod) || '7d',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
      };

      const result = await getComposersList(filters);

      return NextResponse.json({
        success: true,
        ...result,
        filters,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de compositores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoints UPDATE e DELETE permanecem iguais
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const composerId = searchParams.get('id');

    if (!composerId) {
      return NextResponse.json(
        { error: 'Composer ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isVerified, dataQuality, verificationNotes } = body;

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (dataQuality) updateData.dataQuality = dataQuality;
    if (isVerified) {
      updateData.verifiedBy = session.user.id;
      updateData.verifiedAt = new Date();
      updateData.verificationNotes = verificationNotes;
    }

    const updatedComposer = await prisma.composer.update({
      where: { id: composerId },
      data: updateData,
    });

    // Log da ação
    await prisma.uploadHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'composer',
        entityId: composerId,
        action: 'update',
        changes: updateData,
        reason: 'Admin verification',
      },
    });

    return NextResponse.json({
      success: true,
      composer: updatedComposer,
      message: 'Compositor atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const composerId = searchParams.get('id');

    if (!composerId) {
      return NextResponse.json(
        { error: 'Composer ID required' },
        { status: 400 }
      );
    }

    // Verificar se há obras associadas
    const worksCount = await prisma.work.count({
      where: { composerId },
    });

    if (worksCount > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível deletar compositor com obras associadas',
        },
        { status: 400 }
      );
    }

    await prisma.composer.delete({
      where: { id: composerId },
    });

    // Log da ação
    await prisma.uploadHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'composer',
        entityId: composerId,
        action: 'delete',
        reason: 'Admin deletion',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Compositor deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
