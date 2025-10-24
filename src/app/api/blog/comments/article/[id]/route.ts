// app/api/blog/comments/article/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== FUNÇÃO RECURSIVA PARA BUSCAR RESPOSTAS ====================
async function getCommentReplies(
  commentId: string,
  isAdmin: boolean | undefined,
  userId?: string
): Promise<any[]> {
  const replies = await prisma.blogComment.findMany({
    where: {
      parentId: commentId,
      ...(isAdmin ? {} : { status: 'APPROVED' }),
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
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Se usuário logado, verificar curtidas
  let userLikedIds: string[] = [];
  if (userId) {
    const likes = await prisma.blogCommentLike.findMany({
      where: {
        userId,
        commentId: { in: replies.map((r) => r.id) },
      },
      select: { commentId: true },
    });
    userLikedIds = likes.map((like) => like.commentId);
  }

  // Buscar respostas das respostas recursivamente
  const repliesWithChildren = await Promise.all(
    replies.map(async (reply) => {
      const childReplies = await getCommentReplies(reply.id, isAdmin, userId);
      return {
        ...reply,
        userLiked: userLikedIds.includes(reply.id),
        likeCount: reply._count.likes,
        replyCount: reply._count.replies,
        replies: childReplies,
        _count: undefined, // Remover _count após extrair valores
      };
    })
  );

  return repliesWithChildren;
}

// ==================== GET - Listar Comentários do Artigo ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'newest';

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Verificar se artigo existe
    const article = await prisma.blogArticle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Ordenação
    let orderBy: any = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'mostLiked':
        orderBy = { likeCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Verificar permissões
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user && session.user.role >= 1;

    const where: any = {
      articleId: id,
      parentId: null, // Apenas comentários top-level
    };

    if (!isAdmin) {
      where.status = 'APPROVED';
    }

    // Buscar comentários top-level
    const comments = await prisma.blogComment.findMany({
      where,
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
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy,
    });

    // Se usuário logado, verificar quais comentários ele curtiu
    let userLikedCommentIds: string[] = [];
    if (session?.user) {
      const userLikes = await prisma.blogCommentLike.findMany({
        where: {
          userId: session.user.id,
          commentId: {
            in: comments.map((c) => c.id),
          },
        },
        select: { commentId: true },
      });

      userLikedCommentIds = userLikes.map((like) => like.commentId);
    }

    // ✅ BUSCAR RESPOSTAS RECURSIVAMENTE PARA CADA COMENTÁRIO
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await getCommentReplies(
          comment.id,
          isAdmin,
          session?.user?.id
        );

        return {
          ...comment,
          userLiked: userLikedCommentIds.includes(comment.id),
          likeCount: comment._count.likes,
          replyCount: comment._count.replies,
          replies,
          _count: undefined, // Remover _count após extrair valores
        };
      })
    );

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
      total: comments.length,
    });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== POST - Criar Comentário ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas usuários logados podem comentar
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do artigo é obrigatório' },
        { status: 400 }
      );
    }

    // Validação de conteúdo
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Conteúdo do comentário é obrigatório' },
        { status: 400 }
      );
    }

    if (content.trim().length < 3) {
      return NextResponse.json(
        { error: 'Comentário muito curto (mínimo 3 caracteres)' },
        { status: 400 }
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Comentário muito longo (máximo 2000 caracteres)' },
        { status: 400 }
      );
    }

    // Verificar se artigo existe
    const article = await prisma.blogArticle.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Apenas artigos publicados aceitam comentários
    if (article.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Não é possível comentar em artigos não publicados' },
        { status: 400 }
      );
    }

    // Se for resposta, verificar se comentário pai existe
    if (parentId) {
      const parentComment = await prisma.blogComment.findUnique({
        where: { id: parentId },
        select: { id: true, articleId: true },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Comentário pai não encontrado' },
          { status: 404 }
        );
      }

      if (parentComment.articleId !== id) {
        return NextResponse.json(
          { error: 'Comentário pai não pertence a este artigo' },
          { status: 400 }
        );
      }
    }

    // Criar comentário (status APPROVED por padrão)
    const comment = await prisma.blogComment.create({
      data: {
        articleId: id,
        userId: session.user.id,
        content: content.trim(),
        parentId: parentId || null,
        status: 'APPROVED',
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

    revalidateTag(`blog-article-${id}`);
    revalidateTag(`blog-comments-${id}`);

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comentário criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
