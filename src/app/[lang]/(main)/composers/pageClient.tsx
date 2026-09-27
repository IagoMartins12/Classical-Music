'use client';
// app/composers/ComposersClient.tsx - Premium version com Animação Sequencial
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { useLocalizedRouter } from '@/app/hooks/useLocalizedRouter';

import { useState, useTransition, useCallback } from 'react';

import { PiClock, PiMagnifyingGlass, PiUser, PiX } from 'react-icons/pi';
import ComposerCard from '../../../components/ComposersClient/ComposerCard';
import ComposerCardList from '../../../components/ComposersClient/ComposerCardList';
import PaginationControls from '../../../components/PaginationControls';
import AnimatedMusicalNotes2 from '../../../components/AnimatedMusicalNotes2';
import ViewModeToggle from '../../../components/ViewModeToggle';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  SequentialGrid, // ✅ NOVO - Para animação sequencial
  LoadingSpinner,
} from '../../../components/animation/AnimatedComponents';
import Select from '../../../components/Common/Select';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { useTranslation } from '@/app/context/TranslationContext';
import { currentSearchParams } from '@/app/utils/currentSearchParams';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

export interface ComposerImslp {
  epochName: string;
  name: string;
  id: string;
  bio: string | null;
  epoch: {
    name: string;
  };
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
  epochId: string;
  permLinkImslp: string | null;
  wikipediaLink: string | null;
  imslpId: string | null;
  isVerified: boolean;
}

interface Epoch {
  id: string;
  name: string;
}

interface ComposersClientProps {
  composers: ComposerImslp[];
  epochs: Epoch[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  selectedEpoch: string;
}

export default function ComposersClient({
  composers,
  epochs,
  currentPage,
  totalPages,
  totalCount,
  searchTerm: initialSearchTerm,
  selectedEpoch: initialSelectedEpoch,
}: ComposersClientProps) {
  const { t } = useTranslation({ sections: ['pages/composers'] });
  const router = useLocalizedRouter();

  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedEpoch, setSelectedEpoch] = useState(initialSelectedEpoch);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Função para atualizar URL com debounce
  const updateUrl = useCallback(
    (params: { page?: number; search?: string; epoch?: string }) => {
      const newParams = currentSearchParams();

      if (params.page !== undefined) {
        if (params.page === 1) {
          newParams.delete('page');
        } else {
          newParams.set('page', params.page.toString());
        }
      }

      if (params.search !== undefined) {
        if (params.search === '') {
          newParams.delete('search');
        } else {
          newParams.set('search', params.search);
        }
      }

      if (params.epoch !== undefined) {
        if (params.epoch === '') {
          newParams.delete('epoch');
        } else {
          newParams.set('epoch', params.epoch);
        }
      }

      const newUrl = `${window.location.pathname}${
        newParams.toString() ? '?' + newParams.toString() : ''
      }`;

      startTransition(() => {
        router.push(newUrl);
      });
    },
    [router]
  );

  // Debounce para busca
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      const timeoutId = setTimeout(() => {
        updateUrl({ search: value, page: 1 });
      }, 800);

