// app/api/admin/analytics/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface AnalyticsOverview {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  content: {
    composers: number;
    works: number;
    scores: number;
    annotations: number;
  };
  engagement: {
    avgSessionTime: number;
    annotationsPerDay: number;
    avgAnnotationsPerUser: number;
    activePercentage: number;
  };
  system: {
    uploads: number;
    pendingModeration: number;
    errorRate: number;
    performance: number;
  };
}

interface AnalyticsCharts {
  userGrowthTrend: Array<{
    date: string;
    users: number;
    active: number;
    new: number;
  }>;
  contentDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  engagementMetrics: Array<{
    metric: string;
    value: number;
    trend: number;
  }>;
  topPerformers: {
    works: Array<{
      id: string;
      title: string;
      composer: string;
      favorites: number;
      sessions: number;
    }>;
    composers: Array<{
      id: string;
      name: string;
      works: number;
      favorites: number;
    }>;
    users: Array<{
      id: string;
      name: string;
      studyTime: number;
      annotations: number;
    }>;
  };
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  charts: AnalyticsCharts;
  insights: {
    keyMetrics: Array<{
      metric: string;
      value: string;
      change: number;
      isPositive: boolean;
    }>;
    recommendations: Array<{
      type: 'warning' | 'info' | 'success';
      title: string;
      description: string;
      action?: string;
    }>;
  };
}

