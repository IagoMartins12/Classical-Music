// app/requests/favorites.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { getServerSession } from 'next-auth';
import { FavoriteComposer, FavoriteWork } from '../stores/useFavoritesStore';

// Buscar favoritos do usuário (compositores e obras) - OTIMIZADO
export const getUserFavorites = unstable_cache(
  async (userId: string) => {
    try {
      // Executar ambas as consultas em paralelo para máxima performance
      const [composerFavorites, workFavorites] = await Promise.all([
        // Favoritos de compositores
        prisma.favoriteComposer.findMany({
          where: { userId },
          select: {
            id: true,
            userId: true,
            composerId: true,
            composer: {
              select: {
                id: true,
                name: true,
                fullName: true,
                portraitUrl: true,
                epochName: true,
              },
            },
          },
          orderBy: {
            composer: {
              name: 'asc',
            },
          },
        }),

        // Favoritos de obras
        prisma.favoriteWork.findMany({
          where: { userId },
          select: {
            id: true,
            userId: true,
            workId: true,
            work: {
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
            },
          },
          orderBy: {
            work: {
              title: 'asc',
            },
          },
        }),
      ]);

      return {
        composers: composerFavorites as FavoriteComposer[],
        works: workFavorites as FavoriteWork[],
        totalCount: composerFavorites.length + workFavorites.length,
      };
    } catch (error) {
      console.error('Erro ao buscar favoritos do usuário:', error);
      return {
        composers: [],
        works: [],
        totalCount: 0,
      };
    }
  },
  ['user-favorites'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user-favorites'],
  }
);

// Buscar favoritos do usuário logado (SSR)
export const getCurrentUserFavorites = async () => {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return {
        composers: [],
        works: [],
        totalCount: 0,
      };
    }

    return await getUserFavorites(session.user.id);
  } catch (error) {
    console.error('Erro ao buscar favoritos do usuário atual:', error);
    return {
      composers: [],
      works: [],
      totalCount: 0,
    };
  }
};

// Buscar compositores mais favoritados - ESTATÍSTICAS
export const getMostFavoritedComposers = unstable_cache(
  async (limit: number = 10) => {
    try {
      const composers = await prisma.composer.findMany({
        select: {
          id: true,
          name: true,
          fullName: true,
          portraitUrl: true,
          epochName: true,
          _count: {
            select: {
              favoritedBy: true,
            },
          },
        },
        orderBy: {
          favoritedBy: {
            _count: 'desc',
          },
        },
        take: limit,
        where: {
          favoritedBy: {
            some: {},
          },
        },
      });

      return composers.map((composer) => ({
        ...composer,
        favoritesCount: composer._count.favoritedBy,
      }));
    } catch (error) {
      console.error('Erro ao buscar compositores mais favoritados:', error);
      return [];
    }
  },
  ['most-favorited-composers'],
  {
    revalidate: 3600, // 1 hora
    tags: ['favorites-stats', 'composers'],
  }
);

// Buscar obras mais favoritadas - ESTATÍSTICAS
export const getMostFavoritedWorks = unstable_cache(
  async (limit: number = 10) => {
    try {
      const works = await prisma.work.findMany({
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
          _count: {
            select: {
              favoriteBy: true,
            },
          },
        },
        orderBy: {
          favoriteBy: {
            _count: 'desc',
          },
        },
        take: limit,
        where: {
          favoriteBy: {
            some: {},
          },
        },
      });

      return works.map((work) => ({
        ...work,
        favoritesCount: work._count.favoriteBy,
      }));
    } catch (error) {
      console.error('Erro ao buscar obras mais favoritadas:', error);
      return [];
    }
  },
  ['most-favorited-works'],
  {
    revalidate: 3600, // 1 hora
    tags: ['favorites-stats', 'works'],
  }
);

// Verificar se itens estão favoritados (para SSR)
export const checkFavoritesStatus = async (
  userId: string,
  items: { id: string; type: 'composer' | 'work' }[]
) => {
  try {
    const composerIds = items
      .filter((item) => item.type === 'composer')
      .map((item) => item.id);
    const workIds = items
      .filter((item) => item.type === 'work')
      .map((item) => item.id);

    const [composerFavorites, workFavorites] = await Promise.all([
      composerIds.length > 0
        ? prisma.favoriteComposer.findMany({
            where: {
              userId,
              composerId: { in: composerIds },
            },
            select: { composerId: true },
          })
        : [],

      workIds.length > 0
        ? prisma.favoriteWork.findMany({
            where: {
              userId,
              workId: { in: workIds },
            },
            select: { workId: true },
          })
        : [],
    ]);

    const favoritedComposerIds = new Set(
      composerFavorites.map((f) => f.composerId)
    );
    const favoritedWorkIds = new Set(workFavorites.map((f) => f.workId));

    return items.reduce((acc, item) => {
      acc[item.id] =
        item.type === 'composer'
          ? favoritedComposerIds.has(item.id)
          : favoritedWorkIds.has(item.id);
      return acc;
    }, {} as Record<string, boolean>);
  } catch (error) {
    console.error('Erro ao verificar status dos favoritos:', error);
    return {};
  }
};

// Estatísticas gerais de favoritos
export const getFavoritesStats = unstable_cache(
  async () => {
    try {
      const [composersCount, worksCount, usersWithFavorites] =
        await Promise.all([
          prisma.favoriteComposer.count(),
          prisma.favoriteWork.count(),
          prisma.user.count({
            where: {
              OR: [
                { favoriteComposers: { some: {} } },
                { favoriteWorks: { some: {} } },
              ],
            },
          }),
        ]);

      return {
        totalComposerFavorites: composersCount,
        totalWorkFavorites: worksCount,
        totalFavorites: composersCount + worksCount,
        usersWithFavorites,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de favoritos:', error);
      return {
        totalComposerFavorites: 0,
        totalWorkFavorites: 0,
        totalFavorites: 0,
        usersWithFavorites: 0,
      };
    }
  },
  ['favorites-stats'],
  {
    revalidate: 3600, // 1 hora
    tags: ['favorites-stats'],
  }
);

// Função para invalidar caches de favoritos
export async function revalidateFavoritesCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('user-favorites');
  revalidateTag('favorites-stats');
  revalidateTag('most-favorited-composers');
  revalidateTag('most-favorited-works');

  if (userId) {
    revalidateTag(`user-favorites-${userId}`);
  }
}
