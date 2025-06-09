'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { FaClock, FaUser } from 'react-icons/fa';
import { GiMusicalNotes } from 'react-icons/gi';

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

interface Props {
  composers: ComposerTimeline[];
  epochsData: EpochData[];
}

const epochColors = {
  Medieval: 'bg-amber-500',
  Renaissance: 'bg-emerald-500',
  Baroque: 'bg-purple-500',
  Classical: 'bg-blue-500',
  Romantic: 'bg-rose-500',
  Modern: 'bg-slate-500',
};

export function ComposersTimeline({ composers, epochsData }: Props) {
  const timelineData = useMemo(() => {
    const sortedComposers = [...composers].sort((a, b) => {
      const aYear = a.birthYear || 0;
      const bYear = b.birthYear || 0;
      return aYear - bYear;
    });

    return sortedComposers.map((composer) => {
      const epochKey =
        Object.keys(epochColors).find(
          (key) =>
            composer.epochName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(composer.epochName.toLowerCase())
        ) || 'Modern';

      return {
        ...composer,
        epochKey,
        colorClass: epochColors[epochKey as keyof typeof epochColors],
      };
    });
  }, [composers]);

  const getLifespan = (composer: ComposerTimeline) => {
    if (!composer.birthYear) return 'Período desconhecido';
    if (!composer.deathYear) return `${composer.birthYear} - presente`;
    return `${composer.birthYear} - ${composer.deathYear}`;
  };

  const getLifespanDuration = (composer: ComposerTimeline) => {
    if (!composer.birthYear || !composer.deathYear) return null;
    return composer.deathYear - composer.birthYear;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
          Linha do Tempo dos Compositores
        </h2>
        <p className="text-lg text-gray-600">
          Acompanhe a cronologia dos grandes mestres da música clássica
        </p>
      </div>

      <div className="relative">
        {/* Timeline Line - Centralizada */}
        <div className="absolute left-0 lg:left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 via-purple-500 to-slate-500 rounded-full" />

        {/* Timeline Items */}
        <div className="space-y-12">
          {timelineData.map((composer, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={composer.id}
                className={`relative flex items-center justify-end ${
                  isLeft ? 'lg:justify-start' : 'lg:justify-end'
                }`}
              >
                {/* Content Card */}
                <Link
                  href={`/composer/${composer.id}`}
                  className={`w-[90%] lg:w-[45%] bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    isLeft ? 'lg:mr-auto' : 'lg:ml-auto'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      {/* Portrait */}
                      <div
                        className={`w-12 h-12 ${composer.colorClass} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}
                      >
                        {composer.portraitUrl ? (
                          <img
                            src={composer.portraitUrl}
                            alt={composer.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove(
                                'hidden'
                              );
                            }}
                          />
                        ) : null}
                        <FaUser
                          className={`text-white text-sm ${
                            composer.portraitUrl ? 'hidden' : ''
                          }`}
                        />
                      </div>

                      {/* Name and Epoch */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {composer.fullName}
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 ${composer.colorClass} text-white text-xs rounded-full`}
                        >
                          {composer.epochName}
                        </span>
                      </div>
                    </div>

                    {/* Lifespan */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <FaClock className="mr-2 text-sm" />
                      <span className="font-medium text-sm">
                        {getLifespan(composer)}
                      </span>
                      {getLifespanDuration(composer) && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({getLifespanDuration(composer)} anos)
                        </span>
                      )}
                    </div>

                    {/* Bio */}
                    {composer.bio && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {composer.bio.length > 120
                          ? `${composer.bio.substring(0, 120)}...`
                          : composer.bio}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Timeline Dot - Centralizado */}
                <div
                  className={`absolute left-0 lg:left-1/2 transform -translate-x-1/2 w-4 h-4 ${composer.colorClass} rounded-full border-4 border-white shadow-lg z-10`}
                />

                {/* Connector Line */}
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gray-300 ${
                    isLeft ? 'rotate-12' : '-rotate-12'
                  }`}
                  style={{
                    transformOrigin: isLeft ? 'left center' : 'right center',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
