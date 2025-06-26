// app/works/WorksClient.tsx - VERSÃO ULTRA OTIMIZADA com React.memo e useMemo
'use client';

import {
  useState,
  useCallback,
  useTransition,
  useEffect,
  useMemo,
  memo,
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
import WorkCard from './WorkCard';
import WorkCardList from './WorkCardList';
import PaginationControls from '../PaginationControls';
import AnimatedMusicalNotes2 from '../AnimatedMusicalNotes2';
import GenreSearchInput from '../GenreSearchInput';
import ComposerSearchInput from '../ComposerSearchInput';
import ViewModeToggle from '../ViewModeToggle';

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

// Componente de Loading Skeleton otimizado
const WorksSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="classical-card p-6 animate-pulse">
        <div className="h-4 bg-theme-secondary/20 rounded mb-3"></div>
        <div className="h-3 bg-theme-secondary/20 rounded mb-2"></div>
        <div className="h-3 bg-theme-secondary/20 rounded w-2/3"></div>
      </div>
    ))}
  </div>
));

WorksSkeleton.displayName = 'WorksSkeleton';

// Componente de Estatísticas memoizado
const ResultsInfo = memo(
  ({
    startItem,
    endItem,
    totalCount,
    isPending,
  }: {
    startItem: number;
    endItem: number;
    totalCount: number;
    isPending: boolean;
  }) => (
    <div className="flex items-center justify-between text-sm">
      <div className="text-theme-secondary">
        Mostrando{' '}
        <span className="font-medium text-theme-primary">
          {startItem}-{endItem}
        </span>{' '}
        de{' '}
        <span className="font-medium text-theme-primary">
          {totalCount.toLocaleString()}
        </span>{' '}
        obras
      </div>

      {isPending && (
        <div className="flex items-center text-brand-primary">
          <FiRefreshCw className="w-4 h-4 mr-1 animate-spin" />
          Carregando...
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
  }: {
    searchParams: any;
    filterOptions: FilterOptions;
    onRemoveFilter: (key: string) => void;
    onClearAll: () => void;
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

    if (!hasActiveFilters) return null;

    return (
      <div className="flex items-center gap-3 mb-4 flex-wrap pt-4 border-t border-theme-secondary">
        <span className="text-sm font-medium text-theme-secondary">
          Filtros ativos:
        </span>

        {searchParams.search && (
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm">
            <span>Busca: &quot;{searchParams.search}&quot;</span>
            <button
              onClick={() => onRemoveFilter('search')}
              className="hover:text-brand-secondary transition-colors"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        )}

        {searchParams.composer && (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm">
            <span>
              Compositor:{' '}
              {filterOptions.popularComposers.find(
                (c) => c.id === searchParams.composer
              )?.fullName || searchParams.composer}
            </span>
            <button
              onClick={() => onRemoveFilter('composer')}
              className="hover:text-accent-purple/80 transition-colors"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        )}

        {searchParams.instrument && (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm">
            <span>
              Instrumento:{' '}
              {filterOptions.instruments.find(
                (i) => i.id === searchParams.instrument
              )?.name || searchParams.instrument}
            </span>
            <button
              onClick={() => onRemoveFilter('instrument')}
              className="hover:text-accent-green/80 transition-colors"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        )}

        {searchParams.epoch && (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm">
            <span>
              Período:{' '}
              {filterOptions.epochs.find((e) => e.id === searchParams.epoch)
                ?.name || searchParams.epoch}
            </span>
            <button
              onClick={() => onRemoveFilter('epoch')}
              className="hover:text-accent-blue/80 transition-colors"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        )}

        {searchParams.workGenresArr && (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded-full text-sm">
            <span>
              Gênero:{' '}
              {filterOptions.workGenres.find(
                (g) => g.id === searchParams.workGenresArr
              )?.name || searchParams.workGenresArr}
            </span>
            <button
              onClick={() => onRemoveFilter('genre')}
              className="hover:text-accent-orange/80 transition-colors"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          onClick={onClearAll}
          className="text-sm text-accent-red hover:text-accent-red/80 underline font-medium"
        >
          Limpar todos os filtros
        </button>
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

    // Debounced search - otimizado
    const handleSearchChange = useCallback(
      (value: string) => {
        setSearchTerm(value);

        const timeoutId = setTimeout(() => {
          updateSearchParams({ search: value || undefined });
        }, 300); // Reduzido de 500ms para 300ms

        return () => clearTimeout(timeoutId);
      },
      [updateSearchParams]
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
      (instrumentId: string) => {
        setSelectedInstrument(instrumentId);
        updateSearchParams({ instrument: instrumentId || undefined });
      },
      [updateSearchParams]
    );

    const handleEpochFilter = useCallback(
      (epochId: string) => {
        setSelectedEpoch(epochId);
        updateSearchParams({ epoch: epochId || undefined });
      },
      [updateSearchParams]
    );

    const handleGenreFilter = useCallback(
      (genreId: string) => {
        setSelectedGenre(genreId);
        updateSearchParams({ workGenresArr: genreId || undefined });
      },
      [updateSearchParams]
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
          <div className="classical-card p-12 text-center">
            <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMusic className="w-8 h-8 text-theme-tertiary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
              Nenhuma obra encontrada
            </h3>
            <p className="text-theme-secondary mb-6">
              Tente ajustar seus filtros ou termo de busca para encontrar obras.
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-classical-primary">
                Limpar Filtros e Ver Todas
              </button>
            )}
          </div>
        );
      }

      if (viewMode === 'cards') {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {worksData.works.map((work, index) => (
              <div
                key={work.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.03}s`,
                  animationFillMode: 'backwards',
                }}
              >
                <WorkCard work={work} />
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="bg-theme-secundary rounded-2xl overflow-hidden">
          <div className="divide-y divide-theme-secondary flex flex-col gap-4 py-4">
            {worksData.works.map((work, index) => (
              <div
                key={work.id}
                className="animate-fade-in-up classical-card p-4 hover:bg-interactive-hover transition-all duration-300 cursor-pointer group"
                style={{
                  animationDelay: `${index * 0.02}s`,
                  animationFillMode: 'backwards',
                }}
                onClick={() => (window.location.href = `/works/${work.id}`)}
              >
                <WorkCardList work={work} />
              </div>
            ))}
          </div>
        </div>
      );
    }, [worksData.works, viewMode, hasActiveFilters, clearFilters]);

    return (
      <div className="bg-gradient-primary">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
        </div>

        <div className="section-wrap space-y-8 relative z-10">
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
                Obras de Música Clássica
              </h1>
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle">
                Explore nossa vasta coleção de obras-primas da música clássica
              </p>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div
            className={`classical-card p-6 transition-all duration-500 ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  Busca e Filtros
                </h3>
                <p className="text-theme-secondary text-sm">
                  Encontre exatamente a obra que procura
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar por título, opus, compositor..."
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
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
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
            <div
              className={`transition-all duration-500 ${
                showFilters
                  ? 'max-h-96 opacity-100 block'
                  : 'max-h-0 opacity-0 hidden'
              }`}
            >
              <div className="border-t border-theme-secondary pt-6 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                  {/* Composer Filter - ATUALIZADO */}
                  <div className="space-y-2 relative z-[90]">
                    <label className="text-sm font-medium text-theme-secondary">
                      Compositor
                    </label>
                    <ComposerSearchInput
                      selectedComposer={selectedComposer}
                      onComposerSelect={handleComposerFilter}
                      popularComposers={filterOptions.popularComposers}
                      isDisabled={isPending}
                    />
                  </div>

                  {/* Instrument Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-theme-secondary">
                      Instrumento
                    </label>
                    <div className="relative">
                      <FiMusic className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                      <select
                        value={selectedInstrument}
                        onChange={(e) => handleInstrumentFilter(e.target.value)}
                        className="input-classical pl-11 w-full appearance-none"
                        disabled={isPending}
                      >
                        <option value="">Todos os instrumentos</option>
                        {filterOptions.instruments.map((instrument) => (
                          <option key={instrument.id} value={instrument.id}>
                            {instrument.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-theme-tertiary"
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
                    </div>
                  </div>

                  {/* Epoch Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-theme-secondary">
                      Período
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                      <select
                        value={selectedEpoch}
                        onChange={(e) => handleEpochFilter(e.target.value)}
                        className="input-classical pl-11 w-full appearance-none"
                        disabled={isPending}
                      >
                        <option value="">Todos os períodos</option>
                        {filterOptions.epochs.map((epoch) => (
                          <option key={epoch.id} value={epoch.id}>
                            {epoch.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-theme-tertiary"
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
                    </div>
                  </div>

                  {/* Genre Filter */}
                  <div className="space-y-2 relative z-[70]">
                    <label className="text-sm font-medium text-theme-secondary">
                      Gênero
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
            </div>

            {/* Active Filters */}
            <ActiveFilters
              searchParams={searchParams}
              filterOptions={filterOptions}
              onRemoveFilter={removeFilter}
              onClearAll={clearFilters}
            />

            {/* Results Info */}
            <ResultsInfo
              startItem={startItem}
              endItem={endItem}
              totalCount={worksData.totalCount}
              isPending={isPending}
            />
          </div>

          {/* Results Section */}
          <div className="relative -z-10">
            {isPending ? <WorksSkeleton /> : worksGrid}

            {/* Loading Overlay */}
            {isPending && (
              <div className="absolute inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                <div className="classical-card p-8 text-center">
                  <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-theme-primary font-medium">
                    Carregando obras...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isPending={isPending}
            />
          )}
        </div>

        {/* Floating Elements */}
        <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
        <div
          className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="fixed bottom-20 right-4 w-1.5 h-1.5 bg-accent-blue/30 rounded-full animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>
    );
  }
);

WorksClient.displayName = 'WorksClient';

export default WorksClient;
