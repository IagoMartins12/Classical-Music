import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { getPeriodDate } from '@/app/utils/adminUtils';
import type { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';

interface UploadFilters {
  search?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'entityType' | 'userId';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  period?: TimePeriod;
}

interface UploadStats {
  total: number;
  recentCreations: number;
  recentUpdates: number;
  activeUsers: number;
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
    entityId: string;
    userName: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string | null;
      uploadScore: number;
    };
    entityDetails: any;
    reason?: string | null;
    changes: any;
  }>;
  timeline: Array<{
    date: string;
    uploads: number;
    creates: number;
    updates: number;
  }>;
}

const getCachedUploadStats = (period: TimePeriod) =>
  unstable_cache(
    async (): Promise<UploadStats> => {
      const periodStart = getPeriodDate(period);
      const whereClause = periodStart
        ? { createdAt: { gte: periodStart } }
        : {};

      const [
        total,
        totalCreations,
        totalUpdates,
        byType,
        topUploaders,
        recentActivityRaw,
      ] = await Promise.all([
        prisma.uploadHistory.count(
          periodStart ? { where: whereClause } : undefined
        ),
        prisma.uploadHistory.count({
          where: {
            action: 'create',
            ...(periodStart && { createdAt: { gte: periodStart } }),
          },
        }),
        prisma.uploadHistory.count({
          where: {
            action: 'update',
            ...(periodStart && { createdAt: { gte: periodStart } }),
          },
        }),
        prisma.uploadHistory.groupBy({
          by: ['entityType'],
          _count: { id: true },
          where: whereClause,
        }),
        prisma.uploadHistory.groupBy({
          by: ['userId'],
          _count: { id: true },
          where: whereClause,
          take: 10,
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.uploadHistory.findMany({
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
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

      // Buscar nomes dos usuários para top uploaders
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

      // Contar usuários ativos no período
      const activeUsers = await prisma.uploadHistory.groupBy({
        by: ['userId'],
        where: whereClause,
      });

      // Timeline dos últimos 14 dias
      const timelineData = await Promise.all(
        Array.from({ length: 14 }, async (_, i) => {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

          const [uploads, creates, updates] = await Promise.all([
            prisma.uploadHistory.count({
              where: {
                createdAt: { gte: date, lt: nextDay },
              },
            }),
            prisma.uploadHistory.count({
              where: {
                createdAt: { gte: date, lt: nextDay },
                action: 'create',
              },
            }),
            prisma.uploadHistory.count({
              where: {
                createdAt: { gte: date, lt: nextDay },
                action: 'update',
              },
            }),
          ]);

          return {
            date: date.toISOString().split('T')[0],
            uploads,
            creates,
            updates,
          };
        })
      );

      // Processar atividade recente com detalhes das entidades
      const recentActivity = await Promise.all(
        recentActivityRaw.map(async (activity) => {
          let entityDetails = null;

          // Buscar detalhes da entidade
          try {
            if (activity.entityType === 'composer') {
              entityDetails = await prisma.composer.findUnique({
                where: { id: activity.entityId },
                select: { name: true, isVerified: true, dataQuality: true },
              });
            } else if (activity.entityType === 'work') {
              entityDetails = await prisma.work.findUnique({
                where: { id: activity.entityId },
                select: {
                  title: true,
                  composer: { select: { name: true } },
                },
              });
            } else if (activity.entityType === 'score') {
              entityDetails = await prisma.workScore.findUnique({
                where: { id: activity.entityId },
                select: {
                  title: true,
                  work: { select: { title: true } },
                },
              });
            }
          } catch (error) {
            console.warn(
              `Erro ao buscar detalhes da entidade ${activity.entityType}:${activity.entityId}`,
              error
            );
            entityDetails = null;
          }

          return {
            id: activity.id,
            action: activity.action,
            entityType: activity.entityType,
            entityId: activity.entityId,
            userName: activity.user
              ? `${activity.user.firstName || ''} ${
                  activity.user.lastName || ''
                }`.trim() ||
                activity.user.email ||
                'Usuário'
              : 'Usuário',
            createdAt: activity.createdAt,
            user: {
              id: activity.user.id,
              name:
                `${activity.user.firstName || ''} ${
                  activity.user.lastName || ''
                }`.trim() ||
                activity.user.email ||
                'Usuário',
              email: activity.user.email,
              uploadScore: activity.user.uploadScore,
            },
            entityDetails,
            reason: activity.reason,
            changes: activity.changes,
          };
        })
      );

      return {
        total,
        recentCreations: totalCreations,
        recentUpdates: totalUpdates,
        activeUsers: activeUsers.length,
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
        recentActivity,
        timeline: timelineData.reverse(),
      };
    },
    [`admin-upload-stats-${period}`],
    { revalidate: 300 } // 5 minutos
  );

const getUploadsList = async (filters: UploadFilters) => {
  const {
    search,
    entityType,
    userId,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
    period = '30d',
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause: any = {};

  // Aplicar filtro de período se não houver filtros de data específicos
  if (!dateFrom && !dateTo && period !== 'all') {
    const periodStart = getPeriodDate(period);
    if (periodStart) {
      whereClause.createdAt = { gte: periodStart };
    }
  }

  if (search) {
    whereClause.OR = [
      { entityType: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
      { reason: { contains: search, mode: 'insensitive' } },
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

      // Buscar detalhes da entidade
      try {
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
      } catch (error) {
        console.warn(
          `Erro ao buscar detalhes da entidade ${upload.entityType}:${upload.entityId}`,
          error
        );
        entityDetails = null;
      }

      return {
        id: upload.id,
        entityType: upload.entityType,
        entityId: upload.entityId,
        action: upload.action,
        changes: upload.changes,
        reason: upload.reason || undefined,
        createdAt: upload.createdAt,
        user: {
          id: upload.user.id,
          name:
            `${upload.user.firstName || ''} ${
              upload.user.lastName || ''
            }`.trim() ||
            upload.user.email ||
            'Usuário',
          email: upload.user.email || '',
          uploadScore: upload.user.uploadScore,
        },
        entityDetails,
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
    const period = (searchParams.get('period') as TimePeriod) || '30d';

    if (action === 'stats') {
      const stats = await getCachedUploadStats(period)();
      return NextResponse.json({
        success: true,
        stats,
        period,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      const filters: UploadFilters = {
        search: searchParams.get('search') || undefined,
        entityType: searchParams.get('entityType') || undefined,
        userId: searchParams.get('userId') || undefined,
        dateFrom: searchParams.get('dateFrom') || undefined,
        dateTo: searchParams.get('dateTo') || undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
        period,
      };

      const result = await getUploadsList(filters);

      return NextResponse.json({
        success: true,
        ...result,
        filters,
        period,
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
