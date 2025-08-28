// UploadsClient.tsx - TRADUZIDO
'use client';

import { useState, useTransition, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiX,
  FiMusic,
  FiUser,
  FiUpload,
  FiSettings,
  FiFileText,
  FiArrowRight,
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
} from '../../components/animation/AnimatedComponents';
import { UserUpload } from '@/app/requests/upload';
import Button from '../../components/Common/Button';
import Select from '../../components/Common/Select';
import ViewModeToggle, { ViewMode } from '../../components/ViewModeToggle';
import PaginationControls from '../../components/PaginationControls';
import CreateScoreModal from '../../components/UploadsPage/modals/CreateScoreModal';
import CreateWorkModal from '../../components/UploadsPage/modals/CreateWorkModal';
import CreateComposerModal from '../../components/UploadsPage/modals/CreateComposerModal';
import BulkInsertWorksModal from '../../components/UploadsPage/modals/BulkInsertWorksModal';

import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/hooks/useTranslation';

import UploadComposerCard from '../../components/UploadsPage/UploadComposerCard';
import UploadWorkCard from '../../components/UploadsPage/UploadWorkCard';
import UploadScoreCard from '../../components/UploadsPage/UploadScoreCard';

interface Epoch {
  id: string;
  name: string;
}

interface FilterComposer {
  id: string;
  name: string;
  fullName: string;
}

interface FilterWork {
  id: string;
  title: string;
  composerName: string;
}

// 🆕 INTERFACES PARA FORM-DATA
interface FormDataInstrument {
  id: string;
  name: string;
  category?: string | null;
}

interface FormDataRole {
  id: string;
  name: string;
}

interface FormDataComposer {
  id: string;
  name: string;
  fullName: string;
  worksCount: number | null;
}

