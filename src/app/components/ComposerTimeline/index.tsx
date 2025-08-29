// ComposersTimeline.tsx - Premium version with theme system
'use client';

import { useMemo } from 'react';
import { FiClock,  } from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';
import { useTranslation } from '@/app/context/TranslationContext';
import { ComposerTimelineCard } from '../ComposerTimelineCard';

interface ComposerTimeline {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  birthDate: string | null;
  deathDate: string | null;
  bio: string | null;
  epochName: string;
  birthYear: number | null;
  deathYear: number | null;
  // Campos adicionados durante o processamento
  extractedBirthYear?: number | null;
  extractedDeathYear?: number | null;
  epochKey?: string;
  gradientClass?: string;
  dotColorClass?: string;
}

interface Props {
  composers: ComposerTimeline[];
}

const epochColors = {
  Medieval: 'from-accent-gold to-brand-secondary',
  Renaissance: 'from-accent-green to-accent-blue',
  Baroque: 'from-accent-purple to-accent-red',
  Classical: 'from-accent-blue to-accent-purple',
  Romantic: 'from-accent-red to-accent-purple',
  Modern: 'from-theme-tertiary to-theme-secondary',
};

const epochDotColors = {
  Medieval: 'bg-gradient-to-br from-accent-gold to-brand-secondary',
  Renaissance: 'bg-gradient-to-br from-accent-green to-accent-blue',
  Baroque: 'bg-gradient-to-br from-accent-purple to-accent-red',
  Classical: 'bg-gradient-to-br from-accent-blue to-accent-purple',
  Romantic: 'bg-gradient-to-br from-accent-red to-accent-purple',
  Modern: 'bg-gradient-to-br from-theme-tertiary to-theme-secondary',
};

// Mapeamento explícito entre nomes em português e inglês
const epochMapping: Record<string, keyof typeof epochColors> = {
  Medieval: 'Medieval',
  Renascentista: 'Renaissance',
  Barroco: 'Baroque',
  Clássico: 'Classical',
  Romântico: 'Romantic',
  Modernismo: 'Modern',
  Moderno: 'Modern',
};

// Função para extrair ano de diferentes formatos de data
const extractYear = (dateStr: string | null): number | null => {
  if (!dateStr) return null;

  // Remove "ca." e outros prefixos
  const cleanDate = dateStr.replace(/^(ca\.|c\.|around|about)\s*/i, '');

  // Extrai o primeiro número de 4 dígitos encontrado
  const yearMatch = cleanDate.match(/\d{4}/);
  if (yearMatch) {
    return parseInt(yearMatch[0], 10);
  }

  // Para casos como "1515 or 1516", pega o primeiro ano
  const rangeMatch = cleanDate.match(/(\d{4})\s*(or|to|-)\s*\d{4}/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1], 10);
  }

  return null;
};

export function ComposersTimeline({ composers }: Props) {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  const timelineData = useMemo(() => {
    const composersWithYears = composers.map((composer) => {
      const birthYear = extractYear(composer.birthDate);
      const deathYear = extractYear(composer.deathDate);

      return {
        ...composer,
        extractedBirthYear: birthYear,
        extractedDeathYear: deathYear,
      };
    });

    const sortedComposers = [...composersWithYears].sort((a, b) => {
      const aYear = a.extractedBirthYear || 0;
      const bYear = b.extractedBirthYear || 0;
      return aYear - bYear;
    });

    return sortedComposers.map((composer) => {
      // Usa o mapeamento explícito em vez de busca por substring
      const epochKey = epochMapping[composer.epochName] || 'Modern';

      return {
        ...composer,
        epochKey,
        gradientClass: epochColors[epochKey],
        dotColorClass: epochDotColors[epochKey],
      };
    });
  }, [composers]);

  const getLifespan = (composer: any) => {
    if (!composer.extractedBirthYear)
      return t('timeline_jsx_span_children_0__periodo_desconhecido');
    if (!composer.extractedDeathYear)
      return `${composer.extractedBirthYear} - ${t(
        'timeline_jsx_span_children_0__presente'
      )}`;
    return `${composer.extractedBirthYear} - ${composer.extractedDeathYear}`;
  };

  const getLifespanDuration = (composer: any) => {
    if (!composer.extractedBirthYear || !composer.extractedDeathYear)
      return null;
    return composer.extractedDeathYear - composer.extractedBirthYear;
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
            <FiClock className="w-6 h-6 text-theme-primary" />
          </div>
          <div className="text-6xl text-brand-primary/10">
            <GiMusicalNotes />
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center shadow-theme-glow">
            <GiGrandPiano className="w-6 h-6 text-theme-primary" />
          </div>
        </div>

        <h2 className="text-3xl lg:text-4xl font-bold text-gradient-brand classical-title mb-4">
          {t('timeline_jsx_h2_children_0__linha_tempo_compositores')}
        </h2>
        <p className="text-lg text-theme-secondary classical-subtitle max-w-2xl mx-auto">
          {t('timeline_jsx_p_children_0__acompanhe_cronologia')}
        </p>
      </div>

      <div className="relative">
        {/* Timeline Line - Centralizada com gradiente */}
        <div className="absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-gold via-accent-purple via-accent-blue to-theme-tertiary rounded-full shadow-theme-glow" />

        {/* Timeline Items */}
        <div className="space-y-16">
          {timelineData.map((composer, index) => (
            <ComposerTimelineCard
              key={composer.id}
              composer={composer}
              index={index}
              getLifespan={getLifespan}
              getLifespanDuration={getLifespanDuration}
              previousEpochKey={
                index > 0 ? timelineData[index - 1].epochKey : undefined
              }
            />
          ))}
        </div>

        {/* Bottom decoration */}
        <div
          className="text-center mt-16 animate-fade-in-up"
          style={{ animationDelay: `${timelineData.length * 0.1}s` }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto shadow-theme-glow">
            <FiClock className="w-6 h-6 text-theme-primary" />
          </div>
          <p className="text-theme-tertiary text-sm mt-3 classical-caption">
            {t('timeline_jsx_p_children_0__fim_linha_tempo')}
          </p>
        </div>
      </div>
    </div>
  );
}
