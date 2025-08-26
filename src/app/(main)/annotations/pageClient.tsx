// app/annotations/AnnotationsPageClient.tsx - ATUALIZADO COM CARD/LIST LAYOUT
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiX,
  FiPlus,
  FiBarChart2,
} from 'react-icons/fi';

import { useAuth } from '@/app/hooks/useAuth';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../components/animation/AnimatedComponents';
import Select from '../../components/Common/Select';
import UserAnnotationCard from '../../components/Annotations/UserAnnotationCard';
import CreateAnnotationModal from '../../components/Annotations/CreateAnnotationModal';
import {
  useAnnotationsStore,
  AnnotationFilters,
} from '@/app/stores/useAnnotationsStore';
import Link from 'next/link';
import AnnotationsStatsWidget from '@/app/components/StatsWidget/AnnotationsStatsWidget';
import Modal from '../../components/Modal';
import { useAdaptiveStats } from '@/app/hooks/useMobile';
import {
  useAchievementDemo,
  useBackendAchievements,
} from '../../components/achievement/AchievementToast';
import { useAutoAchievementDetection } from '../../hooks/useAchievements';
import { calculateAnnotationsStats } from '../../components/badges/AnnotationsBadgeSystem';
import Button from '@/app/components/Common/Button';
import { useTranslation } from '@/app/hooks/useTranslation';

type AnnotationCategory =
  | 'TECHNIQUE'
  | 'INTERPRETATION'
  | 'THEORY'
  | 'PRACTICE_TIP'
  | 'PERFORMANCE'
  | 'HISTORICAL'
  | 'GENERAL';

type AnnotationDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'ALL_LEVELS';

type AnnotationScope =
  | 'SPECIFIC_MEASURE'
  | 'SECTION'
  | 'MOVEMENT'
  | 'ENTIRE_WORK';

type FilterTab = 'all' | 'public' | 'private' | 'verified';

