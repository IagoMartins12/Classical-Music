// app/components/Admin/Analytics/InsightsAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiZap,
  FiTarget,
  FiActivity,
  FiUsers,
  FiMessageSquare,
  FiRefreshCw,
  FiDownload,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiBarChart2,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';

import { useAdminStats, formatNumber } from '@/app/hooks/admin/useAdminStats';
import { BiBrain } from 'react-icons/bi';

interface PredictionInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  factors: string[];
}

interface BehaviorPattern {
  pattern: string;
  description: string;
  prevalence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface AnomalyDetection {
  type: 'spike' | 'drop' | 'unusual';
  metric: string;
  value: number;
  expectedRange: { min: number; max: number };
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  possibleCauses: string[];
}

interface AdvancedAnalytics {
  predictions: PredictionInsight[];
  behaviorPatterns: BehaviorPattern[];
  anomalies: AnomalyDetection[];
  cohortAnalysis: {
    newUsers: Array<{
      cohort: string;
      size: number;
      retention: { day1: number; day7: number; day30: number };
      engagement: number;
    }>;
  };
  featureUsage: Array<{
    feature: string;
    usage: number;
    growth: number;
    userSegments: Array<{ segment: string; usage: number }>;
  }>;
  contentPerformance: {
    topPerformers: Array<{
      type: 'composer' | 'work' | 'score';
      name: string;
      metrics: { views: number; favorites: number; studyTime: number };
      trend: number;
    }>;
    underperformers: Array<{
      type: 'composer' | 'work' | 'score';
      name: string;
      issues: string[];
      suggestions: string[];
    }>;
  };
}

export default function InsightsAnalytics() {
  const router = useRouter();
  const { stats, loading, refreshStats } = useAdminStats();
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [selectedInsight, setSelectedInsight] = useState('predictions');
  const [timeframe, setTimeframe] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data para demonstração
  const mockAnalytics: AdvancedAnalytics = {
    predictions: [
      {
        metric: 'Usuários Ativos Mensais',
        currentValue: 2847,
        predictedValue: 3156,
        confidence: 85.3,
        trend: 'up',
        timeframe: '30 dias',
        factors: ['Crescimento orgânico', 'Melhorias na UX', 'Novos recursos'],
      },
      {
        metric: 'Taxa de Retenção',
        currentValue: 73.2,
        predictedValue: 76.8,
        confidence: 78.9,
        trend: 'up',
        timeframe: '30 dias',
        factors: [
          'Sistema de anotações',
          'Gamificação',
          'Conteúdo personalizado',
        ],
      },
      {
        metric: 'Tempo Médio de Sessão',
        currentValue: 24.5,
        predictedValue: 22.1,
        confidence: 71.4,
        trend: 'down',
        timeframe: '30 dias',
        factors: ['Fragmentação de sessões', 'Uso móvel crescente'],
      },
    ],
    behaviorPatterns: [
      {
        pattern: 'Estudantes Noturnos',
        description: 'Usuários que estudam principalmente entre 19h-23h',
        prevalence: 34.7,
        impact: 'high',
        recommendation:
          'Otimizar recursos para uso noturno e criar lembretes inteligentes',
      },
      {
        pattern: 'Exploradores de Época',
        description: 'Usuários que estudam compositores de uma única época',
        prevalence: 28.3,
        impact: 'medium',
        recommendation:
          'Sugerir compositores de outras épocas com estilos similares',
      },
      {
        pattern: 'Anotadores Colaborativos',
        description:
          'Usuários que frequentemente respondem anotações de outros',
        prevalence: 12.8,
        impact: 'high',
        recommendation:
          'Implementar sistema de mentoria e badges de colaboração',
      },
    ],
    anomalies: [
      {
        type: 'spike',
        metric: 'Novos Cadastros',
        value: 157,
        expectedRange: { min: 45, max: 80 },
        timestamp: new Date(),
        severity: 'info',
        possibleCauses: ['Menção em rede social', 'Artigo em blog de música'],
      },
      {
        type: 'drop',
        metric: 'Tempo de Estudo',
        value: 1240,
        expectedRange: { min: 1800, max: 2200 },
        timestamp: new Date(),
        severity: 'warning',
        possibleCauses: [
          'Instabilidade no sistema',
          'Período de provas escolares',
        ],
      },
    ],
    cohortAnalysis: {
      newUsers: [
        {
          cohort: 'Jan 2024',
          size: 234,
          retention: { day1: 78.2, day7: 64.5, day30: 42.3 },
          engagement: 73.5,
        },
        {
          cohort: 'Feb 2024',
          size: 198,
          retention: { day1: 81.3, day7: 67.2, day30: 45.1 },
          engagement: 76.8,
        },
        {
          cohort: 'Mar 2024',
          size: 267,
          retention: { day1: 75.9, day7: 61.8, day30: 38.7 },
          engagement: 71.2,
        },
      ],
    },
    featureUsage: [
      {
        feature: 'Sistema de Anotações',
        usage: 67.3,
        growth: 15.2,
        userSegments: [
          { segment: 'Estudantes', usage: 89.4 },
          { segment: 'Professores', usage: 92.1 },
          { segment: 'Casuais', usage: 34.6 },
        ],
      },
      {
        feature: 'Sessões de Estudo',
        usage: 54.8,
        growth: 8.7,
        userSegments: [
          { segment: 'Estudantes', usage: 78.3 },
          { segment: 'Profissionais', usage: 71.2 },
          { segment: 'Casuais', usage: 23.1 },
        ],
      },
      {
        feature: 'Favoritar Obras',
        usage: 78.9,
        growth: 12.4,
        userSegments: [{ segment: 'Todos', usage: 78.9 }],
      },
    ],
    contentPerformance: {
      topPerformers: [
        {
          type: 'work',
          name: 'Für Elise - Beethoven',
          metrics: { views: 15673, favorites: 2341, studyTime: 45672 },
          trend: 23.4,
        },
        {
          type: 'composer',
          name: 'Johann Sebastian Bach',
          metrics: { views: 34521, favorites: 5678, studyTime: 123456 },
          trend: 18.7,
        },
      ],
      underperformers: [
        {
          type: 'work',
          name: 'Algumas obras contemporâneas',
          issues: ['Baixo engajamento', 'Poucas partituras'],
          suggestions: [
            'Adicionar guias de estudo',
            'Melhorar qualidade das partituras',
          ],
        },
      ],
    },
  };

  useEffect(() => {
    setAnalytics(mockAnalytics);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    setRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-accent-red bg-accent-red/10 border-accent-red';
      case 'warning':
        return 'text-accent-amber bg-accent-amber/10 border-accent-amber';
      case 'info':
        return 'text-accent-blue bg-accent-blue/10 border-accent-blue';
      default:
        return 'text-theme-tertiary bg-theme-secondary border-theme-secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return FiAlertTriangle;
      case 'warning':
        return FiAlertTriangle;
      case 'info':
        return FiInfo;
      default:
        return FiCheckCircle;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return FiTrendingUp;
      case 'down':
        return FiTrendingDown;
      default:
        return FiActivity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-accent-green';
      case 'down':
        return 'text-accent-red';
      default:
        return 'text-theme-tertiary';
    }
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <BiBrain className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Insights & Analytics
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Análises avançadas e previsões inteligentes
            </p>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedInsight}
                onChange={(e) => setSelectedInsight(e.target.value)}
                options={[
                  { value: 'predictions', label: 'Previsões' },
                  { value: 'patterns', label: 'Padrões de Comportamento' },
                  { value: 'anomalies', label: 'Detecção de Anomalias' },
                  { value: 'cohorts', label: 'Análise de Coorte' },
                  { value: 'features', label: 'Uso de Recursos' },
                ]}
                className="input-classical-2"
              />

              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                options={[
                  { value: '7d', label: 'Últimos 7 dias' },
                  { value: '30d', label: 'Últimos 30 dias' },
                  { value: '90d', label: 'Últimos 90 dias' },
                  { value: '1y', label: 'Último ano' },
                ]}
                className="input-classical-2"
              />

              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                }
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Atualizar
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" leftIcon={<FiDownload />}>
                Exportar Relatório
              </Button>
              <Button variant="primary" size="sm" leftIcon={<FiZap />}>
                IA Insights
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* AI Predictions Section */}
        {selectedInsight === 'predictions' && (
          <div className="space-y-8">
            <AnimatedItem direction="up" springType="gentle">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiTarget className="w-6 h-6 text-accent-purple" />
                <span>Previsões Inteligentes</span>
              </h2>
            </AnimatedItem>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {analytics?.predictions.map((prediction, index) => {
                const TrendIcon = getTrendIcon(prediction.trend);
                return (
                  <AnimatedCard key={index} className="classical-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-theme-primary mb-1">
                          {prediction.metric}
                        </h3>
                        <p className="text-sm text-theme-tertiary">
                          Previsão para {prediction.timeframe}
                        </p>
                      </div>
                      <TrendIcon
                        className={`w-5 h-5 ${getTrendColor(prediction.trend)}`}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-theme-secondary">
                          Atual
                        </span>
                        <span className="text-xl font-bold text-theme-primary">
                          {formatNumber(prediction.currentValue)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-theme-secondary">
                          Previsto
                        </span>
                        <span
                          className={`text-xl font-bold ${getTrendColor(
                            prediction.trend
                          )}`}
                        >
                          {formatNumber(prediction.predictedValue)}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-theme-secondary">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-theme-tertiary">
                            Confiança
                          </span>
                          <span className="text-xs font-medium text-accent-blue">
                            {prediction.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-theme-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-1000"
                            style={{ width: `${prediction.confidence}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-theme-secondary">
                        <p className="text-xs text-theme-tertiary mb-2">
                          Fatores principais:
                        </p>
                        <div className="space-y-1">
                          {prediction.factors.slice(0, 2).map((factor, i) => (
                            <div
                              key={i}
                              className="text-xs text-theme-secondary flex items-center space-x-1"
                            >
                              <div className="w-1 h-1 bg-accent-blue rounded-full"></div>
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Behavior Patterns Section */}
        {selectedInsight === 'patterns' && (
          <div className="space-y-8">
            <AnimatedItem direction="up" springType="gentle">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiUsers className="w-6 h-6 text-accent-green" />
                <span>Padrões de Comportamento</span>
              </h2>
            </AnimatedItem>

            <div className="space-y-6">
              {analytics?.behaviorPatterns.map((pattern, index) => (
                <AnimatedCard key={index} className="classical-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-bold text-theme-primary">
                          {pattern.pattern}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pattern.impact === 'high'
                              ? 'bg-accent-red/20 text-accent-red'
                              : pattern.impact === 'medium'
                              ? 'bg-accent-amber/20 text-accent-amber'
                              : 'bg-accent-blue/20 text-accent-blue'
                          }`}
                        >
                          Impacto{' '}
                          {pattern.impact === 'high'
                            ? 'Alto'
                            : pattern.impact === 'medium'
                            ? 'Médio'
                            : 'Baixo'}
                        </span>
                      </div>

                      <p className="text-theme-secondary mb-4">
                        {pattern.description}
                      </p>

                      <div className="bg-theme-secondary p-4 rounded-xl">
                        <p className="text-sm text-theme-primary">
                          <strong>Recomendação:</strong>{' '}
                          {pattern.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-accent-blue mb-1">
                        {pattern.prevalence.toFixed(1)}%
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        dos usuários
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Anomaly Detection Section */}
        {selectedInsight === 'anomalies' && (
          <div className="space-y-8">
            <AnimatedItem direction="up" springType="gentle">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiAlertTriangle className="w-6 h-6 text-accent-red" />
                <span>Detecção de Anomalias</span>
              </h2>
            </AnimatedItem>

            <div className="space-y-4">
              {analytics?.anomalies.map((anomaly, index) => {
                const SeverityIcon = getSeverityIcon(anomaly.severity);
                return (
                  <AnimatedCard
                    key={index}
                    className={`classical-card p-6 border-l-4 ${getSeverityColor(
                      anomaly.severity
                    )}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${getSeverityColor(
                          anomaly.severity
                        )}`}
                      >
                        <SeverityIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-theme-primary">
                            {anomaly.type === 'spike'
                              ? 'Pico Anômalo'
                              : anomaly.type === 'drop'
                              ? 'Queda Anômala'
                              : 'Comportamento Incomum'}{' '}
                            - {anomaly.metric}
                          </h3>
                          <span className="text-sm text-theme-tertiary">
                            {new Date(anomaly.timestamp).toLocaleString(
                              'pt-BR'
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-theme-secondary rounded-xl">
                            <div className="text-lg font-bold text-theme-primary">
                              {formatNumber(anomaly.value)}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              Valor Atual
                            </div>
                          </div>
                          <div className="text-center p-3 bg-theme-secondary rounded-xl">
                            <div className="text-lg font-bold text-accent-blue">
                              {formatNumber(anomaly.expectedRange.min)}-
                              {formatNumber(anomaly.expectedRange.max)}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              Faixa Esperada
                            </div>
                          </div>
                          <div className="text-center p-3 bg-theme-secondary rounded-xl">
                            <div
                              className={`text-lg font-bold ${
                                anomaly.severity === 'critical'
                                  ? 'text-accent-red'
                                  : anomaly.severity === 'warning'
                                  ? 'text-accent-amber'
                                  : 'text-accent-blue'
                              }`}
                            >
                              {anomaly.severity === 'critical'
                                ? 'Crítico'
                                : anomaly.severity === 'warning'
                                ? 'Atenção'
                                : 'Info'}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              Severidade
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-theme-secondary mb-2">
                            Possíveis causas:
                          </p>
                          <div className="space-y-1">
                            {anomaly.possibleCauses.map((cause, i) => (
                              <div
                                key={i}
                                className="text-sm text-theme-primary flex items-center space-x-2"
                              >
                                <div className="w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                                <span>{cause}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature Usage Section */}
        {selectedInsight === 'features' && (
          <div className="space-y-8">
            <AnimatedItem direction="up" springType="gentle">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiBarChart2 className="w-6 h-6 text-accent-blue" />
                <span>Uso de Recursos</span>
              </h2>
            </AnimatedItem>

            <div className="space-y-6">
              {analytics?.featureUsage.map((feature, index) => (
                <AnimatedCard key={index} className="classical-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-theme-primary">
                      {feature.feature}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent-blue">
                          {feature.usage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Adoção
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${
                            feature.growth > 0
                              ? 'text-accent-green'
                              : 'text-accent-red'
                          }`}
                        >
                          {feature.growth > 0 ? '+' : ''}
                          {feature.growth.toFixed(1)}%
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Crescimento
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-1000"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {feature.userSegments.map((segment, i) => (
                      <div
                        key={i}
                        className="p-3 bg-theme-secondary rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-theme-primary">
                            {segment.segment}
                          </span>
                          <span className="text-sm font-bold text-accent-green">
                            {segment.usage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-theme-primary h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-green rounded-full transition-all duration-1000"
                            style={{ width: `${segment.usage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-6 mt-8">
            <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center space-x-2">
              <FiTarget className="w-5 h-5 text-accent-purple" />
              <span>Próximas Ações Recomendadas</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <FiTrendingUp className="w-4 h-4 text-accent-green" />
                  <span className="font-medium text-theme-primary">
                    Otimizar Retenção
                  </span>
                </div>
                <p className="text-sm text-theme-tertiary">
                  Implementar sistema de notificações inteligentes baseado nos
                  padrões de uso identificados.
                </p>
              </div>

              <div className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <FiMessageSquare className="w-4 h-4 text-accent-blue" />
                  <span className="font-medium text-theme-primary">
                    Melhorar Engajamento
                  </span>
                </div>
                <p className="text-sm text-theme-tertiary">
                  Criar programa de gamificação para anotadores colaborativos.
                </p>
              </div>

              <div className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <FiAlertTriangle className="w-4 h-4 text-accent-amber" />
                  <span className="font-medium text-theme-primary">
                    Monitorar Anomalias
                  </span>
                </div>
                <p className="text-sm text-theme-tertiary">
                  Configurar alertas automáticos para quedas significativas no
                  tempo de estudo.
                </p>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
