// app/requests/portal/assignment-actions.ts — ações sobre tarefas pela API (Etapa 4)
//
// O legado tinha um PATCH genérico em `/api/assignments` que aceitava qualquer
// campo de qualquer papel. A API separa o que cada um pode fazer: o professor
// edita e dá feedback; o aluno relata progresso e conclui. Status, datas e
// `submissions` não são enviados — a API os deriva.
import { ApiError, apiFetch } from '@/app/libs/api/client';
import {
  MILESTONE_KEYS,
  legacyAssignmentRow,
  type ApiAssignment,
} from './records';

type Updates = Record<string, any>;

function present(updates: Updates, keys: readonly string[]): Updates {
  return Object.fromEntries(
    keys
      .filter((key) => updates[key] !== undefined && updates[key] !== null)
      .map((key) => [key, updates[key]])
  );
}

// ====================================
// ALUNO
// ====================================

const STUDENT_PROGRESS_FIELDS = [
  'progress',
  'actualTime',
  'studentNotes',
] as const;

/** Nota do aluno é de 1 a 5; o 0 da tela quer dizer "sem nota". */
function studentRating(updates: Updates): Updates {
  return updates.studentRating ? { studentRating: updates.studentRating } : {};
}

/**
 * Traduz a atualização do aluno para as rotas da API:
 * - conclusão (`isCompleted` ou status `COMPLETED`) → `PATCH /complete`;
 * - progresso, tempo, notas e nota → `PATCH /progress`;
 * - cada marco novo → um `PATCH /progress` com `milestone`. A API guarda o
 *   histórico de marcos e não desmarca: marco desmarcado na tela continua
 *   registrado.
 * Devolve a tarefa atualizada no formato do legado.
 */
export async function applyStudentAssignmentUpdate(
  assignmentId: string,
  updates: Updates
) {
  if (updates.isCompleted === true || updates.status === 'COMPLETED') {
    const done = await apiFetch<ApiAssignment>(
      `/assignments/${assignmentId}/complete`,
      {
        method: 'PATCH',
        body: {
          ...present(updates, ['actualTime', 'studentNotes']),
          ...studentRating(updates),
        },
      }
    );
    return legacyAssignmentRow(done);
  }

  const base = {
    ...present(updates, STUDENT_PROGRESS_FIELDS),
    ...studentRating(updates),
  };

  const wanted: string[] = updates.progressMilestones
    ? MILESTONE_KEYS.filter((key) => updates.progressMilestones[key])
    : [];

  let fresh: string[] = [];

  if (wanted.length > 0) {
    const current = await apiFetch<ApiAssignment>(
      `/assignments/${assignmentId}`
    );
    const reached = new Set(
      current.submissions.milestones.map((milestone) => milestone.label)
    );
    fresh = wanted.filter((key) => !reached.has(key));
  }

  const calls: Updates[] =
    fresh.length > 0
      ? fresh.map((milestone, index) =>
          index === 0 ? { ...base, milestone } : { milestone }
        )
      : Object.keys(base).length > 0
        ? [base]
        : [];

  let latest: ApiAssignment | null = null;

  for (const body of calls) {
    latest = await apiFetch<ApiAssignment>(
      `/assignments/${assignmentId}/progress`,
      { method: 'PATCH', body }
    );
  }

  latest ??= await apiFetch<ApiAssignment>(`/assignments/${assignmentId}`);

  return legacyAssignmentRow(latest);
}

// ====================================
// PROFESSOR
// ====================================

/** Feedback (e nota) do professor; a API também avisa o aluno. */
export function giveAssignmentFeedback(
  assignmentId: string,
  feedback: { teacherFeedback?: string; teacherRating?: number }
) {
  return apiFetch<ApiAssignment>(`/assignments/${assignmentId}/feedback`, {
    method: 'PATCH',
    body: {
      feedback: feedback.teacherFeedback ?? '',
      ...(feedback.teacherRating ? { rating: feedback.teacherRating } : {}),
    },
  });
}

const ASSIGNMENT_CONTENT_FIELDS = [
  'title',
  'description',
  'type',
  'priority',
  'estimatedTime',
  'workScoreIds',
  'worksIds',
  'exercises',
  'practiceGoals',
  'technicalGoals',
  'musicalGoals',
] as const;

/** A API aceita metas de andamento como `[{ label, bpm }]`. */
function tempoTargets(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const targets = value
    .map((item) => ({
      label: String(item?.label ?? item?.name ?? item?.section ?? '').trim(),
      bpm: Number(item?.bpm ?? item?.tempo),
    }))
    .filter(
      (target) => target.label && Number.isFinite(target.bpm) && target.bpm > 0
    );

  return targets.length > 0 ? targets : undefined;
}

function contentBody(data: Updates) {
  const targets = tempoTargets(data.tempoTargets);

  return {
    ...present(data, ASSIGNMENT_CONTENT_FIELDS),
    ...(targets ? { tempoTargets: targets } : {}),
  };
}

export function createAssignmentRequest(data: Updates & { lessonId: string }) {
  return apiFetch<ApiAssignment>('/assignments', {
    method: 'POST',
    body: {
      lessonId: data.lessonId,
      ...contentBody(data),
      ...(data.dueDate
        ? { dueDate: new Date(data.dueDate).toISOString() }
        : {}),
    },
  });
}

/** Edição do professor. `dueDate: null` tira o prazo. */
export function updateAssignmentRequest(assignmentId: string, data: Updates) {
  const dueDate =
    data.dueDate === null || data.dueDate === ''
      ? { dueDate: null }
      : data.dueDate
        ? { dueDate: new Date(data.dueDate).toISOString() }
        : {};

  return apiFetch<ApiAssignment>(`/assignments/${assignmentId}`, {
    method: 'PATCH',
    body: { ...contentBody(data), ...dueDate },
  });
}

export function deleteAssignmentRequest(assignmentId: string) {
  return apiFetch<void>(`/assignments/${assignmentId}`, { method: 'DELETE' });
}

/**
 * Vídeo do aluno para a tarefa: a API assina, o navegador envia direto ao
 * armazenamento (um vídeo grande não atravessa a API), a API confirma o
 * arquivo e a entrega entra na tarefa. O histórico de envios é mantido — o
 * legado substituía o vídeo anterior.
 */
export async function submitAssignmentVideo(
  assignmentId: string,
  file: File,
  note?: string
) {
  const signed = await apiFetch<{
    assetId: string;
    uploadUrl: string;
    fields: Record<string, string | number>;
  }>('/uploads/signed', {
    method: 'POST',
    body: { kind: 'ASSIGNMENT_VIDEO', scopeId: assignmentId },
  });

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) {
    form.append(key, String(value));
  }
  form.append('file', file);

  const upload = await fetch(signed.uploadUrl, { method: 'POST', body: form });

  if (!upload.ok) {
    throw new ApiError(upload.status, 'Não foi possível enviar o vídeo', null);
  }

  await apiFetch(`/uploads/${signed.assetId}/confirm`, { method: 'POST' });

  return apiFetch<ApiAssignment>(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: {
      kind: 'video',
      assetId: signed.assetId,
      ...(note?.trim() ? { note: note.trim() } : {}),
    },
  });
}
