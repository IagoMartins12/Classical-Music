// app/annotations/AnnotationsPageClient.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiX,
  FiTarget,
  FiEye,
  FiThumbsUp,
  FiPlus,
} from 'react-icons/fi';

import { useAuth } from '@/app/hooks/useAuth';
import { UserAnnotation } from '@/app/requests/user-annotations';
import ViewModeToggle, { ViewMode } from '../ViewModeToggle';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '../animation/AnimatedComponents';
import AuthCheck from '../AuthCheck';
import { StatCard } from '../LearningPageClient/StatCard';
import Select from '../Common/Select';
import UserAnnotationCard from './UserAnnotationCard';
import AnnotationsStatsWidget from './AnnotationsStatsWidget';
import CreateAnnotationModal from './CreateAnnotationModal';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';

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

interface AnnotationsPageClientProps {
  initialData: {
    annotations: UserAnnotation[];
    totalAnnotations: number;
    publicAnnotations: number;
    verifiedAnnotations: number;
    totalHelpfulVotes: number;
    totalViews: number;
    stats: any;
    topAnnotations: any[];
    mostAnnotatedWorks: any[];
  };
}

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

const AnnotationsPageClient = ({ initialData }: AnnotationsPageClientProps) => {
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

  const [annotations, setAnnotations] = useState<UserAnnotation[]>(
    initialData.annotations
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isAuthenticated, user } = useAuth();

  const refreshAnnotations = async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/users/${user.id}/annotations`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data.annotations || []);

        console.log('🔄 Anotações atualizadas:', data.annotations?.length);
      }
    } catch (error) {
      console.error('Erro ao recarregar anotações:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 🔧 NOVO: Escutar mudanças do store para invalidar dados locais
  useEffect(() => {
    if (!mounted) return;

    // Escutar eventos customizados de mudança de anotações
    const handleAnnotationChange = () => {
      console.log('🔄 Detectada mudança em anotações, recarregando...');
      refreshAnnotations();
    };

    // Adicionar listeners
    window.addEventListener('annotationCreated', handleAnnotationChange);
    window.addEventListener('annotationUpdated', handleAnnotationChange);
    window.addEventListener('annotationDeleted', handleAnnotationChange);

    return () => {
      window.removeEventListener('annotationCreated', handleAnnotationChange);
      window.removeEventListener('annotationUpdated', handleAnnotationChange);
      window.removeEventListener('annotationDeleted', handleAnnotationChange);
    };
  }, [mounted, user?.id]);

  // 🔧 NOVO: Usar dados reativos ao invés dos iniciais
  const currentAnnotations =
    annotations.length > 0 ? annotations : initialData.annotations;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if has active filters
  const hasActiveFilters = useMemo(() => {
    return (
      categoryFilter !== 'all' ||
      difficultyFilter !== 'all' ||
      scopeFilter !== 'all' ||
      searchQuery !== ''
    );
  }, [categoryFilter, difficultyFilter, scopeFilter, searchQuery]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setScopeFilter('all');
  };

  // Filter and search logic
  const filteredAnnotations = useMemo(() => {
    let filtered = [...currentAnnotations];

    // Tab filter
    if (activeTab === 'public') {
      filtered = filtered.filter((annotation) => annotation.isPublic);
    } else if (activeTab === 'private') {
      filtered = filtered.filter((annotation) => !annotation.isPublic);
    } else if (activeTab === 'verified') {
      filtered = filtered.filter((annotation) => annotation.isVerified);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (annotation) =>
          annotation.title.toLowerCase().includes(query) ||
          annotation.content.toLowerCase().includes(query) ||
          annotation.work.title.toLowerCase().includes(query) ||
          annotation.work.composer.name.toLowerCase().includes(query) ||
          annotation.work.composer.fullName.toLowerCase().includes(query) ||
          annotation.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (annotation) => annotation.category === categoryFilter
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(
        (annotation) => annotation.difficulty === difficultyFilter
      );
    }

    if (scopeFilter !== 'all') {
      filtered = filtered.filter(
        (annotation) => annotation.scope === scopeFilter
      );
    }

    return filtered;
  }, [
    currentAnnotations,
    activeTab,
    searchQuery,
    categoryFilter,
    difficultyFilter,
    scopeFilter,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const totalAnnotations = currentAnnotations.length;
    const publicAnnotations = currentAnnotations.filter(
      (a) => a.isPublic
    ).length;
    const verifiedAnnotations = currentAnnotations.filter(
      (a) => a.isVerified
    ).length;
    const privateAnnotations = totalAnnotations - publicAnnotations;

    const totalHelpfulVotes = currentAnnotations.reduce(
      (sum, a) => sum + a.helpfulCount,
      0
    );
    const totalViews = currentAnnotations.reduce(
      (sum, a) => sum + a.viewCount,
      0
    );

    const avgHelpfulVotes =
      totalAnnotations > 0 ? totalHelpfulVotes / totalAnnotations : 0;
    const avgViews = totalAnnotations > 0 ? totalViews / totalAnnotations : 0;

    const highPerformingCount = currentAnnotations.filter(
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
  }, [currentAnnotations]);

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

        {/* Statistics Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FiMessageSquare className="w-6 h-6 text-theme-primary" />}
              title="Total de Anotações"
              value={stats.totalAnnotations}
              color="brand"
            />

            <StatCard
              icon={<FiEye className="w-6 h-6 text-theme-primary" />}
              title="Anotações Públicas"
              value={stats.publicAnnotations}
              subtitle={
                stats.verifiedAnnotations > 0
                  ? `${stats.verifiedAnnotations} verificadas`
                  : undefined
              }
              color="blue"
            />

            <StatCard
              icon={<FiThumbsUp className="w-6 h-6 text-theme-primary" />}
              title="Votos Úteis"
              value={stats.totalHelpfulVotes}
              subtitle={`Média: ${stats.avgHelpfulVotes}/anotação`}
              color="green"
            />

            <StatCard
              icon={<FiTarget className="w-6 h-6 text-theme-primary" />}
              title="Visualizações"
              value={stats.totalViews}
              subtitle={`Média: ${stats.avgViews}/anotação`}
              color="purple"
            />
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

                {/* Search, Filter Button, Create Button and View Mode */}
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
                              searchQuery && 'busca',
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
                            onClick={clearFilters}
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
            {filteredAnnotations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiMessageSquare className="w-8 h-8 text-theme-tertiary" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
                  {searchQuery || hasActiveFilters
                    ? 'Nenhuma anotação encontrada'
                    : stats.totalAnnotations === 0
                    ? 'Você ainda não fez anotações'
                    : 'Nenhuma anotação nesta categoria'}
                </h3>
                <p className="text-theme-secondary max-w-md mx-auto mb-6">
                  {searchQuery || hasActiveFilters
                    ? 'Tente ajustar os filtros ou termos de busca.'
                    : stats.totalAnnotations === 0
                    ? 'Comece criando sua primeira anotação musical e compartilhe seu conhecimento!'
                    : 'Tente ajustar os filtros aplicados.'}
                </p>
                {stats.totalAnnotations === 0 && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-classical-primary flex items-center space-x-2 mx-auto"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Criar Primeira Anotação</span>
                  </button>
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

                  {viewMode === 'cards' ? (
                    <div className="space-y-4">
                      {filteredAnnotations.map((annotation) => (
                        <UserAnnotationCard
                          key={annotation.id}
                          annotation={annotation}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
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

                {/* Sidebar com estatísticas (1/3 da largura) */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6 space-y-6">
                    <AnnotationsStatsWidget
                      stats={initialData.stats}
                      topAnnotations={initialData.topAnnotations}
                      mostAnnotatedWorks={initialData.mostAnnotatedWorks}
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
        workId=""
        workTitle=""
        composerName=""
      />
    </PageContainer>
  );
};

export default AnnotationsPageClient;
