// app/admin/newsletter/campaigns/CampaignStatsModal.tsx - Versão Completa
'use client';

import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import { useState, useEffect } from 'react';
import {
  PiChartBar,
  PiClock,
  PiEnvelopeSimple,
  PiPulse,
  PiTrendUp,
  PiUsers,
} from 'react-icons/pi';
import {
  MultiLineChart,
  AdminBarChart,
  HorizontalBarChart,
  MetricCard,
} from '@/app/components/Admin/Charts/AdminCharts';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface CampaignStatsModalProps {
  campaign: any;
  onClose: () => void;
}

export function CampaignStatsModal({
  campaign,
  onClose,
}: CampaignStatsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: PiChartBar },
    { id: 'engagement', label: 'Engajamento', icon: PiTrendUp },
    { id: 'timeline', label: 'Timeline', icon: PiClock },
  ];

  // Dados de estatísticas básicas
  const stats = {
    sent: campaign.emailsSent || 0,
    delivered: campaign.emailsDelivered || 0,
    opened: campaign.emailsOpened || 0,
    clicked: campaign.emailsClicked || 0,
    bounced: campaign.emailsBounced || 0,
    unsubscribed: campaign.emailsUnsubscribed || 0,
  };

  const rates = {
    deliveryRate: stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0,
    openRate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0,
    clickRate: stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0,
    bounceRate: stats.sent > 0 ? (stats.bounced / stats.sent) * 100 : 0,
    unsubscribeRate:
      stats.delivered > 0 ? (stats.unsubscribed / stats.delivered) * 100 : 0,
  };

  // 🆕 Carregar dados de engajamento e timeline
  useEffect(() => {
    if (activeTab === 'engagement' || activeTab === 'timeline') {
      loadAdditionalData();
    }
  }, [activeTab, campaign.id]);

  const loadAdditionalData = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados ou fazer chamada real à API
      await loadEngagementData();
      await loadTimelineData();
    } catch (error) {
      console.error('Erro ao carregar dados adicionais:', error);
    } finally {
      setLoading(false);
    }
  };

  // As rotas de engajamento e de linha do tempo por campanha nunca existiram
  // (nem no legado nem na API): os gráficos ficam com os dados de exemplo, que
  // já eram o que a tela mostrava.
  const loadEngagementData = async () => {
    setEngagementData(generateMockEngagementData());
  };

  const loadTimelineData = async () => {
    setTimelineData(generateMockTimelineData());
  };

  // 🆕 Gerar dados mock de engajamento (baseado em padrões reais)
  const generateMockEngagementData = () => {
    const baseDate = campaign.sentAt ? new Date(campaign.sentAt) : new Date();
    const data = [];

    // Simular engajamento ao longo de 7 dias
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      // Padrão típico: maior engajamento no primeiro dia, depois decai
      const openDecay = Math.max(0, 1 - i * 0.3);
      const clickDecay = Math.max(0, 1 - i * 0.4);

      data.push({
        name: date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        aberturas: Math.round(
          (stats.opened || 50) * openDecay * (0.3 + Math.random() * 0.4)
        ),
        cliques: Math.round(
          (stats.clicked || 20) * clickDecay * (0.2 + Math.random() * 0.3)
        ),
        descadastros: Math.round(Math.random() * 3),
      });
    }

    return data;
  };

  // 🆕 Gerar dados mock de timeline
  const generateMockTimelineData = () => {
    const events = [];

    // Evento de criação
    events.push({
      id: 1,
      type: 'CREATED',
      title: 'Campanha Criada',
      description: 'Campanha foi criada no sistema',
      timestamp: campaign.createdAt,
      icon: PiEnvelopeSimple,
    });

    // Evento de agendamento (se aplicável)
    if (campaign.scheduledAt) {
      events.push({
        id: 2,
        type: 'SCHEDULED',
        title: 'Campanha Agendada',
        description: `Agendada para ${new Date(
          campaign.scheduledAt
        ).toLocaleDateString('pt-BR')}`,
        timestamp: campaign.scheduledAt,
        icon: PiClock,
      });
    }

    // Evento de envio
    if (campaign.sentAt) {
      events.push({
        id: 3,
        type: 'SENT',
        title: 'Campanha Enviada',
        description: `Enviada para ${stats.sent} subscribers`,
        timestamp: campaign.sentAt,
        icon: PiUsers,
      });

      // Simular eventos de engajamento baseados na data de envio
      const sentDate = new Date(campaign.sentAt);

      if (stats.opened > 0) {
        const firstOpenDate = new Date(sentDate);
        firstOpenDate.setMinutes(firstOpenDate.getMinutes() + 15);
        events.push({
          id: 4,
          type: 'FIRST_OPEN',
          title: 'Primeira Abertura',
          description: 'Primeiro subscriber abriu o email',
          timestamp: firstOpenDate.toISOString(),
          icon: PiPulse,
        });
      }

      if (stats.clicked > 0) {
        const firstClickDate = new Date(sentDate);
        firstClickDate.setHours(firstClickDate.getHours() + 1);
        events.push({
          id: 5,
          type: 'FIRST_CLICK',
          title: 'Primeiro Clique',
          description: 'Primeiro subscriber clicou em um link',
          timestamp: firstClickDate.toISOString(),
          icon: PiTrendUp,
        });
      }

      // Milestone de 50% de aberturas
      if (stats.opened >= stats.delivered * 0.5) {
        const milestoneDate = new Date(sentDate);
        milestoneDate.setHours(milestoneDate.getHours() + 6);
        events.push({
          id: 6,
          type: 'MILESTONE_OPENS',
          title: 'Marco de Aberturas',
          description: 'Atingiu 50% de taxa de abertura',
          timestamp: milestoneDate.toISOString(),
          icon: PiChartBar,
        });
      }
    }

    // Ordenar eventos por timestamp
    return events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // 🆕 Dados para gráficos de performance por dispositivo
  const devicePerformanceData = [
    { name: 'Desktop', value: Math.round(stats.opened * 0.45) },
    { name: 'Mobile', value: Math.round(stats.opened * 0.4) },
    { name: 'Tablet', value: Math.round(stats.opened * 0.15) },
  ];

  // 🆕 Dados para gráficos de horários de maior engajamento
  const hourlyEngagementData = [
    { name: '6h', value: Math.round(stats.opened * 0.05) },
    { name: '8h', value: Math.round(stats.opened * 0.12) },
    { name: '10h', value: Math.round(stats.opened * 0.18) },
    { name: '12h', value: Math.round(stats.opened * 0.15) },
    { name: '14h', value: Math.round(stats.opened * 0.2) },
    { name: '16h', value: Math.round(stats.opened * 0.15) },
    { name: '18h', value: Math.round(stats.opened * 0.1) },
    { name: '20h', value: Math.round(stats.opened * 0.05) },
  ];

  return (
    <Modal onClose={onClose} isOpen maxWidth="6xl">
      <div className="bg-theme-elevated">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
          <div>
            <h2 className="text-xl font-bold text-theme-primary">
              {campaign.name}
            </h2>
            <p className="text-theme-secondary">{campaign.subject}</p>
          </div>
          <Inline gap={2}>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.status === 'SENT'
                  ? ''
                  : campaign.status === 'SENDING'
                    ? ''
                    : campaign.status === 'SCHEDULED'
                      ? ''
                      : 'text-theme-tertiary bg-theme-secondary'
              }`}
            >
              {campaign.status === 'SENT'
                ? 'Enviada'
                : campaign.status === 'SENDING'
                  ? 'Enviando'
                  : campaign.status === 'SCHEDULED'
                    ? 'Agendada'
                    : campaign.status}
            </span>
          </Inline>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-theme-secondary">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-theme-tertiary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-linha"></div>
              <span className="ml-2 text-theme-secondary">Carregando...</span>
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <Stack gap={6}>
              {/* Main Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Enviados"
                  value={stats.sent.toLocaleString()}
                  icon={PiEnvelopeSimple}
                  color="#3B82F6"
                />
                <MetricCard
                  title="Entregues"
                  value={stats.delivered.toLocaleString()}
                  subtitle={`${rates.deliveryRate.toFixed(1)}%`}
                  icon={PiUsers}
                  color="#10B981"
                />
                <MetricCard
                  title="Abertos"
                  value={stats.opened.toLocaleString()}
                  subtitle={`${rates.openRate.toFixed(1)}%`}
                  icon={PiChartBar}
                  color="#F59E0B"
                />
                <MetricCard
                  title="Cliques"
                  value={stats.clicked.toLocaleString()}
                  subtitle={`${rates.clickRate.toFixed(1)}%`}
                  icon={PiTrendUp}
                  color="#8B5CF6"
                />
              </div>

              {/* Performance Comparison */}
              <Stack className="bg-theme-secondary p-6 rounded-lg">
                <h3 className="font-bold text-theme-primary">
                  Performance vs Média da Indústria
                </h3>
                <Stack>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary">
                      Taxa de Abertura
                    </span>
                    <Inline gap={2}>
                      <div className="w-32 bg-theme-primary rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${Math.min(rates.openRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {rates.openRate.toFixed(1)}%
                      </span>
                      <span
                        className={`text-xs ${rates.openRate > 20 ? '' : ''}`}
                      >
                        (média: 20%)
                      </span>
                    </Inline>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary">
                      Taxa de Cliques
                    </span>
                    <Inline gap={2}>
                      <div className="w-32 bg-theme-primary rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(rates.clickRate * 10, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {rates.clickRate.toFixed(1)}%
                      </span>
                      <span
                        className={`text-xs ${rates.clickRate > 2.5 ? '' : ''}`}
                      >
                        (média: 2.5%)
                      </span>
                    </Inline>
                  </div>
                </Stack>
              </Stack>

              {/* Performance por Dispositivo */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-theme-secondary p-6 rounded-lg">
                  <HorizontalBarChart
                    data={devicePerformanceData}
                    title="Aberturas por Dispositivo"
                    color="#3B82F6"
                  />
                </div>

                <Stack className="bg-theme-secondary p-6 rounded-lg">
                  <h3 className="font-bold text-theme-primary">
                    Informações da Campanha
                  </h3>
                  <Stack gap={2} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Status</span>
                      <span className="text-theme-primary">
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Criada em</span>
                      <span className="text-theme-primary">
                        {new Date(campaign.createdAt).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                    {campaign.sentAt && (
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Enviada em</span>
                        <span className="text-theme-primary">
                          {new Date(campaign.sentAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Template</span>
                      <span className="text-theme-primary">
                        {campaign.template?.name || 'N/A'}
                      </span>
                    </div>
                  </Stack>
                </Stack>
              </div>

              {/* Problemas de Entrega */}
              <Stack className="bg-theme-secondary p-6 rounded-lg">
                <h3 className="font-bold text-theme-primary">
                  Análise de Entrega
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.bounced}</div>
                    <div className="text-sm">
                      Bounces ({rates.bounceRate.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {stats.unsubscribed}
                    </div>
                    <div className="text-sm">
                      Descadastros ({rates.unsubscribeRate.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.delivered}</div>
                    <div className="text-sm">
                      Entregues ({rates.deliveryRate.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </Stack>
            </Stack>
          )}

          {/* 🆕 ABA DE ENGAJAMENTO */}
          {!loading && activeTab === 'engagement' && (
            <Stack gap={6}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Engajamento ao Longo do Tempo */}
                <div className="bg-theme-secondary p-6 rounded-lg">
                  <MultiLineChart
                    data={engagementData}
                    title="Engajamento por Dia"
                    subtitle="Aberturas e cliques após o envio"
                    lines={['aberturas', 'cliques']}
                    height={250}
                  />
                </div>

                {/* Engajamento por Horário */}
                <div className="bg-theme-secondary p-6 rounded-lg">
                  <AdminBarChart
                    data={hourlyEngagementData}
                    title="Engajamento por Horário"
                    subtitle="Melhores horários para aberturas"
                    color="#F59E0B"
                    height={250}
                  />
                </div>
              </div>

              {/* Métricas de Engajamento */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {(
                      (stats.opened / Math.max(stats.delivered, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    Taxa de Abertura
                  </Text>
                  <div
                    className={`text-xs mt-1 ${rates.openRate > 20 ? '' : ''}`}
                  >
                    {rates.openRate > 20
                      ? '↗ Acima da média'
                      : '↘ Abaixo da média'}
                  </div>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {(
                      (stats.clicked / Math.max(stats.opened, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    Taxa de Clique
                  </Text>
                  <div
                    className={`text-xs mt-1 ${
                      rates.clickRate > 2.5 ? '' : ''
                    }`}
                  >
                    {rates.clickRate > 2.5
                      ? '↗ Acima da média'
                      : '↘ Abaixo da média'}
                  </div>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {stats.opened > 0
                      ? Math.round(
                          (stats.clicked / stats.opened) * stats.delivered
                        )
                      : 0}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    Engajamento Total
                  </Text>
                  <Text papel="legenda" tom="fraco" as="div" className="mt-1">
                    Aberturas + Cliques
                  </Text>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {stats.opened > 0
                      ? ((stats.clicked / stats.opened) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    CTR
                  </Text>
                  <Text papel="legenda" tom="fraco" as="div" className="mt-1">
                    Click-through Rate
                  </Text>
                </div>
              </div>

              {/* Análise de Tendências */}
              <Stack className="bg-theme-secondary p-6 rounded-lg">
                <h3 className="font-bold text-theme-primary">
                  Análise de Engajamento
                </h3>
                <Stack className="text-sm">
                  <div className="flex items-center justify-between p-3 bg-theme-tertiary rounded-lg">
                    <div className="flex items-center">
                      <PiTrendUp
                        className={`w-4 h-4 mr-2 ${
                          rates.openRate > 20 ? '' : ''
                        }`}
                      />
                      <span className="text-theme-primary">
                        Taxa de abertura{' '}
                        {rates.openRate > 20 ? 'excelente' : 'moderada'}
                      </span>
                    </div>
                    <span className="text-theme-tertiary">
                      {rates.openRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-theme-tertiary rounded-lg">
                    <div className="flex items-center">
                      <PiPulse
                        className={`w-4 h-4 mr-2 ${
                          rates.clickRate > 2.5 ? '' : ''
                        }`}
                      />
                      <span className="text-theme-primary">
                        Engajamento com links{' '}
                        {rates.clickRate > 2.5 ? 'alto' : 'médio'}
                      </span>
                    </div>
                    <span className="text-theme-tertiary">
                      {rates.clickRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-theme-tertiary rounded-lg">
                    <div className="flex items-center">
                      <PiUsers
                        className={`w-4 h-4 mr-2 ${
                          rates.unsubscribeRate < 1 ? '' : ''
                        }`}
                      />
                      <span className="text-theme-primary">
                        Taxa de descadastro{' '}
                        {rates.unsubscribeRate < 1 ? 'baixa' : 'normal'}
                      </span>
                    </div>
                    <span className="text-theme-tertiary">
                      {rates.unsubscribeRate.toFixed(2)}%
                    </span>
                  </div>
                </Stack>
              </Stack>
            </Stack>
          )}

          {/* 🆕 ABA DE TIMELINE */}
          {!loading && activeTab === 'timeline' && (
            <Stack gap={6}>
              <Stack gap={6} className="bg-theme-secondary p-6 rounded-lg">
                <h3 className="font-bold text-theme-primary">
                  Timeline da Campanha
                </h3>

                <div className="relative">
                  {/* Linha vertical da timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-theme-primary"></div>

                  <Stack gap={6}>
                    {timelineData.map((event) => (
                      <div key={event.id} className="relative flex items-start">
                        {/* Ícone do evento */}
                        <div
                          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg`}
                        >
                          <event.icon className="w-4 h-4 text-white" />
                        </div>

                        {/* Conteúdo do evento */}
                        <div className="ml-4 flex-1">
                          <div className="bg-theme-tertiary p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-theme-primary">
                                {event.title}
                              </h4>
                              <Text papel="legenda" tom="fraco">
                                {new Date(event.timestamp).toLocaleString(
                                  'pt-BR'
                                )}
                              </Text>
                            </div>
                            <Text papel="rotulo" tom="suave" as="p">
                              {event.description}
                            </Text>

                            {/* Dados específicos baseados no tipo de evento */}
                            {event.type === 'SENT' && (
                              <Text
                                papel="legenda"
                                tom="fraco"
                                as="div"
                                className="mt-2 flex space-x-4"
                              >
                                <span>📧 {stats.sent} enviados</span>
                                <span>✅ {stats.delivered} entregues</span>
                                <span>📖 {stats.opened} abertos</span>
                              </Text>
                            )}

                            {event.type === 'MILESTONE_OPENS' && (
                              <div className="mt-2 text-xs">
                                🎯 Meta atingida em{' '}
                                {campaign.sentAt
                                  ? Math.round(
                                      (new Date(event.timestamp).getTime() -
                                        new Date(campaign.sentAt).getTime()) /
                                        (1000 * 60 * 60)
                                    )
                                  : '?'}{' '}
                                horas
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </Stack>
                </div>
              </Stack>

              {/* Estatísticas da Timeline */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-theme-primary">
                    {campaign.sentAt
                      ? Math.round(
                          (Date.now() - new Date(campaign.sentAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0}{' '}
                    dias
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    Desde o Envio
                  </Text>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-theme-primary">
                    {timelineData.length}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    Eventos Registrados
                  </Text>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-theme-primary">
                    {campaign.sentAt && stats.opened > 0 ? '15min' : 'N/A'}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    Primeira Abertura
                  </Text>
                </div>
              </div>
            </Stack>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-theme-secondary">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
