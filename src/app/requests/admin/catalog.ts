/**
 * Catálogo no painel: compositores, obras e partituras (`/admin/composers`,
 * `/admin/works`, `/admin/scores`, `/admin/catalog/*` da API).
 *
 * As estatísticas do legado eram contadas pela rota do Next a cada abertura;
 * a API tem as métricas do catálogo (totais, verificação, partituras por tipo,
 * obras por época e as mais anotadas). O que ela não mede fica zerado ou vazio:
 * obras e favoritos por compositor, compositores com retrato, partituras por
 * fonte, acessos e as listas de "mais favoritadas" e "mais estudadas".
 */
import { apiFetch } from '@/app/libs/api/client';
import {
  type ApiPagination,
  isObjectId,
  legacyPagination,
  positiveInt,
} from '@/app/requests/admin/common';
import type { ComposerItem } from '@/app/hooks/admin/useAdminComposers';
import type { WorkItem } from '@/app/hooks/admin/useAdminWorks';
import type { ScoreItem } from '@/app/hooks/admin/useAdminScores';

interface CatalogMetrics {
  totals: {
    composers: number;
    verifiedComposers: number;
    works: number;
    verifiedWorks: number;
    activeScores: number;
  };
  scoresByType: Record<string, number>;
  composersByDataQuality: Record<string, number>;
}

const catalogMetrics = () =>
  apiFetch<CatalogMetrics>('/admin/catalog/metrics', { cache: 'no-store' });

const bool = (value: unknown) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : undefined;

const limitOf = (value: unknown) => Math.min(positiveInt(value) ?? 20, 100);

// ---- Compositores

interface ApiComposer {
  id: string;
  name: string;
  fullName: string | null;
  portraitUrl: string | null;
  epochName: string | null;
  isVerified: boolean;
  dataQuality: string | null;
  createdAt: string;
}

function toComposerItem(composer: ApiComposer): ComposerItem {
  return {
    id: composer.id,
    name: composer.name,
    fullName: composer.fullName ?? composer.name,
    epoch: composer.epochName ?? '',
    isVerified: composer.isVerified,
    dataQuality: composer.dataQuality ?? undefined,
    worksCount: 0,
    favoritesCount: 0,
    portraitUrl: composer.portraitUrl ?? undefined,
    hasValidImage: Boolean(composer.portraitUrl),
    createdAt: new Date(composer.createdAt),
  };
}

/** Filtros que a API tem: busca, verificação, qualidade, época (por id) e ordem por nome ou data. */
export async function listAdminComposers(input: object) {
  const filters = input as Record<string, unknown>;
  const data = await apiFetch<{
    composers: ApiComposer[];
    pagination: ApiPagination;
  }>('/admin/composers', {
    query: {
      page: positiveInt(filters.page),
      limit: limitOf(filters.limit),
      search: (filters.search as string) || undefined,
      isVerified: bool(filters.verified),
      dataQuality: ['high', 'medium', 'low'].includes(
        String(filters.dataQuality)
      )
        ? String(filters.dataQuality)
        : undefined,
      epochId: isObjectId(filters.epoch) ? filters.epoch : undefined,
      sortBy: ['name', 'createdAt'].includes(String(filters.sortBy))
        ? String(filters.sortBy)
        : undefined,
    },
    cache: 'no-store',
  });

  return {
    composers: data.composers.map(toComposerItem),
    pagination: legacyPagination(data.pagination),
  };
}

export async function getAdminComposerStats() {
  const metrics = await catalogMetrics();
  const { composers, works, verifiedComposers } = metrics.totals;

  return {
    total: composers,
    verified: verifiedComposers,
    withImages: 0,
    withoutImages: 0,
    byEpoch: [],
    byQuality: Object.entries(metrics.composersByDataQuality).map(
      ([quality, count]) => ({ quality, count })
    ),
    recentlyAdded: 0,
    mostPopular: [],
    avgWorksPerComposer: composers
      ? Math.round((works / composers) * 10) / 10
      : 0,
    topByWorks: [],
  };
}

/** A API edita verificação, nota da verificação e qualidade dos dados. */
export function updateAdminComposer(id: string, data: Record<string, unknown>) {
  return apiFetch(`/admin/composers/${id}`, {
    method: 'PATCH',
    body: {
      isVerified: data.isVerified,
      verificationNotes: data.verificationNotes,
      dataQuality: data.dataQuality,
    },
  });
}

export function deleteAdminComposer(id: string) {
  return apiFetch(`/admin/composers/${id}`, { method: 'DELETE' });
}

// ---- Obras

interface ApiWork {
  id: string;
  title: string;
  opOrCatalog: string | null;
  workType: string;
  difficultyLevel: string | null;
  annotationsCount: number;
  createdAt: string;
  composer: { id: string; name: string } | null;
  epoch: { id: string; name: string } | null;
  instrument: { id: string; name: string } | null;
}

function toWorkItem(work: ApiWork): WorkItem {
  return {
    id: work.id,
    title: work.title,
    composer: work.composer?.name ?? '',
    epoch: work.epoch?.name ?? '',
    instrument: work.instrument?.name ?? '',
    opOrCatalog: work.opOrCatalog ?? undefined,
    workType: work.workType,
    difficultyLevel: work.difficultyLevel ?? undefined,
    favoritesCount: 0,
    annotationsCount: work.annotationsCount,
    scoresCount: 0,
    wantToLearnCount: 0,
    learnedCount: 0,
    createdAt: new Date(work.createdAt),
  };
}

