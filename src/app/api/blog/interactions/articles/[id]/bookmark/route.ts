// app/api/blog/interactions/articles/[id]/bookmark/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== POST - Salvar Artigo ====================
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
    const { notes } = body; // Notas pessoais opcionais

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

    // Criar bookmark (upsert para evitar duplicatas)
    const bookmark = await prisma.blogBookmark.upsert({
      where: {
        articleId_userId: {
          articleId: id,
          userId: session.user.id,
        },
      },
      update: {
        notes: notes?.trim() || null,
      },
      create: {
        articleId: id,
        userId: session.user.id,
        notes: notes?.trim() || null,
      },
    });

    revalidateTag(`blog-article-${id}`);
    revalidateTag('user-blog-bookmarks');

    return NextResponse.json({
      success: true,
      bookmark,
      message: 'Artigo salvo',
    });
  } catch (error) {
    console.error('Erro ao salvar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Remover Salvamento ====================
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

    // Deletar bookmark
    await prisma.blogBookmark.deleteMany({
      where: {
        articleId: id,
        userId: session.user.id,
      },
    });

    revalidateTag(`blog-article-${id}`);
    revalidateTag('user-blog-bookmarks');

    return NextResponse.json({
      success: true,
      message: 'Salvamento removido',
    });
  } catch (error) {
    console.error('Erro ao remover salvamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
