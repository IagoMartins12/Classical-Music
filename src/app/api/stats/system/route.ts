// app/api/stats/system/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface SystemStats {
  overview: {
    totalTeachers: number;
    activeTeachers: number;
    verifiedTeachers: number;
    publicTeachers: number;
    totalStudents: number;
    activeStudents: number;
    totalRelationships: number;
    activeRelationships: number;
  };

  lessons: {
    totalLessons: number;
    completedLessons: number;
    scheduledLessons: number;
    cancelledLessons: number;
    totalStudyHours: number;
    averageAttendanceRate: number;
    lessonsThisMonth: number;
    lessonsThisWeek: number;
  };

  assignments: {
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    overdueAssignments: number;
    averageCompletionRate: number;
  };

  reviews: {
    totalReviews: number;
    publicReviews: number;
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };

  growth: {
    newTeachersThisMonth: number;
    newStudentsThisMonth: number;
    newRelationshipsThisMonth: number;
    growthRateTeachers: number; // %
    growthRateStudents: number; // %
  };

  engagement: {
    dailyActiveLessons: number;
    weeklyActiveLessons: number;
    monthlyActiveLessons: number;
    averageLessonsPerStudent: number;
    averageStudentsPerTeacher: number;
    topInstruments: Array<{
      instrument: string;
      count: number;
    }>;
    topSpecialties: Array<{
      specialty: string;
      count: number;
    }>;
  };

  regional: {
    topCities: Array<{
      city: string;
      count: number;
    }>;
    topStates: Array<{
      state: string;
      count: number;
    }>;
  };

  performance: {
    averageSessionDuration: number; // minutos
    completionRates: {
      lessons: number;
      assignments: number;
      relationships: number; // % de relacionamentos ativos
    };
    satisfaction: {
      averageTeacherRating: number;
      wouldRecommendRate: number; // % que recomendaria
    };
  };
}

