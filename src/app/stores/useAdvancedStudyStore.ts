// stores/useAdvancedStudyStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper';

export interface ScoreAnnotation {
  id: string;
  type:
    | 'text'
    | 'highlight'
    | 'arrow'
    | 'circle'
    | 'fingering'
    | 'bowing'
    | 'breathing'
    | 'pedal'
    | 'articulation';
  x: number;
  y: number;
  content: string;
  color: string;
  instrument?: string;
  layer: 'general' | 'technical' | 'expression' | 'performance';
  timestamp: number;
  page?: number;
}

export interface PracticeSection {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  quality: number; // 1-5 stars
  notes?: string;
  bpm?: number;
  focusAreas: string[];
  mistakes: number;
  improvements: string[];
}

export interface StudyRecording {
  id: string;
  timestamp: number;
  duration: number;
  section?: string;
  notes?: string;
  audioBlob?: Blob;
  audioUrl?: string;
  quality: 'low' | 'medium' | 'high';
  waveformData?: number[];
}

export interface StudyGoal {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: number;
  priority: 'low' | 'medium' | 'high';
  category: 'technical' | 'musical' | 'memory' | 'performance';
}

export interface MetronomeSettings {
  bpm: number;
  timeSignature: string;
  isActive: boolean;
  sound: 'click' | 'beep' | 'wood' | 'digital';
  volume: number;
  accentBeats: boolean;
  subdivision: '1' | '2' | '3' | '4';
  visualMetronome: boolean;
}

export interface StudyAnalytics {
  sessionsToday: number;
  minutesToday: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  averageSessionDuration: number;
  mostPracticedSections: string[];
  improvementAreas: string[];
  strengthAreas: string[];
  practiceConsistency: number;
}

export interface AdvancedStudySession {
  id?: string;
  workId: string;
  workTitle: string;
  composerName: string;
  instrument: string;
  selectedScore?: IMSLPScore;

  // Timing
  startTime: string;
  endTime?: string;
  duration: number; // em segundos
  isActive: boolean;
  isPaused: boolean;
  focusTime: number; // tempo efetivo sem pausas

  // Settings
  metronome: MetronomeSettings;

  // Content
  studyNotes: string;
  goals: StudyGoal[];
  sections: PracticeSection[];
  recordings: StudyRecording[];
  annotations: ScoreAnnotation[];

  // Practice Focus
  sessionFocus:
    | 'technical'
    | 'expressivity'
    | 'precision'
    | 'sight_reading'
    | 'memorization'
    | 'performance'
    | 'review';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';

  // Metrics
  pauseCount: number;
  restartCount: number;
  sectionsRepeated: number;
  mistakeCount: number;
  tempoChanges: number;

  // Post-practice evaluation
  postPractice?: {
    rating: number;
    technicalRating: number;
    musicalRating: number;
    memoryRating: number;
    confidenceRating: number;
    notes: string;
    difficultSections: string[];
    breakthroughs: string[];
    nextSessionGoals: string[];
    recommendedExercises: string[];
    moodBefore: number; // 1-5
    moodAfter: number; // 1-5
    physicalCondition: number; // 1-5
    focusLevel: number; // 1-5
  };

  // AI Insights (futuro)
  aiInsights?: {
    suggestedTempo: number;
    technicalRecommendations: string[];
    progressPrediction: string;
    weaknessDetected: string[];
    strengthsIdentified: string[];
  };
}

interface AdvancedStudyStore {
  // Estado atual
  currentSession: AdvancedStudySession | null;
  isStudyModeOpen: boolean;
  activeTab: string;

  // Settings
  userPreferences: {
    defaultMetronome: MetronomeSettings;
    autoSave: boolean;
    recordingQuality: 'low' | 'medium' | 'high';
    visualFeedback: boolean;
    soundFeedback: boolean;
    practiceReminders: boolean;
    analyticsSharing: boolean;
  };

  // Analytics
  analytics: StudyAnalytics;

  // Session Management
  startAdvancedSession: (
    workId: string,
    workTitle: string,
    composerName: string,
    instrument: string,
    selectedScore?: IMSLPScore
  ) => void;

  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<boolean>;
  saveSession: () => Promise<boolean>;

  // Timer controls
  updateTimer: () => void;
  resetTimer: () => void;
  addFocusTime: () => void;

  // Goals Management
  addGoal: (goal: Omit<StudyGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<StudyGoal>) => void;
  removeGoal: (id: string) => void;
  completeGoal: (id: string) => void;

  // Sections Management
  startSection: (
    name: string,
    difficulty: PracticeSection['difficulty']
  ) => void;
  endSection: (quality: number, notes?: string) => void;
  updateSection: (id: string, updates: Partial<PracticeSection>) => void;

  // Recordings Management
  startRecording: (section?: string) => Promise<void>;
  stopRecording: () => Promise<StudyRecording | null>;
  deleteRecording: (id: string) => void;

