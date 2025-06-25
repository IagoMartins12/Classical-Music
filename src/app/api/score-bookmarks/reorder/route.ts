// app/api/score-bookmarks/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { bookmarkIds } = body; // Array com IDs na nova ordem

    if (!Array.isArray(bookmarkIds)) {
      return NextResponse.json(
        { error: 'bookmarkIds deve ser um array' },
        { status: 400 }
      );
    }

    // Verificar se todos os bookmarks pertencem ao usuário
    const bookmarks = await prisma.scoreBookmark.findMany({
      where: {
        id: { in: bookmarkIds },
        userId: session.user.id,
      },
    });

    if (bookmarks.length !== bookmarkIds.length) {
      return NextResponse.json(
        { error: 'Alguns bookmarks não foram encontrados' },
        { status: 404 }
      );
    }

    // Atualizar ordem
    const updatePromises = bookmarkIds.map((id, index) =>
      prisma.scoreBookmark.update({
        where: { id },
        data: { sortOrder: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Ordem dos bookmarks atualizada',
    });
  } catch (error) {
    console.error('Erro ao reordenar bookmarks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
