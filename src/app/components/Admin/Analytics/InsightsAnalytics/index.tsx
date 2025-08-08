// app/components/Admin/Analytics/InsightsAnalytics.tsx
'use client';

import { useState } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiZap,
  FiTarget,
  FiActivity,
  FiUsers,
  FiRefreshCw,
  FiDownload,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiBarChart2,
  FiClock,
  FiEye,
  FiMapPin,
  FiShield,
  FiTrendingUp as FiGrowth,
  FiDollarSign,
  FiLayers,
  FiCpu,
  FiHeart,
  FiAward,
  FiFlag,
  FiFilter,
  FiPieChart,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';

import { useAdminInsights } from '@/app/hooks/admin/useAdminInsights';
import toast from 'react-hot-toast';
import { formatNumber } from '../../Utils';
import LoadingAdminState from '../../Common/LoadingState';
import { BiBrain } from 'react-icons/bi';

// ===== UTILITY FUNCTIONS (Moved outside component for reusability) =====
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

const getRiskColor = (level: string) => {
  switch (level) {
    case 'critical':
      return 'text-accent-red bg-accent-red/10';
    case 'high':
      return 'text-accent-amber bg-accent-amber/10';
    case 'medium':
      return 'text-accent-blue bg-accent-blue/10';
    case 'low':
      return 'text-accent-green bg-accent-green/10';
    default:
      return 'text-theme-tertiary bg-theme-secondary';
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'critical':
      return 'text-accent-purple bg-accent-purple/10';
    case 'high':
      return 'text-accent-red bg-accent-red/10';
    case 'medium':
      return 'text-accent-amber bg-accent-amber/10';
    case 'low':
      return 'text-accent-green bg-accent-green/10';
    default:
      return 'text-theme-tertiary bg-theme-secondary';
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
    } catch (error) {
      toast.error('Erro ao atualizar insights');
    }
  };

  const handleRefreshModule = async (module: string) => {
    try {
      await refreshModule(module);
      toast.success(`Módulo ${module} atualizado!`);
    } catch (error) {
      toast.error(`Erro ao atualizar ${module}`);
    }
  };

  const handleGeneratePrediction = async (metric: string) => {
    try {
      await generatePrediction(metric, timeframe);
      toast.success('Previsão gerada com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar previsão');
    }
  };

  const handleExportInsights = async () => {
    try {
      await exportInsights();
      toast.success('Insights exportados com sucesso!');
    } catch (error) {
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
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-theme-primary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Erro ao Carregar Analytics IA
            </h3>
            <p className="text-theme-secondary mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={handleRefresh}
              leftIcon={<FiRefreshCw />}
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
          <BiBrain className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Nenhum Insight Disponível
          </h2>
          <p className="text-theme-secondary mb-6">
            Aguarde enquanto a IA processa os dados...
          </p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            leftIcon={<FiRefreshCw />}
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <BiBrain className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              AI Analytics Dashboard
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle mb-6">
              Sistema Avançado de Inteligência Educacional
            </p>

            {/* Enhanced Health Metrics */}
            <div className="flex items-center justify-center space-x-8 mt-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold mb-2 ${
                    insights.summary.healthScore >= 80
                      ? 'text-accent-green'
                      : insights.summary.healthScore >= 60
                      ? 'text-accent-amber'
                      : 'text-accent-red'
                  }`}
                >
                  {insights.summary.healthScore}/100
                </div>
                <div className="text-sm text-theme-tertiary">System Health</div>
                <div className="w-20 h-2 bg-theme-secondary rounded-full overflow-hidden mx-auto mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      insights.summary.healthScore >= 80
                        ? 'bg-gradient-to-r from-accent-green to-accent-blue'
                        : insights.summary.healthScore >= 60
                        ? 'bg-gradient-to-r from-accent-amber to-accent-green'
                        : 'bg-gradient-to-r from-accent-red to-accent-amber'
                    }`}
                    style={{ width: `${insights.summary.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`text-lg font-bold mb-2 ${
                    insights.summary.trendDirection === 'positive'
                      ? 'text-accent-green'
                      : insights.summary.trendDirection === 'negative'
                      ? 'text-accent-red'
                      : 'text-theme-tertiary'
                  }`}
                >
                  {insights.summary.trendDirection === 'positive'
                    ? '📈 Crescendo'
                    : insights.summary.trendDirection === 'negative'
                    ? '📉 Atenção'
                    : '➡️ Estável'}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Tendência Geral
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-accent-purple mb-2">
                  v{version}
                </div>
                <div className="text-sm text-theme-tertiary">AI Engine</div>
              </div>

              {lastUpdated && (
                <div className="text-center">
                  <div className="text-sm text-theme-primary font-medium">
                    {new Date(lastUpdated).toLocaleTimeString('pt-BR')}
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    {processingTime && `${processingTime}ms`} • Última análise
                  </div>
                </div>
              )}
            </div>
          </div>
        </AnimatedItem>

        {/* Critical Alerts */}
        {insights.anomalies.filter((a) => a.severity === 'critical').length >
          0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mb-8 border-l-4 border-accent-red">
              <div className="flex items-center space-x-3 mb-4">
                <FiAlertTriangle className="w-6 h-6 text-accent-red" />
                <h3 className="text-xl font-bold text-theme-primary">
                  ⚠️ Alertas Críticos Detectados
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.anomalies
                  .filter((anomaly) => anomaly.severity === 'critical')
                  .slice(0, 4)
                  .map((anomaly, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-accent-red/5 rounded-xl border border-accent-red/20"
                    >
                      <h4 className="font-bold text-accent-red mb-2">
                        {anomaly.metric}
                      </h4>
                      <p className="text-sm text-theme-secondary mb-2">
                        Valor: {formatNumber(anomaly.value)} (desvio:{' '}
                        {anomaly.deviation.toFixed(1)}%)
                      </p>
                      <p className="text-xs text-theme-tertiary">
                        {anomaly.possibleCauses[0]}
                      </p>
                    </div>
                  ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Quick Stats Overview */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard className="classical-card p-6 text-center">
              <FiUsers className="w-8 h-8 text-accent-blue mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {insights.riskAssessment.churnRiskUsers.length}
              </div>
              <div className="text-sm text-theme-tertiary">
                Usuários em Risco
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <FiGrowth className="w-8 h-8 text-accent-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {
                  insights.growthOpportunities.filter(
                    (o) => o.impact === 'high' || o.impact === 'critical'
                  ).length
                }
              </div>
              <div className="text-sm text-theme-tertiary">
                Oportunidades Alto Impacto
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <FiFlag className="w-8 h-8 text-accent-amber mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {insights.anomalies.length}
              </div>
              <div className="text-sm text-theme-tertiary">
                Anomalias Detectadas
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <FiAward className="w-8 h-8 text-accent-purple mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary">
                {insights.educationalEngagement.learningProgressions.length}
              </div>
              <div className="text-sm text-theme-tertiary">
                Padrões de Aprendizado
              </div>
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
            <div className="flex flex-wrap items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw
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
                leftIcon={<FiDownload />}
                onClick={handleExportInsights}
                disabled={isGenerating}
              >
                Exportar
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiZap />}
                onClick={() => handleGeneratePrediction('overall')}
                disabled={isGenerating}
              >
                {isGenerating ? 'Processando...' : 'Nova Análise'}
              </Button>
            </div>
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
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiClock className="w-5 h-5 text-accent-purple" />
                <span>🎯 Próximas Ações Prioritárias</span>
              </h3>

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
                          ? 'bg-accent-red/10 border-accent-red'
                          : item.priority === 'medium'
                          ? 'bg-accent-amber/10 border-accent-amber'
                          : 'bg-accent-green/10 border-accent-green'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.priority === 'high'
                                  ? 'bg-accent-red text-white'
                                  : item.priority === 'medium'
                                  ? 'bg-accent-amber text-white'
                                  : 'bg-accent-green text-white'
                              }`}
                            >
                              {item.priority === 'high'
                                ? '🔥 URGENTE'
                                : item.priority === 'medium'
                                ? '⚡ IMPORTANTE'
                                : '📋 NORMAL'}
                            </span>
                            <span className="text-xs text-theme-tertiary">
                              ⏱️ {item.timeframe}
                            </span>
                          </div>
                          <h4 className="font-medium text-theme-primary mb-1">
                            {item.action}
                          </h4>
                          <p className="text-sm text-theme-secondary">
                            <strong>Impacto esperado:</strong>{' '}
                            {item.expectedImpact}
                          </p>
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
        <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
          <FiEye className="w-6 h-6 text-accent-blue" />
          <span>📊 Visão Geral Executiva</span>
        </h2>
      </AnimatedItem>

      {/* Key Findings */}
      {insights.summary.keyFindings.length > 0 && (
        <AnimatedCard className="classical-card p-6">
          <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
            <BiBrain className="w-5 h-5 text-accent-purple" />
            <span>🔍 Principais Descobertas da IA</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.summary.keyFindings.map(
              (finding: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-theme-secondary rounded-xl"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center text-xs font-bold text-theme-primary flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
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
            <h3 className="font-bold text-theme-primary flex items-center space-x-2">
              <FiAward className="w-5 h-5 text-accent-green" />
              <span>📚 Performance Educacional</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshModule('educational')}
              disabled={isGenerating}
            >
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">
                Taxa de Progressão
              </span>
              <span className="font-bold text-accent-green">
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
              <span className="text-sm text-theme-secondary">
                Qualidade Anotações
              </span>
              <span className="font-bold text-accent-blue">
                {insights.educationalEngagement.annotationQualityMetrics.avgHelpfulnessScore.toFixed(
                  1
                )}
                ⭐
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">
                Top Contribuidores
              </span>
              <span className="font-bold text-accent-purple">
                {
                  insights.educationalEngagement.annotationQualityMetrics
                    .topContributors.length
                }
              </span>
            </div>
          </div>
        </AnimatedCard>

        {/* Risk Monitoring */}
        <AnimatedCard className="classical-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-theme-primary flex items-center space-x-2">
              <FiShield className="w-5 h-5 text-accent-amber" />
              <span>⚠️ Monitoramento de Riscos</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshModule('risk')}
              disabled={isGenerating}
            >
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">
                Usuários em Risco
              </span>
              <span
                className={`font-bold ${
                  insights.riskAssessment.churnRiskUsers.length > 10
                    ? 'text-accent-red'
                    : insights.riskAssessment.churnRiskUsers.length > 5
                    ? 'text-accent-amber'
                    : 'text-accent-green'
                }`}
              >
                {insights.riskAssessment.churnRiskUsers.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">
                Riscos de Conteúdo
              </span>
              <span className="font-bold text-accent-amber">
                {insights.riskAssessment.contentRisks.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">
                Saúde do Sistema
              </span>
              <span
                className={`font-bold ${
                  insights.riskAssessment.systemHealthIndicators.every(
                    (i: any) => i.status === 'healthy'
                  )
                    ? 'text-accent-green'
                    : 'text-accent-amber'
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
          </div>
        </AnimatedCard>

        {/* Growth Potential */}
        <AnimatedCard className="classical-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-theme-primary flex items-center space-x-2">
              <FiGrowth className="w-5 h-5 text-accent-purple" />
              <span>🚀 Potencial de Crescimento</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshModule('growth')}
              disabled={isGenerating}
            >
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">Alto Impacto</span>
              <span className="font-bold text-accent-purple">
                {
                  insights.growthOpportunities.filter(
                    (o: any) => o.impact === 'high' || o.impact === 'critical'
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">
                Rápida Implementação
              </span>
              <span className="font-bold text-accent-green">
                {
                  insights.growthOpportunities.filter(
                    (o: any) => o.effort === 'low'
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">
                ROI Potencial
              </span>
              <span className="font-bold text-accent-blue">Alto</span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Real-time System Status */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiCpu className="w-5 h-5 text-accent-blue" />
          <span>⚡ Status do Sistema em Tempo Real</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.riskAssessment.systemHealthIndicators.map(
            (indicator: any, index: number) => (
              <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    {indicator.metric}
                  </span>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      indicator.status === 'healthy'
                        ? 'bg-accent-green'
                        : indicator.status === 'warning'
                        ? 'bg-accent-amber'
                        : 'bg-accent-red'
                    }`}
                  />
                </div>
                <div className="text-xl font-bold text-theme-primary mb-1">
                  {formatNumber(indicator.currentValue)}
                </div>
                <div className="text-xs text-theme-tertiary">
                  Ideal: {indicator.healthyRange.min}-
                  {indicator.healthyRange.max}
                </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiTarget className="w-6 h-6 text-accent-purple" />
            <span>🔮 Previsões Inteligentes</span>
          </h2>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FiZap />}
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
                <div>
                  <h3 className="font-bold text-theme-primary mb-1">
                    {prediction.metric}
                  </h3>
                  <p className="text-sm text-theme-tertiary">
                    Previsão para {prediction.timeframe}
                  </p>
                </div>
                <TrendIcon className={`w-6 h-6 ${trendColor}`} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-secondary">Atual</span>
                  <span className="text-2xl font-bold text-theme-primary">
                    {formatNumber(prediction.currentValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-secondary">Previsto</span>
                  <span className={`text-2xl font-bold ${trendColor}`}>
                    {formatNumber(prediction.predictedValue)}
                  </span>
                </div>

                <div className="pt-3 border-t border-theme-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-theme-tertiary">
                      Confiança da IA
                    </span>
                    <span className="text-xs font-medium text-accent-blue">
                      {prediction.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-1000"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-theme-secondary">
                  <p className="text-xs text-theme-tertiary mb-2">
                    Fatores chave:
                  </p>
                  <div className="space-y-1">
                    {prediction.factors
                      .slice(0, 3)
                      .map((factor: string, i: number) => (
                        <div
                          key={i}
                          className="text-xs text-theme-secondary flex items-center space-x-2"
                        >
                          <div className="w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                          <span>{factor}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {prediction.historicalData &&
                  prediction.historicalData.length > 0 && (
                    <div className="pt-3 border-t border-theme-secondary">
                      <p className="text-xs text-theme-tertiary mb-2">
                        Tendência histórica:
                      </p>
                      <div className="flex items-end space-x-1 h-8">
                        {prediction.historicalData.map(
                          (point: any, i: number) => (
                            <div
                              key={i}
                              className="bg-accent-blue/30 rounded-sm flex-1"
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
                    </div>
                  )}
              </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiAward className="w-6 h-6 text-accent-green" />
            <span>📚 Engajamento Educacional</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiTarget className="w-5 h-5 text-accent-blue" />
          <span>🎯 Progressões de Aprendizado</span>
        </h3>

        <div className="space-y-4">
          {educational.learningProgressions.map(
            (progression: any, index: number) => (
              <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-theme-primary">
                    {progression.pathway}
                  </h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-accent-green">
                      {progression.successRate}% sucesso
                    </span>
                    <span className="text-sm text-theme-tertiary">
                      ~{progression.avgTimeToComplete} dias
                    </span>
                  </div>
                </div>

                <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full transition-all duration-1000"
                    style={{ width: `${progression.successRate}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-theme-tertiary mb-1">
                      🚫 Pontos de abandono:
                    </p>
                    <ul className="space-y-1">
                      {progression.dropoffPoints.map(
                        (point: string, i: number) => (
                          <li
                            key={i}
                            className="text-accent-red flex items-center space-x-1"
                          >
                            <span>•</span>
                            <span>{point}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-theme-tertiary mb-1">
                      💡 Recomendações:
                    </p>
                    <ul className="space-y-1">
                      {progression.recommendations.map(
                        (rec: string, i: number) => (
                          <li
                            key={i}
                            className="text-accent-green flex items-center space-x-1"
                          >
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </AnimatedCard>

      {/* Composer Discovery Patterns */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiMapPin className="w-5 h-5 text-accent-purple" />
          <span>🗺️ Padrões de Descoberta Musical</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {educational.composerDiscoveryPatterns.map(
            (pattern: any, index: number) => (
              <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                <h4 className="font-bold text-theme-primary mb-2">
                  {pattern.epoch}
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-theme-tertiary">
                      🚪 Compositores porta de entrada:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.gatewayComposers.map(
                        (composer: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-accent-blue/20 text-accent-blue rounded text-xs"
                          >
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
                    <span className="font-bold text-accent-green">
                      {pattern.conversionRate}%
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </AnimatedCard>

      {/* Annotation Quality & Study Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annotation Quality */}
        <AnimatedCard className="classical-card p-6">
          <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
            <FiHeart className="w-5 h-5 text-accent-red" />
            <span>⭐ Qualidade das Anotações</span>
          </h3>

          <div className="space-y-4">
            <div className="text-center p-4 bg-theme-secondary rounded-xl">
              <div className="text-3xl font-bold text-accent-blue mb-1">
                {educational.annotationQualityMetrics.avgHelpfulnessScore.toFixed(
                  1
                )}
                ⭐
              </div>
              <div className="text-sm text-theme-tertiary">
                Score Médio de Utilidade
              </div>
            </div>

            <div>
              <h4 className="font-medium text-theme-primary mb-2">
                🏆 Top Contribuidores:
              </h4>
              <div className="space-y-2">
                {educational.annotationQualityMetrics.topContributors
                  .slice(0, 5)
                  .map((contributor: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-theme-secondary rounded"
                    >
                      <span className="text-sm text-theme-primary">
                        {contributor.username}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-accent-green">
                          {contributor.qualityScore}%
                        </span>
                        <span className="text-xs text-theme-tertiary">
                          ({contributor.totalAnnotations})
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Study Session Analysis */}
        <AnimatedCard className="classical-card p-6">
          <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
            <FiClock className="w-5 h-5 text-accent-amber" />
            <span>⏰ Padrões de Estudo</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-theme-secondary rounded-xl">
                <div className="text-xl font-bold text-accent-purple">
                  {educational.studySessionAnalysis.optimalSessionLength}min
                </div>
                <div className="text-xs text-theme-tertiary">Sessão Ideal</div>
              </div>
              <div className="text-center p-3 bg-theme-secondary rounded-xl">
                <div className="text-lg font-bold text-accent-green">
                  {educational.studySessionAnalysis.peakStudyTimes[0] || 'N/A'}
                </div>
                <div className="text-xs text-theme-tertiary">Horário Pico</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-theme-primary mb-2">
                📅 Padrões Semanais:
              </h4>
              <div className="space-y-1">
                {Object.entries(
                  educational.studySessionAnalysis.weeklyPatterns
                ).map(([day, percentage]: [string, any]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-theme-secondary">{day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-theme-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-blue rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-theme-tertiary w-8">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-theme-primary mb-2">
                🌦️ Tendências Sazonais:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(
                  educational.studySessionAnalysis.seasonalTrends
                ).map(([season, intensity]: [string, any]) => (
                  <div key={season} className="flex justify-between">
                    <span className="text-theme-secondary">{season}</span>
                    <span className="font-medium text-accent-blue">
                      {intensity}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiMapPin className="w-6 h-6 text-accent-blue" />
            <span>🗺️ Jornadas de Usuário</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiUsers className="w-5 h-5 text-accent-green" />
          <span>👥 Jornadas Típicas por Perfil</span>
        </h3>

        <div className="space-y-6">
          {userJourney.typicalJourneys.map((journey: any, index: number) => (
            <div key={index} className="p-4 bg-theme-secondary rounded-xl">
              <h4 className="font-bold text-theme-primary mb-4 capitalize">
                {journey.userType.replace('_', ' ').toLowerCase()}
              </h4>

              {/* Journey Stages */}
              <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
                {journey.stages.map((stage: any, stageIndex: number) => (
                  <div
                    key={stageIndex}
                    className="flex items-center space-x-2 flex-shrink-0"
                  >
                    <div className="text-center min-w-24">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold ${
                          stage.completionRate >= 70
                            ? 'bg-accent-green text-white'
                            : stage.completionRate >= 40
                            ? 'bg-accent-amber text-white'
                            : 'bg-accent-red text-white'
                        }`}
                      >
                        {stage.completionRate}%
                      </div>
                      <div className="text-xs text-theme-tertiary mt-1">
                        {stage.stage}
                      </div>
                      <div className="text-xs text-theme-tertiary">
                        {stage.avgDuration}d
                      </div>
                    </div>
                    {stageIndex < journey.stages.length - 1 && (
                      <div className="w-8 h-0.5 bg-theme-tertiary"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Success Factors and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-theme-tertiary mb-2">
                    ✅ Fatores de Sucesso:
                  </p>
                  <ul className="space-y-1">
                    {journey.successFactors.map((factor: string, i: number) => (
                      <li
                        key={i}
                        className="text-accent-green flex items-center space-x-1"
                      >
                        <span>•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-theme-tertiary mb-2">💡 Recomendações:</p>
                  <ul className="space-y-1">
                    {journey.recommendations.map((rec: string, i: number) => (
                      <li
                        key={i}
                        className="text-accent-blue flex items-center space-x-1"
                      >
                        <span>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      {/* Conversion Funnels */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiFilter className="w-5 h-5 text-accent-purple" />
          <span>🔄 Funis de Conversão</span>
        </h3>

        <div className="space-y-4">
          {userJourney.conversionFunnels.map((funnel: any, index: number) => (
            <div key={index} className="p-4 bg-theme-secondary rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-theme-secondary">
                    {funnel.from}
                  </span>
                  <span className="text-theme-tertiary">→</span>
                  <span className="text-sm font-medium text-theme-primary">
                    {funnel.to}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-lg font-bold ${
                      funnel.conversionRate >= 50
                        ? 'text-accent-green'
                        : funnel.conversionRate >= 25
                        ? 'text-accent-amber'
                        : 'text-accent-red'
                    }`}
                  >
                    {funnel.conversionRate}%
                  </span>
                  <span className="text-sm text-theme-tertiary">
                    ~{funnel.timeToConvert}d
                  </span>
                </div>
              </div>

              <div className="w-full bg-theme-primary h-3 rounded-full overflow-hidden mb-3">
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

              <div>
                <p className="text-xs text-theme-tertiary mb-1">
                  🚀 Oportunidades de melhoria:
                </p>
                <div className="flex flex-wrap gap-1">
                  {funnel.improvementOpportunities.map(
                    (opportunity: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-accent-blue/20 text-accent-blue rounded text-xs"
                      >
                        {opportunity}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      {/* User Segments */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiPieChart className="w-5 h-5 text-accent-amber" />
          <span>🎯 Segmentação de Usuários</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userJourney.userSegments.map((segment: any, index: number) => (
            <div key={index} className="p-4 bg-theme-secondary rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-theme-primary capitalize">
                  {segment.segment}
                </h4>
                <span className="text-sm font-bold text-accent-blue">
                  {formatNumber(segment.size)} usuários
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-theme-tertiary mb-1">
                    Características:
                  </p>
                  <div className="space-y-1">
                    {segment.characteristics.map((char: string, i: number) => (
                      <div
                        key={i}
                        className="text-xs text-theme-secondary flex items-center space-x-1"
                      >
                        <span>•</span>
                        <span>{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-theme-primary rounded">
                    <div className="font-bold text-accent-green">
                      {segment.engagementLevel}%
                    </div>
                    <div className="text-theme-tertiary">Engajamento</div>
                  </div>
                  <div className="text-center p-2 bg-theme-primary rounded">
                    <div className="font-bold text-accent-purple">
                      {segment.revenueContribution}%
                    </div>
                    <div className="text-theme-tertiary">Receita</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-theme-tertiary">
                    Potencial de crescimento:
                  </p>
                  <p className="text-xs font-medium text-accent-blue">
                    {segment.growthPotential}
                  </p>
                </div>
              </div>
            </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiShield className="w-6 h-6 text-accent-red" />
            <span>⚠️ Avaliação de Riscos</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiUsers className="w-5 h-5 text-accent-red" />
          <span>🚨 Usuários em Alto Risco de Churn</span>
        </h3>

        {riskAssessment.churnRiskUsers.length === 0 ? (
          <div className="text-center py-8">
            <FiCheckCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
            <p className="text-theme-secondary">
              Nenhum usuário em alto risco detectado!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {riskAssessment.churnRiskUsers
              .slice(0, 10)
              .map((user: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-theme-secondary rounded-xl border-l-4 border-accent-red"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-theme-primary">
                        {user.username}
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Última atividade:{' '}
                        {new Date(user.lastActivity).toLocaleDateString(
                          'pt-BR'
                        )}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-accent-red">
                        {user.riskScore}%
                      </div>
                      <div className="text-xs text-theme-tertiary">Risco</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-theme-tertiary mb-1">
                        ⚠️ Fatores de risco:
                      </p>
                      <ul className="space-y-1">
                        {user.riskFactors.map((factor: string, i: number) => (
                          <li
                            key={i}
                            className="text-accent-red flex items-center space-x-1"
                          >
                            <span>•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-theme-tertiary mb-1">
                        💡 Ações sugeridas:
                      </p>
                      <ul className="space-y-1">
                        {user.suggestedActions.map(
                          (action: string, i: number) => (
                            <li
                              key={i}
                              className="text-accent-green flex items-center space-x-1"
                            >
                              <span>•</span>
                              <span>{action}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </AnimatedCard>

      {/* System Health Indicators */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiActivity className="w-5 h-5 text-accent-blue" />
          <span>💚 Indicadores de Saúde do Sistema</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskAssessment.systemHealthIndicators.map(
            (indicator: any, index: number) => (
              <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-theme-primary">
                    {indicator.metric}
                  </h4>
                  <span
                    className={`w-4 h-4 rounded-full ${
                      indicator.status === 'healthy'
                        ? 'bg-accent-green'
                        : indicator.status === 'warning'
                        ? 'bg-accent-amber'
                        : 'bg-accent-red'
                    }`}
                  />
                </div>

                <div className="text-center mb-3">
                  <div
                    className={`text-2xl font-bold ${
                      indicator.status === 'healthy'
                        ? 'text-accent-green'
                        : indicator.status === 'warning'
                        ? 'text-accent-amber'
                        : 'text-accent-red'
                    }`}
                  >
                    {formatNumber(indicator.currentValue)}
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Ideal: {indicator.healthyRange.min} -{' '}
                    {indicator.healthyRange.max}
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 text-xs">
                  <span
                    className={`${
                      indicator.trend === 'improving'
                        ? 'text-accent-green'
                        : indicator.trend === 'declining'
                        ? 'text-accent-red'
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
                </div>
              </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiGrowth className="w-6 h-6 text-accent-purple" />
            <span>🚀 Oportunidades de Crescimento</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getCategoryIcon(opportunity.category)}
                </span>
                <div>
                  <h3 className="font-bold text-theme-primary">
                    {opportunity.opportunity}
                  </h3>
                  <p className="text-sm text-theme-tertiary capitalize">
                    {opportunity.category.replace('_', ' ')} •{' '}
                    {opportunity.timeline}
                  </p>
                </div>
              </div>
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

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-theme-primary mb-2">
                  🎯 Resultados Esperados:
                </h4>
                <ul className="space-y-1">
                  {opportunity.expectedResults.map(
                    (result: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-accent-green flex items-center space-x-1"
                      >
                        <span>•</span>
                        <span>{result}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-theme-primary mb-2">
                  🛠️ Implementação:
                </h4>
                <ul className="space-y-1">
                  {opportunity.implementation
                    .slice(0, 3)
                    .map((step: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-theme-secondary flex items-center space-x-1"
                      >
                        <span>{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-theme-secondary">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-tertiary">
                    Esforço necessário:
                  </span>
                  <span
                    className={`font-medium ${
                      opportunity.effort === 'low'
                        ? 'text-accent-green'
                        : opportunity.effort === 'medium'
                        ? 'text-accent-amber'
                        : 'text-accent-red'
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
            </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiDollarSign className="w-6 h-6 text-accent-green" />
            <span>💰 Insights de Monetização</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
          <FiBarChart2 className="w-8 h-8 text-accent-blue mx-auto mb-3" />
          <div className="text-2xl font-bold text-theme-primary">
            {monetization.adPerformance.overallCTR.toFixed(2)}%
          </div>
          <div className="text-sm text-theme-tertiary">CTR Geral</div>
        </AnimatedCard>

        <AnimatedCard className="classical-card p-6 text-center">
          <FiDollarSign className="w-8 h-8 text-accent-green mx-auto mb-3" />
          <div className="text-2xl font-bold text-theme-primary">
            ${monetization.adPerformance.revenuePerUser.toFixed(2)}
          </div>
          <div className="text-sm text-theme-tertiary">Receita por Usuário</div>
        </AnimatedCard>

        <AnimatedCard className="classical-card p-6 text-center">
          <FiTrendingUp className="w-8 h-8 text-accent-purple mx-auto mb-3" />
          <div className="text-2xl font-bold text-theme-primary">
            {monetization.adPerformance.topPerformingAds.length}
          </div>
          <div className="text-sm text-theme-tertiary">
            Anúncios de Alto Desempenho
          </div>
        </AnimatedCard>
      </div>

      {/* User Value Segmentation */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiUsers className="w-5 h-5 text-accent-blue" />
          <span>👥 Segmentação por Valor do Usuário</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monetization.userValueSegmentation.map(
            (segment: any, index: number) => (
              <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                <h4 className="font-bold text-theme-primary mb-3">
                  {segment.segment}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Usuários:</span>
                    <span className="font-medium text-theme-primary">
                      {formatNumber(segment.userCount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Receita Média:</span>
                    <span className="font-medium text-accent-green">
                      ${segment.avgRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Engajamento:</span>
                    <span className="font-medium text-accent-blue">
                      {segment.engagementScore}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-theme-tertiary">
                    <p className="text-xs text-theme-tertiary">
                      Potencial de crescimento:
                    </p>
                    <p className="text-xs font-medium text-accent-purple">
                      {segment.growthPotential}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </AnimatedCard>

      {/* Monetization Opportunities */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiZap className="w-5 h-5 text-accent-amber" />
          <span>⚡ Oportunidades de Monetização</span>
        </h3>

        <div className="space-y-4">
          {monetization.monetizationOpportunities.map(
            (opportunity: any, index: number) => (
              <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                <h4 className="font-bold text-theme-primary mb-3">
                  {opportunity.opportunity}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-theme-tertiary mb-1">
                      💰 Receita Estimada:
                    </p>
                    <p className="font-medium text-accent-green">
                      {opportunity.estimatedRevenue}
                    </p>
                  </div>
                  <div>
                    <p className="text-theme-tertiary mb-1">💸 Investimento:</p>
                    <p className="font-medium text-accent-amber">
                      {opportunity.requiredInvestment}
                    </p>
                  </div>
                  <div>
                    <p className="text-theme-tertiary mb-1">📊 Viabilidade:</p>
                    <p className="font-medium text-accent-blue">
                      {opportunity.feasibility}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <BiBrain className="w-6 h-6 text-accent-purple" />
            <span>🧠 Padrões de Comportamento</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
                <div className="flex items-center space-x-3 mb-3">
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
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-theme-secondary text-theme-tertiary">
                    {pattern.confidence}% confiança
                  </span>
                </div>

                <p className="text-theme-secondary mb-4">
                  {pattern.description}
                </p>

                <div className="bg-theme-secondary p-4 rounded-xl">
                  <p className="text-sm text-theme-primary">
                    <strong>🎯 Recomendação IA:</strong>{' '}
                    {pattern.recommendation}
                  </p>
                </div>
              </div>

              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-accent-blue mb-1">
                  {pattern.prevalence.toFixed(1)}%
                </div>
                <div className="text-sm text-theme-tertiary">prevalência</div>
                <div className="text-xs text-theme-tertiary mt-1">
                  {formatNumber(pattern.dataPoints)} dados
                </div>
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
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiBarChart2 className="w-6 h-6 text-accent-blue" />
            <span>📊 Performance de Conteúdo</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
          <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
            <FiAward className="w-5 h-5 text-accent-green" />
            <span>🏆 Top Performers</span>
          </h3>
          <div className="space-y-3">
            {contentPerformance.topPerformers
              .slice(0, 5)
              .map((item: any, index: number) => (
                <div key={index} className="p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-xs font-bold text-theme-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-theme-primary">
                        {item.name}
                      </p>
                      <p className="text-xs text-theme-tertiary mb-2 capitalize">
                        {item.type}
                      </p>
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
          </div>
        </AnimatedCard>

        {/* Underperformers */}
        <AnimatedCard className="classical-card p-6">
          <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
            <FiTrendingDown className="w-5 h-5 text-accent-amber" />
            <span>📈 Oportunidades de Melhoria</span>
          </h3>
          <div className="space-y-4">
            {contentPerformance.underperformers.map(
              (item: any, index: number) => (
                <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                  <h4 className="font-medium text-theme-primary mb-2">
                    {item.name}
                  </h4>

                  <div className="mb-3">
                    <p className="text-xs text-theme-tertiary mb-1">
                      ⚠️ Problemas identificados:
                    </p>
                    <div className="space-y-1">
                      {item.issues.map((issue: string, i: number) => (
                        <div
                          key={i}
                          className="text-xs text-accent-red flex items-center space-x-1"
                        >
                          <span>•</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-theme-tertiary mb-1">
                      💡 Sugestões IA:
                    </p>
                    <div className="space-y-1">
                      {item.suggestions.map((suggestion: string, i: number) => (
                        <div
                          key={i}
                          className="text-xs text-accent-green flex items-center space-x-1"
                        >
                          <span>•</span>
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 bg-accent-blue/10 rounded text-xs text-accent-blue">
                    <strong>📊 Impacto esperado:</strong> {item.potentialImpact}
                  </div>
                </div>
              )
            )}
          </div>
        </AnimatedCard>
      </div>

      {/* Content Optimization Recommendations */}
      <AnimatedCard className="classical-card p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiZap className="w-5 h-5 text-accent-purple" />
          <span>🎯 Recomendações de Otimização</span>
        </h3>
        <div className="space-y-3">
          {contentPerformance.contentOptimization
            .sort((a: any, b: any) => b.priority - a.priority)
            .map((rec: any, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-theme-secondary rounded-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                  {rec.priority}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-theme-primary mb-1">
                    {rec.recommendation}
                  </h4>
                  <p className="text-sm text-theme-secondary mb-2">
                    {rec.expectedImpact}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.effort === 'high'
                        ? 'bg-accent-red/20 text-accent-red'
                        : rec.effort === 'medium'
                        ? 'bg-accent-amber/20 text-accent-amber'
                        : 'bg-accent-green/20 text-accent-green'
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
        </div>
      </AnimatedCard>
    </div>
  );
}

function AnomaliesSection({ anomalies, onRefreshModule, isGenerating }: any) {
  return (
    <div className="space-y-8">
      <AnimatedItem direction="up" springType="gentle">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
            <FiAlertTriangle className="w-6 h-6 text-accent-red" />
            <span>🔍 Detecção de Anomalias</span>
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
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
          <FiCheckCircle className="w-16 h-16 text-accent-green mx-auto mb-4" />
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
                ? FiAlertTriangle
                : anomaly.severity === 'warning'
                ? FiInfo
                : FiCheckCircle;
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
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-theme-primary">
                        {anomaly.type === 'spike'
                          ? '📈 Pico Anômalo'
                          : anomaly.type === 'drop'
                          ? '📉 Queda Anômala'
                          : '🔍 Comportamento Incomum'}{' '}
                        - {anomaly.metric}
                      </h3>
                      <span className="text-sm text-theme-tertiary">
                        {new Date(anomaly.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-theme-secondary rounded-xl">
                        <div className="text-lg font-bold text-theme-primary">
                          {formatNumber(anomaly.value)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Valor Detectado
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
                        <div className="text-lg font-bold text-accent-amber">
                          {anomaly.deviation.toFixed(1)}%
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Desvio
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
                            ? '🚨 Crítico'
                            : anomaly.severity === 'warning'
                            ? '⚠️ Atenção'
                            : 'ℹ️ Info'}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Severidade
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-theme-secondary mb-2">
                        🔍 Possíveis causas identificadas pela IA:
                      </p>
                      <div className="space-y-1">
                        {anomaly.possibleCauses.map(
                          (cause: string, i: number) => (
                            <div
                              key={i}
                              className="text-sm text-theme-primary flex items-center space-x-2"
                            >
                              <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                              <span>{cause}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {anomaly.affectedUsers && (
                      <div className="mt-3 p-3 bg-accent-amber/10 rounded-lg">
                        <p className="text-sm text-accent-amber">
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
