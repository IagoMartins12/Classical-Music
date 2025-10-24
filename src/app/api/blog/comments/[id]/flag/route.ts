// app/api/blog/comments/[id]/flag/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== POST - Reportar Comentário ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: 'Motivo é obrigatório' },
        { status: 400 }
      );
    }

    const comment = await prisma.blogComment.findUnique({
      where: { id },
      select: { id: true, articleId: true, isFlagged: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    // Marcar como reportado
    const updatedComment = await prisma.blogComment.update({
      where: { id },
      data: {
        isFlagged: true,
        flagReason: reason.trim(),
        flaggedBy: session.user.id,
        status: 'FLAGGED', // Muda status para FLAGGED (aguardando moderação)
      },
    });

    revalidateTag(`blog-article-${comment.articleId}`);
    revalidateTag(`blog-comments-${comment.articleId}`);
    revalidateTag('blog-moderation');

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: 'Comentário reportado. Será analisado por um moderador.',
    });
  } catch (error) {
    console.error('Erro ao reportar comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
