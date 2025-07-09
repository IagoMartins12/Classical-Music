// app/api/uploads/history/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const userId = searchParams.get('userId');
    const isAdmin = session.user.role === 2;

    // Verificar permissões
    if (userId && userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const targetUserId = userId || session.user.id;

    // Construir filtros
    const where = isAdmin && !userId ? {} : { userId: targetUserId };

    // Buscar histórico recente
    const recentHistory = await prisma.uploadHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 20), // Máximo de 20 itens
      select: {
        id: true,
        entityType: true,
        entityId: true,
        action: true,
        reason: true,
        createdAt: true,
        user: isAdmin
          ? {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            }
          : false,
      },
    });

    // Buscar informações adicionais sobre as entidades
    const enrichedHistory = await enrichHistoryWithEntityInfo(recentHistory);

    return NextResponse.json({
      history: enrichedHistory,
      count: recentHistory.length,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico recente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para enriquecer o histórico com informações das entidades
async function enrichHistoryWithEntityInfo(historyItems: any[]) {
  const enrichedItems = await Promise.all(
    historyItems.map(async (item) => {
      let entityInfo = null;

      try {
        switch (item.entityType) {
          case 'composer':
            entityInfo = await prisma.composer.findUnique({
              where: { id: item.entityId },
              select: {
                name: true,
                fullName: true,
                portraitUrl: true,
              },
            });
            break;

          case 'work':
            entityInfo = await prisma.work.findUnique({
              where: { id: item.entityId },
              select: {
                title: true,
                composer: {
                  select: {
                    name: true,
                    fullName: true,
                  },
                },
                instrument: {
                  select: {
                    name: true,
                  },
                },
              },
            });
            break;

          case 'score':
            entityInfo = await prisma.workScore.findUnique({
              where: { id: item.entityId },
              select: {
                title: true,
                fileFormat: true,
                work: {
                  select: {
                    title: true,
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
            break;
        }
      } catch (error) {
        console.warn(
          `Entidade ${item.entityType} ${item.entityId} não encontrada:`,
          error
        );
        // Entidade pode ter sido excluída, mantemos o registro histórico
      }

      return {
        ...item,
        entityInfo,
        entityDisplayName: getEntityDisplayName(item.entityType, entityInfo),
        entityStillExists: !!entityInfo,
      };
    })
  );

  return enrichedItems;
}

// Função para gerar nome de exibição da entidade
function getEntityDisplayName(entityType: string, entityInfo: any): string {
  if (!entityInfo) {
    return 'Item excluído';
  }

  switch (entityType) {
    case 'composer':
      return entityInfo.fullName || entityInfo.name || 'Compositor sem nome';

    case 'work':
      const composerName =
        entityInfo.composer?.fullName || entityInfo.composer?.name;
      return `${entityInfo.title}${composerName ? ` - ${composerName}` : ''}`;

    case 'score':
      const workTitle = entityInfo.work?.title;
      const scoreComposer =
        entityInfo.work?.composer?.fullName || entityInfo.work?.composer?.name;
      return `${entityInfo.title}${workTitle ? ` (${workTitle})` : ''}${
        scoreComposer ? ` - ${scoreComposer}` : ''
      }`;

    default:
      return 'Item desconhecido';
  }
}
