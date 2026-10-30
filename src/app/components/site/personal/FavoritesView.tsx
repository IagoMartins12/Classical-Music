'use client';

import { useMemo, useState } from 'react';
import { PiArrowRight, PiFilePdf, PiMagnifyingGlass } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { eraName } from '@/app/conteudo/site/eras';
import { PERSONAL, type PersonalCopy } from '@/app/conteudo/site/personal';
import { scoreSource } from '@/app/conteudo/site/scoreSources';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  useFavoritesStore,
  type FavoriteComposer,
  type FavoriteScore,
  type FavoriteWork,
} from '@/app/stores/useFavoritesStore';
import { useDadosDaConta } from '@/app/libs/session/dadosDaConta';
import { FavoriteHeart } from '../FavoriteHeart';
import { NumeroVivo } from '@/app/components/ui/NumeroVivo';
import { useSaida } from '@/app/components/ui/useSaida';
import { FavoriteCollections } from '../collections/MyCollectionsView';
import { Portrait } from '../Portrait';
import { ListResults, ViewToggle } from '../lists/ViewToggle';
import { workTitle } from '../workTitle';

type Tab = 'all' | 'composers' | 'works' | 'scores' | 'collections';
/** In "All", each kind shows a few and a link to its own tab. */
const PREVIEW = 6;

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const listClass =
  'cascata grid grid-cols-1 gap-4 divide-[var(--linha)] sm:grid-cols-2 xl:grid-cols-3 max-sm:gap-0 max-sm:divide-y data-[view=list]:grid-cols-1! data-[view=list]:gap-0 data-[view=list]:divide-y';
const cardClass =
  'relative flex items-center gap-4 rounded-card bg-sup-2 p-4 pr-14 row:rounded-none row:bg-transparent! row:bg-none! row:py-3 row:pl-0 row:pr-12';

/** "Your favorites": composers, works and scores, with an "All" overview. */
/** The same empty list each time, so the store selectors stay stable. */
const SEM: never[] = [];

