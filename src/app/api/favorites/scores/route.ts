// app/api/favorites/scores/route.ts - VERSÃO CORRIGIDA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { ScoreSource, IMSLPScoreType } from '@prisma/client';
import {
  ActivityActions,
  getRequestInfo,
  trackActivity,
} from '@/app/libs/activityTracker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const {
      workId,
      scoreId,
      scoreSource = 'IMSLP',
      action,
      scoreData,
      personalRating,
      notes,
      tags = [],
    } = await request.json();
    const requestInfo = getRequestInfo(request);

    if (!workId || !scoreId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verificar se a obra existe
    const workExists = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, title: true },
    });

    if (!workExists) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      if (!scoreData) {
        return NextResponse.json(
          { error: 'Dados da partitura são obrigatórios para adicionar' },
          { status: 400 }
        );
      }

      // Adicionar aos favoritos (upsert para evitar duplicatas)
      const favorite = await prisma.favoriteScore.upsert({
        where: {
          user_work_score_unique: {
            userId: session.user.id,
            workId: workId,
            scoreId: scoreId,
            scoreSource: scoreSource as ScoreSource,
          },
        },
        update: {
          // Atualizar dados se já existe
          personalRating,
          notes,
          tags,
          lastAccessed: new Date(),
          accessCount: { increment: 1 },
          scoreTitle: scoreData.title,
          downloadUrl: scoreData.downloadUrl,
          fileSize: scoreData.fileSize,
          pageCount: scoreData.pageCount,
        },
        create: {
          userId: session.user.id,
          workId: workId,
          scoreId: scoreId,
          scoreSource: scoreSource as ScoreSource,
          scoreTitle: scoreData.title,
          scoreType:
            (scoreData.type?.toUpperCase() as IMSLPScoreType) || 'SCORES',
          downloadUrl: scoreData.downloadUrl,
          fileSize: scoreData.fileSize,
          pageCount: scoreData.pageCount,
          personalRating,
          notes,
          tags,
          accessCount: 1,
        },
        include: {
          work: {
            select: {
              id: true,
              title: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      // Atualizar estatísticas em background
      updateScoreStats(workId, scoreId, scoreSource as ScoreSource).catch(
        console.error
      );

      // 🆕 TRACKING
      trackActivity({
        userId: session.user.id,
        type: 'FAVORITE_COMPOSER',
        action: ActivityActions.FAVORITE_COMPOSER,
        entityType: 'composer',
        entityId: scoreId,
        entityName: scoreData.fullName || scoreData.name,

        ...requestInfo,
      });

      // Invalidar caches relacionados
      revalidateTag(`user-favorites-${session.user.id}`);
      revalidateTag(`work-favorites-${workId}`);
      revalidateTag(`score-favorites-${workId}-${scoreId}`);
      revalidateTag('user-favorites');

      return NextResponse.json({
        success: true,
        action: 'added',
        favorite: {
          id: favorite.id,
          userId: favorite.userId,
          workId: favorite.workId,
          scoreId: favorite.scoreId,
          scoreSource: favorite.scoreSource,
          scoreTitle: favorite.scoreTitle,
          scoreType: favorite.scoreType,
          personalRating: favorite.personalRating,
          notes: favorite.notes,
          tags: favorite.tags,
          addedAt: favorite.addedAt,
          work: favorite.work,
        },
      });
    } else if (action === 'remove') {
      // Remover dos favoritos
      const deleted = await prisma.favoriteScore.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
          scoreId: scoreId,
          scoreSource: scoreSource as ScoreSource,
        },
      });

      // 🆕 TRACKING
      trackActivity({
        userId: session.user.id,
        type: 'UNFAVORITE_COMPOSER',
        action: ActivityActions.UNFAVORITE_COMPOSER,
        entityType: 'composer',
        entityId: scoreId,
        entityName: scoreData.fullName || scoreData.name,

        ...requestInfo,
      });

      if (deleted.count > 0) {
        // Atualizar estatísticas em background
        updateScoreStats(workId, scoreId, scoreSource as ScoreSource).catch(
          console.error
        );

        // Invalidar caches relacionados
        revalidateTag(`user-favorites-${session.user.id}`);
        revalidateTag(`work-favorites-${workId}`);
        revalidateTag(`score-favorites-${workId}-${scoreId}`);
        revalidateTag('user-favorites');
      }

      return NextResponse.json({
        success: true,
        action: 'removed',
      });
    } else if (action === 'update') {
      // Atualizar favorito existente
      const updated = await prisma.favoriteScore.updateMany({
        where: {
          userId: session.user.id,
          workId: workId,
          scoreId: scoreId,
          scoreSource: scoreSource as ScoreSource,
        },
        data: {
          personalRating,
          notes,
          tags,
          lastAccessed: new Date(),
          accessCount: { increment: 1 },
        },
      });

      if (updated.count > 0) {
        // Atualizar estatísticas se a avaliação mudou
        if (personalRating !== undefined) {
          updateScoreStats(workId, scoreId, scoreSource as ScoreSource).catch(
            console.error
          );
        }

        // Invalidar caches
        revalidateTag(`user-favorites-${session.user.id}`);
        revalidateTag(`score-favorites-${workId}-${scoreId}`);
      }

      return NextResponse.json({
        success: true,
        action: 'updated',
      });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de favoritos de partituras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const scoreId = searchParams.get('scoreId');
    const scoreSource = searchParams.get('scoreSource') || 'IMSLP';
    const type = searchParams.get('type') || 'user-favorites';

    // 🆕 Permitir acesso público às estatísticas
    if (type === 'work-stats' || type === 'most-favorited') {
      if (!workId) {
        return NextResponse.json(
          { error: 'workId é obrigatório para estatísticas' },
          { status: 400 }
        );
      }

      if (type === 'work-stats') {
        const stats = await getWorkScoreStats(workId);
        return NextResponse.json(stats);
      }

      if (type === 'most-favorited') {
        const mostFavorited = await getMostFavoritedScoresForWork(workId);
        return NextResponse.json(mostFavorited);
      }
    }

    // Para outras operações, verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (type === 'most-favorited' && workId) {
      // 🆕 Endpoint simples: retorna apenas a partitura mais favoritada
      try {
        const mostFavorited = await getMostFavoritedScoreOnly(workId);
        return NextResponse.json(mostFavorited);
      } catch (error) {
        console.error('Erro ao buscar partitura mais favoritada:', error);
        return NextResponse.json([], { status: 200 }); // Retorna array vazio em caso de erro
      }
    }

    if (type === 'check-favorite' && workId && scoreId) {
      // Verificar se uma partitura específica está favoritada
      const favorite = await prisma.favoriteScore.findFirst({
        where: {
          userId: session.user.id,
          workId: workId,
          scoreId: scoreId,
          scoreSource: scoreSource as ScoreSource,
        },
        include: {
          work: {
            select: {
              title: true,
              composer: { select: { name: true } },
            },
          },
        },
      });

      return NextResponse.json({
        isFavorited: !!favorite,
        favorite: favorite
          ? {
              id: favorite.id,
              personalRating: favorite.personalRating,
              notes: favorite.notes,
              tags: favorite.tags,
              addedAt: favorite.addedAt,
              work: favorite.work,
            }
          : null,
      });
    }

    // Buscar todos os favoritos do usuário
    const favorites = await prisma.favoriteScore.findMany({
      where: {
        userId: session.user.id,
        ...(workId && { workId }),
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return NextResponse.json({
      favorites: favorites.map((fav) => ({
        id: fav.id,
        userId: fav.userId,
        workId: fav.workId,
        scoreId: fav.scoreId,
        scoreSource: fav.scoreSource,
        scoreTitle: fav.scoreTitle,
        scoreType: fav.scoreType,
        personalRating: fav.personalRating,
        notes: fav.notes,
        tags: fav.tags,
        addedAt: fav.addedAt,
        work: fav.work,
      })),
      count: favorites.length,
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos de partituras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 Função auxiliar para atualizar estatísticas (CORRIGIDA)
async function updateScoreStats(
  workId: string,
  scoreId: string,
  scoreSource: ScoreSource
) {
  try {
    // Calcular estatísticas dos favoritos
    const stats = await prisma.favoriteScore.aggregate({
      where: {
        workId,
        scoreId,
        scoreSource,
      },
      _count: { id: true },
      _avg: { personalRating: true },
    });

    const lastFavorited = await prisma.favoriteScore.findFirst({
      where: {
        workId,
        scoreId,
        scoreSource,
      },
      orderBy: { addedAt: 'desc' },
      select: {
        addedAt: true,
        scoreTitle: true,
        scoreType: true,
        downloadUrl: true,
      },
    });

    // 🆕 Usar upsert mais robusto para estatísticas
    await prisma.scoreFavoriteStats.upsert({
      where: {
        work_score_stats_unique: {
          workId,
          scoreId,
          scoreSource,
        },
      },
      update: {
        totalFavorites: stats._count.id,
        avgRating: stats._avg.personalRating,
        lastFavorited: lastFavorited?.addedAt,
        lastUpdated: new Date(),
      },
      create: {
        workId,
        scoreId,
        scoreSource,
        totalFavorites: stats._count.id,
        avgRating: stats._avg.personalRating,
        lastFavorited: lastFavorited?.addedAt,
        scoreTitle: lastFavorited?.scoreTitle || 'Unknown',
        scoreType: lastFavorited?.scoreType || 'SCORES',
        downloadUrl: lastFavorited?.downloadUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas da partitura:', error);
    // 🆕 Se falhar, tentar criar manualmente
    try {
      await createScoreStatsManually(workId, scoreId, scoreSource);
    } catch (secondError) {
      console.error('Erro ao criar estatísticas manualmente:', secondError);
    }
  }
}

// 🆕 Função para criar estatísticas manualmente como fallback
async function createScoreStatsManually(
  workId: string,
  scoreId: string,
  scoreSource: ScoreSource
) {
  // Verificar se já existe
  const existing = await prisma.scoreFavoriteStats.findFirst({
    where: {
      workId,
      scoreId,
      scoreSource,
    },
  });

  if (existing) {
    return; // Já existe, não precisa criar
  }

  // Buscar dados básicos da partitura
  const sampleFavorite = await prisma.favoriteScore.findFirst({
    where: {
      workId,
      scoreId,
      scoreSource,
    },
    select: {
      scoreTitle: true,
      scoreType: true,
      downloadUrl: true,
    },
  });

  // Contar favoritos
  const count = await prisma.favoriteScore.count({
    where: {
      workId,
      scoreId,
      scoreSource,
    },
  });

  // Criar entrada básica
  await prisma.scoreFavoriteStats.create({
    data: {
      workId,
      scoreId,
      scoreSource,
      totalFavorites: count,
      scoreTitle: sampleFavorite?.scoreTitle || 'Unknown Score',
      scoreType: sampleFavorite?.scoreType || 'SCORES',
      downloadUrl: sampleFavorite?.downloadUrl,
    },
  });
}

// 🆕 Função para buscar estatísticas de uma obra (CORRIGIDA)
async function getWorkScoreStats(workId: string) {
  try {
    // Primeiro, tentar buscar das estatísticas em cache
    const stats = await prisma.scoreFavoriteStats.findMany({
      where: { workId },
      orderBy: { totalFavorites: 'desc' },
      take: 20, // Top 20 partituras mais favoritadas
    });

    // Se não há estatísticas em cache, calcular em tempo real
    if (stats.length === 0) {
      const realTimeStats = await calculateRealTimeStats(workId);
      return realTimeStats;
    }

    const totalFavorites = stats.reduce(
      (sum, stat) => sum + stat.totalFavorites,
      0
    );

    return {
      totalFavorites,
      totalScores: stats.length,
      mostFavorited: stats[0] || null,
      topScores: stats,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    // Fallback para cálculo em tempo real
    return await calculateRealTimeStats(workId);
  }
}

// 🆕 Função para calcular estatísticas em tempo real
async function calculateRealTimeStats(workId: string) {
  try {
    // Buscar todos os favoritos desta obra
    const favorites = await prisma.favoriteScore.findMany({
      where: { workId },
      select: {
        scoreId: true,
        scoreSource: true,
        scoreTitle: true,
        scoreType: true,
        downloadUrl: true,
        personalRating: true,
      },
    });

    // Agrupar por scoreId + scoreSource
    const grouped = favorites.reduce(
      (acc, fav) => {
        const key = `${fav.scoreId}-${fav.scoreSource}`;
        if (!acc[key]) {
          acc[key] = {
            workId,
            scoreId: fav.scoreId,
            scoreSource: fav.scoreSource,
            scoreTitle: fav.scoreTitle,
            scoreType: fav.scoreType,
            downloadUrl: fav.downloadUrl,
            totalFavorites: 0,
            ratings: [],
          };
        }
        acc[key].totalFavorites += 1;
        if (fav.personalRating) {
          acc[key].ratings.push(fav.personalRating);
        }
        return acc;
      },
      {} as Record<string, any>
    );

    // Converter para array e calcular médias
    const topScores = Object.values(grouped)
      .map((group: any) => ({
        ...group,
        avgRating:
          group.ratings.length > 0
            ? group.ratings.reduce(
                (sum: number, rating: number) => sum + rating,
                0
              ) / group.ratings.length
            : null,
      }))
      .sort((a: any, b: any) => b.totalFavorites - a.totalFavorites)
      .slice(0, 20);

    const totalFavorites = topScores.reduce(
      (sum: number, stat: any) => sum + stat.totalFavorites,
      0
    );

    return {
      totalFavorites,
      totalScores: topScores.length,
      mostFavorited: topScores[0] || null,
      topScores,
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas em tempo real:', error);
    return {
      totalFavorites: 0,
      totalScores: 0,
      mostFavorited: null,
      topScores: [],
    };
  }
}

// Função para buscar partituras mais favoritadas
async function getMostFavoritedScoresForWork(workId: string) {
  try {
    return await prisma.scoreFavoriteStats.findMany({
      where: { workId },
      orderBy: [{ totalFavorites: 'desc' }, { avgRating: 'desc' }],
      take: 10,
    });
  } catch (error) {
    console.error('Erro ao buscar partituras mais favoritadas:', error);
    return [];
  }
}

async function getMostFavoritedScoreOnly(workId: string) {
  try {
    // Primeiro, tentar buscar das estatísticas em cache
    const cachedStats = await prisma.scoreFavoriteStats.findFirst({
      where: { workId },
      orderBy: { totalFavorites: 'desc' },
      select: {
        scoreId: true,
        scoreSource: true,
        totalFavorites: true,
        scoreTitle: true,
      },
    });

    if (cachedStats && cachedStats.totalFavorites > 0) {
      return [cachedStats]; // Retorna array com um item para compatibilidade
    }

    // Se não há cache, calcular em tempo real
    const favorites = await prisma.favoriteScore.findMany({
      where: { workId },
      select: {
        scoreId: true,
        scoreSource: true,
        scoreTitle: true,
      },
    });

    if (favorites.length === 0) {
      return []; // Nenhum favorito
    }

    // Contar favoritos por partitura
    const counts = favorites.reduce(
      (acc, fav) => {
        const key = `${fav.scoreId}-${fav.scoreSource}`;
        if (!acc[key]) {
          acc[key] = {
            scoreId: fav.scoreId,
            scoreSource: fav.scoreSource,
            scoreTitle: fav.scoreTitle,
            totalFavorites: 0,
          };
        }
        acc[key].totalFavorites += 1;
        return acc;
      },
      {} as Record<string, any>
    );

    // Encontrar a mais favoritada
    const sortedScores = Object.values(counts).sort(
      (a: any, b: any) => b.totalFavorites - a.totalFavorites
    );

    return sortedScores.length > 0 ? [sortedScores[0]] : [];
  } catch (error) {
    console.error('Erro ao calcular partitura mais favoritada:', error);
    return [];
  }
}
