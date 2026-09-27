// app/admin/newsletter/analytics/NewsletterAnalyticsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiChartBar,
  PiCursor,
  PiDownloadSimple,
  PiEnvelopeSimple,
  PiEye,
  PiTrendUp,
  PiUsers,
} from 'react-icons/pi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useNewsletterAnalytics } from '@/app/hooks/admin/useNewsletterAnalytics';
import LoadingAdminState from '../../Common/LoadingState';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: any;
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
    { id: 'overview', label: 'Visão Geral', icon: PiChartBar },
    { id: 'campaigns', label: 'Campanhas', icon: PiEnvelopeSimple },
    { id: 'subscribers', label: 'Subscribers', icon: PiUsers },
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
        <LoadingAdminState loadingName="analytics" />
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
          icon: PiUsers,
        },
        {
          title: 'Emails Enviados',
          value: analytics.campaigns.totalSent.toLocaleString(),
          change: analytics.campaigns.sentGrowth,
          changeType:
            analytics.campaigns.sentGrowth > 0 ? 'increase' : 'neutral',
          icon: PiEnvelopeSimple,
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
          icon: PiEye,
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
          icon: PiCursor,
        },
      ]
    : [];

  return (
    <PageContainer showBackground={true}>
      <Stack gap={8}>
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <PiTrendUp className="w-8 h-8 text-white" />
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
              <Inline gap={4}>
                <div>
                  <Field.Selecao
                    label="Período"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    {dateRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field.Selecao>
                </div>
              </Inline>

              <Inline gap={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <PiArrowsClockwise
                      className={loading ? 'animate-spin' : ''}
                    />
                  }
                  onClick={fetchAnalytics}
                  disabled={loading}
                >
                  Atualizar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<PiDownloadSimple />}
                  onClick={exportReport}
                >
                  Exportar
                </Button>
              </Inline>
            </div>
          </AnimatedCard>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {metricCards.map((metric) => (
              <AnimatedCard key={metric.title} className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text papel="rotulo" tom="fraco" as="p" className="mb-1">
                      {metric.title}
                    </Text>
                    <p className="text-3xl font-bold text-theme-primary">
                      {metric.value}
                    </p>
                    {metric.change !== undefined && (
                      <div
                        className={`flex items-center space-x-1 mt-1 text-sm ${
                          metric.changeType === 'increase'
                            ? ''
                            : metric.changeType === 'decrease'
                              ? ''
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
                    className={`w-12 h-12 rounded-xl flex items-center justify-center`}
                  >
                    <metric.icon className={`w-6 h-6`} />
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
                      ? 'text-ouro-texto'
                      : 'border-transparent text-theme-tertiary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && analytics && (
              <Stack gap={6}>
                {/* Top Performing Campaigns */}
                <Stack>
                  <h3 className="text-xl font-bold text-theme-primary">
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
                            className="border-b border-theme-secondary"
                          >
                            <td className="py-3 px-2">
                              <div>
                                <div className="font-medium text-theme-primary">
                                  {campaign.name}
                                </div>
                                <Text papel="rotulo" tom="fraco" as="div">
                                  {campaign.subject}
                                </Text>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-theme-primary">
                              {campaign.emailsSent?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-medium">
                                {(
                                  (campaign.emailsOpened /
                                    campaign.emailsSent) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-medium">
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
                </Stack>

                {/* Growth Chart Placeholder */}
                <Stack className="bg-theme-secondary p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-theme-primary">
                    Crescimento de Subscribers
                  </h3>
                  <div className="h-64 flex items-center justify-center text-theme-tertiary">
                    <div className="text-center">
                      <PiChartBar className="w-16 h-16 mx-auto mb-4" />
                      <p>Gráfico de crescimento seria implementado aqui</p>
                      <p className="text-sm">
                        Usando bibliotecas como Chart.js ou Recharts
                      </p>
                    </div>
                  </div>
                </Stack>
              </Stack>
            )}

            {activeTab === 'campaigns' && analytics && (
              <Stack gap={6}>
                <h3 className="text-xl font-bold text-theme-primary">
                  Performance de Campanhas
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <Stack className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary">
                      Estatísticas Gerais
                    </h4>
                    <Stack gap={3}>
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
                    </Stack>
                  </Stack>

                  <Stack className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary">
                      Performance Média
                    </h4>
                    <Stack gap={3}>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Entrega
                        </span>
                        <span className="font-medium">
                          {analytics.engagement.avgDeliveryRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Abertura
                        </span>
                        <span className="font-medium">
                          {analytics.engagement.avgOpenRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Cliques
                        </span>
                        <span className="font-medium">
                          {analytics.engagement.avgClickRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Taxa de Bounce
                        </span>
                        <span className="font-medium">
                          {analytics.engagement.avgBounceRate.toFixed(1)}%
                        </span>
                      </div>
                    </Stack>
                  </Stack>
                </div>
              </Stack>
            )}

            {activeTab === 'subscribers' && analytics && (
              <Stack gap={6}>
                <h3 className="text-xl font-bold text-theme-primary">
                  Análise de Subscribers
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <Stack className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary">
                      Status dos Subscribers
                    </h4>
                    <Stack gap={3}>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Ativos</span>
                        <span className="font-medium">
                          {analytics.subscribers.active.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Pendentes</span>
                        <span className="font-medium">
                          {analytics.subscribers.pending.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Cancelados</span>
                        <span className="font-medium">
                          {analytics.subscribers.unsubscribed.toLocaleString()}
                        </span>
                      </div>
                    </Stack>
                  </Stack>

                  <Stack className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary">
                      Crescimento
                    </h4>
                    <Stack gap={3}>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Novos (7 dias)
                        </span>
                        <span className="font-medium">
                          +{analytics.subscribers.newLast7Days}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Novos (30 dias)
                        </span>
                        <span className="font-medium">
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
                    </Stack>
                  </Stack>

                  <Stack className="bg-theme-secondary p-6 rounded-lg">
                    <h4 className="font-medium text-theme-primary">
                      Engajamento
                    </h4>
                    <Stack gap={3}>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Alto Engajamento
                        </span>
                        <span className="font-medium">
                          {analytics.subscribers.highEngagement}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Médio Engajamento
                        </span>
                        <span className="font-medium">
                          {analytics.subscribers.mediumEngagement}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Baixo Engajamento
                        </span>
                        <span className="font-medium">
                          {analytics.subscribers.lowEngagement}
                        </span>
                      </div>
                    </Stack>
                  </Stack>
                </div>
              </Stack>
            )}
          </AnimatedCard>
        </AnimatedContainer>
      </Stack>
    </PageContainer>
  );
}
