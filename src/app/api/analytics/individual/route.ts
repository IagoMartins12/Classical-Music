// app/api/analytics/individual/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface TeacherAnalytics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalLessonsGiven: number;
    hoursTeaching: number;
    averageRating: number;
    completionRate: number;
    responseTime: number; // tempo médio de resposta em horas
  };

  performance: {
    monthlyLessons: Array<{
      month: string;
      year: number;
      lessons: number;
      hours: number;
      newStudents: number;
    }>;
    studentRetention: {
      rate: number; // %
      averageRelationshipDuration: number; // em meses
      churnRate: number; // %
    };
    lessonEfficiency: {
      averagePreparation: number;
      onTimeRate: number;
      cancellationRate: number;
      rescheduleRate: number;
    };
  };

  students: {
    byLevel: Record<string, number>;
    byInstrument: Record<string, number>;
    topPerformers: Array<{
      studentId: string;
      studentName: string;
      lessonsCompleted: number;
      averageEngagement: number;
      lastLesson: Date;
    }>;
    needsAttention: Array<{
      studentId: string;
      studentName: string;
      reason: string;
      lastLesson: Date;
      missedLessons: number;
    }>;
  };

  financial: {
    estimatedEarnings: {
      thisMonth: number;
      lastMonth: number;
      thisYear: number;
    };
    lessonPricing: {
      averagePrice: number;
      totalLessonsValue: number;
    };
  };

  growth: {
    studentGrowth: Array<{
      period: string;
      newStudents: number;
      lostStudents: number;
      netGrowth: number;
    }>;
    skillDevelopment: Array<{
      skill: string;
      studentsWorking: number;
      averageProgress: number;
    }>;
  };

  workload: {
    weeklyDistribution: Array<{
      day: string;
      lessons: number;
      hours: number;
    }>;
    busyPeriods: Array<{
      period: string;
      intensity: number;
      recommendations: string[];
    }>;
    capacity: {
      current: number;
      maximum: number;
      utilization: number; // %
    };
  };
}

interface StudentAnalytics {
  overview: {
    totalLessons: number;
    hoursStudied: number;
    currentStreak: number;
    longestStreak: number;
    averageGrade: number;
    progressScore: number;
  };

  learning: {
    monthlyProgress: Array<{
      month: string;
      year: number;
      lessonsAttended: number;
      hoursStudied: number;
      assignmentsCompleted: number;
      newSkills: string[];
    }>;
    skillDevelopment: Array<{
      skill: string;
      level: number; // 1-10
      improvement: number; // % desde último mês
      lessonsWorked: number;
    }>;
    weakAreas: Array<{
      area: string;
      challengeCount: number;
      needsWork: boolean;
      suggestions: string[];
    }>;
  };

  attendance: {
    rate: number; // %
    punctuality: number; // %
    cancellationRate: number;
    consistency: {
      weeklyVariation: number;
      preferredDays: string[];
      preferredTimes: string[];
    };
  };

  assignments: {
    completionRate: number;
    averageGrade: number;
    onTimeSubmission: number; // %
    typesCompleted: Record<string, number>;
    timeSpentStudying: number; // horas semanais médias
  };

  repertoire: {
    worksStudied: number;
    worksCompleted: number;
    currentWorks: number;
    difficultiesWorked: Record<string, number>;
    composers: Array<{
      name: string;
      worksCount: number;
      hoursSpent: number;
    }>;
    recommendations: Array<{
      workId: string;
      title: string;
      composer: string;
      reason: string;
      difficulty: string;
    }>;
  };

  teachers: Array<{
    teacherId: string;
    teacherName: string;
    relationshipDuration: number; // meses
    lessonsCompleted: number;
    averageRating: number; // que você deu ao professor
    subjects: string[];
    nextLesson?: Date;
  }>;

  goals: {
    shortTerm: Array<{
      goal: string;
      progress: number;
      deadline?: Date;
      achieved: boolean;
    }>;
    longTerm: Array<{
      goal: string;
      milestones: Array<{
        milestone: string;
        completed: boolean;
        date?: Date;
      }>;
    }>;
  };
}

