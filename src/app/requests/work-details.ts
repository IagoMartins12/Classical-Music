// app/requests/work-details.ts — catálogo de obras, pela API (Etapa 3)
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

/** O formato que os cartões de obra recebem (`WorkCard`, `WorkCardList`). */
export interface WorkListItem {
  id: string;
  title: string;
  subtitle?: string | null;
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  workType: string;
  isVerified: boolean;
  epoch?: {
    id?: string;
    name?: string;
  };
  composer: {
    id: string;
    name: string;
    fullName?: string | null;
    epochName: string | null;
  };
  instrument: {
    name: string;
  } | null;
}

export interface WorksListResponse {
  works: WorkListItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface FilterOptions {
  instruments: { id: string; name: string; originalName?: string }[];
  epochs: { id: string; name: string; originalName?: string }[];
  workGenres: { id: string; name: string; originalName?: string }[];
  popularComposers: {
    id: string;
    name: string;
    fullName?: string;
    worksCount?: number;
  }[];
  difficultyLevels: { value: string; label: string }[];
}

type WorksFilters = {
  composerId?: string;
  instrumentId?: string;
  epochId?: string;
  workGenreId?: string;
  search?: string;
  categoryNames?: string;
  workGenresArr?: string;
  difficultyLevel?: string;
};

type WorkCatalogItem = ApiSchema<'WorkCatalogItemDto'>;
type WorkFilterOptionItem = ApiSchema<'WorkFilterOptionItemDto'>;
type WorkGenreItem = ApiSchema<'WorkGenreItemDto'>;

/**
 * Cache do `fetch` do Next, por tempo e por tag. O dado já vem do cache da API
 * (Redis); a API avisa quando algo muda (`POST /api/revalidate`): `works` para
 * obra e gênero, e os filtros dependem também de instrumento, época e
 * compositor. O tempo é só o teto.
 */
const CACHE = {
  CATALOG: { revalidate: 3600, tags: ['works'] },
  CATALOG_FILTERED: { revalidate: 1800, tags: ['works'] },
  CATALOG_SEARCH: { revalidate: 900, tags: ['works'] },
  FILTERS: {
    revalidate: 7200,
    tags: ['works', 'instruments', 'epochs', 'composers'],
  },
  GENRES: { revalidate: 7200, tags: ['works'] },
};

export async function getWorks(
  page: number = 1,
  limit: number = 32,
  filters?: WorksFilters
): Promise<WorksListResponse> {
  const normalizedFilters = normalizeWorksFilters(filters);

  const response = await apiFetch<ApiSchema<'WorksCatalogResponseDto'>>(
    '/works/catalog',
    {
      query: { page, limit, ...normalizedFilters },
      next: !normalizedFilters
        ? CACHE.CATALOG
        : normalizedFilters.search
          ? CACHE.CATALOG_SEARCH
          : CACHE.CATALOG_FILTERED,
    }
  );

  return {
    works: response.works.map(toWorkListItem),
    totalCount: response.totalCount,
    hasMore: response.hasMore,
  };
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const options = await apiFetch<ApiSchema<'WorkFilterOptionsResponseDto'>>(
    '/works/filter-options',
    { next: CACHE.FILTERS }
  );

  return {
    instruments: options.instruments.map(toFilterOption),
    epochs: options.epochs.map(toFilterOption),
    workGenres: options.workGenres.map(toFilterOption),
    popularComposers: options.popularComposers.map((composer) => ({
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName ?? undefined,
      worksCount: composer.worksCount,
    })),
    difficultyLevels: options.difficultyLevels,
  };
}

/** Busca do campo de gênero no envio de obra (`searchGenresAction`). */
export async function searchWorkGenres(
  searchTerm: string = '',
  limit: number = 20
): Promise<WorkGenreItem[]> {
  // Fora do cache do Next: cada letra digitada seria uma entrada nova. A API
  // já guarda a lista.
  return apiFetch<WorkGenreItem[]>('/works/genres/search', {
    query: { q: searchTerm.trim() || undefined, limit },
    cache: 'no-store',
  });
}

export async function getAllWorkGenres(): Promise<WorkGenreItem[]> {
  return apiFetch<WorkGenreItem[]>('/works/genres', { next: CACHE.GENRES });
}

function toWorkListItem(work: WorkCatalogItem): WorkListItem {
  return {
    id: work.id,
    title: work.title,
    subtitle: optional(work.subtitle),
    opOrCatalog: optional(work.opOrCatalog),
    compositionYear: optional(work.compositionYear),
    tone: optional(work.tone),
    mediaDuration: optional(work.mediaDuration),
    workType: work.workType,
    isVerified: work.isVerified,
    epoch: work.epoch ?? undefined,
    composer: work.composer,
    instrument: work.instrument,
  };
}

function toFilterOption(item: WorkFilterOptionItem) {
  return {
    id: item.id,
    name: item.name,
    originalName: item.originalName ?? undefined,
  };
}

function normalizeWorksFilters(
  filters?: WorksFilters
): WorksFilters | undefined {
  const entries = Object.entries(filters ?? {})
    .map(([key, value]) => [key, value?.trim()] as const)
    .filter(([, value]) => value);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/** Texto vazio ou nulo vira ausente, como os cartões esperam. */
function optional(value?: string | null): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
