import React, { useState, useEffect } from 'react';
import { BiStop } from 'react-icons/bi';
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
  FiMic,
  FiBookOpen,
  FiZoomIn,
  FiZoomOut,
  FiLayers,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiDownload,
  FiStar,
  FiActivity,
} from 'react-icons/fi';
import { GiPianoKeys, GiViolin, GiTrumpet } from 'react-icons/gi';

// Tipos e interfaces
interface StudySession {
  id?: string;
  workId: string;
  workTitle: string;
  composerName: string;
  instrument: string;
  startTime: string;
  duration: number;
  isActive: boolean;
  isPaused: boolean;

  // Configurações
  metronome: {
    bpm: number;
    timeSignature: string;
    isActive: boolean;
    sound: 'click' | 'beep' | 'wood' | 'digital';
    volume: number;
    accentBeats: boolean;
  };

  // Conteúdo da sessão
  studyNotes: string;
  practiceGoals: string[];
  sectionsWorked: Array<{
    name: string;
    startTime: number;
    duration: number;
    difficulty: 'easy' | 'medium' | 'hard';
    quality: number;
  }>;

  // Gravações
  recordings: Array<{
    id: string;
    timestamp: number;
    duration: number;
    section?: string;
    notes?: string;
  }>;

  // Anotações na partitura
  scoreAnnotations: Array<{
    id: string;
    type: 'text' | 'highlight' | 'arrow' | 'circle' | 'drawing';
    x: number;
    y: number;
    content: string;
    color: string;
    instrument?: string;
  }>;

  // Métricas
  pauseCount: number;
  restartCount: number;
  sectionsRepeated: number;
  focusTime: number;

  // Avaliação
  postPractice?: {
    rating: number;
    technicalRating: number;
    expressiveRating: number;
    memoryRating: number;
    notes: string;
    difficultSections: string[];
    nextGoals: string[];
  };
}

interface ScoreAnnotation {
  id: string;
  type:
    | 'text'
    | 'highlight'
    | 'arrow'
    | 'circle'
    | 'fingering'
    | 'bowing'
    | 'breathing'
    | 'pedal';
  x: number;
  y: number;
  content: string;
  color: string;
  instrument?: string;
  layer: string;
}

// Store simulado (em produção seria Zustand)
const useStudyStore = () => {
  const [session, setSession] = useState<StudySession | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  return {
    session,
    setSession,
    isOpen,
    setIsOpen,
    activeTab,
    setActiveTab,
  };
};

