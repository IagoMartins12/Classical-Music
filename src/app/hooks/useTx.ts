'use client';

import { useCallback } from 'react';
import { useRouteLanguage } from './useRouteLanguage';

/**
 * Inline interface text for components that predate `conteudo/`: `tx(pt, en)`
 * in the page's language. Same language on the server and in the browser.
 * Outside a component (requests, stores), use `porIdioma`.
 */
export function useTx() {
  const { language } = useRouteLanguage();
  return useCallback(
    (pt: string, en: string) => (language === 'en' ? en : pt),
    [language]
  );
}
