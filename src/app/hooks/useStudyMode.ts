// app/hooks/useStudyMode.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';

export interface StudySession {
  id?: string;
  workId: string;
  scoreId?: string;
  workTitle: string;
  composerName: string;
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
  sectionsWorked: string[];

  // Foco da sessão
  focus:
    | 'TECHNICAL'
    | 'EXPRESSIVITY'
    | 'PRECISION'
    | 'SIGHT_READING'
    | 'MEMORIZATION'
    | 'PERFORMANCE'
    | 'REVIEW';

  // Métricas
  pauseCount: number;
  restartCount: number;
  pagesViewed: number[];
  annotationsCreated: number;
  bookmarksCreated: number;

  // Configurações da sessão
  pdfSettings: {
    zoom: number;
    theme: 'light' | 'dark';
    layout: 'single' | 'spread';
  };
}

interface UseStudyModeOptions {
  workId: string;
  workTitle: string;
  composerName: string;
  scoreId?: string;
  selectedScore?: IMSLPScore;
  userSettings?: any;
  activeSession?: any;
}

export const useStudyMode = (options: UseStudyModeOptions) => {
  const {
    workId,
    workTitle,
    composerName,
    scoreId,
    userSettings,
    activeSession,
  } = options;

  // Estados
  const [session, setSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs para intervalos
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar sessão
  useEffect(() => {
    initializeSession();
    return cleanup;
  }, [workId, scoreId]);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (session?.isActive && !session.isPaused) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveSession();
      }, 30000);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [session?.isActive, session?.isPaused]);

  // Inicializar sessão
  const initializeSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const defaultSettings = userSettings?.studyModeSettings || {
        defaultMetronome: {
          bpm: 120,
          sound: 'click',
          volume: 0.5,
          timeSignature: '4/4',
        },
        pdfSettings: { zoom: 1.2, theme: 'light', layout: 'single' },
      };

      let newSession: StudySession;

      if (activeSession) {
        // Restaurar sessão existente
        newSession = {
          id: activeSession.id,
          workId,
          scoreId,
          workTitle,
          composerName,
          startTime: activeSession.startTime,
          duration: activeSession.duration,
          isActive: true,
          isPaused: false,
          metronome: {
            bpm:
              activeSession.metronomeSettings?.bpm ||
              defaultSettings.defaultMetronome.bpm,
            timeSignature:
              activeSession.metronomeSettings?.timeSignature ||
              defaultSettings.defaultMetronome.timeSignature,
            isActive: false,
            sound:
              activeSession.metronomeSettings?.sound ||
              defaultSettings.defaultMetronome.sound,
            volume:
              activeSession.metronomeSettings?.volume ||
              defaultSettings.defaultMetronome.volume,
          },
          studyNotes: activeSession.studyNotes || '',
          practiceGoals: activeSession.practiceGoals || [],
          sectionsWorked: activeSession.sectionsWorked || [],
          focus: 'TECHNICAL',
          pauseCount: 0,
          restartCount: 0,
          pagesViewed: activeSession.pagesViewed || [],
          annotationsCreated: 0,
          bookmarksCreated: 0,
          pdfSettings: {
            zoom: defaultSettings.pdfSettings.zoom,
            theme: defaultSettings.pdfSettings.theme,
            layout: defaultSettings.pdfSettings.layout,
          },
        };
      } else {
        // Criar nova sessão
        newSession = {
          workId,
          scoreId,
          workTitle,
          composerName,
          startTime: new Date().toISOString(),
          duration: 0,
          isActive: true,
          isPaused: false,
          metronome: {
            bpm: defaultSettings.defaultMetronome.bpm,
            timeSignature: defaultSettings.defaultMetronome.timeSignature,
            isActive: false,
            sound: defaultSettings.defaultMetronome.sound,
            volume: defaultSettings.defaultMetronome.volume,
          },
          studyNotes: '',
          practiceGoals: [],
          sectionsWorked: [],
          focus: 'TECHNICAL',
          pauseCount: 0,
          restartCount: 0,
          pagesViewed: [],
          annotationsCreated: 0,
          bookmarksCreated: 0,
          pdfSettings: {
            zoom: defaultSettings.pdfSettings.zoom,
            theme: defaultSettings.pdfSettings.theme,
            layout: defaultSettings.pdfSettings.layout,
          },
        };

        // Criar no backend
        const response = await fetch('/api/study-sessions/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workId: newSession.workId,
            scoreId: newSession.scoreId,
            durationMin: 0,
            metronomeSettings: newSession.metronome,
            focus: newSession.focus,
            studyNotes: newSession.studyNotes,
            practiceGoals: newSession.practiceGoals,
            sectionsWorked: newSession.sectionsWorked,
            pdfSettings: newSession.pdfSettings,
          }),
        });

        const result = await response.json();
        if (result.success) {
          newSession.id = result.studySession.id;
        }
      }

      setSession(newSession);
      startTimer();
      setLastSaved(new Date());
    } catch (err) {
      setError('Erro ao inicializar sessão de estudo');
      console.error('Erro ao inicializar sessão:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workId, scoreId, workTitle, composerName, userSettings, activeSession]);

  // Iniciar timer
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.isPaused) return prev;
        return { ...prev, duration: prev.duration + 1 };
      });
    }, 1000);
  }, []);

  // Pausar/Retomar
  const togglePause = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;

      const newIsPaused = !prev.isPaused;

      if (newIsPaused) {
        // Pausar
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        return {
          ...prev,
          isPaused: true,
          pauseCount: prev.pauseCount + 1,
        };
      } else {
        // Retomar
        startTimer();
        return {
          ...prev,
          isPaused: false,
        };
      }
    });
  }, [startTimer]);

  // Resetar timer
  const resetTimer = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        duration: 0,
        restartCount: prev.restartCount + 1,
      };
    });
  }, []);

  // Atualizar sessão
  const updateSession = useCallback((updates: Partial<StudySession>) => {
    setSession((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Salvar sessão
  const saveSession = useCallback(
    async (isFinal = false) => {
      if (!session?.id) return false;

      try {
        const response = await fetch('/api/study-sessions/enhanced', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: session.id,
            durationMin: Math.floor(session.duration / 60),
            metronomeUsed: session.metronome.isActive,
            metronomeSettings: session.metronome,
            focus: session.focus,
            studyNotes: session.studyNotes,
            practiceGoals: session.practiceGoals,
            sectionsWorked: session.sectionsWorked,
            pauseCount: session.pauseCount,
            restartCount: session.restartCount,
            pagesViewed: session.pagesViewed,
            annotationsCreated: session.annotationsCreated,
            bookmarksCreated: session.bookmarksCreated,
            pdfSettings: session.pdfSettings,
            isCompleted: isFinal,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setLastSaved(new Date());
          if (isFinal) {
            setSession((prev) => (prev ? { ...prev, isActive: false } : null));
          }
          return true;
        }

        return false;
      } catch (error) {
        console.error('Erro ao salvar sessão:', error);
        return false;
      }
    },
    [session]
  );

  // Finalizar sessão
  const endSession = useCallback(async () => {
    if (!session) return false;

    try {
      const success = await saveSession(true);

      if (success) {
        cleanup();
        toast.success('Sessão finalizada com sucesso!');
        return true;
      }

      toast.error('Erro ao finalizar sessão');
      return false;
    } catch (error) {
      console.log('erro', error);
      toast.error('Erro ao finalizar sessão');
      return false;
    }
  }, [session, saveSession]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  // Formatação de tempo
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(
        2,
        '0'
      )}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Estado calculado
  const isTimerRunning = session?.isActive && !session?.isPaused;
  const formattedDuration = session ? formatDuration(session.duration) : '0:00';
  const canSave = session?.id && session.duration > 0;

  return {
    // Estado
    session,
    isLoading,
    error,
    lastSaved,

    // Estado calculado
    isTimerRunning,
    formattedDuration,
    canSave,

    // Ações
    togglePause,
    resetTimer,
    updateSession,
    saveSession,
    endSession,
    cleanup,

    // Utilitários
    formatDuration,
  };
};

export default useStudyMode;
