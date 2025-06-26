// app/libs/scores-cache-service-optimized.ts - Sistema Ultra-Performático com Carregamento Incremental
import prisma from '@/app/libs/prismadb';
import {
  IMSLPWorkScores,
  IMSLPScore,
  IMSLPScoreGroup,
} from './imslp-score-scraper';
import { ScoreSource, IMSLPScoreType, ProcessingStatus } from '@prisma/client';

export interface CachedScoresResult {
  scores: IMSLPWorkScores | null;
  fromCache: boolean;
  needsProcessing: boolean;
  hasMore: boolean; // 🆕 Indica se há mais partituras para carregar
  totalAvailable: number; // 🆕 Total de partituras disponíveis
  cacheStats: {
    totalCached: number;
    lastUpdated: Date | null;
    completeness: number;
  };
}

export interface ScoreCacheOptions {
  maxAge?: number;
  forceRefresh?: boolean;
  priorityScore?: string;
  backgroundUpdate?: boolean;
  limit?: number; // 🆕 Limite de partituras a retornar
  offset?: number; // 🆕 Offset para paginação
  loadAll?: boolean; // 🆕 Se deve carregar todas as partituras
}

export class ScoresCacheServiceOptimized {
  private static readonly DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias
  private static readonly SELECTED_SCORE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dias
  private static readonly INITIAL_LOAD_LIMIT = 5; // 🆕 Limite inicial de partituras
  private static readonly MAX_LOAD_LIMIT = 50; // 🆕 Limite máximo por requisição

  /**
   * 🚀 Método principal otimizado: Carregamento incremental inteligente
   */
  static async getWorkScores(
    workId: string,
    options: ScoreCacheOptions = {}
  ): Promise<CachedScoresResult> {
    const {
      maxAge = this.DEFAULT_CACHE_TTL,
      forceRefresh = false,
      limit = this.INITIAL_LOAD_LIMIT,
      offset = 0,
      loadAll = false,
    } = options;

    console.log(
      `🎼 [CACHE-OPT] Verificando cache para obra ${workId} (limit: ${limit}, offset: ${offset})`
    );

    if (!forceRefresh) {
      // 1. Verificar cache com carregamento incremental
      const cached = await this.getCachedScoresIncremental(
        workId,
        maxAge,
        limit,
        offset,
        loadAll
      );
      if (cached) {
        console.log(
          `✅ [CACHE-OPT] Cache hit para obra ${workId} - ${
            cached.scores?.totalCounts
              ? Object.values(cached.scores.totalCounts).reduce(
                  (a, b) => a + b,
                  0
                )
              : 0
          } partituras`
        );

        // Atualizar lastAccessed em background
        this.updateAccessStats(workId).catch(console.error);

        return cached;
      }
    }

    console.log(
      `⏳ [CACHE-OPT] Cache miss - será necessário scraping para obra ${workId}`
    );

    // 2. Retornar indicação de que precisa de scraping
    return {
      scores: null,
      fromCache: false,
      needsProcessing: true,
      hasMore: false,
      totalAvailable: 0,
      cacheStats: {
        totalCached: 0,
        lastUpdated: null,
        completeness: 0,
      },
    };
  }

  /**
   * 🚀 Salvar partituras IMSLP com processamento incremental otimizado
   */
  static async cacheScoresFromIMSLP(
    workId: string,
    imslpData: IMSLPWorkScores,
    priorityScoreId?: string
  ): Promise<void> {
    console.log(`💾 [CACHE-OPT] Iniciando cache otimizado para obra ${workId}`);
    const startTime = Date.now();

    try {
      // 1. Verificar se já existe cache para evitar duplicação
      const existingScores = await this.getExistingScoreIds(workId);

      // 2. Se há uma partitura prioritária, salvar imediatamente
      if (priorityScoreId) {
        await this.savePriorityScoreOptimized(
          workId,
          imslpData,
          priorityScoreId,
          existingScores
        );
      }

      // 3. Salvar primeiras 5 partituras com alta prioridade
      await this.saveInitialScoresBatch(
        workId,
        imslpData,
        priorityScoreId,
        existingScores
      );

      // 4. Processar o resto em background
      this.saveRemainingScoresBackground(
        workId,
        imslpData,
        priorityScoreId,
        existingScores
      ).catch((error) => {
        console.error(
          `❌ [CACHE-OPT] Erro no processamento background:`,
          error
        );
      });

      console.log(
        `✅ [CACHE-OPT] Cache inicial otimizado para obra ${workId} em ${
          Date.now() - startTime
        }ms`
      );
    } catch (error) {
      console.error(`❌ [CACHE-OPT] Erro ao cachear partituras:`, error);
    }
  }

