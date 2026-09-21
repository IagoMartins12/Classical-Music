// app/requests/composers.ts — catálogo de compositores, pela API (Etapa 3)
import { apiFetch } from '@/app/libs/api/client';
import { bioTeaser } from '@/app/requests/bio-teaser';
import type { ApiSchema } from '@/app/libs/api/types';

export type PaginationParams = {
  page: number;
  limit: number;
  search?: string;
  epochId?: string;
};

export type CountParams = {
  search?: string;
  epochId?: string;
};

type EpochItem = ApiSchema<'EpochItemDto'>;

/** O que a API devolve em `/composers`, `/composers/famous` e `/composers/recommended`. */
type ComposerListItem = ApiSchema<'ComposerListItemDto'>;

/**
 * O formato que os cartões de compositor recebem (`composerHomeProps`,
 * `ComposerImslp`). Época ausente vira texto vazio, que os cartões já
 * escondem; sem nome completo, vai o nome curto.
 */
export interface ComposerCardItem {
  id: string;
  name: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
  epochId: string;
  epochName: string;
  epoch: { name: string };
  /** Resumo, não o texto inteiro — ver `bioTeaser`. */
  bio: string | null;
  permLinkImslp: string | null;
  wikipediaLink: string | null;
  imslpId: string | null;
  isVerified: boolean;
}

function toComposerCardItem(composer: ComposerListItem): ComposerCardItem {
  const epochName = composer.epoch?.name ?? composer.epochName ?? '';

  return {
    id: composer.id,
    name: composer.name,
    fullName: composer.fullName ?? composer.name,
    birthDate: composer.birthDate ?? null,
    deathDate: composer.deathDate ?? null,
    portraitUrl: composer.portraitUrl ?? null,
    epochId: composer.epochId ?? '',
    epochName,
    epoch: { name: epochName },
    bio: bioTeaser(composer.bio),
    permLinkImslp: composer.permLinkImslp ?? null,
    wikipediaLink: composer.wikipediaLink ?? null,
    imslpId: composer.imslpId ?? null,
    isVerified: composer.isVerified,
  };
}

/**
 * Cache do `fetch` do Next, por tempo e por tag. O dado já vem do cache da API
 * (Redis); aqui fica só a página pronta. A API avisa quando um compositor ou
 * uma época muda (`POST /api/revalidate` com as tags `composers` e `epochs`),
 * então o tempo é só o teto.
 */
const CACHE = {
  EPOCHS: { revalidate: 86400, tags: ['epochs'] },
  COMPOSERS: { revalidate: 1800, tags: ['composers'] },
  CURATED: { revalidate: 86400, tags: ['composers'] },
};

export async function getEpochsCache(): Promise<EpochItem[]> {
  return apiFetch<EpochItem[]>('/epochs', { next: CACHE.EPOCHS });
}

export async function getComposersWithPagination(
  params: PaginationParams
): Promise<ComposerCardItem[]> {
  return fetchComposerCards(
    '/composers',
    CACHE.COMPOSERS,
    normalizeComposerParams(params)
  );
}

export async function getTop20FamousComposers(): Promise<ComposerCardItem[]> {
  return fetchComposerCards('/composers/famous', CACHE.CURATED);
}

export async function getRecomendadedComposers(): Promise<ComposerCardItem[]> {
  return fetchComposerCards('/composers/recommended', CACHE.CURATED);
}

export async function getComposersCount(params: CountParams): Promise<number> {
  return apiFetch<number>('/composers/count', {
    query: normalizeComposerCountParams(params),
    next: CACHE.COMPOSERS,
  });
}

async function fetchComposerCards(
  path: string,
  next: { revalidate: number; tags: string[] },
  query?: PaginationParams
): Promise<ComposerCardItem[]> {
  const composers = await apiFetch<ComposerListItem[]>(path, { query, next });
  return composers.map(toComposerCardItem);
}

function normalizeComposerParams(params: PaginationParams): PaginationParams {
  return {
    page: Math.max(params.page || 1, 1),
    limit: Math.min(Math.max(params.limit || 30, 1), 100),
    ...normalizeComposerCountParams(params),
  };
}

function normalizeComposerCountParams(params: CountParams): CountParams {
  return {
    search: params.search?.trim() || undefined,
    epochId: params.epochId?.trim() || undefined,
  };
}
