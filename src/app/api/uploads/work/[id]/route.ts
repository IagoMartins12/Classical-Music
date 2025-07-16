// app/api/uploads/work/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import {
  logWorkUpdate,
  logWorkDelete,
  logScoreDelete,
} from '@/app/utils/historyUtils';
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

    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        composer: { select: { id: true, name: true, fullName: true } },
        epoch: { select: { id: true, name: true } },
        instrument: { select: { id: true, name: true } },
        cachedScores: {
          select: {
            id: true,
            title: true,
            source: true,
            fileFormat: true,
            pageCount: true,
            fileSize: true,
          },
        },
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

    if (!isAdmin && !isOwner && !work.isCustom) {
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

    // Buscar obra atual
    const currentWork = await prisma.work.findUnique({
      where: { id },
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    if (!currentWork) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = currentWork.createdBy === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Validações básicas
    if (
      !body.title ||
      !body.composerId ||
      !body.instrumentId ||
      !body.epochId
    ) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Verificar se já existe obra com mesmo imslpId (exceto a atual)
    if (body.imslpId && body.imslpId !== currentWork.imslpId) {
      const existingWork = await prisma.work.findFirst({
        where: {
          imslpId: body.imslpId,
          id: { not: id },
        },
      });

      if (existingWork) {
        return NextResponse.json(
          {
            error: 'Já existe uma obra com este ID do IMSLP',
            existingWork: {
              id: existingWork.id,
              title: existingWork.title,
            },
          },
          { status: 400 }
        );
      }
    }

    // 🆕 Salvar dados antigos para comparação
    const oldData = {
      title: currentWork.title,
      subtitle: currentWork.subtitle,
      composerId: currentWork.composerId,
      instrumentId: currentWork.instrumentId,
      epochId: currentWork.epochId,
      videoUrl: currentWork.videoUrl,
      imslpId: currentWork.imslpId,
      imslpPermlink: currentWork.imslpPermlink,
      opOrCatalog: currentWork.opOrCatalog,
      compositionYear: currentWork.compositionYear,
      firstPublishDate: currentWork.firstPublishDate,
      tone: currentWork.tone,
      mediaDuration: currentWork.mediaDuration,
      workStyle: currentWork.workStyle,
      moviment: currentWork.moviment,
      categoryNames: currentWork.categoryNames,
      workGenresArr: currentWork.workGenresArr,
      dedicateTo: currentWork.dedicateTo,
      dedicationComposerLink: currentWork.dedicationComposerLink,
      instrumentation: currentWork.instrumentation,
      workType: currentWork.workType,
      isPartOfCollection: currentWork.isPartOfCollection,
      parentWorkId: currentWork.parentWorkId,
      movementNumber: currentWork.movementNumber,
      timeSignature: currentWork.timeSignature,
      tempoMarking: currentWork.tempoMarking,
      movementsDetailed: currentWork.movementsDetailed,
      imslpTags: currentWork.imslpTags,
      difficultyLevel: currentWork.difficultyLevel,
    };

    // Atualizar obra
    const updatedWork = await prisma.work.update({
      where: { id },
      data: {
        ...body,
        lastEditedBy: userId,
        lastEditedAt: new Date(),
        // Converter arrays de string para formato correto
        categoryNames: Array.isArray(body.categoryNames)
          ? body.categoryNames
          : [],
        workGenresArr: Array.isArray(body.workGenresArr)
          ? body.workGenresArr
          : [],
        imslpTags: Array.isArray(body.imslpTags) ? body.imslpTags : [],
        // Converter números
        movementNumber: body.movementNumber
          ? parseInt(body.movementNumber)
          : null,
        // Converter JSON
        movementsDetailed: body.movementsDetailed
          ? typeof body.movementsDetailed === 'string'
            ? JSON.parse(body.movementsDetailed)
            : body.movementsDetailed
          : null,
      },
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    // 🆕 Registrar alterações no histórico
    await logWorkUpdate(
      userId,
      id,
      oldData,
      {
        title: updatedWork.title,
        subtitle: updatedWork.subtitle,
        composerId: updatedWork.composerId,
        instrumentId: updatedWork.instrumentId,
        epochId: updatedWork.epochId,
        videoUrl: updatedWork.videoUrl,
        imslpId: updatedWork.imslpId,
        imslpPermlink: updatedWork.imslpPermlink,
        opOrCatalog: updatedWork.opOrCatalog,
        compositionYear: updatedWork.compositionYear,
        firstPublishDate: updatedWork.firstPublishDate,
        tone: updatedWork.tone,
        mediaDuration: updatedWork.mediaDuration,
        workStyle: updatedWork.workStyle,
        moviment: updatedWork.moviment,
        categoryNames: updatedWork.categoryNames,
        workGenresArr: updatedWork.workGenresArr,
        dedicateTo: updatedWork.dedicateTo,
        dedicationComposerLink: updatedWork.dedicationComposerLink,
        instrumentation: updatedWork.instrumentation,
        workType: updatedWork.workType,
        isPartOfCollection: updatedWork.isPartOfCollection,
        parentWorkId: updatedWork.parentWorkId,
        movementNumber: updatedWork.movementNumber,
        timeSignature: updatedWork.timeSignature,
        tempoMarking: updatedWork.tempoMarking,
        movementsDetailed: updatedWork.movementsDetailed,
        imslpTags: updatedWork.imslpTags,
        difficultyLevel: updatedWork.difficultyLevel,
      },
      'Obra atualizada via formulário',
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);

    return NextResponse.json({
      message: 'Obra atualizada com sucesso!',
      work: updatedWork,
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
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar obra com todas as partituras e obras filhas para exclusão em cascata
    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
        cachedScores: {
          select: {
            id: true,
            title: true,
            sourceId: true,
            downloadUrl: true,
            thumbnailUrl: true,
            fileSize: true,
            pageCount: true,
            source: true,
          },
        },
        childWorks: {
          select: {
            id: true,
            title: true,
            cachedScores: {
              select: {
                id: true,
                title: true,
                sourceId: true,
                downloadUrl: true,
                thumbnailUrl: true,
              },
            },
          },
        },
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
    const isOwner = work.createdBy === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Contadores para relatório
    let deletedScoresCount = 0;
    let deletedChildWorksCount = 0;
    const totalCleanupResult = {
      removedFiles: [] as string[],
      removedDirectories: [] as string[],
      errors: [] as string[],
      totalSize: 0,
    };

    // 🆕 EXCLUSÃO EM CASCATA COM LIMPEZA DE ARQUIVOS
    await prisma.$transaction(async (tx) => {
      // 1. Primeiro, excluir partituras das obras filhas E seus arquivos
      for (const childWork of work.childWorks) {
        if (childWork.cachedScores.length > 0) {
          // Registrar e limpar arquivos de cada partitura da obra filha
          for (const score of childWork.cachedScores) {
            try {
              // 🆕 Limpar arquivos da partitura
              const scoreCleanup = await cleanupScoreFiles(
                score.downloadUrl,
                score.thumbnailUrl
              );

              // Acumular resultados da limpeza
              totalCleanupResult.removedFiles.push(
                ...scoreCleanup.removedFiles
              );
              totalCleanupResult.removedDirectories.push(
                ...scoreCleanup.removedDirectories
              );
              totalCleanupResult.errors.push(...scoreCleanup.errors);
              totalCleanupResult.totalSize += scoreCleanup.totalSize;

              await logScoreDelete(
                userId,
                score.id,
                {
                  title: score.title,
                  sourceId: score.sourceId,
                  workTitle: childWork.title,
                  composerName: work.composer.fullName || work.composer.name,
                  deletedBy: 'CASCADE_WORK_DELETE',
                },
                `Partitura excluída automaticamente devido à exclusão da obra principal "${work.title}"`,
                request
              );
            } catch (logError) {
              console.warn(
                'Erro ao registrar exclusão de partitura da obra filha no histórico:',
                logError
              );
            }
          }

          // Excluir partituras da obra filha
          await tx.workScore.deleteMany({
            where: { workId: childWork.id },
          });

          deletedScoresCount += childWork.cachedScores.length;
        }

        // Registrar obra filha no histórico antes de excluir
        try {
          await logWorkDelete(
            userId,
            childWork.id,
            {
              title: childWork.title,
              composerName: work.composer.fullName || work.composer.name,
              epochName: work.epoch?.name,
              instrumentName: work.instrument?.name,
              parentWorkTitle: work.title,
              scoresCount: childWork.cachedScores.length,
              deletedBy: 'CASCADE_WORK_DELETE',
            },
            `Obra filha excluída automaticamente devido à exclusão da obra principal "${work.title}"`,
            request
          );
        } catch (logError) {
          console.warn(
            'Erro ao registrar exclusão de obra filha no histórico:',
            logError
          );
        }

        deletedChildWorksCount++;
      }

      // 2. Excluir todas as obras filhas
      if (work.childWorks.length > 0) {
        await tx.work.deleteMany({
          where: { parentWorkId: id },
        });
      }

      // 3. Excluir partituras da obra principal E seus arquivos
      if (work.cachedScores.length > 0) {
        // Registrar e limpar arquivos de cada partitura
        for (const score of work.cachedScores) {
          try {
            // 🆕 Limpar arquivos da partitura
            const scoreCleanup = await cleanupScoreFiles(
              score.downloadUrl,
              score.thumbnailUrl
            );

            // Acumular resultados da limpeza
            totalCleanupResult.removedFiles.push(...scoreCleanup.removedFiles);
            totalCleanupResult.removedDirectories.push(
              ...scoreCleanup.removedDirectories
            );
            totalCleanupResult.errors.push(...scoreCleanup.errors);
            totalCleanupResult.totalSize += scoreCleanup.totalSize;

            await logScoreDelete(
              userId,
              score.id,
              {
                title: score.title,
                sourceId: score.sourceId,
                workTitle: work.title,
                composerName: work.composer.fullName || work.composer.name,
                fileSize: score.fileSize,
                pageCount: score.pageCount,
                source: score.source,
                deletedBy: 'CASCADE_WORK_DELETE',
              },
              `Partitura excluída automaticamente devido à exclusão da obra "${work.title}"`,
              request
            );
          } catch (logError) {
            console.warn(
              'Erro ao registrar exclusão de partitura no histórico:',
              logError
            );
          }
        }

        // Excluir partituras da obra principal
        await tx.workScore.deleteMany({
          where: { workId: id },
        });

        deletedScoresCount += work.cachedScores.length;
      }

      // 4. Finalmente, excluir a obra principal
      await tx.work.delete({
        where: { id },
      });
    });

    // 🆕 Salvar dados para histórico da obra principal
    const deletedData = {
      title: work.title,
      composerName: work.composer.fullName || work.composer.name,
      epochName: work.epoch.name,
      instrumentName: work.instrument.name,
      opOrCatalog: work.opOrCatalog,
      compositionYear: work.compositionYear,
      workStyle: work.workStyle,
      workType: work.workType,
      scoresCount: work.cachedScores.length,
      childWorksCount: work.childWorks.length,
      categoryNames: work.categoryNames,
      workGenresArr: work.workGenresArr,
      isIMSLP: !!work.imslpId,
      cascadeDelete: true,
      totalDeletedScores: deletedScoresCount,
      totalDeletedChildWorks: deletedChildWorksCount,
      cleanupResult: {
        filesRemoved: totalCleanupResult.removedFiles.length,
        directoriesRemoved: totalCleanupResult.removedDirectories.length,
        spaceCleaned: `${(totalCleanupResult.totalSize / 1024 / 1024).toFixed(
          2
        )}MB`,
        errors: totalCleanupResult.errors.length,
      },
    };

    // 🆕 Registrar exclusão da obra no histórico
    try {
      await logWorkDelete(
        userId,
        id,
        deletedData,
        `Obra excluída via interface com exclusão em cascata: ${deletedChildWorksCount} obras filhas, ${deletedScoresCount} partituras e ${totalCleanupResult.removedFiles.length} arquivos removidos`,
        request
      );
    } catch (logError) {
      console.warn(
        'Erro ao registrar exclusão de obra no histórico:',
        logError
      );
    }

    // Invalidar cache
    await revalidateUploadsCache(userId);

    // 🆕 Log final da limpeza total
    console.log(`📊 Limpeza total da exclusão da obra ${work.title}:`);
    logCleanupResult(totalCleanupResult, 'Exclusão completa da obra');

    return NextResponse.json({
      message: `Obra excluída com sucesso! ${deletedChildWorksCount} obras filhas, ${deletedScoresCount} partituras e ${totalCleanupResult.removedFiles.length} arquivos foram removidos automaticamente.`,
      details: {
        workTitle: work.title,
        deletedScores: work.cachedScores.length,
        deletedChildWorks: deletedChildWorksCount,
        totalDeletedScores: deletedScoresCount,
        cleanup: {
          filesRemoved: totalCleanupResult.removedFiles.length,
          directoriesRemoved: totalCleanupResult.removedDirectories.length,
          spaceCleaned: `${(totalCleanupResult.totalSize / 1024 / 1024).toFixed(
            2
          )}MB`,
          errors: totalCleanupResult.errors.length,
        },
        childWorks: work.childWorks.map((cw) => ({
          title: cw.title,
          scoresCount: cw.cachedScores.length,
        })),
        scores: work.cachedScores.map((s) => ({
          title: s.title,
          sourceId: s.sourceId,
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao excluir obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
