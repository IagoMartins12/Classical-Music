// app/requests/composer-details.ts — página do compositor, pela API (Etapa 3)
//
// Sem nada de servidor: o `ComposerWorks` (navegador) também chama daqui para
// filtrar e paginar as obras.
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

export interface ComposerDetails {
  id: string;
  name: string;
  fullName: string;

  videoUrl?: string;
  alternativeNames?: string;

  birthDate?: string;
  deathDate?: string;

  portraitUrl?: string;
  bio?: string;
  permLinkImslp?: string;
  wikipediaLink?: string;
  epochId: string;
  epochName: string;
  primaryRoleId?: string;
  primaryRoleName?: string;
  worksCount: number;
  createdAt: Date;
  roleNames?: string[];

  isVerified?: boolean;
  verificationStatus?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;

  nationality?: string;
  instruments?: string;
  imslpCategories?: string;

  lastModifiedImslp?: string;
  pageQuality?: string;
  lastVerified?: Date;
  dataCompleteness?: number;
  hasValidImage?: boolean;
}

export interface ComposerWork {
  id: string;
  title: string;
  subtitle?: string;
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  imslpPermlink: string;
  videoUrl?: string;
  moviment?: string;
  instrument?: {
    id: string;
    name: string;
  };
  workType: string;
  workGenresArr?: string[];
  categoryNames?: string[];
  isVerified: boolean;
  difficultyLevel?: string;
  imslpTags?: string[];
}

