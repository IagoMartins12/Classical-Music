// app/api/blog/search/autocomplete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type'); // 'articles', 'tags', 'categories', 'all'

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const suggestions: any = {
      articles: [],
      tags: [],
      categories: [],
    };

    // Buscar artigos
    if (!type || type === 'articles' || type === 'all') {
      const articles = await prisma.blogArticle.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: { lte: new Date() },
          title: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
        },
        orderBy: { viewCount: 'desc' },
        take: 5,
      });

      suggestions.articles = articles;
    }

    // Buscar tags
    if (!type || type === 'tags' || type === 'all') {
      const tags = await prisma.blogTag.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
        },
        orderBy: { articleCount: 'desc' },
        take: 5,
      });

      suggestions.tags = tags;
    }

    // Buscar categorias
    if (!type || type === 'categories' || type === 'all') {
      const categories = await prisma.blogCategory.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true,
        },
        orderBy: { order: 'asc' },
        take: 5,
      });

      suggestions.categories = categories;
    }

    return NextResponse.json({
      success: true,
      query: q,
      suggestions,
    });
  } catch (error) {
    console.error('Erro no autocomplete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
