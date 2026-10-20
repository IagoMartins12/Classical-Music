// hooks/portal/query.ts — estado de servidor do portal (04/10/2026)
//
// O mesmo arranjo do painel administrativo (`hooks/admin/query.ts`): o
// TanStack Query guarda por chave, deduplica e revalida; cada escrita
// invalida só a área que mexeu. O portal antigo buscava tudo no servidor a
// cada navegação (e mais uma vez no cliente) — a troca de tela era lenta
// mesmo com o dado já em mãos.
'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ApiError } from '@/app/libs/api/client';
import * as api from '@/app/requests/portal/api';
import type { Role } from '@/app/requests/portal/api';

/** Chaves por área; `['portal']` invalida tudo. */
export const portalKeys = {
  all: ['portal'] as const,
  dashboard: (role: Role) => ['portal', 'dashboard', role] as const,
  lessons: (query?: api.LessonListQuery) =>
    ['portal', 'lessons', query ?? {}] as const,
  lesson: (id: string) => ['portal', 'lesson', id] as const,
  calendar: (query: object) => ['portal', 'calendar', query] as const,
  availability: ['portal', 'availability'] as const,
  settings: ['portal', 'settings'] as const,
  requests: (role: Role) => ['portal', 'requests', role] as const,
  practice: (query: object) => ['portal', 'practice', query] as const,
  notifications: (query: object) => ['portal', 'notifications', query] as const,
  unread: ['portal', 'unread'] as const,
  preferences: ['portal', 'preferences'] as const,
  repertoire: (studentId?: string) =>
    ['portal', 'repertoire', studentId ?? 'me'] as const,
  assignment: (id: string) => ['portal', 'assignment', id] as const,
  feed: ['portal', 'calendar-feed'] as const,
  freeSlots: (teacherUserId: string, query: object) =>
    ['portal', 'free-slots', teacherUserId, query] as const,
  assignments: (query: object) => ['portal', 'assignments', query] as const,
  students: (query: object) => ['portal', 'students', query] as const,
  student: (id: string) => ['portal', 'student', id] as const,
  reports: (query: object) => ['portal', 'reports', query] as const,
  report: (id: string) => ['portal', 'report', id] as const,
  comments: (id: string) => ['portal', 'report-comments', id] as const,
  profile: ['portal', 'profile'] as const,
  classes: ['portal', 'classes'] as const,
};

/** A mensagem que a API escreveu, ou uma frase honesta quando não há. */
export function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body as { message?: unknown } | undefined;
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message;
    if (typeof message === 'string' && message) return message;
    if (error.status === 403) return 'Você não tem acesso a isto.';
    if (error.status === 404) return 'Não encontrado. Pode ter sido removido.';
    return error.message;
  }
  // Erro escrito pelo próprio front (ex.: o envio ao armazenamento); o
  // `TypeError` é o `fetch` sem rede.
  if (error instanceof Error && !(error instanceof TypeError) && error.message)
    return error.message;
  return 'Não foi possível falar com o servidor. Confira a conexão e tente de novo.';
}

const STALE = 30_000;

export const useTeacherDashboard = (enabled = true) =>
  useQuery({
    queryKey: portalKeys.dashboard('teacher'),
    queryFn: api.getTeacherDashboard,
    staleTime: STALE,
    enabled,
  });

export const useStudentDashboard = (enabled = true) =>
  useQuery({
    queryKey: portalKeys.dashboard('student'),
    queryFn: api.getStudentDashboard,
    staleTime: STALE,
    enabled,
  });

export const useLessons = (query: api.LessonListQuery, enabled = true) =>
  useQuery({
    queryKey: portalKeys.lessons(query),
    queryFn: () => api.listLessons(query),
    staleTime: STALE,
    enabled,
    placeholderData: keepPreviousData,
  });

