// app/requests/student-requests.ts - Refatorado com queries diretas ao banco

import { unstable_cache } from 'next/cache';
import prisma from '@/app/libs/prismadb';

// ====================================
// TYPES AND INTERFACES (mantidas iguais)
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
    teacher: {
      id: string;
      name: string;
      image?: string;
    };
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
    teacher: {
      id: string;
      name: string;
      image?: string;
    };
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
    teacher: {
      name: string;
      image?: string;
    };
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
      selectedScore?: {
        title: string;
        type: string;
      };
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
  teacher: {
    id: string;
    name: string;
    image?: string;
  };
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
interface AssignmentSubmissions {
  progressMilestones?: {
    learnedLeftHand?: boolean;
    learnedRightHand?: boolean;
    playedWithMetronome?: boolean;
    memorized?: boolean;
    playedAtTempo?: boolean;
    masteredDynamics?: boolean;
    performedForOthers?: boolean;
  };
  recordings?: string[];
  notes?: string;
  files?: string[];
  [key: string]: any;
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
// ====================================
// DASHBOARD REQUESTS - QUERIES DIRETAS
// ====================================

export const getStudentDashboard = unstable_cache(
  async (userId: string): Promise<StudentDashboard | null> => {
    try {
      console.log(
        `📊 [STUDENT-DASHBOARD] Loading dashboard for user ${userId}`
      );

      // 1. Verificar se aluno existe
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!studentProfile) {
        console.log(
          `❌ [STUDENT-DASHBOARD] Student profile not found for user ${userId}`
        );
        return null;
      }

      const studentId = studentProfile.id;
      const now = new Date();

      // Calcular datas importantes
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(startOfToday.getDate() + 1);

      // 1. ESTATÍSTICAS BÁSICAS
      const [
        totalLessons,
        completedLessons,
        upcomingLessons,
        missedLessons,
        studentData,
      ] = await Promise.all([
        // Total de aulas
        prisma.lesson.count({
          where: { studentId },
        }),

        // Aulas concluídas
        prisma.lesson.count({
          where: { studentId, status: 'COMPLETED' },
        }),

        // Aulas futuras agendadas
        prisma.lesson.count({
          where: {
            studentId,
            status: 'SCHEDULED',
            scheduledAt: { gte: now },
          },
        }),

        // Aulas perdidas (NO_SHOW)
        prisma.lesson.count({
          where: { studentId, status: 'NO_SHOW' },
        }),

        // Dados do perfil do aluno
        prisma.student.findUnique({
          where: { id: studentId },
          select: {
            currentStreak: true,
            longestStreak: true,
            totalLessonsAttended: true,
          },
        }),
      ]);

      // Calcular tempo total de estudo (aulas concluídas)
      const completedLessonsDetails = await prisma.lesson.findMany({
        where: { studentId, status: 'COMPLETED' },
        select: { duration: true },
      });

      const totalStudyTime = completedLessonsDetails.reduce(
        (total, lesson) => total + lesson.duration,
        0
      );

      const averageAttendance =
        totalLessons > 0
          ? ((totalLessons - missedLessons) / totalLessons) * 100
          : 100;

      const stats = {
        totalLessons,
        completedLessons,
        upcomingLessons,
        missedLessons,
        totalStudyTime,
        averageAttendance: Math.round(averageAttendance * 10) / 10,
        currentStreak: studentData?.currentStreak || 0,
        longestStreak: studentData?.longestStreak || 0,
      };

      // 2. PRÓXIMAS AULAS
      const upcomingLessonsRaw = await prisma.lesson.findMany({
        where: {
          studentId,
          status: 'SCHEDULED',
          scheduledAt: { gte: now },
        },
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
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      });

      const upcomingLessonsFormatted = upcomingLessonsRaw.map(
        (lesson, index) => ({
          id: lesson.id,
          title: lesson.title,
          scheduledAt: lesson.scheduledAt,
          duration: lesson.duration,
          teacher: {
            id: lesson.teacher.user.id,
            name: `${lesson.teacher.user.firstName || ''} ${
              lesson.teacher.user.lastName || ''
            }`.trim(),
            image: lesson.teacher.user.image || undefined,
          },
          location: lesson.location || undefined,
          objectives: lesson.objectives,
          publicNotes: lesson.publicNotes || undefined,
          homework: lesson.homework || undefined,
          isToday:
            lesson.scheduledAt >= startOfToday &&
            lesson.scheduledAt < endOfToday,
          isNext: index === 0,
        })
      );

      // 3. AULAS DE HOJE
      const todayLessons = upcomingLessonsFormatted.filter(
        (lesson) => lesson.isToday
      );

      // 4. AULAS RECENTES CONCLUÍDAS
      const recentLessonsRaw = await prisma.lesson.findMany({
        where: {
          studentId,
          status: 'COMPLETED',
          scheduledAt: { lte: now },
        },
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
        orderBy: { scheduledAt: 'desc' },
        take: 5,
      });

      const recentLessonsFormatted = recentLessonsRaw.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
        duration: lesson.duration,
        status: lesson.status,
        teacher: {
          name: `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim(),
          image: lesson.teacher.user.image || undefined,
        },
        lessonSummary: lesson.lessonSummary || undefined,
        publicNotes: lesson.publicNotes || undefined,
        homework: lesson.homework || undefined,
        nextLessonPrep: lesson.nextLessonPrep || undefined,
        skillsWorked: lesson.skillsWorked,
        improvements: lesson.improvements,
        challenges: lesson.challenges,
        studentProgress: lesson.studentProgress,
      }));

      // 5. PROGRESSO DE ESTUDOS (integração com WantToLearn/Learned)
      const [currentWorks, learnedWorks, recentAnnotations] = await Promise.all(
        [
          // Obras que quer aprender
          prisma.wantToLearn.findMany({
            where: { userId },
            include: {
              work: {
                include: {
                  composer: {
                    select: { name: true },
                  },
                },
              },
              selectedWorkScore: {
                select: {
                  title: true,
                  type: true,
                },
              },
            },
            orderBy: { addedAt: 'desc' },
            take: 10,
          }),

          // Obras já aprendidas
          prisma.learned.findMany({
            where: { userId },
            include: {
              work: {
                include: {
                  composer: {
                    select: { name: true },
                  },
                },
              },
            },
            orderBy: { learnedAt: 'desc' },
            take: 10,
          }),

          // Anotações recentes
          prisma.workAnnotation.findMany({
            where: {
              userId,
              isPublic: true,
            },
            include: {
              work: {
                select: { title: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
        ]
      );

      const studyProgress = {
        currentWorks: currentWorks.map((item) => ({
          workId: item.work.id,
          title: item.work.title,
          composer: item.work.composer.name,
          addedAt: item.addedAt,
          difficulty: item.difficulty,
          selectedScore: item.selectedWorkScore
            ? {
                title: item.selectedWorkScore.title,
                type: item.selectedWorkScore.type,
              }
            : undefined,
        })),

        learnedWorks: learnedWorks.map((item) => ({
          workId: item.work.id,
          title: item.work.title,
          composer: item.work.composer.name,
          learnedAt: item.learnedAt,
          mastery: item.mastery,
          wouldRecommend: item.wouldRecommend,
        })),

        recentAnnotations: recentAnnotations.map((annotation) => ({
          id: annotation.id,
          workTitle: annotation.work.title,
          title: annotation.title,
          category: annotation.category,
          createdAt: annotation.createdAt,
        })),
      };

      // 6. PROFESSORES VINCULADOS
      const teacherRelationships = await prisma.teacherStudent.findMany({
        where: {
          studentId,
          isActive: true,
        },
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

      const teachers = await Promise.all(
        teacherRelationships.map(async (rel) => {
          // Próxima aula com este professor
          const nextLesson = await prisma.lesson.findFirst({
            where: {
              teacherId: rel.teacherId,
              studentId: studentId,
              status: 'SCHEDULED',
              scheduledAt: { gte: now },
            },
            orderBy: { scheduledAt: 'asc' },
            select: { scheduledAt: true },
          });

          // Total de aulas com este professor
          const totalLessons = await prisma.lesson.count({
            where: {
              teacherId: rel.teacherId,
              studentId: studentId,
            },
          });

          return {
            teacherId: rel.teacher.user.id,
            teacherName:
              `${rel.teacher.user.firstName} ${rel.teacher.user.lastName}`.trim(),
            teacherImage: rel.teacher.user.image || undefined,
            relationshipStart: rel.startDate,
            nextLessonAt: nextLesson?.scheduledAt,
            totalLessonsWithTeacher: totalLessons,
            specialties: rel.teacher.specialties || [],
          };
        })
      );

      // 7. MONTAR DASHBOARD FINAL
      const dashboard: StudentDashboard = {
        stats,
        upcomingLessons: upcomingLessonsFormatted,
        todayLessons,
        recentLessons: recentLessonsFormatted,
        studyProgress,
        teachers,
      };

      console.log(`✅ [STUDENT-DASHBOARD] Dashboard loaded successfully`);

      return dashboard;
    } catch (error) {
      console.error('❌ [STUDENT-DASHBOARD] Error loading dashboard:', error);
      return null;
    }
  },
  ['student-dashboard-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['student-dashboard'],
  }
);

// ====================================
// PROFILE REQUESTS - QUERIES DIRETAS
// ====================================

export const getStudentProfile = unstable_cache(
  async (
    userId: string
  ): Promise<{
    profile: StudentProfile;
    isNew: boolean;
  } | null> => {
    try {
      console.log(`👨‍🎓 [STUDENT-PROFILE] Loading profile for user ${userId}`);

      // Buscar perfil do aluno
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              city: true,
              state: true,
              country: true,
              image: true,
              experienceLevel: true,
            },
          },
          teachers: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      image: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!studentProfile) {
        // Se não existe, criar perfil básico
        console.log(
          `🆕 [STUDENT-PROFILE] Creating basic profile for student ${userId}`
        );

        const newStudentProfile = await prisma.student.create({
          data: {
            userId: userId,
            level: 'BEGINNER',
            preferredGenres: [],
            allowPublicProgress: false,
            allowProgressShare: true,
            profileVisibility: 'teacher_only',
            status: 'ACTIVE',
            preferredContact: 'whatsapp',
            totalLessonsAttended: 0,
            totalAssignments: 0,
            completedAssignments: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                country: true,
                image: true,
                experienceLevel: true,
              },
            },
            teachers: {
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

        const profileData: StudentProfile = {
          id: newStudentProfile.id,
          userId: newStudentProfile.userId,
          level: newStudentProfile.level,
          mainInstrument: newStudentProfile.mainInstrument || undefined,
          musicalGoals: newStudentProfile.musicalGoals || undefined,
          preferredGenres: newStudentProfile.preferredGenres,
          musicalBackground: newStudentProfile.musicalBackground || undefined,
          allowPublicProgress: newStudentProfile.allowPublicProgress,
          allowProgressShare: newStudentProfile.allowProgressShare,
          profileVisibility: newStudentProfile.profileVisibility,
          practiceTime: newStudentProfile.practiceTime || undefined,
          practiceSchedule: newStudentProfile.practiceSchedule,
          learningPace: newStudentProfile.learningPace || undefined,
          specialNeeds: newStudentProfile.specialNeeds || undefined,
          status: newStudentProfile.status,
          enrollmentDate: newStudentProfile.enrollmentDate,
          lastLessonAt: newStudentProfile.lastLessonAt || undefined,
          lastActiveAt: newStudentProfile.lastActiveAt || undefined,
          preferredContact: newStudentProfile.preferredContact,
          reminderPreferences: newStudentProfile.reminderPreferences,
          totalLessonsAttended: newStudentProfile.totalLessonsAttended,
          totalAssignments: newStudentProfile.totalAssignments,
          completedAssignments: newStudentProfile.completedAssignments,
          currentStreak: newStudentProfile.currentStreak,
          longestStreak: newStudentProfile.longestStreak,
          progressScore: newStudentProfile.progressScore || undefined,
          user: newStudentProfile.user,
          teachers: [],
          createdAt: newStudentProfile.createdAt,
          updatedAt: newStudentProfile.updatedAt,
        };

        return {
          profile: profileData,
          isNew: true,
        };
      }

      // Buscar informações dos professores
      const teachersWithDetails = await Promise.all(
        studentProfile.teachers.map(async (rel) => {
          // Próxima aula com este professor
          const nextLesson = await prisma.lesson.findFirst({
            where: {
              teacherId: rel.teacherId,
              studentId: studentProfile.id,
              status: 'SCHEDULED',
              scheduledAt: {
                gte: new Date(),
              },
            },
            orderBy: { scheduledAt: 'asc' },
            select: { scheduledAt: true },
          });

          // Total de aulas com este professor
          const totalLessons = await prisma.lesson.count({
            where: {
              teacherId: rel.teacherId,
              studentId: studentProfile.id,
            },
          });

          return {
            teacherId: rel.teacher.user.id,
            teacherName:
              `${rel.teacher.user.firstName} ${rel.teacher.user.lastName}`.trim(),
            teacherImage: rel.teacher.user.image || undefined,
            isActive: rel.isActive,
            startDate: rel.startDate,
            maxLessonsPerWeek: rel.maxLessonsPerWeek,
            lessonDuration: rel.lessonDuration,
            nextLessonAt: nextLesson?.scheduledAt,
            totalLessons,
          };
        })
      );

      // Formatar perfil existente
      const profileData: StudentProfile = {
        id: studentProfile.id,
        userId: studentProfile.userId,
        level: studentProfile.level,
        mainInstrument: studentProfile.mainInstrument || undefined,
        musicalGoals: studentProfile.musicalGoals || undefined,
        preferredGenres: studentProfile.preferredGenres,
        musicalBackground: studentProfile.musicalBackground || undefined,
        allowPublicProgress: studentProfile.allowPublicProgress,
        allowProgressShare: studentProfile.allowProgressShare,
        profileVisibility: studentProfile.profileVisibility,
        practiceTime: studentProfile.practiceTime || undefined,
        practiceSchedule: studentProfile.practiceSchedule,
        learningPace: studentProfile.learningPace || undefined,
        specialNeeds: studentProfile.specialNeeds || undefined,
        status: studentProfile.status,
        enrollmentDate: studentProfile.enrollmentDate,
        lastLessonAt: studentProfile.lastLessonAt || undefined,
        lastActiveAt: studentProfile.lastActiveAt || undefined,
        preferredContact: studentProfile.preferredContact,
        reminderPreferences: studentProfile.reminderPreferences,
        totalLessonsAttended: studentProfile.totalLessonsAttended,
        totalAssignments: studentProfile.totalAssignments,
        completedAssignments: studentProfile.completedAssignments,
        currentStreak: studentProfile.currentStreak,
        longestStreak: studentProfile.longestStreak,
        progressScore: studentProfile.progressScore || undefined,
        user: studentProfile.user,
        teachers: teachersWithDetails,
        createdAt: studentProfile.createdAt,
        updatedAt: studentProfile.updatedAt,
      };

      console.log(`✅ [STUDENT-PROFILE] Profile loaded successfully`);

      return {
        profile: profileData,
        isNew: false,
      };
    } catch (error) {
      console.error('❌ [STUDENT-PROFILE] Error loading profile:', error);
      return null;
    }
  },
  ['student-profile-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['student-profile'],
  }
);

// ====================================
// CALENDAR REQUESTS - QUERIES DIRETAS
// ====================================

export const getStudentCalendar = unstable_cache(
  async (
    userId: string,
    startDate: Date,
    endDate: Date,
    options: {
      view?: string;
      includeStats?: boolean;
      teacherId?: string;
    } = {}
  ): Promise<{
    events: StudentCalendarEvent[];
    stats?: any;
    period: {
      start: Date;
      end: Date;
      view: string;
    };
    metadata: any;
  } | null> => {
    try {
      console.log(`📅 [STUDENT-CALENDAR] Loading calendar for user ${userId}`);

      // Verificar se aluno existe
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!studentProfile) {
        console.log(
          `❌ [STUDENT-CALENDAR] Student profile not found for user ${userId}`
        );
        return null;
      }

      const studentId = studentProfile.id;

      // Montar where clause
      const whereClause: any = {
        studentId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Filtrar por professor se especificado
      if (options.teacherId) {
        const teacherProfile = await prisma.teacher.findUnique({
          where: { userId: options.teacherId },
          select: { id: true },
        });

        if (teacherProfile) {
          whereClause.teacherId = teacherProfile.id;
        }
      }

      // Buscar aulas no período
      const lessons = await prisma.lesson.findMany({
        where: whereClause,
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
        orderBy: { scheduledAt: 'asc' },
      });

      // Converter aulas para eventos do calendário
      const events: StudentCalendarEvent[] = lessons.map((lesson) => {
        const startTime = new Date(lesson.scheduledAt);
        const endTime = new Date(startTime.getTime() + lesson.duration * 60000);

        // Cores baseadas no status (perspectiva do aluno)
        let backgroundColor = '#3B82F6'; // Azul padrão
        let borderColor = '#1D4ED8';
        let textColor = '#FFFFFF';

        switch (lesson.status) {
          case 'COMPLETED':
            backgroundColor = '#10B981'; // Verde
            borderColor = '#059669';
            break;
          case 'CANCELLED':
            backgroundColor = '#6B7280'; // Cinza
            borderColor = '#4B5563';
            break;
          case 'NO_SHOW':
            backgroundColor = '#EF4444'; // Vermelho (faltou)
            borderColor = '#DC2626';
            break;
          case 'RESCHEDULED':
            backgroundColor = '#F59E0B'; // Amarelo
            borderColor = '#D97706';
            textColor = '#000000';
            break;
        }

        // Se a aula é hoje e ainda não começou, destacar
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (
          lesson.status === 'SCHEDULED' &&
          startTime >= today &&
          startTime <= new Date(today.getTime() + 24 * 60 * 60 * 1000)
        ) {
          backgroundColor = '#8B5CF6'; // Roxo para aulas de hoje
          borderColor = '#7C3AED';
        }

        return {
          id: lesson.id,
          title: lesson.title,
          start: startTime,
          end: endTime,
          type: 'lesson' as const,
          status: lesson.status as any,
          teacher: {
            id: lesson.teacher.user.id,
            name: `${lesson.teacher.user.firstName || ''} ${
              lesson.teacher.user.lastName || ''
            }`.trim(),
            image: lesson.teacher.user.image || undefined,
          },
          location: lesson.location || undefined,
          description: lesson.description || undefined,
          objectives: lesson.objectives,
          homework: lesson.homework || undefined,
          publicNotes: lesson.publicNotes || undefined,
          backgroundColor,
          borderColor,
          textColor,
          details: {
            workScoreIds: lesson.workScoreIds,
            topics: lesson.topics,
            techniques: lesson.techniques,
            lessonSummary: lesson.lessonSummary || undefined,
            skillsWorked: lesson.skillsWorked,
            improvements: lesson.improvements,
            challenges: lesson.challenges,
            studentProgress: lesson.studentProgress,
            nextLessonPrep: lesson.nextLessonPrep || undefined,
            canProvideFeedback:
              lesson.status === 'COMPLETED' && !lesson.studentFeedback,
            studentFeedback: lesson.studentFeedback || undefined,
          },
        };
      });

      // Resposta base
      const response: any = {
        events,
        period: {
          start: startDate,
          end: endDate,
          view: options.view || 'month',
        },
        metadata: {
          totalEvents: events.length,
          lessonCount: events.filter((e) => e.type === 'lesson').length,
          byStatus: {
            scheduled: events.filter((e) => e.status === 'SCHEDULED').length,
            completed: events.filter((e) => e.status === 'COMPLETED').length,
            cancelled: events.filter((e) => e.status === 'CANCELLED').length,
            noShow: events.filter((e) => e.status === 'NO_SHOW').length,
          },
        },
      };

      // Adicionar estatísticas se solicitado
      if (options.includeStats) {
        const totalLessons = events.length;
        const completedLessons = events.filter(
          (e) => e.status === 'COMPLETED'
        ).length;
        const upcomingLessons = events.filter(
          (e) => e.status === 'SCHEDULED'
        ).length;
        const noShowLessons = events.filter(
          (e) => e.status === 'NO_SHOW'
        ).length;

        const practiceHours = events
          .filter((e) => e.status === 'COMPLETED')
          .reduce((total, event) => {
            const duration =
              (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
            return total + duration;
          }, 0);

        const attendanceRate =
          totalLessons > 0
            ? ((totalLessons - noShowLessons) / totalLessons) * 100
            : 100;

        response.stats = {
          totalLessons,
          completedLessons,
          upcomingLessons,
          practiceHours: Math.round(practiceHours * 10) / 10,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
        };
      }

      console.log(`✅ [STUDENT-CALENDAR] Calendar loaded successfully`);

      return response;
    } catch (error) {
      console.error('❌ [STUDENT-CALENDAR] Error loading calendar:', error);
      return null;
    }
  },
  ['student-calendar-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['student-calendar'],
  }
);

// ====================================
// LESSONS REQUESTS - QUERIES DIRETAS
// ====================================

export const getStudentLessons = unstable_cache(
  async (
    userId: string,
    filters: {
      teacherId?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    lessons: any[];
    pagination: {
      offset: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  } | null> => {
    try {
      console.log(`📅 [STUDENT-LESSONS] Loading lessons for user ${userId}`);

      // Verificar se aluno existe
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!studentProfile) {
        console.log(
          `❌ [STUDENT-LESSONS] Student profile not found for user ${userId}`
        );
        return null;
      }

      const studentId = studentProfile.id;
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      // Montar where clause
      const whereClause: any = {
        studentId,
      };

      // Filtros adicionais
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.teacherId) {
        const teacherProfile = await prisma.teacher.findUnique({
          where: { userId: filters.teacherId },
          select: { id: true },
        });
        if (teacherProfile) {
          whereClause.teacherId = teacherProfile.id;
        }
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.scheduledAt = {};
        if (filters.dateFrom) {
          whereClause.scheduledAt.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          whereClause.scheduledAt.lte = new Date(filters.dateTo);
        }
      }

      // Buscar aulas
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

      // Formatar aulas
      const lessonsFormatted = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        scheduledAt: lesson.scheduledAt,
        duration: lesson.duration,
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

        // Dados do professor e aluno
        teacher: {
          id: lesson.teacher.user.id,
          name: `${lesson.teacher.user.firstName || ''} ${
            lesson.teacher.user.lastName || ''
          }`.trim(),
          email: lesson.teacher.user.email,
          image: lesson.teacher.user.image,
        },
        student: {
          id: lesson.student.user.id,
          name: `${lesson.student.user.firstName || ''} ${
            lesson.student.user.lastName || ''
          }`.trim(),
          email: lesson.student.user.email,
          image: lesson.student.user.image,
        },

        // Timestamps
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      }));

      console.log(
        `✅ [STUDENT-LESSONS] Returning ${lessonsFormatted.length} lessons`
      );

      return {
        lessons: lessonsFormatted,
        pagination: {
          offset,
          limit,
          total: totalCount,
          hasMore: offset + lessonsFormatted.length < totalCount,
        },
      };
    } catch (error) {
      console.error('❌ [STUDENT-LESSONS] Error fetching lessons:', error);
      return null;
    }
  },
  ['student-lessons-data'],
  {
    revalidate: 180, // 3 minutos
    tags: ['student-lessons'],
  }
);

export const getStudentLesson = unstable_cache(
  async (userId: string, lessonId: string): Promise<any | null> => {
    try {
      console.log(
        `📅 [STUDENT-LESSON] Loading lesson ${lessonId} for user ${userId}`
      );

      // Verificar se aluno existe
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!studentProfile) {
        console.log(
          `❌ [STUDENT-LESSON] Student profile not found for user ${userId}`
        );
        return null;
      }

      // Buscar aula específica
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          studentId: studentProfile.id,
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
          `❌ [STUDENT-LESSON] Lesson ${lessonId} not found or no access`
        );
        return null;
      }

      // Buscar estatísticas do relacionamento
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

      // Calcular duração do relacionamento
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

      // Buscar WorkScores se houver IDs
      let workScores: any[] = [];
      if (lesson.workScoreIds.length > 0) {
        workScores = await prisma.workScore.findMany({
          where: {
            id: { in: lesson.workScoreIds },
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

      // Buscar aulas relacionadas (se for série recorrente)
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

      // Definir permissões baseadas no role (aluno)
      const permissions = {
        canEdit: false,
        canCancel: false,
        canReschedule: false,
        canViewTeacherNotes: false,
        canAddFeedback: lesson.status === 'COMPLETED',
        canMarkAttendance: false,
      };

      // Montar resposta detalhada
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
        workScoreIds: lesson.workScoreIds,
        topics: lesson.topics,
        techniques: lesson.techniques,
        repertoire: lesson.repertoire,
        homework: lesson.homework || undefined,
        practiceGoals: lesson.practiceGoals,
        nextLessonPrep: lesson.nextLessonPrep || undefined,

        // Anotações (filtradas por permissão - aluno não vê teacherNotes)
        teacherNotes: undefined,
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

        // WorkScores
        workScores: workScores.map((ws) => ({
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

      console.log(`✅ [STUDENT-LESSON] Lesson details loaded`);

      return lessonDetails;
    } catch (error) {
      console.error('❌ [STUDENT-LESSON] Error fetching lesson:', error);
      return null;
    }
  },
  ['student-lesson-data'],
  {
    revalidate: 180, // 3 minutos
    tags: ['student-lesson'],
  }
);

export const getStudentAssignments = unstable_cache(
  async (
    userId: string,
    filters: {
      teacherId?: string;
      status?: string;
      lessonId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    assignments: any[];
    stats: any;
    pagination: {
      offset: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  } | null> => {
    try {
      console.log(
        `📝 [STUDENT-ASSIGNMENTS] Loading assignments for user ${userId}`
      );

      // Verificar se aluno existe
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!studentProfile) {
        console.log(
          `❌ [STUDENT-ASSIGNMENTS] Student profile not found for user ${userId}`
        );
        return null;
      }

      const studentId = studentProfile.id;
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      // Montar where clause
      const whereClause: any = {
        studentId,
      };

      // Filtros adicionais
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.lessonId) {
        whereClause.lessonId = filters.lessonId;
      }

      if (filters.teacherId) {
        const teacherProfile = await prisma.teacher.findUnique({
          where: { userId: filters.teacherId },
          select: { id: true },
        });
        if (teacherProfile) {
          whereClause.lesson = {
            teacherId: teacherProfile.id,
          };
        }
      }

      // Buscar assignments
      const [assignments, totalCount] = await Promise.all([
        prisma.assignment.findMany({
          where: whereClause,
          include: {
            lesson: {
              include: {
                teacher: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        prisma.assignment.count({ where: whereClause }),
      ]);

      // Calcular estatísticas
      const stats = {
        total: totalCount,
        pending: assignments.filter((a) => a.status === 'PENDING').length,
        inProgress: assignments.filter((a) => a.status === 'IN_PROGRESS')
          .length,
        completed: assignments.filter((a) => a.status === 'COMPLETED').length,
        overdue: assignments.filter((a) => a.status === 'OVERDUE').length,
      };

      // Formatar assignments
      const assignmentsFormatted = assignments.map((assignment) => ({
        id: assignment.id,
        lessonId: assignment.lessonId,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,

        // Recursos e materiais
        workScoreIds: assignment.workScoreIds,
        exercises: assignment.exercises,

        // Metas específicas
        practiceGoals: assignment.practiceGoals,
        tempoTargets: assignment.tempoTargets,
        technicalGoals: assignment.technicalGoals,
        musicalGoals: assignment.musicalGoals,

        // Status e prazos
        status: assignment.status,
        dueDate: assignment.dueDate,
        estimatedTime: assignment.estimatedTime,
        actualTime: assignment.actualTime,

        // Progresso e completion
        isCompleted: assignment.isCompleted,
        completedAt: assignment.completedAt,
        progress: assignment.progress,

        // Feedback e avaliação
        teacherFeedback: assignment.teacherFeedback,
        teacherRating: assignment.teacherRating,
        studentNotes: assignment.studentNotes,
        studentRating: assignment.studentRating,

        // Submissões do aluno
        submissions: assignment.submissions,
        submissionDate: assignment.submissionDate,

        // Dados da aula e professor
        lesson: {
          id: assignment.lesson.id,
          title: assignment.lesson.title,
          scheduledAt: assignment.lesson.scheduledAt,
          teacher: {
            name: `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim(),
          },
        },

        // Timestamps
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      }));

      console.log(
        `✅ [STUDENT-ASSIGNMENTS] Returning ${assignmentsFormatted.length} assignments`
      );

      return {
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
        '❌ [STUDENT-ASSIGNMENTS] Error fetching assignments:',
        error
      );
      return null;
    }
  },
  ['student-assignments-data'],
  {
    revalidate: 180, // 3 minutos
    tags: ['student-assignments'],
  }
);

