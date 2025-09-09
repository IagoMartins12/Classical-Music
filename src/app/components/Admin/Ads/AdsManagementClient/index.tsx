// app/admin/ads/AdsManagementClient.tsx - Atualizado com clonagem
'use client';

import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlay,
  FiPause,
  FiBarChart2,
  FiImage,
  FiVideo,
  FiTarget,
  FiTrendingUp,
  FiRefreshCw,
  FiMessageCircle,
  FiUpload,
  FiAlertTriangle,
  FiCopy, // 🆕 Ícone de clonagem
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';

import toast from 'react-hot-toast';
import { useAds } from '@/app/hooks/admin/useAds';
import Button from '@/app/components/Common/Button';
import AdStatsModal from '../AdStatsModal';
import MediaUploadModal from '../MediaUploadModal';
import EditAdModal from '../EditAdModal';
import CreateAdModal from '../CreateAdModal';
import CloneAdModal from '../CloneAdModal'; // 🆕 Novo modal
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import Image from 'next/image';
import LoadingAdminState from '../../Common/LoadingState';

interface FilterState {
  status: string;
  type: string;
  placement: string;
  targetType: string;
  search: string;
}

const statusOptions = [
  { value: '', label: 'Todos os Status' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'EXPIRED', label: 'Expirado' },
];

const typeOptions = [
  { value: '', label: 'Todos os Tipos' },
  { value: 'BANNER', label: 'Banner' },
  { value: 'VIDEO', label: 'Vídeo' },
  { value: 'CARD', label: 'Card' },
  { value: 'SIDEBAR', label: 'Sidebar' },
  { value: 'NATIVE', label: 'Nativo' },
];

const targetTypeOptions = [
  { value: '', label: 'Todos os Targets' },
  { value: 'GENERAL', label: 'Geral' },
  { value: 'INSTRUMENT', label: 'Por Instrumento' },
  { value: 'USER_LEVEL', label: 'Por Nível' },
];

