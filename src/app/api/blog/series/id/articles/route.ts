// app/api/blog/series/[id]/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== POST - Adicionar Artigo à Série ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { articleId, order } = body;

    if (!id || !articleId) {
      return NextResponse.json(
        { error: 'ID da série e ID do artigo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se série existe
    const series = await prisma.blogSeries.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Série não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se artigo existe
    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se artigo já está na série
    const existingRelation = await prisma.blogSeriesArticle.findUnique({
      where: {
        seriesId_articleId: {
          seriesId: id,
          articleId,
        },
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Artigo já está nesta série' },
        { status: 400 }
      );
    }

    // Se ordem não especificada, colocar no final
    let finalOrder = order;
    if (finalOrder === undefined) {
      const lastArticle = await prisma.blogSeriesArticle.findFirst({
        where: { seriesId: id },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      finalOrder = lastArticle ? lastArticle.order + 1 : 1;
    }

    // Adicionar artigo à série
    const seriesArticle = await prisma.blogSeriesArticle.create({
      data: {
        seriesId: id,
        articleId,
        order: finalOrder,
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            publishedAt: true,
          },
        },
      },
    });

    revalidateTag('blog-series');
    revalidateTag(`blog-series-${id}`);
    revalidateTag(`blog-article-${articleId}`);

    return NextResponse.json({
      success: true,
      seriesArticle,
      message: 'Artigo adicionado à série com sucesso',
    });
  } catch (error) {
    console.error('Erro ao adicionar artigo à série:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Remover Artigo da Série ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!id || !articleId) {
      return NextResponse.json(
        { error: 'ID da série e ID do artigo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se relação existe
    const relation = await prisma.blogSeriesArticle.findUnique({
      where: {
        seriesId_articleId: {
          seriesId: id,
          articleId,
        },
      },
    });

    if (!relation) {
      return NextResponse.json(
        { error: 'Artigo não está nesta série' },
        { status: 404 }
      );
    }

    // Remover artigo da série
    await prisma.blogSeriesArticle.delete({
      where: {
        seriesId_articleId: {
          seriesId: id,
          articleId,
        },
      },
    });

    revalidateTag('blog-series');
    revalidateTag(`blog-series-${id}`);
    revalidateTag(`blog-article-${articleId}`);

    return NextResponse.json({
      success: true,
      message: 'Artigo removido da série com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover artigo da série:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
