// app/requests/teacher-request.ts - Refatorado com queries diretas ao banco

import { unstable_cache } from 'next/cache';
import prisma from '@/app/libs/prismadb';
import {
  CalendarConflict,
  CalendarEvent,
  CalendarStats,
} from '../(teacher)/teacher/calendar/pageServer';
import { StudentInviteStatus } from '@prisma/client';
import { TeacherProfileData } from '../(teacher)/teacher/profile/pageServer';

// ====================================
// TYPES (mantendo os existentes)
// ====================================

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
      id: string;
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

  // Avaliações específicas
  teachingQuality?: number;
  communication?: number;
  punctuality?: number;
  preparation?: number;
  patience?: number;
  motivation?: number;

  // Contexto
  relationshipDuration?: string;
  lessonsCount?: number;
  wouldRecommend: boolean;

  // Dados do aluno (anonimizados se público)
  student: {
    id: string;
    name: string;
    image?: string;
  };

  // Moderação
  isModerated: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNote?: string;

  // Timestamps
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
  recentReviews: number; // últimos 30 dias
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
  lessons: any[]; // Usando any para compatibilidade com as interfaces existentes
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
  lesson: any; // Interface compatível com pageServer existente
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
// 🚀 SERVER-SIDE FUNCTIONS (ACESSO DIRETO AO BANCO)
// ====================================

// Buscar dados do dashboard - DIRETO DO BANCO
export const getTeacherDashboardData = unstable_cache(
  async (userId: string): Promise<TeacherDashboardData | null> => {
    try {
      console.log(
        `📊 [TEACHER-DASHBOARD] Loading dashboard for user ${userId}`
      );

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-DASHBOARD] Teacher profile not found for user ${userId}`
        );
        return null;
      }

      const teacherId = teacherProfile.id;
      const now = new Date();

      // Calcular datas importantes
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(startOfToday.getDate() + 1);

      // 2. ESTATÍSTICAS BÁSICAS
      const [
        totalStudents,
        activeStudents,
        lessonsThisWeek,
        lessonsThisMonth,
        completedLessons,
        cancelledLessons,
        allLessons,
      ] = await Promise.all([
        prisma.teacherStudent.count({
          where: { teacherId, isActive: true },
        }),
        prisma.teacherStudent.count({
          where: {
            teacherId,
            isActive: true,
            student: {
              lessons: {
                some: {
                  teacherId,
                  scheduledAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          },
        }),
        prisma.lesson.count({
          where: {
            teacherId,
            scheduledAt: { gte: startOfWeek, lt: endOfWeek },
          },
        }),
        prisma.lesson.count({
          where: {
            teacherId,
            scheduledAt: { gte: startOfMonth, lt: endOfMonth },
          },
        }),
        prisma.lesson.count({
          where: { teacherId, status: 'COMPLETED' },
        }),
        prisma.lesson.count({
          where: { teacherId, status: 'CANCELLED' },
        }),
        prisma.lesson.count({
          where: { teacherId },
        }),
      ]);

      const completionRate =
        allLessons > 0 ? (completedLessons / allLessons) * 100 : 0;
      const avgLessonsPerWeek =
        allLessons > 0 ? allLessons / Math.max(1, 4) : 0; // Aproximação

      // 3. PRÓXIMAS AULAS
      const upcomingLessonsRaw = await prisma.lesson.findMany({
        where: {
          teacherId,
          status: 'SCHEDULED',
          scheduledAt: { gte: now },
        },
        include: {
          student: {
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
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      });

      const upcomingLessons = upcomingLessonsRaw.map((lesson, index) => ({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
        duration: lesson.duration,
        student: {
          id: lesson.student.user.id,
          name: `${lesson.student.user.firstName || ''} ${
            lesson.student.user.lastName || ''
          }`.trim(),
          image: lesson.student.user.image || undefined,
          level: lesson.student.level,
        },
        isToday:
          lesson.scheduledAt >= startOfToday && lesson.scheduledAt < endOfToday,
        isNext: index === 0,
        location: lesson.location || undefined,
        objectives: lesson.objectives,
      }));

      const todayLessons = upcomingLessons.filter((lesson) => lesson.isToday);

      // Montar dashboard final
      const dashboard = {
        stats: {
          totalStudents,
          activeStudents,
          lessonsThisWeek,
          lessonsThisMonth,
          completedLessons,
          cancelledLessons,
          avgLessonsPerWeek: Math.round(avgLessonsPerWeek * 10) / 10,
          completionRate: Math.round(completionRate * 10) / 10,
        },
        upcomingLessons,
        todayLessons,
        recentActivities: [], // TODO: Implementar se necessário
        activeStudents: [], // TODO: Implementar se necessário
        weeklySchedule: [], // TODO: Implementar se necessário
      };

      console.log(`✅ [TEACHER-DASHBOARD] Dashboard loaded successfully`);

      return {
        dashboard,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ [TEACHER-DASHBOARD] Error loading dashboard:', error);
      return null;
    }
  },
  ['teacher-dashboard-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['teacher-dashboard'],
  }
);

// Buscar alunos do professor - DIRETO DO BANCO
export const getTeacherStudentsData = unstable_cache(
  async (
    userId: string,
    status: string = 'active',
    limit: number = 20,
    offset: number = 0
  ): Promise<TeacherStudentsData | null> => {
    try {
      console.log(`📋 [TEACHER-STUDENTS] Loading students for user ${userId}`);

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-STUDENTS] Teacher profile not found for user ${userId}`
        );
        return null;
      }

      const teacherId = teacherProfile.id;

      // Montar where clause
      const whereClause: any = { teacherId };
      if (status === 'active') {
        whereClause.isActive = true;
      } else if (status === 'inactive') {
        whereClause.isActive = false;
      }

      // Buscar relacionamentos
      const [relationships, totalCount] = await Promise.all([
        prisma.teacherStudent.findMany({
          where: whereClause,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    image: true,
                    phone: true,
                    city: true,
                    state: true,
                    experienceLevel: true,
                  },
                },
              },
            },
          },
          orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
          take: limit,
          skip: offset,
        }),
        prisma.teacherStudent.count({ where: whereClause }),
      ]);

      // Formatar dados dos alunos
      const studentsFormatted = await Promise.all(
        relationships.map(async (rel) => {
          // Buscar estatísticas das aulas
          const lessonStats = await prisma.lesson.groupBy({
            by: ['status'],
            where: {
              teacherId,
              studentId: rel.student.id,
            },
            _count: { id: true },
          });

          const totalLessons = lessonStats.reduce(
            (sum, stat) => sum + stat._count.id,
            0
          );
          const completedLessons =
            lessonStats.find((s) => s.status === 'COMPLETED')?._count.id || 0;
          const scheduledLessons =
            lessonStats.find((s) => s.status === 'SCHEDULED')?._count.id || 0;
          const cancelledLessons =
            lessonStats.find((s) => s.status === 'CANCELLED')?._count.id || 0;

          // Próxima aula agendada
          const nextLesson = await prisma.lesson.findFirst({
            where: {
              teacherId,
              studentId: rel.student.id,
              status: 'SCHEDULED',
              scheduledAt: { gte: new Date() },
            },
            orderBy: { scheduledAt: 'asc' },
            select: {
              id: true,
              scheduledAt: true,
              title: true,
              duration: true,
            },
          });

          return {
            relationshipId: rel.id,
            student: {
              id: rel.student.user.id,
              name: `${rel.student.user.firstName || ''} ${
                rel.student.user.lastName || ''
              }`.trim(),
              email: rel.student.user.email,
              image: rel.student.user.image,
              phone: rel.student.user.phone,
              location:
                [rel.student.user.city, rel.student.user.state]
                  .filter(Boolean)
                  .join(', ') || null,
              experienceLevel: rel.student.user.experienceLevel,
              level: rel.student.level,
              mainInstrument: rel.student.mainInstrument,

              practiceTime: rel.student.practiceTime,
            },
            relationship: {
              isActive: rel.isActive,
              startDate: rel.startDate,
              endDate: rel.endDate,
              pausedAt: rel.pausedAt,
              pauseReason: rel.pauseReason,
              maxLessonsPerWeek: rel.maxLessonsPerWeek,
              lessonDuration: rel.lessonDuration,
              preferredDays: rel.preferredDays,
              preferredTimes: rel.preferredTimes,
              learningPlan: rel.learningPlan,
              currentFocus: rel.currentFocus,
              teacherNotes: rel.teacherNotes,
              inviteStatus: rel.inviteStatus,
              inviteAcceptedAt: rel.inviteAcceptedAt,
              inviteDeclinedAt: rel.inviteDeclinedAt,
            },
            stats: {
              totalLessons,
              completedLessons,
              scheduledLessons,
              cancelledLessons,
              completionRate:
                totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
            },
            nextLesson,
          };
        })
      );

      console.log(
        `✅ [TEACHER-STUDENTS] Loaded ${studentsFormatted.length} students`
      );

      return {
        success: true,
        students: studentsFormatted,
        pagination: {
          offset,
          limit,
          total: totalCount,
          hasMore: offset + studentsFormatted.length < totalCount,
        },
        summary: {
          total: totalCount,
          active: studentsFormatted.filter((s) => s.relationship.isActive)
            .length,
          inactive: studentsFormatted.filter((s) => !s.relationship.isActive)
            .length,
        },
      };
    } catch (error) {
      console.error('❌ [TEACHER-STUDENTS] Error loading students:', error);
      return null;
    }
  },
  ['teacher-students-data'],
  {
    revalidate: 180, // 3 minutos
    tags: ['teacher-students'],
  }
);