export interface ComposerWorksResponse {
  works: ComposerWork[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

export interface ComposerFilterOptions {
  instruments: { id: string; name: string }[];
  workGenres: string[];
  categories: string[];
  difficultyLevels: { value: string; label: string }[];
}

export type ComposerWorksFilters = {
  instrumentId?: string;
  workGenresArr?: string;
  categoryNames?: string;
  search?: string;
  workType?: string;
  difficultyLevel?: string;
};

type ComposerWorksPage = ApiSchema<'ComposerWorksResponseDto'>;

/**
 * Cache do `fetch` do Next (no servidor; no navegador o `next` é ignorado).
 * A API avisa pelas tags `composers` e `works` quando o dado muda.
 */
const CACHE = {
  COMPOSER: { revalidate: 7200, tags: ['composers'] },
  WORKS: { revalidate: 3600, tags: ['composers', 'works'] },
};

/** A API entrega no máximo 100 obras por página. */
const API_PAGE_MAX = 100;

const EMPTY_FILTER_OPTIONS: ComposerFilterOptions = {
  instruments: [],
  workGenres: [],
  categories: [],
  difficultyLevels: [
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIATE', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' },
  ],
};

/** O compositor, ou `null` se ele não existe. */
export async function getComposerById(
  composerId: string
): Promise<ComposerDetails | null> {
  try {
    const composer = await apiFetch<ApiSchema<'ComposerDetailDto'>>(
      composerPath(composerId),
      { next: CACHE.COMPOSER }
    );

    return {
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName,
      alternativeNames: composer.alternativeNames || undefined,
      birthDate: composer.birthDate || undefined,
      deathDate: composer.deathDate || undefined,
      videoUrl: composer.videoUrl || undefined,
      portraitUrl: composer.portraitUrl || undefined,
      bio: composer.bio || undefined,
      permLinkImslp: composer.permLinkImslp || undefined,
      wikipediaLink: composer.wikipediaLink || undefined,
      epochId: composer.epochId,
      epochName: composer.epochName,
      primaryRoleId: composer.primaryRoleId || undefined,
      primaryRoleName: composer.primaryRoleName || undefined,
      worksCount: composer.worksCount,
      createdAt: new Date(composer.createdAt),
      roleNames: composer.roleNames,
      isVerified: composer.isVerified,
      verificationStatus: composer.verificationStatus || 'pending',
      verifiedBy: composer.verifiedBy || undefined,
      verifiedAt: toDate(composer.verifiedAt),
      verificationNotes: composer.verificationNotes || undefined,
      nationality: composer.nationality || undefined,
      instruments: composer.instruments || undefined,
      imslpCategories: composer.imslpCategories || undefined,
      pageQuality: composer.pageQuality || undefined,
      lastVerified: toDate(composer.lastVerified),
      dataCompleteness: composer.dataCompleteness || undefined,
      hasValidImage: composer.hasValidImage,
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return null;
    }
    throw error;
  }
}

/** Obras do compositor, com filtros e paginação (busca inclui movimentos). */
export async function getComposerWorksWithFilters(
  composerId: string,
  page: number = 1,
  limit: number = 50,
  filters?: ComposerWorksFilters
): Promise<ComposerWorksResponse> {
  const start = (page - 1) * limit;

  if (limit <= API_PAGE_MAX) {
    const response = await fetchWorksPage(composerId, page, limit, filters);
    return {
      works: response.works.map(toComposerWork),
      totalCount: response.totalCount,
      hasMore: response.hasMore,
      currentPage: page,
    };
  }

  // Pedido maior que a página da API (o filtro por grupo de tipo pede 1000):
  // junta as páginas de 100 que cobrem o intervalo pedido.
  const firstApiPage = Math.floor(start / API_PAGE_MAX) + 1;
  const first = await fetchWorksPage(
    composerId,
    firstApiPage,
    API_PAGE_MAX,
    filters
  );
  const lastApiPage = Math.min(
    Math.ceil((start + limit) / API_PAGE_MAX),
    Math.max(firstApiPage, Math.ceil(first.totalCount / API_PAGE_MAX))
  );
  const rest = await Promise.all(
    Array.from({ length: lastApiPage - firstApiPage }, (_, index) =>
      fetchWorksPage(
        composerId,
        firstApiPage + index + 1,
        API_PAGE_MAX,
        filters
      )
    )
  );

  const offset = start - (firstApiPage - 1) * API_PAGE_MAX;
  const works = [first, ...rest]
    .flatMap((response) => response.works)
    .slice(offset, offset + limit);

  return {
    works: works.map(toComposerWork),
    totalCount: first.totalCount,
    hasMore: start + works.length < first.totalCount,
    currentPage: page,
  };
}

/** Opções de filtro das obras do compositor; vazias se a API falhar. */
export async function getComposerFilterOptions(
  composerId: string
): Promise<ComposerFilterOptions> {
  try {
    return await apiFetch<ApiSchema<'ComposerFilterOptionsResponseDto'>>(
      `${composerPath(composerId)}/filter-options`,
      { next: CACHE.WORKS }
    );
  } catch (error) {
    console.error('Erro ao buscar opções de filtros do compositor:', error);
    return EMPTY_FILTER_OPTIONS;
  }
}

/** Quantas obras o compositor tem de cada tipo (as abas do `ComposerWorks`). */
export async function getComposerWorkTypeCounts(composerId: string) {
  const response = await apiFetch<
    ApiSchema<'ComposerWorkTypeCountsResponseDto'>
  >(`${composerPath(composerId)}/work-type-counts`, { next: CACHE.WORKS });

  return {
    workTypeCounts: response.workTypeCounts as Record<string, number>,
    totalTypes: response.totalTypes,
  };
}

function fetchWorksPage(
  composerId: string,
  page: number,
  limit: number,
  filters?: ComposerWorksFilters
): Promise<ComposerWorksPage> {
  return apiFetch<ComposerWorksPage>(`${composerPath(composerId)}/works`, {
    query: { page, limit, ...filters },
    next: CACHE.WORKS,
  });
}

function toComposerWork(work: ApiSchema<'ComposerWorkItemDto'>): ComposerWork {
  return {
    id: work.id,
    title: work.title,
    subtitle: work.subtitle || undefined,
    opOrCatalog: work.opOrCatalog || undefined,
    compositionYear: work.compositionYear || undefined,
    tone: work.tone || undefined,
    mediaDuration: work.mediaDuration || undefined,
    imslpPermlink: work.imslpPermlink,
    videoUrl: work.videoUrl || undefined,
    moviment: work.moviment || undefined,
    instrument: work.instrument ?? undefined,
    workType: work.workType,
    workGenresArr: work.workGenresArr,
    categoryNames: work.categoryNames,
    isVerified: work.isVerified,
    difficultyLevel: work.difficultyLevel || undefined,
    imslpTags: work.imslpTags,
  };
}

function composerPath(composerId: string): string {
  return `/composers/${encodeURIComponent(composerId)}`;
}

function toDate(value?: string | null): Date | undefined {
  return value ? new Date(value) : undefined;
}
