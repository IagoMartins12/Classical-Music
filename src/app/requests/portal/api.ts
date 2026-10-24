// app/requests/portal/api.ts — o portal novo fala com a API sem adaptador (04/10/2026)
//
// Os módulos antigos de `requests/portal/*` traduziam a resposta da API para
// os formatos das telas do legado (e no caminho perdiam campos — o painel do
// professor jogava fora a semana, os alunos e as entregas esperando retorno).
// Aqui os tipos espelham a resposta da API e as telas leem direto.
import { apiFetch, apiUrl, refreshSession } from '@/app/libs/api/client';
import type { RecommendedWork } from '@/app/requests/recommendations';

type Query = Record<string, string | number | boolean | null | undefined>;

const get = <T>(path: string, query?: Query) =>
  apiFetch<T>(path, { query, cache: 'no-store' });
const send = <T>(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
) => apiFetch<T>(path, { method, body, cache: 'no-store' });

export type Role = 'teacher' | 'student';
export type LessonStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';
export type Severity = 'blocking' | 'conflict' | 'warning' | 'ok';

export interface PersonSummary {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  level?: string | null;
}

interface ApiPerson {
  id: string;
  userId: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
}

export const nameOf = (
  p?: {
    user?: { firstName?: string | null; lastName?: string | null } | null;
  } | null
) => [p?.user?.firstName, p?.user?.lastName].filter(Boolean).join(' ').trim();

export const summaryOf = (p: ApiPerson): PersonSummary => ({
  id: p.id,
  userId: p.userId,
  name: nameOf(p),
  image: p.user.image,
});

export interface WorkRef {
  id: string;
  title: string;
  composer: { id: string; name: string; fullName?: string | null } | null;
}

export interface ComposerRef {
  id: string;
  name: string;
  birthDate?: string | null;
  deathDate?: string | null;
  epochName?: string | null;
}

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------

export interface LessonCard {
  id: string;
  title: string;
  scheduledAt: string;
  endsAt: string;
  duration: number;
  status: LessonStatus;
  location: string | null;
  objectives: string[];
  homework: string | null;
  publicNotes: string | null;
  counterpart: PersonSummary;
}

export interface AttentionSignal {
  kind: 'practice' | 'overdue' | 'invite' | 'report';
  studentId: string;
  studentName: string;
  relationshipId?: string;
  minutes?: number;
  goalMinutes?: number;
  count?: number;
  since?: string | null;
}

export interface TeacherDashboard {
  role: 'teacher';
  generatedAt: string;
  onboardedAt: string | null;
  stats: {
    totalStudents: number;
    studentsWithRecentLessons: number;
    lessonsThisWeek: number;
    lessonsThisMonth: number;
    totalLessons: number;
    completedLessons: number;
    cancelledLessons: number;
    noShowLessons: number;
    completionRate: number | null;
    avgLessonsPerWeek: number | null;
    assignmentsPending: number;
    assignmentsOverdue: number;
    assignmentsAwaitingFeedback: number;
  };
  todayLessons: LessonCard[];
  upcomingLessons: LessonCard[];
  weeklySchedule: Array<{
    date: string;
    localDate: string;
    weekday: number;
    freeMinutes: number | null;
    lessons: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      duration: number;
      status: LessonStatus;
      studentName: string;
      studentId: string;
    }>;
  }>;
  students: Array<{
    studentId: string;
    userId: string;
    name: string;
    image: string | null;
    level: string | null;
    mainInstrument: string | null;
    relationshipStart: string;
    nextLessonAt: string | null;
    lastLessonAt: string | null;
    totalLessons: number;
    practiceMinutes7d: number;
    practiceGoalMinutes: number | null;
  }>;
  assignmentsAwaitingFeedback: Array<{
    id: string;
    title: string;
    assignmentType: string;
    priority: string;
    completedAt: string | null;
    student: PersonSummary;
  }>;
  pendingOutcome: LessonCard[];
  lessonRequests: LessonRequestCard[];
  /** Convites enviados que o aluno ainda não aceitou (não ocupam vaga). */
  pendingInvites: Array<{
    relationshipId: string;
    studentId: string;
    name: string;
    image: string | null;
    sentAt: string;
  }>;
  repertoire: Array<{
    workId: string;
    title: string;
    composer: { id: string; name: string } | null;
    students: string[];
  }>;
  attention: AttentionSignal[];
  freeMinutesThisWeek: number | null;
  /** `maxStudents: null` é ilimitado; vaga é vínculo aceito. */
  plan: {
    name: 'FREE' | 'PLUS' | 'MENTOR' | 'MAESTRO';
    maxStudents: number | null;
    activeStudents: number;
  };
}

export interface LessonRequestCard {
  id: string;
  scheduledAt: string;
  duration: number;
  note: string | null;
  createdAt?: string;
  student?: PersonSummary;
  teacher?: PersonSummary;
}

