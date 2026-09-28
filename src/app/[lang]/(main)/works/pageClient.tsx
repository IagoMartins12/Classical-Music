// app/works/pageClient.tsx - Com Performance Otimizada e Traduções - CORRIGIDO
'use client';
import { useReordenacao } from '@/app/components/ui/useReordenacao';
import { navegarComTransicao } from '@/app/components/ui/transicao';
import { useLocalizedRouter } from '@/app/hooks/useLocalizedRouter';

import {
  useState,
  useCallback,
  useTransition,
  useEffect,
  useMemo,
  memo,
  useRef,
} from 'react';

import { WorksListResponse, FilterOptions } from '@/app/requests/work-details';
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiClock,
  PiFunnel,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiX,
} from 'react-icons/pi';
import WorkCard from '../../../components/WorksClient/WorkCard';
import WorkCardList from '../../../components/WorksClient/WorkCardList';
import PaginationControls from '../../../components/PaginationControls';
import GenreSearchInput from '../../../components/GenreSearchInput';
import ComposerSearchInput from '../../../components/ComposerSearchInput';
import ViewModeToggle from '../../../components/ViewModeToggle';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
} from '../../../components/animation/AnimatedComponents';
import { useComposerName } from '@/app/hooks/useComposerName';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import Select from '../../../components/Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

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
      <Card key={i} className="animate-pulse">
        <div className="h-4 rounded mb-3"></div>
        <div className="h-3 rounded mb-2"></div>
        <div className="h-3 rounded w-2/3"></div>
      </Card>
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
        <div className="flex items-center text-ouro-texto">
          <PiArrowsClockwise className="w-4 h-4 mr-1 animate-spin" />
          {t('client_jsx_span_loading')}
        </div>
      )}
    </div>
  )
);

ResultsInfo.displayName = 'ResultsInfo';

