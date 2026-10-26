// app/requests/retrospective.ts — a retrospectiva de estudo (Plus)
import { apiFetch } from '@/app/libs/api/client';

export type RetroPeriod = 'year' | 'all';

/** A composer's face on a card: the portrait, or the initials when none. */
export interface RetroFace {
  name: string;
  url: string | null;
}

/**
 * What a card draws besides its number (`utils/pranchaRetro`). Cards saved
 * before it existed have none and draw only the number.
 */
export interface RetroArt {
  portrait?: RetroFace;
  faces?: RetroFace[];
  instrument?: string;
  epoch?: string;
  month?: number;
}

export interface RetroCard {
  kind: string;
  eyebrow: string;
  title: string;
  value: string | null;
  detail: string | null;
  list?: string[];
  /** The page of each item of `list`, in the same order. */
  links?: string[];
  art?: RetroArt;
}

export interface Retrospective {
  shareId: string;
  period: RetroPeriod;
  year: number | null;
  language: 'pt' | 'en';
  firstName: string;
  cards: RetroCard[];
  generatedAt: string;
}

export interface RetroPeriodStatus {
  eligible: boolean;
  missing: number;
  saved: { shareId: string; generatedAt: string; stale: boolean } | null;
}

export interface RetroStatus {
  unlocked: boolean;
  year: number;
  periods: Record<RetroPeriod, RetroPeriodStatus>;
}

export const retrospectiveStatus = (language: 'pt' | 'en') =>
  apiFetch<RetroStatus>('/learning/retrospective', {
    cache: 'no-store',
    query: { language },
  });

export const generateRetrospective = (
  period: RetroPeriod,
  language: 'pt' | 'en'
) =>
  apiFetch<Retrospective>('/learning/retrospective', {
    method: 'POST',
    body: { period, language },
  });

export const myRetrospective = (period: RetroPeriod, language: 'pt' | 'en') =>
  apiFetch<Retrospective>(`/learning/retrospective/${period}`, {
    cache: 'no-store',
    query: { language },
  });

export const sharedRetrospective = (shareId: string) =>
  apiFetch<Retrospective>(`/retrospectives/${shareId}`, {
    next: { revalidate: 300 },
  });
