// app/api/learning/want-to-learn/route.ts
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
      priority = 0,
      // Campos adicionais
      notes,
      targetDate,
      estimatedStudyTime,
      difficulty,
      motivation,
      context,
    } = body;

    if (!workId || !action) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Validar prioridade (1-5)
    if (priority < 0 || priority > 5) {
      return NextResponse.json(
        { error: 'Prioridade deve ser entre 1 e 5' },
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

    if (action === 'add') {
      // Remover da lista de "já aprendi" se estiver lá (exclusão mútua)
      await prisma.learned.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

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
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
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
    console.error('Erro na API de quero estudar:', error);
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
      // Campos adicionais para atualização
      notes,
      targetDate,
      estimatedStudyTime,
      difficulty,
      motivation,
      context,
    } = body;

    if (!workId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
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

    // Adicionar campos opcionais se fornecidos
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (targetDate !== undefined)
      dataToUpdate.targetDate = targetDate ? new Date(targetDate) : null;
    if (estimatedStudyTime !== undefined)
      dataToUpdate.estimatedStudyTime = estimatedStudyTime;
    if (difficulty !== undefined) dataToUpdate.difficulty = difficulty;
    if (motivation !== undefined) dataToUpdate.motivation = motivation;
    if (context !== undefined) dataToUpdate.context = context;

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
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Invalidar caches
    revalidateTag(`user-learning-${session.user.id}`);
    revalidateTag('user-learning');

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
            work: updatedItem.work,
          }
        : null,
    });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
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
      // Verificar se uma obra específica está na lista de desejos
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
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
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
              work: wantToLearnItem.work,
            }
          : null,
      });
    }

    // Buscar todos os itens da lista de desejos do usuário
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
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
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
        work: item.work,
      })),
      count: wantToLearnItems.length,
    });
  } catch (error) {
    console.error('Erro ao buscar lista de desejos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
