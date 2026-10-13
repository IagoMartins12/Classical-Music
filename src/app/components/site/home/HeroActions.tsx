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
 * Two buttons (the main path, then the composers) and, under them, the
 * portal: an invitation for visitors, a shortcut for whoever already has one.
 * Visitors also read that reading and listening need no account. On phones the buttons take the full width, stacked.
 */
export function HeroActions({ copy }: { copy: HomeCopy['hero'] }) {
  const { isAuthenticated, user } = useAuth();
  const { open: openRegister } = useRegisterModal();
  const hasPortal = !!(user?.isTeacher || user?.isStudent);

  return (
    <div className="flex flex-col gap-4 max-md:items-center">
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {isAuthenticated ? (
          <Link
            href="/learning"
            className={cx(classesDeBotao('primario', 'm'), 'max-sm:w-full')}
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
          className={cx(classesDeBotao('secundario', 'm'), 'max-sm:w-full')}
        >
          {copy.exploreComposers}
        </Link>
      </div>
      <Link
        href={hasPortal ? '/portal' : '/for-teachers'}
        className="inline-flex min-h-10 items-center gap-1.5 self-start t-rotulo text-texto-suave underline decoration-transparent underline-offset-4 transition-colors hover:text-texto hover:decoration-[var(--ouro)] max-md:self-center"
      >
        {hasPortal ? copy.openPortal : copy.teach}
        <Icon de={PiArrowRight} tamanho="pp" />
      </Link>
      {!isAuthenticated && (
        <p className="t-legenda max-md:text-center">{copy.freeNote}</p>
      )}
    </div>
  );
}
