// app/requests/portal/student.ts — telas do aluno pela API (Etapa 4)
//
// Cada função devolve o formato de `student-requests.ts`, para as páginas e
// os hooks não mudarem de contrato. Isomórficas: o servidor passa o token do
// cookie; o navegador vai pela sessão. Erro da API sobe como `ApiError` — quem
// chama decide se vira `null` (página) ou mensagem (hook).
import {
  OffsetPagination,
  collectPages,
  isSameDay,
  lessonColors,
  offsetPagination,
  orUndefined,
  pageOf,
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
  milestonesObject,
  type ApiAssignment,
  type ApiAssignmentStats,
  type ApiLesson,
} from './records';

// ====================================
// TIPOS DO LEGADO (as páginas importam daqui via student-requests)
// ====================================

export interface StudentDashboard {
  stats: {
    totalLessons: number;
    completedLessons: number;
    upcomingLessons: number;
    missedLessons: number;
    totalStudyTime: number; // em minutos
    averageAttendance: number;
    currentStreak: number;
    longestStreak: number;
  };
  upcomingLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    teacher: { id: string; name: string; image?: string };
    location?: string;
    objectives: string[];
    publicNotes?: string;
    homework?: string;
    isToday: boolean;
    isNext: boolean;
  }>;
  todayLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    teacher: { id: string; name: string; image?: string };
    location?: string;
    objectives: string[];
    publicNotes?: string;
    homework?: string;
  }>;
  recentLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    duration: number;
    status: string;
    teacher: { name: string; image?: string };
    lessonSummary?: string;
    publicNotes?: string;
    homework?: string;
    nextLessonPrep?: string;
    skillsWorked: string[];
    improvements: string[];
    challenges: string[];
    studentProgress?: any;
  }>;
  studyProgress: {
    currentWorks: Array<{
      workId: string;
      title: string;
      composer: string;
      addedAt: Date;
      difficulty?: string | null;
      selectedScore?: { title: string; type: string };
    }>;
    learnedWorks: Array<{
      workId: string;
      title: string;
      composer: string;
      learnedAt: Date;
      mastery: number;
      wouldRecommend: boolean;
    }>;
    recentAnnotations: Array<{
      id: string;
      workTitle: string;
      title: string;
      category: string;
      createdAt: Date;
    }>;
  };
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherImage?: string;
    relationshipStart: Date;
    nextLessonAt?: Date;
    totalLessonsWithTeacher: number;
    specialties: string[];
  }>;
}

export interface StudentProfile {
  id: string;
  userId: string;
  level: string;
  mainInstrument?: string;
  musicalGoals?: string;
  preferredGenres: string[];
  musicalBackground?: string;
  allowPublicProgress: boolean;
  allowProgressShare: boolean;
  profileVisibility: string;
  practiceTime?: number;
  practiceSchedule?: any;
  learningPace?: string;
  specialNeeds?: string;
  status: string;
  enrollmentDate: Date;
  lastLessonAt?: Date;
  lastActiveAt?: Date;
  preferredContact: string;
  reminderPreferences?: any;
  totalLessonsAttended: number;
  totalAssignments: number;
  completedAssignments: number;
  currentStreak: number;
  longestStreak: number;
  progressScore?: number;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    image?: string | null;
    experienceLevel: string | null;
  };
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherImage?: string;
    isActive: boolean;
    startDate: Date;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    nextLessonAt?: Date;
    totalLessons: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'lesson' | 'assignment_due' | 'practice_reminder';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  teacher: { id: string; name: string; image?: string };
  location?: string;
  description?: string;
  objectives?: string[];
  homework?: string;
  publicNotes?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  details?: {
    workScoreIds: string[];
    topics: string[];
    techniques: string[];
    lessonSummary?: string;
    skillsWorked: string[];
    improvements: string[];
    challenges: string[];
    studentProgress?: any;
    nextLessonPrep?: string;
    canProvideFeedback: boolean;
    studentFeedback?: string;
  };
}

