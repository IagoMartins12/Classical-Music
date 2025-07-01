// components/Annotations/AnnotationsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiMessageSquare,
  FiPlus,
  FiFilter,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiAward,
  FiUsers,
  FiEye,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import {
  useAnnotationsStore,
  AnnotationCategory,
  AnnotationDifficulty,
  AnnotationScope,
} from '@/app/stores/useAnnotationsStore';
import { useAuth } from '@/app/hooks/useAuth';
import AnnotationCard from '../AnnotationCard';
import CreateAnnotationModal from '../CreateAnnotationModal';
import AnnotationFilters from '../AnnotationFilters';
import AnnotationStatsWidget from '../AnnotationStatsWidget';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  SequentialGrid,
} from '../../animation/AnimatedComponents';

interface AnnotationsSectionProps {
  workId: string;
  workTitle: string;
  composerName: string;
}

const CATEGORY_CONFIG = {
  TECHNIQUE: {
    label: 'Técnica',
    icon: FiTarget,
    color: 'from-accent-red to-accent-purple',
    description: 'Dedilhado, articulação, postura',
  },
  INTERPRETATION: {
    label: 'Interpretação',
    icon: GiMusicalNotes,
    color: 'from-accent-blue to-accent-purple',
    description: 'Dinâmica, fraseado, expressão',
  },
  PRACTICE_TIP: {
    label: 'Dicas de Estudo',
    icon: FiBookOpen,
    color: 'from-accent-green to-accent-blue',
    description: 'Métodos e estratégias de prática',
  },
  THEORY: {
    label: 'Teoria',
    icon: FiLayers,
    color: 'from-accent-purple to-accent-blue',
    description: 'Análise harmônica e formal',
  },
  PERFORMANCE: {
    label: 'Performance',
    icon: FiMusic,
    color: 'from-brand-primary to-brand-secondary',
    description: 'Apresentação e palco',
  },
  HISTORICAL: {
    label: 'Contexto',
    icon: FiAward,
    color: 'from-accent-purple to-accent-red',
    description: 'História e contexto cultural',
  },
  GENERAL: {
    label: 'Geral',
    icon: FiMessageSquare,
    color: 'from-theme-primary to-theme-secondary',
    description: 'Comentários gerais',
  },
};

