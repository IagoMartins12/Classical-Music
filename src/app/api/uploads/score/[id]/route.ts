// app/api/uploads/score/[id]/route.ts - VERSÃO ATUALIZADA COM DELEÇÃO DE ARQUIVOS
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { deleteMultipleFiles } from '@/app/utils/fileUtils'; // 🆕 Import da função de deleção

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

    // 🆕 Buscar partitura existente COM arquivos associados
    const existingScore = await prisma.workScore.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        uploadedBy: true,
        downloadUrl: true, // 🆕 URL do arquivo principal
        thumbnailUrl: true, // 🆕 URL do thumbnail
      },
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

    console.log(`🗑️ [DELETE-SCORE] Iniciando deleção da partitura:`, {
      id: existingScore.id,
      title: existingScore.title,
      downloadUrl: existingScore.downloadUrl,
      thumbnailUrl: existingScore.thumbnailUrl,
      user: session.user.name || session.user.email,
    });

    // 🆕 1. Deletar arquivos físicos ANTES de deletar do banco
    try {
      const filesToDelete = [
        existingScore.downloadUrl,
        existingScore.thumbnailUrl,
      ];

      console.log('🗂️ Arquivos para deletar:', filesToDelete.filter(Boolean));

      await deleteMultipleFiles(filesToDelete);

      console.log('✅ Arquivos físicos deletados com sucesso');
    } catch (fileError) {
      console.error('⚠️ Erro ao deletar arquivos físicos:', fileError);
      // Continuar com a deleção do banco mesmo se houver erro nos arquivos
      // Os arquivos órfãos podem ser limpos posteriormente
    }

    // 🆕 2. Deletar partitura do banco de dados
    await prisma.workScore.delete({
      where: { id: id },
    });

    console.log('✅ Partitura deletada do banco de dados');

    // 🆕 3. Invalidar cache
    await revalidateUploadsCache(session.user.id);

    console.log(
      `✅ [DELETE-SCORE] Partitura "${existingScore.title}" deletada completamente`
    );

    return NextResponse.json({
      success: true,
      message: 'Partitura e arquivos associados excluídos com sucesso',
      deletedFiles: {
        scoreFile: existingScore.downloadUrl,
        thumbnail: existingScore.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error('❌ [DELETE-SCORE] Erro ao excluir partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
