// app/requests/retrospective.ts — a retrospectiva de estudo (Plus)
import { apiFetch } from '@/app/libs/api/client';

export type RetroPeriod = 'year' | 'all';

export interface RetroCard {
  kind: string;
  eyebrow: string;
  title: string;
  value: string | null;
  detail: string | null;
  list?: string[];
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
