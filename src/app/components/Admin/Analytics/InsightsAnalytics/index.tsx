// app/components/Admin/Analytics/InsightsAnalytics.tsx
'use client';

import { useState } from 'react';
import {
  PiArrowsClockwise,
  PiBrain,
  PiChartBar,
  PiChartPie,
  PiCheckCircle,
  PiClock,
  PiCpu,
  PiCurrencyDollar,
  PiDownloadSimple,
  PiEye,
  PiFlag,
  PiFunnel,
  PiHeart,
  PiInfo,
  PiLightning,
  PiMapPin,
  PiMedal,
  PiPulse,
  PiShield,
  PiTarget,
  PiTrendDown,
  PiTrendUp,
  PiUsers,
  PiWarning,
} from 'react-icons/pi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';

import { useAdminInsights } from '@/app/hooks/admin/useAdminInsights';
import toast from 'react-hot-toast';
import { formatNumber } from '../../Utils';
import LoadingAdminState from '../../Common/LoadingState';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

// ===== UTILITY FUNCTIONS (Moved outside component for reusability) =====
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '';
    case 'warning':
      return '';
    case 'info':
      return '';
    default:
      return 'text-theme-tertiary bg-theme-secondary border-theme-secondary';
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'critical':
      return '';
    case 'high':
      return '';
    case 'medium':
      return '';
    case 'low':
      return '';
    default:
      return 'text-theme-tertiary bg-theme-secondary';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return PiTrendUp;
    case 'down':
      return PiTrendDown;
    default:
      return PiPulse;
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return '';
    case 'down':
      return '';
    default:
      return 'text-theme-tertiary';
  }
};

export default function AdvancedInsightsAnalytics() {
  const {
    insights,
    loading,
    error,
    refreshInsights,
    generatePrediction,
    refreshModule,
    exportInsights,
    lastUpdated,
    isGenerating,
    processingTime,
    version,
  } = useAdminInsights();

  const [selectedView, setSelectedView] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');
  const [filterSegment, setFilterSegment] = useState('all');

  const handleRefresh = async () => {
    try {
      await refreshInsights();
      toast.success('Insights atualizados com sucesso!');
    } catch {
      toast.error('Erro ao atualizar insights');
    }
  };

  const handleRefreshModule = async (module: string) => {
    try {
      await refreshModule(module);
      toast.success(`Módulo ${module} atualizado!`);
    } catch {
      toast.error(`Erro ao atualizar ${module}`);
    }
  };

  const handleGeneratePrediction = async (metric: string) => {
    try {
      await generatePrediction(metric, timeframe);
      toast.success('Previsão gerada com sucesso!');
    } catch {
      toast.error('Erro ao gerar previsão');
    }
  };

  const handleExportInsights = async () => {
    try {
      await exportInsights();
      toast.success('Insights exportados com sucesso!');
    } catch {
      toast.error('Erro ao exportar insights');
    }
  };

  if (loading && !insights) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="análises avançadas de IA" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <AnimatedCard className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <PiWarning className="w-8 h-8 text-theme-primary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Erro ao Carregar Analytics IA
            </h3>
            <p className="text-theme-secondary mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={handleRefresh}
              leftIcon={<PiArrowsClockwise />}
              disabled={loading}
            >
              Tentar Novamente
            </Button>
          </AnimatedCard>
        </div>
      </PageContainer>
    );
  }

  if (!insights) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <PiBrain className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Nenhum Insight Disponível
          </h2>
          <p className="text-theme-secondary mb-6">
            Aguarde enquanto a IA processa os dados...
          </p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            leftIcon={<PiArrowsClockwise />}
          >
            Inicializar Análise IA
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiBrain className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              AI Analytics Dashboard
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle mb-6">
              Sistema Avançado de Inteligência Educacional
            </p>

            {/* Enhanced Health Metrics */}
            <Inline gap={8} className="justify-center mt-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold mb-2 ${
                    insights.summary.healthScore >= 80
                      ? ''
                      : insights.summary.healthScore >= 60
                        ? ''
                        : ''
                  }`}
                >
                  {insights.summary.healthScore}/100
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  System Health
                </Text>
                <div className="w-20 h-2 bg-theme-secondary rounded-full overflow-hidden mx-auto mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      insights.summary.healthScore >= 80
                        ? ''
                        : insights.summary.healthScore >= 60
                          ? ''
                          : ''
                    }`}
                    style={{ width: `${insights.summary.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`text-lg font-bold mb-2 ${
                    insights.summary.trendDirection === 'positive'
                      ? ''
                      : insights.summary.trendDirection === 'negative'
                        ? ''
                        : 'text-theme-tertiary'
                  }`}
                >
                  {insights.summary.trendDirection === 'positive'
                    ? '📈 Crescendo'
                    : insights.summary.trendDirection === 'negative'
                      ? '📉 Atenção'
                      : '➡️ Estável'}
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  Tendência Geral
                </Text>
              </div>

              <Stack gap={2} className="text-center">
                <div className="text-lg font-bold">v{version}</div>
                <Text papel="rotulo" tom="fraco" as="div">
                  AI Engine
                </Text>
              </Stack>

              {lastUpdated && (
                <div className="text-center">
                  <Text
                    papel="rotulo"
                    tom="forte"
                    as="div"
                    className="font-medium"
                  >
                    {new Date(lastUpdated).toLocaleTimeString('pt-BR')}
                  </Text>
                  <Text papel="legenda" tom="fraco" as="div">
                    {processingTime && `${processingTime}ms`} • Última análise
                  </Text>
                </div>
              )}
            </Inline>
          </div>
        </AnimatedItem>

        {/* Critical Alerts */}
        {insights.anomalies.filter((a) => a.severity === 'critical').length >
          0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mb-8 border-l-4">
              <Inline gap={3} className="mb-4">
                <PiWarning className="w-6 h-6" />
                <h3 className="text-xl font-bold text-theme-primary">
                  ⚠️ Alertas Críticos Detectados
                </h3>
              </Inline>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.anomalies
                  .filter((anomaly) => anomaly.severity === 'critical')
                  .slice(0, 4)
                  .map((anomaly, index: number) => (
                    <Stack
                      gap={2}
                      key={index}
                      className="p-4 rounded-xl border"
                    >
                      <h4 className="font-bold">{anomaly.metric}</h4>
                      <Text papel="rotulo" tom="suave" as="p">
                        Valor: {formatNumber(anomaly.value)} (desvio:{' '}
                        {anomaly.deviation.toFixed(1)}%)
                      </Text>
                      <Text papel="legenda" tom="fraco" as="p">
                        {anomaly.possibleCauses[0]}
                      </Text>
                    </Stack>
                  ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Quick Stats Overview */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard className="classical-card p-6 text-center">
              <PiUsers className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {insights.riskAssessment.churnRiskUsers.length}
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Usuários em Risco
              </Text>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <PiTrendUp className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {
                  insights.growthOpportunities.filter(
                    (o) => o.impact === 'high' || o.impact === 'critical'
                  ).length
                }
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Oportunidades Alto Impacto
              </Text>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <PiFlag className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {insights.anomalies.length}
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Anomalias Detectadas
              </Text>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <PiMedal className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {insights.educationalEngagement.learningProgressions.length}
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Padrões de Aprendizado
              </Text>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Navigation and Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            {/* View Selection */}
            <div className="flex flex-wrap items-center space-x-2 space-y-2 lg:space-y-0">
              <Select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                options={[
                  { value: 'overview', label: '🏠 Visão Geral' },
                  { value: 'predictions', label: '🔮 Previsões IA' },
                  { value: 'educational', label: '📚 Engajamento Educacional' },
                  { value: 'journeys', label: '🗺️ Jornadas de Usuário' },
                  { value: 'risks', label: '⚠️ Avaliação de Riscos' },
                  { value: 'growth', label: '🚀 Oportunidades de Crescimento' },
                  {
                    value: 'monetization',
                    label: '💰 Insights de Monetização',
                  },
                  { value: 'patterns', label: '🧠 Padrões de Comportamento' },
                  { value: 'content', label: '📊 Performance de Conteúdo' },
                  { value: 'anomalies', label: '🔍 Detecção de Anomalias' },
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

              <Select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos os Segmentos' },
                  { value: 'students', label: 'Estudantes' },
                  { value: 'teachers', label: 'Professores' },
                  { value: 'professionals', label: 'Profissionais' },
                  { value: 'casual', label: 'Usuários Casuais' },
                ]}
                className="input-classical-2"
              />
            </div>

            {/* Action Buttons */}
            <Inline gap={3} className="flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <PiArrowsClockwise
                    className={loading || isGenerating ? 'animate-spin' : ''}
                  />
                }
                onClick={handleRefresh}
                disabled={loading || isGenerating}
              >
                {loading ? 'Analisando...' : 'Atualizar'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<PiDownloadSimple />}
                onClick={handleExportInsights}
                disabled={isGenerating}
              >
                Exportar
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<PiLightning />}
                onClick={() => handleGeneratePrediction('overall')}
                disabled={isGenerating}
              >
                {isGenerating ? 'Processando...' : 'Nova Análise'}
              </Button>
            </Inline>
          </div>
        </AnimatedItem>

        {/* Main Content Based on Selected View */}
        {selectedView === 'overview' && (
          <OverviewSection
            insights={insights}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'predictions' && (
          <PredictionsSection
            predictions={insights.predictions}
            onGeneratePrediction={handleGeneratePrediction}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'educational' && (
          <EducationalEngagementSection
            educational={insights.educationalEngagement}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'journeys' && (
          <UserJourneySection
            userJourney={insights.userJourneyAnalysis}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'risks' && (
          <RiskAssessmentSection
            riskAssessment={insights.riskAssessment}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'growth' && (
          <GrowthOpportunitiesSection
            opportunities={insights.growthOpportunities}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'monetization' && (
          <MonetizationSection
            monetization={insights.monetizationInsights}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'patterns' && (
          <BehaviorPatternsSection
            patterns={insights.behaviorPatterns}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'content' && (
          <ContentPerformanceSection
            contentPerformance={insights.contentPerformance}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {selectedView === 'anomalies' && (
          <AnomaliesSection
            anomalies={insights.anomalies}
            onRefreshModule={handleRefreshModule}
            isGenerating={isGenerating}
          />
        )}

        {/* Action Items Summary */}
        {insights.summary.actionItems.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mt-8">
              <Inline
                as="h3"
                gap={2}
                className="text-xl font-bold text-theme-primary mb-6"
              >
                <PiClock className="w-5 h-5" />
                <span>🎯 Próximas Ações Prioritárias</span>
              </Inline>

              <div className="space-y-4">
                {insights.summary.actionItems
                  .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (
                      priorityOrder[b.priority] - priorityOrder[a.priority]
                    );
                  })
                  .map((item, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-l-4 ${
                        item.priority === 'high'
                          ? ''
                          : item.priority === 'medium'
                            ? ''
                            : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Inline gap={3} className="mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.priority === 'high'
                                  ? 'text-white'
                                  : item.priority === 'medium'
                                    ? 'text-white'
                                    : 'text-white'
                              }`}
                            >
                              {item.priority === 'high'
                                ? '🔥 URGENTE'
                                : item.priority === 'medium'
                                  ? '⚡ IMPORTANTE'
                                  : '📋 NORMAL'}
                            </span>
                            <Text papel="legenda" tom="fraco">
                              ⏱️ {item.timeframe}
                            </Text>
                          </Inline>
                          <h4 className="font-medium text-theme-primary mb-1">
                            {item.action}
                          </h4>
                          <Text papel="rotulo" tom="suave" as="p">
                            <strong>Impacto esperado:</strong>{' '}
                            {item.expectedImpact}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}

