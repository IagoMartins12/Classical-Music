// app/requests/portal/lesson-actions.ts — ações sobre aulas pela API (Etapa 4)
//
// O legado mudava qualquer campo da aula num PATCH genérico, inclusive o
// status. A API separa: editar (só aula agendada), remarcar, cancelar e
// concluir (onde entram presença, resumo e avaliação). Aula não é apagada — o
// histórico do aluno depende dela; "apagar" vira cancelar.
import { apiFetch } from '@/app/libs/api/client';
import { loadTeacherCalendar, studentProfileId } from './teacher';

type Fields = Record<string, any>;

function present(data: Fields, keys: readonly string[]): Fields {
  return Object.fromEntries(
    keys
      .filter((key) => data[key] !== undefined && data[key] !== null)
      .map((key) => [key, data[key]])
  );
}

const iso = (value: string | Date) => new Date(value).toISOString();

/** Campos que a edição aceita (`PATCH /lessons/:id`). */
const EDITABLE_FIELDS = [
  'title',
  'description',
  'duration',
  'type',
  'location',
  'objectives',
  'worksIds',
  'workScoreIds',
  'topics',
  'techniques',
  'repertoire',
  'homework',
  'practiceGoals',
  'teacherNotes',
  'publicNotes',
] as const;

/** O que só entra ao concluir a aula. */
const COMPLETION_FIELDS = [
  'studentPresent',
  'lessonSummary',
  'homework',
  'teacherNotes',
  'publicNotes',
] as const;

/** Campos do legado que a API não guarda mais ou só guarda ao concluir. */
const COMPLETION_ONLY = [
  'lessonSummary',
  'skillsWorked',
  'improvements',
  'challenges',
  'studentProgress',
  'punctuality',
] as const;

/** Nota de 1 a 5; o 0 da tela quer dizer "sem nota". */
function ratings(data: Fields): Fields {
  return Object.fromEntries(
    (['engagement', 'preparation'] as const)
      .filter((key) => typeof data[key] === 'number' && data[key] >= 1)
      .map((key) => [key, data[key]])
  );
}

export interface CreatedLessons {
  lessons: Array<{ id: string; scheduledAt: string; title: string }>;
  created: number;
  acceptedConflicts: unknown[];
}

/**
 * Cria a aula (ou a série). O legado identificava o aluno pelo id de usuário;
 * a API, pelo perfil. Conflito de horário volta 409 com as sugestões — o
 * `force` aceita o conflito.
 */
export async function createLessonRequest(
  data: Fields
): Promise<CreatedLessons> {
  const studentId = await studentProfileId(
    data.studentUserId ?? data.studentId
  );

  if (!studentId) {
    throw new Error('Aluno não está entre os seus vínculos');
  }

  const recurring =
    data.isRecurring && data.recurrenceType && data.recurrenceType !== 'NONE';

  return apiFetch<CreatedLessons>('/lessons', {
    method: 'POST',
    body: {
      studentId,
      title: data.title,
      scheduledAt: iso(data.scheduledAt),
      ...present(
        data,
        EDITABLE_FIELDS.filter((key) => key !== 'title')
      ),
      ...(recurring
        ? {
            isRecurring: true,
            recurrenceType: data.recurrenceType,
            ...(data.recurrenceEnd
              ? { recurrenceEnd: iso(data.recurrenceEnd) }
              : {}),
          }
        : {}),
      // A tela de criação chama de `forceCreate` o "criar mesmo com conflito".
      ...(data.force || data.forceCreate ? { force: true } : {}),
    },
  });
}

/**
 * Pré-checagem da tela de criação: choque de horário com qualquer aula
 * agendada e limite semanal do aluno, pela agenda da semana (domingo a
 * sábado). É só aviso — a API confere de novo ao criar e responde 409.
 */
