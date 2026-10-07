'use client';

import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { useAuth } from '@/app/hooks/useAuth';
import { useRegisterModal } from '@/app/stores/authStore';

const linkText =
  'inline-flex min-h-10 items-center gap-1.5 t-rotulo underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[var(--ouro)]';

/** Visitors: sign up, explore, teach. Signed in: back to the studies. */
export function HeroActions({ copy }: { copy: HomeCopy['hero'] }) {
  const { isAuthenticated } = useAuth();
  const { open: openRegister } = useRegisterModal();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 max-md:justify-center">
      {isAuthenticated ? (
        <Link href="/learning" className={classesDeBotao('primario', 'm')}>
          {copy.continue} <Icon de={PiArrowRight} tamanho="p" />
        </Link>
      ) : (
        <Button variante="primario" onClick={openRegister}>
          {copy.start}
        </Button>
      )}
      <Link href="/composers" className={cx(linkText, 'text-texto')}>
        {copy.exploreComposers} <Icon de={PiArrowRight} tamanho="pp" />
      </Link>
      <Link href="/teachers" className={cx(linkText, 'text-texto-suave')}>
        {copy.teach}
      </Link>
    </div>
  );
}
