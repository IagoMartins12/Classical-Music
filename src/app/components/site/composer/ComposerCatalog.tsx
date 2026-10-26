'use client';

import { useEffect, useRef, useState } from 'react';
import { PiArrowsDownUp, PiMagnifyingGlass } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { trocarVista } from '@/app/components/ui/transicao';
import {
  COMPOSER,
  LEVEL_VALUES,
  type ComposerCopy,
} from '@/app/conteudo/site/composer';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  getComposerWorksWithFilters,
  type ComposerFilterOptions,
  type ComposerWork,
  type ComposerWorksFilters,
  type ComposerWorkSort,
  type ComposerWorksResponse,
} from '@/app/requests/composer-details';
import { FavoriteHeart } from '../FavoriteHeart';
import { nomePopularCurto, workTitle } from '../workTitle';
import { chip } from '../choice';

const PAGE_SIZE = 30;
const SORTS: ComposerWorkSort[] = ['famous', 'title', 'title-desc', 'recent'];
const SEARCH_DELAY_MS = 300;

interface Result {
  works: ComposerWork[];
  total: number;
  page: number;
  hasMore: boolean;
}

type Status = 'idle' | 'loading' | 'error';

const toResult = (response: ComposerWorksResponse): Result => ({
  works: response.works,
  total: response.totalCount,
  page: response.currentPage,
  hasMore: response.hasMore,
});

/** The filters sit in a row of pills: same height and shape. */
const select = 'min-h-10! rounded-full! py-0! text-[0.9375rem]';

/**
 * The composer's works with genre, category, level and text filters, and an
 * order (best known first, A–Z, Z–A, recently added). Every
 * filter combination is kept in memory: going back to one never calls the
 * API again. The first page (no filters) comes rendered from the server.
 */