export default function AdsManagementClient() {
  const {
    ads,
    loading,
    pagination,
    fetchAds,
    updateAdStatus,
    deleteAd,
    stats,
    refreshStats,
  } = useAds();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [statsAd, setStatsAd] = useState<any>(null);
  const [mediaAd, setMediaAd] = useState<any>(null);
  const [cloningAd, setCloningAd] = useState<any>(null); // 🆕 Estado para clonagem
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    type: '',
    placement: '',
    targetType: '',
    search: '',
  });

  // Buscar publicidades quando os filtros mudarem
  useEffect(() => {
    fetchAds(1, filters);
  }, [filters]);

  // Buscar estatísticas ao carregar
  useEffect(() => {
    refreshStats();
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStatusChange = async (adId: string, newStatus: string) => {
    try {
      await updateAdStatus(adId, newStatus);
      toast.success('Status atualizado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (
      confirm(
        'Tem certeza que deseja deletar este anúncio? Esta ação não pode ser desfeita.'
      )
    ) {
      try {
        await deleteAd(adId);
        toast.success('Anúncio deletado com sucesso');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao deletar anúncio');
      }
    }
  };

  // 🆕 Função para iniciar clonagem
  const handleCloneAd = (ad: any) => {
    setCloningAd(ad);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedAds.length === 0) {
      toast.error('Selecione pelo menos um anúncio');
      return;
    }

    if (
      confirm(`Executar ação "${action}" em ${selectedAds.length} anúncio(s)?`)
    ) {
      try {
        await Promise.all(
          selectedAds.map((adId) =>
            action === 'delete' ? deleteAd(adId) : updateAdStatus(adId, action)
          )
        );
        setSelectedAds([]);
        toast.success(`Ação executada em ${selectedAds.length} anúncio(s)`);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao executar ação em lote');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-accent-green bg-accent-green/10';
      case 'PAUSED':
        return 'text-accent-amber bg-accent-amber/10';
      case 'DRAFT':
        return 'text-theme-tertiary bg-theme-secondary';
      case 'SCHEDULED':
        return 'text-accent-blue bg-accent-blue/10';
      case 'EXPIRED':
        return 'text-accent-red bg-accent-red/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'PAUSED':
        return 'Pausado';
      case 'DRAFT':
        return 'Rascunho';
      case 'SCHEDULED':
        return 'Agendado';
      case 'EXPIRED':
        return 'Expirado';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return FiVideo;
      case 'BANNER':
        return FiImage;
      case 'CARD':
        return FiTarget;
      default:
        return FiImage;
    }
  };

  const hasMedia = (ad: any) => {
    return ad.imageUrl || ad.videoUrl;
  };

  const getTargetTypeLabel = (ad: any) => {
    if (ad.targetType === 'INSTRUMENT' && ad.instrument) {
      return `${ad.instrument.name}`;
    } else if (ad.targetType === 'USER_LEVEL') {
      return ad.targetUserLevel === 'ALL'
        ? 'Todos os usuários'
        : ad.targetUserLevel === 'TEACHER'
          ? 'Professores'
          : 'Estudantes';
    }
    return 'Geral';
  };

  if (loading && ads.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="anúncios" />
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8">
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-6"
        >
          {/* Header Section */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-pink rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiTarget className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Gerenciamento de Anúncios
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Gerencie campanhas publicitárias e parcerias
              </p>
            </div>
          </AnimatedItem>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Total de Ads
                    </p>
                    <p className="text-3xl font-bold text-theme-primary">
                      {stats.totalAds}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiTarget className="w-6 h-6 text-accent-blue" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">Ativos</p>
                    <p className="text-3xl font-bold text-accent-green">
                      {stats.activeAds}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                    <FiPlay className="w-6 h-6 text-accent-green" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Impressões (30d)
                    </p>
                    <p className="text-3xl font-bold text-accent-purple">
                      {stats.impressions30d.toLocaleString()}
                    </p>
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
                      CTR Médio
                    </p>
                    <p className="text-3xl font-bold text-accent-amber">
                      {stats.avgCTR.toFixed(2)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="w-6 h-6 text-accent-amber" />
                  </div>
                </div>
              </AnimatedCard>
            </div>
          )}

          {/* Controls Section */}
          <AnimatedCard className="classical-card p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar anúncios..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select
                    options={statusOptions}
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                    className="px-3 py-2"
                  />

                  <Select
                    options={typeOptions}
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="px-3 py-2"
                  />

                  <Select
                    options={targetTypeOptions}
                    value={filters.targetType}
                    onChange={(e) =>
                      handleFilterChange('targetType', e.target.value)
                    }
                    className="px-3 py-2"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  }
                  onClick={() => {
                    fetchAds(1, filters);
                    refreshStats();
                  }}
                  disabled={loading}
                >
                  Atualizar
                </Button>

                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Novo Anúncio
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedAds.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-brand-primary/10 border border-brand-primary rounded-lg mb-4">
                <span className="text-sm font-medium text-theme-primary">
                  {selectedAds.length} selecionado(s)
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiPlay />}
                    onClick={() => handleBulkAction('ACTIVE')}
                  >
                    Ativar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiPause />}
                    onClick={() => handleBulkAction('PAUSED')}
                  >
                    Pausar
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

            {/* Ads Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-primary">
                    <th className="text-left py-3 px-2">
                      <Input
                        type="checkbox"
                        checked={
                          selectedAds.length === ads.length && ads.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAds(ads.map((ad) => ad.id));
                          } else {
                            setSelectedAds([]);
                          }
                        }}
                        className="rounded border-theme-primary"
                      />
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Anúncio
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Segmentação
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Mídia
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Performance
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => {
                    const TypeIcon = getTypeIcon(ad.type);
                    return (
                      <tr
                        key={ad.id}
                        className="border-b border-theme-secondary hover:bg-theme-secondary/50"
                      >
                        <td className="py-3 px-2">
                          <Input
                            type="checkbox"
                            checked={selectedAds.includes(ad.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAds([...selectedAds, ad.id]);
                              } else {
                                setSelectedAds(
                                  selectedAds.filter((id) => id !== ad.id)
                                );
                              }
                            }}
                            className="rounded border-theme-primary"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-3">
                            {ad.imageUrl ? (
                              <Image
                                width={48}
                                height={48}
                                src={ad.imageUrl}
                                alt={ad.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-theme-secondary rounded-lg flex items-center justify-center">
                                <TypeIcon className="w-6 h-6 text-theme-tertiary" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-theme-primary">
                                  {ad.title}
                                </h3>
                                {!hasMedia(ad) && (
                                  <FiAlertTriangle
                                    className="w-4 h-4 text-accent-amber"
                                    title="Sem mídia"
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                                <span>{ad.advertiserName}</span>
                                <span>•</span>
                                <span>{ad.placement}</span>
                                {ad.linkType === 'whatsapp' && (
                                  <>
                                    <span>•</span>
                                    <FiMessageCircle className="w-3 h-3" />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              ad.status
                            )}`}
                          >
                            {getStatusLabel(ad.status)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-theme-secondary">
                            {getTargetTypeLabel(ad)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-1">
                            {ad.imageUrl && (
                              <FiImage className="w-4 h-4 text-accent-green" />
                            )}
                            {ad.videoUrl && (
                              <FiVideo className="w-4 h-4 text-accent-blue" />
                            )}
                            {!hasMedia(ad) && (
                              <span className="text-xs text-accent-red">
                                Sem mídia
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">
                            <div className="text-theme-primary font-medium">
                              {ad.totalImpressions?.toLocaleString() || 0} imp.
                            </div>
                            <div className="text-theme-tertiary">
                              CTR: {ad.ctr?.toFixed(2) || 0}%
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-1">
                            {/* 🆕 Botão de clonagem */}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiCopy />}
                              onClick={() => handleCloneAd(ad)}
                              title="Clonar anúncio"
                              className="text-accent-purple hover:text-accent-purple"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiUpload />}
                              onClick={() => setMediaAd(ad)}
                              title="Gerenciar mídia"
                              className={
                                !hasMedia(ad) ? 'text-accent-amber' : ''
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiBarChart2 />}
                              onClick={() => setStatsAd(ad)}
                              title="Ver estatísticas"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiEdit />}
                              onClick={() => setEditingAd(ad)}
                              title="Editar"
                            />
                            {ad.status === 'ACTIVE' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiPause />}
                                onClick={() =>
                                  handleStatusChange(ad.id, 'PAUSED')
                                }
                                title="Pausar"
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiPlay />}
                                onClick={() =>
                                  handleStatusChange(ad.id, 'ACTIVE')
                                }
                                title="Ativar"
                                disabled={!hasMedia(ad)}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiTrash2 />}
                              onClick={() => handleDeleteAd(ad.id)}
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

              {ads.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FiTarget className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-theme-primary mb-2">
                    Nenhum anúncio encontrado
                  </h3>
                  <p className="text-theme-tertiary mb-6">
                    {filters.search || filters.status || filters.type
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando seu primeiro anúncio'}
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<FiPlus />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Criar Anúncio
                  </Button>
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
                  de {pagination.total} resultados
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchAds(pagination.page - 1, filters)}
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
                    onClick={() => fetchAds(pagination.page + 1, filters)}
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

      {/* Modals */}
      {showCreateModal && (
        <CreateAdModal
          showCreateModal={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAds(1, filters);
            refreshStats();
          }}
        />
      )}

      {editingAd && (
        <EditAdModal
          ad={editingAd}
          onClose={() => setEditingAd(null)}
          onSuccess={() => {
            setEditingAd(null);
            fetchAds(pagination?.page || 1, filters);
            refreshStats();
          }}
        />
      )}

      {/* 🆕 Modal de clonagem */}
      {cloningAd && (
        <CloneAdModal
          ad={cloningAd}
          onClose={() => setCloningAd(null)}
          onSuccess={() => {
            setCloningAd(null);
            fetchAds(pagination?.page || 1, filters);
            refreshStats();
          }}
        />
      )}

      {statsAd && (
        <AdStatsModal
          ad={statsAd}
          onClose={() => setStatsAd(null)}
          statsAd={!!statsAd}
        />
      )}

      {mediaAd && (
        <MediaUploadModal
          ad={mediaAd}
          onClose={() => setMediaAd(null)}
          onSuccess={() => {
            setMediaAd(null);
            fetchAds(pagination?.page || 1, filters);
          }}
        />
      )}
    </PageContainer>
  );
}
