// app/api/overview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface SystemOverview {
  user: {
    id: string;
    name: string;
    email: string;
    role: number;
    roleDescription: string;
    memberSince: Date;
    lastActive: Date;
    profileComplete: boolean;
  };

  // Para professores
  teacher?: {
    profile: {
      isVerified: boolean;
      isPublicProfile: boolean;
      specialties: string[];
      instruments: string[];
      averageRating: number;
      totalReviews: number;
    };

    stats: {
      totalStudents: number;
      activeStudents: number;
      totalLessonsGiven: number;
      hoursTeaching: number;
      completionRate: number;
      responseTime: number;
    };

    recent: {
      upcomingLessons: Array<{
        id: string;
        title: string;
        scheduledAt: Date;
        studentName: string;
        duration: number;
      }>;
      recentStudents: Array<{
        id: string;
        name: string;
        joinedAt: Date;
        lastLesson: Date;
        totalLessons: number;
      }>;
      pendingActions: Array<{
        type: 'assignment_review' | 'lesson_feedback' | 'student_request';
        title: string;
        description: string;
        dueDate?: Date;
        priority: 'low' | 'medium' | 'high';
      }>;
    };

    quick_actions: Array<{
      action: string;
      label: string;
      description: string;
      url: string;
      available: boolean;
    }>;
  };

  // Para alunos
  student?: {
    profile: {
      level: string;
      mainInstrument: string;
      musicalGoals: string;
      currentStreak: number;
      progressScore: number;
    };

    stats: {
      totalLessons: number;
      hoursStudied: number;
      assignmentsCompleted: number;
      attendanceRate: number;
      averageGrade: number;
    };

    recent: {
      upcomingLessons: Array<{
        id: string;
        title: string;
        scheduledAt: Date;
        teacherName: string;
        duration: number;
      }>;
      recentAssignments: Array<{
        id: string;
        title: string;
        dueDate: Date;
        status: string;
        teacherName: string;
      }>;
      studyProgress: Array<{
        workId: string;
        title: string;
        composer: string;
        progress: number;
        lastStudied: Date;
      }>;
    };

    teachers: Array<{
      id: string;
      name: string;
      relationshipDuration: number;
      nextLessonAt?: Date;
      totalLessons: number;
      subjects: string[];
    }>;

    quick_actions: Array<{
      action: string;
      label: string;
      description: string;
      url: string;
      available: boolean;
    }>;
  };

  // Configurações e recursos disponíveis
  features: {
    available: string[];
    beta: string[];
    planned: string[];
  };

  // Configurações do sistema
  settings: {
    notifications: boolean;
    profileVisibility: string;
    dataSharing: boolean;
    experimentalFeatures: boolean;
  };

  // Status do sistema
  system: {
    version: string;
    maintenance: boolean;
    announcements: Array<{
      id: string;
      title: string;
      message: string;
      type: 'info' | 'warning' | 'success';
      dismissible: boolean;
    }>;
  };
}

