// app/api/blog/interactions/my-likes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categorySlug = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Construir where
    const where: any = {
      userId: session.user.id,
      article: {
        status: 'PUBLISHED',
      },
    };

    // Filtro por categoria
    if (categorySlug && categorySlug !== 'all') {
      where.article.categories = {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      };
    }

    // Buscar likes do usuário
    const [likes, total] = await Promise.all([
      prisma.blogLike.findMany({
        where,
        include: {
          article: {
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
                  comments: { where: { status: 'APPROVED' } },
                  likes: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.blogLike.count({ where }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      likes: likes.map((like) => ({
        ...like,
        article: {
          ...like.article,
          categories: like.article.categories.map((c) => c.category),
          tags: like.article.tags.map((t) => t.tag),
          stats: {
            comments: like.article._count.comments,
            likes: like.article._count.likes,
          },
        },
      })),
      pagination,
    });
  } catch (error) {
    console.error('Erro ao buscar curtidos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
