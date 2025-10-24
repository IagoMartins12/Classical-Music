// app/api/favorites/works/route.ts - COM ACTIVITY TRACKING
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import {
  trackActivity,
  getRequestInfo,
  ActivityActions,
} from '@/app/libs/activityTracker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId, action } = await request.json();
    const requestInfo = getRequestInfo(request);

    if (!workId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar obra para tracking
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        opOrCatalog: true,
        composer: { select: { name: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      const favorite = await prisma.favoriteWork.upsert({
        where: {
          userId_workId: {
            userId: session.user.id,
            workId: workId,
          },
        },
        update: {},
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

      // 🆕 TRACKING
      trackActivity({
        userId: session.user.id,
        type: 'FAVORITE_WORK',
        action: ActivityActions.FAVORITE_WORK,
        entityType: 'work',
        entityId: workId,
        entityName: work.title,
        metadata: {
          composerName: work.composer.name,
          opOrCatalog: work.opOrCatalog,
        },
        ...requestInfo,
      });

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
      await prisma.favoriteWork.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // 🆕 TRACKING
      trackActivity({
        userId: session.user.id,
        type: 'UNFAVORITE_WORK',
        action: ActivityActions.UNFAVORITE_WORK,
        entityType: 'work',
        entityId: workId,
        entityName: work.title,
        metadata: {
          composerName: work.composer.name,
          opOrCatalog: work.opOrCatalog,
        },
        ...requestInfo,
      });

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
