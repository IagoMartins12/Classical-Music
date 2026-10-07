'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  PiArrowLeft,
  PiBookmarkSimple,
  PiCaretDown,
  PiDownloadSimple,
  PiFiles,
  PiMagnifyingGlass,
  PiUploadSimple,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { WORK, type WorkCopy } from '@/app/conteudo/site/work';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  awaitWorkScoreLibrary,
  type ScoreEdition,
  type ScoreFile,
  type ScoreLibrary,
  type ScoreSection,
} from '@/app/requests/work-score-library';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import { FavoriteHeart } from '../FavoriteHeart';
import {
  ScorePage,
  SheetPreview,
  SidePreview,
  type PreviewTarget,
} from './ScorePreview';
import { editionCard, scoreFavorite, toSelectedScore } from './scoreLabels';
import { useStudy, type StudyContext } from './useStudy';

const EDITIONS_SHOWN = 4;
const OPEN_SECTIONS = 2;
const textLink =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

const isWide = () => window.matchMedia('(min-width: 1024px)').matches;

/**
 * Details on the left, scores on the right. Opening a score swaps the left
 * column for its preview from lg up (a sheet below lg). While the study
 * modal asks for a score, every pick goes back to it.
 */
export function WorkScores({
  initial,
  context,
  details,
}: {
  initial: ScoreLibrary;
  context: StudyContext;
  /** The server-rendered details column. */
  details: ReactNode;
}) {
  const { language } = useRouteLanguage();
  const copy = WORK[language].scores;
  const [library, setLibrary] = useState(initial);
  const [kind, setKind] = useState(initial.shelves[0]?.kind);
  const [side, setSide] = useState<PreviewTarget | null>(null);
  const [sheet, setSheet] = useState<PreviewTarget | null>(null);
  const study = useStudy(context);
  const selecting = useLearningModalStore((s) => s.isInSelectionMode);
  const finishSelection = useLearningModalStore((s) => s.finishScoreSelection);
  const cancelSelection = useLearningModalStore((s) => s.cancelScoreSelection);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (library.status !== 'pending') return;
    const controller = new AbortController();
    awaitWorkScoreLibrary(context.workId, controller.signal)
      .then((next) => {
        setLibrary(next);
        setKind(next.shelves[0]?.kind);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [library.status, context.workId]);

  useEffect(() => {
    if (selecting)
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }, [selecting]);

  const shelf = useMemo(
    () => library.shelves.find((s) => s.kind === kind) ?? library.shelves[0],
    [library, kind]
  );

  const onStudy = (file: ScoreFile) => {
    setSheet(null);
    if (selecting) finishSelection(toSelectedScore(file));
    else study('want-to-learn', file);
  };
  const open = (target: PreviewTarget) => {
    if (selecting) return onStudy(target.edition.files[target.file]);
    if (isWide()) setSide(target);
    else setSheet(target);
  };
  const studyLabel = selecting ? copy.choose : copy.studyThis;

  return (
    <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      {side ? (
        <aside className="flex min-w-0 flex-col gap-4 max-lg:hidden lg:sticky lg:top-28 lg:self-start">
          <button
            type="button"
            onClick={() => setSide(null)}
            className={cx(
              'inline-flex min-h-10 items-center gap-2 self-start t-rotulo text-texto-suave',
              textLink
            )}
          >
            <Icon de={PiArrowLeft} /> {copy.back}
          </button>
          <SidePreview
            workId={context.workId}
            target={side}
            onStudy={onStudy}
            studyLabel={studyLabel}
            language={language}
            copy={copy}
          />
        </aside>
      ) : (
        <aside className="flex min-w-0 flex-col gap-8">{details}</aside>
      )}

      <section
        ref={sectionRef}
        id="scores"
        className="flex min-w-0 scroll-mt-24 flex-col gap-6"
      >
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.title}</h2>
        {selecting && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-card tint-ouro p-4 text-ouro-na-tinta"
          >
            <span className="flex flex-col">
              <span className="font-medium">{copy.selecting}</span>
              <span className="t-rotulo">{copy.selectingText}</span>
            </span>
            <Button tamanho="p" onClick={cancelSelection}>
              {copy.cancel}
            </Button>
          </div>
        )}
        {library.status === 'pending' ? (
          <Searching copy={copy} />
        ) : !shelf ? (
          <Empty
            workId={context.workId}
            unavailable={library.status === 'unavailable'}
            copy={copy}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {library.shelves.length > 1 ? (
                <Abas rotulo={copy.kindLabel}>
                  {library.shelves.map((s) => (
                    <Aba
                      key={s.kind}
                      ativa={s.kind === shelf.kind}
                      onClick={() => setKind(s.kind)}
                    >
                      {copy.kinds[s.kind]} · {s.editions}
                    </Aba>
                  ))}
                </Abas>
              ) : (
                <span className="t-rotulo text-texto-suave">
                  {copy.kinds[shelf.kind]} · {copy.editions(shelf.editions)}
                </span>
              )}
              <span className="t-legenda">{copy.note}</span>
            </div>
            <div key={shelf.kind} className="flex flex-col gap-8">
              {shelf.sections.map((section, i) => (
                <Section
                  key={`${section.community}:${section.title}`}
                  section={section}
                  initiallyOpen={i < OPEN_SECTIONS}
                  workId={context.workId}
                  chosen={side}
                  onOpen={open}
                  onStudy={onStudy}
                  studyLabel={studyLabel}
                  language={language}
                  copy={copy}
                />
              ))}
            </div>
            <UploadLink workId={context.workId} copy={copy} />
          </>
        )}
      </section>

      <SheetPreview
        title={context.workTitle}
        target={sheet}
        onClose={() => setSheet(null)}
        onStudy={onStudy}
        studyLabel={studyLabel}
        language={language}
        copy={copy}
      />
    </div>
  );
}

