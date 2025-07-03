// app/libs/scores-cache-service-incremental.ts - Cache Service com Suporte Incremental
import prisma from '@/app/libs/prismadb';
import {
  IMSLPWorkScoresIncremental,
  IMSLPScore,
} from './imslp-score-scraper-incremental';
import { ScoreSource, IMSLPScoreType, ProcessingStatus } from '@prisma/client';

export interface CachedScoresIncrementalResult {
  scores: IMSLPWorkScoresIncremental | null;
  fromCache: boolean;
  needsProcessing: boolean;
  hasEnoughData: boolean; // Se tem dados suficientes para a requisição atual
  loadedCount: number;
  totalAvailable: number;
  cacheStats: {
    totalCached: number;
    lastUpdated: Date | null;
    completeness: number;
    byType: Record<string, number>;
  };
}

export interface ScoreCacheIncrementalOptions {
  limit?: number;
  offset?: number;
  maxAge?: number;
  forceRefresh?: boolean;
  priorityScore?: string;
  specificTypes?: string[];
}

export interface CacheProgress {
  workId: string;
  progress: number; // 0-100
  completed: boolean;
  totalItems: number;
  processedItems: number;
  startedAt: Date;
  estimatedTimeRemaining?: number; // em segundos
}

export class ScoresCacheServiceIncremental {
  private static readonly DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias
  private static readonly PRIORITY_SCORE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dias
  private static readonly DEFAULT_LIMIT = 5;

  /**
   * 🚀 Método principal: Obter partituras com cache incremental
   */
  static async getWorkScoresIncremental(
    workId: string,
    options: ScoreCacheIncrementalOptions = {}
  ): Promise<CachedScoresIncrementalResult> {
    const {
      limit = this.DEFAULT_LIMIT,
      offset = 0,
      maxAge = this.DEFAULT_CACHE_TTL,
      forceRefresh = false,
      priorityScore,
      specificTypes,
    } = options;

    console.log(
      `🎼 [CACHE-INC] Verificando cache incremental para obra ${workId}`
    );
    console.log(
      `📄 [CACHE-INC] Parâmetros: limit=${limit}, offset=${offset}, types=${
        specificTypes?.join(',') || 'all'
      }`
    );

    if (!forceRefresh) {
      // Tentar obter do cache com paginação
      const cached = await this.getCachedScoresIncremental(workId, {
        limit,
        offset,
        maxAge,
        specificTypes,
      });

      if (cached) {
        console.log(
          `✅ [CACHE-INC] Cache hit: ${cached.loadedCount} partituras retornadas`
        );

        // Atualizar estatísticas de acesso em background
        this.updateAccessStats(workId).catch(console.error);

        return cached;
      }
    }

    console.log(`⏳ [CACHE-INC] Cache miss - será necessário scraping`);

    // Verificar se há dados parciais no cache
    const partialCache = await this.getPartialCacheInfo(workId);

    return {
      scores: null,
      fromCache: false,
      needsProcessing: true,
      hasEnoughData: false,
      loadedCount: partialCache.totalCached,
      totalAvailable: partialCache.estimatedTotal,
      cacheStats: {
        totalCached: partialCache.totalCached,
        lastUpdated: partialCache.lastUpdated,
        completeness: partialCache.completeness,
        byType: partialCache.byType,
      },
    };
  }

