// app/api/uploads/history/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isAdmin = session.user.role === 2;

    // Verificar permissões
    if (userId && userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const targetUserId = userId || session.user.id;

    // Data de hoje 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Data de uma semana atrás
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Data de um mês atrás
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const where = isAdmin && !userId ? {} : { userId: targetUserId };

    const [
      totalActions,
      actionsToday,
      actionsThisWeek,
      actionsThisMonth,
      actionsByType,
      actionsByAction,
      recentActions,
      dailyActivity,
    ] = await Promise.all([
      // Total de ações
      prisma.uploadHistory.count({ where }),

      // Ações hoje
      prisma.uploadHistory.count({
        where: {
          ...where,
          createdAt: { gte: today },
        },
      }),

      // Ações esta semana
      prisma.uploadHistory.count({
        where: {
          ...where,
          createdAt: { gte: oneWeekAgo },
        },
      }),

      // Ações este mês
      prisma.uploadHistory.count({
        where: {
          ...where,
          createdAt: { gte: oneMonthAgo },
        },
      }),

      // Estatísticas por tipo de entidade
      prisma.uploadHistory.groupBy({
        by: ['entityType'],
        where,
        _count: { entityType: true },
      }),

      // Estatísticas por ação
      prisma.uploadHistory.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),

      // Ações recentes
      prisma.uploadHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          entityType: true,
          action: true,
          createdAt: true,
          reason: true,
        },
      }),

      // Atividade diária dos últimos 30 dias
      prisma.uploadHistory.findMany({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
          action: true,
        },
      }),
    ]);

    // Processar atividade diária
    const dailyStats = processDailyActivity(dailyActivity);

    // Formatar estatísticas por tipo
    const entityTypeStats = actionsByType.reduce((acc, item) => {
      acc[item.entityType] = item._count.entityType;
      return acc;
    }, {} as Record<string, number>);

    // Formatar estatísticas por ação
    const actionStats = actionsByAction.reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>);

    // Calcular tendências
    const trends = calculateTrends({
      total: totalActions,
      today: actionsToday,
      thisWeek: actionsThisWeek,
      thisMonth: actionsThisMonth,
    });

    return NextResponse.json({
      overview: {
        totalActions,
        actionsToday,
        actionsThisWeek,
        actionsThisMonth,
      },
      breakdown: {
        byEntityType: entityTypeStats,
        byAction: actionStats,
      },
      recentActions,
      dailyActivity: dailyStats,
      trends,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Processa atividade diária para gráficos
function processDailyActivity(activities: any[]) {
  const dailyMap = new Map<
    string,
    { create: number; update: number; delete: number }
  >();

  // Inicializar últimos 30 dias
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyMap.set(dateKey, { create: 0, update: 0, delete: 0 });
  }

  // Contar atividades por dia
  activities.forEach((activity) => {
    const dateKey = activity.createdAt.toISOString().split('T')[0];
    const dayStats = dailyMap.get(dateKey);
    if (dayStats) {
      dayStats[activity.action as keyof typeof dayStats]++;
    }
  });

  // Converter para array
  return Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
    total: stats.create + stats.update + stats.delete,
  }));
}

// Calcula tendências de crescimento
function calculateTrends(stats: {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}) {
  // Calcular médias diárias
  const avgPerDay = stats.total > 0 ? stats.total / 30 : 0; // Assumindo 30 dias de histórico
  const avgThisWeek = stats.thisWeek / 7;
  const avgThisMonth = stats.thisMonth / 30;

  // Calcular tendências (comparação com média histórica)
  const dailyTrend =
    avgPerDay > 0 ? ((stats.today - avgPerDay) / avgPerDay) * 100 : 0;
  const weeklyTrend =
    avgPerDay > 0 ? ((avgThisWeek - avgPerDay) / avgPerDay) * 100 : 0;
  const monthlyTrend =
    avgPerDay > 0 ? ((avgThisMonth - avgPerDay) / avgPerDay) * 100 : 0;

  return {
    daily: {
      value: Math.round(dailyTrend),
      direction: dailyTrend > 0 ? 'up' : dailyTrend < 0 ? 'down' : 'stable',
    },
    weekly: {
      value: Math.round(weeklyTrend),
      direction: weeklyTrend > 0 ? 'up' : weeklyTrend < 0 ? 'down' : 'stable',
    },
    monthly: {
      value: Math.round(monthlyTrend),
      direction: monthlyTrend > 0 ? 'up' : monthlyTrend < 0 ? 'down' : 'stable',
    },
  };
}
