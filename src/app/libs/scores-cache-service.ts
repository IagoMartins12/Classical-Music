// app/libs/scores-cache-service.ts - Sistema Ultra-Performático de Cache de Partituras
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
  cacheStats: {
    totalCached: number;
    lastUpdated: Date | null;
    completeness: number; // 0-1, quão completo está o cache
  };
}

export interface ScoreCacheOptions {
  maxAge?: number; // Idade máxima em ms (padrão: 7 dias)
  forceRefresh?: boolean;
  priorityScore?: string; // ID da partitura a ser priorizada
  backgroundUpdate?: boolean; // Se deve atualizar em background
}

export class ScoresCacheService {
  private static readonly DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias
  private static readonly SELECTED_SCORE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dias para selectedScore

  /**
   * 🚀 Método principal: Obter partituras com cache inteligente
   */
  static async getWorkScores(
    workId: string,
    options: ScoreCacheOptions = {}
  ): Promise<CachedScoresResult> {
    const { maxAge = this.DEFAULT_CACHE_TTL, forceRefresh = false } = options;

    console.log(`🎼 [CACHE] Verificando cache para obra ${workId}`);

    if (!forceRefresh) {
      // 1. Tentar obter do cache primeiro
      const cached = await this.getCachedScores(workId, maxAge);
      if (cached) {
        console.log(`✅ [CACHE] Cache hit para obra ${workId}`);

        // Atualizar lastAccessed em background
        this.updateAccessStats(workId).catch(console.error);

        return cached;
      }
    }

    console.log(
      `⏳ [CACHE] Cache miss - será necessário scraping para obra ${workId}`
    );

    // 2. Retornar indicação de que precisa de scraping
    return {
      scores: null,
      fromCache: false,
      needsProcessing: true,
      cacheStats: {
        totalCached: 0,
        lastUpdated: null,
        completeness: 0,
      },
    };
  }

  /**
   * 🚀 Salvar partituras IMSLP no cache (chamado após scraping)
   */
  static async cacheScoresFromIMSLP(
    workId: string,
    imslpData: IMSLPWorkScores,
    priorityScoreId?: string
  ): Promise<void> {
    console.log(`💾 [CACHE] Iniciando cache de partituras para obra ${workId}`);
    const startTime = Date.now();

    try {
      // 1. Se há uma partitura prioritária, salvar imediatamente
      if (priorityScoreId) {
        await this.savePriorityScore(workId, imslpData, priorityScoreId);
      }

      // 2. Salvar o resto em background (não bloqueia)
      this.saveAllScoresBackground(workId, imslpData, priorityScoreId).catch(
        (error) => {
          console.error(`❌ [CACHE] Erro no processamento background:`, error);
        }
      );

      console.log(
        `✅ [CACHE] Cache iniciado para obra ${workId} em ${
          Date.now() - startTime
        }ms`
      );
    } catch (error) {
      console.error(`❌ [CACHE] Erro ao cachear partituras:`, error);
    }
  }

  /**
   * 🚀 Obter partituras do cache com verificação de validade
   */
  private static async getCachedScores(
    workId: string,
    maxAge: number
  ): Promise<CachedScoresResult | null> {
    try {
      const cutoffDate = new Date(Date.now() - maxAge);

      // Buscar partituras válidas do cache
      const cachedScores = await prisma.workScore.findMany({
        where: {
          workId,
          isActive: true,
          OR: [
            { expiresAt: { gt: new Date() } }, // Não expiradas
            { expiresAt: null }, // Sem expiração
            { lastVerified: { gt: cutoffDate } }, // Verificadas recentemente
          ],
        },
        orderBy: [{ type: 'asc' }, { groupIndex: 'asc' }],
      });

      if (cachedScores.length === 0) {
        return null;
      }

      // Converter para formato IMSLP
      const imslpData = this.convertCacheToIMSLP(cachedScores);

      // Calcular estatísticas do cache
      const stats = await this.calculateCacheStats(workId, cachedScores);

      return {
        scores: imslpData,
        fromCache: true,
        needsProcessing: false,
        cacheStats: stats,
      };
    } catch (error) {
      console.error(`❌ [CACHE] Erro ao obter cache:`, error);
      return null;
    }
  }

