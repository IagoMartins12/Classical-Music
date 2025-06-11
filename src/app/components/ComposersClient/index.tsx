// app/composers/ComposersClient.tsx - Premium version with theme system
'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNavigate } from '@/app/hooks/useNavigate';
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiRefreshCw,
  FiBookOpen,
  FiHeadphones,
  FiMusic,
} from 'react-icons/fi';
import { GiGrandPiano, GiMusicalNotes } from 'react-icons/gi';
import ComposerCard from './ComposerCard';
import ComposerCardList from './ComposerCardList';
import PaginationControls from '../PaginationControls';
import { DiComposer } from 'react-icons/di';
import { FaRegUser } from 'react-icons/fa';

export interface ComposerImslp {
  epochName: string;
  name: string;
  id: string;
  bio: string | null;
  epoch: {
    name: string;
  };
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
  epochId: string;
  permLinkImslp: string | null;
  wikipediaLink: string | null;
  imslpId: string | null;
}

interface Epoch {
  id: string;
  name: string;
}

interface ComposersClientProps {
  composers: ComposerImslp[];
  epochs: Epoch[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  selectedEpoch: string;
}

export default function ComposersClient({
  composers,
  epochs,
  currentPage,
  totalPages,
  totalCount,
  searchTerm: initialSearchTerm,
  selectedEpoch: initialSelectedEpoch,
}: ComposersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { navigateToUrl } = useNavigate();

  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedEpoch, setSelectedEpoch] = useState(initialSelectedEpoch);
  const [showPhotos, setShowPhotos] = useState(true);

  // Função para atualizar URL com debounce
  const updateUrl = useCallback(
    (params: { page?: number; search?: string; epoch?: string }) => {
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

  // Debounce para busca
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      const timeoutId = setTimeout(() => {
        updateUrl({ search: value, page: 1 });
      }, 500);

      return () => clearTimeout(timeoutId);
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

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedEpoch('');
    updateUrl({ search: '', epoch: '', page: 1 });
  }, [updateUrl]);

  const hasActiveFilters = searchTerm || selectedEpoch;

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="section-wrap space-y-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
        </div>

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
                <FaRegUser className="w-8 h-8 text-theme-primary" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Compositores Clássicos
            </h1>
            <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle">
              Explore nossa coleção completa de grandes mestres da música
              clássica{' '}
            </p>
          </div>
        </div>

        {/* Header Section */}
        {/* <div className="relative text-center py-12">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-4 left-10 text-4xl text-brand-primary">
              <GiMusicalNotes />
            </div>
            <div className="absolute bottom-4 right-10 text-3xl text-brand-secondary">
              <FiUsers />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-inverse" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Compositores Clássicos
            </h1>
            <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle">
              Explore nossa coleção completa de grandes mestres da música
              clássica
            </p>
          </div>
        </div> */}

        {/* Filters Section */}
        <div
          className={`classical-card p-6 transition-all duration-500 ${
            isPending ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center mb-6">
            {/* <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mr-4">
              <FiSearch className="w-5 h-5 text-theme-primary" />
            </div> */}
            <div>
              <h3 className="text-xl font-bold text-theme-primary classical-title">
                Busca e Filtros
              </h3>
              <p className="text-theme-secondary text-sm">
                Encontre exatamente o compositor que vocẽ procura.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Search Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-secondary ">
                Pesquisar por nome
              </label>
              <div className="relative mt-2">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Digite o nome do compositor..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="input-classical pl-12 w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Epoch Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-secondary">
                Filtrar por período
              </label>
              <div className="relative mt-2">
                <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <select
                  value={selectedEpoch}
                  onChange={(e) => handleEpochChange(e.target.value)}
                  className="input-classical pl-12 w-full appearance-none"
                >
                  <option value="">Todos os períodos</option>
                  {epochs.map((epoch) => (
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
          </div>

          {/* Filter Status and View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-theme-secondary">
            <div className="flex items-center space-x-4">
              <div className="text-theme-secondary text-sm">
                <span className="font-medium text-theme-primary">
                  {composers.length}
                </span>{' '}
                de{' '}
                <span className="font-medium text-theme-primary">
                  {totalCount}
                </span>{' '}
                compositores
                {searchTerm && (
                  <span className="text-brand-primary">
                    {' '}
                    para "<span className="font-medium">{searchTerm}</span>"
                  </span>
                )}
                {selectedEpoch && (
                  <span className="text-accent-purple">
                    {' '}
                    do período "
                    <span className="font-medium">
                      {epochs.find((e) => e.id === selectedEpoch)?.name}
                    </span>
                    "
                  </span>
                )}
              </div>

              {isPending && (
                <div className="flex items-center text-brand-primary text-sm">
                  <FiRefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Carregando...
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-classical-secondary text-sm"
                >
                  Limpar Filtros
                </button>
              )}

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-theme-secondary">Vista:</span>
                <div className="bg-theme-elevated border border-theme-primary rounded-lg p-1 flex">
                  <button
                    onClick={() => setShowPhotos(false)}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      !showPhotos
                        ? 'bg-brand-gradient text-theme-inverse shadow-theme-glow'
                        : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
                    }`}
                    title="Visualização em lista"
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowPhotos(true)}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      showPhotos
                        ? 'bg-brand-gradient text-theme-inverse shadow-theme-glow'
                        : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
                    }`}
                    title="Visualização em grade"
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="relative">
          {composers.length > 0 ? (
            showPhotos ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {composers.map((composer, index) => (
                  <div
                    key={composer.id}
                    className="animate-fade-in-up cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'backwards',
                    }}
                    onClick={() => navigateToUrl('composer', composer.id)}
                  >
                    <ComposerCard composer={composer} />
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="classical-card overflow-hidden">
                <div className="divide-y divide-theme-secondary">
                  {composers.map((composer, index) => (
                    <div
                      key={composer.id}
                      className="animate-fade-in-up p-4 hover:bg-interactive-hover transition-all duration-300 cursor-pointer group"
                      style={{
                        animationDelay: `${index * 0.02}s`,
                        animationFillMode: 'backwards',
                      }}
                      onClick={() => navigateToUrl('composer', composer.id)}
                    >
                      <ComposerCardList composer={composer} />
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            // Empty State
            <div className="classical-card p-12 text-center">
              <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-8 h-8 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                Nenhum compositor encontrado
              </h3>
              <p className="text-theme-secondary mb-6">
                Tente ajustar seus filtros ou termo de busca para encontrar
                compositores.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-classical-primary"
                >
                  Limpar Filtros e Ver Todos
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
                  Carregando compositores...
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
    </div>
  );
}
