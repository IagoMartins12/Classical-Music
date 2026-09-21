// app/requests/portal/student-progress.ts — progresso do aluno pela API (Etapa 4)
//
// O relatório de progresso da API é do professor. O aluno monta o dele com o
// que pode ler: as próprias aulas, tarefas e obras. Engajamento é avaliação
// privada do professor e não chega ao aluno (nota média 0); das anotações, só
// entram as recentes do painel, porque a API não conta as do aluno.
// Isomórfico: o servidor passa o token; o navegador vai pela sessão.
import {
  collectPages,
  portalGet,
  relationshipDuration,
  toDate,
  toOptionalDate,
} from './common';
import type { ApiAssignment, ApiLesson } from './records';
import type { ApiStudyProgress } from './student';

// ====================================
// TIPOS DO LEGADO
// ====================================

export interface StudentProgressStats {
  totalLessons: number;
  completedLessons: number;
  totalStudyHours: number;
  avgLessonRating: number;
  attendanceRate: number;
  currentStreak: number;
  longestStreak: number;
  totalAssignments: number;
  completedAssignments: number;
  assignmentCompletionRate: number;
  totalWorks: number;
  learnedWorks: number;
  wantToLearnWorks: number;
  totalAnnotations: number;
  helpfulAnnotations: number;
  studyConsistency: number; // porcentagem de semanas com pelo menos 1 aula
}

export interface MonthlyProgressData {
  month: string;
  year: number;
  completedLessons: number;
  studyHours: number;
  learnedWorks: number;
  completedAssignments: number;
  newAnnotations: number;
}

export interface TeacherProgressBreakdown {
  teacherId: string;
  teacherName: string;
  teacherImage?: string;
  totalLessons: number;
  completedLessons: number;
  studyHours: number;
  avgRating: number;
  relationshipDuration: string;
  specialties: string[];
  lastLessonDate?: Date;
  nextLessonDate?: Date;
}

export interface WorkProgressData {
  workId: string;
  workTitle: string;
  composer: string;
  status: 'wanting' | 'learned';
  difficulty?: string;
  addedDate: Date;
  learnedDate?: Date;
  studyDuration?: number; // em semanas
  mastery?: number;
  annotations: number;
}

export interface AssignmentTypeBreakdown {
  type: string;
  total: number;
  completed: number;
  completionRate: number;
  avgCompletionTime: number; // em horas
}

export interface StudentProgressResponse {
  stats: StudentProgressStats;
  monthlyData: MonthlyProgressData[];
  teacherBreakdown: TeacherProgressBreakdown[];
  workProgress: WorkProgressData[];
  assignmentBreakdown: AssignmentTypeBreakdown[];
  streakHistory: Array<{
    date: Date;
    hasActivity: boolean;
    activities: string[];
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: Date;
    category: 'lessons' | 'works' | 'consistency' | 'assignments';
  }>;
  period: {
    start: Date;
    end: Date;
    label: string;
  };
}

// ====================================
// RESPOSTAS DA API
// ====================================

interface ApiLearningWork {
  id: string;
  title: string;
  composer: { name: string };
}

interface ApiWantToLearn {
  workId: string;
  addedAt: string;
  difficulty?: string | null;
  work?: ApiLearningWork;
}

interface ApiLearned {
  workId: string;
  learnedAt: string;
  mastery: number;
  difficulty?: string | null;
  studyStartDate?: string | null;
  studyDuration?: number | null;
  work?: ApiLearningWork;
}

interface ApiStudentProgressProfile {
  student: {
    profile: {
      currentStreak: number;
      longestStreak: number;
      enrollmentDate: string | null;
    };
    teachers: Array<{
      teacherId: string;
      userId: string;
      name: string;
      image: string | null;
      specialties: string[];
      startDate: string;
      nextLessonAt: string | null;
    }>;
  } | null;
}

// ====================================
// CÁLCULO
// ====================================

const DAY_MS = 24 * 60 * 60 * 1000;
const round1 = (value: number) => Math.round(value * 10) / 10;

function periodStart(
  period: string,
  enrollmentDate: string | null,
  now: Date
): { start: Date; label: string } {
  const start = new Date(now);

  switch (period) {
    case '3months':
      start.setMonth(now.getMonth() - 3);
      return { start, label: 'Últimos 3 meses' };
    case '6months':
      start.setMonth(now.getMonth() - 6);
      return { start, label: 'Últimos 6 meses' };
    case '1year':
      start.setFullYear(now.getFullYear() - 1);
      return { start, label: 'Último ano' };
    default:
      return {
        start: enrollmentDate ? toDate(enrollmentDate) : new Date('2020-01-01'),
        label: 'Todo o período',
      };
  }
}

function monthsToShow(period: string): number {
  if (period === '6months') return 6;
  if (period === '3months') return 3;
  return 12;
}

