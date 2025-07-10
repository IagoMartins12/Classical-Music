// app/api/uploads/score/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logScoreDelete } from '@/app/utils/historyUtils';
import {
  cleanupScoreFiles,
  logCleanupResult,
} from '@/app/utils/fileCleanupUtils';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const score = await prisma.workScore.findUnique({
      where: { id },
      include: {
        work: {
          include: {
            composer: { select: { id: true, name: true, fullName: true } },
            epoch: { select: { name: true } },
            instrument: { select: { name: true } },
          },
        },
      },
    });

    if (!score) {
      return NextResponse.json(
        { error: 'Partitura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = score.uploadedBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error('Erro ao buscar partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Buscar partitura atual
    const currentScore = await prisma.workScore.findUnique({
      where: { id },
      include: {
        work: {
          include: {
            composer: { select: { name: true, fullName: true } },
          },
        },
      },
    });

    if (!currentScore) {
      return NextResponse.json(
        { error: 'Partitura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = currentScore.uploadedBy === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Validações básicas
    if (!body.title || !body.workId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Atualizar partitura
    const updatedScore = await prisma.workScore.update({
      where: { id },
      data: {
        ...body,
        lastEditedBy: userId,
        lastEditedAt: new Date(),
      },
      include: {
        work: {
          include: {
            composer: { select: { name: true, fullName: true } },
          },
        },
      },
    });

    // Invalidar cache
    await revalidateUploadsCache(userId);

    return NextResponse.json({
      message: 'Partitura atualizada com sucesso!',
      score: updatedScore,
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
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar partitura para verificar permissões e salvar dados para histórico
    const score = await prisma.workScore.findUnique({
      where: { id },
      include: {
        work: {
          include: {
            composer: { select: { name: true, fullName: true } },
            epoch: { select: { name: true } },
            instrument: { select: { name: true } },
          },
        },
      },
    });

    if (!score) {
      return NextResponse.json(
        { error: 'Partitura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = score.uploadedBy === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // 🆕 Limpar arquivos da partitura ANTES de excluir o registro
    let cleanupResult = {
      removedFiles: [] as string[],
      removedDirectories: [] as string[],
      errors: [] as string[],
      totalSize: 0,
    };

    try {
      console.log(`🧹 Limpando arquivos da partitura: ${score.title}`);
      console.log(`📄 Download URL: ${score.downloadUrl}`);
      console.log(`🖼️ Thumbnail URL: ${score.thumbnailUrl}`);

      cleanupResult = await cleanupScoreFiles(
        score.downloadUrl,
        score.thumbnailUrl
      );

      logCleanupResult(cleanupResult, `Partitura ${score.title}`);
    } catch (cleanupError) {
      console.error(
        '⚠️ Erro na limpeza de arquivos da partitura:',
        cleanupError
      );
      cleanupResult.errors.push(
        `Erro na limpeza da partitura: ${cleanupError}`
      );
    }

    // 🆕 Salvar dados para histórico antes de excluir
    const deletedData = {
      title: score.title,
      sourceId: score.sourceId,
      source: score.source,
      workTitle: score.work.title,
      composerName: score.work.composer.fullName || score.work.composer.name,
      epochName: score.work.epoch?.name,
      instrumentName: score.work.instrument?.name,
      fileSize: score.fileSize,
      pageCount: score.pageCount,
      fileFormat: score.fileFormat,
      downloadUrl: score.downloadUrl,
      thumbnailUrl: score.thumbnailUrl,
      type: score.type,
      editor: score.editor,
      publisher: score.publisher,
      copyright: score.copyright,
      isIMSLP: score.source === 'IMSLP',
      deletedBy: 'USER_INTERFACE',
      cleanupResult: {
        filesRemoved: cleanupResult.removedFiles.length,
        spaceCleaned: `${(cleanupResult.totalSize / 1024 / 1024).toFixed(2)}MB`,
        errors: cleanupResult.errors.length,
      },
    };

    // Excluir partitura
    await prisma.workScore.delete({
      where: { id },
    });

    // 🆕 Registrar exclusão no histórico
    try {
      await logScoreDelete(
        userId,
        id,
        deletedData,
        `Partitura excluída via interface. ${
          cleanupResult.removedFiles.length
        } arquivos removidos (${(cleanupResult.totalSize / 1024 / 1024).toFixed(
          2
        )}MB)`,
        request
      );
    } catch (logError) {
      console.warn(
        'Erro ao registrar exclusão de partitura no histórico:',
        logError
      );
    }

    // Invalidar cache
    await revalidateUploadsCache(userId);

    return NextResponse.json({
      message: `Partitura excluída com sucesso! ${cleanupResult.removedFiles.length} arquivos foram removidos.`,
      details: {
        scoreTitle: score.title,
        workTitle: score.work.title,
        composerName: score.work.composer.fullName || score.work.composer.name,
        sourceId: score.sourceId,
        source: score.source,
        cleanup: {
          filesRemoved: cleanupResult.removedFiles.length,
          spaceCleaned: `${(cleanupResult.totalSize / 1024 / 1024).toFixed(
            2
          )}MB`,
          errors: cleanupResult.errors.length,
          removedFiles: cleanupResult.removedFiles.map((file) =>
            file.replace(process.cwd(), '.')
          ),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao excluir partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
