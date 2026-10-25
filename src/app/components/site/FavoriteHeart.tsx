'use client';

import { useSignInGate } from '@/app/hooks/useSignInGate';
import { useState } from 'react';
import { PiHeart, PiHeartFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { COMMON } from '@/app/conteudo/site/common';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useDadosDaConta } from '@/app/libs/session/dadosDaConta';

/**
 * The favorite heart, on every composer and work card. Inside a link it only
 * toggles (no navigation). Visitors get the sign-in modal.
 *
 * - `onPhoto`: dark veil behind the heart, readable over any portrait.
 * - `withLabel`: the text button next to "Share" on the detail pages.
 */
/** A score is favorited per work and source (`sourceId` + `IMSLP`, `UPLOAD`…). */
export interface ScoreFavoriteTarget {
  workId: string;
  source: string;
  /** Kept with the favorite so the favorites page lists it without a lookup. */
  data: {
    title: string;
    type: string;
    downloadUrl?: string | null;
    fileSize?: string | null;
    pageCount?: string | null;
    fileFormat: string;
  };
}

export function FavoriteHeart({
  type,
  id,
  name,
  score,
  onPhoto = false,
  withLabel = false,
  leaving,
  className,
}: {
  type: 'composer' | 'work' | 'score';
  id: string;
  name: string;
  /** Required when `type` is `score`. */
  score?: ScoreFavoriteTarget;
  onPhoto?: boolean;
  withLabel?: boolean;
  /**
   * The card this heart takes out of a list (`useSaida`): unfavoriting
   * plays its exit first and removes it after; a failure brings it back.
   */
  leaving?: { sair: () => Promise<void>; voltar: () => void };
  className?: string;
}) {
  const copy = COMMON[useRouteLanguage().language].favorite;
  const { user } = useAuth();
  const allowed = useSignInGate();
  const scoreKey = score && `${score.workId}-${id}-${score.source}`;
  // The favorites come from `localStorage`: shown only once the session says
  // they are this account's (`dadosDaConta`), which is also never on the
  // server or in the hydration render, so the first render matches the
  // server's empty heart.
  const confirmado = useDadosDaConta();
  const salvo = useFavoritesStore((s) =>
    type === 'composer'
      ? s.isComposerFavorited(id)
      : type === 'work'
        ? s.isWorkFavorited(id)
        : !!score && s.isScoreFavorited(score.workId, id, score.source)
  );
  const favorited = confirmado && salvo;
  const busy = useFavoritesStore((s) =>
    type === 'composer'
      ? s.loading.composers.has(id)
      : type === 'work'
        ? s.loading.works.has(id)
        : !!scoreKey && s.loading.scores.has(scoreKey)
  );
  const toggleComposer = useFavoritesStore((s) => s.toggleComposerFavorite);
  const toggleWork = useFavoritesStore((s) => s.toggleWorkFavorite);
  const toggleScore = useFavoritesStore((s) => s.toggleScoreFavorite);
  // Each gesture replays its motion: sparks on, the heart letting go off.
  const [gesture, setGesture] = useState<{ n: number; on: boolean } | null>(
    null
  );

  const onClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!allowed('favorite') || !user?.id || busy) return;
    const removing = favorited && leaving;
    if (removing) {
      setGesture((g) => ({ n: (g?.n ?? 0) + 1, on: false }));
      await leaving.sair();
    }
    try {
      const now =
        type === 'composer'
          ? await toggleComposer(id, user.id)
          : type === 'work'
            ? await toggleWork(id, user.id)
            : await toggleScore(
                score!.workId,
                id,
                score!.source,
                user.id,
                score!.data
              );
      if (!removing) setGesture((g) => ({ n: (g?.n ?? 0) + 1, on: now }));
      toast.success(now ? copy.added(name) : copy.removed(name));
    } catch {
      leaving?.voltar();
      toast.error(copy.failed);
    }
  };

  const heart = (
    <span
      key={gesture?.n ?? 0}
      className={cx(
        'relative grid place-items-center',
        gesture && (gesture.on ? 'heart-beat' : 'heart-solta')
      )}
    >
      <Icon de={favorited ? PiHeartFill : PiHeart} tamanho="m" />
      {gesture?.on && (
        <span aria-hidden="true" className="faiscas">
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <i key={k} style={{ ['--k' as string]: k }} />
          ))}
        </span>
      )}
    </span>
  );

  if (withLabel) {
    return (
      <button
        type="button"
        aria-pressed={favorited}
        aria-busy={busy}
        onClick={onClick}
        className={cx(
          classesDeBotao(favorited ? 'primario' : 'secundario', 'm'),
          'gap-2 whitespace-nowrap',
          className
        )}
      >
        {heart}
        {favorited ? copy.labelOn : copy.labelOff}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-busy={busy}
      aria-label={favorited ? copy.remove(name) : copy.add(name)}
      onClick={onClick}
      className={cx(
        'grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-[var(--t-toque)] [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11',
        onPhoto
          ? 'bg-[var(--veu-foto)] text-sobre-foto hover:text-[var(--ouro)]'
          : 'text-texto-fraco hover:bg-sup-2 hover:text-ouro-texto',
        favorited && (onPhoto ? '!text-[var(--ouro)]' : '!text-ouro-texto'),
        className
      )}
    >
      {heart}
    </button>
  );
}
