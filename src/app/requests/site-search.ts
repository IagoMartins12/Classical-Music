import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

export interface SiteSearchResult {
  query: string;
  composers: ApiSchema<'ComposerListItemDto'>[];
  works: ApiSchema<'WorkSummaryDto'>[];
  articles: ApiSchema<'ArticleSummaryDto'>[];
}

/** Unified search (`GET /search`): composers, works and blog articles. */
export function searchSite(q: string, limit: number, signal?: AbortSignal) {
  return apiFetch<SiteSearchResult>('/search', {
    query: { q, limit },
    signal,
    skipRefresh: true,
  });
}