interface FormDataWork {
  id: string;
  title: string;
  composer: { id?: string; name: string; fullName: string };
}
interface FormDataProps {
  epochs: Epoch[];
  instruments: FormDataInstrument[];
  roles: FormDataRole[];
  composers: FormDataComposer[];
  works: FormDataWork[];
}
interface UploadsClientProps {
  uploads: UserUpload[];
  composers: any[];
  works: any[];
  scores: any[];
  epochs: Epoch[];
  filterComposers: FilterComposer[];
  filterWorks: FilterWork[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  composerCount: number;
  workCount: number;
  scoreCount: number;
  hasMoreComposers: boolean;
  hasMoreWorks: boolean;
  hasMoreScores: boolean;
  searchTerm: string;
  selectedType: string;
  selectedEpoch: string;
  selectedComposer: string;
  selectedWork: string;
  isAdmin: boolean;
  userId: string;
  // 🆕 PROPS PARA FORM-DATA
  formData: FormDataProps;
}

type FilterTab = 'all' | 'composers' | 'works' | 'scores';

const UploadsClient = ({
  uploads,
  epochs,
  filterComposers,
  filterWorks,
  currentPage,
  totalPages,
  totalCount,
  composerCount,
  workCount,
  scoreCount,
  hasMoreComposers,
  hasMoreWorks,
  hasMoreScores,
  searchTerm: initialSearchTerm,
  selectedType: initialSelectedType,
  selectedEpoch: initialSelectedEpoch,
  selectedComposer: initialSelectedComposer,
  selectedWork: initialSelectedWork,
  isAdmin,
  formData,
}: UploadsClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation({ sections: ['pages/uploads'] });

  // Estados e hooks permanecem iguais
  const toast = useToast();

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
  const [selectedComposer, setSelectedComposer] = useState(
    initialSelectedComposer
  );
  const [selectedWork, setSelectedWork] = useState(initialSelectedWork);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [createModalType, setCreateModalType] = useState<
    'composer' | 'work' | 'score'
  >('composer');

  const [showBulkInsertModal, setShowBulkInsertModal] = useState(false);
  const [bulkInsertComposer, setBulkInsertComposer] = useState<any>(null);

  const [availableEpochs, setAvailableEpochs] = useState(epochs);
  const [loadingEpochs, setLoadingEpochs] = useState(false);

  const memoizedLocalComposers = useMemo(() => {
    return filterComposers;
  }, [filterComposers]);

  // Carregar dados do formulário quando necessário
  // useEffect(() => {
  //   if (
  //     (showCreateModal || showBulkInsertModal) &&
  //     formData.roles.length === 0
  //   ) {
  //     loadFormData();
  //   }
  // }, [showCreateModal, showBulkInsertModal]);

  // const loadFormData = async () => {
  //   setLoadingFormData(true);
  //   try {
  //     const response = await fetch('/api/uploads/form-data');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setFormData((prev) => ({
  //         ...prev,
  //         roles: data.roles || [],
  //         instruments: data.instruments || [],
  //         composers: data.composers || [],
  //         works: data.works || [],
  //       }));
  //     }
  //   } catch (error) {
  //     console.error('Erro ao carregar dados do formulário:', error);
  //     toast.error('Erro', 'Não foi possível carregar os dados do formulário');
  //   } finally {
  //     setLoadingFormData(false);
  //   }
  // };

  const loadAvailableEpochs = async (type: string) => {
    setLoadingEpochs(true);
    try {
      const typeParam =
        type === 'composers'
          ? 'composer'
          : type === 'works'
          ? 'work'
          : type === 'scores'
          ? 'score'
          : 'all';

      const response = await fetch(
        `/api/uploads/available-epochs?type=${typeParam}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableEpochs(data.epochs || []);
      }
    } catch (error) {
      console.error('Erro ao carregar épocas disponíveis:', error);
    } finally {
      setLoadingEpochs(false);
    }
  };

  // Função para atualizar URL
  const updateUrl = useCallback(
    (params: {
      page?: number;
      search?: string;
      type?: string;
      epoch?: string;
      composer?: string;
      work?: string;
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

      if (params.composer !== undefined) {
        if (params.composer === '') {
          newParams.delete('composer');
        } else {
          newParams.set('composer', params.composer);
        }
      }

      if (params.work !== undefined) {
        if (params.work === '') {
          newParams.delete('work');
        } else {
          newParams.set('work', params.work);
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

      loadAvailableEpochs(tab);

      updateUrl({
        type: typeParam,
        page: 1,
        composer: '',
        work: '',
        epoch: tab === 'composers' ? selectedEpoch : '',
      });

      if (tab !== 'composers') setSelectedEpoch('');
      setSelectedComposer('');
      setSelectedWork('');
    },
    [updateUrl, selectedEpoch, loadAvailableEpochs]
  );

  const handleEpochChange = useCallback(
    (value: string) => {
      setSelectedEpoch(value);
      updateUrl({ epoch: value, page: 1 });
    },
    [updateUrl]
  );

  const handleComposerChange = useCallback(
    (value: string) => {
      setSelectedComposer(value);
      updateUrl({ composer: value, page: 1 });
    },
    [updateUrl]
  );

  const handleWorkChange = useCallback(
    (value: string) => {
      setSelectedWork(value);
      updateUrl({ work: value, page: 1 });
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
    setSelectedComposer('');
    setSelectedWork('');
    updateUrl({
      search: '',
      type: 'all',
      epoch: '',
      composer: '',
      work: '',
      page: 1,
    });
  }, [updateUrl]);

  // Check active filters
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm ||
      selectedType !== 'all' ||
      selectedEpoch ||
      selectedComposer ||
      selectedWork
    );
  }, [searchTerm, selectedType, selectedEpoch, selectedComposer, selectedWork]);

  // Statistics
  const stats = useMemo(() => {
    const imslpCount = uploads.filter((item) => item.isIMSLP).length;
    const customCount = uploads.filter((item) => !item.isIMSLP).length;

    return {
      totalCount: totalCount,
      composerCount,
      workCount,
      scoreCount,
      imslpCount,
      customCount,
    };
  }, [uploads, totalCount, composerCount, workCount, scoreCount]);

  // Handlers para ações
  const handleCreateNew = (type: 'composer' | 'work' | 'score') => {
    setCreateModalType(type);
    setShowCreateModal(true);
  };

  const handleEdit = (item: UserUpload) => {
    router.push(`/uploads/${item.type}/${item.id}/edit`);
  };

  const handleSeeMore = (type: 'composers' | 'works' | 'scores') => {
    handleTabChange(type);
  };

  const handleBulkInsertWorks = (composer: UserUpload) => {
    setBulkInsertComposer(composer);
    setShowBulkInsertModal(true);
  };

  const handleDelete = async (item: UserUpload) => {
    await performDelete(item);
  };

  const performDelete = async (item: UserUpload) => {
    setDeletingItemId(item.id);

    try {
      const response = await fetch(`/api/uploads/${item.type}/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();

        if (result.details) {
          if (item.type === 'composer' && result.details.deletedWorks > 0) {
            toast.success(
              'Compositor Excluído',
              `${result.details.composerName} foi excluído junto com ${result.details.deletedWorks} obra(s) e ${result.details.deletedScores} partitura(s).`
            );
          } else if (
            item.type === 'work' &&
            result.details.totalDeletedScores > 0
          ) {
            toast.success(
              'Obra Excluída',
              `${result.details.workTitle} foi excluída junto com ${
                result.details.totalDeletedScores
              } partitura(s)${
                result.details.deletedChildWorks > 0
                  ? ` e ${result.details.deletedChildWorks} obra(s) filha(s)`
                  : ''
              }.`
            );
          } else if (item.type === 'score') {
            toast.success(
              'Partitura Excluída',
              `A partitura "${result.details.scoreTitle}" da obra "${result.details.workTitle}" foi excluída com sucesso.`
            );
          } else {
            toast.success(
              'Sucesso',
              result.message || 'Item excluído com sucesso'
            );
          }
        } else {
          toast.success(
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
      toast.error(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao excluir item'
      );
    } finally {
      setDeletingItemId(null);
    }
  };

  // Função para renderizar filtros específicos por aba
  const renderTabSpecificFilters = () => {
    if (selectedType === 'composers') {
      return (
        <div>
          <label className="block text-xs font-medium text-theme-tertiary mb-2">
            {t('filter_epoch')}{' '}
            {loadingEpochs && (
              <span className="text-xs">{t('filter_loading_epochs')}</span>
            )}
          </label>
          <Select
            options={[
              { value: '', label: t('filter_all_epochs') },
              ...availableEpochs.map((epoch) => ({
                value: epoch.id,
                label: epoch.name,
              })),
            ]}
            value={selectedEpoch}
            onChange={(e) => handleEpochChange(e.target.value)}
            className="input-classical-2 w-full"
            disabled={loadingEpochs}
          />
        </div>
      );
    }

    if (selectedType === 'works') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-theme-tertiary mb-2">
              {t('filter_composer')}
            </label>
            <Select
              options={[
                { value: '', label: t('filter_all_composers') },
                ...memoizedLocalComposers.map((composer) => ({
                  value: composer.id,
                  label: composer.fullName,
                })),
              ]}
              value={selectedComposer}
              onChange={(e) => handleComposerChange(e.target.value)}
              className="input-classical-2 w-full"
              disabled={loadingEpochs}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-tertiary mb-2">
              {t('filter_epoch')}{' '}
              {loadingEpochs && (
                <span className="text-xs">{t('filter_loading_epochs')}</span>
              )}
            </label>
            <Select
              options={[
                { value: '', label: t('filter_all_epochs') },
                ...availableEpochs.map((epoch) => ({
                  value: epoch.id,
                  label: epoch.name,
                })),
              ]}
              value={selectedEpoch}
              onChange={(e) => handleEpochChange(e.target.value)}
              className="input-classical-2 w-full"
              disabled={loadingEpochs}
            />
          </div>
        </div>
      );
    }

    if (selectedType === 'scores') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-theme-tertiary mb-2">
              {t('filter_work')}
            </label>
            <Select
              options={[
                { value: '', label: t('filter_all_works') },
                ...filterWorks.map((work) => ({
                  value: work.id,
                  label: `${work.title} - ${work.composerName}`,
                })),
              ]}
              value={selectedWork}
              onChange={(e) => handleWorkChange(e.target.value)}
              className="input-classical-2 w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-tertiary mb-2">
              {t('filter_epoch')}{' '}
              {loadingEpochs && (
                <span className="text-xs">{t('filter_loading_epochs')}</span>
              )}
            </label>
            <Select
              options={[
                { value: '', label: t('filter_all_epochs') },
                ...availableEpochs.map((epoch) => ({
                  value: epoch.id,
                  label: epoch.name,
                })),
              ]}
              value={selectedEpoch}
              onChange={(e) => handleEpochChange(e.target.value)}
              className="input-classical-2 w-full"
              disabled={loadingEpochs}
            />
          </div>
        </div>
      );
    }

    // Para "all", mostrar filtros gerais
    return (
      <div>
        <label className="block text-xs font-medium text-theme-tertiary mb-2">
          {t('filter_epoch')}{' '}
          {loadingEpochs && (
            <span className="text-xs">{t('filter_loading_epochs')}</span>
          )}
        </label>
        <Select
          options={[
            { value: '', label: t('filter_all_epochs') },
            ...availableEpochs.map((epoch) => ({
              value: epoch.id,
              label: epoch.name,
            })),
          ]}
          value={selectedEpoch}
          onChange={(e) => handleEpochChange(e.target.value)}
          className="input-classical-2 w-full"
          disabled={loadingEpochs}
        />
      </div>
    );
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
              {t('page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('page_subtitle')}
            </p>
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
                  {t('actions_new_composer')}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<FiPlus />}
                  onClick={() => handleCreateNew('work')}
                >
                  {t('actions_new_work')}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<FiPlus />}
                  onClick={() => handleCreateNew('score')}
                >
                  {t('actions_new_score')}
                </Button>
              </div>

              {/* Right Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="input-classical w-full sm:w-80"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg  transition-all font-medium ${
                      showFilters
                        ? 'bg-brand-primary text-theme-primary border-theme-primary border-2 border-brand-primary shadow-md'
                        : hasActiveFilters
                        ? 'text-accent-blue border-accent-blue/30 shadow-sm'
                        : 'bg-theme-elevated text-theme-primary border-theme-secondary hover:border-brand-primary hover:bg-interactive-hover'
                    }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    <span className="text-sm">
                      {t('filters_button')}
                      {hasActiveFilters && (
                        <span className="ml-1 px-1.5 py-0.5 bg-accent-blue text-white text-xs rounded-full">
                          {
                            [
                              searchTerm && 'busca',
                              selectedType !== 'all' && 'tipo',
                              selectedEpoch && 'época',
                              selectedComposer && 'compositor',
                              selectedWork && 'obra',
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
                {t('tabs_all')} ({stats.totalCount})
              </button>
              <button
                onClick={() => handleTabChange('composers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === 'composers'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                {t('tabs_composers')} ({stats.composerCount})
              </button>
              <button
                onClick={() => handleTabChange('works')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === 'works'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                {t('tabs_works')} ({stats.workCount})
              </button>
              <button
                onClick={() => handleTabChange('scores')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === 'scores'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                {t('tabs_scores')} ({stats.scoreCount})
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <AnimatedItem direction="scale" springType="gentle">
                <div className="bg-theme-secondary rounded-xl p-4 border border-theme-primary mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-theme-primary flex items-center space-x-2">
                      <FiFilter className="w-4 h-4" />
                      <span>
                        {selectedType === 'all'
                          ? t('filters_general')
                          : selectedType === 'composers'
                          ? t('filters_composers')
                          : selectedType === 'works'
                          ? t('filters_works')
                          : t('filters_scores')}
                      </span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-theme-tertiary hover:text-accent-red transition-colors px-2 py-1 rounded border border-theme-tertiary hover:border-accent-red"
                        >
                          {t('filters_clear_all')}
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

                  {renderTabSpecificFilters()}
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
                {selectedType === 'all'
                  ? t('results_items')
                  : selectedType === 'composers'
                  ? t('results_composers')
                  : selectedType === 'works'
                  ? t('results_works')
                  : t('results_scores')}
                {searchTerm && (
                  <span className="text-brand-primary">
                    {' '}
                    {t('results_search_for')} &quot;
                    <span className="font-medium">{searchTerm}</span>&quot;
                  </span>
                )}
              </div>

              {isPending && (
                <div className="flex items-center text-brand-primary text-sm">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">{t('results_loading')}</span>
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
                {t('action_history')}
              </Button>
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-theme-primary classical-title">
                          {t('tabs_composers')}
                        </h2>
                        <p className="text-theme-tertiary">
                          {selectedType === 'all'
                            ? `${Math.min(
                                filteredData.composers.length,
                                16
                              )} ${t('results_of')} ${stats.composerCount} ${t(
                                'results_composers'
                              )}`
                            : `${filteredData.composers.length} ${t(
                                'results_of'
                              )} ${stats.composerCount} ${t(
                                'results_composers'
                              )}`}
                        </p>
                      </div>
                    </div>

                    {selectedType === 'all' && hasMoreComposers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<FiArrowRight />}
                        onClick={() => handleSeeMore('composers')}
                      >
                        {t('action_see_more_composers')}
                      </Button>
                    )}
                  </div>

                  {viewMode === 'cards' ? (
                    <SequentialGrid cols={3} gap={6} delayBetweenItems={0.1}>
                      {(selectedType === 'all'
                        ? filteredData.composers.slice(0, 16)
                        : filteredData.composers
                      ).map((item) => (
                        <UploadComposerCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item)}
                          onBulkInsertWorks={() => handleBulkInsertWorks(item)}
                          isAdmin={isAdmin}
                          viewMode={viewMode}
                          isDeleting={deletingItemId === item.id}
                        />
                      ))}
                    </SequentialGrid>
                  ) : (
                    <div className="space-y-4">
                      {(selectedType === 'all'
                        ? filteredData.composers.slice(0, 16)
                        : filteredData.composers
                      ).map((item, index) => (
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
                            onBulkInsertWorks={() =>
                              handleBulkInsertWorks(item)
                            }
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
                        {t('empty_composers_title')}
                      </h3>
                      <p className="text-theme-secondary mb-6">
                        {hasActiveFilters
                          ? t('empty_composers_subtitle_filter')
                          : t('empty_composers_subtitle_none')}
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={<FiPlus />}
                        onClick={() => handleCreateNew('composer')}
                      >
                        {t('actions_new_composer')}
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <FiMusic className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-theme-primary classical-title">
                          {t('tabs_works')}
                        </h2>
                        <p className="text-theme-tertiary">
                          {selectedType === 'all'
                            ? `${Math.min(filteredData.works.length, 16)} ${t(
                                'results_of'
                              )} ${stats.workCount} ${t('results_works')}`
                            : `${filteredData.works.length} ${t(
                                'results_of'
                              )} ${stats.workCount} ${t('results_works')}`}
                        </p>
                      </div>
                    </div>

                    {selectedType === 'all' && hasMoreWorks && (
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<FiArrowRight />}
                        onClick={() => handleSeeMore('works')}
                      >
                        {t('action_see_more_works')}
                      </Button>
                    )}
                  </div>

                  {viewMode === 'cards' ? (
                    <SequentialGrid cols={3} gap={6} delayBetweenItems={0.1}>
                      {(selectedType === 'all'
                        ? filteredData.works.slice(0, 16)
                        : filteredData.works
                      ).map((item) => (
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
                      {(selectedType === 'all'
                        ? filteredData.works.slice(0, 16)
                        : filteredData.works
                      ).map((item, index) => (
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
                        {t('empty_works_title')}
                      </h3>
                      <p className="text-theme-secondary mb-6">
                        {hasActiveFilters
                          ? t('empty_works_subtitle_filter')
                          : t('empty_works_subtitle_none')}
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={<FiPlus />}
                        onClick={() => handleCreateNew('work')}
                      >
                        {t('actions_new_work')}
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-theme-primary classical-title">
                          {t('tabs_scores')}
                        </h2>
                        <p className="text-theme-tertiary">
                          {selectedType === 'all'
                            ? `${Math.min(filteredData.scores.length, 16)} ${t(
                                'results_of'
                              )} ${stats.scoreCount} ${t('results_scores')}`
                            : `${filteredData.scores.length} ${t(
                                'results_of'
                              )} ${stats.scoreCount} ${t('results_scores')}`}
                        </p>
                      </div>
                    </div>

                    {selectedType === 'all' && hasMoreScores && (
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<FiArrowRight />}
                        onClick={() => handleSeeMore('scores')}
                      >
                        {t('action_see_more_scores')}
                      </Button>
                    )}
                  </div>

                  {viewMode === 'cards' ? (
                    <SequentialGrid cols={3} gap={6} delayBetweenItems={0.1}>
                      {(selectedType === 'all'
                        ? filteredData.scores.slice(0, 16)
                        : filteredData.scores
                      ).map((item) => (
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
                      {(selectedType === 'all'
                        ? filteredData.scores.slice(0, 16)
                        : filteredData.scores
                      ).map((item, index) => (
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
                        {t('empty_scores_title')}
                      </h3>
                      <p className="text-theme-secondary mb-6">
                        {hasActiveFilters
                          ? t('empty_scores_subtitle_filter')
                          : t('empty_scores_subtitle_none')}
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={<FiPlus />}
                        onClick={() => handleCreateNew('score')}
                      >
                        {t('actions_new_score')}
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
                    {t('empty_no_results_title')}
                  </h3>
                  <p className="text-theme-secondary mb-6">
                    {t('empty_no_results_subtitle')}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-classical-primary"
                  >
                    {t('filters_clear_all')}
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
                  {t('empty_no_uploads_title')}
                </h3>
                <p className="text-theme-secondary mb-6">
                  {t('empty_no_uploads_subtitle')}
                </p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="primary"
                    leftIcon={<FiPlus />}
                    onClick={() => handleCreateNew('composer')}
                  >
                    {t('actions_new_composer')}
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<FiPlus />}
                    onClick={() => handleCreateNew('work')}
                  >
                    {t('actions_new_work')}
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
                  {t('loading_uploads')}
                </p>
              </div>
            </AnimatedItem>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && selectedType !== 'all' && (
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

      {/* Modal de Bulk Insert de Obras */}
      {showBulkInsertModal && bulkInsertComposer && (
        <BulkInsertWorksModal
          isOpen={showBulkInsertModal}
          onClose={() => {
            setShowBulkInsertModal(false);
            setBulkInsertComposer(null);
          }}
          composer={{
            id: bulkInsertComposer.id,
            name: bulkInsertComposer.composerName || bulkInsertComposer.title,
            fullName:
              bulkInsertComposer.composerName || bulkInsertComposer.title,
            imslpId: bulkInsertComposer.imslpId,
            permLinkImslp:
              bulkInsertComposer.imslpPermlink ||
              bulkInsertComposer.permLinkImslp,
          }}
          instruments={formData.instruments}
          epochs={formData.epochs}
        />
      )}
    </PageContainer>
  );
};

export default UploadsClient;
