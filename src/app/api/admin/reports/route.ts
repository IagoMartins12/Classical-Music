// app/api/admin/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

interface ReportStats {
  totalUsers: number;
  totalWorks: number;
  totalComposers: number;
  totalAnnotations: number;
  activeUsers: number;
  newUsers: number;
  studySessions: number;
  uploads: number;
  totalScores: number;
}

// Cache das estatísticas por 5 minutos
const getCachedReportStats = unstable_cache(
  async (): Promise<ReportStats> => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      const [
        totalUsers,
        totalWorks,
        totalComposers,
        totalAnnotations,
        activeUsers,
        newUsers,
        studySessions,
        uploads,
        totalScores,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.work.count(),
        prisma.composer.count(),
        prisma.workAnnotation.count({ where: { isPublic: true } }),
        prisma.user.count({
          where: { updatedAt: { gte: thirtyDaysAgo } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: sevenDaysAgo } },
        }),
        prisma.studySession.count({
          where: { date: { gte: thirtyDaysAgo } },
        }),
        prisma.uploadHistory.count({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            action: 'create',
          },
        }),
        prisma.workScore.count({ where: { isActive: true } }),
      ]);

      return {
        totalUsers,
        totalWorks,
        totalComposers,
        totalAnnotations,
        activeUsers,
        newUsers,
        studySessions,
        uploads,
        totalScores,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalUsers: 0,
        totalWorks: 0,
        totalComposers: 0,
        totalAnnotations: 0,
        activeUsers: 0,
        newUsers: 0,
        studySessions: 0,
        uploads: 0,
        totalScores: 0,
      };
    }
  },
  ['admin-report-stats'],
  { revalidate: 300 } // 5 minutos
);

// Função para calcular período
const getPeriodDates = (period: string) => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default: // 30d
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate: now };
};

// Função para formatar tamanho do arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Gerar dados do relatório de usuários
const generateUsersReportData = async (startDate: Date, endDate: Date) => {
  const [
    totalUsers,
    newUsers,
    activeUsers,
    avgSessionDuration,
    usersByType,
    topContributors,
    usersWithInstruments,
    longestStreaks,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        userType: true,
        experienceLevel: true,
      },
    }),

    prisma.user.count({
      where: {
        updatedAt: { gte: startDate, lte: endDate },
      },
    }),

    prisma.studySession.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _avg: { durationMin: true },
    }),

    prisma.user.groupBy({
      by: ['userType'],
      _count: { id: true },
    }),

    prisma.user.findMany({
      where: {
        totalUploads: { gt: 0 },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalUploads: true,
        uploadScore: true,
        totalStudyTime: true,
        currentStreak: true,
      },
      orderBy: { uploadScore: 'desc' },
      take: 10,
    }),

    prisma.user.count({
      where: {
        instruments: { some: {} },
      },
    }),

    prisma.user.findMany({
      where: {
        longestStreak: { gt: 0 },
      },
      select: {
        firstName: true,
        lastName: true,
        longestStreak: true,
        currentStreak: true,
      },
      orderBy: { longestStreak: 'desc' },
      take: 5,
    }),
  ]);

  return {
    summary: {
      totalUsers,
      newUsersCount: newUsers.length,
      activeUsers,
      avgSessionDuration: Math.round(avgSessionDuration._avg.durationMin || 0),
      usersWithInstruments,
    },
    newUsers: newUsers.map((user) => ({
      name:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário',
      createdAt: user.createdAt.toISOString(),
      userType: user.userType || 'CASUAL_USER',
      experienceLevel: user.experienceLevel,
    })),
    usersByType: usersByType.map((item) => ({
      type: item.userType || 'CASUAL_USER',
      count: item._count.id,
    })),
    topContributors: topContributors.map((user) => ({
      name:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário',
      uploads: user.totalUploads,
      score: user.uploadScore,
      studyTime: user.totalStudyTime,
      currentStreak: user.currentStreak,
    })),
    longestStreaks: longestStreaks.map((user) => ({
      name:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário',
      longestStreak: user.longestStreak,
      currentStreak: user.currentStreak,
    })),
  };
};

