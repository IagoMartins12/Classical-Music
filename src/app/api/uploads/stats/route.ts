// app/api/uploads/stats/route.ts
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
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem permissão para ver as estatísticas
    if (userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Início do dia

    // Estatísticas básicas do usuário
    const userStats = await Promise.all([
      // Compositores
      prisma.composer.count({
        where: { createdBy: userId },
      }),

      // Obras
      prisma.work.count({
        where: { createdBy: userId },
      }),

      // Partituras
      prisma.workScore.count({
        where: { uploadedBy: userId },
      }),

      // Uploads no último mês
      prisma.composer.count({
        where: {
          createdBy: userId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Qualidade média dos compositores
      prisma.composer.aggregate({
        where: {
          createdBy: userId,
          dataCompleteness: { not: null },
        },
        _avg: { dataCompleteness: true },
      }),

      // Obras populares (com mais favoritos)
      prisma.work.count({
        where: {
          createdBy: userId,
          favoriteBy: { some: {} },
        },
      }),

      // Contagem de arquivos para cálculo de tamanho
      prisma.workScore.findMany({
        where: {
          uploadedBy: userId,
          fileSize: { not: null },
        },
        select: { fileSize: true },
      }),
    ]);

    const [
      composerCount,
      workCount,
      scoreCount,
      monthlyUploads,
      avgComposerQuality,
      popularWorkCount,
      scoreFiles,
    ] = userStats;

    // Calcular tamanho total dos arquivos
    const totalFileSize = scoreFiles.reduce((acc, file) => {
      if (file.fileSize) {
        // Assumindo que fileSize está em formato "X MB" ou "X KB"
        const sizeMatch = file.fileSize.match(/^([\d.]+)\s*(KB|MB|GB)$/i);
        if (sizeMatch) {
          const size = parseFloat(sizeMatch[1]);
          const unit = sizeMatch[2].toUpperCase();
          const multiplier =
            unit === 'KB'
              ? 1024
              : unit === 'MB'
              ? 1024 * 1024
              : 1024 * 1024 * 1024;
          return acc + size * multiplier;
        }
      }
      return acc;
    }, 0);

    const stats = {
      totalUploads: composerCount + workCount + scoreCount,
      composerCount,
      workCount,
      scoreCount,
      monthlyGrowth:
        monthlyUploads > 0
          ? Math.round(
              (monthlyUploads / (composerCount + workCount + scoreCount)) * 100
            )
          : 0,
      averageComposerQuality: Math.round(
        avgComposerQuality._avg.dataCompleteness || 0
      ),
      popularWorkCount,
      totalFileSize: formatFileSize(totalFileSize),
    };

    // Estatísticas adicionais para admins
    if (isAdmin) {
      const adminStats = await Promise.all([
        // Usuários ativos (que fizeram uploads)
        prisma.user.count({
          where: {
            OR: [
              { createdComposers: { some: {} } },
              { createdWorks: { some: {} } },
              { createdScores: { some: {} } },
            ],
          },
        }),

        // Novos usuários este mês
        prisma.user.count({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            OR: [
              { createdComposers: { some: {} } },
              { createdWorks: { some: {} } },
              { createdScores: { some: {} } },
            ],
          },
        }),

        // Atividade diária - compositores
        prisma.composer.count({
          where: {
            createdAt: { gte: today },
            createdBy: { not: null },
          },
        }),

        // Atividade diária - obras
        prisma.work.count({
          where: {
            createdAt: { gte: today },
            createdBy: { not: null },
          },
        }),

        // Atividade diária - partituras
        prisma.workScore.count({
          where: {
            createdAt: { gte: today },
            uploadedBy: { not: null },
          },
        }),

        // Crescimento semanal - compositores
        prisma.composer.count({
          where: {
            createdAt: { gte: sevenDaysAgo },
            createdBy: { not: null },
          },
        }),

        // Crescimento semanal - obras
        prisma.work.count({
          where: {
            createdAt: { gte: sevenDaysAgo },
            createdBy: { not: null },
          },
        }),

        // Crescimento semanal - partituras
        prisma.workScore.count({
          where: {
            createdAt: { gte: sevenDaysAgo },
            uploadedBy: { not: null },
          },
        }),

        // Crescimento mensal - compositores
        prisma.composer.count({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            createdBy: { not: null },
          },
        }),

        // Crescimento mensal - obras
        prisma.work.count({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            createdBy: { not: null },
          },
        }),

        // Crescimento mensal - partituras
        prisma.workScore.count({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            uploadedBy: { not: null },
          },
        }),

        // Qualidade alta - compositores
        prisma.composer.count({
          where: {
            createdBy: { not: null },
            dataQuality: 'high',
          },
        }),

        // Qualidade alta - obras
        prisma.work.count({
          where: {
            createdBy: { not: null },
            // Assumindo que Work também tem dataQuality
            // dataQuality: 'high',
          },
        }),

        // Qualidade alta - partituras
        prisma.workScore.count({
          where: {
            uploadedBy: { not: null },
            dataQuality: 'high',
          },
        }),

        // Moderações pendentes
        prisma.uploadModeration.count({
          where: { status: 'pending' },
        }),

        // Moderações urgentes (mais de 7 dias)
        prisma.uploadModeration.count({
          where: {
            status: 'pending',
            createdAt: { lte: sevenDaysAgo },
          },
        }),
      ]);

      const [
        activeUsers,
        newUsersThisMonth,
        dailyComposers,
        dailyWorks,
        dailyScores,
        weeklyComposers,
        weeklyWorks,
        weeklyScores,
        monthlyComposers,
        monthlyWorks,
        monthlyScores,
        highQualityComposers,
        highQualityWorks,
        highQualityScores,
        pendingModerations,
        urgentModerations,
      ] = adminStats;

      const dailyActivity = dailyComposers + dailyWorks + dailyScores;
      const weeklyCount = weeklyComposers + weeklyWorks + weeklyScores;
      const monthlyCount = monthlyComposers + monthlyWorks + monthlyScores;
      const highQualityCount =
        highQualityComposers + highQualityWorks + highQualityScores;
      const totalCount = await Promise.all([
        prisma.composer.count({ where: { createdBy: { not: null } } }),
        prisma.work.count({ where: { createdBy: { not: null } } }),
        prisma.workScore.count({ where: { uploadedBy: { not: null } } }),
      ]);

      const totalItems = totalCount[0] + totalCount[1] + totalCount[2];
      const weeklyGrowth = calculateGrowthRate(weeklyCount, monthlyCount);
      const averageQuality =
        totalItems > 0 ? Math.round((highQualityCount / totalItems) * 100) : 0;

      Object.assign(stats, {
        activeUsers,
        newUsersThisMonth,
        dailyActivity,
        weeklyGrowth,
        averageQuality,
        highQualityCount,
        pendingModerations,
        urgentModerations,
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateGrowthRate(
  weeklyCount: number,
  monthlyCount: number
): number {
  if (monthlyCount === 0) return 0;
  return Math.round((weeklyCount / monthlyCount) * 100);
}