export default function AnnotationsSection({
  workId,
  workTitle,
  composerName,
}: AnnotationsSectionProps) {
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    AnnotationCategory | 'ALL'
  >('ALL');

  const {
    getWorkAnnotations,
    getAnnotationStats,
    fetchWorkAnnotations,
    setFilters,
    filters,
    loading,
    pagination,
  } = useAnnotationsStore();

  const annotations = getWorkAnnotations(workId);
  const stats = getAnnotationStats(workId);
  const isLoading = loading.fetch.has(workId);
  const workPagination = pagination[workId];

  // Carregar anotações ao montar
  useEffect(() => {
    fetchWorkAnnotations(workId);
  }, [workId]);

  // Filtrar anotações localmente
  const filteredAnnotations = annotations.filter((annotation) => {
    if (activeCategory !== 'ALL' && annotation.category !== activeCategory) {
      return false;
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        annotation.title.toLowerCase().includes(search) ||
        annotation.content.toLowerCase().includes(search) ||
        annotation.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    return true;
  });

  const handleCategoryFilter = (category: AnnotationCategory | 'ALL') => {
    setActiveCategory(category);
    if (category === 'ALL') {
      setFilters({});
    } else {
      setFilters({ category });
    }
    fetchWorkAnnotations(workId, category === 'ALL' ? {} : { category });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setFilters({ search: term });
      fetchWorkAnnotations(workId, { search: term });
    } else {
      setFilters({});
      fetchWorkAnnotations(workId);
    }
  };

  const loadMoreAnnotations = () => {
    if (workPagination?.hasMore) {
      fetchWorkAnnotations(workId, filters, workPagination.page + 1);
    }
  };

  return (
    <AnimatedCard hover="none" className="classical-card overflow-hidden">
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <div className="border-b border-theme-secondary bg-gradient-to-r from-theme-primary to-theme-elevated">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
                  <FiMessageSquare className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-theme-primary classical-title">
                    Anotações da Comunidade
                  </h2>
                  <p className="text-theme-secondary classical-subtitle">
                    Compartilhe conhecimentos sobre interpretação e técnica
                  </p>
                </div>
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Nova Anotação</span>
                </button>
              )}
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-theme-elevated/50 border border-theme-primary/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-theme-primary">
                  {stats.total}
                </div>
                <div className="text-sm text-theme-tertiary">Total</div>
              </div>
              <div className="bg-theme-elevated/50 border border-theme-primary/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-green">
                  {stats.mostHelpful.length}
                </div>
                <div className="text-sm text-theme-tertiary">Mais Úteis</div>
              </div>
              <div className="bg-theme-elevated/50 border border-theme-primary/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-blue">
                  {stats.byCategory.TECHNIQUE}
                </div>
                <div className="text-sm text-theme-tertiary">Técnica</div>
              </div>
              <div className="bg-theme-elevated/50 border border-theme-primary/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-purple">
                  {stats.byCategory.INTERPRETATION}
                </div>
                <div className="text-sm text-theme-tertiary">Interpretação</div>
              </div>
            </div>

            {/* Barra de busca e filtros */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar anotações..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-theme-elevated border border-theme-primary/30 rounded-xl text-theme-primary placeholder-theme-tertiary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-classical-secondary flex items-center space-x-2 ${
                    showFilters
                      ? 'bg-brand-primary/10 border-brand-primary/50'
                      : ''
                  }`}
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filtros</span>
                </button>
              </div>

              {/* Filtros de categoria */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter('ALL')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === 'ALL'
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-theme-glow'
                      : 'bg-theme-elevated border border-theme-primary/30 text-theme-secondary hover:border-brand-primary/50'
                  }`}
                >
                  Todas ({stats.total})
                </button>

                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const category = key as AnnotationCategory;
                  const count = stats.byCategory[category];
                  const Icon = config.icon;

                  if (count === 0) return null;

                  return (
                    <AnimatedItem
                      key={category}
                      hover="scale"
                      springType="bouncy"
                    >
                      <button
                        onClick={() => handleCategoryFilter(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                          activeCategory === category
                            ? `bg-gradient-to-r ${config.color} text-theme-primary shadow-theme-glow`
                            : 'bg-theme-elevated border border-theme-primary/30 text-theme-secondary hover:border-brand-primary/50 hover:scale-105'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>
                          {config.label} ({count})
                        </span>
                      </button>
                    </AnimatedItem>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros avançados (expansível) */}
        {showFilters && (
          <AnimatedItem direction="down" springType="gentle">
            <AnnotationFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters);
                fetchWorkAnnotations(workId, newFilters);
              }}
              onClose={() => setShowFilters(false)}
            />
          </AnimatedItem>
        )}

        {/* Conteúdo */}
        <div className="p-6">
          {isLoading && annotations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
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
          ) : filteredAnnotations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de anotações (2/3 da largura) */}
              <div className="lg:col-span-2 space-y-6">
                <SequentialGrid
                  cols={1}
                  gap={4}
                  delayBetweenItems={0.1}
                  className="space-y-4"
                >
                  {filteredAnnotations.map((annotation) => (
                    <AnnotationCard
                      key={annotation.id}
                      annotation={annotation}
                      workTitle={workTitle}
                      composerName={composerName}
                    />
                  ))}
                </SequentialGrid>

                {/* Load more button */}
                {workPagination?.hasMore && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={loadMoreAnnotations}
                      disabled={isLoading}
                      className="btn-classical-secondary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Carregando...</span>
                        </>
                      ) : (
                        <>
                          <FiEye className="w-4 h-4" />
                          <span>Ver Mais Anotações</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar com estatísticas (1/3 da largura) */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  <AnnotationStatsWidget workId={workId} />

                  {/* Widget adicional: Top contribuidores ou dicas */}
                  {stats.total > 5 && (
                    <AnimatedCard hover="lift" className="classical-card-2">
                      <div className="p-6">
                        <h4 className="text-sm font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                          <FiUsers className="w-4 h-4" />
                          <span>Dica para Estudantes</span>
                        </h4>
                        <div className="space-y-3 text-sm text-theme-secondary">
                          <p>
                            💡{' '}
                            <strong>
                              Leia as anotações de técnica primeiro
                            </strong>{' '}
                            - elas te ajudarão com aspectos práticos.
                          </p>
                          <p>
                            🎵 <strong>Combine interpretação e teoria</strong> -
                            as duas se complementam.
                          </p>
                          <p>
                            👍 <strong>Vote nas anotações úteis</strong> - ajude
                            outros estudantes a encontrar o melhor conteúdo.
                          </p>
                        </div>
                      </div>
                    </AnimatedCard>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiMessageSquare className="w-8 h-8 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
                {searchTerm || activeCategory !== 'ALL'
                  ? 'Nenhuma anotação encontrada'
                  : 'Seja o primeiro a anotar!'}
              </h3>
              <p className="text-theme-secondary max-w-md mx-auto mb-6">
                {searchTerm || activeCategory !== 'ALL'
                  ? 'Tente ajustar os filtros ou termos de busca.'
                  : 'Compartilhe suas descobertas sobre técnica, interpretação e estudo desta obra.'}
              </p>
              {isAuthenticated && !searchTerm && activeCategory === 'ALL' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-classical-primary flex items-center space-x-2 mx-auto"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Criar Primeira Anotação</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de criação */}
        <CreateAnnotationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          workId={workId}
          workTitle={workTitle}
          composerName={composerName}
        />
      </AnimatedContainer>
    </AnimatedCard>
  );
}
