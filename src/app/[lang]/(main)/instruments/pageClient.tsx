'use client';

import { useState } from 'react';
import { GiGrandPiano, GiViolin, GiHarp, GiPipeOrgan } from 'react-icons/gi';
import {
  PiArrowSquareOut,
  PiArrowsIn,
  PiArrowsOut,
  PiCalendar,
  PiCaretDown,
  PiCaretUp,
  PiClock,
  PiClockCounterClockwise,
  PiGuitar,
  PiLightbulb,
  PiMapPin,
  PiMedal,
  PiMusicNote,
  PiMusicNotes,
  PiPlay,
  PiStarFill,
  PiTrendUp,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import FloatingIcons from '../../../components/FloatingIcons';
import AnimatedMusicalNotes from '../../../components/AnimatedMusicalNotes';
import Image from '@/app/components/SmartImage';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  epochName: string | null;
}

interface Work {
  id: string;
  title: string;
  composer: Composer;
  opOrCatalog: string | null;
  compositionYear: string | null;
  tone: string | null;
  mediaDuration: string | null;
  imslpPermlink: string;
  videoUrl: string | null;
}

interface InstrumentHistoricalData {
  name: string;
  category: string;
  origin: string;
  inventor: string | null;
  inventionPeriod: string;
  description: string;
  detailedHistory: string;
  characteristics: string[];
  evolution: string[];
  notableFeatures: string[];
  famousPerformers: string[];
  imageUrl: string;
  iconName: string;
}

interface InstrumentWithWorks {
  id: string;
  name: string;
  historicalData: InstrumentHistoricalData;
  works: Work[];
  stats: {
    totalWorks: number;
    totalUsers: number;
  };
  topComposers: {
    composer: Composer;
    count: number;
  }[];
}

interface Props {
  instruments: InstrumentWithWorks[];
  hasError?: boolean;
}

const iconMap = {
  Piano: GiGrandPiano,
  Music: PiMusicNotes,
  Music2: GiViolin,
  Music3: PiGuitar,
  Music4: GiPipeOrgan,
  Users: PiUsers,
  Harp: GiHarp,
  Violin: GiViolin,
  Cello: PiMusicNotes,
  Organ: GiPipeOrgan,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || PiMusicNotes;
};