/** Segunda-feira da semana, como chave `AAAA-MM-DD`. */
function weekKey(date: Date): string {
  const monday = new Date(date);
  const day = date.getDay();
  monday.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

function between(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

export async function loadStudentProgress(
  period: string = '6months',
  token?: string
): Promise<StudentProgressResponse | null> {
  const [profile, wantToLearn, learned, dashboard] = await Promise.all([
    portalGet<ApiStudentProgressProfile>(
      '/profile',
      { include: 'student' },
      token
    ),
    portalGet<{ items: ApiWantToLearn[] }>(
      '/learning/want-to-learn',
      undefined,
      token
    ),
    portalGet<{ items: ApiLearned[] }>('/learning/learned', undefined, token),
    portalGet<{ studyProgress: ApiStudyProgress }>(
      '/dashboard',
      { as: 'student' },
      token
    ),
  ]);

  if (!profile.student) {
    return null;
  }

  const now = new Date();
  const { start, label } = periodStart(
    period,
    profile.student.profile.enrollmentDate,
    now
  );
  const months = monthsToShow(period);
  const monthsFrom = new Date(
    now.getFullYear(),
    now.getMonth() - (months - 1),
    1
  );
  const streakFrom = new Date(now.getTime() - 29 * DAY_MS);
  streakFrom.setHours(0, 0, 0, 0);

  // Aulas desde o ponto mais antigo que alguma seção precisa.
  const lessonsFrom = new Date(
    Math.min(start.getTime(), monthsFrom.getTime(), streakFrom.getTime())
  );

  const [lessonPages, assignmentPages] = await Promise.all([
    collectPages<ApiLesson>(
      '/lessons',
      'lessons',
      {
        as: 'student',
        from: lessonsFrom.toISOString(),
        to: now.toISOString(),
      },
      token
    ),
    collectPages<ApiAssignment>(
      '/assignments',
      'assignments',
      { as: 'student' },
      token
    ),
  ]);

  const lessons = lessonPages.items.map((lesson) => ({
    ...lesson,
    at: toDate(lesson.scheduledAt),
  }));
  const completedAll = lessons.filter(
    (lesson) => lesson.status === 'COMPLETED'
  );

  const periodLessons = lessons.filter((lesson) =>
    between(lesson.at, start, now)
  );
  const periodCompleted = periodLessons.filter(
    (lesson) => lesson.status === 'COMPLETED'
  );
  const periodNoShow = periodLessons.filter(
    (lesson) => lesson.status === 'NO_SHOW'
  ).length;
  const studyMinutes = periodCompleted.reduce(
    (sum, lesson) => sum + lesson.duration,
    0
  );

  const assignments = assignmentPages.items;
  const periodAssignments = assignments.filter((assignment) =>
    between(toDate(assignment.createdAt), start, now)
  );
  const periodCompletedAssignments = periodAssignments.filter(
    (assignment) => assignment.isCompleted
  );

  const periodWanting = wantToLearn.items.filter((item) =>
    between(toDate(item.addedAt), start, now)
  ).length;
  const periodLearned = learned.items.filter((item) =>
    between(toDate(item.learnedAt), start, now)
  ).length;

  const annotations = dashboard.studyProgress.recentAnnotations;
  const periodAnnotations = annotations.filter((annotation) =>
    between(toDate(annotation.createdAt), start, now)
  ).length;

  const weeksInPeriod = Math.ceil(
    (now.getTime() - start.getTime()) / (7 * DAY_MS)
  );
  const weeksWithLesson = new Set(
    periodCompleted.map((lesson) => weekKey(lesson.at))
  ).size;
  // Presença só sobre aula já resolvida (dada ou falta), como a API conta.
  const attended = periodCompleted.length + periodNoShow;

  const stats: StudentProgressStats = {
    totalLessons: periodLessons.length,
    completedLessons: periodCompleted.length,
    totalStudyHours: round1(studyMinutes / 60),
    avgLessonRating: 0,
    attendanceRate:
      attended > 0 ? round1((periodCompleted.length / attended) * 100) : 0,
    currentStreak: profile.student.profile.currentStreak,
    longestStreak: profile.student.profile.longestStreak,
    totalAssignments: periodAssignments.length,
    completedAssignments: periodCompletedAssignments.length,
    assignmentCompletionRate:
      periodAssignments.length > 0
        ? round1(
            (periodCompletedAssignments.length / periodAssignments.length) * 100
          )
        : 0,
    totalWorks: periodWanting + periodLearned,
    learnedWorks: periodLearned,
    wantToLearnWorks: periodWanting,
    totalAnnotations: periodAnnotations,
    helpfulAnnotations: 0,
    studyConsistency:
      weeksInPeriod > 0 ? round1((weeksWithLesson / weeksInPeriod) * 100) : 0,
  };

  const monthlyData: MonthlyProgressData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59,
      999
    );
    const inMonth = (value: string | Date | null | undefined) =>
      Boolean(value) &&
      between(toDate(value as string | Date), monthStart, monthEnd);

    const monthLessons = completedAll.filter((lesson) =>
      between(lesson.at, monthStart, monthEnd)
    );

    monthlyData.push({
      month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
      year: monthStart.getFullYear(),
      completedLessons: monthLessons.length,
      studyHours: round1(
        monthLessons.reduce((sum, lesson) => sum + lesson.duration, 0) / 60
      ),
      learnedWorks: learned.items.filter((item) => inMonth(item.learnedAt))
        .length,
      completedAssignments: assignments.filter(
        (assignment) =>
          assignment.isCompleted && inMonth(assignment.completedAt)
      ).length,
      newAnnotations: annotations.filter((annotation) =>
        inMonth(annotation.createdAt)
      ).length,
    });
  }

  const teacherBreakdown: TeacherProgressBreakdown[] =
    profile.student.teachers.map((teacher) => {
      const withTeacher = periodLessons.filter(
        (lesson) => lesson.teacher.id === teacher.teacherId
      );
      const completedWithTeacher = withTeacher.filter(
        (lesson) => lesson.status === 'COMPLETED'
      );
      const lastCompleted = completedAll
        .filter((lesson) => lesson.teacher.id === teacher.teacherId)
        .sort((a, b) => b.at.getTime() - a.at.getTime())[0];

      return {
        teacherId: teacher.userId,
        teacherName: teacher.name,
        teacherImage: teacher.image ?? undefined,
        totalLessons: withTeacher.length,
        completedLessons: completedWithTeacher.length,
        studyHours: round1(
          completedWithTeacher.reduce(
            (sum, lesson) => sum + lesson.duration,
            0
          ) / 60
        ),
        avgRating: 0,
        relationshipDuration: relationshipDuration(teacher.startDate, now),
        specialties: teacher.specialties ?? [],
        lastLessonDate: lastCompleted?.at,
        nextLessonDate: toOptionalDate(teacher.nextLessonAt),
      };
    });

  const workProgress: WorkProgressData[] = [
    ...wantToLearn.items.map((item) => ({
      workId: item.work?.id ?? item.workId,
      workTitle: item.work?.title ?? '',
      composer: item.work?.composer.name ?? '',
      status: 'wanting' as const,
      difficulty: item.difficulty ?? undefined,
      addedDate: toDate(item.addedAt),
      annotations: 0,
    })),
    ...learned.items.map((item) => ({
      workId: item.work?.id ?? item.workId,
      workTitle: item.work?.title ?? '',
      composer: item.work?.composer.name ?? '',
      status: 'learned' as const,
      difficulty: item.difficulty ?? undefined,
      addedDate: toDate(item.studyStartDate ?? item.learnedAt),
      learnedDate: toDate(item.learnedAt),
      studyDuration: item.studyDuration ?? undefined,
      mastery: item.mastery,
      annotations: 0,
    })),
  ];

  const byType = new Map<string, ApiAssignment[]>();
  for (const assignment of periodAssignments) {
    byType.set(assignment.type, [
      ...(byType.get(assignment.type) ?? []),
      assignment,
    ]);
  }

  const assignmentBreakdown: AssignmentTypeBreakdown[] = [...byType].map(
    ([type, rows]) => {
      const completed = rows.filter((assignment) => assignment.isCompleted);
      const actualTime = rows.reduce(
        (sum, assignment) => sum + (assignment.actualTime ?? 0),
        0
      );

      return {
        type,
        total: rows.length,
        completed: completed.length,
        completionRate: (completed.length / rows.length) * 100,
        avgCompletionTime:
          completed.length > 0 ? actualTime / completed.length : 0,
      };
    }
  );

  const streakHistory: StudentProgressResponse['streakHistory'] = [];

  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getTime() - i * DAY_MS);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const activities: string[] = [];

    if (completedAll.some((lesson) => between(lesson.at, dayStart, dayEnd))) {
      activities.push('Aula completada');
    }
    if (
      assignments.some(
        (assignment) =>
          assignment.completedAt &&
          between(toDate(assignment.completedAt), dayStart, dayEnd)
      )
    ) {
      activities.push('Assignment completado');
    }
    if (
      annotations.some((annotation) =>
        between(toDate(annotation.createdAt), dayStart, dayEnd)
      )
    ) {
      activities.push('Anotação criada');
    }

    streakHistory.push({
      date: day,
      hasActivity: activities.length > 0,
      activities,
    });
  }

  const achievements: StudentProgressResponse['achievements'] = [
    ...(stats.completedLessons >= 10
      ? [
          {
            id: 'lessons-10',
            title: 'Estudante Dedicado',
            description: 'Completou 10 aulas',
            earnedAt: now,
            category: 'lessons' as const,
          },
        ]
      : []),
    ...(stats.learnedWorks >= 5
      ? [
          {
            id: 'works-5',
            title: 'Explorador Musical',
            description: 'Aprendeu 5 obras diferentes',
            earnedAt: now,
            category: 'works' as const,
          },
        ]
      : []),
    ...(stats.currentStreak >= 7
      ? [
          {
            id: 'streak-7',
            title: 'Consistente',
            description: '7 dias consecutivos de atividade',
            earnedAt: now,
            category: 'consistency' as const,
          },
        ]
      : []),
  ];

  return {
    stats,
    monthlyData,
    teacherBreakdown,
    workProgress,
    assignmentBreakdown,
    streakHistory,
    achievements,
    period: { start, end: now, label },
  };
}
