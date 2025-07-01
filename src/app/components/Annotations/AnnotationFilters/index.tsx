// components/Annotations/AnnotationFilters.tsx
'use client';

import { useState } from 'react';
import {
  FiFilter,
  FiX,
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiAward,
  FiMessageSquare,
  FiTrendingUp,
  FiClock,
  FiUser,
  FiMapPin,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import {
  AnnotationFilters as Filters,
  AnnotationCategory,
  AnnotationDifficulty,
  AnnotationScope,
} from '@/app/stores/useAnnotationsStore';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';

interface AnnotationFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'TECHNIQUE', label: 'Técnica', icon: FiTarget },
  { value: 'INTERPRETATION', label: 'Interpretação', icon: GiMusicalNotes },
  { value: 'PRACTICE_TIP', label: 'Dicas de Estudo', icon: FiBookOpen },
  { value: 'THEORY', label: 'Teoria', icon: FiLayers },
  { value: 'PERFORMANCE', label: 'Performance', icon: FiMusic },
  { value: 'HISTORICAL', label: 'Contexto', icon: FiAward },
  { value: 'GENERAL', label: 'Geral', icon: FiMessageSquare },
];

const DIFFICULTY_OPTIONS = [
  { value: 'ALL_LEVELS', label: 'Todos os níveis' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const SCOPE_OPTIONS = [
  { value: 'ENTIRE_WORK', label: 'Obra inteira' },
  { value: 'MOVEMENT', label: 'Movimento' },
  { value: 'SECTION', label: 'Seção' },
  { value: 'SPECIFIC_MEASURE', label: 'Compasso específico' },
];

const SORT_OPTIONS = [
  { value: 'helpful', label: 'Mais úteis', icon: FiTrendingUp },
  { value: 'recent', label: 'Mais recentes', icon: FiClock },
  { value: 'oldest', label: 'Mais antigas', icon: FiClock },
];

export default function AnnotationFilters({
  filters,
  onFiltersChange,
  onClose,
}: AnnotationFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { sortBy: 'helpful' as const };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    (key) => key !== 'sortBy' && localFilters[key as keyof Filters]
  );

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
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-primary/30 flex items-center justify-center text-theme-tertiary hover:text-theme-primary hover:border-accent-red/50 transition-all"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-3">
              Categoria
            </label>
            <div className="space-y-2">
              {CATEGORY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.category === option.value;

                return (
                  <AnimatedItem
                    key={option.value}
                    hover="scale"
                    springType="bouncy"
                  >
                    <button
                      onClick={() =>
                        handleFilterChange(
                          'category',
                          isSelected
                            ? undefined
                            : (option.value as AnnotationCategory)
                        )
                      }
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                          : 'bg-theme-elevated border border-theme-primary/20 text-theme-secondary hover:border-brand-primary/50 hover:text-theme-primary'
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

          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-3">
              Nível de Dificuldade
            </label>
            <div className="space-y-2">
              {DIFFICULTY_OPTIONS.map((option) => {
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
                      <FiTarget className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>

          {/* Abrangência */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-3">
              Abrangência
            </label>
            <div className="space-y-2">
              {SCOPE_OPTIONS.map((option) => {
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
                      <FiMapPin className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-3">
              Ordenar por
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

        {/* Filtro por usuário específico */}
        <div className="mt-6 pt-6 border-t border-theme-secondary">
          <label className="block text-sm font-medium text-theme-primary mb-3">
            Filtros Específicos
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-theme-tertiary mb-2">
                ID do Usuário (opcional)
              </label>
              <input
                type="text"
                value={localFilters.userId || ''}
                onChange={(e) =>
                  handleFilterChange('userId', e.target.value || undefined)
                }
                className="w-full input-classical-2 text-sm"
                placeholder="Ver anotações de usuário específico"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-tertiary mb-2">
                Busca personalizada
              </label>
              <input
                type="text"
                value={localFilters.search || ''}
                onChange={(e) =>
                  handleFilterChange('search', e.target.value || undefined)
                }
                className="w-full input-classical-2 text-sm"
                placeholder="Buscar em títulos, conteúdo e tags"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-theme-secondary">
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium">
                Filtros aplicados
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="btn-classical-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpar Filtros
            </button>
            <button
              onClick={applyFilters}
              className="btn-classical-primary text-sm flex items-center space-x-2"
            >
              <FiFilter className="w-4 h-4" />
              <span>Aplicar Filtros</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
