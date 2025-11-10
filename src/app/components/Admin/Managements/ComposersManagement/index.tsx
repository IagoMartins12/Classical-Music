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
  FiMusic,
  FiHeart,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiImage,
  FiTrendingUp,
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
import {
  MetricCard,
  AdminPieChart,
} from '@/app/components/Admin/Charts/AdminCharts';
import { formatNumber } from '../../Utils';
import { toast } from 'react-hot-toast';
import { useAdminComposers } from '@/app/hooks/admin/useAdminComposers';

import StatsSkeleton, {
  ChartSkeleton,
  TopPerformersSkeleton,
} from '@/app/components/Admin/Skeletons/StatsSkeleton';
import Image from 'next/image';
import { getPeriodLabel } from '@/app/utils/adminUtils';
import PeriodSelector from '../../Common/PeriodSelector';
import LoadingAdminState from '../../Common/LoadingState';
import { mapStatsToChartData } from '@/app/utils/admin/adminDebug';

interface ComposerFilters {
  search: string;
  epoch: string;
  verified: string;
  dataQuality: string;
  hasImage: string;
  minWorks: string;
  maxWorks: string;
  minFavorites: string;
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
    statsLoading,
    pagination,
    period,
    setPeriod,
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
    hasImage: 'all',
    minWorks: '',
    maxWorks: '',
    minFavorites: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedComposers, setSelectedComposers] = useState<Set<string>>(
    new Set()
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Épocas disponíveis
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
      hasImage:
        newFilters.hasImage !== 'all'
          ? newFilters.hasImage === 'true'
          : undefined,
      minWorks: newFilters.minWorks ? parseInt(newFilters.minWorks) : undefined,
      maxWorks: newFilters.maxWorks ? parseInt(newFilters.maxWorks) : undefined,
      minFavorites: newFilters.minFavorites
        ? parseInt(newFilters.minFavorites)
        : undefined,
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
        <LoadingAdminState loadingName="compositores" />
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Gerenciar Compositores
            </h1>
            <p className="text-lg md:text-xl text-theme-secondary classical-subtitle">
              Administre o catálogo de compositores da plataforma
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <PeriodSelector
                value={period}
                onChange={setPeriod}
                className="bg-theme-secondary px-4 py-2 rounded-xl"
              />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                }
                onClick={handleRefresh}
                disabled={refreshing || statsLoading}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* Stats Overview */}
        {statsLoading ? (
          <StatsSkeleton count={4} />
        ) : stats ? (
          <AnimatedItem direction="up" springType="gentle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total de Compositores"
                value={formatNumber(stats.total)}
                change={{ value: stats.recentlyAdded, isPositive: true }}
                icon={FiUsers}
                color="#3B82F6"
                subtitle={`nos ${getPeriodLabel(period)}`}
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
                subtitle={`${(
                  (stats.verified / Math.max(stats.total, 1)) *
                  100
                ).toFixed(1)}% do total`}
              />

              <MetricCard
                title="Com Imagens"
                value={formatNumber(stats.withImages)}
                change={{
                  value:
                    stats.total > 0
                      ? (stats.withImages / stats.total) * 100
                      : 0,
                  isPositive: true,
                }}
                icon={FiImage}
                color="#8B5CF6"
                subtitle={`${(
                  (stats.withImages / Math.max(stats.total, 1)) *
                  100
                ).toFixed(1)}% do total`}
              />

              <MetricCard
                title="Média de Obras"
                value={stats.avgWorksPerComposer.toFixed(1)}
                change={{ value: 8.7, isPositive: true }}
                icon={FiMusic}
                color="#F59E0B"
                subtitle="por compositor"
              />
            </div>
          </AnimatedItem>
        ) : null}

        {/* Charts */}
        {/* Charts - SEÇÃO CORRIGIDA */}
        {statsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartSkeleton title="Compositores por Época" />
            <ChartSkeleton title="Qualidade dos Dados" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 🔧 GRÁFICO POR ÉPOCA CORRIGIDO */}
            <AnimatedCard className="classical-card p-6">
              <AdminPieChart
                data={mapStatsToChartData(stats, 'byEpoch', 'count')}
                title="Compositores por Época"
                subtitle={`Distribuição ${getPeriodLabel(period)}`}
                height={300}
                innerRadius={60}
              />
            </AnimatedCard>

            {/* 🔧 GRÁFICO DE QUALIDADE CORRIGIDO */}
            <AnimatedCard className="classical-card p-6">
              <AdminPieChart
                data={mapStatsToChartData(stats, 'byQuality', 'count')}
                title="Qualidade dos Dados"
                subtitle={`Distribuição ${getPeriodLabel(period)}`}
                height={300}
                innerRadius={60}
              />
            </AnimatedCard>
          </div>
        ) : null}

        {/* Top Performers */}
        {statsLoading ? (
          <TopPerformersSkeleton />
        ) : stats &&
          (stats.mostPopular.length > 0 || stats.topByWorks.length > 0) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Mais Populares */}
            {stats.mostPopular.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiTrendingUp className="w-5 h-5 text-accent-red" />
                    <span>Mais Favoritados</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.mostPopular.slice(0, 5).map((composer, index) => (
                      <div
                        key={composer.id}
                        className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-amber rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary truncate">
                            {composer.name}
                          </p>
                          <p className="text-sm text-theme-tertiary">
                            {composer.favoritesCount} favoritos •{' '}
                            {composer.worksCount} obras
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() =>
                            router.push(`/composer/${composer.id}`)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Mais Produtivos */}
            {stats.topByWorks.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiMusic className="w-5 h-5 text-accent-blue" />
                    <span>Mais Produtivos</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.topByWorks.slice(0, 5).map((composer, index) => (
                      <div
                        key={composer.id}
                        className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary truncate">
                            {composer.name}
                          </p>
                          <p className="text-sm text-theme-tertiary">
                            {composer.worksCount} obras
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() =>
                            router.push(`/composer/${composer.id}`)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}
          </div>
        ) : null}

        {/* Filters and Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="classical-card p-4 md:p-6 mb-8">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-theme-primary">
                  Lista de Compositores
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={() => router.push('/uploads')}
                  className="hidden md:flex"
                >
                  Novo Compositor
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiFilter />}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Filtros Avançados</span>
                  <span className="sm:hidden">Filtros</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                  }
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Atualizar</span>
                </Button>
              </div>
            </div>

            {/* Filtros Básicos */}
            <div className="space-y-4 mb-6">
              {/* Busca */}
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                <Input
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

              {/* Ordenação e Buscar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Data de Criação' },
                    { value: 'name', label: 'Nome' },
                    { value: 'worksCount', label: 'Número de Obras' },
                    { value: 'favoritesCount', label: 'Favoritos' },
                  ]}
                  className="input-classical-2  w-full"
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
                  className="input-classical-2  w-full"
                />

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FiSearch />}
                  onClick={handleSearch}
                  className=" w-full"
                >
                  Buscar
                </Button>
              </div>
            </div>

            {/* Filtros Avançados */}
            <div
              className={`space-y-4 mb-6 transition-all duration-300 ${
                showFilters ? 'block' : 'hidden'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                  value={filters.epoch}
                  onChange={(e) => handleFilterChange('epoch', e.target.value)}
                  options={epochs}
                  className="input-classical-2 w-full"
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
                  className="input-classical-2 w-full"
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
                  className="input-classical-2 w-full"
                />

                <Select
                  value={filters.hasImage}
                  onChange={(e) =>
                    handleFilterChange('hasImage', e.target.value)
                  }
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'true', label: 'Com Imagem' },
                    { value: 'false', label: 'Sem Imagem' },
                  ]}
                  className="input-classical-2 w-full"
                />
              </div>

              {/* Filtros Numéricos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-theme-secondary mb-1 md:mb-2">
                    Mínimo de Obras
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 5"
                    value={filters.minWorks}
                    onChange={(e) =>
                      setFilters({ ...filters, minWorks: e.target.value })
                    }
                    className="input-classical-2 w-full"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-theme-secondary mb-1 md:mb-2">
                    Máximo de Obras
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    value={filters.maxWorks}
                    onChange={(e) =>
                      setFilters({ ...filters, maxWorks: e.target.value })
                    }
                    className="input-classical-2 w-full"
                    min="0"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs md:text-sm font-medium text-theme-secondary mb-1 md:mb-2">
                    Mínimo de Favoritos
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={filters.minFavorites}
                    onChange={(e) =>
                      setFilters({ ...filters, minFavorites: e.target.value })
                    }
                    className="input-classical-2 w-full"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedComposers.size > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-accent-blue/10 border border-accent-blue rounded-xl mb-6 gap-3">
                <span className="text-sm md:text-base text-accent-blue font-medium">
                  {selectedComposers.size} selecionado
                  {selectedComposers.size > 1 ? 's' : ''}
                </span>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiCheckCircle />}
                    onClick={() => handleBulkAction('verify')}
                    className="flex-1 sm:flex-none"
                  >
                    Verificar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiX />}
                    onClick={() => handleBulkAction('unverify')}
                    className="flex-1 sm:flex-none"
                  >
                    <span className="hidden md:inline">
                      Remover Verificação
                    </span>
                    <span className="md:hidden">Remover</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedComposers(new Set())}
                    className="w-full sm:w-auto"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Compositores */}
            <div className="space-y-3 md:space-y-4">
              {composers.map((composer) => (
                <div
                  key={composer.id}
                  className="p-3 md:p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Checkbox */}
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
                      className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2 mt-1 flex-shrink-0"
                    />

                    {/* Imagem */}
                    <div className="flex-shrink-0">
                      {composer.portraitUrl ? (
                        <Image
                          width={48}
                          height={48}
                          src={composer.portraitUrl}
                          alt={composer.name}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-theme-primary/20 flex items-center justify-center">
                          <FiUsers className="w-6 h-6 md:w-8 md:h-8 text-theme-tertiary" />
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      {/* Nome e badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-bold text-theme-primary text-base md:text-lg">
                          {composer.name}
                        </h4>
                        {composer.isVerified && (
                          <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent-green flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs md:text-sm">
                        <span className="text-theme-tertiary">
                          {composer.epoch}
                        </span>
                        {composer.dataQuality && (
                          <span
                            className={`font-medium ${getQualityColor(
                              composer.dataQuality
                            )}`}
                          >
                            {getQualityLabel(composer.dataQuality)}
                          </span>
                        )}
                        {!composer.hasValidImage && (
                          <span className="bg-accent-red/10 text-accent-red px-2 py-0.5 rounded">
                            Sem imagem
                          </span>
                        )}
                      </div>

                      {/* Nome completo */}
                      {composer.fullName &&
                        composer.fullName !== composer.name && (
                          <p className="text-xs md:text-sm text-theme-secondary mb-2 break-words">
                            {composer.fullName}
                          </p>
                        )}

                      {/* Informações */}
                      <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-theme-secondary mb-2">
                        {composer.birthDate && (
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {composer.birthDate}
                            </span>
                          </div>
                        )}
                        {composer.nationality && (
                          <div className="flex items-center gap-1">
                            <FiMapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {composer.nationality}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FiMusic className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span
                            className={
                              composer.worksCount === 0 ? 'text-accent-red' : ''
                            }
                          >
                            {composer.worksCount} obras
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiHeart className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{composer.favoritesCount} favoritos</span>
                        </div>
                      </div>

                      {/* Uploader */}
                      {composer.uploader && (
                        <div className="text-xs text-theme-tertiary">
                          Por: {composer.uploader}
                        </div>
                      )}
                    </div>

                    {/* Ações - Desktop */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
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
                          router.push(`/uploads/composer/${composer.id}/edit`)
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

                  {/* Ações - Mobile */}
                  <div className="flex md:hidden items-center gap-2 mt-3 pt-3 border-t border-theme-primary/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/composer/${composer.id}`)}
                      className="flex-1"
                    >
                      <FiEye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/uploads/composer/${composer.id}/edit`)
                      }
                      className="flex-1"
                    >
                      <FiEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleVerifyComposer(composer.id, !composer.isVerified)
                      }
                      className={`flex-1 ${
                        composer.isVerified
                          ? 'text-accent-red'
                          : 'text-accent-green'
                      }`}
                    >
                      {composer.isVerified ? (
                        <FiX className="w-4 h-4" />
                      ) : (
                        <FiShield className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDeleteComposer(composer.id, composer.name)
                      }
                      className="flex-1 text-accent-red hover:bg-accent-red/10"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-theme-secondary gap-4">
                <div className="text-xs md:text-sm text-theme-secondary text-center sm:text-left">
                  Mostrando {composers.length} de {pagination.total}{' '}
                  compositores
                </div>
                <div className="flex items-center gap-2">
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
                  <span className="text-xs md:text-sm text-theme-primary whitespace-nowrap">
                    {pagination.page} / {pagination.pages}
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
