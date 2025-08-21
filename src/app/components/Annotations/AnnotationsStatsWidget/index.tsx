// app/annotations/components/AnnotationsStatsWidget.tsx
'use client';

import {
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiAward,
  FiMessageSquare,
  FiTrendingUp,
  FiThumbsUp,
  FiEye,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import Link from 'next/link';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import { BiTrophy } from 'react-icons/bi';
import { MdVerified } from 'react-icons/md';

interface AnnotationsStatsWidgetProps {
  stats: any;
  topAnnotations: any[];
  mostAnnotatedWorks: any[];
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

export default function AnnotationsStatsWidget({
  stats,
  topAnnotations = [],
  mostAnnotatedWorks = [],
}: AnnotationsStatsWidgetProps) {
  // Top categorias por quantidade
  const topCategories =
    stats?.categoryDistribution
      ?.filter((cat: any) => cat._count.category > 0)
      ?.sort((a: any, b: any) => b._count.category - a._count.category)
      ?.slice(0, 3) || [];

  const totalAnnotations =
    stats?.categoryDistribution?.reduce(
      (sum: number, cat: any) => sum + cat._count.category,
      0
    ) || 0;

  return (
    <div className="space-y-6">
      {/* Estatísticas por categoria */}
      {topCategories.length > 0 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <div className="p-6">
            <h4 className="text-sm font-semibold text-theme-primary mb-4 flex items-center space-x-2">
              <FiTrendingUp className="w-4 h-4" />
              <span>Suas Categorias Favoritas</span>
            </h4>
            <div className="space-y-3">
              {topCategories.map((category: any, index: number) => {
                const config =
                  CATEGORY_CONFIG[
                    category.category as keyof typeof CATEGORY_CONFIG
                  ];
                const Icon = config?.icon || FiMessageSquare;
                const percentage =
                  totalAnnotations > 0
                    ? (category._count.category / totalAnnotations) * 100
                    : 0;

                return (
                  <AnimatedItem
                    key={category.category}
                    hover="scale"
                    springType="bouncy"
                    delay={index * 0.1}
                  >
                    <div className="flex items-center space-x-3 p-3 classical-card-simple rounded-xl">
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
                            {config?.label || category.category}
                          </span>
                          <span className="text-sm text-theme-secondary">
                            {category._count.category} ({percentage.toFixed(0)}
                            %)
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
        </AnimatedCard>
      )}

      {/* Top anotações */}
      {topAnnotations.length > 0 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <div className="p-6">
            <h4 className="text-sm font-semibold text-theme-primary mb-4 flex items-center space-x-2">
              <BiTrophy className="w-4 h-4" />
              <span>Suas Anotações Mais Populares</span>
            </h4>
            <div className="space-y-3">
              {topAnnotations.map((annotation, index) => {
                const categoryConfig =
                  CATEGORY_CONFIG[
                    annotation.category as keyof typeof CATEGORY_CONFIG
                  ];
                const Icon = categoryConfig?.icon || FiMessageSquare;

                return (
                  <AnimatedItem
                    key={annotation.id}
                    hover="scale"
                    springType="bouncy"
                    delay={index * 0.1}
                  >
                    <div className="flex items-center space-x-3 p-3 classical-card-simple rounded-xl group hover:border-brand-primary/50 transition-all">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {annotation.isVerified && (
                          <MdVerified className="w-4 h-4 text-accent-green" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-theme-primary text-sm truncate group-hover:text-brand-primary transition-colors">
                          {annotation.title}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {annotation.work.title} -{' '}
                          {annotation.work.composer.name}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-theme-tertiary mt-1">
                          <span className="flex items-center space-x-1">
                            <FiThumbsUp className="w-3 h-3" />
                            <span>{annotation.helpfulCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FiEye className="w-3 h-3" />
                            <span>{annotation.viewCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>
        </AnimatedCard>
      )}

      {/* Obras mais anotadas */}
      {mostAnnotatedWorks.length > 0 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <div className="p-6">
            <h4 className="text-sm font-semibold text-theme-primary mb-4 flex items-center space-x-2">
              <FiMusic className="w-4 h-4" />
              <span>Obras Que Você Mais Anota</span>
            </h4>
            <div className="space-y-3">
              {mostAnnotatedWorks.map((work, index) => (
                <AnimatedItem
                  key={work.id}
                  hover="scale"
                  springType="bouncy"
                  delay={index * 0.1}
                >
                  <Link
                    href={`/works/${work.id}`}
                    className="block p-3 classical-card-simple rounded-xl group "
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-theme-primary text-sm truncate group-hover:text-brand-primary transition-colors">
                          {work.title}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {work.composer.fullName}
                        </div>
                        {work.opOrCatalog && (
                          <div className="text-xs text-theme-tertiary">
                            {work.opOrCatalog}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-brand-primary">
                        {work.annotationsCount}
                      </div>
                    </div>
                  </Link>
                </AnimatedItem>
              ))}
            </div>
          </div>
        </AnimatedCard>
      )}

      {/* Dicas para anotações */}
      <AnimatedCard hover="lift" className="classical-card-2">
        <div className="p-6">
          <h4 className="text-sm font-semibold text-theme-primary mb-4 flex items-center space-x-2">
            <FiBookOpen className="w-4 h-4" />
            <span>Dicas para Anotar</span>
          </h4>
          <div className="space-y-3 text-sm text-theme-secondary">
            <p>
              🎯 <strong>Seja específico</strong> - Indique compassos, mãos ou
              seções exatas.
            </p>
            <p>
              🎵 <strong>Use categorias</strong> - Organize por técnica,
              interpretação ou teoria.
            </p>
            <p>
              🏷️ <strong>Adicione tags</strong> - Facilite a busca com
              palavras-chave.
            </p>
            <p>
              🌍 <strong>Torne público</strong> - Ajude outros músicos com seu
              conhecimento.
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* CTA para criar mais anotações */}
      {totalAnnotations < 5 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-6 h-6 text-theme-primary" />
            </div>
            <h4 className="font-semibold text-theme-primary mb-2">
              Continue Anotando!
            </h4>
            <p className="text-sm text-theme-secondary mb-4">
              Você tem apenas {totalAnnotations} anotações. Que tal criar mais
              algumas?
            </p>
            <Link
              href="/works"
              className="inline-flex items-center space-x-2 text-sm text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            >
              <span>Explorar Obras</span>
              <FiMusic className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}
