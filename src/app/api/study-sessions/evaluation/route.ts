// app/api/study-sessions/evaluation/route.ts - Para salvar avaliações pós-prática
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, evaluation } = body;

    if (!sessionId || !evaluation) {
      return NextResponse.json(
        { error: 'sessionId e evaluation são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a sessão pertence ao usuário
    const existingSession = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar sessão com avaliação
    await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        postPracticeRating: evaluation.rating,
        postPracticeNotes: evaluation.notes,
        nextSessionGoals: evaluation.nextSessionGoals || [],
        technicalFocus: evaluation.technicalFocus || [],
        expressiveFocus: evaluation.expressiveFocus || [],
        precisionFocus: evaluation.precisionFocus || [],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Avaliação salva com sucesso',
    });
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