// Buscar dados do calendário - DIRETO DO BANCO
export const getTeacherCalendarData = unstable_cache(
  async (userId: string): Promise<any | null> => {
    try {
      console.log(`📅 [TEACHER-CALENDAR] Loading calendar for user ${userId}`);

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-CALENDAR] Teacher profile not found for user ${userId}`
        );
        return null;
      }

      const teacherId = teacherProfile.id;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // Próximos 30 dias

      // Buscar aulas no período
      const lessons = await prisma.lesson.findMany({
        where: {
          teacherId,
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          student: {
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
        orderBy: { scheduledAt: 'asc' },
      });

      // Converter aulas para eventos do calendário
      const events = lessons.map((lesson) => {
        const startTime = new Date(lesson.scheduledAt);
        const endTime = new Date(startTime.getTime() + lesson.duration * 60000);

        // Cores baseadas no status
        let backgroundColor = '#3B82F6';
        let borderColor = '#1D4ED8';
        let textColor = '#FFFFFF';

        switch (lesson.status) {
          case 'COMPLETED':
            backgroundColor = '#10B981';
            borderColor = '#059669';
            break;
          case 'CANCELLED':
            backgroundColor = '#EF4444';
            borderColor = '#DC2626';
            break;
          case 'NO_SHOW':
            backgroundColor = '#F59E0B';
            borderColor = '#D97706';
            textColor = '#000000';
            break;
          case 'RESCHEDULED':
            backgroundColor = '#8B5CF6';
            borderColor = '#7C3AED';
            break;
        }

        return {
          id: lesson.id,
          title: lesson.title,
          start: startTime,
          end: endTime,
          type: 'lesson',
          status: lesson.status,
          student: {
            id: lesson.student.user.id,
            name: `${lesson.student.user.firstName || ''} ${
              lesson.student.user.lastName || ''
            }`.trim(),
            image: lesson.student.user.image || undefined,
            level: lesson.student.level,
          },
          location: lesson.location || undefined,
          description: lesson.description || undefined,
          objectives: lesson.objectives,
          backgroundColor,
          borderColor,
          textColor,
        };
      });

      console.log(`✅ [TEACHER-CALENDAR] Loaded ${events.length} events`);

      return {
        success: true,
        events,
        period: {
          start: startDate,
          end: endDate,
          view: 'month',
        },
        metadata: {
          totalEvents: events.length,
          lessonCount: events.filter((e) => e.type === 'lesson').length,
        },
      };
    } catch (error) {
      console.error('❌ [TEACHER-CALENDAR] Error loading calendar:', error);
      return null;
    }
  },
  ['teacher-calendar-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['teacher-calendar'],
  }
);

// Buscar perfil do professor - DIRETO DO BANCO
export const getTeacherProfile = unstable_cache(
  async (userId: string): Promise<TeacherProfileData | null> => {
    try {
      console.log(`👨‍🏫 [TEACHER-PROFILE] Loading profile for user ${userId}`);

      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
              phone: true,
              city: true,
              state: true,
              country: true,
            },
          },
        },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-PROFILE] Teacher profile not found for user ${userId}`
        );
        return null;
      }

      console.log(`✅ [TEACHER-PROFILE] Profile loaded successfully`);

      return {
        id: teacherProfile.id,
        userId: teacherProfile.userId,
        specialties: teacherProfile.specialties,
        bio: teacherProfile.bio,
        experience: teacherProfile.experience,
        education: teacherProfile.education,
        isPublicProfile: teacherProfile.isPublicProfile,
        status: teacherProfile.status,
        isVerified: teacherProfile.isVerified,
        createdAt: teacherProfile.createdAt,
        updatedAt: teacherProfile.updatedAt,
        user: teacherProfile.user,
        ageGroups: teacherProfile.ageGroups,
        defaultLessonDuration: teacherProfile.defaultLessonDuration,
        instruments: teacherProfile.instruments,
        timezone: teacherProfile.timezone,
        skillLevels: teacherProfile.skillLevels,
        highlightedWorks: teacherProfile.highlightedWorks,
        maxStudentsPerWeek: teacherProfile.maxStudentsPerWeek,
        website: teacherProfile.website,
        achievements: teacherProfile.achievements,
      };
    } catch (error) {
      console.error('❌ [TEACHER-PROFILE] Error loading profile:', error);
      return null;
    }
  },
  ['teacher-profile-data'],
  {
    revalidate: 3600, // 1 hora
    tags: ['teacher-profile'],
  }
);

// ====================================
// 🔄 QUERIES DIRETAS PARA CALENDÁRIO AVANÇADO
// ====================================

