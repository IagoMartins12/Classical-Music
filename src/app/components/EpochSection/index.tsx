// EpochSection.tsx - Premium version with theme system
'use client';

import { useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiUsers,
  FiMusic,
  FiSettings,
  FiStar,
  FiBookOpen,
} from 'react-icons/fi';
import { GiMusicalNotes, GiScrollQuill, GiGrandPiano } from 'react-icons/gi';
import { HistoryComposerCard } from '../cards/HistoryComposerCard';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  birthDate: string | null;
  deathDate: string | null;
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
  Medieval: 'from-accent-gold to-brand-secondary',
  Renascentista: 'from-accent-green to-accent-blue',
  Barroco: 'from-accent-purple to-accent-red',
  Clássico: 'from-accent-blue to-accent-purple',
  Rômantico: 'from-accent-red to-accent-purple',
  Moderno: 'from-theme-tertiary to-theme-secondary',
};

const epochIcons = {
  Medieval: GiScrollQuill,
  Renascentista: GiMusicalNotes,
  Barroco: GiGrandPiano,
  Clássico: FiMusic,
  Rômantico: FiUsers,
  Moderno: FiSettings,
};

export function EpochSection({ epoch, index, isReversed = false }: Props) {
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
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="relative flex justify-center lg:justify-start">
          <div
            className={`inline-flex items-center px-12 py-4 rounded-2xl bg-gradient-to-r ${gradientClass} text-theme-inverse shadow-theme-glow border border-theme-primary backdrop-blur-md relative overflow-hidden group hover:scale-105 transition-all duration-500`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-theme-inverse/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative z-10 flex items-center">
              <div className="w-12 h-12 bg-theme-inverse/20 backdrop-blur-md rounded-xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-500">
                <IconComponent className="text-2xl text-theme-inverse" />
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
          <div className="classical-card p-8 group hover:shadow-theme-glow transition-all duration-500 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-4 right-4 text-6xl text-brand-primary/5">
              <GiMusicalNotes />
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <FiBookOpen className="w-4 h-4 text-theme-inverse" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary classical-title">
                  Sobre o Período
                </h3>
              </div>
              <p className="text-theme-secondary text-lg leading-relaxed classical-body">
                {epoch.historicalData.description}
              </p>
            </div>
          </div>
        )}

        {/* Expandable Details */}
        {epoch.historicalData && (
          <div className="classical-card overflow-hidden group">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-interactive-hover transition-all duration-300 group/button"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center group-hover/button:scale-110 transition-transform duration-300">
                  <FiStar className="w-5 h-5 text-theme-inverse" />
                </div>
                <h3 className="text-xl font-semibold text-theme-primary classical-title">
                  Características e Desenvolvimentos
                </h3>
              </div>
              <div
                className={`w-8 h-8 bg-interactive-hover rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isExpanded
                    ? 'rotate-180 bg-brand-primary/20'
                    : 'group-hover/button:bg-brand-primary/10'
                }`}
              >
                {isExpanded ? (
                  <FiChevronUp className="w-4 h-4 text-theme-primary" />
                ) : (
                  <FiChevronDown className="w-4 h-4 text-theme-primary" />
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                        <GiMusicalNotes className="w-4 h-4 text-theme-inverse" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        Características
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {epoch.historicalData.characteristics.map((char, i) => (
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
                      ))}
                    </div>
                  </div>

                  {/* Desenvolvimentos */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                        <FiClock className="w-4 h-4 text-theme-inverse" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        Desenvolvimentos-chave
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {epoch.historicalData.keyDevelopments.map((dev, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-3 p-3 bg-gradient-to-r from-accent-green/5 to-accent-blue/5 border border-accent-green/20 rounded-xl hover:border-accent-green/40 transition-all duration-300 group/item"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <div className="w-2 h-2 bg-accent-green rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300" />
                          <span className="text-theme-secondary leading-relaxed group-hover/item:text-theme-primary transition-colors duration-300">
                            {dev}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formas Musicais */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center">
                        <FiMusic className="w-4 h-4 text-theme-inverse" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        Formas Musicais
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {epoch.historicalData.musicalForms.map((form, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-gradient-to-r from-accent-purple/10 to-accent-red/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300 cursor-default"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          {form}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instrumentos */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                        <GiGrandPiano className="w-4 h-4 text-theme-inverse" />
                      </div>
                      <h4 className="font-semibold text-theme-primary classical-title">
                        Instrumentos
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {epoch.historicalData.instruments.map((instrument, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300 cursor-default"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          {instrument}
                        </span>
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
        <div className="classical-card p-6 sticky top-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-theme-inverse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-primary classical-title">
                Compositores Famosos
              </h3>
              <p className="text-theme-tertiary text-sm">
                {epoch.composers.length}{' '}
                {epoch.composers.length === 1 ? 'compositor' : 'compositores'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
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
              <button
                onClick={() => setShowAllComposers(!showAllComposers)}
                className="w-full p-4 border-2 border-dashed border-theme-primary text-theme-primary hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all duration-300 rounded-xl group flex items-center justify-center space-x-2"
              >
                <FiUsers className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">
                  {showAllComposers
                    ? 'Ver menos'
                    : `Ver mais ${epoch.composers.length - 4} compositores`}
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
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
