// app/api/annotations/[annotationId]/route.ts - ARQUIVO OBRIGATÓRIO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// 🔧 PATCH - Atualizar anotação
export async function PATCH(
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

    console.log('🔧 PATCH /api/annotations/[annotationId] - ID:', annotationId);
    console.log('🔧 PATCH Body:', body);

    // Verificar se a anotação existe e pertence ao usuário
    const existingAnnotation = await prisma.workAnnotation.findFirst({
      where: {
        id: annotationId,
        userId: session.user.id,
      },
    });

    if (!existingAnnotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada ou sem permissão' },
        { status: 404 }
      );
    }

    // Atualizar apenas campos permitidos
    const allowedFields = [
      'title',
      'content',
      'category',
      'scope',
      'measureStart',
      'measureEnd',
      'movement',
      'section',
      'pageNumber',
      'hand',
      'voice',
      'instrument',
      'difficulty',
      'tags',
      'isPublic',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Trimmar strings antes de salvar
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.content) updateData.content = updateData.content.trim();
    if (updateData.movement) updateData.movement = updateData.movement.trim();
    if (updateData.section) updateData.section = updateData.section.trim();
    if (updateData.instrument)
      updateData.instrument = updateData.instrument.trim();

    console.log('🔧 Update data:', updateData);

    const updatedAnnotation = await prisma.workAnnotation.update({
      where: { id: annotationId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
            userType: true,
            experienceLevel: true,
          },
        },
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
        _count: {
          select: {
            helpfulVotes: true,
          },
        },
      },
    });

    // Buscar voto do usuário atual para esta anotação
    const userVote = await prisma.annotationHelpfulVote.findUnique({
      where: {
        userId_annotationId: {
          userId: session.user.id,
          annotationId: updatedAnnotation.id,
        },
      },
    });

    // Invalidar caches
    revalidateTag(`work-annotations-${updatedAnnotation.workId}`);
    revalidateTag(`user-annotations-${session.user.id}`);
    revalidateTag('user-annotations');

    // Formatar resposta corretamente
    const formattedAnnotation = {
      id: updatedAnnotation.id,
      userId: updatedAnnotation.userId,
      workId: updatedAnnotation.workId,
      title: updatedAnnotation.title,
      content: updatedAnnotation.content,
      category: updatedAnnotation.category,
      scope: updatedAnnotation.scope,
      measureStart: updatedAnnotation.measureStart,
      measureEnd: updatedAnnotation.measureEnd,
      movement: updatedAnnotation.movement,
      section: updatedAnnotation.section,
      pageNumber: updatedAnnotation.pageNumber,
      hand: updatedAnnotation.hand,
      voice: updatedAnnotation.voice,
      instrument: updatedAnnotation.instrument,
      difficulty: updatedAnnotation.difficulty,
      tags: updatedAnnotation.tags,
      isPublic: updatedAnnotation.isPublic,
      isVerified: updatedAnnotation.isVerified,
      helpfulCount: updatedAnnotation.helpfulCount,
      viewCount: updatedAnnotation.viewCount,
      createdAt: updatedAnnotation.createdAt.toISOString(),
      updatedAt: updatedAnnotation.updatedAt.toISOString(),
      user: updatedAnnotation.user,
      work: updatedAnnotation.work,
      _count: updatedAnnotation._count,
      userVote: userVote ? userVote.isHelpful : null,
    };

    console.log('✅ Anotação atualizada com sucesso:', formattedAnnotation.id);

    return NextResponse.json({
      success: true,
      annotation: formattedAnnotation,
    });
  } catch (error) {
    console.error('Erro ao atualizar anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🔧 DELETE - Deletar anotação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ annotationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { annotationId } = await params;

    console.log(
      '🗑️ DELETE /api/annotations/[annotationId] - ID:',
      annotationId
    );

    // Verificar se a anotação existe e pertence ao usuário
    const existingAnnotation = await prisma.workAnnotation.findFirst({
      where: {
        id: annotationId,
        userId: session.user.id,
      },
    });

    if (!existingAnnotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada ou sem permissão' },
        { status: 404 }
      );
    }

    // Deletar anotação (cascade deletará votos e respostas)
    await prisma.workAnnotation.delete({
      where: { id: annotationId },
    });

    // Atualizar contadores
    await Promise.all([
      prisma.work.update({
        where: { id: existingAnnotation.workId },
        data: {
          annotationsCount: { decrement: 1 },
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalAnnotationsCount: { decrement: 1 },
        },
      }),
    ]);

    // Invalidar caches
    revalidateTag(`work-annotations-${existingAnnotation.workId}`);
    revalidateTag(`user-annotations-${session.user.id}`);
    revalidateTag('user-annotations');

    console.log('✅ Anotação deletada com sucesso:', annotationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🔧 GET - Buscar anotação específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ annotationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { annotationId } = await params;

    console.log('🔍 GET /api/annotations/[annotationId] - ID:', annotationId);

    const annotation = await prisma.workAnnotation.findUnique({
      where: { id: annotationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
            userType: true,
            experienceLevel: true,
          },
        },
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
        _count: {
          select: {
            helpfulVotes: true,
          },
        },
      },
    });

    if (!annotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se é pública ou se o usuário é o dono
    if (!annotation.isPublic && annotation.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Anotação não encontrada' },
        { status: 404 }
      );
    }

    // Buscar voto do usuário atual
    let userVote = null;
    if (session?.user?.id) {
      const vote = await prisma.annotationHelpfulVote.findUnique({
        where: {
          userId_annotationId: {
            userId: session.user.id,
            annotationId: annotation.id,
          },
        },
      });
      userVote = vote ? vote.isHelpful : null;
    }

    // Incrementar view count
    await prisma.workAnnotation.update({
      where: { id: annotationId },
      data: { viewCount: { increment: 1 } },
    });

    const formattedAnnotation = {
      id: annotation.id,
      userId: annotation.userId,
      workId: annotation.workId,
      title: annotation.title,
      content: annotation.content,
      category: annotation.category,
      scope: annotation.scope,
      measureStart: annotation.measureStart,
      measureEnd: annotation.measureEnd,
      movement: annotation.movement,
      section: annotation.section,
      pageNumber: annotation.pageNumber,
      hand: annotation.hand,
      voice: annotation.voice,
      instrument: annotation.instrument,
      difficulty: annotation.difficulty,
      tags: annotation.tags,
      isPublic: annotation.isPublic,
      isVerified: annotation.isVerified,
      helpfulCount: annotation.helpfulCount,
      viewCount: annotation.viewCount + 1,
      createdAt: annotation.createdAt.toISOString(),
      updatedAt: annotation.updatedAt.toISOString(),
      user: annotation.user,
      work: annotation.work,
      _count: annotation._count,
      userVote,
    };

    return NextResponse.json({
      success: true,
      annotation: formattedAnnotation,
    });
  } catch (error) {
    console.error('Erro ao buscar anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
