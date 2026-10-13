'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiBookmarkSimple,
  PiCaretLeft,
  PiCaretRight,
  PiDownloadSimple,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import type { WorkCopy } from '@/app/conteudo/site/work';
import type {
  ScoreEdition,
  ScoreFile,
} from '@/app/requests/work-score-library';
import { FavoriteHeart } from '../FavoriteHeart';
import { SaveScoreButton } from '../pwa/SaveScoreButton';
import { editionCard, scoreFavorite } from './scoreLabels';

/** What the preview shows: one edition, opened at one of its files. */
export interface PreviewTarget {
  edition: ScoreEdition;
  section: string;
  number: number;
  file: number;
}

/** A page with no thumbnail: a typographic sheet in its place. */
function BlankSheet({
  title,
  pages,
  small,
}: {
  title: string;
  pages?: string | null;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sobre-foto p-3 text-center text-sobre-ouro"
    >
      <span className="flex w-3/4 flex-col gap-[3px]">
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="h-px bg-sobre-ouro/30" />
        ))}
      </span>
      {!small && (
        <span className="line-clamp-2 font-display text-[0.9375rem] leading-tight">
          {title}
        </span>
      )}
      <span className="t-dado text-[0.6875rem] opacity-70">
        {pages ? `${pages} p.` : 'PDF'}
      </span>
    </span>
  );
}

export function ScorePage({
  file,
  sizes,
  small = false,
  priority = false,
}: {
  file: Pick<ScoreFile, 'title'> & {
    thumbnailUrl?: string | null;
    pageCount?: string | null;
  };
  sizes: string;
  small?: boolean;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  return file.thumbnailUrl && !broken ? (
    <Image
      src={file.thumbnailUrl}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setBroken(true)}
      className="object-contain"
    />
  ) : (
    <BlankSheet title={file.title} pages={file.pageCount} small={small} />
  );
}