export const getStudentDashboardForPageServer = async (userId: string) => {
  return await getStudentDashboard(userId);
};

export const getStudentProfileForPageServer = async (userId: string) => {
  return await getStudentProfile(userId);
};

export const getStudentCalendarForPageServer = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  options: {
    view?: string;
    includeStats?: boolean;
    teacherId?: string;
  } = {}
) => {
  return await getStudentCalendar(userId, startDate, endDate, options);
};

export const getStudentLessonsForPageServer = async (
  userId: string,
  filters: {
    teacherId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}
) => {
  return await getStudentLessons(userId, filters);
};

export const getStudentLessonForPageServer = async (
  userId: string,
  lessonId: string
) => {
  return await getStudentLesson(userId, lessonId);
};

export const getStudentAssignmentsForPageServer = async (
  userId: string,
  filters: {
    teacherId?: string;
    status?: string;
    lessonId?: string;
    limit?: number;
    offset?: number;
  } = {}
) => {
  return await getStudentAssignments(userId, filters);
};

export const addLessonFeedback = async (
  lessonId: string,
  feedback: string,
  rating?: number
): Promise<{ success: boolean; lesson?: any; error?: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/calendar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId, feedback, rating }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      };
    }

    return { success: data.success, lesson: data.lesson };
  } catch (error) {
    console.error('❌ Error adding lesson feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getStudentAssignmentDetailsData = unstable_cache(
  async (
    assignmentId: string,
    userId: string,
    userRole: number = 0
  ): Promise<StudentAssignmentDetailsResponse> => {
    try {
      console.log(
        `📋👨‍🎓 [STUDENT-ASSIGNMENT-DETAILS] Loading assignment ${assignmentId} for user ${userId}`
      );

      // 1. Verificar se aluno existe
      const studentProfile = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!studentProfile) {
        console.log(
          `❌ [STUDENT-ASSIGNMENT-DETAILS] Student profile not found for user ${userId}`
        );
        return {
          success: false,
          error: 'Perfil de aluno não encontrado',
        };
      }

      // 2. Buscar assignment com verificação de acesso (aluno só vê seus próprios assignments)
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          studentId: studentProfile.id,
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
          `❌ [STUDENT-ASSIGNMENT-DETAILS] Assignment ${assignmentId} not found or access denied`
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

      // 🆕 5. Extrair progress milestones (melhorado)
      let progressMilestones = {
        learnedLeftHand: false,
        learnedRightHand: false,
        playedWithMetronome: false,
        memorized: false,
        playedAtTempo: false,
        masteredDynamics: false,
        performedForOthers: false,
      };

      // Extrair de submissions se existir
      if (assignment.submissions) {
        try {
          const submissions = assignment.submissions as AssignmentSubmissions;
          if (
            submissions &&
            typeof submissions === 'object' &&
            submissions.progressMilestones
          ) {
            progressMilestones = {
              ...progressMilestones,
              ...submissions.progressMilestones,
            };
            console.log(
              `📊 [STUDENT-ASSIGNMENT-DETAILS] Progress milestones extracted from submissions`
            );
          }
        } catch (error) {
          console.warn(
            '⚠️ [STUDENT-ASSIGNMENT-DETAILS] Erro ao processar submissions progressMilestones:',
            error
          );
        }
      }

      // 6. Definir permissões (perspectiva do aluno)
      const permissions = {
        canEdit: false, // Aluno não pode editar assignment
        canDelete: false, // Aluno não pode deletar assignment
        canComplete: userRole === 0 && !assignment.isCompleted,
        canAddFeedback: userRole === 0,
        canAddSubmission: userRole === 0 && !assignment.isCompleted,
      };

      // 7. Formatar assignment completo (perspectiva do aluno)
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

        // Feedback (aluno vê feedback do professor, mas pode editar o próprio)
        teacherFeedback: assignment.teacherFeedback,
        teacherRating: assignment.teacherRating,
        studentNotes: assignment.studentNotes,
        studentRating: assignment.studentRating,

        // Submissões
        submissions: assignment.submissions,
        submissionDate: assignment.submissionDate,

        // Relacionamentos
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

        // 🆕 Progress Milestones (agora extraído corretamente)
        progressMilestones,

        // Permissões
        permissions,

        // Timestamps
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };

      console.log(
        `✅ [STUDENT-ASSIGNMENT-DETAILS] Assignment details loaded successfully - ${assignment.title}`,
        {
          hasProgressMilestones:
            Object.values(progressMilestones).some(Boolean),
          progressMilestonesCount:
            Object.values(progressMilestones).filter(Boolean).length,
        }
      );

      return {
        success: true,
        assignment: assignmentDetail,
        userRole,
      };
    } catch (error) {
      console.error(
        '❌ [STUDENT-ASSIGNMENT-DETAILS] Error loading assignment details:',
        error
      );
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      };
    }
  },
  ['student-assignment-details-data'],
  {
    revalidate: 300, // 5 minutos
    tags: ['student-assignment-details'],
  }
);

// ====================================
// CACHE INVALIDATION
// ====================================

export async function revalidateStudentCache() {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('student-dashboard');
  revalidateTag('student-dashboard-data');
  revalidateTag('student-profile');
  revalidateTag('student-profile-data');
  revalidateTag('student-calendar');
  revalidateTag('student-calendar-data');
  revalidateTag('student-lessons');
  revalidateTag('student-assignments');
  revalidateTag('student-lesson-works');
}
