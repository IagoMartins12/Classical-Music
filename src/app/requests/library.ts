/**
 * Biblioteca pessoal pela API, chamada do navegador: favoritos (compositores,
 * obras e partituras), anotações e listas de estudo ("quero aprender" e "já
 * aprendi").
 *
 * As respostas da API já têm o formato que as stores liam do legado
 * (`favorites`, `items`, `success`/`action`/`favorite`,
 * `annotations`/`pagination`). O que muda é o corpo das escritas: a API recusa
 * campo que não conhece, então cada uma monta o corpo campo a campo.
 *
 * `ApiResult` faz o papel do `response.ok` do `fetch` que as stores usavam,
 * para a troca não mexer na lógica delas: erro da API vira `ok: false`; erro
 * de conexão continua subindo como exceção.
 */
import { apiFetch } from '@/app/libs/api/client';
import { pick, toResult } from '@/app/requests/api-result';
import type {
  AnnotationPagination,
  WorkAnnotation,
} from '@/app/stores/useAnnotationsStore';
import type {
  FavoriteComposer,
  FavoriteScore,
  FavoriteWork,
} from '@/app/stores/useFavoritesStore';
import type {
  LearnedItem,
  WantToLearnItem,
} from '@/app/stores/useLearningStore';

type AddOrRemove = 'add' | 'remove';

interface FavoriteActionResult<T> {
  success: boolean;
  action: 'added' | 'removed' | 'updated';
  favorite?: T;
}

interface LearningActionResult<T> {
  success: boolean;
  action?: 'added' | 'removed';
  item?: T;
}

// ---- Favoritos

export function listComposerFavorites() {
  return toResult(
    apiFetch<{ favorites: FavoriteComposer[]; count: number }>(
      '/favorites/composers'
    )
  );
}

export function listWorkFavorites() {
  return toResult(
    apiFetch<{ favorites: FavoriteWork[]; count: number }>('/favorites/works')
  );
}

export function toggleComposerFavoriteRequest(
  composerId: string,
  action: AddOrRemove
) {
  return toResult(
    apiFetch<FavoriteActionResult<FavoriteComposer>>('/favorites/composers', {
      method: 'POST',
      body: { composerId, action },
    })
  );
}

export function toggleWorkFavoriteRequest(workId: string, action: AddOrRemove) {
  return toResult(
    apiFetch<FavoriteActionResult<FavoriteWork>>('/favorites/works', {
      method: 'POST',
      body: { workId, action },
    })
  );
}

// O botão de partitura manda também `fileFormat`, que o favorito não guarda.
const SCORE_DATA_KEYS = [
  'title',
  'type',
  'downloadUrl',
  'fileSize',
  'pageCount',
];

export function toggleScoreFavoriteRequest(input: {
  workId: string;
  scoreId: string;
  scoreSource: string;
  action: AddOrRemove;
  scoreData?: object;
}) {
  return toResult(
    apiFetch<FavoriteActionResult<FavoriteScore>>('/favorites/scores', {
      method: 'POST',
      body: {
        workId: input.workId,
        scoreId: input.scoreId,
        scoreSource: input.scoreSource,
        action: input.action,
        // A API só lê os dados da partitura ao adicionar.
        ...(input.action === 'add' && input.scoreData
          ? { scoreData: pick(input.scoreData, SCORE_DATA_KEYS) }
          : {}),
      },
    })
  );
}

export function updateScoreFavoriteRequest(input: {
  workId: string;
  scoreId: string;
  scoreSource: string;
  personalRating?: number;
  notes?: string;
  tags?: string[];
}) {
  return toResult(
    apiFetch<FavoriteActionResult<FavoriteScore>>('/favorites/scores', {
      method: 'POST',
      body: {
        workId: input.workId,
        scoreId: input.scoreId,
        scoreSource: input.scoreSource,
        action: 'update',
        ...pick(input, ['personalRating', 'notes', 'tags']),
      },
    })
  );
}

/** Estatísticas públicas de favoritos das partituras de uma obra. Lança `ApiError`. */
export function getWorkScoreStats(workId: string, signal?: AbortSignal) {
  return apiFetch<{
    totalFavorites: number;
    totalScores: number;
    mostFavorited: unknown;
    topScores: unknown[];
  }>('/favorites/scores', { query: { type: 'work-stats', workId }, signal });
}

export function getMostFavoritedScores(workId: string) {
  return toResult(
    apiFetch<
      { scoreId: string; scoreSource: string; totalFavorites: number }[]
    >('/favorites/scores', {
      query: { type: 'most-favorited', workId },
      cache: 'no-store',
    })
  );
}

// ---- Anotações

// O modal manda também `userId` e `work`: o autor vem do token, e a obra, do
// `workId`.
const ANNOTATION_KEYS = [
  'title',
  'content',
  'category',
  'scope',
  'measureStart',
  'measureEnd',
  'movement',
  'section',
  'pageNumber',
  'hand',
  'voice',
  'instrument',
  'difficulty',
  'tags',
  'isPublic',
];

interface AnnotationResult {
  success: boolean;
  annotation: WorkAnnotation;
}

export function listAnnotations(params: URLSearchParams) {
  return toResult(
    apiFetch<{
      annotations: WorkAnnotation[];
      pagination: AnnotationPagination;
    }>('/annotations', { query: Object.fromEntries(params) })
  );
}

