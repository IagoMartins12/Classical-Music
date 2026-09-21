/**
 * Envios da comunidade pela API, chamados do navegador: as listas de apoio da
 * página "Meus envios", exclusão, o que a exclusão leva junto, histórico, os
 * grupos de partitura e as buscas dos modais de envio.
 *
 * As telas continuam lendo o formato do legado; as diferenças de contrato
 * ficam aqui. (`my-uploads.ts` é o par do servidor, com o token do cookie.)
 */
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { pick, toResult } from '@/app/requests/api-result';

export type UploadKind = 'composer' | 'work' | 'score';

type MyUploads = ApiSchema<'MyUploadsResponseDto'>;
type ComposerListItem = ApiSchema<'ComposerListItemDto'>;
type WorksCatalog = ApiSchema<'WorksCatalogResponseDto'>;

interface NamedOption {
  id: string;
  name: string;
}

export interface UploadFormLists {
  epochs: NamedOption[];
  instruments: Array<NamedOption & { category: string | null }>;
  roles: NamedOption[];
  composers: Array<{
    id: string;
    name: string;
    fullName: string;
    worksCount: number | null;
  }>;
  works: Array<{
    id: string;
    title: string;
    composer: { id: string; name: string; fullName: string };
  }>;
}

function myUploads(type: 'composer' | 'work', limit: number) {
  return apiFetch<MyUploads>('/uploads/mine', { query: { type, limit } });
}

const byText = (a: string, b: string) => a.localeCompare(b, 'pt-BR');

/**
 * Filtros de "Meus envios": os compositores e as obras que a própria pessoa
 * cadastrou, até 50 de cada, em ordem alfabética — a regra do legado
 * (`getFilterData`).
 */
export async function getUploadFilterData() {
  const [composers, works] = await Promise.all([
    myUploads('composer', 50),
    myUploads('work', 50),
  ]);

  return {
    composers: composers.items
      .map((composer) => ({
        id: composer.id,
        name: composer.title,
        fullName: composer.title,
      }))
      .sort((a, b) => byText(a.name, b.name)),
    works: works.items
      .map((work) => ({
        id: work.id,
        title: work.title,
        composerName: work.composerName ?? '',
      }))
      .sort((a, b) => byText(a.title, b.title)),
  };
}

/**
 * Listas dos formulários de envio. A API devolve épocas, instrumentos e
 * papéis; o legado juntava uma seleção de compositores famosos e de obras
 * deles para os seletores dos modais. Aqui eles vêm do catálogo: os primeiros
 * 50 compositores e as primeiras 50 obras.
 */
export async function getUploadFormLists(): Promise<UploadFormLists> {
  const [base, composers, catalog] = await Promise.all([
    apiFetch<Omit<UploadFormLists, 'composers' | 'works'>>(
      '/uploads/form-data'
    ),
    apiFetch<ComposerListItem[]>('/composers', {
      query: { page: 1, limit: 50 },
    }),
    apiFetch<WorksCatalog>('/works/catalog', {
      query: { page: 1, limit: 50 },
    }),
  ]);

  return {
    ...base,
    composers: composers.map((composer) => ({
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName ?? composer.name,
      // A lista do catálogo não conta obras; o seletor só mostra o número
      // quando ele vem.
      worksCount: null,
    })),
    works: catalog.works.map((work) => ({
      id: work.id,
      title: work.title,
      composer: {
        id: work.composer.id,
        name: work.composer.name,
        fullName: work.composer.fullName ?? work.composer.name,
      },
    })),
  };
}

/**
 * Épocas do filtro. O legado listava só as épocas com envios do tipo
 * escolhido; a API não tem esse recorte, então vêm todas.
 */
export async function getUploadEpochs(): Promise<NamedOption[]> {
  const data = await apiFetch<{ epochs: NamedOption[] }>('/uploads/form-data');

  return data.epochs;
}

interface DeleteUploadResult {
  // A API responde 204. As telas liam `details` e `message` do legado para a
  // mensagem de sucesso; sem eles, mostram a genérica.

  details?: any;
  message?: string;
}

export function deleteUpload(kind: UploadKind, id: string) {
  return toResult(
    apiFetch<void>(`/uploads/${kind}/${id}`, { method: 'DELETE' }).then(
      (): DeleteUploadResult => ({})
    )
  );
}

interface CascadeInfoResponse {
  works?: { id: string; title: string; scoresCount: number }[];
  scores?: { id: string; title: string; source?: string }[];
  willDelete: { works?: number; scores?: number };
}

