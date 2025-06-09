'use client';

import { useState } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaUsers,
  FaMusic,
} from 'react-icons/fa';
import { GiMusicalNotes, GiScrollQuill } from 'react-icons/gi';
import { HistoryComposerCard } from '../cards/HistoryComposerCard';
import { LuPiano } from 'react-icons/lu';

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
  Medieval: 'from-amber-500 to-orange-600',
  Renascentista: 'from-emerald-500 to-teal-600',
  Barroco: 'from-purple-500 to-indigo-600',
  Clássico: 'from-blue-500 to-cyan-600',
  Rômantico: 'from-rose-500 to-pink-600',
  Moderno: 'from-slate-500 to-gray-600',
};

const epochIcons = {
  Medieval: GiScrollQuill,
  Renascentista: GiMusicalNotes,
  Barroco: LuPiano,
  Clássico: FaMusic,
  Rômantico: FaUsers,
  Moderno: FaClock,
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
      } gap-12 items-start`}
    >
      {/* Content Section */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="relative flex justify-center lg:justify-start">
          <div
            className={`inline-flex items-center px-12 py-3 rounded-full bg-gradient-to-r ${gradientClass} text-white shadow-lg`}
          >
            <IconComponent className="mr-3 text-2xl" />
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold">
                {epoch.epochName}
              </h2>
              {epoch.historicalData?.period && (
                <p className="text-sm opacity-90">
                  {epoch.historicalData.period}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {epoch.historicalData?.description && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <p className="text-gray-700 text-lg leading-relaxed">
              {epoch.historicalData.description}
            </p>
          </div>
        )}

        {/* Expandable Details */}
        {epoch.historicalData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                Características e Desenvolvimentos
              </h3>
              {isExpanded ? (
                <FaChevronUp className="text-gray-500" />
              ) : (
                <FaChevronDown className="text-gray-500" />
              )}
            </button>

            {isExpanded && (
              <div className="px-6 pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Características */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <GiMusicalNotes className="mr-2 text-blue-500" />
                      Características
                    </h4>
                    <ul className="space-y-2">
                      {epoch.historicalData.characteristics.map((char, i) => (
                        <li key={i} className="text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desenvolvimentos */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaClock className="mr-2 text-green-500" />
                      Desenvolvimentos-chave
                    </h4>
                    <ul className="space-y-2">
                      {epoch.historicalData.keyDevelopments.map((dev, i) => (
                        <li key={i} className="text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                          {dev}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Formas Musicais */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaMusic className="mr-2 text-purple-500" />
                      Formas Musicais
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {epoch.historicalData.musicalForms.map((form, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {form}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instrumentos */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <LuPiano className="mr-2 text-orange-500" />
                      Instrumentos
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {epoch.historicalData.instruments.map((instrument, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                        >
                          {instrument}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composers Section */}
      <div className="flex-1 w-full lg:max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaUsers className="mr-3 text-blue-500" />
          Compositores Famosos
        </h3>

        <div className="space-y-4">
          {visibleComposers.map((composer) => (
            <HistoryComposerCard key={composer.id} composer={composer} />
          ))}

          {epoch.composers.length > 4 && (
            <button
              onClick={() => setShowAllComposers(!showAllComposers)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {showAllComposers
                ? 'Ver menos'
                : `Ver mais ${epoch.composers.length - 4} compositores`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
