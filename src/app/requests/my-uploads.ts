// app/requests/my-uploads.ts — "Meus envios" e as telas de edição, pela API (Etapa 3)
//
// Em nome de quem está logado (token do cookie, `server-session.ts`) e sem
// cache: é dado de uma pessoa só. O `requests/upload.ts` do legado segue para
// as rotas `api/uploads/*`, até a Etapa 7.
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ProfileAccount } from '@/app/libs/api/profile';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import type { ApiSchema } from '@/app/libs/api/types';

export interface UserUpload {
  id: string;
  title: string;
  type: 'composer' | 'work' | 'score';
  createdAt: string;
  updatedAt: string;
  isIMSLP: boolean;
  imslpId?: string;
  imslpPermlink?: string;
  epochName?: string;
  composerName?: string;
  composerId?: string;
  instrumentName?: string;
  workGenres?: string[];
  categoryNames?: string[];
  verificationStatus?: string;
  pageCount?: string;
  fileSize?: string;
  dataQuality?: string;
  portraitUrl?: string;
  workTitle?: string;
  workId?: string;
  downloadUrl?: string;
  isVerified?: boolean;
}

export type UploadKind = 'composer' | 'work' | 'score';

export interface UploadFormData {
  epochs: Array<{ id: string; name: string }>;
  instruments: Array<{ id: string; name: string; category: string | null }>;
  roles: Array<{ id: string; name: string }>;
}

/** O registro para a tela de edição, ou por que ele não pode ser editado. */
export type UploadForEdit =
  | { status: 'ok'; data: unknown }
  | { status: 'not-found' }
  | { status: 'forbidden' };

type Query = Record<string, string | number | boolean | undefined>;

async function callApi<T>(path: string, query?: Query): Promise<T> {
  const token = await getServerAccessToken();

  if (!token) {
    throw new ApiError(401, 'Sua sessão expirou. Entre de novo.', null);
  }

  return apiFetch<T>(path, { token, cache: 'no-store', query });
}

/** A conta de quem está logado (barra o acesso e pede a confirmação do e-mail). */
export async function getCurrentAccount(): Promise<ProfileAccount | null> {
  try {
    const { account } = await callApi<{ account: ProfileAccount }>('/profile', {
      include: 'account',
    });
    return account;
  } catch {
    return null;
  }
}

const EMPTY_UPLOADS = {
  items: [] as UserUpload[],
  composers: [] as unknown[],
  works: [] as unknown[],
  scores: [] as unknown[],
  totalCount: 0,
  composerCount: 0,
  workCount: 0,
  scoreCount: 0,
  hasMoreComposers: false,
  hasMoreWorks: false,
  hasMoreScores: false,
};

/**
 * O que a pessoa criou (`GET /uploads/mine`): a mesma regra de busca, filtros,
 * paginação e contagem do `getUserUploads` do legado. As listas cruas por tipo
 * não são usadas pela página e ficam vazias.
 */
export async function getMyUploads(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  epochId?: string;
  composerId?: string;
  workId?: string;
  limitPerType?: boolean;
}) {
  try {
    const result = await callApi<ApiSchema<'MyUploadsResponseDto'>>(
      '/uploads/mine',
      {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        type: params.type || undefined,
        epochId: params.epochId || undefined,
        composerId: params.composerId || undefined,
        workId: params.workId || undefined,
        limitPerType: params.limitPerType,
      }
    );

    return { ...EMPTY_UPLOADS, ...result, items: result.items as UserUpload[] };
  } catch (error) {
    console.error('Erro ao buscar uploads do usuário:', error);
    return EMPTY_UPLOADS;
  }
}

/** Épocas para o filtro de "Meus envios" (conteúdo público, em cache). */
export async function getUploadEpochs(): Promise<
  Array<{ id: string; name: string }>
> {
  try {
    return await apiFetch<ApiSchema<'EpochItemDto'>[]>('/epochs', {
      next: { revalidate: 86400, tags: ['epochs'] },
    });
  } catch (error) {
    console.error('Erro ao buscar épocas:', error);
    return [];
  }
}

/** Listas de apoio aos formulários: épocas, instrumentos e papéis. */
export async function getUploadFormData(): Promise<UploadFormData> {
  try {
    return await callApi<UploadFormData>('/uploads/form-data');
  } catch (error) {
    console.error('Erro ao buscar dados do formulário:', error);
    return { epochs: [], instruments: [], roles: [] };
  }
}

/** Os 50 primeiros compositores por nome, para o seletor da edição de obra. */
export async function getComposerOptions(): Promise<
  Array<{ id: string; name: string; fullName: string | null }>
> {
  try {
    const composers = await apiFetch<ApiSchema<'ComposerListItemDto'>[]>(
      '/composers',
      {
        query: { page: 1, limit: 50 },
        next: { revalidate: 1800, tags: ['composers'] },
      }
    );
    return composers.map(({ id, name, fullName }) => ({
      id,
      name,
      fullName: fullName ?? null,
    }));
  } catch (error) {
    console.error('Erro ao buscar compositores:', error);
    return [];
  }
}

/**
 * O registro para a tela de edição (`GET /uploads/{tipo}/{id}`). A API confere
 * se ele existe (404) e se quem pede é dono ou administrador (403).
 */
export async function getUploadForEdit(
  kind: UploadKind,
  id: string
): Promise<UploadForEdit> {
  try {
    const data = await callApi<unknown>(
      `/uploads/${kind}/${encodeURIComponent(id)}`
    );
    return { status: 'ok', data };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) return { status: 'forbidden' };
      if (error.status === 404 || error.status === 400) {
        return { status: 'not-found' };
      }
    }
    throw error;
  }
}