export interface UploadCascadeInfo {
  works: { id: string; title: string; scoresCount: number }[];
  scores: { id: string; title: string; source?: string }[];
  childWorks: { id: string; title: string; scoresCount: number }[];
  totalWorks: number;
  totalScores: number;
}

/**
 * O que a exclusão leva junto: as obras de um compositor (com quantas
 * partituras cada uma tem) ou as partituras de uma obra, e os totais.
 * Partitura nunca teve essa rota (a chamada do legado caía em 404): não há o
 * que mostrar.
 */
export async function getCascadeInfo(
  kind: UploadKind,
  id: string
): Promise<UploadCascadeInfo | null> {
  if (kind === 'score') {
    return null;
  }

  const info = await apiFetch<CascadeInfoResponse>(
    `/uploads/${kind}/${id}/cascade-info`
  );

  return {
    works: info.works ?? [],
    scores: info.scores ?? [],
    // A API não apaga obra filha junto com a mãe; o legado listava.
    childWorks: [],
    totalWorks: info.willDelete.works ?? 0,
    totalScores: info.willDelete.scores ?? 0,
  };
}

interface HistoryResponse<T> {
  entries: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** A tela lê `history` e `pagination.totalCount`; a API devolve `entries` e `pagination.total`. */
export async function getUploadHistory<T>(params: URLSearchParams) {
  // Filtro vazio iria como `userId=` e a API recusaria o id.
  const query = Object.fromEntries(
    [...params.entries()].filter(([, value]) => value !== '')
  );
  const result = await toResult(
    apiFetch<HistoryResponse<T>>('/uploads/history', { query })
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    data: {
      history: result.data.entries,
      pagination: {
        totalPages: result.data.pagination.totalPages,
        totalCount: result.data.pagination.total,
      },
    },
  };
}

interface ApiScoreGroup {
  groupIndex: number;
  groupTitle: string;
  count: number;
  source: 'IMSLP' | 'USER_UPLOADED';
}

interface ScoreGroupsResponse {
  success: boolean;
  groups: ApiScoreGroup[];
  userGroups: ApiScoreGroup[];
  suggestions: {
    suggestedTitle: string;
    suggestedIndex: number;
    reason: string;
    confidence: 'high' | 'medium';
    source: 'USER_UPLOADED';
  }[];
  hasExistingScores: boolean;
}

// A tela chama a contagem de `scoresCount`; a API não devolve a lista das
// partituras de cada grupo (a tela só a mostrava como número).
function toScreenGroup(group: ApiScoreGroup) {
  return {
    groupIndex: group.groupIndex,
    groupTitle: group.groupTitle,
    scoresCount: group.count,
    scores: [],
    source: group.source === 'IMSLP' ? ('IMSLP' as const) : ('UPLOAD' as const),
    isUserUploaded: group.source === 'USER_UPLOADED',
  };
}

/** Grupos de partitura de uma obra, com as sugestões de onde encaixar a nova. */
export async function getScoreGroups(workId: string) {
  const result = await toResult(
    apiFetch<ScoreGroupsResponse>('/uploads/score/groups', {
      query: { workId },
    })
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    data: {
      ...result.data,
      groups: result.data.groups.map(toScreenGroup),
      userGroups: result.data.userGroups.map(toScreenGroup),
    },
  };
}

/**
 * Busca de compositores dos modais de envio. O legado era `POST /api/composers`
 * com `{ q, limit }`; na API é `GET /composers` com `search`. Volta a lista
 * pura, como no legado.
 */
export async function searchComposers(q: string, limit: number) {
  const composers = await apiFetch<ComposerListItem[]>('/composers', {
    query: { page: 1, limit, search: q.trim() || undefined },
  });

  return composers.map((composer) => ({
    id: composer.id,
    name: composer.name,
    fullName: composer.fullName ?? undefined,
  }));
}

/** Obras que a própria pessoa cadastrou, para o envio de partitura (o legado lia `GET /api/uploads?type=work`). */
export async function getMyWorks(limit = 100) {
  const data = await myUploads('work', limit);

  return {
    works: data.items.map((work) => ({
      id: work.id,
      title: work.title,
      composer: {
        id: work.composerId ?? '',
        name: work.composerName ?? '',
        fullName: work.composerName ?? '',
      },
    })),
  };
}

// ---- Cadastro: compositor, obra e partitura

/**
 * O formato de `Response` que os modais de envio já liam (`ok` e `json()`),
 * para a troca não mexer na lógica deles. Erro da API vira `{ error }`.
 */
interface FormResponse {
  ok: boolean;
  // Como o `Response.json()` que os modais usavam: eles leem os campos direto.

