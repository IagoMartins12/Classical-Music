// app/api/admin/composers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ComposerFilters {
  search?: string;
  epoch?: string;
  verified?: boolean;
  dataQuality?: string;
  sortBy?: 'name' | 'createdAt' | 'worksCount' | 'favoritesCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const getCachedComposerStats = async () => {
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, verified, byEpochRaw, byQuality, recentlyAdded, mostPopular] =
    await Promise.all([
      prisma.composer.count(),
      prisma.composer.count({ where: { isVerified: true } }),
      prisma.composer.groupBy({
        by: ['epochId'],
        _count: { id: true },
      }),
      prisma.composer.groupBy({
        by: ['dataQuality'],
        _count: { id: true },
      }),
      prisma.composer.count({
        where: { createdAt: { gte: lastWeek } },
      }),
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
        orderBy: {
          favoriteByUsers: { _count: 'desc' },
        },
        take: 10,
      }),
    ]);

  // Buscar os nomes das épocas separadamente
  const epochIds = byEpochRaw.map((e) => e.epochId);
  const epochNames = await prisma.epoch.findMany({
    where: { id: { in: epochIds } },
    select: { id: true, name: true },
  });

  const epochMap = new Map(epochNames.map((e) => [e.id, e.name]));

  return {
    total,
    verified,
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
  };
};

const getComposersList = async (filters: ComposerFilters) => {
  const {
    search,
    epoch,
    verified,
    dataQuality,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { otherName: { contains: search, mode: 'insensitive' } },
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
      const stats = await getCachedComposerStats();
      return NextResponse.json({
        success: true,
        stats,
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
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
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

// Endpoint para atualizar compositor
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

// Endpoint para deletar compositor
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
