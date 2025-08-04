// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalComposers: number;
    totalWorks: number;
    totalScores: number;
    totalAnnotations: number;
    growthRate: {
      users: number;
      works: number;
      annotations: number;
    };
  };
  topUsers: {
    mostActive: Array<{
      id: string;
      name: string;
      email: string;
      annotationsCount: number;
      uploadsCount: number;
      lastActive: Date;
    }>;
    topContributors: Array<{
      id: string;
      name: string;
      qualityScore: number;
    }>;
    topAnnotators: Array<{
      id: string;
      name: string;
      annotationsCount: number;
      helpfulAnnotationsCount: number;
      avgHelpfulRatio: number;
    }>;
  };
  content: {
    popularWorks: Array<{
      id: string;
      title: string;
      composer: string;
      favoritesCount: number;
      annotationsCount: number;
      scoreCount: number;
    }>;
    popularComposers: Array<{
      id: string;
      name: string;
      worksCount: number;
      totalFavorites: number;
      avgWorksPerUser: number;
    }>;
    recentUploads: Array<{
      id: string;
      type: string;
      title: string;
      uploader: string;
      uploadDate: Date;
      quality: string;
      verified: boolean;
    }>;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    avgAnnotationsPerWork: number;

    annotationsTrends: Array<{
      date: string;
      count: number;
      helpfulCount: number;
    }>;
  };
  quality: {
    avgUploadQuality: number;
    verifiedContent: {
      composers: number;
      works: number;
      scores: number;
    };
    contentCompleteness: {
      composersWithBio: number;
      worksWithScores: number;
      avgScoresPerWork: number;
    };
  };
  trends: {
    last30Days: {
      newUsers: number;
      newAnnotations: number;
      newUploads: number;
    };
    last7Days: {
      newUsers: number;
      newAnnotations: number;
      newUploads: number;
    };
    userRetention: {
      day1: number;
      day7: number;
      day30: number;
    };
  };
}

// Cache das estatísticas principais por 10 minutos
const getCachedOverviewStats = unstable_cache(
  async () => {
    const [
      totalUsers,
      totalComposers,
      totalWorks,
      totalScores,
      totalAnnotations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.composer.count(),
      prisma.work.count(),
      prisma.workScore.count({ where: { isActive: true } }),
      prisma.workAnnotation.count({ where: { isPublic: true } }),
    ]);

    // Calcular taxas de crescimento (último mês vs mês anterior)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const [
      newUsersLastMonth,
      newUsersMonthBefore,
      newWorksLastMonth,
      newWorksMonthBefore,
      newAnnotationsLastMonth,
      newAnnotationsMonthBefore,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.user.count({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
        },
      }),
      prisma.work.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.work.count({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
        },
      }),
      prisma.workAnnotation.count({
        where: { createdAt: { gte: lastMonth } },
      }),
      prisma.workAnnotation.count({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
        },
      }),
    ]);

    const calculateGrowthRate = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalUsers,
      totalComposers,
      totalWorks,
      totalScores,
      totalAnnotations,

      growthRate: {
        users: calculateGrowthRate(newUsersLastMonth, newUsersMonthBefore),
        works: calculateGrowthRate(newWorksLastMonth, newWorksMonthBefore),
        annotations: calculateGrowthRate(
          newAnnotationsLastMonth,
          newAnnotationsMonthBefore
        ),
      },
    };
  },
  ['admin-overview-stats'],
  { revalidate: 600 } // 10 minutos
);

