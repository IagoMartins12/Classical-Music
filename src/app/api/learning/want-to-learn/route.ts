// app/api/learning/want-to-learn/route.ts - ATUALIZADO COM MILESTONES
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import {
  getMilestonesByInstrument,
  calculateProgress,
} from '@/app/utils/progressMilestones';

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
      priority = 0,
      // Campos adicionais existentes
      notes,
      targetDate,
      estimatedStudyTime,
      difficulty,
      motivation,
      context,
      selectedWorkScoreId,
      // 🆕 NOVO: Milestones de progresso
      progressMilestones,
    } = body;

    if (!workId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    if (priority < 0 || priority > 5) {
      return NextResponse.json(
        { error: 'Prioridade deve ser entre 1 e 5' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe e buscar instrumento
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        instrument: {
          select: {
            name: true,
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

    // Validar WorkScore se fornecido
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

    if (action === 'add') {
      // Remover da lista de "já aprendi" se estiver lá (exclusão mútua)
      await prisma.learned.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // 🆕 PROCESSAR MILESTONES E CALCULAR PROGRESSO
      let finalProgressMilestones = null;
      let calculatedProgress = 0;

      if (progressMilestones) {
        const instrumentMilestones = getMilestonesByInstrument(
          work.instrument?.name
        );
        calculatedProgress = calculateProgress(
          progressMilestones,
          instrumentMilestones
        );
        finalProgressMilestones = progressMilestones;
      }

      // Preparar dados para salvar
      const dataToSave: any = {
        userId: session.user.id,
        workId: workId,
        priority: priority,
      };

      // Adicionar campos opcionais se fornecidos
      if (notes) dataToSave.notes = notes;
      if (targetDate) dataToSave.targetDate = new Date(targetDate);
      if (estimatedStudyTime)
        dataToSave.estimatedStudyTime = estimatedStudyTime;
      if (difficulty) dataToSave.difficulty = difficulty;
      if (motivation) dataToSave.motivation = motivation;
      if (context) dataToSave.context = context;
      if (selectedWorkScoreId)
        dataToSave.selectedWorkScoreId = selectedWorkScoreId;

      // 🆕 ADICIONAR MILESTONES E PROGRESSO
      if (finalProgressMilestones)
        dataToSave.progressMilestones = finalProgressMilestones;
      if (calculatedProgress > 0) dataToSave.progress = calculatedProgress;

      // Adicionar à lista de desejos (upsert para atualizar se já existir)
      const wantToLearnItem = await prisma.wantToLearn.upsert({
        where: {
          userId_workId: {
            userId: session.user.id,
            workId: workId,
          },
        },
        update: dataToSave,
        create: dataToSave,
        include: {
          work: {
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              instrument: {
                select: {
                  name: true,
                },
              },
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
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

      // Revalidação de cache
      revalidateTag(`user-learning-${session.user.id}`);
      revalidateTag(`work-learning-${workId}`);
      revalidateTag('user-learning');
      revalidateTag('learning-stats');
      revalidateTag('student-profile-data');
      revalidateTag(`student-profile-${session.user.id}`);
      revalidateTag('student-dashboard-data');
      revalidateTag(`student-dashboard-${session.user.id}`);

      console.log(
        `✅ [WANT-TO-LEARN] Item criado com progresso ${calculatedProgress}% - User: ${session.user.id}, Work: ${workId}`
      );

      return NextResponse.json({
        success: true,
        action: 'added',
        item: {
          id: wantToLearnItem.id,
          userId: wantToLearnItem.userId,
          workId: wantToLearnItem.workId,
          priority: wantToLearnItem.priority,
          addedAt: wantToLearnItem.addedAt.toISOString(),
          notes: wantToLearnItem.notes,
          targetDate: wantToLearnItem.targetDate?.toISOString(),
          estimatedStudyTime: wantToLearnItem.estimatedStudyTime,
          difficulty: wantToLearnItem.difficulty,
          motivation: wantToLearnItem.motivation,
          context: wantToLearnItem.context,
          selectedWorkScoreId: wantToLearnItem.selectedWorkScoreId,
          selectedWorkScore: wantToLearnItem.selectedWorkScore,
          // 🆕 NOVOS CAMPOS
          progressMilestones: wantToLearnItem.progressMilestones,
          progress: wantToLearnItem.progress,
          work: wantToLearnItem.work,
        },
      });
    } else if (action === 'remove') {
      // Remover da lista de desejos
      await prisma.wantToLearn.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // Revalidação de cache
      revalidateTag(`user-learning-${session.user.id}`);
      revalidateTag(`work-learning-${workId}`);
      revalidateTag('user-learning');
      revalidateTag('learning-stats');
      revalidateTag('student-profile-data');
      revalidateTag(`student-profile-${session.user.id}`);
      revalidateTag('student-dashboard-data');
      revalidateTag(`student-dashboard-${session.user.id}`);

      console.log(
        `✅ [WANT-TO-LEARN] Item removido - User: ${session.user.id}, Work: ${workId}`
      );

      return NextResponse.json({
        success: true,
        action: 'removed',
      });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('❌ [WANT-TO-LEARN] Erro na API:', error);
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
      priority,
      notes,
      targetDate,
      estimatedStudyTime,
      difficulty,
      motivation,
      context,
      selectedWorkScoreId,
      // 🆕 NOVO: Milestones de progresso
      progressMilestones,
    } = body;

    if (!workId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar obra e instrumento para processar milestones
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        instrument: {
          select: {
            name: true,
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

    // Validar WorkScore se fornecido
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

    if (priority !== undefined) {
      if (priority < 0 || priority > 5) {
        return NextResponse.json(
          { error: 'Prioridade deve ser entre 1 e 5' },
          { status: 400 }
        );
      }
      dataToUpdate.priority = priority;
    }

    // Campos opcionais
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (targetDate !== undefined)
      dataToUpdate.targetDate = targetDate ? new Date(targetDate) : null;
    if (estimatedStudyTime !== undefined)
      dataToUpdate.estimatedStudyTime = estimatedStudyTime;
    if (difficulty !== undefined) dataToUpdate.difficulty = difficulty;
    if (motivation !== undefined) dataToUpdate.motivation = motivation;
    if (context !== undefined) dataToUpdate.context = context;
    if (selectedWorkScoreId !== undefined)
      dataToUpdate.selectedWorkScoreId = selectedWorkScoreId;

    // 🆕 PROCESSAR MILESTONES E RECALCULAR PROGRESSO
    if (progressMilestones !== undefined) {
      const instrumentMilestones = getMilestonesByInstrument(
        work.instrument?.name
      );
      const calculatedProgress = calculateProgress(
        progressMilestones,
        instrumentMilestones
      );

      dataToUpdate.progressMilestones = progressMilestones;
      dataToUpdate.progress = calculatedProgress;
    }

    // Atualizar item
    const updated = await prisma.wantToLearn.updateMany({
      where: {
        userId: session.user.id,
        workId: workId,
      },
      data: dataToUpdate,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Item não encontrado na lista de desejos' },
        { status: 404 }
      );
    }

    // Buscar item atualizado
    const updatedItem = await prisma.wantToLearn.findFirst({
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
            instrument: {
              select: {
                name: true,
              },
            },
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
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

    // Revalidar cache
    revalidateTag(`user-learning-${session.user.id}`);
    revalidateTag('user-learning');
    revalidateTag('learning-stats');
    revalidateTag('student-profile-data');
    revalidateTag(`student-profile-${session.user.id}`);
    revalidateTag('student-dashboard-data');
    revalidateTag(`student-dashboard-${session.user.id}`);

    return NextResponse.json({
      success: true,
      item: updatedItem
        ? {
            id: updatedItem.id,
            userId: updatedItem.userId,
            workId: updatedItem.workId,
            priority: updatedItem.priority,
            addedAt: updatedItem.addedAt.toISOString(),
            notes: updatedItem.notes,
            targetDate: updatedItem.targetDate?.toISOString(),
            estimatedStudyTime: updatedItem.estimatedStudyTime,
            difficulty: updatedItem.difficulty,
            motivation: updatedItem.motivation,
            context: updatedItem.context,
            selectedWorkScoreId: updatedItem.selectedWorkScoreId,
            selectedWorkScore: updatedItem.selectedWorkScore,
            // 🆕 NOVOS CAMPOS
            progressMilestones: updatedItem.progressMilestones,
            progress: updatedItem.progress,
            work: updatedItem.work,
          }
        : null,
    });
  } catch (error) {
    console.error('❌ [WANT-TO-LEARN] Erro ao atualizar item:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET method permanece igual, mas incluindo novos campos na resposta
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');

    if (workId) {
      const wantToLearnItem = await prisma.wantToLearn.findFirst({
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
              instrument: {
                select: {
                  name: true,
                },
              },
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
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
        wantToLearn: !!wantToLearnItem,
        item: wantToLearnItem
          ? {
              id: wantToLearnItem.id,
              userId: wantToLearnItem.userId,
              workId: wantToLearnItem.workId,
              priority: wantToLearnItem.priority,
              addedAt: wantToLearnItem.addedAt.toISOString(),
              notes: wantToLearnItem.notes,
              targetDate: wantToLearnItem.targetDate?.toISOString(),
              estimatedStudyTime: wantToLearnItem.estimatedStudyTime,
              difficulty: wantToLearnItem.difficulty,
              motivation: wantToLearnItem.motivation,
              context: wantToLearnItem.context,
              selectedWorkScoreId: wantToLearnItem.selectedWorkScoreId,
              selectedWorkScore: wantToLearnItem.selectedWorkScore,
              // 🆕 NOVOS CAMPOS
              progressMilestones: wantToLearnItem.progressMilestones,
              progress: wantToLearnItem.progress,
              work: wantToLearnItem.work,
            }
          : null,
      });
    }

    // Buscar todos os itens
    const wantToLearnItems = await prisma.wantToLearn.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            opOrCatalog: true,
            instrument: {
              select: {
                name: true,
              },
            },
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
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
      orderBy: [{ priority: 'desc' }, { addedAt: 'desc' }],
    });

    return NextResponse.json({
      items: wantToLearnItems.map((item) => ({
        id: item.id,
        userId: item.userId,
        workId: item.workId,
        priority: item.priority,
        addedAt: item.addedAt.toISOString(),
        notes: item.notes,
        targetDate: item.targetDate?.toISOString(),
        estimatedStudyTime: item.estimatedStudyTime,
        difficulty: item.difficulty,
        motivation: item.motivation,
        context: item.context,
        selectedWorkScoreId: item.selectedWorkScoreId,
        selectedWorkScore: item.selectedWorkScore,
        // 🆕 NOVOS CAMPOS
        progressMilestones: item.progressMilestones,
        progress: item.progress,
        work: item.work,
      })),
      count: wantToLearnItems.length,
    });
  } catch (error) {
    console.error('❌ [WANT-TO-LEARN] Erro ao buscar itens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