export function ComposerCatalog({
  composerId,
  name,
  initial,
  options,
}: {
  composerId: string;
  name: string;
  initial: ComposerWorksResponse;
  options: ComposerFilterOptions;
}) {
  const { language } = useRouteLanguage();
  const copy = COMPOSER[language];
  const t = copy.catalog;
  const [genre, setGenre] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<ComposerWorkSort>('famous');
  const [level, setLevel] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const cache = useRef(new Map<string, Result>([['{}', toResult(initial)]]));
  const [result, setResult] = useState<Result>(() => toResult(initial));
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    const id = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [query]);

  const filters: ComposerWorksFilters = {
    ...(genre && { workGenresArr: genre }),
    ...(category && { categoryNames: category }),
    ...(level && { difficultyLevel: level }),
    ...(search && { search }),
    ...(sort !== 'famous' && { sort }),
  };
  const key = JSON.stringify(filters);

  // A new filter or order: each work slides to its new place, as when the
  // works page switches view (the rows carry `data-vira`).
  const shown = useRef(key);
  const show = (next: Result) => {
    if (shown.current === key) return setResult(next);
    shown.current = key;
    trocarVista(() => setResult(next));
  };

  useEffect(() => {
    const cached = cache.current.get(key);
    if (cached) {
      show(cached);
      setStatus('idle');
      return;
    }
    let live = true;
    setStatus('loading');
    getComposerWorksWithFilters(composerId, 1, PAGE_SIZE, JSON.parse(key))
      .then((response) => {
        if (!live) return;
        const next = toResult(response);
        cache.current.set(key, next);
        show(next);
        setStatus('idle');
      })
      .catch(() => live && setStatus('error'));
    return () => {
      live = false;
    };
  }, [composerId, key]);

  const loadMore = () => {
    setStatus('loading');
    getComposerWorksWithFilters(composerId, result.page + 1, PAGE_SIZE, filters)
      .then((response) => {
        const next = {
          ...toResult(response),
          works: [...result.works, ...response.works],
        };
        cache.current.set(key, next);
        setResult(next);
        setStatus('idle');
      })
      .catch(() => setStatus('error'));
  };

  const filtered = !!(genre || category || level || search);
  const clear = () => {
    setGenre('');
    setCategory('');
    setLevel('');
    setQuery('');
    setSearch('');
  };
  const loadingFirst = status === 'loading' && !cache.current.has(key);

  return (
    <section id="works" className="mt-20 flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.title}</h2>
        <span className="t-rotulo text-texto-suave">
          {t.works(result.total)}
        </span>
      </div>

      {options.workGenres.length > 1 && (
        <div
          className="scroll-strip -mx-4 flex gap-2 overflow-x-auto px-4"
          role="group"
          aria-label={t.title}
        >
          <button
            type="button"
            aria-pressed={!genre}
            onClick={() => setGenre('')}
            className={chip(!genre)}
          >
            {t.all}
          </button>
          {options.workGenres.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={genre === g}
              onClick={() => setGenre(g)}
              className={chip(genre === g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="search-field flex min-h-10 min-w-0 flex-1 basis-64 items-center gap-2 rounded-full bg-sup-2 px-4">
          <Icon de={PiMagnifyingGlass} className="text-texto-fraco" />
          <span className="sr-only">{t.search(name)}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search(name)}
            className="min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-texto-fraco"
          />
        </label>
        {options.categories.length > 1 && (
          <div className="w-60 max-sm:w-full">
            <Selecao
              aria-label={t.category}
              className={select}
              opcoes={[
                { value: '', label: t.anyCategory },
                ...options.categories.map((c) => ({ value: c, label: c })),
              ]}
              valor={category}
              aoMudar={setCategory}
            />
          </div>
        )}
        <div className="w-44 max-sm:w-full">
          <Selecao
            aria-label={t.level}
            className={select}
            opcoes={[
              { value: '', label: t.anyLevel },
              ...Object.entries(LEVEL_VALUES).map(([value, label]) => ({
                value,
                label: copy.startHere.levels[label],
              })),
            ]}
            valor={level}
            aoMudar={setLevel}
          />
        </div>
        <div className="shrink-0 max-sm:w-full">
          <Selecao
            aria-label={t.sort}
            icone={PiArrowsDownUp}
            className={`${select} sm:w-max! whitespace-nowrap`}
            opcoes={SORTS.map((value) => ({ value, label: t.sorts[value] }))}
            valor={sort}
            aoMudar={(value) => setSort(value as ComposerWorkSort)}
          />
        </div>
        {filtered && (
          <Button variante="texto" tamanho="p" onClick={clear}>
            {t.clear}
          </Button>
        )}
      </div>

      <ul
        className="flex flex-col divide-y divide-[var(--linha)]"
        aria-busy={status === 'loading'}
      >
        {loadingFirst
          ? Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="py-4">
                <span className="loading-skeleton block h-6 w-2/3 rounded" />
              </li>
            ))
          : result.works.map((work) => (
              <WorkRow
                key={work.id}
                work={work}
                copy={copy}
                language={language}
              />
            ))}
        {!loadingFirst && status !== 'error' && !result.works.length && (
          <li className="py-6 t-rotulo text-texto-suave">{t.empty}</li>
        )}
      </ul>

      {status === 'error' && (
        <p role="alert" className="t-rotulo text-texto-suave">
          {t.error}
        </p>
      )}
      {result.hasMore && !loadingFirst && (
        <Button
          className="self-start"
          carregando={status === 'loading'}
          onClick={loadMore}
        >
          {t.loadMore}
        </Button>
      )}
    </section>
  );
}

function WorkRow({
  work,
  copy,
  language,
}: {
  work: ComposerWork;
  copy: ComposerCopy;
  language: 'pt' | 'en';
}) {
  const levelKey = work.difficultyLevel
    ? LEVEL_VALUES[work.difficultyLevel as keyof typeof LEVEL_VALUES]
    : undefined;
  const detail = [
    nomePopularCurto(work, language),
    work.instrument?.name,
    work.compositionYear,
    levelKey && copy.startHere.levels[levelKey],
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <li className="flex items-center gap-2">
      <Link
        href={`/works/${work.id}`}
        data-vira={`obra-${work.id}`}
        className="group grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-0.5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
      >
        <span className="truncate font-display text-[1.25rem] group-hover:text-ouro-texto">
          {workTitle(work.title, work.opOrCatalog)}
        </span>
        <span className="t-rotulo text-texto-suave sm:whitespace-nowrap">
          {detail}
        </span>
      </Link>
      <FavoriteHeart type="work" id={work.id} name={work.title} />
    </li>
  );
}