export const getTeacherCalendarDataDirect = unstable_cache(
  async (
    userId: string,
    startDate: Date,
    endDate: Date,
    includeStats: boolean = false,
    detectConflicts: boolean = false
  ): Promise<{
    events: CalendarEvent[];
    stats?: CalendarStats;
    conflicts?: CalendarConflict[];
    hasConflicts?: boolean;
  } | null> => {
    try {
      console.log(
        `📅 [TEACHER-CALENDAR-DATA] Loading calendar for user ${userId}`
      );

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-CALENDAR-DATA] Teacher profile not found for user ${userId}`
        );
        return null;
      }

      const teacherId = teacherProfile.id;

      // 2. Buscar aulas no período
      const lessons = await prisma.lesson.findMany({
        where: {
          teacherId,
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          student: {
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
        orderBy: { scheduledAt: 'asc' },
      });

      console.log(
        `📊 [TEACHER-CALENDAR-DATA] Found ${lessons.length} lessons in period`
      );

      // 3. Converter aulas para eventos do calendário
      const events: CalendarEvent[] = lessons.map((lesson) => {
        const startTime = new Date(lesson.scheduledAt);
        const endTime = new Date(startTime.getTime() + lesson.duration * 60000);

        // Cores baseadas no status
        let backgroundColor = '#3B82F6'; // Azul padrão
        let borderColor = '#1D4ED8';
        let textColor = '#FFFFFF';

        switch (lesson.status) {
          case 'COMPLETED':
            backgroundColor = '#10B981'; // Verde
            borderColor = '#059669';
            break;
          case 'CANCELLED':
            backgroundColor = '#EF4444'; // Vermelho
            borderColor = '#DC2626';
            break;
          case 'NO_SHOW':
            backgroundColor = '#F59E0B'; // Amarelo
            borderColor = '#D97706';
            textColor = '#000000';
            break;
          case 'RESCHEDULED':
            backgroundColor = '#8B5CF6'; // Roxo
            borderColor = '#7C3AED';
            break;
        }

        return {
          id: lesson.id,
          title: lesson.title,
          start: startTime,
          end: endTime,
          type: 'lesson',
          status: lesson.status as any,
          student: {
            id: lesson.student.user.id,
            name: `${lesson.student.user.firstName || ''} ${
              lesson.student.user.lastName || ''
            }`.trim(),
            image: lesson.student.user.image || undefined,
            level: lesson.student.level,
          },
          location: lesson.location || undefined,
          description: lesson.description || undefined,
          objectives: lesson.objectives,
          backgroundColor,
          borderColor,
          textColor,
          details: {
            workScoreIds: lesson.workScoreIds,
            topics: lesson.topics,
            techniques: lesson.techniques,
            homework: lesson.homework || undefined,
            teacherNotes: lesson.teacherNotes || undefined,
            publicNotes: lesson.publicNotes || undefined,
            isRecurring: lesson.isRecurring,
            recurrenceType: lesson.recurrenceType || undefined,
          },
        };
      });

      // 4. Resposta base
      const response: any = {
        events,
      };

      // 5. Adicionar estatísticas se solicitado
      if (includeStats) {
        console.log('📈 Calculating period statistics...');

        const totalLessons = events.length;
        const completedLessons = events.filter(
          (e) => e.status === 'COMPLETED'
        ).length;
        const scheduledLessons = events.filter(
          (e) => e.status === 'SCHEDULED'
        ).length;
        const cancelledLessons = events.filter(
          (e) => e.status === 'CANCELLED'
        ).length;

        const busyHours = events.reduce((total, event) => {
          const duration =
            (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
          return total + duration;
        }, 0);

        const periodDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const workingDays = Math.max(1, (periodDays * 5) / 7); // Aproximação de dias úteis
        const totalAvailableHours = workingDays * 8; // 8h por dia útil
        const freeHours = Math.max(0, totalAvailableHours - busyHours);
        const averageLessonsPerDay = totalLessons / Math.max(1, periodDays);

        const stats: CalendarStats = {
          totalLessons,
          completedLessons,
          scheduledLessons,
          cancelledLessons,
          busyHours: Math.round(busyHours * 10) / 10,
          freeHours: Math.round(freeHours * 10) / 10,
          averageLessonsPerDay: Math.round(averageLessonsPerDay * 10) / 10,
        };

        response.stats = stats;
      }

      // 6. Detectar conflitos se solicitado
      if (detectConflicts) {
        console.log('🔍 Detecting schedule conflicts...');

        const conflicts: CalendarConflict[] = [];
        const conflictMap = new Map<string, CalendarEvent[]>();

        // Agrupar eventos por data para detectar sobreposições
        events.forEach((event) => {
          const dateKey = event.start.toDateString();
          if (!conflictMap.has(dateKey)) {
            conflictMap.set(dateKey, []);
          }
          conflictMap.get(dateKey)!.push(event);
        });

        // Verificar sobreposições em cada dia
        conflictMap.forEach((dayEvents, dateStr) => {
          const dayConflicts: CalendarConflict['conflicts'] = [];

          for (let i = 0; i < dayEvents.length; i++) {
            for (let j = i + 1; j < dayEvents.length; j++) {
              const event1 = dayEvents[i];
              const event2 = dayEvents[j];

              // Verificar se há sobreposição
              const hasOverlap =
                event1.start < event2.end && event1.end > event2.start;

              if (
                hasOverlap &&
                event1.status === 'SCHEDULED' &&
                event2.status === 'SCHEDULED'
              ) {
                dayConflicts.push({
                  id: event1.id,
                  title: event1.title,
                  start: event1.start,
                  end: event1.end,
                  studentName: event1.student?.name || 'Desconhecido',
                });

                dayConflicts.push({
                  id: event2.id,
                  title: event2.title,
                  start: event2.start,
                  end: event2.end,
                  studentName: event2.student?.name || 'Desconhecido',
                });
              }
            }
          }

          if (dayConflicts.length > 0) {
            conflicts.push({
              date: new Date(dateStr),
              conflicts: dayConflicts,
            });
          }
        });

        response.conflicts = conflicts;
        response.hasConflicts = conflicts.length > 0;
      }

      console.log(`✅ [TEACHER-CALENDAR-DATA] Calendar loaded successfully`);

      return response;
    } catch (error) {
      console.error(
        '❌ [TEACHER-CALENDAR-DATA] Error loading calendar:',
        error
      );
      return null;
    }
  },
  ['teacher-calendar-data-direct'],
  {
    revalidate: 300, // 5 minutos
    tags: ['teacher-calendar'],
  }
);

export const getTeacherStudentDetailData = unstable_cache(
  async (
    userId: string,
    studentId: string
  ): Promise<{
    student: {
      id: string;
      name: string;
      email: string | null;
      image?: string | null;
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      experienceLevel?: string | null;
      createdAt: Date;
    };
    studentProfile: {
      id: string;
      level: string;
      mainInstrument?: string | null;
      musicalGoals?: string | null;
      practiceTime?: number | null;
      status: string;
      createdAt: Date;
    };
    relationship: {
      relationshipId: string;
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
    };
    stats: {
      totalLessons: number;
      completedLessons: number;
      scheduledLessons: number;
      cancelledLessons: number;
      completionRate: number;
      totalStudyTime: number;
      averageLessonRating: number;
      streakDays: number;
      lastLessonDate?: Date;
      nextLessonDate?: Date;
    };
    recentLessons: Array<{
      id: string;
      title: string;
      scheduledAt: Date;
      duration: number;
      status: string;
      objectives: string[];
      topics: string[];
      homework?: string | null;
      studentProgress?: any;
      teacherNotes?: string | null;
      studentFeedback?: string | null;
    }>;
    upcomingLessons: Array<{
      id: string;
      title: string;
      scheduledAt: Date;
      duration: number;
      objectives: string[];
      location?: string | null;
    }>;
    assignments: Array<{
      id: string;
      title: string;
      description: string;
      dueDate?: Date | null;
      status: string;
      isCompleted: boolean;
      progress: number;
      type: string;
      priority: string;
    }>;
  } | null> => {
    try {
      console.log(
        `👨‍🎓 [TEACHER-STUDENT-DETAIL] Loading student ${studentId} for teacher ${userId}`
      );

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-STUDENT-DETAIL] Teacher not found for user ${userId}`
        );
        return null;
      }

      // 2. Buscar relacionamento professor-aluno
      const relationship = await prisma.teacherStudent.findFirst({
        where: {
          teacherId: teacherProfile.id,
          student: {
            userId: studentId,
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  image: true,
                  phone: true,
                  city: true,
                  state: true,
                  experienceLevel: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      if (!relationship) {
        console.log(`❌ [TEACHER-STUDENT-DETAIL] Relationship not found`);
        return null;
      }

      // 3. Buscar aulas do aluno com este professor
      const lessons = await prisma.lesson.findMany({
        where: {
          teacherId: teacherProfile.id,
          studentId: relationship.student.id,
        },
        orderBy: { scheduledAt: 'desc' },
        take: 50,
      });

      // 4. Buscar assignments do aluno
      const assignments = await prisma.assignment.findMany({
        where: {
          studentId: relationship.student.id,
          lesson: {
            teacherId: teacherProfile.id,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      // 5. Processar dados das aulas
      const now = new Date();
      const recentLessons = lessons
        .filter((lesson) => lesson.scheduledAt <= now)
        .slice(0, 10);

      const upcomingLessons = lessons
        .filter(
          (lesson) => lesson.scheduledAt > now && lesson.status === 'SCHEDULED'
        )
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
        .slice(0, 5);

      // 6. Calcular estatísticas
      const lessonStats = lessons.reduce(
        (acc, lesson) => {
          acc.total++;
          if (lesson.status === 'COMPLETED') acc.completed++;
          if (lesson.status === 'SCHEDULED') acc.scheduled++;
          if (lesson.status === 'CANCELLED') acc.cancelled++;
          if (lesson.status === 'COMPLETED')
            acc.totalStudyTime += lesson.duration;
          return acc;
        },
        {
          total: 0,
          completed: 0,
          scheduled: 0,
          cancelled: 0,
          totalStudyTime: 0,
        }
      );

      const completionRate =
        lessonStats.total > 0
          ? (lessonStats.completed / lessonStats.total) * 100
          : 0;

      const lastLessonDate =
        recentLessons.length > 0 ? recentLessons[0].scheduledAt : undefined;
      const nextLessonDate =
        upcomingLessons.length > 0 ? upcomingLessons[0].scheduledAt : undefined;

      // Calcular streak simplificado
      const streakDays = lastLessonDate
        ? Math.floor(
            (now.getTime() - lastLessonDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      const studentDetailData = {
        student: {
          id: relationship.student.user.id,
          name: `${relationship.student.user.firstName || ''} ${
            relationship.student.user.lastName || ''
          }`.trim(),
          email: relationship.student.user.email,
          image: relationship.student.user.image,
          phone: relationship.student.user.phone,
          city: relationship.student.user.city,
          state: relationship.student.user.state,
          experienceLevel: relationship.student.user.experienceLevel,
          createdAt: relationship.student.user.createdAt,
        },
        studentProfile: {
          id: relationship.student.id,
          level: relationship.student.level,
          mainInstrument: relationship.student.mainInstrument,
          musicalGoals: relationship.student.musicalGoals,
          practiceTime: relationship.student.practiceTime,
          status: relationship.student.status,
          createdAt: relationship.student.createdAt,
        },
        relationship: {
          relationshipId: relationship.id,
          isActive: relationship.isActive,
          startDate: relationship.startDate,
          endDate: relationship.endDate,
          pausedAt: relationship.pausedAt,
          pauseReason: relationship.pauseReason,
          maxLessonsPerWeek: relationship.maxLessonsPerWeek,
          lessonDuration: relationship.lessonDuration,
          preferredDays: relationship.preferredDays,
          preferredTimes: relationship.preferredTimes,
          learningPlan: relationship.learningPlan,
          currentFocus: relationship.currentFocus,
          teacherNotes: relationship.teacherNotes,
        },
        stats: {
          totalLessons: lessonStats.total,
          completedLessons: lessonStats.completed,
          scheduledLessons: lessonStats.scheduled,
          cancelledLessons: lessonStats.cancelled,
          completionRate: Math.round(completionRate * 10) / 10,
          totalStudyTime: lessonStats.totalStudyTime,
          averageLessonRating: 0, // TODO: Implementar sistema de avaliações
          streakDays: Math.max(0, streakDays),
          lastLessonDate,
          nextLessonDate,
        },
        recentLessons: recentLessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          scheduledAt: lesson.scheduledAt,
          duration: lesson.duration,
          status: lesson.status,
          objectives: lesson.objectives,
          topics: lesson.topics,
          homework: lesson.homework,
          studentProgress: lesson.studentProgress,
          teacherNotes: lesson.teacherNotes,
          studentFeedback: lesson.studentFeedback,
        })),
        upcomingLessons: upcomingLessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          scheduledAt: lesson.scheduledAt,
          duration: lesson.duration,
          objectives: lesson.objectives,
          location: lesson.location,
        })),
        assignments: assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          status: assignment.status,
          isCompleted: assignment.isCompleted,
          progress: assignment.progress || 0,
          type: assignment.type,
          priority: assignment.priority,
        })),
      };

      console.log(
        `✅ [TEACHER-STUDENT-DETAIL] Student detail data loaded successfully.`
      );

      return studentDetailData;
    } catch (error) {
      console.error(
        '❌ [TEACHER-STUDENT-DETAIL] Error loading student detail:',
        error
      );
      return null;
    }
  },
  ['teacher-student-detail-data'],
  {
    revalidate: 180, // 3 minutos
    tags: ['teacher-student-detail'],
  }
);

