// app/works/pageClient.tsx - Com Performance Otimizada e Traduções
'use client';

import {
  useState,
  useCallback,
  useTransition,
  useEffect,
  useMemo,
  memo,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { WorksListResponse, FilterOptions } from '@/app/requests/work-details';
import {
  FiSearch,
  FiFilter,
  FiMusic,
  FiX,
  FiRefreshCw,
  FiBookOpen,
  FiClock,
} from 'react-icons/fi';
import WorkCard from '../../components/WorksClient/WorkCard';
import WorkCardList from '../../components/WorksClient/WorkCardList';
import PaginationControls from '../../components/PaginationControls';
import AnimatedMusicalNotes2 from '../../components/AnimatedMusicalNotes2';
import GenreSearchInput from '../../components/GenreSearchInput';
import ComposerSearchInput from '../../components/ComposerSearchInput';
import ViewModeToggle from '../../components/ViewModeToggle';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
} from '../../components/animation/AnimatedComponents';
import { useComposerName } from '@/app/hooks/useComposerName';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import Select from '../../components/Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';

interface WorksClientProps {
  worksData: WorksListResponse;
  currentPage: number;
  searchParams: {
    page?: string;
    composer?: string;
    genre?: string;
    instrument?: string;
    epoch?: string;
    search?: string;
    workGenresArr?: string;
  };
  filterOptions: FilterOptions;
}

// Hook para busca otimizada com debounce correto
function useOptimizedSearch(
  callback: (value: string) => void,
  delay: number = 800
) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const debouncedCallback = useCallback(
    (value: string) => {
      // Limpar timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Criar novo timeout
      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Componente de Loading Skeleton otimizado
const WorksSkeleton = memo(() => (
  <SequentialGrid cols={4} gap={6} delayBetweenItems={0.05} className="">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="classical-card p-6 animate-pulse">
        <div className="h-4 bg-theme-secondary/20 rounded mb-3"></div>
        <div className="h-3 bg-theme-secondary/20 rounded mb-2"></div>
        <div className="h-3 bg-theme-secondary/20 rounded w-2/3"></div>
      </div>
    ))}
  </SequentialGrid>
));

WorksSkeleton.displayName = 'WorksSkeleton';

// Componente de Estatísticas memoizado
const ResultsInfo = memo(
  ({
    startItem,
    endItem,
    totalCount,
    isPending,
    t,
  }: {
    startItem: number;
    endItem: number;
    totalCount: number;
    isPending: boolean;
    t: (key: string) => string;
  }) => (
    <div className="flex items-center justify-between text-sm">
      <div className="text-theme-secondary">
        {t('client_jsx_span_showing_results')}{' '}
        <span className="font-medium text-theme-primary">
          {startItem}-{endItem}
        </span>{' '}
        {t('client_jsx_span_of_results')}{' '}
        <span className="font-medium text-theme-primary">
          {totalCount.toLocaleString()}
        </span>{' '}
        {t('client_jsx_span_works_count')}
      </div>

      {isPending && (
        <div className="flex items-center text-brand-primary">
          <FiRefreshCw className="w-4 h-4 mr-1 animate-spin" />
          {t('client_jsx_span_loading')}
        </div>
      )}
    </div>
  )
);

ResultsInfo.displayName = 'ResultsInfo';

