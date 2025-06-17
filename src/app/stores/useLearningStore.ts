// stores/useLearningStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WantToLearnItem {
  id: string;
  userId: string;
  workId: string;
  priority: number; // 1-5 priority level
  addedAt: string;
  // Campos opcionais para enriquecer a experiência
  notes?: string;
  targetDate?: string;
  estimatedStudyTime?: number; // em horas
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  motivation?: string;
  context?: string;
  work?: {
    id: string;
    title: string;
    opOrCatalog?: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
}

export interface LearnedItem {
  id: string;
  userId: string;
  workId: string;
  learnedAt: string;
  mastery: number; // 1-5 mastery level
  // Campos opcionais para enriquecer a experiência
  studyStartDate?: string;
  studyDuration?: number; // em dias
  notes?: string;
  wouldRecommend?: boolean;
  publicPerformance?: boolean;
  lastPracticed?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  enjoyment?: number;
  technicalChallenges?: string;
  musicalInsights?: string;
  work?: {
    id: string;
    title: string;
    opOrCatalog?: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
}

interface LearningStore {
  // Estados
  wantToLearn: WantToLearnItem[];
  learned: LearnedItem[];
  loading: {
    wantToLearn: Set<string>;
    learned: Set<string>;
  };
  initialized: boolean;

  // Actions para "quero estudar"
  toggleWantToLearn: (
    workId: string,
    userId: string,
    priority?: number,
    additionalData?: any
  ) => Promise<boolean>;
  removeWantToLearn: (workId: string) => Promise<boolean>;
  isWantToLearn: (workId: string) => boolean;
  addWantToLearn: (item: WantToLearnItem) => void;
  removeWantToLearnLocal: (workId: string) => void;
  updateWantToLearnPriority: (
    workId: string,
    priority: number
  ) => Promise<boolean>;
  setWantToLearnLoading: (workId: string, loading: boolean) => void;

  // Actions para "já aprendi"
  toggleLearned: (
    workId: string,
    userId: string,
    mastery?: number,
    additionalData?: any
  ) => Promise<boolean>;
  removeLearned: (workId: string) => Promise<boolean>;
  isLearned: (workId: string) => boolean;
  addLearned: (item: LearnedItem) => void;
  removeLearnedLocal: (workId: string) => void;
  updateLearnedMastery: (workId: string, mastery: number) => Promise<boolean>;
  setLearnedLoading: (workId: string, loading: boolean) => void;

  // Actions gerais
  initializeLearning: (
    wantToLearn: WantToLearnItem[],
    learned: LearnedItem[]
  ) => void;
  reset: () => void;

  // Getters
  getWantToLearnCount: () => number;
  getLearnedCount: () => number;
  getWantToLearnByPriority: (priority: number) => WantToLearnItem[];
  getLearnedByMastery: (mastery: number) => LearnedItem[];

  // Getters avançados para os novos campos
  getWantToLearnByDifficulty: (
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  ) => WantToLearnItem[];
  getLearnedByDifficulty: (
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  ) => LearnedItem[];
  getLearnedByEnjoyment: (enjoyment: number) => LearnedItem[];
  getPublicPerformances: () => LearnedItem[];
  getRecommendedWorks: () => LearnedItem[];
  getAverageStudyTime: () => number;
  getAverageEnjoyment: () => number;

  // Função para obter item específico
  getWantToLearnItem: (workId: string) => WantToLearnItem | undefined;
  getLearnedItem: (workId: string) => LearnedItem | undefined;
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      // Estados iniciais
      wantToLearn: [],
      learned: [],
      loading: {
        wantToLearn: new Set(),
        learned: new Set(),
      },
      initialized: false,

      // Actions para "quero estudar"
      toggleWantToLearn: async (
        workId: string,
        userId: string,
        priority = 3,
        additionalData = {}
      ) => {
        const {
          isWantToLearn,
          setWantToLearnLoading,
          addWantToLearn,
          removeWantToLearnLocal,
          removeLearnedLocal,
        } = get();

        if (get().loading.wantToLearn.has(workId)) {
          return isWantToLearn(workId);
        }

        setWantToLearnLoading(workId, true);

        try {
          const isCurrentlyWanted = isWantToLearn(workId);

          // Otimistic update
          if (isCurrentlyWanted) {
            removeWantToLearnLocal(workId);
          } else {
            // Remover da lista de aprendidas (exclusão mútua)
            removeLearnedLocal(workId);

            addWantToLearn({
              id: `temp-${Date.now()}`,
              userId,
              workId,
              priority,
              addedAt: new Date().toISOString(),
              ...additionalData,
            });
          }

          const response = await fetch('/api/learning/want-to-learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              action: isCurrentlyWanted ? 'remove' : 'add',
              priority,
              ...additionalData,
            }),
          });

