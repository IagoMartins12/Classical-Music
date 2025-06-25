import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAdvancedStudy } from '@/app/hooks/useAdvancedStudy';
import {
  FiActivity,
  FiClock,
  FiMusic,
  FiTarget,
  FiSettings,
  FiMic,
  FiCamera,
  FiBookOpen,
  FiUsers,
  FiAward,
  FiHome,
  FiMaximize2,
  FiMinimize2,
  FiPause,
  FiPlay,
  FiSquare,
  FiSave,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
  FiCloud,
  FiCloudOff,
  FiAlertTriangle,
  FiBarChart2,
} from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';

// Lazy load dos componentes para melhor performance
const AdvancedStudyMode = React.lazy(() => import('../AdvancedStudyMode'));
const AudioRecordingSystem = React.lazy(
  () => import('../AudioRecordingSystem')
);
const StudyAnalyticsDashboard = React.lazy(
  () => import('../StudyAnalyticsDashboard')
);
const InstrumentSpecificTools = React.lazy(
  () => import('../InstrumentSpecificTools')
);
const GamificationSystem = React.lazy(() => import('../GamificationSystem'));
const InteractiveScoreViewer = React.lazy(
  () => import('../InteractiveScoreViewer')
);
const AdvancedReportsSystem = React.lazy(
  () => import('../AdvancedReportsSystem')
);
const AdvancedSettingsSystem = React.lazy(
  () => import('../AdvancedSettingsSystem')
);
const AIFeedbackSystem = React.lazy(() => import('../AIFeedback'));
const CommunitySystem = React.lazy(() => import('../CommunitySystem'));

interface StudyModeAppProps {
  workId: string;
  workTitle: string;
  composerName: string;
  selectedScore?: any;
  instrument?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  onClose?: () => void;
}

interface AppStatus {
  isOnline: boolean;
  isCloudSynced: boolean;
  lastSync: Date | null;
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
}

