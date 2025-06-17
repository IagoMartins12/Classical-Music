// app/api/favorites/composers/route.ts
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

    const { composerId, action } = await request.json();

    if (!composerId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verificar se o compositor existe
    const composerExists = await prisma.composer.findUnique({
      where: { id: composerId },
      select: { id: true },
    });

    if (!composerExists) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      // Adicionar aos favoritos (upsert para evitar duplicatas)
      const favorite = await prisma.favoriteComposer.upsert({
        where: {
          userId_composerId: {
            userId: session.user.id,
            composerId: composerId,
          },
        },
        update: {}, // Se já existe, não faz nada
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

      // Invalidar caches relacionados
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
      // Remover dos favoritos
      await prisma.favoriteComposer.deleteMany({
        where: {
          userId: session.user.id,
          composerId: composerId,
        },
      });

      // Invalidar caches relacionados
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
      // Verificar se um compositor específico está favoritado
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

    // Buscar todos os compositores favoritos do usuário
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
