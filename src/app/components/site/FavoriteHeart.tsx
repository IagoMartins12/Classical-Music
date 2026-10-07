'use client';

import { useState } from 'react';
import { PiHeart, PiHeartFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { COMMON } from '@/app/conteudo/site/common';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useLoginModal } from '@/app/stores/authStore';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';

/**
 * The favorite heart, on every composer and work card. Inside a link it only
 * toggles (no navigation). Visitors get the sign-in modal.
 *
 * - `onPhoto`: dark veil behind the heart, readable over any portrait.
 * - `withLabel`: the text button next to "Share" on the detail pages.
 */
export function FavoriteHeart({
  type,
  id,
  name,
  onPhoto = false,
  withLabel = false,
  className,
}: {
  type: 'composer' | 'work';
  id: string;
  name: string;
  onPhoto?: boolean;
  withLabel?: boolean;
  className?: string;
}) {
  const copy = COMMON[useRouteLanguage().language].favorite;
  const { user, isAuthenticated } = useAuth();
  const { open: openLogin } = useLoginModal();
  const favorited = useFavoritesStore((s) =>
    type === 'composer' ? s.isComposerFavorited(id) : s.isWorkFavorited(id)
  );
  const busy = useFavoritesStore((s) =>
    type === 'composer' ? s.loading.composers.has(id) : s.loading.works.has(id)
  );
  const toggleComposer = useFavoritesStore((s) => s.toggleComposerFavorite);
  const toggleWork = useFavoritesStore((s) => s.toggleWorkFavorite);
  const [beat, setBeat] = useState(0);

  const onClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated || !user?.id) return openLogin();
    if (busy) return;
    try {
      const now =
        type === 'composer'
          ? await toggleComposer(id, user.id)
          : await toggleWork(id, user.id);
      setBeat((b) => b + 1);
      toast.success(now ? copy.added(name) : copy.removed(name));
    } catch {
      toast.error(copy.failed);
    }
  };

  const heart = (
    <span
      key={beat}
      className={cx(
        'grid place-items-center',
        beat > 0 && favorited && 'heart-beat'
      )}
    >
      <Icon de={favorited ? PiHeartFill : PiHeart} tamanho="m" />
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
          'gap-2',
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
