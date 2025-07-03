// components/Annotations/AnnotationFilters.tsx - VERSÃO CORRIGIDA SEM USERID
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

interface AnnotationFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
  clearFilters: () => void;
}

const DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER', label: 'Iniciante', icon: FiTarget },
  { value: 'INTERMEDIATE', label: 'Intermediário', icon: FiTarget },
  { value: 'ADVANCED', label: 'Avançado', icon: FiTarget },
  { value: 'ALL_LEVELS', label: 'Todos os níveis', icon: FiTarget },
];

const SCOPE_OPTIONS = [
  { value: 'ENTIRE_WORK', label: 'Obra inteira', icon: FiMusic },
  { value: 'MOVEMENT', label: 'Movimento', icon: FiLayers },
  { value: 'SECTION', label: 'Seção', icon: FiBookOpen },
  { value: 'SPECIFIC_MEASURE', label: 'Compasso específico', icon: FiMapPin },
];

const SORT_OPTIONS = [
  { value: 'helpful', label: 'Mais úteis', icon: FiTrendingUp },
  { value: 'recent', label: 'Mais recentes', icon: FiClock },
  { value: 'oldest', label: 'Mais antigas', icon: FiClock },
];

export default function AnnotationFiltersComponent({
  filters,
  onFiltersChange,
  onClose,
  clearFilters,
}: AnnotationFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

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
              Filtros Avançados
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
                ativos
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
          {/* Dificuldade */}
          <div>
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiTarget className="w-4 h-4" />
              <span>Nível de Dificuldade</span>
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

          {/* Abrangência */}
          <div>
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiLayers className="w-4 h-4" />
              <span>Abrangência</span>
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

          {/* Ordenação */}
          <div>
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiTrendingUp className="w-4 h-4" />
              <span>Ordenar por</span>
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

        {/* Filtros de busca avançada */}
        <div className="mt-6 pt-6 border-t border-theme-secondary">
          <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
            <FiSearch className="w-4 h-4" />
            <span>Busca Avançada</span>
          </label>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-theme-tertiary mb-2 flex items-center space-x-1">
                <span>Buscar em títulos, conteúdo e tags</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={localFilters.search || ''}
                  onChange={(e) =>
                    handleFilterChange('search', e.target.value || undefined)
                  }
                  className="w-full input-classical-2 text-sm pr-8"
                  placeholder="Digite para buscar..."
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

        {/* Resumo de filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t border-theme-secondary">
            <label className="text-sm font-medium text-theme-primary mb-3 flex items-center space-x-2">
              <FiFilter className="w-4 h-4" />
              <span>Filtros Ativos</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {localFilters.difficulty && (
                <span className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm font-medium flex items-center space-x-2">
                  <span>
                    Dificuldade:{' '}
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
                    Abrangência:{' '}
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
                    Ordem:{' '}
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
                  <span>Busca: &quot;{localFilters.search}&quot;</span>
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

        {/* Actions */}
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
                  filtro(s) aplicado(s)
                </span>
              </span>
            ) : (
              <span className="text-theme-tertiary text-sm flex items-center space-x-1">
                <FiFilter className="w-3 h-3" />
                <span>Nenhum filtro ativo</span>
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
                <span>Limpar Todos</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-classical-primary text-sm flex items-center space-x-2"
            >
              <FiX className="w-4 h-4" />
              <span>Fechar</span>
            </button>
          </div>
        </div>

        {/* Dica de uso */}
        <div className="mt-4 p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl">
          <div className="flex items-start space-x-2 text-xs text-theme-tertiary">
            <FiSearch className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Dica:</strong> Os filtros avançados buscam no servidor e
              são mais precisos. Use-os para encontrar anotações específicas por
              nível de dificuldade, abrangência ou conteúdo da comunidade.
            </span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