          if (!response.ok) {
            // Reverter otimistic update em caso de erro
            if (isCurrentlyWanted) {
              addWantToLearn({
                id: `temp-${Date.now()}`,
                userId,
                workId,
                priority,
                addedAt: new Date().toISOString(),
                ...additionalData,
              });
            } else {
              removeWantToLearnLocal(workId);
            }
            throw new Error('Erro ao atualizar lista de estudos');
          }

          const result = await response.json();

          // Atualizar com dados corretos do servidor
          if (result.success) {
            if (result.action === 'added' && result.item) {
              removeWantToLearnLocal(workId); // Remove temporário
              addWantToLearn(result.item);
            }
          }

          return !isCurrentlyWanted;
        } catch (error) {
          console.error('Erro ao atualizar quero estudar:', error);
          return isWantToLearn(workId);
        } finally {
          setWantToLearnLoading(workId, false);
        }
      },

      removeWantToLearn: async (workId: string) => {
        const { setWantToLearnLoading, removeWantToLearnLocal } = get();

        setWantToLearnLoading(workId, true);

        try {
          const response = await fetch('/api/learning/want-to-learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              action: 'remove',
            }),
          });

          if (response.ok) {
            removeWantToLearnLocal(workId);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Erro ao remover da lista de estudos:', error);
          return false;
        } finally {
          setWantToLearnLoading(workId, false);
        }
      },

      isWantToLearn: (workId: string) => {
        return get().wantToLearn.some((item) => item.workId === workId);
      },

      addWantToLearn: (item: WantToLearnItem) => {
        set((state) => ({
          wantToLearn: [
            ...state.wantToLearn.filter((i) => i.workId !== item.workId),
            item,
          ],
        }));
      },

      removeWantToLearnLocal: (workId: string) => {
        set((state) => ({
          wantToLearn: state.wantToLearn.filter((i) => i.workId !== workId),
        }));
      },

      updateWantToLearnPriority: async (workId: string, priority: number) => {
        try {
          const response = await fetch('/api/learning/want-to-learn', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workId, priority }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.item) {
              set((state) => ({
                wantToLearn: state.wantToLearn.map((item) =>
                  item.workId === workId ? { ...item, priority } : item
                ),
              }));
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Erro ao atualizar prioridade:', error);
          return false;
        }
      },

      setWantToLearnLoading: (workId: string, loading: boolean) => {
        set((state) => {
          const newLoading = new Set(state.loading.wantToLearn);
          if (loading) {
            newLoading.add(workId);
          } else {
            newLoading.delete(workId);
          }
          return {
            loading: {
              ...state.loading,
              wantToLearn: newLoading,
            },
          };
        });
      },

      // Actions para "já aprendi"
      toggleLearned: async (
        workId: string,
        userId: string,
        mastery = 3,
        additionalData = {}
      ) => {
        const {
          isLearned,
          setLearnedLoading,
          addLearned,
          removeLearnedLocal,
          removeWantToLearnLocal,
        } = get();

        if (get().loading.learned.has(workId)) {
          return isLearned(workId);
        }

        setLearnedLoading(workId, true);

        try {
          const isCurrentlyLearned = isLearned(workId);

          // Otimistic update
          if (isCurrentlyLearned) {
            removeLearnedLocal(workId);
          } else {
            // Remover da lista de desejos (exclusão mútua)
            removeWantToLearnLocal(workId);

            addLearned({
              id: `temp-${Date.now()}`,
              userId,
              workId,
              mastery,
              learnedAt: new Date().toISOString(),
              ...additionalData,
            });
          }

          const response = await fetch('/api/learning/learned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              action: isCurrentlyLearned ? 'remove' : 'add',
              mastery,
              ...additionalData,
            }),
          });

          if (!response.ok) {
            // Reverter otimistic update em caso de erro
            if (isCurrentlyLearned) {
              addLearned({
                id: `temp-${Date.now()}`,
                userId,
                workId,
                mastery,
                learnedAt: new Date().toISOString(),
                ...additionalData,
              });
            } else {
              removeLearnedLocal(workId);
            }
            throw new Error('Erro ao atualizar obras aprendidas');
          }

          const result = await response.json();

          // Atualizar com dados corretos do servidor
          if (result.success) {
            if (result.action === 'added' && result.item) {
              removeLearnedLocal(workId); // Remove temporário
              addLearned(result.item);
            }
          }

          return !isCurrentlyLearned;
        } catch (error) {
          console.error('Erro ao atualizar já aprendi:', error);
          return isLearned(workId);
        } finally {
          setLearnedLoading(workId, false);
        }
      },

      removeLearned: async (workId: string) => {
        const { setLearnedLoading, removeLearnedLocal } = get();

        setLearnedLoading(workId, true);

        try {
          const response = await fetch('/api/learning/learned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              action: 'remove',
            }),
          });

          if (response.ok) {
            removeLearnedLocal(workId);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Erro ao remover da lista de aprendidas:', error);
          return false;
        } finally {
          setLearnedLoading(workId, false);
        }
      },

      isLearned: (workId: string) => {
        return get().learned.some((item) => item.workId === workId);
      },

      addLearned: (item: LearnedItem) => {
        set((state) => ({
          learned: [
            ...state.learned.filter((i) => i.workId !== item.workId),
            item,
          ],
        }));
      },

      removeLearnedLocal: (workId: string) => {
        set((state) => ({
          learned: state.learned.filter((i) => i.workId !== workId),
        }));
      },

      updateLearnedMastery: async (workId: string, mastery: number) => {
        try {
          const response = await fetch('/api/learning/learned', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workId, mastery }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.item) {
              set((state) => ({
                learned: state.learned.map((item) =>
                  item.workId === workId ? { ...item, mastery } : item
                ),
              }));
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Erro ao atualizar maestria:', error);
          return false;
        }
      },

      setLearnedLoading: (workId: string, loading: boolean) => {
        set((state) => {
          const newLoading = new Set(state.loading.learned);
          if (loading) {
            newLoading.add(workId);
          } else {
            newLoading.delete(workId);
          }
          return {
            loading: {
              ...state.loading,
              learned: newLoading,
            },
          };
        });
      },

      // Actions gerais
      initializeLearning: (
        wantToLearn: WantToLearnItem[],
        learned: LearnedItem[]
      ) => {
        set({
          wantToLearn,
          learned,
          initialized: true,
        });
      },

      reset: () => {
        set({
          wantToLearn: [],
          learned: [],
          loading: {
            wantToLearn: new Set(),
            learned: new Set(),
          },
          initialized: false,
        });
      },

      // Getters
      getWantToLearnCount: () => get().wantToLearn.length,
      getLearnedCount: () => get().learned.length,
      getWantToLearnByPriority: (priority: number) =>
        get().wantToLearn.filter((item) => item.priority === priority),
      getLearnedByMastery: (mastery: number) =>
        get().learned.filter((item) => item.mastery === mastery),

      // Getters avançados para os novos campos
      getWantToLearnByDifficulty: (
        difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
      ) => get().wantToLearn.filter((item) => item.difficulty === difficulty),
      getLearnedByDifficulty: (
        difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
      ) => get().learned.filter((item) => item.difficulty === difficulty),
      getLearnedByEnjoyment: (enjoyment: number) =>
        get().learned.filter((item) => item.enjoyment === enjoyment),
      getPublicPerformances: () =>
        get().learned.filter((item) => item.publicPerformance === true),
      getRecommendedWorks: () =>
        get().learned.filter((item) => item.wouldRecommend === true),
      getAverageStudyTime: () => {
        const durations = get()
          .learned.filter((item) => item.studyDuration)
          .map((item) => item.studyDuration!);
        return durations.length > 0
          ? durations.reduce((sum, duration) => sum + duration, 0) /
              durations.length
          : 0;
      },
      getAverageEnjoyment: () => {
        const enjoyments = get()
          .learned.filter((item) => item.enjoyment)
          .map((item) => item.enjoyment!);
        return enjoyments.length > 0
          ? enjoyments.reduce((sum, enjoyment) => sum + enjoyment, 0) /
              enjoyments.length
          : 0;
      },

      // Função para obter item específico
      getWantToLearnItem: (workId: string) => {
        return get().wantToLearn.find((item) => item.workId === workId);
      },
      getLearnedItem: (workId: string) => {
        return get().learned.find((item) => item.workId === workId);
      },
    }),
    {
      name: 'learning-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wantToLearn: state.wantToLearn,
        learned: state.learned,
        initialized: state.initialized,
        // Não persistir loading states
      }),
      onRehydrateStorage: () => (state) => {
        // Garantir que loading states sejam sempre Sets vazios ao recarregar
        if (state) {
          state.loading = {
            wantToLearn: new Set(),
            learned: new Set(),
          };
        }
      },
    }
  )
);
