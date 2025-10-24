// app/api/admin/activity/route.ts - VERSÃO ATUALIZADA COM UPLOAD HISTORY + ACTIVITY LOG
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ActivityItem {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: string;
    id: string;
    name: string;
  };
  timestamp: Date;
  metadata?: any;
  status?: 'success' | 'warning' | 'error';
}

// Helper para calcular range de datas
function getDateRange(period: string) {
  const now = new Date();
  const ranges: Record<string, { start: Date; end: Date }> = {
    hoje: {
      start: new Date(now.setHours(0, 0, 0, 0)),
      end: new Date(now.setHours(23, 59, 59, 999)),
    },
    ontem: {
      start: new Date(new Date().setDate(now.getDate() - 1)),
      end: new Date(new Date().setDate(now.getDate() - 1)),
    },
    esta_semana: {
      start: new Date(now.setDate(now.getDate() - now.getDay())),
      end: new Date(),
    },
    '7d': {
      start: new Date(now.setDate(now.getDate() - 7)),
      end: new Date(),
    },
    '30d': {
      start: new Date(now.setDate(now.getDate() - 30)),
      end: new Date(),
    },
    '3m': {
      start: new Date(now.setMonth(now.getMonth() - 3)),
      end: new Date(),
    },
    '6m': {
      start: new Date(now.setMonth(now.getMonth() - 6)),
      end: new Date(),
    },
    '1y': {
      start: new Date(now.setFullYear(now.getFullYear() - 1)),
      end: new Date(),
    },
    todos: {
      start: new Date('2020-01-01'),
      end: new Date(),
    },
  };

  return ranges[period] || ranges['7d'];
}

// Helper para formatar UploadHistory em ActivityItem
function formatUploadHistory(upload: any): ActivityItem {
  const actionMap: Record<string, string> = {
    create: 'criou',
    update: 'atualizou',
    delete: 'deletou',
  };

  const entityTypeMap: Record<string, string> = {
    composer: 'compositor',
    work: 'obra',
    score: 'partitura',
  };

  return {
    id: upload.id,
    type: 'UPLOAD', // Tipo especial para uploads
    user: {
      id: upload.user?.id || 'unknown',
      name:
        `${upload.user?.firstName || ''} ${upload.user?.lastName || ''}`.trim() ||
        'Usuário',
      email: upload.user?.email || '',
      avatar: upload.user?.image || undefined,
    },
    action: `${actionMap[upload.action] || upload.action} ${entityTypeMap[upload.entityType] || upload.entityType}`,
    target: {
      type: upload.entityType,
      id: upload.entityId,
      name: upload.changes?.name || upload.changes?.title || 'Item',
    },
    timestamp: upload.createdAt,
    metadata: {
      action: upload.action,
      reason: upload.reason,
      changes: upload.changes,
      ipAddress: upload.ipAddress,
    },
    status: 'success',
  };
}

// Helper para formatar ActivityLog em ActivityItem
function formatActivityLog(activity: any): ActivityItem {
  return {
    id: activity.id,
    type: activity.type,
    user: {
      id: activity.user?.id || 'unknown',
      name:
        `${activity.user?.firstName || ''} ${activity.user?.lastName || ''}`.trim() ||
        'Usuário',
      email: activity.user?.email || '',
      avatar: activity.user?.image || undefined,
    },
    action: activity.action,
    target: activity.entityType
      ? {
          type: activity.entityType,
          id: activity.entityId || '',
          name: activity.entityName || 'Desconhecido',
        }
      : undefined,
    timestamp: activity.createdAt,
    metadata: activity.metadata as any,
    status: 'success',
  };
}

// Mapeamento de tipos genéricos para tipos do ActivityLog
function getActivityLogTypes(genericType: string): string[] | null {
  const typeMap: Record<string, string[]> = {
    favorite: [
      'FAVORITE_COMPOSER',
      'UNFAVORITE_COMPOSER',
      'FAVORITE_WORK',
      'UNFAVORITE_WORK',
      'FAVORITE_SCORE',
      'UNFAVORITE_SCORE',
    ],
    annotation: [
      'CREATE_ANNOTATION',
      'UPDATE_ANNOTATION',
      'DELETE_ANNOTATION',
      'VOTE_ANNOTATION_HELPFUL',
      'VOTE_ANNOTATION_NOT_HELPFUL',
    ],
    study_session: [
      'ADD_WANT_TO_LEARN',
      'REMOVE_WANT_TO_LEARN',
      'UPDATE_WANT_TO_LEARN',
      'ADD_LEARNED',
      'REMOVE_LEARNED',
      'UPDATE_LEARNED',
      'SELECT_SCORE_WANT_TO_LEARN',
      'SELECT_SCORE_LEARNED',
    ],
    moderation: ['REPORT_UPLOAD'],
    upload: ['UPLOAD_VIDEO', 'DELETE_VIDEO'],
    system: [
      'UPDATE_PROFILE',
      'VIEW_COMPOSER',
      'VIEW_WORK',
      'VIEW_SCORE',
      'GENERATE_BIO',
    ],
  };

  return typeMap[genericType] || null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const period = searchParams.get('period') || '7d';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Obter range de datas
    const dateRange = getDateRange(period);

    let activities: ActivityItem[] = [];
    let totalCount = 0;

    // Se o tipo for "UPLOAD" ou "all", buscar do UploadHistory
    if (type === 'UPLOAD' || type === 'all') {
      const whereUpload: any = {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      };

      // Aplicar busca se houver
      if (search) {
        whereUpload.OR = [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { entityType: { contains: search, mode: 'insensitive' } },
          { action: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [uploads, uploadCount] = await Promise.all([
        prisma.uploadHistory.findMany({
          where: whereUpload,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'UPLOAD' ? skip : 0,
          take: type === 'UPLOAD' ? limit : Math.floor(limit / 2),
        }),
        prisma.uploadHistory.count({ where: whereUpload }),
      ]);

      const formattedUploads = uploads.map(formatUploadHistory);
      activities = [...activities, ...formattedUploads];
      totalCount += uploadCount;
    }

    // Se o tipo NÃO for "UPLOAD", buscar do ActivityLog
    if (type !== 'UPLOAD') {
      const whereActivity: any = {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      };

      // Filtrar por tipo(s) específico(s)
      if (type !== 'all') {
        const activityTypes = getActivityLogTypes(type);

        if (activityTypes) {
          // Tipo genérico mapeado para múltiplos tipos
          whereActivity.type = { in: activityTypes };
        } else {
          // Tipo específico do enum (ex: FAVORITE_COMPOSER)
          whereActivity.type = type;
        }
      }

      // Aplicar busca se houver
      if (search) {
        whereActivity.OR = [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { action: { contains: search, mode: 'insensitive' } },
          { entityName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [activityLogs, activityCount] = await Promise.all([
        prisma.activityLog.findMany({
          where: whereActivity,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'all' ? 0 : skip,
          take: type === 'all' ? Math.floor(limit / 2) : limit,
        }),
        prisma.activityLog.count({ where: whereActivity }),
      ]);

      const formattedActivities = activityLogs.map(formatActivityLog);
      activities = [...activities, ...formattedActivities];
      totalCount += activityCount;
    }

    // Ordenar por timestamp (mais recente primeiro)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Aplicar paginação manual se type === 'all'
    if (type === 'all') {
      const startIndex = skip;
      const endIndex = skip + limit;
      activities = activities.slice(startIndex, endIndex);
    }

    return NextResponse.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: skip + activities.length < totalCount,
      },
      period: {
        selected: period,
        range: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na API de atividades do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