  json: () => Promise<any>;
}

function formResponse(
  ok: boolean,
  payload: Record<string, unknown>
): FormResponse {
  return { ok, json: async () => payload };
}

async function submit<T>(
  request: Promise<T>,
  onSuccess: (data: T) => Record<string, unknown>
): Promise<FormResponse> {
  const result = await toResult(request);

  return result.ok
    ? formResponse(true, onSuccess(result.data))
    : formResponse(false, { error: result.error });
}

const COMPOSER_KEYS = [
  'name',
  'fullName',
  'epochId',
  'primaryRoleId',
  'alternativeNames',
  'birthDate',
  'deathDate',
  'portraitUrl',
  'epochName',
  'bio',
  'bioEn',
  'imslpId',
  'permLinkImslp',
  'wikipediaLink',
  'videoUrl',
  'nationality',
  'instruments',
  'imslpCategories',
  'roles',
  'dataSource',
];

// Campos validados como URL ou id: vazio sai do corpo em vez de ir como `''`.
// Os de texto livre vão mesmo vazios, para a edição poder apagá-los.
const COMPOSER_OMIT_IF_EMPTY = [
  'epochId',
  'primaryRoleId',
  'portraitUrl',
  'permLinkImslp',
  'wikipediaLink',
  'videoUrl',
];

/** Cria (`POST`) ou edita (`PATCH`; o legado usava `PUT` com o formulário inteiro) um compositor. */
export function saveComposerRequest(
  editingId: string | undefined,
  data: object
) {
  return submit(
    apiFetch<{ id: string }>(
      editingId ? `/uploads/composer/${editingId}` : '/uploads/composer',
      {
        method: editingId ? 'PATCH' : 'POST',
        body: pick(data, COMPOSER_KEYS, COMPOSER_OMIT_IF_EMPTY),
      }
    ),
    // O legado devolvia `composerId`; a API devolve o compositor.
    (composer) => ({ composerId: composer.id })
  );
}

export function checkComposerDuplicateRequest(input: {
  url: string;
  source: 'imslp' | 'wikipedia';
  excludeId?: string;
  fullName?: string;
}) {
  return submit(
    apiFetch<Record<string, unknown>>('/uploads/composer/check-duplicate', {
      method: 'POST',
      body: pick(
        input,
        ['url', 'source', 'excludeId', 'fullName'],
        ['excludeId', 'fullName']
      ),
    }),
    (data) => data
  );
}

const WORK_KEYS = [
  'title',
  'composerId',
  'instrumentId',
  'epochId',
  'subtitle',
  'opOrCatalog',
  'compositionYear',
  'firstPublishDate',
  'tone',
  'mediaDuration',
  'workStyle',
  'moviment',
  'dedicateTo',
  'instrumentation',
  'workType',
  'movementNumber',
  'parentWorkId',
  'categoryNames',
  'workGenresArr',
  'imslpTags',
  'imslpPermlink',
  'imslpId',
  'videoUrl',
  'spotifyTrackId',
  'spotifyTrackUrl',
  'youtubeVideoId',
  'youtubeVideoUrl',
  'youtubeTitle',
  'customAudioUrl',
  'videoAulaUrl',
  'videoAulaTitle',
  'videoAulaType',
  'videoAulaSource',
  'dataSource',
];

const WORK_OMIT_IF_EMPTY = [
  'composerId',
  'instrumentId',
  'epochId',
  'parentWorkId',
  'workType',
  'movementNumber',
  'imslpPermlink',
  'videoUrl',
  'spotifyTrackUrl',
  'youtubeVideoUrl',
  'customAudioUrl',
  'videoAulaUrl',
];

/**
 * Cria ou edita uma obra. Saem do corpo os campos que a API não guarda
 * (`difficultyLevel`, `mediaSource`, `videoAulaAddedAt`).
 */
export function saveWorkRequest(editingId: string | undefined, data: object) {
  return submit(
    apiFetch<{ id: string }>(
      editingId ? `/uploads/work/${editingId}` : '/uploads/work',
      {
        method: editingId ? 'PATCH' : 'POST',
        body: pick(data, WORK_KEYS, WORK_OMIT_IF_EMPTY),
      }
    ),
    // O id volta para a tela: é com ele que o áudio e a videoaula de uma obra
    // nova sobem, logo depois de ela existir.
    (work) => ({ workId: work.id })
  );
}

/** O legado dizia se a duplicata veio do link ou do título (`duplicateType`); a API diz o motivo. */
export function checkWorkDuplicateRequest(input: {
  url?: string;
  title?: string;
  composerId?: string;
  excludeId?: string;
}) {
  return submit(
    apiFetch<{ found: boolean; work?: unknown; reason?: string }>(
      '/uploads/work/check-duplicate',
      {
        method: 'POST',
        body: pick(
          input,
          ['url', 'title', 'composerId', 'excludeId'],
          ['url', 'title', 'composerId', 'excludeId']
        ),
      }
    ),
    (data) => ({
      ...data,
      duplicateType: input.url ? 'url' : 'title_composer',
      duplicateReason: data.reason,
    })
  );
}

// ---- Arquivos (retrato de compositor, partitura e miniatura)

type UploadAssetKind = 'COMPOSER_IMAGE' | 'SCORE_FILE' | 'SCORE_THUMBNAIL';

// URL do arquivo enviado → id do arquivo na API. A partitura é criada com o
// id (`assetId`), mas o modal só guarda a URL; lembrar aqui evita mudar o
// estado dele.
const uploadedAssetIds = new Map<string, string>();

/**
 * Envia um arquivo ao armazenamento da API (o legado gravava na pasta do
 * servidor). `scopeId` só organiza a pasta: o dono definitivo é o registro
 * que usar o arquivo depois.
 */
async function uploadAsset(
  kind: UploadAssetKind,
  file: Blob,
  fileName: string,
  scopeId: string
) {
  const form = new FormData();
  form.append('file', file, fileName);
  form.append('kind', kind);
  form.append('scopeId', scopeId);

  const asset = await apiFetch<{ id: string; url: string | null }>(
    '/uploads/file',
    { method: 'POST', body: form }
  );

  if (asset.url) {
    uploadedAssetIds.set(asset.url, asset.id);
  }

  return asset;
}

/** Retrato do compositor, no formato que os modais liam (`success`, `imageUrl`, `message`). */
export async function uploadComposerImage(file: File, composerId?: string) {
  try {
    const asset = await uploadAsset(
      'COMPOSER_IMAGE',
      file,
      file.name,
      composerId || 'pending'
    );

    return { success: true, imageUrl: asset.url ?? '', message: '' };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, imageUrl: '', message: error.message };
    }

