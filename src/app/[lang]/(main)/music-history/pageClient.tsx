// MusicHistoryPageClient.tsx - Premium version with theme system
'use client';

import { useState, useMemo } from 'react';
import { HeroSection } from '../../../components/HeroSection';
import { NavigationTabs } from '../../../components/NavigationTabs';
import { EpochSection } from '../../../components/EpochSection';
import { ComposersTimeline } from '../../../components/ComposerTimeline';
import { DetailedMusicHistory } from '../../../components/DetailedMusicHistory';

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
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0"></div>

      <div className="relative z-10">
        <HeroSection />

        <div className="section-wrap space-y-12 relative z-10">
          <DetailedMusicHistory />

          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'history' && (
            <div className="gap-20 flex flex-col">
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
