import React, { useState, useRef } from 'react';
import { BiBrain } from 'react-icons/bi';
import {
  FiFileText,
  FiDownload,
  FiShare2,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiClock,
  FiTarget,
  FiSettings,
  FiRefreshCw,
  FiEye,
  FiEdit3,
  FiChevronDown,
  FiChevronRight,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiZap,
} from 'react-icons/fi';
import { GiPianoKeys, GiViolin, GiTrumpet } from 'react-icons/gi';

interface ReportData {
  period: {
    start: string;
    end: string;
    totalDays: number;
  };
  practice: {
    totalMinutes: number;
    totalSessions: number;
    averageSessionDuration: number;
    longestSession: number;
    shortestSession: number;
    consistency: number;
    streak: number;
    goalCompletion: number;
  };
  instruments: {
    name: string;
    minutes: number;
    sessions: number;
    improvement: number;
    proficiency: number;
    focusAreas: string[];
  }[];
  repertoire: {
    piecesStudied: number;
    piecesCompleted: number;
    averageDifficulty: number;
    genres: string[];
    composers: string[];
    totalPieces: number;
  };
  technical: {
    scalesImprovement: number;
    rhythmAccuracy: number;
    intonationAccuracy: number;
    dynamicControl: number;
    articulationClarity: number;
    memoryRetention: number;
  };
  analytics: {
    bestPracticeTime: string;
    mostProductiveDays: string[];
    commonMistakes: string[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  goals: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    categoryBreakdown: Record<string, number>;
  };
}

interface ReportConfig {
  type: 'summary' | 'detailed' | 'technical' | 'progress' | 'custom';
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  includeSections: {
    overview: boolean;
    practice: boolean;
    instruments: boolean;
    repertoire: boolean;
    technical: boolean;
    goals: boolean;
    analytics: boolean;
    recommendations: boolean;
  };
  format: 'pdf' | 'html' | 'excel' | 'json';
  style: 'professional' | 'detailed' | 'visual' | 'minimal';
}

const AdvancedReportsSystem: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('summary');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'summary',
    period: 'month',
    includeSections: {
      overview: true,
      practice: true,
      instruments: true,
      repertoire: true,
      technical: true,
      goals: true,
      analytics: true,
      recommendations: true,
    },
    format: 'pdf',
    style: 'professional',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);


  // Dados simulados
  const [reportData] = useState<ReportData>({
    period: {
      start: '2024-05-24',
      end: '2024-06-24',
      totalDays: 31,
    },
    practice: {
      totalMinutes: 1840,
      totalSessions: 28,
      averageSessionDuration: 66,
      longestSession: 95,
      shortestSession: 25,
      consistency: 87,
      streak: 12,
      goalCompletion: 78,
    },
    instruments: [
      {
        name: 'Piano',
        minutes: 1280,
        sessions: 18,
        improvement: 23,
        proficiency: 78,
        focusAreas: ['Escalas', 'Arpejos', 'Sonatas'],
      },
      {
        name: 'Violino',
        minutes: 560,
        sessions: 10,
        improvement: 18,
        proficiency: 65,
        focusAreas: ['Vibrato', 'Mudanças de posição', 'Afinação'],
      },
    ],
    repertoire: {
      piecesStudied: 8,
      piecesCompleted: 3,
      averageDifficulty: 6.5,
      genres: ['Clássico', 'Romântico', 'Contemporâneo'],
      composers: ['Mozart', 'Chopin', 'Bach', 'Debussy'],
      totalPieces: 45,
    },
    technical: {
      scalesImprovement: 25,
      rhythmAccuracy: 82,
      intonationAccuracy: 78,
      dynamicControl: 71,
      articulationClarity: 85,
      memoryRetention: 76,
    },
    analytics: {
      bestPracticeTime: '19:00-20:00',
      mostProductiveDays: ['Terça', 'Quinta', 'Sábado'],
      commonMistakes: [
        'Tempo irregular',
        'Dedilhado inconsistente',
        'Falta de dinâmica',
      ],
      strengths: ['Leitura à primeira vista', 'Articulação', 'Concentração'],
      weaknesses: ['Memorização', 'Controle dinâmico', 'Afinação'],
      recommendations: [
        'Pratique escalas diariamente por 10 minutos',
        'Use metrônomo para exercícios técnicos',
        'Trabalhe memorização em seções pequenas',
        'Grave suas performances para análise',
      ],
    },
    goals: {
      total: 12,
      completed: 8,
      inProgress: 3,
      overdue: 1,
      categoryBreakdown: {
        Técnica: 4,
        Repertório: 5,
        Performance: 2,
        Teoria: 1,
      },
    },
  });

  const reportRef = useRef<HTMLDivElement>(null);

  // Tipos de relatório
  const reportTypes = [
    {
      id: 'summary',
      name: 'Resumo Executivo',
      description: 'Visão geral do progresso com métricas principais',
      icon: FiActivity,
      color: 'blue',
    },
    {
      id: 'detailed',
      name: 'Relatório Detalhado',
      description: 'Análise completa com gráficos e insights',
      icon: FiFileText,
      color: 'green',
    },
    {
      id: 'technical',
      name: 'Análise Técnica',
      description: 'Foco em aspectos técnicos e habilidades',
      icon: FiSettings,
      color: 'purple',
    },
    {
      id: 'progress',
      name: 'Progresso Temporal',
      description: 'Evolução ao longo do tempo',
      icon: FiTrendingUp,
      color: 'orange',
    },
    {
      id: 'custom',
      name: 'Personalizado',
      description: 'Configure seções e métricas específicas',
      icon: FiEdit3,
      color: 'pink',
    },
  ];

  // Gerar relatório
  const generateReport = async () => {
    setIsGenerating(true);

    // Simular geração
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsGenerating(false);
    setShowPreview(true);
  };

  // Componente de seção do relatório
  const ReportSection: React.FC<{
    title: string;
    icon: React.ComponentType<any>;
    children: React.ReactNode;
    collapsible?: boolean;
  }> = ({ title, icon: Icon, children, collapsible = true }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div
          className={`flex items-center justify-between p-4 ${
            collapsible ? 'cursor-pointer' : ''
          } border-b border-gray-100`}
          onClick={() => collapsible && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {collapsible && (
            <div className="text-gray-400">
              {isExpanded ? (
                <FiChevronDown className="w-5 h-5" />
              ) : (
                <FiChevronRight className="w-5 h-5" />
              )}
            </div>
          )}
        </div>
        {isExpanded && <div className="p-4">{children}</div>}
      </div>
    );
  };

  // Componente de métrica
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    unit?: string;
    color?: string;
  }> = ({ title, value, change, unit, color = 'blue' }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        {change !== undefined && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              change > 0
                ? 'text-green-600'
                : change < 0
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {change > 0 ? (
              <FiTrendingUp className="w-3 h-3" />
            ) : change < 0 ? (
              <FiTrendingDown className="w-3 h-3" />
            ) : null}
            <span>
              {change > 0 ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-1">
        <span className={`text-2xl font-bold text-${color}-600`}>{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );

  // Componente de gráfico de barras simples
  const SimpleBarChart: React.FC<{
    data: { label: string; value: number; color?: string }[];
    title: string;
  }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 text-right">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className={`h-4 rounded-full ${item.color || 'bg-blue-500'}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Preview do relatório
  const ReportPreview = () => (
    <div className="bg-white" ref={reportRef}>
      {/* Header do relatório */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Relatório de Progresso Musical
            </h1>
            <p className="text-gray-600 mt-1">
              Período: {new Date(reportData.period.start).toLocaleDateString()}{' '}
              - {new Date(reportData.period.end).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Gerado em</div>
            <div className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de overview */}
      {reportConfig.includeSections.overview && (
        <ReportSection title="Resumo Executivo" icon={FiActivity}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Praticado"
              value={Math.floor(reportData.practice.totalMinutes / 60)}
              unit="horas"
              change={15}
              color="blue"
            />
            <MetricCard
              title="Sessões"
              value={reportData.practice.totalSessions}
              unit="sessões"
              change={8}
              color="green"
            />
            <MetricCard
              title="Consistência"
              value={reportData.practice.consistency}
              unit="%"
              change={12}
              color="purple"
            />
            <MetricCard
              title="Sequência"
              value={reportData.practice.streak}
              unit="dias"
              change={5}
              color="orange"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Destaque do Período
                </h4>
                <p className="text-blue-800 text-sm mt-1">
                  Excelente consistência de prática! Você manteve uma média de{' '}
                  {reportData.practice.averageSessionDuration} minutos por
                  sessão e completou {reportData.practice.goalCompletion}% das
                  suas metas.
                </p>
              </div>
            </div>
          </div>
        </ReportSection>
      )}

      {/* Seção de prática */}
      {reportConfig.includeSections.practice && (
        <ReportSection title="Análise da Prática" icon={FiClock}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Distribuição do Tempo
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Sessão mais longa
                  </span>
                  <span className="font-medium">
                    {reportData.practice.longestSession} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Sessão mais curta
                  </span>
                  <span className="font-medium">
                    {reportData.practice.shortestSession} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duração média</span>
                  <span className="font-medium">
                    {reportData.practice.averageSessionDuration} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Melhor horário</span>
                  <span className="font-medium">
                    {reportData.analytics.bestPracticeTime}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <SimpleBarChart
                title="Dias Mais Produtivos"
                data={[
                  { label: 'Seg', value: 3, color: 'bg-blue-500' },
                  { label: 'Ter', value: 8, color: 'bg-green-500' },
                  { label: 'Qua', value: 5, color: 'bg-yellow-500' },
                  { label: 'Qui', value: 7, color: 'bg-green-400' },
                  { label: 'Sex', value: 4, color: 'bg-orange-500' },
                  { label: 'Sáb', value: 6, color: 'bg-purple-500' },
                  { label: 'Dom', value: 2, color: 'bg-gray-500' },
                ]}
              />
            </div>
          </div>
        </ReportSection>
      )}

      {/* Seção de instrumentos */}
      {reportConfig.includeSections.instruments && (
        <ReportSection title="Progresso por Instrumento" icon={GiPianoKeys}>
          <div className="space-y-6">
            {reportData.instruments.map((instrument, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      {instrument.name === 'Piano' && (
                        <GiPianoKeys className="w-5 h-5 text-white" />
                      )}
                      {instrument.name === 'Violino' && (
                        <GiViolin className="w-5 h-5 text-white" />
                      )}
                      {instrument.name === 'Trompete' && (
                        <GiTrumpet className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {instrument.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {Math.floor(instrument.minutes / 60)}h{' '}
                        {instrument.minutes % 60}m • {instrument.sessions}{' '}
                        sessões
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +{instrument.improvement}%
                    </div>
                    <div className="text-xs text-gray-500">Melhoria</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Proficiência
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        style={{ width: `${instrument.proficiency}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {instrument.proficiency}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Áreas de Foco
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {instrument.focusAreas.map((area, areaIndex) => (
                        <span
                          key={areaIndex}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Seção técnica */}
      {reportConfig.includeSections.technical && (
        <ReportSection title="Análise Técnica" icon={FiSettings}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              title="Escalas"
              value={reportData.technical.scalesImprovement}
              unit="% melhoria"
              change={reportData.technical.scalesImprovement}
            />
            <MetricCard
              title="Ritmo"
              value={reportData.technical.rhythmAccuracy}
              unit="% precisão"
            />
            <MetricCard
              title="Afinação"
              value={reportData.technical.intonationAccuracy}
              unit="% precisão"
            />
            <MetricCard
              title="Dinâmica"
              value={reportData.technical.dynamicControl}
              unit="% controle"
            />
            <MetricCard
              title="Articulação"
              value={reportData.technical.articulationClarity}
              unit="% clareza"
            />
            <MetricCard
              title="Memória"
              value={reportData.technical.memoryRetention}
              unit="% retenção"
            />
          </div>
        </ReportSection>
      )}

      {/* Seção de metas */}
      {reportConfig.includeSections.goals && (
        <ReportSection title="Progresso das Metas" icon={FiTarget}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <MetricCard
                  title="Concluídas"
                  value={reportData.goals.completed}
                  color="green"
                />
                <MetricCard
                  title="Em Progresso"
                  value={reportData.goals.inProgress}
                  color="blue"
                />
                <MetricCard
                  title="Atrasadas"
                  value={reportData.goals.overdue}
                  color="red"
                />
                <MetricCard
                  title="Taxa de Sucesso"
                  value={Math.round(
                    (reportData.goals.completed / reportData.goals.total) * 100
                  )}
                  unit="%"
                  color="purple"
                />
              </div>
            </div>

            <div>
              <SimpleBarChart
                title="Metas por Categoria"
                data={Object.entries(reportData.goals.categoryBreakdown).map(
                  ([category, count]) => ({
                    label: category,
                    value: count,
                    color: 'bg-blue-500',
                  })
                )}
              />
            </div>
          </div>
        </ReportSection>
      )}

      {/* Seção de recomendações */}
      {reportConfig.includeSections.recommendations && (
        <ReportSection title="Recomendações Personalizadas" icon={BiBrain}>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
                <span>Pontos Fortes</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {reportData.analytics.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="bg-green-50 border border-green-200 rounded-lg p-3"
                  >
                    <span className="text-green-800 text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FiAlertCircle className="w-4 h-4 text-yellow-600" />
                <span>Áreas para Melhoria</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {reportData.analytics.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <span className="text-yellow-800 text-sm">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FiZap className="w-4 h-4 text-blue-600" />
                <span>Próximos Passos</span>
              </h4>
              <div className="space-y-3">
                {reportData.analytics.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-blue-900 text-sm flex-1">
                          {recommendation}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </ReportSection>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 p-6 text-center text-sm text-gray-500">
        <p>Relatório gerado pelo Sistema de Modo Estudo Avançado</p>
        <p className="mt-1">
          Continue praticando e evoluindo sua jornada musical! 🎵
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Relatórios de Progresso
          </h2>
          <p className="text-gray-400">
            Gere análises detalhadas do seu desenvolvimento musical
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white transition-colors">
            <FiRefreshCw className="w-4 h-4" />
            <span>Atualizar Dados</span>
          </button>

          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <FiFileText className="w-4 h-4" />
                <span>Gerar Relatório</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Tipos de relatório */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Tipo de Relatório
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedReport(type.id);
                      setReportConfig((prev) => ({
                        ...prev,
                        type: type.id as any,
                      }));
                    }}
                    className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                      selectedReport === type.id
                        ? 'bg-blue-500/20 border-blue-500 text-white'
                        : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-10 h-10 bg-${type.color}-500 rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-medium">{type.name}</h4>
                    </div>
                    <p className="text-sm opacity-75">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Configurações do Relatório
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Período */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Período
                </label>
                <select
                  value={reportConfig.period}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      period: e.target.value as any,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="week">Última semana</option>
                  <option value="month">Último mês</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="year">Último ano</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {/* Formato */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Formato
                </label>
                <select
                  value={reportConfig.format}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      format: e.target.value as any,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="pdf">PDF</option>
                  <option value="html">HTML</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              {/* Estilo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estilo
                </label>
                <select
                  value={reportConfig.style}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      style: e.target.value as any,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="professional">Profissional</option>
                  <option value="detailed">Detalhado</option>
                  <option value="visual">Visual</option>
                  <option value="minimal">Minimalista</option>
                </select>
              </div>

              {/* Ações rápidas */}
              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ações
                </label>
                <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm transition-colors">
                  <FiEye className="w-4 h-4" />
                  <span>Pré-visualizar</span>
                </button>
              </div>
            </div>

            {/* Seções incluídas */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-white mb-3">
                Seções a Incluir
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(reportConfig.includeSections).map(
                  ([section, included]) => (
                    <label
                      key={section}
                      className="flex items-center space-x-2 text-white text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={(e) =>
                          setReportConfig((prev) => ({
                            ...prev,
                            includeSections: {
                              ...prev.includeSections,
                              [section]: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <span className="capitalize">
                        {section.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Controles do preview */}
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <span>← Voltar</span>
              </button>
              <h3 className="text-white font-medium">Preview do Relatório</h3>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm transition-colors">
                <FiEdit3 className="w-4 h-4" />
                <span>Editar</span>
              </button>

              <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm transition-colors">
                <FiShare2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>

              <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                <FiDownload className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Preview do relatório */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ReportPreview />
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedReportsSystem;
