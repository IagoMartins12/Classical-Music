// app/api/blog/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== PUT - Editar Comentário ====================
export async function PUT(
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
    const { content } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      );
    }

    const comment = await prisma.blogComment.findUnique({
      where: { id },
      select: { id: true, userId: true, articleId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    // Apenas dono do comentário ou admin pode editar
    const isOwner = comment.userId === session.user.id;
    const isAdmin = session.user.role >= 1;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este comentário' },
        { status: 403 }
      );
    }

    const updatedComment = await prisma.blogComment.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
          },
        },
      },
    });

    revalidateTag(`blog-article-${comment.articleId}`);
    revalidateTag(`blog-comments-${comment.articleId}`);

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: 'Comentário atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao editar comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Deletar Comentário (COM CASCADE) ====================
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
      select: {
        id: true,
        userId: true,
        articleId: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    // Apenas dono do comentário ou admin pode deletar
    const isOwner = comment.userId === session.user.id;
    const isAdmin = session.user.role >= 1;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Você não tem permissão para deletar este comentário' },
        { status: 403 }
      );
    }

    // ✅ DELETAR RECURSIVAMENTE TODOS OS COMENTÁRIOS FILHOS
    await deleteCommentWithReplies(id);

    revalidateTag(`blog-article-${comment.articleId}`);
    revalidateTag(`blog-comments-${comment.articleId}`);

    const replyCount = comment._count.replies;
    const message =
      replyCount > 0
        ? `Comentário e ${replyCount} resposta(s) deletados com sucesso`
        : 'Comentário deletado com sucesso';

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== FUNÇÃO AUXILIAR PARA DELETAR EM CASCATA ====================
async function deleteCommentWithReplies(commentId: string) {
  // Buscar todos os comentários filhos
  const replies = await prisma.blogComment.findMany({
    where: { parentId: commentId },
    select: { id: true },
  });

  // Deletar recursivamente cada resposta
  for (const reply of replies) {
    await deleteCommentWithReplies(reply.id);
  }

  // Deletar likes do comentário
  await prisma.blogCommentLike.deleteMany({
    where: { commentId },
  });

  // Deletar o comentário
  await prisma.blogComment.delete({
    where: { id: commentId },
  });
}
