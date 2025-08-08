// app/api/admin/reports/route.ts - VERSÃO COMPLETA OTIMIZADA
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
  uploads: number;
  totalScores: number;
}

// Cache das estatísticas por 5 minutos - OTIMIZADO
const getCachedReportStats = unstable_cache(
  async (): Promise<ReportStats> => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      // 🚀 CONSULTAS OTIMIZADAS SEM JOINS PESADOS
      const [
        totalUsers,
        totalWorks,
        totalComposers,
        totalAnnotations,
        activeUsers,
        newUsers,
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

// 🚀 RELATÓRIO DE USUÁRIOS - OTIMIZADO
const generateUsersReportData = async (startDate: Date, endDate: Date) => {
  try {
    const [
      totalUsers,
      newUsers,
      activeUsers,
      usersByType,
      topContributors,
      usersWithInstruments,
    ] = await Promise.all([
      prisma.user.count(),

      // 🔄 LIMITE nos novos usuários para evitar sobrecarga
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
        take: 500, // 🚀 LIMITE para evitar problemas de memória
        orderBy: { createdAt: 'desc' },
      }),

      prisma.user.count({
        where: {
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),

      // 🚀 AGREGAÇÃO SIMPLES SEM JOINS
      prisma.user.groupBy({
        by: ['userType'],
        _count: { id: true },
      }),

      // 🔄 LIMITE nos contribuidores
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
        },
        orderBy: { uploadScore: 'desc' },
        take: 20, // 🚀 LIMITE reduzido
      }),

      prisma.user.count({
        where: {
          instruments: { some: {} },
        },
      }),
    ]);

    return {
      summary: {
        totalUsers,
        newUsersCount: newUsers.length,
        activeUsers,
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
      })),
    };
  } catch (error) {
    console.error('Erro em generateUsersReportData:', error);

    // Fallback com dados básicos
    const totalUsers = await prisma.user.count().catch(() => 0);

    return {
      summary: {
        totalUsers,
        newUsersCount: 0,
        activeUsers: 0,
        usersWithInstruments: 0,
      },
      newUsers: [],
      usersByType: [],
      topContributors: [],
      error:
        'Alguns dados podem estar incompletos devido a limitações de consulta',
    };
  }
};

