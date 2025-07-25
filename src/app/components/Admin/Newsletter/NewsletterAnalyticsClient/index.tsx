// app/admin/newsletter/analytics/NewsletterAnalyticsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiUsers,
  FiMail,
  FiBarChart2,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiMousePointer,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useNewsletterAnalytics } from '@/app/hooks/admin/useNewsletterAnalytics';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
}

export default function NewsletterAnalyticsClient() {
  const {
    analytics,
    loading,
    dateRange,
    setDateRange,
    fetchAnalytics,
    exportReport,
  } = useNewsletterAnalytics();

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: FiBarChart2 },
    { id: 'campaigns', label: 'Campanhas', icon: FiMail },
    { id: 'subscribers', label: 'Subscribers', icon: FiUsers },
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading && !analytics) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando analytics...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const metricCards: MetricCard[] = analytics
    ? [
        {
          title: 'Total de Subscribers',
          value: analytics.subscribers.total.toLocaleString(),
          change: analytics.subscribers.growth,
          changeType:
            analytics.subscribers.growth > 0
              ? 'increase'
              : analytics.subscribers.growth < 0
              ? 'decrease'
              : 'neutral',
          icon: FiUsers,
          color: 'accent-blue',
        },
        {
          title: 'Emails Enviados',
          value: analytics.campaigns.totalSent.toLocaleString(),
          change: analytics.campaigns.sentGrowth,
          changeType:
            analytics.campaigns.sentGrowth > 0 ? 'increase' : 'neutral',
          icon: FiMail,
          color: 'accent-green',
        },
        {
          title: 'Taxa de Abertura',
          value: `${analytics.engagement.avgOpenRate.toFixed(1)}%`,
          change: analytics.engagement.openRateChange,
          changeType:
            analytics.engagement.openRateChange > 0
              ? 'increase'
              : analytics.engagement.openRateChange < 0
              ? 'decrease'
              : 'neutral',
          icon: FiEye,
          color: 'accent-purple',
        },
        {
          title: 'Taxa de Cliques',
          value: `${analytics.engagement.avgClickRate.toFixed(1)}%`,
          change: analytics.engagement.clickRateChange,
          changeType:
            analytics.engagement.clickRateChange > 0
              ? 'increase'
              : analytics.engagement.clickRateChange < 0
              ? 'decrease'
              : 'neutral',
          icon: FiMousePointer,
          color: 'accent-amber',
        },
      ]
    : [];

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8">
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiTrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Analytics da Newsletter
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Métricas e insights sobre performance da newsletter
              </p>
            </div>
          </AnimatedItem>

          {/* Controls */}
          <AnimatedCard className="classical-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Período
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-3 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {dateRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  }
                  onClick={fetchAnalytics}
                  disabled={loading}
                >
                  Atualizar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiDownload />}
                  onClick={exportReport}
                >
                  Exportar
                </Button>
              </div>
            </div>
          </AnimatedCard>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {metricCards.map((metric) => (
              <AnimatedCard key={metric.title} className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-theme-primary">
                      {metric.value}
                    </p>
                    {metric.change !== undefined && (
                      <div
                        className={`flex items-center space-x-1 mt-1 text-sm ${
                          metric.changeType === 'increase'
                            ? 'text-accent-green'
                            : metric.changeType === 'decrease'
                            ? 'text-accent-red'
                            : 'text-theme-tertiary'
                        }`}
                      >
                        <span>
                          {metric.changeType === 'increase' ? '+' : ''}
                          {metric.change.toFixed(1)}%
                        </span>
                        <span className="text-theme-tertiary">
                          vs período anterior
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 bg-${metric.color}/20 rounded-xl flex items-center justify-center`}
                  >
                    <metric.icon className={`w-6 h-6 text-${metric.color}`} />
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          {/* Tabs */}
          <AnimatedCard className="classical-card p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-8 border-b border-theme-secondary">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && analytics && (
              <div className="space-y-6">
                {/* Top Performing Campaigns */}
                <div>
                  <h3 className="text-xl font-bold text-theme-primary mb-4">
                    Campanhas com Melhor Performance
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-theme-secondary">
                          <th className="text-left py-3 px-2 text-theme-primary font-medium">
                            Campanha
                          </th>
                          <th className="text-left py-3 px-2 text-theme-primary font-medium">
                            Enviados
                          </th>
                          <th className="text-left py-3 px-2 text-theme-primary font-medium">
                            Abertura
                          </th>
                          <th className="text-left py-3 px-2 text-theme-primary font-medium">
                            Cliques
                          </th>
                          <th className="text-left py-3 px-2 text-theme-primary font-medium">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topCampaigns.map((campaign: any) => (
                          <tr
                            key={campaign.id}
                            className="border-b border-theme-secondary hover:bg-theme-secondary/50"
                          >
                            <td className="py-3 px-2">
                              <div>
                                <div className="font-medium text-theme-primary">
                                  {campaign.name}
                                </div>
                                <div className="text-sm text-theme-tertiary">
                                  {campaign.subject}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-theme-primary">
                              {campaign.emailsSent?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-accent-blue font-medium">
                                {(
                                  (campaign.emailsOpened /
                                    campaign.emailsSent) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-accent-purple font-medium">
                                {(
                                  (campaign.emailsClicked /
                                    campaign.emailsOpened) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </td>
                            <td className="py-3 px-2 text-theme-tertiary">
                              {new Date(campaign.sentAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Growth Chart Placeholder */}
                <div className="bg-theme-secondary p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-theme-primary mb-4">
                    Crescimento de Subscribers
                  </h3>
                  <div className="h-64 flex items-center justify-center text-theme-tertiary">
                    <div className="text-center">
                      <FiBarChart2 className="w-16 h-16 mx-auto mb-4" />
                      <p>Gráfico de crescimento seria implementado aqui</p>
                      <p className="text-sm">
                        Usando bibliotecas como Chart.js ou Recharts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && analytics && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Performance de Campanhas
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary mb-4">
                      Estatísticas Gerais
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Total de Campanhas
                        </span>
                        <span className="text-theme-primary font-medium">
                          {analytics.campaigns.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Campanhas Enviadas
                        </span>
                        <span className="text-theme-primary font-medium">
                          {analytics.campaigns.sent}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Em Rascunho</span>
                        <span className="text-theme-primary font-medium">
                          {analytics.campaigns.draft}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Agendadas</span>
                        <span className="text-theme-primary font-medium">
                          {analytics.campaigns.scheduled}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary mb-4">
                      Performance Média
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Entrega
                        </span>
                        <span className="text-accent-green font-medium">
                          {analytics.engagement.avgDeliveryRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Abertura
                        </span>
                        <span className="text-accent-blue font-medium">
                          {analytics.engagement.avgOpenRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Cliques
                        </span>
                        <span className="text-accent-purple font-medium">
                          {analytics.engagement.avgClickRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Bounce
                        </span>
                        <span className="text-accent-red font-medium">
                          {analytics.engagement.avgBounceRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscribers' && analytics && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Análise de Subscribers
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary mb-4">
                      Status dos Subscribers
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Ativos</span>
                        <span className="text-accent-green font-medium">
                          {analytics.subscribers.active.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Pendentes</span>
                        <span className="text-accent-amber font-medium">
                          {analytics.subscribers.pending.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Cancelados</span>
                        <span className="text-accent-red font-medium">
                          {analytics.subscribers.unsubscribed.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary mb-4">
                      Crescimento
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Novos (7 dias)
                        </span>
                        <span className="text-accent-green font-medium">
                          +{analytics.subscribers.newLast7Days}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Novos (30 dias)
                        </span>
                        <span className="text-accent-blue font-medium">
                          +{analytics.subscribers.newLast30Days}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Crescimento
                        </span>
                        <span className="text-theme-primary font-medium">
                          {analytics.subscribers.growth > 0 ? '+' : ''}
                          {analytics.subscribers.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary mb-4">
                      Engajamento
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Alto Engajamento
                        </span>
                        <span className="text-accent-green font-medium">
                          {analytics.subscribers.highEngagement}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Médio Engajamento
                        </span>
                        <span className="text-accent-amber font-medium">
                          {analytics.subscribers.mediumEngagement}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Baixo Engajamento
                        </span>
                        <span className="text-accent-red font-medium">
                          {analytics.subscribers.lowEngagement}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AnimatedCard>
        </AnimatedContainer>
      </div>
    </PageContainer>
  );
}