export interface StudentDashboard {
  role: 'student';
  generatedAt: string;
  onboardedAt: string | null;
  stats: {
    totalLessons: number;
    completedLessons: number;
    upcomingLessons: number;
    missedLessons: number;
    cancelledLessons: number;
    studyMinutes: number;
    attendanceRate: number | null;
    currentStreak: number;
    longestStreak: number;
    pendingAssignments: number;
    overdueAssignments: number;
  };
  todayLessons: LessonCard[];
  upcomingLessons: LessonCard[];
  recentLessons: Array<
    LessonCard & {
      lessonSummary: string | null;
      nextLessonPrep: string | null;
      skillsWorked: string[];
      canGiveFeedback: boolean;
    }
  >;
  assignmentsDueSoon: AssignmentCard[];
  overdueAssignments: AssignmentCard[];
  teachers: Array<{
    teacherId: string;
    userId: string;
    name: string;
    image: string | null;
    specialties: string[];
    instruments: string[];
    relationshipStart: string;
    nextLessonAt: string | null;
    totalLessons: number;
  }>;
  practice: PracticeSummary;
  lessonRequests: LessonRequestCard[];
}

export interface AssignmentCard {
  id: string;
  title: string;
  type: string;
  assignmentType: string;
  priority: string;
  dueDate: string | null;
  status: string;
  progress: number | null;
}

export interface PracticeSummary {
  weeklyGoalMinutes: number | null;
  totalMinutes: number;
  days: Array<{ date: string; minutes: number }>;
  subjects: Array<{ subject: string; minutes: number }>;
}

export const getTeacherDashboard = () =>
  get<TeacherDashboard>('/dashboard', { as: 'teacher' });
export const getStudentDashboard = () =>
  get<StudentDashboard>('/dashboard', { as: 'student' });
export const finishOnboarding = (role: Role) =>
  send<{ role: Role; onboardedAt: string }>('POST', '/dashboard/onboarding', {
    role,
  });

// ---------------------------------------------------------------------------
// Aulas
// ---------------------------------------------------------------------------

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  status: LessonStatus;
  type: string;
  location: string | null;
  objectives: string[];
  worksIds: string[];
  composerIds: string[];
  workScoreIds: string[];
  topics: string[];
  techniques: string[];
  repertoire: string[];
  homework: string | null;
  practiceGoals: string[];
  publicNotes: string | null;
  lessonSummary: string | null;
  nextLessonPrep: string | null;
  skillsWorked: string[];
  punctuality: string | null;
  studentFeedback: string | null;
  studentPresent: boolean | null;
  isRecurring: boolean;
  recurrenceType: string;
  parentLessonId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  teacherNotes?: string | null;
  engagement?: number | null;
  preparation?: number | null;
  teacher: ApiPerson;
  student: ApiPerson;
  works?: WorkRef[];
  composers?: ComposerRef[];
  workScores?: Array<{
    id: string;
    title: string;
    type: string;
    source: string;
    downloadUrl: string | null;
    work: WorkRef;
  }>;
}

export interface Paginated<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  items: T[];
}

export interface LessonListQuery {
  as?: Role;
  status?: LessonStatus;
  studentId?: string;
  /** Só para o aluno: as aulas com um professor (Teacher.id). */
  teacherId?: string;
  from?: string;
  to?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  pendingOutcome?: boolean;
  q?: string;
}

export const listLessons = async (query: LessonListQuery) => {
  const r = await get<{
    lessons: Lesson[];
    pagination: Paginated<Lesson>['pagination'];
  }>('/lessons', query as Query);
  return { items: r.lessons, pagination: r.pagination };
};
export const getLesson = (id: string) => get<Lesson>(`/lessons/${id}`);

export interface Finding {
  code: string;
  severity: Exclude<Severity, 'ok'>;
  message: string;
  lessonId?: string;
}

export interface ScheduleCheck {
  severity: Severity;
  occurrences: Array<{
    scheduledAt: string;
    severity: Severity;
    findings: Finding[];
    suggestions: string[];
  }>;
  summary: { blocking: number; conflicts: number; warnings: number };
}

export interface LessonDraft {
  studentId: string;
  title: string;
  scheduledAt: string;
  duration?: number;
  location?: string;
  description?: string;
  objectives?: string[];
  topics?: string[];
  techniques?: string[];
  worksIds?: string[];
  composerIds?: string[];
  workScoreIds?: string[];
  repertoire?: string[];
  homework?: string;
  publicNotes?: string;
  teacherNotes?: string;
  isRecurring?: boolean;
  recurrenceType?: 'WEEKLY' | 'BIWEEKLY' | 'NONE';
  recurrenceEnd?: string;
  skipOccurrences?: string[];
  moveOccurrences?: Array<{ from: string; to: string }>;
  force?: boolean;
}

export const checkLesson = (
  draft: Pick<
    LessonDraft,
    | 'studentId'
    | 'scheduledAt'
    | 'duration'
    | 'location'
    | 'isRecurring'
    | 'recurrenceType'
    | 'recurrenceEnd'
  > & { excludeLessonId?: string }
) => send<ScheduleCheck>('POST', '/lessons/check', draft);
export const createLesson = (draft: LessonDraft) =>
  send<{
    lessons: Array<{ id: string; scheduledAt: string; title: string }>;
    created: number;
    warnings: unknown[];
  }>('POST', '/lessons', draft);
