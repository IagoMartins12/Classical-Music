// EpochSection.tsx - Premium version with theme system
'use client';

import { useState } from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCaretDown,
  PiCaretUp,
  PiClock,
  PiGear,
  PiMusicNotes,
  PiScroll,
  PiStar,
  PiUsers,
} from 'react-icons/pi';
import { HistoryComposerCard } from '../cards/HistoryComposerCard';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  birthDate: string | null;
  deathDate: string | null;
  /** Resumo, não o texto inteiro — o cartão mostra as primeiras linhas. */
  bio: string | null;
}

interface EpochData {
  id: string;
  name: string;
  period: string;
  description: string;
  characteristics: string[];
  keyDevelopments: string[];
  musicalForms: string[];
  instruments: string[];
}

interface EpochComposers {
  epochId: string;
  epochName: string;
  composers: Composer[];
  historicalData?: EpochData | null;
}

interface Props {
  epoch: EpochComposers;
  index: number;
  isReversed?: boolean;
}

const epochColors = {
  Medieval: '',
  Renascentista: '',
  Barroco: '',
  Clássico: '',
  Romântico: '',
  Moderno: '',
};

const epochIcons = {
  Medieval: PiScroll,
  Renascentista: PiMusicNotes,
  Barroco: GiGrandPiano,
  Clássico: PiMusicNotes,
  Romântico: PiUsers,
  Moderno: PiGear,
};

