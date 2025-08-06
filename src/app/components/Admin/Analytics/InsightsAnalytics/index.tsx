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
import { formatNumber } from '@/app/hooks/admin/useAdminStats';
import toast from 'react-hot-toast';
import { BiBrain } from 'react-icons/bi';

export default function InsightsAnalytics() {
  const {
    insights,
    loading,
    error,
    refreshInsights,
    generatePrediction,
    lastUpdated,
    isGenerating,
  } = useAdminInsights();

  const [selectedInsight, setSelectedInsight] = useState('predictions');
  const [timeframe, setTimeframe] = useState('30d');

  const handleRefresh = async () => {
    try {
      await refreshInsights();
      toast.success('Insights atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar insights');
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

  const handleExportReport = () => {
    if (!insights) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      timeframe,
      summary: insights.summary,
      predictions: insights.predictions,
      behaviorPatterns: insights.behaviorPatterns,
      anomalies: insights.anomalies,
      featureUsage: insights.featureUsage,
    };

    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-report-${
      new Date().toISOString().split('T')[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Relatório exportado com sucesso!');
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-accent-red';
      case 'medium':
        return 'text-accent-amber';
      case 'low':
        return 'text-accent-green';
      default:
        return 'text-theme-tertiary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-accent-red/10 text-accent-red border-accent-red';
      case 'medium':
        return 'bg-accent-amber/10 text-accent-amber border-accent-amber';
      case 'low':
        return 'bg-accent-green/10 text-accent-green border-accent-green';
      default:
        return 'bg-theme-secondary text-theme-tertiary border-theme-secondary';
    }
  };

  if (loading && !insights) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Analisando dados e gerando insights...
            </p>
            <p className="text-theme-tertiary mt-2">
              Isso pode levar alguns segundos
            </p>
          </div>
        </div>
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
              Erro ao Carregar Insights
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
            Não foi possível gerar insights no momento.
          </p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            leftIcon={<FiRefreshCw />}
          >
            Gerar Insights
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
              Insights & Analytics Avançados
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle mb-6">
              Análises preditivas e inteligência de dados
            </p>

            {/* Health Score */}
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="text-center">
                <div
                  className={`text-3xl font-bold mb-1 ${
                    insights.summary.healthScore >= 80
                      ? 'text-accent-green'
                      : insights.summary.healthScore >= 60
                      ? 'text-accent-amber'
                      : 'text-accent-red'
                  }`}
                >
                  {insights.summary.healthScore}/100
                </div>
                <div className="text-sm text-theme-tertiary">Health Score</div>
              </div>

              <div className="text-center">
                <div
                  className={`text-lg font-bold mb-1 ${
                    insights.summary.trendDirection === 'positive'
                      ? 'text-accent-green'
                      : insights.summary.trendDirection === 'negative'
                      ? 'text-accent-red'
                      : 'text-theme-tertiary'
                  }`}
                >
                  {insights.summary.trendDirection === 'positive'
                    ? '↗️ Positiva'
                    : insights.summary.trendDirection === 'negative'
                    ? '↘️ Negativa'
                    : '➡️ Estável'}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Tendência Geral
                </div>
              </div>

              {lastUpdated && (
                <div className="text-center">
                  <div className="text-sm text-theme-primary font-medium">
                    {new Date(lastUpdated).toLocaleTimeString('pt-BR')}
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Última atualização
                  </div>
                </div>
              )}
            </div>
          </div>
        </AnimatedItem>

        {/* Key Findings */}
        {insights.summary.keyFindings.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mb-8">
              <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center space-x-2">
                <FiEye className="w-5 h-5 text-accent-blue" />
                <span>Principais Descobertas</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.summary.keyFindings.map((finding, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="w-6 h-6 bg-accent-blue rounded-full flex items-center justify-center text-xs font-bold text-theme-primary flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-theme-primary">{finding}</p>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

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
                  { value: 'content', label: 'Performance de Conteúdo' },
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
                  <FiRefreshCw
                    className={loading || isGenerating ? 'animate-spin' : ''}
                  />
                }
                onClick={handleRefresh}
                disabled={loading || isGenerating}
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiDownload />}
                onClick={handleExportReport}
              >
                Exportar Relatório
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiZap />}
                onClick={() => handleGeneratePrediction('users')}
                disabled={isGenerating}
              >
                {isGenerating ? 'Gerando...' : 'Gerar Previsão'}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {insights.predictions.map((prediction, index) => {
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
                          {prediction.factors.slice(0, 3).map((factor, i) => (
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
              {insights.behaviorPatterns.map((pattern, index) => (
                <AnimatedCard key={index} className="classical-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-bold text-theme-primary">
                          {pattern.pattern}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                            pattern.impact
                          )} bg-current/10`}
                        >
                          Impacto{' '}
                          {pattern.impact === 'high'
                            ? 'Alto'
                            : pattern.impact === 'medium'
                            ? 'Médio'
                            : 'Baixo'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-theme-secondary text-theme-tertiary">
                          {pattern.confidence.toFixed(0)}% confiança
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
                      <div className="text-xs text-theme-tertiary mt-1">
                        {pattern.dataPoints} pontos de dados
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

            {insights.anomalies.length === 0 ? (
              <AnimatedCard className="classical-card p-8 text-center">
                <FiCheckCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
                <h3 className="text-lg font-bold text-theme-primary mb-2">
                  Nenhuma Anomalia Detectada
                </h3>
                <p className="text-theme-secondary">
                  Todas as métricas estão dentro dos padrões esperados.
                </p>
              </AnimatedCard>
            ) : (
              <div className="space-y-4">
                {insights.anomalies.map((anomaly, index) => {
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

                          {anomaly.affectedUsers && (
                            <div className="mt-3 p-2 bg-accent-amber/10 rounded">
                              <p className="text-sm text-accent-amber">
                                <strong>{anomaly.affectedUsers}</strong>{' '}
                                usuários podem ter sido afetados
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
        )}

        {/* Feature Usage Section */}
        {selectedInsight === 'features' && (
          <div className="space-y-8">
            <AnimatedItem direction="up" springType="gentle">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiBarChart2 className="w-6 h-6 text-accent-blue" />
                <span>Análise de Recursos</span>
              </h2>
            </AnimatedItem>

            <div className="space-y-6">
              {insights.featureUsage.map((feature, index) => (
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
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            feature.churnRisk < 10
                              ? 'text-accent-green'
                              : feature.churnRisk < 20
                              ? 'text-accent-amber'
                              : 'text-accent-red'
                          }`}
                        >
                          {feature.churnRisk.toFixed(1)}%
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Risco de Abandono
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

                  <div>
                    <p className="text-sm text-theme-secondary mb-2">
                      Recomendações:
                    </p>
                    <div className="space-y-1">
                      {feature.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="text-sm text-theme-primary flex items-center space-x-2"
                        >
                          <div className="w-1.5 h-1.5 bg-accent-green rounded-full"></div>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Content Performance Section */}
        {selectedInsight === 'content' && (
          <div className="space-y-8">
            <AnimatedItem direction="up" springType="gentle">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiTarget className="w-6 h-6 text-accent-green" />
                <span>Performance de Conteúdo</span>
              </h2>
            </AnimatedItem>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <AnimatedCard className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  🏆 Top Performers
                </h3>
                <div className="space-y-3">
                  {insights.contentPerformance.topPerformers
                    .slice(0, 5)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-theme-secondary rounded-xl"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-xs font-bold text-theme-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-theme-primary">
                              {item.name}
                            </p>
                            <p className="text-xs text-theme-tertiary mb-2">
                              {item.type}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <span>
                                ❤️ {formatNumber(item.metrics.favorites)}
                              </span>
                              <span>
                                📝 {formatNumber(item.metrics.annotations)}
                              </span>
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

              <AnimatedCard className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  📈 Oportunidades de Melhoria
                </h3>
                <div className="space-y-4">
                  {insights.contentPerformance.underperformers.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-theme-secondary rounded-xl"
                      >
                        <h4 className="font-medium text-theme-primary mb-2">
                          {item.name}
                        </h4>

                        <div className="mb-3">
                          <p className="text-xs text-theme-tertiary mb-1">
                            Problemas identificados:
                          </p>
                          <div className="space-y-1">
                            {item.issues.map((issue, i) => (
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
                            Sugestões:
                          </p>
                          <div className="space-y-1">
                            {item.suggestions.map((suggestion, i) => (
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
                          <strong>Impacto esperado:</strong>{' '}
                          {item.potentialImpact}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </AnimatedCard>
            </div>

            {/* Content Optimization */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-lg font-bold text-theme-primary mb-4">
                🎯 Recomendações de Otimização
              </h3>
              <div className="space-y-3">
                {insights.contentPerformance.contentOptimization
                  .sort((a, b) => b.priority - a.priority)
                  .map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-theme-secondary rounded-xl"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
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
        )}

        {/* Action Items */}
        {insights.summary.actionItems.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mt-8">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiClock className="w-5 h-5 text-accent-purple" />
                <span>Próximas Ações Recomendadas</span>
              </h3>

              <div className="space-y-4">
                {insights.summary.actionItems
                  .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (
                      priorityOrder[b.priority] - priorityOrder[a.priority]
                    );
                  })
                  .map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-l-4 ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-theme-primary mb-1">
                            {item.action}
                          </h4>
                          <p className="text-sm text-theme-secondary mb-2">
                            {item.expectedImpact}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-theme-tertiary">
                            <span>⏱️ {item.timeframe}</span>
                            <span
                              className={`font-medium ${
                                item.priority === 'high'
                                  ? 'text-accent-red'
                                  : item.priority === 'medium'
                                  ? 'text-accent-amber'
                                  : 'text-accent-green'
                              }`}
                            >
                              Prioridade{' '}
                              {item.priority === 'high'
                                ? 'Alta'
                                : item.priority === 'medium'
                                ? 'Média'
                                : 'Baixa'}
                            </span>
                          </div>
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
