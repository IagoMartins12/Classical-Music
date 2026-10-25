'use client';

import { RetrospectiveButton } from './Retrospective';
import { Recommendations } from '../Recommendations';
import { useEffect, useMemo, useState } from 'react';
import {
  PiCheckCircle,
  PiFilePdf,
  PiMagnifyingGlass,
  PiPencilSimple,
  PiStar,
  PiStarFill,
  PiVideoCamera,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { PERSONAL, type PersonalCopy } from '@/app/conteudo/site/personal';
import { STUDY } from '@/app/conteudo/site/study';

type StudyCopy = (typeof STUDY)['pt'];
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import {
  useLearningStore,
  type LearnedItem,
  type WantToLearnItem,
} from '@/app/stores/useLearningStore';
import { LearningModalHost } from '../LearningModalHost';
import { Portrait } from '../Portrait';
import { ScorePage } from '../work/ScorePreview';
import { ListResults, ViewToggle } from '../lists/ViewToggle';
import { workTitle } from '../workTitle';
import { daysUntil, studyEditParams } from './studyEdit';

type Tab = 'all' | 'want' | 'learned';
type Entry =
  | { kind: 'want'; item: WantToLearnItem }
  | { kind: 'learned'; item: LearnedItem };

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * "Your studies": what you want to learn and what you learned, filtered by
 * tab and search, as cards or rows (the shared list view). Editing opens the
 * same study modal as the work page.
 */
export function StudiesView({
  initial,
}: {
  initial: { wantToLearn: WantToLearnItem[]; learned: LearnedItem[] };
}) {
  const { language } = useRouteLanguage();
  const copy = PERSONAL[language].studies;
  const { wantToLearn, learned, initialized, initializeLearning } =
    useLearningStore();
  const openModal = useLearningModalStore((s) => s.openModal);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!initialized) initializeLearning(initial.wantToLearn, initial.learned);
  }, [initialized, initializeLearning, initial]);

  const want = initialized ? wantToLearn : initial.wantToLearn;
  const done = initialized ? learned : initial.learned;

  const entries = useMemo(() => {
    const all: Entry[] = [
      ...(tab !== 'learned'
        ? want.map((item) => ({ kind: 'want' as const, item }))
        : []),
      ...(tab !== 'want'
        ? done.map((item) => ({ kind: 'learned' as const, item }))
        : []),
    ];
    const q = normalize(query.trim());
    return q
      ? all.filter(({ item }) =>
          normalize(
            `${item.work?.title ?? ''} ${item.work?.opOrCatalog ?? ''} ${item.work?.composer.fullName ?? ''}`
          ).includes(q)
        )
      : all;
  }, [tab, query, want, done]);

  const empty = {
    all: copy.emptyAll,
    want: copy.emptyWant,
    learned: copy.emptyLearned,
  }[tab];
  const total = want.length + done.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo={copy.title}>
          {(
            [
              ['all', copy.tabs.all, total],
              ['want', copy.tabs.want, want.length],
              ['learned', copy.tabs.learned, done.length],
            ] as const
          ).map(([key, label, n]) => (
            <Aba key={key} ativa={tab === key} onClick={() => setTab(key)}>
              {label} · {n}
            </Aba>
          ))}
        </Abas>
        <div className="flex flex-wrap items-center gap-2">
          <RetrospectiveButton />
          <ViewToggle />
        </div>
      </div>

      {total > 0 && (
        <label className="search-field flex min-h-12 items-center gap-3 rounded-full bg-sup-2 px-5">
          <Icon de={PiMagnifyingGlass} className="text-texto-fraco" />
          <span className="sr-only">{copy.search}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-texto-fraco"
          />
        </label>
      )}

      {entries.length ? (
        <ListResults className="cascata grid grid-cols-1 gap-4 divide-[var(--linha)] xl:grid-cols-2 max-sm:gap-0 max-sm:divide-y data-[view=list]:grid-cols-1! data-[view=list]:gap-0 data-[view=list]:divide-y">
          {entries.map((entry) => (
            <StudyCard
              key={`${entry.kind}-${entry.item.id}`}
              entry={entry}
              copy={copy}
              language={language}
              onEdit={() =>
                openModal(
                  studyEditParams(
                    entry.item,
                    entry.kind === 'want' ? 'want-to-learn' : 'learned'
                  )
                )
              }
              onLearned={() =>
                openModal({
                  ...studyEditParams(entry.item, 'want-to-learn'),
                  type: 'learned',
                  isCurrentlyActive: false,
                })
              }
            />
          ))}
        </ListResults>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-8">
          <p className="font-display text-[1.5rem]">
            {query ? copy.noResults : empty}
          </p>
          {!query && (
            <>
              <p className="t-rotulo text-texto-suave">{copy.emptyText}</p>
              <Link href="/works" className={classesDeBotao('primario', 'p')}>
                {copy.explore}
              </Link>
            </>
          )}
        </div>
      )}
      {total > 0 && (
        <Recommendations source={{ kind: 'me' }} className="mt-10" />
      )}
      <LearningModalHost />
    </div>
  );
}

