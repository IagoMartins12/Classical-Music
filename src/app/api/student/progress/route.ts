// app/api/student/progress/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6months'; // 3months, 6months, 1year, all
    const includeWorks = searchParams.get('includeWorks') === 'true';
    const includeCharts = searchParams.get('includeCharts') === 'true';

    console.log(
      `📈 [STUDENT-PROGRESS] Loading progress for user ${session.user.id} - Period: ${period}`
    );

    // Verificar se aluno existe
    const studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!studentProfile) {
      console.log(
        `❌ [STUDENT-PROGRESS] Student profile not found for user ${session.user.id}`
      );
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      );
    }

    const studentId = studentProfile.id;
    const now = new Date();

    // Calcular data de início baseada no período
    let startDate = new Date();
    switch (period) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date('2020-01-01');
        break;
    }

    // 1. ESTATÍSTICAS BÁSICAS
    const [
      totalLessons,
      completedLessons,
      scheduledLessons,
      cancelledLessons,
      noShowLessons,
      totalAssignments,
      completedAssignments,
      overdueAssignments,
      studentData,
    ] = await Promise.all([
      // Aulas no período
      prisma.lesson.count({
        where: {
          studentId,
          scheduledAt: { gte: startDate, lte: now },
        },
      }),
      prisma.lesson.count({
        where: {
          studentId,
          status: 'COMPLETED',
          scheduledAt: { gte: startDate, lte: now },
        },
      }),
      prisma.lesson.count({
        where: {
          studentId,
          status: 'SCHEDULED',
          scheduledAt: { gte: now },
        },
      }),
      prisma.lesson.count({
        where: {
          studentId,
          status: 'CANCELLED',
          scheduledAt: { gte: startDate, lte: now },
        },
      }),
      prisma.lesson.count({
        where: {
          studentId,
          status: 'NO_SHOW',
          scheduledAt: { gte: startDate, lte: now },
        },
      }),

      // Assignments no período
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
      prisma.assignment.count({
        where: {
          studentId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: now },
        },
      }),

      // Dados gerais do aluno
      prisma.student.findUnique({
        where: { id: studentId },
        select: {
          currentStreak: true,
          longestStreak: true,
          totalLessonsAttended: true,
          progressScore: true,
          enrollmentDate: true,
          level: true,
        },
      }),
    ]);

    // Calcular tempo total de estudo
    const completedLessonsDetails = await prisma.lesson.findMany({
      where: {
        studentId,
        status: 'COMPLETED',
        scheduledAt: { gte: startDate, lte: now },
      },
      select: { duration: true },
    });

    const totalStudyTime = completedLessonsDetails.reduce(
      (total, lesson) => total + lesson.duration,
      0
    );

    const averageSessionTime =
      completedLessons > 0 ? totalStudyTime / completedLessons : 0;

    // Taxa de comparecimento
    const attendanceRate =
      totalLessons > 0
        ? ((totalLessons - noShowLessons) / totalLessons) * 100
        : 100;

    // Taxa de conclusão de assignments
    const assignmentCompletionRate =
      totalAssignments > 0
        ? (completedAssignments / totalAssignments) * 100
        : 0;

    const stats = {
      lessons: {
        total: totalLessons,
        completed: completedLessons,
        scheduled: scheduledLessons,
        cancelled: cancelledLessons,
        noShow: noShowLessons,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
      },
      assignments: {
        total: totalAssignments,
        completed: completedAssignments,
        overdue: overdueAssignments,
        pending: totalAssignments - completedAssignments,
        completionRate: Math.round(assignmentCompletionRate * 10) / 10,
      },
      studyTime: {
        totalMinutes: totalStudyTime,
        totalHours: Math.round((totalStudyTime / 60) * 10) / 10,
        averageSessionMinutes: Math.round(averageSessionTime),
        averageSessionHours: Math.round((averageSessionTime / 60) * 10) / 10,
      },
      streaks: {
        current: studentData?.currentStreak || 0,
        longest: studentData?.longestStreak || 0,
      },
      general: {
        progressScore: studentData?.progressScore || 0,
        level: studentData?.level || 'BEGINNER',
        enrollmentDate: studentData?.enrollmentDate,
        daysSinceEnrollment: studentData?.enrollmentDate
          ? Math.floor(
              (now.getTime() - studentData.enrollmentDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
      },
    };

    const response: any = {
      success: true,
      stats,
      period: {
        start: startDate,
        end: now,
        label: period,
      },
    };

    // 2. DADOS DE OBRAS SE SOLICITADO
    if (includeWorks) {
      console.log('📚 Loading works progress...');

      const [currentWorks, learnedWorks, recentAnnotations] = await Promise.all(
        [
          // Obras que quer aprender
          prisma.wantToLearn.findMany({
            where: { userId: session.user.id },
            include: {
              work: {
                include: {
                  composer: { select: { name: true } },
                },
              },
              selectedWorkScore: {
                select: { title: true, type: true },
              },
            },
            orderBy: { addedAt: 'desc' },
            take: 20,
          }),

          // Obras já aprendidas
          prisma.learned.findMany({
            where: { userId: session.user.id },
            include: {
              work: {
                include: {
                  composer: { select: { name: true } },
                },
              },
            },
            orderBy: { learnedAt: 'desc' },
            take: 20,
          }),

          // Anotações recentes
          prisma.workAnnotation.findMany({
            where: {
              userId: session.user.id,
              createdAt: { gte: startDate },
            },
            include: {
              work: {
                select: { title: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }),
        ]
      );

      response.works = {
        wanting: currentWorks.map((item) => ({
          workId: item.work.id,
          title: item.work.title,
          composer: item.work.composer.name,
          addedAt: item.addedAt,
          difficulty: item.difficulty,
          priority: item.priority,
          selectedScore: item.selectedWorkScore
            ? {
                title: item.selectedWorkScore.title,
                type: item.selectedWorkScore.type,
              }
            : undefined,
        })),
        learned: learnedWorks.map((item) => ({
          workId: item.work.id,
          title: item.work.title,
          composer: item.work.composer.name,
          learnedAt: item.learnedAt,
          mastery: item.mastery,
          wouldRecommend: item.wouldRecommend,
          studyDuration: item.studyDuration,
          difficulty: item.difficulty,
          enjoyment: item.enjoyment,
          performanceCount: item.performanceCount,
        })),
        recentAnnotations: recentAnnotations.map((annotation) => ({
          id: annotation.id,
          workTitle: annotation.work.title,
          title: annotation.title,
          category: annotation.category,
          createdAt: annotation.createdAt,
        })),
        summary: {
          totalWanting: currentWorks.length,
          totalLearned: learnedWorks.length,
          totalAnnotations: recentAnnotations.length,
          worksLearnedThisPeriod: learnedWorks.filter(
            (w) => w.learnedAt >= startDate
          ).length,
        },
      };
    }

    // 3. DADOS PARA GRÁFICOS SE SOLICITADO
    if (includeCharts) {
      console.log('📊 Generating chart data...');

      // Dados mensais de evolução
      const monthlyData: any[] = [];
      const currentMonth = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - i,
          1
        );
        const monthEnd = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - i + 1,
          0
        );

        const [monthLessons, monthAssignments, monthWorksLearned] =
          await Promise.all([
            prisma.lesson.count({
              where: {
                studentId,
                status: 'COMPLETED',
                scheduledAt: { gte: monthStart, lte: monthEnd },
              },
            }),
            prisma.assignment.count({
              where: {
                studentId,
                isCompleted: true,
                completedAt: { gte: monthStart, lte: monthEnd },
              },
            }),
            prisma.learned.count({
              where: {
                userId: session.user.id,
                learnedAt: { gte: monthStart, lte: monthEnd },
              },
            }),
          ]);

        monthlyData.push({
          month: monthStart.toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric',
          }),
          lessons: monthLessons,
          assignments: monthAssignments,
          worksLearned: monthWorksLearned,
        });
      }

      // Distribuição por tipo de assignment
      const assignmentsByType = await prisma.assignment.groupBy({
        by: ['type'],
        where: {
          studentId,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      });

      // Professores mais ativos
      const lessonsByTeacher = await prisma.lesson.groupBy({
        by: ['teacherId'],
        where: {
          studentId,
          scheduledAt: { gte: startDate },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      });

      const teacherNames = await Promise.all(
        lessonsByTeacher.map(async (item) => {
          const teacher = await prisma.teacher.findUnique({
            where: { id: item.teacherId },
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          });
          return {
            name: teacher
              ? `${teacher.user.firstName} ${teacher.user.lastName}`.trim()
              : 'Professor',
            lessons: item._count.id,
          };
        })
      );

      response.charts = {
        monthly: monthlyData,
        assignmentsByType: assignmentsByType.map((item) => ({
          type: item.type,
          count: item._count.id,
        })),
        lessonsByTeacher: teacherNames,
        progressTrend: monthlyData.map((month) => ({
          month: month.month,
          score:
            ((month.lessons * 2 + month.assignments + month.worksLearned * 3) /
              6) *
            100, // Score arbitrário
        })),
      };
    }

    console.log(`✅ [STUDENT-PROGRESS] Progress data loaded successfully`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [STUDENT-PROGRESS] Error loading progress:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
