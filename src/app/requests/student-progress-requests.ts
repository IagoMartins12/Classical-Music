// app/requests/student-progress-requests.ts - Queries diretas para progresso do aluno

import { unstable_cache } from 'next/cache';
import prisma from '@/app/libs/prismadb';

// ====================================
// TYPES AND INTERFACES
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
// DIRECT DATABASE QUERIES
// ====================================

// Buscar dados completos de progresso do aluno
export const getStudentProgressData = unstable_cache(
  async (
    userId: string,
    period: string = '6months' // '3months', '6months', '1year', 'all'
  ): Promise<StudentProgressResponse | null> => {
    try {
      console.log(
        `📊 [STUDENT-PROGRESS] Loading progress data for user ${userId} - Period: ${period}`
      );

      // 1. Verificar se aluno existe
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        select: {
          id: true,
          currentStreak: true,
          longestStreak: true,
          enrollmentDate: true,
        },
      });

      if (!studentProfile) {
        console.log(
          `❌ [STUDENT-PROGRESS] Student profile not found for user ${userId}`
        );
        return null;
      }

      const studentId = studentProfile.id;
      const now = new Date();

      // Calcular período
      let startDate = new Date();
      let periodLabel = '';

      switch (period) {
        case '3months':
          startDate.setMonth(now.getMonth() - 3);
          periodLabel = 'Últimos 3 meses';
          break;
        case '6months':
          startDate.setMonth(now.getMonth() - 6);
          periodLabel = 'Últimos 6 meses';
          break;
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1);
          periodLabel = 'Último ano';
          break;
        case 'all':
        default:
          startDate = studentProfile.enrollmentDate || new Date('2020-01-01');
          periodLabel = 'Todo o período';
          break;
      }

      // 2. ESTATÍSTICAS BÁSICAS
      console.log('📈 Calculating basic statistics...');

      const [lessonsData, assignmentsData, worksData, annotationsData] =
        await Promise.all([
          // Lessons
          Promise.all([
            prisma.lesson.count({
              where: { studentId, scheduledAt: { gte: startDate, lte: now } },
            }),
            prisma.lesson.count({
              where: {
                studentId,
                status: 'COMPLETED',
                scheduledAt: { gte: startDate, lte: now },
              },
            }),
            prisma.lesson.aggregate({
              where: {
                studentId,
                status: 'COMPLETED',
                scheduledAt: { gte: startDate, lte: now },
              },
              _sum: { duration: true },
              _avg: { engagement: true },
            }),
            prisma.lesson.count({
              where: { studentId, status: 'NO_SHOW' },
            }),
          ]),

          // Assignments
          Promise.all([
            prisma.assignment.count({
              where: {
                studentId,
                createdAt: { gte: startDate, lte: now },
              },
            }),
            prisma.assignment.count({
              where: {
                studentId,
                isCompleted: true,
                createdAt: { gte: startDate, lte: now },
              },
            }),
          ]),

          // Works
          Promise.all([
            prisma.wantToLearn.count({
              where: { userId, addedAt: { gte: startDate, lte: now } },
            }),
            prisma.learned.count({
              where: { userId, learnedAt: { gte: startDate, lte: now } },
            }),
          ]),

          // Annotations
          Promise.all([
            prisma.workAnnotation.count({
              where: { userId, createdAt: { gte: startDate, lte: now } },
            }),
            prisma.workAnnotation.count({
              where: {
                userId,
                helpfulCount: { gt: 0 },
                createdAt: { gte: startDate, lte: now },
              },
            }),
          ]),
        ]);

      const [totalLessons, completedLessons, lessonAggregates, noShowLessons] =
        lessonsData;
      const [totalAssignments, completedAssignments] = assignmentsData;
      const [wantToLearnWorks, learnedWorks] = worksData;
      const [totalAnnotations, helpfulAnnotations] = annotationsData;

      const totalStudyHours = (lessonAggregates._sum.duration || 0) / 60;
      const avgLessonRating = lessonAggregates._avg.engagement || 0;
      const attendanceRate =
        totalLessons > 0
          ? ((totalLessons - noShowLessons) / totalLessons) * 100
          : 100;
      const assignmentCompletionRate =
        totalAssignments > 0
          ? (completedAssignments / totalAssignments) * 100
          : 0;

      // Calcular consistência de estudo (semanas com pelo menos 1 aula)
      const weeksInPeriod = Math.ceil(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      // Buscar aulas completadas e processar no JavaScript
      const lessonsInPeriod = await prisma.lesson.findMany({
        where: {
          studentId: studentId,
          status: 'COMPLETED',
          scheduledAt: {
            gte: startDate,
            lte: now,
          },
        },
        select: {
          scheduledAt: true,
        },
      });

      // Calcular semanas únicas
      const weekKeys = new Set<string>();
      lessonsInPeriod.forEach((lesson) => {
        const date = new Date(lesson.scheduledAt);
        // Pegar o início da semana (segunda-feira)
        const startOfWeek = new Date(date);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        // Usar YYYY-MM-DD como chave única da semana
        weekKeys.add(startOfWeek.toISOString().split('T')[0]);
      });

      const weekCount = weekKeys.size;

      const studyConsistency =
        weeksInPeriod > 0 ? (weekCount / weeksInPeriod) * 100 : 0;

      const stats: StudentProgressStats = {
        totalLessons,
        completedLessons,
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
        avgLessonRating: Math.round(avgLessonRating * 10) / 10,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        currentStreak: studentProfile.currentStreak,
        longestStreak: studentProfile.longestStreak,
        totalAssignments,
        completedAssignments,
        assignmentCompletionRate:
          Math.round(assignmentCompletionRate * 10) / 10,
        totalWorks: wantToLearnWorks + learnedWorks,
        learnedWorks,
        wantToLearnWorks,
        totalAnnotations,
        helpfulAnnotations,
        studyConsistency: Math.round(studyConsistency * 10) / 10,
      };

      // 3. DADOS MENSAIS PARA GRÁFICOS
      console.log('📊 Generating monthly progress data...');

      const monthlyData: MonthlyProgressData[] = [];
      const monthsToShow =
        period === 'all'
          ? 12
          : period === '1year'
          ? 12
          : period === '6months'
          ? 6
          : 3;

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const [
          monthLessons,
          monthHours,
          monthWorks,
          monthAssignments,
          monthAnnotations,
        ] = await Promise.all([
          prisma.lesson.count({
            where: {
              studentId,
              status: 'COMPLETED',
              scheduledAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          prisma.lesson.aggregate({
            where: {
              studentId,
              status: 'COMPLETED',
              scheduledAt: { gte: monthStart, lte: monthEnd },
            },
            _sum: { duration: true },
          }),
          prisma.learned.count({
            where: {
              userId,
              learnedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          prisma.assignment.count({
            where: {
              studentId,
              isCompleted: true,
              completedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          prisma.workAnnotation.count({
            where: {
              userId,
              createdAt: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        monthlyData.push({
          month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
          year: monthStart.getFullYear(),
          completedLessons: monthLessons,
          studyHours:
            Math.round(((monthHours._sum.duration || 0) / 60) * 10) / 10,
          learnedWorks: monthWorks,
          completedAssignments: monthAssignments,
          newAnnotations: monthAnnotations,
        });
      }

      // 4. BREAKDOWN POR PROFESSORES
      console.log('👨‍🏫 Calculating teacher breakdown...');

      const teacherRelationships = await prisma.teacherStudent.findMany({
        where: { studentId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      const teacherBreakdown: TeacherProgressBreakdown[] = await Promise.all(
        teacherRelationships.map(async (rel) => {
          const [lessonStats, nextLesson, lastLesson] = await Promise.all([
            prisma.lesson.aggregate({
              where: {
                teacherId: rel.teacherId,
                studentId: studentId,
                scheduledAt: { gte: startDate, lte: now },
              },
              _count: { id: true },
              _sum: { duration: true },
              _avg: { engagement: true },
            }),
            prisma.lesson.findFirst({
              where: {
                teacherId: rel.teacherId,
                studentId: studentId,
                status: 'SCHEDULED',
                scheduledAt: { gte: now },
              },
              orderBy: { scheduledAt: 'asc' },
              select: { scheduledAt: true },
            }),
            prisma.lesson.findFirst({
              where: {
                teacherId: rel.teacherId,
                studentId: studentId,
                status: 'COMPLETED',
              },
              orderBy: { scheduledAt: 'desc' },
              select: { scheduledAt: true },
            }),
          ]);

          const relationshipDays = Math.floor(
            (now.getTime() - rel.startDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          let relationshipDuration = '';
          if (relationshipDays < 30) {
            relationshipDuration = `${relationshipDays} dias`;
          } else if (relationshipDays < 365) {
            const months = Math.floor(relationshipDays / 30);
            relationshipDuration = `${months} ${
              months === 1 ? 'mês' : 'meses'
            }`;
          } else {
            const years = Math.floor(relationshipDays / 365);
            const remainingMonths = Math.floor((relationshipDays % 365) / 30);
            relationshipDuration = `${years} ${years === 1 ? 'ano' : 'anos'}`;
            if (remainingMonths > 0) {
              relationshipDuration += ` e ${remainingMonths} ${
                remainingMonths === 1 ? 'mês' : 'meses'
              }`;
            }
          }

          return {
            teacherId: rel.teacher.user.id,
            teacherName:
              `${rel.teacher.user.firstName} ${rel.teacher.user.lastName}`.trim(),
            teacherImage: rel.teacher.user.image || undefined,
            totalLessons: lessonStats._count.id,
            completedLessons: lessonStats._count.id,
            studyHours:
              Math.round(((lessonStats._sum.duration || 0) / 60) * 10) / 10,
            avgRating: Math.round((lessonStats._avg.engagement || 0) * 10) / 10,
            relationshipDuration,
            specialties: rel.teacher.specialties || [],
            lastLessonDate: lastLesson?.scheduledAt,
            nextLessonDate: nextLesson?.scheduledAt,
          };
        })
      );

      // 5. PROGRESSO DE OBRAS
      console.log('🎵 Loading work progress...');

      const [wantToLearnData, learnedData] = await Promise.all([
        prisma.wantToLearn.findMany({
          where: { userId },
          include: {
            work: {
              include: {
                composer: { select: { name: true } },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        }),
        prisma.learned.findMany({
          where: { userId },
          include: {
            work: {
              include: {
                composer: { select: { name: true } },
              },
            },
          },
          orderBy: { learnedAt: 'desc' },
        }),
      ]);

      const workProgress: WorkProgressData[] = [
        ...wantToLearnData.map((item) => ({
          workId: item.work.id,
          workTitle: item.work.title,
          composer: item.work.composer.name,
          status: 'wanting' as const,
          difficulty: item.difficulty || undefined,
          addedDate: item.addedAt,
          annotations: 0, // TODO: count annotations for this work
        })),
        ...learnedData.map((item) => ({
          workId: item.work.id,
          workTitle: item.work.title,
          composer: item.work.composer.name,
          status: 'learned' as const,
          difficulty: item.difficulty || undefined,
          addedDate: item.studyStartDate || item.learnedAt,
          learnedDate: item.learnedAt,
          studyDuration: item.studyDuration || undefined,
          mastery: item.mastery,
          annotations: 0, // TODO: count annotations for this work
        })),
      ];

      // 6. BREAKDOWN DE ASSIGNMENTS POR TIPO
      console.log('📝 Calculating assignment breakdown...');

      const assignmentTypeData = await prisma.assignment.groupBy({
        by: ['type'],
        where: {
          studentId,
          createdAt: { gte: startDate, lte: now },
        },
        _count: { id: true },
        _sum: { actualTime: true },
      });

      const assignmentBreakdown: AssignmentTypeBreakdown[] = await Promise.all(
        assignmentTypeData.map(async (typeData) => {
          const completed = await prisma.assignment.count({
            where: {
              studentId,
              type: typeData.type,
              isCompleted: true,
              createdAt: { gte: startDate, lte: now },
            },
          });

          return {
            type: typeData.type,
            total: typeData._count.id,
            completed,
            completionRate:
              typeData._count.id > 0
                ? (completed / typeData._count.id) * 100
                : 0,
            avgCompletionTime: typeData._sum.actualTime
              ? typeData._sum.actualTime / completed
              : 0,
          };
        })
      );

      // 7. HISTÓRICO DE STREAK (últimos 30 dias)
      console.log('🔥 Generating streak history...');

      const streakHistory = [];
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      for (let i = 29; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const [hasLesson, hasAssignment, hasAnnotation] = await Promise.all([
          prisma.lesson.findFirst({
            where: {
              studentId,
              status: 'COMPLETED',
              scheduledAt: { gte: dayStart, lte: dayEnd },
            },
            select: { id: true },
          }),
          prisma.assignment.findFirst({
            where: {
              studentId,
              isCompleted: true,
              completedAt: { gte: dayStart, lte: dayEnd },
            },
            select: { id: true },
          }),
          prisma.workAnnotation.findFirst({
            where: {
              userId,
              createdAt: { gte: dayStart, lte: dayEnd },
            },
            select: { id: true },
          }),
        ]);

        const activities = [];
        if (hasLesson) activities.push('Aula completada');
        if (hasAssignment) activities.push('Assignment completado');
        if (hasAnnotation) activities.push('Anotação criada');

        streakHistory.push({
          date: day,
          hasActivity: activities.length > 0,
          activities,
        });
      }

      // 8. CONQUISTAS/ACHIEVEMENTS
      const achievements = [
        ...(completedLessons >= 10
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
        ...(learnedWorks >= 5
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
        ...(studentProfile.currentStreak >= 7
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

      const progressResponse: StudentProgressResponse = {
        stats,
        monthlyData,
        teacherBreakdown,
        workProgress,
        assignmentBreakdown,
        streakHistory,
        achievements,
        period: {
          start: startDate,
          end: now,
          label: periodLabel,
        },
      };

      console.log(
        `✅ [STUDENT-PROGRESS] Progress data loaded successfully - ${completedLessons} lessons, ${learnedWorks} works learned`
      );

      return progressResponse;
    } catch (error) {
      console.error(
        '❌ [STUDENT-PROGRESS] Error loading progress data:',
        error
      );
      return null;
    }
  },
  ['student-progress-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['student-progress'],
  }
);

// Buscar dados de progresso por período específico
export const getStudentProgressByPeriod = async (
  userId: string,
  period: string
): Promise<StudentProgressResponse | null> => {
  return getStudentProgressData(userId, period);
};

// Cache invalidation
export async function revalidateStudentProgressCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('student-progress');
  revalidateTag('student-progress-data');
}
