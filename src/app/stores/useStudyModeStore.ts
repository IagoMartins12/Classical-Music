// stores/useStudyModeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper';

export interface StudySession {
  id?: string;
  workId: string;
  workTitle: string;
  composerName: string;
  selectedScore?: IMSLPScore;
  startTime: string;
  duration: number; // em segundos
  isActive: boolean;
  isPaused: boolean;

  // Configurações do metrônomo
  metronome: {
    bpm: number;
    timeSignature: string;
    isActive: boolean;
    sound: 'click' | 'beep' | 'wood';
    volume: number;
  };

  // Anotações e objetivos
  studyNotes: string;
  practiceGoals: string[];

  // Foco da sessão
  focus:
    | 'TECHNICAL'
    | 'EXPRESSIVITY'
    | 'PRECISION'
    | 'SIGHT_READING'
    | 'MEMORIZATION'
    | 'PERFORMANCE'
    | 'REVIEW';

  // Seções trabalhadas
  sectionsWorked: string[];

  // Métricas
  pauseCount: number;
  restartCount: number;

  // Avaliação pós-prática
  postPractice?: {
    rating: number;
    notes: string;
    nextSessionGoals: string[];
    technicalFocus: string[];
    expressiveFocus: string[];
    precisionFocus: string[];
  };
}

interface StudyModeStore {
  // Estado atual
  currentSession: StudySession | null;
  isStudyModeOpen: boolean;

  // Timer
  timerInterval: NodeJS.Timeout | null;

  // Actions
  startStudySession: (
    workId: string,
    workTitle: string,
    composerName: string,
    selectedScore?: IMSLPScore
  ) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<boolean>;
  updateSession: (updates: Partial<StudySession>) => void;

  // Timer controls
  updateTimer: () => void;
  resetTimer: () => void;

  // Metronome
  updateMetronome: (settings: Partial<StudySession['metronome']>) => void;
  toggleMetronome: () => void;

  // Notes and goals
  updateStudyNotes: (notes: string) => void;
  addPracticeGoal: (goal: string) => void;
  removePracticeGoal: (index: number) => void;
  addSectionWorked: (section: string) => void;

  // Post-practice evaluation
  savePostPracticeEvaluation: (
    evaluation: StudySession['postPractice']
  ) => Promise<boolean>;

  // Modal controls
  openStudyMode: () => void;
  closeStudyMode: () => void;

  // Cleanup
  cleanup: () => void;
}

