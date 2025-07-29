// app/components/Admin/Composers/ComposersManagement.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiStar,
  FiMusic,
  FiHeart,
  FiMapPin,
  FiCalendar,
  FiShield,
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
import {
  MetricCard,
  AdminPieChart,
} from '@/app/components/Admin/Charts/AdminCharts';
import { formatNumber } from '@/app/hooks/admin/useAdminStats';
import { toast } from 'react-hot-toast';
import { useAdminComposers } from '@/app/hooks/admin/useAdminComposers';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';

interface ComposerFilters {
  search: string;
  epoch: string;
  verified: string;
  dataQuality: string;
  sortBy: string;
  sortOrder: string;
  page?: string;
}

export default function ComposersManagement() {
  const router = useRouter();
  const {
    composers,
    stats,
    loading,
    pagination,
    fetchComposers,
    refreshStats,
    updateComposer,
    deleteComposer,
  } = useAdminComposers();

  const [filters, setFilters] = useState<ComposerFilters>({
    search: '',
    epoch: 'all',
    verified: 'all',
    dataQuality: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedComposers, setSelectedComposers] = useState<Set<string>>(
    new Set()
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Épocas disponíveis (buscar da API ou definir estáticamente)
  const epochs = [
    { value: 'all', label: 'Todas as Épocas' },
    { value: 'Barroco', label: 'Barroco' },
    { value: 'Clássico', label: 'Clássico' },
    { value: 'Romântico', label: 'Romântico' },
    { value: 'Moderno', label: 'Moderno' },
    { value: 'Contemporâneo', label: 'Contemporâneo' },
  ];

  const handleFilterChange = (key: keyof ComposerFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Aplicar filtros
    const searchParams = {
      search: newFilters.search || undefined,
      epoch: newFilters.epoch !== 'all' ? newFilters.epoch : undefined,
      verified:
        newFilters.verified !== 'all'
          ? newFilters.verified === 'true'
          : undefined,
      dataQuality:
        newFilters.dataQuality !== 'all' ? newFilters.dataQuality : undefined,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder,
    };

    fetchComposers(searchParams);
  };

  const handleSearch = () => {
    handleFilterChange('search', filters.search);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), fetchComposers()]);
    setRefreshing(false);
  };

  const handleVerifyComposer = async (id: string, verified: boolean) => {
    const success = await updateComposer(id, {
      isVerified: verified,
      verificationNotes: verified
        ? 'Verificado pelo admin'
        : 'Verificação removida',
    });

    if (success) {
      toast.success(
        verified ? 'Compositor verificado!' : 'Verificação removida!'
      );
    }
  };

  const handleDeleteComposer = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar o compositor "${name}"?`)) {
      return;
    }

    const success = await deleteComposer(id);
    if (success) {
      toast.success('Compositor deletado com sucesso!');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedComposers.size === 0) {
      toast.error('Selecione pelo menos um compositor');
      return;
    }

    if (
      !confirm(
        `Aplicar ação "${action}" a ${selectedComposers.size} compositores?`
      )
    ) {
      return;
    }

    // Implementar ações em lote
    for (const composerId of selectedComposers) {
      if (action === 'verify') {
        await updateComposer(composerId, { isVerified: true });
      } else if (action === 'unverify') {
        await updateComposer(composerId, { isVerified: false });
      }
    }

    setSelectedComposers(new Set());
    toast.success(`Ação aplicada a ${selectedComposers.size} compositores`);
  };

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'high':
        return 'text-accent-green';
      case 'medium':
        return 'text-accent-amber';
      case 'low':
        return 'text-accent-red';
      default:
        return 'text-theme-tertiary';
    }
  };

  const getQualityLabel = (quality?: string) => {
    switch (quality) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'N/A';
    }
  };

  if (loading && !composers.length) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando compositores...
            </p>
          </div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Gerenciar Compositores
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Administre o catálogo de compositores da plataforma
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Overview */}
        {stats && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total de Compositores"
                value={formatNumber(stats.total)}
                change={{ value: stats.recentlyAdded, isPositive: true }}
                icon={FiUsers}
                color="#3B82F6"
              />

              <MetricCard
                title="Verificados"
                value={formatNumber(stats.verified)}
                change={{
                  value:
                    stats.total > 0 ? (stats.verified / stats.total) * 100 : 0,
                  isPositive: true,
                }}
                icon={FiCheckCircle}
                color="#10B981"
              />

              <MetricCard
                title="Adicionados (7 dias)"
                value={formatNumber(stats.recentlyAdded)}
                change={{ value: 15.2, isPositive: true }}
                icon={FiPlus}
                color="#F59E0B"
              />

              <MetricCard
                title="Mais Popular"
                value={stats.mostPopular[0]?.favoritesCount || 0}
                change={{ value: 8.7, isPositive: true }}
                icon={FiStar}
                color="#8B5CF6"
              />
            </div>
          </AnimatedItem>
        )}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AnimatedCard className="classical-card p-6">
              <AdminPieChart
                data={stats.byEpoch}
                title="Compositores por Época"
                subtitle="Distribuição por período histórico"
                height={300}
                innerRadius={60}
              />
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <AdminPieChart
                data={stats.byQuality.map((item) => ({
                  name: getQualityLabel(item.quality),
                  value: item.count,
                }))}
                title="Qualidade dos Dados"
                subtitle="Distribuição por nível de qualidade"
                height={300}
                innerRadius={60}
              />
            </AnimatedCard>
          </div>
        )}

        {/* Filters and Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Lista de Compositores
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

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={() => router.push('/uploads')}
                >
                  Novo Compositor
                </Button>
              </div>
            </div>

            <div className={`space-y-4 mb-6 block`}>
              <div className="flex items-center space-x-4">
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Data de Criação' },
                    { value: 'name', label: 'Nome' },
                    { value: 'worksCount', label: 'Número de Obras' },
                    { value: 'favoritesCount', label: 'Favoritos' },
                  ]}
                  className="input-classical-2"
                />

                <Select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange('sortOrder', e.target.value)
                  }
                  options={[
                    { value: 'desc', label: 'Decrescente' },
                    { value: 'asc', label: 'Crescente' },
                  ]}
                  className="input-classical-2"
                />

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
            {/* Filtros */}
            <div
              className={`space-y-4 mb-6 ${showFilters ? 'block' : 'hidden'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Input
                    leftIcon={<FiSearch />}
                    type="text"
                    placeholder="Buscar compositores..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input-classical-2 !pl-10 w-full"
                  />
                </div>

                <Select
                  value={filters.epoch}
                  onChange={(e) => handleFilterChange('epoch', e.target.value)}
                  options={epochs}
                  className="input-classical-2"
                />

                <Select
                  value={filters.verified}
                  onChange={(e) =>
                    handleFilterChange('verified', e.target.value)
                  }
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'true', label: 'Verificados' },
                    { value: 'false', label: 'Não Verificados' },
                  ]}
                  className="input-classical-2"
                />

                <Select
                  value={filters.dataQuality}
                  onChange={(e) =>
                    handleFilterChange('dataQuality', e.target.value)
                  }
                  options={[
                    { value: 'all', label: 'Todas as Qualidades' },
                    { value: 'high', label: 'Alta Qualidade' },
                    { value: 'medium', label: 'Média Qualidade' },
                    { value: 'low', label: 'Baixa Qualidade' },
                  ]}
                  className="input-classical-2"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedComposers.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-accent-blue/10 border border-accent-blue rounded-xl mb-6">
                <span className="text-accent-blue font-medium">
                  {selectedComposers.size} compositores selecionados
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiCheckCircle />}
                    onClick={() => handleBulkAction('verify')}
                  >
                    Verificar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiX />}
                    onClick={() => handleBulkAction('unverify')}
                  >
                    Remover Verificação
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedComposers(new Set())}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Compositores */}
            <div className="space-y-4">
              {composers.map((composer) => (
                <div
                  key={composer.id}
                  className="p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedComposers.has(composer.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedComposers);
                        if (e.target.checked) {
                          newSelected.add(composer.id);
                        } else {
                          newSelected.delete(composer.id);
                        }
                        setSelectedComposers(newSelected);
                      }}
                      className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2 mt-1"
                    />

                    {composer.portraitUrl && (
                      <Image
                        width={25}
                        height={25}
                        src={composer.portraitUrl}
                        alt={composer.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-theme-primary text-lg">
                          {composer.name}
                        </h4>
                        {composer.isVerified && (
                          <FiCheckCircle className="w-5 h-5 text-accent-green" />
                        )}
                        <span className="text-sm text-theme-tertiary">
                          {composer.epoch}
                        </span>
                        {composer.dataQuality && (
                          <span
                            className={`text-xs font-medium ${getQualityColor(
                              composer.dataQuality
                            )}`}
                          >
                            {getQualityLabel(composer.dataQuality)}
                          </span>
                        )}
                      </div>

                      {composer.fullName &&
                        composer.fullName !== composer.name && (
                          <p className="text-theme-secondary mb-2">
                            Nome completo: {composer.fullName}
                          </p>
                        )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-theme-secondary">
                        {composer.birthDate && (
                          <div className="flex items-center space-x-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>{composer.birthDate}</span>
                          </div>
                        )}
                        {composer.nationality && (
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="w-4 h-4" />
                            <span>{composer.nationality}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <FiMusic className="w-4 h-4" />
                          <span>{composer.worksCount} obras</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiHeart className="w-4 h-4" />
                          <span>{composer.favoritesCount} favoritos</span>
                        </div>
                      </div>

                      {composer.uploader && (
                        <div className="mt-2 text-xs text-theme-tertiary">
                          Adicionado por: {composer.uploader}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiEye />}
                        onClick={() => router.push(`/composer/${composer.id}`)}
                        title="Ver detalhes"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiEdit />}
                        onClick={() =>
                          router.push(`/uploads/composers/${composer.id}/edit`)
                        }
                        title="Editar"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={composer.isVerified ? <FiX /> : <FiShield />}
                        onClick={() =>
                          handleVerifyComposer(
                            composer.id,
                            !composer.isVerified
                          )
                        }
                        className={
                          composer.isVerified
                            ? 'text-accent-red'
                            : 'text-accent-green'
                        }
                        title={
                          composer.isVerified
                            ? 'Remover verificação'
                            : 'Verificar'
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiTrash2 />}
                        onClick={() =>
                          handleDeleteComposer(composer.id, composer.name)
                        }
                        className="text-accent-red hover:bg-accent-red/10"
                        title="Deletar"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-theme-secondary">
                <div className="text-sm text-theme-secondary">
                  Mostrando {composers.length} de {pagination.total}{' '}
                  compositores
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
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
