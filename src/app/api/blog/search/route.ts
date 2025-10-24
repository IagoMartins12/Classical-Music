// app/api/blog/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { ArticleType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q');
    const types = searchParams.get('types')?.split(',') as
      | ArticleType[]
      | undefined;
    const categories = searchParams.get('categories')?.split(',');
    const tags = searchParams.get('tags')?.split(',');
    const composerId = searchParams.get('composerId');
    const workId = searchParams.get('workId');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { keywords: { hasSome: [q] } },
      ],
    };

    // Se admin, pode buscar em qualquer status
    if (session?.user && session.user.role >= 1) {
      delete where.status;
      delete where.publishedAt;
    }

    if (types && types.length > 0) {
      where.types = { hasSome: types };
    }

    if (composerId) {
      where.composerIds = { has: composerId };
    }

    if (workId) {
      where.workIds = { has: workId };
    }

    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          category: {
            slug: { in: categories },
          },
        },
      };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: { in: tags },
          },
        },
      };
    }

    // Ordenação
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'relevance':
      default:
        // Relevância: prioriza matches no título
        orderBy = { title: 'asc' }; // Simplificado, idealmente seria full-text search
        break;
    }

    // Buscar artigos
    const [articles, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.blogArticle.count({ where }),
    ]);

    // Gerar sugestões (tags e categorias relacionadas)
    const suggestions: string[] = [];

    // Buscar tags populares relacionadas
    const relatedTags = await prisma.blogTag.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      orderBy: { articleCount: 'desc' },
      take: 5,
      select: { name: true },
    });

    suggestions.push(...relatedTags.map((t) => t.name));

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      query: q,
      results: articles.map((article) => ({
        ...article,
        categories: article.categories.map((c) => c.category),
        tags: article.tags.map((t) => t.tag),
        stats: {
          comments: article._count.comments,
          likes: article._count.likes,
        },
      })),
      pagination,
      suggestions: suggestions.slice(0, 5), // Máximo 5 sugestões
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