/** Edita o conteúdo da aula (data e hora são pelo `rescheduleLesson`). */
export const updateLesson = (
  id: string,
  body: Partial<
    Pick<
      LessonDraft,
      | 'title'
      | 'location'
      | 'description'
      | 'objectives'
      | 'topics'
      | 'techniques'
      | 'worksIds'
      | 'composerIds'
      | 'workScoreIds'
      | 'homework'
      | 'publicNotes'
      | 'teacherNotes'
    >
  >
) => send<Lesson>('PATCH', `/lessons/${id}`, body);
export const rescheduleLesson = (
  id: string,
  body: {
    scheduledAt: string;
    duration?: number;
    reason?: string;
    force?: boolean;
  }
) => send<Lesson>('PATCH', `/lessons/${id}/reschedule`, body);
export const cancelLesson = (
  id: string,
  body: { reason: string; cancelSeries?: boolean }
) => send<unknown>('PATCH', `/lessons/${id}/cancel`, body);
export const completeLesson = (
  id: string,
  body: {
    studentPresent?: boolean;
    punctuality?: 'on_time' | 'late' | 'early';
    engagement?: number;
    preparation?: number;
    skillsWorked?: string[];
    /** Nota 1–5 por habilidade da lista fixa (`SKILLS`). */
    skillRatings?: Partial<Record<Skill, number>>;
    lessonSummary?: string;
    nextLessonPrep?: string;
    teacherNotes?: string;
    publicNotes?: string;
    homework?: string;
  }
) => send<Lesson>('PATCH', `/lessons/${id}/complete`, body);
export const giveLessonFeedback = (id: string, feedback: string) =>
  send<unknown>('PATCH', `/lessons/${id}/feedback`, { feedback });
export const sendStudentNotice = (
  id: string,
  body: { type: 'absence' | 'reschedule'; message?: string }
) => send<{ success: true }>('POST', `/lessons/${id}/student-notice`, body);

// ---------------------------------------------------------------------------
// Calendário, agenda e sincronização
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  id: string;
  type: 'lesson' | 'assignment_due';
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status: string;
  counterpart: PersonSummary;
  location: string | null;
  description: string | null;
  lesson?: {
    duration: number;
    objectives: string[];
    isRecurring: boolean;
    lessonSummary: string | null;
    canGiveFeedback: boolean;
  };
  assignment?: {
    priority: string;
    assignmentType: string;
    isCompleted: boolean;
    isOverdue: boolean;
    progress: number | null;
    lessonId: string;
  };
}

export interface CalendarResponse {
  period: { from: string; to: string; role: Role };
  events: CalendarEvent[];
  needsAttention: CalendarEvent[];
  freeSlots?: Array<{ start: string; end: string }>;
  stats?: { freeHours?: number | null };
}

export const getCalendar = (query: {
  as?: Role;
  from: string;
  to: string;
  freeSlots?: boolean;
  stats?: boolean;
}) => get<CalendarResponse>('/calendar', query);

export interface Availability {
  timezone: string;
  slots: Array<{ weekday: number; startTime: string; endTime: string }>;
  blocks: Array<{
    id: string;
    startsAt: string;
    endsAt: string;
    reason: string | null;
  }>;
}
export const getAvailability = () => get<Availability>('/availability');
export const replaceAvailability = (body: {
  timezone?: string;
  slots: Availability['slots'];
}) => send<Availability>('PUT', '/availability', body);
export const addAvailabilityBlock = (body: {
  startsAt: string;
  endsAt: string;
  reason?: string;
}) => send<unknown>('POST', '/availability/blocks', body);
export const removeAvailabilityBlock = (id: string) =>
  send<void>('DELETE', `/availability/blocks/${id}`);

export interface SchedulingSettings {
  timezone: string;
  defaultLessonDuration: number;
  bufferMinutes: number;
  travelMinutes: number;
  maxLessonsPerDay: number | null;
  maxLessonsPerWeek: number | null;
  acceptsLessonRequests: boolean;
  requestLeadHours: number;
  requestHorizonDays: number;
  lessonReminderMinutes: number[];
  portalOnboardedAt: string | null;
}
export const getSchedulingSettings = () =>
  get<SchedulingSettings>('/availability/settings');
export const updateSchedulingSettings = (
  body: Partial<Omit<SchedulingSettings, 'timezone' | 'portalOnboardedAt'>>
) => send<SchedulingSettings>('PATCH', '/availability/settings', body);

export interface TeacherFreeSlots {
  timezone: string;
  period: { from: string; to: string };
  /** `null` sem agenda declarada: "não sei" não é "zero". */
  freeHours: number | null;
  slots: Array<{ start: string; end: string }>;
  /** Regras de pedido do professor (o aluno só vê o que dá para pedir). */
  requests: { accepts: boolean; leadHours: number; horizonDays: number };
}
export const getTeacherFreeSlots = (
  teacherUserId: string,
  query: { from: string; to: string; minMinutes?: number }
) =>
  get<TeacherFreeSlots>(
    `/availability/teachers/${teacherUserId}/free-slots`,
    query
  );

