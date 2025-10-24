// app/api/blog/articles/featured/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// ==================== POST - Reordenar destaques ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { articles } = body;

    if (!Array.isArray(articles)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    // Atualizar ordem de cada artigo
    await Promise.all(
      articles.map((article: { id: string; featuredOrder: number }) =>
        prisma.blogArticle.update({
          where: { id: article.id },
          data: { featuredOrder: article.featuredOrder },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Ordem atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao reordenar destaques:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
