// app/api/admin/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ActivityItem {
  id: string;
  type:
    | 'user_registration'
    | 'upload'
    | 'annotation'
    | 'favorite'
    | 'moderation'
    | 'system'
    | 'study_session';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: 'composer' | 'work' | 'score' | 'user';
    id: string;
    name: string;
  };
  timestamp: Date;
  metadata?: any;
  status?: 'success' | 'warning' | 'error';
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const activities: ActivityItem[] = [];

    // Buscar diferentes tipos de atividades
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Novos registros de usuários
    if (type === 'all' || type === 'user_registration') {
      const newUsers = await prisma.user.findMany({
        where: {
          createdAt: { gte: last24Hours },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: Math.floor(limit / 4),
      });

      newUsers.forEach((user) => {
        activities.push({
          id: `user_reg_${user.id}`,
          type: 'user_registration',
          user: {
            id: user.id,
            name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              'Usuário',
            email: user.email || '',
          },
          action: 'registrou-se na plataforma',
          timestamp: user.createdAt,
          status: 'success',
        });
      });
    }

    // 2. Uploads recentes
    if (type === 'all' || type === 'upload') {
      const recentUploads = await prisma.uploadHistory.findMany({
        where: {
          createdAt: { gte: last24Hours },
          action: 'create',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.floor(limit / 4),
      });

      for (const upload of recentUploads) {
        let targetInfo:
          | { type: 'composer' | 'work' | 'score'; id: string; name: string }
          | undefined;

        // Buscar detalhes do item carregado
        if (upload.entityType === 'composer') {
          const composer = await prisma.composer.findUnique({
            where: { id: upload.entityId },
            select: { name: true },
          });
          if (composer) {
            targetInfo = {
              type: 'composer',
              id: upload.entityId,
              name: composer.name,
            };
          }
        } else if (upload.entityType === 'work') {
          const work = await prisma.work.findUnique({
            where: { id: upload.entityId },
            select: { title: true },
          });
          if (work) {
            targetInfo = {
              type: 'work',
              id: upload.entityId,
              name: work.title,
            };
          }
        }

        activities.push({
          id: `upload_${upload.id}`,
          type: 'upload',
          user: {
            id: upload.user.id,
            name:
              `${upload.user.firstName || ''} ${
                upload.user.lastName || ''
              }`.trim() || 'Usuário',
            email: upload.user.email || '',
          },
          action: `fez upload de ${upload.entityType}`,
          target: targetInfo,
          timestamp: upload.createdAt,
          status: 'success',
          metadata: upload.changes,
        });
      }
    }

    // 3. Novas anotações
    if (type === 'all' || type === 'annotation') {
      const recentAnnotations = await prisma.workAnnotation.findMany({
        where: {
          createdAt: { gte: last24Hours },
          isPublic: true,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          work: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.floor(limit / 4),
      });

      recentAnnotations.forEach((annotation) => {
        activities.push({
          id: `annotation_${annotation.id}`,
          type: 'annotation',
          user: {
            id: annotation.user.id,
            name:
              `${annotation.user.firstName || ''} ${
                annotation.user.lastName || ''
              }`.trim() || 'Usuário',
            email: annotation.user.email || '',
          },
          action: 'criou anotação em',
          target: {
            type: 'work',
            id: annotation.work.id,
            name: annotation.work.title,
          },
          timestamp: annotation.createdAt,
          status: 'success',
          metadata: {
            category: annotation.category,
            scope: annotation.scope,
          },
        });
      });
    }

    // Ordenar por timestamp e aplicar paginação
    const sortedActivities = activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(skip, skip + limit);

    const totalCount = activities.length;

    return NextResponse.json({
      success: true,
      activities: sortedActivities,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: skip + sortedActivities.length < totalCount,
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
