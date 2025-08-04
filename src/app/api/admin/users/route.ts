// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

export interface UserListFilters {
  search?: string;
  userType?: string;
  experienceLevel?: string;
  sortBy?: 'name' | 'createdAt' | 'annotationsCount' | 'uploadsCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  isActive?: boolean;
  hasUploads?: boolean;
  hasAnnotations?: boolean;
  hasModerations?: boolean;
  role?: number;
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  userTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topContributors: Array<{
    id: string;
    name: string;
    email: string;
    totalUploads: number;
    uploadScore: number;
    annotationsCount: number;
  }>;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
  }>;
  engagementMetrics: {
    averageAnnotationsPerUser: number;
    averageUploadsPerUser: number;
  };
}

const exportUsersToCSV = async (filters: UserListFilters) => {
  try {
    const result = await getUsersList({ ...filters, limit: 10000 }); // Exportar até 10k usuários

    const csvHeaders = [
      'ID',
      'Nome',
      'Email',
      'Username',
      'Tipo de Usuário',
      'Nível de Experiência',
      'Role',
      'Tempo de Estudo (min)',
      'Anotações',
      'Uploads',
      'Score Upload',
      'Moderações Feitas', // ✅ NOVA COLUNA
      'Data de Cadastro',
      'Última Atividade',
      'Perfil Público',
      'Onboarding Completo',
    ];

    const csvRows = result.users.map((user) => [
      user.id,
      user.name || '',
      user.email || '',
      user.username || '',
      user.userType || '',
      user.experienceLevel || '',
      user.role?.toString() || '0',
      user.annotationsCount.toString(),
      user.uploadsCount.toString(),
      user.uploadScore.toString(),
      user.moderationsCount?.toString() || '0', // ✅ INCLUIR NO CSV
      user.createdAt.toISOString(),
      user.lastActive.toISOString(),
      user.isProfilePublic ? 'Sim' : 'Não',
      user.onboardingCompleted ? 'Sim' : 'Não',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row
          .map((field) => `"${field.toString().replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Erro ao exportar usuários:', error);
    throw new Error('Erro ao gerar exportação');
  }
};

// Cache das estatísticas de usuários por 5 minutos
const getCachedUserAnalytics = unstable_cache(
  async (): Promise<UserAnalytics> => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Buscar dados básicos em paralelo para performance
    const [
      totalUsers,
      activeUsersToday,
      activeUsersWeek,
      activeUsersMonth,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { updatedAt: { gte: today } },
      }),
      prisma.user.count({
        where: { updatedAt: { gte: thisWeek } },
      }),
      prisma.user.count({
        where: { updatedAt: { gte: thisMonth } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: thisWeek } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: thisMonth } },
      }),
    ]);

    // Tipos de usuários com tratamento de valores nulos
    const userTypeData = await prisma.user.groupBy({
      by: ['userType'],
      _count: { id: true },
    });

    const userTypes = userTypeData.map((item) => ({
      type: item.userType || 'CASUAL_USER',
      count: item._count.id,
      percentage: totalUsers > 0 ? (item._count.id / totalUsers) * 100 : 0,
    }));

    // Top contribuidores - apenas usuários com atividade real
    const topContributors = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalUploads: true,
        uploadScore: true,
        totalAnnotationsCount: true,
        role: true,
      },
      where: {
        OR: [{ totalUploads: { gt: 0 } }, { totalAnnotationsCount: { gt: 0 } }],
      },
      orderBy: [{ uploadScore: 'desc' }, { totalAnnotationsCount: 'desc' }],
      take: 10,
    });

    // Crescimento de usuários (últimos 14 dias para ter dados mais estáveis)
    const userGrowth = await Promise.all(
      Array.from({ length: 14 }, async (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const [newUsers, activeUsers, totalUsersUpToDate] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDay,
              },
            },
          }),
          prisma.user.count({
            where: {
              updatedAt: {
                gte: date,
                lt: nextDay,
              },
            },
          }),
          prisma.user.count({
            where: {
              createdAt: { lte: date },
            },
          }),
        ]);

        return {
          date: date.toISOString().split('T')[0],
          newUsers,
          activeUsers,
          totalUsers: totalUsersUpToDate,
        };
      })
    );

    // Métricas de engajamento reais
    const [avgAnnotationsPerUser, avgUploadsPerUser] = await Promise.all([
      prisma.user.aggregate({
        _avg: { totalAnnotationsCount: true },
      }),
      prisma.user.aggregate({
        _avg: { totalUploads: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers: {
        today: activeUsersToday,
        thisWeek: activeUsersWeek,
        thisMonth: activeUsersMonth,
      },
      newUsers: {
        today: newUsersToday,
        thisWeek: newUsersWeek,
        thisMonth: newUsersMonth,
      },
      userTypes,
      topContributors: topContributors.map((user) => ({
        id: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email ||
          'Usuário',
        email: user.email || '',
        totalUploads: user.totalUploads,
        uploadScore: user.uploadScore,
        annotationsCount: user.totalAnnotationsCount,
      })),
      userGrowth: userGrowth.reverse(),
      engagementMetrics: {
        averageAnnotationsPerUser:
          avgAnnotationsPerUser._avg.totalAnnotationsCount || 0,
        averageUploadsPerUser: avgUploadsPerUser._avg.totalUploads || 0,
      },
    };
  },
  ['admin-user-analytics'],
  { revalidate: 300 } // 5 minutos
);

// Buscar lista de usuários com filtros otimizada
const getUsersList = async (filters: UserListFilters) => {
  const {
    search,
    userType,
    experienceLevel,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
    isActive,
    hasUploads,
    hasAnnotations,
    hasModerations, // ✅ Filtro para usuários que fizeram reports
  } = filters;

  const skip = (page - 1) * limit;

  // Construir WHERE clause de forma mais eficiente
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      {
        firstName: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        lastName: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        username: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  if (userType && userType !== 'all') {
    whereClause.userType = userType;
  }

  if (experienceLevel && experienceLevel !== 'all') {
    whereClause.experienceLevel = experienceLevel;
  }

  if (isActive) {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    whereClause.updatedAt = { gte: lastWeek };
  }

  if (hasUploads) {
    whereClause.totalUploads = { gt: 0 };
  }

  if (hasAnnotations) {
    whereClause.totalAnnotationsCount = { gt: 0 };
  }

  if (hasModerations) {
    whereClause.reportedUploads = {
      some: {}, // Usuários que têm pelo menos um report feito
    };
  }

  // Buscar usuários e contagem total em paralelo
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        userType: true,
        experienceLevel: true,
        totalAnnotationsCount: true,
        totalUploads: true,
        uploadScore: true,
        createdAt: true,
        updatedAt: true,
        profilePublic: true,
        onboardingCompleted: true,
        role: true,
        _count: {
          select: {
            reportedUploads: true, // Contar quantos reports o usuário fez
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    users: users.map((user) => ({
      id: user.id,
      name:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email ||
        'Usuário',
      email: user.email,
      username: user.username,
      userType: user.userType,
      experienceLevel: user.experienceLevel,
      annotationsCount: user.totalAnnotationsCount,
      uploadsCount: user.totalUploads,
      uploadScore: user.uploadScore,
      createdAt: user.createdAt,
      lastActive: user.updatedAt,
      isProfilePublic: user.profilePublic,
      onboardingCompleted: user.onboardingCompleted,
      role: user.role,
      // ✅ ADICIONAR CONTAGEM DE MODERAÇÕES
      moderationsCount: user._count?.reportedUploads || 0,
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasMore: skip + users.length < totalCount,
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    if (action === 'analytics') {
      try {
        const analytics = await getCachedUserAnalytics();

        return NextResponse.json({
          success: true,
          analytics,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Erro ao buscar analytics:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Erro ao carregar analytics de usuários',
            analytics: null,
          },
          { status: 500 }
        );
      }
    }

    if (action === 'export') {
      try {
        const filters: UserListFilters = {
          search: searchParams.get('search') || undefined,
          userType: searchParams.get('userType') || undefined,
          experienceLevel: searchParams.get('experienceLevel') || undefined,
          sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
          sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
          isActive: searchParams.get('isActive') === 'true',
          hasUploads: searchParams.get('hasUploads') === 'true',
          hasAnnotations: searchParams.get('hasAnnotations') === 'true',
          hasModerations: searchParams.get('hasModerations') === 'true',
        };

        const csvContent = await exportUsersToCSV(filters);

        const headers = new Headers();
        headers.set('Content-Type', 'text/csv; charset=utf-8');
        headers.set(
          'Content-Disposition',
          `attachment; filename="usuarios-${
            new Date().toISOString().split('T')[0]
          }.csv"`
        );

        return new Response(csvContent, { headers });
      } catch (error) {
        console.error('Erro ao exportar usuários:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Erro ao exportar usuários',
          },
          { status: 500 }
        );
      }
    }

    if (action === 'list') {
      try {
        const filters: UserListFilters = {
          search: searchParams.get('search') || undefined,
          userType: searchParams.get('userType') || undefined,
          experienceLevel: searchParams.get('experienceLevel') || undefined,
          sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
          sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '50'),
          isActive: searchParams.get('isActive') === 'true',
          hasUploads: searchParams.get('hasUploads') === 'true',
          hasAnnotations: searchParams.get('hasAnnotations') === 'true',
          hasModerations: searchParams.get('hasModerations') === 'true',
        };

        const result = await getUsersList(filters);

        return NextResponse.json({
          success: true,
          ...result,
          filters,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Erro ao buscar lista de usuários:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Erro ao carregar lista de usuários',
            users: [],
            pagination: null,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de usuários do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar dados do usuário (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const body = await request.json();

    // Campos que o admin pode editar
    const allowedFields = [
      'userType',
      'experienceLevel',
      'canUploadComposers',
      'canUploadWorks',
      'canUploadScores',
      'uploadLimitDaily',
      'uploadLimitMonthly',
    ];

    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        experienceLevel: true,
        role: true,
      },
    });

    // Log da ação admin
    await prisma.uploadHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'user',
        entityId: userId,
        action: 'update',
        changes: updateData,
        reason: 'Admin update',
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuário atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