function StudyCard({
  entry,
  copy,
  language,
  onEdit,
  onLearned,
}: {
  entry: Entry;
  copy: PersonalCopy['studies'];
  language: 'pt' | 'en';
  onEdit: () => void;
  onLearned: () => void;
}) {
  const { item } = entry;
  const work = item.work;
  const date = (iso: string) =>
    new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      // Dates are stored as UTC midnight: read them in UTC or 1 Dec turns into 30 Nov.
      timeZone: 'UTC',
    }).format(new Date(iso));
  const score = item.selectedWorkScore;
  const level = item.difficulty ? copy.levels[item.difficulty] : null;

  return (
    <li
      data-vira={`obra-${item.workId}`}
      className="flex flex-col gap-4 rounded-card bg-sup-2 p-5 row:flex-row row:items-center row:rounded-none row:bg-transparent! row:bg-none! row:px-0 row:py-4"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4 row:items-center">
        <Portrait
          name={work?.composer.fullName ?? '?'}
          src={work?.composer.portraitUrl}
          sizes="48px"
          className="h-12 w-12 shrink-0 rounded-full text-[0.875rem]"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="t-legenda">
            {entry.kind === 'want' ? copy.tabs.want : copy.tabs.learned}
          </span>
          <Link
            href={`/works/${item.workId}`}
            className="font-display text-[1.3125rem] leading-snug hover:text-ouro-texto row:truncate"
          >
            {work ? workTitle(work.title, work.opOrCatalog) : item.workId}
          </Link>
          <span className="t-rotulo truncate text-texto-suave">
            {[work?.composer.fullName, work?.instrument?.name, level]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 row:hidden">
        {entry.kind === 'want' ? (
          <WantDetails
            item={entry.item}
            copy={copy}
            study={STUDY[language]}
            date={date}
          />
        ) : (
          <LearnedDetails
            item={entry.item}
            copy={copy}
            study={STUDY[language]}
            date={date}
          />
        )}
        {score ? (
          <p className="flex items-center gap-3 t-rotulo">
            <span className="relative block aspect-[1/1.3] w-9 shrink-0 overflow-hidden rounded-[4px] bg-sobre-foto shadow-[var(--sombra-1)]">
              <ScorePage file={score} sizes="36px" small />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="t-legenda">{copy.score}</span>
              <span className="truncate">{score.title}</span>
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-2 t-rotulo text-texto-suave">
            <Icon de={PiFilePdf} className="shrink-0 text-texto-fraco" />
            {copy.noScore}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 row:shrink-0">
        {score?.downloadUrl && (
          <a
            href={score.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cx(
              classesDeBotao('primario', 'p'),
              'row:aspect-square row:!px-0'
            )}
          >
            <Icon de={PiFilePdf} tamanho="pp" />{' '}
            <span className="row:sr-only">{copy.openScore}</span>
          </a>
        )}
        <Button
          tamanho="p"
          icone={PiPencilSimple}
          onClick={onEdit}
          className="row:aspect-square row:!px-0"
        >
          <span className="row:sr-only">
            {score || entry.kind === 'learned' ? copy.edit : copy.chooseScore}
          </span>
        </Button>
        {entry.kind === 'want' && (
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiCheckCircle}
            onClick={onLearned}
            className="row:hidden"
          >
            {copy.markLearned}
          </Button>
        )}
      </div>
    </li>
  );
}

/**
 * The long answers from the study sheet, each under its label. Long ones
 * fold at three lines; "Show all" opens the whole card.
 */
function Texts({
  entries,
  copy,
}: {
  entries: [label: string, text: string | undefined][];
  copy: PersonalCopy['studies'];
}) {
  const [open, setOpen] = useState(false);
  const filled = entries.filter(([, text]) => text?.trim());
  if (!filled.length) return null;
  const long =
    filled.length > 2 || filled.some(([, text]) => text!.length > 140);
  return (
    <div className="flex flex-col gap-2">
      <dl className="flex flex-col gap-2">
        {filled.map(([label, text]) => (
          <div key={label} className="flex flex-col">
            <dt className="t-legenda">{label}</dt>
            <dd
              className={cx(
                't-rotulo whitespace-pre-line',
                !open && long && 'line-clamp-3'
              )}
            >
              {text}
            </dd>
          </div>
        ))}
      </dl>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="t-rotulo self-start text-texto-suave underline decoration-[var(--linha-forte)] underline-offset-4 hover:text-texto hover:decoration-[var(--ouro)]"
        >
          {open ? copy.less : copy.more}
        </button>
      )}
    </div>
  );
}

