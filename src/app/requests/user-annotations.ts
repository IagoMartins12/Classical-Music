// app/requests/user-annotations.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';

export interface UserAnnotation {
  id: string;
  userId: string;
  workId: string;
  title: string;
  content: string;
  category: string;
  scope: string;
  measureStart?: number;
  measureEnd?: number;
  movement?: string;
  section?: string;
  pageNumber?: number;
  hand?: string;
  voice?: string;
  instrument?: string;
  difficulty: string;
  tags: string[];
  isPublic: boolean;
  isVerified: boolean;
  helpfulCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  work: {
    id: string;
    title: string;
    opOrCatalog?: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
  _count: {
    helpfulVotes: number;
    replies: number;
  };
}

// Buscar todas as anotações do usuário (SSR otimizado)
export const getUserAnnotations = unstable_cache(
  async (userId: string) => {
    try {
      const annotations = await prisma.workAnnotation.findMany({
        where: { userId },
        select: {
          id: true,
          userId: true,
          workId: true,
          title: true,
          content: true,
          category: true,
          scope: true,
          measureStart: true,
          measureEnd: true,
          movement: true,
          section: true,
          pageNumber: true,
          hand: true,
          voice: true,
          instrument: true,
          difficulty: true,
          tags: true,
          isPublic: true,
          isVerified: true,
          helpfulCount: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
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
          _count: {
            select: {
              helpfulVotes: true,
              replies: true,
            },
          },
        },
        orderBy: [
          { helpfulCount: 'desc' }, // Mais úteis primeiro
          { createdAt: 'desc' }, // Mais recentes primeiro
        ],
      });

      return {
        annotations: annotations.map((annotation) => ({
          ...annotation,
          createdAt: annotation.createdAt.toISOString(),
          updatedAt: annotation.updatedAt.toISOString(),
        })) as UserAnnotation[],
        totalAnnotations: annotations.length,
        publicAnnotations: annotations.filter((a) => a.isPublic).length,
        verifiedAnnotations: annotations.filter((a) => a.isVerified).length,
        totalHelpfulVotes: annotations.reduce(
          (sum, a) => sum + a.helpfulCount,
          0
        ),
        totalViews: annotations.reduce((sum, a) => sum + a.viewCount, 0),
      };
    } catch (error) {
      console.error('Erro ao buscar anotações do usuário:', error);
      return {
        annotations: [],
        totalAnnotations: 0,
        publicAnnotations: 0,
        verifiedAnnotations: 0,
        totalHelpfulVotes: 0,
        totalViews: 0,
      };
    }
  },
  ['user-annotations'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user-annotations'],
  }
);

// Buscar anotações do usuário logado (SSR)
export const getCurrentUserAnnotations = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        annotations: [],
        totalAnnotations: 0,
        publicAnnotations: 0,
        verifiedAnnotations: 0,
        totalHelpfulVotes: 0,
        totalViews: 0,
      };
    }

    return await getUserAnnotations(session.user.id);
  } catch (error) {
    console.error('Erro ao buscar anotações do usuário atual:', error);
    return {
      annotations: [],
      totalAnnotations: 0,
      publicAnnotations: 0,
      verifiedAnnotations: 0,
      totalHelpfulVotes: 0,
      totalViews: 0,
    };
  }
};

// Estatísticas das anotações por categoria
export const getUserAnnotationStats = unstable_cache(
  async (userId: string) => {
    try {
      const [categoryStats, difficultyStats, scopeStats, recentActivity] =
        await Promise.all([
          // Agrupamento por categoria
          prisma.workAnnotation.groupBy({
            by: ['category'],
            where: { userId },
            _count: { category: true },
            _sum: { helpfulCount: true, viewCount: true },
            orderBy: { _count: { category: 'desc' } },
          }),

          // Agrupamento por dificuldade
          prisma.workAnnotation.groupBy({
            by: ['difficulty'],
            where: { userId },
            _count: { difficulty: true },
            orderBy: { _count: { difficulty: 'desc' } },
          }),

          // Agrupamento por abrangência
          prisma.workAnnotation.groupBy({
            by: ['scope'],
            where: { userId },
            _count: { scope: true },
            orderBy: { _count: { scope: 'desc' } },
          }),

          // Atividade recente (últimos 30 dias)
          prisma.workAnnotation.count({
            where: {
              userId,
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          }),
        ]);

      return {
        categoryDistribution: categoryStats,
        difficultyDistribution: difficultyStats,
        scopeDistribution: scopeStats,
        recentAnnotations: recentActivity,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de anotações:', error);
      return {
        categoryDistribution: [],
        difficultyDistribution: [],
        scopeDistribution: [],
        recentAnnotations: 0,
      };
    }
  },
  ['user-annotations-stats'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['user-annotations', 'annotation-stats'],
  }
);

// Anotações mais populares do usuário
export const getUserTopAnnotations = unstable_cache(
  async (userId: string, limit: number = 10) => {
    try {
      const topAnnotations = await prisma.workAnnotation.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          category: true,
          helpfulCount: true,
          viewCount: true,
          isVerified: true,
          work: {
            select: {
              title: true,
              composer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [{ helpfulCount: 'desc' }, { viewCount: 'desc' }],
        take: limit,
      });

      return topAnnotations;
    } catch (error) {
      console.error('Erro ao buscar top anotações do usuário:', error);
      return [];
    }
  },
  ['user-top-annotations'],
  {
    revalidate: 3600, // 1 hora
    tags: ['user-annotations', 'annotation-stats'],
  }
);

// Obras mais anotadas pelo usuário
export const getUserMostAnnotatedWorks = unstable_cache(
  async (userId: string, limit: number = 5) => {
    try {
      const worksWithAnnotations = await prisma.work.findMany({
        where: {
          workAnnotations: {
            some: { userId },
          },
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
          _count: {
            select: {
              workAnnotations: {
                where: { userId },
              },
            },
          },
        },
        orderBy: {
          workAnnotations: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      return worksWithAnnotations.map((work) => ({
        ...work,
        annotationsCount: work._count.workAnnotations,
      }));
    } catch (error) {
      console.error('Erro ao buscar obras mais anotadas pelo usuário:', error);
      return [];
    }
  },
  ['user-most-annotated-works'],
  {
    revalidate: 3600, // 1 hora
    tags: ['user-annotations', 'works'],
  }
);

// Função para invalidar caches de anotações
export async function revalidateAnnotationsCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('user-annotations');
  revalidateTag('user-annotations-stats');
  revalidateTag('user-top-annotations');
  revalidateTag('user-most-annotated-works');
  revalidateTag('annotation-stats');

  if (userId) {
    revalidateTag(`user-annotations-${userId}`);
    revalidateTag(`user-annotations-stats-${userId}`);
  }
}
