// app/api/blog/interactions/my-bookmarks/route.ts
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

    const skip = (page - 1) * limit;

    // Buscar bookmarks do usuário
    const [bookmarks, total] = await Promise.all([
      prisma.blogBookmark.findMany({
        where: {
          userId: session.user.id,
        },
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
      prisma.blogBookmark.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      bookmarks: bookmarks.map((bookmark) => ({
        ...bookmark,
        article: {
          ...bookmark.article,
          categories: bookmark.article.categories.map((c) => c.category),
          tags: bookmark.article.tags.map((t) => t.tag),
          stats: {
            comments: bookmark.article._count.comments,
            likes: bookmark.article._count.likes,
          },
        },
      })),
      pagination,
    });
  } catch (error) {
    console.error('Erro ao buscar salvos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
