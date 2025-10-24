// app/api/blog/categories/[slug]/route.ts
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

    const category = await prisma.blogCategory.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            description: true,
          },
          orderBy: { order: 'asc' },
        },
        articles: {
          where: {
            article: {
              status: 'PUBLISHED',
              publishedAt: { lte: new Date() },
            },
          },
          select: { id: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        articleCount: category.articles.length,
        articles: undefined,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
