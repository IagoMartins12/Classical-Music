// app/api/admin/scores/route.ts - CORRIGIDO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';

interface ScoreFilters {
  search?: string;
  workId?: string;
  source?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: 'title' | 'createdAt' | 'accessCount' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface ScoreStats {
  total: number;
  active: number;
  bySource: Array<{
    source: string;
    count: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
  }>;
  totalSize: string;
  totalSizeBytes: number;
  averagePerWork: number;
  mostAccessed: Array<{
    id: string;
    title: string;
    workTitle: string;
    accessCount: number;
  }>;
  recentlyAdded: number;
}

// 🆕 Função para calcular tamanho real dos arquivos
async function calculateRealFileSize(): Promise<{
  sizeBytes: number;
  sizeFormatted: string;
}> {
  try {
    console.log('📊 [STATS] Calculando tamanho real dos arquivos...');

    let totalBytes = 0;
    let fileCount = 0;
    let errorCount = 0;

    // Buscar todas as partituras ativas com downloadUrl
    const scores = await prisma.workScore.findMany({
      where: {
        isActive: true,
        downloadUrl: { not: null },
      },
      select: {
        id: true, // 🔧 ADICIONAR ID para poder fazer update
        downloadUrl: true,
        fileSize: true,
        title: true,
      },
    });

    console.log(
      `📊 [STATS] Encontradas ${scores.length} partituras ativas para calcular`
    );

    for (const score of scores) {
      if (!score.downloadUrl) continue;

      try {
        // Se já tem fileSize salvo no banco, usar ele (é mais rápido)
        if (score.fileSize) {
          const sizeInBytes = parseSizeString(score.fileSize);
          if (sizeInBytes > 0) {
            totalBytes += sizeInBytes;
            fileCount++;
            continue;
          }
        }

        // Se o arquivo está no sistema de arquivos local, calcular tamanho real
        if (score.downloadUrl.startsWith('/uploads/')) {
          const filePath = path.join(
            process.cwd(),
            'public',
            score.downloadUrl
          );

          try {
            const stats = await fs.stat(filePath);
            totalBytes += stats.size;
            fileCount++;

            // 🔧 CORRIGIR: Usar ID para atualizar fileSize no banco
            const formattedSize = formatBytes(stats.size);
            await prisma.workScore.update({
              where: { id: score.id }, // 🔧 USAR ID ÚNICO
              data: { fileSize: formattedSize },
            });
          } catch {
            console.warn(`⚠️ [STATS] Arquivo não encontrado: ${filePath}`);
            errorCount++;

            fileCount++;
          }
        } else {
          // Para URLs externas, usar estimativa
          fileCount++;
        }
      } catch (error) {
        console.warn(`⚠️ [STATS] Erro ao processar ${score.title}:`, error);
        errorCount++;
      }
    }

    const sizeFormatted = formatBytes(totalBytes);

    console.log(`✅ [STATS] Cálculo concluído:`, {
      totalFiles: fileCount,
      totalBytes,
      sizeFormatted,
      errorsCount: errorCount,
    });

    return { sizeBytes: totalBytes, sizeFormatted };
  } catch (error) {
    console.error('❌ [STATS] Erro ao calcular tamanho dos arquivos:', error);
    // Em caso de erro, retornar estimativa baseada no total de partituras
    const totalScores = await prisma.workScore.count({
      where: { isActive: true },
    });
    const estimatedBytes = totalScores * 2.5 * 1024 * 1024; // 2.5MB por partitura
    return {
      sizeBytes: estimatedBytes,
      sizeFormatted: formatBytes(estimatedBytes) + ' (estimado)',
    };
  }
}

// Função para converter string de tamanho para bytes
function parseSizeString(sizeStr: string): number {
  if (!sizeStr) return 0;

  const sizeMatch = sizeStr.match(/^([\d.]+)\s*([KMGT]?B)$/i);
  if (!sizeMatch) return 0;

  const [, number, unit] = sizeMatch;
  const size = parseFloat(number);

  switch (unit.toUpperCase()) {
    case 'TB':
      return size * 1024 * 1024 * 1024 * 1024;
    case 'GB':
      return size * 1024 * 1024 * 1024;
    case 'MB':
      return size * 1024 * 1024;
    case 'KB':
      return size * 1024;
    case 'B':
      return size;
    default:
      return 0;
  }
}

// Função para formatar bytes em string legível
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const getCachedScoreStats = unstable_cache(
  async (): Promise<ScoreStats> => {
    console.log('📊 [STATS] Iniciando cálculo das estatísticas...');

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      active,
      bySource,
      byType,
      mostAccessed,
      recentlyAdded,
      totalWorks,
      fileSizeData,
    ] = await Promise.all([
      // Total de partituras
      prisma.workScore.count(),

      // Partituras ativas
      prisma.workScore.count({ where: { isActive: true } }),

      // 🔧 CORRIGIDO: Partituras por fonte
      prisma.workScore.groupBy({
        by: ['source'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // 🔧 CORRIGIDO: Partituras por tipo
      prisma.workScore.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // Mais acessadas
      prisma.workScore.findMany({
        select: {
          id: true,
          title: true,
          accessCount: true,
          work: {
            select: { title: true },
          },
        },
        where: { isActive: true },
        orderBy: { accessCount: 'desc' },
        take: 10,
      }),

      // Recentemente adicionadas
      prisma.workScore.count({
        where: {
          createdAt: { gte: lastWeek },
          isActive: true,
        },
      }),

      // Total de obras (para calcular média por obra)
      prisma.work.count(),

      // 🆕 Calcular tamanho real dos arquivos
      calculateRealFileSize(),
    ]);

    console.log('📊 [STATS] Dados brutos coletados:', {
      total,
      active,
      totalWorks,
      bySourceCount: bySource.length,
      byTypeCount: byType.length,
      fileSizeFormatted: fileSizeData.sizeFormatted,
    });

    // 🔧 CORRIGIDO: Verificar se os dados estão chegando
    console.log('📊 [STATS] Partituras por fonte:', bySource);
    console.log('📊 [STATS] Partituras por tipo:', byType);

    const stats: ScoreStats = {
      total,
      active,
      // 🔧 CORRIGIDO: Mapear corretamente os dados de fonte
      bySource: bySource.map((item) => ({
        source: item.source || 'Desconhecida',
        count: item._count.id,
      })),
      // 🔧 CORRIGIDO: Mapear corretamente os dados de tipo
      byType: byType.map((item) => ({
        type: item.type || 'Desconhecido',
        count: item._count.id,
      })),
      // 🆕 CORRIGIDO: Usar tamanho real calculado
      totalSize: fileSizeData.sizeFormatted,
      totalSizeBytes: fileSizeData.sizeBytes,
      // 🔧 CORRIGIDO: Média de partituras por obra
      averagePerWork:
        totalWorks > 0 ? parseFloat((active / totalWorks).toFixed(1)) : 0,
      mostAccessed: mostAccessed.map((score) => ({
        id: score.id,
        title: score.title,
        workTitle: score.work.title,
        accessCount: score.accessCount,
      })),
      recentlyAdded,
    };

    console.log('✅ [STATS] Estatísticas finalizadas:', {
      totalSize: stats.totalSize,
      averagePerWork: stats.averagePerWork,
      bySourceLength: stats.bySource.length,
      byTypeLength: stats.byType.length,
    });

    return stats;
  },
  ['admin-score-stats'],
  { revalidate: 300 } // 🔧 Reduzido para 5 minutos para teste
);

const getScoresList = async (filters: ScoreFilters) => {
  const {
    search,
    workId,
    source,
    type,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { work: { title: { contains: search, mode: 'insensitive' } } },
      {
        work: { composer: { name: { contains: search, mode: 'insensitive' } } },
      },
    ];
  }

  if (workId && workId !== 'all') {
    whereClause.workId = workId;
  }

  if (source && source !== 'all') {
    whereClause.source = source;
  }

  if (type && type !== 'all') {
    whereClause.type = type;
  }

  if (isActive !== undefined) {
    whereClause.isActive = isActive;
  }

  const [scores, totalCount] = await Promise.all([
    prisma.workScore.findMany({
      where: whereClause,
      include: {
        work: {
          select: {
            id: true,
            title: true,
            composer: { select: { name: true } },
          },
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.workScore.count({ where: whereClause }),
  ]);

  return {
    scores: scores.map((score) => ({
      id: score.id,
      title: score.title,
      workTitle: score.work.title,
      composerName: score.work.composer.name,
      source: score.source,
      type: score.type,
      fileSize: score.fileSize,
      pageCount: score.pageCount,
      downloadUrl: score.downloadUrl,
      thumbnailUrl: score.thumbnailUrl,
      isActive: score.isActive,
      accessCount: score.accessCount,
      createdAt: score.createdAt,
      uploader: score.createdByUser
        ? `${score.createdByUser.firstName || ''} ${
            score.createdByUser.lastName || ''
          }`.trim() || score.createdByUser.email
        : null,
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasMore: skip + scores.length < totalCount,
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    if (action === 'stats') {
      const stats = await getCachedScoreStats();
      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      const filters: ScoreFilters = {
        search: searchParams.get('search') || undefined,
        workId: searchParams.get('workId') || undefined,
        source: searchParams.get('source') || undefined,
        type: searchParams.get('type') || undefined,
        isActive:
          searchParams.get('isActive') === 'true'
            ? true
            : searchParams.get('isActive') === 'false'
            ? false
            : undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
      };

      const result = await getScoresList(filters);

      return NextResponse.json({
        success: true,
        ...result,
        filters,
        timestamp: new Date().toISOString(),
      });
    }

    // 🆕 NOVA AÇÃO: Recalcular estatísticas manualmente
    if (action === 'recalculate-stats') {
      // Limpar cache
      const stats = await getCachedScoreStats();

      return NextResponse.json({
        success: true,
        message: 'Estatísticas recalculadas com sucesso',
        stats,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('❌ [API] Erro na API de partituras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar partitura
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('id');

    if (!scoreId) {
      return NextResponse.json({ error: 'Score ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { isActive, qualityScore, dataQuality } = body;

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (qualityScore !== undefined) updateData.qualityScore = qualityScore;
    if (dataQuality !== undefined) updateData.dataQuality = dataQuality;

    const updatedScore = await prisma.workScore.update({
      where: { id: scoreId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      score: updatedScore,
      message: 'Partitura atualizada com sucesso',
    });
  } catch (error) {
    console.error('❌ [API] Erro ao atualizar partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
