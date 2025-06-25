// app/api/study-sessions/advanced/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// Tipos para a API
interface AdvancedStudySessionData {
  workId: string;
  workTitle: string;
  composerName: string;
  instrument: string;
  startTime: string;
  endTime?: string;
  durationMin: number;
  focusTimeMin: number;

  // Configurações
  metronomeSettings: any;
  sessionFocus: string;
  difficultyLevel: string;

  // Conteúdo
  studyNotes: string;
  goals: any[];
  sections: any[];
  recordings: any[];
  annotations: any[];

  // Métricas
  pauseCount: number;
  restartCount: number;
  sectionsRepeated: number;
  mistakeCount: number;
  tempoChanges: number;

  // Avaliação pós-prática
  postPracticeRating?: number;
  technicalRating?: number;
  musicalRating?: number;
  memoryRating?: number;
  confidenceRating?: number;
  postPracticeNotes?: string;
  difficultSections?: string[];
  breakthroughs?: string[];
  nextSessionGoals?: string[];
  recommendedExercises?: string[];
  moodBefore?: number;
  moodAfter?: number;
  physicalCondition?: number;
  focusLevel?: number;

  // Score info
  selectedScore?: any;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body: AdvancedStudySessionData = await request.json();

    // Validações
    if (
      !body.workId ||
      !body.workTitle ||
      typeof body.durationMin !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: body.workId },
      select: { id: true, title: true },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Criar sessão de estudo avançada
    const studySession = await prisma.advancedStudySession.create({
      data: {
        userId: session.user.id,
        workId: body.workId,
        workTitle: body.workTitle,
        composerName: body.composerName,
        instrument: body.instrument,

        // Timing
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        durationMin: body.durationMin,
        focusTimeMin: body.focusTimeMin,

        // Settings
        metronomeSettings: JSON.stringify(body.metronomeSettings),
        sessionFocus: body.sessionFocus,
        difficultyLevel: body.difficultyLevel,

        // Content
        studyNotes: body.studyNotes,
        goals: JSON.stringify(body.goals),
        sections: JSON.stringify(body.sections),
        recordings: JSON.stringify(body.recordings),
        annotations: JSON.stringify(body.annotations),

        // Metrics
        pauseCount: body.pauseCount,
        restartCount: body.restartCount,
        sectionsRepeated: body.sectionsRepeated,
        mistakeCount: body.mistakeCount,
        tempoChanges: body.tempoChanges,

        // Post-practice evaluation
        postPracticeRating: body.postPracticeRating,
        technicalRating: body.technicalRating,
        musicalRating: body.musicalRating,
        memoryRating: body.memoryRating,
        confidenceRating: body.confidenceRating,
        postPracticeNotes: body.postPracticeNotes,
        difficultSections: body.difficultSections,
        breakthroughs: body.breakthroughs,
        nextSessionGoals: body.nextSessionGoals,
        recommendedExercises: body.recommendedExercises,
        moodBefore: body.moodBefore,
        moodAfter: body.moodAfter,
        physicalCondition: body.physicalCondition,
        focusLevel: body.focusLevel,

        // Score
        selectedScore: body.selectedScore
          ? JSON.stringify(body.selectedScore)
          : null,
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Atualizar estatísticas do usuário
    await updateUserStudyStats(
      session.user.id,
      body.durationMin,
      body.instrument
    );

    // Invalidar caches
    revalidateTag('user-learning');
    revalidateTag('study-analytics');
    revalidateTag(`user-study-sessions-${session.user.id}`);

    return NextResponse.json({
      success: true,
      studySession: {
        id: studySession.id,
        workId: studySession.workId,
        durationMin: studySession.durationMin,
        focusTimeMin: studySession.focusTimeMin,
        startTime: studySession.startTime.toISOString(),
        work: studySession.work,
      },
    });
  } catch (error) {
    console.error('Erro ao criar sessão de estudo avançada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const instrument = searchParams.get('instrument');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeAnalytics = searchParams.get('analytics') === 'true';

    // Construir filtros
    const where: any = {
      userId: session.user.id,
    };

    if (workId) where.workId = workId;
    if (instrument) where.instrument = instrument;
    if (dateFrom) where.startTime = { gte: new Date(dateFrom) };
    if (dateTo) where.startTime = { ...where.startTime, lte: new Date(dateTo) };

    // Buscar sessões
    const [studySessions, total] = await Promise.all([
      prisma.advancedStudySession.findMany({
        where,
        include: {
          work: {
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.advancedStudySession.count({ where }),
    ]);

    // Preparar resposta
    const response: any = {
      success: true,
      studySessions: studySessions.map((session) => ({
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        metronomeSettings: session.metronomeSettings
          ? JSON.parse(session.metronomeSettings as string)
          : null,
        goals: session.goals ? JSON.parse(session.goals as string) : [],
        sections: session.sections
          ? JSON.parse(session.sections as string)
          : [],
        recordings: session.recordings
          ? JSON.parse(session.recordings as string)
          : [],
        annotations: session.annotations
          ? JSON.parse(session.annotations as string)
          : [],
        selectedScore: session.selectedScore
          ? JSON.parse(session.selectedScore as string)
          : null,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
      },
    };

    // Incluir analytics se solicitado
    if (includeAnalytics) {
      response.analytics = await getStudyAnalytics(session.user.id);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar sessões avançadas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para atualizar estatísticas do usuário
async function updateUserStudyStats(
  userId: string,
  durationMin: number,
  instrument: string
) {
  try {
    // Buscar ou criar registro de estatísticas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.userStudyStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        totalMinutes: { increment: durationMin },
        sessionCount: { increment: 1 },
        instruments: {
          push: instrument,
        },
      },
      create: {
        userId,
        date: today,
        totalMinutes: durationMin,
        sessionCount: 1,
        instruments: [instrument],
      },
    });

    // Atualizar streak
    await updateUserStreak(userId);
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

// Função para calcular streak
async function updateUserStreak(userId: string) {
  try {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const stats = await prisma.userStudyStats.findMany({
      where: {
        userId,
        date: { in: last30Days },
      },
      orderBy: { date: 'desc' },
    });

    // Calcular streak
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);

      const dayStats = stats.find(
        (s) => s.date.getTime() === checkDate.getTime()
      );

      if (dayStats && dayStats.totalMinutes > 0) {
        streak++;
      } else if (i === 0) {
        // Se hoje não tem prática, streak = 0
        break;
      } else {
        // Se algum dia no meio não tem prática, para
        break;
      }
    }

    // Atualizar streak no perfil do usuário
    await prisma.userProfile.upsert({
      where: { userId },
      update: { practiceStreak: streak },
      create: {
        userId,
        practiceStreak: streak,
        totalPracticeMinutes: 0,
        averageSessionDuration: 0,
      },
    });
  } catch (error) {
    console.error('Erro ao calcular streak:', error);
  }
}

// Função para obter analytics
async function getStudyAnalytics(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Stats básicas
    const [todayStats, weekStats, monthStats, totalStats, userProfile] =
      await Promise.all([
        // Hoje
        prisma.userStudyStats.findUnique({
          where: { userId_date: { userId, date: today } },
        }),

        // Última semana
        prisma.userStudyStats.aggregate({
          where: {
            userId,
            date: { gte: weekAgo },
          },
          _sum: { totalMinutes: true, sessionCount: true },
          _avg: { totalMinutes: true },
        }),

        // Último mês
        prisma.userStudyStats.aggregate({
          where: {
            userId,
            date: { gte: monthAgo },
          },
          _sum: { totalMinutes: true, sessionCount: true },
        }),

        // Total
        prisma.advancedStudySession.aggregate({
          where: { userId },
          _sum: { durationMin: true, focusTimeMin: true },
          _count: { id: true },
          _avg: {
            durationMin: true,
            postPracticeRating: true,
            technicalRating: true,
            musicalRating: true,
          },
        }),

        // Perfil do usuário
        prisma.userProfile.findUnique({
          where: { userId },
        }),
      ]);

    // Instrumentos mais praticados
    const instrumentStats = await prisma.advancedStudySession.groupBy({
      by: ['instrument'],
      where: { userId },
      _sum: { durationMin: true },
      _count: { id: true },
      orderBy: { _sum: { durationMin: 'desc' } },
      take: 5,
    });

    // Seções mais trabalhadas (análise do JSON)
    const recentSessions = await prisma.advancedStudySession.findMany({
      where: {
        userId,
        startTime: { gte: monthAgo },
      },
      select: { sections: true },
    });

    const sectionFrequency: Record<string, number> = {};
    recentSessions.forEach((session) => {
      if (session.sections) {
        try {
          const sections = JSON.parse(session.sections as string);
          sections.forEach((section: any) => {
            sectionFrequency[section.name] =
              (sectionFrequency[section.name] || 0) + 1;
          });
        } catch (e) {
          // Ignorar erros de parse
        }
      }
    });

    const mostPracticedSections = Object.entries(sectionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      // Estatísticas básicas
      sessionsToday: todayStats?.sessionCount || 0,
      minutesToday: todayStats?.totalMinutes || 0,
      minutesThisWeek: weekStats._sum.totalMinutes || 0,
      minutesThisMonth: monthStats._sum.totalMinutes || 0,

      // Médias e totais
      totalSessions: totalStats._count.id || 0,
      totalMinutes: totalStats._sum.durationMin || 0,
      totalFocusMinutes: totalStats._sum.focusTimeMin || 0,
      averageSessionDuration: Math.round(totalStats._avg.durationMin || 0),

      // Ratings médios
      averageRating: totalStats._avg.postPracticeRating || 0,
      averageTechnicalRating: totalStats._avg.technicalRating || 0,
      averageMusicalRating: totalStats._avg.musicalRating || 0,

      // Streak
      currentStreak: userProfile?.practiceStreak || 0,

      // Instrumentos
      instrumentStats: instrumentStats.map((stat) => ({
        instrument: stat.instrument,
        minutes: stat._sum.durationMin || 0,
        sessions: stat._count,
      })),

      // Seções mais praticadas
      mostPracticedSections,

      // Consistência (% de dias com prática nos últimos 30 dias)
      practiceConsistency: monthStats._sum.sessionCount
        ? Math.round((monthStats._sum.sessionCount / 30) * 100)
        : 0,
    };
  } catch (error) {
    console.error('Erro ao calcular analytics:', error);
    return null;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da sessão é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a sessão pertence ao usuário
    const existingSession = await prisma.advancedStudySession.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar sessão
    const updatedSession = await prisma.advancedStudySession.update({
      where: { id },
      data: {
        ...updateData,
        metronomeSettings: updateData.metronomeSettings
          ? JSON.stringify(updateData.metronomeSettings)
          : undefined,
        goals: updateData.goals ? JSON.stringify(updateData.goals) : undefined,
        sections: updateData.sections
          ? JSON.stringify(updateData.sections)
          : undefined,
        recordings: updateData.recordings
          ? JSON.stringify(updateData.recordings)
          : undefined,
        annotations: updateData.annotations
          ? JSON.stringify(updateData.annotations)
          : undefined,
        selectedScore: updateData.selectedScore
          ? JSON.stringify(updateData.selectedScore)
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      studySession: updatedSession,
    });
  } catch (error) {
    console.error('Erro ao atualizar sessão avançada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da sessão é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a sessão pertence ao usuário
    const existingSession = await prisma.advancedStudySession.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Deletar sessão
    await prisma.advancedStudySession.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Sessão removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar sessão avançada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