export interface StudentAssignmentDetailsData {
  assignment: {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    workScoreIds: string[];
    exercises: string[];
    practiceGoals: string[];
    tempoTargets?: any;
    technicalGoals: string[];
    musicalGoals: string[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    dueDate?: Date | null;
    estimatedTime?: number | null;
    actualTime?: number | null;
    isOverdue: boolean;
    daysUntilDue?: number | null;
    isCompleted: boolean;
    completedAt?: Date | null;
    progress?: number | null;
    teacherFeedback?: string | null;
    teacherRating?: number | null;
    studentNotes?: string | null;
    studentRating?: number | null;
    submissions?: any;
    submissionDate?: Date | null;
    lesson: {
      id: string;
      title: string;
      scheduledAt: Date;
      teacher: { name: string; image?: string | null };
    };
    workScores: Array<{
      id: string;
      title: string;
      composer: string;
      workTitle: string;
      type: string;
      downloadUrl?: string;
    }>;
    progressMilestones?: {
      learnedLeftHand: boolean;
      learnedRightHand: boolean;
      playedWithMetronome: boolean;
      memorized: boolean;
      playedAtTempo: boolean;
      masteredDynamics: boolean;
      performedForOthers: boolean;
    };
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
      canComplete: boolean;
      canAddFeedback: boolean;
      canAddSubmission: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  userRole: number;
}

export interface StudentAssignmentDetailsResponse {
  success: boolean;
  assignment?: StudentAssignmentDetailsData['assignment'];
  userRole?: number;
  error?: string;
}

export interface StudentLessonFilters {
  teacherId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface StudentAssignmentFilters {
  teacherId?: string;
  status?: string;
  lessonId?: string;
  limit?: number;
  offset?: number;
}

export interface StudentCalendarOptions {
  view?: string;
  includeStats?: boolean;
  teacherId?: string;
}

// ====================================
// RESPOSTAS DA API
// ====================================

export interface ApiCounterpart {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  level: string | null;
}

export interface ApiLessonCard {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: string;
  location: string | null;
  objectives: string[];
  homework: string | null;
  publicNotes: string | null;
  counterpart: ApiCounterpart;
}

interface ApiWorkRef {
  id: string;
  title: string;
  composer: { id: string; name: string };
}

export interface ApiStudyProgress {
  currentWorks: Array<{
    addedAt: string;
    difficulty: string | null;
    work: ApiWorkRef;
    selectedWorkScore: { id: string; title: string; type: string } | null;
  }>;
  learnedWorks: Array<{
    learnedAt: string;
    mastery: number;
    wouldRecommend: boolean;
    work: ApiWorkRef;
  }>;
  recentAnnotations: Array<{
    id: string;
    title: string;
    category: string;
    createdAt: string;
    work: { id: string; title: string };
  }>;
}

interface ApiStudentDashboard {
  stats: {
    totalLessons: number;
    completedLessons: number;
    upcomingLessons: number;
    missedLessons: number;
    studyMinutes: number;
    attendanceRate: number | null;
    currentStreak: number;
    longestStreak: number;
  };
  todayLessons: ApiLessonCard[];
  upcomingLessons: ApiLessonCard[];
  recentLessons: Array<
    ApiLessonCard & {
      lessonSummary: string | null;
      nextLessonPrep: string | null;
      skillsWorked: string[];
      improvements: string[];
      challenges: string[];
    }
  >;
  studyProgress: ApiStudyProgress;
  teachers: Array<{
    teacherId: string;
    userId: string;
    name: string;
    image: string | null;
    specialties: string[];
    relationshipStart: string;
    nextLessonAt: string | null;
    totalLessons: number;
  }>;
}

interface ApiStudentBlock {
  profile: Record<string, any> & {
    id: string;
    userId: string;
    enrollmentDate: string;
    createdAt: string;
    updatedAt: string;
  };
  isNew: boolean;
  teachers: Array<{
    relationshipId: string;
    teacherId: string;
    userId: string;
    name: string;
    image: string | null;
    isActive: boolean;
    inviteStatus: string;
    startDate: string;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    totalLessons: number;
    nextLessonAt: string | null;
  }>;
}

interface ApiAccount {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  image: string | null;
  experienceLevel: string | null;
}

export interface ApiCalendarEvent {
  id: string;
  type: 'lesson' | 'assignment_due';
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status: string;
  counterpart: ApiCounterpart;
  location: string | null;
  description: string | null;
  lesson?: {
    duration: number;
    objectives: string[];
    topics: string[];
    techniques: string[];
    workScoreIds: string[];
    homework: string | null;
    publicNotes: string | null;
    lessonSummary: string | null;
    isRecurring: boolean;
    studentFeedback: string | null;
    canGiveFeedback: boolean;
    teacherNotes?: string | null;
  };
}

// ====================================
// PAINEL E PERFIL
// ====================================

function lessonCard(lesson: ApiLessonCard) {
  return {
    id: lesson.id,
    title: lesson.title,
    scheduledAt: toDate(lesson.scheduledAt),
    duration: lesson.duration,
    teacher: {
      id: lesson.counterpart.userId,
      name: lesson.counterpart.name,
      image: orUndefined(lesson.counterpart.image),
    },
    location: orUndefined(lesson.location),
    objectives: lesson.objectives,
    publicNotes: orUndefined(lesson.publicNotes),
    homework: orUndefined(lesson.homework),
  };
}

export function studyProgressFrom(
  study: ApiStudyProgress
): StudentDashboard['studyProgress'] {
  return {
    currentWorks: study.currentWorks.map((item) => ({
      workId: item.work.id,
      title: item.work.title,
      composer: item.work.composer.name,
      addedAt: toDate(item.addedAt),
      difficulty: item.difficulty,
      selectedScore: item.selectedWorkScore
        ? {
            title: item.selectedWorkScore.title,
            type: item.selectedWorkScore.type,
          }
        : undefined,
    })),
    learnedWorks: study.learnedWorks.map((item) => ({
      workId: item.work.id,
      title: item.work.title,
      composer: item.work.composer.name,
      learnedAt: toDate(item.learnedAt),
      mastery: item.mastery,
      wouldRecommend: item.wouldRecommend,
    })),
    recentAnnotations: study.recentAnnotations.map((annotation) => ({
      id: annotation.id,
      workTitle: annotation.work.title,
      title: annotation.title,
      category: annotation.category,
      createdAt: toDate(annotation.createdAt),
    })),
  };
}

/**
 * Painel do aluno. A presença média é a da API — só aulas já dadas entram na
 * conta; sem aula dada ainda, vem 0 (o legado dizia 100%).
 */
export async function loadStudentDashboard(
  token?: string
): Promise<StudentDashboard> {
  const data = await portalGet<ApiStudentDashboard>(
    '/dashboard',
    { as: 'student' },
    token
  );
  const now = new Date();

  return {
    stats: {
      totalLessons: data.stats.totalLessons,
      completedLessons: data.stats.completedLessons,
      upcomingLessons: data.stats.upcomingLessons,
      missedLessons: data.stats.missedLessons,
      totalStudyTime: data.stats.studyMinutes,
      averageAttendance: data.stats.attendanceRate ?? 0,
      currentStreak: data.stats.currentStreak,
      longestStreak: data.stats.longestStreak,
    },
    upcomingLessons: data.upcomingLessons.map((lesson, index) => ({
      ...lessonCard(lesson),
      isToday: isSameDay(toDate(lesson.scheduledAt), now),
      isNext: index === 0,
    })),
    todayLessons: data.todayLessons.map(lessonCard),
    recentLessons: data.recentLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      scheduledAt: toDate(lesson.scheduledAt),
      duration: lesson.duration,
      status: lesson.status,
      teacher: {
        name: lesson.counterpart.name,
        image: orUndefined(lesson.counterpart.image),
      },
      lessonSummary: orUndefined(lesson.lessonSummary),
      publicNotes: orUndefined(lesson.publicNotes),
      homework: orUndefined(lesson.homework),
      nextLessonPrep: orUndefined(lesson.nextLessonPrep),
      skillsWorked: lesson.skillsWorked,
      improvements: lesson.improvements,
      challenges: lesson.challenges,
      studentProgress: undefined,
    })),
    studyProgress: studyProgressFrom(data.studyProgress),
    teachers: data.teachers.map((teacher) => ({
      teacherId: teacher.userId,
      teacherName: teacher.name,
      teacherImage: orUndefined(teacher.image),
      relationshipStart: toDate(teacher.relationshipStart),
      nextLessonAt: toOptionalDate(teacher.nextLessonAt),
      totalLessonsWithTeacher: teacher.totalLessons,
      specialties: teacher.specialties,
    })),
  };
}

