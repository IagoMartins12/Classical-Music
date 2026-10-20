'use client';

import { SearchHighlights } from './SearchHighlights';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiArrowRight,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiNewspaper,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { HeaderCopy } from '@/app/conteudo/site/header';
import { useDismiss } from '@/app/hooks/useDismiss';
import { useSiteSearch } from '@/app/hooks/useSiteSearch';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { localizeHref, type RouteLanguage } from '@/app/utils/localizedRoutes';
import { composerYears } from '../composerYears';
import { workTitle } from '../workTitle';
import { PWA } from '@/app/conteudo/site/pwa';
import { useOnline } from '@/app/hooks/useOnline';
import { SEARCH_HREF } from './navigation';

/** The least the results page takes, and the suggestions wait for too. */
const MIN_TERM = 2;

interface ResultItem {
  id: string;
  group: 'composers' | 'works' | 'articles';
  title: string;
  detail: string;
  href: string;
  image?: string | null;
}

/**
 * The site's live search: the search sheet the header opens, and the home hero.
 * Results arrive as you type, grouped by kind; arrow keys move through them,
 * Enter opens the highlighted one or, with none, the full results page. The
 * sheet also has a "Search" button, on only once something is typed, that goes
 * to the results page. Both wait for two letters, the least the results page
 * takes.
 */
export function HeaderSearch({
  copy,
  language,
  variant = 'sheet',
  autoFocus = false,
  onNavigate,
}: {
  copy: HeaderCopy['search'];
  language: RouteLanguage;
  variant?: 'hero' | 'sheet';
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const state = useSiteSearch(term);
  const close = () => {
    setOpen(false);
    setActive(-1);
  };
  const dropdown = variant !== 'sheet';
  const ref = useDismiss<HTMLFormElement>(open && dropdown, close);

  const result =
    state.status === 'done' || state.status === 'loading' ? state.result : null;
  const items = useMemo<ResultItem[]>(() => {
    if (!result) return [];
    return [
      ...result.composers.map((c) => ({
        id: c.id,
        group: 'composers' as const,
        title: c.name,
        detail:
          composerYears(
            c.birthDate,
            c.deathDate,
            language === 'pt' ? 'n.' : 'b.'
          ) ||
          (c.epochName ?? ''),
        href: localizeHref(`/composer/${c.id}`, language),
        image: c.portraitUrl,
      })),
      ...result.works.map((w) => ({
        id: w.id,
        group: 'works' as const,
        title: workTitle(w.title, w.opOrCatalog),
        detail: w.composer.name,
        href: localizeHref(`/works/${w.id}`, language),
      })),
      ...result.articles.map((a) => ({
        id: a.id,
        group: 'articles' as const,
        title: a.title,
        detail: '',
        href: rotasDoBlog.artigo(a.slug, language),
      })),
    ];
  }, [result, language]);

  const online = useOnline();
  const resultsHref = localizeHref(
    `${SEARCH_HREF}?q=${encodeURIComponent(term.trim())}`,
    language
  );
  const go = (href: string) => {
    close();
    onNavigate?.();
    router.push(href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!items.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    }
  };

  const showPanel =
    (variant === 'sheet' || open) && term.trim().length >= MIN_TERM;
  const groups: { key: ResultItem['group']; label: string }[] = [
    { key: 'composers', label: copy.composers },
    { key: 'works', label: copy.works },
    { key: 'articles', label: copy.articles },
  ];

  return (
    <form
      ref={ref}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (term.trim().length < MIN_TERM) return;
        go(active >= 0 ? items[active].href : resultsHref);
      }}
      className="relative w-full"
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        {copy.label}
      </label>
      <div
        className={cx(
          'search-field sup-1 flex items-center gap-3 !rounded-full',
          {
            hero: 'min-h-14 py-2 pl-6 pr-2 shadow-[var(--sombra-1)]',
            sheet: 'min-h-14 py-2 pl-5 pr-2',
          }[variant]
        )}
      >
        <Icon
          de={PiMagnifyingGlass}
          tamanho="m"
          className="shrink-0 text-texto-fraco"
        />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `${listId}-${active}` : undefined
          }
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          value={term}
          placeholder={copy.placeholder}
          onChange={(event) => {
            setTerm(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cx(
            'min-w-0 flex-1 bg-transparent outline-none placeholder:text-texto-fraco',
            variant === 'hero' ? 'text-[1.0625rem]' : 'text-base'
          )}
        />
        {variant === 'hero' && (
          <Button variante="primario" type="submit" className="shrink-0">
            {copy.title}
          </Button>
        )}
        {variant === 'sheet' && (
          <Button
            variante="primario"
            type="submit"
            className="shrink-0"
            disabled={term.trim().length < MIN_TERM}
          >
            {copy.submit}
          </Button>
        )}
      </div>

      {variant === 'sheet' && term.trim().length < MIN_TERM && (
        <SearchHighlights copy={copy} onNavigate={onNavigate} />
      )}

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label={copy.label}
          className={cx(
            'flex flex-col gap-1 p-2 text-left',
            dropdown
              ? 'popover-open sup-alta absolute inset-x-0 top-full z-menu mt-2 max-h-[70vh] overflow-y-auto !rounded-card'
              : 'mt-4'
          )}
        >
          {state.status === 'error' && (
            <p className="px-3 py-4 t-rotulo text-texto-suave">
              {online ? copy.error : PWA[language].offline.busca}
            </p>
          )}
          {state.status === 'loading' && !items.length && (
            <p
              className="px-3 py-4 t-rotulo text-texto-suave"
              aria-live="polite"
            >
              {copy.searching}
            </p>
          )}
          {state.status === 'done' && !items.length && (
            <p className="px-3 py-4 t-rotulo text-texto-suave">{copy.empty}</p>
          )}
          {groups.map((group) => {
            const groupItems = items.filter((i) => i.group === group.key);
            if (!groupItems.length) return null;
            return (
              <div key={group.key} role="group" aria-label={group.label}>
                <p className="px-3 pb-1 pt-2 t-legenda">{group.label}</p>
                {groupItems.map((item) => {
                  const index = items.indexOf(item);
                  return (
                    <button
                      key={`${item.group}-${item.id}`}
                      id={`${listId}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      onPointerEnter={() => setActive(index)}
                      onClick={() => go(item.href)}
                      style={{ ['--i' as string]: Math.min(index, 8) }}
                      className={cx(
                        'item-entra flex w-full items-center gap-3 rounded-controle px-3 py-2 text-left',
                        index === active ? 'bg-sup-2' : 'hover:bg-sup-2'
                      )}
                    >
                      <ResultThumb item={item} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-display text-[1.0625rem] leading-snug">
                          {item.title}
                        </span>
                        {item.detail && (
                          <span className="truncate t-rotulo text-texto-suave">
                            {item.detail}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => go(resultsHref)}
              className="mx-3 my-2 inline-flex min-h-10 items-center gap-1.5 self-start t-rotulo text-ouro-texto hover:underline"
            >
              {copy.seeAll} <Icon de={PiArrowRight} tamanho="pp" />
            </button>
          )}
        </div>
      )}
    </form>
  );
}

function ResultThumb({ item }: { item: ResultItem }) {
  if (item.group === 'composers' && item.image) {
    return (
      <Image
        src={item.image}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sup-2 text-texto-suave">
      <Icon
        de={item.group === 'articles' ? PiNewspaper : PiMusicNotes}
        tamanho="p"
      />
    </span>
  );
}
