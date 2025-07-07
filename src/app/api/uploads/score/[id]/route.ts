// app/api/uploads/score/[id]/route.ts - ATUALIZADO
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateUploadsCache } from '@/app/requests/upload';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;

    const body = await request.json();
    const {
      workId,
      title,
      downloadUrl,
      fileSize,
      pageCount,
      fileFormat,
      editor,
      publisher,
      copyright,
      thumbnailUrl,
      notes,
      type,
      groupIndex,
      groupTitle,
      rating,
      ratingsCount,
      downloadCount,
      isCustom,
      customData,
    } = body;

    // Buscar partitura existente
    const existingScore = await prisma.workScore.findUnique({
      where: { id: id },
    });

    if (!existingScore) {
      return NextResponse.json(
        { error: 'Partitura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingScore.uploadedBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Validação básica
    if (!workId || !title || !downloadUrl) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios: obra, título e URL do arquivo',
        },
        { status: 400 }
      );
    }

    // Verificar se a obra existe (se mudou)
    if (workId !== existingScore.workId) {
      const work = await prisma.work.findUnique({
        where: { id: workId },
      });

      if (!work) {
        return NextResponse.json(
          {
            error: 'Obra não encontrada',
          },
          { status: 400 }
        );
      }
    }

    // Atualizar partitura (mantendo dados automáticos originais)
    const score = await prisma.workScore.update({
      where: { id: id },
      data: {
        workId,
        title,
        downloadUrl,
        fileSize: fileSize || existingScore.fileSize,
        pageCount: pageCount || existingScore.pageCount,
        fileFormat: fileFormat || existingScore.fileFormat,
        editor: editor || null,
        publisher: publisher || null,
        copyright: copyright || null,
        thumbnailUrl: thumbnailUrl || null,
        notes: notes || null,
        type: type || existingScore.type,
        groupIndex: groupIndex || existingScore.groupIndex,
        groupTitle: groupTitle || null,
        rating: rating || null,
        ratingsCount: ratingsCount || null,
        downloadCount: downloadCount || null,
        isCustom: isCustom !== undefined ? isCustom : existingScore.isCustom,
        customData,
        // Manter dados automáticos originais
        uploadDate: existingScore.uploadDate,
        uploader: existingScore.uploader,
        uploadedBy: existingScore.uploadedBy,
        // Atualizar dados de edição
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
        // Atualizar qualidade se necessário
        dataQuality: fileSize && pageCount ? 'high' : 'medium',
      },
      include: {
        work: {
          select: {
            title: true,
            composer: { select: { name: true, fullName: true } },
          },
        },
      },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      score,
      message: 'Partitura atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;

    // Buscar partitura existente
    const existingScore = await prisma.workScore.findUnique({
      where: { id: id },
    });

    if (!existingScore) {
      return NextResponse.json(
        { error: 'Partitura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingScore.uploadedBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Deletar partitura
    await prisma.workScore.delete({
      where: { id: id },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Partitura excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
