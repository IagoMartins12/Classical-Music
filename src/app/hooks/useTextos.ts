'use client';

import { useCallback } from 'react';
import type { Textos } from '@/app/conteudo/textos/tipos';
import { useOverlayLanguage } from './useRouteLanguage';

/**
 * `t(key, params)` for the screens whose text is still keyed (`conteudo/textos`):
 * the language of the page, `{name}` placeholders filled from `params`. The
 * text is part of the code, so it is there on the first paint.
 */
export function useTextos(textos: Textos) {
  const language = useOverlayLanguage();
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const text = textos[language][key] ?? textos.pt[key];
      if (text === undefined) {
        if (process.env.NODE_ENV === 'development')
          console.warn(`[textos] texto ausente: ${key}`);
        return '';
      }
      return params
        ? text.replace(/\{(\w+)\}/g, (found, name) =>
            params[name] !== undefined ? String(params[name]) : found
          )
        : text;
    },
    [textos, language]
  );
  return { t, language, ready: true as const };
}
