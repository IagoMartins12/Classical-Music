// app/api/admin/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface UploadFilters {
  search?: string;
  entityType?: string;
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'entityType' | 'userId';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UploadStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    userName: string;
    createdAt: Date;
  }>;
  timeline: Array<{
    date: string;
    uploads: number;
    approved: number;
    rejected: number;
  }>;
}

const getCachedUploadStats = unstable_cache(
  async (): Promise<UploadStats> => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      total,
      pending,
      approved,
      rejected,
      byType,
      topUploaders,
      recentActivity,
    ] = await Promise.all([
      prisma.uploadHistory.count(),
      prisma.uploadModeration.count({ where: { status: 'pending' } }),
      prisma.uploadModeration.count({ where: { status: 'approved' } }),
      prisma.uploadModeration.count({ where: { status: 'rejected' } }),
      prisma.uploadHistory.groupBy({
        by: ['entityType'],
        _count: { id: true },
        where: { createdAt: { gte: lastMonth } },
      }),
      prisma.uploadHistory.groupBy({
        by: ['userId'],
        _count: { id: true },
        where: { createdAt: { gte: lastMonth } },
        take: 10,
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.uploadHistory.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Buscar nomes dos usuários
    const userIds = topUploaders.map((u) => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Timeline dos últimos 14 dias
    const timeline = await Promise.all(
      Array.from({ length: 14 }, async (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const [uploads, approvedCount, rejectedCount] = await Promise.all([
          prisma.uploadHistory.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
            },
          }),
          prisma.uploadModeration.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
              status: 'approved',
            },
          }),
          prisma.uploadModeration.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
              status: 'rejected',
            },
          }),
        ]);

        return {
          date: date.toISOString().split('T')[0],
          uploads,
          approved: approvedCount,
          rejected: rejectedCount,
        };
      })
    );

    return {
      total,
      pending,
      approved,
      rejected,
      byType: byType.map((item) => ({
        type: item.entityType,
        count: item._count.id,
      })),
      byUser: topUploaders.map((item) => {
        const user = userMap.get(item.userId);
        return {
          userId: item.userId,
          userName: user
            ? `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email ||
              'Usuário'
            : 'Usuário',
          count: item._count.id,
        };
      }),
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        action: activity.action,
        entityType: activity.entityType,
        userName: activity.user
          ? `${activity.user.firstName || ''} ${
              activity.user.lastName || ''
            }`.trim() ||
            activity.user.email ||
            'Usuário'
          : 'Usuário',
        createdAt: activity.createdAt,
      })),
      timeline: timeline.reverse(),
    };
  },
  ['admin-upload-stats'],
  { revalidate: 300 } // 5 minutos
);

const getUploadsList = async (filters: UploadFilters) => {
  const {
    search,
    entityType,
    status,
    userId,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause: any = {};

  if (search) {
    // Buscar por mudanças que contenham o termo
    whereClause.OR = [
      { entityType: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
      {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  if (entityType && entityType !== 'all') {
    whereClause.entityType = entityType;
  }

  if (userId && userId !== 'all') {
    whereClause.userId = userId;
  }

  if (dateFrom || dateTo) {
    whereClause.createdAt = {};
    if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
    if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
  }

  const [uploads, totalCount] = await Promise.all([
    prisma.uploadHistory.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            uploadScore: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.uploadHistory.count({ where: whereClause }),
  ]);

  // Buscar detalhes das entidades para cada upload
  const enrichedUploads = await Promise.all(
    uploads.map(async (upload) => {
      let entityDetails = null;
      let moderationStatus = null;

      // Buscar detalhes da entidade
      if (upload.entityType === 'composer') {
        entityDetails = await prisma.composer.findUnique({
          where: { id: upload.entityId },
          select: { name: true, isVerified: true, dataQuality: true },
        });
      } else if (upload.entityType === 'work') {
        entityDetails = await prisma.work.findUnique({
          where: { id: upload.entityId },
          select: { title: true, composer: { select: { name: true } } },
        });
      } else if (upload.entityType === 'score') {
        entityDetails = await prisma.workScore.findUnique({
          where: { id: upload.entityId },
          select: { title: true, work: { select: { title: true } } },
        });
      }

      // Buscar status de moderação
      moderationStatus = await prisma.uploadModeration.findFirst({
        where: { entityId: upload.entityId },
        select: { status: true, reason: true, moderationNotes: true },
      });

      return {
        id: upload.id,
        entityType: upload.entityType,
        entityId: upload.entityId,
        action: upload.action,
        changes: upload.changes,
        reason: upload.reason,
        createdAt: upload.createdAt,
        user: {
          id: upload.user.id,
          name:
            `${upload.user.firstName || ''} ${
              upload.user.lastName || ''
            }`.trim() ||
            upload.user.email ||
            'Usuário',
          email: upload.user.email,
          uploadScore: upload.user.uploadScore,
        },
        entityDetails,
        moderationStatus,
      };
    })
  );

  return {
    uploads: enrichedUploads,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasMore: skip + uploads.length < totalCount,
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
      const stats = await getCachedUploadStats();
      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      const filters: UploadFilters = {
        search: searchParams.get('search') || undefined,
        entityType: searchParams.get('entityType') || undefined,
        status: searchParams.get('status') || undefined,
        userId: searchParams.get('userId') || undefined,
        dateFrom: searchParams.get('dateFrom') || undefined,
        dateTo: searchParams.get('dateTo') || undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
      };

      const result = await getUploadsList(filters);

      return NextResponse.json({
        success: true,
        ...result,
        filters,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de uploads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
