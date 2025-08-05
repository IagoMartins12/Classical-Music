import { unstable_cache } from 'next/cache';
import prisma from '@/app/libs/prismadb';
import {
  CalendarConflict,
  CalendarEvent,
  CalendarStats,
} from '../(main)/teacher/calendar/pageServer';

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
              musicalGoals: rel.student.musicalGoals
                ? JSON.parse(rel.student.musicalGoals)
                : [],
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
  async (userId: string): Promise<TeacherProfile | null> => {
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
// 🔄 CLIENT-SIDE API FUNCTIONS (mantendo as existentes para hooks)
// ====================================

// Buscar alunos via API (para manipulações client-side)
export const searchStudentsAPI = async (
  email: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    if (email.length < 3) return [];

    const response = await fetch(
      `/api/teacher/students/search?email=${encodeURIComponent(
        email
      )}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.students : [];
  } catch (error) {
    console.error('❌ Error searching students:', error);
    return [];
  }
};

// Adicionar aluno via API
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

export const getTeacherCalendarDataDirect = unstable_cache(
  async (
    userId: string,
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

// Buscar dados do calendário via API (para manipulações client-side)
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

// Criar aula rápida via API
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

// Mover aula via API (drag & drop)
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
};

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
        `✅ [TEACHER-STUDENT-DETAIL] Student detail data loaded successfully`
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
// CACHE INVALIDATION
// ====================================

export async function revalidateTeacherCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-students');
  revalidateTag('teacher-calendar');
  revalidateTag('teacher-calendar-data-direct'); // 🆕 Nova tag
  revalidateTag('teacher-profile');
  revalidateTag('teacher-student-detail-data');
  revalidateTag('teacher-student-detail');

  if (userId) {
    revalidateTag(`teacher-${userId}`);
  }
}
