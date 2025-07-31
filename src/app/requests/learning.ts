// app/requests/learning.ts - CORRIGIDO COM SELECTEDWORKSCORE
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
        // ✅ CORRIGIDO: Itens que o usuário quer estudar COM selectedWorkScore
        prisma.wantToLearn.findMany({
          where: { userId },
          select: {
            id: true,
            userId: true,
            workId: true,
            priority: true,
            addedAt: true,
            // ✅ NOVOS CAMPOS INCLUÍDOS
            notes: true,
            targetDate: true,
            estimatedStudyTime: true,
            difficulty: true,
            motivation: true,
            context: true,
            selectedWorkScoreId: true,

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

            // ✅ INCLUIR DADOS COMPLETOS DO WORKSCORE
            selectedWorkScore: {
              select: {
                id: true,
                sourceId: true,
                source: true,
                title: true,
                downloadUrl: true,
                thumbnailUrl: true,
                fileSize: true,
                pageCount: true,
                fileFormat: true,
                type: true,
                editor: true,
                publisher: true,
                copyright: true,
                uploadDate: true,
                uploader: true,
                notes: true,
              },
            },
          },
          orderBy: [
            { priority: 'desc' }, // Alta prioridade primeiro
            { addedAt: 'desc' }, // Mais recentes primeiro
          ],
        }),

        // ✅ CORRIGIDO: Itens que o usuário já aprendeu COM selectedWorkScore
        prisma.learned.findMany({
          where: { userId },
          select: {
            id: true,
            userId: true,
            workId: true,
            learnedAt: true,
            mastery: true,
            // ✅ NOVOS CAMPOS INCLUÍDOS
            studyStartDate: true,
            studyDuration: true,
            notes: true,
            wouldRecommend: true,
            publicPerformance: true,
            difficulty: true,
            enjoyment: true,
            technicalChallenges: true,
            musicalInsights: true,
            selectedWorkScoreId: true,

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

            // ✅ INCLUIR DADOS COMPLETOS DO WORKSCORE
            selectedWorkScore: {
              select: {
                id: true,
                sourceId: true,
                source: true,
                title: true,
                downloadUrl: true,
                thumbnailUrl: true,
                fileSize: true,
                pageCount: true,
                fileFormat: true,
                type: true,
                editor: true,
                publisher: true,
                copyright: true,
                uploadDate: true,
                uploader: true,
                notes: true,
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
          targetDate: item.targetDate?.toISOString(),
        })) as WantToLearnItem[],
        learned: learnedItems.map((item) => ({
          ...item,
          learnedAt: item.learnedAt.toISOString(),
          studyStartDate: item.studyStartDate?.toISOString(),
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