// Gerar dados do relatório de conteúdo
const generateContentReportData = async (startDate: Date, endDate: Date) => {
  const [
    totalWorks,
    totalComposers,
    totalScores,
    newWorks,
    newComposers,
    popularWorks,
    popularComposers,
    topEpochs,
    worksByInstrument,
  ] = await Promise.all([
    prisma.work.count(),
    prisma.composer.count(),
    prisma.workScore.count({ where: { isActive: true } }),

    prisma.work.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        title: true,
        composer: { select: { name: true } },
        createdAt: true,
      },
    }),

    prisma.composer.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        name: true,
        createdAt: true,
      },
    }),

    prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
        _count: {
          select: {
            favoriteBy: true,
            studySessions: true,
            workAnnotations: { where: { isPublic: true } },
          },
        },
      },
      orderBy: {
        favoriteBy: { _count: 'desc' },
      },
      take: 10,
    }),

    prisma.composer.findMany({
      select: {
        id: true,
        name: true,
        epoch: { select: { name: true } },
        _count: {
          select: {
            works: true,
            favoriteByUsers: true,
          },
        },
      },
      orderBy: {
        favoriteByUsers: { _count: 'desc' },
      },
      take: 10,
    }),

    prisma.epoch.findMany({
      select: {
        name: true,
        _count: {
          select: {
            composers: true,
            works: true,
          },
        },
      },
      orderBy: {
        works: { _count: 'desc' },
      },
    }),

    prisma.instrument.findMany({
      select: {
        name: true,
        category: true,
        _count: {
          select: {
            works: true,
            users: true,
          },
        },
      },
      orderBy: {
        works: { _count: 'desc' },
      },
      take: 10,
    }),
  ]);

  return {
    summary: {
      totalWorks,
      totalComposers,
      totalScores,
      newWorksCount: newWorks.length,
      newComposersCount: newComposers.length,
    },
    newWorks: newWorks.map((work) => ({
      title: work.title,
      composer: work.composer.name,
      createdAt: work.createdAt.toISOString(),
    })),
    newComposers: newComposers.map((composer) => ({
      name: composer.name,
      createdAt: composer.createdAt.toISOString(),
    })),
    popularWorks: popularWorks.map((work) => ({
      title: work.title,
      composer: work.composer.name,
      favorites: work._count.favoriteBy,
      sessions: work._count.studySessions,
      annotations: work._count.workAnnotations,
    })),
    popularComposers: popularComposers.map((composer) => ({
      name: composer.name,
      epoch: composer.epoch.name,
      works: composer._count.works,
      favorites: composer._count.favoriteByUsers,
    })),
    topEpochs: topEpochs.map((epoch) => ({
      name: epoch.name,
      composers: epoch._count.composers,
      works: epoch._count.works,
    })),
    worksByInstrument: worksByInstrument.map((instrument) => ({
      name: instrument.name,
      category: instrument.category,
      works: instrument._count.works,
      users: instrument._count.users,
    })),
  };
};

// Gerar dados do relatório de engajamento
const generateEngagementReportData = async (startDate: Date, endDate: Date) => {
  const [
    totalSessions,
    totalAnnotations,
    avgSessionDuration,
    activeUsers,
    mostStudiedWorks,
    annotationsByCategory,
    practiceGoalsData,
  ] = await Promise.all([
    prisma.studySession.count({
      where: {
        date: { gte: startDate, lte: endDate },
      },
    }),

    prisma.workAnnotation.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        isPublic: true,
      },
    }),

    prisma.studySession.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _avg: { durationMin: true },
    }),

    prisma.user.count({
      where: {
        updatedAt: { gte: startDate, lte: endDate },
      },
    }),

    prisma.work.findMany({
      select: {
        title: true,
        composer: { select: { name: true } },
        studySessions: {
          where: {
            date: { gte: startDate, lte: endDate },
          },
          select: {
            durationMin: true,
            userId: true,
          },
        },
      },
      take: 20,
    }),

    prisma.workAnnotation.groupBy({
      by: ['category'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        isPublic: true,
      },
      _count: { id: true },
    }),

    prisma.learningGoal.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        title: true,
        isCompleted: true,
        targetDate: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  const studiedWorks = mostStudiedWorks
    .map((work) => ({
      title: work.title,
      composer: work.composer.name,
      totalMinutes: work.studySessions.reduce(
        (sum, s) => sum + s.durationMin,
        0
      ),
      uniqueUsers: new Set(work.studySessions.map((s) => s.userId)).size,
    }))
    .filter((w) => w.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 10);

  return {
    summary: {
      totalSessions,
      totalAnnotations,
      avgSessionDuration: Math.round(avgSessionDuration._avg.durationMin || 0),
      activeUsers,
      completedGoals: practiceGoalsData.filter((g) => g.isCompleted).length,
    },
    mostStudiedWorks: studiedWorks,
    annotationsByCategory: annotationsByCategory.map((item) => ({
      category: item.category,
      count: item._count.id,
    })),
    practiceGoals: practiceGoalsData.map((goal) => ({
      title: goal.title,
      isCompleted: goal.isCompleted,
      user:
        `${goal.user.firstName || ''} ${goal.user.lastName || ''}`.trim() ||
        'Usuário',
      targetDate: goal.targetDate?.toISOString(),
    })),
  };
};

