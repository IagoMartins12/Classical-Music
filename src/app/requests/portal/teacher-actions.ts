// app/requests/portal/teacher-actions.ts — ações do calendário do professor pela API (Etapa 4)
//
// Usadas no navegador (vão pela sessão); mesmo contrato das funções que
// moravam em `teacher-request.ts` e chamavam `/api/teacher/calendar`.
import { apiFetch } from '@/app/libs/api/client';
import type {
  CalendarConflict,
  CalendarEvent,
  CalendarStats,
} from '../../(teacher)/teacher/calendar/pageServer';
import { loadTeacherCalendar, studentProfileId } from './teacher';

function failure(error: unknown, fallback: string) {
  return {
    success: false as const,
    error: error instanceof Error && error.message ? error.message : fallback,
  };
}

export async function getTeacherCalendarAPI(
  startDate: Date,
  endDate: Date,
  _view: string = 'month',
  includeStats: boolean = false,
  detectConflicts: boolean = false
): Promise<{
  events: CalendarEvent[];
  stats?: CalendarStats;
  conflicts?: CalendarConflict[];
  hasConflicts?: boolean;
} | null> {
  try {
    return await loadTeacherCalendar(
      startDate,
      endDate,
      includeStats,
      detectConflicts
    );
  } catch (error) {
    console.error('Erro ao buscar calendário do professor:', error);
    return null;
  }
}

/**
 * Aula avulsa a partir do calendário. A criação devolve só id, título e data;
 * o evento completo (cores, aluno) vem de uma leitura do calendário na janela
 * da aula.
 */
export async function createQuickLessonAPI(data: {
  studentUserId: string;
  title: string;
  start: string;
  duration?: number;
  location?: string;
  objectives?: string[];
}): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> {
  try {
    const studentId = await studentProfileId(data.studentUserId);

    if (!studentId) {
      return { success: false, error: 'Aluno não está entre os seus vínculos' };
    }

    const created = await apiFetch<{
      lessons: Array<{ id: string; scheduledAt: string; title: string }>;
    }>('/lessons', {
      method: 'POST',
      body: {
        studentId,
        title: data.title,
        scheduledAt: new Date(data.start).toISOString(),
        ...(data.duration ? { duration: data.duration } : {}),
        ...(data.location ? { location: data.location } : {}),
        ...(data.objectives?.length ? { objectives: data.objectives } : {}),
      },
    });

    const lesson = created.lessons[0];

    if (!lesson) {
      return { success: true };
    }

    const start = new Date(lesson.scheduledAt);
    const end = new Date(start.getTime() + (data.duration ?? 60) * 60_000);
    const { events } = await loadTeacherCalendar(start, end);

    return {
      success: true,
      event: events.find((event) => event.id === lesson.id),
    };
  } catch (error) {
    return failure(error, 'Erro ao criar aula');
  }
}

export async function moveLessonAPI(
  lessonId: string,
  newStart: string,
  newDuration?: number
): Promise<{ success: boolean; lesson?: any; error?: string }> {
  try {
    const lesson = await apiFetch(`/lessons/${lessonId}/reschedule`, {
      method: 'PATCH',
      body: {
        scheduledAt: new Date(newStart).toISOString(),
        ...(newDuration ? { duration: newDuration } : {}),
      },
    });

    return { success: true, lesson };
  } catch (error) {
    return failure(error, 'Erro ao mover aula');
  }
}
