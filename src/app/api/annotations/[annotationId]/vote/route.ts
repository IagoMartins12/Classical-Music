// app/api/annotations/[annotationId]/vote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function POST(
  request: NextRequest,
  { params }: { params: { annotationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { annotationId } = params;
    const { isHelpful } = await request.json();

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'isHelpful deve ser um boolean' },
        { status: 400 }
      );
    }

    // Verificar se a anotação existe e é pública
    const annotation = await prisma.workAnnotation.findFirst({
      where: {
        id: annotationId,
        isPublic: true,
      },
      select: {
        id: true,
        userId: true,
        workId: true,
        helpfulCount: true,
      },
    });

    if (!annotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada' },
        { status: 404 }
      );
    }

    // Não permitir votar na própria anotação
    if (annotation.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Não é possível votar na própria anotação' },
        { status: 400 }
      );
    }

    // Verificar se já votou
    const existingVote = await prisma.annotationHelpfulVote.findUnique({
      where: {
        userId_annotationId: {
          userId: session.user.id,
          annotationId,
        },
      },
    });

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.isHelpful === isHelpful) {
        // Remover voto (desfazer)
        await prisma.annotationHelpfulVote.delete({
          where: {
            id: existingVote.id,
          },
        });
        voteChange = existingVote.isHelpful ? -1 : 1;
      } else {
        // Alterar voto
        await prisma.annotationHelpfulVote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            isHelpful,
          },
        });
        voteChange = isHelpful ? 2 : -2; // Muda de -1 para +1 ou vice-versa
      }
    } else {
      // Criar novo voto
      await prisma.annotationHelpfulVote.create({
        data: {
          userId: session.user.id,
          annotationId,
          isHelpful,
        },
      });
      voteChange = isHelpful ? 1 : -1;
    }

    // Atualizar contador na anotação
    const updatedAnnotation = await prisma.workAnnotation.update({
      where: { id: annotationId },
      data: {
        helpfulCount: { increment: voteChange },
      },
      select: {
        helpfulCount: true,
      },
    });

    // Se a anotação atingiu um threshold de votos úteis, atualizar estatísticas do usuário
    if (updatedAnnotation.helpfulCount >= 5) {
      await prisma.user.update({
        where: { id: annotation.userId },
        data: {
          helpfulAnnotationsCount: { increment: 1 },
        },
      });
    }

    // Verificar o voto atual do usuário
    const currentVote = await prisma.annotationHelpfulVote.findUnique({
      where: {
        userId_annotationId: {
          userId: session.user.id,
          annotationId,
        },
      },
    });

    // Invalidar caches
    revalidateTag(`work-annotations-${annotation.workId}`);
    revalidateTag('annotations-popular');

    return NextResponse.json({
      success: true,
      helpfulCount: updatedAnnotation.helpfulCount,
      userVote: currentVote ? currentVote.isHelpful : null,
    });
  } catch (error) {
    console.error('Erro ao votar em anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { annotationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { annotationId } = params;

    // Buscar estatísticas de votos
    const [totalVotes, helpfulVotes, userVote] = await Promise.all([
      prisma.annotationHelpfulVote.count({
        where: { annotationId },
      }),
      prisma.annotationHelpfulVote.count({
        where: { annotationId, isHelpful: true },
      }),
      session?.user?.id
        ? prisma.annotationHelpfulVote.findUnique({
            where: {
              userId_annotationId: {
                userId: session.user.id,
                annotationId,
              },
            },
          })
        : null,
    ]);

    return NextResponse.json({
      totalVotes,
      helpfulVotes,
      unhelpfulVotes: totalVotes - helpfulVotes,
      userVote: userVote ? userVote.isHelpful : null,
      helpfulPercentage:
        totalVotes > 0 ? Math.round((helpfulVotes / totalVotes) * 100) : 0,
    });
  } catch (error) {
    console.error('Erro ao buscar votos da anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
