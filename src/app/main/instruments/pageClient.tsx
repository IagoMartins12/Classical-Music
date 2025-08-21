'use client';

import { useState } from 'react';
import {
  FaMusic,
  FaGuitar,
  FaUsers,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaPlay,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaMapMarkerAlt,
  FaLightbulb,
  FaAward,
  FaExternalLinkAlt,
  FaHistory,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';
import { GiGrandPiano, GiViolin, GiHarp, GiPipeOrgan } from 'react-icons/gi';
import { IoIosTrendingUp } from 'react-icons/io';
import { MdMusicNote } from 'react-icons/md';
import Link from 'next/link';
import FloatingIcons from '../../components/FloatingIcons';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Image from 'next/image';

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

// interface InstrumentStats {
//   instrumentName: string;
//   totalWorks: number;
//   totalUsers: number;
// }

interface Props {
  instruments: InstrumentWithWorks[];
  // instrumentsStats: InstrumentStats[];
  hasError?: boolean;
}

const iconMap = {
  Piano: GiGrandPiano,
  Music: FaMusic,
  Music2: GiViolin,
  Music3: FaGuitar,
  Music4: GiPipeOrgan,
  Users: FaUsers,
  Harp: GiHarp,
  Violin: GiViolin,
  Cello: FaMusic,
  Organ: GiPipeOrgan,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || FaMusic;
};

export function InstrumentsPageClient({
  instruments,
  // instrumentsStats,
  hasError = false,
}: Props) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [expandedInstruments, setExpandedInstruments] = useState<
    Record<string, boolean>
  >({});

  // const totalWorks = useMemo(
  //   () => instrumentsStats.reduce((sum, stat) => sum + stat.totalWorks, 0),
  //   [instrumentsStats]
  // );

  // const totalUsers = useMemo(
  //   () => instrumentsStats.reduce((sum, stat) => sum + stat.totalUsers, 0),
  //   [instrumentsStats]
  // );

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
            <FaMusic className="w-10 h-10 text-theme-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-theme-primary classical-title">
            Erro ao carregar instrumentos
          </h2>
          <p className="text-theme-secondary classical-subtitle">
            Tente recarregar a página
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
                  História dos {''}
                  <span className="block text-gradient-brand bg-clip-text text-transparent mt-2">
                    Instrumentos Musicais
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-theme-secondary classical-subtitle mb-8 max-w-4xl mx-auto leading-relaxed">
                  Explore a rica história e evolução dos instrumentos
                  fundamentais da música clássica, desde suas origens até os
                  grandes virtuosos que os eternizaram.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="section-wrap space-y-12">
          {instruments.map((instrument, index) => {
            const Icon = getIcon(instrument.historicalData.iconName);
            const isInstrumentOpen = isInstrumentExpanded(instrument.id);

            return (
              <div
                key={instrument.id}
                className="classical-card group relative overflow-hidden animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Instrument Header - Always Visible */}
                <div
                  className="flex items-center justify-between p-8 cursor-pointer transition-all duration-300 hover:bg-interactive-hover relative z-10"
                  onClick={() => toggleInstrument(instrument.id)}
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-10 h-10 text-theme-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl text-theme-primary classical-title mb-2 group-hover:text-brand-primary transition-colors duration-300">
                        {instrument.name}
                      </h2>
                      <p className="text-theme-secondary text-lg classical-subtitle mb-1">
                        {instrument.historicalData.category} •{' '}
                        {instrument.historicalData.origin}
                      </p>
                      <p className="text-theme-tertiary text-sm">
                        {instrument.historicalData.inventionPeriod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-primary classical-title">
                        {instrument.stats.totalWorks}
                      </div>
                      <div className="text-sm text-theme-secondary">Obras</div>
                    </div>

                    <div className="w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-brand-primary/20">
                      {isInstrumentOpen ? (
                        <FaCompress className="w-4 h-4 text-theme-primary" />
                      ) : (
                        <FaExpand className="w-4 h-4 text-theme-primary" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                <div
                  className={`overflow-hidden transition-all duration-700 ease-in-out ${
                    isInstrumentOpen
                      ? 'max-h-[5000px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-8 py-8 space-y-8">
                    {/* Brief Description */}
                    <div className="classical-card-2 p-6 relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-theme-secondary text-lg leading-relaxed classical-body">
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
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                                <FaHistory className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                História Detalhada
                              </h3>
                            </div>
                            <p className="text-theme-secondary leading-relaxed text-sm classical-body">
                              {instrument.historicalData.detailedHistory}
                            </p>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="classical-card-2 p-6 relative overflow-hidden">
                          <div className="relative z-10">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                                <FaMapMarkerAlt className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                Informações Básicas
                              </h3>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  Origem:
                                </span>
                                <span className="text-theme-primary font-medium">
                                  {instrument.historicalData.origin}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  Inventor:
                                </span>
                                <span className="text-theme-primary font-medium">
                                  {instrument.historicalData.inventor ||
                                    'Desconhecido'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  Período:
                                </span>
                                <span className="text-theme-primary font-medium">
                                  {instrument.historicalData.inventionPeriod}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-theme-secondary">
                                  Categoria:
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
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                                  <FaAward className="w-4 h-4 text-theme-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-theme-primary classical-title">
                                  Compositor Destaque
                                </h3>
                              </div>
                              <div className="flex items-center space-x-4">
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
                                    <FaUser className="w-7 h-7 text-theme-primary" />
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

                                  <div className="text-theme-secondary text-sm">
                                    {instrument.topComposers[0].count} obras •{' '}
                                    <span className="text-brand-primary">
                                      {
                                        instrument.topComposers[0].composer
                                          .epochName
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
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
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <FaLightbulb className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                Características
                              </h3>
                            </div>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'characteristics')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'characteristics') ? (
                                <FaChevronUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <FaChevronDown className="w-4 h-4 text-theme-primary" />
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
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <IoIosTrendingUp className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                Evolução Histórica
                              </h3>
                            </div>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'evolution')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'evolution') ? (
                                <FaChevronUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <FaChevronDown className="w-4 h-4 text-theme-primary" />
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
                                      <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-accent-green to-accent-blue text-theme-primary rounded-full text-sm font-bold flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                                        {i + 1}
                                      </div>
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
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <FaStar className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                Características Técnicas
                              </h3>
                            </div>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'features')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'features') ? (
                                <FaChevronUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <FaChevronDown className="w-4 h-4 text-theme-primary" />
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
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                                <FaStar className="w-4 h-4 text-theme-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-theme-primary classical-title">
                                Intérpretes Famosos
                              </h3>
                            </div>
                            <div
                              className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isExpanded(instrument.id, 'performers')
                                  ? 'rotate-180 bg-brand-primary/20'
                                  : 'group-hover/button:bg-brand-primary/10'
                              }`}
                            >
                              {isExpanded(instrument.id, 'performers') ? (
                                <FaChevronUp className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <FaChevronDown className="w-4 h-4 text-theme-primary" />
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
                                      <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-brand-primary rounded-full group-hover/performer:scale-150 transition-transform duration-300" />
                                        <span className="font-medium">
                                          {performer}
                                        </span>
                                      </div>
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
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                            <FaMusic className="w-5 h-5 text-theme-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-theme-primary classical-title">
                              Obras Selecionadas
                            </h3>
                            <p className="text-theme-secondary text-sm">
                              {instrument.works.length} composições disponíveis
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isExpanded(instrument.id, 'works')
                              ? 'rotate-180 bg-brand-primary/20'
                              : 'group-hover/button:bg-brand-primary/10'
                          }`}
                        >
                          {isExpanded(instrument.id, 'works') ? (
                            <FaChevronUp className="w-4 h-4 text-theme-primary" />
                          ) : (
                            <FaChevronDown className="w-4 h-4 text-theme-primary" />
                          )}
                        </div>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-700 ease-in-out ${
                          isExpanded(instrument.id, 'works')
                            ? 'max-h-[2000px] opacity-100'
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 pb-6 border-t border-theme-secondary">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                            {instrument.works.map((work, workIndex) => (
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
                                      <p className="text-theme-secondary text-sm mt-1 classical-subtitle">
                                        {work.composer.name}
                                      </p>
                                    </div>
                                    {work.videoUrl && (
                                      <div className="ml-2 w-8 h-8 bg-accent-red/20 hover:bg-accent-red/40 rounded-full flex items-center justify-center transition-all duration-300 group-hover/work:scale-110">
                                        <FaPlay className="w-3 h-3 text-accent-red" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2 text-sm mb-4">
                                    {work.opOrCatalog && (
                                      <div className="flex items-center text-theme-secondary">
                                        <div className="w-4 h-4 bg-gradient-to-br from-accent-blue to-accent-purple rounded flex items-center justify-center mr-2">
                                          <FaMusic className="w-3 h-3 text-theme-primary" />
                                        </div>
                                        {work.opOrCatalog}
                                      </div>
                                    )}
                                    {work.compositionYear && (
                                      <div className="flex items-center text-theme-secondary">
                                        <div className="w-4 h-4 bg-gradient-to-br from-accent-green to-accent-blue rounded flex items-center justify-center mr-2">
                                          <FaCalendarAlt className="w-3 h-3 text-theme-primary" />
                                        </div>
                                        {work.compositionYear}
                                      </div>
                                    )}
                                    {work.tone && (
                                      <div className="flex items-center text-theme-secondary">
                                        <div className="w-4 h-4 bg-gradient-to-br from-accent-purple to-accent-red rounded flex items-center justify-center mr-2">
                                          <MdMusicNote className="w-3 h-3 text-theme-primary" />
                                        </div>
                                        {work.tone}
                                      </div>
                                    )}
                                    {work.mediaDuration && (
                                      <div className="flex items-center text-theme-secondary">
                                        <div className="w-4 h-4 bg-gradient-to-br from-brand-primary to-brand-secondary rounded flex items-center justify-center mr-2">
                                          <FaClock className="w-3 h-3 text-theme-primary" />
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
                                          <FaUser className="w-3 h-3 text-theme-primary" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-theme-primary text-sm font-medium classical-subtitle">
                                          {work.composer.fullName}
                                        </div>
                                        {work.composer.epochName && (
                                          <div className="text-brand-primary text-xs">
                                            {work.composer.epochName}
                                          </div>
                                        )}
                                      </div>
                                    </Link>
                                    <Link
                                      href={`/works/${work.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-8 h-8 bg-interactive-hover hover:bg-brand-primary/20 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/work:scale-110"
                                    >
                                      <FaExternalLinkAlt className="w-3 h-3 text-theme-primary hover:text-brand-primary transition-colors duration-300" />
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
