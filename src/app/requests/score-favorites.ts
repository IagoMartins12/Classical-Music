// app/requests/score-favorites.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { ScoreSource } from '@prisma/client'; // Adicionar importação do enum

export interface ScoreFavoriteWithWork {
  id: string;
  userId: string;
  workId: string;
  scoreId: string;
  scoreSource: string;
  scoreTitle: string;
  scoreType: string;
  personalRating?: number;
  notes?: string;
  tags: string[];
  addedAt: Date;
  work: {
    id: string;
    title: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
}

export interface WorkScoreStats {
  workId: string;
  scoreId: string;
  scoreSource: string;
  totalFavorites: number;
  avgRating?: number;
  scoreTitle: string;
  scoreType: string;
  downloadUrl?: string;
  isMostFavorited?: boolean;
}

// Buscar favoritos de partituras do usuário atual
export const getCurrentUserScoreFavorites = unstable_cache(
  async (userId: string) => {
    try {
      const favorites = await prisma.favoriteScore.findMany({
        where: { userId },
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

      return favorites as ScoreFavoriteWithWork[];
    } catch (error) {
      console.error(
        'Erro ao buscar favoritos de partituras do usuário:',
        error
      );
      return [];
    }
  },
  ['user-score-favorites'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user-score-favorites'],
  }
);

// Buscar favoritos de partituras de uma obra específica para o usuário atual
export const getUserWorkScoreFavorites = async (
  userId: string,
  workId: string
) => {
  try {
    const favorites = await prisma.favoriteScore.findMany({
      where: {
        userId,
        workId,
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

    return favorites as ScoreFavoriteWithWork[];
  } catch (error) {
    console.error('Erro ao buscar favoritos de partituras da obra:', error);
    return [];
  }
};

// Buscar estatísticas de favoritos de partituras de uma obra
export const getWorkScoreFavoriteStats = unstable_cache(
  async (workId: string) => {
    try {
      const stats = await prisma.scoreFavoriteStats.findMany({
        where: { workId },
        orderBy: [{ totalFavorites: 'desc' }, { avgRating: 'desc' }],
      });

      // Adicionar flag de "mais favoritada" para a primeira
      const processedStats = stats.map((stat, index) => ({
        ...stat,
        isMostFavorited: index === 0 && stat.totalFavorites > 0,
      }));

      return processedStats as (WorkScoreStats & { lastUpdated: Date })[];
    } catch (error) {
      console.error('Erro ao buscar estatísticas de favoritos da obra:', error);
      return [];
    }
  },
  ['work-score-stats'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['work-score-stats'],
  }
);

// Buscar partituras mais favoritadas globalmente
export const getMostFavoritedScoresGlobal = unstable_cache(
  async (limit: number = 50) => {
    try {
      const stats = await prisma.scoreFavoriteStats.findMany({
        where: {
          totalFavorites: {
            gt: 0,
          },
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
        orderBy: [{ totalFavorites: 'desc' }, { avgRating: 'desc' }],
        take: limit,
      });

      return stats.map((stat) => ({
        ...stat,
        work: stat.work,
      }));
    } catch (error) {
      console.error('Erro ao buscar partituras mais favoritadas:', error);
      return [];
    }
  },
  ['most-favorited-scores-global'],
  {
    revalidate: 3600, // 1 hora
    tags: ['favorites-stats', 'scores'],
  }
);

// Buscar obras com mais partituras favoritadas
export const getWorksWithMostFavoritedScores = unstable_cache(
  async (limit: number = 20) => {
    try {
      const result = await prisma.scoreFavoriteStats.groupBy({
        by: ['workId'],
        _sum: {
          totalFavorites: true,
        },
        _count: {
          workId: true,
        },
        _avg: {
          avgRating: true,
        },
        orderBy: {
          _sum: {
            totalFavorites: 'desc',
          },
        },
        take: limit,
        // Correção: usar where ao invés de having para filtrar antes da agregação
        where: {
          totalFavorites: {
            gt: 0,
          },
        },
      });

      // Buscar dados das obras
      const workIds = result.map((r) => r.workId);
      const works = await prisma.work.findMany({
        where: {
          id: { in: workIds },
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          composer: {
            select: {
              name: true,
              fullName: true,
            },
          },
        },
      });

      // Combinar dados - correção de tipos
      return result.map((stat) => {
        const work = works.find((w) => w.id === stat.workId);
        return {
          workId: stat.workId,
          work,
          totalScoreFavorites: stat._sum?.totalFavorites || 0,
          totalFavoritedScores: stat._count?.workId || 0,
          avgRating: stat._avg?.avgRating || null,
        };
      });
    } catch (error) {
      console.error(
        'Erro ao buscar obras com mais partituras favoritadas:',
        error
      );
      return [];
    }
  },
  ['works-most-favorited-scores'],
  {
    revalidate: 3600, // 1 hora
    tags: ['favorites-stats', 'works', 'scores'],
  }
);

// Verificar se partituras específicas estão favoritadas
export const checkScoresFavoritedStatus = async (
  userId: string,
  scores: Array<{ workId: string; scoreId: string; scoreSource?: string }>
) => {
  try {
    const favorites = await prisma.favoriteScore.findMany({
      where: {
        userId,
        OR: scores.map((score) => ({
          workId: score.workId,
          scoreId: score.scoreId,
          scoreSource: (score.scoreSource || 'IMSLP') as ScoreSource, // Cast para enum
        })),
      },
      select: {
        workId: true,
        scoreId: true,
        scoreSource: true,
        personalRating: true,
        notes: true,
        tags: true,
      },
    });

    // Criar mapa de status
    const statusMap = scores.reduce((acc, score) => {
      const key = `${score.workId}-${score.scoreId}-${
        score.scoreSource || 'IMSLP'
      }`;
      const favorite = favorites.find(
        (fav) =>
          fav.workId === score.workId &&
          fav.scoreId === score.scoreId &&
          fav.scoreSource === (score.scoreSource || 'IMSLP')
      );

      acc[key] = {
        isFavorited: !!favorite,
        favorite: favorite || null,
      };
      return acc;
    }, {} as Record<string, { isFavorited: boolean; favorite: any }>);

    return statusMap;
  } catch (error) {
    console.error('Erro ao verificar status de favoritos:', error);
    return {};
  }
};

// Buscar favoritos iniciais para SSR (dados mínimos para hidratação)
export const getInitialScoreFavoritesData = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        userFavorites: [],
        globalStats: {
          totalScoreFavorites: 0,
          mostFavoritedScore: null,
        },
      };
    }

    // Carregar favoritos do usuário e algumas estatísticas globais
    const [userFavorites, globalMostFavorited] = await Promise.all([
      getCurrentUserScoreFavorites(session.user.id),
      getMostFavoritedScoresGlobal(1), // Só a mais favoritada
    ]);

    return {
      userFavorites,
      globalStats: {
        totalScoreFavorites: globalMostFavorited.reduce(
          (sum, stat) => sum + stat.totalFavorites,
          0
        ),
        mostFavoritedScore: globalMostFavorited[0] || null,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados iniciais de favoritos:', error);
    return {
      userFavorites: [],
      globalStats: {
        totalScoreFavorites: 0,
        mostFavoritedScore: null,
      },
    };
  }
};

// Função para invalidar caches de favoritos de partituras
export async function revalidateScoreFavoritesCache(
  userId?: string,
  workId?: string
) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('user-score-favorites');
  revalidateTag('work-score-stats');
  revalidateTag('most-favorited-scores-global');
  revalidateTag('works-most-favorited-scores');
  revalidateTag('favorites-stats');

  if (userId) {
    revalidateTag(`user-score-favorites-${userId}`);
  }

  if (workId) {
    revalidateTag(`work-score-stats-${workId}`);
  }
}
