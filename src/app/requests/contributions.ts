/**
 * Contributions and curiosities: what people add to composers and works
 * they did not create. Isomorphic: the server page reads curiosities; the
 * browser writes through the session.
 */
import { apiFetch } from '@/app/libs/api/client';
import { toResult } from '@/app/requests/api-result';

export type ContributableEntity = 'composer' | 'work';
export type ContributionKind = 'BIO' | 'VIDEO' | 'CURIOSITY' | 'CORRECTION';

export interface ContributionAuthor {
  id: string;
  name: string;
}

export interface Contribution {
  id: string;
  kind: ContributionKind;
  entityType: ContributableEntity;
  entityId: string;
  field: string | null;
  xp: number;
  /** Paid after seven days without an upheld report. */
  xpGranted: boolean;
  createdAt: string;
  author: ContributionAuthor;
}

export interface Curiosity {
  id: string;
  text: string;
  source: 'EDITORIAL' | 'USER';
  author: ContributionAuthor | null;
  mine: boolean;
  held: boolean;
}

/** Revalidated hourly and when a contribution lands (`composers` tag). */
const CURIOSITIES_CACHE = { revalidate: 3600, tags: ['composers'] };

/** Server read for the first paint; empty when the API is down. */
export async function composerCuriosities(
  composerId: string,
  language: 'pt' | 'en'
): Promise<Curiosity[]> {
  return apiFetch<Curiosity[]>(`/composers/${composerId}/curiosities`, {
    query: { language },
    next: CURIOSITIES_CACHE,
  }).catch(() => []);
}

/** Server read: the live contributions, newest first, for credit lines. */
export async function entityContributions(
  entityType: ContributableEntity,
  entityId: string
): Promise<Contribution[]> {
  return apiFetch<Contribution[]>('/contributions', {
    query: { entityType, entityId },
    next: CURIOSITIES_CACHE,
  }).catch(() => []);
}

/** Browser read, with the caller's own held curiosities. */
export function fetchCuriosities(composerId: string, language: 'pt' | 'en') {
  return apiFetch<Curiosity[]>(`/composers/${composerId}/curiosities`, {
    query: { language },
    cache: 'no-store',
  });
}

export function addCuriosity(
  composerId: string,
  input: { text: string; language: 'pt' | 'en'; source?: string }
) {
  return toResult(
    apiFetch<Curiosity>(`/composers/${composerId}/curiosities`, {
      method: 'POST',
      body: input,
    })
  );
}

export function removeCuriosity(curiosityId: string) {
  return toResult(
    apiFetch<void>(`/curiosities/${curiosityId}`, { method: 'DELETE' })
  );
}

export function contribute(input: {
  entityType: ContributableEntity;
  entityId: string;
  field: string;
  value: string;
  source?: string;
}) {
  return toResult(
    apiFetch<Contribution>('/contributions', { method: 'POST', body: input })
  );
}

export function fetchContributions(
  entityType: ContributableEntity,
  entityId: string
) {
  return apiFetch<Contribution[]>('/contributions', {
    query: { entityType, entityId },
    cache: 'no-store',
  });
}

/** Admin: undo a contribution and take its XP back. */
export function revertContribution(contributionId: string) {
  return toResult(
    apiFetch<void>(`/contributions/${contributionId}/revert`, {
      method: 'POST',
    })
  );
}
