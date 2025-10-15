// components/Annotations/AnnotationsSection.tsx - COM TRADUÇÕES COMPLETAS
'use client';

import { useState, useEffect } from 'react';
import {
  FiMessageSquare,
  FiPlus,
  FiFilter,
  FiSearch,
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiAward,
  FiEye,
  FiX,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import {
  useAnnotationsStore,
  AnnotationCategory,
  AnnotationFilters,
} from '@/app/stores/useAnnotationsStore';
import { useAuth } from '@/app/hooks/useAuth';
import AnnotationCard from '../AnnotationCard';
import CreateAnnotationModal from '../CreateAnnotationModal';
import AnnotationFiltersComponent from '../AnnotationFilters';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import toast from 'react-hot-toast';
import { useLoginModal } from '@/app/stores/authStore';
import Input from '../../Common/Inputs';
import { useTranslation } from '@/app/context/TranslationContext';

interface AnnotationsSectionProps {
  workId: string;
  workTitle: string;
  composerName: string;
}

export default function AnnotationsSection({
  workId,
  workTitle,
  composerName,
}: AnnotationsSectionProps) {
  const { t } = useTranslation({ sections: ['pages/workId'] });
  const { isAuthenticated, user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Estado local para filtros da comunidade - separado da store global
  const [communityFilters, setCommunityFilters] = useState<AnnotationFilters>({
    sortBy: 'helpful',
  });

  const { open } = useLoginModal();
  const {
    getWorkAnnotations,
    getAnnotationStats,
    fetchWorkAnnotations,
    loading,
    pagination,
  } = useAnnotationsStore();

  const isLoading = loading.fetch.has(workId);
  const workPagination = pagination[workId];

  const allAnnotations = getWorkAnnotations(workId);
  const totalStats = getAnnotationStats(workId);

  // ✅ Configuração das categorias COM TRADUÇÕES
  const CATEGORY_CONFIG = {
    TECHNIQUE: {
      label: t('annotations_categoria_tecnica'),
      icon: FiTarget,
      color: 'from-accent-red to-accent-purple',
      description: t('annotations_categoria_tecnica_desc'),
    },
    INTERPRETATION: {
      label: t('annotations_categoria_interpretacao'),
      icon: GiMusicalNotes,
      color: 'from-accent-blue to-accent-purple',
      description: t('annotations_categoria_interpretacao_desc'),
    },
    PRACTICE_TIP: {
      label: t('annotations_categoria_dicas_estudo'),
      icon: FiBookOpen,
      color: 'from-accent-green to-accent-blue',
      description: t('annotations_categoria_dicas_estudo_desc'),
    },
    THEORY: {
      label: t('annotations_categoria_teoria'),
      icon: FiLayers,
      color: 'from-accent-purple to-accent-blue',
      description: t('annotations_categoria_teoria_desc'),
    },
    PERFORMANCE: {
      label: t('annotations_categoria_performance'),
      icon: FiMusic,
      color: 'from-brand-primary to-brand-secondary',
      description: t('annotations_categoria_performance_desc'),
    },
    HISTORICAL: {
      label: t('annotations_categoria_contexto'),
      icon: FiAward,
      color: 'from-accent-purple to-accent-red',
      description: t('annotations_categoria_contexto_desc'),
    },
    GENERAL: {
      label: t('annotations_categoria_geral'),
      icon: FiMessageSquare,
      color: 'from-theme-primary to-theme-secondary',
      description: t('annotations_categoria_geral_desc'),
    },
  };

  // Verificar filtros avançados sem incluir userId
  const hasAdvancedFilters =
    communityFilters.difficulty ||
    communityFilters.scope ||
    communityFilters.search;

  // Inicialização limpa - sempre sem userId
  useEffect(() => {
    console.log(
      '🧹 [AnnotationsSection] Montando componente para workId:',
      workId
    );

    // Fazer fetch inicial sempre sem userId para mostrar anotações da comunidade
    const initialFilters: AnnotationFilters = {
      sortBy: 'helpful',
    };

    setCommunityFilters(initialFilters);
    fetchWorkAnnotations(workId, initialFilters);

    console.log(
      '✅ [AnnotationsSection] Fetch inicial executado com filtros da comunidade'
    );
  }, [workId, fetchWorkAnnotations]);

  // Filtrar anotações localmente apenas se não há filtros avançados
  const displayedAnnotations = hasAdvancedFilters
    ? allAnnotations
    : allAnnotations.filter((annotation) => {
        // Filtro de categoria local
        if (
          communityFilters.category &&
          annotation.category !== communityFilters.category
        ) {
          return false;
        }

        // Mostrar apenas anotações públicas ou do próprio usuário
        if (!annotation.isPublic && annotation.userId !== user?.id) {
          return false;
        }

        // Filtro de busca local
        if (localSearchTerm) {
          const search = localSearchTerm.toLowerCase();
          return (
            annotation.title.toLowerCase().includes(search) ||
            annotation.content.toLowerCase().includes(search) ||
            annotation.tags.some((tag) => tag.toLowerCase().includes(search))
          );
        }

        return true;
      });

  // Handler para filtro de categoria - sem userId
  const handleCategoryFilter = (category: AnnotationCategory | 'ALL') => {
    let newFilters: AnnotationFilters;

    if (category === 'ALL') {
      // Limpar apenas o filtro de categoria, manter outros filtros (exceto userId)
      newFilters = {
        ...communityFilters,
        category: undefined,
      };
    } else {
      // Setar filtro de categoria (sem userId)
      newFilters = {
        ...communityFilters,
        category,
      };
    }

    // NUNCA incluir userId nos filtros da comunidade
    delete (newFilters as any).userId;

    setCommunityFilters(newFilters);
    fetchWorkAnnotations(workId, newFilters);

    console.log(
      '🔧 [AnnotationsSection] Filtro de categoria aplicado:',
      newFilters
    );
  };

  // Busca local (não vai para servidor a menos que seja via filtros avançados)
  const handleLocalSearch = (term: string) => {
    setLocalSearchTerm(term);
  };

  // Handler para filtros avançados - garantir que não há userId
  const handleAdvancedFiltersChange = (newFilters: AnnotationFilters) => {
    console.log(
      '🔧 [AnnotationsSection] Aplicando filtros avançados:',
      newFilters
    );

    // GARANTIR que userId seja removido dos filtros da comunidade
    const cleanFilters = { ...newFilters };
    delete (cleanFilters as any).userId;

    // Limpar busca local quando filtros avançados são aplicados
    if (cleanFilters.search) {
      setLocalSearchTerm('');
    }

    setCommunityFilters(cleanFilters);
    fetchWorkAnnotations(workId, cleanFilters);

    console.log(
      '✅ [AnnotationsSection] Filtros limpos aplicados:',
      cleanFilters
    );
  };

  // Limpar todos os filtros da comunidade
  const handleClearAllFilters = () => {
    console.log('🧹 [AnnotationsSection] Limpando todos os filtros');

    setLocalSearchTerm('');

    const cleanFilters: AnnotationFilters = {
      sortBy: 'helpful',
    };

    setCommunityFilters(cleanFilters);
    fetchWorkAnnotations(workId, cleanFilters);

    console.log('✅ [AnnotationsSection] Filtros limpos e fetch executado');
  };

  const loadMoreAnnotations = () => {
    if (workPagination?.hasMore) {
      // Usar filtros da comunidade (sem userId)
      fetchWorkAnnotations(workId, communityFilters, workPagination.page + 1);
    }
  };

  // Verificar se há filtros ativos (sem contar userId)
  const hasAnyFilters =
    communityFilters.category ||
    communityFilters.difficulty ||
    communityFilters.scope ||
    communityFilters.search ||
    localSearchTerm;

  return (
    <AnimatedCard hover="none" className="classical-card overflow-hidden">
      <AnimatedContainer delay={0.1} staggerSpeed="fast">
        {/* Header */}
        <div className="border-b border-theme-secondary bg-gradient-to-r from-theme-primary to-theme-elevated">
          <div className="p-2 md:p-6">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
                  <FiMessageSquare className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-theme-primary classical-title">
                    {t('annotations_titulo')}
                  </h2>
                  <p className="text-theme-secondary text-md md:text-lg classical-subtitle">
                    {t('annotations_subtitulo')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error(t('annotations_login_required'));
                    open();
                    return;
                  }
                  setShowCreateModal(true);
                }}
                className="btn-classical-primary hidden md:flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>{t('annotations_nova_anotacao')}</span>
              </button>
            </div>

            {/* ✅ Barra de busca e filtros COM TRADUÇÕES */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error(t('annotations_login_required'));
                    open();
                    return;
                  }
                  setShowCreateModal(true);
                }}
                className="btn-classical-primary w-full text-center justify-center flex md:hidden items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>{t('annotations_nova_anotacao')}</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={
                      hasAdvancedFilters
                        ? t('annotations_busca_filtros_avancados')
                        : t('annotations_buscar')
                    }
                    value={localSearchTerm}
                    leftIcon={<FiSearch />}
                    onChange={(e) => handleLocalSearch(e.target.value)}
                    disabled={hasAdvancedFilters ? true : false}
                    className={`w-full pl-10 pr-4 py-3 bg-theme-elevated border border-theme-primary/30 rounded-xl text-theme-primary placeholder-theme-tertiary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all ${
                      hasAdvancedFilters ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {hasAdvancedFilters && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-lg">
                        {t('annotations_filtros_ativos')}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-classical-secondary flex items-center space-x-2 ${
                    showFilters || hasAdvancedFilters
                      ? 'bg-brand-primary/10 border-brand-primary/50'
                      : ''
                  }`}
                >
                  <FiFilter className="w-4 h-4" />
                  <span>{t('annotations_filtros_avancados')}</span>
                  {hasAdvancedFilters && (
                    <span className="bg-brand-primary text-theme-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {
                        Object.entries(communityFilters).filter(
                          ([key, value]) =>
                            key !== 'sortBy' && // Não contar sortBy padrão
                            typeof value === 'string' &&
                            value !== '' &&
                            value !== 'helpful'
                        ).length
                      }
                    </span>
                  )}
                </button>
              </div>

              {/* Filtros de categoria sempre visíveis */}
              <div className="flex flex-wrap gap-2">
                {/* Botão "Todas" */}
                <button
                  onClick={() => handleCategoryFilter('ALL')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    !communityFilters.category
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-theme-glow'
                      : 'bg-theme-elevated border border-theme-primary/30 text-theme-secondary hover:border-brand-primary/50'
                  }`}
                >
                  {t('annotations_todas')} (
                  {hasAnyFilters ? totalStats.total : allAnnotations.length})
                </button>

                {/* Categorias baseadas no totalStats */}
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const category = key as AnnotationCategory;
                  const count = totalStats.byCategory[category];
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
                        disabled={count === 0}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                          communityFilters.category === category && count > 0
                            ? `bg-gradient-to-r ${config?.color} text-theme-primary shadow-theme-glow`
                            : count === 0
                              ? 'bg-theme-elevated border border-theme-primary/20 text-theme-tertiary opacity-50 cursor-not-allowed'
                              : 'bg-theme-elevated border border-theme-primary/30 text-theme-secondary hover:border-brand-primary/50 hover:scale-105'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>
                          {config?.label} ({count})
                        </span>
                      </button>
                    </AnimatedItem>
                  );
                })}
              </div>

              {/* ✅ Status de filtros COM TRADUÇÕES */}
              {hasAnyFilters && (
                <div className="flex items-center justify-between bg-theme-elevated/50 classical-card-simple rounded-xl px-4 py-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <FiFilter className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-theme-primary">
                      {t('annotations_filtros_ativos')}:
                    </span>

                    <div className="flex items-center space-x-1">
                      {communityFilters.category && (
                        <span className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-xs">
                          {CATEGORY_CONFIG[communityFilters.category].label}
                        </span>
                      )}
                      {communityFilters.difficulty && (
                        <span className="bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-lg text-xs">
                          {/* ✅ Traduzir dificuldade */}
                          {communityFilters.difficulty === 'BEGINNER' &&
                            t('annotation_difficulty_iniciante')}
                          {communityFilters.difficulty === 'INTERMEDIATE' &&
                            t('annotation_difficulty_intermediario')}
                          {communityFilters.difficulty === 'ADVANCED' &&
                            t('annotation_difficulty_avancado')}
                          {communityFilters.difficulty === 'ALL_LEVELS' &&
                            t('annotation_difficulty_todos_niveis')}
                        </span>
                      )}
                      {communityFilters.scope && (
                        <span className="bg-accent-green/10 text-accent-green px-2 py-1 rounded-lg text-xs">
                          {/* ✅ Traduzir abrangência */}
                          {communityFilters.scope === 'ENTIRE_WORK' &&
                            t('annotation_scope_obra_inteira')}
                          {communityFilters.scope === 'MOVEMENT' &&
                            t('annotation_scope_movimento')}
                          {communityFilters.scope === 'SECTION' &&
                            t('annotation_scope_secao')}
                          {communityFilters.scope === 'SPECIFIC_MEASURE' &&
                            t('annotation_scope_compasso_especifico')}
                        </span>
                      )}
                      {communityFilters.search && (
                        <span className="bg-accent-purple/10 text-accent-purple px-2 py-1 rounded-lg text-xs">
                          &quot;{communityFilters.search}&quot;
                        </span>
                      )}
                      {localSearchTerm && (
                        <span className="bg-accent-red/10 text-accent-red px-2 py-1 rounded-lg text-xs">
                          {t('annotations_busca_label')} &quot;{localSearchTerm}
                          &quot;
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleClearAllFilters}
                    className="text-accent-red hover:text-accent-red/80 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                    <span>{t('annotations_limpar_todos')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtros avançados (expansível) */}
        {showFilters && (
          <AnimatedItem direction="down" springType="gentle">
            <AnnotationFiltersComponent
              filters={communityFilters}
              onFiltersChange={handleAdvancedFiltersChange}
              onClose={() => setShowFilters(false)}
              clearFilters={handleClearAllFilters}
            />
          </AnimatedItem>
        )}

        {/* Conteúdo */}
        <div className="p-2 md:p-6">
          {isLoading && displayedAnnotations.length === 0 ? (
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
                  {t('annotations_carregando')}
                </span>
              </div>
            </div>
          ) : displayedAnnotations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de anotações (3/3 da largura) */}
              <div className="lg:col-span-3 space-y-6">
                {displayedAnnotations.map((annotation) => (
                  <AnnotationCard
                    key={annotation.id}
                    annotation={annotation}
                    workTitle={workTitle}
                    composerName={composerName}
                  />
                ))}

                {/* Load more button */}
                {workPagination?.hasMore && !localSearchTerm && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={loadMoreAnnotations}
                      disabled={isLoading}
                      className="btn-classical-secondary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('universal_audio_player_carregando')}</span>
                        </>
                      ) : (
                        <>
                          <FiEye className="w-4 h-4" />
                          <span>{t('annotations_ver_mais')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiMessageSquare className="w-8 h-8 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
                {hasAnyFilters
                  ? t('annotations_nenhuma_encontrada')
                  : t('annotations_primeiro_anotar')}
              </h3>
              <p className="text-theme-secondary max-w-md mx-auto mb-6">
                {hasAnyFilters
                  ? t('annotations_ajustar_filtros')
                  : t('annotations_compartilhe_descobertas')}
              </p>
              {isAuthenticated && !hasAnyFilters && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-classical-primary flex items-center space-x-2 mx-auto"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>{t('annotations_criar_primeira')}</span>
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