// Hook customizado para debounce
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function AnnotationsPageClientContent() {
  // Translation hook
  const { t } = useTranslation({ sections: ['pages/annotations'] });

  // States
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    AnnotationCategory | 'all'
  >('all');
  const [difficultyFilter, setDifficultyFilter] = useState<
    AnnotationDifficulty | 'all'
  >('all');
  const [scopeFilter, setScopeFilter] = useState<AnnotationScope | 'all'>(
    'all'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user } = useAuth();

  // Achievement hooks
  const { detectChanges } = useAutoAchievementDetection();
  const { handleNewAchievement } = useBackendAchievements();
  const { triggerDemoAchievement } = useAchievementDemo();

  // Stats adaptativo
  const {
    isVisible: showStats,
    toggleVisibility: toggleStats,
    isMobile,
    showInline: showStatsInline,
    isModalOpen: isStatsModalOpen,
    closeModal: closeStatsModal,
  } = useAdaptiveStats('annotations');

  // Store
  const {
    userAnnotations: allUserAnnotations,
    fetchUserAnnotations,
    loading,
    setFilters,
    clearFilters,
  } = useAnnotationsStore();

  // Buscar anotações do usuário diretamente do estado
  const userAnnotations = useMemo(() => {
    if (!user?.id) return [];
    return allUserAnnotations[user.id] || [];
  }, [user?.id, allUserAnnotations]);

  const isLoading = loading.fetch.has('user-annotations');

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Auto-detectar achievements quando anotações mudarem
  useEffect(() => {
    if (mounted && userAnnotations.length > 0) {
      const stats = calculateAnnotationsStats(userAnnotations, []);
      detectChanges('annotations', stats);
    }
  }, [userAnnotations.length, mounted]);

  // Função de demonstração
  const handleDemoAchievement = () => {
    triggerDemoAchievement('LEGENDARY');
  };

  // Função para buscar anotações do usuário
  const fetchUserAnnotationsData = useCallback(async () => {
    if (!user?.id) return;

    const userFilters: AnnotationFilters = {
      userId: user.id,
      ...(categoryFilter !== 'all' && { category: categoryFilter }),
      ...(difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
      ...(scopeFilter !== 'all' && { scope: scopeFilter }),
      ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      sortBy: 'helpful',
    };

    setFilters(userFilters);
    await fetchUserAnnotations(user.id, userFilters);
  }, [
    user?.id,
    categoryFilter,
    difficultyFilter,
    scopeFilter,
    debouncedSearchQuery,
    setFilters,
    fetchUserAnnotations,
  ]);

  // Carregar dados na montagem e quando filtros mudarem
  useEffect(() => {
    if (mounted && user?.id) {
      fetchUserAnnotationsData();
    }
  }, [mounted, fetchUserAnnotationsData]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Escutar eventos personalizados de anotações
  useEffect(() => {
    if (!mounted || !user?.id) return;

    const handleAnnotationDeleted = (event: CustomEvent) => {
      console.log('Evento de anotação deletada detectado:', event.detail);
      if (event.detail.userId === user.id) {
        console.log(
          'Anotação do usuário atual deletada, UI deve ser atualizada automaticamente'
        );
      }
    };

    const handleAnnotationUpdated = (event: CustomEvent) => {
      console.log('Evento de anotação atualizada detectado:', event.detail);
      if (event.detail.userId === user.id) {
        console.log('Anotação do usuário atual atualizada');
      }
    };

    window.addEventListener(
      'annotationDeleted',
      handleAnnotationDeleted as EventListener
    );
    window.addEventListener(
      'annotationUpdated',
      handleAnnotationUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        'annotationDeleted',
        handleAnnotationDeleted as EventListener
      );
      window.removeEventListener(
        'annotationUpdated',
        handleAnnotationUpdated as EventListener
      );
    };
  }, [mounted, user?.id]);

  // Filtered annotations com base no tab ativo
  const filteredAnnotations = useMemo(() => {
    let filtered = [...userAnnotations];

    // Aplicar filtro de tab
    switch (activeTab) {
      case 'public':
        filtered = filtered.filter((annotation) => annotation.isPublic);
        break;
      case 'private':
        filtered = filtered.filter((annotation) => !annotation.isPublic);
        break;
      case 'verified':
        filtered = filtered.filter((annotation) => annotation.isVerified);
        break;
      case 'all':
      default:
        // Mostrar todas
        break;
    }

    return filtered;
  }, [userAnnotations, activeTab]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const totalAnnotations = userAnnotations.length;
    const publicAnnotations = userAnnotations.filter((a) => a.isPublic).length;
    const verifiedAnnotations = userAnnotations.filter(
      (a) => a.isVerified
    ).length;
    const privateAnnotations = totalAnnotations - publicAnnotations;

    const totalHelpfulVotes = userAnnotations.reduce(
      (sum, a) => sum + a.helpfulCount,
      0
    );
    const totalViews = userAnnotations.reduce((sum, a) => sum + a.viewCount, 0);

    const avgHelpfulVotes =
      totalAnnotations > 0 ? totalHelpfulVotes / totalAnnotations : 0;
    const avgViews = totalAnnotations > 0 ? totalViews / totalAnnotations : 0;

    const highPerformingCount = userAnnotations.filter(
      (annotation) => annotation.helpfulCount >= 5
    ).length;

    return {
      totalAnnotations,
      publicAnnotations,
      verifiedAnnotations,
      privateAnnotations,
      totalHelpfulVotes,
      totalViews,
      avgHelpfulVotes: Math.round(avgHelpfulVotes * 10) / 10,
      avgViews: Math.round(avgViews),
      highPerformingCount,
    };
  }, [userAnnotations]);

  // Category options with translations
  const CATEGORY_OPTIONS = [
    { value: 'all', label: t('category_all') },
    { value: 'TECHNIQUE', label: t('category_technique') },
    { value: 'INTERPRETATION', label: t('category_interpretation') },
    { value: 'PRACTICE_TIP', label: t('category_practice_tip') },
    { value: 'THEORY', label: t('category_theory') },
    { value: 'PERFORMANCE', label: t('category_performance') },
    { value: 'HISTORICAL', label: t('category_historical') },
    { value: 'GENERAL', label: t('category_general') },
  ];

  const DIFFICULTY_OPTIONS = [
    { value: 'all', label: t('difficulty_all') },
    { value: 'BEGINNER', label: t('difficulty_beginner') },
    { value: 'INTERMEDIATE', label: t('difficulty_intermediate') },
    { value: 'ADVANCED', label: t('difficulty_advanced') },
    { value: 'ALL_LEVELS', label: t('difficulty_all_levels') },
  ];

  const SCOPE_OPTIONS = [
    { value: 'all', label: t('scope_all') },
    { value: 'ENTIRE_WORK', label: t('scope_entire_work') },
    { value: 'MOVEMENT', label: t('scope_movement') },
    { value: 'SECTION', label: t('scope_section') },
    { value: 'SPECIFIC_MEASURE', label: t('scope_specific_measure') },
  ];

  // Filters check
  const hasActiveFilters = useMemo(() => {
    return (
      categoryFilter !== 'all' ||
      difficultyFilter !== 'all' ||
      scopeFilter !== 'all' ||
      debouncedSearchQuery !== ''
    );
  }, [categoryFilter, difficultyFilter, scopeFilter, debouncedSearchQuery]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setScopeFilter('all');
    clearFilters();
    if (user?.id) {
      fetchUserAnnotations(user.id, { userId: user.id, sortBy: 'helpful' });
    }
  }, [clearFilters, user?.id, fetchUserAnnotations]);

  // Calcular colunas do grid baseado nas stats
  const cardGridCols = showStatsInline ? 2 : 3;

  if (!mounted) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            <span className="text-theme-primary font-medium">
              Carregando...
            </span>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiMessageSquare className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('annotations_page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('annotations_page_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6">
            <div className="space-y-4">
              {/* Main Controls Row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Tabs */}
                <div className="flex bg-theme-secondary rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    {t('tab_all')} ({stats.totalAnnotations})
                  </button>
                  <button
                    onClick={() => setActiveTab('public')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'public'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    {t('tab_public')} ({stats.publicAnnotations})
                  </button>
                  <button
                    onClick={() => setActiveTab('private')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'private'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    {t('tab_private')} ({stats.privateAnnotations})
                  </button>
                  {stats.verifiedAnnotations > 0 && (
                    <button
                      onClick={() => setActiveTab('verified')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'verified'
                          ? 'bg-theme-tertiary text-theme-primary shadow-md'
                          : 'text-theme-tertiary hover:text-theme-primary'
                      }`}
                    >
                      {t('tab_verified')} ({stats.verifiedAnnotations})
                    </button>
                  )}
                </div>

                {/* Search, Filter Button, Stats Toggle, View Mode */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t('search_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-classical w-full sm:w-80"
                    />
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all font-medium ${
                      showFilters
                        ? 'bg-brand-primary text-theme-primary border-brand-primary shadow-md'
                        : hasActiveFilters
                        ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30 shadow-sm'
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
                              debouncedSearchQuery && t('filter_search'),
                              categoryFilter !== 'all' && t('filter_category'),
                              difficultyFilter !== 'all' &&
                                t('filter_difficulty'),
                              scopeFilter !== 'all' && t('filter_scope'),
                            ].filter(Boolean).length
                          }
                        </span>
                      )}
                    </span>
                  </button>

                  {/* Stats Toggle Button */}
                  <Button
                    variant="outline"
                    onClick={toggleStats}
                    leftIcon={<FiBarChart2 className="w-4 h-4" />}
                  >
                    <span className="text-sm">
                      {isMobile
                        ? t('stats_button_mobile')
                        : showStats
                        ? t('stats_button_hide')
                        : t('stats_button_show')}
                    </span>
                  </Button>

                  {/* View Mode Toggle */}
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>

              {/* Filtros Expandidos */}
              {showFilters && (
                <AnimatedItem direction="scale" springType="gentle">
                  <div className="bg-theme-secondary rounded-xl p-4 border border-theme-primary">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-theme-primary flex items-center space-x-2">
                        <FiFilter className="w-4 h-4" />
                        <span>{t('advanced_filters_title')}</span>
                      </h3>
                      <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="text-xs text-theme-tertiary hover:text-accent-red transition-colors px-2 py-1 rounded border border-theme-tertiary hover:border-accent-red"
                          >
                            {t('clear_all_filters')}
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category Filter */}
                      <div>
                        <label className="block text-xs font-medium text-theme-tertiary mb-2">
                          {t('category_label')}
                        </label>
                        <Select
                          options={CATEGORY_OPTIONS}
                          value={categoryFilter}
                          onChange={(e) =>
                            setCategoryFilter(
                              e.target.value as AnnotationCategory | 'all'
                            )
                          }
                          className="input-classical-2 w-full text-sm"
                        />
                      </div>

                      {/* Difficulty Filter */}
                      <div>
                        <label className="block text-xs font-medium text-theme-tertiary mb-2">
                          {t('difficulty_label')}
                        </label>
                        <Select
                          options={DIFFICULTY_OPTIONS}
                          value={difficultyFilter}
                          onChange={(e) =>
                            setDifficultyFilter(
                              e.target.value as AnnotationDifficulty | 'all'
                            )
                          }
                          className="input-classical-2 w-full text-sm"
                        />
                      </div>

                      {/* Scope Filter */}
                      <div>
                        <label className="block text-xs font-medium text-theme-tertiary mb-2">
                          {t('scope_label')}
                        </label>
                        <Select
                          options={SCOPE_OPTIONS}
                          value={scopeFilter}
                          onChange={(e) =>
                            setScopeFilter(
                              e.target.value as AnnotationScope | 'all'
                            )
                          }
                          className="input-classical-2 w-full text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              )}
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Content */}
        <div className="space-y-8 mt-8">
          {/* Main Content */}
          <AnimatedItem direction="up" springType="gentle">
            {isLoading && filteredAnnotations.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                    <div
                      className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
                      style={{
                        animationDirection: 'reverse',
                        animationDuration: '1.5s',
                      }}
                    ></div>
                  </div>
                  <span className="text-theme-primary font-medium">
                    {t('loading_annotations')}
                  </span>
                </div>
              </div>
            ) : filteredAnnotations.length === 0 ? (
              <AnimatedItem
                direction="scale"
                springType="bouncy"
                className="mt-8 classical-card"
              >
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-theme-secondary to-theme-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FiMessageSquare className="w-12 h-12 text-theme-tertiary" />
                  </div>
                  <h3 className="text-2xl font-bold text-theme-primary mb-4">
                    {debouncedSearchQuery || hasActiveFilters
                      ? t('no_annotations_found')
                      : stats.totalAnnotations === 0
                      ? t('no_annotations_yet')
                      : t('no_annotations_category')}
                  </h3>
                  <p className="text-theme-tertiary mb-8 max-w-md mx-auto">
                    {debouncedSearchQuery || hasActiveFilters
                      ? t('adjust_filters_search')
                      : stats.totalAnnotations === 0
                      ? t('create_first_annotation')
                      : t('adjust_filters_applied')}
                  </p>
                  {stats.totalAnnotations === 0 && (
                    <Link
                      href="/works"
                      className="btn-classical-primary flex w-max items-center space-x-2 mx-auto"
                    >
                      <span>{t('explore_works')}</span>
                      <FiPlus className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </AnimatedItem>
            ) : (
              <div
                className={`grid grid-cols-1 ${
                  showStatsInline ? 'lg:grid-cols-3' : 'lg:grid-cols-1'
                } gap-8`}
              >
                {/* Annotations List */}
                <div
                  className={
                    showStatsInline ? 'lg:col-span-2' : 'lg:col-span-3'
                  }
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                      <FiMessageSquare className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-theme-primary classical-title">
                        {t('your_annotations')}
                      </h2>
                      <p className="text-theme-tertiary">
                        {filteredAnnotations.length} {t('of')}{' '}
                        {stats.totalAnnotations} {t('annotations_count')}
                      </p>
                    </div>
                  </div>

                  {/* Annotations Grid/List */}
                  {viewMode === 'cards' ? (
                    <SequentialGrid
                      cols={cardGridCols}
                      gap={6}
                      delayBetweenItems={0.1}
                      className=""
                    >
                      {filteredAnnotations.map((annotation) => (
                        <UserAnnotationCard
                          key={annotation.id}
                          annotation={annotation}
                          viewMode={viewMode}
                        />
                      ))}
                    </SequentialGrid>
                  ) : (
                    <div className="space-y-4">
                      {filteredAnnotations.map((annotation, index) => (
                        <AnimatedItem
                          key={annotation.id}
                          direction="left"
                          hover="lift"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'backwards',
                          }}
                        >
                          <UserAnnotationCard
                            annotation={annotation}
                            viewMode={viewMode}
                          />
                        </AnimatedItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar com estatísticas - apenas desktop inline */}
                {showStatsInline && (
                  <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                      <AnnotationsStatsWidget />
                    </div>
                  </div>
                )}
              </div>
            )}
          </AnimatedItem>
        </div>
      </AnimatedContainer>

      {/* Stats Modal para Mobile */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={closeStatsModal}
        title={t('stats_modal_title')}
        maxWidth="xl"
      >
        <AnnotationsStatsWidget />
      </Modal>

      {/* Create Modal */}
      <CreateAnnotationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </PageContainer>
  );
}

// Wrapper principal com Achievement Provider
export default function AnnotationsPageClient() {
  return <AnnotationsPageClientContent />;
}
