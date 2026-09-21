// app/requests/portal/teacher.ts — telas do professor pela API (Etapa 4)
//
// Cada função devolve o formato de `teacher-request.ts`, para as páginas e os
// hooks não mudarem de contrato. Isomórficas, como as do aluno. No legado o
// aluno é identificado pelo id de **usuário**; a API filtra aulas e tarefas
// pelo id de **perfil** — a conversão sai da lista de vínculos.
import type {
  CalendarConflict,
  CalendarEvent,
  CalendarStats,
} from '../../(teacher)/teacher/calendar/pageServer';
import type { TeacherProfileData } from '../../(teacher)/teacher/profile/pageServer';
import type {
  TeacherAssignmentDetailsResponse,
  TeacherAssignmentEditResponse,
  TeacherAssignmentsResponse,
  TeacherDashboardData,
  TeacherLessonDetailsResponse,
  TeacherLessonsResponse,
  TeacherLessonsStats,
  TeacherStudentsData,
} from '../teacher-request';
import {
  collectPages,
  isSameDay,
  lessonColors,
  offsetPagination,
  orUndefined,
  pageOf,
  personName,
  portalGet,
  relationshipDuration,
  toDate,
  toOptionalDate,
  type ApiPagination,
} from './common';
import {
  legacyAssignmentRow,
  legacyLessonRow,
  legacyWorkScores,
  musicalPieces,
  type ApiAssignment,
  type ApiAssignmentStats,
  type ApiLesson,
} from './records';
import type { ApiCalendarEvent, ApiLessonCard } from './student';

const DAY_MS = 24 * 60 * 60 * 1000;

// ====================================
// RESPOSTAS DA API
// ====================================

export interface ApiRelationship {
  relationshipId: string;
  inviteStatus: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  maxLessonsPerWeek: number;
  lessonDuration: number;
  preferredDays: string[];
  preferredTimes: string[];
  currentFocus: string[];
  learningPlan: string | null;
  nextGoals: string | null;
  teacherNotes: string | null;
  totalLessons: number;
  completedLessons: number;
  student: {
    id: string;
    userId: string;
    level: string;
    mainInstrument: string | null;
    status: string;
    totalLessonsAttended: number;
    completedAssignments: number;
    totalAssignments: number;
    currentStreak: number;
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

interface ApiTeacherDashboard {
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
    avgLessonsPerWeek: number;
  };
  todayLessons: ApiLessonCard[];
  upcomingLessons: ApiLessonCard[];
}

interface ApiTeacherCalendar {
  events: ApiCalendarEvent[];
  stats?: {
    totalLessons: number;
    completedLessons: number;
    scheduledLessons: number;
    cancelledLessons: number;
    lessonHours: number;
    freeHours: number | null;
  };
  conflicts?: Array<{
    start: string;
    end: string;
    lessons: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      studentName: string;
    }>;
  }>;
}

// ====================================
// VÍNCULOS
// ====================================

/** Todos os vínculos do professor (até 500), para converter ids e níveis. */
export async function loadRelationships(
  token?: string,
  onlyActive = false
): Promise<ApiRelationship[]> {
  const { items } = await collectPages<ApiRelationship>(
    '/teacher/students',
    'students',
    { onlyActive },
    token,
    { maxPages: 5 }
  );

  return items;
}

/** Id de perfil do aluno a partir do id de usuário que o legado usava. */
export async function studentProfileId(
  studentUserId: string,
  token?: string
): Promise<string | undefined> {
  const relationships = await loadRelationships(token);

  return relationships.find(
    (relationship) =>
      relationship.student.userId === studentUserId ||
      relationship.student.id === studentUserId
  )?.student.id;
}

function upcomingByStudent(events: ApiCalendarEvent[]) {
  const byStudent = new Map<string, ApiCalendarEvent[]>();

  for (const event of events) {
    if (event.type !== 'lesson' || event.status !== 'SCHEDULED') continue;
    const list = byStudent.get(event.counterpart.id) ?? [];
    list.push(event);
    byStudent.set(event.counterpart.id, list);
  }

  for (const list of byStudent.values()) {
    list.sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime());
  }

  return byStudent;
}

