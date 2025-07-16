// app/requests/learning.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { getServerSession } from 'next-auth';
import { WantToLearnItem, LearnedItem } from '../stores/useLearningStore';
import { authOptions } from '../libs/auth';

// Buscar dados de aprendizado do usuário (SSR otimizado)
export const getUserLearningData = unstable_cache(
  async (userId: string) => {
    try {
      // Executar ambas as consultas em paralelo para máxima performance
      const [wantToLearnItems, learnedItems] = await Promise.all([
        // Itens que o usuário quer estudar
        prisma.wantToLearn.findMany({
          where: { userId },
          select: {
            id: true,
            userId: true,
            workId: true,
            priority: true,
            addedAt: true,

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
          orderBy: [
            { priority: 'desc' }, // Alta prioridade primeiro
            { addedAt: 'desc' }, // Mais recentes primeiro
          ],
        }),

        // Itens que o usuário já aprendeu
        prisma.learned.findMany({
          where: { userId },
          select: {
            id: true,
            userId: true,
            workId: true,
            learnedAt: true,
            mastery: true,
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
          orderBy: [
            { mastery: 'desc' }, // Alta maestria primeiro
            { learnedAt: 'desc' }, // Mais recentes primeiro
          ],
        }),
      ]);

      return {
        wantToLearn: wantToLearnItems.map((item) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
        })) as WantToLearnItem[],
        learned: learnedItems.map((item) => ({
          ...item,
          learnedAt: item.learnedAt.toISOString(),
        })) as LearnedItem[],
        totalWantToLearn: wantToLearnItems.length,
        totalLearned: learnedItems.length,
      };
    } catch (error) {
      console.error('Erro ao buscar dados de aprendizado do usuário:', error);
      return {
        wantToLearn: [],
        learned: [],
        totalWantToLearn: 0,
        totalLearned: 0,
      };
    }
  },
  ['user-learning'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user-learning'],
  }
);

// Buscar dados de aprendizado do usuário logado (SSR)
export const getCurrentUserLearningData = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        wantToLearn: [],
        learned: [],
        totalWantToLearn: 0,
        totalLearned: 0,
      };
    }

    return await getUserLearningData(session.user.id);
  } catch (error) {
    console.error(
      'Erro ao buscar dados de aprendizado do usuário atual:',
      error
    );
    return {
      wantToLearn: [],
      learned: [],
      totalWantToLearn: 0,
      totalLearned: 0,
    };
  }
};

// Obras mais desejadas para estudo - ESTATÍSTICAS
export const getMostWantedToLearnWorks = unstable_cache(
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
              wantToLearners: true,
            },
          },
        },
        orderBy: {
          wantToLearners: {
            _count: 'desc',
          },
        },
        take: limit,
        where: {
          wantToLearners: {
            some: {},
          },
        },
      });

      return works.map((work) => ({
        ...work,
        wantToLearnCount: work._count.wantToLearners,
      }));
    } catch (error) {
      console.error('Erro ao buscar obras mais desejadas para estudo:', error);
      return [];
    }
  },
  ['most-wanted-to-learn-works'],
  {
    revalidate: 3600, // 1 hora
    tags: ['learning-stats', 'works'],
  }
);

// Obras mais aprendidas - ESTATÍSTICAS
export const getMostLearnedWorks = unstable_cache(
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
              learners: true,
            },
          },
        },
        orderBy: {
          learners: {
            _count: 'desc',
          },
        },
        take: limit,
        where: {
          learners: {
            some: {},
          },
        },
      });

      return works.map((work) => ({
        ...work,
        learnedCount: work._count.learners,
      }));
    } catch (error) {
      console.error('Erro ao buscar obras mais aprendidas:', error);
      return [];
    }
  },
  ['most-learned-works'],
  {
    revalidate: 3600, // 1 hora
    tags: ['learning-stats', 'works'],
  }
);