export const useStudyModeStore = create<StudyModeStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentSession: null,
      isStudyModeOpen: false,
      timerInterval: null,

      // Iniciar sessão de estudo
      startStudySession: (
        workId: string,
        workTitle: string,
        composerName: string,
        selectedScore?: IMSLPScore
      ) => {
        const { cleanup } = get();

        // Limpar sessão anterior se existir
        cleanup();

        const newSession: StudySession = {
          workId,
          workTitle,
          composerName,
          selectedScore,
          startTime: new Date().toISOString(),
          duration: 0,
          isActive: true,
          isPaused: false,
          metronome: {
            bpm: 120,
            timeSignature: '4/4',
            isActive: false,
            sound: 'click',
            volume: 0.5,
          },
          studyNotes: '',
          practiceGoals: [],
          focus: 'TECHNICAL',
          sectionsWorked: [],
          pauseCount: 0,
          restartCount: 0,
        };

        set({
          currentSession: newSession,
          isStudyModeOpen: true,
        });

        // Iniciar timer
        const interval = setInterval(() => {
          get().updateTimer();
        }, 1000);

        set({ timerInterval: interval });
      },

      // Pausar sessão
      pauseSession: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              isPaused: true,
              pauseCount: state.currentSession.pauseCount + 1,
            },
          };
        });
      },

      // Retomar sessão
      resumeSession: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              isPaused: false,
            },
          };
        });
      },

      // Finalizar sessão
      endSession: async () => {
        const { currentSession, cleanup } = get();

        if (!currentSession) return false;

        try {
          // Salvar sessão no banco
          const response = await fetch('/api/study-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId: currentSession.workId,
              durationMin: Math.floor(currentSession.duration / 60),
              metronomeUsed: currentSession.metronome.isActive,
              tempoMarking: `${currentSession.metronome.bpm} BPM`,
              focus: currentSession.focus,
              notes: currentSession.studyNotes,
              sectionsWorked: currentSession.sectionsWorked,
              practiceGoals: currentSession.practiceGoals,
              pauseCount: currentSession.pauseCount,
              restartCount: currentSession.restartCount,
              metronomeSettings: currentSession.metronome,
              selectedScore: currentSession.selectedScore,
              studyNotes: currentSession.studyNotes,
              postPracticeRating: currentSession.postPractice?.rating,
              postPracticeNotes: currentSession.postPractice?.notes,
              nextSessionGoals:
                currentSession.postPractice?.nextSessionGoals || [],
              technicalFocus: currentSession.postPractice?.technicalFocus || [],
              expressiveFocus:
                currentSession.postPractice?.expressiveFocus || [],
              precisionFocus: currentSession.postPractice?.precisionFocus || [],
            }),
          });

          if (response.ok) {
            cleanup();
            return true;
          }

          return false;
        } catch (error) {
          console.error('Erro ao salvar sessão de estudo:', error);
          return false;
        }
      },

      // Atualizar sessão
      updateSession: (updates: Partial<StudySession>) => {
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, ...updates }
            : null,
        }));
      },

      // Atualizar timer
      updateTimer: () => {
        set((state) => {
          if (!state.currentSession || state.currentSession.isPaused) {
            return state;
          }

          return {
            currentSession: {
              ...state.currentSession,
              duration: state.currentSession.duration + 1,
            },
          };
        });
      },

      // Resetar timer
      resetTimer: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              duration: 0,
              restartCount: state.currentSession.restartCount + 1,
            },
          };
        });
      },

      // Atualizar metrônomo
      updateMetronome: (settings: Partial<StudySession['metronome']>) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              metronome: {
                ...state.currentSession.metronome,
                ...settings,
              },
            },
          };
        });
      },

      // Toggle metrônomo
      toggleMetronome: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              metronome: {
                ...state.currentSession.metronome,
                isActive: !state.currentSession.metronome.isActive,
              },
            },
          };
        });
      },

      // Atualizar anotações
      updateStudyNotes: (notes: string) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              studyNotes: notes,
            },
          };
        });
      },

      // Adicionar objetivo
      addPracticeGoal: (goal: string) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              practiceGoals: [...state.currentSession.practiceGoals, goal],
            },
          };
        });
      },

      // Remover objetivo
      removePracticeGoal: (index: number) => {
        set((state) => {
          if (!state.currentSession) return state;

          const newGoals = [...state.currentSession.practiceGoals];
          newGoals.splice(index, 1);

          return {
            currentSession: {
              ...state.currentSession,
              practiceGoals: newGoals,
            },
          };
        });
      },

      // Adicionar seção trabalhada
      addSectionWorked: (section: string) => {
        set((state) => {
          if (!state.currentSession) return state;

          if (!state.currentSession.sectionsWorked.includes(section)) {
            return {
              currentSession: {
                ...state.currentSession,
                sectionsWorked: [
                  ...state.currentSession.sectionsWorked,
                  section,
                ],
              },
            };
          }

          return state;
        });
      },

      // Salvar avaliação pós-prática
      savePostPracticeEvaluation: async (
        evaluation: StudySession['postPractice']
      ) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              postPractice: evaluation,
            },
          };
        });

        return true;
      },

      // Controles do modal
      openStudyMode: () => {
        set({ isStudyModeOpen: true });
      },

      closeStudyMode: () => {
        set({ isStudyModeOpen: false });
      },

      // Limpeza
      cleanup: () => {
        const { timerInterval } = get();

        if (timerInterval) {
          clearInterval(timerInterval);
        }

        set({
          currentSession: null,
          isStudyModeOpen: false,
          timerInterval: null,
        });
      },
    }),
    {
      name: 'study-mode-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Apenas persistir dados da sessão, não intervalos
        currentSession: state.currentSession,
      }),
      onRehydrateStorage: () => (state) => {
        // Garantir que intervals sejam limpos ao recarregar
        if (state?.timerInterval) {
          clearInterval(state.timerInterval);
          state.timerInterval = null;
        }
      },
    }
  )
);
