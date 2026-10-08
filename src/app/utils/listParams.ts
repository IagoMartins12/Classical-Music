import {
  COMPOSER_SORTS,
  WORK_SORTS,
  type ComposerListParams,
  type ComposerSort,
  type WorkListParams,
  type WorkSort,
} from '@/app/requests/catalog-lists';

/** What a list page reads from its URL, as Next hands it over. */
export type UrlParams = Record<string, string | string[] | undefined>;

/** The list filters exactly as they appear in the URL (`?epoch=…&page=2`). */
export type ListQuery = Record<string, string | undefined>;

const text = (value: string | string[] | undefined) => {
  const v = (Array.isArray(value) ? value[0] : value)?.trim();
  return v ? v.slice(0, 120) : undefined;
};

const int = (
  value: string | string[] | undefined,
  min: number,
  max: number
) => {
  const n = Number(text(value));
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

const pick = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback);

const ID = /^[a-f\d]{24}$/i;
const id = (value: string | string[] | undefined) => {
  const v = text(value);
  return v && ID.test(v) ? v : undefined;
};

/** Only the keys a list knows, cleaned: what links and controls build on. */
export function toListQuery(
  params: UrlParams,
  keys: readonly string[]
): ListQuery {
  return Object.fromEntries(
    keys.map((key) => [key, text(params[key])]).filter(([, v]) => v)
  );
}

/** The URL for the same list with some filters changed (any change resets the page). */
export function listHref(
  path: string,
  query: ListQuery,
  patch: ListQuery = {}
) {
  const next = new URLSearchParams();
  const merged = {
    ...query,
    ...('page' in patch ? {} : { page: undefined }),
    ...patch,
  };
  for (const [key, value] of Object.entries(merged)) {
    if (value && !(key === 'page' && value === '1')) next.set(key, value);
  }
  const qs = next.toString();
  return qs ? `${path}?${qs}` : path;
}

export const COMPOSER_KEYS = [
  'search',
  'epoch',
  'country',
  'instrument',
  'portrait',
  'from',
  'to',
  'sort',
  'page',
] as const;
export const WORK_KEYS = [
  'search',
  'instrument',
  'epoch',
  'genre',
  'composer',
  'level',
  'sort',
  'page',
] as const;

export const DEFAULT_COMPOSER_SORT: ComposerSort = 'featured';

export function parseComposerParams(
  params: UrlParams,
  demonymsOf: (country: string) => string[] | undefined
): ComposerListParams {
  const country = text(params.country);
  return {
    page: int(params.page, 1, 10_000) ?? 1,
    sort: pick(text(params.sort), COMPOSER_SORTS, DEFAULT_COMPOSER_SORT),
    search: text(params.search),
    epochId: id(params.epoch),
    nationality: country ? demonymsOf(country) : undefined,
    instrumentId: id(params.instrument),
    withPortrait: text(params.portrait) === '1' || undefined,
    bornFrom: int(params.from, 400, 2100),
    bornTo: int(params.to, 400, 2100),
  };
}

/** Without filters the newest arrivals lead; with any, A–Z (the API's own default). */
export function defaultWorkSort(params: UrlParams): WorkSort {
  const filtered = WORK_KEYS.some(
    (key) => key !== 'page' && key !== 'sort' && text(params[key])
  );
  return filtered ? 'title' : 'recent';
}

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export function parseWorkParams(params: UrlParams): WorkListParams {
  return {
    page: int(params.page, 1, 10_000) ?? 1,
    sort: pick(text(params.sort), WORK_SORTS, defaultWorkSort(params)),
    search: text(params.search),
    instrumentId: id(params.instrument),
    epochId: id(params.epoch),
    genre: text(params.genre),
    composerId: id(params.composer),
    level: LEVELS.find((level) => level === text(params.level)),
  };
}
