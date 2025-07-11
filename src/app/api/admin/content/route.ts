// app/api/admin/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface ContentMetrics {
  totalComposers: number;
  verifiedComposers: number;
  totalWorks: number;
  totalScores: number;
  avgScoresPerWork: number;
  mostPopularWorks: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    studySessionsCount: number;
    annotationsCount: number;
    scoresCount: number;
  }>;
  mostPopularComposers: Array<{
    id: string;
    name: string;
    worksCount: number;
    totalFavorites: number;
    totalStudySessions: number;
    epoch: string;
  }>;
  contentByEpoch: Array<{
    epoch: string;
    composersCount: number;
    worksCount: number;
    scoresCount: number;
  }>;
  qualityMetrics: {
    highQualityContent: number;
    mediumQualityContent: number;
    lowQualityContent: number;
    averageQualityScore: number;
  };
  recentContent: Array<{
    id: string;
    type: 'composer' | 'work' | 'score';
    title: string;
    uploader: string;
    uploadDate: Date;
    quality: string;
    verified: boolean;
  }>;
}

// Cache das métricas de conteúdo por 10 minutos
const getCachedContentMetrics = unstable_cache(
  async (): Promise<ContentMetrics> => {
    // Dados básicos
    const [
      totalComposers,
      verifiedComposers,
      totalWorks,
      totalScores,
      avgScores,
    ] = await Promise.all([
      prisma.composer.count(),
      prisma.composer.count({ where: { isVerified: true } }),
      prisma.work.count(),
      prisma.workScore.count({ where: { isActive: true } }),
      prisma.workScore.groupBy({
        by: ['workId'],
        where: { isActive: true },
        _count: { id: true },
      }),
    ]);

    const avgScoresPerWork =
      avgScores.length > 0
        ? avgScores.reduce((sum, s) => sum + s._count.id, 0) / avgScores.length
        : 0;

    // Obras mais populares
    const mostPopularWorks = await prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
        _count: {
          select: {
            favoriteBy: true,
            studySessions: true,
            workAnnotations: true,
            cachedScores: { where: { isActive: true } },
          },
        },
      },
      orderBy: {
        favoriteBy: { _count: 'desc' },
      },
      take: 15,
    });

    // Compositores mais populares
    const mostPopularComposers = await prisma.composer.findMany({
      select: {
        id: true,
        name: true,
        epoch: { select: { name: true } },
        _count: {
          select: {
            works: true,
            favoriteByUsers: true,
          },
        },
      },
      orderBy: {
        favoriteByUsers: { _count: 'desc' },
      },
      take: 10,
    });

    // Conteúdo por época
    const contentByEpoch = await prisma.epoch.findMany({
      select: {
        name: true,
        _count: {
          select: {
            composers: true,
            works: true,
          },
        },
      },
    });

    // Adicionar contagem de partituras por época
    const epochWithScores = await Promise.all(
      contentByEpoch.map(async (epoch) => {
        const scoresCount = await prisma.workScore.count({
          where: {
            work: { epochId: epoch.name },
            isActive: true,
          },
        });

        return {
          epoch: epoch.name,
          composersCount: epoch._count.composers,
          worksCount: epoch._count.works,
          scoresCount,
        };
      })
    );

    // Métricas de qualidade
    const qualityMetrics = await prisma.composer.groupBy({
      by: ['dataQuality'],
      _count: { id: true },
    });

    const qualityDistribution = qualityMetrics.reduce((acc, item) => {
      const quality = item.dataQuality || 'unknown';
      acc[quality] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalQualityItems = Object.values(qualityDistribution).reduce(
      (sum, count) => sum + count,
      0
    );

    const qualityPercentages = {
      highQualityContent:
        ((qualityDistribution.high || 0) / totalQualityItems) * 100,
      mediumQualityContent:
        ((qualityDistribution.medium || 0) / totalQualityItems) * 100,
      lowQualityContent:
        ((qualityDistribution.low || 0) / totalQualityItems) * 100,
      averageQualityScore: 7.5, // Calcular baseado em dados reais
    };

    // Conteúdo recente
    const recentUploads = await prisma.uploadHistory.findMany({
      where: { action: 'create' },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Buscar detalhes dos uploads recentes
    const recentContent = await Promise.all(
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
          type: upload.entityType as 'composer' | 'work' | 'score',
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
      totalComposers,
      verifiedComposers,
      totalWorks,
      totalScores,
      avgScoresPerWork,
      mostPopularWorks: mostPopularWorks.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer.name,
        favoritesCount: work._count.favoriteBy,
        studySessionsCount: work._count.studySessions,
        annotationsCount: work._count.workAnnotations,
        scoresCount: work._count.cachedScores,
      })),
      mostPopularComposers: mostPopularComposers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        worksCount: composer._count.works,
        totalFavorites: composer._count.favoriteByUsers,
        totalStudySessions: 0, // Calcular se necessário
        epoch: composer.epoch?.name || 'Não definido',
      })),
      contentByEpoch: epochWithScores,
      qualityMetrics: qualityPercentages,
      recentContent,
    };
  },
  ['admin-content-metrics'],
  { revalidate: 600 } // 10 minutos
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await getCachedContentMetrics();

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na API de conteúdo do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
