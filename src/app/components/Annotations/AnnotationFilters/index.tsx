// components/Annotations/AnnotationFilters.tsx - VERSÃO COM TRADUÇÕES COMPLETAS
'use client';

import { useState, useEffect } from 'react';
import {
  FiFilter,
  FiX,
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiSearch,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AnnotationFilters as Filters,
  AnnotationDifficulty,
  AnnotationScope,
} from '@/app/stores/useAnnotationsStore';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';

interface AnnotationFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
  clearFilters: () => void;
}

export default function AnnotationFiltersComponent({
  filters,
  onFiltersChange,
  onClose,
  clearFilters,
}: AnnotationFiltersProps) {
  // ✅ Hook de traduções
  const { t } = useTranslation({ sections: ['pages/workId'] });

  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  // ✅ Opções de dificuldade com traduções
  const DIFFICULTY_OPTIONS = [
    {
      value: 'BEGINNER',
      label: t('annotation_difficulty_iniciante'),
      icon: FiTarget,
    },
    {
      value: 'INTERMEDIATE',
      label: t('annotation_difficulty_intermediario'),
      icon: FiTarget,
    },
    {
      value: 'ADVANCED',
      label: t('annotation_difficulty_avancado'),
      icon: FiTarget,
    },
    {
      value: 'ALL_LEVELS',
      label: t('annotation_difficulty_todos_niveis'),
      icon: FiTarget,
    },
  ];

  // ✅ Opções de abrangência com traduções
  const SCOPE_OPTIONS = [
    {
      value: 'ENTIRE_WORK',
      label: t('annotation_scope_obra_inteira'),
      icon: FiMusic,
    },
    {
      value: 'MOVEMENT',
      label: t('annotation_scope_movimento'),
      icon: FiLayers,
    },
    { value: 'SECTION', label: t('annotation_scope_secao'), icon: FiBookOpen },
    {
      value: 'SPECIFIC_MEASURE',
      label: t('annotation_scope_compasso_especifico'),
      icon: FiMapPin,
    },
  ];

  // ✅ Opções de ordenação com traduções
  const SORT_OPTIONS = [
    {
      value: 'helpful',
      label: t('annotation_sort_mais_uteis'),
      icon: FiTrendingUp,
    },
    {
      value: 'recent',
      label: t('annotation_sort_mais_recentes'),
      icon: FiClock,
    },
    {
      value: 'oldest',
      label: t('annotation_sort_mais_antigas'),
      icon: FiClock,
    },
  ];

  // Sincronizar com filtros externos, mas sempre removendo userId
  useEffect(() => {
    const cleanFilters = { ...filters };
    // 🔧 GARANTIR que userId seja sempre removido
    delete (cleanFilters as any).userId;
    setLocalFilters(cleanFilters);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };

    // 🔧 GARANTIR que userId nunca seja incluído
    delete (newFilters as any).userId;

    setLocalFilters(newFilters);

    // Aplicar filtros imediatamente
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    clearFilters();
    onClose();
    const clearedFilters = { sortBy: 'helpful' as const };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // 🔧 CORREÇÃO: Verificar filtros ativos (excluindo sortBy padrão e userId)
  const hasActiveFilters = Object.entries(localFilters).some(([key, value]) => {
    if (key === 'sortBy') return value !== 'helpful' && value !== undefined;
    if (key === 'userId') return false; // Sempre ignorar userId
    return value !== undefined && value !== '';
  });

  return (
    <AnimatedCard hover="none" className="border-t border-theme-secondary">
      <div className="p-6 bg-theme-elevated/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
              <FiFilter className="w-4 h-4 text-theme-primary" />
            </div>
            <h3 className="text-lg font-semibold text-theme-primary classical-title">
              {t('annotation_filters_titulo')}
            </h3>
            {hasActiveFilters && (
              <span className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-xs font-medium">
                {
                  Object.entries(localFilters).filter(([key, value]) => {
                    if (key === 'sortBy')
                      return value !== 'helpful' && value !== undefined;
                    if (key === 'userId') return false; // Sempre ignorar userId
                    return value !== undefined && value !== '';
                  }).length
                }{' '}
                {t('annotation_filters_ativos')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-primary/30 flex items-center justify-center text-theme-tertiary hover:text-theme-primary hover:border-accent-red/50 transition-all"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ✅ Dificuldade com traduções */}
          <div>
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiTarget className="w-4 h-4" />
              <span>{t('annotation_filters_nivel_dificuldade')}</span>
            </label>
            <div className="space-y-2">
              {DIFFICULTY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.difficulty === option.value;

                return (
                  <AnimatedItem
                    key={option.value}
                    hover="scale"
                    springType="bouncy"
                  >
                    <button
                      onClick={() =>
                        handleFilterChange(
                          'difficulty',
                          isSelected
                            ? undefined
                            : (option.value as AnnotationDifficulty)
                        )
                      }
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-accent-blue/10 border border-accent-blue/30 text-accent-blue'
                          : 'bg-theme-elevated border border-theme-primary/20 text-theme-secondary hover:border-accent-blue/50 hover:text-theme-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                      {isSelected && <FiX className="w-3 h-3 ml-auto" />}
                    </button>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>

          {/* ✅ Abrangência com traduções */}
          <div>
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiLayers className="w-4 h-4" />
              <span>{t('annotation_filters_abrangencia')}</span>
            </label>
            <div className="space-y-2">
              {SCOPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.scope === option.value;

                return (
                  <AnimatedItem
                    key={option.value}
                    hover="scale"
                    springType="bouncy"
                  >
                    <button
                      onClick={() =>
                        handleFilterChange(
                          'scope',
                          isSelected
                            ? undefined
                            : (option.value as AnnotationScope)
                        )
                      }
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                          : 'bg-theme-elevated border border-theme-primary/20 text-theme-secondary hover:border-accent-green/50 hover:text-theme-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                      {isSelected && <FiX className="w-3 h-3 ml-auto" />}
                    </button>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>

          {/* ✅ Ordenação com traduções */}
          <div>
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiTrendingUp className="w-4 h-4" />
              <span>{t('annotation_filters_ordenar_por')}</span>
            </label>
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected =
                  (localFilters.sortBy || 'helpful') === option.value;

                return (
                  <AnimatedItem
                    key={option.value}
                    hover="scale"
                    springType="bouncy"
                  >
                    <button
                      onClick={() => handleFilterChange('sortBy', option.value)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-accent-purple/10 border border-accent-purple/30 text-accent-purple'
                          : 'bg-theme-elevated border border-theme-primary/20 text-theme-secondary hover:border-accent-purple/50 hover:text-theme-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>
        </div>

        {/* ✅ Filtros de busca avançada com traduções */}
        <div className="mt-6 pt-6 border-t border-theme-secondary">
          <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
            <FiSearch className="w-4 h-4" />
            <span>{t('annotation_filters_busca_avancada')}</span>
          </label>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-theme-tertiary mb-2 flex items-center space-x-1">
                <span>{t('annotation_filters_buscar_titulos')}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={localFilters.search || ''}
                  onChange={(e) =>
                    handleFilterChange('search', e.target.value || undefined)
                  }
                  className="w-full input-classical-2 text-sm pr-8"
                  placeholder={t('annotation_filters_buscar_placeholder')}
                />
                {localFilters.search && (
                  <button
                    onClick={() => handleFilterChange('search', undefined)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-accent-red transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Resumo de filtros ativos com traduções */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t border-theme-secondary">
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiFilter className="w-4 h-4" />
              <span>{t('annotation_filters_filtros_ativos')}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {localFilters.difficulty && (
                <span className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm font-medium flex items-center space-x-2">
                  <span>
                    {t('annotation_filters_dificuldade')}{' '}
                    {
                      DIFFICULTY_OPTIONS.find(
                        (d) => d.value === localFilters.difficulty
                      )?.label
                    }
                  </span>
                  <button
                    onClick={() => handleFilterChange('difficulty', undefined)}
                    className="text-accent-blue hover:text-accent-red transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}

              {localFilters.scope && (
                <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm font-medium flex items-center space-x-2">
                  <span>
                    {t('annotation_filters_abrangencia_label')}{' '}
                    {
                      SCOPE_OPTIONS.find((s) => s.value === localFilters.scope)
                        ?.label
                    }
                  </span>
                  <button
                    onClick={() => handleFilterChange('scope', undefined)}
                    className="text-accent-green hover:text-accent-red transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}

              {localFilters.sortBy && localFilters.sortBy !== 'helpful' && (
                <span className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm font-medium flex items-center space-x-2">
                  <span>
                    {t('annotation_filters_ordem')}{' '}
                    {
                      SORT_OPTIONS.find((s) => s.value === localFilters.sortBy)
                        ?.label
                    }
                  </span>
                  <button
                    onClick={() => handleFilterChange('sortBy', 'helpful')}
                    className="text-accent-purple hover:text-accent-red transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}

              {localFilters.search && (
                <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium flex items-center space-x-2">
                  <span>
                    {t('annotation_filters_busca')} &quot;{localFilters.search}
                    &quot;
                  </span>
                  <button
                    onClick={() => handleFilterChange('search', undefined)}
                    className="text-brand-primary hover:text-accent-red transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ✅ Actions com traduções */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-theme-secondary">
          <div className="flex items-center space-x-2">
            {hasActiveFilters ? (
              <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium flex items-center space-x-1">
                <FiFilter className="w-3 h-3" />
                <span>
                  {
                    Object.entries(localFilters).filter(([key, value]) => {
                      if (key === 'sortBy')
                        return value !== 'helpful' && value !== undefined;
                      if (key === 'userId') return false; // Sempre ignorar userId
                      return value !== undefined && value !== '';
                    }).length
                  }{' '}
                  {t('annotation_filters_filtro_aplicados')}
                </span>
              </span>
            ) : (
              <span className="text-theme-tertiary text-sm flex items-center space-x-1">
                <FiFilter className="w-3 h-3" />
                <span>{t('annotation_filters_nenhum_ativo')}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-classical-secondary text-sm flex items-center space-x-1"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>{t('annotation_filters_limpar_todos')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-classical-primary text-sm flex items-center space-x-2"
            >
              <FiX className="w-4 h-4" />
              <span>{t('annotation_filters_fechar')}</span>
            </button>
          </div>
        </div>

        {/* ✅ Dica de uso com traduções */}
        <div className="mt-4 p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl">
          <div className="flex items-start space-x-2 text-xs text-theme-tertiary">
            <FiSearch className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              <strong>{t('annotation_filters_dica_strong')}: </strong>{' '}
              {t('annotation_filters_dica')}
            </span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
