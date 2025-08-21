// ComposersTimeline.tsx - Premium version with theme system
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { FiClock, FiUser, FiCalendar, FiMapPin } from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';
import { useTranslation } from '@/app/hooks/useTranslation';

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
  Rômantico: 'Romantic',
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
          {timelineData.map((composer, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={composer.id}
                className={`relative flex items-center mb-16 lg:mb-12 justify-end ${
                  isLeft ? 'lg:justify-start' : 'lg:justify-end'
                } animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Content Card */}
                <Link
                  href={`/composer/${composer.id}`}
                  className={`w-[90%] lg:w-[42%] classical-card p-6 hover:shadow-theme-glow transition-all duration-500 transform hover:scale-105 group relative overflow-hidden ${
                    isLeft ? 'lg:mr-auto' : 'lg:ml-auto'
                  }`}
                >
                  {/* Background decoration */}
                  <div className="absolute top-4 right-4 text-4xl text-brand-primary/5">
                    <GiMusicalNotes />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      {/* Portrait */}
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${composer.gradientClass} rounded-2xl flex items-center justify-center shadow-theme-medium flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}
                      >
                        {composer.portraitUrl ? (
                          <Image
                            src={composer.portraitUrl}
                            alt={composer.fullName}
                            width={56}
                            height={56}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-theme-inverse/20"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove(
                                'hidden'
                              );
                            }}
                          />
                        ) : null}
                        <FiUser
                          className={`text-theme-primary text-lg ${
                            composer.portraitUrl ? 'hidden' : ''
                          }`}
                        />
                      </div>

                      {/* Name and Epoch */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 line-clamp-2">
                          {composer.fullName}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${composer.gradientClass} text-theme-primary text-xs rounded-full font-medium shadow-theme-small classical-card-simple mt-2`}
                        >
                          <FiMapPin className="w-3 h-3 mr-1 text-theme-primary" />
                          {composer.epochName}
                        </span>
                      </div>
                    </div>

                    {/* Lifespan */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-xl">
                      <div className="flex items-center text-theme-secondary">
                        <div className="w-6 h-6 bg-accent-blue/20 border border-accent-blue/30 rounded-lg flex items-center justify-center mr-2">
                          <FiCalendar className="w-3 h-3 text-accent-blue" />
                        </div>
                        <span className="font-medium text-sm">
                          {getLifespan(composer)}
                        </span>
                      </div>
                      {getLifespanDuration(composer) && (
                        <span className="text-xs text-theme-tertiary bg-theme-elevated border border-theme-secondary px-2 py-1 rounded-full">
                          {getLifespanDuration(composer)}{' '}
                          {t('timeline_jsx_span_children_0__anos')}
                        </span>
                      )}
                    </div>

                    {/* Bio */}
                    {composer.bio && (
                      <div className="border-t border-theme-secondary pt-4">
                        <p className="text-theme-secondary text-sm leading-relaxed classical-body">
                          {composer.bio.length > 120
                            ? `${composer.bio.substring(0, 120)}...`
                            : composer.bio}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-end mt-4 pt-3 border-t border-theme-secondary">
                      <div className="flex items-center text-brand-primary text-sm font-medium group-hover/cta:translate-x-1 transition-transform duration-300">
                        <span>
                          {t('timeline_jsx_span_children_0__ver_detalhes')}
                        </span>
                        <svg
                          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                </Link>

                {/* Timeline Dot - Centralizado */}
                <div
                  className={`absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 w-6 h-6 ${composer.dotColorClass} rounded-full border-4 border-theme-primary shadow-theme-glow z-10 group-hover:scale-125 transition-transform duration-300`}
                >
                  <div className="absolute inset-1 bg-theme-inverse/20 rounded-full animate-pulse"></div>
                </div>

                {/* Connector Line */}
                <div
                  className={`absolute left-3 lg:left-1/2 transform lg:-translate-x-1/2 w-12 lg:w-20 h-0.5 bg-gradient-to-r from-theme-primary to-transparent ${
                    isLeft ? 'lg:ml-3' : 'lg:-ml-3'
                  } ${isLeft ? 'lg:rotate-12' : 'lg:-rotate-12'} z-0`}
                  style={{
                    transformOrigin: isLeft ? 'left center' : 'right center',
                  }}
                />

                {/* Era label for significant transitions */}
                {index > 0 &&
                  timelineData[index - 1].epochKey !== composer.epochKey && (
                    <div className="absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 -top-12 lg:-top-12">
                      <div
                        className={`px-4 py-2 bg-gradient-to-r classical-card-simple ${composer.gradientClass} text-theme-primary text-xs rounded-full shadow-theme-medium whitespace-nowrap font-medium`}
                      >
                        {t('timeline_jsx_span_children_0__era')}{' '}
                        {composer.epochName}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
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
