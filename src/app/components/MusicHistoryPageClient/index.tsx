'use client';

import { useState, useMemo } from 'react';
import { HeroSection } from '../HeroSection';
import { NavigationTabs } from '../NavigationTabs';
import { EpochSection } from '../EpochSection';
import { ComposersTimeline } from '../ComposerTimeline';
import ErrorFallback from '@/app/music-history/error';
import { DetailedMusicHistory } from '../DetailedMusicHistory';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  birthDate: string | null;
  deathDate: string | null;
  bio: string | null;
}

interface EpochComposers {
  epochId: string;
  epochName: string;
  composers: Composer[];
  historicalData?: {
    id: string;
    name: string;
    period: string;
    description: string;
    characteristics: string[];
    keyDevelopments: string[];
    musicalForms: string[];
    instruments: string[];
  } | null;
}

interface ComposerTimeline extends Composer {
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
  epochs: EpochComposers[];
  composersTimeline: ComposerTimeline[];
  epochsHistoricalData: EpochData[];
  hasError?: boolean;
}

export function MusicHistoryPageClient({
  epochs,
  composersTimeline,
  epochsHistoricalData,
  hasError = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<'history' | 'timeline'>('history');

  // Ordem cronológica das épocas
  const epochChronologicalOrder = [
    'Medieval',
    'Renascentista',
    'Barroco',
    'Clássico',
    'Rômantico',
    'Moderno',
  ];

  // Ordena as épocas cronologicamente (agora já vem ordenado do servidor, mas garantimos aqui também)
  const sortedEpochs = useMemo(() => {
    return [...epochs].sort((a, b) => {
      const aIndex = epochChronologicalOrder.findIndex(
        (epoch) =>
          a.epochName.toLowerCase().includes(epoch.toLowerCase()) ||
          epoch.toLowerCase().includes(a.epochName.toLowerCase()) ||
          a.epochName === epoch
      );
      const bIndex = epochChronologicalOrder.findIndex(
        (epoch) =>
          b.epochName.toLowerCase().includes(epoch.toLowerCase()) ||
          epoch.toLowerCase().includes(b.epochName.toLowerCase()) ||
          b.epochName === epoch
      );

      // Se não encontrar na lista, coloca no final
      const finalAIndex =
        aIndex === -1 ? epochChronologicalOrder.length : aIndex;
      const finalBIndex =
        bIndex === -1 ? epochChronologicalOrder.length : bIndex;

      return finalAIndex - finalBIndex;
    });
  }, [epochs]);

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <div className="w-full">
      <HeroSection />

      <DetailedMusicHistory />

      <div className="section-wrap mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'history' && (
          <div className="space-y-16">
            {sortedEpochs.map((epoch, index) => (
              <EpochSection
                key={epoch.epochId}
                epoch={epoch}
                index={index}
                isReversed={index % 2 === 1}
              />
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <ComposersTimeline
            composers={composersTimeline}
            epochsData={epochsHistoricalData}
          />
        )}
      </div>
    </div>
  );
}