export function InstrumentsPageClient({
  instruments,
  hasError = false,
}: Props) {
  const { t } = useTranslation({ sections: ['pages/instruments'] });

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [expandedInstruments, setExpandedInstruments] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (instrumentId: string, section: string) => {
    const key = `${instrumentId}-${section}`;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleInstrument = (instrumentId: string) => {
    setExpandedInstruments((prev) => ({
      ...prev,
      [instrumentId]: !prev[instrumentId],
    }));
  };

  const isExpanded = (instrumentId: string, section: string) => {
    return expandedSections[`${instrumentId}-${section}`];
  };

  const isInstrumentExpanded = (instrumentId: string) => {
    return expandedInstruments[instrumentId];
  };

  if (hasError) {
    return (
      <div className=" flex items-center justify-center bg-gradient-primary">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
            <PiMusicNotes className="w-10 h-10 text-theme-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-theme-primary classical-title">
            {t('instruments_jsx_h2_children_0__erro_carregar_instrumentos')}
          </h2>
          <p className="text-theme-secondary classical-subtitle">
            {t('instruments_jsx_p_children_0__tente_recarregar_pagina')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  bg-gradient-primary">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-primary pt-24 flex items-center">
          <AnimatedMusicalNotes />

          <div className="section-wrap mx-auto relative z-10">
            <div className="text-center space-y-8">
              {/* Floating Icons */}
              <FloatingIcons />
              {/* Main Title */}
              <div
                className="space-y-6 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <h1 className="text-5xl lg:text-7xl font-bold text-theme-primary classical-title tracking-tight leading-tight">
                  {t('hero_jsx_h1_children_0__historia_dos')} {''}
                  <span className="block text-gradient-brand bg-clip-text text-transparent mt-2">
                    {t('hero_jsx_span_children_0__instrumentos_musicais')}
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-theme-secondary classical-subtitle mb-8 max-w-4xl mx-auto leading-relaxed">
                  {t('hero_jsx_p_children_0__explore_rica_historia')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="section-wrap space-y-12 ">
          {instruments.map((instrument) => {
            const Icon = getIcon(instrument.historicalData.iconName);
            const isInstrumentOpen = isInstrumentExpanded(instrument.id);

            return (
              <div
                key={instrument.id}
                className="classical-card group relative overflow-hidden  animate-fade-in-up"
              >
                <div
                  className="flex items-center justify-between  px-0 py-2 md:px-8 md:py-6 cursor-pointer transition-all duration-300 hover:bg-interactive-hover relative z-10"
                  onClick={() => toggleInstrument(instrument.id)}
                >
                  <Inline gap={6}>
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-10 h-10 text-theme-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl text-theme-primary classical-title mb-2 group-hover:text-brand-primary transition-colors duration-300">
                        {instrument.historicalData.name}
                      </h2>
                      <p className="text-theme-secondary text-md md:text-lg classical-subtitle mb-1">
                        {instrument.historicalData.category} •{' '}
                        {instrument.historicalData.origin}
                      </p>
                      <Text papel="rotulo" tom="fraco" as="p">
                        {instrument.historicalData.inventionPeriod}
                      </Text>
                    </div>
                  </Inline>

                  <Inline gap={6}>
                    <div className="text-center hidden md:block">
                      <div className="text-2xl font-bold text-brand-primary classical-title">
                        {instrument.stats.totalWorks}
                      </div>
                      <Text papel="rotulo" tom="suave" as="div">
                        {t('instruments_jsx_div_children_0__obras')}
                      </Text>
                    </div>

                    <div className="w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-brand-primary/20">
                      {isInstrumentOpen ? (
                        <PiArrowsIn className="w-4 h-4 text-theme-primary" />
                      ) : (
                        <PiArrowsOut className="w-4 h-4 text-theme-primary" />
                      )}
                    </div>
                  </Inline>
                </div>

                {/* Expandable Content */}
                <div
                  className={`overflow-hidden transition-all duration-700 ease-in-out ${
                    isInstrumentOpen
                      ? 'max-h-[5000px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="py-4 px-2 md:p-8 space-y-8">
                    {/* Brief Description */}
                    <div className="classical-card-2 p-6 relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-theme-secondary text-md md:text-lg leading-relaxed classical-body">
                          {instrument.historicalData.description}
                        </p>
                      </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Historical Info */}
                      <div className="space-y-6">
                        {/* Detailed History */}
                        <div className="classical-card-2 p-6 relative overflow-hidden">
                          <div className="relative z-10">
                            <Inline gap={3} className="mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                                <PiClockCounterClockwise className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                {t(
                                  'instruments_jsx_h3_children_0__historia_detalhada'
                                )}
                              </h3>
                            </Inline>
                            <Text
                              papel="rotulo"
                              tom="suave"
                              as="p"
                              className="leading-relaxed classical-body"
                            >
                              {instrument.historicalData.detailedHistory}
                            </Text>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="classical-card-2 p-6 relative overflow-hidden">
                          <div className="relative z-10">
                            <Inline gap={3} className="mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                                <PiMapPin className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                {t(
                                  'instruments_jsx_h3_children_0__informacoes_basicas'
                                )}
                              </h3>
                            </Inline>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  {t('instruments_jsx_span_children_0__origem')}
                                </span>
                                <span className="text-theme-primary font-medium">
                                  {instrument.historicalData.origin}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  {t(
                                    'instruments_jsx_span_children_0__inventor'
                                  )}
                                </span>
                                <span className="text-theme-primary font-medium">
                                  {instrument.historicalData.inventor ||
                                    t(
                                      'instruments_jsx_span_children_0__desconhecido'
                                    )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  {t(
                                    'instruments_jsx_span_children_0__periodo'
                                  )}
                                </span>
                                <span className="text-theme-primary font-medium">
                                  {instrument.historicalData.inventionPeriod}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  {t(
                                    'instruments_jsx_span_children_0__categoria'
                                  )}
                                </span>
                                <span className="text-theme-primary font-medium">
                                  {instrument.historicalData.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Top Composer */}
                        {instrument.topComposers[0] && (
                          <div className="classical-card-2 p-6 relative overflow-hidden">
                            <div className="relative z-10">
                              <Inline gap={3} className="mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                                  <PiMedal className="w-4 h-4 text-theme-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-theme-primary classical-title">
                                  {t(
                                    'instruments_jsx_h3_children_0__compositor_destaque'
                                  )}
                                </h3>
                              </Inline>
                              <Inline gap={4}>
                                {instrument.topComposers[0].composer
                                  .portraitUrl ? (
                                  <Link
                                    href={`/composer/${instrument.topComposers[0].composer.id}`}
                                  >
                                    <Image
                                      src={
                                        instrument.topComposers[0].composer
                                          .portraitUrl
                                      }
                                      alt={
                                        instrument.topComposers[0].composer.name
                                      }
                                      width={56}
                                      height={56}
                                      className="w-14 h-14 rounded-full border-2 border-brand-primary/30 shadow-theme-medium"
                                    />
                                  </Link>
                                ) : (
                                  <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/30 shadow-theme-medium">
                                    <PiUser className="w-7 h-7 text-theme-primary" />
                                  </div>
                                )}
                                <div>
                                  <Link
                                    href={`/composer/${instrument.topComposers[0].composer.id}`}
                                  >
                                    <div className="text-theme-primary font-bold text-lg classical-title">
                                      {
                                        instrument.topComposers[0].composer
                                          .fullName
                                      }
                                    </div>
                                  </Link>

                                  <Text papel="rotulo" tom="suave" as="div">
                                    {instrument.topComposers[0].count}{' '}
                                    {t(
                                      'instruments_jsx_span_children_0__obras_minuscula'
                                    )}{' '}
                                  </Text>
                                </div>
                              </Inline>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Expandable Sections */}
                      <div className="space-y-4">
                        {/* Characteristics */}
                        <div className="classical-card-2 overflow-hidden">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'characteristics')
                            }
                            className="w-full flex items-center justify-between p-6 text-left transition-all duration-300 hover:bg-interactive-hover group/button"
                          >
                            <Inline gap={3}>
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <PiLightbulb className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                {t(
                                  'instruments_jsx_h3_children_0__caracteristicas'
                                )}
                              </h3>
                            </Inline>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'characteristics')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'characteristics') ? (
                                <PiCaretUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <PiCaretDown className="w-4 h-4 text-theme-primary" />
                              )}
                            </div>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                              isExpanded(instrument.id, 'characteristics')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6 border-t border-theme-secondary">
                              <div className="space-y-3 pt-4">
                                {instrument.historicalData.characteristics.map(
                                  (char, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-accent-blue/5 to-accent-purple/5 border border-accent-blue/20 rounded-xl hover:border-accent-blue/40 transition-all duration-300 group/item"
                                      style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                      <div className="w-2 h-2 bg-accent-blue rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300" />
                                      <span className="text-theme-secondary leading-relaxed group-hover/item:text-theme-primary transition-colors duration-300">
                                        {char}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Evolution */}
                        <div className="classical-card-2 overflow-hidden">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'evolution')
                            }
                            className="w-full flex items-center justify-between p-6 text-left transition-all duration-300 hover:bg-interactive-hover group/button"
                          >
                            <Inline gap={3}>
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <PiTrendUp className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                {t(
                                  'instruments_jsx_h3_children_0__evolucao_historica'
                                )}
                              </h3>
                            </Inline>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'evolution')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'evolution') ? (
                                <PiCaretUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <PiCaretDown className="w-4 h-4 text-theme-primary" />
                              )}
                            </div>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                              isExpanded(instrument.id, 'evolution')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6 border-t border-theme-secondary">
                              <div className="space-y-4 pt-4">
                                {instrument.historicalData.evolution.map(
                                  (stage, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-accent-green/5 to-accent-blue/5 border border-accent-green/20 rounded-xl hover:border-accent-green/40 transition-all duration-300 group/item"
                                    >
                                      <Text
                                        papel="rotulo"
                                        tom="forte"
                                        as="div"
                                        className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-accent-green to-accent-blue rounded-full font-bold flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300"
                                      >
                                        {i + 1}
                                      </Text>
                                      <div className="text-theme-secondary group-hover/item:text-theme-primary transition-colors duration-300">
                                        {stage}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notable Features */}
                        <div className="classical-card-2 overflow-hidden">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'features')
                            }
                            className="w-full flex items-center justify-between p-6 text-left transition-all duration-300 hover:bg-interactive-hover group/button"
                          >
                            <Inline gap={3}>
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <PiStarFill className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                {t(
                                  'instruments_jsx_h3_children_0__caracteristicas_tecnicas'
                                )}
                              </h3>
                            </Inline>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'features')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'features') ? (
                                <PiCaretUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <PiCaretDown className="w-4 h-4 text-theme-primary" />
                              )}
                            </div>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                              isExpanded(instrument.id, 'features')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6 border-t border-theme-secondary">
                              <div className="space-y-3 pt-4">
                                {instrument.historicalData.notableFeatures.map(
                                  (feature, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-accent-purple/5 to-accent-red/5 border border-accent-purple/20 rounded-xl hover:border-accent-purple/40 transition-all duration-300 group/item"
                                    >
                                      <div className="w-2 h-2 bg-accent-purple rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300" />
                                      <span className="text-theme-secondary leading-relaxed group-hover/item:text-theme-primary transition-colors duration-300">
                                        {feature}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Famous Performers */}
                        <div className="classical-card-2 overflow-hidden">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'performers')
                            }
                            className="w-full flex items-center justify-between p-6 text-left transition-all duration-300 hover:bg-interactive-hover group/button"
                          >
                            <Inline gap={3}>
                              <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <PiStarFill className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                {t(
                                  'instruments_jsx_h3_children_0__interpretes_famosos'
                                )}
                              </h3>
                            </Inline>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'performers')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'performers') ? (
                                <PiCaretUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <PiCaretDown className="w-4 h-4 text-theme-primary" />
                              )}
                            </div>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                              isExpanded(instrument.id, 'performers')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6 border-t border-theme-secondary">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                {instrument.historicalData.famousPerformers.map(
                                  (performer, i) => (
                                    <div
                                      key={i}
                                      className="classical-card-simple rounded-xl p-4 text-theme-secondary hover:text-theme-primary hover:border-brand-primary/30 transition-all duration-300 group/performer"
                                      style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                      <Inline gap={3}>
                                        <div className="w-2 h-2 bg-brand-primary rounded-full group-hover/performer:scale-150 transition-transform duration-300" />
                                        <span className="font-medium">
                                          {performer}
                                        </span>
                                      </Inline>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Works Section */}
                    <div className="classical-card-2 overflow-hidden">
                      <button
                        onClick={() => toggleSection(instrument.id, 'works')}
                        className="w-full flex items-center justify-between p-6 text-left transition-all duration-300 hover:bg-interactive-hover group/button"
                      >
                        <Inline gap={3}>
                          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                            <PiMusicNotes className="w-5 h-5 text-theme-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-theme-primary classical-title">
                              {t(
                                'instruments_jsx_h3_children_0__obras_selecionadas'
                              )}
                            </h3>
                            <Text papel="rotulo" tom="suave" as="p">
                              {instrument.works.length}{' '}
                              {t(
                                'instruments_jsx_p_children_0__composicoes_disponiveis'
                              )}
                            </Text>
                          </div>
                        </Inline>
                        <div
                          className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isExpanded(instrument.id, 'works')
                              ? 'rotate-180 bg-brand-primary/20'
                              : 'group-hover/button:bg-brand-primary/10'
                          }`}
                        >
                          {isExpanded(instrument.id, 'works') ? (
                            <PiCaretUp className="w-4 h-4 text-theme-primary" />
                          ) : (
                            <PiCaretDown className="w-4 h-4 text-theme-primary" />
                          )}
                        </div>
                      </button>

                      {/* A lista só é montada quando a seção abre. Fechada,
                          ela continuava no HTML — escondida por CSS — e as
                          107 obras da vitrine dobravam a página que ninguém
                          tinha aberto ainda. */}
                      <div
                        className={`overflow-hidden transition-all duration-700 ease-in-out ${
                          isExpanded(instrument.id, 'works')
                            ? 'max-h-[2000px] opacity-100'
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 pb-6 border-t border-theme-secondary">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                            {isExpanded(instrument.id, 'works') &&
                              instrument.works.map((work, workIndex) => (
                                <div
                                  key={work.id}
                                  className="classical-card-simple p-5 group/work hover:scale-105 transition-all duration-300 relative overflow-hidden"
                                  style={{
                                    animationDelay: `${workIndex * 0.05}s`,
                                  }}
                                >
                                  <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1 min-w-0">
                                        <Link href={`/works/${work.id}`}>
                                          <h4 className="text-theme-primary font-bold text-lg line-clamp-2 group-hover/work:text-brand-primary transition-colors duration-300 classical-title">
                                            {work.title}
                                          </h4>
                                        </Link>
                                        <Text
                                          papel="rotulo"
                                          tom="suave"
                                          as="p"
                                          className="mt-1 classical-subtitle"
                                        >
                                          {work.composer.name}
                                        </Text>
                                      </div>
                                      {work.videoUrl && (
                                        <div className="ml-2 w-8 h-8 bg-accent-red/20 hover:bg-accent-red/40 rounded-full flex items-center justify-center transition-all duration-300 group-hover/work:scale-110">
                                          <PiPlay className="w-3 h-3 text-accent-red" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-2 text-sm mb-4">
                                      {work.opOrCatalog && (
                                        <div className="flex items-center text-theme-secondary">
                                          <div className="w-4 h-4 bg-gradient-to-br from-accent-blue to-accent-purple rounded flex items-center justify-center mr-2">
                                            <PiMusicNotes className="w-3 h-3 text-theme-primary" />
                                          </div>
                                          {work.opOrCatalog}
                                        </div>
                                      )}
                                      {work.compositionYear && (
                                        <div className="flex items-center text-theme-secondary">
                                          <div className="w-4 h-4 bg-gradient-to-br from-accent-green to-accent-blue rounded flex items-center justify-center mr-2">
                                            <PiCalendar className="w-3 h-3 text-theme-primary" />
                                          </div>
                                          {work.compositionYear}
                                        </div>
                                      )}
                                      {work.tone && (
                                        <div className="flex items-center text-theme-secondary">
                                          <div className="w-4 h-4 bg-gradient-to-br from-accent-purple to-accent-red rounded flex items-center justify-center mr-2">
                                            <PiMusicNote className="w-3 h-3 text-theme-primary" />
                                          </div>
                                          {work.tone}
                                        </div>
                                      )}
                                      {work.mediaDuration && (
                                        <div className="flex items-center text-theme-secondary">
                                          <div className="w-4 h-4 bg-gradient-to-br from-brand-primary to-brand-secondary rounded flex items-center justify-center mr-2">
                                            <PiClock className="w-3 h-3 text-theme-primary" />
                                          </div>
                                          {work.mediaDuration}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                                      <Link
                                        href={`/composer/${work.composer.id}`}
                                        className="flex items-center space-x-3"
                                      >
                                        {work.composer.portraitUrl ? (
                                          <Image
                                            src={work.composer.portraitUrl}
                                            alt={work.composer.name}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full border-2 border-brand-primary/30 shadow-theme-medium"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/30">
                                            <PiUser className="w-3 h-3 text-theme-primary" />
                                          </div>
                                        )}
                                        <div>
                                          <Text
                                            papel="rotulo"
                                            tom="forte"
                                            as="div"
                                            className="font-medium classical-subtitle"
                                          >
                                            {work.composer.fullName}
                                          </Text>
                                        </div>
                                      </Link>
                                      <Link
                                        href={`/works/${work.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 bg-interactive-hover hover:bg-brand-primary/20 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/work:scale-110"
                                      >
                                        <PiArrowSquareOut className="w-3 h-3 text-theme-primary hover:text-brand-primary transition-colors duration-300" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse z-20"></div>
      <div
        className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse z-20"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse z-20"
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className="fixed bottom-20 right-4 w-1.5 h-1.5 bg-accent-blue/30 rounded-full animate-pulse z-20"
        style={{ animationDelay: '0.5s' }}
      ></div>
    </div>
  );
}