// Componente principal
const AdvancedStudyMode: React.FC = () => {
  const { session, setSession, isOpen, setIsOpen, activeTab, setActiveTab } =
    useStudyStore();
  const [isRecording, setIsRecording] = useState(false);
  const [currentScore, setCurrentScore] = useState<string>(
    '/api/placeholder/800/1000'
  );
  const [annotations, setAnnotations] = useState<ScoreAnnotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<
    'text' | 'highlight' | 'fingering' | null
  >(null);
  const [zoom, setZoom] = useState(100);
  const [selectedLayer, setSelectedLayer] = useState('general');

  // Inicializar sessão de exemplo
  useEffect(() => {
    if (!session) {
      setSession({
        workId: '1',
        workTitle: 'Sonata em Dó Maior K. 545',
        composerName: 'Wolfgang Amadeus Mozart',
        instrument: 'piano',
        startTime: new Date().toISOString(),
        duration: 1247, // 20:47
        isActive: true,
        isPaused: false,
        metronome: {
          bpm: 120,
          timeSignature: '4/4',
          isActive: false,
          sound: 'click',
          volume: 0.6,
          accentBeats: true,
        },
        studyNotes:
          'Trabalhando a articulação do primeiro movimento. Foco nas passagens em escalas.',
        practiceGoals: [
          'Memorizar compassos 1-16',
          'Melhora na articulação das escalas',
          'Pedalizações mais precisas',
        ],
        sectionsWorked: [
          {
            name: 'Exposição',
            startTime: 0,
            duration: 300,
            difficulty: 'medium',
            quality: 4,
          },
          {
            name: 'Desenvolvimento',
            startTime: 350,
            duration: 450,
            difficulty: 'hard',
            quality: 3,
          },
          {
            name: 'Escalas mm. 45-52',
            startTime: 900,
            duration: 180,
            difficulty: 'hard',
            quality: 2,
          },
        ],
        recordings: [
          {
            id: '1',
            timestamp: 300,
            duration: 45,
            section: 'Exposição',
            notes: 'Boa interpretação geral',
          },
          {
            id: '2',
            timestamp: 900,
            duration: 30,
            section: 'Escalas',
            notes: 'Precisa trabalhar mais',
          },
        ],
        scoreAnnotations: [],
        pauseCount: 3,
        restartCount: 1,
        sectionsRepeated: 8,
        focusTime: 1180,
      });
    }
  }, [session, setSession]);

  // Componente do Timer Avançado
  const AdvancedTimer = () => {
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return hours > 0
        ? `${hours}:${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`
        : `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const efficiency = session
      ? Math.round((session.focusTime / session.duration) * 100)
      : 0;

    return (
      <div className="space-y-6">
        {/* Timer principal com design glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

          <div className="relative z-10 text-center">
            <div className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              {session ? formatTime(session.duration) : '0:00'}
            </div>

            <div className="flex items-center justify-center space-x-2 mb-6">
              <div
                className={`w-3 h-3 rounded-full ${
                  session?.isActive && !session?.isPaused
                    ? 'bg-green-400 animate-pulse'
                    : 'bg-gray-400'
                }`}
              ></div>
              <span className="text-gray-300 font-medium">
                {session?.isPaused
                  ? 'Pausado'
                  : session?.isActive
                  ? 'Em progresso'
                  : 'Inativo'}
              </span>
            </div>

            {/* Controles principais */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:scale-105">
                {session?.isPaused ? (
                  <FiPlay className="w-6 h-6 ml-1" />
                ) : (
                  <FiPause className="w-6 h-6" />
                )}
              </button>

              <button className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:scale-105">
                <FiRotateCcw className="w-5 h-5" />
              </button>

              <button className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:scale-105">
                <FiSquare className="w-5 h-5" />
              </button>
            </div>

            {/* Métricas em tempo real */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-blue-400">
                  {efficiency}%
                </div>
                <div className="text-xs text-gray-400">Eficiência</div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-400">
                  {session?.sectionsRepeated || 0}
                </div>
                <div className="text-xs text-gray-400">Repetições</div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-emerald-400">
                  {session?.pauseCount || 0}
                </div>
                <div className="text-xs text-gray-400">Pausas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Seções trabalhadas */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FiTarget className="w-5 h-5 text-blue-400" />
            <span>Seções da Sessão</span>
          </h3>

          <div className="space-y-3">
            {session?.sectionsWorked.map((section, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{section.name}</span>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= section.quality
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{formatTime(section.duration)}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      section.difficulty === 'hard'
                        ? 'bg-red-500/20 text-red-400'
                        : section.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {section.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Componente do Metrônomo Avançado
  const AdvancedMetronome = () => {
    const [currentBeat, setCurrentBeat] = useState(1);
    const beatsPerMeasure = parseInt(
      session?.metronome.timeSignature.split('/')[0] || '4'
    );

    return (
      <div className="space-y-6">
        {/* Display principal do metrônomo */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10"></div>

          <div className="relative z-10 text-center">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
              {session?.metronome.bpm || 120}
            </div>
            <div className="text-lg text-gray-300 mb-6">
              BPM • {session?.metronome.timeSignature}
            </div>

            {/* Indicador visual de batida */}
            <div className="flex justify-center space-x-3 mb-8">
              {Array.from({ length: beatsPerMeasure }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    currentBeat === i + 1 && session?.metronome.isActive
                      ? 'bg-emerald-400 scale-125 shadow-lg shadow-emerald-400/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Controle principal */}
            <button
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-6 ${
                session?.metronome.isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
              } shadow-lg hover:scale-105`}
            >
              {session?.metronome.isActive ? (
                <FiVolumeX className="w-8 h-8 text-white" />
              ) : (
                <FiVolume2 className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Controles avançados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ajuste de BPM */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Andamento (BPM)
            </label>
            <div className="flex items-center space-x-3">
              <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                <span className="text-sm font-bold">-10</span>
              </button>
              <input
                type="range"
                min="40"
                max="200"
                value={session?.metronome.bpm || 120}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none slider"
              />
              <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                <span className="text-sm font-bold">+10</span>
              </button>
            </div>
          </div>

          {/* Fórmula de compasso */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Compasso
            </label>
            <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="2/4">2/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>
        </div>

        {/* Presets de andamento */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            Andamentos Comuns
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Largo', bpm: 60 },
              { name: 'Andante', bpm: 80 },
              { name: 'Moderato', bpm: 108 },
              { name: 'Allegro', bpm: 132 },
              { name: 'Vivace', bpm: 156 },
              { name: 'Presto', bpm: 180 },
            ].map((preset) => (
              <button
                key={preset.name}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 transition-colors text-center"
              >
                <div className="text-sm font-medium text-white">
                  {preset.name}
                </div>
                <div className="text-xs text-gray-400">{preset.bpm} BPM</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Componente de anotações na partitura
  const ScoreAnnotations = () => {
    const instrumentTools = {
      piano: [
        {
          id: 'fingering',
          label: 'Dedilhado',
          icon: '1',
          color: 'text-blue-400',
        },
        { id: 'pedal', label: 'Pedal', icon: '𝄇', color: 'text-purple-400' },
        {
          id: 'articulation',
          label: 'Articulação',
          icon: '>',
          color: 'text-green-400',
        },
      ],
      violin: [
        { id: 'bowing', label: 'Arcada', icon: '⌒', color: 'text-orange-400' },
        {
          id: 'position',
          label: 'Posição',
          icon: 'III',
          color: 'text-red-400',
        },
        { id: 'string', label: 'Corda', icon: 'G', color: 'text-yellow-400' },
      ],
      trumpet: [
        {
          id: 'breathing',
          label: 'Respiração',
          icon: 'V',
          color: 'text-cyan-400',
        },
        { id: 'mute', label: 'Surdina', icon: '+', color: 'text-pink-400' },
        { id: 'valve', label: 'Pistão', icon: '1-2', color: 'text-indigo-400' },
      ],
    };

    const currentTools =
      instrumentTools[session?.instrument as keyof typeof instrumentTools] ||
      instrumentTools.piano;

    return (
      <div className="space-y-6">
        {/* Ferramentas de anotação */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FiEdit3 className="w-5 h-5 text-blue-400" />
            <span>Ferramentas de Anotação</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {currentTools.map((tool) => (
              <button
                key={tool.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  selectedTool === tool.id
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
                onClick={() =>
                  setSelectedTool(
                    selectedTool === tool.id ? null : (tool.id as any)
                  )
                }
              >
                <div className={`text-xl mb-1 ${tool.color}`}>{tool.icon}</div>
                <div className="text-xs">{tool.label}</div>
              </button>
            ))}
          </div>

          {/* Layers */}
          <div className="flex items-center space-x-4">
            <FiLayers className="w-5 h-5 text-gray-400" />
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="general">Geral</option>
              <option value="technical">Técnico</option>
              <option value="expression">Expressão</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>

        {/* Visualizador da partitura */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Partitura Interativa
            </h3>
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                <FiZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-400 min-w-[50px] text-center">
                {zoom}%
              </span>
              <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                <FiZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative bg-white rounded-lg p-4 min-h-[400px] overflow-auto">
            <img
              src={currentScore}
              alt="Partitura"
              className="w-full h-auto"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
              }}
            />

            {/* Overlay para anotações */}
            <div className="absolute inset-0 pointer-events-none">
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute pointer-events-auto"
                  style={{ left: annotation.x, top: annotation.y }}
                >
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${annotation.color} bg-black/20 backdrop-blur-sm`}
                  >
                    {annotation.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de gravação
  const RecordingStudio = () => {
    return (
      <div className="space-y-6">
        {/* Controles de gravação */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FiMic className="w-5 h-5 text-red-400" />
            <span>Estúdio de Gravação</span>
          </h3>

          <div className="text-center mb-6">
            <button
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105 ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              }`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? (
                <BiStop className="w-8 h-8 text-white" />
              ) : (
                <FiMic className="w-8 h-8 text-white" />
              )}
            </button>

            <div className="mt-4">
              <div className="text-lg font-medium text-white">
                {isRecording ? 'Gravando...' : 'Pronto para gravar'}
              </div>
              <div className="text-sm text-gray-400">
                {isRecording ? '0:23' : 'Clique para iniciar'}
              </div>
            </div>
          </div>

          {/* Configurações de gravação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seção
              </label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                <option>Obra completa</option>
                <option>Exposição</option>
                <option>Desenvolvimento</option>
                <option>Recapitulação</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Qualidade
              </label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                <option>Alta (48kHz)</option>
                <option>Média (44kHz)</option>
                <option>Baixa (22kHz)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gravações existentes */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">
            Gravações da Sessão
          </h4>

          <div className="space-y-3">
            {session?.recordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-white">
                      {recording.section || 'Gravação'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(
                        recording.timestamp * 1000
                      ).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors flex items-center justify-center text-green-400">
                      <FiPlay className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors flex items-center justify-center text-blue-400">
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {recording.notes && (
                  <div className="text-sm text-gray-300 bg-white/5 rounded p-2 mt-2">
                    {recording.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Dashboard principal
  const Dashboard = () => {
    const todayMinutes = 127;
    const weekMinutes = 423;
    const streak = 5;

    return (
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.floor(session?.duration ?? 0 / 60)}m
                </div>
                <div className="text-xs text-blue-400">Hoje</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{streak}</div>
                <div className="text-xs text-emerald-400">Sequência</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                <FiTarget className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {session?.practiceGoals.length}
                </div>
                <div className="text-xs text-purple-400">Objetivos</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/30 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">4.2</div>
                <div className="text-xs text-orange-400">Média</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progresso da sessão atual */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FiTrendingUp className="w-5 h-5 text-blue-400" />
            <span>Progresso da Sessão</span>
          </h3>

          <div className="space-y-4">
            {session?.practiceGoals.map((goal, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <FiCheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-white">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metas e conquistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">
              Meta Diária
            </h4>
            <div className="relative">
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((todayMinutes / 60) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{todayMinutes} min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">
              Conquistas Recentes
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  🎵
                </div>
                <span className="text-sm text-white">5 dias seguidos!</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  🎯
                </div>
                <span className="text-sm text-white">
                  10 objetivos concluídos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              {session?.instrument === 'piano' && (
                <GiPianoKeys className="w-6 h-6 text-white" />
              )}
              {session?.instrument === 'violin' && (
                <GiViolin className="w-6 h-6 text-white" />
              )}
              {session?.instrument === 'trumpet' && (
                <GiTrumpet className="w-6 h-6 text-white" />
              )}
              {!['piano', 'violin', 'trumpet'].includes(
                session?.instrument || ''
              ) && <FiMusic className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Modo Estudo Avançado
              </h1>
              <p className="text-sm text-gray-300">
                {session?.workTitle} - {session?.composerName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex items-center space-x-2">
              <FiClock className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-mono font-bold text-white">
                {session ? Math.floor(session.duration / 60) : 0}:
                {session
                  ? (session.duration % 60).toString().padStart(2, '0')
                  : '00'}
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-4 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FiActivity },
            { id: 'timer', label: 'Timer', icon: FiClock },
            { id: 'metronome', label: 'Metrônomo', icon: FiMusic },
            { id: 'score', label: 'Partitura', icon: FiBookOpen },
            { id: 'recording', label: 'Gravação', icon: FiMic },
            { id: 'analysis', label: 'Análise', icon: FiBarChart2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
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
      <div className="flex-1 overflow-auto p-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'timer' && <AdvancedTimer />}
          {activeTab === 'metronome' && <AdvancedMetronome />}
          {activeTab === 'score' && <ScoreAnnotations />}
          {activeTab === 'recording' && <RecordingStudio />}
          {activeTab === 'analysis' && (
            <div className="text-center py-20">
              <FiBarChart2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Análise de Progresso
              </h3>
              <p className="text-gray-400">
                Gráficos e métricas detalhadas sobre seu desenvolvimento
                musical.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center text-white shadow-lg">
          <FiSave className="w-6 h-6" />
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AdvancedStudyMode;
