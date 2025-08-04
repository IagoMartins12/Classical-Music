// app/admin/newsletter/subscribers/NewsletterSubscribersClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiDownload,
  FiMail,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import {
  formatSubscriberCount,
  getSubscriptionStatusColor,
  getSubscriptionStatusLabel,
} from '@/app/hooks/useNewsletterSubscription';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import LoadingAdminState from '../../Common/LoadingState';

interface FilterState {
  status: string;
  search: string;
  dateRange: string;
  engagement: string;
}

const subscribeOptions = [
  { value: '', label: 'Todos os Status' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'UNSUBSCRIBED', label: 'Cancelados' },
  { value: 'BOUNCED', label: 'Bounced' },
  { value: 'BLOCKED', label: 'Bloqueados' },
];

const dateRangeOptions = [
  { value: '', label: 'Todos os períodos' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'year', label: 'Este ano' },
];

const engagementOptions = [
  { value: '', label: 'Todos os Níveis' },
  { value: 'high', label: 'Alto Engajamento' },
  { value: 'medium', label: 'Médio Engajamento' },
  { value: 'low', label: 'Baixo Engajamento' },
  { value: 'none', label: 'Sem Engajamento' },
];

export default function NewsletterSubscribersClient() {
  const {
    subscribers,
    loading,
    pagination,
    fetchSubscribers,
    updateSubscriber,
    deleteSubscriber,
    exportSubscribers,
  } = useNewsletterAdmin();

  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    search: '',
    dateRange: '',
    engagement: '',
  });

  useEffect(() => {
    fetchSubscribers(1, filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStatusChange = async (
    subscriberId: string,
    newStatus: string
  ) => {
    try {
      await updateSubscriber(subscriberId, { status: newStatus });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSubscribers.length === 0) return;

    try {
      const promises = selectedSubscribers.map((id) => {
        switch (action) {
          case 'activate':
            return updateSubscriber(id, { status: 'ACTIVE' });
          case 'deactivate':
            return updateSubscriber(id, { status: 'UNSUBSCRIBED' });
          case 'delete':
            return deleteSubscriber(id);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSelectedSubscribers([]);
      fetchSubscribers(pagination?.page || 1, filters);
    } catch (error: any) {
      console.error('Erro na ação em lote:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportSubscribers(filters);
    } catch (error: any) {
      console.error('Erro no export:', error);
    }
  };

  const getEngagementLevel = (subscriber: any) => {
    const score = subscriber.avgEngagementScore || 0;
    if (score >= 75)
      return { label: 'Alto', color: 'text-accent-green bg-accent-green/10' };
    if (score >= 50)
      return { label: 'Médio', color: 'text-accent-amber bg-accent-amber/10' };
    if (score >= 25)
      return { label: 'Baixo', color: 'text-accent-red bg-accent-red/10' };
    return { label: 'Nenhum', color: 'text-theme-tertiary bg-theme-secondary' };
  };

  if (loading && subscribers.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="subscribers" />
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
                  <FiUsers className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Gerenciar Subscribers
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Gerencie sua base de subscribers da newsletter
              </p>
            </div>
          </AnimatedItem>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Total</p>
                  <p className="text-3xl font-bold text-theme-primary">
                    {formatSubscriberCount(pagination?.total || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-accent-blue" />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Ativos</p>
                  <p className="text-3xl font-bold text-accent-green">
                    {subscribers.filter((s) => s.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-accent-green" />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Pendentes</p>
                  <p className="text-3xl font-bold text-accent-amber">
                    {subscribers.filter((s) => s.status === 'PENDING').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-accent-amber" />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Cancelados</p>
                  <p className="text-3xl font-bold text-accent-red">
                    {
                      subscribers.filter((s) => s.status === 'UNSUBSCRIBED')
                        .length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-red/20 rounded-xl flex items-center justify-center">
                  <FiXCircle className="w-6 h-6 text-accent-red" />
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Controls */}
          <AnimatedCard className="classical-card p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por email ou nome..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <Select
                    options={subscribeOptions}
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                  />

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiFilter />}
                    onClick={() => setShowFilters(!showFilters)}
                    className={
                      showFilters
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : ''
                    }
                  >
                    Filtros
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiDownload />}
                  onClick={handleExport}
                >
                  Exportar
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  }
                  onClick={() => fetchSubscribers(1, filters)}
                  disabled={loading}
                >
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-theme-secondary rounded-lg grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Período de Inscrição
                  </label>
                  <Select
                    options={dateRangeOptions}
                    value={filters.dateRange}
                    onChange={(e) =>
                      handleFilterChange('dateRange', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Nível de Engajamento
                  </label>
                  <Select
                    options={engagementOptions}
                    value={filters.engagement}
                    onChange={(e) =>
                      handleFilterChange('engagement', e.target.value)
                    }
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        status: '',
                        search: '',
                        dateRange: '',
                        engagement: '',
                      })
                    }
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedSubscribers.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-brand-primary/10 border border-brand-primary rounded-lg mb-4">
                <span className="text-sm font-medium text-theme-primary">
                  {selectedSubscribers.length} selecionado(s)
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiCheckCircle />}
                    onClick={() => handleBulkAction('activate')}
                  >
                    Ativar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiXCircle />}
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    Desativar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiTrash2 />}
                    onClick={() => handleBulkAction('delete')}
                    className="text-accent-red hover:text-accent-red"
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            )}

            {/* Subscribers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-primary">
                    <th className="text-left py-3 px-2">
                      <Input
                        type="checkbox"
                        checked={
                          selectedSubscribers.length === subscribers.length &&
                          subscribers.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubscribers(
                              subscribers.map((s) => s.id)
                            );
                          } else {
                            setSelectedSubscribers([]);
                          }
                        }}
                        className="rounded border-theme-primary"
                      />
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Subscriber
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Engajamento
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Inscrição
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => {
                    const engagement = getEngagementLevel(subscriber);
                    const statusColor = getSubscriptionStatusColor(
                      subscriber.status
                    );
                    const statusLabel = getSubscriptionStatusLabel(
                      subscriber.status
                    );

                    return (
                      <tr
                        key={subscriber.id}
                        className="border-b border-theme-secondary hover:bg-theme-secondary/50"
                      >
                        <td className="py-3 px-2">
                          <Input
                            type="checkbox"
                            checked={selectedSubscribers.includes(
                              subscriber.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubscribers([
                                  ...selectedSubscribers,
                                  subscriber.id,
                                ]);
                              } else {
                                setSelectedSubscribers(
                                  selectedSubscribers.filter(
                                    (id) => id !== subscriber.id
                                  )
                                );
                              }
                            }}
                            className="rounded border-theme-primary"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-theme-primary">
                                {subscriber.firstName
                                  ? `${subscriber.firstName} ${
                                      subscriber.lastName || ''
                                    }`.trim()
                                  : 'Sem nome'}
                              </span>
                              {subscriber.user && (
                                <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full">
                                  Usuário
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-theme-secondary">
                              {subscriber.email}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              {subscriber.interests.length > 0 && (
                                <span>
                                  Interesses:{' '}
                                  {subscriber.interests.slice(0, 2).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${engagement.color}`}
                            >
                              {engagement.label}
                            </span>
                            <div className="text-xs text-theme-tertiary mt-1">
                              {subscriber.emailOpenCount || 0} aberturas •{' '}
                              {subscriber.emailClickCount || 0} cliques
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">
                            <div className="text-theme-primary">
                              {new Date(
                                subscriber.subscribedAt
                              ).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-theme-tertiary text-xs">
                              {subscriber.frequency || 'weekly'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={() => {
                                /* Modal de detalhes */
                              }}
                              title="Ver detalhes"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiEdit />}
                              onClick={() => {
                                /* Modal de edição */
                              }}
                              title="Editar"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiMail />}
                              onClick={() => {
                                /* Enviar email individual */
                              }}
                              title="Enviar email"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiTrash2 />}
                              onClick={() =>
                                handleStatusChange(
                                  subscriber.id,
                                  'UNSUBSCRIBED'
                                )
                              }
                              className="text-accent-red hover:text-accent-red"
                              title="Deletar"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {subscribers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FiUsers className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-theme-primary mb-2">
                    Nenhum subscriber encontrado
                  </h3>
                  <p className="text-theme-tertiary mb-6">
                    {filters.search || filters.status
                      ? 'Tente ajustar os filtros de busca'
                      : 'Ainda não há subscribers na newsletter'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-theme-tertiary">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{' '}
                  de {pagination.total} subscribers
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      fetchSubscribers(pagination.page - 1, filters)
                    }
                    disabled={pagination.page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-theme-primary">
                    {pagination.page} de {pagination.pages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      fetchSubscribers(pagination.page + 1, filters)
                    }
                    disabled={pagination.page === pagination.pages}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </AnimatedCard>
        </AnimatedContainer>
      </div>
    </PageContainer>
  );
}
