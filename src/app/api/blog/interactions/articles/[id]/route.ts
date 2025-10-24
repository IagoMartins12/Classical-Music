// app/api/blog/interactions/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    // Quantidade total de likes e bookmarks
    const [likesCount, bookmarksCount] = await Promise.all([
      prisma.blogLike.count({ where: { articleId: id } }),
      prisma.blogBookmark.count({ where: { articleId: id } }),
    ]);

    let isLiked = false;
    let isBookmarked = false;

    // Se o usuário estiver logado, verificar interações dele
    if (session?.user?.id) {
      const [like, bookmark] = await Promise.all([
        prisma.blogLike.findFirst({
          where: {
            articleId: id,
            userId: session.user.id,
          },
        }),
        prisma.blogBookmark.findFirst({
          where: {
            articleId: id,
            userId: session.user.id,
          },
        }),
      ]);

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return NextResponse.json({
      success: true,
      likesCount,
      bookmarksCount,
      isLiked,
      isBookmarked,
    });
  } catch (error) {
    console.error('Erro ao buscar interações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