// Cache das estatísticas por 1 hora (dados menos críticos)
const getCachedSystemStats = unstable_cache(
  async (): Promise<SystemStats> => {
    console.log(
      '📊 [SYSTEM-STATS] Calculando estatísticas do sistema (cache miss)'
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // 1. OVERVIEW GERAL
    const [
      totalTeachers,
      activeTeachers,
      verifiedTeachers,
      publicTeachers,
      totalStudents,
      activeStudents,
      totalRelationships,
      activeRelationships,
    ] = await Promise.all([
      prisma.teacher.count(),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { isVerified: true } }),
      prisma.teacher.count({ where: { isPublicProfile: true } }),
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacherStudent.count(),
      prisma.teacherStudent.count({ where: { isActive: true } }),
    ]);

    // 2. ESTATÍSTICAS DE AULAS
    const [
      totalLessons,
      completedLessons,
      scheduledLessons,
      cancelledLessons,
      lessonsThisMonth,
      lessonsThisWeek,
      lessonDurations,
    ] = await Promise.all([
      prisma.lesson.count(),
      prisma.lesson.count({ where: { status: 'COMPLETED' } }),
      prisma.lesson.count({ where: { status: 'SCHEDULED' } }),
      prisma.lesson.count({ where: { status: 'CANCELLED' } }),
      prisma.lesson.count({
        where: {
          scheduledAt: { gte: startOfMonth },
        },
      }),
      prisma.lesson.count({
        where: {
          scheduledAt: { gte: startOfWeek },
        },
      }),
      prisma.lesson.findMany({
        where: { status: 'COMPLETED' },
        select: { duration: true },
      }),
    ]);

    const totalStudyHours =
      lessonDurations.reduce((sum, l) => sum + l.duration, 0) / 60;

    // Calcular taxa de comparecimento (não é NO_SHOW)
    const noShowLessons = await prisma.lesson.count({
      where: { status: 'NO_SHOW' },
    });
    const averageAttendanceRate =
      totalLessons > 0
        ? ((totalLessons - noShowLessons) / totalLessons) * 100
        : 100;

    // 3. ESTATÍSTICAS DE ASSIGNMENTS
    const [
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      overdueAssignments,
    ] = await Promise.all([
      prisma.assignment.count(),
      prisma.assignment.count({ where: { isCompleted: true } }),
      prisma.assignment.count({ where: { status: 'PENDING' } }),
      prisma.assignment.count({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: now },
        },
      }),
    ]);

    const averageCompletionRate =
      totalAssignments > 0
        ? (completedAssignments / totalAssignments) * 100
        : 0;

    // 4. ESTATÍSTICAS DE REVIEWS
    const [totalReviews, publicReviews, reviewsData] = await Promise.all([
      prisma.teacherReview.count(),
      prisma.teacherReview.count({ where: { isPublic: true } }),
      prisma.teacherReview.findMany({
        select: { rating: true, wouldRecommend: true },
      }),
    ]);

    const averageRating =
      reviewsData.length > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    // 5. CRESCIMENTO
    const [
      newTeachersThisMonth,
      newStudentsThisMonth,
      newRelationshipsThisMonth,
      teachersLastMonth,
      studentsLastMonth,
    ] = await Promise.all([
      prisma.teacher.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.student.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.teacherStudent.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.teacher.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        },
      }),
      prisma.student.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        },
      }),
    ]);

    const growthRateTeachers =
      teachersLastMonth > 0
        ? ((newTeachersThisMonth - teachersLastMonth) / teachersLastMonth) * 100
        : 0;
    const growthRateStudents =
      studentsLastMonth > 0
        ? ((newStudentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100
        : 0;

    // 6. ENGAJAMENTO
    const [dailyActiveLessons, weeklyActiveLessons, monthlyActiveLessons] =
      await Promise.all([
        prisma.lesson.count({
          where: {
            scheduledAt: { gte: startOfDay },
          },
        }),
        prisma.lesson.count({
          where: {
            scheduledAt: { gte: startOfWeek },
          },
        }),
        prisma.lesson.count({
          where: {
            scheduledAt: { gte: startOfMonth },
          },
        }),
      ]);

    const averageLessonsPerStudent =
      activeStudents > 0 ? totalLessons / activeStudents : 0;
    const averageStudentsPerTeacher =
      activeTeachers > 0 ? totalRelationships / activeTeachers : 0;

    // Top instrumentos e especialidades
    const teachersWithData = await prisma.teacher.findMany({
      where: { status: 'ACTIVE' },
      select: { instruments: true, specialties: true },
    });

    const instrumentCounts: Record<string, number> = {};
    const specialtyCounts: Record<string, number> = {};

    teachersWithData.forEach((teacher) => {
      teacher.instruments.forEach((instrument) => {
        instrumentCounts[instrument] = (instrumentCounts[instrument] || 0) + 1;
      });
      teacher.specialties.forEach((specialty) => {
        specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
      });
    });

    const topInstruments = Object.entries(instrumentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([instrument, count]) => ({ instrument, count }));

    const topSpecialties = Object.entries(specialtyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([specialty, count]) => ({ specialty, count }));

    // 7. DADOS REGIONAIS
    const usersWithLocation = await prisma.user.findMany({
      where: {
        AND: [
          { city: { not: null } },
          { state: { not: null } },
          { OR: [{ role: 0 }, { role: 1 }] },
        ],
      },
      select: { city: true, state: true },
    });

    const cityCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};

    usersWithLocation.forEach((user) => {
      if (user.city) {
        cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
      }
      if (user.state) {
        stateCounts[user.state] = (stateCounts[user.state] || 0) + 1;
      }
    });

    const topCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    const topStates = Object.entries(stateCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    // 8. PERFORMANCE
    const averageSessionDuration =
      lessonDurations.length > 0
        ? lessonDurations.reduce((sum, l) => sum + l.duration, 0) /
          lessonDurations.length
        : 0;

    const wouldRecommendCount = reviewsData.filter(
      (r) => r.wouldRecommend
    ).length;
    const wouldRecommendRate =
      reviewsData.length > 0
        ? (wouldRecommendCount / reviewsData.length) * 100
        : 0;

    const averageTeacherRating = await prisma.teacher.aggregate({
      _avg: { averageRating: true },
    });

    // Montar estatísticas finais
    const stats: SystemStats = {
      overview: {
        totalTeachers,
        activeTeachers,
        verifiedTeachers,
        publicTeachers,
        totalStudents,
        activeStudents,
        totalRelationships,
        activeRelationships,
      },

      lessons: {
        totalLessons,
        completedLessons,
        scheduledLessons,
        cancelledLessons,
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
        averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
        lessonsThisMonth,
        lessonsThisWeek,
      },

      assignments: {
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        overdueAssignments,
        averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
      },

      reviews: {
        totalReviews,
        publicReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },

      growth: {
        newTeachersThisMonth,
        newStudentsThisMonth,
        newRelationshipsThisMonth,
        growthRateTeachers: Math.round(growthRateTeachers * 10) / 10,
        growthRateStudents: Math.round(growthRateStudents * 10) / 10,
      },

      engagement: {
        dailyActiveLessons,
        weeklyActiveLessons,
        monthlyActiveLessons,
        averageLessonsPerStudent:
          Math.round(averageLessonsPerStudent * 10) / 10,
        averageStudentsPerTeacher:
          Math.round(averageStudentsPerTeacher * 10) / 10,
        topInstruments,
        topSpecialties,
      },

      regional: {
        topCities,
        topStates,
      },

      performance: {
        averageSessionDuration: Math.round(averageSessionDuration),
        completionRates: {
          lessons: Math.round(averageAttendanceRate * 10) / 10,
          assignments: Math.round(averageCompletionRate * 10) / 10,
          relationships:
            Math.round(
              (activeRelationships / Math.max(1, totalRelationships)) * 100 * 10
            ) / 10,
        },
        satisfaction: {
          averageTeacherRating:
            Math.round((averageTeacherRating._avg.averageRating || 0) * 10) /
            10,
          wouldRecommendRate: Math.round(wouldRecommendRate * 10) / 10,
        },
      },
    };

    return stats;
  },
  ['system-stats-v1'],
  {
    revalidate: 3600, // 1 hora
    tags: ['system-stats'],
  }
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas admins podem ver estatísticas completas do sistema
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    console.log(
      `📊 [SYSTEM-STATS] Carregando estatísticas do sistema - Refresh: ${forceRefresh}`
    );

    // Se forceRefresh, invalidar cache
    if (forceRefresh) {
      console.log('🔄 [SYSTEM-STATS] Forçando refresh do cache');
      // TODO: Implementar invalidação de cache se o unstable_cache suportar
    }

    // Buscar estatísticas (com cache)
    const stats = await getCachedSystemStats();

    console.log(`✅ [SYSTEM-STATS] Estatísticas carregadas com sucesso`);

    return NextResponse.json({
      success: true,
      stats,
      generatedAt: new Date().toISOString(),
      cacheInfo: {
        ttl: 3600, // 1 hora
        refreshAvailable: true,
      },
    });
  } catch (error) {
    console.error('❌ [SYSTEM-STATS] Erro ao carregar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