// Componente de Filtros Ativos memoizado - CORRIGIDO
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
        <Text papel="rotulo" tom="suave" className="font-medium">
          {t('client_jsx_span_active_filters')}
        </Text>

        {searchParams.search && (
          <AnimatedItem hover="scale">
            <Text
              papel="rotulo"
              tom="ouro"
              as="div"
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-sup-2"
            >
              <span>
                {t('client_jsx_span_search_filter')} &quot;{searchParams.search}
                &quot;
              </span>
              <button
                onClick={() => onRemoveFilter('search')}
                className="transition-colors"
              >
                <PiX className="w-3 h-3" />
                <NomeAcao acao="fechar" />
              </button>
            </Text>
          </AnimatedItem>
        )}

        {searchParams.composer && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
              <span>
                {t('client_jsx_span_composer_filter')}{' '}
                {composerName.composerName || 'Carregando...'}
              </span>
              <button
                onClick={() => onRemoveFilter('composer')}
                className="transition-colors"
              >
                <PiX className="w-3 h-3" />
                <NomeAcao acao="fechar" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {searchParams.instrument && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
              <span>
                {t('client_jsx_span_instrument_filter')}{' '}
                {/* 🔧 CORREÇÃO: Buscar pelo ID em vez de nome */}
                {filterOptions.instruments.find(
                  (i: any) => i.id === searchParams.instrument
                )?.name || searchParams.instrument}
              </span>
              <button
                onClick={() => onRemoveFilter('instrument')}
                className="transition-colors"
              >
                <PiX className="w-3 h-3" />
                <NomeAcao acao="fechar" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {searchParams.epoch && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
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
                className="transition-colors"
              >
                <PiX className="w-3 h-3" />
                <NomeAcao acao="fechar" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {searchParams.workGenresArr && (
          <AnimatedItem hover="scale">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
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
                className="transition-colors"
              >
                <PiX className="w-3 h-3" />
                <NomeAcao acao="fechar" />
              </button>
            </div>
          </AnimatedItem>
        )}

        <AnimatedItem hover="scale">
          <button
            onClick={onClearAll}
            className="text-sm underline font-medium"
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
    const router = useLocalizedRouter();
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
    // Ao filtrar, cada card desliza até o novo lugar (FLIP).
    const gradeRef = useReordenacao<HTMLDivElement>(
      worksData.works.map((w) => w.id),
      'obras'
    );

    // O card vira a página da obra (View Transition); pré-carregar ao
    // passar o ponteiro deixa a espera curta o bastante para a transição.
    const goToWorkPage = (workId: string) => {
      navegarComTransicao(router.push, `/works/${workId}`);
    };
    const preverObra = (workId: string) => router.prefetch(`/works/${workId}`);

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

    // 🔧 CORREÇÃO: Handler de instrumento usando ID
    const handleInstrumentFilter = useCallback(
      (instrumentValue: string) => {
        setSelectedInstrument(instrumentValue);

        if (!instrumentValue) {
          updateSearchParams({ instrument: undefined });
          return;
        }

        // Encontrar o instrumento pelo nome traduzido ou original
        const instrument = filterOptions.instruments.find(
          (i) =>
            i.name === instrumentValue ||
            (i.originalName && i.originalName === instrumentValue) ||
            i.id === instrumentValue
        );

        // ✅ USAR ID em vez de name/originalName
        const instrumentId = instrument?.id || instrumentValue;
        updateSearchParams({ instrument: instrumentId || undefined });
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

    // 🔧 CORREÇÃO: Inicializar o valor selecionado do instrumento corretamente
    useEffect(() => {
      if (searchParams.instrument) {
        // Encontrar o instrumento pelo ID
        const instrument = filterOptions.instruments.find(
          (i) => i.id === searchParams.instrument
        );
        if (instrument) {
          setSelectedInstrument(instrument.name); // Usar nome traduzido para exibição
        }
      }
    }, [searchParams.instrument, filterOptions.instruments]);

    // Render do grid de obras memoizado
    const worksGrid = useMemo(() => {
      if (worksData.works.length === 0) {
        return (
          <AnimatedItem direction="scale" className="mt-4" springType="bouncy">
            <div className="classical-card p-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <PiMusicNotes className="w-8 h-8 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                {t('client_jsx_h3_no_works_found')}
              </h3>
              <p className="text-theme-secondary mb-6">
                {t('client_jsx_p_adjust_filters')}
              </p>
              {hasActiveFilters && (
                <Button
                  variante="primario"
                  type="submit"
                  onClick={clearFilters}
                >
                  {t('client_jsx_button_clear_and_view_all')}
                </Button>
              )}
            </div>
          </AnimatedItem>
        );
      }

      if (viewMode === 'cards') {
        return (
          <div ref={gradeRef}>
            <SequentialGrid
              cols={4}
              gap={6}
              delayBetweenItems={0.05}
              className=""
            >
              {worksData.works.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  goToWorkPage={goToWorkPage}
                  preverObra={preverObra}
                />
              ))}
            </SequentialGrid>
          </div>
        );
      }

      return (
        <AnimatedCard
          hover="none"
          className="px-0 md:px-4 rounded-2xl overflow-hidden"
        >
          <div className="divide-y flex flex-col gap-4 py-4 divide-linha">
            {worksData.works.map((work, index) => (
              <AnimatedItem
                key={work.id}
                direction="left"
                hover="lift"
                className="classical-card p-4 transition-all duration-300 cursor-pointer group"
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
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-theme-glow">
                  <PiBookOpen className="w-8 h-8 text-theme-primary" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                {t('client_jsx_h1_title')}
              </h1>
              <p className="text-xl text-theme-secondary medida-texto mx-auto classical-subtitle">
                {t('client_jsx_p_subtitle')}
              </p>
            </div>
          </div>

          {/* Search and Filters Section */}
          <AnimatedItem
            direction="up"
            className={`classical-card mx-0 sm:p-0 !p-6 relative z-elevado transition-all duration-500 ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {t('client_jsx_h3_filters_title')}
                </h2>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('client_jsx_p_filters_description')}
                </Text>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <PiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary transition-colors"
                  >
                    <PiX className="w-5 h-5" />
                    <NomeAcao acao="fechar" />
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
                <PiFunnel className="w-4 h-4" />
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
                <div className="border-t border-theme-secondary pt-6 mb-4 relative z-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Composer Filter */}
                    <Stack gap={2} className="gap-1 relative z-40">
                      <label className="text-sm font-medium text-theme-secondary">
                        {t('client_jsx_label_composer')}
                      </label>
                      <ComposerSearchInput
                        selectedComposer={selectedComposer}
                        onComposerSelect={handleComposerFilter}
                        popularComposers={filterOptions.popularComposers}
                        isDisabled={isPending}
                      />
                    </Stack>

                    {/* Instrument Filter */}
                    <Stack gap={2} className="gap-1 relative z-20">
                      <label className="text-sm font-medium text-theme-secondary">
                        {t('client_jsx_label_instrument')}
                      </label>
                      <div className="relative">
                        <Select
                          options={[
                            {
                              label: t('client_jsx_option_all_instruments'),
                              value: '',
                            },
                            ...filterOptions.instruments.map((instrument) => ({
                              label: instrument.name, // Nome traduzido para exibição
                              value: instrument.name, // Usar nome traduzido como valor para o select
                            })),
                          ]}
                          value={selectedInstrument}
                          onChange={(e) =>
                            handleInstrumentFilter(e.target.value)
                          }
                          className="w-full"
                          icone={PiMusicNotes}
                          disabled={isPending}
                        />
                      </div>
                    </Stack>

                    {/* Epoch Filter */}
                    <Stack gap={2} className="gap-1 relative z-10">
                      <Text papel="rotulo" tom="suave" className="font-medium">
                        {t('client_jsx_label_epoch')}
                      </Text>
                      <div className="relative">
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
                          className="w-full"
                          icone={PiClock}
                          disabled={isPending}
                        />
                      </div>
                    </Stack>

                    {/* Genre Filter */}
                    <Stack gap={2} className="gap-1 relative z-30">
                      <Text papel="rotulo" tom="suave" className="font-medium">
                        {t('client_jsx_label_genre')}
                      </Text>
                      <GenreSearchInput
                        selectedGenre={selectedGenre}
                        onGenreSelect={handleGenreFilter}
                        initialGenres={filterOptions.workGenres}
                        isDisabled={isPending}
                      />
                    </Stack>
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
          </AnimatedItem>

          {/* Results Section */}
          <div className="relative mt-4 pt-4 z-10">
            {isPending ? <WorksSkeleton /> : worksGrid}

            {/* Loading Overlay */}
            {isPending && (
              <AnimatedItem direction="scale" springType="gentle">
                <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                  <Card densidade="larga" className="text-center">
                    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-theme-primary font-medium">
                      {t('client_jsx_p_loading_works')}
                    </p>
                  </Card>
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
