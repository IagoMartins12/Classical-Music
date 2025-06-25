import React, { useState, useEffect } from 'react';
import {
  FiMusic,
  FiSettings,
  FiTarget,
  FiEdit3,
  FiLayers,
  FiRotateCcw,
  FiZoomIn,
  FiZoomOut,
  FiSave,
  FiEye,
  FiVolume2,
  FiMic,
  FiActivity,
  FiTrendingUp,
  FiBookOpen,
  FiPlay,
  FiPause,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  GiPianoKeys,
  GiViolin,
  GiTrumpet,
  GiDrumKit,
  GiGuitar,
  GiMusicalScore,
  GiMetronome,
} from 'react-icons/gi';

interface InstrumentTool {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'technique' | 'expression' | 'notation' | 'performance';
  description: string;
  shortcut?: string;
}

interface InstrumentExercise {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  bpm?: number;
  instructions: string[];
  benefits: string[];
}

interface InstrumentConfig {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  tools: InstrumentTool[];
  exercises: InstrumentExercise[];
  techniques: string[];
  commonIssues: string[];
  practiceRoutines: {
    warmup: string[];
    technical: string[];
    repertoire: string[];
    cooldown: string[];
  };
}

const InstrumentSpecificTools: React.FC<{ instrument: string }> = ({
  instrument,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'tools' | 'exercises' | 'techniques' | 'routine'
  >('tools');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] =
    useState<InstrumentExercise | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);

  // Configurações específicas por instrumento
  const instrumentConfigs: Record<string, InstrumentConfig> = {
    piano: {
      name: 'Piano',
      icon: GiPianoKeys,
      color: 'blue',
      tools: [
        {
          id: 'fingering',
          name: 'Dedilhado',
          icon: '1️⃣',
          color: 'text-blue-400',
          category: 'technique',
          description: 'Marcar digitações nas partituras',
          shortcut: 'F',
        },
        {
          id: 'pedal',
          name: 'Pedal',
          icon: '🦶',
          color: 'text-purple-400',
          category: 'technique',
          description: 'Marcações de pedal sustain e una corda',
          shortcut: 'P',
        },
        {
          id: 'articulation',
          name: 'Articulação',
          icon: '>',
          color: 'text-green-400',
          category: 'expression',
          description: 'Staccato, legato, tenuto e acentos',
          shortcut: 'A',
        },
        {
          id: 'dynamics',
          name: 'Dinâmica',
          icon: 'f',
          color: 'text-yellow-400',
          category: 'expression',
          description: 'Forte, piano, crescendo, diminuendo',
          shortcut: 'D',
        },
        {
          id: 'phrasing',
          name: 'Fraseado',
          icon: '⌒',
          color: 'text-pink-400',
          category: 'expression',
          description: 'Marcações de frases musicais',
          shortcut: 'H',
        },
        {
          id: 'tempo',
          name: 'Agógica',
          icon: '≈',
          color: 'text-indigo-400',
          category: 'performance',
          description: 'Rallentando, accelerando, rubato',
          shortcut: 'T',
        },
      ],
      exercises: [
        {
          id: 'scales',
          name: 'Escalas Maiores',
          description: 'Escalas maiores em todas as tonalidades',
          difficulty: 'beginner',
          duration: 15,
          bpm: 60,
          instructions: [
            'Comece lentamente em Dó maior',
            'Use dedilhado correto: RH 1-2-3-1-2-3-4-5',
            'Mantenha pulsos regulares',
            'Aumente gradualmente o tempo',
          ],
          benefits: [
            'Melhora técnica de dedos',
            'Desenvolve familiaridade com tonalidades',
            'Fortalece memória muscular',
          ],
        },
        {
          id: 'arpeggios',
          name: 'Arpejos Básicos',
          description: 'Arpejos de tríades maiores e menores',
          difficulty: 'intermediate',
          duration: 10,
          bpm: 80,
          instructions: [
            'Posição da mão em formato de arco',
            'Movimento fluido do pulso',
            'Dedilhado: 1-2-4-5 para acordes básicos',
            'Praticar com diferentes dinâmicas',
          ],
          benefits: [
            'Desenvolve coordenação',
            'Melhora sonoridade',
            'Fortalece músculos da mão',
          ],
        },
        {
          id: 'hanon',
          name: 'Exercícios de Hanon',
          description: 'Exercícios técnicos para independência dos dedos',
          difficulty: 'intermediate',
          duration: 20,
          bpm: 72,
          instructions: [
            'Manter posição firme da mão',
            'Dedos curvos e ativos',
            'Tocar com igualdade de som',
            'Variar articulações',
          ],
          benefits: [
            'Independência dos dedos',
            'Força e resistência',
            'Precisão técnica',
          ],
        },
      ],
      techniques: [
        'Postura correta',
        'Relaxamento muscular',
        'Uso do peso do braço',
        'Controle de dinâmica',
        'Pedalização',
        'Articulação',
        'Fraseado musical',
      ],
      commonIssues: [
        'Tensão nos ombros',
        'Dedos planos',
        'Pedal excessivo',
        'Falta de independência dos dedos',
        'Tempo irregular',
        'Dinâmica monótona',
      ],
      practiceRoutines: {
        warmup: [
          'Alongamento dos braços e punhos',
          'Escalas cromáticas lentas',
          'Exercícios de Hanon simples',
          'Acordes suspensos',
        ],
        technical: [
          'Escalas em todas as tonalidades',
          'Arpejos de 7ª',
          'Exercícios de independência',
          'Estudos de Czerny',
        ],
        repertoire: [
          'Leitura à primeira vista',
          'Peças em estudo',
          'Revisão de repertório antigo',
          'Memorização',
        ],
        cooldown: [
          'Peças líricas lentas',
          'Improvisação livre',
          'Alongamento final',
        ],
      },
    },
    violin: {
      name: 'Violino',
      icon: GiViolin,
      color: 'orange',
      tools: [
        {
          id: 'bowing',
          name: 'Arcada',
          icon: '🏹',
          color: 'text-orange-400',
          category: 'technique',
          description: 'Direção e tipos de arcada',
          shortcut: 'B',
        },
        {
          id: 'fingering',
          name: 'Digitação',
          icon: '1️⃣',
          color: 'text-blue-400',
          category: 'technique',
          description: 'Posições e dedilhados',
          shortcut: 'F',
        },
        {
          id: 'position',
          name: 'Posição',
          icon: 'III',
          color: 'text-red-400',
          category: 'technique',
          description: 'Marcações de posições no braço',
          shortcut: 'Shift+P',
        },
        {
          id: 'string',
          name: 'Corda',
          icon: 'G',
          color: 'text-yellow-400',
          category: 'notation',
          description: 'Indicação de corda (G, D, A, E)',
          shortcut: 'S',
        },
        {
          id: 'vibrato',
          name: 'Vibrato',
          icon: '〰️',
          color: 'text-purple-400',
          category: 'expression',
          description: 'Marcações de vibrato',
          shortcut: 'V',
        },
        {
          id: 'dynamics',
          name: 'Dinâmica',
          icon: 'f',
          color: 'text-green-400',
          category: 'expression',
          description: 'Intensidades e nuances',
          shortcut: 'D',
        },
      ],
      exercises: [
        {
          id: 'open_strings',
          name: 'Cordas Soltas',
          description: 'Exercício básico de arco em cordas soltas',
          difficulty: 'beginner',
          duration: 10,
          bpm: 60,
          instructions: [
            'Posicione o arco perpendicular às cordas',
            'Use todo o arco de forma uniforme',
            'Mantenha pressão constante',
            'Pratique cada corda separadamente',
          ],
          benefits: [
            'Desenvolve controle do arco',
            'Melhora qualidade sonora',
            'Fortalece técnica básica',
          ],
        },
        {
          id: 'scales_1st_pos',
          name: 'Escalas 1ª Posição',
          description: 'Escalas básicas na primeira posição',
          difficulty: 'beginner',
          duration: 15,
          bpm: 72,
          instructions: [
            'Comece com escala de Ré maior',
            'Mantenha dedos curvos',
            'Coordene arco e mão esquerda',
            'Toque notas separadas primeiro',
          ],
          benefits: [
            'Afinação',
            'Coordenação bimanual',
            'Familiaridade com tonalidades',
          ],
        },
        {
          id: 'bow_exercises',
          name: 'Exercícios de Arco',
          description: 'Diferentes golpes de arco',
          difficulty: 'intermediate',
          duration: 20,
          bpm: 80,
          instructions: [
            'Pratique détaché, legato, staccato',
            'Varie dinâmicas',
            'Use diferentes partes do arco',
            'Mantenha som uniforme',
          ],
          benefits: [
            'Variedade de articulações',
            'Controle fino do arco',
            'Expressividade musical',
          ],
        },
      ],
      techniques: [
        'Postura e posição',
        'Pegada do arco',
        'Afinação',
        'Mudanças de posição',
        'Vibrato',
        'Golpes de arco',
        'Cordas duplas',
      ],
      commonIssues: [
        'Tensão no ombro',
        'Arco torto',
        'Afinação imprecisa',
        'Vibrato irregular',
        'Mudanças bruscas de posição',
        'Som arranhado',
      ],
      practiceRoutines: {
        warmup: [
          'Alongamento de braços e pescoço',
          'Cordas soltas com arco',
          'Exercícios de afinação',
          'Escalas lentas',
        ],
        technical: [
          'Escalas e arpejos',
          'Estudos de arco',
          'Exercícios de vibrato',
          'Mudanças de posição',
        ],
        repertoire: [
          'Peças técnicas',
          'Repertório em estudo',
          'Música de câmara',
          'Concertos',
        ],
        cooldown: ['Peças líricas', 'Improvisação', 'Relaxamento'],
      },
    },
    trumpet: {
      name: 'Trompete',
      icon: GiTrumpet,
      color: 'yellow',
      tools: [
        {
          id: 'breathing',
          name: 'Respiração',
          icon: '💨',
          color: 'text-cyan-400',
          category: 'technique',
          description: 'Marcações de respiração',
          shortcut: 'R',
        },
        {
          id: 'fingering',
          name: 'Pistões',
          icon: '1-2',
          color: 'text-blue-400',
          category: 'technique',
          description: 'Combinações de pistões',
          shortcut: 'P',
        },
        {
          id: 'articulation',
          name: 'Articulação',
          icon: 'Tu',
          color: 'text-green-400',
          category: 'technique',
          description: 'Tipos de ataque (tu, ku, du)',
          shortcut: 'A',
        },
        {
          id: 'mute',
          name: 'Surdina',
          icon: '🔇',
          color: 'text-pink-400',
          category: 'notation',
          description: 'Marcações de surdina',
          shortcut: 'M',
        },
        {
          id: 'lip_trill',
          name: 'Lip Trill',
          icon: 'tr',
          color: 'text-purple-400',
          category: 'technique',
          description: 'Trilos labiais',
          shortcut: 'L',
        },
        {
          id: 'dynamics',
          name: 'Dinâmica',
          icon: 'ff',
          color: 'text-yellow-400',
          category: 'expression',
          description: 'Intensidades específicas para metais',
          shortcut: 'D',
        },
      ],
      exercises: [
        {
          id: 'long_tones',
          name: 'Sons Longos',
          description: 'Exercício fundamental de sustentação',
          difficulty: 'beginner',
          duration: 10,
          bpm: 60,
          instructions: [
            'Respire profundamente',
            'Ataque suave e limpo',
            'Mantenha som estável',
            'Termine com diminuendo',
          ],
          benefits: [
            'Desenvolve embocadura',
            'Melhora resistência',
            'Controle de afinação',
          ],
        },
        {
          id: 'lip_slurs',
          name: 'Ligados Labiais',
          description: 'Exercícios de flexibilidade labial',
          difficulty: 'intermediate',
          duration: 15,
          bpm: 72,
          instructions: [
            'Use apenas músculos labiais',
            'Não mude pistões',
            'Mantenha fluxo de ar constante',
            'Comece em registro médio',
          ],
          benefits: [
            'Flexibilidade labial',
            'Controle de registro',
            'Suavidade entre notas',
          ],
        },
        {
          id: 'scales_arpeggios',
          name: 'Escalas e Arpejos',
          description: 'Técnica básica com diferentes articulações',
          difficulty: 'intermediate',
          duration: 20,
          bpm: 100,
          instructions: [
            'Comece legato, depois staccato',
            'Use digitações padrão',
            'Mantenha tempo regular',
            'Varie dinâmicas',
          ],
          benefits: [
            'Técnica de dedos',
            'Familiaridade com tonalidades',
            'Coordenação',
          ],
        },
      ],
      techniques: [
        'Respiração diafragmática',
        'Embocadura',
        'Ataque e articulação',
        'Flexibilidade labial',
        'Resistência',
        'Registro agudo',
        'Uso de surdinas',
      ],
      commonIssues: [
        'Tensão na embocadura',
        'Respiração inadequada',
        'Ataque duro',
        'Afinação instável',
        'Fadiga prematura',
        'Registro limitado',
      ],
      practiceRoutines: {
        warmup: [
          'Exercícios respiratórios',
          'Sons longos suaves',
          'Ligados simples',
          'Escalas lentas',
        ],
        technical: [
          'Ligados labiais',
          'Escalas rápidas',
          'Estudos de articulação',
          'Exercícios de registro',
        ],
        repertoire: [
          'Estudos melódicos',
          'Peças solo',
          'Partes orquestrais',
          'Jazz/improvização',
        ],
        cooldown: [
          'Sons longos piano',
          'Melodias simples',
          'Relaxamento labial',
        ],
      },
    },
  };

  const currentInstrument =
    instrumentConfigs[instrument] || instrumentConfigs.piano;
  const Icon = currentInstrument.icon;

  // Timer para exercícios
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExerciseActive) {
      interval = setInterval(() => {
        setExerciseTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExerciseActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExercise = (exercise: InstrumentExercise) => {
    setSelectedExercise(exercise);
    setExerciseTimer(0);
    setIsExerciseActive(true);
  };

  const stopExercise = () => {
    setIsExerciseActive(false);
    setExerciseTimer(0);
    setSelectedExercise(null);
  };

  // Componente de ferramenta
  const ToolButton: React.FC<{ tool: InstrumentTool }> = ({ tool }) => (
    <button
      onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
      className={`p-4 rounded-xl border transition-all duration-300 text-left ${
        selectedTool === tool.id
          ? 'bg-white/20 border-white/40 text-white scale-105'
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-2xl">{tool.icon}</span>
        <div className="flex-1">
          <h3 className="font-medium">{tool.name}</h3>
          {tool.shortcut && (
            <span className="text-xs opacity-75">Atalho: {tool.shortcut}</span>
          )}
        </div>
      </div>
      <p className="text-sm opacity-75">{tool.description}</p>
    </button>
  );

  // Componente de exercício
  const ExerciseCard: React.FC<{ exercise: InstrumentExercise }> = ({
    exercise,
  }) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-white mb-1">{exercise.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{exercise.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span
              className={`px-2 py-1 rounded ${
                exercise.difficulty === 'beginner'
                  ? 'bg-green-500/20 text-green-400'
                  : exercise.difficulty === 'intermediate'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {exercise.difficulty}
            </span>
            <span>⏱️ {exercise.duration}min</span>
            {exercise.bpm && <span>🎵 {exercise.bpm} BPM</span>}
          </div>
        </div>
        <button
          onClick={() =>
            selectedExercise?.id === exercise.id
              ? stopExercise()
              : startExercise(exercise)
          }
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedExercise?.id === exercise.id && isExerciseActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {selectedExercise?.id === exercise.id && isExerciseActive
            ? 'Parar'
            : 'Iniciar'}
        </button>
      </div>

      {selectedExercise?.id === exercise.id && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white">Em progresso</h4>
            <div className="text-xl font-mono font-bold text-blue-400">
              {formatTime(exerciseTimer)}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">
                Instruções:
              </h5>
              <ul className="space-y-1">
                {exercise.instructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-400 flex items-start space-x-2"
                  >
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">
                Benefícios:
              </h5>
              <div className="flex flex-wrap gap-1">
                {exercise.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header do instrumento */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 bg-gradient-to-br from-${currentInstrument.color}-500 to-${currentInstrument.color}-600 rounded-xl flex items-center justify-center`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {currentInstrument.name}
            </h2>
            <p className="text-gray-400">
              Ferramentas e exercícios especializados
            </p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { id: 'tools', label: 'Ferramentas', icon: FiEdit3 },
          { id: 'exercises', label: 'Exercícios', icon: FiTarget },
          { id: 'techniques', label: 'Técnicas', icon: FiSettings },
          { id: 'routine', label: 'Rotina', icon: FiActivity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo baseado na categoria ativa */}
      {activeCategory === 'tools' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Ferramentas de Anotação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentInstrument.tools.map((tool) => (
              <ToolButton key={tool.id} tool={tool} />
            ))}
          </div>

          {selectedTool && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">
                Ferramenta Ativa
              </h4>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {
                    currentInstrument.tools.find((t) => t.id === selectedTool)
                      ?.icon
                  }
                </span>
                <div>
                  <h5 className="font-medium text-white">
                    {
                      currentInstrument.tools.find((t) => t.id === selectedTool)
                        ?.name
                    }
                  </h5>
                  <p className="text-sm text-gray-400">
                    Clique na partitura para adicionar anotações
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCategory === 'exercises' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Exercícios Recomendados
          </h3>
          <div className="space-y-4">
            {currentInstrument.exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </div>
      )}

      {activeCategory === 'techniques' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Técnicas Fundamentais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentInstrument.techniques.map((technique, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-white font-medium">{technique}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Problemas Comuns
            </h3>
            <div className="space-y-3">
              {currentInstrument.commonIssues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">{issue}</span>
                      <p className="text-sm text-gray-400 mt-1">
                        Fique atento a este aspecto durante a prática
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeCategory === 'routine' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">
            Rotina de Prática Sugerida
          </h3>

          {Object.entries(currentInstrument.practiceRoutines).map(
            ([phase, activities]) => {
              const phaseIcons = {
                warmup: '🔥',
                technical: '⚙️',
                repertoire: '🎼',
                cooldown: '❄️',
              };

              const phaseLabels = {
                warmup: 'Aquecimento',
                technical: 'Técnica',
                repertoire: 'Repertório',
                cooldown: 'Relaxamento',
              };

              return (
                <div
                  key={phase}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">
                      {phaseIcons[phase as keyof typeof phaseIcons]}
                    </span>
                    <h4 className="text-lg font-semibold text-white">
                      {phaseLabels[phase as keyof typeof phaseLabels]}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activities.map((activity, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-400 text-xs font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-white text-sm">{activity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default InstrumentSpecificTools;
