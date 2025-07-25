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
  FiAlertCircle,
  FiSave,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { WorkDetails } from '@/app/requests/work-details';
import {
  UserStudySettings,
  ActiveStudySession,
} from '@/app/requests/study-requests';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import { useIMSLPScoresIncremental } from '@/app/hooks/useIMSLPScoresIncremental';
import StudyPDFViewer from '../StudyPDFViewer';
import StudyTimer from '../StudyTimer';
import StudyMetronome from '../StudyMetronome';
import StudyNotes from '../StudyNotes';
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
  duration: number;
  isActive: boolean;
  isPaused: boolean;
  metronome: {
    bpm: number;
    timeSignature: string;
    isActive: boolean;
    sound: 'click' | 'beep' | 'wood';
    volume: number;
  };
  studyNotes: string;
  practiceGoals: string[];
  sectionsWorked: string[];
  focus:
    | 'TECHNICAL'
    | 'EXPRESSIVITY'
    | 'PRECISION'
    | 'SIGHT_READING'
    | 'MEMORIZATION'
    | 'PERFORMANCE'
    | 'REVIEW';
  pauseCount: number;
  restartCount: number;
  pagesViewed: number[];
  annotationsCreated: number;
  bookmarksCreated: number;
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

  console.log('🎼 [STUDY-CLIENT] Props recebidas:', {
    workId: work.id,
    scoreId,
    userId,
    searchParams,
  });

  // Estados principais
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null
  );
  const [layout, setLayout] = useState<StudyLayout>('split');
  const [activePanel, setActivePanel] = useState<ActivePanel>('timer');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [currentScore, setCurrentScore] = useState<IMSLPScore | undefined>(
    undefined
  );
  const [mounted, setMounted] = useState(false);

  // Refs para controle
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🆕 Hook incremental corrigido
  const {
    scores: imslpScores,
    loading: loadingScores,
    error: scoresError,
    setSelectedScore,
  } = useIMSLPScoresIncremental(work.imslpPermlink, {
    workId: work.id,
    enabled: mounted,
    initialLimit: 5,
    priorityScoreId: scoreId,
  });

  // Verificar se está montado (hidratado)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🆕 Carregar partitura específica com nova lógica
  const loadSelectedScore = useCallback(async () => {
    if (!scoreId || !imslpScores) {
      console.log('🔍 [STUDY-CLIENT] Usando primeira partitura disponível');
      const firstScore = findFirstAvailableScore(imslpScores?.scoresByType);
      if (firstScore) {
        setCurrentScore(firstScore);
        setSelectedScore(firstScore.id);
      }
      return;
    }

    console.log(`🔍 [STUDY-CLIENT] Procurando partitura com ID: ${scoreId}`);

    try {
      // Buscar a partitura nos dados carregados
      const foundScore = findScoreById(imslpScores.scoresByType, scoreId);

      if (foundScore) {
        setCurrentScore(foundScore);
        setSelectedScore(foundScore.id);
        console.log(
          `✅ [STUDY-CLIENT] Partitura encontrada: ${foundScore.title}`
        );
        return;
      }

      // Se não encontrou, tentar buscar nos dados salvos do usuário
      console.log('🔄 [STUDY-CLIENT] Buscando partitura nos dados salvos...');
      console.log('WORK', { work: work.id, scoreId });
      const response = await fetch(
        `/api/user/selected-scores?workId=${work.id}&scoreId=${scoreId}`
      );
      const result = await response.json();

      if (result.success && result.selectedScores.length > 0) {
        const savedScore = result.selectedScores[0];
        setCurrentScore(savedScore);
        setSelectedScore(savedScore.id);
        console.log(
          `💾 [STUDY-CLIENT] Partitura carregada dos dados salvos: ${savedScore.title}`
        );
        return;
      }

      console.warn(`⚠️ [STUDY-CLIENT] Partitura não encontrada: ${scoreId}`);
      toast.error('Partitura não encontrada. Usando partitura padrão...');

      // Fallback para primeira partitura disponível
      const firstScore = findFirstAvailableScore(imslpScores.scoresByType);
      if (firstScore) {
        setCurrentScore(firstScore);
        setSelectedScore(firstScore.id);
      }
    } catch (error) {
      console.error('❌ [STUDY-CLIENT] Erro ao carregar partitura:', error);
      toast.error('Erro ao carregar partitura');
    }
  }, [scoreId, imslpScores, work.id, setSelectedScore]);

  // Carregar partitura quando dados estão disponíveis
  useEffect(() => {
    if (!loadingScores && imslpScores) {
      loadSelectedScore();
    }
  }, [loadingScores, imslpScores, loadSelectedScore]);

  // Inicializar sessão quando componente monta
  useEffect(() => {
    if (mounted && currentScore) {
      initializeStudySession();
    }
  }, [mounted, currentScore, work, userSettings, activeSession]);

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
      }, 30000);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [currentSession?.isActive, currentSession?.isPaused]);

  // Inicializar sessão de estudo
  const initializeStudySession = useCallback(() => {
    console.log('🎯 [STUDY-CLIENT] Inicializando sessão de estudo...');

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
      console.log('🔄 [STUDY-CLIENT] Recuperando sessão ativa existente');
      setCurrentSession({
        id: activeSession.id,
        workId: work.id,
        scoreId: currentScore?.id,
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
      console.log('🆕 [STUDY-CLIENT] Criando nova sessão de estudo');
      // Criar nova sessão
      const newSession: StudySession = {
        workId: work.id,
        scoreId: currentScore?.id,
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
      createSessionInBackend(newSession);
    }

    startTimer();
  }, [work, currentScore, userSettings, activeSession]);

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setCurrentSession((prev) => {
        if (!prev || prev.isPaused) return prev;
        return { ...prev, duration: prev.duration + 1 };
      });
    }, 1000);
  }, []);

  const togglePause = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      const newIsPaused = !prev.isPaused;
      if (newIsPaused) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        return { ...prev, isPaused: true, pauseCount: prev.pauseCount + 1 };
      } else {
        startTimer();
        return { ...prev, isPaused: false };
      }
    });
  }, [startTimer]);

  const resetTimer = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      return { ...prev, duration: 0, restartCount: prev.restartCount + 1 };
    });
  }, []);

  const endSession = useCallback(async () => {
    if (!currentSession) return;
    try {
      await saveSessionToBackend(true);
      setShowSessionSummary(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setCurrentSession((prev) => (prev ? { ...prev, isActive: false } : null));
      toast.success('Sessão de estudo finalizada!');
    } catch (error) {
      console.log(error);
      toast.error('Erro ao finalizar sessão');
    }
  }, [currentSession]);

  const saveSessionToBackend = useCallback(
    async (isFinal = false) => {
      if (!currentSession) return;
      try {
        const endpoint = '/api/study-sessions/enhanced';
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

  const createSessionInBackend = useCallback(async (session: StudySession) => {
    try {
      const response = await fetch('/api/study-sessions/enhanced', {
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

  const updateSession = useCallback((updates: Partial<StudySession>) => {
    setCurrentSession((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

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

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 🆕 Funções auxiliares para buscar partituras
  const findFirstAvailableScore = (scoresByType: any): IMSLPScore | null => {
    if (!scoresByType) return null;

    const typeOrder = [
      'scores',
      'parts',
      'arrangements',
      'librettos',
      'others',
      'sources',
    ];

    for (const type of typeOrder) {
      const groups = scoresByType[type];
      if (groups && groups.length > 0) {
        const firstGroup = groups[0];
        if (firstGroup.scores && firstGroup.scores.length > 0) {
          return firstGroup.scores[0];
        }
      }
    }

    return null;
  };

  const findScoreById = (
    scoresByType: any,
    searchId: string
  ): IMSLPScore | null => {
    if (!scoresByType || !searchId) return null;

    const allTypes = [
      'scores',
      'parts',
      'arrangements',
      'librettos',
      'others',
      'sources',
    ];

    for (const type of allTypes) {
      const groups = scoresByType[type] || [];
      for (const group of groups) {
        const foundScore = group.scores?.find(
          (score: IMSLPScore) => score.id === searchId
        );
        if (foundScore) {
          return foundScore;
        }
      }
    }

    return null;
  };

  // Estados de carregamento
  if (!mounted) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiMusic className="w-8 h-8 text-theme-primary" />
          </div>
          <p className="text-theme-secondary">Inicializando modo estudo...</p>
        </div>
      </div>
    );
  }

  if (loadingScores) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiMusic className="w-8 h-8 text-theme-primary" />
          </div>
          <p className="text-theme-secondary">Carregando partituras...</p>
          <div className="mt-4">
            <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state para partituras
  if (scoresError && !currentScore) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto">
            <FiAlertCircle className="w-8 h-8 text-accent-red" />
          </div>
          <div className="space-y-2">
            <p className="text-theme-primary font-medium">
              Erro ao carregar partituras
            </p>
            <p className="text-theme-secondary text-sm">{scoresError}</p>
          </div>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-gradient text-theme-primary px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => router.push(`/works/${work.id}`)}
              className="bg-theme-elevated border border-theme-secondary text-theme-primary px-6 py-2 rounded-xl hover:bg-interactive-hover transition-all duration-300"
            >
              Voltar à obra
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiMusic className="w-8 h-8 text-theme-primary" />
          </div>
          <p className="text-theme-secondary">Preparando sessão de estudo...</p>
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
                {currentScore && (
                  <span className="ml-2 px-2 py-1 bg-theme-elevated rounded text-xs">
                    {currentScore.title.substring(0, 30)}...
                  </span>
                )}
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
              selectedScore={currentScore}
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
                selectedScore={currentScore}
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
