// app/requests/blog-requests.ts
import prisma from '@/app/libs/prismadb';

export interface BlogArticlePreview {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  publishedAt: Date | null;
  readTime?: number;
  authorName?: string;
  authorImage?: string;
}

export async function getComposerArticles(
  composerId: string,
  limit: number = 5
): Promise<{ articles: BlogArticlePreview[]; totalCount: number }> {
  try {
    // Busca artigos onde:
    // 1. Status é PUBLISHED
    // 2. Tipo é COMPOSER_ANALYSIS OU tags contém o ID do compositor

    const [articles, totalCount] = await Promise.all([
      prisma.blogArticle.findMany({
        where: {
          status: 'PUBLISHED',
          composerIds: {
            has: composerId,
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          publishedAt: true,
          readTime: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
      }),
      prisma.blogArticle.count({
        where: {
          status: 'PUBLISHED',
          composerIds: {
            has: composerId,
          },
        },
      }),
    ]);

    return {
      articles: articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        coverImage: article.coverImage || undefined,
        publishedAt: article.publishedAt,
        readTime: article.readTime || undefined,
        authorName: article.author
          ? `${article.author.firstName} ${article.author.lastName}`
          : undefined,
        authorImage: article.author?.image || undefined,
      })),
      totalCount,
    };
  } catch (error) {
    console.error('Erro ao buscar artigos do compositor:', error);
    return { articles: [], totalCount: 0 };
  }
}

export async function getFeaturedArticles() {
  return await prisma.blogArticle.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      isFeatured: true,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      _count: {
        select: {
          comments: { where: { status: 'APPROVED' } },
          likes: true,
        },
      },
    },
    orderBy: { featuredOrder: 'asc' },
    take: 6,
  });
}

export async function getLatestArticles() {
  return await prisma.blogArticle.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      _count: {
        select: {
          comments: { where: { status: 'APPROVED' } },
          likes: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 9,
  });
}

export async function getMostReadArticles() {
  return await prisma.blogArticle.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { viewCount: 'desc' },
    take: 5,
  });
}

export async function getCategories() {
  return await prisma.blogCategory.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          articles: {
            where: {
              article: {
                status: 'PUBLISHED',
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
    take: 8,
  });
}

export async function getFeaturedAuthors() {
  const users = await prisma.user.findMany({
    where: {
      blogArticles: {
        some: {
          status: 'PUBLISHED',
          publishedAt: { lte: new Date() },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
      _count: {
        select: {
          blogArticles: {
            where: {
              status: 'PUBLISHED',
              publishedAt: { lte: new Date() },
            },
          },
        },
      },
    },
    orderBy: {
      blogArticles: { _count: 'desc' },
    },
    take: 3,
  });

  return users.map((u) => ({
    ...u,
    articleCount: u._count.blogArticles,
  }));
}

export async function getTrendingTopics() {
  // Buscar tags mais usadas nos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const tags = await prisma.blogTag.findMany({
    where: {
      articles: {
        some: {
          article: {
            status: 'PUBLISHED',
            publishedAt: {
              gte: thirtyDaysAgo,
              lte: new Date(),
            },
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          articles: {
            where: {
              article: {
                status: 'PUBLISHED',
                publishedAt: {
                  gte: thirtyDaysAgo,
                  lte: new Date(),
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      articles: { _count: 'desc' },
    },
    take: 10,
  });

  return tags.map((tag) => ({
    name: tag.name,
    slug: tag.slug,
    count: tag._count.articles,
    color: tag.color,
  }));
}
