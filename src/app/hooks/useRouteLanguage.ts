'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  isLocalizedRoute,
  languageOfPathname,
  localizeHref,
  stripLanguagePrefix,
  type RouteLanguage,
} from '@/app/utils/localizedRoutes';

/**
 * The language the URL declares, and a way to switch it.
 *
 * On routes that exist in both languages the switch is a client navigation
 * (`/works` → `/en/works`): no reload, the server renders the other version.
 * Routes that are not localized (`/profile`) return `switchLanguage: null`,
 * and `LanguageToggle` falls back to its cookie + refresh behaviour.
 */
export function useRouteLanguage() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const language = languageOfPathname(pathname);
  const path = stripLanguagePrefix(pathname);
  const localized = isLocalizedRoute(path);

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
