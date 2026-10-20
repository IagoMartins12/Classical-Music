/**
 * The public composer and work lists: one request module for both, read on
 * the server (the lists are rendered there, filters live in the URL). Every
 * call carries a cache tag the API revalidates when the data changes.
 */
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

export type ComposerListItem = ApiSchema<'ComposerListItemDto'>;
export type WorkListItem = ApiSchema<'WorkCatalogItemDto'>;
export type CatalogFilterOptions = ApiSchema<'WorkFilterOptionsResponseDto'>;

export const COMPOSER_SORTS = [
  'featured',
  'name',
  'name-desc',
  'oldest',
  'newest',
] as const;
export type ComposerSort = (typeof COMPOSER_SORTS)[number];
export const WORK_SORTS = [
  'featured',
  'title',
  'title-desc',
  'oldest',
  'newest',
] as const;
export type WorkSort = (typeof WORK_SORTS)[number];

export const COMPOSERS_PER_PAGE = 30;
export const WORKS_PER_PAGE = 30;

const LIST_CACHE = { revalidate: 3600 };

export interface ComposerListParams {
  page: number;
  sort: ComposerSort;
  search?: string;
  epochId?: string;
  /** Every stored spelling of the country's demonym. */
  nationality?: string[];
  instrumentId?: string;
  withPortrait?: boolean;
  /** Only what the team has checked (the verified badge). */
  verified?: boolean;
  bornFrom?: number;
  bornTo?: number;
}

export interface WorkListParams {
  page: number;
  sort: WorkSort;
  search?: string;
  instrumentId?: string;
  epochId?: string;
  genre?: string;
  composerId?: string;
  level?: string;
  /** Only what the team has checked (the verified badge). */
  verified?: boolean;
}

export async function getCatalogFilterOptions(): Promise<CatalogFilterOptions> {
  return apiFetch<CatalogFilterOptions>('/works/filter-options', {
    next: { revalidate: 3600, tags: ['works', 'composers'] },
    buildFallback: {
      instruments: [],
      ensembles: [],
      epochs: [],
      workGenres: [],
      popularComposers: [],
      difficultyLevels: [],
    },
  });
}

export async function listComposers(params: ComposerListParams) {
  const filters = {
    search: params.search,
    epochId: params.epochId,
    nationality: params.nationality?.join(','),
    instrumentId: params.instrumentId,
    withPortrait: params.withPortrait || undefined,
    verified: params.verified || undefined,
    bornFrom: params.bornFrom,
    bornTo: params.bornTo,
  };
  const next = { ...LIST_CACHE, tags: ['composers'] };
  const [composers, total] = await Promise.all([
    apiFetch<ComposerListItem[]>('/composers', {
      query: {
        ...filters,
        page: params.page,
        limit: COMPOSERS_PER_PAGE,
        sort: params.sort,
      },
      next,
      buildFallback: [],
    }),
    apiFetch<number>('/composers/count', {
      query: { ...filters, sort: params.sort },
      next,
      buildFallback: 0,
    }),
  ]);
  return {
    composers,
    total,
    pages: Math.max(1, Math.ceil(total / COMPOSERS_PER_PAGE)),
  };
}

export async function listWorks(params: WorkListParams) {
  const response = await apiFetch<ApiSchema<'WorksCatalogResponseDto'>>(
    '/works/catalog',
    {
      query: {
        page: params.page,
        limit: WORKS_PER_PAGE,
        sort: params.sort,
        search: params.search,
        instrumentId: params.instrumentId,
        epochId: params.epochId,
        workGenresArr: params.genre,
        composerId: params.composerId,
        difficultyLevel: params.level,
        verified: params.verified || undefined,
      },
      next: { ...LIST_CACHE, tags: ['works'] },
      buildFallback: { works: [], totalCount: 0, hasMore: false },
    }
  );
  return {
    works: response.works,
    total: response.totalCount,
    pages: Math.max(1, Math.ceil(response.totalCount / WORKS_PER_PAGE)),
  };
}
