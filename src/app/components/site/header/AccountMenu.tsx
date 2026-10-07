'use client';

import { useCallback, useState } from 'react';
import { PiCaretDown, PiSignOut } from 'react-icons/pi';
import { Avatar } from '@/app/components/blog/site/pecas';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { HeaderCopy } from '@/app/conteudo/site/header';
import { useDismiss } from '@/app/hooks/useDismiss';
import { accountLinks, type HeaderUser } from './navigation';
import { displayName, type DisplayableUser } from './userDisplay';

/** The signed-in person's menu: personal pages, portals, sign out. */
export function AccountMenu({
  copy,
  user,
  onSignOut,
  onCompleteProfile,
}: {
  copy: HeaderCopy;
  user: HeaderUser & DisplayableUser & { onboardingCompleted?: boolean | null };
  onSignOut: () => void;
  onCompleteProfile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const name = displayName(user);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={copy.account}
        onClick={() => setOpen(!open)}
        className="flex min-h-[var(--alvo)] items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-sup-2"
      >
        <Avatar
          autor={{ nome: name, imagem: user.image ?? null }}
          tamanho="p"
        />
        <span className="max-w-32 truncate text-[0.9375rem] max-xl:hidden">
          {user.firstName || name}
        </span>
        <Icon
          de={PiCaretDown}
          tamanho="pp"
          className={cx('transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="popover-open sup-alta absolute right-0 top-full z-menu mt-2 flex w-72 flex-col gap-1 !rounded-card p-2"
        >
          <div className="flex flex-col px-3 pb-3 pt-2">
            <span className="truncate font-display text-[1.25rem]">{name}</span>
            {user.email && (
              <span className="truncate t-legenda">{user.email}</span>
            )}
            {!user.onboardingCompleted && (
              <button
                type="button"
                onClick={() => {
                  close();
                  onCompleteProfile();
                }}
                className="mt-2 self-start t-rotulo text-ouro-texto hover:underline"
              >
                {copy.completeProfile}
              </button>
            )}
          </div>
          <span className="mx-2 h-px bg-[var(--linha)]" />
          {accountLinks(user).map((link) => (
            <Link
              key={link.key}
              role="menuitem"
              href={link.href}
              onClick={close}
              className="flex min-h-10 items-center gap-3 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
            >
              <Icon de={link.icon} tamanho="p" />
              {copy.accountLinks[link.key]}
            </Link>
          ))}
          <span className="mx-2 h-px bg-[var(--linha)]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onSignOut();
            }}
            className="flex min-h-10 items-center gap-3 rounded-controle px-3 text-left text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
          >
            <Icon de={PiSignOut} tamanho="p" />
            {copy.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
