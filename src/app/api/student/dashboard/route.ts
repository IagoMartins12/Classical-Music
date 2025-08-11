// app/api/student/dashboard/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface StudentStats {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  missedLessons: number;
  totalStudyTime: number; // em minutos
  averageAttendance: number;
  currentStreak: number;
  longestStreak: number;
}

interface UpcomingLesson {
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
}

interface RecentLesson {
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
}

interface StudyProgress {
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
}

interface StudentDashboard {
  stats: StudentStats;
  upcomingLessons: UpcomingLesson[];
  todayLessons: UpcomingLesson[];
  recentLessons: RecentLesson[];
  studyProgress: StudyProgress;
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    console.log(
      `📊 [STUDENT-DASHBOARD] Carregando dashboard do aluno ${session.user.id}`
    );

    // Verificar se aluno existe
    const studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      );
    }

    const studentId = studentProfile.id;
    const now = new Date();

    // Calcular datas importantes
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(startOfToday.getDate() + 1);

    // 1. ESTATÍSTICAS BÁSICAS
    console.log('📈 Calculando estatísticas do aluno...');

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

    const stats: StudentStats = {
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
    console.log('📅 Buscando próximas aulas...');

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

    const upcomingLessonsFormatted: UpcomingLesson[] = upcomingLessonsRaw.map(
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
          lesson.scheduledAt >= startOfToday && lesson.scheduledAt < endOfToday,
        isNext: index === 0,
      })
    );

    // 3. AULAS DE HOJE
    const todayLessons = upcomingLessonsFormatted.filter(
      (lesson) => lesson.isToday
    );

    // 4. AULAS RECENTES CONCLUÍDAS
    console.log('📚 Buscando aulas recentes...');

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

    const recentLessonsFormatted: RecentLesson[] = recentLessonsRaw.map(
      (lesson) => ({
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
      })
    );

    // 5. PROGRESSO DE ESTUDOS (integração com WantToLearn/Learned)
    console.log('🎵 Buscando progresso de estudos...');

    const [currentWorks, learnedWorks, recentAnnotations] = await Promise.all([
      // Obras que quer aprender
      prisma.wantToLearn.findMany({
        where: { userId: session.user.id },
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
        where: { userId: session.user.id },
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
          userId: session.user.id,
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
    ]);

    const studyProgress: StudyProgress = {
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
    console.log('👨‍🏫 Buscando professores...');

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
          specialties: [], // TODO: Adicionar campo especialties ao Teacher se necessário
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

    console.log(
      `✅ [STUDENT-DASHBOARD] Dashboard do aluno carregado com sucesso`
    );

    return NextResponse.json({
      success: true,
      dashboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [STUDENT-DASHBOARD] Erro ao carregar dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
