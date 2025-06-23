//components/StudyMode/StudyModeModal/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FiClock,
  FiPlay,
  FiPause,
  FiSquare,
  FiMusic,
  FiEdit3,
  FiTarget,
  FiX,
  FiVolumeX,
  FiVolume2,
  FiRotateCcw,
  FiSave,
  FiCheckCircle,
} from 'react-icons/fi';
import { useStudyModeStore } from '@/app/stores/useStudyModeStore';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface StudyModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workTitle: string;
  composerName: string;
  selectedScore?: IMSLPScore;
}

const StudyModeModal: React.FC<StudyModeModalProps> = ({
  isOpen,
  onClose,
  workId,
  workTitle,
  composerName,
  selectedScore,
}) => {
  const {
    currentSession,
    startStudySession,
    pauseSession,
    resumeSession,
    endSession,
    updateMetronome,
    toggleMetronome,
    updateStudyNotes,
    addPracticeGoal,
    removePracticeGoal,
    addSectionWorked,
    savePostPracticeEvaluation,
    resetTimer,
    cleanup,
  } = useStudyModeStore();

  const [activeTab, setActiveTab] = useState<
    'timer' | 'metronome' | 'notes' | 'score' | 'evaluation'
  >('timer');
  const [newGoal, setNewGoal] = useState('');
  const [newSection, setNewSection] = useState('');
  const [showPostPractice, setShowPostPractice] = useState(false);
  const [metronomeAudio, setMetronomeAudio] = useState<AudioContext | null>(
    null
  );
  const [metronomeInterval, setMetronomeInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Inicializar sessão quando modal abre
  useEffect(() => {
    if (isOpen && !currentSession) {
      startStudySession(workId, workTitle, composerName, selectedScore);
    }
  }, [
    isOpen,
    currentSession,
    workId,
    workTitle,
    composerName,
    selectedScore,
    startStudySession,
  ]);

  // Limpeza quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      if (metronomeInterval) {
        clearInterval(metronomeInterval);
        setMetronomeInterval(null);
      }
    }
  }, [isOpen, cleanup, metronomeInterval]);

  // Controle do metrônomo
  useEffect(() => {
    if (
      currentSession?.metronome.isActive &&
      currentSession.metronome.bpm > 0
    ) {
      const interval = 60000 / currentSession.metronome.bpm;

      const metInterval = setInterval(() => {
        playMetronomeSound();
      }, interval);

      setMetronomeInterval(metInterval);

      return () => {
        clearInterval(metInterval);
      };
    } else if (metronomeInterval) {
      clearInterval(metronomeInterval);
      setMetronomeInterval(null);
    }
  }, [currentSession?.metronome.isActive, currentSession?.metronome.bpm]);

  // Função para tocar som do metrônomo
  const playMetronomeSound = useCallback(() => {
    if (!metronomeAudio) {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      setMetronomeAudio(audioContext);
    }

    try {
      const audioContext =
        metronomeAudio ||
        new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value =
        currentSession?.metronome.sound === 'beep' ? 1000 : 800;
      oscillator.type = 'square';

      gainNode.gain.value = (currentSession?.metronome.volume || 0.5) * 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Erro ao reproduzir som do metrônomo:', error);
    }
  }, [metronomeAudio, currentSession?.metronome]);

  // Formatação do tempo
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

  // Adicionar objetivo
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      addPracticeGoal(newGoal.trim());
      setNewGoal('');
    }
  };

  // Adicionar seção
  const handleAddSection = () => {
    if (newSection.trim()) {
      addSectionWorked(newSection.trim());
      setNewSection('');
    }
  };

  // Finalizar sessão
  const handleEndSession = async () => {
    if (currentSession && currentSession.duration > 60) {
      // Mínimo 1 minuto
      setShowPostPractice(true);
    } else {
      const success = await endSession();
      if (success) {
        toast.success('Sessão de estudo salva!');
        onClose();
      } else {
        toast.error('Erro ao salvar sessão');
      }
    }
  };

  // Avaliação pós-prática
  const handlePostPracticeSubmit = async (evaluation: any) => {
    await savePostPracticeEvaluation(evaluation);
    console.log('evaluation', evaluation);
    const success = await endSession();

    if (success) {
      toast.success('Sessão de estudo concluída e salva!');
      setShowPostPractice(false);
      onClose();
    } else {
      toast.error('Erro ao salvar avaliação');
    }
  };

  if (!isOpen || !currentSession) return null;

  return (
    <div className="fixed inset-0 z-50 bg-theme-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover border-b border-theme-secondary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
              <FiMusic className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-theme-primary classical-title">
                Modo Estudo
              </h1>
              <p className="text-sm text-theme-secondary">
                {workTitle} - {composerName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer display */}
            <div className="bg-theme-elevated border border-theme-primary rounded-xl px-4 py-2 flex items-center space-x-2">
              <FiClock className="w-4 h-4 text-brand-primary" />
              <span className="text-lg font-mono font-bold text-theme-primary">
                {formatTime(currentSession.duration)}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover hover:border-theme-primary transition-all duration-300 flex items-center justify-center"
            >
              <FiX className="w-5 h-5 text-theme-primary" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 mt-4">
          {[
            { id: 'timer', label: 'Timer', icon: FiClock },
            { id: 'metronome', label: 'Metrônomo', icon: FiMusic },
            { id: 'notes', label: 'Anotações', icon: FiEdit3 },
            { id: 'score', label: 'Partitura', icon: FiTarget },
            { id: 'evaluation', label: 'Avaliação', icon: FiCheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-gradient text-theme-primary shadow-theme-glow'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-interactive-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="classical-card p-8 text-center">
              <div className="mb-6">
                <div className="text-6xl font-mono font-bold text-gradient-brand mb-2">
                  {formatTime(currentSession.duration)}
                </div>
                <p className="text-theme-secondary">
                  {currentSession.isPaused ? 'Pausado' : 'Em progresso'}
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                {!currentSession.isPaused ? (
                  <button
                    onClick={pauseSession}
                    className="btn-classical-primary flex items-center space-x-2"
                  >
                    <FiPause className="w-4 h-4" />
                    <span>Pausar</span>
                  </button>
                ) : (
                  <button
                    onClick={resumeSession}
                    className="btn-classical-primary flex items-center space-x-2"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Continuar</span>
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiRotateCcw className="w-4 h-4" />
                  <span>Reiniciar</span>
                </button>

                <button
                  onClick={handleEndSession}
                  className="bg-theme-tertiary text-theme-primary px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <FiSquare className="w-4 h-4" />
                  <span>Finalizar</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="classical-card-simple p-4 text-center">
                <div className="text-2xl font-bold text-brand-primary mb-1">
                  {currentSession.pauseCount}
                </div>
                <div className="text-sm text-theme-secondary">Pausas</div>
              </div>

              <div className="classical-card-simple p-4 text-center">
                <div className="text-2xl font-bold text-brand-primary mb-1">
                  {currentSession.restartCount}
                </div>
                <div className="text-sm text-theme-secondary">
                  Reinicializações
                </div>
              </div>

              <div className="classical-card-simple p-4 text-center">
                <div className="text-2xl font-bold text-brand-primary mb-1">
                  {currentSession.sectionsWorked.length}
                </div>
                <div className="text-sm text-theme-secondary">
                  Seções Trabalhadas
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metronome Tab */}
        {activeTab === 'metronome' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="classical-card p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gradient-brand mb-2">
                  {currentSession.metronome.bpm} BPM
                </div>
                <div className="text-theme-secondary">
                  {currentSession.metronome.timeSignature}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Andamento (BPM)
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={currentSession.metronome.bpm}
                    onChange={(e) =>
                      updateMetronome({ bpm: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-theme-tertiary mt-1">
                    <span>40</span>
                    <span>200</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Fórmula de Compasso
                  </label>
                  <select
                    value={currentSession.metronome.timeSignature}
                    onChange={(e) =>
                      updateMetronome({ timeSignature: e.target.value })
                    }
                    className="w-full input-classical-2"
                  >
                    <option value="4/4">4/4</option>
                    <option value="3/4">3/4</option>
                    <option value="2/4">2/4</option>
                    <option value="6/8">6/8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentSession.metronome.volume}
                    onChange={(e) =>
                      updateMetronome({ volume: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                <button
                  onClick={toggleMetronome}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    currentSession.metronome.isActive
                      ? 'bg-gradient-to-r from-accent-red to-accent-purple text-theme-primary'
                      : 'btn-classical-primary'
                  }`}
                >
                  {currentSession.metronome.isActive ? (
                    <>
                      <FiVolumeX className="w-4 h-4" />
                      <span>Parar Metrônomo</span>
                    </>
                  ) : (
                    <>
                      <FiVolume2 className="w-4 h-4" />
                      <span>Iniciar Metrônomo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Anotações */}
              <div className="classical-card p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiEdit3 className="w-5 h-5" />
                  <span>Anotações da Sessão</span>
                </h3>

                <textarea
                  value={currentSession.studyNotes}
                  onChange={(e) => updateStudyNotes(e.target.value)}
                  placeholder="Escreva suas observações, dificuldades encontradas, progressos..."
                  className="w-full h-64 input-classical-2 resize-none"
                />
              </div>

              {/* Objetivos e Seções */}
              <div className="space-y-6">
                {/* Objetivos */}
                <div className="classical-card p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiTarget className="w-5 h-5" />
                    <span>Objetivos da Sessão</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Adicionar objetivo..."
                        className="flex-1 input-classical-2"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                      />
                      <button
                        onClick={handleAddGoal}
                        className="btn-classical-primary px-4"
                      >
                        Adicionar
                      </button>
                    </div>

                    <div className="space-y-2">
                      {currentSession.practiceGoals.map((goal, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-theme-elevated rounded-xl p-3"
                        >
                          <span className="text-theme-primary">{goal}</span>
                          <button
                            onClick={() => removePracticeGoal(index)}
                            className="text-accent-red hover:bg-accent-red/20 rounded-lg p-1"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seções Trabalhadas */}
                <div className="classical-card p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">
                    Seções Trabalhadas
                  </h3>

                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        placeholder="Ex: Compasso 1-16, Exposição..."
                        className="flex-1 input-classical-2"
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleAddSection()
                        }
                      />
                      <button
                        onClick={handleAddSection}
                        className="btn-classical-primary px-4"
                      >
                        Adicionar
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentSession.sectionsWorked.map((section, index) => (
                        <span
                          key={index}
                          className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full text-sm"
                        >
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="max-w-4xl mx-auto">
            {selectedScore?.thumbnailUrl ? (
              <div className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-theme-primary">
                    {selectedScore.title}
                  </h3>
                  <a
                    href={selectedScore.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-classical-primary flex items-center space-x-2"
                  >
                    <FiTarget className="w-4 h-4" />
                    <span>Abrir PDF Completo</span>
                  </a>
                </div>

                <div className="text-center">
                  <Image
                    width={100}
                    height={100}
                    src={selectedScore.thumbnailUrl}
                    alt={`Preview de ${selectedScore.title}`}
                    className="max-w-full h-auto rounded-xl border border-theme-secondary shadow-theme-medium"
                  />
                </div>
              </div>
            ) : (
              <div className="classical-card p-12 text-center">
                <FiMusic className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  Nenhuma partitura selecionada
                </h3>
                <p className="text-theme-secondary">
                  Selecione uma partitura na página da obra para visualizá-la
                  aqui.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Evaluation Tab */}
        {activeTab === 'evaluation' && (
          <div className="max-w-2xl mx-auto">
            <PostPracticeEvaluation
              onSubmit={handlePostPracticeSubmit}
              currentSession={currentSession}
            />
          </div>
        )}
      </div>

      {/* Post Practice Modal */}
      {showPostPractice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-theme-elevated rounded-2xl border border-theme-primary p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <PostPracticeEvaluation
              onSubmit={handlePostPracticeSubmit}
              currentSession={currentSession}
              onSkip={async () => {
                const success = await endSession();
                if (success) {
                  toast.success('Sessão salva!');
                  setShowPostPractice(false);
                  onClose();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Avaliação Pós-Prática
const PostPracticeEvaluation: React.FC<{
  onSubmit: (evaluation: any) => void;
  currentSession: any;
  onSkip?: () => void;
}> = ({ onSubmit, currentSession, onSkip }) => {
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  // const [nextGoals, setNextGoals] = useState<string[]>([]);
  // const [technicalFocus, setTechnicalFocus] = useState<string[]>([]);
  // const [expressiveFocus, setExpressiveFocus] = useState<string[]>([]);
  // const [precisionFocus, setPrecisionFocus] = useState<string[]>([]);

  const handleSubmit = () => {
    onSubmit({
      rating,
      notes,
      // nextSessionGoals: nextGoals,
      // technicalFocus,
      // expressiveFocus,
      // precisionFocus,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-theme-primary mb-2">
          Como foi sua sessão de estudo?
        </h2>
        <p className="text-theme-secondary">
          Tempo total: {Math.floor(currentSession.duration / 60)} minutos
        </p>
      </div>

      {/* Rating */}
      <div className="classical-card-simple p-4">
        <label className="block text-sm font-medium text-theme-secondary mb-3">
          Avalie sua sessão (1-5 estrelas)
        </label>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`w-8 h-8 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="classical-card-simple p-4">
        <label className="block text-sm font-medium text-theme-secondary mb-3">
          Reflexões sobre a sessão
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Como você se sentiu? O que funcionou bem? O que pode melhorar?"
          className="w-full h-24 input-classical-2 resize-none"
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onSkip && (
          <button onClick={onSkip} className="btn-classical-secondary">
            Pular Avaliação
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="btn-classical-primary flex items-center space-x-2"
        >
          <FiSave className="w-4 h-4" />
          <span>Salvar e Finalizar</span>
        </button>
      </div>
    </div>
  );
};

export default StudyModeModal;