const StudyModeApp: React.FC<StudyModeAppProps> = ({
  workId,
  workTitle,
  composerName,
  selectedScore,
  instrument = 'piano',
  userLevel = 'intermediate',
  onClose,
}) => {
  const {
    currentSession,
    isStudyModeOpen,
    metrics,
    analysis,
    isAnalyzing,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    setActiveTab,
    activeTab,
    cleanup,
  } = useAdvancedStudy();

  const [currentView, setCurrentView] = useState<
    'study' | 'analytics' | 'community' | 'settings'
  >('study');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [appStatus, setAppStatus] = useState<AppStatus>({
    isOnline: navigator.onLine,
    isCloudSynced: false,
    lastSync: null,
    hasUnsavedChanges: false,
    isAutoSaving: false,
  });

  // Estados para funcionalidades específicas
  const [isRecording, setIsRecording] = useState(false);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [showInstrumentTools, setShowInstrumentTools] = useState(false);

  // Monitorar conectividade
  useEffect(() => {
    const handleOnline = () =>
      setAppStatus((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setAppStatus((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save e sincronização
  useEffect(() => {
    if (currentSession && appStatus.isOnline) {
      const autoSaveInterval = setInterval(async () => {
        setAppStatus((prev) => ({ ...prev, isAutoSaving: true }));

        try {
          // Simular auto-save
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setAppStatus((prev) => ({
            ...prev,
            isAutoSaving: false,
            hasUnsavedChanges: false,
            lastSync: new Date(),
            isCloudSynced: true,
          }));
        } catch (error) {
          setAppStatus((prev) => ({
            ...prev,
            isAutoSaving: false,
            isCloudSynced: false,
          }));
        }
      }, 30000); // Auto-save a cada 30 segundos

      return () => clearInterval(autoSaveInterval);
    }
  }, [currentSession, appStatus.isOnline]);

  // Inicializar sessão se não existir
  useEffect(() => {
    if (!currentSession && isStudyModeOpen) {
      startSession(workId, workTitle, composerName, instrument, selectedScore);
    }
  }, [
    currentSession,
    isStudyModeOpen,
    workId,
    workTitle,
    composerName,
    instrument,
    selectedScore,
    startSession,
  ]);

  // Cleanup ao fechar
  useEffect(() => {
    return () => {
      if (currentSession) {
        cleanup();
      }
    };
  }, []);

  // Handlers para gravação
  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setShowAIFeedback(true);
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    // Manter AI feedback visível para análise
  }, []);

  // Handler para fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Formatação de tempo
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
    </div>
  );

  // Error fallback
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <FiAlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Algo deu errado
        </h3>
        <p className="text-gray-400 mb-4">
          Ocorreu um erro inesperado no sistema
        </p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  // Mini player quando minimizado
  const MiniPlayer = () => (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-white/20 rounded-xl p-4 shadow-2xl z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FiMusic className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-medium text-sm">{workTitle}</div>
            <div className="text-gray-400 text-xs">{composerName}</div>
          </div>
        </div>
        <button
          onClick={() => {
            setShowMiniPlayer(false);
            setIsFullscreen(false);
          }}
          className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
        >
          <FiMaximize2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xl font-mono font-bold text-blue-400">
          {currentSession ? formatTime(currentSession.duration) : '0:00'}
        </div>
        <div className="text-xs text-gray-400">
          {currentSession?.isPaused
            ? 'Pausado'
            : currentSession?.isActive
            ? 'Em progresso'
            : 'Inativo'}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={currentSession?.isPaused ? resumeSession : pauseSession}
          className="w-8 h-8 rounded bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white"
        >
          {currentSession?.isPaused ? (
            <FiPlay className="w-3 h-3 ml-0.5" />
          ) : (
            <FiPause className="w-3 h-3" />
          )}
        </button>

        <button
          onClick={endSession}
          className="w-8 h-8 rounded bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-white"
        >
          <FiSquare className="w-3 h-3" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-xs text-gray-400">
            Eficiência: {metrics.efficiencyScore}%
          </div>
        </div>

        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-8 h-8 rounded transition-colors flex items-center justify-center ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-gray-400'
          }`}
        >
          <FiMic className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  // Status bar
  const StatusBar = () => (
    <div className="bg-gray-800 border-t border-white/10 px-4 py-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {appStatus.isOnline ? (
              <FiWifi className="w-4 h-4 text-green-400" />
            ) : (
              <FiWifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-gray-400">
              {appStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {appStatus.isCloudSynced ? (
              <FiCloud className="w-4 h-4 text-blue-400" />
            ) : (
              <FiCloudOff className="w-4 h-4 text-orange-400" />
            )}
            <span className="text-gray-400">
              {appStatus.isAutoSaving
                ? 'Salvando...'
                : appStatus.lastSync
                ? `Salvo ${appStatus.lastSync.toLocaleTimeString()}`
                : 'Não sincronizado'}
            </span>
          </div>

          {currentSession && (
            <div className="flex items-center space-x-4 text-gray-400">
              <span>Duração: {formatTime(currentSession.duration)}</span>
              <span>Eficiência: {metrics.efficiencyScore}%</span>
              <span>Qualidade: {metrics.qualityScore}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="w-6 h-6 rounded hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400"
          >
            {isFullscreen ? (
              <FiMinimize2 className="w-3 h-3" />
            ) : (
              <FiMaximize2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (showMiniPlayer) {
    return <MiniPlayer />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Header principal */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FiMusic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Modo Estudo Avançado
              </h1>
              <p className="text-sm text-gray-300">
                {workTitle} - {composerName}
              </p>
            </div>
          </div>

          {/* Controles de sessão */}
          {currentSession && (
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex items-center space-x-3">
                <FiClock className="w-4 h-4 text-blue-400" />
                <span className="text-lg font-mono font-bold text-white">
                  {formatTime(currentSession.duration)}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentSession.isPaused
                      ? 'bg-yellow-400'
                      : currentSession.isActive
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={
                    currentSession.isPaused ? resumeSession : pauseSession
                  }
                  className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white"
                >
                  {currentSession.isPaused ? (
                    <FiPlay className="w-4 h-4 ml-0.5" />
                  ) : (
                    <FiPause className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={endSession}
                  className="w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-white"
                >
                  <FiSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Navegação principal */}
          <div className="flex items-center space-x-2">
            {[
              { id: 'study', label: 'Estudo', icon: FiBookOpen },
              { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
              { id: 'community', label: 'Comunidade', icon: FiUsers },
              { id: 'settings', label: 'Configurações', icon: FiSettings },
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentView === view.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>

          {/* Ações rápidas */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMiniPlayer(true)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors flex items-center justify-center text-white"
              title="Minimizar"
            >
              <FiMinimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors flex items-center justify-center text-white"
              title="Fechar"
            >
              <FiHome className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          {currentView === 'study' && (
            <div className="h-full flex">
              {/* Painel principal */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'dashboard' && <AdvancedStudyMode />}
                {activeTab === 'timer' && <AdvancedStudyMode />}
                {activeTab === 'metronome' && <AdvancedStudyMode />}
                {activeTab === 'score' && selectedScore && (
                  <InteractiveScoreViewer
                    score={{
                      id: workId,
                      title: workTitle,
                      pages: [
                        {
                          id: '1',
                          pageNumber: 1,
                          imageUrl:
                            selectedScore.thumbnailUrl ||
                            '/api/placeholder/800/1000',
                          width: 800,
                          height: 1000,
                        },
                      ],
                    }}
                    instrument={instrument}
                    isStudyMode={true}
                  />
                )}
                {activeTab === 'recording' && (
                  <AudioRecordingSystem
                    isRecording={isRecording}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    instrument={instrument}
                  />
                )}
                {activeTab === 'analysis' && <StudyAnalyticsDashboard />}
              </div>

              {/* Painéis laterais opcionais */}
              {showAIFeedback && (
                <div className="w-96 border-l border-white/10 bg-white/5">
                  <AIFeedbackSystem
                    isRecording={isRecording}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    instrument={instrument}
                  />
                </div>
              )}

              {showInstrumentTools && (
                <div className="w-80 border-l border-white/10 bg-white/5">
                  <InstrumentSpecificTools instrument={instrument} />
                </div>
              )}
            </div>
          )}

          {currentView === 'analytics' && (
            <div className="h-full overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                <div>
                  <StudyAnalyticsDashboard />
                </div>
                <div>
                  <GamificationSystem />
                </div>
              </div>
            </div>
          )}

          {currentView === 'community' && (
            <div className="h-full overflow-auto">
              <CommunitySystem />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="h-full overflow-auto">
              <AdvancedSettingsSystem />
            </div>
          )}
        </Suspense>
      </div>

      {/* Controles flutuantes */}
      <div className="fixed bottom-6 left-6 flex items-center space-x-3 z-40">
        <button
          onClick={() => setShowAIFeedback(!showAIFeedback)}
          className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
            showAIFeedback
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-400 hover:text-white'
          }`}
          title="AI Feedback"
        >
          <BiBrain className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowInstrumentTools(!showInstrumentTools)}
          className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
            showInstrumentTools
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-400 hover:text-white'
          }`}
          title="Ferramentas do Instrumento"
        >
          <FiTarget className="w-5 h-5" />
        </button>

        <button
          onClick={handleStartRecording}
          className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-400 hover:text-white'
          }`}
          title={isRecording ? 'Gravando...' : 'Iniciar Gravação'}
        >
          <FiMic className="w-5 h-5" />
        </button>
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Toaster para notificações */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </div>
  );
};

export default StudyModeApp;
