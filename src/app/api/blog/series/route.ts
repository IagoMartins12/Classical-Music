// app/api/blog/series/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== GET - Listar Séries ====================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    const includeArticles = searchParams.get('includeArticles') === 'true';

    const where: any = { isActive: true };

    if (authorId) {
      where.authorId = authorId;
    }

    const series = await prisma.blogSeries.findMany({
      where,
      include: {
        ...(includeArticles && {
          articles: {
            include: {
              article: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  coverImage: true,
                  publishedAt: true,
                  status: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        }),
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      series: series.map((s) => ({
        ...s,
        articleCount: s._count.articles,
        articles: includeArticles
          ? s.articles.map((a) => ({
              order: a.order,
            }))
          : undefined,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar séries:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== POST - Criar Série ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, description, coverImage } = body;

    // Validações
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar slug duplicado
    const existingSlug = await prisma.blogSeries.findUnique({
      where: { slug: slug.trim() },
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
    }

    const series = await prisma.blogSeries.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        coverImage: coverImage?.trim() || null,
        authorId: session.user.id,
      },
    });

    revalidateTag('blog-series');

    return NextResponse.json({
      success: true,
      series,
      message: 'Série criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar série:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== PUT - Atualizar Série ====================
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existingSeries = await prisma.blogSeries.findUnique({
      where: { id },
    });

    if (!existingSeries) {
      return NextResponse.json(
        { error: 'Série não encontrada' },
        { status: 404 }
      );
    }

    // Verificar slug duplicado (se mudou)
    if (updateData.slug && updateData.slug !== existingSeries.slug) {
      const slugExists = await prisma.blogSeries.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
      }
    }

    const updatedSeries = await prisma.blogSeries.update({
      where: { id },
      data: updateData,
    });

    revalidateTag('blog-series');
    revalidateTag(`blog-series-${id}`);

    return NextResponse.json({
      success: true,
      series: updatedSeries,
      message: 'Série atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar série:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Deletar Série ====================
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const series = await prisma.blogSeries.findUnique({
      where: { id },
      include: {
        articles: true,
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Série não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se tem artigos
    if (series.articles.length > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar série com ${series.articles.length} artigos. Remova os artigos primeiro.`,
        },
        { status: 400 }
      );
    }

    await prisma.blogSeries.delete({
      where: { id },
    });

    revalidateTag('blog-series');

    return NextResponse.json({
      success: true,
      message: 'Série deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar série:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