function WantDetails({
  item,
  copy,
  study,
  date,
}: {
  item: WantToLearnItem;
  copy: PersonalCopy['studies'];
  study: StudyCopy;
  date: (iso: string) => string;
}) {
  const left = item.targetDate ? daysUntil(item.targetDate) : null;
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 t-rotulo text-texto-suave">
        {item.priority > 0 && <span>{copy.priority[item.priority]}</span>}
        {item.targetDate && left !== null && (
          <span className={cx(left < 0 && 'text-texto')}>
            {copy.due(date(item.targetDate))} ·{' '}
            {left < 0 ? copy.overdue : copy.daysLeft(left)}
          </span>
        )}
        {!!item.estimatedStudyTime && (
          <span>{copy.hours(item.estimatedStudyTime)}</span>
        )}
        {!item.targetDate && item.addedAt && (
          <span>{copy.since(date(item.addedAt))}</span>
        )}
      </div>
      {typeof item.progress === 'number' && item.progress > 0 && (
        <div className="flex items-center gap-3">
          <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--linha)]">
            <span
              className="block h-full rounded-full fill-ouro"
              style={{ width: `${Math.min(100, item.progress)}%` }}
            />
          </span>
          <span className="t-dado text-[0.75rem] text-texto-suave">
            {copy.progress(Math.round(item.progress))}
          </span>
        </div>
      )}
      <Texts
        copy={copy}
        entries={[
          [study.motivation, item.motivation],
          [study.context, item.context],
          [study.notes, item.notes],
        ]}
      />
    </>
  );
}

function LearnedDetails({
  item,
  copy,
  study,
  date,
}: {
  item: LearnedItem;
  copy: PersonalCopy['studies'];
  study: StudyCopy;
  date: (iso: string) => string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 t-rotulo text-texto-suave">
        {item.learnedAt && (
          <span>
            {copy.learnedOn(date(item.learnedAt))}
            {item.studyDuration
              ? ` · ${copy.studiedFor(item.studyDuration)}`
              : ''}
          </span>
        )}
        {item.studyStartDate && (
          <span>{copy.started(date(item.studyStartDate))}</span>
        )}
        {item.wouldRecommend && <span>{copy.recommends}</span>}
        {item.publicPerformance && <span>{study.publicPerformance}</span>}
        {item.videoUrl && (
          <span className="inline-flex items-center gap-1">
            <Icon de={PiVideoCamera} tamanho="pp" />{' '}
            {copy.videoWith(
              item.isVideoPublic ? study.videoIsPublic : study.videoIsPrivate
            )}
          </span>
        )}
      </div>
      {(item.mastery > 0 || !!item.enjoyment) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 t-rotulo">
          {item.mastery > 0 && (
            <span className="flex items-center gap-2">
              <span className="text-texto-suave">{copy.mastery}</span>
              <span
                className="flex text-ouro-texto"
                aria-label={`${item.mastery}/5`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Icon
                    key={n}
                    de={n <= item.mastery ? PiStarFill : PiStar}
                    tamanho="pp"
                  />
                ))}
              </span>
            </span>
          )}
          {!!item.enjoyment && (
            <span>
              <span className="text-texto-suave">{study.enjoyment}: </span>
              {study.enjoyments[item.enjoyment - 1]}
            </span>
          )}
        </div>
      )}
      <Texts
        copy={copy}
        entries={[
          [study.challenges, item.technicalChallenges],
          [study.insights, item.musicalInsights],
          [study.generalNotes, item.notes],
        ]}
      />
    </>
  );
}
