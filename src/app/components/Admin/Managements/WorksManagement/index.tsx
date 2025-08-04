// app/components/Admin/Works/WorksManagement.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMusic,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiDownload,
  FiStar,
  FiHeart,
  FiMessageSquare,
  FiFileText,
  FiClock,
  FiUser,
  FiTarget,
  FiTrendingUp,
  FiBookOpen,
  FiCheckCircle,
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
import Input from '@/app/components/Common/Inputs';
import {
  MetricCard,
  AdminPieChart,
  AdminBarChart,
} from '@/app/components/Admin/Charts/AdminCharts';
import { useAdminWorks } from '@/app/hooks/admin/useAdminWorks';
import { formatNumber } from '@/app/hooks/admin/useAdminStats';
import { toast } from 'react-hot-toast';

import StatsSkeleton, {
  ChartSkeleton,
  TopPerformersSkeleton,
} from '@/app/components/Admin/Skeletons/StatsSkeleton';
import { getPeriodLabel } from '@/app/utils/adminUtils';
import PeriodSelector from '../../Common/PeriodSelector';
import LoadingAdminState from '../../Common/LoadingState';

interface WorkFilters {
  search: string;
  composerId: string;
  epochId: string;
  instrumentId: string;
  workType: string;
  difficultyLevel: string;
  minFavorites: string;
  minWantToLearn: string;
  minLearned: string;
  minScores: string;
  maxScores: string;
  hasScores: string;
  sortBy: string;
  sortOrder: string;
  page?: string;
}