// Verificar status de aprendizado (para SSR)
export const checkLearningStatus = async (
  userId: string,
  workIds: string[]
) => {
  try {
    const [wantToLearnItems, learnedItems] = await Promise.all([
      prisma.wantToLearn.findMany({
        where: {
          userId,
          workId: { in: workIds },
        },
        select: { workId: true, priority: true },
      }),

      prisma.learned.findMany({
        where: {
          userId,
          workId: { in: workIds },
        },
        select: { workId: true, mastery: true },
      }),
    ]);

    const wantToLearnMap = new Map(
      wantToLearnItems.map((item) => [item.workId, item.priority])
    );
    const learnedMap = new Map(
      learnedItems.map((item) => [item.workId, item.mastery])
    );

    return workIds.reduce((acc, workId) => {
      acc[workId] = {
        wantToLearn: wantToLearnMap.has(workId),
        learned: learnedMap.has(workId),
        priority: wantToLearnMap.get(workId) || null,
        mastery: learnedMap.get(workId) || null,
      };
      return acc;
    }, {} as Record<string, { wantToLearn: boolean; learned: boolean; priority: number | null; mastery: number | null }>);
  } catch (error) {
    console.error('Erro ao verificar status de aprendizado:', error);
    return {};
  }
};

// Estatísticas gerais de aprendizado
export const getLearningStats = unstable_cache(
  async () => {
    try {
      const [
        wantToLearnCount,
        learnedCount,
        usersWithLearningData,
        avgPriority,
        avgMastery,
      ] = await Promise.all([
        prisma.wantToLearn.count(),
        prisma.learned.count(),
        prisma.user.count({
          where: {
            OR: [{ wantToLearn: { some: {} } }, { learned: { some: {} } }],
          },
        }),
        prisma.wantToLearn.aggregate({
          _avg: { priority: true },
        }),
        prisma.learned.aggregate({
          _avg: { mastery: true },
        }),
      ]);

      return {
        totalWantToLearn: wantToLearnCount,
        totalLearned: learnedCount,
        totalLearningItems: wantToLearnCount + learnedCount,
        usersWithLearningData,
        averagePriority: avgPriority._avg.priority || 0,
        averageMastery: avgMastery._avg.mastery || 0,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de aprendizado:', error);
      return {
        totalWantToLearn: 0,
        totalLearned: 0,
        totalLearningItems: 0,
        usersWithLearningData: 0,
        averagePriority: 0,
        averageMastery: 0,
      };
    }
  },
  ['learning-stats'],
  {
    revalidate: 3600, // 1 hora
    tags: ['learning-stats'],
  }
);

// Buscar progressão do usuário (para dashboards)
export const getUserLearningProgress = unstable_cache(
  async (userId: string) => {
    try {
      const [wantToLearnByPriority, learnedByMastery, recentActivity] =
        await Promise.all([
          // Agrupamento por prioridade
          prisma.wantToLearn.groupBy({
            by: ['priority'],
            where: { userId },
            _count: { priority: true },
            orderBy: { priority: 'desc' },
          }),

          // Agrupamento por maestria
          prisma.learned.groupBy({
            by: ['mastery'],
            where: { userId },
            _count: { mastery: true },
            orderBy: { mastery: 'desc' },
          }),

          // Atividade recente (últimos 30 dias)
          prisma.learned.count({
            where: {
              userId,
              learnedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          }),
        ]);

      return {
        priorityDistribution: wantToLearnByPriority,
        masteryDistribution: learnedByMastery,
        recentlyLearned: recentActivity,
      };
    } catch (error) {
      console.error('Erro ao buscar progressão de aprendizado:', error);
      return {
        priorityDistribution: [],
        masteryDistribution: [],
        recentlyLearned: 0,
      };
    }
  },
  ['user-learning-progress'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['user-learning', 'learning-stats'],
  }
);

// Função para invalidar caches de aprendizado
export async function revalidateLearningCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('user-learning');
  revalidateTag('learning-stats');
  revalidateTag('most-wanted-to-learn-works');
  revalidateTag('most-learned-works');
  revalidateTag('user-learning-progress');

  if (userId) {
    revalidateTag(`user-learning-${userId}`);
    revalidateTag(`user-learning-progress-${userId}`);
  }
}