// Gerar arquivo Excel
const generateExcelFile = async (
  data: any,
  filename: string
): Promise<{ path: string; size: number }> => {
  const workbook = XLSX.utils.book_new();

  // Criar planilhas baseadas no tipo de dados
  if (data.summary) {
    const summarySheet = XLSX.utils.json_to_sheet([data.summary]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
  }

  // Adicionar outras planilhas baseadas nos dados disponíveis
  const dataKeys = Object.keys(data).filter(
    (key) =>
      key !== 'summary' && Array.isArray(data[key]) && data[key].length > 0
  );

  dataKeys.forEach((key) => {
    const sheet = XLSX.utils.json_to_sheet(data[key]);
    const sheetName =
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31)); // Excel limit
  });

  // Garantir que o diretório existe
  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  try {
    await fs.access(reportsDir);
  } catch {
    await fs.mkdir(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, filename);

  // Escrever arquivo
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  await fs.writeFile(filePath, buffer);

  const stats = await fs.stat(filePath);

  return {
    path: `/reports/${filename}`,
    size: stats.size,
  };
};

// Gerar arquivo CSV
const generateCSVFile = async (
  data: any,
  filename: string
): Promise<{ path: string; size: number }> => {
  // Para CSV, vamos usar os dados mais importantes do relatório
  const csvData: any[] = [];

  if (data.summary) {
    csvData.push({ Tipo: 'Resumo', ...data.summary });
  }

  // Adicionar outros dados importantes
  const importantKeys = [
    'newUsers',
    'popularWorks',
    'topContributors',
    'mostStudiedWorks',
  ];

  importantKeys.forEach((key) => {
    if (data[key] && Array.isArray(data[key])) {
      data[key].forEach((item: any, index: number) => {
        csvData.push({
          Tipo: key,
          Index: index + 1,
          ...item,
        });
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // Garantir que o diretório existe
  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  try {
    await fs.access(reportsDir);
  } catch {
    await fs.mkdir(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, filename);
  await fs.writeFile(filePath, csv, 'utf8');

  const stats = await fs.stat(filePath);

  return {
    path: `/reports/${filename}`,
    size: stats.size,
  };
};

// Gerar arquivo PDF (simulado - em produção usar biblioteca como puppeteer/jsPDF)
const generatePDFFile = async (
  data: any,
  filename: string
): Promise<{ path: string; size: number }> => {
  // Por simplicidade, vamos gerar um arquivo de texto formatado
  // Em produção, use bibliotecas como puppeteer, jsPDF ou similares

  let content = 'RELATÓRIO DO SISTEMA\n';
  content += '===================\n\n';

  if (data.summary) {
    content += 'RESUMO EXECUTIVO\n';
    content += '----------------\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      content += `${key}: ${value}\n`;
    });
    content += '\n';
  }

  // Adicionar seções importantes
  const sections = {
    newUsers: 'NOVOS USUÁRIOS',
    popularWorks: 'OBRAS POPULARES',
    topContributors: 'PRINCIPAIS CONTRIBUIDORES',
    mostStudiedWorks: 'OBRAS MAIS ESTUDADAS',
  };

  Object.entries(sections).forEach(([key, title]) => {
    if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
      content += `${title}\n`;
      content += '-'.repeat(title.length) + '\n';
      data[key].slice(0, 10).forEach((item: any, index: number) => {
        content += `${index + 1}. `;
        if (typeof item === 'object') {
          const values = Object.values(item).slice(0, 3);
          content += values.join(' - ');
        } else {
          content += item;
        }
        content += '\n';
      });
      content += '\n';
    }
  });

  // Garantir que o diretório existe
  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  try {
    await fs.access(reportsDir);
  } catch {
    await fs.mkdir(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, filename);
  await fs.writeFile(filePath, content, 'utf8');

  const stats = await fs.stat(filePath);

  return {
    path: `/reports/${filename}`,
    size: stats.size,
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const [stats, results] = await Promise.all([
        getCachedReportStats(),
        prisma.generatedReport.findMany({
          where: {
            generatedBy: session.user.id,
          },
          orderBy: { generatedAt: 'desc' },
          take: 50,
        }),
      ]);

      return NextResponse.json({
        success: true,
        stats,
        results: results.map((result) => ({
          id: result.id,
          name: result.name,
          type: result.type,
          format: result.format,
          period: result.period,
          generatedAt: result.generatedAt,
          status: result.status,
          error: result.error,
          size: result.fileSize,
          downloadUrl: result.filePath,
          downloadCount: result.downloadCount,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao buscar dados de relatórios:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao carregar dados de relatórios',
          stats: null,
          results: [],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na API de relatórios do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, type, format, period } = body;

    if (action === 'generate') {
      try {
        const { startDate, endDate } = getPeriodDates(period);

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const filename = `${type}_${period}_${timestamp}.${format}`;

        // Criar registro no banco
        const report = await prisma.generatedReport.create({
          data: {
            name: getReportName(type),
            type,
            format,
            period,
            filename,
            status: 'generating',
            generatedBy: session.user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          },
        });

        // Gerar dados do relatório em background
        let reportData: any;

        try {
          switch (type) {
            case 'users-overview':
              reportData = await generateUsersReportData(startDate, endDate);
              break;
            case 'content-analysis':
              reportData = await generateContentReportData(startDate, endDate);
              break;
            case 'engagement-metrics':
              reportData = await generateEngagementReportData(
                startDate,
                endDate
              );
              break;
            default:
              throw new Error('Tipo de relatório inválido');
          }

          // Gerar arquivo baseado no formato
          let fileResult: { path: string; size: number };

          switch (format) {
            case 'excel':
              fileResult = await generateExcelFile(reportData, filename);
              break;
            case 'csv':
              fileResult = await generateCSVFile(reportData, filename);
              break;
            case 'pdf':
              fileResult = await generatePDFFile(reportData, filename);
              break;
            default:
              throw new Error('Formato inválido');
          }

          // Atualizar registro com dados do arquivo
          await prisma.generatedReport.update({
            where: { id: report.id },
            data: {
              status: 'ready',
              filePath: fileResult.path,
              fileSize: formatFileSize(fileResult.size),
              fileSizeBytes: fileResult.size,
              reportData,
            },
          });

          return NextResponse.json({
            success: true,
            message: 'Relatório gerado com sucesso',
            result: {
              id: report.id,
              name: report.name,
              type: report.type,
              format: report.format,
              period: report.period,
              generatedAt: report.generatedAt,
              status: 'ready',
              size: formatFileSize(fileResult.size),
              downloadUrl: fileResult.path,
            },
          });
        } catch (error) {
          // Marcar relatório como falhou
          await prisma.generatedReport.update({
            where: { id: report.id },
            data: {
              status: 'failed',
              error:
                error instanceof Error ? error.message : 'Erro desconhecido',
            },
          });

          throw error;
        }
      } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Erro ao gerar relatório',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao processar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { error: 'ID do relatório é obrigatório' },
        { status: 400 }
      );
    }

    try {
      // Buscar relatório
      const report = await prisma.generatedReport.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        return NextResponse.json(
          { error: 'Relatório não encontrado' },
          { status: 404 }
        );
      }

      // Verificar se o usuário pode deletar
      if (report.generatedBy !== session.user.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }

      // Deletar arquivo físico se existir
      if (report.filePath) {
        try {
          const fullPath = path.join(process.cwd(), 'public', report.filePath);
          await fs.unlink(fullPath);
        } catch (error) {
          console.warn('Erro ao deletar arquivo físico:', error);
          // Continuar mesmo se não conseguir deletar o arquivo
        }
      }

      // Deletar registro do banco
      await prisma.generatedReport.delete({
        where: { id: reportId },
      });

      return NextResponse.json({
        success: true,
        message: 'Relatório excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir relatório' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na exclusão de relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para obter nome do relatório
function getReportName(type: string): string {
  const names = {
    'users-overview': 'Resumo de Usuários',
    'content-analysis': 'Análise de Conteúdo',
    'engagement-metrics': 'Métricas de Engajamento',
    'growth-trends': 'Tendências de Crescimento',
  };

  return names[type as keyof typeof names] || 'Relatório Personalizado';
}
