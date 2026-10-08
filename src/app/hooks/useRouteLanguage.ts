'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  isLocalizedRoute,
  languageOfPathname,
  localizeHref,
  stripLanguagePrefix,
  type RouteLanguage,
} from '@/app/utils/localizedRoutes';

/**
 * The language of pages that have no `/en` version (`/profile`,
 * `/learning`…). Their layout reads the language cookie on the server and
 * provides it here, so server and browser render the same words.
 */
const CookieLanguage = createContext<RouteLanguage | null>(null);

export function CookieLanguageProvider({
  language,
  children,
}: {
  language: RouteLanguage;
  children: ReactNode;
}) {
  return createElement(CookieLanguage.Provider, { value: language }, children);
}

/**
 * The language the URL declares, and a way to switch it.
 *
 * On routes that exist in both languages the switch is a client navigation
 * (`/works` → `/en/works`): no reload, the server renders the other version.
 * Routes that are not localized (`/profile`) take the language from the
 * cookie (see `CookieLanguageProvider`) and return `switchLanguage: null`, so
 * `LanguageToggle` falls back to its cookie + refresh behaviour.
 */
export function useRouteLanguage() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const cookieLanguage = useContext(CookieLanguage);
  const path = stripLanguagePrefix(pathname);
  const localized = isLocalizedRoute(path);
  const language =
    localized || !cookieLanguage
      ? languageOfPathname(pathname)
      : cookieLanguage;

  const switchLanguage = useCallback(
    (next: RouteLanguage) => router.push(localizeHref(path, next)),
    [router, path]
  );

  return {
    language,
    path,
    switchLanguage: localized ? switchLanguage : null,
  };
}