  /**
   * 🚀 Salvar partitura selecionada imediatamente (para melhor UX)
   */
  static async saveSelectedScoreImmediately(
    workId: string,
    scoreData: IMSLPScore
  ): Promise<boolean> {
    console.log(
      `⚡ [CACHE-OPT] Salvando partitura selecionada imediatamente: ${scoreData.id}`
    );

    try {
      // Verificar se já existe
      const existing = await prisma.workScore.findUnique({
        where: {
          workId_sourceId_source: {
            workId,
            sourceId: scoreData.id,
            source: ScoreSource.IMSLP,
          },
        },
      });

      if (existing) {
        console.log(
          `✅ [CACHE-OPT] Partitura selecionada já existe no cache: ${scoreData.id}`
        );
        return true;
      }

      await this.saveScore(workId, scoreData, {
        priority: 10, // Prioridade máxima
        ttl: this.SELECTED_SCORE_TTL,
      });

      console.log(
        `✅ [CACHE-OPT] Partitura selecionada salva: ${scoreData.title}`
      );
      return true;
    } catch (error) {
      console.error(
        `❌ [CACHE-OPT] Erro ao salvar partitura selecionada:`,
        error
      );
      return false;
    }
  }

  /**
   * 🚀 Obter partituras do cache com carregamento incremental
   */
  private static async getCachedScoresIncremental(
    workId: string,
    maxAge: number,
    limit: number,
    offset: number,
    loadAll: boolean
  ): Promise<CachedScoresResult | null> {
    try {
      const cutoffDate = new Date(Date.now() - maxAge);

      // Primeiro, contar o total disponível
      const totalCount = await prisma.workScore.count({
        where: {
          workId,
          isActive: true,
          OR: [
            { expiresAt: { gt: new Date() } },
            { expiresAt: null },
            { lastVerified: { gt: cutoffDate } },
          ],
        },
      });

      if (totalCount === 0) {
        return null;
      }

      // Se deve carregar todas ou não há limite, buscar todas
      const actualLimit = loadAll ? undefined : limit;
      const actualOffset = loadAll ? undefined : offset;

      // Buscar partituras com paginação
      const cachedScores = await prisma.workScore.findMany({
        where: {
          workId,
          isActive: true,
          OR: [
            { expiresAt: { gt: new Date() } },
            { expiresAt: null },
            { lastVerified: { gt: cutoffDate } },
          ],
        },
        orderBy: [
          { priority: 'desc' }, // Prioridade primeiro
          { type: 'asc' },
          { groupIndex: 'asc' },
          { createdAt: 'desc' },
        ],
        ...(actualLimit && { take: actualLimit }),
        ...(actualOffset && { skip: actualOffset }),
      });

      // Converter para formato IMSLP
      const imslpData = this.convertCacheToIMSLP(cachedScores);

      // Calcular estatísticas
      const stats = await this.calculateCacheStats(workId, cachedScores);
      const hasMore = !loadAll && offset + cachedScores.length < totalCount;

      return {
        scores: imslpData,
        fromCache: true,
        needsProcessing: false,
        hasMore,
        totalAvailable: totalCount,
        cacheStats: stats,
      };
    } catch (error) {
      console.error(`❌ [CACHE-OPT] Erro ao obter cache incremental:`, error);
      return null;
    }
  }

  /**
   * 🚀 Salvar lote inicial de partituras (5 primeiras)
   */
  private static async saveInitialScoresBatch(
    workId: string,
    imslpData: IMSLPWorkScores,
    excludeScoreId?: string,
    existingScoreIds: Set<string> = new Set()
  ): Promise<void> {
    console.log(
      `⚡ [CACHE-OPT] Salvando lote inicial de partituras para obra ${workId}`
    );

    let savedCount = 0;
    const maxInitial = this.INITIAL_LOAD_LIMIT;

    // Priorizar 'scores' primeiro, depois 'parts', etc.
    const typeOrder = [
      'scores',
      'parts',
      'arrangements',
      'librettos',
      'others',
      'sources',
    ];

    for (const type of typeOrder) {
      if (savedCount >= maxInitial) break;

      const groups =
        imslpData.scoresByType[type as keyof typeof imslpData.scoresByType];
      if (!groups || groups.length === 0) continue;

      for (const group of groups) {
        if (savedCount >= maxInitial) break;

        for (const score of group.scores) {
          if (savedCount >= maxInitial) break;

          // Skip se for a partitura prioritária ou se já existe
          if (score.id === excludeScoreId || existingScoreIds.has(score.id)) {
            continue;
          }

          try {
            await this.saveScore(workId, score, {
              priority: 8, // Alta prioridade para lote inicial
              ttl: this.DEFAULT_CACHE_TTL,
            });
            savedCount++;
          } catch (error) {
            console.error(
              `❌ [CACHE-OPT] Erro ao salvar partitura inicial ${score.id}:`,
              error
            );
          }
        }
      }
    }

    console.log(`✅ [CACHE-OPT] Lote inicial salvo: ${savedCount} partituras`);
  }