// Cache dos usuários mais ativos por 5 minutos
const getCachedTopUsers = unstable_cache(
  async () => {
    // Usuários mais ativos (baseado em tempo de estudo + anotações + uploads)
    const mostActive = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalAnnotationsCount: true,
        totalUploads: true,
        updatedAt: true,
      },
      orderBy: [{ totalAnnotationsCount: 'desc' }],
      take: 10,
    });

    // Top contributors (uploads de qualidade)
    const topContributors = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalUploads: true,
        uploadScore: true,
      },
      where: {
        totalUploads: { gt: 0 },
      },
      take: 10,
    });

    // Top anotadores
    const topAnnotators = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalAnnotationsCount: true,
        helpfulAnnotationsCount: true,
      },
      where: {
        totalAnnotationsCount: { gt: 0 },
      },
      orderBy: [
        { helpfulAnnotationsCount: 'desc' },
        { totalAnnotationsCount: 'desc' },
      ],
      take: 10,
    });

    return {
      mostActive: mostActive.map((user) => ({
        id: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email ||
          'Usuário',
        email: user.email || '',
        annotationsCount: user.totalAnnotationsCount,
        uploadsCount: user.totalUploads,
        lastActive: user.updatedAt,
      })),
      topContributors: topContributors.map((user) => ({
        id: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário',
        uploadsCount: user.totalUploads,
        qualityScore: user.uploadScore,
      })),
      topAnnotators: topAnnotators.map((user) => ({
        id: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário',
        annotationsCount: user.totalAnnotationsCount,
        helpfulAnnotationsCount: user.helpfulAnnotationsCount,
        avgHelpfulRatio:
          user.totalAnnotationsCount > 0
            ? (user.helpfulAnnotationsCount / user.totalAnnotationsCount) * 100
            : 0,
      })),
    };
  },
  ['admin-top-users'],
  { revalidate: 300 } // 5 minutos
);

// Cache do conteúdo popular por 15 minutos
const getCachedPopularContent = unstable_cache(
  async () => {
    // Obras mais populares (baseado em favoritos + anotações + sessões de estudo)
    const popularWorks = await prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: {
          select: { name: true },
        },
        _count: {
          select: {
            favoriteBy: true,
            workAnnotations: true,
            cachedScores: true,
          },
        },
      },
      orderBy: {
        favoriteBy: {
          _count: 'desc',
        },
      },
      take: 15,
    });

    // Compositores mais populares
    const popularComposers = await prisma.composer.findMany({
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
        favoriteByUsers: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Uploads recentes
    const recentUploads = await prisma.uploadHistory.findMany({
      select: {
        id: true,
        entityType: true,
        entityId: true,
        action: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      where: {
        action: 'create',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Buscar detalhes dos uploads recentes
    const uploadsWithDetails = await Promise.all(
      recentUploads.map(async (upload) => {
        let title = 'Item desconhecido';
        let quality = 'unknown';
        let verified = false;

        if (upload.entityType === 'composer') {
          const composer = await prisma.composer.findUnique({
            where: { id: upload.entityId },
            select: { name: true, isVerified: true, dataQuality: true },
          });
          if (composer) {
            title = composer.name;
            quality = composer.dataQuality || 'unknown';
            verified = composer.isVerified || false;
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
          quality,
          verified,
        };
      })
    );

    return {
      popularWorks: popularWorks.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer.name,
        favoritesCount: work._count.favoriteBy,
        annotationsCount: work._count.workAnnotations,
        scoreCount: work._count.cachedScores,
      })),
      popularComposers: popularComposers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        worksCount: composer._count.works,
        totalFavorites: composer._count.favoriteByUsers,
        avgWorksPerUser:
          composer._count.favoriteByUsers > 0
            ? composer._count.works / composer._count.favoriteByUsers
            : 0,
      })),
      recentUploads: uploadsWithDetails,
    };
  },
  ['admin-popular-content'],
  { revalidate: 900 } // 15 minutos
);

