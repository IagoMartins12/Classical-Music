/**
 * Buscas de compositor e de obra dos campos de busca e dos modais, pela API.
 *
 * O legado buscava compositor por `POST /api/composers` (`{ q, id, limit }`) e
 * obra por `GET /api/works/search` (com filtro de compositor na mesma rota).
 * Aqui são `GET /composers`, `/composers/famous` e `/composers/:id`, e
 * `GET /works` ou as obras do compositor.
 */
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { withoutNulls } from '@/app/requests/fetch-like';

type ComposerListItem = ApiSchema<'ComposerListItemDto'>;
type ComposerDetail = ApiSchema<'ComposerDetailDto'>;
type WorkSummary = ApiSchema<'WorkSummaryDto'>;
type ComposerWorks = ApiSchema<'ComposerWorksResponseDto'>;
type WorkDetail = ApiSchema<'WorkDetailDto'>;

/** A API manda a época só com o nome; as telas usam `epoch.id` também. */
function withEpochId<
  T extends { epochId?: string | null; epoch?: { name: string } | null },
>(composer: T) {
  return {
    ...withoutNulls(composer),
    epoch: composer.epoch
      ? { id: composer.epochId ?? '', name: composer.epoch.name }
      : undefined,
  };
}

function isNotFound(error: unknown) {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 400)
  );
}

// ---- Compositores

/** Sem termo, os mais conhecidos — o que o legado devolvia para a busca vazia. */
export async function findComposers(term: string, limit = 20) {
  const q = term.trim();
  const composers = q
    ? await apiFetch<ComposerListItem[]>('/composers', {
        query: { page: 1, limit, search: q },
      })
    : (await apiFetch<ComposerListItem[]>('/composers/famous')).slice(0, limit);

  return composers.map((composer) => withEpochId(composer));
}

export async function findComposerById(id: string) {
  try {
    return withEpochId(await apiFetch<ComposerDetail>(`/composers/${id}`));
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }

    throw error;
  }
}

// ---- Obras

export interface WorkSearchItem {
  id: string;
  title: string;
  opOrCatalog?: string;
  composer: { id: string; name: string; fullName: string };
  annotationsCount: number;
}

/**
 * Busca de obra no formato do legado (`{ works, total }`). Com compositor, são
 * as obras dele; sem, a busca geral, que pede ao menos 2 letras.
 */
export async function searchWorks(options: {
  q?: string;
  limit?: number;
  composerId?: string;
}): Promise<{ works: WorkSearchItem[]; total: number }> {
  const q = options.q?.trim() ?? '';

  if (options.composerId) {
    const [page, composer] = await Promise.all([
      apiFetch<ComposerWorks>(`/composers/${options.composerId}/works`, {
        query: { page: 1, limit: options.limit ?? 20, search: q || undefined },
      }),
      findComposerById(options.composerId),
    ]);
    // A lista de obras do compositor não repete o compositor em cada obra.
    const composerRef = {
      id: options.composerId,
      name: composer?.name ?? '',
      fullName: composer?.fullName ?? composer?.name ?? '',
    };

    return {
      works: page.works.map((work) => ({
        id: work.id,
        title: work.title,
        opOrCatalog: work.opOrCatalog ?? undefined,
        composer: composerRef,
        annotationsCount: 0,
      })),
      total: page.totalCount,
    };
  }

  if (q.length < 2) {
    return { works: [], total: 0 };
  }

  const works = await apiFetch<WorkSummary[]>('/works', {
    query: { q, limit: Math.min(options.limit ?? 10, 50) },
  });

  return {
    works: works.map((work) => {
      const composer = work.composer as WorkSummary['composer'] & {
        id?: string;
      };

      return {
        id: work.id,
        title: work.title,
        opOrCatalog: work.opOrCatalog ?? undefined,
        composer: {
          id: composer.id ?? '',
          name: composer.name,
          fullName: composer.fullName ?? composer.name,
        },
        annotationsCount: work.annotationsCount,
      };
    }),
    total: works.length,
  };
}

/** Detalhe da obra no formato que as telas liam (`success` e os campos da obra); `null` se não existir. */
export async function getWorkById(id: string) {
  try {
    const work = await apiFetch<WorkDetail>(`/works/${id}`);

    return { success: true, ...withoutNulls(work) };
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }

    throw error;
  }
}
