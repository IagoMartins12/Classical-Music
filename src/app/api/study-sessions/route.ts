// app/api/study-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      durationMin,
      metronomeUsed = false,
      tempoMarking,
      focus = 'TECHNICAL',
      notes,
      sectionsWorked = [],
      practiceGoals = [],
      pauseCount = 0,
      restartCount = 0,
      metronomeSettings,
      selectedScore,
      studyNotes,
      postPracticeRating,
      postPracticeNotes,
      nextSessionGoals = [],
      technicalFocus = [],
      expressiveFocus = [],
      precisionFocus = [],
    } = body;

    // Validações básicas
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
        durationMin,
        metronomeUsed,
        tempoMarking,
        focus,
        notes: studyNotes || notes,
        sectionsWorked,
        challenges: notes, // Manter compatibilidade
        pauseCount,
        restartCount,

        // Novos campos
        metronomeSettings: metronomeSettings
          ? JSON.stringify(metronomeSettings)
          : null,
        selectedScore: selectedScore ? JSON.stringify(selectedScore) : null,
        studyNotes,
        practiceGoals,
        technicalFocus,
        expressiveFocus,
        precisionFocus,
        postPracticeRating,
        postPracticeNotes,
        nextSessionGoals,
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

    // Invalidar caches relevantes
    revalidateTag('user-learning');
    revalidateTag('learning-stats');
    revalidateTag(`user-study-sessions-${session.user.id}`);

    return NextResponse.json({
      success: true,
      studySession: {
        id: studySession.id,
        workId: studySession.workId,
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtros
    const where: any = {
      userId: session.user.id,
    };

    if (workId) {
      where.workId = workId;
    }

    // Buscar sessões de estudo
    const [studySessions, total] = await Promise.all([
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
        orderBy: {
          date: 'desc',
        },
        take: limit,
        skip: offset,
      }),

      prisma.studySession.count({ where }),
    ]);

    // Calcular estatísticas
    const stats = await prisma.studySession.aggregate({
      where: { userId: session.user.id },
      _sum: {
        durationMin: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        durationMin: true,
        rating: true,
      },
    });

    return NextResponse.json({
      success: true,
      studySessions: studySessions.map((session) => ({
        ...session,
        date: session.date.toISOString(),
        metronomeSettings: session.metronomeSettings
          ? JSON.parse(session.metronomeSettings as string)
          : null,
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
      stats: {
        totalSessions: stats._count.id || 0,
        totalMinutes: stats._sum.durationMin || 0,
        averageMinutes: Math.round(stats._avg.durationMin || 0),
        averageRating: stats._avg.rating || 0,
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
    const existingSession = await prisma.studySession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar sessão
    const updatedSession = await prisma.studySession.update({
      where: { id },
      data: {
        ...updateData,
        metronomeSettings: updateData.metronomeSettings
          ? JSON.stringify(updateData.metronomeSettings)
          : undefined,
        selectedScore: updateData.selectedScore
          ? JSON.stringify(updateData.selectedScore)
          : undefined,
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

    // Invalidar caches
    revalidateTag('user-learning');
    revalidateTag(`user-study-sessions-${session.user.id}`);

    return NextResponse.json({
      success: true,
      studySession: {
        ...updatedSession,
        date: updatedSession.date.toISOString(),
        metronomeSettings: updatedSession.metronomeSettings
          ? JSON.parse(updatedSession.metronomeSettings as string)
          : null,
        selectedScore: updatedSession.selectedScore
          ? JSON.parse(updatedSession.selectedScore as string)
          : null,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar sessão de estudo:', error);
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
    const existingSession = await prisma.studySession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Deletar sessão
    await prisma.studySession.delete({
      where: { id },
    });

    // Invalidar caches
    revalidateTag('user-learning');
    revalidateTag(`user-study-sessions-${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Sessão de estudo deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar sessão de estudo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