// 🚀 RELATÓRIO DE CONTEÚDO - COMPLETAMENTE REESCRITO E OTIMIZADO
const generateContentReportData = async (startDate: Date, endDate: Date) => {
  try {
    // 🚀 CONSULTAS BÁSICAS SEM JOINS PESADOS
    const [totalWorks, totalComposers, totalScores, newWorks, newComposers] =
      await Promise.all([
        // Contagens simples sem JOINs
        prisma.work.count(),
        prisma.composer.count(),
        prisma.workScore.count({ where: { isActive: true } }),

        // Novos works com dados mínimos
        prisma.work.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            title: true,
            createdAt: true,
            composer: { select: { name: true } }, // JOIN simples
          },
          take: 100, // 🚀 LIMITE para evitar sobrecarga
          orderBy: { createdAt: 'desc' },
        }),

        // Novos composers sem JOINs complexos
        prisma.composer.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            name: true,
            createdAt: true,
          },
          take: 50, // 🚀 LIMITE
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    // 🚀 OBRAS POPULARES - CONSULTA OTIMIZADA SEM JOINS PESADOS
    const popularWorks = await prisma.work.findMany({
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } }, // JOIN simples
      },
      take: 10, // 🚀 LIMITE PEQUENO
      orderBy: { createdAt: 'desc' }, // 🔄 MUDANÇA: ordenar por data ao invés de favorites
    });

    // 🚀 COMPOSITORES POPULARES - SEM _count PROBLEMÁTICO
    const popularComposers = await prisma.composer.findMany({
      select: {
        id: true,
        name: true,
        epoch: {
          select: { name: true },
        },
      },
      take: 10, // 🚀 LIMITE PEQUENO
      orderBy: { createdAt: 'desc' }, // 🔄 MUDANÇA: ordenar por data
    });

    // 🚀 ÉPOCAS - CONSULTA SIMPLIFICADA SEM _count PROBLEMÁTICO
    const epochsBasic = await prisma.epoch.findMany({
      select: {
        id: true,
        name: true,
      },
      take: 20, // 🚀 LIMITE
    });

    // 🚀 CONTAR MANUALMENTE ÉPOCAS (mais eficiente)
    const epochStats = await Promise.all(
      epochsBasic.map(async (epoch) => {
        try {
          // Consultas simples separadas
          const [composersCount, worksCount] = await Promise.all([
            prisma.composer.count({
              where: { epochId: epoch.id },
            }),
            prisma.work.count({
              where: { epochId: epoch.id },
            }),
          ]);

          return {
            name: epoch.name,
            composers: composersCount,
            works: worksCount,
          };
        } catch (error) {
          console.warn(`Erro ao contar dados para época ${epoch.name}:`, error);
          return {
            name: epoch.name,
            composers: 0,
            works: 0,
          };
        }
      })
    );

    // 🚀 DADOS DE INSTRUMENTOS - SIMPLIFICADOS
    const [totalInstruments, totalUsersWithInstruments] = await Promise.all([
      prisma.instrument.count(),
      prisma.userInstrument.count(),
    ]);

    // 🚀 CALCULAR FAVORITES MANUALMENTE (mais seguro)
    const popularWorksWithFavorites = await Promise.all(
      popularWorks.map(async (work) => {
        try {
          const [favoritesCount, annotationsCount] = await Promise.all([
            prisma.favoriteWork.count({
              where: { workId: work.id },
            }),
            prisma.workAnnotation.count({
              where: { workId: work.id, isPublic: true },
            }),
          ]);

          return {
            title: work.title,
            composer: work.composer.name,
            favorites: favoritesCount,
            annotations: annotationsCount,
          };
        } catch (error) {
          console.warn(
            `Erro ao contar favorites para obra ${work.title}:`,
            error
          );
          return {
            title: work.title,
            composer: work.composer.name,
            favorites: 0,
            annotations: 0,
          };
        }
      })
    );

    // 🚀 CALCULAR DADOS DOS COMPOSITORES MANUALMENTE
    const popularComposersWithStats = await Promise.all(
      popularComposers.map(async (composer) => {
        try {
          const [worksCount, favoritesCount] = await Promise.all([
            prisma.work.count({
              where: { composerId: composer.id },
            }),
            prisma.favoriteComposer.count({
              where: { composerId: composer.id },
            }),
          ]);

          return {
            name: composer.name,
            epoch: composer.epoch?.name || 'Não informado',
            works: worksCount,
            favorites: favoritesCount,
          };
        } catch (error) {
          console.warn(
            `Erro ao contar dados para compositor ${composer.name}:`,
            error
          );
          return {
            name: composer.name,
            epoch: composer.epoch?.name || 'Não informado',
            works: 0,
            favorites: 0,
          };
        }
      })
    );

    // 🚀 ORDENAR RESULTADOS POR RELEVÂNCIA
    const topEpochs = epochStats
      .sort((a, b) => b.works + b.composers - (a.works + a.composers))
      .slice(0, 10);

    const topWorksWithFavorites = popularWorksWithFavorites
      .sort(
        (a, b) => b.favorites + b.annotations - (a.favorites + a.annotations)
      )
      .slice(0, 10);

    const topComposersWithStats = popularComposersWithStats
      .sort((a, b) => b.works + b.favorites - (a.works + a.favorites))
      .slice(0, 10);

    // 🚀 RETORNAR DADOS OTIMIZADOS
    return {
      summary: {
        totalWorks,
        totalComposers,
        totalScores,
        newWorksCount: newWorks.length,
        newComposersCount: newComposers.length,
        totalInstruments,
        totalUsersWithInstruments,
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
      popularWorks: topWorksWithFavorites,
      popularComposers: topComposersWithStats,
      topEpochs: topEpochs,
      // 🔄 DADOS SIMPLIFICADOS DE INSTRUMENTOS
      instrumentsOverview: {
        totalInstruments,
        totalUsersWithInstruments,
        avgUsersPerInstrument:
          totalInstruments > 0
            ? Math.round(totalUsersWithInstruments / totalInstruments)
            : 0,
      },
    };
  } catch (error) {
    console.error('Erro detalhado em generateContentReportData:', error);

    // 🚀 FALLBACK COM DADOS MÍNIMOS
    const [totalWorks, totalComposers, totalScores] = await Promise.all([
      prisma.work.count().catch(() => 0),
      prisma.composer.count().catch(() => 0),
      prisma.workScore.count().catch(() => 0),
    ]);

    return {
      summary: {
        totalWorks,
        totalComposers,
        totalScores,
        newWorksCount: 0,
        newComposersCount: 0,
        totalInstruments: 0,
        totalUsersWithInstruments: 0,
      },
      newWorks: [],
      newComposers: [],
      popularWorks: [],
      popularComposers: [],
      topEpochs: [],
      instrumentsOverview: {
        totalInstruments: 0,
        totalUsersWithInstruments: 0,
        avgUsersPerInstrument: 0,
      },
      error:
        'Alguns dados podem estar incompletos devido a limitações de consulta',
    };
  }
};