// ===== SECTION COMPONENTS =====

function OverviewSection({ insights, onRefreshModule, isGenerating }: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <Inline
          as="h2"
          gap={2}
          className="text-2xl font-bold text-theme-primary mb-6"
        >
          <PiEye className="w-6 h-6" />
          <span>📊 Visão Geral Executiva</span>
        </Inline>
      </AnimatedItem>

      {/* Key Findings */}
      {insights.summary.keyFindings.length > 0 && (
        <AnimatedCard className="classical-card p-6">
          <Inline
            as="h3"
            gap={2}
            className="text-lg font-bold text-theme-primary mb-4"
          >
            <PiBrain className="w-5 h-5" />
            <span>🔍 Principais Descobertas da IA</span>
          </Inline>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.summary.keyFindings.map(
              (finding: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-theme-secondary rounded-xl"
                >
                  <Text
                    papel="legenda"
                    tom="forte"
                    as="div"
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1"
                  >
                    {index + 1}
                  </Text>
                  <p className="text-theme-primary leading-relaxed">
                    {finding}
                  </p>
                </div>
              )
            )}
          </div>
        </AnimatedCard>
      )}

      {/* Performance Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Educational Performance */}
        <AnimatedCard className="classical-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Inline as="h3" gap={2} className="font-bold text-theme-primary">
              <PiMedal className="w-5 h-5" />
              <span>📚 Performance Educacional</span>
            </Inline>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshModule('educational')}
              disabled={isGenerating}
            >
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            </Button>
          </div>

          <Stack gap={3}>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Taxa de Progressão
              </Text>
              <span className="font-bold">
                {insights.educationalEngagement.learningProgressions.length > 0
                  ? `${Math.round(
                      insights.educationalEngagement.learningProgressions.reduce(
                        (sum: number, p: any) => sum + p.successRate,
                        0
                      ) /
                        insights.educationalEngagement.learningProgressions
                          .length
                    )}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Qualidade Anotações
              </Text>
              <span className="font-bold">
                {insights.educationalEngagement.annotationQualityMetrics.avgHelpfulnessScore.toFixed(
                  1
                )}
                ⭐
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Top Contribuidores
              </Text>
              <span className="font-bold">
                {
                  insights.educationalEngagement.annotationQualityMetrics
                    .topContributors.length
                }
              </span>
            </div>
          </Stack>
        </AnimatedCard>

        {/* Risk Monitoring */}
        <AnimatedCard className="classical-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Inline as="h3" gap={2} className="font-bold text-theme-primary">
              <PiShield className="w-5 h-5" />
              <span>⚠️ Monitoramento de Riscos</span>
            </Inline>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshModule('risk')}
              disabled={isGenerating}
            >
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            </Button>
          </div>

          <Stack gap={3}>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Usuários em Risco
              </Text>
              <span
                className={`font-bold ${
                  insights.riskAssessment.churnRiskUsers.length > 10
                    ? ''
                    : insights.riskAssessment.churnRiskUsers.length > 5
                      ? ''
                      : ''
                }`}
              >
                {insights.riskAssessment.churnRiskUsers.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Riscos de Conteúdo
              </Text>
              <span className="font-bold">
                {insights.riskAssessment.contentRisks.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Saúde do Sistema
              </Text>
              <span
                className={`font-bold ${
                  insights.riskAssessment.systemHealthIndicators.every(
                    (i: any) => i.status === 'healthy'
                  )
                    ? ''
                    : ''
                }`}
              >
                {
                  insights.riskAssessment.systemHealthIndicators.filter(
                    (i: any) => i.status === 'healthy'
                  ).length
                }
                /{insights.riskAssessment.systemHealthIndicators.length}
              </span>
            </div>
          </Stack>
        </AnimatedCard>

        {/* Growth Potential */}
        <AnimatedCard className="classical-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Inline as="h3" gap={2} className="font-bold text-theme-primary">
              <PiTrendUp className="w-5 h-5" />
              <span>🚀 Potencial de Crescimento</span>
            </Inline>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshModule('growth')}
              disabled={isGenerating}
            >
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            </Button>
          </div>

          <Stack gap={3}>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Alto Impacto
              </Text>
              <span className="font-bold">
                {
                  insights.growthOpportunities.filter(
                    (o: any) => o.impact === 'high' || o.impact === 'critical'
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                Rápida Implementação
              </Text>
              <span className="font-bold">
                {
                  insights.growthOpportunities.filter(
                    (o: any) => o.effort === 'low'
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Text papel="rotulo" tom="suave">
                ROI Potencial
              </Text>
              <span className="font-bold">Alto</span>
            </div>
          </Stack>
        </AnimatedCard>
      </div>

      {/* Real-time System Status */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiCpu className="w-5 h-5" />
          <span>⚡ Status do Sistema em Tempo Real</span>
        </Inline>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.riskAssessment.systemHealthIndicators.map(
            (indicator: any, index: number) => (
              <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Text papel="rotulo" tom="forte" className="font-medium">
                    {indicator.metric}
                  </Text>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      indicator.status === 'healthy'
                        ? ''
                        : indicator.status === 'warning'
                          ? ''
                          : ''
                    }`}
                  />
                </div>
                <div className="text-xl font-bold text-theme-primary mb-1">
                  {formatNumber(indicator.currentValue)}
                </div>
                <Text papel="legenda" tom="fraco" as="div">
                  Ideal: {indicator.healthyRange.min}-
                  {indicator.healthyRange.max}
                </Text>
              </div>
            )
          )}
        </div>
      </AnimatedCard>
    </div>
  );
}

