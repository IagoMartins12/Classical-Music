// app/components/MusicalFacts/MusicalFacts.tsx
'use client';

import React from 'react';
import { FiBookOpen, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import SectionTitle from '../Utils/SectionTitle';

import Select from '../Common/Select';
import { useLanguageStore } from '@/app/stores/useLanguageStore';
import {
  categories,
  getFactsByCategory,
  getRandomFacts,
} from '@/app/requests/utils';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { useTranslation } from '@/app/context/TranslationContext';

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

const FactCard = ({ fact, index }: { fact: MusicalFact; index: number }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Definir estilos por tipo de curiosidade
  const getFactStyle = (type: string) => {
    const styles = {
      Medieval: {
        gradient: 'from-blue-600/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        accent: 'text-blue-400',
        bg: 'bg-blue-500/10',
      },
      Renascimento: {
        gradient: 'from-pink-600/20 to-rose-500/20',
        border: 'border-pink-500/30',
        accent: 'text-pink-400',
        bg: 'bg-pink-500/10',
      },
      Barroco: {
        gradient: 'from-purple-600/20 to-violet-500/20',
        border: 'border-purple-500/30',
        accent: 'text-purple-400',
        bg: 'bg-purple-500/10',
      },
      Clássico: {
        gradient: 'from-emerald-600/20 to-green-500/20',
        border: 'border-emerald-500/30',
        accent: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
      Romântico: {
        gradient: 'from-amber-600/20 to-yellow-500/20',
        border: 'border-amber-500/30',
        accent: 'text-amber-400',
        bg: 'bg-amber-500/10',
      },
      Impressionismo: {
        gradient: 'from-orange-600/20 to-red-500/20',
        border: 'border-orange-500/30',
        accent: 'text-orange-400',
        bg: 'bg-orange-500/10',
      },
      Moderno: {
        gradient: 'from-indigo-600/20 to-purple-500/20',
        border: 'border-indigo-500/30',
        accent: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
      },
      Teoria: {
        gradient: 'from-cyan-600/20 to-sky-500/20',
        border: 'border-cyan-500/30',
        accent: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
      },
      Futuro: {
        gradient: 'from-gray-600/20 to-slate-500/20',
        border: 'border-gray-500/30',
        accent: 'text-gray-400',
        bg: 'bg-gray-500/10',
      },
    };

    return (
      styles[type as keyof typeof styles] || {
        gradient: 'from-brand-primary/20 to-brand-secondary/20',
        border: 'border-brand-primary/30',
        accent: 'text-brand-primary',
        bg: 'bg-brand-primary/10',
      }
    );
  };

  const style = getFactStyle(fact.category);

  const { language } = useLanguageStore();
  // Animação escalonada baseada no índice
  const animationDelay = `${index * 100}ms`;

  return (
    <div
      className={`
        classical-card-simple overflow-hidden transition-all duration-500 ease-out 
        group hover:scale-[1.02] relative
        bg-gradient-to-br ${style.gradient} border ${style.border}
        animate-fade-in-up
      `}
      style={{ animationDelay }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
          >
            <span className="text-2xl">{fact.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`text-lg font-bold classical-title group-hover:${style.accent} transition-colors duration-300`}
              >
                {fact.title[language]}
              </h3>

              {/* Category badge */}
              <span
                className={`inline-flex items-center px-2 py-1 ${style.bg} border ${style.border} rounded-full text-xs font-medium ${style.accent}`}
              >
                {fact.category}
              </span>
            </div>

            {/* Content preview */}
            <p
              className={`text-theme-secondary leading-relaxed transition-all duration-300 `}
            >
              {fact.content[language]}
            </p>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none bg-gradient-to-br ${style.gradient}`}
      ></div>

      {/* Floating decoration */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <GiMusicalNotes className={`w-5 h-5 ${style.accent}`} />
      </div>
    </div>
  );
};

const MusicalFacts: React.FC<MusicalFactsProps> = ({
  facts: initialFacts,
  initialCount = 4,
}) => {
  const [displayedFacts, setDisplayedFacts] = React.useState<MusicalFact[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [loadedCount, setLoadedCount] = React.useState(initialCount);
  const [mounted, setMounted] = React.useState(false);
  const { t } = useTranslation({ sections: ['pages/home'] });
  const { language } = useLanguageStore();

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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="classical-card-simple p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-wrap relative !mb-8">
      <SectionTitle
        title={t('musical_facts_title')}
        subtitle={t('musical_facts_subtitle')}
        icon={<FiBookOpen className="w-6 h-6" />}
        accent="blue"
      />

      {/* Filter and Controls */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-theme-secondary">
            <FiFilter className="w-4 h-4" />
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
        <button
          onClick={refreshFacts}
          disabled={isLoading}
          className="btn-classical-secondary flex items-center gap-2 text-sm"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          {t('musical_facts_shuffle')}
        </button>
      </div>

      {/* Facts grid */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="classical-card-simple p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl loading-skeleton"></div>
                <div className="flex-1">
                  <div className="h-4 loading-skeleton rounded mb-2"></div>
                  <div className="h-3 loading-skeleton rounded mb-3 w-3/4"></div>
                  <div className="h-3 loading-skeleton rounded mb-2"></div>
                  <div className="h-3 loading-skeleton rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedFacts.map((fact, index) => (
            <FactCard
              key={`${fact.id}-${selectedCategory}-${language}`}
              fact={fact}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Floating fact bubbles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
    </section>
  );
};

export default MusicalFacts;