// ====================================
// 🔄 CLIENT-SIDE API FUNCTIONS (mantendo as existentes para hooks)
// ====================================

// Adicionar aluno via API (MANTIDA - É MUTAÇÃO)
export const addStudentAPI = async (
  studentUserId: string,
  options: any = {}
): Promise<{ success: boolean; relationship?: any; error?: string }> => {
  try {
    const response = await fetch('/api/teacher/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentUserId,
        maxLessonsPerWeek: options.maxLessonsPerWeek || 1,
        lessonDuration: options.lessonDuration || 60,
        preferredDays: options.preferredDays || [],
        preferredTimes: options.preferredTimes || [],
        learningPlan: options.learningPlan || '',
        currentFocus: options.currentFocus || [],
        teacherNotes: options.teacherNotes || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, relationship: data.relationship };
  } catch (error) {
    console.error('❌ Error adding student:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Buscar dados do calendário via API (MANTIDA PARA COMPATIBILIDADE)
export const getTeacherCalendarAPI = async (
  startDate: Date,
  endDate: Date,
  view: string = 'month',
  includeStats: boolean = false,
  detectConflicts: boolean = false
): Promise<{
  events: CalendarEvent[];
  stats?: CalendarStats;
  conflicts?: CalendarConflict[];
  hasConflicts?: boolean;
} | null> => {
  try {
    const params = new URLSearchParams({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      view,
      stats: includeStats.toString(),
      conflicts: detectConflicts.toString(),
    });

    const response = await fetch(`/api/teacher/calendar?${params}`);

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Calendar API returned error');
    }

    return {
      events: data.events,
      stats: data.stats,
      conflicts: data.conflicts,
      hasConflicts: data.hasConflicts,
    };
  } catch (error) {
    console.error('❌ Error fetching teacher calendar:', error);
    return null;
  }
};

// Criar aula rápida via API (MANTIDA - É MUTAÇÃO)
export const createQuickLessonAPI = async (data: {
  studentUserId: string;
  title: string;
  start: string;
  duration?: number;
  location?: string;
  objectives?: string[];
}): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> => {
  try {
    const response = await fetch('/api/teacher/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Error ${response.status}`,
      };
    }

    return { success: result.success, event: result.event };
  } catch (error) {
    console.error('❌ Error creating quick lesson:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Mover aula via API (MANTIDA - É MUTAÇÃO)
export const moveLessonAPI = async (
  lessonId: string,
  newStart: string,
  newDuration?: number
): Promise<{ success: boolean; lesson?: any; error?: string }> => {
  try {
    const response = await fetch('/api/teacher/calendar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId,
        newStart,
        newDuration,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Error ${response.status}`,
      };
    }

    return { success: result.success, lesson: result.lesson };
  } catch (error) {
    console.error('❌ Error moving lesson:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}; // CACHE INVALIDATION
// ====================================

// Buscar assignments do professor - DIRETO DO BANCO
export const getTeacherAssignmentsData = unstable_cache(
  async (
    userId: string,
    studentUserId?: string,
    status?: string,
    lessonId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TeacherAssignmentsResponse | null> => {
    try {
      console.log(
        `📋 [TEACHER-ASSIGNMENTS] Loading assignments for user ${userId}`
      );

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-ASSIGNMENTS] Teacher profile not found for user ${userId}`
        );
        return null;
      }

      const teacherId = teacherProfile.id;

      // 2. Montar where clause
      const whereClause: any = {
        lesson: {
          teacherId,
        },
      };

      // Filtro por aluno específico
      if (studentUserId) {
        const studentProfile = await prisma.student.findUnique({
          where: { userId: studentUserId },
          select: { id: true },
        });
        if (studentProfile) {
          whereClause.studentId = studentProfile.id;
        }
      }

      // Filtro por aula específica
      if (lessonId) {
        whereClause.lessonId = lessonId;
      }

      // Filtro por status
      if (status) {
        if (status === 'OVERDUE') {
          // Assignments atrasados: status PENDING ou IN_PROGRESS com dueDate no passado
          whereClause.AND = [
            {
              OR: [{ status: 'PENDING' }, { status: 'IN_PROGRESS' }],
            },
            {
              dueDate: {
                lt: new Date(),
              },
            },
          ];
        } else {
          whereClause.status = status;
        }
      }

      // 3. Buscar assignments
      const [assignments, totalCount] = await Promise.all([
        prisma.assignment.findMany({
          where: whereClause,
          include: {
            student: {
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
            lesson: {
              select: {
                id: true,
                title: true,
                scheduledAt: true,
                teacher: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
          take: limit,
          skip: offset,
        }),
        prisma.assignment.count({ where: whereClause }),
      ]);

      console.log(
        `📊 [TEACHER-ASSIGNMENTS] Found ${assignments.length} assignments`
      );

      // 4. Formatar assignments
      const now = new Date();
      const assignmentsFormatted: TeacherAssignmentData[] = assignments.map(
        (assignment) => {
          const isOverdue =
            assignment.dueDate &&
            assignment.dueDate < now &&
            !assignment.isCompleted;

          const daysUntilDue = assignment.dueDate
            ? Math.ceil(
                (assignment.dueDate.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : undefined;

          return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            type: assignment.type,
            priority: assignment.priority,

            // Recursos
            workScoreIds: assignment.workScoreIds,
            exercises: assignment.exercises,

            // Metas
            practiceGoals: assignment.practiceGoals,
            tempoTargets: assignment.tempoTargets,
            technicalGoals: assignment.technicalGoals,
            musicalGoals: assignment.musicalGoals,

            // Status e prazos
            status: isOverdue ? 'OVERDUE' : (assignment.status as any),
            dueDate: assignment.dueDate,
            estimatedTime: assignment.estimatedTime,
            actualTime: assignment.actualTime,
            isOverdue: !!isOverdue,
            daysUntilDue,

            // Progresso
            isCompleted: assignment.isCompleted,
            completedAt: assignment.completedAt,
            progress: assignment.progress,

            // Feedback
            teacherFeedback: assignment.teacherFeedback,
            teacherRating: assignment.teacherRating,
            studentNotes: assignment.studentNotes,
            studentRating: assignment.studentRating,

            // Submissões
            submissions: assignment.submissions,
            submissionDate: assignment.submissionDate,

            // Relacionamentos
            student: {
              id: assignment.student.user.id,
              name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim(),
              image: assignment.student.user.image,
            },
            lesson: {
              id: assignment.lesson.id,
              title: assignment.lesson.title,
              scheduledAt: assignment.lesson.scheduledAt,
              teacher: {
                name: `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim(),
                image: assignment.lesson.teacher.user.image,
              },
            },

            // Timestamps
            createdAt: assignment.createdAt,
            updatedAt: assignment.updatedAt,
          };
        }
      );

      // 5. Calcular estatísticas
      const completedAssignments = assignmentsFormatted.filter(
        (a) => a.isCompleted
      );
      const pendingAssignments = assignmentsFormatted.filter(
        (a) => a.status === 'PENDING'
      );
      const inProgressAssignments = assignmentsFormatted.filter(
        (a) => a.status === 'IN_PROGRESS'
      );
      const overdueAssignments = assignmentsFormatted.filter(
        (a) => a.isOverdue
      );

      const totalActualTime = completedAssignments.reduce(
        (sum, a) => sum + (a.actualTime || 0),
        0
      );
      const averageTime =
        completedAssignments.length > 0
          ? totalActualTime / completedAssignments.length
          : 0;

      const completionRate =
        totalCount > 0 ? (completedAssignments.length / totalCount) * 100 : 0;

      const stats: TeacherAssignmentStats = {
        total: totalCount,
        pending: pendingAssignments.length,
        inProgress: inProgressAssignments.length,
        completed: completedAssignments.length,
        overdue: overdueAssignments.length,
        completionRate: Math.round(completionRate * 10) / 10,
        averageTime: Math.round(averageTime * 10) / 10,
      };

      console.log(
        `✅ [TEACHER-ASSIGNMENTS] Assignments loaded successfully - Stats: ${stats.total} total, ${stats.completed} completed`
      );

      return {
        success: true,
        assignments: assignmentsFormatted,
        stats,
        pagination: {
          offset,
          limit,
          total: totalCount,
          hasMore: offset + assignmentsFormatted.length < totalCount,
        },
      };
    } catch (error) {
      console.error(
        '❌ [TEACHER-ASSIGNMENTS] Error loading assignments:',
        error
      );
      return null;
    }
  },
  ['teacher-assignments-data'],
  {
    revalidate: 180, // 3 minutos
    tags: ['teacher-assignments'],
  }
);

// Buscar lessons do professor - DIRETO DO BANCO
export const getTeacherLessonsData = unstable_cache(
  async (
    userId: string,
    studentId?: string,
    status?: string,
    dateFrom?: Date,
    dateTo?: Date,
    limit: number = 50,
    offset: number = 0,
    includeStats: boolean = true
  ): Promise<TeacherLessonsResponse | null> => {
    try {
      console.log(`📚 [TEACHER-LESSONS] Loading lessons for user ${userId}`);

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-LESSONS] Teacher profile not found for user ${userId}`
        );
        return null;
      }

      const teacherId = teacherProfile.id;

      // 2. Montar where clause
      const whereClause: any = {
        teacherId,
      };

      // Filtros adicionais
      if (studentId) {
        whereClause.studentId = studentId;
      }

      if (status) {
        whereClause.status = status;
      }

      if (dateFrom || dateTo) {
        whereClause.scheduledAt = {};
        if (dateFrom) {
          whereClause.scheduledAt.gte = dateFrom;
        }
        if (dateTo) {
          whereClause.scheduledAt.lte = dateTo;
        }
      }

      // 3. Buscar lessons
      const [lessons, totalCount] = await Promise.all([
        prisma.lesson.findMany({
          where: whereClause,
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            scheduledAt: 'asc',
          },
          take: limit,
          skip: offset,
        }),
        prisma.lesson.count({ where: whereClause }),
      ]);

      console.log(`📊 [TEACHER-LESSONS] Found ${lessons.length} lessons`);

      // 4. Formatar lessons (usando formato compatível com a API existente)
      const lessonsFormatted = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        scheduledAt: lesson.scheduledAt,
        duration: lesson.duration,
        actualStartTime: lesson.actualStartTime,
        actualEndTime: lesson.actualEndTime,
        status: lesson.status,
        type: lesson.type,
        location: lesson.location,

        // Recorrência
        isRecurring: lesson.isRecurring,
        recurrenceType: lesson.recurrenceType,
        parentLessonId: lesson.parentLessonId,

        // Conteúdo
        objectives: lesson.objectives,
        workScoreIds: lesson.workScoreIds,
        topics: lesson.topics,
        techniques: lesson.techniques,
        repertoire: lesson.repertoire,
        homework: lesson.homework,
        practiceGoals: lesson.practiceGoals,

        // Notas
        teacherNotes: lesson.teacherNotes,
        publicNotes: lesson.publicNotes,
        studentFeedback: lesson.studentFeedback,
        lessonSummary: lesson.lessonSummary,

        // Avaliação
        studentProgress: lesson.studentProgress,
        skillsWorked: lesson.skillsWorked,
        improvements: lesson.improvements,
        challenges: lesson.challenges,

        // Presença
        studentPresent: lesson.studentPresent,
        punctuality: lesson.punctuality,
        engagement: lesson.engagement,
        preparation: lesson.preparation,

        // Dados do aluno (formato compatível com interface existente)
        student: {
          id: lesson.student.user.id,
          name: `${lesson.student.user.firstName || ''} ${
            lesson.student.user.lastName || ''
          }`.trim(),
          email: lesson.student.user.email || '',
          image: lesson.student.user.image,
          level: lesson.student.level,
        },

        // Timestamps
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      }));

      // 5. Calcular estatísticas se solicitado
      let stats: TeacherLessonsStats = {
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        averageDuration: 60,
        completionRate: 0,
      };

      if (includeStats) {
        console.log('📈 Calculating lesson statistics...');

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(startOfToday.getDate() + 1);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Buscar estatísticas completas
        const [allLessons, todayLessons, weekLessons, monthLessons] =
          await Promise.all([
            prisma.lesson.findMany({
              where: { teacherId },
              select: {
                status: true,
                duration: true,
                scheduledAt: true,
              },
            }),
            prisma.lesson.count({
              where: {
                teacherId,
                scheduledAt: {
                  gte: startOfToday,
                  lt: endOfToday,
                },
              },
            }),
            prisma.lesson.count({
              where: {
                teacherId,
                scheduledAt: {
                  gte: startOfWeek,
                  lt: endOfWeek,
                },
              },
            }),
            prisma.lesson.count({
              where: {
                teacherId,
                scheduledAt: {
                  gte: startOfMonth,
                  lt: endOfMonth,
                },
              },
            }),
          ]);

        // Calcular estatísticas por status
        const statusCounts = allLessons.reduce((acc, lesson) => {
          acc[lesson.status] = (acc[lesson.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Calcular duração média
        const totalDuration = allLessons.reduce(
          (sum, lesson) => sum + lesson.duration,
          0
        );
        const averageDuration =
          allLessons.length > 0 ? totalDuration / allLessons.length : 60;

        // Calcular taxa de conclusão
        const completedCount = statusCounts['COMPLETED'] || 0;
        const totalCount = allLessons.length;
        const completionRate =
          totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        stats = {
          total: totalCount,
          scheduled: statusCounts['SCHEDULED'] || 0,
          completed: completedCount,
          cancelled: statusCounts['CANCELLED'] || 0,
          noShow: statusCounts['NO_SHOW'] || 0,
          today: todayLessons,
          thisWeek: weekLessons,
          thisMonth: monthLessons,
          averageDuration: Math.round(averageDuration),
          completionRate: Math.round(completionRate * 10) / 10,
        };
      }

      console.log(
        `✅ [TEACHER-LESSONS] Lessons loaded successfully - Stats: ${stats.total} total, ${stats.completed} completed`
      );

      return {
        success: true,
        lessons: lessonsFormatted,
        stats,
        pagination: {
          offset,
          limit,
          total: totalCount,
          hasMore: offset + lessonsFormatted.length < totalCount,
        },
      };
    } catch (error) {
      console.error('❌ [TEACHER-LESSONS] Error loading lessons:', error);
      return null;
    }
  },
  ['teacher-lessons-data'],
  {
    revalidate: 180, // 3 minutos
    tags: ['teacher-lessons'],
  }
);

// Buscar detalhes de lesson específico - DIRETO DO BANCO
export const getTeacherLessonDetailsData = unstable_cache(
  async (
    lessonId: string,
    userId: string,
    userRole: number = 1
  ): Promise<TeacherLessonDetailsResponse | null> => {
    try {
      console.log(
        `📖 [TEACHER-LESSON-DETAILS] Loading lesson ${lessonId} for user ${userId}`
      );

      // 1. Buscar perfis do usuário
      let userTeacherProfile = null;
      let userStudentProfile = null;

      if (userRole === 1) {
        userTeacherProfile = await prisma.teacher.findUnique({
          where: { userId },
          select: { id: true },
        });
      } else {
        userStudentProfile = await prisma.student.findUnique({
          where: { userId },
          select: { id: true },
        });
      }

      // 2. Buscar aula com verificação de acesso
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          OR: [
            // Professor: deve ser dono da aula
            {
              teacherId: userTeacherProfile?.id,
            },
            // Aluno: deve ser dono do assignment
            {
              studentId: userStudentProfile?.id,
            },
          ],
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          assignments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!lesson) {
        console.log(
          `❌ [TEACHER-LESSON-DETAILS] Lesson ${lessonId} not found or access denied`
        );
        return null;
      }

      // 3. Buscar estatísticas do relacionamento
      const [totalLessons, completedLessons, teacherStudentRel] =
        await Promise.all([
          prisma.lesson.count({
            where: {
              teacherId: lesson.teacherId,
              studentId: lesson.studentId,
            },
          }),
          prisma.lesson.count({
            where: {
              teacherId: lesson.teacherId,
              studentId: lesson.studentId,
              status: 'COMPLETED',
            },
          }),
          prisma.teacherStudent.findFirst({
            where: {
              teacherId: lesson.teacherId,
              studentId: lesson.studentId,
            },
            select: { startDate: true },
          }),
        ]);

      // 4. Calcular duração do relacionamento
      const relationshipStart =
        teacherStudentRel?.startDate || lesson.createdAt;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - relationshipStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let relationshipDuration = '';
      if (diffDays < 30) {
        relationshipDuration = `${diffDays} dias`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        relationshipDuration = `${months} ${months === 1 ? 'mês' : 'meses'}`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        relationshipDuration = `${years} ${years === 1 ? 'ano' : 'anos'}`;
        if (remainingMonths > 0) {
          relationshipDuration += ` e ${remainingMonths} ${
            remainingMonths === 1 ? 'mês' : 'meses'
          }`;
        }
      }

      // 🆕 5. Buscar dados completos das OBRAS (worksIds)
      let linkedWorks: any[] = [];
      if (lesson.worksIds && lesson.worksIds.length > 0) {
        console.log(
          '🔍 [TEACHER-LESSON-DETAILS] Buscando obras:',
          lesson.worksIds
        );

        linkedWorks = await prisma.work.findMany({
          where: {
            id: { in: lesson.worksIds },
          },
          include: {
            composer: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
          },
        });

        console.log(
          '✅ [TEACHER-LESSON-DETAILS] Obras encontradas:',
          linkedWorks.length
        );
      }

      // 🆕 6. Buscar dados completos das PARTITURAS (workScoreIds)
      let linkedWorkScores: any[] = [];
      if (lesson.workScoreIds && lesson.workScoreIds.length > 0) {
        console.log(
          '🔍 [TEACHER-LESSON-DETAILS] Buscando partituras:',
          lesson.workScoreIds
        );

        linkedWorkScores = await prisma.workScore.findMany({
          where: {
            id: { in: lesson.workScoreIds },
          },
          include: {
            work: {
              include: {
                composer: {
                  select: {
                    id: true,
                    name: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        });

        console.log(
          '✅ [TEACHER-LESSON-DETAILS] Partituras encontradas:',
          linkedWorkScores.length
        );
      }

      // 🆕 7. Criar array de peças musicais no formato correto
      const musicalPieces: any[] = [];

      // Primeiro, adicionar partituras específicas (têm prioridade)
      for (const workScore of linkedWorkScores) {
        musicalPieces.push({
          workId: workScore.work.id,
          workTitle: workScore.work.title,
          composerName:
            workScore.work.composer.fullName || workScore.work.composer.name,
          composerId: workScore.work.composer.id,
          scoreId: workScore.id,
          scoreTitle: workScore.title,
          scoreUrl: workScore.downloadUrl,
          scoreType: workScore.type,
          scoreSource: workScore.source,
        });
      }

      // Depois, adicionar obras que não têm partituras específicas
      for (const work of linkedWorks) {
        // Verificar se essa obra já não foi incluída via workScore
        const alreadyIncluded = musicalPieces.some(
          (piece) => piece.workId === work.id
        );

        if (!alreadyIncluded) {
          musicalPieces.push({
            workId: work.id,
            workTitle: work.title,
            composerName: work.composer.fullName || work.composer.name,
            composerId: work.composer.id,
            // Sem partitura específica
          });
        }
      }

      console.log('🎵 [TEACHER-LESSON-DETAILS] Peças musicais processadas:', {
        totalPieces: musicalPieces.length,
        withScores: musicalPieces.filter((p) => p.scoreId).length,
        withoutScores: musicalPieces.filter((p) => !p.scoreId).length,
      });

      // 8. Buscar aulas relacionadas (se for série recorrente)
      let relatedLessons: any[] = [];
      if (lesson.isRecurring) {
        const parentId = lesson.parentLessonId || lesson.id;
        relatedLessons = await prisma.lesson.findMany({
          where: {
            OR: [{ id: parentId }, { parentLessonId: parentId }],
            id: { not: lesson.id }, // Excluir a aula atual
          },
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
          },
          orderBy: { scheduledAt: 'asc' },
          take: 10,
        });
      }

      // 9. Definir permissões baseadas no role
      const isTeacher =
        userRole === 1 && userTeacherProfile?.id === lesson.teacherId;
      const isStudent =
        userRole === 0 && userStudentProfile?.id === lesson.studentId;

      const permissions = {
        canEdit: isTeacher,
        canCancel: isTeacher,
        canReschedule: isTeacher,
        canViewTeacherNotes: isTeacher,
        canAddFeedback: isStudent && lesson.status === 'COMPLETED',
        canMarkAttendance: isTeacher,
      };

      // 10. Montar resposta detalhada (formato compatível com interface existente)
      const lessonDetails = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || undefined,
        scheduledAt: lesson.scheduledAt,
        duration: lesson.duration,
        actualStartTime: lesson.actualStartTime || undefined,
        actualEndTime: lesson.actualEndTime || undefined,
        status: lesson.status,
        type: lesson.type,
        location: lesson.location || undefined,

        // Recorrência
        isRecurring: lesson.isRecurring,
        recurrenceType: lesson.recurrenceType || undefined,
        parentLessonId: lesson.parentLessonId || undefined,
        recurrenceEnd: lesson.recurrenceEnd || undefined,

        // Conteúdo
        objectives: lesson.objectives,

        // 🆕 IDs DAS PEÇAS MUSICAIS (para edição)
        worksIds: lesson.worksIds || [],
        workScoreIds: lesson.workScoreIds || [],

        // 🆕 DADOS COMPLETOS DAS PEÇAS MUSICAIS (para exibição)
        musicalPieces: musicalPieces,

        topics: lesson.topics,
        techniques: lesson.techniques,
        repertoire: lesson.repertoire,
        homework: lesson.homework || undefined,
        practiceGoals: lesson.practiceGoals,
        nextLessonPrep: lesson.nextLessonPrep || undefined,

        // Anotações (filtradas por permissão)
        teacherNotes: permissions.canViewTeacherNotes
          ? lesson.teacherNotes || undefined
          : undefined,
        publicNotes: lesson.publicNotes || undefined,
        studentFeedback: lesson.studentFeedback || undefined,
        lessonSummary: lesson.lessonSummary || undefined,

        // Avaliação
        studentProgress: lesson.studentProgress,
        skillsWorked: lesson.skillsWorked,
        improvements: lesson.improvements,
        challenges: lesson.challenges,

        // Presença
        studentPresent: lesson.studentPresent || undefined,
        punctuality: lesson.punctuality || undefined,
        engagement: lesson.engagement || undefined,
        preparation: lesson.preparation || undefined,

        // Pessoas
        teacher: {
          id: lesson.teacher.user.id,
          name: `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim(),
          email: lesson.teacher.user.email || '',
          image: lesson.teacher.user.image || undefined,
        },
        student: {
          id: lesson.student.user.id,
          name: `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
          email: lesson.student.user.email || '',
          image: lesson.student.user.image || undefined,
          level: lesson.student.level,
        },

        // Contexto
        relationship: {
          totalLessons,
          completedLessons,
          relationshipDuration,
        },

        // WorkScores (mantido para compatibilidade)
        workScores: linkedWorkScores.map((ws) => ({
          id: ws.id,
          title: ws.title,
          composer: ws.work.composer.name,
          workTitle: ws.work.title,
          type: ws.type,
          downloadUrl: ws.downloadUrl || undefined,
        })),

        // Assignments
        assignments: lesson.assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate || undefined,
          status: assignment.status,
          isCompleted: assignment.isCompleted,
        })),

        // Aulas relacionadas
        relatedLessons: relatedLessons.map((rl) => ({
          id: rl.id,
          title: rl.title,
          scheduledAt: rl.scheduledAt,
          status: rl.status,
        })),

        // Timestamps
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,

        // Permissões
        permissions,
      };

      console.log(
        `✅ [TEACHER-LESSON-DETAILS] Lesson details loaded for ${
          isTeacher ? 'teacher' : 'student'
        } with ${musicalPieces.length} musical pieces`
      );

      return {
        success: true,
        lesson: lessonDetails,
        userRole,
        isTeacher,
        isStudent,
      };
    } catch (error) {
      console.error(
        '❌ [TEACHER-LESSON-DETAILS] Error loading lesson details:',
        error
      );
      return null;
    }
  },
  ['teacher-lesson-details-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['teacher-lesson-details'],
  }
);

// Adicionar esta função no teacher-request.ts

// Buscar detalhes de assignment específico - DIRETO DO BANCO
export const getTeacherAssignmentDetailsData = unstable_cache(
  async (
    assignmentId: string,
    userId: string,
    userRole: number = 1
  ): Promise<TeacherAssignmentDetailsResponse> => {
    try {
      console.log(
        `📋👁️ [TEACHER-ASSIGNMENT-DETAILS] Loading assignment ${assignmentId} for user ${userId}`
      );

      // 1. Buscar perfis do usuário
      let userTeacherProfile = null;
      let userStudentProfile = null;

      if (userRole === 1) {
        userTeacherProfile = await prisma.teacher.findUnique({
          where: { userId },
          select: { id: true },
        });
      } else {
        userStudentProfile = await prisma.student.findUnique({
          where: { userId },
          select: { id: true },
        });
      }

      // 2. Buscar assignment com verificação de acesso
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          OR: [
            // Professor: deve ser dono da aula
            {
              lesson: {
                teacherId: userTeacherProfile?.id,
              },
            },
            // Aluno: deve ser dono do assignment
            {
              studentId: userStudentProfile?.id,
            },
          ],
        },
        include: {
          student: {
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
          lesson: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!assignment) {
        console.log(
          `❌ [TEACHER-ASSIGNMENT-DETAILS] Assignment ${assignmentId} not found or access denied`
        );
        return {
          success: false,
          error: 'Assignment não encontrado ou acesso negado',
        };
      }

      // 3. Buscar WorkScores se houver IDs
      let workScores: any[] = [];
      if (assignment.workScoreIds.length > 0) {
        workScores = await prisma.workScore.findMany({
          where: {
            id: { in: assignment.workScoreIds },
          },
          include: {
            work: {
              include: {
                composer: {
                  select: { name: true },
                },
              },
            },
          },
        });
      }

      // 4. Calcular status atual
      const now = new Date();
      const isOverdue =
        assignment.dueDate &&
        assignment.dueDate < now &&
        !assignment.isCompleted;

      const daysUntilDue = assignment.dueDate
        ? Math.ceil(
            (assignment.dueDate.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      // 5. Definir permissões
      const permissions = {
        canEdit: userRole === 1 && assignment.status !== 'COMPLETED',
        canDelete: userRole === 1,
        canComplete: userRole === 0 && !assignment.isCompleted,
        canAddFeedback: userRole === 0,
        canAddSubmission: userRole === 0 && !assignment.isCompleted,
      };

      // 6. Formatar assignment completo
      const assignmentDetail = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,

        // Recursos
        workScoreIds: assignment.workScoreIds,
        exercises: assignment.exercises,

        // Metas
        practiceGoals: assignment.practiceGoals,
        tempoTargets: assignment.tempoTargets,
        technicalGoals: assignment.technicalGoals,
        musicalGoals: assignment.musicalGoals,

        // Status e prazos
        status: (isOverdue ? 'OVERDUE' : assignment.status) as any,
        dueDate: assignment.dueDate,
        estimatedTime: assignment.estimatedTime,
        actualTime: assignment.actualTime,
        isOverdue: !!isOverdue,
        daysUntilDue,

        // Progresso
        isCompleted: assignment.isCompleted,
        completedAt: assignment.completedAt,
        progress: assignment.progress,

        // Feedback
        teacherFeedback: assignment.teacherFeedback,
        teacherRating: assignment.teacherRating,
        studentNotes: assignment.studentNotes,
        studentRating: assignment.studentRating,

        // Submissões
        submissions: assignment.submissions,
        submissionDate: assignment.submissionDate,

        // Relacionamentos
        student: {
          id: assignment.student.user.id,
          name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim(),
          image: assignment.student.user.image,
        },
        lesson: {
          id: assignment.lesson.id,
          title: assignment.lesson.title,
          scheduledAt: assignment.lesson.scheduledAt,
          teacher: {
            name: `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim(),
            image: assignment.lesson.teacher.user.image,
          },
        },

        // WorkScores
        workScores: workScores.map((ws) => ({
          id: ws.id,
          title: ws.title,
          composer: ws.work.composer.name,
          workTitle: ws.work.title,
          type: ws.type,
          downloadUrl: ws.downloadUrl || undefined,
        })),

        // Permissões
        permissions,

        // Timestamps
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };

      console.log(
        `✅ [TEACHER-ASSIGNMENT-DETAILS] Assignment details loaded successfully - ${assignment.title}`
      );

      return {
        success: true,
        assignment: assignmentDetail,
        userRole,
      };
    } catch (error) {
      console.error(
        '❌ [TEACHER-ASSIGNMENT-DETAILS] Error loading assignment details:',
        error
      );
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      };
    }
  },
  ['teacher-assignment-details-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['teacher-assignment-details'],
  }
);

// Adicionar esta função também no teacher-request.ts

// Buscar dados para editar assignment - DIRETO DO BANCO
export const getTeacherAssignmentEditData = unstable_cache(
  async (
    assignmentId: string,
    userId: string
  ): Promise<TeacherAssignmentEditResponse> => {
    try {
      console.log(
        `📋✏️ [TEACHER-ASSIGNMENT-EDIT] Loading edit data for assignment ${assignmentId} - user ${userId}`
      );

      // 1. Verificar se professor existe
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        console.log(
          `❌ [TEACHER-ASSIGNMENT-EDIT] Teacher profile not found for user ${userId}`
        );
        return {
          success: false,
          error: 'Perfil de professor não encontrado',
        };
      }

      // 2. Buscar assignment com verificação de acesso (apenas professores podem editar)
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          lesson: {
            teacherId: teacherProfile.id,
          },
        },
        include: {
          student: {
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
          lesson: {
            select: {
              id: true,
              title: true,
              scheduledAt: true,
            },
          },
        },
      });

      if (!assignment) {
        console.log(
          `❌ [TEACHER-ASSIGNMENT-EDIT] Assignment ${assignmentId} not found or access denied`
        );
        return {
          success: false,
          error: 'Tarefa não encontrada ou acesso negado',
        };
      }

      // 3. Buscar WorkScores se houver IDs
      let workScores: any[] = [];
      if (assignment.workScoreIds.length > 0) {
        workScores = await prisma.workScore.findMany({
          where: {
            id: { in: assignment.workScoreIds },
          },
          include: {
            work: {
              include: {
                composer: {
                  select: { name: true },
                },
              },
            },
          },
        });
      }

      // 4. Buscar alunos do professor para possível troca
      const teacherStudents = await prisma.teacherStudent.findMany({
        where: {
          teacherId: teacherProfile.id,
          isActive: true,
        },
        include: {
          student: {
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
        orderBy: [
          { isActive: 'desc' },
          { student: { user: { firstName: 'asc' } } },
        ],
        take: 100, // Limite de 100 alunos ativos
      });

      // 5. Formatar dados
      const assignmentEdit = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,
        dueDate: assignment.dueDate,
        estimatedTime: assignment.estimatedTime,

        // Recursos
        workScoreIds: assignment.workScoreIds,
        // 🆕 INCLUIR worksIds
        worksIds: assignment.worksIds || [],
        exercises: assignment.exercises,

        // Metas
        practiceGoals: assignment.practiceGoals,
        tempoTargets: assignment.tempoTargets,
        technicalGoals: assignment.technicalGoals,
        musicalGoals: assignment.musicalGoals,

        // Status
        status: assignment.status,
        isCompleted: assignment.isCompleted,

        // Relacionamentos
        student: {
          id: assignment.student.user.id,
          name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim(),
          image: assignment.student.user.image,
        },
        lesson: {
          id: assignment.lesson.id,
          title: assignment.lesson.title,
          scheduledAt: assignment.lesson.scheduledAt,
        },

        // WorkScores
        workScores: workScores.map((ws) => ({
          id: ws.id,
          title: ws.title,
          composer: ws.work.composer.name,
          workTitle: ws.work.title,
          type: ws.type,
          downloadUrl: ws.downloadUrl || undefined,
        })),

        // Permissões
        permissions: {
          canEdit: assignment.status !== 'COMPLETED',
          canDelete: true,
        },

        // Timestamps
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };

      // Formatar alunos
      const students = teacherStudents.map((rel) => ({
        id: rel.student.user.id,
        name: `${rel.student.user.firstName} ${rel.student.user.lastName}`.trim(),
        image: rel.student.user.image,
        level: rel.student.level,
        isActive: rel.isActive,
      }));

      console.log(
        `✅ [TEACHER-ASSIGNMENT-EDIT] Edit data loaded successfully - ${
          assignment.title
        }, ${students.length} students, Works: ${
          assignment.worksIds?.length || 0
        }, Scores: ${assignment.workScoreIds?.length || 0}`
      );

      return {
        success: true,
        assignment: assignmentEdit,
        students,
      };
    } catch (error) {
      console.error(
        '❌ [TEACHER-ASSIGNMENT-EDIT] Error loading edit data:',
        error
      );
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      };
    }
  },
  ['teacher-assignment-edit-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['teacher-assignment-edit'],
  }
);

export async function revalidateTeacherCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');

  // Tags existentes
  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-dashboard-data');
  revalidateTag('teacher-students');
  revalidateTag('teacher-students-data');
  revalidateTag('teacher-calendar');
  revalidateTag('teacher-calendar-data');
  revalidateTag('teacher-calendar-data-direct');
  revalidateTag('teacher-profile');
  revalidateTag('teacher-profile-data');
  revalidateTag('teacher-profile-extended-data');
  revalidateTag('teacher-student-detail-data');
  revalidateTag('teacher-student-detail');
  revalidateTag('teacher-assignments');
  revalidateTag('teacher-assignments-data');
  revalidateTag('teacher-reviews');
  revalidateTag('teacher-reviews-data');
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details');
  revalidateTag('teacher-lesson-details-data');
  revalidateTag('search-students');
  revalidateTag('search-students-data');

  // Novas tags para assignments
  revalidateTag('teacher-assignment-details');
  revalidateTag('teacher-assignment-details-data');
  revalidateTag('teacher-assignment-edit');
  revalidateTag('teacher-assignment-edit-data');

  if (userId) {
    revalidateTag(`teacher-${userId}`);
  }
}
