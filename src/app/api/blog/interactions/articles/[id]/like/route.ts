// app/api/blog/interactions/articles/[id]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== POST - Curtir Artigo ====================
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

    // Criar like (upsert para evitar duplicatas)
    const like = await prisma.blogLike.upsert({
      where: {
        articleId_userId: {
          articleId: id,
          userId: session.user.id,
        },
      },
      update: {}, // Se já existe, não faz nada
      create: {
        articleId: id,
        userId: session.user.id,
      },
    });

    revalidateTag(`blog-article-${id}`);
    revalidateTag('user-blog-interactions');

    return NextResponse.json({
      success: true,
      like,
      message: 'Artigo curtido',
    });
  } catch (error) {
    console.error('Erro ao curtir artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Descurtir Artigo ====================
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

    // Deletar like
    await prisma.blogLike.deleteMany({
      where: {
        articleId: id,
        userId: session.user.id,
      },
    });

    revalidateTag(`blog-article-${id}`);
    revalidateTag('user-blog-interactions');

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
