// ComposerWorks.tsx - Versão com tabs de workType
'use client';

import {
  ComposerWork,
  ComposerFilterOptions,
} from '@/app/requests/composer-details';
import Link from 'next/link';
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  FiMusic,
  FiPlay,
  FiSearch,
  FiFilter,
  FiClock,
  FiX,
  FiBookOpen,
  FiRefreshCw,
  FiCalendar,
  FiLoader,
  FiPlus,
  FiLayers,
} from 'react-icons/fi';
import {
  GiViolin,
  GiFlute,
  GiTrumpet,
  GiSaxophone,
  GiHarp,
  GiDrum,
  GiMusicalNotes,
  GiGrandPiano,
} from 'react-icons/gi';
import { MdLibraryMusic } from 'react-icons/md';
import FavoriteButton from '../../FavoriteButton';
import ViewModeToggle from '../../ViewModeToggle';

interface ComposerWorksProps {
  composerId: string;
  composerName: string;
  initialWorks: ComposerWork[];
  initialTotalCount: number;
  initialHasMore: boolean;
  filterOptions: ComposerFilterOptions;
}

// Mapeamento dos tipos de trabalho para nomes amigáveis
const WORK_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_COMPOSITION: 'Obras Individuais', // Agrupa INDIVIDUAL e COMPOSITION
  COMPLETE_WORK: 'Obras Completas',
  ARRANGEMENT: 'Arranjos',
  COLLECTION_WORKS: 'Coleções', // Agrupa COLLECTION e COLLECTED_WORKS
  COLLABORATION: 'Colaborações',
  COLLECTIONS_WITH: 'Coleções com',
};

// Grupos de workTypes que devem ser tratados como um só
const WORK_TYPE_GROUPS: Record<string, string[]> = {
  INDIVIDUAL_COMPOSITION: ['INDIVIDUAL', 'COMPOSITION'],
  COLLECTION_WORKS: ['COLLECTION', 'COLLECTED_WORKS'],
  COMPLETE_WORK: ['COMPLETE_WORK'],
  ARRANGEMENT: ['ARRANGEMENT'],
  COLLABORATION: ['COLLABORATION'],
  COLLECTIONS_WITH: ['COLLECTIONS_WITH'],
};

// Ordem específica das tabs (INDIVIDUAL_COMPOSITION vem primeiro)
const TAB_ORDER = [
  'INDIVIDUAL_COMPOSITION',
  'COMPLETE_WORK',
  'ARRANGEMENT',
  'COLLECTION_WORKS',
  'COLLABORATION',
  'COLLECTIONS_WITH',
];

// Função para determinar o ícone do instrumento
const getInstrumentIcon = (instrumentName: string) => {
  const instrument = instrumentName.toLowerCase();

  if (instrument.includes('piano')) return <GiGrandPiano className="w-5 h-5" />;
  if (instrument.includes('violin')) return <GiViolin className="w-5 h-5" />;
  if (instrument.includes('cello')) return <GiViolin className="w-5 h-5" />;
  if (instrument.includes('flute') || instrument.includes('flauta'))
    return <GiFlute className="w-5 h-5" />;
  if (instrument.includes('trumpet') || instrument.includes('trompete'))
    return <GiTrumpet className="w-5 h-5" />;
  if (instrument.includes('saxophone') || instrument.includes('saxofone'))
    return <GiSaxophone className="w-5 h-5" />;
  if (instrument.includes('harp') || instrument.includes('harpa'))
    return <GiHarp className="w-5 h-5" />;
  if (
    instrument.includes('guitar') ||
    instrument.includes('violão') ||
    instrument.includes('guitarra')
  )
    return <GiMusicalNotes className="w-5 h-5" />;
  if (
    instrument.includes('drum') ||
    instrument.includes('bateria') ||
    instrument.includes('percussão')
  )
    return <GiDrum className="w-5 h-5" />;
  if (instrument.includes('orchestra') || instrument.includes('orquestra'))
    return <GiMusicalNotes className="w-5 h-5" />;

  return <FiMusic className="w-5 h-5" />;
};