export const getCalendarFeed = () =>
  get<{ active: boolean; createdAt: string | null; lastUsedAt: string | null }>(
    '/calendar/feed'
  );
export const rotateCalendarFeed = () =>
  send<{ token: string; path: string; createdAt: string }>(
    'POST',
    '/calendar/feed'
  );
export const revokeCalendarFeed = () => send<void>('DELETE', '/calendar/feed');

// ---------------------------------------------------------------------------
// Pedidos de aula
// ---------------------------------------------------------------------------

export interface LessonRequest {
  id: string;
  scheduledAt: string;
  duration: number;
  note: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  lessonId: string | null;
  answer: string | null;
  respondedAt: string | null;
  createdAt: string;
  teacher: ApiPerson;
  student: ApiPerson;
}
export const listLessonRequests = (
  query: { as?: Role; status?: LessonRequest['status'] } = {}
) => get<LessonRequest[]>('/lesson-requests', query);
export const createLessonRequest = (body: {
  teacherId: string;
  scheduledAt: string;
  duration?: number;
  note?: string;
}) => send<LessonRequest>('POST', '/lesson-requests', body);
export const acceptLessonRequest = (
  id: string,
  body: { title?: string; location?: string; force?: boolean } = {}
) => send<unknown>('PATCH', `/lesson-requests/${id}/accept`, body);
export const declineLessonRequest = (id: string, answer?: string) =>
  send<LessonRequest>('PATCH', `/lesson-requests/${id}/decline`, { answer });
export const cancelLessonRequest = (id: string) =>
  send<void>('PATCH', `/lesson-requests/${id}/cancel`);

// ---------------------------------------------------------------------------
// Prática
// ---------------------------------------------------------------------------

export interface PracticeLog {
  id: string;
  practicedAt: string;
  minutes: number;
  workId: string | null;
  topic: string | null;
  note: string | null;
  work: { id: string; title: string; composer: string | null } | null;
}
export const getPractice = (
  query: { from?: string; to?: string; studentId?: string } = {}
) =>
  get<PracticeSummary & { from: string; to: string; entries: PracticeLog[] }>(
    '/practice',
    query
  );
export const logPractice = (body: {
  minutes: number;
  practicedAt?: string;
  workId?: string;
  topic?: string;
  note?: string;
}) => send<PracticeLog>('POST', '/practice', body);
export const removePractice = (id: string) =>
  send<void>('DELETE', `/practice/${id}`);
export const setPracticeGoal = (weeklyMinutes: number) =>
  send<{ weeklyMinutes: number }>('PUT', '/practice/goal', { weeklyMinutes });

// ---------------------------------------------------------------------------
// Avisos
// ---------------------------------------------------------------------------

export interface PortalNotification {
  id: string;
  type: string;
  priority: string;
  status: 'UNREAD' | 'READ' | 'DISMISSED' | 'EXPIRED';
  title: string;
  message: string;
  actionText: string | null;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
}
export const listNotifications = (
  query: { page?: number; limit?: number; status?: string } = {}
) =>
  get<{
    notifications: PortalNotification[];
    pagination: Paginated<unknown>['pagination'];
    unreadCount?: number;
  }>('/notifications', query);
export const unreadCount = () =>
  get<{ unreadCount: number }>('/notifications/unread-count');
export const markNotificationRead = (id: string) =>
  send<unknown>('PATCH', `/notifications/${id}/read`);
export const deleteNotification = (id: string) =>
  send<void>('DELETE', `/notifications/${id}`);
export const markAllNotificationsRead = () =>
  send<{ count: number }>('PATCH', '/notifications/read-all');

export interface NotificationPreferences {
  topics: Array<{
    key: string;
    label: string;
    audience: 'teacher' | 'student' | 'both';
    email: boolean;
    sms: boolean;
  }>;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  hasEmail: boolean;
  hasPhone: boolean;
  smsAvailable: boolean;
}
export const getNotificationPreferences = () =>
  get<NotificationPreferences>('/notifications/preferences');
export const updateNotificationPreferences = (body: {
  channels?: Record<string, { email?: boolean; sms?: boolean }>;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}) => send<NotificationPreferences>('PUT', '/notifications/preferences', body);
export const sendAnnouncement = (body: {
  studentIds: string[];
  title: string;
  message: string;
  channels?: { email?: boolean; sms?: boolean };
  sendAt?: string;
}) =>
  send<{ delivered: number; skipped: number; scheduledFor: string | null }>(
    'POST',
    '/notifications/announcements',
    body
  );

// ---------------------------------------------------------------------------
// Repertório
// ---------------------------------------------------------------------------

export interface Repertoire {
  studying: Array<{
    work: WorkRef;
    since: string;
    lessonId?: string;
    assignmentId?: string;
  }>;
  wantToLearn: Array<{
    id: string;
    addedAt: string;
    notes: string | null;
    work: WorkRef;
    score: { id: string; title: string; type: string; source: string } | null;
    suggestedBy: string | null;
  }>;
  learned: Array<{
    id: string;
    learnedAt: string;
    mastery: number;
    wouldRecommend: boolean;
    work: WorkRef;
    score: { id: string; title: string; type: string; source: string } | null;
  }>;
}
export const getMyRepertoire = () => get<Repertoire>('/student/repertoire');
export const getStudentRepertoire = (studentId: string) =>
  get<Repertoire>(`/teacher/students/${studentId}/repertoire`);