  /**
   * 🚀 Salvar partituras restantes em background
   */
  private static async saveRemainingScoresBackground(
    workId: string,
    imslpData: IMSLPWorkScores,
    excludeScoreId?: string,
    existingScoreIds: Set<string> = new Set()
  ): Promise<void> {
    console.log(
      `🔄 [CACHE-OPT] Processamento background otimizado iniciado para obra ${workId}`
    );

    // Criar log de processamento com filtro de duplicação
    const existingLog = await prisma.scoreProcessingLog.findFirst({
      where: {
        workId,
        action: 'cache_scores_background',
        status: { in: [ProcessingStatus.PENDING, ProcessingStatus.PROCESSING] },
      },
    });

    if (existingLog) {
      console.log(
        `⏩ [CACHE-OPT] Job de background já existe para obra ${workId}, pulando duplicação`
      );
      return;
    }

    const logEntry = await prisma.scoreProcessingLog.create({
      data: {
        workId,
        action: 'cache_scores_background',
        status: ProcessingStatus.PROCESSING,
        startedAt: new Date(),
        itemsTotal: this.countTotalScores(imslpData) - this.INITIAL_LOAD_LIMIT,
      },
    });

    try {
      let successCount = 0;
      let failureCount = 0;
      let skipCount = this.INITIAL_LOAD_LIMIT; // Já salvamos as primeiras

      // Processar em lotes pequenos para não sobrecarregar
      const batchSize = 10;
      const allScores = this.getAllScoresFlat(imslpData);
      const remainingScores = allScores.slice(this.INITIAL_LOAD_LIMIT);

      for (let i = 0; i < remainingScores.length; i += batchSize) {
        const batch = remainingScores.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (score) => {
            // Skip da partitura prioritária ou existente
            if (score.id === excludeScoreId || existingScoreIds.has(score.id)) {
              skipCount++;
              return;
            }

            try {
              await this.saveScore(workId, score, {
                priority: this.getScorePriority(score),
                ttl: this.DEFAULT_CACHE_TTL,
              });
              successCount++;
            } catch (error) {
              console.error(
                `❌ [CACHE-OPT] Erro ao salvar partitura ${score.id}:`,
                error
              );
              failureCount++;
            }
          })
        );

        // Pequena pausa entre lotes para não sobrecarregar
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Atualizar log de sucesso
      await prisma.scoreProcessingLog.update({
        where: { id: logEntry.id },
        data: {
          status: ProcessingStatus.COMPLETED,
          completedAt: new Date(),
          duration: Date.now() - logEntry.startedAt!.getTime(),
          itemsSuccess: successCount,
          itemsFailed: failureCount,
          itemsSkipped: skipCount,
        },
      });

      console.log(
        `✅ [CACHE-OPT] Background otimizado completo: ${successCount} salvas, ${failureCount} falhas, ${skipCount} skips`
      );
    } catch (error) {
      // Atualizar log de erro
      await prisma.scoreProcessingLog.update({
        where: { id: logEntry.id },
        data: {
          status: ProcessingStatus.FAILED,
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });

      throw error;
    }
  }

  /**
   * 🚀 Obter IDs de partituras existentes para evitar duplicação
   */
  private static async getExistingScoreIds(
    workId: string
  ): Promise<Set<string>> {
    try {
      const existingScores = await prisma.workScore.findMany({
        where: {
          workId,
          isActive: true,
        },
        select: {
          sourceId: true,
        },
      });

      return new Set(existingScores.map((score) => score.sourceId));
    } catch (error) {
      console.error(`❌ [CACHE-OPT] Erro ao obter IDs existentes:`, error);
      return new Set();
    }
  }

  /**
   * 🚀 Salvar partitura prioritária otimizada
   */
  private static async savePriorityScoreOptimized(
    workId: string,
    imslpData: IMSLPWorkScores,
    priorityScoreId: string,
    existingScoreIds: Set<string>
  ): Promise<void> {
    console.log(
      `⚡ [CACHE-OPT] Salvando partitura prioritária otimizada ${priorityScoreId}`
    );

    if (existingScoreIds.has(priorityScoreId)) {
      console.log(
        `✅ [CACHE-OPT] Partitura prioritária já existe: ${priorityScoreId}`
      );
      return;
    }

    const priorityScore = this.findScoreInIMSLPData(imslpData, priorityScoreId);

    if (priorityScore) {
      await this.saveScore(workId, priorityScore, {
        priority: 10,
        ttl: this.SELECTED_SCORE_TTL,
      });

      console.log(
        `✅ [CACHE-OPT] Partitura prioritária salva: ${priorityScore.title}`
      );
    }
  }