// Função para formatar duração
const formatDuration = (duration?: string) => {
  if (!duration) return null;

  // Se já está no formato MM:SS ou HH:MM:SS
  if (duration.includes(':')) return duration;

  // Se é apenas número (assumindo minutos)
  const minutes = parseInt(duration);
  if (!isNaN(minutes)) {
    return `${minutes}min`;
  }

  return duration;
};

export default function ComposerWorks({
  composerId,
  composerName,
  initialWorks,
  initialTotalCount,
  initialHasMore,
  filterOptions,
}: ComposerWorksProps) {
  // Adicionar estilos de animação
  const animationStyles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out;
    }
    
    .animate-slide-up {
      animation: slideUp 0.5s ease-out;
    }
    
    .skeleton-shimmer {
      background: linear-gradient(90deg, 
        rgba(156, 163, 175, 0.1) 25%, 
        rgba(156, 163, 175, 0.3) 50%, 
        rgba(156, 163, 175, 0.1) 75%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite linear;
    }
    
    .content-transition {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;

  // Estados principais
  const [works, setWorks] = useState<ComposerWork[]>(initialWorks);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [workTypeCounts, setWorkTypeCounts] = useState<Record<string, number>>(
    {}
  );

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all'); // Novo estado para workType
  const [showFilters, setShowFilters] = useState(false);

  // Buscar contagens reais dos workTypes
  useEffect(() => {
    const fetchWorkTypeCounts = async () => {
      try {
        const response = await fetch('/api/composer-work-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            composerId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setWorkTypeCounts(data.workTypeCounts || {});
        }
      } catch (error) {
        console.error('Erro ao buscar contagens dos workTypes:', error);
      }
    };

    fetchWorkTypeCounts();
  }, [composerId]);

  // Calcular workTypes disponíveis a partir das obras iniciais (agrupados)
  const availableWorkTypes = useMemo(() => {
    const availableGroups = new Set<string>();

    initialWorks.forEach((work) => {
      if (work.workType) {
        // Encontrar qual grupo este workType pertence
        for (const [groupKey, types] of Object.entries(WORK_TYPE_GROUPS)) {
          if (types.includes(work.workType)) {
            availableGroups.add(groupKey);
            break;
          }
        }
      }
    });

    // Retornar na ordem específica, filtrando apenas os disponíveis
    return TAB_ORDER.filter((group) => availableGroups.has(group));
  }, [initialWorks]);

  // Função para obter contagem agrupada
  const getGroupedCount = useCallback(
    (groupKey: string): number => {
      const types = WORK_TYPE_GROUPS[groupKey] || [];
      return types.reduce(
        (total, type) => total + (workTypeCounts[type] || 0),
        0
      );
    },
    [workTypeCounts]
  );

  // Função para aplicar filtros
  const applyFilters = useCallback(
    async (customFilters?: {
      instrumentId?: string;
      workGenresArr?: string;
      categoryNames?: string;
      search?: string;
      workType?: string;
    }) => {
      setLoading(true);
      try {
        // Usar filtros customizados se fornecidos, senão usar os estados atuais
        let filters = customFilters || {
          ...(selectedInstrument && { instrumentId: selectedInstrument }),
          ...(selectedGenre && { workGenresArr: selectedGenre }),
          ...(selectedCategory && { categoryNames: selectedCategory }),
          ...(searchTerm && { search: searchTerm }),
        };

        // Tratar workType agrupado
        if (selectedWorkType !== 'all') {
          const workTypesToFilter = WORK_TYPE_GROUPS[selectedWorkType];
          if (workTypesToFilter && workTypesToFilter.length > 0) {
            // Para múltiplos workTypes, enviamos como array ou fazemos múltiplas chamadas
            // Por ora, vamos fazer chamadas separadas e unir os resultados
            const promises = workTypesToFilter.map((type) =>
              fetch('/api/composer-works', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  composerId,
                  page: 1,
                  limit: 1000, // Buscar todas para unir
                  filters: {
                    ...filters,
                    workType: type,
                  },
                }),
              }).then((res) => res.json())
            );

            const results = await Promise.all(promises);

            // Unir todas as obras e remover duplicatas
            const allWorks: ComposerWork[] = [];
            const seenIds = new Set<string>();
            let totalCount = 0;

            results.forEach((result) => {
              totalCount += result.totalCount;
              result.works.forEach((work: ComposerWork) => {
                if (!seenIds.has(work.id)) {
                  seenIds.add(work.id);
                  allWorks.push(work);
                }
              });
            });

            setWorks(allWorks);
            setTotalCount(totalCount);
            setHasMore(false); // Como buscamos todas, não há mais
            setCurrentPage(1);
            return;
          }
        }

        // Filtro normal para workTypes únicos ou sem filtro de workType
        const response = await fetch('/api/composer-works', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            composerId,
            page: 1,
            limit: 50,
            filters: Object.keys(filters).length > 0 ? filters : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();
        setWorks(data.works);
        setTotalCount(data.totalCount);
        setHasMore(data.hasMore);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        // Em caso de erro, manter os dados atuais
      } finally {
        setLoading(false);
      }
    },
    [
      composerId,
      searchTerm,
      selectedInstrument,
      selectedGenre,
      selectedCategory,
      selectedWorkType,
    ]
  );

  // Debounce APENAS para busca por texto
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Aplicar filtros imediatamente quando filtros de select mudarem
  useEffect(() => {
    applyFilters();
  }, [selectedInstrument, selectedGenre, selectedCategory, selectedWorkType]);

  // Função para carregar mais obras
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      // Para workTypes agrupados, não implementamos loadMore por simplicidade
      // (já carregamos todas as obras na primeira busca)
      if (selectedWorkType !== 'all' && WORK_TYPE_GROUPS[selectedWorkType]) {
        setLoadingMore(false);
        return;
      }

      const filters = {
        ...(selectedInstrument && { instrumentId: selectedInstrument }),
        ...(selectedGenre && { workGenresArr: selectedGenre }),
        ...(selectedCategory && { categoryNames: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedWorkType !== 'all' && { workType: selectedWorkType }),
      };

      const response = await fetch('/api/composer-works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          composerId,
          page: currentPage + 1,
          limit: 50,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      setWorks((prev) => [...prev, ...data.works]);
      setHasMore(data.hasMore);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error('Erro ao carregar mais obras:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    composerId,
    currentPage,
    hasMore,
    loadingMore,
    searchTerm,
    selectedInstrument,
    selectedGenre,
    selectedCategory,
    selectedWorkType,
  ]);

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInstrument('');
    setSelectedGenre('');
    setSelectedCategory('');
    setSelectedWorkType('all');

    // Restaurar dados iniciais
    setWorks(initialWorks);
    setTotalCount(initialTotalCount);
    setHasMore(initialHasMore);
    setCurrentPage(1);
  };

  // Funções simplificadas para mudanças de filtros
  const handleInstrumentChange = (value: string) => {
    setSelectedInstrument(value);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleWorkTypeChange = (workType: string) => {
    setSelectedWorkType(workType);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedInstrument ||
    selectedGenre ||
    selectedCategory ||
    selectedWorkType !== 'all';

  if (initialTotalCount === 0) {
    return (
      <div className="classical-card p-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
            <FiBookOpen className="w-6 h-6 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Obras Catalogadas
            </h2>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdLibraryMusic className="w-8 h-8 text-theme-tertiary" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
            Nenhuma obra catalogada
          </h3>
          <p className="text-theme-secondary">
            Ainda não temos obras catalogadas para este compositor em nossa base
            de dados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <div className="classical-card">
        {/* Header */}
        <div className="p-8 border-b border-theme-secondary bg-gradient-to-r from-theme-elevated to-interactive-hover">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-theme-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Obras Catalogadas
              </h2>
              <p className="text-theme-secondary classical-subtitle">
                {works.length} de {totalCount} obras de {composerName}
              </p>
            </div>
          </div>

          {/* Tabs de WorkType */}
          {availableWorkTypes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <FiLayers className="w-4 h-4 text-theme-primary" />
                <span className="text-sm font-medium text-theme-primary">
                  Filtrar por tipo de obra
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Tab "Todos" */}
                <button
                  onClick={() => handleWorkTypeChange('all')}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
                    ${
                      selectedWorkType === 'all'
                        ? 'bg-brand-primary text-theme-primary shadow-theme-medium border-2 border-brand-primary'
                        : 'bg-interactive-hover border border-theme-secondary text-theme-secondary hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:text-brand-primary'
                    }
                  `}
                  disabled={loading}
                >
                  Todos ({initialTotalCount})
                </button>

                {/* Tabs dos workTypes disponíveis */}
                {availableWorkTypes.map((groupKey) => {
                  const groupCount = getGroupedCount(groupKey);
                  return (
                    <button
                      key={groupKey}
                      onClick={() => handleWorkTypeChange(groupKey)}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
                        ${
                          selectedWorkType === groupKey
                            ? 'bg-accent-blue text-theme-primary shadow-theme-medium border-2 border-accent-blue'
                            : 'bg-interactive-hover border border-theme-secondary text-theme-secondary hover:bg-accent-blue/10 hover:border-accent-blue/30 hover:text-accent-blue'
                        }
                      `}
                      disabled={loading}
                    >
                      {WORK_TYPE_LABELS[groupKey]} ({groupCount})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barra de busca */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título, opus ou tonalidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`input-classical w-full pl-12 pr-12 ${
                loading ? 'cursor-not-allowed' : ''
              }`}
              disabled={loading}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
                disabled={loading}
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Toggle de filtros */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-classical-secondary flex items-center space-x-2 ${
                loading ? '!cursor-not-allowed !hover:transform-none' : ''
              }`}
              disabled={loading}
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

            {loading && (
              <div className="flex items-center text-brand-primary">
                <FiLoader className="w-4 h-4 mr-1 animate-spin" />
                Filtrando...
              </div>
            )}

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="overflow-hidden transition-all duration-500 max-h-96 opacity-100 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-theme-elevated/50 border border-theme-primary rounded-xl">
                {/* Filtro de instrumento */}
                <div className="space-y-2 flex flex-col gap-1">
                  <label className="text-sm font-medium text-theme-secondary">
                    Instrumento ({filterOptions.instruments.length})
                  </label>
                  <div className="relative">
                    <FiMusic className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <select
                      value={selectedInstrument}
                      onChange={(e) => handleInstrumentChange(e.target.value)}
                      className="input-classical w-full appearance-none pl-11"
                      disabled={loading}
                    >
                      <option value="">Todos os instrumentos</option>
                      {filterOptions.instruments.map((instrument) => (
                        <option
                          key={instrument.id}
                          value={instrument.id}
                          className="capitalize"
                        >
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

                {/* Filtro de gênero */}
                <div className="space-y-2 flex flex-col gap-1">
                  <label className="text-sm font-medium text-theme-secondary">
                    Gênero ({filterOptions.workGenres.length})
                  </label>
                  <div className="relative">
                    <MdLibraryMusic className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <select
                      value={selectedGenre}
                      onChange={(e) => handleGenreChange(e.target.value)}
                      className="input-classical capitalize w-full appearance-none pl-11"
                      disabled={loading}
                    >
                      <option value="">Todos os gêneros</option>
                      {filterOptions.workGenres.map((genre) => (
                        <option
                          key={genre}
                          value={genre}
                          className="capitalize"
                        >
                          {genre}
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

                {/* Filtro de categoria */}
                <div className="space-y-2 flex flex-col gap-1">
                  <label className="text-sm font-medium text-theme-secondary">
                    Categoria ({filterOptions.categories.length})
                  </label>
                  <div className="relative">
                    <FiBookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="input-classical w-full appearance-none pl-11"
                      disabled={loading}
                    >
                      <option value="">Todas as categorias</option>
                      {filterOptions.categories.map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="capitalize"
                        >
                          {category}
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
            </div>
          )}

          {/* Filtros ativos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className="text-sm font-medium text-theme-secondary">
                Filtros ativos:
              </span>

              {searchTerm && (
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm">
                  <span>Busca: &quot;{searchTerm}&quot;</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:text-brand-secondary transition-colors"
                    disabled={loading}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedWorkType !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm">
                  <span>
                    Tipo:{' '}
                    {WORK_TYPE_LABELS[selectedWorkType] || selectedWorkType}
                  </span>
                  <button
                    onClick={() => setSelectedWorkType('all')}
                    className="hover:text-accent-blue/80 transition-colors"
                    disabled={loading}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedInstrument && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm">
                  <span>
                    Instrumento:{' '}
                    {
                      filterOptions.instruments.find(
                        (i) => i.id === selectedInstrument
                      )?.name
                    }
                  </span>
                  <button
                    onClick={() => setSelectedInstrument('')}
                    className="hover:text-accent-green/80 transition-colors"
                    disabled={loading}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedGenre && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm">
                  <span>Gênero: {selectedGenre}</span>
                  <button
                    onClick={() => setSelectedGenre('')}
                    className="hover:text-accent-purple/80 transition-colors"
                    disabled={loading}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedCategory && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded-full text-sm">
                  <span>Categoria: {selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="hover:text-accent-orange/80 transition-colors"
                    disabled={loading}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={clearFilters}
                className="text-sm text-accent-red hover:text-accent-red/80 underline font-medium"
                disabled={loading}
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista de obras */}
        <div className="p-8 content-transition">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="classical-card-simple animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          {/* Skeleton para ícone do instrumento */}
                          <div className="w-8 h-8 bg-theme-tertiary/20 rounded-xl skeleton-shimmer"></div>

                          <div className="flex-1">
                            {/* Skeleton para título */}
                            <div
                              className="h-5 bg-theme-tertiary/20 rounded-lg mb-2 skeleton-shimmer"
                              style={{ width: `${60 + Math.random() * 30}%` }}
                            ></div>
                            {/* Skeleton para opus */}
                            <div className="h-4 bg-theme-tertiary/20 rounded-full w-20 skeleton-shimmer"></div>
                          </div>
                        </div>

                        {/* Skeleton para informações */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-2"
                            >
                              <div className="w-4 h-4 bg-theme-tertiary/20 rounded skeleton-shimmer"></div>
                              <div
                                className="h-4 bg-theme-tertiary/20 rounded skeleton-shimmer"
                                style={{
                                  width: `${40 + Math.random() * 40}px`,
                                }}
                              ></div>
                            </div>
                          ))}
                        </div>

                        {/* Skeleton para tags */}
                        <div className="flex flex-wrap gap-2">
                          {Array.from({
                            length: 2 + Math.floor(Math.random() * 2),
                          }).map((_, i) => (
                            <div
                              key={i}
                              className="h-6 bg-theme-tertiary/20 rounded-full skeleton-shimmer"
                              style={{ width: `${50 + Math.random() * 30}px` }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Skeleton para botões */}
                      <div className="flex items-center space-x-2 ml-6">
                        <div className="w-10 h-10 bg-theme-tertiary/20 rounded-xl skeleton-shimmer"></div>
                        <div className="w-10 h-10 bg-theme-tertiary/20 rounded-xl skeleton-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator sutil */}
              <div className="flex items-center justify-center py-4 opacity-70">
                <div className="flex items-center space-x-2 text-sm text-theme-secondary">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <span className="ml-2">Carregando obras...</span>
                </div>
              </div>
            </div>
          ) : works.length > 0 ? (
            <>
              <div
                className={`${
                  viewMode === 'cards'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4 content-transition'
                } `}
              >
                {works.map((work, index) => (
                  <Link
                    href={`/works/${work.id}`}
                    key={work.id}
                    className="classical-card-simple hover:shadow-theme-glow transition-all duration-300 group block opacity-0 animate-slide-up"
                    style={{
                      animationDelay: `${index * 0.03}s`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            {work.instrument?.name && (
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center text-theme-primary group-hover:scale-110 transition-transform duration-300">
                                {getInstrumentIcon(work.instrument.name)}
                              </div>
                            )}

                            <div className="flex-1">
                              <span className="text-lg font-semibold text-brand-primary group-hover:text-brand-secondary transition-colors duration-300 classical-title">
                                {work.title}
                              </span>

                              {work.opOrCatalog && (
                                <span className="ml-3 text-sm text-theme-tertiary bg-theme-elevated border border-theme-secondary px-3 py-1 rounded-full">
                                  {work.opOrCatalog}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className={`${
                              viewMode === 'cards'
                                ? 'flex flex-col'
                                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                            } gap-4 text-sm text-theme-secondary`}
                          >
                            {work.instrument?.name && (
                              <div className="flex items-center space-x-2">
                                <FiMusic className="w-4 h-4 text-theme-tertiary" />
                                <span>{work.instrument.name}</span>
                              </div>
                            )}

                            {work.tone && (
                              <div className="flex items-center space-x-2">
                                <GiMusicalNotes className="w-4 h-4 text-theme-tertiary" />
                                <span>{work.tone}</span>
                              </div>
                            )}

                            {work.mediaDuration && (
                              <div className="flex items-center space-x-2">
                                <FiClock className="w-4 h-4 text-theme-tertiary" />
                                <span>
                                  {formatDuration(work.mediaDuration)}
                                </span>
                              </div>
                            )}

                            {work.compositionYear && (
                              <div className="flex items-center space-x-2">
                                <FiCalendar className="w-4 h-4 text-theme-tertiary" />
                                <span>{work.compositionYear}</span>
                              </div>
                            )}
                          </div>

                          {/* Mostrar gêneros e categorias se existirem */}
                          {(work.workGenresArr?.length ||
                            work.categoryNames?.length) && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {work.workGenresArr?.slice(0, 3).map((genre) => (
                                <span
                                  key={genre}
                                  className="px-2 capitalize py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green text-xs rounded-full"
                                >
                                  {genre}
                                </span>
                              ))}
                              {work.categoryNames
                                ?.slice(0, 2)
                                .map((category) => (
                                  <span
                                    key={category}
                                    className="px-2 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs rounded-full"
                                  >
                                    {category}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>

                        <div
                          className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FavoriteButton
                            id={work.id}
                            type="work"
                            variant="default"
                            size="md"
                            itemName={work.title}
                            showToast={true}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Botão Carregar Mais */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-classical-primary flex items-center space-x-3 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-105 transition-all duration-300"
                  >
                    {loadingMore ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    )}
                    <span>
                      {loadingMore
                        ? 'Carregando...'
                        : `Carregar Mais Obras (${
                            totalCount - works.length
                          } restantes)`}
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            // Empty state para resultados filtrados
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-8 h-8 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
                Nenhuma obra encontrada
              </h3>
              <p className="text-theme-secondary mb-6">
                Tente ajustar os filtros de busca para encontrar mais
                resultados.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-classical-primary flex items-center space-x-2 mx-auto group"
                >
                  <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Limpar filtros</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
