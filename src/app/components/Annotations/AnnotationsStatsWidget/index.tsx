// app/annotations/components/AnnotationsStatsWidget.tsx
'use client';

import {
  PiBookOpen,
  PiChatCenteredText,
  PiEye,
  PiMedal,
  PiMusicNotes,
  PiSealCheck,
  PiStack,
  PiTarget,
  PiThumbsUp,
  PiTrendUp,
  PiTrophy,
} from 'react-icons/pi';
import Link from 'next/link';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface AnnotationsStatsWidgetProps {
  stats: any;
  topAnnotations: any[];
  mostAnnotatedWorks: any[];
}

const CATEGORY_CONFIG = {
  TECHNIQUE: {
    label: 'Técnica',
    icon: PiTarget,
    color: '',
    bgColor: '',
  },
  INTERPRETATION: {
    label: 'Interpretação',
    icon: PiMusicNotes,
    color: '',
    bgColor: '',
  },
  PRACTICE_TIP: {
    label: 'Dicas',
    icon: PiBookOpen,
    color: '',
    bgColor: '',
  },
  THEORY: {
    label: 'Teoria',
    icon: PiStack,
    color: '',
    bgColor: '',
  },
  PERFORMANCE: {
    label: 'Performance',
    icon: PiMusicNotes,
    color: '',
    bgColor: 'text-ouro-texto',
  },
  HISTORICAL: {
    label: 'Contexto',
    icon: PiMedal,
    color: '',
    bgColor: '',
  },
  GENERAL: {
    label: 'Geral',
    icon: PiChatCenteredText,
    color: '',
    bgColor: 'text-theme-primary',
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
    <Stack gap={6}>
      {/* Estatísticas por categoria */}
      {topCategories.length > 0 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <Stack className="p-6">
            <Inline
              as="h4"
              gap={2}
              className="text-sm font-semibold text-theme-primary"
            >
              <PiTrendUp className="w-4 h-4" />
              <span>Suas Categorias Favoritas</span>
            </Inline>
            <Stack gap={3}>
              {topCategories.map((category: any, index: number) => {
                const config =
                  CATEGORY_CONFIG[
                    category.category as keyof typeof CATEGORY_CONFIG
                  ];
                const Icon = config?.icon || PiChatCenteredText;
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
                    <Inline
                      gap={3}
                      className="p-3 classical-card-simple rounded-xl"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                          config?.color || ''
                        } flex items-center justify-center`}
                      >
                        <Icon className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Text
                            papel="rotulo"
                            tom="forte"
                            className="font-medium"
                          >
                            {config?.label || category.category}
                          </Text>
                          <Text papel="rotulo" tom="suave">
                            {category._count.category} ({percentage.toFixed(0)}
                            %)
                          </Text>
                        </div>
                        <div className="w-full bg-theme-elevated rounded-full h-1.5">
                          <div
                            className={`bg-gradient-to-r ${
                              config?.color || ''
                            } h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </Inline>
                  </AnimatedItem>
                );
              })}
            </Stack>
          </Stack>
        </AnimatedCard>
      )}

      {/* Top anotações */}
      {topAnnotations.length > 0 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <Stack className="p-6">
            <Inline
              as="h4"
              gap={2}
              className="text-sm font-semibold text-theme-primary"
            >
              <PiTrophy className="w-4 h-4" />
              <span>Suas Anotações Mais Populares</span>
            </Inline>
            <Stack gap={3}>
              {topAnnotations.map((annotation, index) => {
                const categoryConfig =
                  CATEGORY_CONFIG[
                    annotation.category as keyof typeof CATEGORY_CONFIG
                  ];
                const Icon = categoryConfig?.icon || PiChatCenteredText;

                return (
                  <AnimatedItem
                    key={annotation.id}
                    hover="scale"
                    springType="bouncy"
                    delay={index * 0.1}
                  >
                    <Inline
                      gap={3}
                      className="p-3 classical-card-simple rounded-xl group transition-all"
                    >
                      <Inline gap={2}>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {annotation.isVerified && (
                          <PiSealCheck className="w-4 h-4" />
                        )}
                      </Inline>
                      <div className="flex-1 min-w-0">
                        <Text
                          papel="rotulo"
                          tom="forte"
                          as="div"
                          className="font-medium truncate transition-colors"
                        >
                          {annotation.title}
                        </Text>
                        <Text papel="legenda" tom="fraco" as="div">
                          {annotation.work.title} -{' '}
                          {annotation.work.composer.name}
                        </Text>
                        <Inline
                          gap={3}
                          className="text-xs text-theme-tertiary mt-1"
                        >
                          <Inline as="span" gap={1}>
                            <PiThumbsUp className="w-3 h-3" />
                            <span>{annotation.helpfulCount}</span>
                          </Inline>
                          <Inline as="span" gap={1}>
                            <PiEye className="w-3 h-3" />
                            <span>{annotation.viewCount}</span>
                          </Inline>
                        </Inline>
                      </div>
                    </Inline>
                  </AnimatedItem>
                );
              })}
            </Stack>
          </Stack>
        </AnimatedCard>
      )}

      {/* Obras mais anotadas */}
      {mostAnnotatedWorks.length > 0 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <Stack className="p-6">
            <Inline
              as="h4"
              gap={2}
              className="text-sm font-semibold text-theme-primary"
            >
              <PiMusicNotes className="w-4 h-4" />
              <span>Obras Que Você Mais Anota</span>
            </Inline>
            <Stack gap={3}>
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
                        <Text
                          papel="rotulo"
                          tom="forte"
                          as="div"
                          className="font-medium truncate transition-colors"
                        >
                          {work.title}
                        </Text>
                        <Text papel="legenda" tom="fraco" as="div">
                          {work.composer.fullName}
                        </Text>
                        {work.opOrCatalog && (
                          <Text papel="legenda" tom="fraco" as="div">
                            {work.opOrCatalog}
                          </Text>
                        )}
                      </div>
                      <Text
                        papel="rotulo"
                        tom="ouro"
                        as="div"
                        className="font-bold"
                      >
                        {work.annotationsCount}
                      </Text>
                    </div>
                  </Link>
                </AnimatedItem>
              ))}
            </Stack>
          </Stack>
        </AnimatedCard>
      )}

      {/* Dicas para anotações */}
      <AnimatedCard hover="lift" className="classical-card-2">
        <Stack className="p-6">
          <Inline
            as="h4"
            gap={2}
            className="text-sm font-semibold text-theme-primary"
          >
            <PiBookOpen className="w-4 h-4" />
            <span>Dicas para Anotar</span>
          </Inline>
          <Text papel="rotulo" tom="suave" as="div" className="space-y-3">
            <p>
              <strong>Seja específico</strong> - Indique compassos, mãos ou
              seções exatas.
            </p>
            <p>
              <strong>Use categorias</strong> - Organize por técnica,
              interpretação ou teoria.
            </p>
            <p>
              <strong>Adicione tags</strong> - Facilite a busca com
              palavras-chave.
            </p>
            <p>
              <strong>Torne público</strong> - Ajude outros músicos com seu
              conhecimento.
            </p>
          </Text>
        </Stack>
      </AnimatedCard>

      {/* CTA para criar mais anotações */}
      {totalAnnotations < 5 && (
        <AnimatedCard hover="lift" className="classical-card-2">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PiChatCenteredText className="w-6 h-6 text-theme-primary" />
            </div>
            <h4 className="font-semibold text-theme-primary mb-2">
              Continue Anotando!
            </h4>
            <Text papel="rotulo" tom="suave" as="p" className="mb-4">
              Você tem apenas {totalAnnotations} anotações. Que tal criar mais
              algumas?
            </Text>
            <Link
              href="/works"
              className="inline-flex items-center space-x-2 text-sm text-ouro-texto font-medium transition-colors"
            >
              <span>Explorar Obras</span>
              <PiMusicNotes className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedCard>
      )}
    </Stack>
  );
}
