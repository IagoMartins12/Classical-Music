// app/api/school-activities/route.ts - API para atividades escolares

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// GET - Listar atividades escolares
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action') || 'all';
    const entityType = searchParams.get('entityType') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const recent = searchParams.get('recent') === 'true'; // Para atividades recentes (7 dias)

    // Determinar tipo de usuário
    const userType = session.user.role === 1 ? 'teacher' : 'student';
    const offset = (page - 1) * limit;

    console.log(
      `📚 [SCHOOL-ACTIVITIES] Listando atividades - User: ${session.user.id}, Type: ${userType}, Recent: ${recent}`
    );

    // Construir filtros WHERE
    const where: any = {
      userId: session.user.id,
      userType,
    };

    // Filtro de ação
    if (action !== 'all') {
      where.action = action;
    }

    // Filtro de tipo de entidade
    if (entityType !== 'all') {
      where.entityType = entityType;
    }

    // Filtro de data
    if (recent) {
      // Últimos 7 dias para atividades recentes
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.createdAt = {
        gte: sevenDaysAgo,
      };
    } else if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Buscar atividades com contagem
    const [activities, totalCount] = await Promise.all([
      prisma.schoolActivity.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: recent ? 0 : offset, // Para atividades recentes, não paginar
        take: recent ? 5 : limit, // Para atividades recentes, apenas 5
      }),
      prisma.schoolActivity.count({ where }),
    ]);

    // Enriquecer dados com informações das entidades
    const enrichedActivities = await enrichActivitiesWithEntityDetails(
      activities
    );

    // Buscar estatísticas resumidas
    const stats = await getActivitiesStats(session.user.id, userType);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      activities: enrichedActivities,
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
        action,
        entityType,
        dateFrom,
        dateTo,
        recent,
        userType,
      },
    });
  } catch (error) {
    console.error('❌ [SCHOOL-ACTIVITIES] Erro ao buscar atividades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para enriquecer atividades com detalhes das entidades
async function enrichActivitiesWithEntityDetails(activities: any[]) {
  const enrichedItems = await Promise.all(
    activities.map(async (activity) => {
      let entityDetails = null;
      let entityExists = false;
      let entityDisplayName = activity.entityName || 'Item não encontrado';

      try {
        switch (activity.entityType) {
          case 'lesson':
            if (activity.entityId) {
              entityDetails = await prisma.lesson.findUnique({
                where: { id: activity.entityId },
                select: {
                  id: true,
                  title: true,
                  scheduledAt: true,
                  status: true,
                  duration: true,
                  student: {
                    include: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                  teacher: {
                    include: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              });

              if (entityDetails) {
                entityExists = true;
                const studentName = `${
                  entityDetails.student.user.firstName || ''
                } ${entityDetails.student.user.lastName || ''}`.trim();
                const teacherName = `${
                  entityDetails.teacher.user.firstName || ''
                } ${entityDetails.teacher.user.lastName || ''}`.trim();

                entityDisplayName =
                  activity.userType === 'teacher'
                    ? `${entityDetails.title} (${studentName})`
                    : `${entityDetails.title} (Prof. ${teacherName})`;
              }
            }
            break;

          case 'assignment':
            if (activity.entityId) {
              entityDetails = await prisma.assignment.findUnique({
                where: { id: activity.entityId },
                select: {
                  id: true,
                  title: true,
                  status: true,
                  dueDate: true,
                  student: {
                    include: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                  lesson: {
                    include: {
                      teacher: {
                        include: {
                          user: {
                            select: {
                              firstName: true,
                              lastName: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              });

              if (entityDetails) {
                entityExists = true;
                const studentName = `${
                  entityDetails.student.user.firstName || ''
                } ${entityDetails.student.user.lastName || ''}`.trim();
                const teacherName = `${
                  entityDetails.lesson.teacher.user.firstName || ''
                } ${entityDetails.lesson.teacher.user.lastName || ''}`.trim();

                entityDisplayName =
                  activity.userType === 'teacher'
                    ? `${entityDetails.title} (${studentName})`
                    : `${entityDetails.title} (Prof. ${teacherName})`;
              }
            }
            break;

          case 'student':
            if (activity.entityId) {
              entityDetails = await prisma.user.findUnique({
                where: { id: activity.entityId },
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              });

              if (entityDetails) {
                entityExists = true;
                entityDisplayName =
                  `${entityDetails.firstName || ''} ${
                    entityDetails.lastName || ''
                  }`.trim() ||
                  entityDetails.email ||
                  'Aluno';
              }
            }
            break;

          case 'profile':
          case 'user':
            // Para alterações de perfil, não há entidade específica
            entityExists = true;
            entityDisplayName =
              activity.userType === 'teacher'
                ? 'Perfil do Professor'
                : 'Perfil do Aluno';
            break;
        }
      } catch (error) {
        console.warn(
          `Erro ao buscar detalhes da entidade ${activity.entityType} ${activity.entityId}:`,
          error
        );
      }

      return {
        ...activity,
        entityDetails,
        entityDisplayName,
        entityExists,
        // Adicionar informações de tempo relativo
        timeAgo: getTimeAgo(activity.createdAt),
        // Adicionar resumo das mudanças
        changesSummary: getChangesSummary(activity.changes),
      };
    })
  );

  return enrichedItems;
}

// Função para obter estatísticas das atividades
async function getActivitiesStats(userId: string, userType: string) {
  try {
    const [
      totalActivities,
      actionBreakdown,
      entityTypeBreakdown,
      recentActivity,
    ] = await Promise.all([
      // Total de atividades
      prisma.schoolActivity.count({
        where: { userId, userType },
      }),

      // Breakdown por ação
      prisma.schoolActivity.groupBy({
        by: ['action'],
        where: { userId, userType },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),

      // Breakdown por tipo de entidade
      prisma.schoolActivity.groupBy({
        by: ['entityType'],
        where: { userId, userType },
        _count: { entityType: true },
      }),

      // Atividade nas últimas 24 horas
      prisma.schoolActivity.count({
        where: {
          userId,
          userType,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalActivities,
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
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      totalActivities: 0,
      recentActivity: 0,
      breakdown: { byAction: {}, byEntityType: {} },
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
function getChangesSummary(changes: any): string {
  if (!changes || typeof changes !== 'object') {
    return '';
  }

  const changedFields = Object.keys(changes);
  if (changedFields.length === 0) return '';

  if (changedFields.length === 1) return `${changedFields[0]} alterado`;
  return `${changedFields.length} campos alterados`;
}

// Endpoint para exportar atividades (para admins/professores)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { format = 'json', filters = {} } = body;
    const userType = session.user.role === 1 ? 'teacher' : 'student';

    // Construir where baseado nos filtros
    const where: any = {
      userId: session.user.id,
      userType,
    };

    if (filters.action && filters.action !== 'all') {
      where.action = filters.action;
    }

    if (filters.entityType && filters.entityType !== 'all') {
      where.entityType = filters.entityType;
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

    // Buscar todas as atividades (com limite para evitar sobrecarga)
    const activities = await prisma.schoolActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000, // Limite máximo
    });

    if (format === 'csv') {
      const csv = generateCSV(activities);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition':
            'attachment; filename="school-activities-export.csv"',
        },
      });
    }

    return NextResponse.json({
      message: 'Atividades exportadas com sucesso',
      data: activities,
      count: activities.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao exportar atividades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar CSV
function generateCSV(activities: any[]): string {
  const headers = [
    'Data',
    'Ação',
    'Tipo de Entidade',
    'Nome da Entidade',
    'Título',
    'Descrição',
  ];

  const rows = activities.map((activity) => [
    new Date(activity.createdAt).toLocaleString('pt-BR'),
    activity.action,
    activity.entityType,
    activity.entityName || '',
    activity.title,
    activity.description || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}
