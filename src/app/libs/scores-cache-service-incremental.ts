// app/libs/scores-cache-service-incremental.ts - CORRIGIDO para Retornar Todas as Partituras Salvas
import prisma from '@/app/libs/prismadb';
import { IMSLPWorkScoresIncremental } from './imslp-score-scraper-incremental';
import {
  ScoreCounts,
  sumScoreCounts,
  TabStatistics,
} from '../utils/type-utils';

interface CacheOptions {
  immediate?: boolean;
  background?: boolean;
  priorityScore?: string;
  specificTypes?: string[];
}

interface CacheResult {
  scores: IMSLPWorkScoresIncremental | null;
  fromCache: boolean;
  hasEnoughData: boolean;
  loadedCount: number;
  totalAvailable: number;
  totalCached: number;
  cacheStats?: {
    cacheHits: number;
    cacheMisses: number;
    lastUpdated: Date;
  };
}

export class ScoresCacheServiceIncremental {
  private static readonly CACHE_VERSION = '2.0-RETURN-ALL-CACHED';
  private static readonly DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

  /**
   * 🆕 LÓGICA PRINCIPAL: Retornar TODAS as partituras salvas no cache
   * 📋 Não aplicar limit/offset quando há cache - mostrar tudo que temos
   */
  static async getWorkScoresIncremental(
    workId: string,
    options: {
      limit?: number;
      offset?: number;
      priorityScore?: string;
      specificTypes?: string[];
    } = {}
  ): Promise<CacheResult> {
    const { limit = 5, offset = 0, priorityScore, specificTypes } = options;

    try {
      console.log(
        `💾 [CACHE-ALL] Buscando TODAS as partituras em cache para obra ${workId}`
      );
      console.log(
        `📊 [CACHE-ALL] Filtros: types=${specificTypes?.join(',') || 'todos'}`
      );

      // 🆕 Buscar TODAS as partituras em cache (sem limit/offset)
      const cachedScores = await prisma.workScore.findMany({
        where: {
          workId,
          isActive: true,
          ...(specificTypes && specificTypes.length > 0
            ? { type: { in: specificTypes as any[] } }
            : {}),
        },
        orderBy: [
          { type: 'asc' },
          { groupIndex: 'asc' },
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
      });

      if (!cachedScores || cachedScores.length === 0) {
        console.log(`❌ [CACHE-ALL] Cache miss para obra ${workId}`);
        return {
          scores: null,
          fromCache: false,
          hasEnoughData: false,
          loadedCount: 0,
          totalAvailable: 0,
          totalCached: 0,
        };
      }

      // 🆕 Verificar se o cache não está muito antigo
      const newestScore = cachedScores.reduce((newest, score) =>
        score.lastVerified > newest.lastVerified ? score : newest
      );

      const cacheAge = Date.now() - newestScore.lastVerified.getTime();
      if (cacheAge > this.DEFAULT_CACHE_TTL) {
        console.log(
          `⏰ [CACHE-ALL] Cache expirado para obra ${workId} (${Math.round(
            cacheAge / (1000 * 60 * 60)
          )}h)`
        );
        return {
          scores: null,
          fromCache: false,
          hasEnoughData: false,
          loadedCount: 0,
          totalAvailable: 0,
          totalCached: 0,
        };
      }

      // 🆕 Organizar TODAS as partituras por tipo e grupo
      const scoresByType = this.organizeScoresByType(cachedScores);

      // 🆕 Calcular contadores das partituras que REALMENTE temos em cache
      const loadedCounts = this.calculateLoadedCounts(scoresByType);

      // 🆕 Obter contadores totais dos metadados ou calcular
      const scoreWithTotals = cachedScores.find((s) => s.imslpTotalCounts);
      let totalCounts: ScoreCounts;

      if (scoreWithTotals?.imslpTotalCounts) {
        try {
          totalCounts = JSON.parse(scoreWithTotals.imslpTotalCounts);
        } catch {
          // Se falhar ao parsear, usar como base as partituras que temos
          totalCounts = this.calculateTotalCountsFromScores(cachedScores);
        }
      } else {
        // Se não temos metadados, usar as partituras existentes como base mínima
        totalCounts = this.calculateTotalCountsFromScores(cachedScores);
      }

      // 🆕 Aplicar filtros específicos aos totais se necessário
      let filteredTotalCounts = totalCounts;
      if (specificTypes && specificTypes.length > 0) {
        filteredTotalCounts = {
          scores: specificTypes.includes('scores') ? totalCounts.scores : 0,
          parts: specificTypes.includes('parts') ? totalCounts.parts : 0,
          arrangements: specificTypes.includes('arrangements')
            ? totalCounts.arrangements
            : 0,
          librettos: specificTypes.includes('librettos')
            ? totalCounts.librettos
            : 0,
          others: specificTypes.includes('others') ? totalCounts.others : 0,
          sources: specificTypes.includes('sources') ? totalCounts.sources : 0,
        };
      }

      // 🆕 Obter título da obra
      let workTitle = cachedScores[0]?.groupTitle || 'Obra Desconhecida';
      if (!workTitle || workTitle === 'Obra Desconhecida') {
        const work = await prisma.work.findUnique({
          where: { id: workId },
          select: { title: true },
        });
        workTitle = work?.title || 'Obra Desconhecida';
      }

      const workScores: IMSLPWorkScoresIncremental = {
        workTitle,
        scoresByType,
        totalCounts: filteredTotalCounts,
        loadedCounts,
        hasMore:
          sumScoreCounts(loadedCounts) < sumScoreCounts(filteredTotalCounts),
        pagination: {
          currentPage: 1, // Mostrando tudo em uma página
          totalPages: 1,
          itemsPerPage: sumScoreCounts(loadedCounts), // Todas as partituras carregadas
        },
      };

      const totalLoaded = sumScoreCounts(loadedCounts);
      const totalAvailable = sumScoreCounts(filteredTotalCounts);
      const totalCached = cachedScores.length;

      console.log(
        `✅ [CACHE-ALL] Cache hit: RETORNANDO TODAS as ${totalCached} partituras em cache`
      );
      console.log(
        `📊 [CACHE-ALL] Loaded/Available: ${totalLoaded}/${totalAvailable}`
      );
      console.log(`🎯 [CACHE-ALL] Por tipo:`, loadedCounts);

      return {
        scores: workScores,
        fromCache: true,
        hasEnoughData: true, // Sempre true quando há cache
        loadedCount: totalLoaded,
        totalAvailable,
        totalCached,
        cacheStats: {
          cacheHits: 1,
          cacheMisses: 0,
          lastUpdated: newestScore.lastVerified,
        },
      };
    } catch (error) {
      console.error(`❌ [CACHE-ALL] Erro ao buscar cache:`, error);
      return {
        scores: null,
        fromCache: false,
        hasEnoughData: false,
        loadedCount: 0,
        totalAvailable: 0,
        totalCached: 0,
      };
    }
  }

  /**
   * 🆕 Obter estatísticas de uma tab específica
   */
  static async getTabStatistics(
    workId: string,
    tabType: string
  ): Promise<TabStatistics> {
    try {
      console.log(
        `📊 [CACHE-ALL] Obtendo estatísticas da tab "${tabType}" para obra ${workId}`
      );

      const [cachedScores, totalMetadata] = await Promise.all([
        prisma.workScore.findMany({
          where: {
            workId,
            type: tabType as any,
            isActive: true,
          },
        }),
        prisma.workScore.findFirst({
          where: {
            workId,
            imslpTotalCounts: { not: null },
          },
          select: { imslpTotalCounts: true },
        }),
      ]);

      let totalForTab = 0;

      if (totalMetadata?.imslpTotalCounts) {
        try {
          const totals = JSON.parse(totalMetadata.imslpTotalCounts);
          totalForTab = totals[tabType] || 0;
        } catch {
          // Se falhar ao parsear, usar o que temos em cache como mínimo
          totalForTab = Math.max(cachedScores.length, 0);
        }
      } else {
        // Se não temos metadados, assumir que o que temos é o total por enquanto
        totalForTab = cachedScores.length;
      }

      const loadedForTab = cachedScores.length;
      const remaining = Math.max(0, totalForTab - loadedForTab);
      const hasMore = loadedForTab < totalForTab;
      const progress =
        totalForTab > 0 ? Math.round((loadedForTab / totalForTab) * 100) : 100;

      console.log(
        `📈 [CACHE-ALL] Tab "${tabType}": ${loadedForTab}/${totalForTab} (${progress}%)`
      );

      return {
        loaded: loadedForTab,
        total: totalForTab,
        remaining,
        hasMore,
        progress,
      };
    } catch (error) {
      console.error(`❌ [CACHE-ALL] Erro ao obter estatísticas da tab:`, error);
      return {
        loaded: 0,
        total: 0,
        remaining: 0,
        hasMore: false,
        progress: 0,
      };
    }
  }

  /**
   * 🆕 Obter estatísticas de todas as tabs
   */
  static async getAllTabsStatistics(workId: string): Promise<TabStatistics[]> {
    try {
      console.log(
        `📊 [CACHE-ALL] Obtendo estatísticas de todas as tabs para obra ${workId}`
      );

      const [cachedScores, totalMetadata] = await Promise.all([
        prisma.workScore.findMany({
          where: {
            workId,
            isActive: true,
          },
        }),
        prisma.workScore.findFirst({
          where: {
            workId,
            imslpTotalCounts: { not: null },
          },
          select: { imslpTotalCounts: true },
        }),
      ]);

      // Obter totais dos metadados ou calcular dos scores existentes
      let totalCounts: ScoreCounts;
      if (totalMetadata?.imslpTotalCounts) {
        try {
          totalCounts = JSON.parse(totalMetadata.imslpTotalCounts);
        } catch {
          totalCounts = this.calculateTotalCountsFromScores(cachedScores);
        }
      } else {
        totalCounts = this.calculateTotalCountsFromScores(cachedScores);
      }

      // Agrupar partituras por tipo
      const scoresByType = cachedScores.reduce((acc, score) => {
        if (!acc[score.type]) acc[score.type] = [];
        acc[score.type].push(score);
        return acc;
      }, {} as Record<string, any[]>);

      // Criar estatísticas para cada tab
      const tabTypes = [
        'scores',
        'parts',
        'arrangements',
        'librettos',
        'others',
        'sources',
      ];
      const allStats = tabTypes.map((tabType) => {
        const tabScores = scoresByType[tabType] || [];
        const totalForTab = totalCounts[tabType as keyof ScoreCounts] || 0;
        const loadedForTab = tabScores.length;
        const remaining = Math.max(0, totalForTab - loadedForTab);
        const hasMore = loadedForTab < totalForTab;
        const progress =
          totalForTab > 0
            ? Math.round((loadedForTab / totalForTab) * 100)
            : 100;

        return {
          loaded: loadedForTab,
          total: totalForTab,
          remaining,
          hasMore,
          progress,
        };
      });

      console.log(`📈 [CACHE-ALL] Estatísticas de todas as tabs obtidas`);
      return allStats;
    } catch (error) {
      console.error(
        `❌ [CACHE-ALL] Erro ao obter estatísticas de todas as tabs:`,
        error
      );
      return [];
    }
  }

  /**
   * 🚀 Salvar partituras no cache usando WorkScore
   */
  static async cacheScoresFromIMSLPIncremental(
    workId: string,
    scores: IMSLPWorkScoresIncremental,
    priorityScoreId?: string,
    options: CacheOptions = {}
  ): Promise<void> {
    const { immediate = true, background = false } = options;

    try {
      console.log(
        `💾 [CACHE-ALL] Salvando partituras para obra ${workId} (modo: ${
          background ? 'background' : 'imediato'
        })`
      );

      // Preparar dados das partituras para WorkScore
      const scoresData = [];
      let priority = 1000;

      for (const [type, groups] of Object.entries(scores.scoresByType)) {
        for (const group of groups) {
          for (const score of group.scores) {
            scoresData.push({
              workId,
              sourceId: score.id,
              source: 'IMSLP' as const,
              title: score.title,
              downloadUrl: score.downloadUrl,
              fileSize: score.fileSize,
              pageCount: score.pageCount,
              fileFormat: score.fileFormat || 'PDF',
              type: score.type as any,
              groupIndex: group.groupIndex,
              groupTitle: group.groupTitle || '',
              editor: score.editor,
              publisher: score.publisher,
              copyright: score.copyright,
              thumbnailUrl: score.thumbnailUrl,
              uploadDate: score.uploadDate,
              uploader: score.uploader,
              notes: score.notes,
              rating: score.rating,
              ratingsCount: score.ratingsCount,
              downloadCount: score.downloadCount,
              priority: score.id === priorityScoreId ? 2000 : priority--,
              isActive: true,
              lastVerified: new Date(),
              cacheVersion: this.CACHE_VERSION,
              imslpTotalCounts: JSON.stringify(scores.totalCounts),
            });
          }
        }
      }

      // Usar upsert para evitar duplicatas
      for (const scoreData of scoresData) {
        await prisma.workScore.upsert({
          where: {
            workId_sourceId_source: {
              workId: scoreData.workId,
              sourceId: scoreData.sourceId,
              source: scoreData.source,
            },
          },
          create: scoreData,
          update: {
            ...scoreData,
            lastVerified: new Date(),
          },
        });
      }

      console.log(
        `✅ [CACHE-ALL] ${scoresData.length} partituras salvas no cache para obra ${workId}`
      );
    } catch (error) {
      console.error(`❌ [CACHE-ALL] Erro ao salvar cache:`, error);
      throw error;
    }
  }

  /**
   * 🚀 Obter progresso do cache
   */
  static async getCacheProgress(workId: string): Promise<{
    workId: string;
    progress: number;
    completed: boolean;
    totalExpected: number;
    currentlyCached: number;
    lastUpdated?: Date;
  }> {
    try {
      const [cachedScores, totalMetadata] = await Promise.all([
        prisma.workScore.count({
          where: {
            workId,
            isActive: true,
          },
        }),
        prisma.workScore.findFirst({
          where: {
            workId,
            imslpTotalCounts: { not: null },
          },
          select: {
            imslpTotalCounts: true,
            lastVerified: true,
          },
        }),
      ]);

      let totalExpected = 0;

      if (totalMetadata?.imslpTotalCounts) {
        try {
          const totals: ScoreCounts = JSON.parse(
            totalMetadata.imslpTotalCounts
          );
          totalExpected = sumScoreCounts(totals);
        } catch {
          totalExpected = cachedScores;
        }
      } else {
        totalExpected = cachedScores;
      }

      const currentlyCached = cachedScores;
      const progress =
        totalExpected > 0
          ? Math.round((currentlyCached / totalExpected) * 100)
          : 100;
      const completed = currentlyCached >= totalExpected;

      return {
        workId,
        progress,
        completed,
        totalExpected,
        currentlyCached,
        lastUpdated: totalMetadata?.lastVerified,
      };
    } catch (error) {
      console.error(`❌ [CACHE-ALL] Erro ao obter progresso do cache:`, error);
      return {
        workId,
        progress: 0,
        completed: false,
        totalExpected: 0,
        currentlyCached: 0,
      };
    }
  }

  /**
   * 🆕 Invalidar cache de uma obra
   */
  static async invalidateWorkCache(workId: string): Promise<void> {
    try {
      console.log(`🗑️ [CACHE-ALL] Invalidando cache para obra ${workId}`);

      await prisma.workScore.updateMany({
        where: { workId },
        data: { isActive: false },
      });

      console.log(`✅ [CACHE-ALL] Cache invalidado para obra ${workId}`);
    } catch (error) {
      console.error(`❌ [CACHE-ALL] Erro ao invalidar cache:`, error);
      throw error;
    }
  }

  // === MÉTODOS AUXILIARES ===

  private static organizeScoresByType(scores: any[]) {
    const scoresByType = {
      scores: [],
      parts: [],
      arrangements: [],
      librettos: [],
      others: [],
      sources: [],
    };

    // Agrupar por tipo e depois por groupIndex
    const groupedByType = scores.reduce((acc, score) => {
      if (!acc[score.type]) acc[score.type] = [];
      acc[score.type].push(score);
      return acc;
    }, {});

    // Organizar cada tipo em grupos
    for (const [type, typeScores] of Object.entries(groupedByType)) {
      const groups = (typeScores as any[]).reduce((acc, score) => {
        const groupKey = score.groupIndex || 0;
        if (!acc[groupKey]) {
          acc[groupKey] = {
            groupIndex: groupKey,
            scores: [],
            groupTitle: score.groupTitle,
          };
        }
        acc[groupKey].scores.push({
          id: score.sourceId,
          title: score.title,
          downloadUrl: score.downloadUrl,
          fileSize: score.fileSize,
          pageCount: score.pageCount,
          fileFormat: score.fileFormat,
          type: score.type,
          groupIndex: score.groupIndex,
          editor: score.editor,
          publisher: score.publisher,
          copyright: score.copyright,
          thumbnailUrl: score.thumbnailUrl,
          uploadDate: score.uploadDate,
          uploader: score.uploader,
          notes: score.notes,
          rating: score.rating,
          ratingsCount: score.ratingsCount,
          downloadCount: score.downloadCount,
        });
        return acc;
      }, {});

      (scoresByType as any)[type] = Object.values(groups).sort(
        (a: any, b: any) => a.groupIndex - b.groupIndex
      );
    }

    return scoresByType;
  }

  private static calculateTotalCountsFromScores(scores: any[]): ScoreCounts {
    return scores.reduce(
      (acc, score) => {
        const type = score.type as keyof ScoreCounts;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {
        scores: 0,
        parts: 0,
        arrangements: 0,
        librettos: 0,
        others: 0,
        sources: 0,
      } as ScoreCounts
    );
  }

  private static calculateLoadedCounts(scoresByType: any): ScoreCounts {
    const loadedCounts: ScoreCounts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      librettos: 0,
      others: 0,
      sources: 0,
    };

    for (const [type, groups] of Object.entries(scoresByType)) {
      const typedKey = type as keyof ScoreCounts;
      loadedCounts[typedKey] = (groups as any[]).reduce(
        (sum, group) => sum + group.scores.length,
        0
      );
    }

    return loadedCounts;
  }
}
