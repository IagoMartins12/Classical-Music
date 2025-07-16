// app/api/uploads/composer/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import {
  logComposerUpdate,
  logComposerDelete,
  logWorkDelete,
  logScoreDelete,
} from '@/app/utils/historyUtils';
import {
  cleanupComposerFiles,
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

    const composer = await prisma.composer.findUnique({
      where: { id },
      include: {
        epoch: { select: { id: true, name: true } },
        primaryRole: { select: { id: true, name: true } },
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
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

    // Buscar compositor atual
    const currentComposer = await prisma.composer.findUnique({
      where: { id },
      include: {
        epoch: { select: { name: true } },
        primaryRole: { select: { name: true } },
      },
    });

    if (!currentComposer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = currentComposer.createdBy === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Validações básicas
    if (!body.name || !body.fullName || !body.epochId || !body.primaryRoleId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // 🆕 Salvar dados antigos para comparação
    const oldData = {
      name: currentComposer.name,
      fullName: currentComposer.fullName,
      otherName: currentComposer.otherName,
      alternativeNames: currentComposer.alternativeNames,
      pseudonyms: currentComposer.pseudonyms,
      birthDate: currentComposer.birthDate,
      deathDate: currentComposer.deathDate,
      portraitUrl: currentComposer.portraitUrl,
      epochId: currentComposer.epochId,
      bio: currentComposer.bio,
      diverseInfo: currentComposer.diverseInfo,
      externalLinks: currentComposer.externalLinks,
      imslpId: currentComposer.imslpId,
      wikipediaLink: currentComposer.wikipediaLink,
      nationality: currentComposer.nationality,
      instruments: currentComposer.instruments,
      primaryRoleId: currentComposer.primaryRoleId,
      roles: currentComposer.roles,
    };

    // Atualizar compositor
    const updatedComposer = await prisma.composer.update({
      where: { id },
      data: {
        ...body,
        lastEditedBy: userId,
        lastEditedAt: new Date(),
        hasValidImage: !!body.portraitUrl,
        dataCompleteness: calculateDataCompleteness(body),
      },
      include: {
        epoch: { select: { name: true } },
        primaryRole: { select: { name: true } },
      },
    });

    // 🆕 Registrar alterações no histórico
    await logComposerUpdate(
      userId,
      id,
      oldData,
      {
        name: updatedComposer.name,
        fullName: updatedComposer.fullName,
        otherName: updatedComposer.otherName,
        alternativeNames: updatedComposer.alternativeNames,
        pseudonyms: updatedComposer.pseudonyms,
        birthDate: updatedComposer.birthDate,
        deathDate: updatedComposer.deathDate,
        portraitUrl: updatedComposer.portraitUrl,
        epochId: updatedComposer.epochId,
        bio: updatedComposer.bio,
        diverseInfo: updatedComposer.diverseInfo,
        externalLinks: updatedComposer.externalLinks,
        imslpId: updatedComposer.imslpId,
        wikipediaLink: updatedComposer.wikipediaLink,
        nationality: updatedComposer.nationality,
        instruments: updatedComposer.instruments,
        primaryRoleId: updatedComposer.primaryRoleId,
        roles: updatedComposer.roles,
      },
      'Compositor atualizado via formulário',
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);

    return NextResponse.json({
      message: 'Compositor atualizado com sucesso!',
      composer: updatedComposer,
    });
  } catch (error) {
    console.error('Erro ao atualizar compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
// app/api/uploads/composer/[id]/route.ts - DELETE method (atualizado)
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

    // Buscar compositor com todas as obras e partituras para exclusão em cascata
    const composer = await prisma.composer.findUnique({
      where: { id },
      include: {
        epoch: { select: { name: true } },
        primaryRole: { select: { name: true } },
        works: {
          include: {
            cachedScores: {
              select: {
                id: true,
                title: true,
                sourceId: true,
                downloadUrl: true,
                thumbnailUrl: true,
              },
            },
            instrument: { select: { name: true } },
            epoch: { select: { name: true } },
          },
        },
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = composer.createdBy === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Contadores para relatório
    let deletedScoresCount = 0;
    let deletedWorksCount = 0;
    const totalCleanupResult = {
      removedFiles: [] as string[],
      removedDirectories: [] as string[],
      errors: [] as string[],
      totalSize: 0,
    };

    // 🆕 EXCLUSÃO EM CASCATA COM LIMPEZA DE ARQUIVOS
    await prisma.$transaction(async (tx) => {
      // 1. Primeiro, excluir todas as partituras de todas as obras E seus arquivos
      for (const work of composer.works) {
        if (work.cachedScores.length > 0) {
          // Registrar e limpar arquivos de cada partitura
          for (const score of work.cachedScores) {
            try {
              // 🆕 Limpar arquivos da partitura (PDF + thumbnail)
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
                  workTitle: work.title,
                  composerName: composer.fullName || composer.name,
                  deletedBy: 'CASCADE_COMPOSER_DELETE',
                },
                `Partitura excluída automaticamente devido à exclusão do compositor "${composer.name}"`,
                request
              );
            } catch (logError) {
              console.warn(
                'Erro ao registrar exclusão de partitura no histórico:',
                logError
              );
            }
          }

          // Excluir partituras da obra
          await tx.workScore.deleteMany({
            where: { workId: work.id },
          });

          deletedScoresCount += work.cachedScores.length;
        }

        // 2. Registrar obra no histórico antes de excluir
        try {
          await logWorkDelete(
            userId,
            work.id,
            {
              title: work.title,
              composerName: composer.fullName || composer.name,
              epochName: work.epoch?.name,
              instrumentName: work.instrument?.name,
              opOrCatalog: work.opOrCatalog,
              compositionYear: work.compositionYear,
              workStyle: work.workStyle,
              workType: work.workType,
              scoresCount: work.cachedScores.length,
              childWorksCount: 0,
              categoryNames: work.categoryNames,
              workGenresArr: work.workGenresArr,
              isIMSLP: !!work.imslpId,
              deletedBy: 'CASCADE_COMPOSER_DELETE',
            },
            `Obra excluída automaticamente devido à exclusão do compositor "${composer.name}"`,
            request
          );
        } catch (logError) {
          console.warn(
            'Erro ao registrar exclusão de obra no histórico:',
            logError
          );
        }

        deletedWorksCount++;
      }

      // 3. Excluir todas as obras do compositor
      if (composer.works.length > 0) {
        await tx.work.deleteMany({
          where: { composerId: id },
        });
      }

      // 4. 🆕 Limpar imagens do compositor ANTES de excluir o registro

      if (composer.portraitUrl) {
        try {
          const composerCleanup = await cleanupComposerFiles(
            composer.portraitUrl
          );

          // Acumular resultados da limpeza
          totalCleanupResult.removedFiles.push(...composerCleanup.removedFiles);
          totalCleanupResult.removedDirectories.push(
            ...composerCleanup.removedDirectories
          );
          totalCleanupResult.errors.push(...composerCleanup.errors);
          totalCleanupResult.totalSize += composerCleanup.totalSize;

          console.log(`🧹 Limpeza de arquivos do compositor ${composer.name}:`);
          logCleanupResult(composerCleanup, `Compositor ${composer.name}`);
        } catch (cleanupError) {
          console.error(
            '⚠️ Erro na limpeza de arquivos do compositor:',
            cleanupError
          );
          totalCleanupResult.errors.push(
            `Erro na limpeza do compositor: ${cleanupError}`
          );
        }
      }

      // 5. Finalmente, excluir o compositor
      await tx.composer.delete({
        where: { id },
      });
    });

    // 🆕 Salvar dados para histórico do compositor
    const deletedData = {
      name: composer.name,
      fullName: composer.fullName,
      epochName: composer.epoch.name,
      primaryRole: composer.primaryRole.name,
      nationality: composer.nationality,
      birthDate: composer.birthDate,
      deathDate: composer.deathDate,
      worksCount: composer.works.length,
      totalScoresCount: deletedScoresCount,
      cascadeDelete: true,
      cleanupResult: {
        filesRemoved: totalCleanupResult.removedFiles.length,
        directoriesRemoved: totalCleanupResult.removedDirectories.length,
        spaceCleaned: `${(totalCleanupResult.totalSize / 1024 / 1024).toFixed(
          2
        )}MB`,
        errors: totalCleanupResult.errors.length,
      },
    };

    // 🆕 Registrar exclusão do compositor no histórico
    try {
      await logComposerDelete(
        userId,
        id,
        deletedData,
        `Compositor excluído via interface com exclusão em cascata: ${deletedWorksCount} obras, ${deletedScoresCount} partituras e ${totalCleanupResult.removedFiles.length} arquivos removidos`,
        request
      );
    } catch (logError) {
      console.warn(
        'Erro ao registrar exclusão de compositor no histórico:',
        logError
      );
    }

    // Invalidar cache
    await revalidateUploadsCache(userId);

    // 🆕 Log final da limpeza total
    console.log(`📊 Limpeza total da exclusão do compositor ${composer.name}:`);
    logCleanupResult(totalCleanupResult, 'Exclusão completa do compositor');

    return NextResponse.json({
      message: `Compositor excluído com sucesso! ${deletedWorksCount} obras, ${deletedScoresCount} partituras e ${totalCleanupResult.removedFiles.length} arquivos foram removidos automaticamente.`,
      details: {
        composerName: composer.name,
        deletedWorks: deletedWorksCount,
        deletedScores: deletedScoresCount,
        cleanup: {
          filesRemoved: totalCleanupResult.removedFiles.length,
          directoriesRemoved: totalCleanupResult.removedDirectories.length,
          spaceCleaned: `${(totalCleanupResult.totalSize / 1024 / 1024).toFixed(
            2
          )}MB`,
          errors: totalCleanupResult.errors.length,
        },
        works: composer.works.map((w) => ({
          title: w.title,
          scoresCount: w.cachedScores.length,
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao excluir compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
// Função helper para calcular completude dos dados
function calculateDataCompleteness(data: any): number {
  const fields = [
    'name',
    'fullName',
    'birthDate',
    'deathDate',
    'portraitUrl',
    'bio',
    'nationality',
    'instruments',
  ];

  const filledFields = fields.filter(
    (field) => data[field] && data[field].toString().trim().length > 0
  ).length;

  return Math.round((filledFields / fields.length) * 100);
}