export const suggestWork = (
  studentId: string,
  body: { workId: string; workScoreId?: string; note?: string }
) => send<unknown>('POST', `/teacher/students/${studentId}/suggestions`, body);

// ---------------------------------------------------------------------------
// Tarefas
// ---------------------------------------------------------------------------

export interface SubmissionEntry {
  id: string;
  kind: string;
  note: string | null;
  assetId: string | null;
  url: string | null;
  submittedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  effectiveStatus: string;
  dueDate: string | null;
  estimatedTime: number | null;
  actualTime: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  progress: number | null;
  worksIds: string[];
  workScoreIds: string[];
  practiceGoals: string[];
  teacherFeedback: string | null;
  teacherRating: number | null;
  studentNotes: string | null;
  studentRating: number | null;
  submissions: { entries: SubmissionEntry[] };
  submissionDate: string | null;
  isOverdue: boolean;
  daysUntilDue: number | null;
  createdAt: string;
  student: ApiPerson;
  lesson: {
    id: string;
    title: string;
    scheduledAt: string;
    teacher: ApiPerson;
  };
}

export const getAssignment = (id: string) =>
  get<Assignment>(`/assignments/${id}`);
export const giveAssignmentFeedback = (
  id: string,
  body: { feedback: string; rating?: number }
) => send<Assignment>('PATCH', `/assignments/${id}/feedback`, body);

export type AssignmentType =
  | 'practice'
  | 'theory'
  | 'listening'
  | 'composition'
  | 'performance';
export type AssignmentPriority = 'low' | 'medium' | 'high';

export interface AssignmentDraft {
  lessonId: string;
  title: string;
  description: string;
  type?: AssignmentType;
  priority?: AssignmentPriority;
  dueDate?: string;
  estimatedTime?: number;
  worksIds?: string[];
  workScoreIds?: string[];
  exercises?: string[];
  practiceGoals?: string[];
}
export const createAssignment = (body: AssignmentDraft) =>
  send<Assignment>('POST', '/assignments', body);

/**
 * Baixa um arquivo de uma rota que pede a sessão (o `.ics` das aulas, o CSV
 * do histórico): vem por `fetch` com os cookies e é entregue ao navegador
 * como download — um `<a href>` direto para a API não leva o "401 → renova".
 */
async function downloadFile(path: string, query: Query, filename: string) {
  const url = apiUrl(path, query);
  let response = await fetch(url, { credentials: 'include' });
  if (response.status === 401 && (await refreshSession()))
    response = await fetch(url, { credentials: 'include' });
  if (!response.ok)
    throw new Error('Não foi possível gerar o arquivo. Tente de novo.');
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 5_000);
}

/** As aulas em `.ics` (um período, ou uma aula). */
export const downloadIcs = (query: {
  from?: string;
  to?: string;
  lessonId?: string;
}) =>
  downloadFile(
    '/calendar/ics',
    query,
    query.lessonId ? 'aula-opus-atlas.ics' : 'aulas-opus-atlas.ics'
  );

export type AssignmentFilter =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'AWAITING_FEEDBACK'
  | 'OPEN';

export interface AssignmentListQuery {
  as?: Role;
  status?: AssignmentFilter;
  type?: AssignmentType;
  studentId?: string;
  lessonId?: string;
  dueFrom?: string;
  dueTo?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  awaitingFeedback: number;
}

export const listAssignments = (query: AssignmentListQuery) =>
  get<{
    assignments: Assignment[];
    stats: AssignmentStats;
    pagination: Paginated<Assignment>['pagination'];
  }>('/assignments', query as Query);
export const updateAssignment = (
  id: string,
  body: Partial<Omit<AssignmentDraft, 'lessonId' | 'dueDate'>> & {
    dueDate?: string | null;
  }
) => send<Assignment>('PATCH', `/assignments/${id}`, body);
export const deleteAssignment = (id: string) =>
  send<void>('DELETE', `/assignments/${id}`);
export const updateAssignmentProgress = (
  id: string,
  body: { progress?: number; actualTime?: number; studentNotes?: string }
) => send<Assignment>('PATCH', `/assignments/${id}/progress`, body);
export const completeAssignment = (
  id: string,
  body: {
    actualTime?: number;
    studentNotes?: string;
    studentRating?: number;
  } = {}
) => send<Assignment>('PATCH', `/assignments/${id}/complete`, body);
export const addSubmission = (
  id: string,
  body: {
    kind: 'video' | 'audio' | 'image' | 'document' | 'text';
    assetId?: string;
    note?: string;
  }
) => send<Assignment>('POST', `/assignments/${id}/submissions`, body);
export const removeSubmission = (id: string, submissionId: string) =>
  send<Assignment>('DELETE', `/assignments/${id}/submissions/${submissionId}`);

