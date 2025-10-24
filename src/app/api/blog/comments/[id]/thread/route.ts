// app/api/blog/comments/[id]/thread/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// ==================== GET - Buscar Thread Completa ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas admins podem ver threads completas
    if (
      !session?.user ||
      (session.user.role !== 1 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Buscar o comentário inicial
    const comment = await prisma.blogComment.findUnique({
      where: { id },
      select: { id: true, parentId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    // Se é uma resposta, buscar o comentário raiz
    let rootCommentId = id;
    if (comment.parentId) {
      // Buscar todos os ancestrais até encontrar a raiz
      let currentId = comment.parentId;
      let parent = await prisma.blogComment.findUnique({
        where: { id: currentId },
        select: { id: true, parentId: true },
      });

      while (parent && parent.parentId) {
        currentId = parent.parentId;
        parent = await prisma.blogComment.findUnique({
          where: { id: currentId },
          select: { id: true, parentId: true },
        });
      }

      rootCommentId = currentId;
    }

    // Buscar thread completa a partir da raiz (com recursão)
    const thread = await getCommentWithReplies(rootCommentId);

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      thread,
    });
  } catch (error) {
    console.error('Erro ao buscar thread:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função recursiva para buscar comentário com todas as respostas
async function getCommentWithReplies(commentId: string): Promise<any> {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!comment) return null;

  // Buscar respostas diretas
  const replies = await prisma.blogComment.findMany({
    where: { parentId: commentId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Buscar respostas das respostas recursivamente
  const repliesWithChildren = await Promise.all(
    replies.map(async (reply) => {
      const childReplies = await getCommentReplies(reply.id);
      return {
        ...reply,
        replies: childReplies,
      };
    })
  );

  return {
    ...comment,
    replies: repliesWithChildren,
  };
}

// Função auxiliar para buscar respostas recursivamente
async function getCommentReplies(commentId: string): Promise<any[]> {
  const replies = await prisma.blogComment.findMany({
    where: { parentId: commentId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const repliesWithChildren = await Promise.all(
    replies.map(async (reply) => {
      const childReplies = await getCommentReplies(reply.id);
      return {
        ...reply,
        replies: childReplies,
      };
    })
  );

  return repliesWithChildren;
}
