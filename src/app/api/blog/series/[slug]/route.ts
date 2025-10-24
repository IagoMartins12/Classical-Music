// app/api/blog/series/[slug]/route.ts
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

    const series = await prisma.blogSeries.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Série não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      series: {
        ...series,
        articleCount: series._count.articles,
        _count: undefined,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar série:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