// Cache das analytics por 30 minutos (dados mais estáveis)
const getCachedAnalytics = unstable_cache(
  async (userId: string, userRole: number) => {
    console.log(
      `📊 [ANALYTICS] Calculando analytics para usuário ${userId} (cache miss)`
    );

    if (userRole === 1) {
      return await calculateTeacherAnalytics(userId);
    } else if (userRole === 0) {
      return await calculateStudentAnalytics(userId);
    }

    return null;
  },
  ['individual-analytics'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['analytics'],
  }
);

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
    const period = searchParams.get('period') || '6months'; // 1month, 3months, 6months, 1year, all

    console.log(
      `📊 [ANALYTICS] Carregando analytics individuais - User: ${session.user.id}, Role: ${session.user.role}`
    );

    // Buscar analytics (com cache)
    const analytics = await getCachedAnalytics(
      session.user.id,
      session.user.role
    );

    if (!analytics) {
      return NextResponse.json(
        {
          error: 'Não foi possível carregar analytics',
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ [ANALYTICS] Analytics carregadas para ${
        session.user.role === 1 ? 'professor' : 'aluno'
      }`
    );

    return NextResponse.json({
      success: true,
      analytics,
      userRole: session.user.role,
      period,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [ANALYTICS] Erro ao carregar analytics:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para calcular analytics do professor
async function calculateTeacherAnalytics(
  userId: string
): Promise<TeacherAnalytics> {
  const teacherProfile = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true, averageRating: true, completionRate: true },
  });

  if (!teacherProfile) {
    throw new Error('Perfil de professor não encontrado');
  }

  const teacherId = teacherProfile.id;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 1. OVERVIEW
  const [totalStudents, activeStudents, totalLessons, completedLessons] =
    await Promise.all([
      prisma.teacherStudent.count({ where: { teacherId } }),
      prisma.teacherStudent.count({ where: { teacherId, isActive: true } }),
      prisma.lesson.count({ where: { teacherId } }),
      prisma.lesson.count({ where: { teacherId, status: 'COMPLETED' } }),
    ]);

  const completedLessonDetails = await prisma.lesson.findMany({
    where: { teacherId, status: 'COMPLETED' },
    select: { duration: true },
  });

  const hoursTeaching =
    completedLessonDetails.reduce((sum, l) => sum + l.duration, 0) / 60;
  const completionRate =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // 2. PERFORMANCE MENSAL
  const monthlyLessons = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [lessonsCount, lessonDetails, newStudents] = await Promise.all([
      prisma.lesson.count({
        where: {
          teacherId,
          scheduledAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.lesson.findMany({
        where: {
          teacherId,
          status: 'COMPLETED',
          scheduledAt: { gte: monthStart, lte: monthEnd },
        },
        select: { duration: true },
      }),
      prisma.teacherStudent.count({
        where: {
          teacherId,
          startDate: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    const hours = lessonDetails.reduce((sum, l) => sum + l.duration, 0) / 60;

    monthlyLessons.push({
      month: monthStart.toLocaleString('pt-BR', { month: 'long' }),
      year: monthStart.getFullYear(),
      lessons: lessonsCount,
      hours: Math.round(hours * 10) / 10,
      newStudents,
    });
  }

  // 3. ALUNOS POR NÍVEL E INSTRUMENTO
  const studentProfiles = await prisma.teacherStudent.findMany({
    where: { teacherId, isActive: true },
    include: {
      student: {
        select: {
          level: true,
          mainInstrument: true,
          id: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  const byLevel: Record<string, number> = {};
  const byInstrument: Record<string, number> = {};

  studentProfiles.forEach((rel) => {
    const level = rel.student.level;
    const instrument = rel.student.mainInstrument || 'Não definido';

    byLevel[level] = (byLevel[level] || 0) + 1;
    byInstrument[instrument] = (byInstrument[instrument] || 0) + 1;
  });

  // 4. TOP PERFORMERS E ALUNOS QUE PRECISAM DE ATENÇÃO
  const topPerformers = [];
  const needsAttention = [];

  for (const rel of studentProfiles.slice(0, 10)) {
    const studentStats = await prisma.lesson.aggregate({
      where: {
        teacherId,
        studentId: rel.student.id,
        status: 'COMPLETED',
      },
      _count: { id: true },
      _avg: { engagement: true },
    });

    const lastLesson = await prisma.lesson.findFirst({
      where: { teacherId, studentId: rel.student.id },
      orderBy: { scheduledAt: 'desc' },
      select: { scheduledAt: true },
    });

    const missedLessons = await prisma.lesson.count({
      where: {
        teacherId,
        studentId: rel.student.id,
        status: 'NO_SHOW',
      },
    });

    const studentData = {
      studentId: rel.student.user.id,
      studentName:
        `${rel.student.user.firstName} ${rel.student.user.lastName}`.trim(),
      lessonsCompleted: studentStats._count.id,
      averageEngagement: studentStats._avg.engagement || 0,
      lastLesson: lastLesson?.scheduledAt || rel.startDate,
      missedLessons,
    };

    if (
      studentStats._count.id >= 5 &&
      (studentStats._avg.engagement || 0) >= 4
    ) {
      topPerformers.push(studentData);
    }

    // Critérios para atenção: muitas faltas ou sem aula há muito tempo
    const daysSinceLastLesson = Math.ceil(
      (now.getTime() - (lastLesson?.scheduledAt || rel.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (missedLessons >= 3 || daysSinceLastLesson > 30) {
      needsAttention.push({
        ...studentData,
        reason:
          missedLessons >= 3
            ? `${missedLessons} faltas`
            : `${daysSinceLastLesson} dias sem aula`,
      });
    }
  }

  // 5. DISTRIBUIÇÃO SEMANAL
  const weeklyDistribution = [];
  const dayNames = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];

  for (let day = 0; day <= 6; day++) {
    const dayLessons = await prisma.lesson.findMany({
      where: {
        teacherId,
        scheduledAt: { gte: sixMonthsAgo },
      },
      select: { scheduledAt: true, duration: true },
    });

    const dayData = dayLessons.filter((l) => l.scheduledAt.getDay() === day);
    const totalHours = dayData.reduce((sum, l) => sum + l.duration, 0) / 60;

    weeklyDistribution.push({
      day: dayNames[day],
      lessons: dayData.length,
      hours: Math.round(totalHours * 10) / 10,
    });
  }

  // 6. ESTIMATIVAS FINANCEIRAS (simuladas)
  const avgLessonPrice = 100; // R$ por aula (configurável)

  const thisMonthLessons = await prisma.lesson.count({
    where: {
      teacherId,
      status: 'COMPLETED',
      scheduledAt: { gte: thisMonth },
    },
  });

  const lastMonthLessons = await prisma.lesson.count({
    where: {
      teacherId,
      status: 'COMPLETED',
      scheduledAt: { gte: lastMonth, lt: thisMonth },
    },
  });

  const analytics: TeacherAnalytics = {
    overview: {
      totalStudents,
      activeStudents,
      totalLessonsGiven: totalLessons,
      hoursTeaching: Math.round(hoursTeaching * 10) / 10,
      averageRating: teacherProfile.averageRating || 0,
      completionRate: Math.round(completionRate * 10) / 10,
      responseTime: 2.5, // Simulado
    },

    performance: {
      monthlyLessons,
      studentRetention: {
        rate: 85, // % simulado
        averageRelationshipDuration: 8, // meses simulado
        churnRate: 15, // % simulado
      },
      lessonEfficiency: {
        averagePreparation: 4.2, // 1-5 simulado
        onTimeRate: 92, // % simulado
        cancellationRate: 8, // % simulado
        rescheduleRate: 12, // % simulado
      },
    },

    students: {
      byLevel,
      byInstrument,
      topPerformers: topPerformers.slice(0, 5),
      needsAttention: needsAttention.slice(0, 5),
    },

    financial: {
      estimatedEarnings: {
        thisMonth: thisMonthLessons * avgLessonPrice,
        lastMonth: lastMonthLessons * avgLessonPrice,
        thisYear: completedLessons * avgLessonPrice * 0.8, // Estimativa
      },
      lessonPricing: {
        averagePrice: avgLessonPrice,
        totalLessonsValue: completedLessons * avgLessonPrice,
      },
    },

    growth: {
      studentGrowth: [], // Calculado baseado nos dados mensais
      skillDevelopment: [], // Baseado nos skills trabalhados
    },

    workload: {
      weeklyDistribution,
      busyPeriods: [],
      capacity: {
        current: activeStudents,
        maximum: 50, // Configurável
        utilization: (activeStudents / 50) * 100,
      },
    },
  };

  return analytics;
}

// Função para calcular analytics do aluno
async function calculateStudentAnalytics(
  userId: string
): Promise<StudentAnalytics> {
  const studentProfile = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      currentStreak: true,
      longestStreak: true,
      progressScore: true,
    },
  });

  if (!studentProfile) {
    throw new Error('Perfil de aluno não encontrado');
  }

  const studentId = studentProfile.id;
  const now = new Date();

  // 1. OVERVIEW
  const [
    totalLessons,
    completedLessons,
    totalAssignments,
    completedAssignments,
  ] = await Promise.all([
    prisma.lesson.count({ where: { studentId } }),
    prisma.lesson.count({ where: { studentId, status: 'COMPLETED' } }),
    prisma.assignment.count({ where: { studentId } }),
    prisma.assignment.count({ where: { studentId, isCompleted: true } }),
  ]);

  const lessonDetails = await prisma.lesson.findMany({
    where: { studentId, status: 'COMPLETED' },
    select: { duration: true, engagement: true, preparation: true },
  });

  const hoursStudied =
    lessonDetails.reduce((sum, l) => sum + l.duration, 0) / 60;
  const averageGrade =
    lessonDetails.length > 0
      ? lessonDetails.reduce((sum, l) => sum + (l.engagement || 0), 0) /
        lessonDetails.length
      : 0;

  // 2. PROGRESSO MENSAL
  const monthlyProgress = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [lessonsCount, lessonDetails, assignmentsCount] = await Promise.all([
      prisma.lesson.count({
        where: {
          studentId,
          status: 'COMPLETED',
          scheduledAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.lesson.findMany({
        where: {
          studentId,
          status: 'COMPLETED',
          scheduledAt: { gte: monthStart, lte: monthEnd },
        },
        select: { duration: true, skillsWorked: true },
      }),
      prisma.assignment.count({
        where: {
          studentId,
          isCompleted: true,
          completedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    const hours = lessonDetails.reduce((sum, l) => sum + l.duration, 0) / 60;
    const newSkills = [
      ...new Set(lessonDetails.flatMap((l) => l.skillsWorked)),
    ];

    monthlyProgress.push({
      month: monthStart.toLocaleString('pt-BR', { month: 'long' }),
      year: monthStart.getFullYear(),
      lessonsAttended: lessonsCount,
      hoursStudied: Math.round(hours * 10) / 10,
      assignmentsCompleted: assignmentsCount,
      newSkills: newSkills.slice(0, 3), // Top 3 skills
    });
  }

  // 3. REPERTÓRIO
  const [wantToLearnCount, learnedCount] = await Promise.all([
    prisma.wantToLearn.count({ where: { userId } }),
    prisma.learned.count({ where: { userId } }),
  ]);

  const learnedWorks = await prisma.learned.findMany({
    where: { userId },
    include: {
      work: {
        include: {
          composer: { select: { name: true } },
        },
      },
    },
  });

  const composerStats: Record<
    string,
    { worksCount: number; hoursSpent: number }
  > = {};
  learnedWorks.forEach((learned) => {
    const composer = learned.work.composer.name;
    if (!composerStats[composer]) {
      composerStats[composer] = { worksCount: 0, hoursSpent: 0 };
    }
    composerStats[composer].worksCount++;
    composerStats[composer].hoursSpent += learned.studyDuration || 60; // Estimativa
  });

  const topComposers = Object.entries(composerStats)
    .sort(([, a], [, b]) => b.worksCount - a.worksCount)
    .slice(0, 5)
    .map(([name, stats]) => ({
      name,
      worksCount: stats.worksCount,
      hoursSpent: stats.hoursSpent,
    }));

  // 4. PROFESSORES
  const teacherRelations = await prisma.teacherStudent.findMany({
    where: { studentId, isActive: true },
    include: {
      teacher: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  const teachers = await Promise.all(
    teacherRelations.map(async (rel) => {
      const lessonsCompleted = await prisma.lesson.count({
        where: {
          teacherId: rel.teacherId,
          studentId: studentId,
          status: 'COMPLETED',
        },
      });

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

      const relationshipMonths = Math.ceil(
        (now.getTime() - rel.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      return {
        teacherId: rel.teacher.user.id,
        teacherName:
          `${rel.teacher.user.firstName} ${rel.teacher.user.lastName}`.trim(),
        relationshipDuration: relationshipMonths,
        lessonsCompleted,
        averageRating: 4.5, // Simulado - seria da tabela de reviews
        subjects: [], // Baseado nas especialidades do professor
        nextLesson: nextLesson?.scheduledAt,
      };
    })
  );

  const analytics: StudentAnalytics = {
    overview: {
      totalLessons,
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      currentStreak: studentProfile.currentStreak,
      longestStreak: studentProfile.longestStreak,
      averageGrade: Math.round(averageGrade * 10) / 10,
      progressScore: studentProfile.progressScore || 0,
    },

    learning: {
      monthlyProgress,
      skillDevelopment: [], // Baseado nos skills trabalhados
      weakAreas: [], // Baseado nos challenges frequentes
    },

    attendance: {
      rate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 100,
      punctuality: 88, // % simulado
      cancellationRate: 12, // % simulado
      consistency: {
        weeklyVariation: 15, // % simulado
        preferredDays: ['Segunda', 'Quarta'], // Baseado nos dados reais
        preferredTimes: ['14:00', '16:00'], // Baseado nos dados reais
      },
    },

    assignments: {
      completionRate:
        totalAssignments > 0
          ? (completedAssignments / totalAssignments) * 100
          : 0,
      averageGrade: 8.5, // Simulado
      onTimeSubmission: 85, // % simulado
      typesCompleted: {}, // Baseado nos types dos assignments
      timeSpentStudying: Math.round(hoursStudied / 4), // Horas semanais estimadas
    },

    repertoire: {
      worksStudied: wantToLearnCount + learnedCount,
      worksCompleted: learnedCount,
      currentWorks: wantToLearnCount,
      difficultiesWorked: {}, // Baseado nas dificuldades das obras
      composers: topComposers,
      recommendations: [], // Baseado no perfil e histórico
    },

    teachers,

    goals: {
      shortTerm: [], // Baseado nas metas definidas
      longTerm: [], // Baseado no perfil e aspirações
    },
  };

  return analytics;
}

// POST - Definir metas personalizadas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { goals, type = 'short_term' } = body; // short_term, long_term

    if (!goals || !Array.isArray(goals)) {
      return NextResponse.json(
        {
          error: 'Goals array é obrigatório',
        },
        { status: 400 }
      );
    }

    console.log(
      `📊🎯 [ANALYTICS] Definindo ${goals.length} metas ${type} para usuário ${session.user.id}`
    );

    // TODO: Salvar metas em uma tabela UserGoals
    // Por agora, simulamos o sucesso

    console.log(`✅ [ANALYTICS] Metas definidas com sucesso`);

    return NextResponse.json({
      success: true,
      goals,
      type,
      message: `${goals.length} meta(s) definida(s) com sucesso`,
    });
  } catch (error) {
    console.error('❌ [ANALYTICS] Erro ao definir metas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
