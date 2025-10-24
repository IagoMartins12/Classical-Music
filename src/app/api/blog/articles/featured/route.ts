// app/api/blog/articles/featured/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

// ==================== GET - Listar artigos em destaque ====================
export async function GET() {
  try {
    const articles = await prisma.blogArticle.findMany({
      where: {
        isFeatured: true,
      },
      select: {
        id: true,
        title: true,
        featuredOrder: true,
      },
      orderBy: {
        featuredOrder: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error('Erro ao listar destaques:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
