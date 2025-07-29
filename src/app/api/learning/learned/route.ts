// app/api/learning/learned/route.ts - CORRIGIDO COM WORKSCORE
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      action,
      mastery = 0,
      // Campos adicionais existentes
      studyStartDate,
      studyDuration,
      notes,
      wouldRecommend,
      publicPerformance,
      difficulty,
      enjoyment,
      technicalChallenges,
      musicalInsights,
      // ✅ CAMPO CORRIGIDO COM WORKSCORE
      selectedWorkScoreId,
    } = body;

    if (!workId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Validar maestria (1-5)
    if (mastery < 0 || mastery > 5) {
      return NextResponse.json(
        { error: 'Maestria deve ser entre 1 e 5' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const workExists = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true },
    });

    if (!workExists) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // ✅ VALIDAR WORKSCORE SE FORNECIDO
    if (selectedWorkScoreId) {
      const workScoreExists = await prisma.workScore.findFirst({
        where: {
          id: selectedWorkScoreId,
          workId: workId, // Garantir que pertence à obra
          isActive: true,
        },
      });

      if (!workScoreExists) {
        return NextResponse.json(
          { error: 'Partitura não encontrada ou não pertence a esta obra' },
          { status: 400 }
        );
      }
    }

    if (action === 'add') {
      // Remover da lista de "quero estudar" se estiver lá (exclusão mútua)
      await prisma.wantToLearn.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // Preparar dados para salvar
      const dataToSave: any = {
        userId: session.user.id,
        workId: workId,
        mastery: mastery,
      };

      // Adicionar campos opcionais se fornecidos
      if (studyStartDate) dataToSave.studyStartDate = new Date(studyStartDate);
      if (studyDuration) dataToSave.studyDuration = studyDuration;
      if (notes) dataToSave.notes = notes;
      if (wouldRecommend !== undefined)
        dataToSave.wouldRecommend = wouldRecommend;
      if (publicPerformance !== undefined)
        dataToSave.publicPerformance = publicPerformance;
      if (difficulty) dataToSave.difficulty = difficulty;
      if (enjoyment) dataToSave.enjoyment = enjoyment;
      if (technicalChallenges)
        dataToSave.technicalChallenges = technicalChallenges;
      if (musicalInsights) dataToSave.musicalInsights = musicalInsights;

      // ✅ ADICIONAR WORKSCORE SE FORNECIDO
      if (selectedWorkScoreId)
        dataToSave.selectedWorkScoreId = selectedWorkScoreId;

      // Adicionar à lista de aprendidas (upsert para atualizar se já existir)
      const learnedItem = await prisma.learned.upsert({
        where: {
          userId_workId: {
            userId: session.user.id,
            workId: workId,
          },
        },
        update: {
          ...dataToSave,
          learnedAt: new Date(), // Atualizar data quando for re-marcado
        },
        create: dataToSave,
        include: {
          work: {
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
          // ✅ INCLUIR DADOS DO WORKSCORE
          selectedWorkScore: {
            select: {
              id: true,
              sourceId: true,
              source: true,
              title: true,
              downloadUrl: true,
              thumbnailUrl: true,
              fileSize: true,
              pageCount: true,
              fileFormat: true,
              type: true,
              editor: true,
              publisher: true,
              copyright: true,
              uploadDate: true,
              uploader: true,
              notes: true,
            },
          },
        },
      });

      // Invalidar caches relacionados
      revalidateTag(`user-learning-${session.user.id}`);
      revalidateTag(`work-learning-${workId}`);
      revalidateTag('user-learning');
      revalidateTag('learning-stats');

      return NextResponse.json({
        success: true,
        action: 'added',
        item: {
          id: learnedItem.id,
          userId: learnedItem.userId,
          workId: learnedItem.workId,
          mastery: learnedItem.mastery,
          learnedAt: learnedItem.learnedAt.toISOString(),
          studyStartDate: learnedItem.studyStartDate?.toISOString(),
          studyDuration: learnedItem.studyDuration,
          notes: learnedItem.notes,
          wouldRecommend: learnedItem.wouldRecommend,
          publicPerformance: learnedItem.publicPerformance,
          difficulty: learnedItem.difficulty,
          enjoyment: learnedItem.enjoyment,
          technicalChallenges: learnedItem.technicalChallenges,
          musicalInsights: learnedItem.musicalInsights,
          // ✅ INCLUIR WORKSCORE NA RESPOSTA
          selectedWorkScoreId: learnedItem.selectedWorkScoreId,
          selectedWorkScore: learnedItem.selectedWorkScore,
          work: learnedItem.work,
        },
      });
    } else if (action === 'remove') {
      // Remover da lista de aprendidas
      await prisma.learned.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // Invalidar caches relacionados
      revalidateTag(`user-learning-${session.user.id}`);
      revalidateTag(`work-learning-${workId}`);
      revalidateTag('user-learning');
      revalidateTag('learning-stats');

      return NextResponse.json({
        success: true,
        action: 'removed',
      });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de obras aprendidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      mastery,
      // Campos adicionais para atualização existentes
      studyStartDate,
      studyDuration,
      notes,
      wouldRecommend,
      publicPerformance,
      difficulty,
      enjoyment,
      technicalChallenges,
      musicalInsights,
      // ✅ CAMPO CORRIGIDO COM WORKSCORE
      selectedWorkScoreId,
    } = body;

    if (!workId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // ✅ VALIDAR WORKSCORE SE FORNECIDO
    if (selectedWorkScoreId) {
      const workScoreExists = await prisma.workScore.findFirst({
        where: {
          id: selectedWorkScoreId,
          workId: workId,
          isActive: true,
        },
      });

      if (!workScoreExists) {
        return NextResponse.json(
          { error: 'Partitura não encontrada ou não pertence a esta obra' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const dataToUpdate: any = {};

    if (mastery !== undefined) {
      if (mastery < 0 || mastery > 5) {
        return NextResponse.json(
          { error: 'Maestria deve ser entre 1 e 5' },
          { status: 400 }
        );
      }
      dataToUpdate.mastery = mastery;
      dataToUpdate.learnedAt = new Date(); // Atualizar timestamp quando maestria muda
    }

    // Adicionar campos opcionais se fornecidos
    if (studyStartDate !== undefined)
      dataToUpdate.studyStartDate = studyStartDate
        ? new Date(studyStartDate)
        : null;
    if (studyDuration !== undefined) dataToUpdate.studyDuration = studyDuration;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (wouldRecommend !== undefined)
      dataToUpdate.wouldRecommend = wouldRecommend;
    if (publicPerformance !== undefined)
      dataToUpdate.publicPerformance = publicPerformance;
    if (difficulty !== undefined) dataToUpdate.difficulty = difficulty;
    if (enjoyment !== undefined) dataToUpdate.enjoyment = enjoyment;
    if (technicalChallenges !== undefined)
      dataToUpdate.technicalChallenges = technicalChallenges;
    if (musicalInsights !== undefined)
      dataToUpdate.musicalInsights = musicalInsights;

    // ✅ ATUALIZAR WORKSCORE SE FORNECIDO
    if (selectedWorkScoreId !== undefined)
      dataToUpdate.selectedWorkScoreId = selectedWorkScoreId;

    // Atualizar maestria
    const updated = await prisma.learned.updateMany({
      where: {
        userId: session.user.id,
        workId: workId,
      },
      data: dataToUpdate,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Item não encontrado na lista de aprendidas' },
        { status: 404 }
      );
    }

    // Buscar item atualizado
    const updatedItem = await prisma.learned.findFirst({
      where: {
        userId: session.user.id,
        workId: workId,
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            opOrCatalog: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
        // ✅ INCLUIR DADOS DO WORKSCORE
        selectedWorkScore: {
          select: {
            id: true,
            sourceId: true,
            source: true,
            title: true,
            downloadUrl: true,
            thumbnailUrl: true,
            fileSize: true,
            pageCount: true,
            fileFormat: true,
            type: true,
            editor: true,
            publisher: true,
            copyright: true,
            uploadDate: true,
            uploader: true,
            notes: true,
          },
        },
      },
    });

    // Invalidar caches
    revalidateTag(`user-learning-${session.user.id}`);
    revalidateTag('user-learning');
    revalidateTag('learning-stats');

    return NextResponse.json({
      success: true,
      item: updatedItem
        ? {
            id: updatedItem.id,
            userId: updatedItem.userId,
            workId: updatedItem.workId,
            mastery: updatedItem.mastery,
            learnedAt: updatedItem.learnedAt.toISOString(),
            studyStartDate: updatedItem.studyStartDate?.toISOString(),
            studyDuration: updatedItem.studyDuration,
            notes: updatedItem.notes,
            wouldRecommend: updatedItem.wouldRecommend,
            publicPerformance: updatedItem.publicPerformance,
            difficulty: updatedItem.difficulty,
            enjoyment: updatedItem.enjoyment,
            technicalChallenges: updatedItem.technicalChallenges,
            musicalInsights: updatedItem.musicalInsights,
            // ✅ INCLUIR WORKSCORE NA RESPOSTA
            selectedWorkScoreId: updatedItem.selectedWorkScoreId,
            selectedWorkScore: updatedItem.selectedWorkScore,
            work: updatedItem.work,
          }
        : null,
    });
  } catch (error) {
    console.error('Erro ao atualizar item aprendido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');

    if (workId) {
      // Verificar se uma obra específica está na lista de aprendidas
      const learnedItem = await prisma.learned.findFirst({
        where: {
          userId: session.user.id,
          workId: workId,
        },
        include: {
          work: {
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
          // ✅ INCLUIR DADOS DO WORKSCORE
          selectedWorkScore: {
            select: {
              id: true,
              sourceId: true,
              source: true,
              title: true,
              downloadUrl: true,
              thumbnailUrl: true,
              fileSize: true,
              pageCount: true,
              fileFormat: true,
              type: true,
              editor: true,
              publisher: true,
              copyright: true,
              uploadDate: true,
              uploader: true,
              notes: true,
            },
          },
        },
      });

      return NextResponse.json({
        learned: !!learnedItem,
        item: learnedItem
          ? {
              id: learnedItem.id,
              userId: learnedItem.userId,
              workId: learnedItem.workId,
              mastery: learnedItem.mastery,
              learnedAt: learnedItem.learnedAt.toISOString(),
              studyStartDate: learnedItem.studyStartDate?.toISOString(),
              studyDuration: learnedItem.studyDuration,
              notes: learnedItem.notes,
              wouldRecommend: learnedItem.wouldRecommend,
              publicPerformance: learnedItem.publicPerformance,
              difficulty: learnedItem.difficulty,
              enjoyment: learnedItem.enjoyment,
              technicalChallenges: learnedItem.technicalChallenges,
              musicalInsights: learnedItem.musicalInsights,
              // ✅ INCLUIR WORKSCORE NA RESPOSTA
              selectedWorkScoreId: learnedItem.selectedWorkScoreId,
              selectedWorkScore: learnedItem.selectedWorkScore,
              work: learnedItem.work,
            }
          : null,
      });
    }

    // Buscar todos os itens aprendidos do usuário
    const learnedItems = await prisma.learned.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            opOrCatalog: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
        // ✅ INCLUIR DADOS DO WORKSCORE
        selectedWorkScore: {
          select: {
            id: true,
            sourceId: true,
            source: true,
            title: true,
            downloadUrl: true,
            thumbnailUrl: true,
            fileSize: true,
            pageCount: true,
            fileFormat: true,
            type: true,
            editor: true,
            publisher: true,
            copyright: true,
            uploadDate: true,
            uploader: true,
            notes: true,
          },
        },
      },
      orderBy: [{ mastery: 'desc' }, { learnedAt: 'desc' }],
    });

    return NextResponse.json({
      items: learnedItems.map((item) => ({
        id: item.id,
        userId: item.userId,
        workId: item.workId,
        mastery: item.mastery,
        learnedAt: item.learnedAt.toISOString(),
        studyStartDate: item.studyStartDate?.toISOString(),
        studyDuration: item.studyDuration,
        notes: item.notes,
        wouldRecommend: item.wouldRecommend,
        publicPerformance: item.publicPerformance,
        difficulty: item.difficulty,
        enjoyment: item.enjoyment,
        technicalChallenges: item.technicalChallenges,
        musicalInsights: item.musicalInsights,
        // ✅ INCLUIR WORKSCORE NA RESPOSTA
        selectedWorkScoreId: item.selectedWorkScoreId,
        selectedWorkScore: item.selectedWorkScore,
        work: item.work,
      })),
      count: learnedItems.length,
    });
  } catch (error) {
    console.error('Erro ao buscar obras aprendidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