export async function checkLessonConflicts(input: {
  studentUserId: string;
  studentName: string;
  scheduledAt: string;
  duration: number;
  maxLessonsPerWeek: number;
}) {
  const start = new Date(input.scheduledAt);
  const end = new Date(start.getTime() + input.duration * 60_000);

  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() - start.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const { events } = await loadTeacherCalendar(weekStart, weekEnd);
  const scheduled = events.filter((event) => event.status === 'SCHEDULED');

  const timeConflicts = scheduled
    .filter((event) => event.start < end && event.end > start)
    .map((event) => ({
      id: event.id,
      title: event.title,
      scheduledAt: event.start,
      duration: Math.round(
        (event.end.getTime() - event.start.getTime()) / 60_000
      ),
      studentName: event.student?.name ?? '',
      studentEmail: '',
    }));

  const studentWeek = scheduled.filter(
    (event) => event.student?.id === input.studentUserId
  );
  const exceeded = studentWeek.length >= input.maxLessonsPerWeek;

  return {
    hasTimeConflicts: timeConflicts.length > 0,
    hasWeeklyLimitExceeded: exceeded,
    timeConflicts,
    weeklyLimitWarning: exceeded
      ? {
          currentLessons: studentWeek.length,
          maxLessonsPerWeek: input.maxLessonsPerWeek,
          studentName: input.studentName,
          weekStart,
          weekEnd: new Date(weekEnd.getTime() - 1),
          upcomingLessons: studentWeek.map((event) => ({
            id: event.id,
            title: event.title,
            scheduledAt: event.start,
          })),
        }
      : null,
    warnings: [] as string[],
  };
}

export function rescheduleLessonRequest(
  lessonId: string,
  scheduledAt: string | Date,
  duration?: number,
  reason?: string
) {
  return apiFetch<Fields>(`/lessons/${lessonId}/reschedule`, {
    method: 'PATCH',
    body: {
      scheduledAt: iso(scheduledAt),
      ...(duration ? { duration } : {}),
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  });
}

export function cancelLessonRequest(
  lessonId: string,
  reason?: string,
  cancelSeries?: boolean
) {
  return apiFetch<Fields>(`/lessons/${lessonId}/cancel`, {
    method: 'PATCH',
    body: {
      reason: reason?.trim() || 'Cancelada pelo professor',
      ...(cancelSeries ? { cancelSeries: true } : {}),
    },
  });
}

/** Conclusão: presença (falta vira NO_SHOW), resumo e avaliação. */
export function completeLessonRequest(lessonId: string, data: Fields = {}) {
  return apiFetch<Fields>(`/lessons/${lessonId}/complete`, {
    method: 'PATCH',
    body: { ...present(data, COMPLETION_FIELDS), ...ratings(data) },
  });
}

/**
 * Traduz a atualização do legado para a rota certa:
 * - status `CANCELLED` → cancelar;
 * - status `COMPLETED`/`NO_SHOW`, ou presença informada → concluir;
 * - `scheduledAt` → remarcar;
 * - o resto → editar (só aula agendada).
 */
export async function updateLessonRequest(lessonId: string, updates: Fields) {
  const status = updates.status;

  if (status === 'CANCELLED') {
    return cancelLessonRequest(lessonId, updates.cancelReason);
  }

  if (
    status === 'COMPLETED' ||
    status === 'NO_SHOW' ||
    typeof updates.studentPresent === 'boolean'
  ) {
    return completeLessonRequest(lessonId, {
      ...updates,
      studentPresent:
        status === 'NO_SHOW' ? false : (updates.studentPresent ?? true),
    });
  }

  if (status === 'SCHEDULED') {
    throw new Error(
      'Aula encerrada não volta para "agendada"; para outra data, crie ou remarque a aula.'
    );
  }

  let rescheduled: Fields | null = null;

  if (updates.scheduledAt) {
    rescheduled = await rescheduleLessonRequest(
      lessonId,
      updates.scheduledAt,
      updates.duration,
      updates.rescheduleReason
    );
  }

  const body = present(
    updates,
    EDITABLE_FIELDS.filter((key) => !(rescheduled && key === 'duration'))
  );

  if (Object.keys(body).length > 0) {
    return apiFetch<Fields>(`/lessons/${lessonId}`, { method: 'PATCH', body });
  }

  if (rescheduled) {
    return rescheduled;
  }

  if (COMPLETION_ONLY.some((key) => updates[key] !== undefined)) {
    throw new Error(
      'Resumo e avaliação da aula são registrados ao concluí-la.'
    );
  }

  throw new Error('Nada a atualizar nesta aula');
}

/**
 * O aluno avisa o professor que vai faltar, ou pede para remarcar.
 *
 * A tela mandava isso para `PATCH /api/lessons/:id` do legado com
 * `messageType`. Na API é uma rota própria: o `PATCH /lessons/:id` é só do
 * professor, e este aviso não altera a aula — vira notificação para ele.
 */
export function sendStudentLessonNotice(
  lessonId: string,
  type: 'absence' | 'reschedule',
  message?: string
) {
  return apiFetch<{ success: boolean }>(`/lessons/${lessonId}/student-notice`, {
    method: 'POST',
    body: { type, ...(message ? { message } : {}) },
  });
}