// Componente de Filtros Ativos memoizado
const ActiveFilters = memo(
  ({
    searchParams,
    filterOptions,
    onRemoveFilter,
    onClearAll,
    t,
  }: {
    searchParams: any;
    filterOptions: any;
    onRemoveFilter: (key: string) => void;
    onClearAll: () => void;
    t: (key: string) => string;
  }) => {
    const hasActiveFilters = useMemo(
      () =>
        searchParams.search ||
        searchParams.composer ||
        searchParams.instrument ||
        searchParams.epoch ||
        searchParams.workGenresArr,
      [searchParams]
    );

    // Usar o hook para buscar nome do compositor
    const composerName = useComposerName(
      searchParams.composer || '',
      filterOptions.popularComposers || []
    );

    if (!hasActiveFilters) return null;

    return (
      <div className="flex items-center gap-3 mb-4 flex-wrap pt-4 border-t border-theme-secondary">
        <span className="text-sm font-medium text-theme-secondary">
          {t('client_jsx_span_active_filters')}
        </span>

        {searchParams.search && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm">
              <span>
                {t('client_jsx_span_search_filter')} &quot;{searchParams.search}
                &quot;
              </span>
              <button
                onClick={() => onRemoveFilter('search')}
                className="hover:text-brand-secondary transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {searchParams.composer && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm">
              <span>
                {t('client_jsx_span_composer_filter')}{' '}
                {composerName.composerName || 'Carregando...'}
              </span>
              <button
                onClick={() => onRemoveFilter('composer')}
                className="hover:text-accent-purple/80 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {searchParams.instrument && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm">
              <span>
                {t('client_jsx_span_instrument_filter')}{' '}
                {filterOptions.instruments.find(
                  (i: any) =>
                    (i.originalName &&
                      i.originalName === searchParams.instrument) ||
                    i.id === searchParams.instrument
                )?.name || searchParams.instrument}
              </span>
              <button
                onClick={() => onRemoveFilter('instrument')}
                className="hover:text-accent-green/80 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {searchParams.epoch && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm">
              <span>
                {t('client_jsx_span_epoch_filter')}{' '}
                {translateEpochWithHook(
                  filterOptions.epochs.find(
                    (e: any) => e.id === searchParams.epoch
                  )?.originalName ||
                    filterOptions.epochs.find(
                      (e: any) => e.id === searchParams.epoch
                    )?.name ||
                    searchParams.epoch,
                  t
                )}
              </span>
              <button
                onClick={() => onRemoveFilter('epoch')}
                className="hover:text-accent-blue/80 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {searchParams.workGenresArr && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded-full text-sm">
              <span>
                {t('client_jsx_span_genre_filter')}{' '}
                {filterOptions.workGenres.find(
                  (g: any) =>
                    (g.originalName &&
                      g.originalName === searchParams.workGenresArr) ||
                    g.id === searchParams.workGenresArr
                )?.name || searchParams.workGenresArr}
              </span>
              <button
                onClick={() => onRemoveFilter('genre')}
                className="hover:text-accent-orange/80 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          </AnimatedItem>
        )}

        <AnimatedItem hover="scale">
          <button
            onClick={onClearAll}
            className="text-sm text-accent-red hover:text-accent-red/80 underline font-medium"
          >
            {t('client_jsx_button_clear_all_filters')}
          </button>
        </AnimatedItem>
      </div>
    );
  }
);

ActiveFilters.displayName = 'ActiveFilters';