/**
 * Alunos do professor. `status` do legado: `active` (padrão), `inactive` ou
 * `all`. Próxima aula e aulas agendadas saem do calendário dos próximos 90
 * dias; telefone, cidade e dados de estudo do aluno a API não expõe ao
 * professor, e vêm vazios. Aula cancelada por aluno não é contada (0).
 */
export async function loadTeacherStudents(
  status = 'active',
  limit = 20,
  offset = 0,
  token?: string
): Promise<TeacherStudentsData> {
  const pageSize = Math.min(Math.max(1, limit), 100);
  const now = new Date();

  const [data, calendar] = await Promise.all([
    portalGet<{ students: ApiRelationship[]; pagination: ApiPagination }>(
      '/teacher/students',
      {
        page: pageOf(offset, pageSize),
        limit: pageSize,
        onlyActive: status === 'active',
      },
      token
    ),
    portalGet<{ events: ApiCalendarEvent[] }>(
      '/calendar',
      {
        from: now.toISOString(),
        to: new Date(now.getTime() + 90 * DAY_MS).toISOString(),
      },
      token
    ),
  ]);

  const rows =
    status === 'inactive'
      ? data.students.filter((relationship) => !relationship.isActive)
      : data.students;
  const upcoming = upcomingByStudent(calendar.events);

  const students = rows.map((relationship) => {
    const scheduled = upcoming.get(relationship.student.id) ?? [];
    const next = scheduled[0];

    return {
      relationshipId: relationship.relationshipId,
      student: {
        id: relationship.student.userId,
        profileId: relationship.student.id,
        name: personName(relationship.student.user),
        email: relationship.student.user.email,
        image: relationship.student.user.image,
        phone: null,
        location: null,
        experienceLevel: null,
        level: relationship.student.level,
        mainInstrument: relationship.student.mainInstrument,
        practiceTime: null,
      },
      relationship: {
        isActive: relationship.isActive,
        startDate: toDate(relationship.startDate),
        endDate: relationship.endDate ? toDate(relationship.endDate) : null,
        pausedAt: null,
        pauseReason: null,
        maxLessonsPerWeek: relationship.maxLessonsPerWeek,
        lessonDuration: relationship.lessonDuration,
        preferredDays: relationship.preferredDays,
        preferredTimes: relationship.preferredTimes,
        learningPlan: relationship.learningPlan,
        currentFocus: relationship.currentFocus,
        teacherNotes: relationship.teacherNotes,
        inviteStatus:
          relationship.inviteStatus as TeacherStudentsData['students'][number]['relationship']['inviteStatus'],
        inviteAcceptedAt: null,
        inviteDeclinedAt: null,
      },
      stats: {
        totalLessons: relationship.totalLessons,
        completedLessons: relationship.completedLessons,
        scheduledLessons: scheduled.length,
        cancelledLessons: 0,
        completionRate:
          relationship.totalLessons > 0
            ? (relationship.completedLessons / relationship.totalLessons) * 100
            : 0,
      },
      nextLesson: next
        ? {
            id: next.id,
            scheduledAt: toDate(next.start),
            title: next.title,
            duration: next.lesson?.duration ?? 60,
          }
        : null,
    };
  });

  return {
    success: true,
    students,
    pagination: offsetPagination(data.pagination, offset, students.length),
    summary: {
      total: data.pagination.total,
      active: students.filter((row) => row.relationship.isActive).length,
      inactive: students.filter((row) => !row.relationship.isActive).length,
    },
  };
}

// ====================================
// PAINEL E PERFIL
// ====================================

