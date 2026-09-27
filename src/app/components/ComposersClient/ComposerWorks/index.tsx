// ComposerWorks.tsx - Com sistema de animações e traduções
'use client';

import {
  ComposerWork,
  ComposerFilterOptions,
  getComposerWorksWithFilters,
  getComposerWorkTypeCounts,
} from '@/app/requests/composer-details';
import Link from '@/app/components/LocalizedLink';
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  GiViolin,
  GiFlute,
  GiTrumpet,
  GiSaxophone,
  GiHarp,
  GiDrum,
  GiGrandPiano,
} from 'react-icons/gi';
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiClock,
  PiFunnel,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiPlaylist,
  PiPlus,
  PiSpinnerGap,
  PiStack,
  PiX,
} from 'react-icons/pi';
import FavoriteButton from '../../FavoriteButton';
import ViewModeToggle from '../../ViewModeToggle';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  SequentialGrid,
  SkeletonCard,
} from '../../animation/AnimatedComponents';
import VerificationBadge from '../../Verification/VerificationBadge';
import Select from '../../Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';
import {
  translateInstrument,
  translateGenre,
  getOriginalGenreName,
} from '@/app/utils/translations/instrumentsGenresTranslation';
import {
  getOriginalCategoryName,
  translateCategory,
} from '@/app/utils/translations/categoryTranslation';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

interface ComposerWorksProps {
  composerId: string;
  composerName: string;
  initialWorks: ComposerWork[];
  initialTotalCount: number;
  initialHasMore: boolean;
  filterOptions: ComposerFilterOptions;
}

// Mapeamento dos tipos de trabalho para chaves de tradução
const WORK_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_COMPOSITION: 'work_type_individual_composition',
  COMPLETE_WORK: 'work_type_complete_work',
  ARRANGEMENT: 'work_type_arrangement',
  COLLECTION_WORKS: 'work_type_collection_works',
  COLLABORATION: 'work_type_collaboration',
  COLLECTIONS_WITH: 'work_type_collections_with',
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

