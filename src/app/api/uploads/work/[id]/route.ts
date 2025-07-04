// app/api/uploads/work/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const work = await prisma.work.findUnique({
      where: { id: params.id },
      include: {
        composer: { select: { name: true, fullName: true } },
        instrument: { select: { name: true } },
        epoch: { select: { name: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = work.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({ work });
  } catch (error) {
    console.error('Erro ao buscar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Buscar obra existente
    const existingWork = await prisma.work.findUnique({
      where: { id: params.id },
    });

    if (!existingWork) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingWork.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Atualizar obra
    const updatedWork = await prisma.work.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        composer: { select: { name: true, fullName: true } },
        instrument: { select: { name: true } },
        epoch: { select: { name: true } },
      },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      work: updatedWork,
      message: 'Obra atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar obra existente
    const existingWork = await prisma.work.findUnique({
      where: { id: params.id },
      include: {
        cachedScores: { select: { id: true } },
        annotations: { select: { id: true } },
        favoriteBy: { select: { id: true } },
        wantToLearners: { select: { id: true } },
        learners: { select: { id: true } },
      },
    });

    if (!existingWork) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingWork.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Verificar se tem dados associados
    const hasAssociatedData =
      existingWork.cachedScores.length > 0 ||
      existingWork.annotations.length > 0 ||
      existingWork.favoriteBy.length > 0 ||
      existingWork.wantToLearners.length > 0 ||
      existingWork.learners.length > 0;

    if (hasAssociatedData && !isAdmin) {
      return NextResponse.json(
        {
          error:
            'Não é possível excluir obra com dados associados. Contate um administrador.',
        },
        { status: 400 }
      );
    }

    // Deletar obra (cascade irá deletar dados relacionados)
    await prisma.work.delete({
      where: { id: params.id },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Obra excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