  // Annotations Management
  addAnnotation: (
    annotation: Omit<ScoreAnnotation, 'id' | 'timestamp'>
  ) => void;
  updateAnnotation: (id: string, updates: Partial<ScoreAnnotation>) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotationsByLayer: (layer: ScoreAnnotation['layer']) => void;

  // Metronome
  updateMetronome: (settings: Partial<MetronomeSettings>) => void;
  toggleMetronome: () => void;

  // Notes
  updateStudyNotes: (notes: string) => void;

  // Post-practice
  savePostPracticeEvaluation: (
    evaluation: AdvancedStudySession['postPractice']
  ) => Promise<boolean>;

  // UI Controls
  setActiveTab: (tab: string) => void;
  openStudyMode: () => void;
  closeStudyMode: () => void;

  // Analytics
  updateAnalytics: () => void;
  getWeeklyProgress: () => number;
  getTodayProgress: () => number;
  getStreak: () => number;

  // Data Export/Import
  exportSession: () => string;
  importSession: (data: string) => boolean;

  // Cleanup
  cleanup: () => void;
}

export const useAdvancedStudyStore = create<AdvancedStudyStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentSession: null,
      isStudyModeOpen: false,
      activeTab: 'dashboard',

      userPreferences: {
        defaultMetronome: {
          bpm: 120,
          timeSignature: '4/4',
          isActive: false,
          sound: 'click',
          volume: 0.6,
          accentBeats: true,
          subdivision: '1',
          visualMetronome: true,
        },
        autoSave: true,
        recordingQuality: 'medium',
        visualFeedback: true,
        soundFeedback: true,
        practiceReminders: true,
        analyticsSharing: false,
      },

      analytics: {
        sessionsToday: 0,
        minutesToday: 0,
        streak: 0,
        weeklyGoal: 300, // 5 horas por semana
        weeklyProgress: 0,
        averageSessionDuration: 0,
        mostPracticedSections: [],
        improvementAreas: [],
        strengthAreas: [],
        practiceConsistency: 0,
      },

      // Iniciar sessão avançada
      startAdvancedSession: (
        workId,
        workTitle,
        composerName,
        instrument,
        selectedScore
      ) => {
        const { cleanup } = get();
        cleanup();

        const newSession: AdvancedStudySession = {
          workId,
          workTitle,
          composerName,
          instrument,
          selectedScore,
          startTime: new Date().toISOString(),
          duration: 0,
          isActive: true,
          isPaused: false,
          focusTime: 0,
          metronome: { ...get().userPreferences.defaultMetronome },
          studyNotes: '',
          goals: [],
          sections: [],
          recordings: [],
          annotations: [],
          sessionFocus: 'technical',
          difficultyLevel: 'intermediate',
          pauseCount: 0,
          restartCount: 0,
          sectionsRepeated: 0,
          mistakeCount: 0,
          tempoChanges: 0,
        };

        set({ currentSession: newSession, isStudyModeOpen: true });
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
        const { currentSession, saveSession, cleanup, updateAnalytics } = get();

        if (!currentSession) return false;

        // Adicionar timestamp de fim
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                endTime: new Date().toISOString(),
              }
            : null,
        }));

        const success = await saveSession();

        if (success) {
          updateAnalytics();
          cleanup();
        }

        return success;
      },

      // Salvar sessão
      saveSession: async () => {
        const { currentSession } = get();

        if (!currentSession) return false;

        try {
          const response = await fetch('/api/study-sessions/advanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...currentSession,
              durationMin: Math.floor(currentSession.duration / 60),
              focusTimeMin: Math.floor(currentSession.focusTime / 60),
            }),
          });

          return response.ok;
        } catch (error) {
          console.error('Erro ao salvar sessão:', error);
          return false;
        }
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

      // Adicionar tempo de foco
      addFocusTime: () => {
        set((state) => {
          if (!state.currentSession || state.currentSession.isPaused) {
            return state;
          }

          return {
            currentSession: {
              ...state.currentSession,
              focusTime: state.currentSession.focusTime + 1,
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
              focusTime: 0,
              restartCount: state.currentSession.restartCount + 1,
            },
          };
        });
      },

      // Goals Management
      addGoal: (goalData) => {
        const goal: StudyGoal = {
          ...goalData,
          id: Date.now().toString(),
        };

        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              goals: [...state.currentSession.goals, goal],
            },
          };
        });
      },

      updateGoal: (id, updates) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              goals: state.currentSession.goals.map((goal) =>
                goal.id === id ? { ...goal, ...updates } : goal
              ),
            },
          };
        });
      },

      removeGoal: (id) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              goals: state.currentSession.goals.filter(
                (goal) => goal.id !== id
              ),
            },
          };
        });
      },

      completeGoal: (id) => {
        get().updateGoal(id, { completed: true, completedAt: Date.now() });
      },

      // Sections Management
      startSection: (name, difficulty) => {
        const section: PracticeSection = {
          id: Date.now().toString(),
          name,
          startTime: Date.now(),
          duration: 0,
          difficulty,
          quality: 0,
          focusAreas: [],
          mistakes: 0,
          improvements: [],
        };

        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              sections: [...state.currentSession.sections, section],
            },
          };
        });
      },

      endSection: (quality, notes) => {
        set((state) => {
          if (!state.currentSession) return state;

          const sections = [...state.currentSession.sections];
          const lastSection = sections[sections.length - 1];

          if (lastSection && !lastSection.endTime) {
            lastSection.endTime = Date.now();
            lastSection.duration = lastSection.endTime - lastSection.startTime;
            lastSection.quality = quality;
            lastSection.notes = notes;
          }

          return {
            currentSession: {
              ...state.currentSession,
              sections,
              sectionsRepeated: state.currentSession.sectionsRepeated + 1,
            },
          };
        });
      },

      updateSection: (id, updates) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              sections: state.currentSession.sections.map((section) =>
                section.id === id ? { ...section, ...updates } : section
              ),
            },
          };
        });
      },

      // Recordings Management
      startRecording: async (section) => {
        // Implementar gravação de áudio
        console.log('Iniciando gravação para seção:', section);
      },

      stopRecording: async () => {
        // Implementar parada de gravação
        console.log('Parando gravação');
        return null;
      },

      deleteRecording: (id) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              recordings: state.currentSession.recordings.filter(
                (rec) => rec.id !== id
              ),
            },
          };
        });
      },

      // Annotations Management
      addAnnotation: (annotationData) => {
        const annotation: ScoreAnnotation = {
          ...annotationData,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };

        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              annotations: [...state.currentSession.annotations, annotation],
            },
          };
        });
      },

      updateAnnotation: (id, updates) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              annotations: state.currentSession.annotations.map((annotation) =>
                annotation.id === id
                  ? { ...annotation, ...updates }
                  : annotation
              ),
            },
          };
        });
      },

      removeAnnotation: (id) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              annotations: state.currentSession.annotations.filter(
                (annotation) => annotation.id !== id
              ),
            },
          };
        });
      },

      clearAnnotationsByLayer: (layer) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              annotations: state.currentSession.annotations.filter(
                (annotation) => annotation.layer !== layer
              ),
            },
          };
        });
      },

      // Metronome
      updateMetronome: (settings) => {
        set((state) => {
          if (!state.currentSession) return state;

          // Contar mudanças de tempo
          const tempoChanged =
            settings.bpm && settings.bpm !== state.currentSession.metronome.bpm;

          return {
            currentSession: {
              ...state.currentSession,
              metronome: { ...state.currentSession.metronome, ...settings },
              tempoChanges: tempoChanged
                ? state.currentSession.tempoChanges + 1
                : state.currentSession.tempoChanges,
            },
          };
        });
      },

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

      // Notes
      updateStudyNotes: (notes) => {
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

      // Post-practice evaluation
      savePostPracticeEvaluation: async (evaluation) => {
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

      // UI Controls
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      openStudyMode: () => {
        set({ isStudyModeOpen: true });
      },

      closeStudyMode: () => {
        set({ isStudyModeOpen: false });
      },

      // Analytics
      updateAnalytics: () => {
        const { currentSession } = get();

        if (!currentSession) return;

        const minutesToday = Math.floor(currentSession.duration / 60);

        set((state) => ({
          analytics: {
            ...state.analytics,
            sessionsToday: state.analytics.sessionsToday + 1,
            minutesToday: state.analytics.minutesToday + minutesToday,
            averageSessionDuration:
              (state.analytics.averageSessionDuration + minutesToday) / 2,
          },
        }));
      },

      getWeeklyProgress: () => {
        const { analytics } = get();
        return Math.min(
          (analytics.weeklyProgress / analytics.weeklyGoal) * 100,
          100
        );
      },

      getTodayProgress: () => {
        const { analytics } = get();
        const dailyGoal = Math.floor(analytics.weeklyGoal / 7); // Goal diário
        return Math.min((analytics.minutesToday / dailyGoal) * 100, 100);
      },

      getStreak: () => {
        const { analytics } = get();
        return analytics.streak;
      },

      // Data Export/Import
      exportSession: () => {
        const { currentSession } = get();
        return JSON.stringify(currentSession, null, 2);
      },

      importSession: (data) => {
        try {
          const session = JSON.parse(data);
          set({ currentSession: session });
          return true;
        } catch {
          return false;
        }
      },

      // Cleanup
      cleanup: () => {
        set({
          currentSession: null,
          isStudyModeOpen: false,
          activeTab: 'dashboard',
        });
      },
    }),
    {
      name: 'advanced-study-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        analytics: state.analytics,
        currentSession: state.currentSession,
      }),
    }
  )
);