/** Obras em estudo, aprendidas e anotações recentes (as do painel). */
export async function loadStudentStudyData(
  token?: string
): Promise<StudentDashboard['studyProgress']> {
  const data = await portalGet<Pick<ApiStudentDashboard, 'studyProgress'>>(
    '/dashboard',
    { as: 'student' },
    token
  );

  return studyProgressFrom(data.studyProgress);
}

/**
 * Perfil do aluno. A API cria o perfil na primeira leitura (`isNew`), como o
 * legado fazia; conta sem o papel de aluno devolve `null`.
 */
export async function loadStudentProfile(
  token?: string
): Promise<{ profile: StudentProfile; isNew: boolean } | null> {
  const data = await portalGet<{
    account: ApiAccount;
    student: ApiStudentBlock | null;
  }>('/profile', { include: 'student' }, token);

  if (!data.student) {
    return null;
  }

  const { profile, teachers, isNew } = data.student;
  const account = data.account;

  return {
    isNew,
    profile: {
      id: profile.id,
      userId: profile.userId,
      level: profile.level,
      mainInstrument: orUndefined(profile.mainInstrument),
      musicalGoals: orUndefined(profile.musicalGoals),
      preferredGenres: profile.preferredGenres ?? [],
      musicalBackground: orUndefined(profile.musicalBackground),
      allowPublicProgress: profile.allowPublicProgress,
      allowProgressShare: profile.allowProgressShare,
      profileVisibility: profile.profileVisibility,
      practiceTime: orUndefined(profile.practiceTime),
      practiceSchedule: profile.practiceSchedule,
      learningPace: orUndefined(profile.learningPace),
      specialNeeds: orUndefined(profile.specialNeeds),
      status: profile.status,
      enrollmentDate: toDate(profile.enrollmentDate),
      lastLessonAt: toOptionalDate(profile.lastLessonAt),
      lastActiveAt: toOptionalDate(profile.lastActiveAt),
      preferredContact: profile.preferredContact,
      reminderPreferences: profile.reminderPreferences,
      totalLessonsAttended: profile.totalLessonsAttended,
      totalAssignments: profile.totalAssignments,
      completedAssignments: profile.completedAssignments,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      progressScore: orUndefined(profile.progressScore),
      user: {
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        city: account.city,
        state: account.state,
        country: account.country,
        image: account.image,
        experienceLevel: account.experienceLevel ?? null,
      },
      teachers: teachers.map((teacher) => ({
        teacherId: teacher.userId,
        teacherName: teacher.name,
        teacherImage: orUndefined(teacher.image),
        isActive: teacher.isActive,
        startDate: toDate(teacher.startDate),
        maxLessonsPerWeek: teacher.maxLessonsPerWeek,
        lessonDuration: teacher.lessonDuration,
        nextLessonAt: toOptionalDate(teacher.nextLessonAt),
        totalLessons: teacher.totalLessons,
      })),
      createdAt: toDate(profile.createdAt),
      updatedAt: toDate(profile.updatedAt),
    },
  };
}