// 🚀 RELATÓRIO DE ENGAJAMENTO - OTIMIZADO
const generateEngagementReportData = async (startDate: Date, endDate: Date) => {
  try {
    const [totalAnnotations, activeUsers, annotationsByCategory] =
      await Promise.all([
        prisma.workAnnotation.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
            isPublic: true,
          },
        }),

        prisma.user.count({
          where: {
            updatedAt: { gte: startDate, lte: endDate },
          },
        }),

        // 🚀 AGREGAÇÃO SIMPLES SEM JOINS
        prisma.workAnnotation.groupBy({
          by: ['category'],
          where: {
            createdAt: { gte: startDate, lte: endDate },
            isPublic: true,
          },
          _count: { id: true },
        }),
      ]);

    return {
      summary: {
        totalAnnotations,
        activeUsers,
      },
      annotationsByCategory: annotationsByCategory.map((item) => ({
        category: item.category,
        count: item._count.id,
      })),
    };
  } catch (error) {
    console.error('Erro em generateEngagementReportData:', error);

    // Fallback com dados básicos
    return {
      summary: {
        totalAnnotations: 0,
        activeUsers: 0,
      },
      annotationsByCategory: [],
      error:
        'Alguns dados podem estar incompletos devido a limitações de consulta',
    };
  }
};

// Gerar arquivo Excel (mantendo original)
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
      key !== 'summary' &&
      key !== 'error' &&
      Array.isArray(data[key]) &&
      data[key].length > 0
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

// Gerar arquivo CSV (mantendo original, mas com tratamento de erro)
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
    'popularComposers',
    'topEpochs',
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

  // Adicionar overview de instrumentos se disponível
  if (data.instrumentsOverview) {
    csvData.push({
      Tipo: 'instrumentsOverview',
      ...data.instrumentsOverview,
    });
  }

  // Adicionar informação sobre erro se houver
  if (data.error) {
    csvData.push({
      Tipo: 'error_info',
      message: data.error,
    });
  }

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

