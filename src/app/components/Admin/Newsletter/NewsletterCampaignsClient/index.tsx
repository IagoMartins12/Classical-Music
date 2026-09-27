// app/admin/newsletter/campaigns/NewsletterCampaignsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiCalendarBlank,
  PiChartBar,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiFlask,
  PiMagnifyingGlass,
  PiNotePencil,
  PiPaperPlaneRight,
  PiPause,
  PiPlay,
  PiPlus,
  PiTrash,
} from 'react-icons/pi';
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
import SendTestCampaignModal from './SendTestCampaignModal';
import LoadingAdminState from '../../Common/LoadingState';
import EditCampaignModal from '../EditCampaignModal';
import { cancelCampaignRequest } from '@/app/requests/admin/newsletter';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
  const [showEditModal, setShowEditModal] = useState(false); // 🆕 ESTADO PARA MODAL DE EDIÇÃO

  // Estados existentes para teste
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

  // 🆕 FUNÇÃO PARA ABRIR MODAL DE EDIÇÃO
  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  // 🆕 FUNÇÃO PARA SUCESSO DA EDIÇÃO
  const handleEditSuccess = () => {
    fetchCampaigns(campaignsPagination?.page || 1, filters);
  };

  // Função existente para abrir modal de teste
  const handleSendTest = (campaign: any) => {
    setSelectedCampaignForTest(campaign);
    setShowTestModal(true);
  };

  // Função existente para sucesso do teste
  const handleTestSuccess = (result: any) => {
    console.log('Teste enviado com sucesso:', result);
  };

  // 🆕 FUNÇÃO PARA PAUSAR/RETOMAR CAMPANHA
  // A API não pausa nem retoma campanha: só cancela, e a cancelada não volta.
  const handleToggleCampaign = async (campaign: any) => {
    if (campaign.status === 'PAUSED') {
      alert(
        'A campanha não pode ser retomada pela API. Crie uma nova campanha para enviar de novo.'
      );
      return;
    }

    if (
      confirm(
        `A API não pausa campanhas: "${campaign.name}" será cancelada e não poderá ser retomada. Continuar?`
      )
    ) {
      try {
        await cancelCampaignRequest(campaign.id);

        fetchCampaigns(campaignsPagination?.page || 1, filters);
      } catch (error: any) {
        console.error('Erro ao alterar status da campanha:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'text-ok bg-ok/10';
      case 'SENDING':
        return 'text-aviso bg-aviso/10';
      case 'SCHEDULED':
        return 'text-ouro-texto bg-ouro/10';
      case 'DRAFT':
        return 'text-theme-tertiary bg-theme-secondary';
      case 'PAUSED':
        return 'text-atencao bg-atencao/10';
      case 'CANCELLED':
      case 'FAILED':
        return 'text-erro bg-erro/10';
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

  // 🆕 FUNÇÃO PARA DETERMINAR SE PODE EDITAR
  const canEdit = (campaign: any) => {
    return ['DRAFT', 'SCHEDULED', 'PAUSED', 'CANCELLED', 'FAILED'].includes(
      campaign.status
    );
  };

  // 🆕 FUNÇÃO PARA DETERMINAR SE PODE PAUSAR/RETOMAR
  const canTogglePause = (campaign: any) => {
    return ['SCHEDULED', 'PAUSED'].includes(campaign.status);
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
                <div className="w-16 h-16 fill-ouro rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <PiPaperPlaneRight className="w-8 h-8 text-white" />
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

          {/* Stats Cards Atualizadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            {/* Total */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Total
                  </Text>
                  <p className="text-3xl font-bold text-theme-primary">
                    {campaigns.length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-aviso/20 rounded-xl flex items-center justify-center">
                  <PiEnvelopeSimple className="w-6 h-6 text-aviso" />
                </div>
              </div>
            </AnimatedCard>

            {/* Enviadas */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Enviadas
                  </Text>
                  <p className="text-3xl font-bold text-ok">
                    {campaigns.filter((c) => c.status === 'SENT').length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-ok/20 rounded-xl flex items-center justify-center">
                  <PiCheckCircle className="w-6 h-6 text-ok" />
                </div>
              </div>
            </AnimatedCard>

            {/* Agendadas */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Agendadas
                  </Text>
                  <p className="text-3xl font-bold text-ouro-texto">
                    {campaigns.filter((c) => c.status === 'SCHEDULED').length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-ouro/20 rounded-xl flex items-center justify-center">
                  <PiCalendarBlank className="w-6 h-6 text-ouro-texto" />
                </div>
              </div>
            </AnimatedCard>

            {/* Prontas para Teste */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Prontas p/ Teste
                  </Text>
                  <p className="text-3xl font-bold text-ouro-texto">
                    {
                      campaigns.filter(
                        (c) => c.status === 'DRAFT' || c.status === 'SCHEDULED'
                      ).length
                    }
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-ouro/20 rounded-xl flex items-center justify-center">
                  <PiFlask className="w-6 h-6 text-ouro-texto" />
                </div>
              </div>
            </AnimatedCard>

            {/* Rascunhos */}
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Rascunhos
                  </Text>
                  <p className="text-3xl font-bold text-atencao">
                    {campaigns.filter((c) => c.status === 'DRAFT').length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-atencao/20 rounded-xl flex items-center justify-center">
                  <PiNotePencil className="w-6 h-6 text-atencao" />
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
                  <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar campanhas..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary placeholder-texto-fraco focus:outline-none focus:ring-2 focus:ring-ouro"
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
                    <PiArrowsClockwise
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
                  leftIcon={<PiPlus />}
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
                        className="border-b border-theme-secondary hover:bg-sup-1/50"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <h3 className="font-medium text-theme-primary">
                              {campaign.name}
                            </h3>
                            <Text papel="rotulo" tom="suave" as="p">
                              {campaign.subject}
                            </Text>
                            <Inline
                              gap={2}
                              className="text-xs text-theme-tertiary mt-1"
                            >
                              <span>
                                {campaign.template?.name || 'Sem template'}
                              </span>
                              <span>•</span>
                              <span>por Admin</span>
                            </Inline>
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

                        {/* 🆕 AÇÕES ATUALIZADAS COM BOTÃO DE EDIÇÃO */}
                        <td className="py-3 px-2">
                          <Inline gap={1}>
                            {/* Estatísticas */}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<PiChartBar />}
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setShowStatsModal(true);
                              }}
                              title="Ver estatísticas"
                            />

                            {/* 🆕 EDITAR (apenas para campanhas editáveis) */}
                            {canEdit(campaign) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<PiNotePencil />}
                                onClick={() => handleEditCampaign(campaign)}
                                title="Editar campanha"
                                className="text-aviso hover:text-aviso"
                              />
                            )}

                            {/* Envio de Teste */}
                            {(campaign.status === 'DRAFT' ||
                              campaign.status === 'SCHEDULED') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<PiFlask />}
                                onClick={() => handleSendTest(campaign)}
                                title="Enviar Teste"
                                className="text-ouro-texto hover:text-ouro-texto"
                              />
                            )}

                            {/* 🆕 PAUSAR/RETOMAR */}
                            {canTogglePause(campaign) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={
                                  campaign.status === 'PAUSED' ? (
                                    <PiPlay />
                                  ) : (
                                    <PiPause />
                                  )
                                }
                                onClick={() => handleToggleCampaign(campaign)}
                                title={
                                  campaign.status === 'PAUSED'
                                    ? 'Retomar'
                                    : 'Pausar'
                                }
                                className="text-atencao hover:text-atencao"
                              />
                            )}

                            {/* Enviar Real */}
                            {(campaign.status === 'DRAFT' ||
                              campaign.status === 'SCHEDULED') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<PiPaperPlaneRight />}
                                onClick={() => handleSendCampaign(campaign)}
                                title="Enviar agora"
                                className="text-ok hover:text-ok"
                              />
                            )}

                            {/* Deletar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<PiTrash />}
                              onClick={() => handleDeleteCampaign(campaign)}
                              className="text-erro hover:text-erro"
                              title="Deletar"
                            />
                          </Inline>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {campaigns.length === 0 && !campaignsLoading && (
                <div className="text-center py-12">
                  <PiPaperPlaneRight className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
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
                    leftIcon={<PiPlus />}
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
                <Text papel="rotulo" tom="fraco" as="div">
                  Mostrando{' '}
                  {(campaignsPagination.page - 1) * campaignsPagination.limit +
                    1}{' '}
                  a{' '}
                  {Math.min(
                    campaignsPagination.page * campaignsPagination.limit,
                    campaignsPagination.total
                  )}{' '}
                  de {campaignsPagination.total} campanhas
                </Text>
                <Inline gap={2}>
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
                  <Text papel="rotulo" tom="forte">
                    {campaignsPagination.page} de {campaignsPagination.pages}
                  </Text>
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
                </Inline>
              </div>
            )}
          </AnimatedCard>
        </AnimatedContainer>
      </Stack>

      {/* Modais Existentes */}
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

      {/* 🆕 MODAL DE EDIÇÃO */}
      {showEditModal && selectedCampaign && (
        <EditCampaignModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCampaign(null);
          }}
          campaign={selectedCampaign}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de Envio de Teste */}
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