export async function listAdminWorks(input: object) {
  const filters = input as Record<string, unknown>;
  const id = (value: unknown) => (isObjectId(value) ? value : undefined);
  const data = await apiFetch<{ works: ApiWork[]; pagination: ApiPagination }>(
    '/admin/works',
    {
      query: {
        page: positiveInt(filters.page),
        limit: limitOf(filters.limit),
        search: (filters.search as string) || undefined,
        composerId: id(filters.composerId),
        epochId: id(filters.epochId),
        instrumentId: id(filters.instrumentId),
        workType: (filters.workType as string) || undefined,
        difficultyLevel: (filters.difficultyLevel as string) || undefined,
        minFavorites: positiveInt(filters.minFavorites),
        minWantToLearn: positiveInt(filters.minWantToLearn),
        minLearned: positiveInt(filters.minLearned),
        minScores: positiveInt(filters.minScores),
        sortBy: ['title', 'createdAt'].includes(String(filters.sortBy))
          ? String(filters.sortBy)
          : undefined,
      },
      cache: 'no-store',
    }
  );

  return {
    works: data.works.map(toWorkItem),
    pagination: legacyPagination(data.pagination),
  };
}

export async function getAdminWorkStats() {
  const [metrics, byEpoch, mostAnnotated] = await Promise.all([
    catalogMetrics(),
    apiFetch<{ epochId: string; name: string; works: number }[]>(
      '/admin/catalog/by-epoch',
      { cache: 'no-store' }
    ),
    apiFetch<
      {
        id: string;
        title: string;
        annotationsCount: number;
        composer: { name: string } | null;
      }[]
    >('/admin/catalog/most-annotated', { cache: 'no-store' }),
  ]);
  const { works, activeScores } = metrics.totals;

  return {
    total: works,
    byEpoch: byEpoch.map((epoch) => ({
      epoch: epoch.name,
      count: epoch.works,
    })),
    byInstrument: [],
    byDifficulty: [],
    avgScoresPerWork: works ? Math.round((activeScores / works) * 10) / 10 : 0,
    avgFavoritesPerWork: 0,
    mostPopular: mostAnnotated.map((work) => ({
      id: work.id,
      title: work.title,
      composer: work.composer?.name ?? '',
      favoritesCount: 0,
      annotationsCount: work.annotationsCount,
    })),
    mostWantedToLearn: [],
    mostLearned: [],
    recentlyAdded: 0,
    withoutScores: 0,
    topByScores: [],
  };
}

/** A API edita título, dificuldade, tipo, vídeo, instrumentação e verificação. */
export function updateAdminWork(id: string, data: Record<string, unknown>) {
  return apiFetch(`/admin/works/${id}`, {
    method: 'PATCH',
    body: {
      title: data.title,
      difficultyLevel: data.difficultyLevel,
      workType: data.workType,
      videoUrl: data.videoUrl,
      instrumentation: data.instrumentation,
      isVerified: data.isVerified,
    },
  });
}

export function deleteAdminWork(id: string) {
  return apiFetch(`/admin/works/${id}`, { method: 'DELETE' });
}

// ---- Partituras

interface ApiScore {
  id: string;
  title: string;
  type: string;
  source: string;
  isActive: boolean;
  downloadUrl: string | null;
  createdAt: string;
  work: { id: string; title: string; composer: { name: string } | null } | null;
}

function toScoreItem(score: ApiScore): ScoreItem {
  return {
    id: score.id,
    title: score.title,
    workTitle: score.work?.title ?? '',
    composerName: score.work?.composer?.name ?? '',
    source: score.source,
    type: score.type,
    downloadUrl: score.downloadUrl ?? undefined,
    isActive: score.isActive,
    accessCount: 0,
    createdAt: new Date(score.createdAt),
    workId: score.work?.id ?? '',
  };
}

export async function listAdminScores(input: object) {
  const filters = input as Record<string, unknown>;
  const data = await apiFetch<{
    scores: ApiScore[];
    pagination: ApiPagination;
  }>('/admin/scores', {
    query: {
      page: positiveInt(filters.page),
      limit: limitOf(filters.limit),
      search: (filters.search as string) || undefined,
      workId: isObjectId(filters.workId) ? filters.workId : undefined,
      isActive: bool(filters.isActive),
    },
    cache: 'no-store',
  });

  return {
    scores: data.scores.map(toScoreItem),
    pagination: legacyPagination(data.pagination),
  };
}

export async function getAdminScoreStats() {
  const metrics = await catalogMetrics();
  const { activeScores, works } = metrics.totals;

  return {
    total: activeScores,
    active: activeScores,
    bySource: [],
    byType: Object.entries(metrics.scoresByType).map(([type, count]) => ({
      type,
      count,
    })),
    totalSize: '—',
    averagePerWork: works ? Math.round((activeScores / works) * 10) / 10 : 0,
    mostAccessed: [],
    recentlyAdded: 0,
  };
}

/** A API edita título e ativação. */
export function updateAdminScore(id: string, data: Record<string, unknown>) {
  return apiFetch(`/admin/scores/${id}`, {
    method: 'PATCH',
    body: { title: data.title, isActive: data.isActive },
  });
}
