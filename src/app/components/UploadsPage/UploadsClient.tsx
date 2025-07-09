'use client';

import {
  useState,
  useTransition,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiX,
  FiMusic,
  FiUser,
  FiFile,
  FiDatabase,
  FiUpload,
  FiSettings,
  FiFileText,
} from 'react-icons/fi';
import { MdUpload } from 'react-icons/md';

// Importar componentes de animação
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  LoadingSpinner,
} from '../animation/AnimatedComponents';
import { UserUpload } from '@/app/requests/upload';
import { useNotifications } from '@/app/hooks/useNotifications';
import Button from '../Common/Button';
import Select from '../Common/Select';
import ViewModeToggle, { ViewMode } from '../ViewModeToggle';
import PaginationControls from '../PaginationControls';
import BulkUploadModal from './modals/BulkUploadModal';
import CreateScoreModal from './modals/CreateScoreModal';
import CreateWorkModal from './modals/CreateWorkModal';
import CreateComposerModal from './modals/CreateComposerModal';
import NotificationSystem from '../Notifications/NotificationSystem';

// Importar as novas cardapi/s
import UploadComposerCard from './UploadComposerCard';
import UploadWorkCard from './UploadWorkCard';
import UploadScoreCard from './UploadScoreCard';

interface Epoch {
  id: string;
  name: string;
}

