'use client';

import { useEffect, useState } from 'react';
import { searchSite, type SiteSearchResult } from '@/app/requests/site-search';

const DEBOUNCE_MS = 180;
const MIN_LENGTH = 2;
/** Results kept for the session: retyping a term or reopening is instant. */
const memo = new Map<string, SiteSearchResult>();
const MEMO_LIMIT = 50;

export type SiteSearchState =
  | { status: 'idle' }
  | { status: 'loading'; result: SiteSearchResult | null }
  | { status: 'done'; result: SiteSearchResult }
  | { status: 'error' };

/**
 * Live search: debounced, cancels the request that a newer keystroke made
 * stale, and memoizes per term. Below two letters it stays idle.
 */
export function useSiteSearch(term: string, limit = 4): SiteSearchState {
  const q = term.trim();
  const key = `${limit}:${q.toLowerCase()}`;
  const [state, setState] = useState<SiteSearchState>({ status: 'idle' });

  useEffect(() => {
    if (q.length < MIN_LENGTH) {
      setState({ status: 'idle' });
      return;
    }
    const cached = memo.get(key);
    if (cached) {
      setState({ status: 'done', result: cached });
      return;
    }

    setState((prev) => ({
      status: 'loading',
      result: prev.status === 'done' ? prev.result : null,
    }));
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchSite(q, limit, controller.signal)
        .then((result) => {
          if (memo.size >= MEMO_LIMIT) {
            memo.delete(memo.keys().next().value as string);
          }
          memo.set(key, result);
          setState({ status: 'done', result });
        })
        .catch((error: unknown) => {
          if ((error as Error)?.name !== 'AbortError') {
            setState({ status: 'error' });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, q, limit]);

  return state;
}
