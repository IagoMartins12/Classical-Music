// app/api/study-sessions/enhanced/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const scoreId = searchParams.get('scoreId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir filtros
    const where: any = {
      userId: session.user.id,
    };

    if (workId) where.workId = workId;
    if (scoreId) where.scoreId = scoreId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Buscar sessões com dados relacionados
    const [studySessions, total, stats] = await Promise.all([
      prisma.studySession.findMany({
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
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),

      prisma.studySession.count({ where }),

      // Estatísticas gerais
      prisma.studySession.aggregate({
        where: { userId: session.user.id },
        _sum: {
          durationMin: true,
          annotationsCreated: true,
          bookmarksCreated: true,
          pdfZoomChanges: true,
        },
        _count: { id: true },
        _avg: {
          durationMin: true,
          postPracticeRating: true,
        },
      }),
    ]);

    // Calcular estatísticas adicionais
    const totalMinutes = stats._sum.durationMin || 0;
    const totalHours = Math.floor(totalMinutes / 60);
    const avgSessionDuration = Math.round(stats._avg.durationMin || 0);

    // Sessões esta semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sessionsThisWeek = await prisma.studySession.count({
      where: {
        userId: session.user.id,
        date: { gte: oneWeekAgo },
      },
    });

    // Streak atual
    const streak = await calculateCurrentStreak(session.user.id);

    return NextResponse.json({
      success: true,
      studySessions: studySessions.map((sess) => ({
        id: sess.id,
        workId: sess.workId,
        scoreId: sess.scoreId,
        durationMin: sess.durationMin,
        date: sess.date.toISOString(),
        focus: sess.focus,
        rating: sess.postPracticeRating,
        notes: sess.studyNotes,
        practiceGoals: sess.practiceGoals,
        sectionsWorked: sess.sectionsWorked,
        annotationsCreated: sess.annotationsCreated,
        bookmarksCreated: sess.bookmarksCreated,
        pagesViewed: sess.pagesViewed,
        metronomeUsed: sess.metronomeUsed,
        pauseCount: sess.pauseCount,
        restartCount: sess.restartCount,
        work: sess.work,
        metronomeSettings: sess.metronomeSettings
          ? JSON.parse(sess.metronomeSettings as string)
          : null,
        pdfSettings: sess.pdfSettings
          ? JSON.parse(sess.pdfSettings as string)
          : null,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
      },
      stats: {
        totalSessions: stats._count.id,
        totalMinutes,
        totalHours,
        averageMinutes: avgSessionDuration,
        averageRating:
          Math.round((stats._avg.postPracticeRating || 0) * 100) / 100,
        totalAnnotations: stats._sum.annotationsCreated || 0,
        totalBookmarks: stats._sum.bookmarksCreated || 0,
        sessionsThisWeek,
        currentStreak: streak,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar sessões de estudo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      scoreId,
      durationMin,
      metronomeUsed = false,
      metronomeSettings,
      focus = 'TECHNICAL',
      studyNotes,
      practiceGoals = [],
      sectionsWorked = [],
      technicalFocus = [],
      expressiveFocus = [],
      precisionFocus = [],
      pauseCount = 0,
      restartCount = 0,
      pagesViewed = [],
      annotationsCreated = 0,
      bookmarksCreated = 0,
      pdfZoomChanges = 0,
      pdfSettings,
      windowLayout,
      postPracticeRating,
      postPracticeNotes,
      nextSessionGoals = [],
      isCompleted = false,
    } = body;

    // Validações
    if (!workId || typeof durationMin !== 'number' || durationMin < 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, title: true },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Criar sessão de estudo
    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        workId,
        scoreId,
        durationMin,
        metronomeUsed,
        focus: focus as any,
        studyNotes,
        practiceGoals,
        sectionsWorked,
        technicalFocus,
        expressiveFocus,
        precisionFocus,
        pauseCount,
        restartCount,
        pagesViewed,
        annotationsCreated,
        bookmarksCreated,
        pdfZoomChanges,
        postPracticeRating,
        postPracticeNotes,
        nextSessionGoals,

        // JSON fields
        metronomeSettings: metronomeSettings
          ? JSON.stringify(metronomeSettings)
          : null,
        pdfSettings: pdfSettings ? JSON.stringify(pdfSettings) : null,
        windowLayout: windowLayout ? JSON.stringify(windowLayout) : null,
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

    // Atualizar estatísticas do usuário se sessão completa
    if (isCompleted && durationMin > 0) {
      await updateUserStats(session.user.id, durationMin);
    }

    // Invalidar caches
    revalidateTag('user-learning');
    revalidateTag('learning-stats');
    revalidateTag(`user-study-sessions-${session.user.id}`);

    return NextResponse.json({
      success: true,
      studySession: {
        id: studySession.id,
        workId: studySession.workId,
        scoreId: studySession.scoreId,
        durationMin: studySession.durationMin,
        date: studySession.date.toISOString(),
        focus: studySession.focus,
        work: studySession.work,
      },
    });
  } catch (error) {
    console.error('Erro ao criar sessão de estudo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular streak atual
async function calculateCurrentStreak(userId: string): Promise<number> {
  try {
    // Buscar todas as datas com sessões, ordenadas por data
    const sessionDates = await prisma.studySession.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    if (sessionDates.length === 0) return 0;

    // Converter para datas únicas (apenas dia)
    const uniqueDates = [
      ...new Set(sessionDates.map((s) => s.date.toISOString().split('T')[0])),
    ].sort((a, b) => b.localeCompare(a)); // Mais recente primeiro

    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Se não estudou hoje nem ontem, streak = 0
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    // Contar dias consecutivos
    let streak = 0;
    const currentDate = new Date();

    for (const dateString of uniqueDates) {
      const sessionDate = dateString;
      const expectedDate = currentDate.toISOString().split('T')[0];

      if (sessionDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Erro ao calcular streak:', error);
    return 0;
  }
}

// Função auxiliar para atualizar estatísticas do usuário
async function updateUserStats(userId: string, durationMin: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalStudyTime: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!user) return;

    const newTotalTime = (user.totalStudyTime || 0) + durationMin;
    const newStreak = await calculateCurrentStreak(userId);
    const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalStudyTime: newTotalTime,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do usuário:', error);
  }
}
