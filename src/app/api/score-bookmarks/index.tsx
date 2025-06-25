// app/api/score-bookmarks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const scoreId = searchParams.get('scoreId');

    if (!workId || !scoreId) {
      return NextResponse.json(
        { error: 'workId e scoreId são obrigatórios' },
        { status: 400 }
      );
    }

    const bookmarks = await prisma.scoreBookmark.findMany({
      where: {
        userId: session.user.id,
        workId,
        scoreId,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      bookmarks: bookmarks.map((bookmark) => ({
        id: bookmark.id,
        title: bookmark.title,
        description: bookmark.description,
        color: bookmark.color,
        page: bookmark.page,
        measure: bookmark.measure,
        system: bookmark.system,
        x: bookmark.x,
        y: bookmark.y,
        sortOrder: bookmark.sortOrder,
        createdAt: bookmark.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar bookmarks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      scoreId,
      title,
      description,
      color = '#3B82F6',
      page,
      measure,
      system,
      x,
      y,
    } = body;

    // Validações
    if (!workId || !scoreId || !title || typeof page !== 'number') {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Buscar próximo sortOrder
    const lastBookmark = await prisma.scoreBookmark.findFirst({
      where: { userId: session.user.id, workId, scoreId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = (lastBookmark?.sortOrder || 0) + 1;

    // Criar bookmark
    const bookmark = await prisma.scoreBookmark.create({
      data: {
        userId: session.user.id,
        workId,
        scoreId,
        title: title.trim(),
        description: description?.trim(),
        color,
        page,
        measure,
        system,
        x,
        y,
        sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      bookmark: {
        id: bookmark.id,
        title: bookmark.title,
        description: bookmark.description,
        color: bookmark.color,
        page: bookmark.page,
        measure: bookmark.measure,
        system: bookmark.system,
        x: bookmark.x,
        y: bookmark.y,
        sortOrder: bookmark.sortOrder,
        createdAt: bookmark.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao criar bookmark:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do bookmark é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o bookmark pertence ao usuário
    const existingBookmark = await prisma.scoreBookmark.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { error: 'Bookmark não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar bookmark
    const bookmark = await prisma.scoreBookmark.update({
      where: { id },
      data: {
        ...updateData,
        title: updateData.title?.trim(),
        description: updateData.description?.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      bookmark: {
        id: bookmark.id,
        title: bookmark.title,
        description: bookmark.description,
        color: bookmark.color,
        page: bookmark.page,
        measure: bookmark.measure,
        system: bookmark.system,
        x: bookmark.x,
        y: bookmark.y,
        sortOrder: bookmark.sortOrder,
        createdAt: bookmark.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar bookmark:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do bookmark é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o bookmark pertence ao usuário
    const existingBookmark = await prisma.scoreBookmark.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { error: 'Bookmark não encontrado' },
        { status: 404 }
      );
    }

    // Deletar bookmark
    await prisma.scoreBookmark.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Bookmark deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar bookmark:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