function sectionTitle(section: ScoreSection, copy: WorkCopy['scores']) {
  return section.community ? copy.community : (section.title ?? copy.general);
}

function Section({
  section,
  initiallyOpen,
  workId,
  chosen,
  onOpen,
  onStudy,
  studyLabel,
  language,
  copy,
}: {
  section: ScoreSection;
  initiallyOpen: boolean;
  workId: string;
  chosen: PreviewTarget | null;
  onOpen: (target: PreviewTarget) => void;
  onStudy: (file: ScoreFile) => void;
  studyLabel: string;
  language: 'pt' | 'en';
  copy: WorkCopy['scores'];
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [all, setAll] = useState(false);
  const title = sectionTitle(section, copy);
  const files = section.editions.reduce((n, e) => n + e.files.length, 0);
  const shown = all
    ? section.editions
    : section.editions.slice(0, EDITIONS_SHOWN);
  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-[var(--alvo)] items-center justify-between gap-3 border-b border-[var(--linha)] text-left"
      >
        <span className="flex min-w-0 items-baseline gap-3">
          <span
            className={cx(
              'truncate font-display text-[1.25rem]',
              section.community && 'text-ouro-texto'
            )}
          >
            {title}
          </span>
          <span className="t-dado shrink-0 text-[0.75rem] text-texto-fraco">
            {copy.editions(section.editions.length)}
            {files > section.editions.length && ` · ${copy.files(files)}`}
          </span>
        </span>
        <Icon
          de={PiCaretDown}
          className={cx(
            'text-texto-fraco transition-transform duration-[var(--t-resposta)]',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <>
          <ul className="flex flex-col gap-3">
            {shown.map((edition, i) => (
              <EditionBox
                key={edition.key}
                edition={edition}
                number={i + 1}
                workId={workId}
                chosenFile={
                  chosen?.edition.key === edition.key ? chosen.file : null
                }
                onOpen={(file) =>
                  onOpen({ edition, section: title, number: i + 1, file })
                }
                onStudy={onStudy}
                studyLabel={studyLabel}
                language={language}
                copy={copy}
              />
            ))}
          </ul>
          {section.editions.length > EDITIONS_SHOWN && !all && (
            <Button
              variante="texto"
              className="self-start"
              onClick={() => setAll(true)}
            >
              {copy.showAll(section.editions.length)}
            </Button>
          )}
        </>
      )}
    </section>
  );
}