export function EpochSection({ epoch, index, isReversed = false }: Props) {
  const { t } = useTranslation({ sections: ['pages/music-history'] });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllComposers, setShowAllComposers] = useState(false);

  const epochKey =
    Object.keys(epochColors).find(
      (key) =>
        epoch.epochName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(epoch.epochName.toLowerCase())
    ) || 'Moderno';

  const gradientClass = epochColors[epochKey as keyof typeof epochColors];
  const IconComponent = epochIcons[epochKey as keyof typeof epochIcons];

  const visibleComposers = showAllComposers
    ? epoch.composers
    : epoch.composers.slice(0, 4);

  return (
    <div
      className={`flex flex-col ${
        isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
      } gap-12 items-start animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      {/* Content Section */}
      <div className="flex-1 gap-8 flex flex-col">
        {/* Header */}
        <div className="relative flex justify-center lg:justify-start">
          <div
            className={`inline-flex items-center px-12 py-4 rounded-2xl bg-gradient-to-r ${gradientClass} text-theme-inverse shadow-theme-glow backdrop-blur-md relative overflow-hidden group hover:scale-105 transition-all duration-500`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative z-10 flex items-center">
              <div className="w-12 h-12 backdrop-blur-md rounded-xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-500">
                <IconComponent className="text-2xl text-theme-primary" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold classical-title">
                  {epoch.epochName}
                </h2>
                {epoch.historicalData?.period && (
                  <p className="text-sm opacity-90 classical-subtitle">
                    {epoch.historicalData.period}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {epoch.historicalData?.description && (
          <Card
            densidade="larga"
            className="group transition-all duration-500 relative overflow-hidden"
          >
            {/* Decorative element */}
            <div className="absolute top-4 right-4 text-3xl">
              <PiMusicNotes />
            </div>

            <Stack className="relative z-10">
              <Inline gap={3}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                  <PiBookOpen className="w-4 h-4 text-theme-primary" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary classical-title">
                  {t('epoch_jsx_h3_children_0__sobre_periodo')}
                </h3>
              </Inline>
              <p className="text-theme-secondary sm:text-lg leading-relaxed classical-body medida-texto">
                {epoch.historicalData.description}
              </p>
            </Stack>
          </Card>
        )}

        {/* Expandable Details */}
        {epoch.historicalData && (
          <div className="classical-card overflow-hidden group">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-2 sm:p-6 text-left flex items-center justify-between transition-all duration-300 group/button"
            >
              <Inline gap={3}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                  <PiStar className="w-5 h-5 text-theme-primary" />
                </div>
                <h3 className="text-xl font-semibold text-theme-primary classical-title">
                  {t(
                    'epoch_jsx_h3_children_0__caracteristicas_desenvolvimentos'
                  )}
                </h3>
              </Inline>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                {isExpanded ? (
                  <PiCaretUp className="w-4 h-4 text-theme-primary" />
                ) : (
                  <PiCaretDown className="w-4 h-4 text-theme-primary" />
                )}
              </div>
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 border-t border-theme-secondary">
                <div className="grid md:grid-cols-2 gap-6 pt-6">
                  {/* Características */}
                  <div className="gap-4 flex flex-col">
                    <Inline gap={3} className="">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <PiMusicNotes className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        {t('epoch_jsx_h4_children_0__caracteristicas')}
                      </h4>
                    </Inline>
                    <Stack gap={3}>
                      {epoch.historicalData.characteristics.map((char, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 group/item bg-sup-2"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300" />
                          <span className="text-theme-secondary leading-relaxed transition-colors duration-300">
                            {char}
                          </span>
                        </div>
                      ))}
                    </Stack>
                  </div>

                  {/* Desenvolvimentos */}
                  <div className="gap-4 flex flex-col">
                    <Inline gap={3} className="">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <PiClock className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        {t('epoch_jsx_h4_children_0__desenvolvimentos_chave')}
                      </h4>
                    </Inline>
                    <Stack gap={3}>
                      {epoch.historicalData.keyDevelopments.map((dev, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 group/item bg-sup-2"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300" />
                          <span className="text-theme-secondary leading-relaxed transition-colors duration-300">
                            {dev}
                          </span>
                        </div>
                      ))}
                    </Stack>
                  </div>

                  {/* Formas Musicais */}
                  <div className="gap-4 flex flex-col">
                    <Inline gap={3} className="">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <PiMusicNotes className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        {t('epoch_jsx_h4_children_0__formas_musicais')}
                      </h4>
                    </Inline>
                    <div className="flex flex-wrap gap-3">
                      {epoch.historicalData.musicalForms.map((form, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 cursor-default bg-sup-2"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          {form}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instrumentos */}
                  <div className="gap-4 flex flex-col">
                    <Inline gap={3} className="">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <GiGrandPiano className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        {t('epoch_jsx_h4_children_0__instrumentos')}
                      </h4>
                    </Inline>
                    <div className="flex flex-wrap gap-3">
                      {epoch.historicalData.instruments.map((instrument, i) => (
                        <Text
                          papel="rotulo"
                          tom="ouro"
                          key={i}
                          className="px-4 py-2 rounded-full font-medium hover:scale-105 transition-all duration-300 cursor-default bg-sup-2"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          {instrument}
                        </Text>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composers Section */}
      <div className="flex-1 w-full lg:max-w-md">
        <Card className="sticky top-6">
          <Inline gap={3} className="mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <PiUsers className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-primary classical-title">
                {t('epoch_jsx_h3_children_0__compositores_famosos')}
              </h3>
              <Text papel="rotulo" tom="fraco" as="p">
                {epoch.composers.length}{' '}
                {epoch.composers.length === 1
                  ? t('epoch_jsx_span_children_0__compositor')
                  : t('epoch_jsx_span_children_0__compositores')}
              </Text>
            </div>
          </Inline>

          <Stack>
            {visibleComposers.map((composer, composerIndex) => (
              <div
                key={composer.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.2 + composerIndex * 0.1}s`,
                }}
              >
                <HistoryComposerCard composer={composer} />
              </div>
            ))}

            {epoch.composers.length > 4 && (
              <Inline
                as="button"
                gap={2}
                onClick={() => setShowAllComposers(!showAllComposers)}
                className="w-full p-4 border-2 border-dashed border-theme-primary text-theme-primary transition-all duration-300 rounded-xl group justify-center"
              >
                <PiUsers className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">
                  {showAllComposers
                    ? t('epoch_jsx_span_children_0__ver_menos')
                    : `${t('epoch_jsx_span_children_0__ver_mais')} ${
                        epoch.composers.length - 4
                      } ${t('epoch_jsx_span_children_0__compositores')}`}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showAllComposers
                      ? 'rotate-180'
                      : 'group-hover:translate-y-0.5'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Inline>
            )}
          </Stack>
        </Card>
      </div>
    </div>
  );
}