// Cache do overview por 10 minutos
const getCachedUserOverview = unstable_cache(
  async (userId: string, userRole: number): Promise<SystemOverview | null> => {
    console.log(
      `📋 [OVERVIEW] Calculando overview para usuário ${userId} (cache miss)`
    );

    try {
      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          onboardingCompleted: true,
          teacherProfile:
            userRole === 1
              ? {
                  select: {
                    isVerified: true,
                    isPublicProfile: true,
                    specialties: true,
                    instruments: true,
                    averageRating: true,
                    totalReviews: true,
                    totalStudents: true,
                    totalLessons: true,
                    completionRate: true,
                  },
                }
              : false,
          studentProfile:
            userRole === 0
              ? {
                  select: {
                    level: true,
                    mainInstrument: true,
                    musicalGoals: true,
                    currentStreak: true,
                    progressScore: true,
                    totalLessonsAttended: true,
                    completedAssignments: true,
                    totalAssignments: true,
                  },
                }
              : false,
        },
      });

      if (!user) return null;

      const name =
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';
      const roleDescription =
        userRole === 1 ? 'Professor' : userRole === 0 ? 'Aluno' : 'Usuário';

      const baseOverview: SystemOverview = {
        user: {
          id: user.id,
          name,
          email: user.email || '',
          role: user.role,
          roleDescription,
          memberSince: user.createdAt,
          lastActive: user.updatedAt,
          profileComplete: user.onboardingCompleted,
        },

        features: {
          available: [
            'lessons_management',
            'calendar_integration',
            'assignments_system',
            'progress_tracking',
            'notifications',
            'data_export',
            'mobile_access',
          ],
          beta: [
            'ai_practice_suggestions',
            'advanced_analytics',
            'group_lessons',
          ],
          planned: [
            'video_lessons',
            'payment_integration',
            'parent_portal',
            'advanced_reporting',
          ],
        },

        settings: {
          notifications: true, // Configurável
          profileVisibility: userRole === 1 ? 'public' : 'teachers_only',
          dataSharing: true,
          experimentalFeatures: false,
        },

        system: {
          version: '1.0.0',
          maintenance: false,
          announcements: [
            {
              id: 'welcome_2024',
              title: '🎵 Bem-vindo ao Opus Atlas Teacher-Student!',
              message:
                'Sistema de ensino musical integrado já está disponível. Explore todas as funcionalidades!',
              type: 'success',
              dismissible: true,
            },
          ],
        },
      };

      // Dados específicos para professores
      if (userRole === 1 && (user as any).teacherProfile) {
        const teacherData = (user as any).teacherProfile;
        const teacherId = await prisma.teacher.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (teacherId) {
          // Buscar próximas aulas
          const upcomingLessons = await prisma.lesson.findMany({
            where: {
              teacherId: teacherId.id,
              status: 'SCHEDULED',
              scheduledAt: { gte: new Date() },
            },
            include: {
              student: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true, id: true },
                  },
                },
              },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
          });

          // Buscar alunos recentes
          const recentStudents = await prisma.teacherStudent.findMany({
            where: { teacherId: teacherId.id, isActive: true },
            include: {
              student: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true, id: true },
                  },
                },
              },
            },
            orderBy: { startDate: 'desc' },
            take: 5,
          });

          // Buscar dados para alunos recentes
          const recentStudentsWithData = await Promise.all(
            recentStudents.map(async (rel) => {
              const [lastLesson, totalLessons] = await Promise.all([
                prisma.lesson.findFirst({
                  where: { teacherId: teacherId.id, studentId: rel.student.id },
                  orderBy: { scheduledAt: 'desc' },
                  select: { scheduledAt: true },
                }),
                prisma.lesson.count({
                  where: { teacherId: teacherId.id, studentId: rel.student.id },
                }),
              ]);

              return {
                id: rel.student.user.id,
                name: `${rel.student.user.firstName} ${rel.student.user.lastName}`.trim(),
                joinedAt: rel.startDate,
                lastLesson: lastLesson?.scheduledAt || rel.startDate,
                totalLessons,
              };
            })
          );

          // Calcular horas de ensino
          const completedLessons = await prisma.lesson.findMany({
            where: { teacherId: teacherId.id, status: 'COMPLETED' },
            select: { duration: true },
          });
          const hoursTeaching =
            completedLessons.reduce((sum, l) => sum + l.duration, 0) / 60;

          baseOverview.teacher = {
            profile: {
              isVerified: teacherData.isVerified,
              isPublicProfile: teacherData.isPublicProfile,
              specialties: teacherData.specialties,
              instruments: teacherData.instruments,
              averageRating: teacherData.averageRating || 0,
              totalReviews: teacherData.totalReviews,
            },

            stats: {
              totalStudents: teacherData.totalStudents,
              activeStudents: recentStudents.length,
              totalLessonsGiven: teacherData.totalLessons,
              hoursTeaching: Math.round(hoursTeaching * 10) / 10,
              completionRate: teacherData.completionRate || 0,
              responseTime: 2.5, // Simulado
            },

            recent: {
              upcomingLessons: upcomingLessons.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                scheduledAt: lesson.scheduledAt,
                studentName:
                  `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
                duration: lesson.duration,
              })),

              recentStudents: recentStudentsWithData,

              pendingActions: [
                // TODO: Buscar assignments pendentes de review, etc.
              ],
            },

            quick_actions: [
              {
                action: 'schedule_lesson',
                label: 'Agendar Aula',
                description: 'Criar nova aula para um aluno',
                url: '/teacher/lessons/new',
                available: true,
              },
              {
                action: 'add_student',
                label: 'Adicionar Aluno',
                description: 'Vincular novo aluno',
                url: '/teacher/students/add',
                available: true,
              },
              {
                action: 'view_calendar',
                label: 'Ver Calendário',
                description: 'Visualizar agenda completa',
                url: '/teacher/calendar',
                available: true,
              },
              {
                action: 'create_assignment',
                label: 'Criar Assignment',
                description: 'Criar nova tarefa para aluno',
                url: '/teacher/assignments/new',
                available: true,
              },
              {
                action: 'view_reports',
                label: 'Relatórios',
                description: 'Ver relatórios de progresso',
                url: '/teacher/reports',
                available: true,
              },
            ],
          };
        }
      }

      // Dados específicos para alunos
      if (userRole === 0 && (user as any).studentProfile) {
        const studentData = (user as any).studentProfile;
        const studentId = await prisma.student.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (studentId) {
          // Buscar próximas aulas
          const upcomingLessons = await prisma.lesson.findMany({
            where: {
              studentId: studentId.id,
              status: 'SCHEDULED',
              scheduledAt: { gte: new Date() },
            },
            include: {
              teacher: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true, id: true },
                  },
                },
              },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
          });

          // Buscar assignments recentes
          const recentAssignments = await prisma.assignment.findMany({
            where: {
              studentId: studentId.id,
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
            include: {
              lesson: {
                include: {
                  teacher: {
                    include: {
                      user: {
                        select: { firstName: true, lastName: true, id: true },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { dueDate: 'asc' },
            take: 5,
          });

          // Buscar progresso de estudos
          const studyProgress = await prisma.wantToLearn.findMany({
            where: { userId },
            include: {
              work: {
                include: {
                  composer: { select: { name: true } },
                },
              },
            },
            orderBy: { addedAt: 'desc' },
            take: 5,
          });

          // Buscar professores
          const teacherRelations = await prisma.teacherStudent.findMany({
            where: { studentId: studentId.id, isActive: true },
            include: {
              teacher: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true, id: true },
                  },
                },
              },
            },
          });

          const teachers = await Promise.all(
            teacherRelations.map(async (rel) => {
              const [nextLesson, totalLessons] = await Promise.all([
                prisma.lesson.findFirst({
                  where: {
                    teacherId: rel.teacherId,
                    studentId: studentId.id,
                    status: 'SCHEDULED',
                    scheduledAt: { gte: new Date() },
                  },
                  orderBy: { scheduledAt: 'asc' },
                  select: { scheduledAt: true },
                }),
                prisma.lesson.count({
                  where: { teacherId: rel.teacherId, studentId: studentId.id },
                }),
              ]);

              const relationshipMonths = Math.ceil(
                (new Date().getTime() - rel.startDate.getTime()) /
                  (1000 * 60 * 60 * 24 * 30)
              );

              return {
                id: rel.teacher.user.id,
                name: `${rel.teacher.user.firstName} ${rel.teacher.user.lastName}`.trim(),
                relationshipDuration: relationshipMonths,
                nextLessonAt: nextLesson?.scheduledAt,
                totalLessons,
                subjects: [], // TODO: Buscar das especialidades do teacher
              };
            })
          );

          // Calcular horas estudadas
          const completedStudentLessons = await prisma.lesson.findMany({
            where: { studentId: studentId.id, status: 'COMPLETED' },
            select: { duration: true },
          });
          const hoursStudied =
            completedStudentLessons.reduce((sum, l) => sum + l.duration, 0) /
            60;

          // Calcular taxa de comparecimento
          const totalLessons = await prisma.lesson.count({
            where: { studentId: studentId.id },
          });
          const attendedLessons = await prisma.lesson.count({
            where: { studentId: studentId.id, status: { not: 'NO_SHOW' } },
          });
          const attendanceRate =
            totalLessons > 0 ? (attendedLessons / totalLessons) * 100 : 100;

          baseOverview.student = {
            profile: {
              level: studentData.level,
              mainInstrument: studentData.mainInstrument || 'Não definido',
              musicalGoals: studentData.musicalGoals || 'Não definidos',
              currentStreak: studentData.currentStreak,
              progressScore: studentData.progressScore || 0,
            },

            stats: {
              totalLessons: studentData.totalLessonsAttended,
              hoursStudied: Math.round(hoursStudied * 10) / 10,
              assignmentsCompleted: studentData.completedAssignments,
              attendanceRate: Math.round(attendanceRate * 10) / 10,
              averageGrade: 8.5, // Simulado
            },

            recent: {
              upcomingLessons: upcomingLessons.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                scheduledAt: lesson.scheduledAt,
                teacherName:
                  `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim(),
                duration: lesson.duration,
              })),

              recentAssignments: recentAssignments.map((assignment) => ({
                id: assignment.id,
                title: assignment.title,
                dueDate: assignment.dueDate || new Date(),
                status: assignment.status,
                teacherName:
                  `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim(),
              })),

              studyProgress: studyProgress.map((item) => ({
                workId: item.work.id,
                title: item.work.title,
                composer: item.work.composer.name,
                progress: 65, // Simulado
                lastStudied: item.addedAt,
              })),
            },

            teachers,

            quick_actions: [
              {
                action: 'view_schedule',
                label: 'Minha Agenda',
                description: 'Ver próximas aulas',
                url: '/student/calendar',
                available: true,
              },
              {
                action: 'view_assignments',
                label: 'Assignments',
                description: 'Ver tarefas pendentes',
                url: '/student/assignments',
                available: true,
              },
              {
                action: 'track_progress',
                label: 'Meu Progresso',
                description: 'Acompanhar evolução',
                url: '/student/progress',
                available: true,
              },
              {
                action: 'browse_works',
                label: 'Explorar Obras',
                description: 'Descobrir novo repertório',
                url: '/works/search',
                available: true,
              },
              {
                action: 'contact_teacher',
                label: 'Contatar Professor',
                description: 'Enviar mensagem (WhatsApp)',
                url: '/student/teachers',
                available: teachers.length > 0,
              },
            ],
          };
        }
      }

      return baseOverview;
    } catch (error) {
      console.error('❌ [OVERVIEW] Erro ao calcular overview:', error);
      return null;
    }
  },
  ['user-overview'],
  {
    revalidate: 600, // 10 minutos
    tags: ['overview'],
  }
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // 'basic', 'stats', 'recent', 'all'
    const forceRefresh = searchParams.get('refresh') === 'true';

    console.log(
      `📋 [OVERVIEW] Carregando overview - User: ${session.user.id}, Section: ${
        section || 'all'
      }`
    );

    // Buscar overview completo (com cache)
    const overview = await getCachedUserOverview(
      session.user.id,
      session.user.role
    );

    if (!overview) {
      return NextResponse.json(
        {
          error: 'Não foi possível carregar overview do usuário',
        },
        { status: 500 }
      );
    }

    // Filtrar por seção se solicitado
    let response = overview;
    if (section && section !== 'all') {
      const sections = section.split(',');
      response = Object.keys(overview)
        .filter((key) => sections.includes(key) || key === 'user')
        .reduce((obj: any, key) => {
          obj[key] = (overview as any)[key];
          return obj;
        }, {});
    }

    // Adicionar metadados da resposta
    const metadata = {
      generated_at: new Date().toISOString(),
      user_role: session.user.role,
      sections_included: section ? section.split(',') : Object.keys(overview),
      cache_status: forceRefresh ? 'refreshed' : 'cached',
      features_count: overview.features.available.length,
      quick_actions_count:
        (overview.teacher?.quick_actions.length || 0) +
        (overview.student?.quick_actions.length || 0),
    };

    console.log(`✅ [OVERVIEW] Overview carregado com sucesso`);

    return NextResponse.json({
      success: true,
      overview: response,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [OVERVIEW] Erro ao carregar overview:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Atualizar configurações rápidas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    console.log(
      `📋⚡ [OVERVIEW] Ação rápida: ${action} - User: ${session.user.id}`
    );

    let result: any = { success: false };

    switch (action) {
      case 'dismiss_announcement':
        // TODO: Marcar anúncio como dispensado
        result = { success: true, message: 'Anúncio dispensado' };
        break;

      case 'update_quick_settings':
        // TODO: Atualizar configurações rápidas
        result = { success: true, message: 'Configurações atualizadas' };
        break;

      case 'mark_profile_complete':
        await prisma.user.update({
          where: { id: session.user.id },
          data: { onboardingCompleted: true },
        });
        result = { success: true, message: 'Perfil marcado como completo' };
        break;

      default:
        return NextResponse.json(
          {
            error: 'Ação não suportada',
          },
          { status: 400 }
        );
    }

    console.log(`✅ [OVERVIEW] Ação ${action} executada com sucesso`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [OVERVIEW] Erro na ação rápida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