      return () => clearTimeout(timeoutId);
    },
    [updateUrl]
  );

  const handleEpochChange = useCallback(
    (value: string) => {
      setSelectedEpoch(value);
      updateUrl({ epoch: value, page: 1 });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateUrl]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedEpoch('');
    updateUrl({ search: '', epoch: '', page: 1 });
  }, [updateUrl]);

  const hasActiveFilters = searchTerm || selectedEpoch;

  return (
    <PageContainer showBackground={true}>
      {/* Header Section */}
      <AnimatedContainer delay={0.1} staggerSpeed="fast">
        <AnimatedItem
          direction="up"
          springType="bouncy"
          className="relative text-center py-16"
        >
          {/* Animated Background Elements */}
          <AnimatedMusicalNotes2 />

          <div className="relative z-10">
            <AnimatedItem
              direction="scale"
              className="flex items-center justify-center mb-6"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-theme-glow">
                <PiUser className="w-8 h-8 text-theme-primary" />
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                {t('client_jsx_h1_children_0__compositores_classicos')}
              </h1>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle">
                {t('client_jsx_p_children_0__explore_nossa_colecao')}
              </p>
            </AnimatedItem>
          </div>
        </AnimatedItem>

        {/* Filters Section */}
        <AnimatedItem
          direction="up"
          className={`classical-card mx-0 sm:p-0 !p-6 transition-all duration-500 ${
            isPending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                {t('client_jsx_h3_children_0__busca_filtros')}
              </h2>
              <Text papel="rotulo" tom="suave" as="p">
                {t('client_jsx_p_children_0__encontre_exatamente')}
              </Text>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Search Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-secondary">
                {t('client_jsx_label_children_0__pesquisar_por_nome')}
              </label>
              <div className="relative mt-2">
                <PiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder={t(
                    'client_jsx_input_placeholder__digite_nome_compositor'
                  )}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="input-classical pl-12 w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary transition-colors"
                  >
                    <PiX aria-hidden className="h-4 w-4" />
                    <NomeAcao acao="limpar" />
                  </button>
                )}
              </div>
            </div>

            {/* Epoch Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-secondary">
                {t('client_jsx_label_children_0__filtrar_por_periodo')}
              </label>
              <div className="relative mt-2">
                <Select
                  options={[
                    {
                      label: t('client_jsx_option_children_0__todos_periodos'),
                      value: '',
                    },
                    ...epochs.map((epoch) => ({
                      label: translateEpochWithHook(epoch.name, t),
                      value: epoch.id,
                    })),
                  ]}
                  value={selectedEpoch}
                  onChange={(e) => handleEpochChange(e.target.value)}
                  className="w-full"
                  icone={PiClock}
                />
              </div>
            </div>
          </div>

          {/* Filter Status and View Toggle */}
          <div className="flex md:items-center justify-between gap-4 pt-4 border-t border-theme-secondary">
            <Inline gap={4} className="justify-between">
              <Text papel="rotulo" tom="suave" as="div">
                <span className="font-medium text-theme-primary">
                  {composers.length}
                </span>{' '}
                {t('client_jsx_span_children_0__de')}{' '}
                <span className="font-medium text-theme-primary">
                  {totalCount}
                </span>{' '}
                {t('client_jsx_span_children_0__compositores')}
                {searchTerm && (
                  <span className="text-ouro-texto">
                    {' '}
                    {t('client_jsx_span_children_0__para')} &quot;
                    <span className="font-medium">{searchTerm}</span>&quot;
                  </span>
                )}
                {selectedEpoch && (
                  <span className="">
                    {' '}
                    {t('client_jsx_span_children_0__do_periodo')} &quot;
                    <span className="font-medium">
                      {translateEpochWithHook(
                        epochs.find((e) => e.id === selectedEpoch)?.name || '',
                        t
                      )}
                    </span>
                    &quot;
                  </span>
                )}
              </Text>

              {isPending && (
                <Text
                  papel="rotulo"
                  tom="ouro"
                  as="div"
                  className="flex items-center"
                >
                  <LoadingSpinner size="sm" />
                  <span className="ml-2  hidden sm:flex">
                    {t('client_jsx_span_children_0__carregando')}
                  </span>
                </Text>
              )}
            </Inline>

            <Inline gap={3} className="justify-between">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variante="secundario"
                  type="submit"
                  onClick={clearFilters}
                >
                  {t('client_jsx_button_children_0__limpar_filtros')}
                </Button>
              )}

              {/* View Toggle */}
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </Inline>
          </div>
        </AnimatedItem>

        {/* Results Section - AQUI ESTÁ A ANIMAÇÃO SEQUENCIAL! */}
        <div className="relative mt-6 pt-4">
          {composers.length > 0 ? (
            viewMode === 'cards' ? (
              // 🎬 ANIMAÇÃO SEQUENCIAL - Cards aparecem um por vez!
              <SequentialGrid cols={4} gap={6} className="px-0 md:px-4">
                {composers.map((composer) => (
                  // Quem leva ao compositor é o link dentro do cartão, não um
                  // `onClick` aqui: buscador não segue clique. Ver o
                  // comentário em `ComposerCard`.
                  <div key={composer.id} className="group">
                    <ComposerCard composer={composer} />
                  </div>
                ))}
              </SequentialGrid>
            ) : (
              <div className="divide-y flex flex-col gap-4 py-4 mx-4 divide-linha">
                {composers.map((composer, index) => (
                  <AnimatedItem
                    key={composer.id}
                    direction="left"
                    className="classical-card p-4 transition-all duration-300 group"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <ComposerCardList composer={composer} />
                  </AnimatedItem>
                ))}
              </div>
            )
          ) : (
            // Empty State com animação
            <AnimatedItem
              direction="scale"
              className="px-4"
              springType="bouncy"
            >
              <div className="classical-card p-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PiMagnifyingGlass className="w-8 h-8 text-theme-tertiary" />
                </div>

                <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
                  {t('client_jsx_h3_children_0__nenhum_compositor_encontrado')}
                </h3>

                <p className="text-theme-secondary mb-6">
                  {t('client_jsx_p_children_0__tente_ajustar_filtros')}
                </p>
                {hasActiveFilters && (
                  <Button
                    variante="primario"
                    type="submit"
                    onClick={clearFilters}
                  >
                    {t(
                      'client_jsx_button_children_0__limpar_filtros_ver_todos'
                    )}
                  </Button>
                )}
              </div>
            </AnimatedItem>
          )}

          {/* Loading Overlay com animação */}
          {isPending && (
            <AnimatedItem
              direction="scale"
              className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
            >
              <Card densidade="larga" className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-theme-primary font-medium mt-4">
                  {t('client_jsx_p_children_0__carregando_compositores')}
                </p>
              </Card>
            </AnimatedItem>
          )}
        </div>

        {/* Pagination com animação */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" className="px-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isPending={isPending}
            />
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
