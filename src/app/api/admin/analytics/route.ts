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
    annotationsPerDay: number;
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

    // Calcular crescimento de usuários
    const usersLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
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

    // Top performers
    const [topWorks, topComposers, topUsers] = await Promise.all([
      prisma.work.findMany({
        select: {
          id: true,
          title: true,
          composer: { select: { name: true } },
          _count: {
            select: {
              favoriteBy: true,
            },
          },
        },
        orderBy: { favoriteBy: { _count: 'desc' } },
        take: 10,
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
        orderBy: { favoriteByUsers: { _count: 'desc' } },
        take: 10,
      }),
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          totalAnnotationsCount: true,
        },
        where: {
          OR: [{ totalAnnotationsCount: { gt: 0 } }],
        },
        orderBy: [{ totalAnnotationsCount: 'desc' }],
        take: 10,
      }),
    ]);

    // Distribuição de conteúdo
    const contentDistribution = [
      {
        name: 'Compositores',
        value: totalComposers,
        percentage: 100,
      },
      {
        name: 'Obras',
        value: totalWorks,
        percentage:
          totalComposers > 0 ? (totalWorks / totalComposers) * 100 : 0,
      },
      {
        name: 'Partituras',
        value: totalScores,
        percentage: totalWorks > 0 ? (totalScores / totalWorks) * 100 : 0,
      },
      {
        name: 'Anotações',
        value: totalAnnotations,
        percentage: totalWorks > 0 ? (totalAnnotations / totalWorks) * 100 : 0,
      },
    ];

    // Métricas de engajamento
    const engagementMetrics = [
      {
        metric: 'Anotações/Dia',
        value: Math.round(totalAnnotations / 30),
        trend: 12.4,
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
        annotationsPerDay: Math.round(totalAnnotations / 30),
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
        })),
        composers: topComposers.map((composer) => ({
          id: composer.id,
          name: composer.name,
          works: composer._count.works,
          favorites: composer._count.favoriteByUsers,
        })),
        users: topUsers.map((user) => ({
          id: user.id,
          name:
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            user.email ||
            'Usuário',
          annotations: user.totalAnnotationsCount,
        })),
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
          value: `${((activeUsers / totalUsers) * 100).toFixed(1)}%`,
          change: 5.2,
          isPositive: true,
        },
        {
          metric: 'Conteúdo por Usuário',
          value: (totalWorks / totalUsers).toFixed(1),
          change: 2.1,
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
