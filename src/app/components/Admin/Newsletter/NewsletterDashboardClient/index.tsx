// app/admin/newsletter/NewsletterDashboardClient.tsx
'use client';

import { useState } from 'react';
import {
  FiMail,
  FiUsers,
  FiTrendingUp,
  FiEye,
  FiMousePointer,
  FiPlus,
  FiSend,
  FiRefreshCw,
  FiBarChart2,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '@/app/components/animation/AnimatedComponents';
import { useNewsletterStats } from '@/app/hooks/useNewsletterSubscription';
import Button from '@/app/components/Common/Button';
import Link from 'next/link';
import LoadingAdminState from '../../Common/LoadingState';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  badge?: string | number;
}

export default function NewsletterDashboardClient() {
  const { stats, loading, error, refresh } = useNewsletterStats();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Nova Campanha',
      description: 'Criar campanha de email',
      icon: FiPlus,
      href: '/admin/newsletter/campaigns',
      color: 'from-brand-primary to-brand-secondary',
    },
    {
      title: 'Gerenciar Subscribers',
      description: 'Ver e gerenciar inscritos',
      icon: FiUsers,
      href: '/admin/newsletter/subscribers',
      color: 'from-accent-blue to-accent-purple',
      badge: stats?.activeSubscribers || 0,
    },
    {
      title: 'Templates',
      description: 'Criar e editar templates',
      icon: FiFileText,
      href: '/admin/newsletter/templates',
      color: 'from-accent-green to-accent-blue',
    },
    {
      title: 'Campanhas',
      description: 'Ver campanhas enviadas',
      icon: FiSend,
      href: '/admin/newsletter/campaigns',
      color: 'from-accent-purple to-accent-pink',
    },
    {
      title: 'Analytics',
      description: 'Relatórios detalhados',
      icon: FiBarChart2,
      href: '/admin/newsletter/analytics',
      color: 'from-accent-amber to-accent-red',
    },
  ];

  if (loading && !stats) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="dashboard da newsletter" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertCircle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Dashboard
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button
            variant="primary"
            leftIcon={<FiRefreshCw />}
            onClick={handleRefresh}
          >
            Tentar Novamente
          </Button>
        </div>
      </PageContainer>
    );
  }

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
                <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiMail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Newsletter Dashboard
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Gerencie campanhas de email e engajamento dos usuários
              </p>

              <div className="flex items-center justify-center gap-4 mt-6">
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
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() =>
                    (window.location.href = '/admin/newsletter/campaigns')
                  }
                >
                  Nova Campanha
                </Button>
              </div>
            </div>
          </AnimatedItem>

          {/* Stats Grid */}
          {stats && (
            <SequentialGrid cols={4} gap={6} delayBetweenItems={0.1}>
              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Total Subscribers
                    </p>
                    <p className="text-3xl font-bold text-theme-primary">
                      {stats.totalSubscribers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-accent-green rounded-full mr-2"></div>
                      <span className="text-xs text-theme-tertiary">
                        {stats.newSubscribersLast30Days} novos (30d)
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-accent-blue" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Subscribers Ativos
                    </p>
                    <p className="text-3xl font-bold text-accent-green">
                      {stats.activeSubscribers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-accent-amber rounded-full mr-2"></div>
                      <span className="text-xs text-theme-tertiary">
                        {stats.pendingSubscribers} pendentes
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6 text-accent-green" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Taxa de Abertura
                    </p>
                    <p className="text-3xl font-bold text-accent-purple">
                      {(stats.avgOpenRate * 100).toFixed(1)}%
                    </p>
                    <div className="flex items-center mt-2">
                      <FiTrendingUp className="w-3 h-3 text-accent-green mr-1" />
                      <span className="text-xs text-accent-green">
                        +2.3% vs mês anterior
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                    <FiEye className="w-6 h-6 text-accent-purple" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Taxa de Clique
                    </p>
                    <p className="text-3xl font-bold text-accent-amber">
                      {(stats.avgClickRate * 100).toFixed(1)}%
                    </p>
                    <div className="flex items-center mt-2">
                      <FiMousePointer className="w-3 h-3 text-accent-amber mr-1" />
                      <span className="text-xs text-theme-tertiary">
                        CTR médio
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center">
                    <FiMousePointer className="w-6 h-6 text-accent-amber" />
                  </div>
                </div>
              </AnimatedCard>
            </SequentialGrid>
          )}

          {/* Quick Actions */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-theme-primary mb-6">
                Ações Rápidas
              </h2>
              <SequentialGrid cols={3} gap={6} delayBetweenItems={0.1}>
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href} className="group block">
                    <AnimatedCard
                      hover="lift"
                      className="classical-card p-6 h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          >
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          {action.badge && (
                            <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full">
                              {action.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-theme-secondary text-sm">
                            {action.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-theme-secondary">
                          <span className="text-brand-primary font-medium text-sm group-hover:text-brand-secondary transition-colors">
                            Acessar →
                          </span>
                        </div>
                      </div>
                    </AnimatedCard>
                  </Link>
                ))}
              </SequentialGrid>
            </div>
          </AnimatedItem>

          {/* Recent Activity & Top Campaigns */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Subscribers */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Subscribers Recentes
                </h3>
                <Link
                  href="/admin/newsletter/subscribers"
                  className="text-brand-primary hover:text-brand-secondary font-medium text-sm"
                >
                  Ver todos →
                </Link>
              </div>

              {stats?.recentSubscribers &&
              stats.recentSubscribers.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentSubscribers
                    .slice(0, 5)
                    .map((subscriber: any) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {subscriber.firstName?.charAt(0) ||
                                subscriber.email?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-theme-primary text-sm">
                              {subscriber.firstName || 'Usuário'}
                            </p>
                            <p className="text-xs text-theme-tertiary">
                              {subscriber.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              subscriber.status === 'ACTIVE'
                                ? 'bg-accent-green/20 text-accent-green'
                                : 'bg-accent-amber/20 text-accent-amber'
                            }`}
                          >
                            {subscriber.status === 'ACTIVE'
                              ? 'Ativo'
                              : 'Pendente'}
                          </div>
                          <p className="text-xs text-theme-tertiary mt-1">
                            {new Date(
                              subscriber.subscribedAt
                            ).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                  <p className="text-theme-tertiary">
                    Nenhum subscriber recente
                  </p>
                </div>
              )}
            </AnimatedCard>

            {/* Top Campaigns */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Campanhas com Melhor Performance
                </h3>
                <Link
                  href="/admin/newsletter/campaigns"
                  className="text-brand-primary hover:text-brand-secondary font-medium text-sm"
                >
                  Ver todas →
                </Link>
              </div>

              {stats?.topPerformingCampaigns &&
              stats.topPerformingCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {stats.topPerformingCampaigns
                    .slice(0, 5)
                    .map((campaign: any) => (
                      <div
                        key={campaign.id}
                        className="p-3 bg-theme-secondary rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-theme-primary text-sm">
                            {campaign.name}
                          </h4>
                          <span className="text-xs text-theme-tertiary">
                            {campaign.sentAt
                              ? new Date(campaign.sentAt).toLocaleDateString(
                                  'pt-BR'
                                )
                              : 'Não enviada'}
                          </span>
                        </div>
                        <p className="text-xs text-theme-tertiary mb-2">
                          {campaign.subject}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="flex items-center">
                              <FiEye className="w-3 h-3 mr-1 text-accent-purple" />
                              {(campaign.openRate * 100).toFixed(1)}%
                            </span>
                            <span className="flex items-center">
                              <FiMousePointer className="w-3 h-3 mr-1 text-accent-amber" />
                              {(campaign.clickRate * 100).toFixed(1)}%
                            </span>
                          </div>
                          <span className="text-xs text-theme-tertiary">
                            {campaign.emailsSent || 0} enviados
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiSend className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                  <p className="text-theme-tertiary">
                    Nenhuma campanha enviada ainda
                  </p>
                  <Link
                    href="/admin/newsletter/campaigns/create"
                    className="inline-flex items-center space-x-2 mt-4 text-brand-primary hover:text-brand-secondary font-medium text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Criar primeira campanha</span>
                  </Link>
                </div>
              )}
            </AnimatedCard>
          </div>
        </AnimatedContainer>
      </div>
    </PageContainer>
  );
}
