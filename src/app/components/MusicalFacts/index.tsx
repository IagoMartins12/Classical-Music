// app/components/MusicalFacts/MusicalFacts.tsx
'use client';

import React from 'react';
import { PiArrowsClockwise, PiBookOpen, PiFunnel } from 'react-icons/pi';
import SectionTitle from '../Utils/SectionTitle';

import Select from '../Common/Select';
import {
  categories,
  getFactsByCategory,
  getRandomFacts,
} from '@/app/utils/utils';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { useTranslation } from '@/app/context/TranslationContext';
import { Language } from '@/app/utils/translations/serverTranslations';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Stack } from '@/app/components/ui/Layout';

interface MusicalFact {
  id: string;
  type: string;
  icon: string;
  title: {
    pt: string;
    en: string;
  };
  content: {
    pt: string;
    en: string;
  };
  category: string;
}

interface MusicalFactsProps {
  facts?: MusicalFact[];
  initialCount?: number;
}

/**
 * Uma curiosidade: o card de sempre. Antes cada categoria tinha a própria cor
 * viva (fundo, borda, selo e brilho ao passar o mouse), um emoji como ícone e
 * uma nota decorativa — nove paletas numa seção só. A categoria agora é um
 * rótulo discreto; o que distingue um card do outro é o texto.
 */
const FactCard = ({
  fact,
  language,
}: {
  fact: MusicalFact;
  index: number;
  language: Language;
}) => (
  <Card>
    <Stack gap={3}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="t-subtitulo">{fact.title[language]}</h3>
        <span className="t-rotulo shrink-0 text-texto-fraco">
          {fact.category}
        </span>
      </div>
      <p className="t-corpo text-texto-suave">{fact.content[language]}</p>
    </Stack>
  </Card>
);

const MusicalFacts: React.FC<MusicalFactsProps> = ({
  facts: initialFacts,
  initialCount = 4,
}) => {
  const [displayedFacts, setDisplayedFacts] = React.useState<MusicalFact[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [loadedCount, setLoadedCount] = React.useState(initialCount);
  const [mounted, setMounted] = React.useState(false);
  const { t, language } = useTranslation({ sections: ['pages/home'] });

  // Garantir que o componente está montado no cliente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Inicializar com fatos fornecidos ou buscar aleatórios
  React.useEffect(() => {
    if (!mounted) return;

    if (initialFacts && initialFacts.length > 0) {
      setDisplayedFacts(initialFacts);
    } else {
      loadInitialFacts();
    }
  }, [initialFacts, initialCount, mounted, language]);

  const loadInitialFacts = () => {
    const facts = getRandomFacts(initialCount);
    setDisplayedFacts(facts);
    setLoadedCount(initialCount);
  };

  const refreshFacts = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (selectedCategory === 'all') {
      const facts = getRandomFacts(loadedCount);
      setDisplayedFacts(facts);
    } else {
      const facts = getFactsByCategory(selectedCategory, loadedCount);
      setDisplayedFacts(facts);
    }

    setIsLoading(false);
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    console.log('category', category);
    if (category === 'all') {
      const facts = getRandomFacts(initialCount);
      setDisplayedFacts(facts);
    } else {
      const facts = getFactsByCategory(category, initialCount);
      setDisplayedFacts(facts);
    }

    setLoadedCount(initialCount);
    setIsLoading(false);
  };

  // Atualizar fatos quando idioma muda
  React.useEffect(() => {
    if (!mounted) return;

    if (selectedCategory === 'all') {
      const facts = getRandomFacts(loadedCount);
      setDisplayedFacts(facts);
    } else {
      const facts = getFactsByCategory(selectedCategory, loadedCount);
      setDisplayedFacts(facts);
    }
  }, [language, mounted, selectedCategory, loadedCount]);

  // Não renderizar até estar montado no cliente
  if (!mounted) {
    return (
      <section className="section-wrap relative !mb-8">
        <Stack className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card nivel={2} key={i}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Stack>
      </section>
    );
  }

  return (
    <section className="section-wrap relative !mb-8">
      <SectionTitle
        title={t('musical_facts_title')}
        subtitle={t('musical_facts_subtitle')}
        icon={<PiBookOpen className="w-6 h-6" />}
        accent="blue"
      />

      {/* Filter and Controls */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-theme-secondary">
            <PiFunnel className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('musical_facts_filter_label')}
            </span>
          </div>
          <Select
            options={[
              { label: t('musical_facts_all_periods'), value: 'all' },
              ...categories.map((category) => ({
                label: translateEpochWithHook(category, t),
                value: category,
              })),
            ]}
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-classical text-sm !py-2 !px-3 min-w-[150px]"
            disabled={isLoading}
          />
        </div>

        {/* Refresh Button */}
        <Button
          variante="secundario"
          type="submit"
          onClick={refreshFacts}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <PiArrowsClockwise
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          {t('musical_facts_shuffle')}
        </Button>
      </div>

      {/* Facts grid */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card nivel={2} key={i}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl loading-skeleton"></div>
                <div className="flex-1">
                  <div className="h-4 loading-skeleton rounded mb-2"></div>
                  <div className="h-3 loading-skeleton rounded mb-3 w-3/4"></div>
                  <div className="h-3 loading-skeleton rounded mb-2"></div>
                  <div className="h-3 loading-skeleton rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedFacts.map((fact, index) => (
            <FactCard
              key={`${fact.id}-${selectedCategory}-${language}`}
              fact={fact}
              index={index}
              language={language}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MusicalFacts;