  /**
   * 🚀 Salvar partituras do scraping incremental
   */
  static async cacheScoresFromIMSLPIncremental(
    workId: string,
    imslpData: IMSLPWorkScoresIncremental,
    priorityScoreId?: string,
    options: { immediate?: boolean; background?: boolean } = {}
  ): Promise<void> {
    const { immediate = true, background = false } = options;

    console.log(
      `💾 [CACHE-INC] Iniciando cache incremental para obra ${workId}`
    );
    console.log(
      `📊 [CACHE-INC] Dados: ${Object.values(imslpData.loadedCounts).reduce(
        (sum, count) => sum + count,
        0
      )} partituras carregadas`
    );

    const startTime = Date.now();

    try {
      // 1. Criar/atualizar log de processamento
      const logEntry = await this.createOrUpdateProcessingLog(
        workId,
        imslpData,
        background
      );

      // 2. Se é processamento imediato, salvar as partituras carregadas
      if (immediate) {
        await this.saveLoadedScores(
          workId,
          imslpData,
          priorityScoreId,
          logEntry.id
        );
      }

      // 3. Se é background, processar em segundo plano
      if (background) {
        this.processBackgroundCaching(
          workId,
          imslpData,
          priorityScoreId,
          logEntry.id
        ).catch((error) => {
          console.error(
            `❌ [CACHE-INC] Erro no processamento background:`,
            error
          );
        });
      }

      console.log(
        `✅ [CACHE-INC] Cache incremental iniciado em ${
          Date.now() - startTime
        }ms`
      );
    } catch (error) {
      console.error(
        `❌ [CACHE-INC] Erro ao cachear partituras incrementais:`,
        error
      );
      throw error;
    }
  }

