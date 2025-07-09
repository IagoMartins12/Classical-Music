// app/api/uploads/history/route.ts
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all';
    const action = searchParams.get('action') || 'all';
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const ipAddress = searchParams.get('ipAddress');
    const entityId = searchParams.get('entityId');
    const reason = searchParams.get('reason');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const isAdmin = session.user.role === 2;

    // Verificar permissões
    if (userId && userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const targetUserId = userId || session.user.id;
    const offset = (page - 1) * limit;

    // Construir filtros WHERE
    const where: any = {};

    // Filtro de usuário
    if (!isAdmin) {
      where.userId = targetUserId;
    } else if (userId) {
      where.userId = userId;
    }

    // Filtro de tipo de entidade
    if (type !== 'all') {
      where.entityType = type;
    }

    // Filtro de ação
    if (action !== 'all') {
      where.action = action;
    }

    // Filtro de data
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Adicionar 23:59:59 ao final do dia
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Filtro de IP (apenas para admins)
    if (ipAddress && isAdmin) {
      where.ipAddress = { contains: ipAddress, mode: 'insensitive' };
    }

    // Filtro de ID da entidade
    if (entityId) {
      where.entityId = entityId;
    }

    // Filtro de motivo
    if (reason) {
      where.reason = { contains: reason, mode: 'insensitive' };
    }

    // Configurar ordenação
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Buscar histórico com contagem
    const [history, totalCount] = await Promise.all([
      prisma.uploadHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.uploadHistory.count({ where }),
    ]);

    // Enriquecer dados com informações das entidades
    const enrichedHistory = await enrichHistoryWithEntityDetails(history);

    // Buscar estatísticas resumidas
    const stats = await getHistoryStats(where, isAdmin);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      history: enrichedHistory,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats,
      filters: {
        type,
        action,
        userId: targetUserId,
        dateFrom,
        dateTo,
        ipAddress,
        entityId,
        reason,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para enriquecer histórico com detalhes das entidades
async function enrichHistoryWithEntityDetails(historyItems: any[]) {
  const enrichedItems = await Promise.all(
    historyItems.map(async (item) => {
      let entityDetails = null;
      let entityDisplayName = 'Item não encontrado';
      let entityExists = false;

      try {
        switch (item.entityType) {
          case 'composer':
            entityDetails = await prisma.composer.findUnique({
              where: { id: item.entityId },
              select: {
                id: true,
                name: true,
                fullName: true,
                portraitUrl: true,
                epoch: { select: { name: true } },
                nationality: true,
                birthDate: true,
                deathDate: true,
              },
            });

            if (entityDetails) {
              entityDisplayName = entityDetails.fullName || entityDetails.name;
              entityExists = true;
            }
            break;

          case 'work':
            entityDetails = await prisma.work.findUnique({
              where: { id: item.entityId },
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
                instrument: {
                  select: {
                    name: true,
                  },
                },
                epoch: {
                  select: {
                    name: true,
                  },
                },
              },
            });

            if (entityDetails) {
              const composerName =
                entityDetails.composer?.fullName ||
                entityDetails.composer?.name;
              entityDisplayName = `${entityDetails.title}${
                composerName ? ` - ${composerName}` : ''
              }`;
              entityExists = true;
            }
            break;

          case 'score':
            entityDetails = await prisma.workScore.findUnique({
              where: { id: item.entityId },
              select: {
                id: true,
                title: true,
                fileFormat: true,
                source: true,
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

            if (entityDetails) {
              const workTitle = entityDetails.work?.title;
              const composerName =
                entityDetails.work?.composer?.fullName ||
                entityDetails.work?.composer?.name;
              entityDisplayName = `${entityDetails.title}${
                workTitle ? ` (${workTitle})` : ''
              }${composerName ? ` - ${composerName}` : ''}`;
              entityExists = true;
            }
            break;
        }
      } catch (error) {
        console.warn(
          `Erro ao buscar detalhes da entidade ${item.entityType} ${item.entityId}:`,
          error
        );
      }

      return {
        ...item,
        entityDetails,
        entityDisplayName,
        entityExists,
        // Adicionar informações de tempo relativo
        timeAgo: getTimeAgo(item.createdAt),
        // Adicionar resumo das mudanças
        changesSummary: getChangesSummary(item.changes, item.action),
      };
    })
  );

  return enrichedItems;
}

// Função para obter estatísticas do histórico
async function getHistoryStats(where: any, isAdmin: boolean) {
  try {
    const [
      totalItems,
      actionBreakdown,
      entityTypeBreakdown,
      recentActivity,
      topUsers,
    ] = await Promise.all([
      // Total de itens
      prisma.uploadHistory.count({ where }),

      // Breakdown por ação
      prisma.uploadHistory.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),

      // Breakdown por tipo de entidade
      prisma.uploadHistory.groupBy({
        by: ['entityType'],
        where,
        _count: { entityType: true },
      }),

      // Atividade nas últimas 24 horas
      prisma.uploadHistory.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Top usuários (apenas para admins)
      isAdmin
        ? prisma.uploadHistory.groupBy({
            by: ['userId'],
            where,
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    return {
      totalItems,
      recentActivity,
      breakdown: {
        byAction: actionBreakdown.reduce((acc, item) => {
          acc[item.action] = item._count.action;
          return acc;
        }, {} as Record<string, number>),
        byEntityType: entityTypeBreakdown.reduce((acc, item) => {
          acc[item.entityType] = item._count.entityType;
          return acc;
        }, {} as Record<string, number>),
      },
      topUsers: isAdmin ? topUsers : [],
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      totalItems: 0,
      recentActivity: 0,
      breakdown: { byAction: {}, byEntityType: {} },
      topUsers: [],
    };
  }
}

// Função para calcular tempo relativo
function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'agora mesmo';
  if (diffMinutes < 60) return `${diffMinutes}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return then.toLocaleDateString('pt-BR');
}

// Função para resumir mudanças
function getChangesSummary(changes: any, action: string): string {
  if (!changes || typeof changes !== 'object') {
    return 'Nenhuma alteração registrada';
  }

  if (action === 'create') {
    const createdFields = changes.created
      ? Object.keys(changes.created).length
      : 0;
    return `Item criado com ${createdFields} campos`;
  }

  if (action === 'delete') {
    return 'Item excluído';
  }

  if (action === 'update') {
    const changedFields = Object.keys(changes).length;
    if (changedFields === 0) return 'Nenhuma alteração detectada';
    if (changedFields === 1) return '1 campo alterado';
    return `${changedFields} campos alterados`;
  }

  return 'Alteração registrada';
}

// Endpoint para exportar histórico (apenas para admins)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { format = 'json', filters = {} } = body;

    // Construir where baseado nos filtros
    const where: any = {};

    if (filters.type && filters.type !== 'all') {
      where.entityType = filters.type;
    }

    if (filters.action && filters.action !== 'all') {
      where.action = filters.action;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Buscar todos os registros (com limite para evitar sobrecarga)
    const history = await prisma.uploadHistory.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limite máximo
    });

    if (format === 'csv') {
      const csv = generateCSV(history);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="history-export.csv"',
        },
      });
    }

    return NextResponse.json({
      message: 'Histórico exportado com sucesso',
      data: history,
      count: history.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao exportar histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar CSV
function generateCSV(history: any[]): string {
  const headers = [
    'Data',
    'Usuário',
    'Tipo de Entidade',
    'ID da Entidade',
    'Ação',
    'Motivo',
    'IP',
    'User Agent',
  ];

  const rows = history.map((item) => [
    new Date(item.createdAt).toLocaleString('pt-BR'),
    item.user
      ? item.user.firstName || item.user.email
      : 'Usuário não encontrado',
    item.entityType,
    item.entityId,
    item.action,
    item.reason || '',
    item.ipAddress || '',
    item.userAgent || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}
