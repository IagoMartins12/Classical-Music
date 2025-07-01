// components/Annotations/AnnotationStatsWidget.tsx
'use client';

import {
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiAward,
  FiMessageSquare,
  FiTrendingUp,
  FiUsers,
  FiThumbsUp,
  FiEye,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import {
  AnimatedCard,
  AnimatedItem,
  SequentialGrid,
} from '../../animation/AnimatedComponents';

interface AnnotationStatsWidgetProps {
  workId: string;
  className?: string;
}

const CATEGORY_CONFIG = {
  TECHNIQUE: {
    label: 'Técnica',
    icon: FiTarget,
    color: 'from-accent-red to-accent-purple',
    bgColor: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
  },
  INTERPRETATION: {
    label: 'Interpretação',
    icon: GiMusicalNotes,
    color: 'from-accent-blue to-accent-purple',
    bgColor: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
  },
  PRACTICE_TIP: {
    label: 'Dicas',
    icon: FiBookOpen,
    color: 'from-accent-green to-accent-blue',
    bgColor: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  },
  THEORY: {
    label: 'Teoria',
    icon: FiLayers,
    color: 'from-accent-purple to-accent-blue',
    bgColor: 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
  },
  PERFORMANCE: {
    label: 'Performance',
    icon: FiMusic,
    color: 'from-brand-primary to-brand-secondary',
    bgColor: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary',
  },
  HISTORICAL: {
    label: 'Contexto',
    icon: FiAward,
    color: 'from-accent-purple to-accent-red',
    bgColor: 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
  },
  GENERAL: {
    label: 'Geral',
    icon: FiMessageSquare,
    color: 'from-theme-primary to-theme-secondary',
    bgColor: 'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
  },
};

export default function AnnotationStatsWidget({
  workId,
  className = '',
}: AnnotationStatsWidgetProps) {
  const { getAnnotationStats, getWorkAnnotations } = useAnnotationsStore();

  const stats = getAnnotationStats(workId);
  const annotations = getWorkAnnotations(workId);

  if (stats.total === 0) {
    return null;
  }

  // Calcular estatísticas adicionais
  const totalViews = annotations.reduce(
    (sum, annotation) => sum + annotation.viewCount,
    0
  );
  const totalHelpfulVotes = annotations.reduce(
    (sum, annotation) => sum + annotation.helpfulCount,
    0
  );
  const uniqueContributors = new Set(annotations.map((a) => a.userId)).size;
  const averageHelpfulness =
    annotations.length > 0 ? totalHelpfulVotes / annotations.length : 0;

  // Top categorias por quantidade
  const topCategories = Object.entries(stats.byCategory)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <AnimatedCard hover="lift" className={`classical-card-2 ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
            <FiTrendingUp className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-primary classical-title">
              Estatísticas das Anotações
            </h3>
            <p className="text-sm text-theme-secondary">
              Engajamento da comunidade
            </p>
          </div>
        </div>

        {/* Métricas principais */}
        <SequentialGrid
          cols={2}
          gap={4}
          delayBetweenItems={0.1}
          className="mb-6"
        >
          <AnimatedItem hover="scale" springType="bouncy">
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-brand-primary mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-theme-secondary font-medium">
                Total de Anotações
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem hover="scale" springType="bouncy">
            <div className="bg-gradient-to-br from-accent-green/10 to-accent-blue/10 border border-accent-green/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent-green mb-1">
                {totalHelpfulVotes}
              </div>
              <div className="text-sm text-theme-secondary font-medium">
                Votos Úteis
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem hover="scale" springType="bouncy">
            <div className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-accent-blue/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent-blue mb-1">
                {totalViews}
              </div>
              <div className="text-sm text-theme-secondary font-medium">
                Visualizações
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem hover="scale" springType="bouncy">
            <div className="bg-gradient-to-br from-accent-purple/10 to-accent-red/10 border border-accent-purple/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent-purple mb-1">
                {uniqueContributors}
              </div>
              <div className="text-sm text-theme-secondary font-medium">
                Contribuidores
              </div>
            </div>
          </AnimatedItem>
        </SequentialGrid>

        {/* Top categorias */}
        {topCategories.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
              <FiLayers className="w-4 h-4" />
              <span>Categorias Mais Ativas</span>
            </h4>
            <div className="space-y-2">
              {topCategories.map(([category, count], index) => {
                const config =
                  CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
                const Icon = config?.icon || FiMessageSquare;
                const percentage = (count / stats.total) * 100;

                return (
                  <AnimatedItem
                    key={category}
                    hover="scale"
                    springType="bouncy"
                    delay={index * 0.1}
                  >
                    <div className="flex items-center space-x-3 p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                          config?.color ||
                          'from-theme-primary to-theme-secondary'
                        } flex items-center justify-center`}
                      >
                        <Icon className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-theme-primary">
                            {config?.label || category}
                          </span>
                          <span className="text-sm text-theme-secondary">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-theme-elevated border border-theme-primary/20 rounded-full h-1.5">
                          <div
                            className={`bg-gradient-to-r ${
                              config?.color ||
                              'from-theme-primary to-theme-secondary'
                            } h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>
        )}

        {/* Anotações mais úteis */}
        {stats.mostHelpful.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
              <FiThumbsUp className="w-4 h-4" />
              <span>Anotações Mais Úteis</span>
            </h4>
            <div className="space-y-2">
              {stats.mostHelpful.slice(0, 3).map((annotation, index) => {
                const categoryConfig = CATEGORY_CONFIG[annotation.category];
                const Icon = categoryConfig?.icon || FiMessageSquare;

                return (
                  <AnimatedItem
                    key={annotation.id}
                    hover="scale"
                    springType="bouncy"
                    delay={index * 0.1}
                  >
                    <div className="flex items-center space-x-3 p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl group hover:border-brand-primary/50 transition-all">
                      <div
                        className={`w-6 h-6 rounded-lg ${
                          categoryConfig?.bgColor ||
                          'bg-theme-primary/10 border-theme-primary/30 text-theme-primary'
                        } border flex items-center justify-center`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-theme-primary text-sm truncate group-hover:text-brand-primary transition-colors">
                          {annotation.title}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-theme-tertiary">
                          <span className="flex items-center space-x-1">
                            <FiThumbsUp className="w-3 h-3" />
                            <span>{annotation.helpfulCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FiEye className="w-3 h-3" />
                            <span>{annotation.viewCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FiUsers className="w-3 h-3" />
                            <span>
                              {annotation.user.firstName ||
                                annotation.user.username ||
                                'Anônimo'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>
        )}

        {/* Métricas de engajamento */}
        <div className="mt-6 pt-6 border-t border-theme-secondary">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-theme-primary">
                {averageHelpfulness.toFixed(1)}
              </div>
              <div className="text-xs text-theme-tertiary">
                Média de Utilidade
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-theme-primary">
                {(totalViews / stats.total).toFixed(0)}
              </div>
              <div className="text-xs text-theme-tertiary">
                Visualizações/Anotação
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