function EditionBox({
  edition,
  number,
  workId,
  chosenFile,
  onOpen,
  onStudy,
  studyLabel,
  language,
  copy,
}: {
  edition: ScoreEdition;
  number: number;
  workId: string;
  chosenFile: number | null;
  onOpen: (file: number) => void;
  onStudy: (file: ScoreFile) => void;
  studyLabel: string;
  language: 'pt' | 'en';
  copy: WorkCopy['scores'];
}) {
  const card = editionCard(edition, number, language, copy);
  return (
    <li
      className={cx(
        'flex gap-4 rounded-card bg-sup-2 p-3 sm:gap-5 sm:p-4',
        chosenFile !== null && 'lg:ring-1 lg:ring-[var(--ouro)]'
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(0)}
        aria-label={copy.openFirst(card.title)}
        className="relative block aspect-[1/1.3] w-16 shrink-0 self-start overflow-hidden rounded-[6px] bg-sobre-foto shadow-[var(--sombra-1)] transition-shadow duration-[var(--t-resposta)] hover:shadow-[var(--sombra-2)] sm:w-24"
      >
        <ScorePage file={edition.files[0]} sizes="96px" small />
        {edition.files.length > 1 && (
          <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-[var(--veu-foto)] px-1.5 py-0.5 text-[0.6875rem] text-sobre-foto">
            <Icon de={PiFiles} tamanho="pp" /> {edition.files.length}
          </span>
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[1.125rem] leading-snug">
              {card.title}
            </span>
            <span
              className={cx(
                'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                card.source.community
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'bg-[var(--fundo)] text-texto-suave'
              )}
            >
              {card.source.label}
            </span>
          </span>
          {card.detail && <span className="t-legenda">{card.detail}</span>}
        </div>
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {edition.files.map((file, k) => (
            <li key={file.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onOpen(k)}
                aria-current={chosenFile === k ? 'true' : undefined}
                className="group flex min-h-11 min-w-0 flex-1 flex-col justify-center py-1.5 text-left"
              >
                <span
                  className={cx(
                    'truncate text-[0.9375rem] group-hover:text-ouro-texto',
                    chosenFile === k && 'lg:text-ouro-texto'
                  )}
                >
                  {file.title}
                </span>
                <span className="t-dado text-[0.6875rem] text-texto-fraco">
                  {[
                    file.fileFormat?.toUpperCase() || 'PDF',
                    file.pageCount && copy.pages(file.pageCount),
                    file.fileSize,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </button>
              {file.downloadUrl && (
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={copy.download(file.title)}
                  className={classesDeBotao('fantasma', 'p', true)}
                >
                  <Icon de={PiDownloadSimple} tamanho="pp" />
                </a>
              )}
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiBookmarkSimple}
                rotulo={`${studyLabel}: ${file.title}`}
                onClick={() => onStudy(file)}
                className="max-sm:hidden"
              />
              <FavoriteHeart
                type="score"
                id={file.sourceId}
                name={file.title}
                score={scoreFavorite(workId, file)}
                className="!h-8 !w-8"
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function Searching({ copy }: { copy: WorkCopy['scores'] }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-card bg-sup-2 p-6"
    >
      <span className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--fundo)] text-ouro-texto">
          <Icon de={PiMagnifyingGlass} />
        </span>
        <span className="flex flex-col">
          <span className="font-medium">{copy.searching}</span>
          <span className="t-rotulo text-texto-suave">
            {copy.searchingText}
          </span>
        </span>
      </span>
      <ul
        className="grid grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))] gap-4"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <li
            key={i}
            className="loading-skeleton aspect-[1/1.3] rounded-[8px]"
          />
        ))}
      </ul>
    </div>
  );
}

function Empty({
  workId,
  unavailable,
  copy,
}: {
  workId: string;
  unavailable: boolean;
  copy: WorkCopy['scores'];
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-6">
      <span className="font-medium">
        {unavailable ? copy.unavailable : copy.none}
      </span>
      <span className="t-rotulo text-texto-suave">
        {unavailable ? copy.unavailableText : copy.noneText}
      </span>
      {!unavailable && (
        <Link
          href={`/upload?type=score&work=${workId}`}
          className={classesDeBotao()}
        >
          <Icon de={PiUploadSimple} /> {copy.upload}
        </Link>
      )}
    </div>
  );
}

function UploadLink({
  workId,
  copy,
}: {
  workId: string;
  copy: WorkCopy['scores'];
}) {
  return (
    <Link
      href={`/upload?type=score&work=${workId}`}
      className={cx(
        'inline-flex items-center gap-2 self-start t-rotulo text-texto-suave',
        textLink
      )}
    >
      <Icon de={PiUploadSimple} /> {copy.upload}
    </Link>
  );
}
