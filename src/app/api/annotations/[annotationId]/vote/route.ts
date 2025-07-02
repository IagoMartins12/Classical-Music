// app/api/annotations/[annotationId]/vote/route.ts - API PARA VOTOS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// 🔧 POST - Votar em anotação (útil/não útil)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ annotationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { annotationId } = await params;
    const body = await request.json();
    const { isHelpful } = body;

    console.log(
      '👍 POST /api/annotations/[annotationId]/vote - ID:',
      annotationId,
      'isHelpful:',
      isHelpful
    );

    // Verificar se a anotação existe
    const annotation = await prisma.workAnnotation.findUnique({
      where: { id: annotationId },
      select: {
        id: true,
        userId: true,
        isPublic: true,
        helpfulCount: true,
      },
    });

    if (!annotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada' },
        { status: 404 }
      );
    }

    // Não permitir voto próprio
    if (annotation.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Não é possível votar na própria anotação' },
        { status: 400 }
      );
    }

    // Não permitir voto em anotação privada (exceto do próprio autor)
    if (!annotation.isPublic) {
      return NextResponse.json(
        { error: 'Não é possível votar em anotação privada' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já votou
    const existingVote = await prisma.annotationHelpfulVote.findUnique({
      where: {
        userId_annotationId: {
          userId: session.user.id,
          annotationId,
        },
      },
    });

    let newUserVote: boolean | null = null;
    let helpfulCountChange = 0;

    if (!existingVote) {
      // Primeiro voto
      await prisma.annotationHelpfulVote.create({
        data: {
          userId: session.user.id,
          annotationId,
          isHelpful,
        },
      });

      newUserVote = isHelpful;
      if (isHelpful) {
        helpfulCountChange = 1;
      }
    } else if (existingVote.isHelpful === isHelpful) {
      // Remover voto (desfazer)
      await prisma.annotationHelpfulVote.delete({
        where: {
          userId_annotationId: {
            userId: session.user.id,
            annotationId,
          },
        },
      });

      newUserVote = null;
      if (existingVote.isHelpful) {
        helpfulCountChange = -1; // Remover voto útil
      }
    } else {
      // Mudar voto
      await prisma.annotationHelpfulVote.update({
        where: {
          userId_annotationId: {
            userId: session.user.id,
            annotationId,
          },
        },
        data: { isHelpful },
      });

      newUserVote = isHelpful;
      if (existingVote.isHelpful && !isHelpful) {
        helpfulCountChange = -1; // Era útil, agora não é
      } else if (!existingVote.isHelpful && isHelpful) {
        helpfulCountChange = 1; // Não era útil, agora é
      }
    }

    // Atualizar contador na anotação
    const updatedAnnotation = await prisma.workAnnotation.update({
      where: { id: annotationId },
      data: {
        helpfulCount: {
          increment: helpfulCountChange,
        },
      },
      select: {
        helpfulCount: true,
      },
    });

    console.log('✅ Voto processado:', {
      annotationId,
      newUserVote,
      newHelpfulCount: updatedAnnotation.helpfulCount,
      change: helpfulCountChange,
    });

    return NextResponse.json({
      success: true,
      userVote: newUserVote,
      helpfulCount: updatedAnnotation.helpfulCount,
    });
  } catch (error) {
    console.error('Erro ao processar voto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