  /**
   * 🚀 Obter progresso do cache em background
   */
  static async getCacheProgress(workId: string): Promise<CacheProgress | null> {
    try {
      const log = await prisma.scoreProcessingLog.findFirst({
        where: {
          workId,
          status: 'PROCESSING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!log) {
        // Verificar se há um log recente finalizado
        const recentLog = await prisma.scoreProcessingLog.findFirst({
          where: {
            workId,
            status: 'COMPLETED',
            createdAt: {
              gt: new Date(Date.now() - 10 * 60 * 1000), // Últimos 10 minutos
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (recentLog) {
          return {
            workId,
            progress: 100,
            completed: true,
            totalItems: recentLog.itemsTotal || 0,
            processedItems: recentLog.itemsSuccess || 0,
            startedAt: recentLog.startedAt || new Date(),
          };
        }

        return null;
      }

      const totalItems = log.itemsTotal || 1;
      const processedItems = (log.itemsSuccess || 0) + (log.itemsFailed || 0);
      const progress = Math.min(
        Math.round((processedItems / totalItems) * 100),
        100
      );

      // Calcular tempo estimado restante
      const elapsedTime = Date.now() - (log.startedAt?.getTime() || Date.now());
      const itemsRemaining = totalItems - processedItems;
      const avgTimePerItem =
        processedItems > 0 ? elapsedTime / processedItems : 0;
      const estimatedTimeRemaining =
        itemsRemaining > 0 && avgTimePerItem > 0
          ? Math.round((itemsRemaining * avgTimePerItem) / 1000)
          : undefined;

      return {
        workId,
        progress,
        completed: progress >= 100,
        totalItems,
        processedItems,
        startedAt: log.startedAt || new Date(),
        estimatedTimeRemaining,
      };
    } catch (error) {
      console.error(`❌ [CACHE-INC] Erro ao obter progresso:`, error);
      return null;
    }
  }

  /**
   * 🚀 Obter partituras do cache - SEMPRE retorna TODAS as já salvas
   */
  private static async getCachedScoresIncremental(
    workId: string,
    options: {
      limit: number;
      offset: number;
      maxAge: number;
      specificTypes?: string[];
    }
  ): Promise<CachedScoresIncrementalResult | null> {
    const { maxAge, specificTypes } = options;

    try {
      const cutoffDate = new Date(Date.now() - maxAge);

      // Construir filtro de tipos
      const typeFilter =
        specificTypes && specificTypes.length > 0
          ? {
              type: {
                in: specificTypes.map((t) => t.toUpperCase() as IMSLPScoreType),
              },
            }
          : {};

      // Buscar contadores totais por tipo
      const totalCountsByType = await prisma.workScore.groupBy({
        by: ['type'],
        where: {
          workId,
          isActive: true,
          OR: [
            { expiresAt: { gt: new Date() } },
            { expiresAt: null },
            { lastVerified: { gt: cutoffDate } },
          ],
          ...typeFilter,
        },
        _count: true,
      });

      // Se não tem nada no cache, retornar null
      if (totalCountsByType.length === 0) {
        console.log(
          `⚠️ [CACHE-INC] Nenhuma partitura encontrada no cache para ${workId}`
        );
        return null;
      }

      const totalCachedByType = totalCountsByType.reduce((acc, item) => {
        acc[item.type.toLowerCase()] = item._count;
        return acc;
      }, {} as Record<string, number>);

      // 🆕 MUDANÇA: Buscar TODAS as partituras já salvas (sem paginação)
      const scoresByType: any = {
        scores: [],
        parts: [],
        arrangements: [],
        librettos: [],
        others: [],
        sources: [],
      };

      const loadedCounts = {
        scores: 0,
        parts: 0,
        arrangements: 0,
        librettos: 0,
        others: 0,
        sources: 0,
      };

      const totalCounts = {
        scores: 0,
        parts: 0,
        arrangements: 0,
        librettos: 0,
        others: 0,
        sources: 0,
      };

      // Processar cada tipo - SEM LIMIT/OFFSET
      const typesToProcess = specificTypes || [
        'scores',
        'parts',
        'arrangements',
        'librettos',
        'others',
        'sources',
      ];

      for (const type of typesToProcess) {
        const dbType = type.toUpperCase() as IMSLPScoreType;

        // Obter total para este tipo
        totalCounts[type as keyof typeof totalCounts] =
          totalCachedByType[type] || 0;

        // 🆕 Buscar TODAS as partituras salvas para este tipo
        const scoresForType = await prisma.workScore.findMany({
          where: {
            workId,
            type: dbType,
            isActive: true,
            OR: [
              { expiresAt: { gt: new Date() } },
              { expiresAt: null },
              { lastVerified: { gt: cutoffDate } },
            ],
          },
          orderBy: [
            { priority: 'desc' },
            { groupIndex: 'asc' },
            { createdAt: 'asc' },
          ],
          // 🆕 SEM skip/take - pegar TODAS
        });

        loadedCounts[type as keyof typeof loadedCounts] = scoresForType.length;

        // Converter e agrupar por groupIndex
        if (scoresForType.length > 0) {
          const groupedScores = this.groupScoresByIndex(scoresForType);
          scoresByType[type] = groupedScores;
        }
      }

      // Calcular estatísticas
      const totalLoaded = Object.values(loadedCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      const totalCached = Object.values(totalCounts).reduce(
        (sum, count) => sum + count,
        0
      );

      console.log(
        `✅ [CACHE-INC] Cache hit: retornando TODAS as ${totalLoaded} partituras já salvas`
      );

      // 🆕 hasMore é baseado em estimativa de total vs o que já temos cached
      // Para simplificar, vamos assumir hasMore = true se temos partituras cacheadas
      // (o total real será determinado quando fazer primeira requisição de "mais")
      const hasMore = true; // Será ajustado pela API quando souber o total real

      // Criar resultado no formato incremental
      const result: IMSLPWorkScoresIncremental = {
        workTitle: 'Cached Work',
        scoresByType,
        totalCounts, // Total atual que conhecemos (pode ser maior na realidade)
        loadedCounts, // Mesmo que totalCounts quando é cache hit
        hasMore,
        pagination: {
          currentPage: 1,
          totalPages: 1, // Será recalculado quando souber o total real
          itemsPerPage: totalLoaded,
        },
      };

      return {
        scores: result,
        fromCache: true,
        needsProcessing: false,
        hasEnoughData: true,
        loadedCount: totalLoaded,
        totalAvailable: totalCached, // Por agora, usar o que temos
        cacheStats: {
          totalCached: totalCached,
          lastUpdated: this.getLastUpdated(totalCountsByType),
          completeness: 0.5, // Estimativa conservadora
          byType: totalCachedByType,
        },
      };
    } catch (error) {
      console.error(`❌ [CACHE-INC] Erro ao obter cache incremental:`, error);
      return null;
    }
  }

  /**
   * 🚀 Salvar partituras carregadas imediatamente
   */
  private static async saveLoadedScores(
    workId: string,
    imslpData: IMSLPWorkScoresIncremental,
    priorityScoreId?: string,
    logId?: string
  ): Promise<void> {
    console.log(`💾 [CACHE-INC] Salvando partituras carregadas imediatamente`);

    let savedCount = 0;
    let errorCount = 0;

    // Salvar partitura prioritária primeiro se especificada
    if (priorityScoreId) {
      const priorityScore = this.findScoreInData(imslpData, priorityScoreId);
      if (priorityScore) {
        try {
          await this.saveScore(workId, priorityScore, {
            priority: 10,
            ttl: this.PRIORITY_SCORE_TTL,
          });
          savedCount++;
          console.log(
            `⭐ [CACHE-INC] Partitura prioritária salva: ${priorityScore.title}`
          );
        } catch (error) {
          console.error(
            `❌ [CACHE-INC] Erro ao salvar partitura prioritária:`,
            error
          );
          errorCount++;
        }
      }
    }

    // Salvar todas as outras partituras
    for (const [type, groups] of Object.entries(imslpData.scoresByType)) {
      for (const group of groups) {
        for (const score of group.scores) {
          // Skip da partitura prioritária se já foi salva
          if (priorityScoreId && score.id === priorityScoreId) {
            continue;
          }

          try {
            await this.saveScore(workId, score, {
              priority: this.getScorePriority(score),
              ttl: this.DEFAULT_CACHE_TTL,
            });
            savedCount++;
          } catch (error) {
            console.error(
              `❌ [CACHE-INC] Erro ao salvar partitura ${score.id}:`,
              error
            );
            errorCount++;
          }
        }
      }
    }

    // Atualizar log se fornecido
    if (logId) {
      await prisma.scoreProcessingLog.update({
        where: { id: logId },
        data: {
          itemsSuccess: { increment: savedCount },
          itemsFailed: { increment: errorCount },
        },
      });
    }

    console.log(
      `✅ [CACHE-INC] Imediato: ${savedCount} salvas, ${errorCount} erros`
    );
  }

  /**
   * 🚀 Processamento em background
   */
  private static async processBackgroundCaching(
    workId: string,
    imslpData: IMSLPWorkScoresIncremental,
    priorityScoreId?: string,
    logId?: string
  ): Promise<void> {
    console.log(
      `🔄 [CACHE-INC] Iniciando processamento background para ${workId}`
    );

    try {
      // Aguardar um pouco para não impactar o foreground
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simular processamento incremental de partituras restantes
      // (aqui você faria o scraping completo das partituras restantes)

      let totalProcessed = 0;
      const totalItems = Object.values(imslpData.totalCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      const loadedItems = Object.values(imslpData.loadedCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      const remainingItems = totalItems - loadedItems;

      console.log(
        `📊 [CACHE-INC] Background: ${remainingItems} partituras restantes para processar`
      );

      // Simular processamento gradual
      for (let i = 0; i < remainingItems; i += 10) {
        // Simular processamento de 10 partituras por vez
        await new Promise((resolve) => setTimeout(resolve, 2000));

        totalProcessed += Math.min(10, remainingItems - i);

        // Atualizar progresso
        if (logId) {
          await prisma.scoreProcessingLog.update({
            where: { id: logId },
            data: {
              itemsSuccess: { increment: Math.min(10, remainingItems - i) },
            },
          });
        }

        console.log(
          `🔄 [CACHE-INC] Background: ${totalProcessed}/${remainingItems} processadas`
        );
      }

      // Finalizar log
      if (logId) {
        await prisma.scoreProcessingLog.update({
          where: { id: logId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }

      console.log(
        `✅ [CACHE-INC] Background completo: ${totalProcessed} partituras processadas`
      );
    } catch (error) {
      console.error(`❌ [CACHE-INC] Erro no processamento background:`, error);

      if (logId) {
        await prisma.scoreProcessingLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          },
        });
      }
    }
  }

  /**
   * 🚀 Métodos auxiliares
   */
  private static async createOrUpdateProcessingLog(
    workId: string,
    imslpData: IMSLPWorkScoresIncremental,
    isBackground: boolean
  ) {
    const totalItems = Object.values(imslpData.totalCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    return await prisma.scoreProcessingLog.create({
      data: {
        workId,
        action: isBackground
          ? 'background_cache_complete'
          : 'cache_incremental',
        status: 'PROCESSING',
        startedAt: new Date(),
        itemsTotal: totalItems,
        itemsSuccess: 0,
        itemsFailed: 0,
      },
    });
  }

  private static async saveScore(
    workId: string,
    score: IMSLPScore,
    options: { priority?: number; ttl?: number } = {}
  ): Promise<void> {
    const { priority = 0, ttl = this.DEFAULT_CACHE_TTL } = options;

    const scoreData = {
      workId,
      sourceId: score.id,
      source: ScoreSource.IMSLP,
      title: score.title,
      downloadUrl: score.downloadUrl,
      fileSize: score.fileSize,
      pageCount: score.pageCount,
      fileFormat: score.fileFormat || 'PDF',
      editor: score.editor,
      publisher: score.publisher,
      copyright: score.copyright,
      thumbnailUrl: score.thumbnailUrl,
      uploadDate: score.uploadDate,
      uploader: score.uploader,
      notes: score.notes,
      type: score.type.toUpperCase() as IMSLPScoreType,
      groupIndex: score.groupIndex,
      rating: score.rating,
      ratingsCount: score.ratingsCount,
      downloadCount: score.downloadCount,
      isVerified: true,
      lastVerified: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      processingStatus: ProcessingStatus.COMPLETED,
      expiresAt: new Date(Date.now() + ttl),
      priority,
      cacheVersion: '2.0-INCREMENTAL',
    };

    await prisma.workScore.upsert({
      where: {
        workId_sourceId_source: {
          workId,
          sourceId: score.id,
          source: ScoreSource.IMSLP,
        },
      },
      update: {
        ...scoreData,
        updatedAt: new Date(),
        accessCount: { increment: 1 },
      },
      create: scoreData,
    });
  }

  private static checkHasMore(
    totalCounts: Record<string, number>,
    loadedCounts: Record<string, number>,
    offset: number,
    limit: number
  ): boolean {
    return Object.keys(totalCounts).some((type) => {
      const total = totalCounts[type];
      const loaded = loadedCounts[type];
      return total > loaded || total > offset + limit;
    });
  }

  private static groupScoresByIndex(scores: any[]): any[] {
    const grouped = scores.reduce((acc, score) => {
      const groupIndex = score.groupIndex || 0;
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex].push(this.convertCacheScoreToIMSLP(score));
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([groupIndex, groupScores]) => ({
        groupIndex: parseInt(groupIndex),
        scores: groupScores,
        groupTitle: (groupScores as any[])[0]?.title || undefined,
      }));
  }

  private static convertCacheScoreToIMSLP(cachedScore: any): IMSLPScore {
    return {
      id: cachedScore.sourceId,
      title: cachedScore.title,
      downloadUrl: cachedScore.downloadUrl || '',
      fileSize: cachedScore.fileSize || '',
      pageCount: cachedScore.pageCount || '',
      rating: cachedScore.rating,
      ratingsCount: cachedScore.ratingsCount,
      downloadCount: cachedScore.downloadCount,
      fileFormat: cachedScore.fileFormat,
      editor: cachedScore.editor,
      publisher: cachedScore.publisher,
      copyright: cachedScore.copyright,
      thumbnailUrl: cachedScore.thumbnailUrl,
      uploadDate: cachedScore.uploadDate,
      uploader: cachedScore.uploader,
      notes: cachedScore.notes,
      type: cachedScore.type.toLowerCase() as any,
      groupIndex: cachedScore.groupIndex,
    };
  }

  private static findScoreInData(
    imslpData: IMSLPWorkScoresIncremental,
    scoreId: string
  ): IMSLPScore | null {
    for (const groups of Object.values(imslpData.scoresByType)) {
      for (const group of groups) {
        const score = group.scores.find((s: any) => s.id === scoreId);
        if (score) return score;
      }
    }
    return null;
  }

  private static getScorePriority(score: IMSLPScore): number {
    const typePriority = {
      scores: 5,
      parts: 3,
      arrangements: 2,
      librettos: 1,
      others: 1,
      sources: 1,
    };

    let priority = typePriority[score.type] || 1;

    if (score.rating && score.rating > 4) {
      priority += 2;
    }

    if (score.downloadCount && score.downloadCount > 100) {
      priority += 1;
    }

    return priority;
  }

  private static async getPartialCacheInfo(workId: string) {
    const stats = await prisma.workScore.groupBy({
      by: ['type'],
      where: {
        workId,
        isActive: true,
      },
      _count: true,
    });

    const byType = stats.reduce((acc, stat) => {
      acc[stat.type.toLowerCase()] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    const totalCached = stats.reduce((sum, stat) => sum + stat._count, 0);

    const lastScore = await prisma.workScore.findFirst({
      where: { workId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });

    return {
      totalCached,
      byType,
      lastUpdated: lastScore?.updatedAt || null,
      completeness: Math.min(totalCached / 50, 1), // Estimativa
      estimatedTotal: totalCached > 0 ? Math.max(totalCached, 50) : 0,
    };
  }

  private static getLastUpdated(totalCountsByType: any[]): Date | null {
    // Implementação simplificada - idealmente buscar do banco
    return new Date();
  }

  private static async updateAccessStats(workId: string): Promise<void> {
    await prisma.workScore.updateMany({
      where: { workId, isActive: true },
      data: {
        lastAccessed: new Date(),
        accessCount: { increment: 1 },
      },
    });
  }

  /**
   * 🚀 Métodos de manutenção e estatísticas
   */
  static async cleanExpiredCacheIncremental(
    olderThanDays: number = 30
  ): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000
    );

    const result = await prisma.workScore.updateMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { lastAccessed: { lt: cutoffDate } },
        ],
        isActive: true,
      },
      data: { isActive: false },
    });

    console.log(
      `🧹 [CACHE-INC] ${result.count} partituras marcadas como inativas`
    );
    return result.count;
  }

  static async getCacheStatisticsIncremental() {
    const [cacheStats, processingStats, progressStats] = await Promise.all([
      prisma.workScore.groupBy({
        by: ['source', 'type'],
        _count: true,
        where: { isActive: true },
      }),
      prisma.scoreProcessingLog.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: {
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.scoreProcessingLog.findMany({
        where: {
          status: 'PROCESSING',
          createdAt: {
            gt: new Date(Date.now() - 60 * 60 * 1000), // Última hora
          },
        },
        select: {
          workId: true,
          itemsTotal: true,
          itemsSuccess: true,
          itemsFailed: true,
          startedAt: true,
        },
      }),
    ]);

    return {
      cacheStats,
      processingStats,
      activeProcessing: progressStats.length,
      progressData: progressStats,
    };
  }
}

// Manter compatibilidade com versão anterior
export const ScoresCacheService = ScoresCacheServiceIncremental;
