// app/annotations/AnnotationsPageClient.tsx - VERSÃO CORRIGIDA
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiX,
  FiPlus,
} from 'react-icons/fi';

import { useAuth } from '@/app/hooks/useAuth';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '../animation/AnimatedComponents';
import AuthCheck from '../AuthCheck';
import Select from '../Common/Select';
import UserAnnotationCard from './UserAnnotationCard';
import AnnotationsStatsWidget from './AnnotationsStatsWidget';
import CreateAnnotationModal from './CreateAnnotationModal';
import {
  useAnnotationsStore,
  AnnotationFilters,
} from '@/app/stores/useAnnotationsStore';
import Link from 'next/link';

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

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'TECHNIQUE', label: 'Técnica' },
  { value: 'INTERPRETATION', label: 'Interpretação' },
  { value: 'PRACTICE_TIP', label: 'Dicas de Estudo' },
  { value: 'THEORY', label: 'Teoria' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'HISTORICAL', label: 'Contexto Histórico' },
  { value: 'GENERAL', label: 'Geral' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Todas as dificuldades' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
  { value: 'ALL_LEVELS', label: 'Todos os níveis' },
];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'Todas as abrangências' },
  { value: 'ENTIRE_WORK', label: 'Obra inteira' },
  { value: 'MOVEMENT', label: 'Movimento' },
  { value: 'SECTION', label: 'Seção' },
  { value: 'SPECIFIC_MEASURE', label: 'Compasso específico' },
];

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