/** O legado filtrava por id de **usuário** do professor; a API, pelo perfil. */
async function teacherProfileId(
  teacherUserId: string,
  token?: string
): Promise<string | undefined> {
  const data = await portalGet<{
    teachers: Array<{ teacher: { id: string; userId: string } }>;
  }>('/student/teachers', undefined, token);

  return data.teachers.find((rel) => rel.teacher.userId === teacherUserId)
    ?.teacher.id;
}

// ====================================
// CALENDÁRIO
// ====================================

export function studentCalendarEvent(
  event: ApiCalendarEvent & { lesson: NonNullable<ApiCalendarEvent['lesson']> }
): StudentCalendarEvent {
  const start = toDate(event.start);

  return {
    id: event.id,
    title: event.title,
    start,
    end: toDate(event.end),
    type: 'lesson',
    status: event.status as StudentCalendarEvent['status'],
    teacher: {
      id: event.counterpart.userId,
      name: event.counterpart.name,
      image: orUndefined(event.counterpart.image),
    },
    location: orUndefined(event.location),
    description: orUndefined(event.description),
    objectives: event.lesson.objectives,
    homework: orUndefined(event.lesson.homework),
    publicNotes: orUndefined(event.lesson.publicNotes),
    ...lessonColors(event.status, 'student', start),
    details: {
      workScoreIds: event.lesson.workScoreIds,
      topics: event.lesson.topics,
      techniques: event.lesson.techniques,
      lessonSummary: orUndefined(event.lesson.lessonSummary),
      skillsWorked: [],
      improvements: [],
      challenges: [],
      studentProgress: undefined,
      nextLessonPrep: undefined,
      canProvideFeedback: event.lesson.canGiveFeedback,
      studentFeedback: orUndefined(event.lesson.studentFeedback),
    },
  };
}

