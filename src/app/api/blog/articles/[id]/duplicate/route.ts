// app/api/blog/articles/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/app/libs/auth';
import { invalidateBlogCache } from '@/app/requests/blog/cached-blog-function';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

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

    // Buscar artigo original
    const original = await prisma.blogArticle.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!original) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Gerar novo slug único
    let newSlug = `${original.slug}-copia`;
    let counter = 1;
    while (await prisma.blogArticle.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${original.slug}-copia-${counter}`;
      counter++;
    }

    // Criar artigo duplicado
    const duplicated = await prisma.blogArticle.create({
      data: {
        title: `${original.title} (Cópia)`,
        slug: newSlug,
        description: original.description,
        content: original.content
          ? JSON.parse(JSON.stringify(original.content))
          : {},
        coverImage: original.coverImage,
        coverImageAlt: original.coverImageAlt,
        coverImageCredit: original.coverImageCredit,
        status: 'DRAFT', // Sempre começa como rascunho
        isFeatured: false, // Não herda destaque
        types: original.types,
        authorId: session.user.id, // Novo autor
        composerIds: original.composerIds,
        workIds: original.workIds,
        scoreIds: original.scoreIds,
        instrumentIds: original.instrumentIds,
        epochIds: original.epochIds,
        backgroundMusicUrl: original.backgroundMusicUrl,
        backgroundMusicTitle: original.backgroundMusicTitle,
        backgroundMusicVolume: original.backgroundMusicVolume,
        backgroundMusicLoop: original.backgroundMusicLoop,
        backgroundMusicAutoplay: original.backgroundMusicAutoplay,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        keywords: original.keywords,
        readTime: original.readTime,
      },
    });

    // Duplicar categorias
    if (original.categories.length > 0) {
      await prisma.blogArticleCategory.createMany({
        data: original.categories.map((cat) => ({
          articleId: duplicated.id,
          categoryId: cat.category.id,
        })),
      });
    }

    // Duplicar tags
    if (original.tags.length > 0) {
      await prisma.blogArticleTag.createMany({
        data: original.tags.map((tag) => ({
          articleId: duplicated.id,
          tagId: tag.tag.id,
        })),
      });

      // Incrementar contador de tags
      for (const tag of original.tags) {
        await prisma.blogTag.update({
          where: { id: tag.tag.id },
          data: { articleCount: { increment: 1 } },
        });
      }
    }

    // Criar versão inicial
    await prisma.blogArticleVersion.create({
      data: {
        articleId: duplicated.id,
        version: 1,
        snapshot: duplicated as any,
        editedBy: session.user.id,
        changeLog: `Duplicado de: ${original.title}`,
      },
    });

    revalidateTag('blog-articles');
    await invalidateBlogCache();

    return NextResponse.json({
      success: true,
      article: duplicated,
      message: 'Artigo duplicado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao duplicar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
