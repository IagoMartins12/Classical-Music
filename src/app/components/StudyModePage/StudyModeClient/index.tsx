// app/components/StudyMode/StudyModeClient.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiClock,
  FiMusic,
  FiEdit3,
  FiBookOpen,
  FiSettings,
  FiX,
  FiPlay,
  FiPause,
  FiSquare,
  FiMaximize2,
  FiMinimize2,
  FiSave,
  FiRotateCcw,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { WorkDetails } from '@/app/requests/work-details';
import {
  UserStudySettings,
  ActiveStudySession,
} from '@/app/requests/study-requests';
import { useIMSLPScores } from '@/app/hooks/useIMSLPScores';

// Componentes do modo estudo
import StudyTimer from '../StudyTimer';
import StudyMetronome from '../StudyMetronome';
import StudyNotes from '../StudyNotes';
import StudyPDFViewer from '../StudyPDFViewer';
import StudyControls from '../StudyControls';
import StudySessionSummary from '../StudySessionSummary';

interface StudyModeClientProps {
  work: WorkDetails;
  scoreId?: string;
  userId: string;
  userSettings: UserStudySettings | null;
  activeSession: ActiveStudySession | null;
  searchParams: { [key: string]: string | string[] | undefined };
}

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

type StudyLayout = 'focus' | 'split' | 'full-pdf';
type ActivePanel = 'timer' | 'metronome' | 'notes' | 'settings';