// Estatísticas de engajamento (cache de 5 minutos)
const getCachedEngagementStats = unstable_cache(
  async () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      avgAnnotationsPerWork,
    ] = await Promise.all([
      prisma.user.count({
        where: { updatedAt: { gte: oneDayAgo } },
      }),
      prisma.user.count({
        where: { updatedAt: { gte: oneWeekAgo } },
      }),
      prisma.user.count({
        where: { updatedAt: { gte: oneMonthAgo } },
      }),

      prisma.workAnnotation.count().then(async (total) => {
        const totalWorks = await prisma.work.count();
        return totalWorks > 0 ? total / totalWorks : 0;
      }),
    ]);

    // Tendências de anotações (últimos 7 dias)
    const annotationsTrends = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        return prisma.workAnnotation
          .findMany({
            where: {
              createdAt: {
                gte: date,
                lt: nextDay,
              },
            },
            select: {
              id: true,
              helpfulCount: true,
            },
          })
          .then((annotations) => ({
            date: date.toISOString().split('T')[0],
            count: annotations.length,
            helpfulCount: annotations.reduce(
              (sum, a) => sum + a.helpfulCount,
              0
            ),
          }));
      })
    );

    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      avgAnnotationsPerWork,
      annotationsTrends: annotationsTrends.reverse(),
    };
  },
  ['admin-engagement-stats'],
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
    const section = searchParams.get('section') || 'all';

    // Buscar todas as estatísticas em paralelo para máxima performance
    const [overview, topUsers, content, engagement] = await Promise.all([
      section === 'all' || section === 'overview'
        ? getCachedOverviewStats()
        : null,
      section === 'all' || section === 'users' ? getCachedTopUsers() : null,
      section === 'all' || section === 'content'
        ? getCachedPopularContent()
        : null,
      section === 'all' || section === 'engagement'
        ? getCachedEngagementStats()
        : null,
    ]);

    // Estatísticas de qualidade (calculadas em tempo real para maior precisão)
    const quality =
      section === 'all' || section === 'quality'
        ? await (async () => {
            const [
              avgQuality,
              verifiedComposers,
              verifiedWorks,
              verifiedScores,
              composersWithBio,
              worksWithScores,
              avgScoresPerWork,
            ] = await Promise.all([
              prisma.user.aggregate({ _avg: { uploadScore: true } }),
              prisma.composer.count({ where: { isVerified: true } }),
              prisma.work.count({ where: { isVerified: true } }), // Ajustar se tiver campo isVerified
              prisma.workScore.count({ where: { isVerified: true } }),
              prisma.composer.count({ where: { bio: { not: null } } }),
              prisma.work.count({
                where: {
                  cachedScores: {
                    some: { isActive: true },
                  },
                },
              }),
              prisma.workScore
                .groupBy({
                  by: ['workId'],
                  where: { isActive: true },
                  _count: { id: true },
                })
                .then((scores) => {
                  const totalWorks = scores.length;
                  const totalScores = scores.reduce(
                    (sum, s) => sum + s._count.id,
                    0
                  );
                  return totalWorks > 0 ? totalScores / totalWorks : 0;
                }),
            ]);

            return {
              avgUploadQuality: avgQuality._avg.uploadScore || 0,
              verifiedContent: {
                composers: verifiedComposers,
                works: verifiedWorks,
                scores: verifiedScores,
              },
              contentCompleteness: {
                composersWithBio,
                worksWithScores,
                avgScoresPerWork,
              },
            };
          })()
        : null;

    // Tendências (últimos 30 e 7 dias)
    const trends =
      section === 'all' || section === 'trends'
        ? await (async () => {
            const now = new Date();
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const last30Days = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            );

            const [
              newUsers30d,
              newAnnotations30d,
              newUploads30d,
              newUsers7d,
              newAnnotations7d,
              newUploads7d,
            ] = await Promise.all([
              prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
              prisma.workAnnotation.count({
                where: { createdAt: { gte: last30Days } },
              }),
              prisma.uploadHistory.count({
                where: {
                  createdAt: { gte: last30Days },
                  action: 'create',
                },
              }),

              prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
              prisma.workAnnotation.count({
                where: { createdAt: { gte: last7Days } },
              }),
              prisma.uploadHistory.count({
                where: {
                  createdAt: { gte: last7Days },
                  action: 'create',
                },
              }),
            ]);

            return {
              last30Days: {
                newUsers: newUsers30d,
                newAnnotations: newAnnotations30d,
                newUploads: newUploads30d,
              },
              last7Days: {
                newUsers: newUsers7d,
                newAnnotations: newAnnotations7d,
                newUploads: newUploads7d,
              },
              userRetention: {
                day1: 0, // Implementar se necessário
                day7: 0,
                day30: 0,
              },
            };
          })()
        : null;

    const stats: AdminStats = {
      overview: overview!,
      topUsers: topUsers!,
      content: content!,
      engagement: engagement!,
      quality: quality!,
      trends: trends!,
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na API de estatísticas do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