  /**
   * 🚀 Salvar partitura prioritária imediatamente
   */
  private static async savePriorityScore(
    workId: string,
    imslpData: IMSLPWorkScores,
    priorityScoreId: string
  ): Promise<void> {
    console.log(`⚡ [CACHE] Salvando partitura prioritária ${priorityScoreId}`);

    // Encontrar a partitura prioritária nos dados IMSLP
    const priorityScore = this.findScoreInIMSLPData(imslpData, priorityScoreId);

    if (priorityScore) {
      await this.saveScore(workId, priorityScore, {
        priority: 10, // Alta prioridade
        ttl: this.SELECTED_SCORE_TTL,
      });

      console.log(
        `✅ [CACHE] Partitura prioritária salva: ${priorityScore.title}`
      );
    }
  }

  /**
   * 🚀 Salvar todas as partituras em background
   */
  private static async saveAllScoresBackground(
    workId: string,
    imslpData: IMSLPWorkScores,
    excludeScoreId?: string
  ): Promise<void> {
    console.log(
      `🔄 [CACHE] Processamento background iniciado para obra ${workId}`
    );

    // Criar log de processamento
    const logEntry = await prisma.scoreProcessingLog.create({
      data: {
        workId,
        action: 'cache_scores',
        status: 'PROCESSING',
        startedAt: new Date(),
        itemsTotal: this.countTotalScores(imslpData),
      },
    });

    try {
      let successCount = 0;
      let failureCount = 0;
      let skipCount = 0;

      // Processar cada tipo de partitura
      for (const [type, groups] of Object.entries(imslpData.scoresByType)) {
        for (const group of groups) {
          for (const score of group.scores) {
            // Skip da partitura prioritária se já foi salva
            if (excludeScoreId && score.id === excludeScoreId) {
              skipCount++;
              continue;
            }

            try {
              await this.saveScore(workId, score, {
                priority: this.getScorePriority(score),
                ttl: this.DEFAULT_CACHE_TTL,
              });
              successCount++;
            } catch (error) {
              console.error(
                `❌ [CACHE] Erro ao salvar partitura ${score.id}:`,
                error
              );
              failureCount++;
            }
          }
        }
      }

      // Atualizar log de sucesso
      await prisma.scoreProcessingLog.update({
        where: { id: logEntry.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          duration: Date.now() - logEntry.startedAt!.getTime(),
          itemsSuccess: successCount,
          itemsFailed: failureCount,
          itemsSkipped: skipCount,
        },
      });

      console.log(
        `✅ [CACHE] Background completo: ${successCount} salvas, ${failureCount} falhas, ${skipCount} skips`
      );
    } catch (error) {
      // Atualizar log de erro
      await prisma.scoreProcessingLog.update({
        where: { id: logEntry.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });

      throw error;
    }
  }

  /**
   * 🚀 Salvar uma partitura individual
   */
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
      cacheVersion: '1.0',
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

  /**
   * 🚀 Converter cache para formato IMSLP
   */
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
      workTitle: 'Cached Work', // Pode ser melhorado buscando o título da obra
      scoresByType,
      totalCounts,
    };
  }

  /**
   * 🚀 Converter partitura do cache para formato IMSLP
   */
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

  /**
   * 🚀 Utilitários e helpers
   */
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
    // Prioridade baseada no tipo e qualidade
    const typePriority = {
      scores: 5, // Partituras completas têm prioridade
      parts: 3, // Partes individuais
      arrangements: 2, // Arranjos
      librettos: 1, // Libretos
      others: 1, // Outros
      sources: 1, // Fontes
    };

    let priority = typePriority[score.type] || 1;

    // Aumentar prioridade se tem rating alto
    if (score.rating && score.rating > 4) {
      priority += 2;
    }

    // Aumentar prioridade se tem muitos downloads
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
      completeness: Math.min(cachedScores.length / 10, 1), // Estimativa simples
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

  /**
   * 🚀 Métodos para limpeza e manutenção
   */
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

    console.log(`🧹 [CACHE] ${result.count} partituras marcadas como inativas`);
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
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
    });

    return { cacheStats: stats, processingStats };
  }

  /**
   * 🚀 Adicionar partitura customizada (não-IMSLP)
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
        priority: 5, // Prioridade média para partituras customizadas
        cacheVersion: '1.0',
      },
    });

    console.log(
      `✅ [CACHE] Partitura customizada adicionada: ${scoreData.title}`
    );
    return customScore.id;
  }
}
