// app/api/uploads/composer/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { calculateDataCompleteness } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const composer = await prisma.composer.findUnique({
      where: { id: params.id },
      include: {
        epoch: { select: { name: true } },
        primaryRole: { select: { name: true } },
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões (se não for admin, só pode ver seus próprios)
    const isAdmin = session.user.role === 2;
    const isOwner = composer.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({ composer });
  } catch (error) {
    console.error('Erro ao buscar compositor:', error);
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

    // Buscar compositor existente
    const existingComposer = await prisma.composer.findUnique({
      where: { id: params.id },
    });

    if (!existingComposer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingComposer.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Atualizar compositor
    const updatedComposer = await prisma.composer.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
        dataCompleteness: calculateDataCompleteness(body),
        hasValidImage: !!body.portraitUrl,
      },
      include: {
        epoch: { select: { name: true } },
        primaryRole: { select: { name: true } },
      },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      composer: updatedComposer,
      message: 'Compositor atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar compositor:', error);
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

    // Buscar compositor existente
    const existingComposer = await prisma.composer.findUnique({
      where: { id: params.id },
      include: {
        works: { select: { id: true } },
      },
    });

    if (!existingComposer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingComposer.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Verificar se tem obras associadas
    if (existingComposer.works.length > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir compositor com obras associadas',
        },
        { status: 400 }
      );
    }

    // Deletar compositor
    await prisma.composer.delete({
      where: { id: params.id },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Compositor excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