/**
 * Calendário do aluno no período. Só aulas, como no legado; resumo e contagem
 * por status saem dos próprios eventos.
 */
export async function loadStudentCalendar(
  startDate: Date,
  endDate: Date,
  options: StudentCalendarOptions = {},
  token?: string
) {
  const teacherId = options.teacherId
    ? await teacherProfileId(options.teacherId, token)
    : undefined;

  const data = await portalGet<{ events: ApiCalendarEvent[] }>(
    '/calendar',
    {
      as: 'student',
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      teacherId,
    },
    token
  );

  const events = data.events
    .filter(
      (
        event
      ): event is ApiCalendarEvent & {
        lesson: NonNullable<ApiCalendarEvent['lesson']>;
      } => event.type === 'lesson' && Boolean(event.lesson)
    )
    .map(studentCalendarEvent);

  const count = (status: string) =>
    events.filter((event) => event.status === status).length;

  const response: {
    events: StudentCalendarEvent[];
    stats?: {
      totalLessons: number;
      completedLessons: number;
      upcomingLessons: number;
      practiceHours: number;
      attendanceRate: number;
    };
    period: { start: Date; end: Date; view: string };
    metadata: {
      totalEvents: number;
      lessonCount: number;
      byStatus: {
        scheduled: number;
        completed: number;
        cancelled: number;
        noShow: number;
      };
    };
  } = {
    events,
    period: { start: startDate, end: endDate, view: options.view || 'month' },
    metadata: {
      totalEvents: events.length,
      lessonCount: events.length,
      byStatus: {
        scheduled: count('SCHEDULED'),
        completed: count('COMPLETED'),
        cancelled: count('CANCELLED'),
        noShow: count('NO_SHOW'),
      },
    },
  };

  if (options.includeStats) {
    const completed = events.filter((event) => event.status === 'COMPLETED');
    const practiceHours = completed.reduce(
      (total, event) =>
        total + (event.end.getTime() - event.start.getTime()) / 3_600_000,
      0
    );
    // Presença só sobre aula já resolvida (dada ou falta), como a API conta.
    const attended = completed.length + count('NO_SHOW');

    response.stats = {
      totalLessons: events.length,
      completedLessons: completed.length,
      upcomingLessons: count('SCHEDULED'),
      practiceHours: Math.round(practiceHours * 10) / 10,
      attendanceRate:
        attended > 0
          ? Math.round((completed.length / attended) * 1000) / 10
          : 0,
    };
  }

  return response;
}

// ====================================
// AULAS
// ====================================

/**
 * Aula na visão do aluno, no formato das telas dele: campos ausentes como
 * `undefined` (não `null`) e sem o que é só do professor.
 */
function studentLessonRow(lesson: ApiLesson, studentLevel?: string) {
  const row = legacyLessonRow(lesson, studentLevel);

  return {
    ...row,
    description: orUndefined(row.description),
    location: orUndefined(row.location),
    recurrenceType: orUndefined(row.recurrenceType),
    parentLessonId: orUndefined(row.parentLessonId),
    homework: orUndefined(row.homework),
    teacherNotes: undefined,
    publicNotes: orUndefined(row.publicNotes),
    studentFeedback: orUndefined(row.studentFeedback),
    lessonSummary: orUndefined(row.lessonSummary),
    studentProgress: undefined,
    studentPresent: orUndefined(row.studentPresent),
    punctuality: undefined,
    engagement: undefined,
    preparation: undefined,
    teacher: { ...row.teacher, image: orUndefined(row.teacher.image) },
    student: { ...row.student, image: orUndefined(row.student.image) },
    // A API não devolve a data de atualização da aula.
    updatedAt: row.createdAt,
  };
}

