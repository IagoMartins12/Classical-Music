// app/requests/teacher-request.ts — telas do professor pela API (Etapa 4)
//
// Só para as páginas servidoras. A API identifica o professor pelo token do
// cookie; o `userId` fica na assinatura só para as páginas não mudarem. Sem
// sessão ou com erro, `null`, como no legado. As chamadas de navegador que
// moravam aqui foram para `portal/teacher-actions.ts`.
import { getServerAccessToken } from '@/app/libs/api/server-session';
import {
  loadTeacherAssignmentDetails,
  loadTeacherAssignmentEdit,
  loadTeacherAssignments,
  loadTeacherCalendar,
  loadTeacherDashboard,
  loadTeacherLessonDetails,
  loadTeacherLessons,
  loadTeacherProfile,
  loadTeacherStudentDetail,
  loadTeacherStudents,
} from './portal/teacher';
import { apiErrorMessage, withServerToken } from './portal/server';

// ====================================
// TIPOS (os do legado)
// ====================================

/** Status do convite do aluno, como o enum do banco. */
export type StudentInviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | string;

export interface TeacherProfile {
  id: string;
  userId: string;
  specialties?: string[];
  bio?: string | null;
  experience?: string | null;
  education?: string | null;
  isPublicProfile: boolean;
  status: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string | null;
    image?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
  };
}

export interface TeacherDashboardData {
  dashboard: {
    stats: {
      totalStudents: number;
      activeStudents: number;
      lessonsThisWeek: number;
      lessonsThisMonth: number;
      completedLessons: number;
      cancelledLessons: number;
      avgLessonsPerWeek: number;
      completionRate: number;
    };
    upcomingLessons: Array<{
      id: string;
      title: string;
      scheduledAt: Date;
      duration: number;
      student: {
        id: string;
        name: string;
        image?: string;
        level: string;
      };
      isToday: boolean;
      isNext: boolean;
      location?: string;
      objectives: string[];
    }>;
    todayLessons: any[];
    recentActivities: any[];
    activeStudents: any[];
    weeklySchedule: any[];
  };
  timestamp: string;
}

