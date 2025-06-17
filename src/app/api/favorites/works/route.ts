// app/api/favorites/works/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId, action } = await request.json();

    if (!workId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verificar se a obra existe
    const workExists = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true },
    });

    if (!workExists) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      // Adicionar aos favoritos (upsert para evitar duplicatas)
      const favorite = await prisma.favoriteWork.upsert({
        where: {
          userId_workId: {
            userId: session.user.id,
            workId: workId,
          },
        },
        update: {}, // Se já existe, não faz nada
        create: {
          userId: session.user.id,
          workId: workId,
        },
        include: {
          work: {
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      // Invalidar caches relacionados
      revalidateTag(`user-favorites-${session.user.id}`);
      revalidateTag(`work-favorites-${workId}`);
      revalidateTag('user-favorites');

      return NextResponse.json({
        success: true,
        action: 'added',
        favorite: {
          id: favorite.id,
          userId: favorite.userId,
          workId: favorite.workId,
          work: favorite.work,
        },
      });
    } else if (action === 'remove') {
      // Remover dos favoritos
      await prisma.favoriteWork.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // Invalidar caches relacionados
      revalidateTag(`user-favorites-${session.user.id}`);
      revalidateTag(`work-favorites-${workId}`);
      revalidateTag('user-favorites');

      return NextResponse.json({
        success: true,
        action: 'removed',
      });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de favoritos de obras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');

    if (workId) {
      // Verificar se uma obra específica está favoritada
      const favorite = await prisma.favoriteWork.findFirst({
        where: {
          userId: session.user.id,
          workId: workId,
        },
        include: {
          work: {
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        isFavorited: !!favorite,
        favorite: favorite
          ? {
              id: favorite.id,
              userId: favorite.userId,
              workId: favorite.workId,
              work: favorite.work,
            }
          : null,
      });
    }

    // Buscar todas as obras favoritas do usuário
    const favorites = await prisma.favoriteWork.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            opOrCatalog: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        work: {
          title: 'asc',
        },
      },
    });

    return NextResponse.json({
      favorites: favorites.map((fav) => ({
        id: fav.id,
        userId: fav.userId,
        workId: fav.workId,
        work: fav.work,
      })),
      count: favorites.length,
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos de obras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