export default function WorksManagement() {
  const router = useRouter();
  const {
    works,
    stats,
    loading,
    statsLoading,
    pagination,
    period,
    setPeriod,
    fetchWorks,
    refreshStats,
    deleteWork,
  } = useAdminWorks();

  const [filters, setFilters] = useState<WorkFilters>({
    search: '',
    composerId: 'all',
    epochId: 'all',
    instrumentId: 'all',
    workType: 'all',
    difficultyLevel: 'all',
    minFavorites: '',
    minWantToLearn: '',
    minLearned: '',
    minScores: '',
    maxScores: '',
    hasScores: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedWorks, setSelectedWorks] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Opções para filtros (normalmente viriam da API)
  const epochs = [
    { value: 'all', label: 'Todas as Épocas' },
    { value: 'Barroco', label: 'Barroco' },
    { value: 'Clássico', label: 'Clássico' },
    { value: 'Romântico', label: 'Romântico' },
    { value: 'Moderno', label: 'Moderno' },
    { value: 'Contemporâneo', label: 'Contemporâneo' },
  ];

  const instruments = [
    { value: 'all', label: 'Todos os Instrumentos' },
    { value: 'Piano', label: 'Piano' },
    { value: 'Violino', label: 'Violino' },
    { value: 'Violoncelo', label: 'Violoncelo' },
    { value: 'Flauta', label: 'Flauta' },
    { value: 'Guitarra', label: 'Guitarra' },
    { value: 'Orquestra', label: 'Orquestra' },
  ];

  const workTypes = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'Sonata', label: 'Sonata' },
    { value: 'Concerto', label: 'Concerto' },
    { value: 'Sinfonia', label: 'Sinfonia' },
    { value: 'Étude', label: 'Étude' },
    { value: 'Prelúdio', label: 'Prelúdio' },
    { value: 'Fuga', label: 'Fuga' },
  ];

  const difficultyLevels = [
    { value: 'all', label: 'Todos os Níveis' },
    { value: 'Iniciante', label: 'Iniciante' },
    { value: 'Intermediário', label: 'Intermediário' },
    { value: 'Avançado', label: 'Avançado' },
    { value: 'Profissional', label: 'Profissional' },
  ];

  const handleFilterChange = (key: keyof WorkFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Aplicar filtros
    const searchParams = {
      search: newFilters.search || undefined,
      composerId:
        newFilters.composerId !== 'all' ? newFilters.composerId : undefined,
      epochId: newFilters.epochId !== 'all' ? newFilters.epochId : undefined,
      instrumentId:
        newFilters.instrumentId !== 'all' ? newFilters.instrumentId : undefined,
      workType: newFilters.workType !== 'all' ? newFilters.workType : undefined,
      difficultyLevel:
        newFilters.difficultyLevel !== 'all'
          ? newFilters.difficultyLevel
          : undefined,
      minFavorites: newFilters.minFavorites
        ? parseInt(newFilters.minFavorites)
        : undefined,
      minWantToLearn: newFilters.minWantToLearn
        ? parseInt(newFilters.minWantToLearn)
        : undefined,
      minLearned: newFilters.minLearned
        ? parseInt(newFilters.minLearned)
        : undefined,
      minScores: newFilters.minScores
        ? parseInt(newFilters.minScores)
        : undefined,
      maxScores: newFilters.maxScores
        ? parseInt(newFilters.maxScores)
        : undefined,
      hasScores:
        newFilters.hasScores !== 'all'
          ? newFilters.hasScores === 'true'
          : undefined,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder,
    };

    fetchWorks(searchParams);
  };

  const handleSearch = () => {
    handleFilterChange('search', filters.search);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), fetchWorks()]);
    setRefreshing(false);
  };

  const handleDeleteWork = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja deletar a obra "${title}"?`)) {
      return;
    }

    const success = await deleteWork(id);
    if (success) {
      toast.success('Obra deletada com sucesso!');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedWorks.size === 0) {
      toast.error('Selecione pelo menos uma obra');
      return;
    }

    if (!confirm(`Aplicar ação "${action}" a ${selectedWorks.size} obras?`)) {
      return;
    }

    setSelectedWorks(new Set());
    toast.success(`Ação aplicada a ${selectedWorks.size} obras`);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'text-accent-green bg-accent-green/10';
      case 'Intermediário':
        return 'text-accent-amber bg-accent-amber/10';
      case 'Avançado':
        return 'text-accent-red bg-accent-red/10';
      case 'Profissional':
        return 'text-accent-purple bg-accent-purple/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  if (loading && !works.length) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="obras" />
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiMusic className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Gerenciar Obras
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Administre o catálogo de obras musicais da plataforma
            </p>
            <div className="flex justify-center mt-6">
              <PeriodSelector
                value={period}
                onChange={setPeriod}
                className="bg-theme-secondary px-4 py-2 rounded-xl"
              />
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
                title="Total de Obras"
                value={formatNumber(stats.total)}
                change={{ value: stats.recentlyAdded, isPositive: true }}
                icon={FiMusic}
                color="#10B981"
                subtitle={`nos ${getPeriodLabel(period)}`}
              />

              <MetricCard
                title="Partituras por Obra"
                value={stats.avgScoresPerWork.toFixed(1)}
                change={{ value: 12.4, isPositive: true }}
                icon={FiFileText}
                color="#3B82F6"
                subtitle="média por obra"
              />

              <MetricCard
                title="Sem Partituras"
                value={formatNumber(stats.withoutScores)}
                change={{
                  value:
                    stats.total > 0
                      ? (stats.withoutScores / stats.total) * 100
                      : 0,
                  isPositive: false,
                }}
                icon={FiTarget}
                color="#F59E0B"
                subtitle={`${(
                  (stats.withoutScores / Math.max(stats.total, 1)) *
                  100
                ).toFixed(1)}% do total`}
              />

              <MetricCard
                title="Média de Favoritos"
                value={stats.avgFavoritesPerWork.toFixed(1)}
                change={{ value: 15.2, isPositive: true }}
                icon={FiHeart}
                color="#8B5CF6"
                subtitle="por obra"
              />
            </div>
          </AnimatedItem>
        ) : null}

        {/* Charts */}
        {statsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <ChartSkeleton title="Obras por Época" />
            <ChartSkeleton title="Obras por Instrumento" />
            <ChartSkeleton title="Nível de Dificuldade" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <AnimatedCard className="classical-card p-6">
              <AdminPieChart
                data={stats.byEpoch}
                title="Obras por Época"
                subtitle={`Distribuição ${getPeriodLabel(period)}`}
                height={300}
                innerRadius={60}
              />
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <AdminPieChart
                data={stats.byInstrument}
                title="Obras por Instrumento"
                subtitle={`Distribuição ${getPeriodLabel(period)}`}
                height={300}
                innerRadius={60}
              />
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <AdminBarChart
                data={stats.byDifficulty.map((item) => ({
                  name: item.difficulty,
                  value: item.count,
                }))}
                title="Nível de Dificuldade"
                subtitle={`Distribuição ${getPeriodLabel(period)}`}
                color="#8B5CF6"
                height={300}
              />
            </AnimatedCard>
          </div>
        ) : null}

        {/* Top Performers */}
        {statsLoading ? (
          <TopPerformersSkeleton />
        ) : stats &&
          (stats.mostPopular.length > 0 ||
            stats.mostWantedToLearn.length > 0 ||
            stats.mostLearned.length > 0) ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Mais Populares */}
            {stats.mostPopular.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiStar className="w-5 h-5 text-accent-amber" />
                    <span>Mais Favoritadas</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.mostPopular.slice(0, 5).map((work, index) => (
                      <div
                        key={work.id}
                        className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-amber to-accent-red rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary truncate">
                            {work.title}
                          </p>
                          <p className="text-sm text-theme-tertiary truncate">
                            {work.composer} • {work.favoritesCount} favoritos
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => router.push(`/admin/works/${work.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Mais Queridas para Aprender */}
            {stats.mostWantedToLearn.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiBookOpen className="w-5 h-5 text-accent-blue" />
                    <span>Mais Queridas</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.mostWantedToLearn.slice(0, 5).map((work, index) => (
                      <div
                        key={work.id}
                        className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary truncate">
                            {work.title}
                          </p>
                          <p className="text-sm text-theme-tertiary truncate">
                            {work.composer} • {work.wantToLearnCount} querem
                            aprender
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => router.push(`/admin/works/${work.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Mais Aprendidas */}
            {stats.mostLearned.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiCheckCircle className="w-5 h-5 text-accent-green" />
                    <span>Mais Aprendidas</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.mostLearned.slice(0, 5).map((work, index) => (
                      <div
                        key={work.id}
                        className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary truncate">
                            {work.title}
                          </p>
                          <p className="text-sm text-theme-tertiary truncate">
                            {work.composer} • {work.learnedCount} aprenderam
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => router.push(`/admin/works/${work.id}`)}
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
        <AnimatedItem direction="up" hover="none">
          <AnimatedCard className="classical-card p-6 mb-8" hover="none">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Lista de Obras
              </h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiFilter />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtros Avançados
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
              </div>
            </div>

            {/* Filtros Básicos - sempre visíveis */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar obras..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input-classical-2 !pl-10 w-full"
                  />
                </div>

                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Data de Criação' },
                    { value: 'title', label: 'Título' },
                    { value: 'favoritesCount', label: 'Favoritos' },
                    { value: 'wantToLearnCount', label: 'Querem Aprender' },
                    { value: 'learnedCount', label: 'Aprenderam' },
                    { value: 'scoresCount', label: 'Partituras' },
                    { value: 'annotationsCount', label: 'Anotações' },
                  ]}
                  className="input-classical-2 min-w-[160px]"
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
                  className="input-classical-2 min-w-[120px]"
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

            {/* Filtros Avançados */}
            <div
              className={`space-y-4 mb-6 ${showFilters ? 'block' : 'hidden'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  value={filters.epochId}
                  onChange={(e) =>
                    handleFilterChange('epochId', e.target.value)
                  }
                  options={epochs}
                  className="input-classical-2"
                />

                <Select
                  value={filters.instrumentId}
                  onChange={(e) =>
                    handleFilterChange('instrumentId', e.target.value)
                  }
                  options={instruments}
                  className="input-classical-2"
                />

                <Select
                  value={filters.workType}
                  onChange={(e) =>
                    handleFilterChange('workType', e.target.value)
                  }
                  options={workTypes}
                  className="input-classical-2"
                />

                <Select
                  value={filters.difficultyLevel}
                  onChange={(e) =>
                    handleFilterChange('difficultyLevel', e.target.value)
                  }
                  options={difficultyLevels}
                  className="input-classical-2"
                />
              </div>

              {/* Filtros de Popularidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Mínimo de Favoritos
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={filters.minFavorites}
                    onChange={(e) =>
                      setFilters({ ...filters, minFavorites: e.target.value })
                    }
                    className="input-classical-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Mín. Querem Aprender
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 5"
                    value={filters.minWantToLearn}
                    onChange={(e) =>
                      setFilters({ ...filters, minWantToLearn: e.target.value })
                    }
                    className="input-classical-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Mín. Aprenderam
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 3"
                    value={filters.minLearned}
                    onChange={(e) =>
                      setFilters({ ...filters, minLearned: e.target.value })
                    }
                    className="input-classical-2"
                    min="0"
                  />
                </div>
              </div>

              {/* Filtros de Partituras */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Mínimo de Partituras
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 1"
                    value={filters.minScores}
                    onChange={(e) =>
                      setFilters({ ...filters, minScores: e.target.value })
                    }
                    className="input-classical-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Máximo de Partituras
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={filters.maxScores}
                    onChange={(e) =>
                      setFilters({ ...filters, maxScores: e.target.value })
                    }
                    className="input-classical-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Tem Partituras?
                  </label>
                  <Select
                    value={filters.hasScores}
                    onChange={(e) =>
                      handleFilterChange('hasScores', e.target.value)
                    }
                    options={[
                      { value: 'all', label: 'Todas' },
                      { value: 'true', label: 'Com Partituras' },
                      { value: 'false', label: 'Sem Partituras' },
                    ]}
                    className="input-classical-2"
                  />
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedWorks.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-accent-green/10 border border-accent-green rounded-xl mb-6">
                <span className="text-accent-green font-medium">
                  {selectedWorks.size} obras selecionadas
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
                    onClick={() => setSelectedWorks(new Set())}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Obras */}
            <div className="space-y-4">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedWorks.has(work.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedWorks);
                        if (e.target.checked) {
                          newSelected.add(work.id);
                        } else {
                          newSelected.delete(work.id);
                        }
                        setSelectedWorks(newSelected);
                      }}
                      className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2 mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-theme-primary text-lg">
                          {work.title}
                        </h4>
                        {work.opOrCatalog && (
                          <span className="text-sm text-theme-tertiary bg-theme-primary/20 px-2 py-1 rounded">
                            {work.opOrCatalog}
                          </span>
                        )}
                        {work.difficultyLevel && (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(
                              work.difficultyLevel
                            )}`}
                          >
                            {work.difficultyLevel}
                          </span>
                        )}
                        {work.scoresCount === 0 && (
                          <span className="text-xs bg-accent-red/10 text-accent-red px-2 py-1 rounded">
                            Sem partituras
                          </span>
                        )}
                      </div>

                      <div className="text-theme-secondary mb-3">
                        <span className="font-medium">{work.composer}</span>
                        {work.compositionYear && (
                          <span className="mx-2">•</span>
                        )}
                        {work.compositionYear && (
                          <span>{work.compositionYear}</span>
                        )}
                        <span className="mx-2">•</span>
                        <span>{work.epoch}</span>
                        <span className="mx-2">•</span>
                        <span>{work.instrument}</span>
                        {work.workType && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{work.workType}</span>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-theme-secondary">
                        <div className="flex items-center space-x-1">
                          <FiHeart className="w-4 h-4" />
                          <span
                            className={
                              work.favoritesCount === 0 ? 'text-accent-red' : ''
                            }
                          >
                            {work.favoritesCount} favoritos
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiBookOpen className="w-4 h-4" />
                          <span>{work.wantToLearnCount} querem</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiCheckCircle className="w-4 h-4" />
                          <span>{work.learnedCount} aprenderam</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiFileText className="w-4 h-4" />
                          <span
                            className={
                              work.scoresCount === 0 ? 'text-accent-red' : ''
                            }
                          >
                            {work.scoresCount} partituras
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiMessageSquare className="w-4 h-4" />
                          <span>{work.annotationsCount} anotações</span>
                        </div>
                      </div>

                      {work.uploader && (
                        <div className="mt-2 text-xs text-theme-tertiary flex items-center space-x-1">
                          <FiUser className="w-3 h-3" />
                          <span>Adicionada por: {work.uploader}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiEye />}
                        onClick={() => router.push(`/admin/works/${work.id}`)}
                        title="Ver detalhes"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiEdit />}
                        onClick={() =>
                          router.push(`/admin/works/${work.id}/edit`)
                        }
                        title="Editar"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiTrash2 />}
                        onClick={() => handleDeleteWork(work.id, work.title)}
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
                  Mostrando {works.length} de {pagination.total} obras
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