/** The file on show inside the edition; arrow keys move when `keyboard`. */
function useCurrentFile(target: PreviewTarget | null, keyboard: boolean) {
  const [index, setIndex] = useState(target?.file ?? 0);
  const files = target?.edition.files ?? [];
  useEffect(() => {
    if (target) setIndex(target.file);
  }, [target]);
  const move = useCallback(
    (step: 1 | -1) => setIndex((i) => (i + step + files.length) % files.length),
    [files.length]
  );
  useEffect(() => {
    if (!keyboard || files.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [keyboard, files.length, move]);
  return { index, setIndex, move, files, file: files[index] ?? files[0] };
}

function PageWithArrows({
  files,
  index,
  move,
  sizes,
  className,
  copy,
}: {
  files: ScoreFile[];
  index: number;
  move: (step: 1 | -1) => void;
  sizes: string;
  className?: string;
  copy: WorkCopy['scores'];
}) {
  const touch = useRef<number | null>(null);
  const file = files[index] ?? files[0];
  return (
    <div
      className={cx(
        'relative aspect-[1/1.3] overflow-hidden rounded-card bg-sobre-foto shadow-[var(--sombra-2)]',
        className
      )}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50 && files.length > 1) move(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <span key={file.id} className="rise absolute inset-0">
        <ScorePage file={file} sizes={sizes} priority />
      </span>
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-veu-foto to-transparent p-4 pt-12 text-sobre-foto">
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-display text-[1.1875rem]">
            {file.title}
          </span>
          <span className="text-[0.8125rem] opacity-90">
            {files.length > 1
              ? copy.fileOf(index + 1, files.length)
              : copy.firstPage}
          </span>
        </span>
        {files.length > 1 && (
          <span className="flex shrink-0 gap-1">
            {(
              [
                [-1, PiCaretLeft, copy.previous],
                [1, PiCaretRight, copy.next],
              ] as const
            ).map(([step, glyph, label]) => (
              <button
                key={step}
                type="button"
                onClick={() => move(step)}
                className="grid h-10 w-10 place-items-center rounded-full bg-[var(--veu-foto)] hover:text-[var(--ouro)]"
              >
                <Icon de={glyph} rotulo={label} />
              </button>
            ))}
          </span>
        )}
      </span>
    </div>
  );
}

function FileStrip({
  files,
  index,
  setIndex,
  copy,
}: {
  files: ScoreFile[];
  index: number;
  setIndex: (i: number) => void;
  copy: WorkCopy['scores'];
}) {
  if (files.length < 2) return null;
  return (
    <ul
      aria-label={copy.filesOfEdition}
      className="scroll-strip -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {files.map((file, i) => (
        <li key={file.id} className="shrink-0">
          <button
            type="button"
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
            className={cx(
              'flex w-40 items-center gap-2.5 rounded-controle p-2 text-left',
              i === index
                ? 'tint-ouro text-ouro-na-tinta'
                : 'bg-sup-2 hover:bg-[var(--interactive-hover)]'
            )}
          >
            <span className="relative aspect-[1/1.3] w-8 shrink-0 overflow-hidden rounded-[4px] bg-sobre-foto">
              <ScorePage file={file} sizes="32px" small />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[0.8125rem]">{file.title}</span>
              <span className="t-dado text-[0.6875rem] opacity-70">
                {file.pageCount ? copy.pages(file.pageCount) : 'PDF'}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** The work a preview belongs to, for "Guardar no aparelho". */
export interface ScoreOwner {
  workId: string;
  workTitle: string;
  composerName?: string;
}

function PrimaryActions({
  file,
  owner,
  onStudy,
  studyLabel,
  copy,
}: {
  file: ScoreFile;
  owner: ScoreOwner;
  onStudy: (file: ScoreFile) => void;
  studyLabel: string;
  copy: WorkCopy['scores'];
}) {
  return (
    <>
      {file.downloadUrl && (
        <a
          href={file.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={classesDeBotao('primario')}
        >
          <Icon de={PiDownloadSimple} /> {copy.downloadPdf}
        </a>
      )}
      <Button icone={PiBookmarkSimple} onClick={() => onStudy(file)}>
        {studyLabel}
      </Button>
      {file.downloadUrl && (
        <SaveScoreButton
          dados={{
            url: file.downloadUrl,
            titulo: file.title,
            obra: owner.workTitle,
            compositor: owner.composerName,
            pagina: `/works/${owner.workId}`,
          }}
        />
      )}
    </>
  );
}

/** From lg up: the preview takes the details column, beside the list. */
export function SidePreview({
  workId,
  owner,
  target,
  onStudy,
  studyLabel,
  language,
  copy,
}: {
  workId: string;
  owner: ScoreOwner;
  target: PreviewTarget;
  onStudy: (file: ScoreFile) => void;
  studyLabel: string;
  language: 'pt' | 'en';
  copy: WorkCopy['scores'];
}) {
  const { index, setIndex, move, files, file } = useCurrentFile(target, true);
  const card = editionCard(target.edition, target.number, language, copy);
  return (
    <div className="flex flex-col gap-5">
      <PageWithArrows
        files={files}
        index={index}
        move={move}
        sizes="(max-width: 1024px) 100vw, 30vw"
        className="mx-auto h-[min(46dvh,30rem)] max-w-full"
        copy={copy}
      />
      <div className="flex items-start gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="t-legenda">{target.section}</span>
          <span className="font-display text-[1.375rem] leading-snug">
            {card.title}
          </span>
          <span className="t-rotulo text-texto-suave">{card.detail}</span>
        </span>
        <FavoriteHeart
          type="score"
          id={file.sourceId}
          name={file.title}
          score={scoreFavorite(workId, file)}
          className="bg-sup-2"
        />
      </div>
      <dl className="grid grid-cols-3 gap-3 border-y border-[var(--linha)] py-2.5">
        {[
          [copy.file, file.title],
          [copy.pagesLabel, file.pageCount || '—'],
          [copy.size, file.fileSize || '—'],
        ].map(([term, value]) => (
          <div key={term} className="flex min-w-0 flex-col">
            <dt className="t-legenda">{term}</dt>
            <dd className="truncate text-[0.9375rem]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-2 gap-2">
        <PrimaryActions
          file={file}
          owner={owner}
          onStudy={onStudy}
          studyLabel={studyLabel}
          copy={copy}
        />
      </div>
      <FileStrip files={files} index={index} setIndex={setIndex} copy={copy} />
    </div>
  );
}

/** Below lg: the same preview in a bottom sheet. */
export function SheetPreview({
  title,
  owner,
  target,
  onClose,
  onStudy,
  studyLabel,
  language,
  copy,
}: {
  title: string;
  owner: ScoreOwner;
  target: PreviewTarget | null;
  onClose: () => void;
  onStudy: (file: ScoreFile) => void;
  studyLabel: string;
  language: 'pt' | 'en';
  copy: WorkCopy['scores'];
}) {
  const { index, setIndex, move, files, file } = useCurrentFile(
    target,
    !!target
  );
  const card =
    target && editionCard(target.edition, target.number, language, copy);
  return (
    <Sheet
      aberto={!!target}
      aoFechar={onClose}
      titulo={title}
      descricao={
        target && card ? `${target.section} · ${card.title}` : undefined
      }
      largura="m"
      rodape={
        file ? (
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryActions
              file={file}
              owner={owner}
              onStudy={onStudy}
              studyLabel={studyLabel}
              copy={copy}
            />
          </div>
        ) : undefined
      }
    >
      {target && file && (
        <div className="flex flex-col gap-4">
          <PageWithArrows
            files={files}
            index={index}
            move={move}
            sizes="352px"
            className="mx-auto h-[min(50dvh,28rem)] max-w-full"
            copy={copy}
          />
          <FileStrip
            files={files}
            index={index}
            setIndex={setIndex}
            copy={copy}
          />
        </div>
      )}
    </Sheet>
  );
}
