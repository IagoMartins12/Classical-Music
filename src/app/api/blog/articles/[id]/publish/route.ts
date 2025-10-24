// app/api/blog/articles/[id]/publish/route.ts
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
    const { action, scheduledFor } = body; // action: 'publish', 'unpublish', 'schedule'

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

    let updateData: any = {};

    switch (action) {
      case 'publish':
        updateData = {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          scheduledFor: null,
        };
        break;

      case 'unpublish':
        updateData = {
          status: 'DRAFT',
          publishedAt: null,
          scheduledFor: null,
        };
        break;

      case 'schedule':
        if (!scheduledFor) {
          return NextResponse.json(
            { error: 'Data de agendamento é obrigatória' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'SCHEDULED',
          scheduledFor: new Date(scheduledFor),
          publishedAt: null,
        };
        break;

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    const updatedArticle = await prisma.blogArticle.update({
      where: { id },
      data: updateData,
    });

    revalidateTag('blog-articles');
    revalidateTag(`blog-article-${id}`);
    revalidateTag('blog-home');

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: `Artigo ${
        action === 'publish'
          ? 'publicado'
          : action === 'unpublish'
            ? 'despublicado'
            : 'agendado'
      } com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao publicar/despublicar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
