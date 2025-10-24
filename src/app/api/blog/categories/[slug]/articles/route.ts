// app/api/blog/categories/[slug]/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'newest';

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar categoria
    const category = await prisma.blogCategory.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    // Ordenação
    let orderBy: any = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { publishedAt: 'desc' };
        break;
    }

    // Buscar artigos da categoria
    const [articleRelations, total] = await Promise.all([
      prisma.blogArticleCategory.findMany({
        where: {
          categoryId: category.id,
          article: {
            status: 'PUBLISHED',
            publishedAt: { lte: new Date() },
          },
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
        skip,
        take: limit,
        orderBy,
      }),
      prisma.blogArticleCategory.count({
        where: {
          categoryId: category.id,
          article: {
            status: 'PUBLISHED',
            publishedAt: { lte: new Date() },
          },
        },
      }),
    ]);

    const articles = articleRelations.map((rel) => ({
      ...rel.article,
      categories: rel.article.categories.map((c) => c.category),
      tags: rel.article.tags.map((t) => t.tag),
      stats: {
        comments: rel.article._count.comments,
        likes: rel.article._count.likes,
      },
    }));

    // Ordenar artigos
    articles.sort((a, b) => {
      if (sortBy === 'oldest') {
        return (
          new Date(a.publishedAt!).getTime() -
          new Date(b.publishedAt!).getTime()
        );
      } else if (sortBy === 'popular') {
        return b.viewCount - a.viewCount;
      } else {
        return (
          new Date(b.publishedAt!).getTime() -
          new Date(a.publishedAt!).getTime()
        );
      }
    });

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      articles,
      pagination,
    });
  } catch (error) {
    console.error('Erro ao buscar artigos da categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