export function createAnnotationRequest(data: Partial<WorkAnnotation>) {
  return toResult(
    apiFetch<AnnotationResult>('/annotations', {
      method: 'POST',
      body: { workId: data.workId, ...pick(data, ANNOTATION_KEYS) },
    })
  );
}

// A obra de uma anotação não muda: a edição não aceita `workId`.
export function updateAnnotationRequest(
  annotationId: string,
  data: Partial<WorkAnnotation>
) {
  return toResult(
    apiFetch<AnnotationResult>(`/annotations/${annotationId}`, {
      method: 'PATCH',
      body: pick(data, ANNOTATION_KEYS),
    })
  );
}

export function deleteAnnotationRequest(annotationId: string) {
  return toResult(
    apiFetch<void>(`/annotations/${annotationId}`, { method: 'DELETE' })
  );
}

export function voteAnnotationRequest(
  annotationId: string,
  isHelpful: boolean
) {
  return toResult(
    apiFetch<{
      success: boolean;
      userVote: boolean | null;
      helpfulCount: number;
    }>(`/annotations/${annotationId}/vote`, {
      method: 'POST',
      body: { isHelpful },
    })
  );
}

// ---- Listas de estudo

const WANT_TO_LEARN_KEYS = [
  'priority',
  'notes',
  'targetDate',
  'estimatedStudyTime',
  'difficulty',
  'motivation',
  'context',
  'selectedWorkScoreId',
  'progressMilestones',
];

const LEARNED_KEYS = [
  'mastery',
  'studyStartDate',
  'studyDuration',
  'notes',
  'wouldRecommend',
  'publicPerformance',
  'difficulty',
  'enjoyment',
  'technicalChallenges',
  'musicalInsights',
  'selectedWorkScoreId',
  // Vídeo de performance: o arquivo sobe antes, e aqui vai só o id dele.
  'videoAssetId',
  'videoFileName',
  'isVideoPublic',
  'removeVideo',
];

const OMIT_IF_EMPTY = [
  'targetDate',
  'estimatedStudyTime',
  'difficulty',
  'selectedWorkScoreId',
  'studyStartDate',
  'studyDuration',
  'enjoyment',
];

export function listWantToLearn() {
  return toResult(
    apiFetch<{ items: WantToLearnItem[]; count: number }>(
      '/learning/want-to-learn'
    )
  );
}

export function listLearned() {
  return toResult(
    apiFetch<{ items: LearnedItem[]; count: number }>('/learning/learned')
  );
}

/** O item de "já aprendi" de uma obra (ou `null`), para recarregar a tela. */
export function getLearnedRequest(workId: string) {
  return toResult(
    apiFetch<{ learned: boolean; item: LearnedItem | null }>(
      '/learning/learned',
      { query: { workId }, cache: 'no-store' }
    )
  );
}

// As stores juntam aos dados campos que a API não guarda (`isVideoPublic`, o
// `epochName` do item otimista): saem do corpo.
export function toggleWantToLearnRequest(
  workId: string,
  action: AddOrRemove,
  data: object = {}
) {
  return toResult(
    apiFetch<LearningActionResult<WantToLearnItem>>('/learning/want-to-learn', {
      method: 'POST',
      body: {
        workId,
        action,
        ...pick(data, WANT_TO_LEARN_KEYS, OMIT_IF_EMPTY),
      },
    })
  );
}

export function updateWantToLearnRequest(workId: string, data: object) {
  return toResult(
    apiFetch<LearningActionResult<WantToLearnItem>>('/learning/want-to-learn', {
      method: 'PATCH',
      body: { workId, ...pick(data, WANT_TO_LEARN_KEYS, OMIT_IF_EMPTY) },
    })
  );
}

export function toggleLearnedRequest(
  workId: string,
  action: AddOrRemove,
  data: object = {}
) {
  return toResult(
    apiFetch<LearningActionResult<LearnedItem>>('/learning/learned', {
      method: 'POST',
      body: { workId, action, ...pick(data, LEARNED_KEYS, OMIT_IF_EMPTY) },
    })
  );
}

export function updateLearnedRequest(workId: string, data: object) {
  return toResult(
    apiFetch<LearningActionResult<LearnedItem>>('/learning/learned', {
      method: 'PATCH',
      body: { workId, ...pick(data, LEARNED_KEYS, OMIT_IF_EMPTY) },
    })
  );
}

/**
 * Vídeo de performance do "já aprendi": sobe direto ao armazenamento
 * (`POST /uploads/signed`, `PERFORMANCE_VIDEO`) e devolve o id do arquivo, que
 * vai no corpo do item (`videoAssetId`). O legado mandava o arquivo em
 * multipart para o Next, que o gravava no disco do servidor.
 */
export async function uploadPerformanceVideo(workId: string, file: File) {
  const signed = await apiFetch<{
    assetId: string;
    uploadUrl: string;
    fields: Record<string, string | number>;
  }>('/uploads/signed', {
    method: 'POST',
    body: { kind: 'PERFORMANCE_VIDEO', scopeId: workId },
  });

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) {
    form.append(key, String(value));
  }
  form.append('file', file);

  const upload = await fetch(signed.uploadUrl, { method: 'POST', body: form });

  if (!upload.ok) {
    throw new Error('Não foi possível enviar o vídeo');
  }

  await apiFetch(`/uploads/${signed.assetId}/confirm`, { method: 'POST' });

  return signed.assetId;
}
