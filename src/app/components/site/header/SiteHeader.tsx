'use client';

import { useEffect, useState } from 'react';
import { PiList, PiMagnifyingGlass } from 'react-icons/pi';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import Link from '@/app/components/LocalizedLink';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { HEADER } from '@/app/conteudo/site/header';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignOut } from '@/app/hooks/useSignOut';
import {
  useLoginModal,
  useOnboardingModal,
  useRegisterModal,
} from '@/app/stores/authStore';
import { AccountMenu } from './AccountMenu';
import { BrandLink } from './BrandLink';
import { ExploreMenu } from './ExploreMenu';
import { HeaderSearch } from './HeaderSearch';
import { MobileMenu } from './MobileMenu';
import { NavLink } from './NavLink';
import {
  PLANS_HREF,
  PRIMARY_LINKS,
  isActivePath,
  pageHasSearch,
} from './navigation';

/**
 * The site header, one component for three widths:
 *
 * - **Desktop (lg+)** — Explorar, Blog, Ensino, Sobre; the live search in
 *   the middle (hidden where the page has its own); Planos as the only gold
 *   chip; language, theme and the account.
 * - **Tablet (md–lg)** — brand, search, language, theme, account and the
 *   menu sheet.
 * - **Phone** — brand, search and the menu sheet, like the blog's.
 */
export function SiteHeader() {
  const { language, path, switchLanguage } = useRouteLanguage();
  const copy = HEADER[language];
  const { user, isAuthenticated } = useAuth();
  const { open: openLogin } = useLoginModal();
  const { open: openRegister } = useRegisterModal();
  const { open: openOnboarding } = useOnboardingModal();
  const signOut = useSignOut({
    done: copy.signedOut,
    failed: copy.signOutError,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl K / ⌘K opens the search, as on the blog.
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);

  const signedUser = isAuthenticated && user ? user : null;
  const languageToggle = (
    <LanguageToggle
      variant="compact"
      idioma={language}
      aoTrocar={switchLanguage ?? undefined}
    />
  );

  return (
    <header className="navbar-classical sticky top-0 z-barra">
      <div className="section-wrap-nav flex min-h-16 items-center gap-2 lg:gap-4">
        <BrandLink label={copy.home} />

        <nav
          aria-label={copy.label}
          className="flex items-center gap-0.5 max-lg:hidden"
        >
          <ExploreMenu copy={copy} path={path} />
          {PRIMARY_LINKS.map((link) => (
            <NavLink
              key={link.key}
              href={link.href}
              active={isActivePath(path, link.href)}
            >
              {copy[link.key]}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-1.5 lg:gap-2">
          {!pageHasSearch(path) && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-haspopup="dialog"
              aria-keyshortcuts="Control+K Meta+K"
              className="search-field sup-1 flex min-h-11 w-full max-w-sm items-center gap-3 !rounded-full px-4 text-[0.9375rem] text-texto-fraco transition-colors duration-[var(--t-toque)] hover:text-texto-suave max-lg:hidden"
            >
              <Icon de={PiMagnifyingGlass} />
              <span className="flex-1 truncate text-left">
                {copy.search.placeholder}
              </span>
              <kbd className="t-dado rounded-[6px] bg-[var(--fundo)] px-1.5 py-0.5 text-[0.75rem] text-texto-fraco">
                {copy.search.shortcut}
              </kbd>
            </button>
          )}
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiMagnifyingGlass}
            rotulo={copy.search.open}
            onClick={() => setSearchOpen(true)}
            className="lg:hidden"
          />
          <Link
            href={PLANS_HREF}
            className="inline-flex min-h-9 shrink-0 items-center rounded-full tint-ouro px-4 text-[0.9375rem] font-medium text-ouro-na-tinta transition-[filter] hover:brightness-110 max-lg:hidden"
          >
            {copy.plans}
          </Link>
          <span className="max-md:hidden">{languageToggle}</span>
          <ThemeToggle variant="navbar" className="max-md:hidden" />
          {signedUser ? (
            <span className="max-md:hidden">
              <AccountMenu
                copy={copy}
                user={signedUser}
                onSignOut={signOut}
                onCompleteProfile={openOnboarding}
              />
            </span>
          ) : (
            <span className="flex items-center gap-1 max-md:hidden">
              <Button variante="fantasma" tamanho="p" onClick={openLogin}>
                {copy.signIn}
              </Button>
              <Button variante="secundario" tamanho="p" onClick={openRegister}>
                {copy.signUp}
              </Button>
            </span>
          )}
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiList}
            rotulo={copy.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="lg:hidden"
          />
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        copy={copy}
        path={path}
        language={language}
        onSwitchLanguage={switchLanguage}
        user={signedUser}
        onSignIn={openLogin}
        onSignUp={openRegister}
        onSignOut={signOut}
      />

      <Sheet
        aberto={searchOpen}
        aoFechar={() => setSearchOpen(false)}
        titulo={copy.search.title}
        largura="m"
      >
        {searchOpen && (
          <HeaderSearch
            copy={copy.search}
            language={language}
            autoFocus
            onNavigate={() => setSearchOpen(false)}
          />
        )}
      </Sheet>
    </header>
  );
}
