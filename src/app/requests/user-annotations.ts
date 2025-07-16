// app/requests/user-annotations.ts - VERSÃO CORRIGIDA
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
  };
}

// 🔧 CORRIGIDO: Cache com assinatura correta
export const getUserAnnotations = unstable_cache(
  async (userId: string) => {
    try {
      console.log('🔍 [SSR] Buscando anotações do usuário:', userId);

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
            },
          },
        },
        orderBy: [
          { helpfulCount: 'desc' }, // Mais úteis primeiro
          { createdAt: 'desc' }, // Mais recentes primeiro
        ],
      });

      console.log('✅ [SSR] Anotações encontradas:', annotations.length);

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
  // 🔧 CORRIGIDO: Tags como array de strings diretamente
  ['user-annotations'],
  {
    revalidate: 60, // Cache de 1 minuto
    tags: ['user-annotations', 'annotations-stats'],
  }
);

// 🔧 MELHORADO: Buscar anotações do usuário logado com cache mais específico
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

    console.log(
      '🔍 [SSR] Buscando anotações do usuário logado:',
      session.user.id
    );
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

// 🔧 CORRIGIDO: Estatísticas com cache correto
export const getUserAnnotationStats = unstable_cache(
  async (userId: string) => {
    try {
      console.log('🔍 [SSR] Buscando estatísticas do usuário:', userId);

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

      console.log('✅ [SSR] Estatísticas calculadas para usuário:', userId);

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
  // 🔧 CORRIGIDO: Tags como array de strings
  ['user-annotations-stats'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user-annotations', 'annotation-stats'],
  }
);

// 🔧 CORRIGIDO: Top anotações com cache correto
export const getUserTopAnnotations = unstable_cache(
  async (userId: string, limit: number = 10) => {
    try {
      console.log('🔍 [SSR] Buscando top anotações do usuário:', userId);

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

      console.log('✅ [SSR] Top anotações encontradas:', topAnnotations.length);

      return topAnnotations;
    } catch (error) {
      console.error('Erro ao buscar top anotações do usuário:', error);
      return [];
    }
  },
  // 🔧 CORRIGIDO: Tags como array de strings
  ['user-top-annotations'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['user-annotations', 'annotation-stats'],
  }
);

// 🔧 CORRIGIDO: Obras mais anotadas com cache correto
export const getUserMostAnnotatedWorks = unstable_cache(
  async (userId: string, limit: number = 5) => {
    try {
      console.log(
        '🔍 [SSR] Buscando obras mais anotadas pelo usuário:',
        userId
      );

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

      console.log(
        '✅ [SSR] Obras mais anotadas encontradas:',
        worksWithAnnotations.length
      );

      return worksWithAnnotations.map((work) => ({
        ...work,
        annotationsCount: work._count.workAnnotations,
      }));
    } catch (error) {
      console.error('Erro ao buscar obras mais anotadas pelo usuário:', error);
      return [];
    }
  },
  // 🔧 CORRIGIDO: Tags como array de strings
  ['user-most-annotated-works'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['user-annotations', 'works'],
  }
);

// 🔧 MELHORADO: Função para invalidar caches com mais granularidade
export async function revalidateAnnotationsCache(
  userId?: string,
  workId?: string
) {
  const { revalidateTag } = await import('next/cache');

  console.log('🔄 Invalidando cache de anotações:', { userId, workId });

  // Tags gerais
  const tagsToInvalidate = [
    'user-annotations',
    'user-annotations-stats',
    'user-top-annotations',
    'user-most-annotated-works',
    'annotation-stats',
    'annotations-popular',
  ];

  // Tags específicas do usuário
  if (userId) {
    tagsToInvalidate.push(
      `user-annotations-${userId}`,
      `user-annotations-stats-${userId}`,
      `user-top-annotations-${userId}`,
      `user-most-annotated-works-${userId}`
    );
  }

  // Tags específicas da obra
  if (workId) {
    tagsToInvalidate.push(
      `work-annotations-${workId}`,
      `work-details-${workId}`,
      `work-stats-${workId}`
    );
  }

  // Invalidar todas as tags
  for (const tag of tagsToInvalidate) {
    revalidateTag(tag);
  }

  console.log('✅ Cache invalidado:', tagsToInvalidate.length, 'tags');
}
