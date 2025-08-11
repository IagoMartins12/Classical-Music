// app/api/teacher/dashboard/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  lessonsThisWeek: number;
  lessonsThisMonth: number;
  completedLessons: number;
  cancelledLessons: number;
  avgLessonsPerWeek: number;
  completionRate: number;
}

interface UpcomingLesson {
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
}

interface RecentActivity {
  id: string;
  type:
    | 'lesson_completed'
    | 'lesson_cancelled'
    | 'student_added'
    | 'note_added';
  title: string;
  description: string;
  timestamp: Date;
  relatedUser?: {
    name: string;
    image?: string;
  };
}

interface TeacherDashboard {
  stats: DashboardStats;
  upcomingLessons: UpcomingLesson[];
  todayLessons: UpcomingLesson[];
  recentActivities: RecentActivity[];
  activeStudents: Array<{
    id: string;
    name: string;
    image?: string;
    level: string;
    mainInstrument?: string;
    nextLessonAt?: Date;
    lastLessonAt?: Date;
    totalLessons: number;
  }>;
  weeklySchedule: Array<{
    day: string;
    date: Date;
    lessons: Array<{
      id: string;
      time: string;
      title: string;
      studentName: string;
      duration: number;
      status: string;
    }>;
  }>;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    console.log(
      `📊 [TEACHER-DASHBOARD] Carregando dashboard do professor ${session.user.id}`
    );

    // Verificar se professor existe
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
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

    // 1. ESTATÍSTICAS BÁSICAS
    console.log('📈 Calculando estatísticas...');

    const [
      totalStudents,
      activeStudents,
      lessonsThisWeek,
      lessonsThisMonth,
      completedLessons,
      cancelledLessons,
      allLessons,
    ] = await Promise.all([
      // Total de alunos
      prisma.teacherStudent.count({
        where: { teacherId, isActive: true },
      }),

      // Alunos ativos (com aula nos últimos 30 dias)
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

      // Aulas desta semana
      prisma.lesson.count({
        where: {
          teacherId,
          scheduledAt: { gte: startOfWeek, lt: endOfWeek },
        },
      }),

      // Aulas deste mês
      prisma.lesson.count({
        where: {
          teacherId,
          scheduledAt: { gte: startOfMonth, lt: endOfMonth },
        },
      }),

      // Aulas concluídas
      prisma.lesson.count({
        where: { teacherId, status: 'COMPLETED' },
      }),

      // Aulas canceladas
      prisma.lesson.count({
        where: { teacherId, status: 'CANCELLED' },
      }),

      // Todas as aulas para calcular média
      prisma.lesson.count({
        where: { teacherId },
      }),
    ]);

    const completionRate =
      allLessons > 0 ? (completedLessons / allLessons) * 100 : 0;
    const avgLessonsPerWeek =
      allLessons > 0
        ? allLessons /
          Math.max(
            1,
            Math.ceil(
              (Date.now() - teacherProfile.id.length) /
                (7 * 24 * 60 * 60 * 1000)
            )
          )
        : 0;

    const stats: DashboardStats = {
      totalStudents,
      activeStudents,
      lessonsThisWeek,
      lessonsThisMonth,
      completedLessons,
      cancelledLessons,
      avgLessonsPerWeek: Math.round(avgLessonsPerWeek * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
    };

    // 2. PRÓXIMAS AULAS
    console.log('📅 Buscando próximas aulas...');

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

    const upcomingLessons: UpcomingLesson[] = upcomingLessonsRaw.map(
      (lesson, index) => ({
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
      })
    );

    // 3. AULAS DE HOJE
    const todayLessons = upcomingLessons.filter((lesson) => lesson.isToday);

    // 4. ALUNOS ATIVOS COM DETALHES
    console.log('👥 Buscando alunos ativos...');

    const activeStudentsDetailed = await prisma.teacherStudent.findMany({
      where: { teacherId, isActive: true },
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
            lessons: {
              where: { teacherId },
              orderBy: { scheduledAt: 'desc' },
              take: 1,
              select: {
                scheduledAt: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 20,
    });

    const activeStudentsFormatted = await Promise.all(
      activeStudentsDetailed.map(async (rel) => {
        // Próxima aula do aluno
        const nextLesson = await prisma.lesson.findFirst({
          where: {
            teacherId,
            studentId: rel.student.id,
            status: 'SCHEDULED',
            scheduledAt: { gte: now },
          },
          orderBy: { scheduledAt: 'asc' },
          select: { scheduledAt: true },
        });

        // Total de aulas
        const totalLessons = await prisma.lesson.count({
          where: {
            teacherId,
            studentId: rel.student.id,
          },
        });

        return {
          id: rel.student.user.id,
          name: `${rel.student.user.firstName || ''} ${
            rel.student.user.lastName || ''
          }`.trim(),
          image: rel.student.user.image || undefined,
          level: rel.student.level,
          mainInstrument: rel.student.mainInstrument || undefined,
          nextLessonAt: nextLesson?.scheduledAt,
          lastLessonAt: rel.student.lessons[0]?.scheduledAt,
          totalLessons,
        };
      })
    );

    // 5. AGENDA SEMANAL
    console.log('📆 Montando agenda semanal...');

    const weeklyLessons = await prisma.lesson.findMany({
      where: {
        teacherId,
        scheduledAt: { gte: startOfWeek, lt: endOfWeek },
      },
      include: {
        student: {
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
      orderBy: { scheduledAt: 'asc' },
    });

    // Agrupar por dia da semana
    const weeklySchedule = [];
    const dayNames = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dayLessons = weeklyLessons
        .filter((lesson) => {
          const lessonDate = new Date(lesson.scheduledAt);
          return (
            lessonDate.getDate() === date.getDate() &&
            lessonDate.getMonth() === date.getMonth()
          );
        })
        .map((lesson) => ({
          id: lesson.id,
          time: lesson.scheduledAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          title: lesson.title,
          studentName:
            `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
          duration: lesson.duration,
          status: lesson.status,
        }));

      weeklySchedule.push({
        day: dayNames[i],
        date,
        lessons: dayLessons,
      });
    }

    // 6. ATIVIDADES RECENTES
    console.log('📝 Buscando atividades recentes...');

    const recentLessons = await prisma.lesson.findMany({
      where: {
        teacherId,
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
        },
      },
      include: {
        student: {
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
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    const recentActivities: RecentActivity[] = recentLessons.map((lesson) => {
      let type: RecentActivity['type'] = 'note_added';
      let title = '';
      let description = '';

      if (lesson.status === 'COMPLETED') {
        type = 'lesson_completed';
        title = 'Aula concluída';
        description = `${lesson.title} com ${lesson.student.user.firstName}`;
      } else if (lesson.status === 'CANCELLED') {
        type = 'lesson_cancelled';
        title = 'Aula cancelada';
        description = `${lesson.title} com ${lesson.student.user.firstName}`;
      }

      return {
        id: lesson.id,
        type,
        title,
        description,
        timestamp: lesson.updatedAt,
        relatedUser: {
          name: `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
          image: lesson.student.user.image || undefined,
        },
      };
    });

    // 7. MONTAR DASHBOARD FINAL
    const dashboard: TeacherDashboard = {
      stats,
      upcomingLessons,
      todayLessons,
      recentActivities,
      activeStudents: activeStudentsFormatted,
      weeklySchedule,
    };

    console.log(`✅ [TEACHER-DASHBOARD] Dashboard carregado com sucesso`);

    return NextResponse.json({
      success: true,
      dashboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [TEACHER-DASHBOARD] Erro ao carregar dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
