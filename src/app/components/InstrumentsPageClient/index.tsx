'use client';

import { useState, useMemo } from 'react';
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

interface InstrumentStats {
  instrumentName: string;
  totalWorks: number;
  totalUsers: number;
}

interface Props {
  instruments: InstrumentWithWorks[];
  instrumentsStats: InstrumentStats[];
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
  instrumentsStats,
  hasError = false,
}: Props) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [expandedInstruments, setExpandedInstruments] = useState<
    Record<string, boolean>
  >({});

  const totalWorks = useMemo(
    () => instrumentsStats.reduce((sum, stat) => sum + stat.totalWorks, 0),
    [instrumentsStats]
  );

  const totalUsers = useMemo(
    () => instrumentsStats.reduce((sum, stat) => sum + stat.totalUsers, 0),
    [instrumentsStats]
  );

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
        <div className="text-center text-gray-300">
          <FaMusic className="w-16 h-16 mx-auto mb-4 opacity-50 text-amber-500" />
          <h2 className="text-2xl font-bold mb-2 text-white">
            Erro ao carregar instrumentos
          </h2>
          <p className="text-gray-400">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Hero Section */}
      <div className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <FaMusic className="w-20 h-20 mx-auto text-amber-500 mb-6" />
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text ">
              História dos Instrumentos
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore a rica história e evolução dos instrumentos fundamentais
              da música clássica, desde suas origens até os grandes virtuosos
              que os eternizaram.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
              <div className="text-3xl font-bold text-amber-400">
                {instruments.length}
              </div>
              <div className="text-gray-300">Instrumentos</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
              <div className="text-3xl font-bold text-amber-400">
                {totalWorks}
              </div>
              <div className="text-gray-300">Obras Catalogadas</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
              <div className="text-3xl font-bold text-amber-400">
                {totalUsers}
              </div>
              <div className="text-gray-300">Usuários Estudando</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {instruments.map((instrument, index) => {
            const Icon = getIcon(instrument.historicalData.iconName);
            const isInstrumentOpen = isInstrumentExpanded(instrument.id);

            return (
              <div
                key={instrument.id}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-600/30 hover:border-amber-500/30 transition-all duration-500 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`,
                }}
              >
                {/* Instrument Header - Always Visible */}
                <div
                  className="flex items-center justify-between p-8 cursor-pointer hover:bg-slate-700/20 transition-colors"
                  onClick={() => toggleInstrument(instrument.id)}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl mr-6 shadow-xl">
                      <Icon className="w-10 h-10 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-white mb-2">
                        {instrument.name}
                      </h2>
                      <p className="text-gray-400 text-lg">
                        {instrument.historicalData.category} •{' '}
                        {instrument.historicalData.origin}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {instrument.historicalData.inventionPeriod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-400">
                        {instrument.stats.totalWorks}
                      </div>
                      <div className="text-sm text-gray-400">Obras</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-400">
                        {instrument.stats.totalUsers}
                      </div>
                      <div className="text-sm text-gray-400">Usuários</div>
                    </div>
                    <div className="ml-4">
                      {isInstrumentOpen ? (
                        <FaCompress className="w-6 h-6 text-gray-400" />
                      ) : (
                        <FaExpand className="w-6 h-6 text-gray-400" />
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
                  <div className="px-8 pb-8">
                    {/* Brief Description */}
                    <div className="mb-8 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/30">
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {instrument.historicalData.description}
                      </p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Left Column - Historical Info */}
                      <div className="space-y-6">
                        {/* Detailed History */}
                        <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl p-6 border border-slate-600/30">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaHistory className="w-5 h-5 text-amber-400 mr-2" />
                            História Detalhada
                          </h3>
                          <p className="text-gray-300 leading-relaxed text-sm">
                            {instrument.historicalData.detailedHistory}
                          </p>
                        </div>

                        {/* Basic Info */}
                        <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl p-6 border border-slate-600/30">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaMapMarkerAlt className="w-5 h-5 text-amber-400 mr-2" />
                            Informações Básicas
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Origem:</span>
                              <span className="text-white">
                                {instrument.historicalData.origin}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Inventor:</span>
                              <span className="text-white">
                                {instrument.historicalData.inventor ||
                                  'Desconhecido'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Período:</span>
                              <span className="text-white">
                                {instrument.historicalData.inventionPeriod}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Categoria:</span>
                              <span className="text-white">
                                {instrument.historicalData.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Top Composer */}
                        {instrument.topComposers[0] && (
                          <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl p-6 border border-slate-600/30">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                              <FaAward className="w-5 h-5 text-amber-400 mr-2" />
                              Compositor Destaque
                            </h3>
                            <div className="flex items-center">
                              {instrument.topComposers[0].composer
                                .portraitUrl ? (
                                <img
                                  src={
                                    instrument.topComposers[0].composer
                                      .portraitUrl
                                  }
                                  alt={instrument.topComposers[0].composer.name}
                                  className="w-14 h-14 rounded-full mr-4 border-2 border-amber-400/30"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mr-4 border-2 border-amber-400/30">
                                  <FaUser className="w-7 h-7 text-gray-900" />
                                </div>
                              )}
                              <div>
                                <div className="text-white font-bold text-lg">
                                  {instrument.topComposers[0].composer.fullName}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {instrument.topComposers[0].count} obras •{' '}
                                  <span className="text-amber-400">
                                    {
                                      instrument.topComposers[0].composer
                                        .epochName
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Expandable Sections */}
                      <div className="space-y-4">
                        {/* Characteristics */}
                        <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl overflow-hidden border border-slate-600/30">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'characteristics')
                            }
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-600/20 transition-colors"
                          >
                            <h3 className="text-xl font-bold text-white flex items-center">
                              <FaLightbulb className="w-5 h-5 text-amber-400 mr-2" />
                              Características
                            </h3>
                            {isExpanded(instrument.id, 'characteristics') ? (
                              <FaChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <FaChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isExpanded(instrument.id, 'characteristics')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6">
                              <ul className="space-y-3">
                                {instrument.historicalData.characteristics.map(
                                  (char, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start text-gray-300"
                                    >
                                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                      {char}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Evolution */}
                        <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl overflow-hidden border border-slate-600/30">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'evolution')
                            }
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-600/20 transition-colors"
                          >
                            <h3 className="text-xl font-bold text-white flex items-center">
                              <IoIosTrendingUp className="w-5 h-5 text-green-400 mr-2" />
                              Evolução Histórica
                            </h3>
                            {isExpanded(instrument.id, 'evolution') ? (
                              <FaChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <FaChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isExpanded(instrument.id, 'evolution')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6">
                              <div className="space-y-4">
                                {instrument.historicalData.evolution.map(
                                  (stage, i) => (
                                    <div key={i} className="flex items-start">
                                      <div className="flex items-center justify-center w-7 h-7 bg-green-500 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                                        {i + 1}
                                      </div>
                                      <div className="text-gray-300">
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
                        <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl overflow-hidden border border-slate-600/30">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'features')
                            }
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-600/20 transition-colors"
                          >
                            <h3 className="text-xl font-bold text-white flex items-center">
                              <FaStar className="w-5 h-5 text-indigo-400 mr-2" />
                              Características Técnicas
                            </h3>
                            {isExpanded(instrument.id, 'features') ? (
                              <FaChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <FaChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isExpanded(instrument.id, 'features')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6">
                              <ul className="space-y-3">
                                {instrument.historicalData.notableFeatures.map(
                                  (feature, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start text-gray-300"
                                    >
                                      <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                      {feature}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Famous Performers */}
                        <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl overflow-hidden border border-slate-600/30">
                          <button
                            onClick={() =>
                              toggleSection(instrument.id, 'performers')
                            }
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-600/20 transition-colors"
                          >
                            <h3 className="text-xl font-bold text-white flex items-center">
                              <FaStar className="w-5 h-5 text-amber-400 mr-2" />
                              Intérpretes Famosos
                            </h3>
                            {isExpanded(instrument.id, 'performers') ? (
                              <FaChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <FaChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isExpanded(instrument.id, 'performers')
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {instrument.historicalData.famousPerformers.map(
                                  (performer, i) => (
                                    <div
                                      key={i}
                                      className="bg-slate-600/30 rounded-lg p-3 text-gray-300 hover:bg-slate-600/50 transition-colors border border-slate-500/20"
                                    >
                                      {performer}
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
                    <div>
                      <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl overflow-hidden border border-slate-600/30">
                        <button
                          onClick={() => toggleSection(instrument.id, 'works')}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-600/20 transition-colors"
                        >
                          <h3 className="text-2xl font-bold text-white flex items-center">
                            <FaMusic className="w-6 h-6 text-amber-400 mr-3" />
                            Obras Selecionadas
                            <span className="ml-3 text-lg text-gray-400 font-normal">
                              ({instrument.works.length} obras)
                            </span>
                          </h3>
                          {isExpanded(instrument.id, 'works') ? (
                            <FaChevronUp className="w-6 h-6 text-gray-400" />
                          ) : (
                            <FaChevronDown className="w-6 h-6 text-gray-400" />
                          )}
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-500 ${
                            isExpanded(instrument.id, 'works')
                              ? 'max-h-[2000px] opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {instrument.works.map((work, workIndex) => (
                                <div
                                  key={work.id}
                                  className="bg-gradient-to-br from-slate-600/40 to-slate-700/40 rounded-2xl p-5 border border-slate-500/30 hover:border-amber-400/50 hover:bg-slate-600/60 transition-all duration-300 group"
                                  style={{
                                    animation: `fadeInUp 0.4s ease-out ${
                                      workIndex * 0.05
                                    }s backwards`,
                                  }}
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h4 className="text-white font-bold text-lg line-clamp-2 group-hover:text-amber-300 transition-colors">
                                        {work.title}
                                      </h4>
                                      <p className="text-gray-400 text-sm mt-1">
                                        {work.composer.name}
                                      </p>
                                    </div>
                                    {work.videoUrl && (
                                      <button className="ml-2 w-8 h-8 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center transition-colors">
                                        <FaPlay className="w-4 h-4 text-red-400" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="space-y-2 text-sm mb-4">
                                    {work.opOrCatalog && (
                                      <div className="flex items-center text-gray-400">
                                        <FaMusic className="w-4 h-4 mr-2" />
                                        {work.opOrCatalog}
                                      </div>
                                    )}
                                    {work.compositionYear && (
                                      <div className="flex items-center text-gray-400">
                                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                                        {work.compositionYear}
                                      </div>
                                    )}
                                    {work.tone && (
                                      <div className="flex items-center text-gray-400">
                                        <MdMusicNote className="w-4 h-4 mr-2" />
                                        {work.tone}
                                      </div>
                                    )}
                                    {work.mediaDuration && (
                                      <div className="flex items-center text-gray-400">
                                        <FaClock className="w-4 h-4 mr-2" />
                                        {work.mediaDuration}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between pt-4 border-t border-slate-500/30">
                                    <div className="flex items-center">
                                      {work.composer.portraitUrl ? (
                                        <img
                                          src={work.composer.portraitUrl}
                                          alt={work.composer.name}
                                          className="w-8 h-8 rounded-full mr-2 border border-amber-400/30"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mr-2 border border-amber-400/30">
                                          <FaUser className="w-4 h-4 text-gray-900" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-white text-sm font-medium">
                                          {work.composer.fullName}
                                        </div>
                                        {work.composer.epochName && (
                                          <div className="text-amber-400 text-xs">
                                            {work.composer.epochName}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <a
                                      href={work.imslpPermlink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                      <FaExternalLinkAlt className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
