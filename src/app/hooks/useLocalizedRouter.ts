'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { languageOfPathname, localizeHref } from '@/app/utils/localizedRoutes';

/**
 * O `useRouter` do Next mantendo o idioma da URL atual.
 *
 * Mesmo motivo do `LocalizedLink`: numa página em inglês, um
 * `router.push('/works')` cru jogaria a pessoa no português. Rota que não é
 * traduzida (`/dashboard`, `/profile`) passa intocada.
 */
export function useLocalizedRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const language = languageOfPathname(pathname ?? '/');

  const push = useCallback(
    (href: string) => router.push(localizeHref(href, language)),
    [router, language]
  );

  const replace = useCallback(
    (href: string) => router.replace(localizeHref(href, language)),
    [router, language]
  );

  return useMemo(() => ({ ...router, push, replace }), [router, push, replace]);
}
