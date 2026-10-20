'use client';

import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { useAuth } from '@/app/hooks/useAuth';
import { useRegisterModal } from '@/app/stores/authStore';

/**
 * Two buttons (the main path, then the composers) and the portal: for a
 * teacher it is the third button of the row, quiet and last; for everyone
 * else, a text link under the buttons (an invitation for visitors, a
 * shortcut for students). Visitors also read that reading and listening need
 * no account. On phones the buttons take the full width, stacked.
 *
 * A teacher's three buttons are a notch smaller from the tablet up (14 px text,
 * 14 px side padding), so the row fits the column the text already had; where
 * it still does not (a narrow desktop), it wraps instead of growing, centered
 * on the tablet and left-aligned on the desktop.
 */
export function HeroActions({ copy }: { copy: HomeCopy['hero'] }) {
  const { isAuthenticated, user } = useAuth();
  const { open: openRegister } = useRegisterModal();
  const isTeacher = !!user?.isTeacher;
  const hasPortal = !!(user?.isTeacher || user?.isStudent);
  const compact = isTeacher && 'md:px-3.5 md:text-sm';

  return (
    <div className="flex flex-col gap-4 max-lg:items-center">
      <div
        className={cx(
          'flex w-full flex-col gap-3 sm:w-auto sm:flex-row',
          isTeacher &&
            'sm:flex-wrap sm:justify-center md:gap-2 lg:justify-start'
        )}
      >
        {isAuthenticated ? (
          <Link
            href="/learning"
            className={cx(
              classesDeBotao('primario', 'm'),
              'max-sm:w-full',
              compact
            )}
          >
            {copy.continue} <Icon de={PiArrowRight} tamanho="p" />
          </Link>
        ) : (
          <Button
            variante="primario"
            onClick={openRegister}
            className="max-sm:w-full"
          >
            {copy.start}
          </Button>
        )}
        <Link
          href="/composers"
          className={cx(
            classesDeBotao('secundario', 'm'),
            'max-sm:w-full',
            compact
          )}
        >
          {copy.exploreComposers}
        </Link>
        {isTeacher && (
          <Link
            href="/portal"
            className={cx(
              classesDeBotao('fantasma', 'm'),
              'max-sm:w-full',
              compact
            )}
          >
            {copy.openPortal} <Icon de={PiArrowRight} tamanho="p" />
          </Link>
        )}
      </div>
      {!isTeacher && (
        <Link
          href={hasPortal ? '/portal' : '/for-teachers'}
          className="inline-flex min-h-10 items-center gap-1.5 self-start t-rotulo text-texto-suave underline decoration-transparent underline-offset-4 transition-colors hover:text-texto hover:decoration-[var(--ouro)] max-lg:self-center"
        >
          {hasPortal ? copy.openPortal : copy.teach}
          <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      )}
      {!isAuthenticated && (
        <p className="t-legenda max-lg:text-center">{copy.freeNote}</p>
      )}
    </div>
  );
}
