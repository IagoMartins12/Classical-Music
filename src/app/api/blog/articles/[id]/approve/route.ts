// app/api/blog/articles/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/app/libs/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas admin pode aprovar
    if (
      !session?.user ||
      (session.user.role !== 1 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

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

    // Atualizar para PUBLISHED
    await prisma.blogArticle.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    // Revalidar caches
    revalidateTag('blog-articles');
    revalidateTag('blog-home');
    revalidateTag(`blog-article-${id}`);
    revalidateTag(`blog-article-${article.slug}`);

    // Redirecionar para o artigo publicado
    return NextResponse.redirect(new URL(`/blog/${article.slug}`, request.url));
  } catch (error) {
    console.error('Erro ao aprovar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
