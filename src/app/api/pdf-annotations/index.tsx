// app/api/pdf-annotations/route.ts
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
    const page = searchParams.get('page');

    if (!workId || !scoreId) {
      return NextResponse.json(
        { error: 'workId e scoreId são obrigatórios' },
        { status: 400 }
      );
    }

    // Construir filtros
    const where: any = {
      userId: session.user.id,
      workId,
      scoreId,
    };

    if (page) {
      where.page = parseInt(page);
    }

    const annotations = await prisma.pdfAnnotation.findMany({
      where,
      orderBy: [{ page: 'asc' }, { y: 'asc' }, { x: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      annotations: annotations.map((annotation) => ({
        id: annotation.id,
        type: annotation.type,
        content: annotation.content,
        page: annotation.page,
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height,
        color: annotation.color,
        fontSize: annotation.fontSize,
        strokeWidth: annotation.strokeWidth,
        drawing: annotation.drawing,
        measure: annotation.measure,
        beat: annotation.beat,
        voice: annotation.voice,
        tags: annotation.tags,
        createdAt: annotation.createdAt.toISOString(),
        updatedAt: annotation.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar anotações PDF:', error);
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
      type,
      content,
      page,
      x,
      y,
      width,
      height,
      color,
      fontSize,
      strokeWidth,
      drawing,
      measure,
      beat,
      voice,
      tags = [],
    } = body;

    // Validações
    if (
      !workId ||
      !scoreId ||
      !type ||
      typeof page !== 'number' ||
      typeof x !== 'number' ||
      typeof y !== 'number'
    ) {
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

    // Criar anotação
    const annotation = await prisma.pdfAnnotation.create({
      data: {
        userId: session.user.id,
        workId,
        scoreId,
        type: type as any,
        content,
        page,
        x,
        y,
        width,
        height,
        color,
        fontSize,
        strokeWidth,
        drawing: drawing as any,
        measure,
        beat,
        voice,
        tags,
      },
    });

    return NextResponse.json({
      success: true,
      annotation: {
        id: annotation.id,
        type: annotation.type,
        content: annotation.content,
        page: annotation.page,
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height,
        color: annotation.color,
        fontSize: annotation.fontSize,
        strokeWidth: annotation.strokeWidth,
        drawing: annotation.drawing,
        measure: annotation.measure,
        beat: annotation.beat,
        voice: annotation.voice,
        tags: annotation.tags,
        createdAt: annotation.createdAt.toISOString(),
        updatedAt: annotation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao criar anotação PDF:', error);
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
        { error: 'ID da anotação é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a anotação pertence ao usuário
    const existingAnnotation = await prisma.pdfAnnotation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAnnotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar anotação
    const annotation = await prisma.pdfAnnotation.update({
      where: { id },
      data: {
        ...updateData,
        drawing: updateData.drawing as any,
      },
    });

    return NextResponse.json({
      success: true,
      annotation: {
        id: annotation.id,
        type: annotation.type,
        content: annotation.content,
        page: annotation.page,
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height,
        color: annotation.color,
        fontSize: annotation.fontSize,
        strokeWidth: annotation.strokeWidth,
        drawing: annotation.drawing,
        measure: annotation.measure,
        beat: annotation.beat,
        voice: annotation.voice,
        tags: annotation.tags,
        createdAt: annotation.createdAt.toISOString(),
        updatedAt: annotation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar anotação PDF:', error);
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
        { error: 'ID da anotação é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a anotação pertence ao usuário
    const existingAnnotation = await prisma.pdfAnnotation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAnnotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada' },
        { status: 404 }
      );
    }

    // Deletar anotação
    await prisma.pdfAnnotation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Anotação deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar anotação PDF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