// ---------------------------------------------------------------------------
// Alunos do professor
// ---------------------------------------------------------------------------

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface StudentRow {
  relationshipId: string;
  inviteStatus: InviteStatus;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  maxLessonsPerWeek: number | null;
  lessonDuration: number | null;
  preferredDays: string[];
  preferredTimes: string[];
  currentFocus: string[];
  learningPlan: string | null;
  nextGoals: string | null;
  teacherNotes: string | null;
  totalLessons: number;
  completedLessons: number;
  /** Só para vínculo aceito. */
  stats: {
    nextLessonAt: string | null;
    lastLessonAt: string | null;
    attendanceRate: number | null;
    practiceMinutes7d: number;
    practiceGoalMinutes: number | null;
    openAssignments: number;
    overdueAssignments: number;
  } | null;
  student: {
    id: string;
    userId: string;
    level: string | null;
    mainInstrument: string | null;
    status: string | null;
    currentStreak: number | null;
    lastActiveAt: string | null;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      image: string | null;
    };
  };
}

export const listStudents = (query: {
  page?: number;
  limit?: number;
  inviteStatus?: InviteStatus;
  onlyActive?: boolean;
  q?: string;
}) =>
  get<{
    students: StudentRow[];
    pagination: Paginated<StudentRow>['pagination'];
  }>('/teacher/students', query as Query);
export const getStudent = (studentId: string) =>
  get<StudentRow>(`/teacher/students/${studentId}`);
export const searchInvitable = (q: string) =>
  get<{
    users: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      image: string | null;
    }>;
  }>('/teacher/students/search', { q });

export interface StudyPlan {
  maxLessonsPerWeek?: number;
  lessonDuration?: number;
  preferredDays?: string[];
  preferredTimes?: string[];
  learningPlan?: string;
  currentFocus?: string[];
  nextGoals?: string;
  teacherNotes?: string;
}
export const inviteStudent = (
  body: StudyPlan & { studentUserId: string; skipVerification?: boolean }
) => send<unknown>('POST', '/teacher/students', body);
export const resendInvite = (relationshipId: string) =>
  send<unknown>('POST', `/teacher/students/${relationshipId}/resend-invite`);
export const updateRelationship = (relationshipId: string, body: StudyPlan) =>
  send<unknown>('PATCH', `/teacher/students/${relationshipId}`, body);
export const endRelationship = (relationshipId: string) =>
  send<unknown>('DELETE', `/teacher/students/${relationshipId}`);

/**
 * Entrega com arquivo (vídeo ou gravação de áudio): a API assina, o navegador
 * envia direto ao armazenamento (um vídeo grande não atravessa a API), a API
 * confirma e a entrega entra na tarefa.
 */
export async function submitAssignmentFile(
  assignmentId: string,
  file: File,
  note?: string
) {
  const signed = await send<{
    assetId: string;
    uploadUrl: string;
    fields: Record<string, string | number>;
  }>('POST', '/uploads/signed', {
    kind: 'ASSIGNMENT_VIDEO',
    scopeId: assignmentId,
  });
  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields))
    form.append(key, String(value));
  form.append('file', file);
  const upload = await fetch(signed.uploadUrl, { method: 'POST', body: form });
  if (!upload.ok)
    throw new Error(
      'Não foi possível enviar o arquivo. Confira a conexão e tente de novo.'
    );
  await send('POST', `/uploads/${signed.assetId}/confirm`);
  return addSubmission(assignmentId, {
    kind: file.type.startsWith('audio/') ? 'audio' : 'video',
    assetId: signed.assetId,
    note: note?.trim() || undefined,
  });
}

// ---------------------------------------------------------------------------
// Acervo — compositor primeiro, depois a obra (as rotas de /composers e /works)
// ---------------------------------------------------------------------------

export interface CatalogComposer {
  id: string;
  name: string;
  fullName?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  portraitUrl?: string | null;
  epochName?: string | null;
}
export interface CatalogWork {
  id: string;
  title: string;
  subtitle?: string;
  opOrCatalog?: string;
  tone?: string;
  instrument?: { id: string; name: string };
}
export interface CatalogScore {
  id: string;
  source: string;
  title: string;
  type: string;
  editor?: string | null;
  publisher?: string | null;
  pageCount?: string | null;
}

export const searchComposers = (search: string) =>
  apiFetch<CatalogComposer[]>('/composers', { query: { search, limit: 12 } });
export const composerWorks = (composerId: string, search?: string) =>
  apiFetch<{ works: CatalogWork[]; totalCount: number; hasMore: boolean }>(
    `/composers/${composerId}/works`,
    {
      query: { search: search || undefined, limit: 30 },
    }
  );
export const workScores = (workId: string) =>
  apiFetch<{ scores: CatalogScore[]; total: number }>(
    `/works/${workId}/scores`,
    { query: { limit: 30 } }
  );

// ---------------------------------------------------------------------------
// Relatórios de progresso
// ---------------------------------------------------------------------------

export type ReportPeriod = '1month' | '3months' | '6months' | '1year' | 'all';
export type ReportSection =
  | 'overview'
  | 'attendance'
  | 'evolution'
  | 'assignments'
  | 'repertoire'
  | 'engagement'
  | 'insights'
  | 'comparison'
  | 'recommendations'
  | 'skills';
