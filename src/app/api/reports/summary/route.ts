// app/api/reports/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calcular data de início baseada no período
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Buscar estatísticas no período
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      averageResolutionTime,
      topReasons,
      topTypes,
      recentActivity,
    ] = await Promise.all([
      // Total de reports no período
      prisma.uploadModeration.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // Reports pendentes
      prisma.uploadModeration.count({
        where: {
          status: 'pending',
        },
      }),

      // Reports resolvidos no período
      prisma.uploadModeration.count({
        where: {
          resolvedAt: { gte: startDate },
          status: { in: ['approved', 'rejected'] },
        },
      }),

      // Tempo médio de resolução (em horas)
      prisma.uploadModeration.aggregate({
        where: {
          resolvedAt: { gte: startDate },
          status: { in: ['approved', 'rejected'] },
        },
      }),

      // Top motivos de report
      prisma.uploadModeration.groupBy({
        by: ['reason'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate },
        },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: 5,
      }),

      // Top tipos reportados
      prisma.uploadModeration.groupBy({
        by: ['entityType'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate },
        },
        orderBy: {
          _count: { id: 'desc' },
        },
      }),

      // Atividade recente
      prisma.uploadModeration.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        include: {
          reporter: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      period,
      summary: {
        totalReports,
        pendingReports,
        resolvedReports,
        resolutionRate:
          totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0,
      },
      breakdown: {
        topReasons,
        topTypes,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de reports:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