export async function loadStudentLessons(
  filters: StudentLessonFilters = {},
  token?: string
): Promise<{
  lessons: ReturnType<typeof studentLessonRow>[];
  pagination: OffsetPagination;
}> {
  const limit = Math.min(filters.limit || 50, 100);
  const offset = filters.offset || 0;

  const data = await portalGet<{
    lessons: ApiLesson[];
    pagination: ApiPagination;
  }>(
    '/lessons',
    {
      as: 'student',
      page: pageOf(offset, limit),
      limit,
      status: filters.status,
      from: filters.dateFrom,
      to: filters.dateTo,
    },
    token
  );

  // A API não filtra por professor do lado do aluno; o recorte vale na página.
  const lessons = filters.teacherId
    ? data.lessons.filter(
        (lesson) => lesson.teacher.userId === filters.teacherId
      )
    : data.lessons;

  return {
    lessons: lessons.map((lesson) => studentLessonRow(lesson)),
    pagination: offsetPagination(data.pagination, offset, lessons.length),
  };
}

/**
 * Detalhe de aula para o aluno. A API não devolve série recorrente relacionada
 * nem as notas privadas do professor; `relatedLessons` vem vazio.
 */
export async function loadStudentLesson(lessonId: string, token?: string) {
  const [lesson, assignments, profile] = await Promise.all([
    portalGet<ApiLesson>(`/lessons/${lessonId}`, undefined, token),
    portalGet<{ assignments: ApiAssignment[] }>(
      '/assignments',
      { as: 'student', lessonId, limit: 100 },
      token
    ),
    portalGet<{ student: ApiStudentBlock | null }>(
      '/profile',
      { include: 'student' },
      token
    ),
  ]);

  const relationship = profile.student?.teachers.find(
    (teacher) => teacher.teacherId === lesson.teacher.id
  );

  const completed = await collectPages<ApiLesson>(
    '/lessons',
    'lessons',
    { as: 'student', status: 'COMPLETED' },
    token,
    { maxPages: 3 }
  );

  const row = studentLessonRow(lesson, profile.student?.profile.level);

  return {
    ...row,
    relationship: {
      totalLessons: relationship?.totalLessons ?? 0,
      completedLessons: completed.items.filter(
        (item) => item.teacher.id === lesson.teacher.id
      ).length,
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
    relatedLessons: [] as Array<{
      id: string;
      title: string;
      scheduledAt: Date;
      status: string;
    }>,
    permissions: {
      canEdit: false,
      canCancel: false,
      canReschedule: false,
      canViewTeacherNotes: false,
      canAddFeedback: lesson.status === 'COMPLETED',
      canMarkAttendance: false,
    },
  };
}

// ====================================
// TAREFAS
// ====================================

/**
 * Tarefas do aluno. As estatísticas são as da API — sobre o conjunto todo, e
 * não sobre a página como no legado.
 */
export async function loadStudentAssignments(
  filters: StudentAssignmentFilters = {},
  token?: string
) {
  const limit = Math.min(filters.limit || 50, 100);
  const offset = filters.offset || 0;

  const data = await portalGet<{
    assignments: ApiAssignment[];
    stats: ApiAssignmentStats;
    pagination: ApiPagination;
  }>(
    '/assignments',
    {
      as: 'student',
      page: pageOf(offset, limit),
      limit,
      status: filters.status,
      lessonId: filters.lessonId,
      order: 'desc',
    },
    token
  );

  const assignments = filters.teacherId
    ? data.assignments.filter(
        (assignment) => assignment.lesson.teacher.userId === filters.teacherId
      )
    : data.assignments;

  return {
    assignments: assignments.map(legacyAssignmentRow),
    stats: data.stats,
    pagination: offsetPagination(data.pagination, offset, assignments.length),
  };
}

export async function loadStudentAssignmentDetails(
  assignmentId: string,
  token?: string
): Promise<StudentAssignmentDetailsResponse> {
  const assignment = await portalGet<ApiAssignment>(
    `/assignments/${assignmentId}`,
    undefined,
    token
  );
  const row = legacyAssignmentRow(assignment);

  return {
    success: true,
    userRole: 0,
    assignment: {
      ...row,
      lesson: row.lesson,
      workScores: legacyWorkScores(assignment.workScores),
      progressMilestones: milestonesObject(assignment.submissions.milestones),
      permissions: {
        canEdit: false,
        canDelete: false,
        canComplete: assignment.permissions?.canComplete ?? false,
        // No legado "feedback" do aluno eram as notas e a nota dele.
        canAddFeedback: true,
        canAddSubmission: assignment.permissions?.canSubmit ?? false,
      },
    },
  };
}