export const useLesson = (id: string | null | undefined) =>
  useQuery({
    queryKey: portalKeys.lesson(id ?? ''),
    queryFn: () => api.getLesson(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });

export const useCalendar = (query: {
  as: Role;
  from: string;
  to: string;
  freeSlots?: boolean;
}) =>
  useQuery({
    queryKey: portalKeys.calendar(query),
    queryFn: () => api.getCalendar(query),
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });

export const useAvailability = (enabled = true) =>
  useQuery({
    queryKey: portalKeys.availability,
    queryFn: api.getAvailability,
    enabled,
    staleTime: 5 * 60_000,
  });

export const useSchedulingSettings = (enabled = true) =>
  useQuery({
    queryKey: portalKeys.settings,
    queryFn: api.getSchedulingSettings,
    enabled,
    staleTime: 5 * 60_000,
  });

export const useLessonRequests = (role: Role) =>
  useQuery({
    queryKey: portalKeys.requests(role),
    queryFn: () => api.listLessonRequests({ as: role, status: 'PENDING' }),
    staleTime: STALE,
  });

export const usePractice = (
  query: { from?: string; to?: string; studentId?: string },
  enabled = true
) =>
  useQuery({
    queryKey: portalKeys.practice(query),
    queryFn: () => api.getPractice(query),
    enabled,
    staleTime: STALE,
  });

/** O número do sino: a cada minuto e quando a aba volta ao foco. */
export const useUnreadCount = () =>
  useQuery({
    queryKey: portalKeys.unread,
    queryFn: api.unreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

export const useNotifications = (
  query: { page?: number; limit?: number; status?: string },
  enabled = true
) =>
  useQuery({
    queryKey: portalKeys.notifications(query),
    queryFn: () => api.listNotifications(query),
    enabled,
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });

export const useRepertoire = (studentId?: string, enabled = true) =>
  useQuery({
    queryKey: portalKeys.repertoire(studentId),
    queryFn: () =>
      studentId ? api.getStudentRepertoire(studentId) : api.getMyRepertoire(),
    enabled,
    staleTime: STALE,
  });

export const useAssignment = (id: string | null | undefined) =>
  useQuery({
    queryKey: portalKeys.assignment(id ?? ''),
    queryFn: () => api.getAssignment(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });

export const useCalendarFeed = (enabled = true) =>
  useQuery({
    queryKey: portalKeys.feed,
    queryFn: api.getCalendarFeed,
    enabled,
    staleTime: 5 * 60_000,
  });

export const useTeacherFreeSlots = (
  teacherUserId: string | null | undefined,
  query: { from: string; to: string; minMinutes?: number }
) =>
  useQuery({
    queryKey: portalKeys.freeSlots(teacherUserId ?? '', query),
    queryFn: () => api.getTeacherFreeSlots(teacherUserId as string, query),
    enabled: Boolean(teacherUserId),
    staleTime: STALE,
  });

export const useAssignments = (
  query: api.AssignmentListQuery,
  enabled = true
) =>
  useQuery({
    queryKey: portalKeys.assignments(query),
    queryFn: () => api.listAssignments(query),
    enabled,
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });

export const useStudents = (
  query: Parameters<typeof api.listStudents>[0],
  enabled = true
) =>
  useQuery({
    queryKey: portalKeys.students(query),
    queryFn: () => api.listStudents(query),
    enabled,
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });

export const useStudent = (id: string | null | undefined) =>
  useQuery({
    queryKey: portalKeys.student(id ?? ''),
    queryFn: () => api.getStudent(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });

export const useReports = (
  query: Parameters<typeof api.listReports>[0],
  enabled = true
) =>
  useQuery({
    queryKey: portalKeys.reports(query),
    queryFn: () => api.listReports(query),
    enabled,
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });

export const useReport = (id: string | null | undefined) =>
  useQuery({
    queryKey: portalKeys.report(id ?? ''),
    queryFn: () => api.getReport(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });

export const useReportComments = (id: string, enabled = true) =>
  useQuery({
    queryKey: portalKeys.comments(id),
    queryFn: () => api.listReportComments(id),
    enabled,
    staleTime: STALE,
  });

export const usePortalProfile = () =>
  useQuery({
    queryKey: portalKeys.profile,
    queryFn: api.getPortalProfile,
    staleTime: 5 * 60_000,
  });

export const useNotificationPreferences = () =>
  useQuery({
    queryKey: portalKeys.preferences,
    queryFn: api.getNotificationPreferences,
    staleTime: 5 * 60_000,
  });

export const useMyClasses = (enabled = true) =>
  useQuery({
    queryKey: portalKeys.classes,
    queryFn: api.getMyClasses,
    enabled,
    staleTime: STALE,
  });

/**
 * Escrita do portal: chama, avisa e invalida.
 *
 * `invalidate` são as áreas que a escrita mexeu; por padrão, o portal todo
 * (barato: só as consultas que estão na tela buscam de novo). O aviso de
 * sucesso é opcional e o de erro sempre aparece, com a frase da API.
 */
export function usePortalMutation<TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  options: {
    success?: string | ((result: TResult, vars: TVars) => string | null);
    invalidate?: QueryKey[];
    onSuccess?: (result: TResult, vars: TVars) => void;
    /** Erro tratado pela tela (ex.: 409 do conflito de agenda). */
    onError?: (error: unknown, vars: TVars) => boolean | void;
  } = {}
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result, vars) => {
      await Promise.all(
        (options.invalidate ?? [portalKeys.all]).map((queryKey) =>
          client.invalidateQueries({ queryKey })
        )
      );
      const text =
        typeof options.success === 'function'
          ? options.success(result, vars)
          : options.success;
      if (text) toast.success(text);
      options.onSuccess?.(result, vars);
    },
    onError: (error, vars) => {
      if (options.onError?.(error, vars) === true) return;
      toast.error(errorText(error));
    },
  });
}