export type ReportVisibility = 'TEACHER_ONLY' | 'SHARED';

/**
 * As habilidades do relatório pedagógico (Maestro) — a mesma lista fixa da
 * API (`portal/reports/skills.ts`). A nota vem do fechamento da aula.
 */
export const SKILLS = [
  'technique',
  'reading',
  'rhythm',
  'interpretation',
  'memory',
  'theory',
  'ear',
  'sound',
] as const;
export type Skill = (typeof SKILLS)[number];
export const SKILL_LABEL: Record<Skill, string> = {
  technique: 'Técnica',
  reading: 'Leitura',
  rhythm: 'Ritmo',
  interpretation: 'Interpretação',
  memory: 'Memória',
  theory: 'Teoria',
  ear: 'Percepção',
  sound: 'Sonoridade',
};

/** Uma próxima peça aprovada pelo professor. */
export interface ApprovedPiece {
  workId: string;
  title: string;
  composer: string;
  note: string | null;
}

export interface ReportSummary {
  id: string;
  title: string;
  description: string | null;
  periodStart: string;
  periodEnd: string;
  periodLabel: string | null;
  selectedSections: ReportSection[];
  allowComments: boolean;
  visibility: ReportVisibility;
  sharedAt: string | null;
  isActive: boolean;
  viewCount: number;
  lastViewedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  /** Maestro: peças e dicas que o professor aprovou. */
  nextPieces: ApprovedPiece[] | null;
  tips: string[];
  teacher: ApiPerson;
  student: ApiPerson;
}

type Num = number | null;
type Ranked = Array<{ item: string; count: number }>;

/**
 * As seções do retrato que o servidor gera; cada uma só vem se foi pedida.
 * É o que `reportData` guarda (só as seções — período e cobertura ficam nos
 * campos do próprio relatório).
 */
export interface ReportData {
  overview?: {
    totalLessons: number;
    completedLessons: number;
    cancelledLessons: number;
    noShowLessons: number;
    lessonMinutes: number;
    attendanceRate: Num;
    totalAssignments: number;
    completedAssignments: number;
    assignmentCompletionRate: Num;
    avgEngagement: Num;
    avgPreparation: Num;
    avgTeacherRating: Num;
    worksLearned: number;
  };
  attendance?: {
    months: Array<{
      month: string;
      attended: number;
      missed: number;
      attendanceRate: Num;
      punctualityRate: Num;
    }>;
    trend: Num;
  };
  evolution?: Array<{
    month: string;
    lessons: number;
    minutes: number;
    completedAssignments: number;
    avgEngagement: Num;
  }>;
  assignments?: {
    overdue: number;
    punctualityRate: Num;
    byType: Array<{
      type: string;
      total: number;
      completed: number;
      completionRate: Num;
      onTimeRate: Num;
    }>;
  };
  repertoire?: {
    worksLearned: number;
    worksInProgress: number;
    avgMastery: Num;
    topComposers: Array<{ composer: string; count: number }>;
    recentlyLearned: Array<{
      workId: string;
      title: string;
      composer: string;
      learnedAt: string;
      mastery: number;
    }>;
  };
  engagement?: {
    avgEngagement: Num;
    avgPreparation: Num;
    topics: unknown;
    techniques: unknown;
  };
  insights?: {
    sampleSize: number;
    strengths: Ranked;
    challenges: Ranked;
    skillsWorked: Ranked;
    signals: Array<{ kind: string; detail: string; value: number }>;
  };
  skills?: {
    rated: boolean;
    skills: Array<{
      skill: Skill;
      label: string;
      current: Num;
      change: Num;
      lessons: number;
      assignments: number;
      practiceMinutes: number;
      months: Array<{
        month: string;
        rating: Num;
        ratings: number;
        lessons: number;
        assignments: number;
        practiceMinutes: number;
      }>;
    }>;
  };
  recommendations?: {
    inProgress: number;
    pieces: Array<{
      workId: string;
      title: string;
      composer: string;
      studentAppeal: number;
    }>;
  };
}

export interface ReportDetail extends ReportSummary {
  /** As seções; relatórios antigos podem vir embrulhados em `report`. */
  reportData: ReportData | { report?: ReportData } | null;
  teacherMessage: string | null;
  viewerRole: Role;
}

export interface ReportComment {
  id: string;
  content: string;
  section: ReportSection | null;
  isRead: boolean;
  createdAt: string;
  student: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
    };
  };
}

