// app/api/admin/moderation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface ModerationStats {
  pendingItems: number;
  totalReports: number;
  resolvedReports: number;
  avgResolutionTime: number;
  reportsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recentReports: Array<{
    id: string;
    entityType: string;
    entityId: string;
    reason: string;
    description?: string;
    status: string;
    priority: string;
    reportedBy: {
      id: string;
      name: string;
    };
    createdAt: Date;
  }>;
  pendingUploads: Array<{
    id: string;
    type: string;
    title: string;
    uploader: string;
    uploadDate: Date;
    priority: string;
  }>;
}

// Cache das estatísticas de moderação por 5 minutos
const getCachedModerationStats = unstable_cache(
  async (): Promise<ModerationStats> => {
    // Buscar reports pendentes e estatísticas
    const [
      pendingReports,
      totalReports,
      resolvedReports,
      recentReports,
      pendingUploads,
    ] = await Promise.all([
      prisma.uploadModeration.count({
        where: { status: 'pending' },
      }),
      prisma.uploadModeration.count(),
      prisma.uploadModeration.count({
        where: { status: { in: ['approved', 'rejected'] } },
      }),
      prisma.uploadModeration.findMany({
        where: { status: 'pending' },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.uploadHistory.findMany({
        where: {
          action: 'create',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
          },
        },
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
        take: 15,
      }),
    ]);

    // Calcular estatísticas por categoria
    const reportsByReason = await prisma.uploadModeration.groupBy({
      by: ['reason'],
      _count: { id: true },
    });

    const reportsByCategory = reportsByReason.map((item) => ({
      category: item.reason,
      count: item._count.id,
      percentage: (item._count.id / totalReports) * 100,
    }));

    // Calcular tempo médio de resolução (simulado por enquanto)
    const avgResolutionTime = 2.5; // em horas

    // Processar uploads pendentes com detalhes
    const uploadsWithDetails = await Promise.all(
      pendingUploads.slice(0, 10).map(async (upload) => {
        let title = 'Item desconhecido';
        let priority = 'normal';

        if (upload.entityType === 'composer') {
          const composer = await prisma.composer.findUnique({
            where: { id: upload.entityId },
            select: { name: true, dataQuality: true },
          });
          if (composer) {
            title = composer.name;
            priority = composer.dataQuality === 'low' ? 'high' : 'normal';
          }
        } else if (upload.entityType === 'work') {
          const work = await prisma.work.findUnique({
            where: { id: upload.entityId },
            select: { title: true },
          });
          if (work) {
            title = work.title;
          }
        }

        return {
          id: upload.id,
          type: upload.entityType,
          title,
          uploader:
            `${upload.user?.firstName || ''} ${
              upload.user?.lastName || ''
            }`.trim() ||
            upload.user?.email ||
            'Usuário',
          uploadDate: upload.createdAt,
          priority,
        };
      })
    );

    return {
      pendingItems: pendingReports,
      totalReports,
      resolvedReports,
      avgResolutionTime,
      reportsByCategory,
      recentReports: recentReports.map((report) => ({
        id: report.id,
        entityType: report.entityType,
        entityId: report.entityId,
        reason: report.reason,
        description: report.description || undefined,
        status: report.status,
        priority: report.priority,
        reportedBy: {
          id: report.reporter.id,
          name:
            `${report.reporter.firstName || ''} ${
              report.reporter.lastName || ''
            }`.trim() ||
            report.reporter.email ||
            'Usuário',
        },
        createdAt: report.createdAt,
      })),
      pendingUploads: uploadsWithDetails,
    };
  },
  ['admin-moderation-stats'],
  { revalidate: 300 } // 5 minutos
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    if (action === 'stats') {
      const stats = await getCachedModerationStats();

      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'pending') {
      // Retornar apenas itens pendentes
      const pendingItems = await prisma.uploadModeration.findMany({
        where: { status: 'pending' },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        take: parseInt(searchParams.get('limit') || '20'),
      });

      return NextResponse.json({
        success: true,
        items: pendingItems,
        count: pendingItems.length,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de moderação do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar status de moderação
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, status, moderationNotes } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { error: 'Report ID and status are required' },
        { status: 400 }
      );
    }

    const updatedReport = await prisma.uploadModeration.update({
      where: { id: reportId },
      data: {
        status,
        moderationNotes,
        moderatedBy: session.user.id,
        resolvedAt: status !== 'pending' ? new Date() : null,
      },
    });

    // Log da ação admin
    await prisma.uploadHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'moderation',
        entityId: reportId,
        action: 'moderate',
        changes: { status, moderationNotes },
        reason: 'Admin moderation action',
      },
    });

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: 'Report atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar report:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