  /**
   * 🚀 Utilitários otimizados
   */
  private static getAllScoresFlat(imslpData: IMSLPWorkScores): IMSLPScore[] {
    const allScores: IMSLPScore[] = [];

    for (const groups of Object.values(imslpData.scoresByType)) {
      for (const group of groups) {
        allScores.push(...group.scores);
      }
    }

    return allScores;
  }

  // Manter métodos existentes com otimizações
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
      cacheVersion: '2.0',
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

  // Manter outros métodos existentes com otimizações...
  private static convertCacheToIMSLP(cachedScores: any[]): IMSLPWorkScores {
    const scoresByType: any = {
      scores: [],
      parts: [],
      arrangements: [],
      librettos: [],
      others: [],
      sources: [],
    };

    const totalCounts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      librettos: 0,
      others: 0,
      sources: 0,
    };

    // Agrupar por tipo
    const groupedByType = cachedScores.reduce((acc, score) => {
      const type = score.type.toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(score);
      return acc;
    }, {});

    // Converter cada tipo
    for (const [type, scores] of Object.entries(groupedByType)) {
      const typedScores = scores as any[];
      totalCounts[type as keyof typeof totalCounts] = typedScores.length;

      // Agrupar por groupIndex
      const groupedByIndex = typedScores.reduce((acc, score) => {
        const groupIndex = score.groupIndex || 0;
        if (!acc[groupIndex]) acc[groupIndex] = [];
        acc[groupIndex].push(this.convertCacheScoreToIMSLP(score));
        return acc;
      }, {});

      // Criar grupos
      scoresByType[type] = Object.entries(groupedByIndex)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([groupIndex, groupScores]) => ({
          groupIndex: parseInt(groupIndex),
          scores: groupScores,
          groupTitle: groupScores[0]?.title || undefined,
        }));
    }

    return {
      workTitle: 'Cached Work',
      scoresByType,
      totalCounts,
    };
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

  private static findScoreInIMSLPData(
    imslpData: IMSLPWorkScores,
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

  private static countTotalScores(imslpData: IMSLPWorkScores): number {
    return Object.values(imslpData.totalCounts).reduce(
      (sum, count) => sum + count,
      0
    );
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

  private static async calculateCacheStats(
    workId: string,
    cachedScores: any[]
  ) {
    const lastUpdated = cachedScores.reduce((latest, score) => {
      const scoreDate = new Date(score.updatedAt);
      return latest > scoreDate ? latest : scoreDate;
    }, new Date(0));

    return {
      totalCached: cachedScores.length,
      lastUpdated: lastUpdated > new Date(0) ? lastUpdated : null,
      completeness: Math.min(cachedScores.length / 10, 1),
    };
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

  // Métodos de limpeza e manutenção
  static async cleanExpiredCache(olderThanDays: number = 30): Promise<number> {
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
      `🧹 [CACHE-OPT] ${result.count} partituras marcadas como inativas`
    );
    return result.count;
  }

  static async getCacheStatistics() {
    const stats = await prisma.workScore.groupBy({
      by: ['source', 'type'],
      _count: true,
      where: { isActive: true },
    });

    const processingStats = await prisma.scoreProcessingLog.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return { cacheStats: stats, processingStats };
  }

  /**
   * 🆕 Adicionar partitura customizada otimizada
   */
  static async addCustomScore(
    workId: string,
    scoreData: {
      title: string;
      fileUrl?: string;
      fileSize?: string;
      pageCount?: string;
      type: IMSLPScoreType;
      editor?: string;
      publisher?: string;
      notes?: string;
      uploadedBy?: string;
      customData?: any;
    }
  ): Promise<string> {
    const customScore = await prisma.workScore.create({
      data: {
        workId,
        sourceId: `custom_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        source: ScoreSource.CUSTOM,
        title: scoreData.title,
        downloadUrl: scoreData.fileUrl,
        fileSize: scoreData.fileSize,
        pageCount: scoreData.pageCount,
        type: scoreData.type,
        editor: scoreData.editor,
        publisher: scoreData.publisher,
        notes: scoreData.notes,
        uploadedBy: scoreData.uploadedBy,
        customData: scoreData.customData,
        isCustom: true,
        isVerified: true,
        isActive: true,
        processingStatus: ProcessingStatus.COMPLETED,
        priority: 8, // Alta prioridade para partituras customizadas
        cacheVersion: '2.0',
      },
    });

    console.log(
      `✅ [CACHE-OPT] Partitura customizada adicionada: ${scoreData.title}`
    );
    return customScore.id;
  }
}
