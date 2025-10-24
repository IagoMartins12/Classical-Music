// app/api/favorites/composers/route.ts - COM ACTIVITY TRACKING
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

    const { composerId, action } = await request.json();
    const requestInfo = getRequestInfo(request);

    if (!composerId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar compositor para tracking
    const composer = await prisma.composer.findUnique({
      where: { id: composerId },
      select: { id: true, name: true, fullName: true, epochName: true },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      const favorite = await prisma.favoriteComposer.upsert({
        where: {
          userId_composerId: {
            userId: session.user.id,
            composerId: composerId,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          composerId: composerId,
        },
        include: {
          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
              portraitUrl: true,
              epochName: true,
            },
          },
        },
      });

      // 🆕 TRACKING
      trackActivity({
        userId: session.user.id,
        type: 'FAVORITE_COMPOSER',
        action: ActivityActions.FAVORITE_COMPOSER,
        entityType: 'composer',
        entityId: composerId,
        entityName: composer.fullName || composer.name,
        metadata: {
          epochName: composer.epochName,
        },
        ...requestInfo,
      });

      revalidateTag(`user-favorites-${session.user.id}`);
      revalidateTag(`composer-favorites-${composerId}`);
      revalidateTag('user-favorites');

      return NextResponse.json({
        success: true,
        action: 'added',
        favorite: {
          id: favorite.id,
          userId: favorite.userId,
          composerId: favorite.composerId,
          composer: favorite.composer,
        },
      });
    } else if (action === 'remove') {
      await prisma.favoriteComposer.deleteMany({
        where: {
          userId: session.user.id,
          composerId: composerId,
        },
      });

      // 🆕 TRACKING
      trackActivity({
        userId: session.user.id,
        type: 'UNFAVORITE_COMPOSER',
        action: ActivityActions.UNFAVORITE_COMPOSER,
        entityType: 'composer',
        entityId: composerId,
        entityName: composer.fullName || composer.name,
        metadata: {
          epochName: composer.epochName,
        },
        ...requestInfo,
      });

      revalidateTag(`user-favorites-${session.user.id}`);
      revalidateTag(`composer-favorites-${composerId}`);
      revalidateTag('user-favorites');

      return NextResponse.json({
        success: true,
        action: 'removed',
      });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de favoritos de compositores:', error);
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
    const composerId = searchParams.get('composerId');

    if (composerId) {
      const favorite = await prisma.favoriteComposer.findFirst({
        where: {
          userId: session.user.id,
          composerId: composerId,
        },
        include: {
          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
              portraitUrl: true,
              epochName: true,
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
              composerId: favorite.composerId,
              composer: favorite.composer,
            }
          : null,
      });
    }

    const favorites = await prisma.favoriteComposer.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        composer: {
          select: {
            id: true,
            name: true,
            fullName: true,
            portraitUrl: true,
            epochName: true,
          },
        },
      },
      orderBy: {
        composer: {
          name: 'asc',
        },
      },
    });

    return NextResponse.json({
      favorites: favorites.map((fav) => ({
        id: fav.id,
        userId: fav.userId,
        composerId: fav.composerId,
        composer: fav.composer,
      })),
      count: favorites.length,
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos de compositores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
