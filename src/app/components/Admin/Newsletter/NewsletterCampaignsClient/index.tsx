// app/admin/newsletter/campaigns/NewsletterCampaignsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiSend,
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiEye,
  FiBarChart2,
  FiCalendar,
  FiCopy,
  FiMail,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import CreateCampaignModal from './CreateCampaignModal';
import { CampaignStatsModal } from './CampaignStatsModal';
import { FaFlask } from 'react-icons/fa';
import SendTestCampaignModal from './SendTestCampaignModal';
import LoadingAdminState from '../../Common/LoadingState';

interface FilterState {
  status: string;
  search: string;
  dateRange: string;
}

const statusOptions = [
  { value: '', label: 'Todos os Status' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SCHEDULED', label: 'Agendadas' },
  { value: 'SENDING', label: 'Enviando' },
  { value: 'SENT', label: 'Enviadas' },
  { value: 'PAUSED', label: 'Pausadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: 'FAILED', label: 'Falharam' },
];

const dateRangeOptions = [
  { value: '', label: 'Todos os períodos' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
];

export default function NewsletterCampaignsClient() {
  const {
    campaigns,
    campaignsLoading,
    campaignsPagination,
    fetchCampaigns,
    deleteCampaign,
    sendCampaign,
  } = useNewsletterAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // 🆕 NOVOS ESTADOS para teste
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedCampaignForTest, setSelectedCampaignForTest] =
    useState<any>(null);

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    search: '',
    dateRange: '',
  });

  useEffect(() => {
    fetchCampaigns(1, filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSendCampaign = async (campaign: any) => {
    if (
      confirm(
        `Tem certeza que deseja enviar a campanha "${campaign.name}"? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await sendCampaign(campaign.id);
      } catch (error: any) {
        console.error('Erro ao enviar campanha:', error);
      }
    }
  };

  const handleDeleteCampaign = async (campaign: any) => {
    if (
      confirm(
        `Tem certeza que deseja deletar a campanha "${campaign.name}"? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await deleteCampaign(campaign.id);
      } catch (error: any) {
        console.error('Erro ao deletar campanha:', error);
      }
    }
  };

  // 🆕 NOVA FUNÇÃO para abrir modal de teste
  const handleSendTest = (campaign: any) => {
    setSelectedCampaignForTest(campaign);
    setShowTestModal(true);
  };

  // 🆕 NOVA FUNÇÃO para sucesso do teste
  const handleTestSuccess = (result: any) => {
    console.log('Teste enviado com sucesso:', result);
    // Opcional: mostrar notificação de sucesso
    // Pode adicionar toast/notification aqui
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'text-accent-green bg-accent-green/10';
      case 'SENDING':
        return 'text-accent-blue bg-accent-blue/10';
      case 'SCHEDULED':
        return 'text-accent-purple bg-accent-purple/10';
      case 'DRAFT':
        return 'text-theme-tertiary bg-theme-secondary';
      case 'PAUSED':
        return 'text-accent-amber bg-accent-amber/10';
      case 'CANCELLED':
      case 'FAILED':
        return 'text-accent-red bg-accent-red/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'Enviada';
      case 'SENDING':
        return 'Enviando';
      case 'SCHEDULED':
        return 'Agendada';
      case 'DRAFT':
        return 'Rascunho';
      case 'PAUSED':
        return 'Pausada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'FAILED':
        return 'Falhou';
      default:
        return status;
    }
  };

  if (campaignsLoading && campaigns.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="campanhas" />
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
                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-pink rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiSend className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Campanhas de Email
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Crie e gerencie campanhas de newsletter
              </p>
            </div>
          </AnimatedItem>

          {/* 🆕 Stats Cards Atualizadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            {/* Total */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Total</p>
                  <p className="text-3xl font-bold text-theme-primary">
                    {campaigns.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-accent-blue" />
                </div>
              </div>
            </AnimatedCard>

            {/* Enviadas */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Enviadas</p>
                  <p className="text-3xl font-bold text-accent-green">
                    {campaigns.filter((c) => c.status === 'SENT').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-accent-green" />
                </div>
              </div>
            </AnimatedCard>

            {/* Agendadas */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Agendadas</p>
                  <p className="text-3xl font-bold text-accent-purple">
                    {campaigns.filter((c) => c.status === 'SCHEDULED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-accent-purple" />
                </div>
              </div>
            </AnimatedCard>

            {/* 🆕 Prontas para Teste */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">
                    Prontas p/ Teste
                  </p>
                  <p className="text-3xl font-bold text-accent-purple">
                    {
                      campaigns.filter(
                        (c) => c.status === 'DRAFT' || c.status === 'SCHEDULED'
                      ).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                  <FaFlask className="w-6 h-6 text-accent-purple" />
                </div>
              </div>
            </AnimatedCard>

            {/* Rascunhos */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Rascunhos</p>
                  <p className="text-3xl font-bold text-accent-amber">
                    {campaigns.filter((c) => c.status === 'DRAFT').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center">
                  <FiEdit className="w-6 h-6 text-accent-amber" />
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
                    placeholder="Buscar campanhas..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select
                    options={statusOptions}
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                  />

                  <Select
                    options={dateRangeOptions}
                    value={filters.dateRange}
                    onChange={(e) =>
                      handleFilterChange('dateRange', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw
                      className={campaignsLoading ? 'animate-spin' : ''}
                    />
                  }
                  onClick={() => fetchCampaigns(1, filters)}
                  disabled={campaignsLoading}
                >
                  Atualizar
                </Button>

                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Nova Campanha
                </Button>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-primary">
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Campanha
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Performance
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Agendamento
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const statusColor = getStatusColor(campaign.status);
                    const statusLabel = getStatusLabel(campaign.status);

                    return (
                      <tr
                        key={campaign.id}
                        className="border-b border-theme-secondary hover:bg-theme-secondary/50"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <h3 className="font-medium text-theme-primary">
                              {campaign.name}
                            </h3>
                            <p className="text-sm text-theme-secondary">
                              {campaign.subject}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-theme-tertiary mt-1">
                              <span>{campaign.template.name}</span>
                              <span>•</span>
                              <span>por Admin</span>
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
                          <div className="text-sm">
                            <div className="text-theme-primary font-medium">
                              {campaign.emailsSent?.toLocaleString() || 0}{' '}
                              enviados
                            </div>
                            <div className="text-theme-tertiary">
                              {campaign.openRate
                                ? `${(campaign.openRate * 100).toFixed(
                                    1
                                  )}% abertos`
                                : 'N/A'}{' '}
                              •
                              {campaign.clickRate
                                ? ` ${(campaign.clickRate * 100).toFixed(
                                    1
                                  )}% clicaram`
                                : ' N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">
                            {campaign.scheduledAt ? (
                              <div>
                                <div className="text-theme-primary">
                                  {new Date(
                                    campaign.scheduledAt
                                  ).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-theme-tertiary">
                                  {new Date(
                                    campaign.scheduledAt
                                  ).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            ) : campaign.sentAt ? (
                              <div>
                                <div className="text-theme-primary">
                                  Enviada
                                </div>
                                <div className="text-theme-tertiary">
                                  {new Date(campaign.sentAt).toLocaleDateString(
                                    'pt-BR'
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-theme-tertiary">
                                Não agendada
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 🆕 AÇÕES ATUALIZADAS COM BOTÃO DE TESTE */}
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-1">
                            {/* Estatísticas */}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiBarChart2 />}
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setShowStatsModal(true);
                              }}
                              title="Ver estatísticas"
                            />

                            {/* 🆕 NOVO: Envio de Teste */}
                            {(campaign.status === 'DRAFT' ||
                              campaign.status === 'SCHEDULED') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FaFlask />}
                                onClick={() => handleSendTest(campaign)}
                                title="Enviar Teste"
                                className="text-accent-purple hover:text-accent-purple"
                              />
                            )}

                            {/* Editar */}
                            {campaign.status === 'DRAFT' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiEdit />}
                                onClick={() => {
                                  /* Modal de edição - implementar se necessário */
                                }}
                                title="Editar"
                              />
                            )}

                            {/* Enviar Real */}
                            {(campaign.status === 'DRAFT' ||
                              campaign.status === 'SCHEDULED') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiSend />}
                                onClick={() => handleSendCampaign(campaign)}
                                title="Enviar agora"
                                className="text-accent-green hover:text-accent-green"
                              />
                            )}

                            {/* Deletar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiTrash2 />}
                              onClick={() => handleDeleteCampaign(campaign)}
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

              {campaigns.length === 0 && !campaignsLoading && (
                <div className="text-center py-12">
                  <FiSend className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-theme-primary mb-2">
                    Nenhuma campanha encontrada
                  </h3>
                  <p className="text-theme-tertiary mb-6">
                    {filters.search || filters.status
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando sua primeira campanha de newsletter'}
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<FiPlus />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Criar Campanha
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {campaignsPagination && campaignsPagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-theme-tertiary">
                  Mostrando{' '}
                  {(campaignsPagination.page - 1) * campaignsPagination.limit +
                    1}{' '}
                  a{' '}
                  {Math.min(
                    campaignsPagination.page * campaignsPagination.limit,
                    campaignsPagination.total
                  )}{' '}
                  de {campaignsPagination.total} campanhas
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      fetchCampaigns(campaignsPagination.page - 1, filters)
                    }
                    disabled={campaignsPagination.page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-theme-primary">
                    {campaignsPagination.page} de {campaignsPagination.pages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      fetchCampaigns(campaignsPagination.page + 1, filters)
                    }
                    disabled={
                      campaignsPagination.page === campaignsPagination.pages
                    }
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </AnimatedCard>
        </AnimatedContainer>
      </div>

      {/* Modals Existentes */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns(1, filters);
          }}
        />
      )}

      {showStatsModal && selectedCampaign && (
        <CampaignStatsModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowStatsModal(false);
            setSelectedCampaign(null);
          }}
        />
      )}

      {/* 🆕 NOVO: Modal de Envio de Teste */}
      {showTestModal && selectedCampaignForTest && (
        <SendTestCampaignModal
          isOpen={showTestModal}
          onClose={() => {
            setShowTestModal(false);
            setSelectedCampaignForTest(null);
          }}
          campaign={selectedCampaignForTest}
          onSuccess={handleTestSuccess}
        />
      )}
    </PageContainer>
  );
}