export function FavoritesView() {
  const { language } = useRouteLanguage();
  const copy = PERSONAL[language].favorites;
  useFavorites();
  // Only the signed-in account's (`dadosDaConta`): the store is kept in the
  // browser, and another account's must never show.
  const confirmado = useDadosDaConta();
  const composers = useFavoritesStore((s) =>
    confirmado ? s.favoriteComposers : SEM
  );
  const works = useFavoritesStore((s) => (confirmado ? s.favoriteWorks : SEM));
  const scores = useFavoritesStore((s) =>
    confirmado ? s.favoriteScores : SEM
  );
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const has = (text: string) => !q || normalize(text).includes(q);
    return {
      composers: composers.filter((f) =>
        has(`${f.composer?.fullName ?? ''} ${f.composer?.name ?? ''}`)
      ),
      works: works.filter((f) =>
        has(
          `${f.work?.title ?? ''} ${f.work?.opOrCatalog ?? ''} ${f.work?.composer.fullName ?? ''}`
        )
      ),
      scores: scores.filter((f) =>
        has(
          `${f.scoreTitle} ${f.work?.title ?? ''} ${f.work?.composer.fullName ?? ''}`
        )
      ),
    };
  }, [composers, works, scores, query]);

  const total = composers.length + works.length + scores.length;
  const shown =
    filtered.composers.length + filtered.works.length + filtered.scores.length;
  const tabs = [
    ['all', copy.tabs.all, total],
    ['composers', copy.tabs.composers, composers.length],
    ['works', copy.tabs.works, works.length],
    ['scores', copy.tabs.scores, scores.length],
  ] as const;
  const collectionsLabel = PERSONAL[language].nav.collections;

  const section = (
    kind: Exclude<Tab, 'all' | 'collections'>,
    title: string
  ) => {
    const items = filtered[kind];
    if (!items.length) return null;
    const visible = tab === 'all' ? items.slice(0, PREVIEW) : items;
    return (
      <section key={kind} className="flex flex-col gap-4">
        {tab === 'all' && (
          <div className="flex items-end justify-between gap-3">
            <h2 className="t-subtitulo">{title}</h2>
            {items.length > PREVIEW && (
              <Button variante="texto" tamanho="p" onClick={() => setTab(kind)}>
                {title} · {items.length} <Icon de={PiArrowRight} tamanho="pp" />
              </Button>
            )}
          </div>
        )}
        <ListResults className={listClass}>
          {kind === 'composers' &&
            (visible as FavoriteComposer[]).map((f) => (
              <ComposerFavorite key={f.id} favorite={f} language={language} />
            ))}
          {kind === 'works' &&
            (visible as FavoriteWork[]).map((f) => (
              <WorkFavorite key={f.id} favorite={f} />
            ))}
          {kind === 'scores' &&
            (visible as FavoriteScore[]).map((f) => (
              <ScoreFavorite
                key={f.id}
                favorite={f}
                copy={copy}
                language={language}
              />
            ))}
        </ListResults>
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo={copy.title}>
          {tabs.map(([key, label, n]) => (
            <Aba key={key} ativa={tab === key} onClick={() => setTab(key)}>
              {label} · <NumeroVivo valor={n} />
            </Aba>
          ))}
          <Aba
            ativa={tab === 'collections'}
            onClick={() => setTab('collections')}
          >
            {collectionsLabel}
          </Aba>
        </Abas>
        <ViewToggle />
      </div>

      {tab === 'collections' ? (
        <FavoriteCollections />
      ) : (
        <>
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

          {total === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-8">
              <p className="font-display text-[1.5rem]">{copy.empty}</p>
              <p className="t-rotulo text-texto-suave">{copy.emptyText}</p>
              <Link
                href="/composers"
                className={classesDeBotao('primario', 'p')}
              >
                {copy.explore}
              </Link>
            </div>
          ) : shown === 0 ? (
            <p className="t-rotulo text-texto-suave">{copy.noResults}</p>
          ) : (
            <div className="flex flex-col gap-10">
              {(tab === 'all' || tab === 'composers') &&
                section('composers', copy.tabs.composers)}
              {(tab === 'all' || tab === 'works') &&
                section('works', copy.tabs.works)}
              {(tab === 'all' || tab === 'scores') &&
                section('scores', copy.tabs.scores)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ComposerFavorite({
  favorite,
  language,
}: {
  favorite: FavoriteComposer;
  language: 'pt' | 'en';
}) {
  const composer = favorite.composer;
  const name = composer?.fullName || composer?.name || '';
  const leaving = useSaida();
  return (
    <li
      ref={leaving.ref}
      data-vira={`compositor-${favorite.composerId}`}
      className={cardClass}
    >
      <Portrait
        name={name}
        src={composer?.portraitUrl}
        sizes="56px"
        className="h-14 w-14 shrink-0 rounded-full text-[1rem]"
      />
      <Link
        href={`/composer/${favorite.composerId}`}
        className="group flex min-w-0 flex-col"
      >
        <span className="truncate font-display text-[1.25rem] group-hover:text-ouro-texto">
          {name}
        </span>
        <span className="t-rotulo truncate text-texto-suave">
          {eraName(composer?.epochName, language)}
        </span>
      </Link>
      <FavoriteHeart
        type="composer"
        leaving={leaving}
        id={favorite.composerId}
        name={composer?.name ?? name}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      />
    </li>
  );
}

function WorkFavorite({ favorite }: { favorite: FavoriteWork }) {
  const work = favorite.work;
  const leaving = useSaida();
  return (
    <li
      ref={leaving.ref}
      data-vira={`obra-${favorite.workId}`}
      className={cardClass}
    >
      <Portrait
        name={work?.composer.fullName ?? '?'}
        sizes="48px"
        className="h-12 w-12 shrink-0 rounded-full text-[0.875rem]"
      />
      <Link
        href={`/works/${favorite.workId}`}
        className="group flex min-w-0 flex-col"
      >
        <span className="truncate font-display text-[1.25rem] group-hover:text-ouro-texto">
          {work ? workTitle(work.title, work.opOrCatalog) : favorite.workId}
        </span>
        <span className="t-rotulo truncate text-texto-suave">
          {work?.composer.fullName}
        </span>
      </Link>
      <FavoriteHeart
        type="work"
        leaving={leaving}
        id={favorite.workId}
        name={work?.title ?? ''}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      />
    </li>
  );
}

function ScoreFavorite({
  favorite,
  copy,
  language,
}: {
  favorite: FavoriteScore;
  copy: PersonalCopy['favorites'];
  language: 'pt' | 'en';
}) {
  const work = favorite.work;
  const date = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(favorite.addedAt));
  const leaving = useSaida();
  return (
    <li ref={leaving.ref} className={cardClass}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-controle bg-[var(--fundo)] text-texto-fraco row:bg-sup-2">
        <Icon de={PiFilePdf} tamanho="m" />
      </span>
      <Link
        href={`/works/${favorite.workId}#scores`}
        className="group flex min-w-0 flex-col"
      >
        <span className="truncate font-display text-[1.125rem] group-hover:text-ouro-texto">
          {favorite.scoreTitle}
        </span>
        <span className="t-rotulo truncate text-texto-suave">
          {[work?.title, work?.composer.fullName].filter(Boolean).join(' · ')}
        </span>
        <span className="t-legenda truncate">
          {scoreSource(favorite.scoreSource).label} · {copy.since(date)}
        </span>
      </Link>
      <FavoriteHeart
        type="score"
        leaving={leaving}
        id={favorite.scoreId}
        name={favorite.scoreTitle}
        score={{
          workId: favorite.workId,
          source: favorite.scoreSource,
          data: {
            title: favorite.scoreTitle,
            type: favorite.scoreType,
            fileFormat: 'pdf',
          },
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      />
    </li>
  );
}