function PredictionsSection({
  predictions,
  onGeneratePrediction,
  isGenerating,
}: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiTarget className="w-6 h-6" />
            <span>🔮 Previsões Inteligentes</span>
          </Inline>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PiLightning />}
            onClick={() => onGeneratePrediction('comprehensive')}
            disabled={isGenerating}
          >
            {isGenerating ? 'Gerando...' : 'Atualizar Previsões'}
          </Button>
        </div>
      </AnimatedItem>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {predictions.map((prediction: any, index: number) => {
          const TrendIcon = getTrendIcon(prediction.trend);
          const trendColor = getTrendColor(prediction.trend);

          return (
            <AnimatedCard key={index} className="classical-card p-6">
              <div className="flex items-start justify-between mb-4">
                <Stack gap={1}>
                  <h3 className="font-bold text-theme-primary">
                    {prediction.metric}
                  </h3>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Previsão para {prediction.timeframe}
                  </Text>
                </Stack>
                <TrendIcon className={`w-6 h-6 ${trendColor}`} />
              </div>

              <Stack>
                <div className="flex items-center justify-between">
                  <Text papel="rotulo" tom="suave">
                    Atual
                  </Text>
                  <span className="text-2xl font-bold text-theme-primary">
                    {formatNumber(prediction.currentValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Text papel="rotulo" tom="suave">
                    Previsto
                  </Text>
                  <span className={`text-2xl font-bold ${trendColor}`}>
                    {formatNumber(prediction.predictedValue)}
                  </span>
                </div>

                <Stack gap={2} className="pt-3 border-t border-theme-secondary">
                  <div className="flex items-center justify-between">
                    <Text papel="legenda" tom="fraco">
                      Confiança da IA
                    </Text>
                    <span className="text-xs font-medium">
                      {prediction.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-1000"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </Stack>

                <Stack gap={2} className="pt-3 border-t border-theme-secondary">
                  <Text papel="legenda" tom="fraco" as="p">
                    Fatores chave:
                  </Text>
                  <Stack gap={1}>
                    {prediction.factors
                      .slice(0, 3)
                      .map((factor: string, i: number) => (
                        <Inline
                          gap={2}
                          key={i}
                          className="text-xs text-theme-secondary"
                        >
                          <div className="w-1.5 h-1.5 rounded-full"></div>
                          <span>{factor}</span>
                        </Inline>
                      ))}
                  </Stack>
                </Stack>

                {prediction.historicalData &&
                  prediction.historicalData.length > 0 && (
                    <Stack
                      gap={2}
                      className="pt-3 border-t border-theme-secondary"
                    >
                      <Text papel="legenda" tom="fraco" as="p">
                        Tendência histórica:
                      </Text>
                      <div className="flex items-end space-x-1 h-8">
                        {prediction.historicalData.map(
                          (point: any, i: number) => (
                            <div
                              key={i}
                              className="rounded-sm flex-1"
                              style={{
                                height: `${
                                  (point.value /
                                    Math.max(
                                      ...prediction.historicalData.map(
                                        (p: any) => p.value
                                      )
                                    )) *
                                  100
                                }%`,
                                minHeight: '4px',
                              }}
                            />
                          )
                        )}
                      </div>
                    </Stack>
                  )}
              </Stack>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}

function EducationalEngagementSection({
  educational,
  onRefreshModule,
  isGenerating,
}: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiMedal className="w-6 h-6" />
            <span>📚 Engajamento Educacional</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('educational')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      {/* Learning Progressions */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiTarget className="w-5 h-5" />
          <span>🎯 Progressões de Aprendizado</span>
        </Inline>

        <Stack>
          {educational.learningProgressions.map(
            (progression: any, index: number) => (
              <Stack
                gap={3}
                key={index}
                className="p-4 bg-theme-secondary rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-theme-primary">
                    {progression.pathway}
                  </h4>
                  <Inline gap={3}>
                    <span className="text-sm font-medium">
                      {progression.successRate}% sucesso
                    </span>
                    <Text papel="rotulo" tom="fraco">
                      ~{progression.avgTimeToComplete} dias
                    </Text>
                  </Inline>
                </div>

                <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progression.successRate}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Stack gap={1}>
                    <p className="text-theme-tertiary">
                      🚫 Pontos de abandono:
                    </p>
                    <ul className="space-y-1">
                      {progression.dropoffPoints.map(
                        (point: string, i: number) => (
                          <Inline as="li" gap={1} key={i} className="">
                            <span>•</span>
                            <span>{point}</span>
                          </Inline>
                        )
                      )}
                    </ul>
                  </Stack>
                  <Stack gap={1}>
                    <p className="text-theme-tertiary">💡 Recomendações:</p>
                    <ul className="space-y-1">
                      {progression.recommendations.map(
                        (rec: string, i: number) => (
                          <Inline as="li" gap={1} key={i} className="">
                            <span>•</span>
                            <span>{rec}</span>
                          </Inline>
                        )
                      )}
                    </ul>
                  </Stack>
                </div>
              </Stack>
            )
          )}
        </Stack>
      </AnimatedCard>

      {/* Composer Discovery Patterns */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiMapPin className="w-5 h-5" />
          <span>🗺️ Padrões de Descoberta Musical</span>
        </Inline>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {educational.composerDiscoveryPatterns.map(
            (pattern: any, index: number) => (
              <Stack
                gap={2}
                key={index}
                className="p-4 bg-theme-secondary rounded-xl"
              >
                <h4 className="font-bold text-theme-primary">
                  {pattern.epoch}
                </h4>
                <Stack gap={2} className="text-sm">
                  <div>
                    <p className="text-theme-tertiary">
                      🚪 Compositores porta de entrada:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.gatewayComposers.map(
                        (composer: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded text-xs">
                            {composer}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-theme-tertiary">
                      Taxa de conversão:
                    </span>
                    <span className="font-bold">{pattern.conversionRate}%</span>
                  </div>
                </Stack>
              </Stack>
            )
          )}
        </div>
      </AnimatedCard>

      {/* Annotation Quality & Study Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annotation Quality */}
        <AnimatedCard className="classical-card p-6">
          <Inline
            as="h3"
            gap={2}
            className="text-lg font-bold text-theme-primary mb-4"
          >
            <PiHeart className="w-5 h-5" />
            <span>⭐ Qualidade das Anotações</span>
          </Inline>

          <Stack>
            <Stack
              gap={1}
              className="text-center p-4 bg-theme-secondary rounded-xl"
            >
              <div className="text-3xl font-bold">
                {educational.annotationQualityMetrics.avgHelpfulnessScore.toFixed(
                  1
                )}
                ⭐
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Score Médio de Utilidade
              </Text>
            </Stack>

            <Stack gap={2}>
              <h4 className="font-medium text-theme-primary">
                🏆 Top Contribuidores:
              </h4>
              <Stack gap={2}>
                {educational.annotationQualityMetrics.topContributors
                  .slice(0, 5)
                  .map((contributor: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-theme-secondary rounded"
                    >
                      <Text papel="rotulo" tom="forte">
                        {contributor.username}
                      </Text>
                      <Inline gap={2}>
                        <span className="text-sm font-bold">
                          {contributor.qualityScore}%
                        </span>
                        <Text papel="legenda" tom="fraco">
                          ({contributor.totalAnnotations})
                        </Text>
                      </Inline>
                    </div>
                  ))}
              </Stack>
            </Stack>
          </Stack>
        </AnimatedCard>

        {/* Study Session Analysis */}
        <AnimatedCard className="classical-card p-6">
          <Inline
            as="h3"
            gap={2}
            className="text-lg font-bold text-theme-primary mb-4"
          >
            <PiClock className="w-5 h-5" />
            <span>⏰ Padrões de Estudo</span>
          </Inline>

          <Stack>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-theme-secondary rounded-xl">
                <div className="text-xl font-bold">
                  {educational.studySessionAnalysis.optimalSessionLength}min
                </div>
                <Text papel="legenda" tom="fraco" as="div">
                  Sessão Ideal
                </Text>
              </div>
              <div className="text-center p-3 bg-theme-secondary rounded-xl">
                <div className="text-lg font-bold">
                  {educational.studySessionAnalysis.peakStudyTimes[0] || 'N/A'}
                </div>
                <Text papel="legenda" tom="fraco" as="div">
                  Horário Pico
                </Text>
              </div>
            </div>

            <Stack gap={2}>
              <h4 className="font-medium text-theme-primary">
                📅 Padrões Semanais:
              </h4>
              <Stack gap={1}>
                {Object.entries(
                  educational.studySessionAnalysis.weeklyPatterns
                ).map(([day, percentage]: [string, any]) => (
                  <div key={day} className="flex items-center justify-between">
                    <Text papel="rotulo" tom="suave">
                      {day}
                    </Text>
                    <Inline gap={2}>
                      <div className="w-16 h-2 bg-theme-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <Text papel="legenda" tom="fraco" className="w-8">
                        {percentage}%
                      </Text>
                    </Inline>
                  </div>
                ))}
              </Stack>
            </Stack>

            <Stack gap={2}>
              <h4 className="font-medium text-theme-primary">
                🌦️ Tendências Sazonais:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(
                  educational.studySessionAnalysis.seasonalTrends
                ).map(([season, intensity]: [string, any]) => (
                  <div key={season} className="flex justify-between">
                    <span className="text-theme-secondary">{season}</span>
                    <span className="font-medium">{intensity}%</span>
                  </div>
                ))}
              </div>
            </Stack>
          </Stack>
        </AnimatedCard>
      </div>
    </div>
  );
}

// Continue with other section components...
function UserJourneySection({
  userJourney,
  onRefreshModule,
  isGenerating,
}: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiMapPin className="w-6 h-6" />
            <span>🗺️ Jornadas de Usuário</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('user-journey')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      {/* Typical User Journeys */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiUsers className="w-5 h-5" />
          <span>👥 Jornadas Típicas por Perfil</span>
        </Inline>

        <Stack gap={6}>
          {userJourney.typicalJourneys.map((journey: any, index: number) => (
            <div key={index} className="p-4 bg-theme-secondary rounded-xl">
              <h4 className="font-bold text-theme-primary mb-4 capitalize">
                {journey.userType.replace('_', ' ').toLowerCase()}
              </h4>

              {/* Journey Stages */}
              <Inline gap={2} className="mb-4 overflow-x-auto pb-2">
                {journey.stages.map((stage: any, stageIndex: number) => (
                  <Inline gap={2} key={stageIndex} className="flex-shrink-0">
                    <div className="text-center min-w-24">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold ${
                          stage.completionRate >= 70
                            ? 'text-white'
                            : stage.completionRate >= 40
                              ? 'text-white'
                              : 'text-white'
                        }`}
                      >
                        {stage.completionRate}%
                      </div>
                      <Text
                        papel="legenda"
                        tom="fraco"
                        as="div"
                        className="mt-1"
                      >
                        {stage.stage}
                      </Text>
                      <Text papel="legenda" tom="fraco" as="div">
                        {stage.avgDuration}d
                      </Text>
                    </div>
                    {stageIndex < journey.stages.length - 1 && (
                      <div className="w-8 h-0.5 bg-theme-tertiary"></div>
                    )}
                  </Inline>
                ))}
              </Inline>

              {/* Success Factors and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Stack gap={2}>
                  <p className="text-theme-tertiary">✅ Fatores de Sucesso:</p>
                  <ul className="space-y-1">
                    {journey.successFactors.map((factor: string, i: number) => (
                      <Inline as="li" gap={1} key={i} className="">
                        <span>•</span>
                        <span>{factor}</span>
                      </Inline>
                    ))}
                  </ul>
                </Stack>
                <Stack gap={2}>
                  <p className="text-theme-tertiary">💡 Recomendações:</p>
                  <ul className="space-y-1">
                    {journey.recommendations.map((rec: string, i: number) => (
                      <Inline as="li" gap={1} key={i} className="">
                        <span>•</span>
                        <span>{rec}</span>
                      </Inline>
                    ))}
                  </ul>
                </Stack>
              </div>
            </div>
          ))}
        </Stack>
      </AnimatedCard>

      {/* Conversion Funnels */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiFunnel className="w-5 h-5" />
          <span>🔄 Funis de Conversão</span>
        </Inline>

        <Stack>
          {userJourney.conversionFunnels.map((funnel: any, index: number) => (
            <Stack
              gap={3}
              key={index}
              className="p-4 bg-theme-secondary rounded-xl"
            >
              <div className="flex items-center justify-between">
                <Inline gap={3}>
                  <Text papel="rotulo" tom="suave">
                    {funnel.from}
                  </Text>
                  <span className="text-theme-tertiary">→</span>
                  <Text papel="rotulo" tom="forte" className="font-medium">
                    {funnel.to}
                  </Text>
                </Inline>
                <Inline gap={3}>
                  <span
                    className={`text-lg font-bold ${
                      funnel.conversionRate >= 50
                        ? ''
                        : funnel.conversionRate >= 25
                          ? ''
                          : ''
                    }`}
                  >
                    {funnel.conversionRate}%
                  </span>
                  <Text papel="rotulo" tom="fraco">
                    ~{funnel.timeToConvert}d
                  </Text>
                </Inline>
              </div>

              <div className="w-full bg-theme-primary h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    funnel.conversionRate >= 50
                      ? 'bg-green-300'
                      : funnel.conversionRate >= 25
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                  }`}
                  style={{ width: `${funnel.conversionRate}%` }}
                />
              </div>

              <Stack gap={1}>
                <Text papel="legenda" tom="fraco" as="p">
                  🚀 Oportunidades de melhoria:
                </Text>
                <div className="flex flex-wrap gap-1">
                  {funnel.improvementOpportunities.map(
                    (opportunity: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded text-xs">
                        {opportunity}
                      </span>
                    )
                  )}
                </div>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </AnimatedCard>

      {/* User Segments */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiChartPie className="w-5 h-5" />
          <span>🎯 Segmentação de Usuários</span>
        </Inline>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userJourney.userSegments.map((segment: any, index: number) => (
            <Stack
              gap={3}
              key={index}
              className="p-4 bg-theme-secondary rounded-xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-theme-primary capitalize">
                  {segment.segment}
                </h4>
                <span className="text-sm font-bold">
                  {formatNumber(segment.size)} usuários
                </span>
              </div>

              <Stack gap={3}>
                <Stack gap={1}>
                  <Text papel="legenda" tom="fraco" as="p">
                    Características:
                  </Text>
                  <Stack gap={1}>
                    {segment.characteristics.map((char: string, i: number) => (
                      <Inline
                        gap={1}
                        key={i}
                        className="text-xs text-theme-secondary"
                      >
                        <span>•</span>
                        <span>{char}</span>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-theme-primary rounded">
                    <div className="font-bold">{segment.engagementLevel}%</div>
                    <div className="text-theme-tertiary">Engajamento</div>
                  </div>
                  <div className="text-center p-2 bg-theme-primary rounded">
                    <div className="font-bold">
                      {segment.revenueContribution}%
                    </div>
                    <div className="text-theme-tertiary">Receita</div>
                  </div>
                </div>

                <div className="text-center">
                  <Text papel="legenda" tom="fraco" as="p">
                    Potencial de crescimento:
                  </Text>
                  <p className="text-xs font-medium">
                    {segment.growthPotential}
                  </p>
                </div>
              </Stack>
            </Stack>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}

// Continue with remaining sections... (due to length limits, I'll provide the essential ones)

function RiskAssessmentSection({
  riskAssessment,
  onRefreshModule,
  isGenerating,
}: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiShield className="w-6 h-6" />
            <span>⚠️ Avaliação de Riscos</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('risk')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      {/* High Risk Users */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiUsers className="w-5 h-5" />
          <span>🚨 Usuários em Alto Risco de Churn</span>
        </Inline>

        {riskAssessment.churnRiskUsers.length === 0 ? (
          <div className="text-center py-8">
            <PiCheckCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="text-theme-secondary">
              Nenhum usuário em alto risco detectado!
            </p>
          </div>
        ) : (
          <Stack>
            {riskAssessment.churnRiskUsers
              .slice(0, 10)
              .map((user: any, index: number) => (
                <Stack
                  gap={3}
                  key={index}
                  className="p-4 bg-theme-secondary rounded-xl border-l-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-theme-primary">
                        {user.username}
                      </h4>
                      <Text papel="rotulo" tom="fraco" as="p">
                        Última atividade:{' '}
                        {new Date(user.lastActivity).toLocaleDateString(
                          'pt-BR'
                        )}
                      </Text>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{user.riskScore}%</div>
                      <Text papel="legenda" tom="fraco" as="div">
                        Risco
                      </Text>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <Stack gap={1}>
                      <p className="text-theme-tertiary">
                        ⚠️ Fatores de risco:
                      </p>
                      <ul className="space-y-1">
                        {user.riskFactors.map((factor: string, i: number) => (
                          <Inline as="li" gap={1} key={i} className="">
                            <span>•</span>
                            <span>{factor}</span>
                          </Inline>
                        ))}
                      </ul>
                    </Stack>
                    <Stack gap={1}>
                      <p className="text-theme-tertiary">💡 Ações sugeridas:</p>
                      <ul className="space-y-1">
                        {user.suggestedActions.map(
                          (action: string, i: number) => (
                            <Inline as="li" gap={1} key={i} className="">
                              <span>•</span>
                              <span>{action}</span>
                            </Inline>
                          )
                        )}
                      </ul>
                    </Stack>
                  </div>
                </Stack>
              ))}
          </Stack>
        )}
      </AnimatedCard>

      {/* System Health Indicators */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiPulse className="w-5 h-5" />
          <span>💚 Indicadores de Saúde do Sistema</span>
        </Inline>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskAssessment.systemHealthIndicators.map(
            (indicator: any, index: number) => (
              <Stack
                gap={3}
                key={index}
                className="p-4 bg-theme-secondary rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-theme-primary">
                    {indicator.metric}
                  </h4>
                  <span
                    className={`w-4 h-4 rounded-full ${
                      indicator.status === 'healthy'
                        ? ''
                        : indicator.status === 'warning'
                          ? ''
                          : ''
                    }`}
                  />
                </div>

                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      indicator.status === 'healthy'
                        ? ''
                        : indicator.status === 'warning'
                          ? ''
                          : ''
                    }`}
                  >
                    {formatNumber(indicator.currentValue)}
                  </div>
                  <Text papel="legenda" tom="fraco" as="div">
                    Ideal: {indicator.healthyRange.min} -{' '}
                    {indicator.healthyRange.max}
                  </Text>
                </div>

                <Inline gap={2} className="justify-center text-xs">
                  <span
                    className={`${
                      indicator.trend === 'improving'
                        ? ''
                        : indicator.trend === 'declining'
                          ? ''
                          : 'text-theme-tertiary'
                    }`}
                  >
                    {indicator.trend === 'improving'
                      ? '📈'
                      : indicator.trend === 'declining'
                        ? '📉'
                        : '➡️'}
                  </span>
                  <span className="text-theme-tertiary capitalize">
                    {indicator.trend}
                  </span>
                </Inline>
              </Stack>
            )
          )}
        </div>
      </AnimatedCard>
    </div>
  );
}

// Additional essential sections...

function GrowthOpportunitiesSection({
  opportunities,
  onRefreshModule,
  isGenerating,
}: any) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user_acquisition':
        return '🎯';
      case 'engagement':
        return '❤️';
      case 'retention':
        return '🔒';
      case 'monetization':
        return '💰';
      default:
        return '📈';
    }
  };

  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiTrendUp className="w-6 h-6" />
            <span>🚀 Oportunidades de Crescimento</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('growth')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {opportunities.map((opportunity: any, index: number) => (
          <AnimatedCard key={index} className="classical-card p-6">
            <div className="flex items-start justify-between mb-4">
              <Inline gap={3}>
                <span className="text-2xl">
                  {getCategoryIcon(opportunity.category)}
                </span>
                <div>
                  <h3 className="font-bold text-theme-primary">
                    {opportunity.opportunity}
                  </h3>
                  <Text
                    papel="rotulo"
                    tom="fraco"
                    as="p"
                    className="capitalize"
                  >
                    {opportunity.category.replace('_', ' ')} •{' '}
                    {opportunity.timeline}
                  </Text>
                </div>
              </Inline>
              <div className="flex space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                    opportunity.impact
                  )}`}
                >
                  {opportunity.impact.toUpperCase()}
                </span>
              </div>
            </div>

            <Stack>
              <Stack gap={2}>
                <h4 className="text-sm font-medium text-theme-primary">
                  🎯 Resultados Esperados:
                </h4>
                <ul className="space-y-1">
                  {opportunity.expectedResults.map(
                    (result: string, i: number) => (
                      <Inline as="li" gap={1} key={i} className="text-sm">
                        <span>•</span>
                        <span>{result}</span>
                      </Inline>
                    )
                  )}
                </ul>
              </Stack>

              <Stack gap={2}>
                <h4 className="text-sm font-medium text-theme-primary">
                  🛠️ Implementação:
                </h4>
                <ul className="space-y-1">
                  {opportunity.implementation
                    .slice(0, 3)
                    .map((step: string, i: number) => (
                      <Inline
                        as="li"
                        gap={1}
                        key={i}
                        className="text-sm text-theme-secondary"
                      >
                        <span>{i + 1}.</span>
                        <span>{step}</span>
                      </Inline>
                    ))}
                </ul>
              </Stack>

              <div className="pt-3 border-t border-theme-secondary">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-tertiary">
                    Esforço necessário:
                  </span>
                  <span
                    className={`font-medium ${
                      opportunity.effort === 'low'
                        ? ''
                        : opportunity.effort === 'medium'
                          ? ''
                          : ''
                    }`}
                  >
                    {opportunity.effort === 'low'
                      ? '🟢 Baixo'
                      : opportunity.effort === 'medium'
                        ? '🟡 Médio'
                        : '🔴 Alto'}
                  </span>
                </div>
              </div>
            </Stack>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
}

function MonetizationSection({
  monetization,
  onRefreshModule,
  isGenerating,
}: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiCurrencyDollar className="w-6 h-6" />
            <span>💰 Insights de Monetização</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('monetization')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      {/* Ad Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard className="classical-card p-6 text-center">
          <PiChartBar className="w-8 h-8 mx-auto mb-3" />
          <div className="text-2xl font-bold text-theme-primary">
            {monetization.adPerformance.overallCTR.toFixed(2)}%
          </div>
          <Text papel="rotulo" tom="fraco" as="div">
            CTR Geral
          </Text>
        </AnimatedCard>

        <AnimatedCard className="classical-card p-6 text-center">
          <PiCurrencyDollar className="w-8 h-8 mx-auto mb-3" />
          <div className="text-2xl font-bold text-theme-primary">
            ${monetization.adPerformance.revenuePerUser.toFixed(2)}
          </div>
          <Text papel="rotulo" tom="fraco" as="div">
            Receita por Usuário
          </Text>
        </AnimatedCard>

        <AnimatedCard className="classical-card p-6 text-center">
          <PiTrendUp className="w-8 h-8 mx-auto mb-3" />
          <div className="text-2xl font-bold text-theme-primary">
            {monetization.adPerformance.topPerformingAds.length}
          </div>
          <Text papel="rotulo" tom="fraco" as="div">
            Anúncios de Alto Desempenho
          </Text>
        </AnimatedCard>
      </div>

      {/* User Value Segmentation */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiUsers className="w-5 h-5" />
          <span>👥 Segmentação por Valor do Usuário</span>
        </Inline>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monetization.userValueSegmentation.map(
            (segment: any, index: number) => (
              <Stack
                gap={3}
                key={index}
                className="p-4 bg-theme-secondary rounded-xl"
              >
                <h4 className="font-bold text-theme-primary">
                  {segment.segment}
                </h4>

                <Stack gap={2} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Usuários:</span>
                    <span className="font-medium text-theme-primary">
                      {formatNumber(segment.userCount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Receita Média:</span>
                    <span className="font-medium">
                      ${segment.avgRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Engajamento:</span>
                    <span className="font-medium">
                      {segment.engagementScore}%
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <Text papel="legenda" tom="fraco" as="p">
                      Potencial de crescimento:
                    </Text>
                    <p className="text-xs font-medium">
                      {segment.growthPotential}
                    </p>
                  </div>
                </Stack>
              </Stack>
            )
          )}
        </div>
      </AnimatedCard>

      {/* Monetization Opportunities */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiLightning className="w-5 h-5" />
          <span>⚡ Oportunidades de Monetização</span>
        </Inline>

        <Stack>
          {monetization.monetizationOpportunities.map(
            (opportunity: any, index: number) => (
              <Stack
                gap={3}
                key={index}
                className="p-4 bg-theme-secondary rounded-xl"
              >
                <h4 className="font-bold text-theme-primary">
                  {opportunity.opportunity}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <Stack gap={1}>
                    <p className="text-theme-tertiary">💰 Receita Estimada:</p>
                    <p className="font-medium">
                      {opportunity.estimatedRevenue}
                    </p>
                  </Stack>
                  <Stack gap={1}>
                    <p className="text-theme-tertiary">💸 Investimento:</p>
                    <p className="font-medium">
                      {opportunity.requiredInvestment}
                    </p>
                  </Stack>
                  <Stack gap={1}>
                    <p className="text-theme-tertiary">📊 Viabilidade:</p>
                    <p className="font-medium">{opportunity.feasibility}</p>
                  </Stack>
                </div>
              </Stack>
            )
          )}
        </Stack>
      </AnimatedCard>
    </div>
  );
}

// More sections can be added similarly...
function BehaviorPatternsSection({
  patterns,
  onRefreshModule,
  isGenerating,
}: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiBrain className="w-6 h-6" />
            <span>🧠 Padrões de Comportamento</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('patterns')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      <div className="space-y-6">
        {patterns.map((pattern: any, index: number) => (
          <AnimatedCard key={index} className="classical-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Inline gap={3} className="mb-3">
                  <h3 className="text-xl font-bold text-theme-primary">
                    {pattern.pattern}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                      pattern.impact
                    )}`}
                  >
                    Impacto{' '}
                    {pattern.impact === 'high'
                      ? 'Alto'
                      : pattern.impact === 'medium'
                        ? 'Médio'
                        : 'Baixo'}
                  </span>
                  <Text
                    papel="legenda"
                    tom="fraco"
                    className="px-2 py-1 rounded-full font-medium bg-theme-secondary"
                  >
                    {pattern.confidence}% confiança
                  </Text>
                </Inline>

                <p className="text-theme-secondary mb-4">
                  {pattern.description}
                </p>

                <div className="bg-theme-secondary p-4 rounded-xl">
                  <Text papel="rotulo" tom="forte" as="p">
                    <strong>🎯 Recomendação IA:</strong>{' '}
                    {pattern.recommendation}
                  </Text>
                </div>
              </div>

              <div className="text-right ml-6">
                <div className="text-3xl font-bold mb-1">
                  {pattern.prevalence.toFixed(1)}%
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  prevalência
                </Text>
                <Text papel="legenda" tom="fraco" as="div" className="mt-1">
                  {formatNumber(pattern.dataPoints)} dados
                </Text>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
}

function ContentPerformanceSection({
  contentPerformance,
  onRefreshModule,
  isGenerating,
}: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiChartBar className="w-6 h-6" />
            <span>📊 Performance de Conteúdo</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('content')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      {/* Top Performers vs Underperformers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <AnimatedCard className="classical-card p-6">
          <Inline
            as="h3"
            gap={2}
            className="text-lg font-bold text-theme-primary mb-4"
          >
            <PiMedal className="w-5 h-5" />
            <span>🏆 Top Performers</span>
          </Inline>
          <Stack gap={3}>
            {contentPerformance.topPerformers
              .slice(0, 5)
              .map((item: any, index: number) => (
                <div key={index} className="p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Text
                      papel="legenda"
                      tom="forte"
                      as="div"
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                    >
                      {index + 1}
                    </Text>
                    <div className="flex-1">
                      <p className="font-medium text-theme-primary">
                        {item.name}
                      </p>
                      <Text
                        papel="legenda"
                        tom="fraco"
                        as="p"
                        className="mb-2 capitalize"
                      >
                        {item.type}
                      </Text>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span>❤️ {formatNumber(item.metrics.favorites)}</span>
                        <span>📝 {formatNumber(item.metrics.annotations)}</span>
                        <span>
                          ⏱️ {formatNumber(item.metrics.studyTime)}min
                        </span>
                        <span>👁️ {formatNumber(item.metrics.views)}</span>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${getTrendColor(
                        item.trend > 0 ? 'up' : 'down'
                      )}`}
                    >
                      {item.trend > 0 ? '+' : ''}
                      {item.trend.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </Stack>
        </AnimatedCard>

        {/* Underperformers */}
        <AnimatedCard className="classical-card p-6">
          <Inline
            as="h3"
            gap={2}
            className="text-lg font-bold text-theme-primary mb-4"
          >
            <PiTrendDown className="w-5 h-5" />
            <span>📈 Oportunidades de Melhoria</span>
          </Inline>
          <Stack>
            {contentPerformance.underperformers.map(
              (item: any, index: number) => (
                <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                  <h4 className="font-medium text-theme-primary mb-2">
                    {item.name}
                  </h4>

                  <Stack gap={1} className="mb-3">
                    <Text papel="legenda" tom="fraco" as="p">
                      ⚠️ Problemas identificados:
                    </Text>
                    <Stack gap={1}>
                      {item.issues.map((issue: string, i: number) => (
                        <Inline gap={1} key={i} className="text-xs">
                          <span>•</span>
                          <span>{issue}</span>
                        </Inline>
                      ))}
                    </Stack>
                  </Stack>

                  <Stack gap={1} className="mb-3">
                    <Text papel="legenda" tom="fraco" as="p">
                      💡 Sugestões IA:
                    </Text>
                    <Stack gap={1}>
                      {item.suggestions.map((suggestion: string, i: number) => (
                        <Inline gap={1} key={i} className="text-xs">
                          <span>•</span>
                          <span>{suggestion}</span>
                        </Inline>
                      ))}
                    </Stack>
                  </Stack>

                  <div className="p-2 rounded text-xs">
                    <strong>📊 Impacto esperado:</strong> {item.potentialImpact}
                  </div>
                </div>
              )
            )}
          </Stack>
        </AnimatedCard>
      </div>

      {/* Content Optimization Recommendations */}
      <AnimatedCard className="classical-card p-6">
        <Inline
          as="h3"
          gap={2}
          className="text-lg font-bold text-theme-primary mb-4"
        >
          <PiLightning className="w-5 h-5" />
          <span>🎯 Recomendações de Otimização</span>
        </Inline>
        <Stack gap={3}>
          {contentPerformance.contentOptimization
            .sort((a: any, b: any) => b.priority - a.priority)
            .map((rec: any, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-theme-secondary rounded-xl"
              >
                <Text
                  papel="rotulo"
                  tom="forte"
                  as="div"
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                >
                  {rec.priority}
                </Text>
                <div className="flex-1">
                  <h4 className="font-medium text-theme-primary mb-1">
                    {rec.recommendation}
                  </h4>
                  <Text papel="rotulo" tom="suave" as="p" className="mb-2">
                    {rec.expectedImpact}
                  </Text>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.effort === 'high'
                        ? ''
                        : rec.effort === 'medium'
                          ? ''
                          : ''
                    }`}
                  >
                    Esforço:{' '}
                    {rec.effort === 'high'
                      ? 'Alto'
                      : rec.effort === 'medium'
                        ? 'Médio'
                        : 'Baixo'}
                  </span>
                </div>
              </div>
            ))}
        </Stack>
      </AnimatedCard>
    </div>
  );
}

function AnomaliesSection({ anomalies, onRefreshModule, isGenerating }: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <Inline
            as="h2"
            gap={2}
            className="text-2xl font-bold text-theme-primary"
          >
            <PiWarning className="w-6 h-6" />
            <span>🔍 Detecção de Anomalias</span>
          </Inline>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <PiArrowsClockwise
                className={isGenerating ? 'animate-spin' : ''}
              />
            }
            onClick={() => onRefreshModule('anomalies')}
            disabled={isGenerating}
          >
            Atualizar Análise
          </Button>
        </div>
      </AnimatedItem>

      {anomalies.length === 0 ? (
        <AnimatedCard className="classical-card p-8 text-center">
          <PiCheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-theme-primary mb-2">
            ✅ Sistema Operando Normalmente
          </h3>
          <p className="text-theme-secondary">
            Nenhuma anomalia significativa detectada pela IA.
          </p>
        </AnimatedCard>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly: any, index: number) => {
            const severityIcon =
              anomaly.severity === 'critical'
                ? PiWarning
                : anomaly.severity === 'warning'
                  ? PiInfo
                  : PiCheckCircle;
            const SeverityIcon = severityIcon;

            return (
              <AnimatedCard
                key={index}
                className={`classical-card p-6 border-l-4 ${getSeverityColor(
                  anomaly.severity
                )}`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityColor(
                      anomaly.severity
                    )}`}
                  >
                    <SeverityIcon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <Inline gap={3} className="mb-2">
                      <h3 className="text-lg font-bold text-theme-primary">
                        {anomaly.type === 'spike'
                          ? '📈 Pico Anômalo'
                          : anomaly.type === 'drop'
                            ? '📉 Queda Anômala'
                            : '🔍 Comportamento Incomum'}{' '}
                        - {anomaly.metric}
                      </h3>
                      <Text papel="rotulo" tom="fraco">
                        {new Date(anomaly.timestamp).toLocaleString('pt-BR')}
                      </Text>
                    </Inline>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-theme-secondary rounded-xl">
                        <div className="text-lg font-bold text-theme-primary">
                          {formatNumber(anomaly.value)}
                        </div>
                        <Text papel="legenda" tom="fraco" as="div">
                          Valor Detectado
                        </Text>
                      </div>
                      <div className="text-center p-3 bg-theme-secondary rounded-xl">
                        <div className="text-lg font-bold">
                          {formatNumber(anomaly.expectedRange.min)}-
                          {formatNumber(anomaly.expectedRange.max)}
                        </div>
                        <Text papel="legenda" tom="fraco" as="div">
                          Faixa Esperada
                        </Text>
                      </div>
                      <div className="text-center p-3 bg-theme-secondary rounded-xl">
                        <div className="text-lg font-bold">
                          {anomaly.deviation.toFixed(1)}%
                        </div>
                        <Text papel="legenda" tom="fraco" as="div">
                          Desvio
                        </Text>
                      </div>
                      <div className="text-center p-3 bg-theme-secondary rounded-xl">
                        <div
                          className={`text-lg font-bold ${
                            anomaly.severity === 'critical'
                              ? ''
                              : anomaly.severity === 'warning'
                                ? ''
                                : ''
                          }`}
                        >
                          {anomaly.severity === 'critical'
                            ? '🚨 Crítico'
                            : anomaly.severity === 'warning'
                              ? '⚠️ Atenção'
                              : 'ℹ️ Info'}
                        </div>
                        <Text papel="legenda" tom="fraco" as="div">
                          Severidade
                        </Text>
                      </div>
                    </div>

                    <Stack gap={2}>
                      <Text papel="rotulo" tom="suave" as="p">
                        🔍 Possíveis causas identificadas pela IA:
                      </Text>
                      <Stack gap={1}>
                        {anomaly.possibleCauses.map(
                          (cause: string, i: number) => (
                            <Inline
                              gap={2}
                              key={i}
                              className="text-sm text-theme-primary"
                            >
                              <div className="w-2 h-2 rounded-full"></div>
                              <span>{cause}</span>
                            </Inline>
                          )
                        )}
                      </Stack>
                    </Stack>

                    {anomaly.affectedUsers && (
                      <div className="mt-3 p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>👥 Impacto:</strong>{' '}
                          {formatNumber(anomaly.affectedUsers)} usuários podem
                          ter sido afetados
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