export async function loadTeacherDashboard(
  token?: string
): Promise<TeacherDashboardData> {
  const data = await portalGet<ApiTeacherDashboard>(
    '/dashboard',
    { as: 'teacher' },
    token
  );
  const now = new Date();

  const upcomingLessons = data.upcomingLessons.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    scheduledAt: toDate(lesson.scheduledAt),
    duration: lesson.duration,
    student: {
      id: lesson.counterpart.userId,
      name: lesson.counterpart.name,
      image: orUndefined(lesson.counterpart.image),
      level: lesson.counterpart.level ?? 'BEGINNER',
    },
    isToday: isSameDay(toDate(lesson.scheduledAt), now),
    isNext: index === 0,
    location: orUndefined(lesson.location),
    objectives: lesson.objectives,
  }));

  return {
    dashboard: {
      stats: {
        totalStudents: data.stats.totalStudents,
        activeStudents: data.stats.studentsWithRecentLessons,
        lessonsThisWeek: data.stats.lessonsThisWeek,
        lessonsThisMonth: data.stats.lessonsThisMonth,
        completedLessons: data.stats.completedLessons,
        cancelledLessons: data.stats.cancelledLessons,
        avgLessonsPerWeek: data.stats.avgLessonsPerWeek,
        completionRate: data.stats.completionRate ?? 0,
      },
      upcomingLessons,
      todayLessons: upcomingLessons.filter((lesson) => lesson.isToday),
      recentActivities: [],
      activeStudents: [],
      weeklySchedule: [],
    },
    timestamp: now.toISOString(),
  };
}

interface ApiTeacherProfileBlock {
  profile: Record<string, any> & {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

/** Perfil do professor; conta sem o papel devolve `null`. */
export async function loadTeacherProfile(
  token?: string
): Promise<TeacherProfileData | null> {
  const data = await portalGet<{
    account: Record<string, any>;
    teacher: ApiTeacherProfileBlock | null;
  }>('/profile', { include: 'teacher' }, token);

  if (!data.teacher) {
    return null;
  }

  const { profile } = data.teacher;
  const account = data.account;

  return {
    id: profile.id,
    userId: profile.userId,
    bio: profile.bio,
    specialties: profile.specialties ?? [],
    instruments: profile.instruments ?? [],
    experience: profile.experience,
    education: profile.education,
    achievements: profile.achievements,
    isPublicProfile: profile.isPublicProfile,
    profileImage: orUndefined(profile.profileImage),
    website: profile.website,
    socialMedia: profile.socialMedia,
    publicBio: orUndefined(profile.publicBio),
    highlightedWorks: profile.highlightedWorks ?? [],
    defaultLessonDuration: profile.defaultLessonDuration,
    maxStudentsPerWeek: profile.maxStudentsPerWeek,
    timezone: profile.timezone,
    teachingMethod: orUndefined(profile.teachingMethod),
    ageGroups: profile.ageGroups ?? [],
    skillLevels: profile.skillLevels ?? [],
    status: profile.status,
    isVerified: profile.isVerified,
    verifiedAt: toOptionalDate(profile.verifiedAt),
    user: {
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      phone: account.phone,
      city: account.city,
      state: account.state,
      country: account.country,
      image: account.image,
    },
    createdAt: toDate(profile.createdAt),
    updatedAt: toDate(profile.updatedAt),
  };
}

// ====================================
// CALENDÁRIO
// ====================================

export function teacherCalendarEvent(event: ApiCalendarEvent): CalendarEvent {
  const lesson = event.lesson;

  return {
    id: event.id,
    title: event.title,
    start: toDate(event.start),
    end: toDate(event.end),
    type: 'lesson',
    status: event.status as CalendarEvent['status'],
    student: {
      id: event.counterpart.userId,
      name: event.counterpart.name,
      image: orUndefined(event.counterpart.image),
      level: event.counterpart.level ?? 'BEGINNER',
    },
    location: orUndefined(event.location),
    description: orUndefined(event.description),
    objectives: lesson?.objectives ?? [],
    ...lessonColors(event.status, 'teacher'),
    details: {
      workScoreIds: lesson?.workScoreIds ?? [],
      topics: lesson?.topics ?? [],
      techniques: lesson?.techniques ?? [],
      homework: orUndefined(lesson?.homework),
      teacherNotes: orUndefined(lesson?.teacherNotes),
      publicNotes: orUndefined(lesson?.publicNotes),
      isRecurring: lesson?.isRecurring ?? false,
      recurrenceType: undefined,
    },
  };
}

/**
 * Calendário do professor no período. Resumo e conflitos vêm da API; horas
 * ocupadas são as horas de aula do período, e horas livres são as da agenda
 * de disponibilidade (0 se o professor não cadastrou disponibilidade).
 */
export async function loadTeacherCalendar(
  startDate: Date,
  endDate: Date,
  includeStats = false,
  detectConflicts = false,
  token?: string
): Promise<{
  events: CalendarEvent[];
  stats?: CalendarStats;
  conflicts?: CalendarConflict[];
  hasConflicts?: boolean;
}> {
  const data = await portalGet<ApiTeacherCalendar>(
    '/calendar',
    {
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      stats: includeStats || undefined,
      conflicts: detectConflicts || undefined,
    },
    token
  );

  const events = data.events
    .filter((event) => event.type === 'lesson')
    .map(teacherCalendarEvent);

  const response: {
    events: CalendarEvent[];
    stats?: CalendarStats;
    conflicts?: CalendarConflict[];
    hasConflicts?: boolean;
  } = { events };

  if (includeStats && data.stats) {
    const periodDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / DAY_MS)
    );

    response.stats = {
      totalLessons: data.stats.totalLessons,
      completedLessons: data.stats.completedLessons,
      scheduledLessons: data.stats.scheduledLessons,
      cancelledLessons: data.stats.cancelledLessons,
      busyHours: data.stats.lessonHours,
      freeHours: data.stats.freeHours ?? 0,
      averageLessonsPerDay:
        Math.round((data.stats.totalLessons / periodDays) * 10) / 10,
    };
  }

