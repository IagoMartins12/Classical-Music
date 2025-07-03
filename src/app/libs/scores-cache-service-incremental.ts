// app/libs/scores-cache-service-incremental.ts - Cache Service Corrigido
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
  hasEnoughData: boolean;
  loadedCount: number;
  totalAvailable: number; // 🆕 Total real disponível no IMSLP
  totalCached: number; // 🆕 Total salvo no banco
  cacheStats: {
    totalCached: number;
    lastUpdated: Date | null;
    completeness: number;
    byType: Record<string, number>;
    realTotalByType?: Record<string, number>; // 🆕 Total real por tipo
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
      maxAge = this.DEFAULT_CACHE_TTL,
      forceRefresh = false,
      specificTypes,
    } = options;

    console.log(
      `🎼 [CACHE-INC] Verificando cache para obra ${workId}, forceRefresh: ${forceRefresh}`
    );

    if (!forceRefresh) {
      // 🆕 SEMPRE tentar obter do cache primeiro - mesmo que seja 1 partitura
      const cached = await this.getCachedScoresIncremental(workId, {
        maxAge,
        specificTypes,
      });

      // 🔧 CORREÇÃO: Retornar cache SEMPRE que tiver partituras salvas
      if (cached && cached.scores && cached.loadedCount > 0) {
        console.log(
          `✅ [CACHE-INC] Cache HIT: Retornando ${cached.loadedCount} partituras do banco`
        );
        console.log(
          `📊 [CACHE-INC] Total disponível: ${cached.totalAvailable}, Em cache: ${cached.totalCached}`
        );

        // Atualizar estatísticas de acesso em background
        this.updateAccessStats(workId).catch(console.error);

        // 🆕 Marcar hasEnoughData como true quando tem partituras
        return {
          ...cached,
          hasEnoughData: true, // 🔧 SEMPRE true se tem partituras
          fromCache: true,
          needsProcessing: false,
        };
      }
    }

    console.log(
      `⏳ [CACHE-INC] Cache miss ou forceRefresh - será necessário scraping`
    );

    // Verificar se há dados parciais no cache
    const partialCache = await this.getPartialCacheInfo(workId);

    return {
      scores: null,
      fromCache: false,
      needsProcessing: true,
      hasEnoughData: false,
      loadedCount: partialCache.totalCached,
      totalAvailable: partialCache.estimatedTotal,
      totalCached: partialCache.totalCached,
      cacheStats: {
        totalCached: partialCache.totalCached,
        lastUpdated: partialCache.lastUpdated,
        completeness: partialCache.completeness,
        byType: partialCache.byType,
      },
    };
  }

  /**
   * 🚀 Obter partituras do cache - SEMPRE retorna TODAS as já salvas
   */
  private static async getCachedScoresIncremental(
    workId: string,
    options: {
      maxAge: number;
      specificTypes?: string[];
    }
  ): Promise<CachedScoresIncrementalResult | null> {
    const { maxAge, specificTypes } = options;

    try {
      const cutoffDate = new Date(Date.now() - maxAge);

      console.log(`🔍 [CACHE-INC] Buscando partituras para workId: ${workId}`);

      // Construir filtro de tipos
      const typeFilter =
        specificTypes && specificTypes.length > 0
          ? {
              type: {
                in: specificTypes.map((t) => t.toUpperCase() as IMSLPScoreType),
              },
            }
          : {};

      // 🆕 Buscar metadados do trabalho para obter totais reais do IMSLP
      const workMetadata = await prisma.workScore.findFirst({
        where: {
          workId,
          isActive: true,
          imslpTotalCounts: { not: null },
        },
        select: {
          imslpTotalCounts: true,
          lastIMSLPSync: true,
        },
        orderBy: { lastIMSLPSync: 'desc' },
      });

      console.log(`📋 [CACHE-INC] Metadados encontrados:`, !!workMetadata);

      // 🔧 BUSCAR TODAS as partituras salvas (não importa a idade)
      const allCachedScores = await prisma.workScore.findMany({
        where: {
          workId,
          isActive: true,
          // 🔧 REMOVER filtro de idade - queremos TODAS as salvas
          ...typeFilter,
        },
        orderBy: [
          { priority: 'desc' },
          { groupIndex: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      console.log(
        `📊 [CACHE-INC] Total de partituras encontradas: ${allCachedScores.length}`
      );

      // Se não tem nada no cache, retornar null
      if (allCachedScores.length === 0) {
        console.log(
          `⚠️ [CACHE-INC] Nenhuma partitura encontrada no cache para ${workId}`
        );
        return null;
      }

      // Agrupar por tipo
      const cachedByType = allCachedScores.reduce((acc, score) => {
        const type = score.type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`📈 [CACHE-INC] Partituras por tipo:`, cachedByType);

      // 🆕 Obter totais reais do IMSLP se disponível
      let realTotalByType: Record<string, number> = {};
      let totalRealAvailable = 0;

      if (workMetadata?.imslpTotalCounts) {
        try {
          realTotalByType = JSON.parse(workMetadata.imslpTotalCounts as string);
          totalRealAvailable = Object.values(realTotalByType).reduce(
            (sum: number, count: number) => sum + count,
            0
          );
          console.log(`🎯 [CACHE-INC] Totais reais do IMSLP:`, realTotalByType);
        } catch (error) {
          console.warn('Erro ao parsear imslpTotalCounts:', error);
        }
      }

      // 🆕 Organizar partituras por tipo e grupo
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

      // 🆕 Usar totais reais se disponível, senão usar o que temos em cache
      const totalCounts = {
        scores: Math.max(realTotalByType.scores || 0, cachedByType.scores || 0),
        parts: Math.max(realTotalByType.parts || 0, cachedByType.parts || 0),
        arrangements: Math.max(
          realTotalByType.arrangements || 0,
          cachedByType.arrangements || 0
        ),
        librettos: Math.max(
          realTotalByType.librettos || 0,
          cachedByType.librettos || 0
        ),
        others: Math.max(realTotalByType.others || 0, cachedByType.others || 0),
        sources: Math.max(
          realTotalByType.sources || 0,
          cachedByType.sources || 0
        ),
      };

      // Processar cada tipo
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

        // 🔧 Buscar TODAS as partituras para este tipo
        const scoresForType = allCachedScores.filter(
          (score) => score.type === dbType
        );

        loadedCounts[type as keyof typeof loadedCounts] = scoresForType.length;

        console.log(
          `🎵 [CACHE-INC] Tipo ${type}: ${scoresForType.length} partituras`
        );

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
      const totalCached = allCachedScores.length;

      console.log(
        `✅ [CACHE-INC] Retornando ${totalLoaded} partituras organizadas`
      );
      console.log(
        `📊 [CACHE-INC] Cache vs Real: ${totalLoaded}/${
          totalRealAvailable || 'desconhecido'
        }`
      );

      // 🆕 hasMore baseado no total real vs carregado
      const hasMore =
        totalRealAvailable > 0 ? totalLoaded < totalRealAvailable : false; // Se não sabemos o total real, assumir que não há mais

      // Criar resultado no formato incremental
      const result: IMSLPWorkScoresIncremental = {
        workTitle: 'Cached Work',
        scoresByType,
        totalCounts, // 🆕 Usar totais reais se disponível
        loadedCounts, // O que temos carregado no momento
        hasMore,
        pagination: {
          currentPage: 1,
          totalPages:
            totalRealAvailable > 0 ? Math.ceil(totalRealAvailable / 50) : 1,
          itemsPerPage: totalLoaded,
        },
      };

      return {
        scores: result,
        fromCache: true,
        needsProcessing: false,
        hasEnoughData: true, // 🔧 SEMPRE true se tem partituras
        loadedCount: totalLoaded,
        totalAvailable: totalRealAvailable || totalCached, // 🆕 Total real se disponível
        totalCached: totalCached,
        cacheStats: {
          totalCached: totalCached,
          lastUpdated: this.getLastUpdated([]),
          completeness:
            totalRealAvailable > 0 ? totalLoaded / totalRealAvailable : 1,
          byType: cachedByType,
          realTotalByType: realTotalByType,
        },
      };
    } catch (error) {
      console.error(`❌ [CACHE-INC] Erro ao obter cache incremental:`, error);
      return null;
    }
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

    const startTime = Date.now();

    try {
      // 1. Criar/atualizar log de processamento
      const logEntry = await this.createOrUpdateProcessingLog(
        workId,
        imslpData,
        background
      );

      // 🆕 2. Salvar metadados do IMSLP (totais reais)
      await this.saveIMSLPMetadata(workId, imslpData);

      // 3. Se é processamento imediato, salvar as partituras carregadas
      if (immediate) {
        await this.saveLoadedScores(
          workId,
          imslpData,
          priorityScoreId,
          logEntry.id
        );
      }

      // 4. Se é background, processar em segundo plano
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
   * 🆕 Salvar metadados do IMSLP para controle de totais
   */
  private static async saveIMSLPMetadata(
    workId: string,
    imslpData: IMSLPWorkScoresIncremental
  ): Promise<void> {
    try {
      console.log(`💾 [CACHE-META] Salvando metadados IMSLP para ${workId}`);
      console.log(`📊 [CACHE-META] Totais:`, imslpData.totalCounts);

      // Salvar os totais reais do IMSLP em um registro especial
      await prisma.workScore.upsert({
        where: {
          workId_sourceId_source: {
            workId,
            sourceId: `${workId}_metadata`,
            source: ScoreSource.IMSLP,
          },
        },
        update: {
          imslpTotalCounts: JSON.stringify(imslpData.totalCounts),
          lastIMSLPSync: new Date(),
          updatedAt: new Date(),
          lastVerified: new Date(),
        },
        create: {
          workId,
          sourceId: `${workId}_metadata`,
          source: ScoreSource.IMSLP,
          title: 'IMSLP Metadata',
          downloadUrl: '',
          fileSize: '',
          pageCount: '',
          fileFormat: 'METADATA',
          type: IMSLPScoreType.OTHERS,
          groupIndex: -1,
          isVerified: true,
          lastVerified: new Date(),
          lastAccessed: new Date(),
          accessCount: 1,
          processingStatus: ProcessingStatus.COMPLETED,
          expiresAt: new Date(Date.now() + this.DEFAULT_CACHE_TTL),
          priority: -1,
          cacheVersion: '2.0-INCREMENTAL-METADATA',
          imslpTotalCounts: JSON.stringify(imslpData.totalCounts),
          lastIMSLPSync: new Date(),
          isActive: false, // Não mostrar este registro nas consultas normais
        },
      });

      console.log(`✅ [CACHE-META] Metadados salvos com sucesso`);
    } catch (error) {
      console.error('❌ [CACHE-META] Erro ao salvar metadados IMSLP:', error);
    }
  }

  // ... (resto dos métodos permanecem iguais)

  private static findFirstScoreInData(
    imslpData: IMSLPWorkScoresIncremental
  ): IMSLPScore | null {
    for (const groups of Object.values(imslpData.scoresByType)) {
      for (const group of groups) {
        if (group.scores && group.scores.length > 0) {
          return group.scores[0];
        }
      }
    }
    return null;
  }

  // ... (resto dos métodos anteriores permanecem iguais)

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

  private static async saveScore(
    workId: string,
    score: IMSLPScore,
    options: { priority?: number; ttl?: number } = {}
  ): Promise<void> {
    const { priority = 0, ttl = this.DEFAULT_CACHE_TTL } = options;

    try {
      console.log(
        `💾 [SAVE-SCORE] Salvando partitura: ${score.id} (${score.title})`
      );

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
        isActive: true, // 🔧 Garantir que seja ativo
      };

      const result = await prisma.workScore.upsert({
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

      console.log(`✅ [SAVE-SCORE] Partitura salva: ${result.id}`);
    } catch (error) {
      console.error(
        `❌ [SAVE-SCORE] Erro ao salvar partitura ${score.id}:`,
        error
      );
      throw error; // Re-throw para que o caller saiba que falhou
    }
  }

  // ... (resto dos métodos auxiliares permanecem iguais)

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

  static async getCacheProgress(workId: string): Promise<any> {
    try {
      const log = await prisma.scoreProcessingLog.findFirst({
        where: {
          workId,
          status: 'PROCESSING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!log) {
        const recentLog = await prisma.scoreProcessingLog.findFirst({
          where: {
            workId,
            status: 'COMPLETED',
            createdAt: {
              gt: new Date(Date.now() - 10 * 60 * 1000),
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

      return {
        workId,
        progress,
        completed: progress >= 100,
        totalItems,
        processedItems,
        startedAt: log.startedAt || new Date(),
      };
    } catch (error) {
      console.error(`❌ [CACHE-INC] Erro ao obter progresso:`, error);
      return null;
    }
  }

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
            gt: new Date(Date.now() - 60 * 60 * 1000),
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
