// app/works/WorksClient.tsx - Premium version with theme system
'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { WorksListResponse } from '@/app/requests/work-details';
import {
  FiSearch,
  FiFilter,
  FiMusic,
  FiGrid,
  FiList,
  FiX,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiRefreshCw,
  FiBookOpen,
  FiHeadphones,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';
import WorkCard from './WorkCard';
import WorkCardList from './WorkCardList';
import PaginationControls from '../PaginationControls';

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
  };
  instruments: {
    id: string;
    name: string;
  }[];
}

export default function WorksClient({
  worksData,
  currentPage,
  searchParams,
  instruments,
}: WorksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(
    searchParams.instrument || ''
  );
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  // Função para atualizar URL com novos parâmetros
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

  // Função para busca com debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      const timeoutId = setTimeout(() => {
        updateSearchParams({ search: value || undefined });
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [updateSearchParams]
  );

  // Função para aplicar filtro de instrumento
  const handleInstrumentFilter = (instrumentId: string) => {
    setSelectedInstrument(instrumentId);
    updateSearchParams({ instrument: instrumentId || undefined });
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInstrument('');
    startTransition(() => {
      router.push('/works');
    });
  };

  // Função para remover filtro específico
  const removeFilter = (filterKey: string) => {
    if (filterKey === 'search') {
      setSearchTerm('');
    } else if (filterKey === 'instrument') {
      setSelectedInstrument('');
    }
    updateSearchParams({ [filterKey]: undefined });
  };

  // Função para mudança de página
  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateSearchParams]
  );

  // Calcular estatísticas
  const totalPages = Math.ceil(worksData.totalCount / 24);
  const startItem = (currentPage - 1) * 24 + 1;
  const endItem = Math.min(currentPage * 24, worksData.totalCount);

  // Verificar se há filtros ativos
  const hasActiveFilters =
    searchParams.search ||
    searchParams.composer ||
    searchParams.instrument ||
    searchParams.epoch;

  return (
    <div className="min-h-screen bg-gradient-primary">
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
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 left-12 text-5xl text-brand-primary/20 animate-float">
              <GiMusicalNotes />
            </div>
            <div
              className="absolute bottom-6 right-12 text-4xl text-brand-secondary/20 animate-float"
              style={{ animationDelay: '1s' }}
            >
              <FiMusic />
            </div>
            <div
              className="absolute top-12 right-24 text-3xl text-accent-purple/20 animate-float"
              style={{ animationDelay: '2s' }}
            >
              <GiGrandPiano />
            </div>
            <div
              className="absolute bottom-12 left-24 text-3xl text-accent-blue/20 animate-float"
              style={{ animationDelay: '0.5s' }}
            >
              <FiHeadphones />
            </div>
            <div
              className="absolute top-1/2 left-8 text-2xl text-accent-green/20 animate-float"
              style={{ animationDelay: '1.5s' }}
            >
              <FiBookOpen />
            </div>
            <div
              className="absolute top-1/3 right-8 text-2xl text-brand-primary/15 animate-float"
              style={{ animationDelay: '2.5s' }}
            >
              <GiMusicalNotes />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-primary/5 to-transparent"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                <FiBookOpen className="w-8 h-8 text-theme-inverse" />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="classical-card p-6 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiBookOpen className="w-6 h-6 text-theme-inverse" />
            </div>
            <h3 className="text-2xl font-bold text-brand-primary mb-2">
              {worksData.totalCount.toLocaleString()}
            </h3>
            <p className="text-theme-secondary text-sm">Obras Total</p>
          </div>

          <div className="classical-card p-6 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiMusic className="w-6 h-6 text-theme-inverse" />
            </div>
            <h3 className="text-2xl font-bold text-accent-purple mb-2">
              {instruments.length}
            </h3>
            <p className="text-theme-secondary text-sm">Instrumentos</p>
          </div>

          <div className="classical-card p-6 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiTrendingUp className="w-6 h-6 text-theme-inverse" />
            </div>
            <h3 className="text-2xl font-bold text-accent-green mb-2">
              {worksData.works.length}
            </h3>
            <p className="text-theme-secondary text-sm">Resultados Atuais</p>
          </div>

          <div className="classical-card p-6 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiHeadphones className="w-6 h-6 text-theme-inverse" />
            </div>
            <h3 className="text-2xl font-bold text-accent-red mb-2">
              {totalPages}
            </h3>
            <p className="text-theme-secondary text-sm">Páginas</p>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div
          className={`classical-card p-6 transition-all duration-500 ${
            isPending ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mr-4">
              <FiSearch className="w-5 h-5 text-theme-inverse" />
            </div>
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
                className="input-classical pl-12 pr-12 w-full"
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
              className="btn-classical-secondary flex items-center space-x-2"
            >
              <FiFilter className="w-4 h-4" />
              <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
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

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-theme-secondary">Vista:</span>
              <div className="bg-theme-elevated border border-theme-primary rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-brand-gradient text-theme-inverse shadow-theme-glow'
                      : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
                  }`}
                  title="Visualização em lista"
                >
                  <FiList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'cards'
                      ? 'bg-brand-gradient text-theme-inverse shadow-theme-glow'
                      : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
                  }`}
                  title="Visualização em cards"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          <div
            className={`overflow-hidden transition-all duration-500 ${
              showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-theme-secondary pt-6 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    >
                      <option value="">Todos os instrumentos</option>
                      {instruments.map((instrument) => (
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

                {/* Additional filters could be added here */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-secondary">
                    Período (Em breve)
                  </label>
                  <div className="input-classical bg-theme-tertiary/10 text-theme-tertiary cursor-not-allowed">
                    Todos os períodos
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-secondary">
                    Gênero (Em breve)
                  </label>
                  <div className="input-classical bg-theme-tertiary/10 text-theme-tertiary cursor-not-allowed">
                    Todos os gêneros
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mb-4 flex-wrap pt-4 border-t border-theme-secondary">
              <span className="text-sm font-medium text-theme-secondary">
                Filtros ativos:
              </span>

              {searchParams.search && (
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm">
                  <span>Busca: "{searchParams.search}"</span>
                  <button
                    onClick={() => removeFilter('search')}
                    className="hover:text-brand-secondary transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}

              {searchParams.instrument && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm">
                  <span>
                    Instrumento:{' '}
                    {instruments.find((i) => i.id === searchParams.instrument)
                      ?.name || searchParams.instrument}
                  </span>
                  <button
                    onClick={() => removeFilter('instrument')}
                    className="hover:text-accent-green/80 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={clearFilters}
                className="text-sm text-accent-red hover:text-accent-red/80 underline font-medium"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}

          {/* Results Info and Loading */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-theme-secondary">
              Mostrando{' '}
              <span className="font-medium text-theme-primary">
                {startItem}-{endItem}
              </span>{' '}
              de{' '}
              <span className="font-medium text-theme-primary">
                {worksData.totalCount.toLocaleString()}
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
        </div>

        {/* Results Section */}
        <div className="relative">
          {worksData.works.length > 0 ? (
            viewMode === 'cards' ? (
              // Cards View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {worksData.works.map((work, index) => (
                  <div
                    key={work.id}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <WorkCard work={work} />
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="classical-card overflow-hidden">
                <div className="divide-y divide-theme-secondary">
                  {worksData.works.map((work, index) => (
                    <div
                      key={work.id}
                      className="animate-fade-in-up p-4 hover:bg-interactive-hover transition-all duration-300 cursor-pointer group"
                      style={{
                        animationDelay: `${index * 0.02}s`,
                        animationFillMode: 'backwards',
                      }}
                      onClick={() =>
                        (window.location.href = `/works/${work.id}`)
                      }
                    >
                      <WorkCardList work={work} />
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            // Empty State
            <div className="classical-card p-12 text-center">
              <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMusic className="w-8 h-8 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                Nenhuma obra encontrada
              </h3>
              <p className="text-theme-secondary mb-6">
                Tente ajustar seus filtros ou termo de busca para encontrar
                obras.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-classical-primary"
                >
                  Limpar Filtros e Ver Todas
                </button>
              )}
            </div>
          )}

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

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