export interface TeacherStudentsData {
  success: boolean;
  students: Array<{
    relationshipId: string;
    student: {
      /** Id de usuário do aluno (o que as rotas do legado usam). */
      id: string;
      /** Id de perfil do aluno (o que a API usa para filtrar aulas e tarefas). */
      profileId?: string;
      name: string;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      location?: string | null;
      experienceLevel?: string | null;
      level: string;
      mainInstrument?: string | null;
      musicalGoals?: string[];
      practiceTime?: number | null;
    };
    relationship: {
      isActive: boolean;
      startDate: Date;
      endDate?: Date | null;
      pausedAt?: Date | null;
      pauseReason?: string | null;
      maxLessonsPerWeek: number;
      lessonDuration: number;
      preferredDays?: string[];
      preferredTimes?: string[];
      learningPlan?: string | null;
      currentFocus?: string[];
      teacherNotes?: string | null;
      inviteStatus?: StudentInviteStatus | null;
      inviteAcceptedAt?: Date | null;
      inviteDeclinedAt?: Date | null;
    };
    stats: {
      totalLessons: number;
      completedLessons: number;
      scheduledLessons: number;
      cancelledLessons: number;
      completionRate: number;
    };
    nextLesson?: {
      id: string;
      scheduledAt: Date;
      title: string;
      duration: number;
    } | null;
  }>;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface TeacherAssignmentData {
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
  student: {
    id: string;
    name: string;
    image?: string | null;
  };
  lesson: {
    id: string;
    title: string;
    scheduledAt: Date;
    teacher: {
      name: string;
      image?: string | null;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherAssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  averageTime: number;
}

export interface TeacherAssignmentsResponse {
  success: boolean;
  assignments: TeacherAssignmentData[];
  stats: TeacherAssignmentStats;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface TeacherReviewData {
  id: string;
  rating: number;
  comment?: string;
  isPublic: boolean;
  teachingQuality?: number;
  communication?: number;
  punctuality?: number;
  preparation?: number;
  patience?: number;
  motivation?: number;
  relationshipDuration?: string;
  lessonsCount?: number;
  wouldRecommend: boolean;
  student: {
    id: string;
    name: string;
    image?: string;
  };
  isModerated: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherReviewsStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  specificAverages: {
    teachingQuality: number;
    communication: number;
    punctuality: number;
    preparation: number;
    patience: number;
    motivation: number;
  };
  recommendationRate: number;
  publicReviews: number;
  privateReviews: number;
  recentReviews: number;
  thisMonthCount: number;
  lastMonthCount: number;
}

export interface TeacherReviewsResponse {
  success: boolean;
  reviews: TeacherReviewData[];
  stats: TeacherReviewsStats;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface TeacherProfileExtended {
  id: string;
  userId: string;
  averageRating: number;
  totalReviews: number;
  isPublicProfile: boolean;
  bio?: string | null;
  specialties: string[];
  experience?: string | null;
  education?: string | null;
  status: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string | null;
    image?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
  };
}

export interface TeacherLessonsStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  averageDuration: number;
  completionRate: number;
}

export interface TeacherLessonsResponse {
  success: boolean;
  lessons: any[];
  stats: TeacherLessonsStats;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface TeacherLessonDetailsResponse {
  success: boolean;
  lesson: any;
  userRole: number;
  isTeacher: boolean;
  isStudent: boolean;
}

export interface TeacherAssignmentDetailsData {
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
    student: {
      id: string;
      name: string;
      image?: string | null;
    };
    lesson: {
      id: string;
      title: string;
      scheduledAt: Date;
      teacher: {
        name: string;
        image?: string | null;
      };
    };
    workScores: Array<{
      id: string;
      title: string;
      composer: string;
      workTitle: string;
      type: string;
      downloadUrl?: string;
    }>;
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

export interface TeacherAssignmentDetailsResponse {
  success: boolean;
  assignment?: TeacherAssignmentDetailsData['assignment'];
  userRole?: number;
  error?: string;
}

export interface TeacherAssignmentEditData {
  assignment: {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    dueDate?: Date | null;
    estimatedTime?: number | null;
    workScoreIds: string[];
    worksIds: string[];
    exercises: string[];
    practiceGoals: string[];
    tempoTargets?: any;
    technicalGoals: string[];
    musicalGoals: string[];
    status: string;
    isCompleted: boolean;
    student: {
      id: string;
      name: string;
      image?: string | null;
    };
    lesson: {
      id: string;
      title: string;
      scheduledAt: Date;
    };
    workScores: Array<{
      id: string;
      title: string;
      composer: string;
      workTitle: string;
      type: string;
      downloadUrl?: string;
    }>;
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
  }>;
}

export interface TeacherAssignmentEditResponse {
  success: boolean;
  assignment?: TeacherAssignmentEditData['assignment'];
  students?: TeacherAssignmentEditData['students'];
  error?: string;
}

// ====================================
// PÁGINAS SERVIDORAS
// ====================================

export const getTeacherDashboardData = (_userId: string) =>
  withServerToken('TEACHER-DASHBOARD', loadTeacherDashboard);

export const getTeacherStudentsData = (
  _userId: string,
  status: string = 'active',
  limit: number = 20,
  offset: number = 0
) =>
  withServerToken('TEACHER-STUDENTS', (token) =>
    loadTeacherStudents(status, limit, offset, token)
  );

/** Próximos 30 dias, para o painel. */
export const getTeacherCalendarData = (_userId: string) =>
  withServerToken('TEACHER-CALENDAR', async (token) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30);

    const { events } = await loadTeacherCalendar(
      start,
      end,
      false,
      false,
      token
    );

    return {
      success: true,
      events,
      period: { start, end, view: 'month' },
      metadata: { totalEvents: events.length, lessonCount: events.length },
    };
  });

export const getTeacherProfile = (_userId: string) =>
  withServerToken('TEACHER-PROFILE', loadTeacherProfile);

export const getTeacherCalendarDataDirect = (
  _userId: string,
  startDate: Date,
  endDate: Date,
  includeStats: boolean = false,
  detectConflicts: boolean = false
) =>
  withServerToken('TEACHER-CALENDAR-DATA', (token) =>
    loadTeacherCalendar(
      startDate,
      endDate,
      includeStats,
      detectConflicts,
      token
    )
  );

export const getTeacherStudentDetailData = (
  _userId: string,
  studentId: string
) =>
  withServerToken('TEACHER-STUDENT-DETAIL', (token) =>
    loadTeacherStudentDetail(studentId, token)
  );

export const getTeacherAssignmentsData = (
  _userId: string,
  studentUserId?: string,
  status?: string,
  lessonId?: string,
  limit: number = 50,
  offset: number = 0
) =>
  withServerToken('TEACHER-ASSIGNMENTS', (token) =>
    loadTeacherAssignments(
      studentUserId,
      status,
      lessonId,
      limit,
      offset,
      token
    )
  );

export const getTeacherLessonsData = (
  _userId: string,
  studentId?: string,
  status?: string,
  dateFrom?: Date,
  dateTo?: Date,
  limit: number = 50,
  offset: number = 0,
  includeStats: boolean = true
) =>
  withServerToken('TEACHER-LESSONS', (token) =>
    loadTeacherLessons(
      studentId,
      status,
      dateFrom,
      dateTo,
      limit,
      offset,
      includeStats,
      token
    )
  );

export const getTeacherLessonDetailsData = (
  lessonId: string,
  _userId: string,
  _userRole: number = 1
) =>
  withServerToken('TEACHER-LESSON-DETAILS', (token) =>
    loadTeacherLessonDetails(lessonId, token)
  );

export async function getTeacherAssignmentDetailsData(
  assignmentId: string,
  _userId: string,
  _userRole: number = 1
): Promise<TeacherAssignmentDetailsResponse> {
  const token = await getServerAccessToken();

  if (!token) {
    return { success: false, error: 'Sessão expirada' };
  }

  try {
    return await loadTeacherAssignmentDetails(assignmentId, token);
  } catch (error) {
    return {
      success: false,
      error: apiErrorMessage(error, 'Tarefa não encontrada ou acesso negado'),
    };
  }
}

export async function getTeacherAssignmentEditData(
  assignmentId: string,
  _userId: string
): Promise<TeacherAssignmentEditResponse> {
  const token = await getServerAccessToken();

  if (!token) {
    return { success: false, error: 'Sessão expirada' };
  }

  try {
    return await loadTeacherAssignmentEdit(assignmentId, token);
  } catch (error) {
    return {
      success: false,
      error: apiErrorMessage(error, 'Tarefa não encontrada ou acesso negado'),
    };
  }
}

/**
 * Sem cache no servidor desde a Etapa 4 (tudo `no-store`); fica para as rotas
 * legadas que ainda chamam, até saírem na Etapa 7.
 */
export async function revalidateTeacherCache(_userId?: string) {}