// Componente principal otimizado
const WorksClient = memo(
  ({
    worksData,
    currentPage,
    searchParams,
    filterOptions,
  }: WorksClientProps) => {
    const { t } = useTranslation({ sections: ['pages/works'] });
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Estados locais memoizados
    const [searchTerm, setSearchTerm] = useState(
      () => searchParams.search || ''
    );
    const [showFilters, setShowFilters] = useState(false);
    const [selectedInstrument, setSelectedInstrument] = useState(
      () => searchParams.instrument || ''
    );
    const [selectedEpoch, setSelectedEpoch] = useState(
      () => searchParams.epoch || ''
    );
    const [selectedGenre, setSelectedGenre] = useState(
      () => searchParams.workGenresArr || ''
    );
    const [selectedComposer, setSelectedComposer] = useState(
      () => searchParams.composer || ''
    );
    const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

    const goToWorkPage = (workId: string) => {
      router.push(`works/${workId}`);
    };

    // Memoizar cálculos pesados
    const { totalPages, startItem, endItem, hasActiveFilters } = useMemo(() => {
      const totalPages = Math.ceil(worksData.totalCount / 32);
      const startItem = (currentPage - 1) * 32 + 1;
      const endItem = Math.min(currentPage * 32, worksData.totalCount);
      const hasActiveFilters = !!(
        searchParams.search ||
        searchParams.composer ||
        searchParams.instrument ||
        searchParams.epoch ||
        searchParams.workGenresArr
      );

      return { totalPages, startItem, endItem, hasActiveFilters };
    }, [worksData.totalCount, currentPage, searchParams]);

    // Função para atualizar URL - memoizada
    const updateSearchParams = useCallback(
      (newParams: Record<string, string | undefined>) => {
        const params = new URLSearchParams();

        // Manter parâmetros existentes
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && key !== 'page') {
            params.set(key, value);
          }
        });

        // Aplicar novos parâmetros
        Object.entries(newParams).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          } else {
            params.delete(key);
          }
        });

        // Resetar página quando há filtros
        if (Object.keys(newParams).some((key) => key !== 'page')) {
          params.delete('page');
        }

        const queryString = params.toString();

        startTransition(() => {
          router.push(`/works${queryString ? `?${queryString}` : ''}`);
        });
      },
      [searchParams, router]
    );

    // 🚀 BUSCA OTIMIZADA - Com debounce correto e delay maior
    const performSearch = useCallback(
      (value: string) => {
        updateSearchParams({ search: value || undefined });
      },
      [updateSearchParams]
    );

    const debouncedSearch = useOptimizedSearch(performSearch, 800);

    const handleSearchChange = useCallback(
      (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
      },
      [debouncedSearch]
    );

    // Handlers de filtros memoizados
    const handleComposerFilter = useCallback(
      (composerId: string) => {
        setSelectedComposer(composerId);
        updateSearchParams({ composer: composerId || undefined });
      },
      [updateSearchParams]
    );

    const handleInstrumentFilter = useCallback(
      (instrumentValue: string) => {
        setSelectedInstrument(instrumentValue);
        // Sempre usar o nome original (português) para o filtro
        const instrument = filterOptions.instruments.find(
          (i) =>
            i.name === instrumentValue ||
            (i.originalName && i.originalName === instrumentValue) ||
            i.id === instrumentValue
        );
        const originalName =
          instrument?.originalName || instrument?.name || instrumentValue;
        updateSearchParams({ instrument: originalName || undefined });
      },
      [updateSearchParams, filterOptions.instruments]
    );

    const handleEpochFilter = useCallback(
      (epochId: string) => {
        setSelectedEpoch(epochId);
        updateSearchParams({ epoch: epochId || undefined });
      },
      [updateSearchParams]
    );

    const handleGenreFilter = useCallback(
      (genreValue: string) => {
        setSelectedGenre(genreValue);
        // Sempre usar o nome original (português) para o filtro
        const genre = filterOptions.workGenres.find(
          (g) =>
            g.name === genreValue ||
            (g.originalName && g.originalName === genreValue) ||
            g.id === genreValue
        );
        const originalName = genre?.originalName || genre?.name || genreValue;
        updateSearchParams({ workGenresArr: originalName || undefined });
      },
      [updateSearchParams, filterOptions.workGenres]
    );

    // Função para limpar filtros
    const clearFilters = useCallback(() => {
      setSearchTerm('');
      setSelectedComposer('');
      setSelectedInstrument('');
      setSelectedEpoch('');
      setSelectedGenre('');
      startTransition(() => {
        router.push('/works');
      });
    }, [router]);

    // Função para remover filtro específico
    const removeFilter = useCallback(
      (filterKey: string) => {
        if (filterKey === 'search') {
          setSearchTerm('');
        } else if (filterKey === 'composer') {
          setSelectedComposer('');
        } else if (filterKey === 'instrument') {
          setSelectedInstrument('');
        } else if (filterKey === 'epoch') {
          setSelectedEpoch('');
        } else if (filterKey === 'genre') {
          setSelectedGenre('');
        }

        const key = filterKey === 'genre' ? 'workGenresArr' : filterKey;
        updateSearchParams({ [key]: undefined });
      },
      [updateSearchParams]
    );

    // Função para mudança de página
    const handlePageChange = useCallback(
      (page: number) => {
        updateSearchParams({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      [updateSearchParams]
    );

    // Verificar se existe algum filtro ativo para abrir a caixa de filtro
    useEffect(() => {
      if (hasActiveFilters) {
        setShowFilters(true);
      }
    }, [hasActiveFilters]);

    // Render do grid de obras memoizado
    const worksGrid = useMemo(() => {
      if (worksData.works.length === 0) {
        return (
          <AnimatedItem direction="scale" className="mt-4" springType="bouncy">
            <div className="classical-card p-12 text-center">
              <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMusic className="w-8 h-8 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                {t('client_jsx_h3_no_works_found')}
              </h3>
              <p className="text-theme-secondary mb-6">
                {t('client_jsx_p_adjust_filters')}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-classical-primary"
                >
                  {t('client_jsx_button_clear_and_view_all')}
                </button>
              )}
            </div>
          </AnimatedItem>
        );
      }

      if (viewMode === 'cards') {
        return (
          <SequentialGrid
            cols={4}
            gap={6}
            delayBetweenItems={0.05}
            className=""
          >
            {worksData.works.map((work) => (
              <WorkCard key={work.id} work={work} goToWorkPage={goToWorkPage} />
            ))}
          </SequentialGrid>
        );
      }

      return (
        <AnimatedCard
          hover="none"
          className="bg-theme-secundary px-4  rounded-2xl overflow-hidden"
        >
          <div className="divide-y divide-theme-secondary flex flex-col gap-4 py-4">
            {worksData.works.map((work, index) => (
              <AnimatedItem
                key={work.id}
                direction="left"
                hover="lift"
                className="classical-card p-4 hover:bg-interactive-hover transition-all duration-300 cursor-pointer group"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'backwards',
                }}
                onClick={() => (window.location.href = `/works/${work.id}`)}
              >
                <WorkCardList work={work} />
              </AnimatedItem>
            ))}
          </div>
        </AnimatedCard>
      );
    }, [worksData.works, viewMode, hasActiveFilters, clearFilters, t]);

    return (
      <PageContainer showBackground={true}>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          {/* Header Section */}
          <div className="relative text-center py-16">
            <AnimatedMusicalNotes2 />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                  <FiBookOpen className="w-8 h-8 text-theme-primary" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                {t('client_jsx_h1_title')}
              </h1>
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle">
                {t('client_jsx_p_subtitle')}
              </p>
            </div>
          </div>

          {/* Search and Filters Section */}
          <AnimatedCard
            hover="none"
            className={`classical-card p-6 transition-all duration-500 relative z-[200] ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  {t('client_jsx_h3_filters_title')}
                </h3>
                <p className="text-theme-secondary text-sm">
                  {t('client_jsx_p_filters_description')}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder={t('client_jsx_input_search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`input-classical pl-12 pr-12 w-full ${
                    isPending ? 'cursor-not-allowed' : ''
                  }`}
                  disabled={isPending}
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-classical-secondary flex items-center space-x-2 ${
                  isPending ? '!cursor-not-allowed !hover:transform-none' : ''
                }`}
                disabled={isPending}
              >
                <FiFilter className="w-4 h-4" />
                <span>
                  {showFilters
                    ? t('client_jsx_button_hide_filters')
                    : t('client_jsx_button_show_filters')}
                </span>
                <div
                  className={`transition-transform duration-300 ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <AnimatedContainer speed="fast" delay={0}>
                <div className="border-t border-theme-secondary pt-6 mb-4 relative z-[150]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Composer Filter */}
                    <div className="space-y-2 flex flex-col gap-1 relative z-[120]">
                      <label className="text-sm font-medium text-theme-secondary">
                        {t('client_jsx_label_composer')}
                      </label>
                      <ComposerSearchInput
                        selectedComposer={selectedComposer}
                        onComposerSelect={handleComposerFilter}
                        popularComposers={filterOptions.popularComposers}
                        isDisabled={isPending}
                      />
                    </div>

                    {/* Instrument Filter */}
                    <div className="space-y-2 flex flex-col gap-1 relative z-[110]">
                      <label className="text-sm font-medium text-theme-secondary">
                        {t('client_jsx_label_instrument')}
                      </label>
                      <div className="relative">
                        <FiMusic className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                        <Select
                          options={[
                            {
                              label: t('client_jsx_option_all_instruments'),
                              value: '',
                            },
                            ...filterOptions.instruments.map((instrument) => ({
                              label: instrument.name, // Nome traduzido para exibição
                              value: instrument.originalName || instrument.name, // Nome original para filtro
                            })),
                          ]}
                          value={selectedInstrument}
                          onChange={(e) =>
                            handleInstrumentFilter(e.target.value)
                          }
                          className="input-classical pl-11 w-full appearance-none"
                          disabled={isPending}
                        />
                      </div>
                    </div>

                    {/* Epoch Filter */}
                    <div className="space-y-2 flex flex-col gap-1 relative z-[105]">
                      <label className="text-sm font-medium text-theme-secondary">
                        {t('client_jsx_label_epoch')}
                      </label>
                      <div className="relative">
                        <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                        <Select
                          options={[
                            {
                              label: t('client_jsx_option_all_epochs'),
                              value: '',
                            },
                            ...filterOptions.epochs.map((epoch) => ({
                              label: translateEpochWithHook(
                                epoch.originalName || epoch.name,
                                t
                              ),
                              value: epoch.id,
                            })),
                          ]}
                          value={selectedEpoch}
                          onChange={(e) => handleEpochFilter(e.target.value)}
                          className="input-classical pl-11 w-full appearance-none"
                          disabled={isPending}
                        />
                      </div>
                    </div>

                    {/* Genre Filter */}
                    <div className="space-y-2 flex flex-col gap-1 relative z-[115]">
                      <label className="text-sm font-medium text-theme-secondary">
                        {t('client_jsx_label_genre')}
                      </label>
                      <GenreSearchInput
                        selectedGenre={selectedGenre}
                        onGenreSelect={handleGenreFilter}
                        initialGenres={filterOptions.workGenres}
                        isDisabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            )}

            {/* Active Filters */}
            <ActiveFilters
              searchParams={searchParams}
              filterOptions={filterOptions}
              onRemoveFilter={removeFilter}
              onClearAll={clearFilters}
              t={t}
            />

            {/* Results Info */}
            <ResultsInfo
              startItem={startItem}
              endItem={endItem}
              totalCount={worksData.totalCount}
              isPending={isPending}
              t={t}
            />
          </AnimatedCard>

          {/* Results Section */}
          <div className="relative mt-4 pt-4 z-[50]">
            {isPending ? <WorksSkeleton /> : worksGrid}

            {/* Loading Overlay */}
            {isPending && (
              <AnimatedItem direction="scale" springType="gentle">
                <div className="absolute inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center z-[60] rounded-2xl">
                  <div className="classical-card p-8 text-center">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-theme-primary font-medium">
                      {t('client_jsx_p_loading_works')}
                    </p>
                  </div>
                </div>
              </AnimatedItem>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <AnimatedItem direction="up" springType="gentle">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isPending={isPending}
              />
            </AnimatedItem>
          )}
        </AnimatedContainer>
      </PageContainer>
    );
  }
);

WorksClient.displayName = 'WorksClient';

export default WorksClient;
