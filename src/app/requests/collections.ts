/**
 * Collections: lists people make of works, composers or scores. Public
 * reads are cached by the Next (tag `collections`, revalidated by the API);
 * anything per person goes through the session in the browser.
 */
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { toResult } from '@/app/requests/api-result';

export type CollectionKind = 'WORK' | 'COMPOSER' | 'SCORE';
export type CollectionSummary = ApiSchema<'CollectionSummaryDto'> & {
  kind: CollectionKind;
};
export type CollectionDetail = ApiSchema<'CollectionDetailDto'> & {
  kind: CollectionKind;
};
export type CollectionEntry = ApiSchema<'CollectionEntryDto'>;

export interface CollectionInput {
  title: string;
  description?: string;
  isPublic: boolean;
  items: { refId: string; note?: string }[];
}

const CACHE = { revalidate: 600, tags: ['collections'] };

/** Public collections (the team's first). Empty when the API is down. */
export async function publicCollections(
  query: { featured?: boolean; limit?: number; page?: number } = {}
) {
  return apiFetch<{ collections: CollectionSummary[]; total: number }>(
    '/collections',
    { query, next: CACHE }
  ).catch(() => ({ collections: [] as CollectionSummary[], total: 0 }));
}

/** A public collection for the cached page; null when missing or private. */
export async function publicCollection(id: string) {
  return apiFetch<CollectionDetail>(`/collections/${id}`, {
    next: CACHE,
  }).catch(() => null);
}

/** Browser read with the session: also the caller's private ones. */
export function fetchCollection(id: string) {
  return apiFetch<CollectionDetail>(`/collections/${id}`, {
    cache: 'no-store',
  });
}

export function myCollections() {
  return apiFetch<{
    mine: CollectionSummary[];
    favorites: CollectionSummary[];
  }>('/collections/mine', { cache: 'no-store' });
}

/** What the editor offers for what was typed, or the scores of one work. */
export function collectionCandidates(
  query: { kind: CollectionKind; q: string } | { kind: 'SCORE'; workId: string }
) {
  return apiFetch<CollectionEntry[]>('/collections/candidates', {
    query,
    cache: 'no-store',
  });
}

export function createCollection(
  input: CollectionInput & { kind: CollectionKind }
) {
  return toResult(
    apiFetch<CollectionDetail>('/collections', { method: 'POST', body: input })
  );
}

export function updateCollection(id: string, input: CollectionInput) {
  return toResult(
    apiFetch<CollectionDetail>(`/collections/${id}`, {
      method: 'PUT',
      body: input,
    })
  );
}

export function deleteCollection(id: string) {
  return toResult(apiFetch<void>(`/collections/${id}`, { method: 'DELETE' }));
}

export function favoriteCollection(id: string, on: boolean) {
  return toResult(
    apiFetch<{ favorited: boolean; favoritesCount: number }>(
      `/collections/${id}/favorite`,
      { method: on ? 'POST' : 'DELETE' }
    )
  );
}

/** The team's call. */
export function featureCollection(id: string, featuredOnHome: boolean) {
  return toResult(
    apiFetch<{ featuredOnHome: boolean }>(`/collections/${id}/featured`, {
      method: 'PATCH',
      body: { featuredOnHome },
    })
  );
}
