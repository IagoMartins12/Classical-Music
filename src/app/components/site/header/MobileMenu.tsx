'use client';

import { useState } from 'react';
import { PiCaretRight, PiSignOut } from 'react-icons/pi';
import { Avatar } from '@/app/components/blog/site/pecas';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import Link from '@/app/components/LocalizedLink';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { OnThisDayCallout } from '../on-this-day/OnThisDayCallout';
import { MenuScreen, MenuScreenHeader } from '@/app/components/ui/MenuScreen';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import type { HeaderCopy } from '@/app/conteudo/site/header';
import type { RouteLanguage } from '@/app/utils/localizedRoutes';
import {
  EXPLORE_PATHS,
  PLANS_HREF,
  PRIMARY_LINKS,
  accountLinks,
  isActivePath,
  type HeaderUser,
} from './navigation';
import { displayName, type DisplayableUser } from './userDisplay';

type Screen = 'main' | 'explore' | 'account';

/**
 * The phone and tablet menu, like the blog's: a bottom sheet with screens
 * that slide (main → Explorar, main → your account), each with a way back.
 */
export function MobileMenu({
  open,
  onClose,
  copy,
  path,
  language,
  onSwitchLanguage,
  user,
  onSignIn,
  onSignUp,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  copy: HeaderCopy;
  path: string;
  language: RouteLanguage;
  onSwitchLanguage: ((next: RouteLanguage) => void) | null;
  user: (HeaderUser & DisplayableUser) | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}) {
  const [screen, setScreen] = useState<Screen>('main');
  const close = () => {
    onClose();
    setScreen('main');
  };
  const name = displayName(user);
  const rowClass =
    'flex min-h-[var(--alvo)] w-full items-center rounded-controle px-4 text-left font-medium transition-colors hover:bg-sup-2';

  return (
    <Sheet aberto={open} aoFechar={close} titulo={copy.menu} largura="p">
      <div className="relative overflow-hidden">
        <MenuScreen active={screen === 'main'} side="left">
          <nav aria-label={copy.label}>
            <ul className="flex flex-col gap-1">
              <li>
                <button
                  type="button"
                  onClick={() => setScreen('explore')}
                  className={cx(rowClass, 'justify-between text-texto-suave')}
                >
                  {copy.explore}
                  <Icon de={PiCaretRight} className="text-texto-fraco" />
                </button>
              </li>
              {PRIMARY_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={
                      isActivePath(path, link.href) ? 'page' : undefined
                    }
                    className={cx(
                      rowClass,
                      isActivePath(path, link.href)
                        ? 'text-ouro-texto'
                        : 'text-texto-suave'
                    )}
                  >
                    {copy[link.key]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={PLANS_HREF} onClick={close} className={rowClass}>
                  <span className="gold-shine">{copy.plans}</span>
                </Link>
              </li>
            </ul>
          </nav>

          <hr className="my-4 border-linha" />

          {user ? (
            <ul className="flex flex-col gap-1">
              <li>
                <button
                  type="button"
                  onClick={() => setScreen('account')}
                  className="flex w-full items-center gap-3 rounded-controle px-4 py-2.5 text-left hover:bg-sup-2"
                >
                  <Avatar
                    autor={{ nome: name, imagem: user.image ?? null }}
                    tamanho="p"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-texto">
                      {name}
                    </span>
                    <span className="t-legenda block">{copy.accountShort}</span>
                  </span>
                  <Icon de={PiCaretRight} className="text-texto-fraco" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onSignOut();
                  }}
                  className={cx(
                    rowClass,
                    'gap-3 text-[0.9375rem] font-normal text-texto-suave'
                  )}
                >
                  <Icon de={PiSignOut} />
                  {copy.signOut}
                </button>
              </li>
            </ul>
          ) : (
            <div className="flex flex-col gap-2 px-1">
              <Button
                variante="primario"
                onClick={() => {
                  close();
                  onSignUp();
                }}
              >
                {copy.signUp}
              </Button>
              <Button
                onClick={() => {
                  close();
                  onSignIn();
                }}
              >
                {copy.signIn}
              </Button>
            </div>
          )}

          <hr className="my-4 border-linha" />

          <div className="flex items-center justify-center gap-3 py-1">
            <LanguageToggle
              idioma={language}
              aoTrocar={
                onSwitchLanguage
                  ? (next) => {
                      close();
                      onSwitchLanguage(next);
                    }
                  : undefined
              }
            />
            <ThemeToggle variant="navbar" />
          </div>
        </MenuScreen>

        <MenuScreen active={screen === 'explore'} side="right">
          <MenuScreenHeader
            title={copy.explore}
            backLabel={copy.back}
            onBack={() => setScreen('main')}
          />
          <ul className="flex flex-col gap-1">
            {EXPLORE_PATHS.map((item) => {
              const entry = copy.explorePaths[item.key];
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex flex-col rounded-controle px-4 py-2.5 hover:bg-sup-2"
                  >
                    <span className="font-display text-[1.1875rem]">
                      {entry.label}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {entry.detail}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {screen === 'explore' && (
            <OnThisDayCallout onNavigate={close} className="mt-4" />
          )}
        </MenuScreen>

        {user && (
          <MenuScreen active={screen === 'account'} side="right">
            <MenuScreenHeader
              title={copy.accountShort}
              backLabel={copy.back}
              onBack={() => setScreen('main')}
            />
            <ul className="flex flex-col gap-1">
              {accountLinks(user).map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="flex min-h-[var(--alvo)] items-center gap-3 rounded-controle px-4 text-[0.9375rem] text-texto-suave hover:bg-sup-2"
                  >
                    <Icon de={link.icon} />
                    {copy.accountLinks[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </MenuScreen>
        )}
      </div>
    </Sheet>
  );
}
