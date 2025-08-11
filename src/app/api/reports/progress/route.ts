// app/api/reports/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ProgressReport {
  studentInfo: {
    id: string;
    name: string;
    image?: string;
    level: string;
    mainInstrument?: string;
    enrollmentDate: Date;
    totalStudyTime: number; // em minutos
  };

  teacherInfo?: {
    id: string;
    name: string;
    image?: string;
    relationshipStart: Date;
  };

  period: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };

  lessonStats: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
    noShow: number;
    attendanceRate: number;
    averageDuration: number;
    totalStudyHours: number;
  };

  progressMetrics: {
    currentStreak: number;
    longestStreak: number;
    improvementAreas: string[];
    challengeAreas: string[];
    skillsWorked: string[];
    techniquesLearned: string[];
    averageEngagement?: number;
    averagePreparation?: number;
  };

  assignmentStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
    averageCompletionTime?: number; // em dias
  };

  repertoireProgress: {
    worksStudied: Array<{
      workId: string;
      title: string;
      composer: string;
      difficulty?: string | null;
      status: 'studying' | 'learned' | 'reviewing';
      startedAt: Date;
      masteryLevel?: number;
    }>;

    totalWorks: number;
    learnedWorks: number;
    currentWorks: number;
  };

  monthlyProgress: Array<{
    month: string;
    year: number;
    lessonsCompleted: number;
    studyHours: number;
    assignmentsCompleted: number;
    newWorksStarted: number;
    averageRating?: number;
  }>;

  recentFeedback: Array<{
    lessonId: string;
    lessonTitle: string;
    date: Date;
    teacherFeedback?: string | null;
    improvements: string[];
    challenges: string[];
    nextGoals?: string | null;
  }>;

  goals: {
    shortTerm: string[];
    longTerm: string[];
    targetWorks: string[];
    skillsToImprove: string[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentUserId = searchParams.get('studentUserId'); // Para professor especificar aluno
    const teacherUserId = searchParams.get('teacherUserId'); // Para aluno especificar professor
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeGoals = searchParams.get('includeGoals') === 'true';

    console.log(
      `📊 [PROGRESS-REPORT] Gerando relatório - User: ${session.user.id}, Role: ${session.user.role}`
    );

    // Definir período padrão (últimos 3 meses)
    const periodEnd = endDate ? new Date(endDate) : new Date();
    const periodStart = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Buscar perfis do usuário
    let userTeacherProfile = null;
    let userStudentProfile = null;
    let targetStudentProfile = null;
    let targetTeacherProfile = null;

    if (session.user.role === 1) {
      userTeacherProfile = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!userTeacherProfile) {
        return NextResponse.json(
          { error: 'Perfil de professor não encontrado' },
          { status: 404 }
        );
      }

      // Professor especificando aluno
      if (studentUserId) {
        targetStudentProfile = await prisma.student.findUnique({
          where: { userId: studentUserId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
            teachers: {
              where: {
                teacherId: userTeacherProfile.id,
                isActive: true,
              },
              select: {
                startDate: true,
              },
            },
          },
        });

        if (
          !targetStudentProfile ||
          targetStudentProfile.teachers.length === 0
        ) {
          return NextResponse.json(
            {
              error: 'Aluno não encontrado ou não está vinculado a você',
            },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error: 'Professor deve especificar studentUserId',
          },
          { status: 400 }
        );
      }
    } else {
      userStudentProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
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
      });

      if (!userStudentProfile) {
        return NextResponse.json(
          { error: 'Perfil de aluno não encontrado' },
          { status: 404 }
        );
      }

      targetStudentProfile = userStudentProfile;

      // Aluno especificando professor (opcional)
      if (teacherUserId) {
        targetTeacherProfile = await prisma.teacher.findUnique({
          where: { userId: teacherUserId },
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
        });
      }
    }

    const studentId = targetStudentProfile!.id;

    // Montar where clause para aulas
    const lessonWhereClause: any = {
      studentId,
      scheduledAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    };

    // Se especificou professor, filtrar
    if (targetTeacherProfile) {
      lessonWhereClause.teacherId = targetTeacherProfile.id;
    } else if (userTeacherProfile) {
      lessonWhereClause.teacherId = userTeacherProfile.id;
    }

    // 1. BUSCAR ESTATÍSTICAS DE AULAS
    console.log('📈 Calculando estatísticas de aulas...');

    const [
      lessons,
      totalLessons,
      completedLessons,
      scheduledLessons,
      cancelledLessons,
      noShowLessons,
    ] = await Promise.all([
      prisma.lesson.findMany({
        where: lessonWhereClause,
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
      }),
      prisma.lesson.count({ where: lessonWhereClause }),
      prisma.lesson.count({
        where: { ...lessonWhereClause, status: 'COMPLETED' },
      }),
      prisma.lesson.count({
        where: { ...lessonWhereClause, status: 'SCHEDULED' },
      }),
      prisma.lesson.count({
        where: { ...lessonWhereClause, status: 'CANCELLED' },
      }),
      prisma.lesson.count({
        where: { ...lessonWhereClause, status: 'NO_SHOW' },
      }),
    ]);

    const attendanceRate =
      totalLessons > 0
        ? ((totalLessons - noShowLessons) / totalLessons) * 100
        : 100;
    const averageDuration =
      lessons.length > 0
        ? lessons.reduce((sum, l) => sum + l.duration, 0) / lessons.length
        : 0;
    const totalStudyHours =
      lessons
        .filter((l) => l.status === 'COMPLETED')
        .reduce((sum, l) => sum + l.duration, 0) / 60;

    // 2. MÉTRICAS DE PROGRESSO
    console.log('🎯 Calculando métricas de progresso...');

    const skillsWorked = [...new Set(lessons.flatMap((l) => l.skillsWorked))];
    const techniquesLearned = [
      ...new Set(lessons.flatMap((l) => l.techniques)),
    ];
    const improvementAreas = [
      ...new Set(lessons.flatMap((l) => l.improvements)),
    ];
    const challengeAreas = [...new Set(lessons.flatMap((l) => l.challenges))];

    const engagementRatings = lessons
      .filter((l) => l.engagement !== null)
      .map((l) => l.engagement!);
    const preparationRatings = lessons
      .filter((l) => l.preparation !== null)
      .map((l) => l.preparation!);

    const averageEngagement =
      engagementRatings.length > 0
        ? engagementRatings.reduce((sum, r) => sum + r, 0) /
          engagementRatings.length
        : undefined;
    const averagePreparation =
      preparationRatings.length > 0
        ? preparationRatings.reduce((sum, r) => sum + r, 0) /
          preparationRatings.length
        : undefined;

    // 3. ESTATÍSTICAS DE ASSIGNMENTS
    console.log('📋 Calculando estatísticas de assignments...');

    const assignmentWhereClause: any = {
      studentId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    };

    const [
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      overdueAssignments,
    ] = await Promise.all([
      prisma.assignment.count({ where: assignmentWhereClause }),
      prisma.assignment.count({
        where: { ...assignmentWhereClause, isCompleted: true },
      }),
      prisma.assignment.count({
        where: { ...assignmentWhereClause, status: 'PENDING' },
      }),
      prisma.assignment.count({
        where: {
          ...assignmentWhereClause,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    const assignmentCompletionRate =
      totalAssignments > 0
        ? (completedAssignments / totalAssignments) * 100
        : 0;

    // 4. PROGRESSO DO REPERTÓRIO
    console.log('🎵 Analisando progresso do repertório...');

    const [wantToLearnWorks, learnedWorks] = await Promise.all([
      prisma.wantToLearn.findMany({
        where: { userId: targetStudentProfile.user.id },
        include: {
          work: {
            include: {
              composer: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      }),
      prisma.learned.findMany({
        where: {
          userId: targetStudentProfile.user.id,
          learnedAt: {
            gte: periodStart,
            lte: periodEnd,
          },
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
        orderBy: { learnedAt: 'desc' },
      }),
    ]);

    const worksStudied = [
      ...wantToLearnWorks.map((w) => ({
        workId: w.work.id,
        title: w.work.title,
        composer: w.work.composer.name,
        difficulty: w.difficulty,
        status: 'studying' as const,
        startedAt: w.addedAt,
        masteryLevel: undefined,
      })),
      ...learnedWorks.map((w) => ({
        workId: w.work.id,
        title: w.work.title,
        composer: w.work.composer.name,
        difficulty: w.difficulty,
        status: 'learned' as const,
        startedAt: w.studyStartDate || w.learnedAt,
        masteryLevel: w.mastery,
      })),
    ];

    // 5. PROGRESSO MENSAL
    console.log('📅 Calculando progresso mensal...');

    const monthlyData: any[] = [];
    const currentDate = new Date(periodStart);

    while (currentDate <= periodEnd) {
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const [monthLessons, monthAssignments, monthWorks] = await Promise.all([
        prisma.lesson.count({
          where: {
            ...lessonWhereClause,
            status: 'COMPLETED',
            scheduledAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prisma.assignment.count({
          where: {
            studentId,
            isCompleted: true,
            completedAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prisma.wantToLearn.count({
          where: {
            userId: targetStudentProfile.user.id,
            addedAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ]);

      const monthLessonsDetails = await prisma.lesson.findMany({
        where: {
          ...lessonWhereClause,
          status: 'COMPLETED',
          scheduledAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { duration: true },
      });

      const studyHours =
        monthLessonsDetails.reduce((sum, l) => sum + l.duration, 0) / 60;

      monthlyData.push({
        month: monthStart.toLocaleString('pt-BR', { month: 'long' }),
        year: monthStart.getFullYear(),
        lessonsCompleted: monthLessons,
        studyHours: Math.round(studyHours * 10) / 10,
        assignmentsCompleted: monthAssignments,
        newWorksStarted: monthWorks,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // 6. FEEDBACK RECENTE
    console.log('💬 Coletando feedback recente...');

    const recentLessonsWithFeedback = lessons
      .filter(
        (l) =>
          l.status === 'COMPLETED' &&
          (l.lessonSummary ||
            l.improvements.length > 0 ||
            l.challenges.length > 0)
      )
      .slice(0, 5)
      .map((l) => ({
        lessonId: l.id,
        lessonTitle: l.title,
        date: l.scheduledAt,
        teacherFeedback: l.lessonSummary,
        improvements: l.improvements,
        challenges: l.challenges,
        nextGoals: l.nextLessonPrep,
      }));

    // 7. METAS (se solicitado)
    let goals: any = undefined;
    if (includeGoals) {
      // TODO: Implementar sistema de metas se necessário
      goals = {
        shortTerm: [],
        longTerm: [],
        targetWorks: wantToLearnWorks.slice(0, 5).map((w) => w.work.title),
        skillsToImprove: challengeAreas.slice(0, 3),
      };
    }

    // 8. MONTAR RELATÓRIO FINAL
    const report: ProgressReport = {
      studentInfo: {
        id: targetStudentProfile.user.id,
        name: `${targetStudentProfile.user.firstName} ${targetStudentProfile.user.lastName}`.trim(),
        image: targetStudentProfile.user.image || undefined,
        level: targetStudentProfile.level,
        mainInstrument: targetStudentProfile.mainInstrument || undefined,
        enrollmentDate: targetStudentProfile.enrollmentDate,
        totalStudyTime: Math.round(totalStudyHours * 60),
      },

      teacherInfo: targetTeacherProfile
        ? {
            id: targetTeacherProfile.user.id,
            name: `${targetTeacherProfile.user.firstName} ${targetTeacherProfile.user.lastName}`.trim(),
            image: targetTeacherProfile.user.image || undefined,
            relationshipStart: targetStudentProfile.enrollmentDate,
          }
        : undefined,

      period: {
        startDate: periodStart,
        endDate: periodEnd,
        totalDays: Math.ceil(
          (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },

      lessonStats: {
        total: totalLessons,
        completed: completedLessons,
        scheduled: scheduledLessons,
        cancelled: cancelledLessons,
        noShow: noShowLessons,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        averageDuration: Math.round(averageDuration),
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      },

      progressMetrics: {
        currentStreak: targetStudentProfile.currentStreak,
        longestStreak: targetStudentProfile.longestStreak,
        improvementAreas,
        challengeAreas,
        skillsWorked,
        techniquesLearned,
        averageEngagement: averageEngagement
          ? Math.round(averageEngagement * 10) / 10
          : undefined,
        averagePreparation: averagePreparation
          ? Math.round(averagePreparation * 10) / 10
          : undefined,
      },

      assignmentStats: {
        total: totalAssignments,
        completed: completedAssignments,
        pending: pendingAssignments,
        overdue: overdueAssignments,
        completionRate: Math.round(assignmentCompletionRate * 10) / 10,
      },

      repertoireProgress: {
        worksStudied,
        totalWorks: worksStudied.length,
        learnedWorks: learnedWorks.length,
        currentWorks: wantToLearnWorks.length,
      },

      monthlyProgress: monthlyData,
      recentFeedback: recentLessonsWithFeedback,
      goals,
    };

    console.log(`✅ [PROGRESS-REPORT] Relatório gerado com sucesso`);

    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [PROGRESS-REPORT] Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