const StudyModeClient: React.FC<StudyModeClientProps> = ({
  work,
  scoreId,
  userId,
  userSettings,
  activeSession,
  searchParams,
}) => {
  const router = useRouter();

  // Estados principais
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null
  );
  const [layout, setLayout] = useState<StudyLayout>('split');
  const [activePanel, setActivePanel] = useState<ActivePanel>('timer');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<any>(null);
  const [showSessionSummary, setShowSessionSummary] = useState(false);

  // Refs para controle
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hook para buscar partituras IMSLP
  const { scores: imslpScores, loading: loadingScores } = useIMSLPScores(
    work.imslpPermlink
  );

  // Inicializar sessão quando componente monta
  useEffect(() => {
    initializeStudySession();
  }, [work, scoreId, userSettings, activeSession]);

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (metronomeIntervalRef.current)
        clearInterval(metronomeIntervalRef.current);
      if (autoSaveIntervalRef.current)
        clearInterval(autoSaveIntervalRef.current);
    };
  }, []);

  // Auto-save da sessão a cada 30 segundos
  useEffect(() => {
    if (currentSession?.isActive && !currentSession.isPaused) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveSessionToBackend();
      }, 30000); // 30 segundos

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [currentSession?.isActive, currentSession?.isPaused]);

  // Inicializar sessão de estudo
  const initializeStudySession = useCallback(() => {
    const defaultSettings = userSettings?.studyModeSettings || {
      defaultMetronome: {
        bpm: 120,
        sound: 'click',
        volume: 0.5,
        timeSignature: '4/4',
      },
      pdfSettings: { zoom: 1.2, theme: 'light', layout: 'single' },
    };

    // Se há sessão ativa, recuperar; senão, criar nova
    if (activeSession) {
      setCurrentSession({
        id: activeSession.id,
        workId: work.id,
        scoreId: scoreId,
        workTitle: work.title,
        composerName: work.composer.fullName,
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
        pagesViewed: [],
        annotationsCreated: 0,
        bookmarksCreated: 0,
        pdfSettings: {
          zoom: defaultSettings.pdfSettings.zoom,
          theme: defaultSettings.pdfSettings.theme,
          layout: defaultSettings.pdfSettings.layout,
        },
      });
    } else {
      // Criar nova sessão
      const newSession: StudySession = {
        workId: work.id,
        scoreId: scoreId,
        workTitle: work.title,
        composerName: work.composer.fullName,
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

      setCurrentSession(newSession);

      // Criar sessão no backend
      createSessionInBackend(newSession);
    }

    // Iniciar timer
    startTimer();
  }, [work, scoreId, userSettings, activeSession]);

  // Iniciar timer
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setCurrentSession((prev) => {
        if (!prev || prev.isPaused) return prev;

        return {
          ...prev,
          duration: prev.duration + 1,
        };
      });
    }, 1000);
  }, []);

  // Pausar/Retomar sessão
  const togglePause = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev) return prev;

      const newIsPaused = !prev.isPaused;

      if (newIsPaused) {
        // Pausar
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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
    setCurrentSession((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        duration: 0,
        restartCount: prev.restartCount + 1,
      };
    });
  }, []);

  // Finalizar sessão
  const endSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      // Salvar sessão final
      await saveSessionToBackend(true);

      // Mostrar resumo
      setShowSessionSummary(true);

      // Parar timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      setCurrentSession((prev) => (prev ? { ...prev, isActive: false } : null));

      toast.success('Sessão de estudo finalizada!');
    } catch (error) {
      toast.error('Erro ao finalizar sessão');
    }
  }, [currentSession]);

  // Salvar sessão no backend
  const saveSessionToBackend = useCallback(
    async (isFinal = false) => {
      if (!currentSession) return;

      try {
        const endpoint = currentSession.id
          ? '/api/study-sessions'
          : '/api/study-sessions';
        const method = currentSession.id ? 'PATCH' : 'POST';

        const sessionData = {
          ...(currentSession.id && { id: currentSession.id }),
          workId: currentSession.workId,
          scoreId: currentSession.scoreId,
          durationMin: Math.floor(currentSession.duration / 60),
          metronomeUsed: currentSession.metronome.isActive,
          metronomeSettings: currentSession.metronome,
          focus: currentSession.focus,
          studyNotes: currentSession.studyNotes,
          practiceGoals: currentSession.practiceGoals,
          sectionsWorked: currentSession.sectionsWorked,
          pauseCount: currentSession.pauseCount,
          restartCount: currentSession.restartCount,
          pagesViewed: currentSession.pagesViewed,
          annotationsCreated: currentSession.annotationsCreated,
          bookmarksCreated: currentSession.bookmarksCreated,
          pdfSettings: currentSession.pdfSettings,
          isCompleted: isFinal,
        };

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        });

        const result = await response.json();

        if (result.success && !currentSession.id) {
          // Primeira salvada - armazenar ID
          setCurrentSession((prev) =>
            prev ? { ...prev, id: result.studySession.id } : null
          );
        }
      } catch (error) {
        console.error('Erro ao salvar sessão:', error);
      }
    },
    [currentSession]
  );

  // Criar sessão no backend
  const createSessionInBackend = useCallback(async (session: StudySession) => {
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId: session.workId,
          scoreId: session.scoreId,
          durationMin: 0,
          metronomeSettings: session.metronome,
          focus: session.focus,
          studyNotes: session.studyNotes,
          practiceGoals: session.practiceGoals,
          sectionsWorked: session.sectionsWorked,
          pdfSettings: session.pdfSettings,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentSession((prev) =>
          prev ? { ...prev, id: result.studySession.id } : null
        );
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    }
  }, []);

  // Atualizar configurações da sessão
  const updateSession = useCallback((updates: Partial<StudySession>) => {
    setCurrentSession((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Sair do modo estudo
  const exitStudyMode = useCallback(() => {
    if (currentSession?.isActive) {
      const confirmExit = window.confirm(
        'Você tem uma sessão ativa. Deseja salvar antes de sair?'
      );

      if (confirmExit) {
        saveSessionToBackend(true);
      }
    }

    router.push(`/works/${work.id}`);
  }, [currentSession, work.id, router, saveSessionToBackend]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Selecionar partitura específica
  const selectScore = useCallback((score: any) => {
    setSelectedScore(score);
    setCurrentSession((prev) => (prev ? { ...prev, scoreId: score.id } : null));
  }, []);

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiMusic className="w-8 h-8 text-theme-primary" />
          </div>
          <p className="text-theme-secondary">
            Inicializando sessão de estudo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col">
      {/* Header da sessão */}
      <header className="bg-gradient-to-r from-theme-elevated to-interactive-hover border-b border-theme-secondary px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Info da obra */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
              <FiBookOpen className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-theme-primary truncate max-w-md">
                {currentSession.workTitle}
              </h1>
              <p className="text-sm text-theme-secondary">
                {currentSession.composerName}
              </p>
            </div>
          </div>

          {/* Controles principais */}
          <div className="flex items-center space-x-4">
            {/* Timer display */}
            <div className="bg-theme-elevated border border-theme-primary rounded-xl px-4 py-2 flex items-center space-x-2">
              <FiClock className="w-4 h-4 text-brand-primary" />
              <span className="text-lg font-mono font-bold text-theme-primary min-w-[60px]">
                {Math.floor(currentSession.duration / 3600) > 0
                  ? `${Math.floor(currentSession.duration / 3600)}:${String(
                      Math.floor((currentSession.duration % 3600) / 60)
                    ).padStart(2, '0')}:${String(
                      currentSession.duration % 60
                    ).padStart(2, '0')}`
                  : `${Math.floor(currentSession.duration / 60)}:${String(
                      currentSession.duration % 60
                    ).padStart(2, '0')}`}
              </span>
            </div>

            {/* Play/Pause */}
            <button
              onClick={togglePause}
              className="w-10 h-10 bg-brand-gradient rounded-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
            >
              {currentSession.isPaused ? (
                <FiPlay className="w-5 h-5 text-theme-primary" />
              ) : (
                <FiPause className="w-5 h-5 text-theme-primary" />
              )}
            </button>

            {/* Layout toggle */}
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as StudyLayout)}
              className="bg-theme-elevated border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary text-sm"
            >
              <option value="focus">Foco</option>
              <option value="split">Dividido</option>
              <option value="full-pdf">PDF Completo</option>
            </select>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
            >
              {isFullscreen ? (
                <FiMinimize2 className="w-5 h-5 text-theme-primary" />
              ) : (
                <FiMaximize2 className="w-5 h-5 text-theme-primary" />
              )}
            </button>

            {/* Save session */}
            <button
              onClick={() => saveSessionToBackend()}
              className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
              title="Salvar sessão"
            >
              <FiSave className="w-5 h-5 text-theme-primary" />
            </button>

            {/* End session */}
            <button
              onClick={endSession}
              className="bg-accent-red text-theme-primary px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <FiSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Finalizar</span>
            </button>

            {/* Exit */}
            <button
              onClick={exitStudyMode}
              className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
            >
              <FiX className="w-5 h-5 text-theme-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {layout === 'full-pdf' ? (
          /* Layout PDF completo */
          <div className="flex-1">
            <StudyPDFViewer
              work={work}
              selectedScore={
                selectedScore ||
                imslpScores?.scoresByType.scores?.[0]?.scores?.[0]
              }
              session={currentSession}
              onUpdateSession={updateSession}
              className="h-full"
            />
          </div>
        ) : (
          <>
            {/* PDF Viewer */}
            <div
              className={`${
                layout === 'focus' ? 'flex-1' : 'w-2/3'
              } border-r border-theme-secondary`}
            >
              <StudyPDFViewer
                work={work}
                selectedScore={
                  selectedScore ||
                  imslpScores?.scoresByType.scores?.[0]?.scores?.[0]
                }
                session={currentSession}
                onUpdateSession={updateSession}
                className="h-full"
              />
            </div>

            {/* Side panel */}
            {layout !== 'focus' && (
              <div className="w-1/3 flex flex-col bg-theme-elevated">
                {/* Panel tabs */}
                <nav className="flex border-b border-theme-secondary bg-theme-elevated">
                  {[
                    { id: 'timer', label: 'Timer', icon: FiClock },
                    { id: 'metronome', label: 'Metrônomo', icon: FiMusic },
                    { id: 'notes', label: 'Anotações', icon: FiEdit3 },
                    { id: 'settings', label: 'Config', icon: FiSettings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActivePanel(tab.id as ActivePanel)}
                        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                          activePanel === tab.id
                            ? 'border-brand-primary text-brand-primary bg-brand-primary/5'
                            : 'border-transparent text-theme-secondary hover:text-theme-primary hover:bg-interactive-hover'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Panel content */}
                <div className="flex-1 overflow-auto">
                  {activePanel === 'timer' && (
                    <StudyTimer
                      session={currentSession}
                      onTogglePause={togglePause}
                      onReset={resetTimer}
                      onUpdateSession={updateSession}
                    />
                  )}

                  {activePanel === 'metronome' && (
                    <StudyMetronome
                      session={currentSession}
                      onUpdateSession={updateSession}
                    />
                  )}

                  {activePanel === 'notes' && (
                    <StudyNotes
                      session={currentSession}
                      onUpdateSession={updateSession}
                    />
                  )}

                  {activePanel === 'settings' && (
                    <StudyControls
                      session={currentSession}
                      userSettings={userSettings}
                      onUpdateSession={updateSession}
                      onSaveSettings={saveSessionToBackend}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Session Summary Modal */}
      {showSessionSummary && currentSession && (
        <StudySessionSummary
          session={currentSession}
          work={work}
          onClose={() => {
            setShowSessionSummary(false);
            router.push(`/works/${work.id}`);
          }}
        />
      )}
    </div>
  );
};

export default StudyModeClient;
