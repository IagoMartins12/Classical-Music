// app/components/Admin/Scores/ScoresManagement.tsx - COM DEBUG
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiArrowsClockwise,
  PiCalendarBlank,
  PiCheckCircle,
  PiDownloadSimple,
  PiEye,
  PiFileText,
  PiFunnel,
  PiHardDrive,
  PiMagnifyingGlass,
  PiNotePencil,
  PiPause,
  PiPlay,
  PiPlus,
  PiStar,
  PiStarFill,
  PiTarget,
  PiTrendUp,
  PiUser,
  PiWarningCircle,
  PiXCircle,
} from 'react-icons/pi';
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
  AdminBarChart,
} from '@/app/components/Admin/Charts/AdminCharts';
import { formatNumber } from '../../Utils';
import { toast } from 'react-hot-toast';
import { useAdminScores } from '@/app/hooks/admin/useAdminScores';
import Image from '@/app/components/SmartImage';
import LoadingAdminState from '../../Common/LoadingState';
import Input from '@/app/components/Common/Inputs';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface ScoreFilters {
  search: string;
  workId: string;
  source: string;
  type: string;
  isActive: string;
  sortBy: string;
  sortOrder: string;
  page?: string;
}

export default function ScoresManagement() {
  const router = useRouter();
  const {
    scores,
    stats,
    loading,
    pagination,
    fetchScores,
    refreshStats,
    updateScore,
  } = useAdminScores();

  const [filters, setFilters] = useState<ScoreFilters>({
    search: '',
    workId: 'all',
    source: 'all',
    type: 'all',
    isActive: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedScores, setSelectedScores] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // 🆕 Debug mode

  // Opções para filtros
  const sources = [
    { value: 'all', label: 'Todas as Fontes' },
    { value: 'IMSLP', label: 'IMSLP' },
    { value: 'CUSTOM', label: 'Personalizada' },
    { value: 'UPLOAD', label: 'Upload de Usuário' },
  ];

  const handleFilterChange = (key: keyof ScoreFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Aplicar filtros
    const searchParams = {
      search: newFilters.search || undefined,
      workId: newFilters.workId !== 'all' ? newFilters.workId : undefined,
      source: newFilters.source !== 'all' ? newFilters.source : undefined,
      type: newFilters.type !== 'all' ? newFilters.type : undefined,
      isActive:
        newFilters.isActive !== 'all'
          ? newFilters.isActive === 'true'
          : undefined,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder,
    };

    fetchScores(searchParams);
  };

  const handleSearch = () => {
    handleFilterChange('search', filters.search);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), fetchScores()]);
    setRefreshing(false);
  };

  // A API conta as métricas do catálogo na hora: recalcular é só buscar de novo.
  const handleRecalculateStats = async () => {
    setRefreshing(true);
    try {
      await refreshStats();
      toast.success('Estatísticas recalculadas com sucesso!');
    } catch (error) {
      console.error('Erro ao recalcular:', error);
      toast.error('Erro ao recalcular estatísticas');
    }
    setRefreshing(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await updateScore(id, { isActive: !currentStatus });
    if (success) {
      toast.success(
        currentStatus ? 'Partitura desativada!' : 'Partitura ativada!'
      );
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedScores.size === 0) {
      toast.error('Selecione pelo menos uma partitura');
      return;
    }

    if (
      !confirm(`Aplicar ação "${action}" a ${selectedScores.size} partituras?`)
    ) {
      return;
    }

    // Implementar ações em lote
    for (const scoreId of selectedScores) {
      if (action === 'activate') {
        await updateScore(scoreId, { isActive: true });
      } else if (action === 'deactivate') {
        await updateScore(scoreId, { isActive: false });
      }
    }

    setSelectedScores(new Set());
    toast.success(`Ação aplicada a ${selectedScores.size} partituras`);
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'IMSLP':
        return 'text-aviso bg-aviso/10';
      case 'CUSTOM':
        return 'text-ok bg-ok/10';
      case 'UPLOAD':
        return 'text-ouro-texto bg-ouro/10';
      case 'MANUAL':
        return 'text-atencao bg-atencao/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'midi':
        return '🎵';
      case 'xml':
        return '📋';
      case 'ly':
        return '🎼';
      case 'mscz':
        return '🎹';
      default:
        return '📄';
    }
  };

  const formatFileSize = (size?: string) => {
    if (!size) return 'N/A';
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-ok';
    if (score >= 6) return 'text-atencao';
    if (score >= 4) return 'text-erro';
    return 'text-theme-tertiary';
  };

  const renderQualityStars = (score?: number) => {
    if (!score) return <span className="text-theme-tertiary">N/A</span>;

    const stars = Math.round(score / 2); // Convert 0-10 to 0-5 stars
    return (
      <Inline gap={1}>
        {[...Array(5)].map((_, i) =>
          i < stars ? (
            <PiStarFill
              key={i}
              className={`w-3 h-3 ${
                i < stars ? 'text-atencao fill-current' : 'text-theme-tertiary'
              }`}
            />
          ) : (
            <PiStar
              key={i}
              className={`w-3 h-3 ${
                i < stars ? 'text-atencao fill-current' : 'text-theme-tertiary'
              }`}
            />
          )
        )}
        <span className={`text-xs ml-1 ${getQualityColor(score)}`}>
          {score.toFixed(1)}
        </span>
      </Inline>
    );
  };

  // 🆕 Log das estatísticas para debug
  useEffect(() => {
    if (stats) {
      console.log('📊 [DEBUG] Estatísticas recebidas:', {
        total: stats.total,
        active: stats.active,
        bySource: stats.bySource,
        byType: stats.byType,
        totalSize: stats.totalSize,
        averagePerWork: stats.averagePerWork,
        mostAccessed: stats.mostAccessed?.length,
        recentlyAdded: stats.recentlyAdded,
      });
    }
  }, [stats]);

  if (loading && !scores.length) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="partituras" />
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
              <div className="w-16 h-16 bg-atencao rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiFileText className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Gerenciar Partituras
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Administre o catálogo de partituras da plataforma
            </p>
            {/* 🆕 Botão de Debug */}
            <Inline gap={2} className="mt-4 justify-center">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<PiWarningCircle />}
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? 'Ocultar' : 'Debug'}
              </Button>
            </Inline>
          </div>
        </AnimatedItem>

        {/* 🆕 Painel de Debug */}
        {showDebug && stats && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mb-8 border-2 border-atencao/30">
              <Inline
                as="h3"
                gap={2}
                className="text-lg font-bold text-atencao mb-4"
              >
                <PiWarningCircle className="w-5 h-5" />
                <span>Debug das Estatísticas</span>
              </Inline>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Stack gap={2}>
                  <h4 className="font-semibold text-theme-primary">
                    Dados Brutos:
                  </h4>
                  <pre className="bg-theme-secondary p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(
                      {
                        total: stats.total,
                        active: stats.active,
                        totalSize: stats.totalSize,
                        averagePerWork: stats.averagePerWork,
                        bySourceLength: stats.bySource?.length || 0,
                        byTypeLength: stats.byType?.length || 0,
                      },
                      null,
                      2
                    )}
                  </pre>
                </Stack>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-2">
                    Por Fonte:
                  </h4>
                  <pre className="bg-theme-secondary p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(stats.bySource, null, 2)}
                  </pre>
                  <h4 className="font-semibold text-theme-primary mb-2 mt-4">
                    Por Tipo:
                  </h4>
                  <pre className="bg-theme-secondary p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(stats.byType, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<PiArrowsClockwise />}
                  onClick={handleRecalculateStats}
                  disabled={refreshing}
                >
                  Forçar Recálculo
                </Button>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Stats Overview */}
        {stats && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total de Partituras"
                value={formatNumber(stats.total)}
                change={{ value: stats.recentlyAdded, isPositive: true }}
                icon={PiFileText}
                color="#F59E0B"
                subtitle="Todas as partituras cadastradas"
              />

              <MetricCard
                title="Ativas"
                value={formatNumber(stats.active)}
                change={{
                  value:
                    stats.total > 0 ? (stats.active / stats.total) * 100 : 0,
                  isPositive: true,
                }}
                icon={PiCheckCircle}
                color="#10B981"
                subtitle={`${
                  stats.total > 0
                    ? Math.round((stats.active / stats.total) * 100)
                    : 0
                }% do total`}
              />

              <MetricCard
                title="Tamanho Total"
                value={stats.totalSize}
                change={{ value: 8.3, isPositive: true }}
                icon={PiHardDrive}
                color="#8B5CF6"
                subtitle="Baseado em arquivos reais"
              />

              <MetricCard
                title="Por Obra"
                value={stats.averagePerWork.toFixed(1)}
                change={{ value: 12.4, isPositive: true }}
                icon={PiTrendUp}
                color="#3B82F6"
                subtitle="Média de partituras por obra"
              />
            </div>
          </AnimatedItem>
        )}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AnimatedCard className="classical-card p-6">
              {/* 🔧 VALIDAÇÃO DE DADOS ANTES DE RENDERIZAR */}
              {stats.bySource && stats.bySource.length > 0 ? (
                <AdminPieChart
                  data={stats.bySource.map((item) => ({
                    name: item.source || 'Desconhecida',
                    value: item.count || 0,
                  }))}
                  title="Partituras por Fonte"
                  subtitle={`${stats.bySource.length} fontes diferentes`}
                  height={300}
                  innerRadius={60}
                />
              ) : (
                <div className="text-center p-8 text-theme-tertiary">
                  <PiWarningCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Nenhum dado de fonte disponível</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRecalculateStats}
                    className="mt-2"
                  >
                    Recalcular
                  </Button>
                </div>
              )}
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              {/* 🔧 VALIDAÇÃO DE DADOS ANTES DE RENDERIZAR */}
              {stats.byType && stats.byType.length > 0 ? (
                <AdminBarChart
                  data={stats.byType.map((item) => ({
                    name: (item.type || 'Desconhecido').toUpperCase(),
                    value: item.count || 0,
                  }))}
                  title="Partituras por Tipo"
                  subtitle={`${stats.byType.length} tipos diferentes`}
                  color="#F59E0B"
                  height={300}
                />
              ) : (
                <div className="text-center p-8 text-theme-tertiary">
                  <PiWarningCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Nenhum dado de tipo disponível</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRecalculateStats}
                    className="mt-2"
                  >
                    Recalcular
                  </Button>
                </div>
              )}
            </AnimatedCard>
          </div>
        )}

        {/* Most Accessed */}
        {stats && stats.mostAccessed && stats.mostAccessed.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6 mb-8">
              <Inline
                as="h3"
                gap={2}
                className="text-xl font-bold text-theme-primary mb-6"
              >
                <PiTarget className="w-5 h-5 text-atencao" />
                <span>Partituras Mais Acessadas</span>
              </Inline>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.mostAccessed.slice(0, 6).map((score, index) => (
                  <Stack
                    gap={3}
                    key={score.id}
                    className="p-4 bg-theme-secondary rounded-xl"
                  >
                    <Inline gap={3}>
                      <Text
                        papel="rotulo"
                        tom="forte"
                        as="div"
                        className="w-8 h-8 bg-atencao rounded-lg flex items-center justify-center font-bold"
                      >
                        {index + 1}
                      </Text>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-theme-primary truncate">
                          {score.title}
                        </p>
                        <Text
                          papel="rotulo"
                          tom="fraco"
                          as="p"
                          className="truncate"
                        >
                          {score.workTitle}
                        </Text>
                      </div>
                    </Inline>
                    <Text
                      papel="legenda"
                      tom="suave"
                      as="div"
                      className="flex items-center justify-between"
                    >
                      <Inline as="span" gap={1}>
                        <PiEye className="w-3 h-3" />
                        <span>{formatNumber(score.accessCount)}</span>
                      </Inline>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiEye />}
                        onClick={() => router.push(`/admin/scores/${score.id}`)}
                      />
                    </Text>
                  </Stack>
                ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Filters and Controls */}
        <AnimatedItem direction="up" springType="gentle" hover="none">
          <AnimatedCard className="classical-card p-6 mb-8" hover="none">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Lista de Partituras
              </h3>
              <Inline gap={3}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<PiFunnel />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtros
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <PiArrowsClockwise
                      className={refreshing ? 'animate-spin' : ''}
                    />
                  }
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  Atualizar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<PiDownloadSimple />}
                >
                  Exportar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PiPlus />}
                  onClick={() => router.push('/admin/scores/create')}
                >
                  Nova Partitura
                </Button>
              </Inline>
            </div>

            {/* Filtros */}
            <div
              className={`space-y-4 mb-6 ${showFilters ? 'block' : 'hidden'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar partituras..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input-classical-2 pl-10 w-full"
                  />
                </div>

                <Select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  options={sources}
                  className="input-classical-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  value={filters.isActive}
                  onChange={(e) =>
                    handleFilterChange('isActive', e.target.value)
                  }
                  options={[
                    { value: 'all', label: 'Todas' },
                    { value: 'true', label: 'Ativas' },
                    { value: 'false', label: 'Inativas' },
                  ]}
                  className="input-classical-2"
                />

                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Data de Criação' },
                    { value: 'title', label: 'Título' },
                    { value: 'accessCount', label: 'Acessos' },
                    { value: 'fileSize', label: 'Tamanho' },
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
              </div>

              <Inline gap={4}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PiMagnifyingGlass />}
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </Inline>
            </div>

            {/* Bulk Actions */}
            {selectedScores.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-atencao/10 border border-atencao rounded-xl mb-6">
                <span className="text-atencao font-medium">
                  {selectedScores.size} partituras selecionadas
                </span>
                <Inline gap={2}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<PiCheckCircle />}
                    onClick={() => handleBulkAction('activate')}
                  >
                    Ativar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<PiXCircle />}
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    Desativar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<PiDownloadSimple />}
                    onClick={() => handleBulkAction('download')}
                  >
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedScores(new Set())}
                  >
                    Limpar Seleção
                  </Button>
                </Inline>
              </div>
            )}

            {/* Lista de Partituras */}
            <Stack>
              {scores.map((score) => (
                <div
                  key={score.id}
                  className="p-4 bg-theme-secondary rounded-xl hover:bg-fundo/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedScores.has(score.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedScores);
                        if (e.target.checked) {
                          newSelected.add(score.id);
                        } else {
                          newSelected.delete(score.id);
                        }
                        setSelectedScores(newSelected);
                      }}
                      className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-ouro focus:ring-2 mt-1"
                    />

                    {score.thumbnailUrl && (
                      <Image
                        width={25}
                        height={25}
                        src={score.thumbnailUrl}
                        alt={score.title}
                        className="w-16 h-20 rounded object-cover flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <Inline gap={3} className="mb-2">
                        <h4 className="font-bold text-theme-primary text-lg">
                          {score.title}
                        </h4>
                        <span className="text-lg">
                          {getTypeIcon(score.type)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getSourceColor(
                            score.source
                          )}`}
                        >
                          {score.source}
                        </span>
                        {score.isActive ? (
                          <PiCheckCircle className="w-5 h-5 text-ok" />
                        ) : (
                          <PiPause className="w-5 h-5 text-erro" />
                        )}
                      </Inline>

                      <div className="text-theme-secondary mb-2">
                        <span className="font-medium">{score.workTitle}</span>
                        <span className="mx-2">•</span>
                        <span>{score.composerName}</span>
                      </div>

                      {score.qualityScore && (
                        <div className="mb-3">
                          {renderQualityStars(score.qualityScore)}
                        </div>
                      )}

                      <Text
                        papel="rotulo"
                        tom="suave"
                        as="div"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        <Inline gap={1}>
                          <PiEye className="w-4 h-4" />
                          <span>{formatNumber(score.accessCount)} acessos</span>
                        </Inline>
                        {score.fileSize && (
                          <Inline gap={1}>
                            <PiHardDrive className="w-4 h-4" />
                            <span>{formatFileSize(score.fileSize)}</span>
                          </Inline>
                        )}
                        {score.pageCount && (
                          <Inline gap={1}>
                            <PiFileText className="w-4 h-4" />
                            <span>{score.pageCount} páginas</span>
                          </Inline>
                        )}
                        <Inline gap={1}>
                          <PiCalendarBlank className="w-4 h-4" />
                          <span>
                            {new Date(score.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </Inline>
                      </Text>

                      {score.uploader && (
                        <Inline
                          gap={1}
                          className="mt-2 text-xs text-theme-tertiary"
                        >
                          <PiUser className="w-3 h-3" />
                          <span>Adicionada por: {score.uploader}</span>
                        </Inline>
                      )}
                    </div>

                    <Inline gap={2} className="flex-shrink-0">
                      {score.downloadUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<PiDownloadSimple />}
                          onClick={() =>
                            window.open(score.downloadUrl, '_blank')
                          }
                          title="Download"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiEye />}
                        onClick={() => router.push(`/admin/scores/${score.id}`)}
                        title="Ver detalhes"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiNotePencil />}
                        onClick={() =>
                          router.push(`/uploads/score/${score.id}/edit`)
                        }
                        title="Editar"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={score.isActive ? <PiPause /> : <PiPlay />}
                        onClick={() =>
                          handleToggleActive(score.id, score.isActive)
                        }
                        className={score.isActive ? 'text-erro' : 'text-ok'}
                        title={score.isActive ? 'Desativar' : 'Ativar'}
                      />
                    </Inline>
                  </div>
                </div>
              ))}
            </Stack>

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-theme-secondary">
                <Text papel="rotulo" tom="suave" as="div">
                  Mostrando {scores.length} de {pagination.total} partituras
                </Text>
                <Inline gap={2}>
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
                  <Text papel="rotulo" tom="forte">
                    Página {pagination.page} de {pagination.pages}
                  </Text>
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
                </Inline>
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
