// app/api/uploads/score/[id]/route.ts - DELEÇÃO COMPLETA ATUALIZADA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logScoreDelete } from '@/app/utils/historyUtils';
import {
  cleanupScoreFiles,
  cleanupScoreWorkDirectory,
  logCleanupResult,
  extractWorkTitleFromScoreUrl,
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

    // 🔍 DEBUG: Vamos ver exatamente o que está chegando
    console.log('🔍 BODY RECEBIDO:', JSON.stringify(body, null, 2));
    console.log('🔍 CAMPOS DO BODY:', Object.keys(body));
    console.log('🔍 workId no body:', body.workId);

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
    if (!body.title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    // 🔧 SEPARAR campos válidos do WorkScore (baseado no schema atual)
    const allowedFields = [
      'title',
      'downloadUrl',
      'fileSize',
      'pageCount',
      'fileFormat',
      'editor',
      'publisher',
      'copyright',
      'thumbnailUrl',
      'uploadDate',
      'uploader',
      'notes',
      'type',
      'groupIndex',
      'groupTitle',
      'rating',
      'ratingsCount',
      'downloadCount',
      'isCustom',
      'dataQuality',
      'verificationStatus',
      'customData',
      'isActive',
      'isVerified',
      'qualityScore',
      // REMOVIDOS: tempThumbnailPath, tempPdfPath, hasTemporaryFiles (não existem no schema)
    ];

    // Filtrar apenas campos permitidos
    const updateData: any = {};
    allowedFields.forEach((field) => {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field];
      }
    });

    console.log(
      '🔍 DADOS FILTRADOS PARA UPDATE:',
      JSON.stringify(updateData, null, 2)
    );

    // Atualizar partitura
    const updatedScore = await prisma.workScore.update({
      where: { id },
      data: {
        ...updateData,
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

    // 🆕 LIMPEZA MELHORADA - Pasta completa da obra
    let cleanupResult = {
      removedFiles: [] as string[],
      removedDirectories: [] as string[],
      errors: [] as string[],
      totalSize: 0,
      workDirectory: null as string | null,
      cleanupMethod: 'none' as 'work_directory' | 'individual_files' | 'none',
    };

    try {
      console.log(`🧹 Iniciando limpeza completa da partitura: ${score.title}`);
      console.log(`📄 Download URL: ${score.downloadUrl}`);
      console.log(`🖼️ Thumbnail URL: ${score.thumbnailUrl}`);

      // 🆕 Extrair título da obra da URL
      const workTitle = extractWorkTitleFromScoreUrl(score.downloadUrl);

      if (workTitle) {
        console.log(`📁 Título da obra identificado: ${workTitle}`);

        // Tentar remover pasta completa da obra
        const workDirResult = await cleanupScoreWorkDirectory(
          score.downloadUrl,
          score.thumbnailUrl
        );

        if (workDirResult.removedDirectories.length > 0) {
          // Pasta completa foi removida
          cleanupResult = {
            ...workDirResult,
            workDirectory: workTitle,
            cleanupMethod: 'work_directory',
          };

          console.log(`✅ Pasta completa da obra removida: ${workTitle}`);
        } else {
          // Fallback: remover arquivos individuais
          const individualResult = await cleanupScoreFiles(
            score.downloadUrl,
            score.thumbnailUrl
          );

          cleanupResult = {
            ...individualResult,
            workDirectory: workTitle,
            cleanupMethod: 'individual_files',
          };

          console.log(
            `⚠️ Pasta completa não removida, arquivos individuais removidos`
          );
        }
      } else {
        // Não conseguiu identificar estrutura, remover arquivos individuais
        const individualResult = await cleanupScoreFiles(
          score.downloadUrl,
          score.thumbnailUrl
        );

        cleanupResult = {
          ...individualResult,
          workDirectory: null,
          cleanupMethod: 'individual_files',
        };

        console.log(
          `⚠️ Estrutura de obra não identificada, removendo arquivos individuais`
        );
      }

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

    // 🆕 Salvar dados expandidos para histórico
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

      // 🆕 Dados expandidos de limpeza
      cleanupResult: {
        method: cleanupResult.cleanupMethod,
        workDirectory: cleanupResult.workDirectory,
        filesRemoved: cleanupResult.removedFiles.length,
        directoriesRemoved: cleanupResult.removedDirectories.length,
        spaceCleaned: `${(cleanupResult.totalSize / 1024 / 1024).toFixed(2)}MB`,
        errors: cleanupResult.errors.length,
        success: cleanupResult.errors.length === 0,
      },

      // Metadados da estrutura de arquivos
      fileStructure: {
        hadWorkDirectory: !!cleanupResult.workDirectory,
        workDirectoryName: cleanupResult.workDirectory,
        cleanupMethod: cleanupResult.cleanupMethod,
        isNewStructure: score.downloadUrl?.includes('/scores/final/') || false,
        isOldStructure: score.downloadUrl?.includes('/score/') || false,
      },
    };

    // Excluir partitura do banco
    await prisma.workScore.delete({
      where: { id },
    });

    // 🆕 Registrar exclusão no histórico com dados expandidos
    try {
      const historyDescription =
        cleanupResult.cleanupMethod === 'work_directory'
          ? `Partitura excluída via interface. Pasta completa da obra removida: ${
              cleanupResult.workDirectory
            } (${cleanupResult.removedFiles.length} arquivos, ${(
              cleanupResult.totalSize /
              1024 /
              1024
            ).toFixed(2)}MB)`
          : `Partitura excluída via interface. ${
              cleanupResult.removedFiles.length
            } arquivos removidos (${(
              cleanupResult.totalSize /
              1024 /
              1024
            ).toFixed(2)}MB)`;

      await logScoreDelete(
        userId,
        id,
        deletedData,
        historyDescription,
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

    // 🆕 Resposta expandida com detalhes da limpeza
    const successMessage =
      cleanupResult.cleanupMethod === 'work_directory'
        ? `Partitura e pasta da obra "${cleanupResult.workDirectory}" excluídas com sucesso!`
        : `Partitura excluída com sucesso! ${cleanupResult.removedFiles.length} arquivos foram removidos.`;

    return NextResponse.json({
      message: successMessage,
      details: {
        scoreTitle: score.title,
        workTitle: score.work.title,
        composerName: score.work.composer.fullName || score.work.composer.name,
        sourceId: score.sourceId,
        source: score.source,

        // 🆕 Detalhes expandidos da limpeza
        cleanup: {
          method: cleanupResult.cleanupMethod,
          workDirectory: cleanupResult.workDirectory,
          filesRemoved: cleanupResult.removedFiles.length,
          directoriesRemoved: cleanupResult.removedDirectories.length,
          spaceCleaned: `${(cleanupResult.totalSize / 1024 / 1024).toFixed(
            2
          )}MB`,
          errors: cleanupResult.errors.length,
          success: cleanupResult.errors.length === 0,

          // Lista de arquivos removidos (para debug/auditoria)
          removedFiles: cleanupResult.removedFiles.map((file) =>
            file.replace(process.cwd(), '.')
          ),
          removedDirectories: cleanupResult.removedDirectories.map((dir) =>
            dir.replace(process.cwd(), '.')
          ),

          // Mensagens de erro se houver
          errorMessages: cleanupResult.errors,
        },

        // 🆕 Informações sobre a estrutura de arquivos
        fileStructure: {
          hadWorkDirectory: !!cleanupResult.workDirectory,
          workDirectoryName: cleanupResult.workDirectory,
          wasNewStructure:
            score.downloadUrl?.includes('/scores/final/') || false,
          wasOldStructure: score.downloadUrl?.includes('/score/') || false,
          originalDownloadUrl: score.downloadUrl,
          originalThumbnailUrl: score.thumbnailUrl,
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao excluir partitura:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
