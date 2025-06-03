// app/works/WorksClient.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { WorksListResponse } from '@/app/requests/work-details';
import {
  FiSearch,
  FiFilter,
  FiMusic,
  FiUser,
  FiClock,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from 'react-icons/fi';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import { LuBookOpen } from 'react-icons/lu';
import WorkCard from './WorkCard';
import WorkCardList from './WorkCardList';

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
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(
    searchParams.instrument || ''
  );
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards'); // Novo estado para controlar visualização

  // Função para renderizar categorias com limite
  const renderCategories = (categories: { id: string; name: string }[]) => {
    if (!categories || categories.length === 0) return null;

    if (categories.length === 1) {
      return (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
          {categories[0].name}
        </span>
      );
    }

    return (
      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
        {categories[0].name} +{categories.length - 1}
      </span>
    );
  };

  // Função para renderizar gêneros de trabalho com limite
  const renderWorkGenres = (workGenres: { id: string; name: string }[]) => {
    if (!workGenres || workGenres.length === 0) return null;

    if (workGenres.length === 1) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
          {workGenres[0].name}
        </span>
      );
    }

    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
        {workGenres[0].name} +{workGenres.length - 1}
      </span>
    );
  };

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
      router.push(`/works${queryString ? `?${queryString}` : ''}`);
    },
    [searchParams, router]
  );

  // Função para busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search: searchTerm || undefined });
  };

  // Função para aplicar filtro de instrumento
  const handleInstrumentFilter = (instrumentId: string) => {
    setSelectedInstrument(instrumentId);
    updateSearchParams({ instrument: instrumentId || undefined });
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInstrument('');
    router.push('/works');
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

  // Calcular paginação
  const totalPages = Math.ceil(worksData.totalCount / 24);
  const startItem = (currentPage - 1) * 24 + 1;
  const endItem = Math.min(currentPage * 24, worksData.totalCount);

  // Verificar se há filtros ativos
  const hasActiveFilters =
    searchParams.search ||
    searchParams.composer ||
    searchParams.genre ||
    searchParams.instrument ||
    searchParams.epoch;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Obras de Música Clássica
        </h1>
        <p className="text-gray-600">
          Explore nossa coleção de {worksData.totalCount.toLocaleString()} obras
          catalogadas
        </p>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título, opus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FiFilter className="w-4 h-4" />
            Filtros
          </button>
        </form>

        {/* Filtros Expandidos */}
        {showFilters && (
          <div className="border-t pt-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro de Instrumento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrumento
                </label>
                <select
                  value={selectedInstrument}
                  onChange={(e) => handleInstrumentFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os instrumentos</option>
                  {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            {searchParams.search && (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>Busca: "{searchParams.search}"</span>
                <button
                  onClick={() => removeFilter('search')}
                  className="ml-1 hover:text-blue-900"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}
            {searchParams.instrument && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <span>
                  Instrumento:{' '}
                  {instruments.find((i) => i.id === searchParams.instrument)
                    ?.name || searchParams.instrument}
                </span>
                <button
                  onClick={() => removeFilter('instrument')}
                  className="ml-1 hover:text-green-900"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}

        {/* Controles de Visualização e Estatísticas */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {startItem}-{endItem} de{' '}
            {worksData.totalCount.toLocaleString()} obras
          </div>

          {/* Toggle para alternar entre visualizações */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 mr-2">Visualização:</span>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Visualização em lista"
            >
              <BsList size={18} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Visualização em cards"
            >
              <BsGrid3X3Gap size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {worksData.works.length > 0 ? (
        viewMode === 'cards' ? (
          // Visualização em Cards (modo detalhado)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {worksData.works.map((work) => (
              <div
                key={work.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <WorkCard
                  work={work}
                  renderCategories={renderCategories}
                  renderWorkGenres={renderWorkGenres}
                />
              </div>
            ))}
          </div>
        ) : (
          // Visualização em Lista (modo simples)
          <div className="bg-white rounded-lg shadow-sm border divide-y divide-gray-200 mb-8">
            {worksData.works.map((work) => (
              <div
                key={work.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => (window.location.href = `/works/${work.id}`)}
              >
                <WorkCardList work={work} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FiMusic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nenhuma obra encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            Tente ajustar seus filtros ou termos de busca.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>

          <div className="flex items-center gap-2">
            {/* Página Anterior */}
            {currentPage > 1 && (
              <button
                onClick={() =>
                  updateSearchParams({ page: (currentPage - 1).toString() })
                }
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}

            {/* Números das páginas */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      updateSearchParams({ page: pageNum.toString() })
                    }
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Próxima Página */}
            {currentPage < totalPages && (
              <button
                onClick={() =>
                  updateSearchParams({ page: (currentPage + 1).toString() })
                }
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Próxima
                <FiChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
