// app/api/blog/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { ArticleStatus, ArticleType } from '@prisma/client';
import { authOptions } from '@/app/libs/auth';

// ==================== GET - Listar Artigos ====================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Query params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status') as ArticleStatus | undefined;
    const types = searchParams.get('types')?.split(',') as
      | ArticleType[]
      | undefined;
    const categories = searchParams.get('categories')?.split(',');
    const tags = searchParams.get('tags')?.split(',');
    const featured = searchParams.get('featured') === 'true';
    const composerId = searchParams.get('composerId');
    const workId = searchParams.get('workId');
    const instrumentId = searchParams.get('instrumentId');
    const epochId = searchParams.get('epochId');
    const authorId = searchParams.get('authorId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status: se não logado ou não admin, só mostra PUBLISHED
    if (!session?.user || session.user.role < 1) {
      where.status = 'PUBLISHED';
      where.publishedAt = { lte: new Date() }; // Não mostrar agendados
    } else if (status) {
      where.status = status;
    }

    if (types && types.length > 0) {
      where.types = { hasSome: types };
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (composerId) {
      where.composerIds = { has: composerId };
    }

    if (workId) {
      where.workIds = { has: workId };
    }

    if (instrumentId) {
      where.instrumentIds = { has: instrumentId };
    }

    if (epochId) {
      where.epochIds = { has: epochId };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: [search] } },
      ];
    }

    // Filtros de categoria
    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          category: {
            slug: { in: categories },
          },
        },
      };
    }

    // Filtros de tag
    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: { in: tags },
          },
        },
      };
    }

    // Ordenação
    let orderBy: any = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'mostRead':
        orderBy = { readCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { publishedAt: 'desc' };
        break;
    }

    // Buscar artigos
    const [articles, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              image: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                  icon: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
              bookmarks: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.blogArticle.count({ where }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      articles: articles.map((article) => ({
        ...article,
        categories: article.categories.map((c) => c.category),
        tags: article.tags.map((t) => t.tag),
        stats: {
          comments: article._count.comments,
          likes: article._count.likes,
          bookmarks: article._count.bookmarks,
        },
      })),
      pagination,
      filters: {
        status,
        types,
        categories,
        tags,
        featured,
        composerId,
        workId,
        instrumentId,
        epochId,
        authorId,
        search,
        sortBy,
      },
    });
  } catch (error) {
    console.error('Erro ao listar artigos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== POST - Criar Artigo ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas admin pode criar artigos
    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      content,
      coverImage,
      coverImageAlt,
      coverImageCredit,
      readTime,

      status = 'DRAFT',
      isFeatured = false,
      featuredOrder,
      types = [],
      categoryIds = [],
      tags = [],
      composerIds = [],
      workIds = [],
      scoreIds = [],
      instrumentIds = [],
      epochIds = [],
      backgroundMusic,
      metaTitle,
      metaDescription,
      keywords = [],
      scheduledFor,
      coAuthorIds = [],
    } = body;

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

    // Verificar se slug já existe
    const existingSlug = await prisma.blogArticle.findUnique({
      where: { slug: slug.trim() },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug já existe. Use outro slug.' },
        { status: 400 }
      );
    }

    // Se marcar como destaque, verificar limite de 5
    if (isFeatured) {
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

    // Calcular tempo estimado de leitura (palavras / 200 palavras por minuto)
    let estimatedReadTime = null;
    if (content && typeof content === 'object') {
      const contentText = JSON.stringify(content);
      const wordCount = contentText.split(/\s+/).length;
      estimatedReadTime = Math.ceil(wordCount / 200); // minutos
    }

    // Criar artigo
    const article = await prisma.blogArticle.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        content: content || {},
        coverImage: coverImage?.trim() || null,
        coverImageAlt: coverImageAlt?.trim() || null,
        coverImageCredit: coverImageCredit?.trim() || null,
        readTime,
        status,
        isFeatured,
        featuredOrder: isFeatured ? featuredOrder || 1 : null,
        types,
        authorId: session.user.id,
        coAuthorIds,
        composerIds,
        workIds,
        scoreIds,
        instrumentIds,
        epochIds,
        backgroundMusicUrl: backgroundMusic?.url || null,
        backgroundMusicTitle: backgroundMusic?.title || null,
        backgroundMusicVolume: backgroundMusic?.volume || 0.3,
        backgroundMusicLoop: backgroundMusic?.loop !== false,
        backgroundMusicAutoplay: backgroundMusic?.autoplay !== false,
        estimatedReadTime,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        keywords,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Criar relações com categorias
    if (categoryIds.length > 0) {
      await prisma.blogArticleCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          articleId: article.id,
          categoryId,
        })),
      });
    }

    // Criar/conectar tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Criar slug da tag
        const tagSlug = tagName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Upsert tag
        const tag = await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          create: {
            name: tagName,
            slug: tagSlug,
            articleCount: 1,
          },
          update: {
            articleCount: { increment: 1 },
          },
        });

        // Criar relação
        await prisma.blogArticleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Criar versão inicial
    await prisma.blogArticleVersion.create({
      data: {
        articleId: article.id,
        version: 1,
        snapshot: article as any,
        editedBy: session.user.id,
        changeLog: 'Versão inicial',
      },
    });

    // Revalidar caches
    revalidateTag('blog-articles');
    revalidateTag('blog-home');

    return NextResponse.json({
      success: true,
      article,
      message: 'Artigo criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== PUT - Atualizar Artigo ====================
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, categoryIds, tags, ...restData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existingArticle = await prisma.blogArticle.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar slug duplicado (se mudou)
    if (restData.slug && restData.slug !== existingArticle.slug) {
      const slugExists = await prisma.blogArticle.findUnique({
        where: { slug: restData.slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
      }
    }

    // Verificar limite de destaque
    if (restData.isFeatured && !existingArticle.isFeatured) {
      const featuredCount = await prisma.blogArticle.count({
        where: { isFeatured: true },
      });

      if (featuredCount >= 5) {
        return NextResponse.json(
          { error: 'Limite de 5 artigos em destaque atingido' },
          { status: 400 }
        );
      }
    }

    // 🔧 FILTRAR CAMPOS VÁLIDOS (remover readonly e relações)
    const validFields = [
      'title',
      'slug',
      'description',
      'content',
      'coverImage',
      'coverImageAlt',
      'coverImageCredit',
      'readTime',
      'status',
      'isFeatured',
      'featuredOrder',
      'types',
      'composerIds',
      'workIds',
      'scoreIds',
      'instrumentIds',
      'epochIds',
      'backgroundMusicUrl',
      'backgroundMusicTitle',
      'backgroundMusicVolume',
      'backgroundMusicLoop',
      'backgroundMusicAutoplay',
      'metaTitle',
      'metaDescription',
      'keywords',
      'scheduledFor',
      'coAuthorIds',
    ];

    const updateData: any = {};
    for (const field of validFields) {
      if (field in restData) {
        updateData[field] = restData[field];
      }
    }

    // Recalcular tempo de leitura se conteúdo mudou
    if (updateData.content) {
      const contentText = JSON.stringify(updateData.content);
      const wordCount = contentText.split(/\s+/).length;
      updateData.estimatedReadTime = Math.ceil(wordCount / 200);
    }

    // Atualizar backgroundMusic se fornecido
    if (restData.backgroundMusic) {
      updateData.backgroundMusicUrl = restData.backgroundMusic.url || null;
      updateData.backgroundMusicTitle = restData.backgroundMusic.title || null;
      updateData.backgroundMusicVolume = restData.backgroundMusic.volume || 0.3;
      updateData.backgroundMusicLoop = restData.backgroundMusic.loop !== false;
      updateData.backgroundMusicAutoplay =
        restData.backgroundMusic.autoplay !== false;
    }

    // Atualizar publishedAt se mudar para PUBLISHED
    if (
      updateData.status === 'PUBLISHED' &&
      existingArticle.status !== 'PUBLISHED'
    ) {
      updateData.publishedAt = new Date();
    }

    // Incrementar versão
    const newVersion = existingArticle.version + 1;
    updateData.version = newVersion;

    // Atualizar artigo
    const updatedArticle = await prisma.blogArticle.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Atualizar categorias se fornecidas
    if (categoryIds !== undefined) {
      await prisma.blogArticleCategory.deleteMany({
        where: { articleId: id },
      });

      if (categoryIds.length > 0) {
        await prisma.blogArticleCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            articleId: id,
            categoryId,
          })),
        });
      }
    }

    // Atualizar tags se fornecidas
    if (tags !== undefined) {
      // Remover tags antigas (decrementar contador)
      const oldTags = existingArticle.tags.map((t) => t.tag);
      for (const oldTag of oldTags) {
        await prisma.blogTag.update({
          where: { id: oldTag.id },
          data: { articleCount: { decrement: 1 } },
        });
      }

      // Deletar relações antigas
      await prisma.blogArticleTag.deleteMany({
        where: { articleId: id },
      });

      // Criar novas tags
      for (const tagName of tags) {
        const tagSlug = tagName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const tag = await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          create: {
            name: tagName,
            slug: tagSlug,
            articleCount: 1,
          },
          update: {
            articleCount: { increment: 1 },
          },
        });

        await prisma.blogArticleTag.create({
          data: {
            articleId: id,
            tagId: tag.id,
          },
        });
      }
    }

    // Criar nova versão
    await prisma.blogArticleVersion.create({
      data: {
        articleId: id,
        version: newVersion,
        snapshot: updatedArticle as any,
        editedBy: session.user.id,
        changeLog: restData.changeLog || 'Atualização do artigo',
      },
    });

    revalidateTag('blog-articles');
    revalidateTag(`blog-article-${id}`);
    revalidateTag(`blog-article-${existingArticle.slug}`);

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: 'Artigo atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Deletar Artigo ====================
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('id', searchParams);
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    console.log('id', id);
    const article = await prisma.blogArticle.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Decrementar contador de tags
    for (const tagRel of article.tags) {
      await prisma.blogTag.update({
        where: { id: tagRel.tag.id },
        data: { articleCount: { decrement: 1 } },
      });
    }

    // Deletar artigo (cascade deleta relações)
    await prisma.blogArticle.delete({
      where: { id },
    });

    revalidateTag('blog-articles');
    revalidateTag('blog-home');

    return NextResponse.json({
      success: true,
      message: 'Artigo deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