  if (detectConflicts) {
    response.conflicts = (data.conflicts ?? []).map((conflict) => ({
      date: toDate(conflict.start),
      conflicts: conflict.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        start: toDate(lesson.start),
        end: toDate(lesson.end),
        studentName: lesson.studentName,
      })),
    }));
    response.hasConflicts = response.conflicts.length > 0;
  }

  return response;
}

// ====================================
// AULAS
// ====================================

/**
 * Aulas do professor. O resumo é o do painel da API (conjunto todo), mais a
 * contagem de agendadas; a duração média é a da página carregada.
 */
export async function loadTeacherLessons(
  studentId?: string,
  status?: string,
  dateFrom?: Date,
  dateTo?: Date,
  limit = 50,
  offset = 0,
  includeStats = true,
  token?: string
): Promise<TeacherLessonsResponse> {
  const pageSize = Math.min(Math.max(1, limit), 100);
  const relationships = await loadRelationships(token);

  // Aceita id de perfil (o que o legado filtrava) ou de usuário.
  const profileId = studentId
    ? (relationships.find(
        (relationship) =>
          relationship.student.id === studentId ||
          relationship.student.userId === studentId
      )?.student.id ?? studentId)
    : undefined;

  const [data, dashboard, scheduled] = await Promise.all([
    portalGet<{ lessons: ApiLesson[]; pagination: ApiPagination }>(
      '/lessons',
      {
        page: pageOf(offset, pageSize),
        limit: pageSize,
        studentId: profileId,
        status,
        from: dateFrom?.toISOString(),
        to: dateTo?.toISOString(),
      },
      token
    ),
    includeStats
      ? portalGet<ApiTeacherDashboard>('/dashboard', { as: 'teacher' }, token)
      : null,
    includeStats
      ? portalGet<{ pagination: ApiPagination }>(
          '/lessons',
          { status: 'SCHEDULED', limit: 1 },
          token
        )
      : null,
  ]);

  const levels = new Map(
    relationships.map((relationship) => [
      relationship.student.id,
      relationship.student.level,
    ])
  );
  const lessons = data.lessons.map((lesson) =>
    legacyLessonRow(lesson, levels.get(lesson.student.id))
  );

  let stats: TeacherLessonsStats = {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    averageDuration: 0,
    completionRate: 0,
  };

  if (dashboard && scheduled) {
    const durations = data.lessons.map((lesson) => lesson.duration);

    stats = {
      total: dashboard.stats.totalLessons,
      scheduled: scheduled.pagination.total,
      completed: dashboard.stats.completedLessons,
      cancelled: dashboard.stats.cancelledLessons,
      noShow: dashboard.stats.noShowLessons,
      today: dashboard.todayLessons.length,
      thisWeek: dashboard.stats.lessonsThisWeek,
      thisMonth: dashboard.stats.lessonsThisMonth,
      averageDuration: durations.length
        ? Math.round(
            durations.reduce((sum, value) => sum + value, 0) / durations.length
          )
        : 0,
      completionRate: dashboard.stats.completionRate ?? 0,
    };
  }

  return {
    success: true,
    lessons,
    stats,
    pagination: offsetPagination(data.pagination, offset, lessons.length),
  };
}

