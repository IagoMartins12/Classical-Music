// app/composers/ComposersClient.tsx - Premium version com Animação Sequencial
'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNavigate } from '@/app/hooks/useNavigate';
import { FiSearch, FiClock, FiRefreshCw } from 'react-icons/fi';
import ComposerCard from './ComposerCard';
import ComposerCardList from './ComposerCardList';
import PaginationControls from '../PaginationControls';
import { FaRegUser } from 'react-icons/fa';
import AnimatedMusicalNotes2 from '../AnimatedMusicalNotes2';
import ViewModeToggle from '../ViewModeToggle';

// Importar componentes de animação - INCLUINDO SEQUENCIAL
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid, // ✅ NOVO - Para animação sequencial
  LoadingSpinner,
} from '../animation/AnimatedComponents';

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
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

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
    <PageContainer showBackground={true}>
      {/* Header Section */}
      <AnimatedContainer delay={0.1} staggerSpeed="fast">
        <AnimatedItem
          direction="up"
          springType="bouncy"
          className="relative text-center py-16"
        >
          {/* Animated Background Elements */}
          <AnimatedMusicalNotes2 />

          <div className="relative z-10">
            <AnimatedItem
              direction="scale"
              className="flex items-center justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                <FaRegUser className="w-8 h-8 text-theme-primary" />
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Compositores Clássicos
              </h1>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle">
                Explore nossa coleção completa de grandes mestres da música
                clássica
              </p>
            </AnimatedItem>
          </div>
        </AnimatedItem>

        {/* Filters Section */}
        <AnimatedItem
          direction="up"
          className={`classical-card mx-4 p-6 transition-all duration-500 ${
            isPending ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-theme-primary classical-title">
                Busca e Filtros
              </h3>
              <p className="text-theme-secondary text-sm">
                Encontre exatamente o compositor que você procura.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Search Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-secondary">
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
                    para &quot;
                    <span className="font-medium">{searchTerm}</span>&quot;
                  </span>
                )}
                {selectedEpoch && (
                  <span className="text-accent-purple">
                    {' '}
                    do período &quot;
                    <span className="font-medium">
                      {epochs.find((e) => e.id === selectedEpoch)?.name}
                    </span>
                    &quot;
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
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </AnimatedItem>

        {/* Results Section - AQUI ESTÁ A ANIMAÇÃO SEQUENCIAL! */}
        <div className="relative mt-6">
          {composers.length > 0 ? (
            viewMode === 'cards' ? (
              // 🎬 ANIMAÇÃO SEQUENCIAL - Cards aparecem um por vez!
              <SequentialGrid cols={4} gap={6} className="px-4">
                {composers.map((composer) => (
                  <div
                    key={composer.id}
                    className="cursor-pointer group"
                    onClick={() => navigateToUrl('composer', composer.id)}
                  >
                    <ComposerCard composer={composer} />
                  </div>
                ))}
              </SequentialGrid>
            ) : (
              <div className="divide-y divide-theme-secondary flex flex-col gap-4 py-4 mx-4">
                {composers.map((composer, index) => (
                  <AnimatedItem
                    key={composer.id}
                    direction="left"
                    className="classical-card p-4 hover:bg-interactive-hover transition-all duration-300 cursor-pointer group"
                    onClick={() => navigateToUrl('composer', composer.id)}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <ComposerCardList composer={composer} />
                  </AnimatedItem>
                ))}
              </div>
            )
          ) : (
            // Empty State com animação
            <AnimatedItem
              direction="scale"
              className="px-4"
              springType="bouncy"
            >
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
            </AnimatedItem>
          )}

          {/* Loading Overlay com animação */}
          {isPending && (
            <AnimatedItem
              direction="scale"
              className="absolute inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
            >
              <div className="classical-card p-8 text-center">
                <LoadingSpinner size="lg" />
                <p className="text-theme-primary font-medium mt-4">
                  Carregando compositores...
                </p>
              </div>
            </AnimatedItem>
          )}
        </div>

        {/* Pagination com animação */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" className="px-4">
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

// 🎨 OPÇÕES ALTERNATIVAS DE ANIMAÇÃO SEQUENCIAL:

/*
// OPÇÃO 1: TypewriterGrid (Mais suave, estilo máquina de escrever)
<TypewriterGrid 
  cols={4} 
  gap={6} 
  delayBetweenItems={0.12}
  animationType="typewriter"
  className="px-4"
>
  {composers.map((composer) => (
    <div
      key={composer.id}
      className="cursor-pointer"
      onClick={() => navigateToUrl('composer', composer.id)}
    >
      <ComposerCard composer={composer} />
    </div>
  ))}
</TypewriterGrid>

// OPÇÃO 2: WaveAnimation (Por linhas, efeito onda)
<WaveAnimation 
  cols={4} 
  gap={6} 
  delayBetweenRows={0.3}
  delayBetweenCols={0.05}
  className="px-4"
>
  {composers.map((composer) => (
    <div
      key={composer.id}
      className="cursor-pointer"
      onClick={() => navigateToUrl('composer', composer.id)}
    >
      <ComposerCard composer={composer} />
    </div>
  ))}
</WaveAnimation>

// OPÇÃO 3: Cascata (Diagonal)
<TypewriterGrid 
  cols={4} 
  gap={6} 
  delayBetweenItems={0.1}
  animationType="cascade"
  className="px-4"
>
  {composers.map((composer) => (
    <div
      key={composer.id}
      className="cursor-pointer"
      onClick={() => navigateToUrl('composer', composer.id)}
    >
      <ComposerCard composer={composer} />
    </div>
  ))}
</TypewriterGrid>
*/