    throw error;
  }
}

/** Arquivo da partitura. O modal usa a URL como `downloadUrl` até criar o registro. */
export async function uploadScoreFile(file: File, workId?: string) {
  const asset = await uploadAsset(
    'SCORE_FILE',
    file,
    file.name,
    workId || 'pending'
  );

  return { url: asset.url ?? '' };
}

export async function uploadScoreThumbnail(image: Blob, fileName: string) {
  const asset = await uploadAsset(
    'SCORE_THUMBNAIL',
    image,
    fileName,
    'pending'
  );

  return { url: asset.url ?? '' };
}

const SCORE_KEYS = [
  'title',
  'type',
  'publisher',
  'editor',
  'copyright',
  'pageCount',
  'fileFormat',
  'notes',
  'groupIndex',
  'groupTitle',
];

/**
 * Cria ou edita uma partitura. Com arquivo, a criação leva o id do que o modal
 * enviou antes (`uploadScoreFile`); por link externo, leva o endereço, que a
 * API guarda sem buscar. A edição não troca arquivo nem link.
 */
export async function saveScoreRequest(
  editingId: string | undefined,
  data: Record<string, unknown>
): Promise<FormResponse> {
  const body = pick(data, SCORE_KEYS, ['type', 'groupTitle']);

  if (editingId) {
    return submit(
      apiFetch(`/uploads/score/${editingId}`, { method: 'PATCH', body }),
      () => ({})
    );
  }

  const downloadUrl = String(data.downloadUrl ?? '');
  const assetId = uploadedAssetIds.get(downloadUrl);
  const isLink = data.source === 'CUSTOM' || (!assetId && !!downloadUrl);

  if (!assetId && !isLink) {
    return formResponse(false, {
      error: 'Envie o arquivo da partitura de novo antes de salvar.',
    });
  }

  return submit(
    apiFetch('/uploads/score', {
      method: 'POST',
      body: {
        ...body,
        workId: data.workId,
        ...(assetId ? { assetId } : { externalUrl: downloadUrl }),
        thumbnailAssetId: uploadedAssetIds.get(String(data.thumbnailUrl ?? '')),
      },
    }),
    () => ({})
  );
}
