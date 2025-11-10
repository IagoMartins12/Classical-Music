// app/api/blog/articles/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    // Buscar artigo
    const article = await prisma.blogArticle.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
            bio: true,
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
                description: true,
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
        media: {
          orderBy: { order: 'asc' },
        },

        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Se não publicado, só admin/autor pode ver
    if (article.status !== 'PUBLISHED') {
      if (
        !session?.user ||
        (session.user.role < 1 && session.user.id !== article.authorId)
      ) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      }
    }

    // Buscar dados vinculados do Opus Atlas
    const composers =
      article.composerIds.length > 0
        ? await prisma.composer.findMany({
            where: { id: { in: article.composerIds } },
            select: {
              id: true,
              name: true,
              fullName: true,
              portraitUrl: true,
              epochName: true,
              birthDate: true,
              deathDate: true,
            },
          })
        : [];

    const works =
      article.workIds.length > 0
        ? await prisma.work.findMany({
            where: { id: { in: article.workIds } },
            select: {
              id: true,
              title: true,
              imslpId: true,
              opOrCatalog: true,
              composer: {
                select: {
                  id: true,
                  name: true,
                },
              },
              instrument: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : [];

    const scores =
      article.scoreIds.length > 0
        ? await prisma.workScore.findMany({
            where: { sourceId: { in: article.scoreIds } },
            select: {
              id: true,
              sourceId: true,
              title: true,
              downloadUrl: true,
              type: true,
              thumbnailUrl: true,
              work: {
                select: {
                  id: true,
                  title: true,
                  composer: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          })
        : [];

    const instruments =
      article.instrumentIds.length > 0
        ? await prisma.instrument.findMany({
            where: { id: { in: article.instrumentIds } },
            select: {
              id: true,
              name: true,
              category: true,
            },
          })
        : [];

    const epochs =
      article.epochIds.length > 0
        ? await prisma.epoch.findMany({
            where: { id: { in: article.epochIds } },
            select: {
              id: true,
              name: true,
            },
          })
        : [];

    // Verificar interações do usuário
    let userLiked = false;
    let userBookmarked = false;

    if (session?.user) {
      const [like, bookmark] = await Promise.all([
        prisma.blogLike.findUnique({
          where: {
            articleId_userId: {
              articleId: article.id,
              userId: session.user.id,
            },
          },
        }),
        prisma.blogBookmark.findUnique({
          where: {
            articleId_userId: {
              articleId: article.id,
              userId: session.user.id,
            },
          },
        }),
      ]);

      userLiked = !!like;
      userBookmarked = !!bookmark;
    }

    // Buscar artigos relacionados (mesma categoria ou tags)
    const relatedArticles = await prisma.blogArticle.findMany({
      where: {
        id: { not: article.id },
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        OR: [
          {
            categories: {
              some: {
                categoryId: {
                  in: article.categories.map((c) => c.category.id),
                },
              },
            },
          },
          {
            tags: {
              some: {
                tagId: {
                  in: article.tags.map((t) => t.tag.id),
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        publishedAt: true,
        estimatedReadTime: true,
        viewCount: true,
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
      orderBy: { viewCount: 'desc' },
      take: 4,
    });

    // Info da série (se faz parte)

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        categories: article.categories.map((c) => c.category),
        tags: article.tags.map((t) => t.tag),
        composers,
        works,
        scores,
        instruments,
        epochs,
        userLiked,
        userBookmarked,
        relatedArticles,
      },
      stats: {
        views: article.viewCount,
        reads: article.readCount,
        comments: article._count.comments,
        likes: article._count.likes,
        bookmarks: article._count.bookmarks,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
