import React, { useState, useEffect } from 'react';
import { BiBrain } from 'react-icons/bi';
import {
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiActivity,
  FiClock,
  FiPieChart,
  FiCalendar,
  FiHeart,
  FiZap,
  FiEye,
  FiMusic,
  FiStar,
  FiTrendingDown,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiRefreshCw,
  FiDownload,
  FiShare2,
  FiSettings,
  FiFilter,
  FiMaximize2,
  FiX,
} from 'react-icons/fi';
import { GiPianoKeys, GiViolin, GiTrumpet } from 'react-icons/gi';

interface StudyMetrics {
  totalMinutes: number;
  totalSessions: number;
  averageSessionDuration: number;
  focusEfficiency: number;
  practiceStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  improvement: {
    technical: number;
    musical: number;
    memory: number;
    confidence: number;
  };
  instruments: {
    name: string;
    minutes: number;
    sessions: number;
    improvement: number;
  }[];
  sections: {
    name: string;
    timeSpent: number;
    difficulty: number;
    mastery: number;
    lastPracticed: string;
  }[];
  weeklyData: {
    day: string;
    minutes: number;
    sessions: number;
    quality: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    progress?: number;
  }[];
}

interface AIInsight {
  type: 'suggestion' | 'warning' | 'achievement' | 'improvement';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'technical' | 'musical' | 'practice' | 'motivation';
}

const StudyAnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('week');
  const [selectedMetric, setSelectedMetric] = useState<
    'time' | 'quality' | 'efficiency'
  >('time');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Dados simulados (em produção viriam da API)
  const [metrics] = useState<StudyMetrics>({
    totalMinutes: 2847,
    totalSessions: 42,
    averageSessionDuration: 68,
    focusEfficiency: 87,
    practiceStreak: 12,
    weeklyGoal: 300,
    weeklyProgress: 264,
    improvement: {
      technical: 23,
      musical: 18,
      memory: 31,
      confidence: 15,
    },
    instruments: [
      { name: 'Piano', minutes: 1980, sessions: 28, improvement: 22 },
      { name: 'Violino', minutes: 867, sessions: 14, improvement: 18 },
    ],
    sections: [
      {
        name: 'Sonata K.545 - Mov. I',
        timeSpent: 420,
        difficulty: 7,
        mastery: 78,
        lastPracticed: '2024-06-23',
      },
      {
        name: 'Escalas Cromáticas',
        timeSpent: 285,
        difficulty: 5,
        mastery: 92,
        lastPracticed: '2024-06-24',
      },
      {
        name: 'Bach Invenção No. 1',
        timeSpent: 195,
        difficulty: 6,
        mastery: 65,
        lastPracticed: '2024-06-22',
      },
    ],
    weeklyData: [
      { day: 'Seg', minutes: 45, sessions: 1, quality: 8.2 },
      { day: 'Ter', minutes: 72, sessions: 2, quality: 7.8 },
      { day: 'Qua', minutes: 38, sessions: 1, quality: 8.5 },
      { day: 'Qui', minutes: 61, sessions: 2, quality: 8.0 },
      { day: 'Sex', minutes: 48, sessions: 1, quality: 7.5 },
      { day: 'Sáb', minutes: 0, sessions: 0, quality: 0 },
      { day: 'Dom', minutes: 0, sessions: 0, quality: 0 },
    ],
    achievements: [
      {
        id: '1',
        title: 'Primeiro Estudo',
        description: 'Complete sua primeira sessão',
        icon: '🎵',
        earned: true,
      },
      {
        id: '2',
        title: 'Sequência de 7 dias',
        description: 'Pratique por 7 dias seguidos',
        icon: '🔥',
        earned: true,
      },
      {
        id: '3',
        title: 'Maratonista',
        description: 'Complete 100 horas de prática',
        icon: '🏃‍♂️',
        earned: false,
        progress: 68,
      },
      {
        id: '4',
        title: 'Perfeccionista',
        description: 'Obtenha nota 9+ em 5 sessões',
        icon: '⭐',
        earned: false,
        progress: 60,
      },
    ],
  });

  const [aiInsights] = useState<AIInsight[]>([
    {
      type: 'suggestion',
      title: 'Foque na consistência de tempo',
      description:
        'Suas sessões têm duração muito variável. Tente manter 45-60 minutos para melhor foco.',
      actionable: true,
      priority: 'medium',
      category: 'practice',
    },
    {
      type: 'improvement',
      title: 'Progresso técnico excelente!',
      description:
        'Sua técnica melhorou 23% este mês. Continue trabalhando escalas diariamente.',
      actionable: false,
      priority: 'low',
      category: 'technical',
    },
    {
      type: 'warning',
      title: 'Atenção ao equilíbrio',
      description:
        'Você está praticando muito mais piano que violino. Considere equilibrar os instrumentos.',
      actionable: true,
      priority: 'high',
      category: 'practice',
    },
    {
      type: 'achievement',
      title: 'Meta semanal quase atingida!',
      description:
        'Faltam apenas 36 minutos para completar sua meta de 300 minutos esta semana.',
      actionable: true,
      priority: 'medium',
      category: 'motivation',
    },
  ]);

  // Componente de gráfico de barras
  const BarChart: React.FC<{
    data: typeof metrics.weeklyData;
    metric: keyof (typeof metrics.weeklyData)[0];
  }> = ({ data, metric }) => {
    const maxValue = Math.max(...data.map((d) => d[metric] as number));

    return (
      <div className="flex items-end justify-between h-32 px-2">
        {data.map((item, index) => {
          const value = item[metric] as number;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 flex-1"
            >
              <div
                className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-400 hover:to-blue-300"
                style={{ height: `${height}%` }}
              />
              <div className="text-xs text-gray-400">{item.day}</div>
              <div className="text-xs text-white font-medium">{value}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // Componente de gráfico circular
  const CircularProgress: React.FC<{
    value: number;
    max: number;
    label: string;
    color?: string;
  }> = ({ value, max, label, color = 'blue' }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
      blue: 'stroke-blue-400',
      green: 'stroke-green-400',
      purple: 'stroke-purple-400',
      orange: 'stroke-orange-400',
    };

    return (
      <div className="relative w-24 h-24">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            className={colorClasses[color as keyof typeof colorClasses]}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-white">
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-gray-400 text-center">{label}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Análise de Progresso
          </h2>
          <p className="text-gray-400">
            Insights detalhados sobre seu desenvolvimento musical
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="year">Este ano</option>
          </select>

          <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white transition-colors">
            <FiDownload className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Cartões de métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <FiClock className="w-6 h-6 text-blue-400" />
            <div className="flex items-center space-x-1 text-green-400">
              <FiArrowUp className="w-3 h-3" />
              <span className="text-xs">+12%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {Math.floor(metrics.totalMinutes / 60)}h
          </div>
          <div className="text-xs text-blue-400">Total praticado</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <FiTarget className="w-6 h-6 text-green-400" />
            <div className="flex items-center space-x-1 text-green-400">
              <FiArrowUp className="w-3 h-3" />
              <span className="text-xs">+8%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.focusEfficiency}%
          </div>
          <div className="text-xs text-green-400">Eficiência</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <FiActivity className="w-6 h-6 text-purple-400" />
            <div className="flex items-center space-x-1 text-green-400">
              <FiArrowUp className="w-3 h-3" />
              <span className="text-xs">+2</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.practiceStreak}
          </div>
          <div className="text-xs text-purple-400">Dias seguidos</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <FiStar className="w-6 h-6 text-orange-400" />
            <div className="flex items-center space-x-1 text-green-400">
              <FiArrowUp className="w-3 h-3" />
              <span className="text-xs">+0.3</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">8.1</div>
          <div className="text-xs text-orange-400">Média de qualidade</div>
        </div>
      </div>

      {/* AI Insights */}
      {showAIInsights && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <BiBrain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Insights de IA
                </h3>
                <p className="text-sm text-gray-400">
                  Análise inteligente do seu progresso
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => {
              const typeIcons = {
                suggestion: FiZap,
                warning: FiAlertCircle,
                achievement: FiAward,
                improvement: FiTrendingUp,
              };
              const typeColors = {
                suggestion: 'text-yellow-400 bg-yellow-500/20',
                warning: 'text-red-400 bg-red-500/20',
                achievement: 'text-green-400 bg-green-500/20',
                improvement: 'text-blue-400 bg-blue-500/20',
              };

              const Icon = typeIcons[insight.type];

              return (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        typeColors[insight.type]
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-300 mb-2">
                        {insight.description}
                      </p>
                      {insight.actionable && (
                        <button className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded px-2 py-1 text-white transition-colors">
                          Aplicar sugestão
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso semanal */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Progresso Semanal
            </h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
              >
                <option value="time">Tempo</option>
                <option value="quality">Qualidade</option>
                <option value="sessions">Sessões</option>
              </select>
              <button
                onClick={() =>
                  setExpandedChart(expandedChart === 'weekly' ? null : 'weekly')
                }
                className="text-gray-400 hover:text-white"
              >
                <FiMaximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <BarChart
            data={metrics.weeklyData}
            metric={
              selectedMetric === 'time'
                ? 'minutes'
                : selectedMetric === 'quality'
                ? 'quality'
                : 'sessions'
            }
          />
        </div>

        {/* Meta semanal */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Meta Semanal
          </h3>

          <div className="flex items-center justify-center mb-6">
            <CircularProgress
              value={metrics.weeklyProgress}
              max={metrics.weeklyGoal}
              label="Progresso"
              color="blue"
            />
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">
              {metrics.weeklyProgress} / {metrics.weeklyGoal} min
            </div>
            <div className="text-sm text-gray-400">
              Faltam {metrics.weeklyGoal - metrics.weeklyProgress} minutos
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (metrics.weeklyProgress / metrics.weeklyGoal) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Análise por instrumento */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Progresso por Instrumento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.instruments.map((instrument, index) => {
            const Icon =
              instrument.name === 'Piano'
                ? GiPianoKeys
                : instrument.name === 'Violino'
                ? GiViolin
                : GiTrumpet;

            return (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {instrument.name}
                    </h4>
                    <div className="text-sm text-gray-400">
                      {Math.floor(instrument.minutes / 60)}h{' '}
                      {instrument.minutes % 60}m • {instrument.sessions} sessões
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-green-400">
                      <FiArrowUp className="w-3 h-3" />
                      <span className="text-sm font-medium">
                        +{instrument.improvement}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tempo médio/sessão</span>
                    <span className="text-white">
                      {Math.round(instrument.minutes / instrument.sessions)}min
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Melhoria técnica</span>
                    <span className="text-white">
                      +{instrument.improvement}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seções mais praticadas */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Repertório em Foco
        </h3>

        <div className="space-y-4">
          {metrics.sections.map((section, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">
                    {section.name}
                  </h4>
                  <div className="text-sm text-gray-400">
                    {Math.floor(section.timeSpent / 60)}h{' '}
                    {section.timeSpent % 60}m • Última prática:{' '}
                    {new Date(section.lastPracticed).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {section.mastery}%
                  </div>
                  <div className="text-xs text-gray-400">Domínio</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white">{section.mastery}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${section.mastery}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-white">
                    {section.difficulty}/10
                  </div>
                  <div className="text-xs text-gray-400">Dificuldade</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conquistas */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Conquistas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-lg p-4 border transition-all duration-300 ${
                achievement.earned
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`text-2xl ${
                    achievement.earned ? '' : 'grayscale opacity-50'
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      achievement.earned ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <FiCheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>

              {!achievement.earned && achievement.progress && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white">{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Análise de melhoria por área */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Melhoria por Área
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.improvement).map(([area, improvement]) => {
            const areaIcons = {
              technical: FiSettings,
              musical: FiHeart,
              memory: BiBrain,
              confidence: FiZap,
            };

            const areaLabels = {
              technical: 'Técnica',
              musical: 'Musical',
              memory: 'Memória',
              confidence: 'Confiança',
            };

            const Icon = areaIcons[area as keyof typeof areaIcons];

            return (
              <div key={area} className="text-center">
                <CircularProgress
                  value={improvement}
                  max={50}
                  label={areaLabels[area as keyof typeof areaLabels]}
                  color={
                    ['blue', 'green', 'purple', 'orange'][
                      Object.keys(metrics.improvement).indexOf(area)
                    ] as any
                  }
                />
                <div className="mt-2 text-sm text-gray-400">
                  +{improvement}% este mês
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyAnalyticsDashboard;