/**
 * Detalhe de aula para o professor (ou o aluno dela). Obras e partituras
 * vinculadas vêm resolvidas da API; série recorrente relacionada não —
 * `relatedLessons` vem vazio.
 */
export async function loadTeacherLessonDetails(
  lessonId: string,
  token?: string
): Promise<TeacherLessonDetailsResponse> {
  const [lesson, assignments] = await Promise.all([
    portalGet<ApiLesson>(`/lessons/${lessonId}`, undefined, token),
    portalGet<{ assignments: ApiAssignment[] }>(
      '/assignments',
      { lessonId, limit: 100 },
      token
    ),
  ]);

  // Só o professor da aula recebe as notas privadas.
  const isTeacher = 'teacherNotes' in lesson;
  const relationship = isTeacher
    ? (await loadRelationships(token)).find(
        (row) => row.student.id === lesson.student.id
      )
    : undefined;

  const row = legacyLessonRow(lesson, relationship?.student.level);

  return {
    success: true,
    userRole: isTeacher ? 1 : 0,
    isTeacher,
    isStudent: !isTeacher,
    lesson: {
      ...row,
      description: orUndefined(lesson.description),
      location: orUndefined(lesson.location),
      recurrenceType: orUndefined(lesson.recurrenceType),
      parentLessonId: orUndefined(lesson.parentLessonId),
      worksIds: lesson.worksIds ?? [],
      workScoreIds: lesson.workScoreIds ?? [],
      musicalPieces: musicalPieces(lesson.workScores, lesson.works),
      homework: orUndefined(lesson.homework),
      nextLessonPrep: undefined,
      teacherNotes: orUndefined(lesson.teacherNotes),
      publicNotes: orUndefined(lesson.publicNotes),
      studentFeedback: orUndefined(lesson.studentFeedback),
      lessonSummary: orUndefined(lesson.lessonSummary),
      studentPresent: orUndefined(lesson.studentPresent),
      engagement: orUndefined(lesson.engagement),
      preparation: orUndefined(lesson.preparation),
      teacher: { ...row.teacher, image: orUndefined(row.teacher.image) },
      student: { ...row.student, image: orUndefined(row.student.image) },
      relationship: {
        totalLessons: relationship?.totalLessons ?? 0,
        completedLessons: relationship?.completedLessons ?? 0,
        relationshipDuration: relationshipDuration(
          relationship?.startDate ?? lesson.createdAt
        ),
      },
      workScores: legacyWorkScores(lesson.workScores),
      assignments: assignments.assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: toOptionalDate(assignment.dueDate),
        status: assignment.status,
        isCompleted: assignment.isCompleted,
      })),
      relatedLessons: [],
      permissions: {
        canEdit: isTeacher,
        canCancel: isTeacher,
        canReschedule: isTeacher,
        canViewTeacherNotes: isTeacher,
        canAddFeedback: !isTeacher && lesson.status === 'COMPLETED',
        canMarkAttendance: isTeacher,
      },
    },
  };
}

// ====================================
// TAREFAS
// ====================================

/**
 * Tarefas do professor. As contagens são as da API (conjunto todo); taxa de
 * conclusão sai delas, e o tempo médio, das concluídas da página.
 */
