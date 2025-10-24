// app/api/blog/series/[slug]/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar série
    const series = await prisma.blogSeries.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Série não encontrada' },
        { status: 404 }
      );
    }

    // Buscar artigos da série
    const seriesArticles = await prisma.blogSeriesArticle.findMany({
      where: {
        seriesId: series.id,
      },
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                image: true,
              },
            },
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                    icon: true,
                  },
                },
              },
            },
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                  },
                },
              },
            },
            _count: {
              select: {
                comments: { where: { status: 'APPROVED' } },
                likes: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    const articles = seriesArticles.map((sa) => ({
      ...sa.article,
      seriesOrder: sa.order,
      categories: sa.article.categories.map((c) => c.category),
      tags: sa.article.tags.map((t) => t.tag),
      stats: {
        comments: sa.article._count.comments,
        likes: sa.article._count.likes,
      },
    }));

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
    });
  } catch (error) {
    console.error('Erro ao buscar artigos da série:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