// 🔄 GERAR ARQUIVO PDF - MELHORADO COM TRATAMENTO DE ERRO
const generatePDFFile = async (
  data: any,
  filename: string
): Promise<{ path: string; size: number }> => {
  // 🔄 GERAR HTML ESTRUTURADO PARA CONVERSÃO EM PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório do Sistema - Opus Atlas</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #fff;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #3B82F6;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #1E40AF;
                font-size: 2.5em;
                margin: 0;
            }
            .header p {
                color: #666;
                font-size: 1.1em;
                margin: 10px 0;
            }
            .section {
                margin: 30px 0;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #3B82F6;
            }
            .section h2 {
                color: #1E40AF;
                font-size: 1.8em;
                margin-top: 0;
                margin-bottom: 15px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 20px 0;
            }
            .summary-item {
                background: white;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }
            .summary-item strong {
                color: #1E40AF;
                display: block;
                font-size: 1.1em;
            }
            .list-item {
                background: white;
                margin: 10px 0;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }
            .list-item strong {
                color: #1E40AF;
            }
            .error-notice {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 0.9em;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
            }
            @media print {
                body { margin: 0; padding: 15px; }
                .section { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 Relatório do Sistema</h1>
            <p><strong>Opus Atlas - Classical Music Platform</strong></p>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</p>
        </div>
  `;

  // 🔄 ADICIONAR AVISO DE ERRO SE HOUVER
  if (data.error) {
    htmlContent += `
        <div class="error-notice">
            <h3>⚠️ Aviso Importante</h3>
            <p><strong>Atenção:</strong> ${data.error}</p>
            <p>O sistema gerou o relatório com os dados disponíveis, mas alguns valores podem estar limitados devido ao volume de dados.</p>
        </div>
    `;
  }

  // 🔄 ADICIONAR RESUMO EXECUTIVO
  if (data.summary) {
    htmlContent += `
        <div class="section">
            <h2>📋 Resumo Executivo</h2>
            <div class="summary-grid">
    `;

    Object.entries(data.summary).forEach(([key, value]) => {
      const keyFormatted = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      htmlContent += `
                <div class="summary-item">
                    <strong>${keyFormatted}</strong>
                    ${
                      typeof value === 'number'
                        ? value.toLocaleString('pt-BR')
                        : value
                    }
                </div>
      `;
    });

    htmlContent += `
            </div>
        </div>
    `;
  }

  // 🔄 ADICIONAR SEÇÕES DETALHADAS
  const sectionTitles = {
    newUsers: '👤 Novos Usuários',
    popularWorks: '🎵 Obras Populares',
    topContributors: '🏆 Principais Contribuidores',
    mostStudiedWorks: '📚 Obras Mais Estudadas',
    popularComposers: '👨‍🎼 Compositores Populares',
    topEpochs: '🏛️ Épocas Musicais',
    annotationsByCategory: '📝 Anotações por Categoria',
    practiceGoals: '🎯 Metas de Aprendizado',
  };

  Object.entries(sectionTitles).forEach(([key, title]) => {
    if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
      htmlContent += `
        <div class="section">
            <h2>${title}</h2>
      `;

      data[key].slice(0, 10).forEach((item: any, index: number) => {
        htmlContent += `<div class="list-item">`;
        htmlContent += `<strong>${index + 1}.</strong> `;

        if (typeof item === 'object') {
          const values = Object.entries(item).slice(0, 4);
          values.forEach(([itemKey, itemValue], i) => {
            if (i > 0) htmlContent += ' • ';
            htmlContent += `<strong>${itemKey}:</strong> ${itemValue}`;
          });
        } else {
          htmlContent += item;
        }

        htmlContent += `</div>`;
      });

      htmlContent += `</div>`;
    }
  });

  // 🔄 ADICIONAR OVERVIEW DE INSTRUMENTOS SE DISPONÍVEL
  if (data.instrumentsOverview) {
    htmlContent += `
      <div class="section">
          <h2>🎹 Visão Geral dos Instrumentos</h2>
          <div class="summary-grid">
              <div class="summary-item">
                  <strong>Total de Instrumentos</strong>
                  ${data.instrumentsOverview.totalInstruments}
              </div>
              <div class="summary-item">
                  <strong>Usuários com Instrumentos</strong>
                  ${data.instrumentsOverview.totalUsersWithInstruments}
              </div>
              <div class="summary-item">
                  <strong>Média de Usuários por Instrumento</strong>
                  ${data.instrumentsOverview.avgUsersPerInstrument}
              </div>
          </div>
      </div>
    `;
  }

  // 🔄 FOOTER
  htmlContent += `
        <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema Opus Atlas</p>
            <p>Para mais informações, acesse: <strong>opusatlas.com</strong></p>
            ${
              data.error
                ? '<p><em>* Relatório gerado com limitações de dados devido ao volume do banco.</em></p>'
                : ''
            }
        </div>
    </body>
    </html>
  `;

  // 🔄 SALVAR COMO HTML (que pode ser convertido para PDF no browser)
  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  try {
    await fs.access(reportsDir);
  } catch {
    await fs.mkdir(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, filename.replace('.pdf', '.html'));
  await fs.writeFile(filePath, htmlContent, 'utf8');

  const stats = await fs.stat(filePath);

  return {
    path: `/reports/${filename.replace('.pdf', '.html')}`,
    size: stats.size,
  };
};

// GET - Manter original
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

// 🚀 POST - MELHORADO COM TRATAMENTO DE ERRO ROBUSTO
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
          },
        });

        // Gerar dados do relatório em background
        let reportData: any;

        try {
          console.log(
            `🚀 Iniciando geração de relatório: ${type} para período ${period}`
          );

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

          console.log(`✅ Dados do relatório gerados com sucesso`);

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

          console.log(`✅ Arquivo gerado: ${fileResult.path}`);

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
            message: reportData.error
              ? 'Relatório gerado com algumas limitações de dados'
              : 'Relatório gerado com sucesso',
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
            warning: reportData.error ? reportData.error : null,
          });
        } catch (error) {
          console.error('Erro ao gerar relatório:', error);

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

// DELETE - Manter original
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
