// app/components/Admin/Uploads/UploadsManagement.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUpload,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiFileText,
  FiMusic,
  FiUsers,
  FiTrendingUp,
  FiTarget,
  FiMessageSquare,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import {
  MetricCard,
  AdminPieChart,
  MultiLineChart,
} from '@/app/components/Admin/Charts/AdminCharts';
import { useAdminUploads } from '@/app/hooks/admin/useAdminUploads';
import { formatNumber } from '../../Utils';
import { toast } from 'react-hot-toast';
import LoadingAdminState from '../../Common/LoadingState';
import Input from '@/app/components/Common/Inputs';

interface UploadFilters {
  search: string;
  entityType: string;
  status: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: string;
  page?: string;
}

export default function UploadsManagement() {
  const router = useRouter();
  const { uploads, stats, loading, pagination, fetchUploads, refreshStats } =
    useAdminUploads();

  const [filters, setFilters] = useState<UploadFilters>({
    search: '',
    entityType: 'all',
    status: 'all',
    userId: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUploads, setSelectedUploads] = useState<Set<string>>(
    new Set()
  );

  const entityTypes = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'composer', label: 'Compositores' },
    { value: 'work', label: 'Obras' },
    { value: 'score', label: 'Partituras' },
    { value: 'annotation', label: 'Anotações' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Rejeitado' },
  ];

  const handleFilterChange = (key: keyof UploadFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Aplicar filtros
    const searchParams = {
      search: newFilters.search || undefined,
      entityType:
        newFilters.entityType !== 'all' ? newFilters.entityType : undefined,
      status: newFilters.status !== 'all' ? newFilters.status : undefined,
      userId: newFilters.userId !== 'all' ? newFilters.userId : undefined,
      dateFrom: newFilters.dateFrom || undefined,
      dateTo: newFilters.dateTo || undefined,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder,
    };

    fetchUploads(searchParams);
  };

  const handleSearch = () => {
    handleFilterChange('search', filters.search);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), fetchUploads()]);
    setRefreshing(false);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'composer':
        return FiUsers;
      case 'work':
        return FiMusic;
      case 'score':
        return FiFileText;
      case 'annotation':
        return FiMessageSquare;
      default:
        return FiFileText;
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'composer':
        return 'Compositor';
      case 'work':
        return 'Obra';
      case 'score':
        return 'Partitura';
      case 'annotation':
        return 'Anotação';
      default:
        return entityType;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Criação';
      case 'update':
        return 'Atualização';
      case 'delete':
        return 'Exclusão';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-accent-green bg-accent-green/10';
      case 'update':
        return 'text-accent-blue bg-accent-blue/10';
      case 'delete':
        return 'text-accent-red bg-accent-red/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'text-accent-green';
      case 'rejected':
        return 'text-accent-red';
      case 'pending':
        return 'text-accent-amber';
      default:
        return 'text-theme-tertiary';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return FiCheckCircle;
      case 'rejected':
        return FiXCircle;
      case 'pending':
        return FiClock;
      default:
        return FiClock;
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUploads.size === 0) {
      toast.error('Selecione pelo menos um upload');
      return;
    }

    if (
      !confirm(`Aplicar ação "${action}" a ${selectedUploads.size} uploads?`)
    ) {
      return;
    }

    setSelectedUploads(new Set());
    toast.success(`Ação aplicada a ${selectedUploads.size} uploads`);
  };

  if (loading && !uploads.length) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="uploads" />
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
                <FiUpload className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Gerenciar Uploads
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Monitore e modere uploads de conteúdo da plataforma
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Overview */}
        {stats && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total de Uploads"
                value={formatNumber(stats.total)}
                change={{ value: 15.2, isPositive: true }}
                icon={FiUpload}
                color="#8B5CF6"
              />

              <MetricCard
                title="Pendentes"
                value={formatNumber(stats.pending)}
                change={{ value: stats.pending, isPositive: false }}
                icon={FiClock}
                color="#F59E0B"
              />

              <MetricCard
                title="Aprovados"
                value={formatNumber(stats.approved)}
                change={{
                  value:
                    stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
                  isPositive: true,
                }}
                icon={FiCheckCircle}
                color="#10B981"
              />

              <MetricCard
                title="Taxa de Aprovação"
                value={`${
                  stats.total > 0
                    ? ((stats.approved / stats.total) * 100).toFixed(1)
                    : 0
                }%`}
                change={{ value: 5.2, isPositive: true }}
                icon={FiTrendingUp}
                color="#3B82F6"
              />
            </div>
          </AnimatedItem>
        )}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AnimatedCard className="classical-card p-6">
              <AdminPieChart
                data={stats.byType}
                title="Uploads por Tipo"
                subtitle="Distribuição por tipo de conteúdo"
                height={300}
                innerRadius={60}
              />
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <MultiLineChart
                data={stats.timeline.map((item) => ({
                  name: new Date(item.date).toLocaleDateString('pt-BR', {
                    month: 'short',
                    day: 'numeric',
                  }),
                  Uploads: item.uploads,
                  Aprovados: item.approved,
                  Rejeitados: item.rejected,
                }))}
                title="Timeline de Atividade"
                subtitle="Uploads, aprovações e rejeições (últimos 14 dias)"
                lines={['Uploads', 'Aprovados', 'Rejeitados']}
                height={300}
              />
            </AnimatedCard>
          </div>
        )}

        {/* Top Uploaders */}
        {stats && stats.byUser.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mb-8">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiTarget className="w-5 h-5 text-accent-purple" />
                <span>Principais Uploaders (30 dias)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byUser.slice(0, 6).map((user, index) => (
                  <div
                    key={user.userId}
                    className="p-4 bg-theme-secondary rounded-xl"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-theme-primary truncate">
                          {user.userName}
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          {user.count} uploads
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-theme-primary/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent-purple to-accent-blue h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (user.count / (stats.byUser[0]?.count || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiEye />}
                        onClick={() =>
                          router.push(`/admin/users/${user.userId}`)
                        }
                        className="ml-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Recent Activity */}
        {/* {stats && stats.recentActivity.length > 0 && (
          <AnimatedItem direction="up">
            <AnimatedCard className="classical-card p-6 mb-8" hover="none">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiActivity className="w-5 h-5 text-accent-blue" />
                <span>Atividade Recente</span>
              </h3>
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 8).map((activity) => {
                  const EntityIcon = getEntityIcon(activity.entityType);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-3 bg-theme-secondary rounded-xl"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                        <EntityIcon className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-theme-primary">
                            {activity.userName}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getActionColor(
                              activity.action
                            )}`}
                          >
                            {getActionLabel(activity.action)}
                          </span>
                          <span className="text-sm text-theme-tertiary">
                            {getEntityTypeLabel(activity.entityType)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiEye />}
                        onClick={() =>
                          router.push(`/admin/uploads/${activity.id}`)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )} */}

        {/* Filters and Controls */}
        <AnimatedItem direction="up" hover="none">
          <AnimatedCard className="classical-card p-6 mb-8" hover="none">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Histórico de Uploads
              </h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiFilter />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtros
                </Button>
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
                <Button variant="secondary" size="sm" leftIcon={<FiDownload />}>
                  Exportar
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div
              className={`space-y-4 mb-6 ${showFilters ? 'block' : 'hidden'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar uploads..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input-classical-2 pl-10 w-full"
                  />
                </div>

                <Select
                  value={filters.entityType}
                  onChange={(e) =>
                    handleFilterChange('entityType', e.target.value)
                  }
                  options={entityTypes}
                  className="input-classical-2"
                />

                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={statusOptions}
                  className="input-classical-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="input-classical-2"
                  placeholder="Data inicial"
                />

                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="input-classical-2"
                  placeholder="Data final"
                />

                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Data' },
                    { value: 'entityType', label: 'Tipo' },
                    { value: 'userId', label: 'Usuário' },
                  ]}
                  className="input-classical-2"
                />

                <Select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange('sortOrder', e.target.value)
                  }
                  options={[
                    { value: 'desc', label: 'Mais recente' },
                    { value: 'asc', label: 'Mais antigo' },
                  ]}
                  className="input-classical-2"
                />
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FiSearch />}
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUploads.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-accent-purple/10 border border-accent-purple rounded-xl mb-6">
                <span className="text-accent-purple font-medium">
                  {selectedUploads.size} uploads selecionados
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiDownload />}
                    onClick={() => handleBulkAction('export')}
                  >
                    Exportar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUploads(new Set())}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Uploads */}
            <div className="space-y-4">
              {uploads.map((upload) => {
                const EntityIcon = getEntityIcon(upload.entityType);
                const StatusIcon = getStatusIcon(
                  upload.moderationStatus?.status
                );

                return (
                  <div
                    key={upload.id}
                    className="p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedUploads.has(upload.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedUploads);
                          if (e.target.checked) {
                            newSelected.add(upload.id);
                          } else {
                            newSelected.delete(upload.id);
                          }
                          setSelectedUploads(newSelected);
                        }}
                        className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2 mt-1"
                      />

                      <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center flex-shrink-0">
                        <EntityIcon className="w-6 h-6 text-theme-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${getActionColor(
                              upload.action
                            )}`}
                          >
                            {getActionLabel(upload.action)}
                          </span>
                          <span className="text-sm font-medium text-theme-primary">
                            {getEntityTypeLabel(upload.entityType)}
                          </span>
                          {upload.moderationStatus && (
                            <div className="flex items-center space-x-1">
                              <StatusIcon
                                className={`w-4 h-4 ${getStatusColor(
                                  upload.moderationStatus.status
                                )}`}
                              />
                              <span
                                className={`text-xs font-medium ${getStatusColor(
                                  upload.moderationStatus.status
                                )}`}
                              >
                                {upload.moderationStatus.status}
                              </span>
                            </div>
                          )}
                        </div>

                        {upload.entityDetails && (
                          <div className="mb-2">
                            {upload.entityType === 'composer' && (
                              <h4 className="font-medium text-theme-primary">
                                {upload.entityDetails.name}
                              </h4>
                            )}
                            {upload.entityType === 'work' && (
                              <h4 className="font-medium text-theme-primary">
                                {upload.entityDetails.title}
                                {upload.entityDetails.composer && (
                                  <span className="text-theme-secondary ml-2">
                                    • {upload.entityDetails.composer.name}
                                  </span>
                                )}
                              </h4>
                            )}
                            {upload.entityType === 'score' && (
                              <h4 className="font-medium text-theme-primary">
                                {upload.entityDetails.title}
                                {upload.entityDetails.work && (
                                  <span className="text-theme-secondary ml-2">
                                    • {upload.entityDetails.work.title}
                                  </span>
                                )}
                              </h4>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-4 h-4" />
                            <span>{upload.user.name}</span>
                          </div>

                          {upload.reason && (
                            <div className="flex items-center space-x-1">
                              <FiFileText className="w-4 h-4" />
                              <span className="truncate max-w-xs">
                                {upload.reason}
                              </span>
                            </div>
                          )}
                        </div>

                        {upload.moderationStatus?.reason && (
                          <div className="mt-2 p-2 bg-theme-primary/20 rounded text-xs text-theme-secondary">
                            <strong>Motivo da moderação:</strong>{' '}
                            {upload.moderationStatus.reason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() =>
                            router.push(`/admin/uploads/${upload.id}`)
                          }
                          title="Ver detalhes"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-theme-secondary">
                <div className="text-sm text-theme-secondary">
                  Mostrando {uploads.length} de {pagination.total} uploads
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      handleFilterChange(
                        'page',
                        (pagination.page - 1).toString()
                      )
                    }
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-theme-primary">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() =>
                      handleFilterChange(
                        'page',
                        (pagination.page + 1).toString()
                      )
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
