'use client';

// A partitura de uma obra da aula — a escolha é o modal de partituras que o
// site já tem (`LearningModal/ScoreSelectionModal`, com as miniaturas, os
// grupos e as fontes), como na criação de aula antiga. Aqui fica o cartão
// da escolhida, com a miniatura.

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { PiFilePdf } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';

const ScoreSelectionModal = dynamic(
  () => import('@/app/components/LearningModal/ScoreSelectionModal'),
  { ssr: false }
);

export interface PickedScore {
  id: string;
  title: string;
  source?: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  thumbnailUrl?: string | null;
  pageCount?: string | null;
  fileSize?: string | null;
  type?: string;
  downloadUrl?: string | null;
}

export function ScorePick({
  work,
  score,
  onChange,
}: {
  work: { id: string; title: string; composer: { name: string } };
  score: PickedScore | null;
  onChange: (score: PickedScore | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const facts = score
    ? [
        score.pageCount && `${score.pageCount} p.`,
        score.fileSize,
        score.source === 'IMSLP' ? 'IMSLP' : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <div className="flex items-center gap-3">
      {score ? (
        <>
          {score.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura da partitura, de qualquer domínio
            <img
              src={score.thumbnailUrl}
              alt=""
              loading="lazy"
              className="h-16 w-12 shrink-0 rounded-[4px] border border-linha object-cover"
            />
          ) : (
            <span className="grid h-16 w-12 shrink-0 place-items-center rounded-[4px] border border-linha text-texto-fraco">
              <Icon de={PiFilePdf} tamanho="m" />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm text-texto">{score.title}</span>
            {facts && <span className="t-legenda">{facts}</span>}
          </span>
          <Button variante="texto" onClick={() => setOpen(true)}>
            Trocar
          </Button>
        </>
      ) : (
        <Button tamanho="p" onClick={() => setOpen(true)}>
          Escolher a partitura
        </Button>
      )}
      {open && (
        <ScoreSelectionModal
          isOpen
          onClose={() => setOpen(false)}
          workId={work.id}
          workTitle={work.title}
          composerName={work.composer.name}
          isEditing={Boolean(score)}
          currentSelectedScore={
            score
              ? {
                  id: score.id,
                  sourceId: score.id,
                  source: score.source ?? 'IMSLP',
                  title: score.title,
                  thumbnailUrl: score.thumbnailUrl ?? undefined,
                  pageCount: score.pageCount ?? undefined,
                  fileSize: score.fileSize ?? undefined,
                  downloadUrl: score.downloadUrl ?? undefined,
                  fileFormat: 'PDF',
                  type: score.type ?? 'SCORES',
                }
              : null
          }
          onScoreSelected={(picked: PickedScore | null) =>
            onChange(
              picked
                ? {
                    id: picked.id,
                    title: picked.title,
                    source: picked.source,
                    thumbnailUrl: picked.thumbnailUrl,
                    pageCount: picked.pageCount,
                    fileSize: picked.fileSize,
                    type: picked.type,
                    downloadUrl: picked.downloadUrl,
                  }
                : null
            )
          }
        />
      )}
    </div>
  );
}