export const listReports = (query: {
  as?: Role;
  studentId?: string;
  visibility?: ReportVisibility;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) =>
  get<{
    reports: ReportSummary[];
    pagination: Paginated<ReportSummary>['pagination'];
  }>('/reports/shared', query as Query);
export const getReport = (id: string) =>
  get<ReportDetail>(`/reports/shared/${id}`);
export const createReport = (body: {
  studentId: string;
  title: string;
  description?: string;
  teacherMessage?: string;
  period?: ReportPeriod;
  from?: string;
  to?: string;
  sections?: ReportSection[];
  allowComments?: boolean;
  visibility?: ReportVisibility;
  nextPieces?: Array<{ workId: string; note?: string }>;
  tips?: string[];
}) => send<ReportSummary>('POST', '/reports/shared', body);

/** Maestro: sugestões do motor para o professor escolher. */
export const nextPiecesFor = (studentId: string) =>
  get<{ items: RecommendedWork[] }>(
    `/reports/progress/${studentId}/next-pieces`
  );
/** Maestro: rascunho de dicas (IA, ou regras sem IA). Nada é gravado. */
export const draftTips = (studentId: string, body: { period?: ReportPeriod }) =>
  send<{ tips: string[]; generatedBy: string }>(
    'POST',
    `/reports/progress/${studentId}/tips-draft`,
    body
  );
/** Maestro: o relatório compartilhado em PDF. */
export const downloadReportPdf = (id: string, title: string) =>
  downloadFile(
    `/reports/shared/${id}/pdf`,
    {},
    `${
      title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase() || 'relatorio'
    }.pdf`
  );
export const publishReport = (id: string) =>
  send<ReportSummary>('PATCH', `/reports/shared/${id}/publish`);
export const updateReport = (
  id: string,
  body: {
    title?: string;
    teacherMessage?: string;
    allowComments?: boolean;
    isActive?: boolean;
    nextPieces?: Array<{ workId: string; note?: string }>;
    tips?: string[];
  }
) => send<ReportSummary>('PATCH', `/reports/shared/${id}`, body);
export const revokeReport = (id: string) =>
  send<void>('DELETE', `/reports/shared/${id}`);
export const listReportComments = (id: string) =>
  get<{ comments: ReportComment[]; total: number }>(
    `/reports/shared/${id}/comments`
  );
export const addReportComment = (
  id: string,
  body: { content: string; section?: ReportSection }
) => send<ReportComment>('POST', `/reports/shared/${id}/comments`, body);

// ---------------------------------------------------------------------------
// Histórico
// ---------------------------------------------------------------------------

export type ActivityEntity =
  | 'lesson'
  | 'assignment'
  | 'student'
  | 'profile'
  | 'report'
  | 'practice';

export interface Activity {
  id: string;
  userType: string;
  action: string;
  entityType: ActivityEntity;
  entityId: string | null;
  entityName: string | null;
  title: string;
  description: string | null;
  createdAt: string;
  entityExists: boolean;
  changedFields: string[];
}

export const listActivities = (query: {
  as?: Role;
  entityType?: ActivityEntity;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) =>
  get<{
    activities: Activity[];
    pagination: Paginated<Activity>['pagination'];
  }>('/school-activities', query as Query);

/** O histórico inteiro do recorte, em CSV. */
export const exportActivities = (query: {
  as?: Role;
  entityType?: ActivityEntity;
  from?: string;
  to?: string;
}) =>
  downloadFile(
    '/school-activities/export',
    { ...query, format: 'csv' } as Query,
    'historico-opus-atlas.csv'
  );

// ---------------------------------------------------------------------------
// Perfil do portal e turmas do aluno
// ---------------------------------------------------------------------------

export interface TeacherPortalProfile {
  id: string;
  publicBio: string | null;
  bio: string | null;
  specialties: string[];
  instruments: string[];
  teachingMethod: string | null;
  experience: string | null;
  website: string | null;
  isPublicProfile: boolean;
  allowProgressReports: boolean;
}
export interface StudentPortalProfile {
  id: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  mainInstrument: string | null;
  musicalGoals: string | null;
  practiceTime: number | null;
  allowProgressShare: boolean;
}

export const getPortalProfile = () =>
  get<{
    teacher?: { profile: TeacherPortalProfile };
    student?: { profile: StudentPortalProfile };
  }>('/profile', { include: 'teacher,student' });
export const updatePortalProfile = (body: {
  teacher?: Partial<Omit<TeacherPortalProfile, 'id'>>;
  student?: Partial<Omit<StudentPortalProfile, 'id' | 'practiceTime'>>;
}) => send<unknown>('PATCH', '/profile', body);

interface TeacherCard {
  id: string;
  userId: string;
  bio: string | null;
  specialties: string[];
  instruments: string[];
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
}
export interface MyClasses {
  invitations: Array<{
    relationshipId: string;
    invitedAt: string;
    expiresAt: string;
    teacher: TeacherCard;
  }>;
  past: Array<{
    relationshipId: string;
    startDate: string;
    endDate: string | null;
    totalLessons: number;
    teacher: TeacherCard;
  }>;
  teachers: Array<{
    relationshipId: string;
    startDate: string;
    lessonDuration: number | null;
    maxLessonsPerWeek: number | null;
    currentFocus: string[];
    learningPlan: string | null;
    teacher: TeacherCard;
  }>;
}
export const getMyClasses = () => get<MyClasses>('/student/teachers');
export const acceptInvite = (relationshipId: string) =>
  send<unknown>('POST', `/student/invites/${relationshipId}/accept`);
export const declineInvite = (relationshipId: string) =>
  send<unknown>('POST', `/student/invites/${relationshipId}/decline`);
export const leaveClass = (relationshipId: string) =>
  send<unknown>('POST', `/student/teachers/${relationshipId}/leave`);