interface UploadsClientProps {
  uploads: UserUpload[];
  composers: any[];
  works: any[];
  scores: any[];
  epochs: Epoch[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  selectedType: string;
  selectedEpoch: string;
  isAdmin: boolean;
  userId: string;
}

type FilterTab = 'all' | 'composers' | 'works' | 'scores';

const UploadsClient = ({
  uploads,

  epochs,
  currentPage,
  totalPages,
  totalCount,
  searchTerm: initialSearchTerm,
  selectedType: initialSelectedType,
  selectedEpoch: initialSelectedEpoch,
  isAdmin,
}: UploadsClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notifications, removeNotification, notifySuccess, notifyError } =
    useNotifications();

  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedType, setSelectedType] = useState<FilterTab>(
    initialSelectedType === 'composer'
      ? 'composers'
      : initialSelectedType === 'work'
      ? 'works'
      : initialSelectedType === 'score'
      ? 'scores'
      : 'all'
  );
  const [selectedEpoch, setSelectedEpoch] = useState(initialSelectedEpoch);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [createModalType, setCreateModalType] = useState<
    'composer' | 'work' | 'score'
  >('composer');

  // Estados para dados dinâmicos
  const [formData, setFormData] = useState<{
    epochs: any[];
    instruments: any[];
    roles: any[];
    composers: any[];
    works: any[];
  }>({
    epochs: epochs,
    instruments: [],
    roles: [],
    composers: [],
    works: [],
  });

  const [loadingFormData, setLoadingFormData] = useState(false);

  // Carregar dados do formulário quando necessário
  useEffect(() => {
    if ((showCreateModal || showBulkModal) && formData.roles.length === 0) {
      loadFormData();
    }
  }, [showCreateModal, showBulkModal]);

  const loadFormData = async () => {
    setLoadingFormData(true);
    try {
      const response = await fetch('/api/uploads/form-data');
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          roles: data.roles || [],
          instruments: data.instruments || [],
          composers: data.composers || [],
          works: data.works || [],
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
      notifyError('Erro', 'Não foi possível carregar os dados do formulário');
    } finally {
      setLoadingFormData(false);
    }
  };

  // Função para atualizar URL
  const updateUrl = useCallback(
    (params: {
      page?: number;
      search?: string;
      type?: string;
      epoch?: string;
    }) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (params.page !== undefined) {
        if (params.page === 1) {
          newParams.delete('page');
        } else {
          newParams.set('page', params.page.toString());
        }
      }

      if (params.search !== undefined) {
        if (params.search === '') {
          newParams.delete('search');
        } else {
          newParams.set('search', params.search);
        }
      }

      if (params.type !== undefined) {
        if (params.type === 'all') {
          newParams.delete('type');
        } else {
          newParams.set('type', params.type);
        }
      }

      if (params.epoch !== undefined) {
        if (params.epoch === '') {
          newParams.delete('epoch');
        } else {
          newParams.set('epoch', params.epoch);
        }
      }

      const newUrl = `${window.location.pathname}${
        newParams.toString() ? '?' + newParams.toString() : ''
      }`;

      startTransition(() => {
        router.push(newUrl);
      });
    },
    [router, searchParams]
  );

  // Separar uploads por tipo
  const uploadsByType = useMemo(() => {
    const composerUploads = uploads.filter(
      (upload) => upload.type === 'composer'
    );
    const workUploads = uploads.filter((upload) => upload.type === 'work');
    const scoreUploads = uploads.filter((upload) => upload.type === 'score');

    return {
      composers: composerUploads,
      works: workUploads,
      scores: scoreUploads,
    };
  }, [uploads]);

  // Filtrar dados baseado na busca
  const filteredData = useMemo(() => {
    let composersFiltered = [...uploadsByType.composers];
    let worksFiltered = [...uploadsByType.works];
    let scoresFiltered = [...uploadsByType.scores];

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();

      composersFiltered = composersFiltered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.composerName?.toLowerCase().includes(query)
      );

      worksFiltered = worksFiltered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.composerName?.toLowerCase().includes(query)
      );

      scoresFiltered = scoresFiltered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.composerName?.toLowerCase().includes(query)
      );
    }

    return {
      composers: composersFiltered,
      works: worksFiltered,
      scores: scoresFiltered,
    };
  }, [uploadsByType, searchTerm]);

  // Handlers para filtros
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      const timeoutId = setTimeout(() => {
        updateUrl({ search: value, page: 1 });
      }, 800);
      return () => clearTimeout(timeoutId);
    },
    [updateUrl]
  );

  const handleTabChange = useCallback(
    (tab: FilterTab) => {
      setSelectedType(tab);
      const typeParam =
        tab === 'composers'
          ? 'composer'
          : tab === 'works'
          ? 'work'
          : tab === 'scores'
          ? 'score'
          : 'all';
      updateUrl({ type: typeParam, page: 1 });
    },
    [updateUrl]
  );

  const handleEpochChange = useCallback(
    (value: string) => {
      setSelectedEpoch(value);
      updateUrl({ epoch: value, page: 1 });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateUrl]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedEpoch('');
    updateUrl({ search: '', type: 'all', epoch: '', page: 1 });
  }, [updateUrl]);

  // Check active filters
  const hasActiveFilters = useMemo(() => {
    return searchTerm || selectedType !== 'all' || selectedEpoch;
  }, [searchTerm, selectedType, selectedEpoch]);

  // Statistics
  const stats = useMemo(() => {
    const composerCount = uploadsByType.composers.length;
    const workCount = uploadsByType.works.length;
    const scoreCount = uploadsByType.scores.length;
    const imslpCount = uploads.filter((item) => item.isIMSLP).length;
    const customCount = uploads.filter((item) => !item.isIMSLP).length;

    return {
      totalCount: composerCount + workCount + scoreCount,
      composerCount,
      workCount,
      scoreCount,
      imslpCount,
      customCount,
    };
  }, [uploadsByType, uploads]);

  // Handlers para ações
  const handleCreateNew = (type: 'composer' | 'work' | 'score') => {
    setCreateModalType(type);
    setShowCreateModal(true);
  };

  const handleEdit = (item: UserUpload) => {
    router.push(`/uploads/${item.type}/${item.id}/edit`);
  };
  const handleDelete = async (item: UserUpload) => {
    setDeletingItemId(item.id);

    try {
      const response = await fetch(`/api/uploads/${item.type}/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();

        // Mostrar mensagem específica baseada no tipo e se houve exclusão em cascata
        if (result.details) {
          // Mensagem para compositor com exclusão em cascata
          if (item.type === 'composer' && result.details.deletedWorks > 0) {
            notifySuccess(
              'Compositor Excluído',
              `${result.details.composerName} foi excluído junto com ${result.details.deletedWorks} obra(s) e ${result.details.deletedScores} partitura(s).`
            );
          }
          // Mensagem para obra com exclusão em cascata
          else if (
            item.type === 'work' &&
            result.details.totalDeletedScores > 0
          ) {
            notifySuccess(
              'Obra Excluída',
              `${result.details.workTitle} foi excluída junto com ${
                result.details.totalDeletedScores
              } partitura(s)${
                result.details.deletedChildWorks > 0
                  ? ` e ${result.details.deletedChildWorks} obra(s) filha(s)`
                  : ''
              }.`
            );
          }
          // Mensagem para partitura simples
          else if (item.type === 'score') {
            notifySuccess(
              'Partitura Excluída',
              `A partitura "${result.details.scoreTitle}" da obra "${result.details.workTitle}" foi excluída com sucesso.`
            );
          }
          // Mensagem padrão se não houver cascata
          else {
            notifySuccess(
              'Sucesso',
              result.message || 'Item excluído com sucesso'
            );
          }
        } else {
          // Fallback para mensagem padrão
          notifySuccess(
            'Sucesso',
            result.message || 'Item excluído com sucesso'
          );
        }

        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir item');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      notifyError(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao excluir item'
      );
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <MdUpload className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {isAdmin ? 'Gerenciar Uploads' : 'Meus Uploads'}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {isAdmin
                ? 'Visualize e gerencie todos os compositores, obras e partituras do sistema'
                : 'Gerencie seus compositores, obras e partituras adicionadas'}
            </p>
          </div>
        </AnimatedItem>

        {/* Quick Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <AnimatedCard className="classical-card p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                  <FiDatabase className="w-5 h-5 text-theme-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.totalCount}
              </div>
              <div className="text-sm text-theme-tertiary">Total</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-theme-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.composerCount}
              </div>
              <div className="text-sm text-theme-tertiary">Compositores</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                  <FiMusic className="w-5 h-5 text-theme-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.workCount}
              </div>
              <div className="text-sm text-theme-tertiary">Obras</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-amber rounded-xl flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-theme-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.scoreCount}
              </div>
              <div className="text-sm text-theme-tertiary">Partituras</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-amber to-accent-red rounded-xl flex items-center justify-center">
                  <FiFile className="w-5 h-5 text-theme-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.imslpCount}
              </div>
              <div className="text-sm text-theme-tertiary">IMSLP</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-red to-brand-primary rounded-xl flex items-center justify-center">
                  <FiUpload className="w-5 h-5 text-theme-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.customCount}
              </div>
              <div className="text-sm text-theme-tertiary">Customizados</div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Create Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<FiPlus />}
                  onClick={() => handleCreateNew('composer')}
                >
                  Novo Compositor
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<FiPlus />}
                  onClick={() => handleCreateNew('work')}
                >
                  Nova Obra
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<FiPlus />}
                  onClick={() => handleCreateNew('score')}
                >
                  Nova Partitura
                </Button>
              </div>

              {/* Right Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar uploads..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="input-classical w-full sm:w-80"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all font-medium ${
                      showFilters
                        ? 'bg-brand-primary text-theme-primary border-brand-primary shadow-md'
                        : hasActiveFilters
                        ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30 shadow-sm'
                        : 'bg-theme-elevated text-theme-primary border-theme-secondary hover:border-brand-primary hover:bg-interactive-hover'
                    }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    <span className="text-sm">
                      Filtros
                      {hasActiveFilters && (
                        <span className="ml-1 px-1.5 py-0.5 bg-accent-blue text-white text-xs rounded-full">
                          {
                            [
                              searchTerm && 'busca',
                              selectedType !== 'all' && 'tipo',
                              selectedEpoch && 'época',
                            ].filter(Boolean).length
                          }
                        </span>
                      )}
                    </span>
                  </button>

                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-theme-secondary rounded-xl p-1 overflow-x-auto mt-4">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === 'all'
                    ? 'bg-brand-primary bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Todos ({stats.totalCount})
              </button>
              <button
                onClick={() => handleTabChange('composers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === 'composers'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Compositores ({stats.composerCount})
              </button>
              <button
                onClick={() => handleTabChange('works')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === 'works'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Obras ({stats.workCount})
              </button>
              <button
                onClick={() => handleTabChange('scores')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === 'scores'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Partituras ({stats.scoreCount})
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <AnimatedItem direction="scale" springType="gentle">
                <div className="bg-theme-secondary rounded-xl p-4 border border-theme-primary mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-theme-primary flex items-center space-x-2">
                      <FiFilter className="w-4 h-4" />
                      <span>Filtros Avançados</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-theme-tertiary hover:text-accent-red transition-colors px-2 py-1 rounded border border-theme-tertiary hover:border-accent-red"
                        >
                          Limpar tudo
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="w-6 h-6 rounded-full bg-theme-primary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Epoch Filter */}
                    <div>
                      <label className="block text-xs font-medium text-theme-tertiary mb-2">
                        Época
                      </label>
                      <Select
                        options={[
                          { value: '', label: 'Todas as épocas' },
                          ...epochs.map((epoch) => ({
                            value: epoch.id,
                            label: epoch.name,
                          })),
                        ]}
                        value={selectedEpoch}
                        onChange={(e) => handleEpochChange(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Filter Status */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-theme-secondary text-sm">
                <span className="font-medium text-theme-primary">
                  {uploads.length}
                </span>{' '}
                de{' '}
                <span className="font-medium text-theme-primary">
                  {totalCount}
                </span>{' '}
                itens
                {searchTerm && (
                  <span className="text-brand-primary">
                    {' '}
                    para &quot;
                    <span className="font-medium">{searchTerm}</span>&quot;
                  </span>
                )}
              </div>

              {isPending && (
                <div className="flex items-center text-brand-primary text-sm">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Carregando...</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiSettings />}
                onClick={() => router.push('/uploads/history')}
              >
                Histórico
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiSettings />}
                  onClick={() => router.push('/uploads/moderation')}
                >
                  Moderação
                </Button>
              )}
            </div>
          </div>
        </AnimatedItem>

        {/* Content */}
        <div className="space-y-8">
          {/* Composers Section */}
          {(selectedType === 'all' || selectedType === 'composers') && (
            <>
              {filteredData.composers.length > 0 ? (
                <AnimatedItem
                  direction="up"
                  className="mt-4"
                  springType="gentle"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-theme-primary classical-title">
                        Compositores
                      </h2>
                      <p className="text-theme-tertiary">
                        {filteredData.composers.length} de{' '}
                        {uploadsByType.composers.length} compositores
                      </p>
                    </div>
                  </div>

                  {viewMode === 'cards' ? (
                    <SequentialGrid cols={3} gap={6} delayBetweenItems={0.1}>
                      {filteredData.composers.map((item) => (
                        <UploadComposerCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item)}
                          isAdmin={isAdmin}
                          viewMode={viewMode}
                          isDeleting={deletingItemId === item.id}
                        />
                      ))}
                    </SequentialGrid>
                  ) : (
                    <div className="space-y-4">
                      {filteredData.composers.map((item, index) => (
                        <AnimatedItem
                          key={item.id}
                          direction="left"
                          hover="lift"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'backwards',
                          }}
                        >
                          <UploadComposerCard
                            item={item}
                            onEdit={() => handleEdit(item)}
                            onDelete={() => handleDelete(item)}
                            isAdmin={isAdmin}
                            viewMode={viewMode}
                          />
                        </AnimatedItem>
                      ))}
                    </div>
                  )}
                </AnimatedItem>
              ) : (
                selectedType === 'composers' && (
                  <AnimatedItem direction="scale" springType="bouncy">
                    <div className="classical-card p-12 text-center">
                      <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiUser className="w-8 h-8 text-theme-tertiary" />
                      </div>
                      <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                        Nenhum compositor encontrado
                      </h3>
                      <p className="text-theme-secondary mb-6">
                        {hasActiveFilters
                          ? 'Tente ajustar seus filtros para encontrar compositores.'
                          : 'Você ainda não adicionou nenhum compositor.'}
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={<FiPlus />}
                        onClick={() => handleCreateNew('composer')}
                      >
                        Novo Compositor
                      </Button>
                    </div>
                  </AnimatedItem>
                )
              )}
            </>
          )}

          {/* Works Section */}
          {(selectedType === 'all' || selectedType === 'works') && (
            <>
              {filteredData.works.length > 0 ? (
                <AnimatedItem
                  direction="up"
                  className="mt-4"
                  springType="gentle"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                      <FiMusic className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-theme-primary classical-title">
                        Obras
                      </h2>
                      <p className="text-theme-tertiary">
                        {filteredData.works.length} de{' '}
                        {uploadsByType.works.length} obras
                      </p>
                    </div>
                  </div>

                  {viewMode === 'cards' ? (
                    <SequentialGrid cols={3} gap={6} delayBetweenItems={0.1}>
                      {filteredData.works.map((item) => (
                        <UploadWorkCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item)}
                          isAdmin={isAdmin}
                          viewMode={viewMode}
                          isDeleting={deletingItemId === item.id}
                        />
                      ))}
                    </SequentialGrid>
                  ) : (
                    <div className="space-y-4">
                      {filteredData.works.map((item, index) => (
                        <AnimatedItem
                          key={item.id}
                          direction="left"
                          hover="lift"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'backwards',
                          }}
                        >
                          <UploadWorkCard
                            item={item}
                            onEdit={() => handleEdit(item)}
                            onDelete={() => handleDelete(item)}
                            isAdmin={isAdmin}
                            viewMode={viewMode}
                            isDeleting={deletingItemId === item.id}
                          />
                        </AnimatedItem>
                      ))}
                    </div>
                  )}
                </AnimatedItem>
              ) : (
                selectedType === 'works' && (
                  <AnimatedItem direction="scale" springType="bouncy">
                    <div className="classical-card p-12 text-center">
                      <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiMusic className="w-8 h-8 text-theme-tertiary" />
                      </div>
                      <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                        Nenhuma obra encontrada
                      </h3>
                      <p className="text-theme-secondary mb-6">
                        {hasActiveFilters
                          ? 'Tente ajustar seus filtros para encontrar obras.'
                          : 'Você ainda não adicionou nenhuma obra.'}
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={<FiPlus />}
                        onClick={() => handleCreateNew('work')}
                      >
                        Nova Obra
                      </Button>
                    </div>
                  </AnimatedItem>
                )
              )}
            </>
          )}

          {/* Scores Section */}
          {(selectedType === 'all' || selectedType === 'scores') && (
            <>
              {filteredData.scores.length > 0 ? (
                <AnimatedItem
                  direction="up"
                  className="mt-4"
                  springType="gentle"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-theme-primary classical-title">
                        Partituras
                      </h2>
                      <p className="text-theme-tertiary">
                        {filteredData.scores.length} de{' '}
                        {uploadsByType.scores.length} partituras
                      </p>
                    </div>
                  </div>

                  {viewMode === 'cards' ? (
                    <SequentialGrid cols={3} gap={6} delayBetweenItems={0.1}>
                      {filteredData.scores.map((item) => (
                        <UploadScoreCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item)}
                          isAdmin={isAdmin}
                          viewMode={viewMode}
                          isDeleting={deletingItemId === item.id}
                        />
                      ))}
                    </SequentialGrid>
                  ) : (
                    <div className="space-y-4">
                      {filteredData.scores.map((item, index) => (
                        <AnimatedItem
                          key={item.id}
                          direction="left"
                          hover="lift"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'backwards',
                          }}
                        >
                          <UploadScoreCard
                            item={item}
                            onEdit={() => handleEdit(item)}
                            onDelete={() => handleDelete(item)}
                            isAdmin={isAdmin}
                            viewMode={viewMode}
                            isDeleting={deletingItemId === item.id}
                          />
                        </AnimatedItem>
                      ))}
                    </div>
                  )}
                </AnimatedItem>
              ) : (
                selectedType === 'scores' && (
                  <AnimatedItem direction="scale" springType="bouncy">
                    <div className="classical-card p-12 text-center">
                      <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiFileText className="w-8 h-8 text-theme-tertiary" />
                      </div>
                      <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                        Nenhuma partitura encontrada
                      </h3>
                      <p className="text-theme-secondary mb-6">
                        {hasActiveFilters
                          ? 'Tente ajustar seus filtros para encontrar partituras.'
                          : 'Você ainda não adicionou nenhuma partitura.'}
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={<FiPlus />}
                        onClick={() => handleCreateNew('score')}
                      >
                        Nova Partitura
                      </Button>
                    </div>
                  </AnimatedItem>
                )
              )}
            </>
          )}

          {/* Estado vazio quando há uploads mas nenhum passa nos filtros da aba "Todos" */}
          {selectedType === 'all' &&
            filteredData.composers.length === 0 &&
            filteredData.works.length === 0 &&
            filteredData.scores.length === 0 &&
            (uploadsByType.composers.length > 0 ||
              uploadsByType.works.length > 0 ||
              uploadsByType.scores.length > 0) && (
              <AnimatedItem
                direction="scale"
                className="mt-4"
                springType="bouncy"
              >
                <div className="classical-card p-12 text-center">
                  <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch className="w-8 h-8 text-theme-tertiary" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-theme-secondary mb-6">
                    Tente ajustar seus filtros para encontrar uploads.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-classical-primary"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </AnimatedItem>
            )}

          {/* Estado completamente vazio */}
          {stats.totalCount === 0 && (
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="classical-card p-12 text-center">
                <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiUpload className="w-8 h-8 text-theme-tertiary" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                  Nenhum upload encontrado
                </h3>
                <p className="text-theme-secondary mb-6">
                  Você ainda não fez nenhum upload. Comece adicionando
                  compositores, obras ou partituras.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="primary"
                    leftIcon={<FiPlus />}
                    onClick={() => handleCreateNew('composer')}
                  >
                    Novo Compositor
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<FiPlus />}
                    onClick={() => handleCreateNew('work')}
                  >
                    Nova Obra
                  </Button>
                </div>
              </div>
            </AnimatedItem>
          )}

          {/* Loading Overlay */}
          {isPending && (
            <AnimatedItem
              direction="scale"
              className="absolute inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
            >
              <div className="classical-card p-8 text-center">
                <LoadingSpinner size="lg" />
                <p className="text-theme-primary font-medium mt-4">
                  Carregando uploads...
                </p>
              </div>
            </AnimatedItem>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" className="mt-8">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isPending={isPending}
            />
          </AnimatedItem>
        )}
      </AnimatedContainer>

      {/* Modais */}
      {showCreateModal && (
        <>
          <CreateComposerModal
            isOpen={createModalType === 'composer'}
            onClose={() => setShowCreateModal(false)}
            epochs={formData.epochs}
            roles={formData.roles}
          />

          <CreateWorkModal
            isOpen={createModalType === 'work'}
            onClose={() => setShowCreateModal(false)}
            composers={formData.composers}
            instruments={formData.instruments}
            epochs={formData.epochs}
          />

          <CreateScoreModal
            isOpen={createModalType === 'score'}
            onClose={() => setShowCreateModal(false)}
            works={formData.works}
          />
        </>
      )}

      {showBulkModal && (
        <BulkUploadModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          type={'score'}
        />
      )}

      {/* Loading Modal Overlay */}
      {loadingFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-overlay backdrop-blur-sm">
          <div className="classical-card p-8 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-4">
              Carregando dados do formulário...
            </p>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </PageContainer>
  );
};

export default UploadsClient;
