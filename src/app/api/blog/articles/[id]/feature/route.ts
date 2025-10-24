// app/api/blog/articles/[id]/feature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function PATCH(
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
    const { isFeatured, featuredOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const article = await prisma.blogArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Se está marcando como destaque
    if (isFeatured && !article.isFeatured) {
      const featuredCount = await prisma.blogArticle.count({
        where: { isFeatured: true },
      });

      if (featuredCount >= 5) {
        return NextResponse.json(
          {
            error:
              'Limite de 5 artigos em destaque atingido. Remova um para adicionar outro.',
          },
          { status: 400 }
        );
      }
    }

    const updatedArticle = await prisma.blogArticle.update({
      where: { id },
      data: {
        isFeatured,
        featuredOrder: isFeatured ? featuredOrder || 1 : null,
      },
    });

    revalidateTag('blog-articles');
    revalidateTag(`blog-article-${id}`);
    revalidateTag('blog-featured');
    revalidateTag('blog-home');

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: isFeatured
        ? 'Artigo marcado como destaque'
        : 'Artigo removido dos destaques',
    });
  } catch (error) {
    console.error('Erro ao marcar/desmarcar destaque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