// Ordem específica das tabs
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
    return <PiMusicNotes className="w-5 h-5" />;
  if (
    instrument.includes('drum') ||
    instrument.includes('bateria') ||
    instrument.includes('percussão')
  )
    return <GiDrum className="w-5 h-5" />;
  if (instrument.includes('orchestra') || instrument.includes('orquestra'))
    return <PiMusicNotes className="w-5 h-5" />;

  return <PiMusicNotes className="w-5 h-5" />;
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
  const { t, language } = useTranslation({ sections: ['pages/composerId'] });

  // Função para traduzir opções de filtros
  const getTranslatedInstruments = () => {
    return filterOptions.instruments.map((instrument) => ({
      ...instrument,
      displayName: translateInstrument(instrument.name, language),
      originalName: instrument.name,
    }));
  };

  const getTranslatedGenres = () => {
    return filterOptions.workGenres.map((genre) => ({
      value: genre,
      displayName: translateGenre(genre, language),
      originalName: genre,
    }));
  };

  const getTranslatedCategories = () => {
    return filterOptions.categories.map((category) => ({
      value: category,
      displayName: translateCategory(category, language),
      originalName: category,
    }));
  };

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
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Buscar contagens reais dos workTypes
  useEffect(() => {
    const fetchWorkTypeCounts = async () => {
      try {
        const data = await getComposerWorkTypeCounts(composerId);
        setWorkTypeCounts(data.workTypeCounts || {});
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

  // Função para aplicar filtros (mantida igual, mas sem console.logs de debug)
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
        // Converter valores traduzidos para originais antes de enviar para API
        const filters = customFilters || {
          ...(selectedInstrument && { instrumentId: selectedInstrument }),
          ...(selectedGenre && {
            workGenresArr: getOriginalGenreName(selectedGenre, language),
          }),
          ...(selectedCategory && {
            categoryNames: getOriginalCategoryName(selectedCategory, language),
          }),
          ...(searchTerm && { search: searchTerm }),
        };

        // Tratar workType agrupado
        if (selectedWorkType !== 'all') {
          const workTypesToFilter = WORK_TYPE_GROUPS[selectedWorkType];
          if (workTypesToFilter && workTypesToFilter.length > 0) {
            const promises = workTypesToFilter.map((type) =>
              getComposerWorksWithFilters(composerId, 1, 1000, {
                ...filters,
                workType: type,
              })
            );

            const results = await Promise.all(promises);
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
            setHasMore(false);
            setCurrentPage(1);
            return;
          }
        }

        // Filtro normal
        const data = await getComposerWorksWithFilters(
          composerId,
          1,
          50,
          Object.keys(filters).length > 0 ? filters : undefined
        );
        setWorks(data.works);
        setTotalCount(data.totalCount);
        setHasMore(data.hasMore);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
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

  // Debounce para busca por texto
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
      if (selectedWorkType !== 'all' && WORK_TYPE_GROUPS[selectedWorkType]) {
        setLoadingMore(false);
        return;
      }

      const filters = {
        ...(selectedInstrument && { instrumentId: selectedInstrument }),
        ...(selectedGenre && {
          workGenresArr: getOriginalGenreName(selectedGenre, language),
        }),
        ...(selectedCategory && {
          categoryNames: getOriginalCategoryName(selectedCategory, language),
        }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedWorkType !== 'all' && { workType: selectedWorkType }),
      };

      const data = await getComposerWorksWithFilters(
        composerId,
        currentPage + 1,
        50,
        Object.keys(filters).length > 0 ? filters : undefined
      );
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

  const hasActiveFilters =
    searchTerm ||
    selectedInstrument ||
    selectedGenre ||
    selectedCategory ||
    selectedWorkType !== 'all';

  if (initialTotalCount === 0) {
    return (
      <AnimatedCard hover="lift" className="classical-card p-12">
        <AnimatedItem direction="up" springType="bouncy">
          <Inline gap={3} className="mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
              <PiBookOpen className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                {t('works_title')}
              </h2>
            </div>
          </Inline>
        </AnimatedItem>

        <AnimatedItem direction="scale" springType="gentle">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PiPlaylist className="w-8 h-8 text-theme-tertiary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
              {t('no_works_cataloged_title')}
            </h3>
            <p className="text-theme-secondary">
              {t('no_works_cataloged_text')}
            </p>
          </div>
        </AnimatedItem>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard hover="none" className="classical-card">
      <AnimatedContainer delay={0.1} staggerSpeed="fast">
        {/* Header */}
        <AnimatedItem
          direction="up"
          springType="smooth"
          className="p-0 pb-4 md:p-8 border-b border-theme-secondary"
        >
          <Inline gap={3} className="mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
              <PiBookOpen className="w-6 h-6 text-theme-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                {t('works_title')}
              </h2>
              <p className="text-theme-secondary classical-subtitle">
                {works.length} {t('works_count_text')} {totalCount}{' '}
                {t('works_by_composer')} {composerName}
              </p>
            </div>
          </Inline>

          {/* Tabs de WorkType */}
          {availableWorkTypes.length > 0 && (
            <Stack gap={3} className="mb-6">
              <Inline gap={2}>
                <PiStack className="w-4 h-4 text-theme-primary" />
                <Text papel="rotulo" tom="forte" className="font-medium">
                  {t('filter_by_work_type')}
                </Text>
              </Inline>

              <div className="flex flex-wrap gap-2">
                {/* Tab "Todos" */}
                <button
                  onClick={() => setSelectedWorkType('all')}
                  className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
                        ${
                          selectedWorkType === 'all'
                            ? 'text-theme-primary shadow-theme-medium border-2'
                            : 'text-theme-secondary'
                        }
                      `}
                  disabled={loading}
                >
                  {t('all_works')} ({initialTotalCount})
                </button>

                {/* Tabs dos workTypes disponíveis */}
                {availableWorkTypes.map((groupKey) => {
                  const groupCount = getGroupedCount(groupKey);
                  return (
                    <AnimatedItem
                      key={groupKey}
                      hover="scale"
                      springType="bouncy"
                    >
                      <button
                        onClick={() => setSelectedWorkType(groupKey)}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
                            ${
                              selectedWorkType === groupKey
                                ? 'text-theme-primary shadow-theme-medium border-2'
                                : 'text-theme-secondary'
                            }
                          `}
                        disabled={loading}
                      >
                        {t(WORK_TYPE_LABELS[groupKey])} ({groupCount})
                      </button>
                    </AnimatedItem>
                  );
                })}
              </div>
            </Stack>
          )}

          {/* Barra de busca */}
          <div className="relative mb-4">
            <PiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
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
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary transition-colors"
                disabled={loading}
              >
                <PiX className="w-5 h-5" />
                <NomeAcao acao="fechar" />
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
              <PiFunnel className="w-4 h-4" />
              <span>{showFilters ? t('hide_filters') : t('show_filters')}</span>
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

            <div className="hidden md:block">
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="overflow-hidden transition-all duration-500 max-h-96 opacity-100 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-sup-2">
                {/* Filtro de instrumento */}
                <Stack gap={2} className="gap-1">
                  <label className="text-sm font-medium text-theme-secondary">
                    {t('instrument_filter_label')} (
                    {filterOptions.instruments.length})
                  </label>
                  <div className="relative">
                    <Select
                      options={[
                        { label: t('all_instruments'), value: '' },
                        ...getTranslatedInstruments().map((instrument) => ({
                          label: instrument.displayName,
                          value: instrument.id,
                        })),
                      ]}
                      value={selectedInstrument}
                      onChange={(e) => setSelectedInstrument(e.target.value)}
                      className="w-full"
                      icone={PiMusicNotes}
                      disabled={loading}
                    />
                  </div>
                </Stack>

                {/* Filtro de gênero */}
                <Stack gap={2} className="gap-1">
                  <label className="text-sm font-medium text-theme-secondary">
                    {t('genre_filter_label')} ({filterOptions.workGenres.length}
                    )
                  </label>
                  <div className="relative">
                    <Select
                      options={[
                        { label: t('all_genres'), value: '' },
                        ...getTranslatedGenres().map((genre) => ({
                          label: genre.displayName,
                          value: genre.displayName, // Usar displayName como value para o select
                        })),
                      ]}
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="capitalize w-full"
                      icone={PiPlaylist}
                      disabled={loading}
                    />
                  </div>
                </Stack>

                {/* Filtro de categoria */}
                <Stack gap={2} className="gap-1">
                  <label className="text-sm font-medium text-theme-secondary">
                    {t('category_filter_label')} (
                    {filterOptions.categories.length})
                  </label>
                  <div className="relative">
                    <Select
                      options={[
                        { label: t('all_categories'), value: '' },
                        ...getTranslatedCategories().map((category) => ({
                          label: category.displayName,
                          value: category.displayName, // Usar displayName como value para o select
                        })),
                      ]}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full"
                      icone={PiBookOpen}
                      disabled={loading}
                    />
                  </div>
                </Stack>
              </div>
            </div>
          )}

          {/* Filtros ativos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <Text papel="rotulo" tom="suave" className="font-medium">
                {t('active_filters_label')}
              </Text>

              {searchTerm && (
                <Text
                  papel="rotulo"
                  tom="ouro"
                  as="div"
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-sup-2"
                >
                  <span>
                    {t('search_filter_prefix')} &quot;{searchTerm}&quot;
                  </span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="transition-colors"
                    disabled={loading}
                  >
                    <PiX className="w-3 h-3" />
                    <NomeAcao acao="fechar" />
                  </button>
                </Text>
              )}

              {selectedWorkType !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
                  <span>
                    {t('type_filter_prefix')}{' '}
                    {t(WORK_TYPE_LABELS[selectedWorkType])}
                  </span>
                  <button
                    onClick={() => setSelectedWorkType('all')}
                    className="transition-colors"
                    disabled={loading}
                  >
                    <PiX className="w-3 h-3" />
                    <NomeAcao acao="fechar" />
                  </button>
                </div>
              )}

              {selectedInstrument && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
                  <span>
                    {t('instrument_filter_prefix')}{' '}
                    {
                      getTranslatedInstruments().find(
                        (i) => i.id === selectedInstrument
                      )?.displayName
                    }
                  </span>
                  <button
                    onClick={() => setSelectedInstrument('')}
                    className="transition-colors"
                    disabled={loading}
                  >
                    <PiX className="w-3 h-3" />
                    <NomeAcao acao="fechar" />
                  </button>
                </div>
              )}

              {selectedGenre && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
                  <span>
                    {t('genre_filter_prefix')} {selectedGenre}
                  </span>
                  <button
                    onClick={() => setSelectedGenre('')}
                    className="transition-colors"
                    disabled={loading}
                  >
                    <PiX className="w-3 h-3" />
                    <NomeAcao acao="fechar" />
                  </button>
                </div>
              )}

              {selectedCategory && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-sup-2">
                  <span>
                    {t('category_filter_prefix')} {selectedCategory}
                  </span>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="transition-colors"
                    disabled={loading}
                  >
                    <PiX className="w-3 h-3" />
                    <NomeAcao acao="fechar" />
                  </button>
                </div>
              )}

              <button
                onClick={clearFilters}
                className="text-sm underline font-medium"
                disabled={loading}
              >
                {t('clear_all_filters')}
              </button>
            </div>
          )}
        </AnimatedItem>

        {/* Lista de obras */}
        <div className="p-0 pt-4 md:p-8">
          {loading ? (
            <AnimatedContainer delay={0.1} staggerSpeed="fast">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard
                  key={index}
                  lines={4}
                  showIcon={true}
                  showButton={true}
                  className="mb-4"
                />
              ))}

              {/* Loading indicator */}
              <AnimatedItem direction="scale" springType="gentle">
                <div className="flex items-center justify-center py-4 opacity-70">
                  <Inline gap={2} className="text-sm text-theme-secondary">
                    <div className="w-2 h-2 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <span className="ml-2">{t('loading')}...</span>
                  </Inline>
                </div>
              </AnimatedItem>
            </AnimatedContainer>
          ) : works.length > 0 ? (
            <>
              {viewMode === 'cards' ? (
                <SequentialGrid
                  cols={4}
                  gap={6}
                  delayBetweenItems={0.01}
                  classNameSub="flex items-stretch"
                >
                  {works.map((work) => (
                    <Link
                      href={`/works/${work.id}`}
                      key={work.id}
                      className="classical-card-simple w-full transition-all duration-300 group block"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 max-w-full">
                            <Inline gap={3} className="mb-4">
                              {work.instrument?.name && (
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-theme-primary group-hover:scale-110 transition-transform duration-300">
                                  {getInstrumentIcon(work.instrument.name)}
                                </div>
                              )}

                              <div className="flex-1 flex-wrap flex flex-col gap-2">
                                <span className="text-lg flex items-center gap-2 font-semibold text-ouro-texto transition-colors duration-300 classical-title">
                                  {work.title}
                                  <VerificationBadge
                                    verified={work.isVerified}
                                    variant="icon"
                                  />
                                </span>

                                {work.opOrCatalog && (
                                  <Text
                                    papel="rotulo"
                                    tom="fraco"
                                    className="!max-w-[15rem] bg-theme-elevated px-3 py-1 rounded-full"
                                  >
                                    {work.opOrCatalog}
                                  </Text>
                                )}
                              </div>
                            </Inline>

                            <Text
                              papel="rotulo"
                              tom="suave"
                              as="div"
                              className="flex flex-col gap-4"
                            >
                              {work.instrument?.name && (
                                <Inline gap={2}>
                                  <PiMusicNotes className="w-4 h-4 text-theme-tertiary" />
                                  <span>{work.instrument.name}</span>
                                </Inline>
                              )}

                              {work.tone && (
                                <Inline gap={2}>
                                  <PiMusicNotes className="w-4 h-4 text-theme-tertiary" />
                                  <span>{work.tone}</span>
                                </Inline>
                              )}

                              {work.mediaDuration && (
                                <Inline gap={2}>
                                  <PiClock className="w-4 h-4 text-theme-tertiary" />
                                  <span>
                                    {formatDuration(work.mediaDuration)}
                                  </span>
                                </Inline>
                              )}

                              {work.compositionYear && (
                                <Inline gap={2}>
                                  <PiCalendarBlank className="w-4 h-4 text-theme-tertiary" />
                                  <span>{work.compositionYear}</span>
                                </Inline>
                              )}
                            </Text>

                            {/* Gêneros e categorias */}
                            {(work.workGenresArr?.length ||
                              work.categoryNames?.length) && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {work.workGenresArr
                                  ?.slice(0, 3)
                                  .map((genre) => (
                                    <span
                                      key={genre}
                                      className="px-2 capitalize py-1 text-xs rounded-full bg-sup-2"
                                    >
                                      {translateGenre(genre, language)}
                                    </span>
                                  ))}
                                {work.categoryNames
                                  ?.slice(0, 2)
                                  .map((category) => (
                                    <span
                                      key={category}
                                      className="px-2 py-1 text-xs rounded-full bg-sup-2"
                                    >
                                      {translateCategory(category, language)}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div
                            className={`flex items-center space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300`}
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
                </SequentialGrid>
              ) : (
                <AnimatedContainer delay={0.1} staggerSpeed="fast">
                  {works.map((work) => (
                    <AnimatedItem key={work.id} direction="left" speed="fast">
                      <Link
                        href={`/works/${work.id}`}
                        className="classical-card-simple transition-all duration-300 group block mb-4"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Inline gap={3} className="mb-4">
                                {work.instrument?.name && (
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-theme-primary group-hover:scale-110 transition-transform duration-300">
                                    {getInstrumentIcon(work.instrument.name)}
                                  </div>
                                )}

                                <div className="flex-1 flex">
                                  <span className="text-lg flex items-center gap-2 font-semibold text-ouro-texto transition-colors duration-300 classical-title">
                                    {work.title}
                                    <VerificationBadge
                                      verified={work.isVerified}
                                      variant="icon"
                                    />
                                  </span>

                                  {work.opOrCatalog && (
                                    <Text
                                      papel="rotulo"
                                      tom="fraco"
                                      className="ml-3 bg-theme-elevated px-3 py-1 rounded-full"
                                    >
                                      {work.opOrCatalog}
                                    </Text>
                                  )}
                                </div>
                              </Inline>

                              <Text
                                papel="rotulo"
                                tom="suave"
                                as="div"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                              >
                                {work.instrument?.name && (
                                  <Inline gap={2}>
                                    <PiMusicNotes className="w-4 h-4 text-theme-tertiary" />
                                    <span>{work.instrument.name}</span>
                                  </Inline>
                                )}

                                {work.tone && (
                                  <Inline gap={2}>
                                    <PiMusicNotes className="w-4 h-4 text-theme-tertiary" />
                                    <span>{work.tone}</span>
                                  </Inline>
                                )}

                                {work.mediaDuration && (
                                  <Inline gap={2}>
                                    <PiClock className="w-4 h-4 text-theme-tertiary" />
                                    <span>
                                      {formatDuration(work.mediaDuration)}
                                    </span>
                                  </Inline>
                                )}

                                {work.compositionYear && (
                                  <Inline gap={2}>
                                    <PiCalendarBlank className="w-4 h-4 text-theme-tertiary" />
                                    <span>{work.compositionYear}</span>
                                  </Inline>
                                )}
                              </Text>

                              {/* Gêneros e categorias */}
                              {(work.workGenresArr?.length ||
                                work.categoryNames?.length) && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {work.workGenresArr
                                    ?.slice(0, 3)
                                    .map((genre) => (
                                      <span
                                        key={genre}
                                        className="px-2 capitalize py-1 text-xs rounded-full bg-sup-2"
                                      >
                                        {translateGenre(genre, language)}
                                      </span>
                                    ))}
                                  {work.categoryNames
                                    ?.slice(0, 2)
                                    .map((category) => (
                                      <span
                                        key={category}
                                        className="px-2 py-1 text-xs rounded-full bg-sup-2"
                                      >
                                        {translateCategory(category, language)}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>

                            <Inline
                              gap={2}
                              className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                            </Inline>
                          </div>
                        </div>
                      </Link>
                    </AnimatedItem>
                  ))}
                </AnimatedContainer>
              )}

              {/* Botão Carregar Mais */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Inline
                    as="button"
                    gap={3}
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-classical-primary px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-105 transition-all duration-300"
                  >
                    {loadingMore ? (
                      <PiSpinnerGap className="w-5 h-5 animate-spin" />
                    ) : (
                      <PiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    )}
                    <span>
                      {loadingMore
                        ? t('loading')
                        : `${t('load_more_works')} (${
                            totalCount - works.length
                          } ${t('remaining_works')})`}
                    </span>
                  </Inline>
                </div>
              )}
            </>
          ) : (
            // Empty state para resultados filtrados
            <AnimatedItem direction="scale" springType="gentle">
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <PiMagnifyingGlass className="w-8 h-8 text-theme-tertiary" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
                  {t('no_works_found_title')}
                </h3>
                <p className="text-theme-secondary mb-6">
                  {t('no_works_found_text')}
                </p>
                {hasActiveFilters && (
                  <AnimatedItem hover="scale" springType="bouncy">
                    <Inline
                      as="button"
                      gap={2}
                      onClick={clearFilters}
                      className="btn-classical-primary mx-auto group"
                    >
                      <PiArrowsClockwise className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>{t('clear_filters')}</span>
                    </Inline>
                  </AnimatedItem>
                )}
              </div>
            </AnimatedItem>
          )}
        </div>
      </AnimatedContainer>
    </AnimatedCard>
  );
}