export async function loadTeacherAssignments(
  studentUserId?: string,
  status?: string,
  lessonId?: string,
  limit = 50,
  offset = 0,
  token?: string
): Promise<TeacherAssignmentsResponse> {
  const pageSize = Math.min(Math.max(1, limit), 100);
  const studentId = studentUserId
    ? await studentProfileId(studentUserId, token)
    : undefined;

  const data = await portalGet<{
    assignments: ApiAssignment[];
    stats: ApiAssignmentStats;
    pagination: ApiPagination;
  }>(
    '/assignments',
    {
      page: pageOf(offset, pageSize),
      limit: pageSize,
      studentId,
      status,
      lessonId,
    },
    token
  );

  const assignments = data.assignments.map(legacyAssignmentRow);
  const completed = assignments.filter((assignment) => assignment.isCompleted);
  const averageTime = completed.length
    ? completed.reduce(
        (sum, assignment) => sum + (assignment.actualTime ?? 0),
        0
      ) / completed.length
    : 0;

  return {
    success: true,
    assignments,
    stats: {
      ...data.stats,
      completionRate:
        data.stats.total > 0
          ? Math.round((data.stats.completed / data.stats.total) * 1000) / 10
          : 0,
      averageTime: Math.round(averageTime * 10) / 10,
    },
    pagination: offsetPagination(data.pagination, offset, assignments.length),
  };
}

export async function loadTeacherAssignmentDetails(
  assignmentId: string,
  token?: string
): Promise<TeacherAssignmentDetailsResponse> {
  const assignment = await portalGet<ApiAssignment>(
    `/assignments/${assignmentId}`,
    undefined,
    token
  );
  const row = legacyAssignmentRow(assignment);
  const permissions = assignment.permissions;
  const isTeacher = Boolean(permissions?.canEdit);

  return {
    success: true,
    userRole: isTeacher ? 1 : 0,
    assignment: {
      ...row,
      workScores: legacyWorkScores(assignment.workScores),
      permissions: {
        canEdit: isTeacher && assignment.status !== 'COMPLETED',
        canDelete: permissions?.canDelete ?? false,
        canComplete: permissions?.canComplete ?? false,
        canAddFeedback: permissions?.canGiveFeedback ?? false,
        canAddSubmission: permissions?.canSubmit ?? false,
      },
    },
  };
}

