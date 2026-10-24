// app/requests/recommendations.ts — recomendações de peças (Plus)
import { apiFetch } from '@/app/libs/api/client';

export type RecommendationReason =
  | 'co-study'
  | 'same-instrument'
  | 'same-instrumentation'
  | 'same-composer'
  | 'same-genre'
  | 'same-epoch'
  | 'step-up'
  | 'same-level'
  | 'popular';

export interface RecommendedWork {
  id: string;
  title: string;
  opOrCatalog: string | null;
  composer: { id: string; name: string; portraitUrl: string | null };
  epochName: string | null;
  instrumentName: string | null;
  difficultyLevel: string | null;
  reasons: RecommendationReason[];
}

export interface Recommendations {
  locked: boolean;
  items: RecommendedWork[];
}

export const workRecommendations = (workId: string, limit = 8) =>
  apiFetch<Recommendations>(`/works/${workId}/recommendations`, {
    cache: 'no-store',
    query: { limit },
  });

export const myRecommendations = (limit = 12) =>
  apiFetch<Recommendations>('/learning/recommendations', {
    cache: 'no-store',
    query: { limit },
  });