const AnnotationsPageClient = () => {
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

  const { isAuthenticated, user } = useAuth();

  // 🔧 CORREÇÃO PRINCIPAL: Acessar o estado diretamente da store
  const {
    userAnnotations: allUserAnnotations, // Estado direto da store
    fetchUserAnnotations,
    loading,
    filters,
    setFilters,
    clearFilters,
  } = useAnnotationsStore();

  // 🔧 CORREÇÃO: Buscar anotações do usuário diretamente do estado
  const userAnnotations = useMemo(() => {
    if (!user?.id) return [];
    return allUserAnnotations[user.id] || [];
  }, [user?.id, allUserAnnotations]);

  const isLoading = loading.fetch.has('user-annotations');

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  // 🔧 MELHORIA: Escutar eventos personalizados de anotações
  useEffect(() => {
    if (!mounted || !user?.id) return;

    const handleAnnotationDeleted = (event: CustomEvent) => {
      console.log('🔄 Evento de anotação deletada detectado:', event.detail);
      // A store já foi atualizada, mas força uma verificação
      if (event.detail.userId === user.id) {
        // Opcional: re-fetch se necessário
        console.log(
          '🔄 Anotação do usuário atual deletada, UI deve ser atualizada automaticamente'
        );
      }
    };

    const handleAnnotationUpdated = (event: CustomEvent) => {
      console.log('🔄 Evento de anotação atualizada detectado:', event.detail);
      if (event.detail.userId === user.id) {
        console.log('🔄 Anotação do usuário atual atualizada');
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

  // Estatísticas para o widget
  const widgetStats = useMemo(() => {
    const categoryDistribution = CATEGORY_OPTIONS.slice(1)
      .map((option) => {
        const count = userAnnotations.filter(
          (a) => a.category === option.value
        ).length;
        return {
          category: option.value,
          _count: { category: count },
        };
      })
      .filter((item) => item._count.category > 0);

    return {
      categoryDistribution,
      difficultyDistribution: [],
      scopeDistribution: [],
      recentAnnotations: userAnnotations.filter((a) => {
        const createdDate = new Date(a.createdAt);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdDate >= thirtyDaysAgo;
      }).length,
    };
  }, [userAnnotations]);

  // Top anotações para o widget
  const topAnnotations = useMemo(() => {
    return [...userAnnotations]
      .sort((a, b) => b.helpfulCount - a.helpfulCount)
      .slice(0, 5);
  }, [userAnnotations]);

  // Obras mais anotadas para o widget
  const mostAnnotatedWorks = useMemo(() => {
    const worksMap = new Map();

    userAnnotations.forEach((annotation) => {
      const workId = annotation.workId;
      if (!worksMap.has(workId)) {
        worksMap.set(workId, {
          id: workId,
          title: annotation.work?.title,
          composer: annotation.work?.composer,
          opOrCatalog: annotation.work?.opOrCatalog,
          annotationsCount: 0,
        });
      }
      worksMap.get(workId).annotationsCount++;
    });

    return Array.from(worksMap.values())
      .sort((a, b) => b.annotationsCount - a.annotationsCount)
      .slice(0, 5);
  }, [userAnnotations]);

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

  if (!isAuthenticated) {
    return <AuthCheck title="Suas anotações musicais" />;
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
              Minhas Anotações Musicais
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Organize e compartilhe seu conhecimento musical
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
                    Todas ({stats.totalAnnotations})
                  </button>
                  <button
                    onClick={() => setActiveTab('public')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'public'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Públicas ({stats.publicAnnotations})
                  </button>
                  <button
                    onClick={() => setActiveTab('private')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'private'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Privadas ({stats.privateAnnotations})
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
                      Verificadas ({stats.verifiedAnnotations})
                    </button>
                  )}
                </div>

                {/* Search, Filter Button, View Mode */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar anotações, obras ou compositores..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-classical w-full sm:w-96"
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
                      Filtros
                      {hasActiveFilters && (
                        <span className="ml-1 px-1.5 py-0.5 bg-accent-blue text-white text-xs rounded-full">
                          {
                            [
                              debouncedSearchQuery && 'busca',
                              categoryFilter !== 'all' && 'categoria',
                              difficultyFilter !== 'all' && 'dificuldade',
                              scopeFilter !== 'all' && 'abrangência',
                            ].filter(Boolean).length
                          }
                        </span>
                      )}
                    </span>
                  </button>

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
                        <span>Filtros Avançados</span>
                      </h3>
                      <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="text-xs text-theme-tertiary hover:text-accent-red transition-colors px-2 py-1 rounded border border-theme-tertiary hover:border-accent-red"
                          >
                            Limpar tudo
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
                          Categoria
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
                          Dificuldade
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
                          Abrangência
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
                    Carregando anotações...
                  </span>
                </div>
              </div>
            ) : filteredAnnotations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiMessageSquare className="w-8 h-8 text-theme-tertiary" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
                  {debouncedSearchQuery || hasActiveFilters
                    ? 'Nenhuma anotação encontrada'
                    : stats.totalAnnotations === 0
                    ? 'Você ainda não fez anotações'
                    : 'Nenhuma anotação nesta categoria'}
                </h3>
                <p className="text-theme-secondary max-w-md mx-auto mb-6">
                  {debouncedSearchQuery || hasActiveFilters
                    ? 'Tente ajustar os filtros ou termos de busca.'
                    : stats.totalAnnotations === 0
                    ? 'Comece criando sua primeira anotação musical e compartilhe seu conhecimento!'
                    : 'Tente ajustar os filtros aplicados.'}
                </p>
                {stats.totalAnnotations === 0 && (
                  <Link
                    href="/works"
                    className="btn-classical-primary flex w-max items-center space-x-2 mx-auto"
                  >
                    <span>Explorar Obras</span>
                    <FiPlus className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Annotations List (2/3 da largura) */}
                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                      <FiMessageSquare className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-theme-primary classical-title">
                        Suas Anotações
                      </h2>
                      <p className="text-theme-tertiary">
                        {filteredAnnotations.length} de {stats.totalAnnotations}{' '}
                        anotações
                      </p>
                    </div>
                  </div>

                  <div
                    className={viewMode === 'cards' ? 'space-y-4' : 'space-y-4'}
                  >
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
                </div>

                {/* Sidebar com estatísticas (1/3 da largura) */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6 space-y-6">
                    <AnnotationsStatsWidget
                      stats={widgetStats}
                      topAnnotations={topAnnotations}
                      mostAnnotatedWorks={mostAnnotatedWorks}
                    />
                  </div>
                </div>
              </div>
            )}
          </AnimatedItem>
        </div>
      </AnimatedContainer>

      {/* Create Modal */}
      <CreateAnnotationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </PageContainer>
  );
};

export default AnnotationsPageClient;