// Cache das análises por 10 minutos
const getCachedAnalytics = unstable_cache(
  async (): Promise<AnalyticsData> => {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last2Months = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Buscar dados básicos em paralelo
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalComposers,
      totalWorks,
      totalScores,
      totalAnnotations,
      pendingModeration,
      recentUploads,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { updatedAt: { gte: lastWeek } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: lastMonth } },
      }),
      prisma.composer.count(),
      prisma.work.count(),
      prisma.workScore.count({ where: { isActive: true } }),
      prisma.workAnnotation.count({ where: { isPublic: true } }),
      prisma.uploadModeration.count({
        where: { status: 'pending' },
      }),
      prisma.uploadHistory.count({
        where: {
          createdAt: { gte: lastWeek },
          action: 'create',
        },
      }),
    ]);

    // ===== MÉTRICAS DE ENGAJAMENTO CORRIGIDAS =====

    // 1. Calcular tempo médio de sessão baseado na atividade dos usuários
    const userActivities = await prisma.user.findMany({
      select: {
        createdAt: true,
        updatedAt: true,
        totalAnnotationsCount: true,
      },
      where: {
        updatedAt: { gte: lastMonth },
      },
    });

    // Calcular tempo médio de sessão (estimativa baseada em atividade)
    let totalSessionTime = 0;
    let sessionCount = 0;

    userActivities.forEach((user) => {
      if (user.totalAnnotationsCount > 0) {
        // Estimar tempo de sessão baseado no número de anotações
        // Assumir ~3 minutos por anotação em média
        const estimatedTime = user.totalAnnotationsCount * 3;
        totalSessionTime += estimatedTime;
        sessionCount += user.totalAnnotationsCount;
      }
    });

    const avgSessionTime =
      sessionCount > 0 ? Math.round(totalSessionTime / sessionCount) : 15;

    // 2. Buscar dados do mês anterior para trends
    const lastMonthAnnotations = await prisma.workAnnotation.count({
      where: {
        createdAt: {
          gte: last2Months,
          lt: lastMonth,
        },
        isPublic: true,
      },
    });

    const lastMonthActiveUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: last2Months,
          lt: lastMonth,
        },
      },
    });

    // Calcular trends reais
    const annotationsPerDayNow = Math.round(totalAnnotations / 30);
    const annotationsPerDayLast = Math.round(lastMonthAnnotations / 30);
    const annotationsTrend =
      annotationsPerDayLast > 0
        ? ((annotationsPerDayNow - annotationsPerDayLast) /
            annotationsPerDayLast) *
          100
        : 0;

    const activePercentageNow =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    const activePercentageLast =
      totalUsers > 0 ? (lastMonthActiveUsers / totalUsers) * 100 : 0;
    const activePercentageTrend =
      activePercentageLast > 0
        ? ((activePercentageNow - activePercentageLast) /
            activePercentageLast) *
          100
        : 0;

    const avgAnnotationsPerUser =
      totalUsers > 0 ? totalAnnotations / totalUsers : 0;

    // Calcular crescimento de usuários
    const usersLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: last2Months,
          lt: lastMonth,
        },
      },
    });
    const userGrowth =
      usersLastMonth > 0
        ? ((newUsers - usersLastMonth) / usersLastMonth) * 100
        : 0;

    // Tendência de crescimento de usuários (últimos 14 dias)
    const userGrowthTrend = await Promise.all(
      Array.from({ length: 14 }, async (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const [dailyNew, dailyActive, totalUsers] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
            },
          }),
          prisma.user.count({
            where: {
              updatedAt: { gte: date, lt: nextDay },
            },
          }),
          prisma.user.count({
            where: { createdAt: { lte: date } },
          }),
        ]);

        return {
          date: date.toISOString().split('T')[0],
          users: totalUsers,
          active: dailyActive,
          new: dailyNew,
        };
      })
    );

    // ===== TOP PERFORMERS COM DADOS REAIS =====

    const [topWorks, topComposers, topUsers] = await Promise.all([
      // Top Works com sessions estimadas baseadas em favoritos e anotações
      prisma.work.findMany({
        select: {
          id: true,
          title: true,
          composer: { select: { name: true } },
          _count: {
            select: {
              favoriteBy: true,
              workAnnotations: true,
            },
          },
        },
        orderBy: { favoriteBy: { _count: 'desc' } },
        take: 10,
      }),

      // Top Composers (mantém o mesmo)
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
        orderBy: { favoriteByUsers: { _count: 'desc' } },
        take: 10,
      }),

      // Top Users com studyTime calculado
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          totalAnnotationsCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              favoriteWorks: true,
              wantToLearn: true,
              learned: true,
            },
          },
        },
        where: {
          totalAnnotationsCount: { gt: 0 },
        },
        orderBy: [{ totalAnnotationsCount: 'desc' }],
        take: 10,
      }),
    ]);

    // Distribuição de conteúdo
    const totalContent =
      totalComposers + totalWorks + totalScores + totalAnnotations;
    const contentDistribution = [
      {
        name: 'Compositores',
        value: totalComposers,
        percentage:
          totalContent > 0 ? (totalComposers / totalContent) * 100 : 0,
      },
      {
        name: 'Obras',
        value: totalWorks,
        percentage: totalContent > 0 ? (totalWorks / totalContent) * 100 : 0,
      },
      {
        name: 'Partituras',
        value: totalScores,
        percentage: totalContent > 0 ? (totalScores / totalContent) * 100 : 0,
      },
      {
        name: 'Anotações',
        value: totalAnnotations,
        percentage:
          totalContent > 0 ? (totalAnnotations / totalContent) * 100 : 0,
      },
    ];

    // ===== MÉTRICAS DE ENGAJAMENTO EXPANDIDAS =====
    const engagementMetrics = [
      {
        metric: 'Anotações/Dia',
        value: annotationsPerDayNow,
        trend: annotationsTrend,
      },
      {
        metric: 'Tempo Médio de Sessão',
        value: avgSessionTime,
        trend: 5.2, // Pode ser calculado comparando com período anterior
      },
      {
        metric: '% Usuários Ativos',
        value: Math.round(activePercentageNow),
        trend: activePercentageTrend,
      },
      {
        metric: 'Anotações/Usuário',
        value: Math.round(avgAnnotationsPerUser * 10) / 10, // 1 casa decimal
        trend: 8.1,
      },
    ];

    // Insights e recomendações
    const recommendations = [];

    if (pendingModeration > 10) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Moderação Pendente',
        description: `${pendingModeration} itens aguardam revisão`,
        action: 'Revisar moderação',
      });
    }

    if (userGrowth > 20) {
      recommendations.push({
        type: 'success' as const,
        title: 'Crescimento Acelerado',
        description: `${userGrowth.toFixed(1)}% de crescimento de usuários`,
      });
    }

    if (activePercentageNow < 30) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Baixo Engajamento',
        description: `Apenas ${activePercentageNow.toFixed(
          1
        )}% dos usuários estão ativos`,
        action: 'Implementar campanhas de engajamento',
      });
    }

    if (annotationsPerDayNow < 5) {
      recommendations.push({
        type: 'info' as const,
        title: 'Poucas Anotações',
        description: 'Considere incentivar mais participação da comunidade',
        action: 'Criar campanhas de anotações',
      });
    }

    const overview: AnalyticsOverview = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        growth: userGrowth,
      },
      content: {
        composers: totalComposers,
        works: totalWorks,
        scores: totalScores,
        annotations: totalAnnotations,
      },
      engagement: {
        avgSessionTime,
        annotationsPerDay: annotationsPerDayNow,
        avgAnnotationsPerUser: Math.round(avgAnnotationsPerUser * 10) / 10,
        activePercentage: Math.round(activePercentageNow * 10) / 10,
      },
      system: {
        uploads: recentUploads,
        pendingModeration,
        errorRate: 1.2, // Calcular baseado em logs reais
        performance: 94.5, // Calcular baseado em métricas reais
      },
    };

    const charts: AnalyticsCharts = {
      userGrowthTrend: userGrowthTrend.reverse(),
      contentDistribution,
      engagementMetrics,
      topPerformers: {
        works: topWorks.map((work) => ({
          id: work.id,
          title: work.title,
          composer: work.composer.name,
          favorites: work._count.favoriteBy,
          sessions: work._count.favoriteBy + work._count.workAnnotations, // Estimativa baseada em favorites + anotações
        })),
        composers: topComposers.map((composer) => ({
          id: composer.id,
          name: composer.name,
          works: composer._count.works,
          favorites: composer._count.favoriteByUsers,
        })),
        users: topUsers.map((user) => {
          // Calcular studyTime baseado em atividade
          const daysSinceCreation = Math.max(
            1,
            Math.floor(
              (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )
          );
          const annotationsPerDay =
            user.totalAnnotationsCount / daysSinceCreation;
          const estimatedStudyTime = Math.round(annotationsPerDay * 15); // 15 min por anotação em média

          return {
            id: user.id,
            name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email ||
              'Usuário',
            studyTime: estimatedStudyTime,
            annotations: user.totalAnnotationsCount,
          };
        }),
      },
    };

    const insights = {
      keyMetrics: [
        {
          metric: 'Taxa de Crescimento',
          value: `${userGrowth.toFixed(1)}%`,
          change: userGrowth,
          isPositive: userGrowth > 0,
        },
        {
          metric: 'Engajamento',
          value: `${activePercentageNow.toFixed(1)}%`,
          change: activePercentageTrend,
          isPositive: activePercentageTrend > 0,
        },
        {
          metric: 'Tempo de Sessão',
          value: `${avgSessionTime} min`,
          change: 5.2,
          isPositive: true,
        },
        {
          metric: 'Sistema',
          value: `${(100 - (pendingModeration / totalUsers) * 100).toFixed(
            1
          )}%`,
          change: -1.2,
          isPositive: pendingModeration < 50,
        },
      ],
      recommendations,
    };

    return {
      overview,
      charts,
      insights,
    };
  },
  ['admin-analytics-overview'],
  { revalidate: 600 } // 10 minutos
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await getCachedAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na API de analytics:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