export async function loadTeacherAssignmentEdit(
  assignmentId: string,
  token?: string
): Promise<TeacherAssignmentEditResponse> {
  const [assignment, relationships] = await Promise.all([
    portalGet<ApiAssignment>(`/assignments/${assignmentId}`, undefined, token),
    loadRelationships(token, true),
  ]);

  if (!assignment.permissions?.canEdit) {
    return { success: false, error: 'Tarefa não encontrada ou acesso negado' };
  }

  const row = legacyAssignmentRow(assignment);

  return {
    success: true,
    assignment: {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      priority: row.priority,
      dueDate: row.dueDate,
      estimatedTime: row.estimatedTime,
      workScoreIds: row.workScoreIds,
      worksIds: row.worksIds ?? [],
      exercises: row.exercises,
      practiceGoals: row.practiceGoals,
      tempoTargets: row.tempoTargets,
      technicalGoals: row.technicalGoals,
      musicalGoals: row.musicalGoals,
      status: assignment.status,
      isCompleted: row.isCompleted,
      student: row.student,
      lesson: {
        id: row.lesson.id,
        title: row.lesson.title,
        scheduledAt: row.lesson.scheduledAt,
      },
      workScores: legacyWorkScores(assignment.workScores),
      permissions: {
        canEdit: assignment.status !== 'COMPLETED',
        canDelete: true,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    students: relationships
      .map((relationship) => ({
        id: relationship.student.userId,
        name: personName(relationship.student.user),
        image: relationship.student.user.image,
        level: relationship.student.level,
        isActive: relationship.isActive,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

// ====================================
// DETALHE DO ALUNO
// ====================================

/**
 * Ficha de um aluno para o professor (id de **usuário** do aluno, como na
 * rota). Contato e data de cadastro do aluno a API não expõe ao professor:
 * vêm vazios, e as datas de criação usam o início do vínculo.
 */
export async function loadTeacherStudentDetail(
  studentUserId: string,
  token?: string
) {
  const relationships = await loadRelationships(token);
  const relationship = relationships.find(
    (row) =>
      row.student.userId === studentUserId || row.student.id === studentUserId
  );

  if (!relationship) {
    return null;
  }

  const [lessonsData, assignmentsData] = await Promise.all([
    portalGet<{ lessons: ApiLesson[] }>(
      '/lessons',
      { studentId: relationship.student.id, limit: 50, order: 'desc' },
      token
    ),
    portalGet<{ assignments: ApiAssignment[] }>(
      '/assignments',
      { studentId: relationship.student.id, limit: 20, order: 'desc' },
      token
    ),
  ]);

  const now = new Date();
  const lessons = lessonsData.lessons.map((lesson) => ({
    ...lesson,
    scheduledAtDate: toDate(lesson.scheduledAt),
  }));

  const recentLessons = lessons
    .filter((lesson) => lesson.scheduledAtDate <= now)
    .slice(0, 10);
  const upcomingLessons = lessons
    .filter(
      (lesson) => lesson.scheduledAtDate > now && lesson.status === 'SCHEDULED'
    )
    .sort((a, b) => a.scheduledAtDate.getTime() - b.scheduledAtDate.getTime())
    .slice(0, 5);

  const count = (status: string) =>
    lessons.filter((lesson) => lesson.status === status).length;
  const completed = count('COMPLETED');
  const totalStudyTime = lessons
    .filter((lesson) => lesson.status === 'COMPLETED')
    .reduce((sum, lesson) => sum + lesson.duration, 0);

  const lastLessonDate = recentLessons[0]?.scheduledAtDate;
  const nextLessonDate = upcomingLessons[0]?.scheduledAtDate;
  const startDate = toDate(relationship.startDate);

  return {
    student: {
      id: relationship.student.userId,
      name: personName(relationship.student.user),
      email: relationship.student.user.email,
      image: relationship.student.user.image,
      phone: null,
      city: null,
      state: null,
      experienceLevel: null,
      createdAt: startDate,
    },
    studentProfile: {
      id: relationship.student.id,
      level: relationship.student.level,
      mainInstrument: relationship.student.mainInstrument,
      musicalGoals: null,
      practiceTime: null,
      status: relationship.student.status,
      createdAt: startDate,
    },
    relationship: {
      relationshipId: relationship.relationshipId,
      isActive: relationship.isActive,
      startDate,
      endDate: relationship.endDate ? toDate(relationship.endDate) : null,
      pausedAt: null,
      pauseReason: null,
      maxLessonsPerWeek: relationship.maxLessonsPerWeek,
      lessonDuration: relationship.lessonDuration,
      preferredDays: relationship.preferredDays,
      preferredTimes: relationship.preferredTimes,
      learningPlan: relationship.learningPlan,
      currentFocus: relationship.currentFocus,
      teacherNotes: relationship.teacherNotes,
    },
    stats: {
      totalLessons: lessons.length,
      completedLessons: completed,
      scheduledLessons: count('SCHEDULED'),
      cancelledLessons: count('CANCELLED'),
      completionRate:
        lessons.length > 0
          ? Math.round((completed / lessons.length) * 1000) / 10
          : 0,
      totalStudyTime,
      averageLessonRating: 0,
      streakDays: lastLessonDate
        ? Math.max(
            0,
            Math.floor((now.getTime() - lastLessonDate.getTime()) / DAY_MS)
          )
        : 0,
      lastLessonDate,
      nextLessonDate,
    },
    recentLessons: recentLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      scheduledAt: lesson.scheduledAtDate,
      duration: lesson.duration,
      status: lesson.status,
      objectives: lesson.objectives,
      topics: lesson.topics,
      homework: lesson.homework,
      studentProgress: null,
      teacherNotes: lesson.teacherNotes ?? null,
      studentFeedback: lesson.studentFeedback,
    })),
    upcomingLessons: upcomingLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      scheduledAt: lesson.scheduledAtDate,
      duration: lesson.duration,
      objectives: lesson.objectives,
      location: lesson.location,
    })),
    assignments: assignmentsData.assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate ? toDate(assignment.dueDate) : null,
      status: assignment.effectiveStatus,
      isCompleted: assignment.isCompleted,
      progress: assignment.progress ?? 0,
      type: assignment.type,
      priority: assignment.priority,
    })),
  };
}
