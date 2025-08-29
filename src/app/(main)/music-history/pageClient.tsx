// MusicHistoryPageClient.tsx - Premium version with theme system
'use client';

import { useState, useMemo } from 'react';
import { HeroSection } from '../../components/HeroSection';
import { NavigationTabs } from '../../components/NavigationTabs';
import { EpochSection } from '../../components/EpochSection';
import { ComposersTimeline } from '../../components/ComposerTimeline';
import { DetailedMusicHistory } from '../../components/DetailedMusicHistory';

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

interface Props {
  epochs: EpochComposers[];
  composersTimeline: ComposerTimeline[];
}

export function MusicHistoryPageClient({ epochs, composersTimeline }: Props) {
  const [activeTab, setActiveTab] = useState<'history' | 'timeline'>('history');

  // Ordena as épocas cronologicamente
  const sortedEpochs = useMemo(() => {
    // Ordem cronológica das épocas
    const epochChronologicalOrder = [
      'Medieval',
      'Renascentista',
      'Barroco',
      'Clássico',
      'Romântico',
      'Moderno',
    ];

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

  return (
    <div className="w-full">
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
        <HeroSection />

        <div className="section-wrap space-y-12 relative z-10">
          <DetailedMusicHistory />

          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'history' && (
            <div className="space-y-20">
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
            <div className="animate-fade-in-up">
              <ComposersTimeline composers={composersTimeline} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
