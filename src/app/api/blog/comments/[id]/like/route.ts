// app/api/blog/comments/[id]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== POST - Curtir Comentário ====================
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

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Verificar se comentário existe
    const comment = await prisma.blogComment.findUnique({
      where: { id },
      select: { id: true, articleId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    // Criar like (upsert para evitar duplicatas)
    const like = await prisma.blogCommentLike.upsert({
      where: {
        commentId_userId: {
          commentId: id,
          userId: session.user.id,
        },
      },
      update: {}, // Se já existe, não faz nada
      create: {
        commentId: id,
        userId: session.user.id,
      },
    });

    // Incrementar contador no comentário
    await prisma.blogComment.update({
      where: { id },
      data: {
        likeCount: { increment: 1 },
      },
    });

    revalidateTag(`blog-article-${comment.articleId}`);
    revalidateTag(`blog-comments-${comment.articleId}`);

    return NextResponse.json({
      success: true,
      like,
      message: 'Curtida registrada',
    });
  } catch (error) {
    console.error('Erro ao curtir comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Descurtir Comentário ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const comment = await prisma.blogComment.findUnique({
      where: { id },
      select: { id: true, articleId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    // Deletar like
    await prisma.blogCommentLike.deleteMany({
      where: {
        commentId: id,
        userId: session.user.id,
      },
    });

    // Decrementar contador no comentário
    await prisma.blogComment.update({
      where: { id },
      data: {
        likeCount: { decrement: 1 },
      },
    });

    revalidateTag(`blog-article-${comment.articleId}`);
    revalidateTag(`blog-comments-${comment.articleId}`);

    return NextResponse.json({
      success: true,
      message: 'Curtida removida',
    });
  } catch (error) {
    console.error('Erro ao remover curtida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
