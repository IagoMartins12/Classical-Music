'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiFileText,
  PiHeart,
  PiHeartFill,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  COLLECTIONS,
  type CollectionsCopy,
} from '@/app/conteudo/site/collections';
import { countryOf } from '@/app/conteudo/site/countries';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import { useSession } from '@/app/libs/session';
import {
  type CollectionEntry,
  type CollectionKind,
  favoriteCollection,
} from '@/app/requests/collections';
import { Portrait } from '../Portrait';
import { composerYears } from '../composerYears';
import { workTitle } from '../workTitle';

export const KIND_ICON: Record<CollectionKind, typeof PiUser> = {
  WORK: PiMusicNotes,
  COMPOSER: PiUser,
  SCORE: PiFileText,
};

/** Where an item leads: the composer, the work, or the score's work. */
export function entryHref(kind: CollectionKind, e: CollectionEntry) {
  if (kind === 'COMPOSER') return `/composer/${e.refId}`;
  if (kind === 'WORK') return `/works/${e.refId}`;
  return e.workId ? `/works/${e.workId}` : null;
}

export function entryTitle(kind: CollectionKind, e: CollectionEntry) {
  return kind === 'WORK' ? workTitle(e.title, e.opOrCatalog) : e.title;
}

/** The line under the title, by kind, in the page's language. */
export function entryDetail(
  kind: CollectionKind,
  e: CollectionEntry,
  copy: CollectionsCopy,
  language: 'pt' | 'en'
) {
  if (kind === 'COMPOSER') {
    return [
      composerYears(
        e.birthYear ? String(e.birthYear) : null,
        e.deathYear ? String(e.deathYear) : null,
        language === 'pt' ? 'n.' : 'b.'
      ),
      countryOf(e.nationality, language),
    ]
      .filter(Boolean)
      .join(' · ');
  }
  if (kind === 'WORK') {
    return [e.composerName, e.instrumentName].filter(Boolean).join(' · ');
  }
  return [
    e.workTitle && workTitle(e.workTitle, e.opOrCatalog),
    e.composerName,
    e.edition,
    e.pageCount && copy.pages(e.pageCount),
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Up to four portraits, overlapping: who is in the collection at a glance. */
export function Faces({
  faces,
  size = 'h-10 w-10',
}: {
  faces: { name: string; portraitUrl?: string | null }[];
  size?: string;
}) {
  if (!faces.length) return null;
  return (
    <span className="flex shrink-0 -space-x-3" aria-hidden="true">
      {faces.map((f) => (
        <Portrait
          key={f.name}
          name={f.name}
          src={f.portraitUrl}
          sizes="48px"
          className={cx(size, 'rounded-full ring-2 ring-[var(--fundo)]')}
        />
      ))}
    </span>
  );
}

/**
 * The favorite heart of a public collection, as on the composer and work
 * cards. Not on your own collection: the API refuses it too.
 */
export function CollectionHeart({
  id,
  title,
  initial,
  ownerId,
  onChange,
  className,
}: {
  id: string;
  title: string;
  initial: boolean;
  /** Hidden for its owner (pages cached on the server cannot tell). */
  ownerId?: string;
  onChange?: (favorited: boolean, count: number) => void;
  className?: string;
}) {
  const copy = COLLECTIONS[useRouteLanguage().language].favorite;
  const allowed = useSignInGate();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [beat, setBeat] = useState(0);
  const { data: session } = useSession();

  const toggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!allowed('favorite') || busy) return;
    setBusy(true);
    const result = await favoriteCollection(id, !on).catch(() => null);
    setBusy(false);
    if (!result?.ok) return toast.error(copy.failed);
    setOn(result.data.favorited);
    setBeat((b) => b + 1);
    onChange?.(result.data.favorited, result.data.favoritesCount);
  };

  if (ownerId && session?.user?.id === ownerId) return null;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-busy={busy}
      aria-label={on ? copy.remove(title) : copy.add(title)}
      onClick={toggle}
      className={cx(
        'grid h-9 w-9 shrink-0 place-items-center rounded-full text-texto-fraco transition-colors duration-[var(--t-toque)] hover:bg-sup-2 hover:text-ouro-texto [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11',
        on && '!text-ouro-texto',
        className
      )}
    >
      <span
        key={beat}
        className={cx(
          'grid place-items-center',
          beat > 0 && on && 'heart-beat'
        )}
      >
        <Icon de={on ? PiHeartFill : PiHeart} tamanho="m" />
      </span>
    </button>
  );
}
