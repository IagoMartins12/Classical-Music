// components/music/MusicalPiecesSection.tsx - Componente reutilizável para exibir peças musicais

import React from 'react';
import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiBookOpen,
  PiDownloadSimple,
  PiMusicNotes,
} from 'react-icons/pi';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface WorkScore {
  id: string;
  title: string;
  composer: string;
  workTitle: string;
  type: string;
  downloadUrl?: string;
}

interface MusicalPiecesSectionProps {
  workScores: WorkScore[];
  title?: string;
  className?: string;
  showIndex?: boolean;
  emptyMessage?: string;
  cardClassName?: string;
}

export default function MusicalPiecesSection({
  workScores,
  title = 'Peças Musicais',
  className = '',
  showIndex = true,
  emptyMessage = 'Nenhuma peça musical vinculada.',
  cardClassName = 'classical-card p-6',
}: MusicalPiecesSectionProps) {
  // Se não há workScores, não renderiza nada
  if (!workScores || workScores.length === 0) {
    return (
      <AnimatedItem direction="up" springType="gentle" className={className}>
        <AnimatedCard hover="none" className={cardClassName}>
          <div className="flex items-center mb-4">
            <Inline
              as="h2"
              gap={2}
              className="text-lg font-bold text-theme-primary"
            >
              <PiMusicNotes className="w-5 h-5" />
              <span>{title}</span>
            </Inline>
          </div>
          <p className="text-theme-tertiary italic">{emptyMessage}</p>
        </AnimatedCard>
      </AnimatedItem>
    );
  }

  return (
    <AnimatedItem direction="up" springType="gentle" className={className}>
      <AnimatedCard hover="none" className={cardClassName}>
        <div className="flex items-center mb-4">
          <Inline
            as="h2"
            gap={2}
            className="text-lg font-bold text-theme-primary"
          >
            <PiMusicNotes className="w-5 h-5" />
            <span>{title}</span>
          </Inline>
        </div>

        <Stack>
          {workScores.map((workScore, index) => (
            <div
              key={workScore.id}
              className="bg-theme-elevated border border-theme-secondary rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PiMusicNotes className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Inline gap={2} className="mb-1">
                      <h4 className="font-bold text-theme-primary">
                        {workScore.workTitle}
                      </h4>
                      {showIndex && (
                        <Text
                          papel="legenda"
                          tom="suave"
                          className="px-2 py-0.5 rounded"
                        >
                          #{index + 1}
                        </Text>
                      )}
                    </Inline>

                    {/* Link para o Compositor */}
                    <Link
                      href={`/composer/${workScore.composer
                        .replace(/\s+/g, '-')
                        .toLowerCase()}`}
                      className="text-sm font-medium inline-flex items-center space-x-1 mb-2"
                    >
                      <span>{workScore.composer}</span>
                      <PiArrowSquareOut className="w-3 h-3" />
                    </Link>

                    <Stack gap={2}>
                      {/* Link para a Obra */}
                      <div>
                        <Link
                          href={`/works/${workScore.id}`}
                          className="text-sm inline-flex items-center space-x-1"
                        >
                          <PiBookOpen className="w-3 h-3" />
                          <span>Ver obra completa</span>
                          <PiArrowSquareOut className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Informações da Partitura */}
                      <Text
                        papel="legenda"
                        tom="fraco"
                        as="div"
                        className="space-y-1"
                      >
                        <div>
                          <span className="font-medium">Partitura:</span>{' '}
                          {workScore.title}
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span>{' '}
                          {workScore.type}
                        </div>
                      </Text>
                    </Stack>
                  </div>
                </div>

                {/* Link de Download da Partitura */}
                {workScore.downloadUrl && (
                  <div className="flex-shrink-0 ml-4">
                    <Inline
                      as="a"
                      gap={2}
                      href={workScore.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-classical-secondary text-sm"
                    >
                      <PiDownloadSimple className="w-4 h-4" />
                      <span>Download</span>
                    </Inline>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Stack>
      </AnimatedCard>
    </AnimatedItem>
  );
}
