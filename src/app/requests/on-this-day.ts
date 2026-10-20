import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

export type OnThisDay = ApiSchema<'OnThisDayDto'>;
export type OnThisDayComposer = ApiSchema<'OnThisDayComposerDto'>;

/** Composers born and who died on a calendar day (cached for hours). */
export function getOnThisDay(month: number, day: number) {
  return apiFetch<OnThisDay>('/composers/on-this-day', {
    query: { month, day },
    next: { revalidate: 6 * 3600, tags: ['composers'] },
    buildFallback: { month, day, born: [], died: [] },
  });
}
