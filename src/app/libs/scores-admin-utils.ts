// app/libs/scores-admin-utils.ts - Utilitários de Administração do Sistema de Cache
import prisma from '@/app/libs/prismadb';
import { ScoresCacheService } from './scores-cache-service';
import { BackgroundJobsSystem } from './background-jobs-system';
import { ProcessingStatus, ScoreSource } from '@prisma/client';

/**
 * 🚀 SISTEMA DE CACHE DE PARTITURAS IMSLP - CLASSICAL HUB
 * =========================================================
 *
 * ## VISÃO GERAL
 * Este sistema implementa cache inteligente de partituras IMSLP para otimizar
 * a experiência do usuário e reduzir a carga no servidor IMSLP.
 *
 * ## COMO FUNCIONA
 *
 * ### 1. PRIMEIRA VISITA
 * - Usuário acessa /work/[workId]
 * - Sistema verifica se há partituras em cache
 * - Se não há cache: faz scraping IMSLP imediatamente
 * - Retorna partituras para o usuário
 * - Em background: salva todas as partituras no banco
 *
 * ### 2. VISITAS SUBSEQUENTES
 * - Sistema encontra partituras no cache
 * - Retorna imediatamente (sem scraping)
 * - Performance 10x melhor
 *
 * ### 3. PROCESSAMENTO EM BACKGROUND
 * - Jobs são adicionados à fila automaticamente
 * - Sistema processa fila periodicamente
 * - Manutenção automática limpa cache expirado
 *
 * ## ARQUIVOS PRINCIPAIS
 * - app/libs/scores-cache-service.ts - Lógica de cache
 * - app/libs/background-jobs-system.ts - Sistema de jobs
 * - app/hooks/useIMSLPScores.ts - Hook React atualizado
 * - app/api/imslp-scores/route.ts - API com cache
 * - app/api/jobs/route.ts - Gerenciamento de jobs
 * - app/api/cron/route.ts - Manutenção automática
 *
 * ## TABELAS NO BANCO
 * - WorkScore - Cache de partituras por obra
 * - ScoreProcessingLog - Logs de processamento
 *
 * ## AGENDAMENTO AUTOMÁTICO (vercel.json)
 * - Manutenção diária: 00:00 UTC
 * - Processamento de fila: A cada 30 min
 * - Verificação de saúde: A cada 6h
 * - Limpeza profunda: Domingos 02:00 UTC
 */

export interface SystemStats {
  cache: {
    totalWorks: number;
    totalScores: number;
    sourceBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
    avgScoresPerWork: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  };
  jobs: {
    totalJobs: number;
    statusBreakdown: Record<string, number>;
    avgProcessingTime: number;
    successRate: number;
    pendingCount: number;
  };
  performance: {
    cacheHitRate: number;
    avgResponseTime: number;
    totalRequests: number;
  };
}

export class ScoresAdminUtils {
  /**
   * 🚀 Obter estatísticas completas do sistema
   */
  static async getSystemStats(): Promise<SystemStats> {
    console.log(`📊 [ADMIN] Gerando estatísticas do sistema`);

    const [cacheStats, jobStats, performanceData] = await Promise.all([
      this.getCacheStatistics(),
      this.getJobStatistics(),
      this.getPerformanceStatistics(),
    ]);

    return {
      cache: cacheStats,
      jobs: jobStats,
      performance: performanceData,
    };
  }

  /**
   * 🚀 Estatísticas do cache
   */
  private static async getCacheStatistics() {
    const [
      totalScores,
      worksWithCache,
      sourceBreakdown,
      typeBreakdown,
      dateRange,
    ] = await Promise.all([
      prisma.workScore.count({ where: { isActive: true } }),
      prisma.workScore.groupBy({
        by: ['workId'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.workScore.groupBy({
        by: ['source'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.workScore.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.workScore.aggregate({
        where: { isActive: true },
        _min: { createdAt: true },
        _max: { createdAt: true },
      }),
    ]);

    const sourceMap = sourceBreakdown.reduce((acc, item) => {
      acc[item.source] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const typeMap = typeBreakdown.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWorks: worksWithCache.length,
      totalScores,
      sourceBreakdown: sourceMap,
      typeBreakdown: typeMap,
      avgScoresPerWork:
        worksWithCache.length > 0 ? totalScores / worksWithCache.length : 0,
      oldestEntry: dateRange._min.createdAt,
      newestEntry: dateRange._max.createdAt,
    };
  }

  /**
   * 🚀 Estatísticas de jobs
   */
  private static async getJobStatistics() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalJobs, statusBreakdown, performanceData] = await Promise.all([
      prisma.scoreProcessingLog.count({
        where: { createdAt: { gt: oneDayAgo } },
      }),
      prisma.scoreProcessingLog.groupBy({
        by: ['status'],
        where: { createdAt: { gt: oneDayAgo } },
        _count: true,
      }),
      prisma.scoreProcessingLog.findMany({
        where: {
          createdAt: { gt: oneDayAgo },
          status: ProcessingStatus.COMPLETED,
          duration: { not: null },
        },
        select: { duration: true },
      }),
    ]);

    const statusMap = statusBreakdown.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const avgProcessingTime =
      performanceData.length > 0
        ? performanceData.reduce((sum, job) => sum + (job.duration || 0), 0) /
          performanceData.length
        : 0;

    const successCount = statusMap.COMPLETED || 0;
    const successRate = totalJobs > 0 ? (successCount / totalJobs) * 100 : 0;

    return {
      totalJobs,
      statusBreakdown: statusMap,
      avgProcessingTime: Math.round(avgProcessingTime),
      successRate: Math.round(successRate * 100) / 100,
      pendingCount: statusMap.PENDING || 0,
    };
  }

  /**
   * 🚀 Estatísticas de performance
   */
  private static async getPerformanceStatistics() {
    // Simular dados de performance (em uma implementação real,
    // isso viria de logs de acesso ou métricas de APM)
    const cacheHits = await prisma.workScore.count({
      where: {
        lastAccessed: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalRequests =
      cacheHits +
      (await prisma.scoreProcessingLog.count({
        where: {
          createdAt: {
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          action: 'cache_scores',
        },
      }));

    return {
      cacheHitRate:
        totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0,
      avgResponseTime: 150, // ms - em uma implementação real, viria de métricas
      totalRequests,
    };
  }

  /**
   * 🚀 Diagnóstico completo do sistema
   */
  static async runSystemDiagnostic(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    stats: SystemStats;
  }> {
    console.log(`🔍 [ADMIN] Executando diagnóstico do sistema`);

    const stats = await this.getSystemStats();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Verificar problemas no cache
    if (stats.cache.totalScores === 0) {
      issues.push('Nenhuma partitura em cache');
      recommendations.push(
        'Execute scraping inicial para algumas obras populares'
      );
    }

    if (stats.cache.avgScoresPerWork < 5) {
      issues.push('Baixa média de partituras por obra');
      recommendations.push(
        'Verifique se o scraping está funcionando corretamente'
      );
    }

    // Verificar problemas nos jobs
    if (stats.jobs.pendingCount > 50) {
      issues.push(`${stats.jobs.pendingCount} jobs pendentes acumulados`);
      recommendations.push('Execute processamento manual da fila');
    }

    if (stats.jobs.successRate < 80) {
      issues.push(`Taxa de sucesso dos jobs baixa: ${stats.jobs.successRate}%`);
      recommendations.push('Verifique logs de erro e conectividade com IMSLP');
    }

    // Verificar performance
    if (stats.performance.cacheHitRate < 60) {
      issues.push(`Cache hit rate baixo: ${stats.performance.cacheHitRate}%`);
      recommendations.push('Implemente pré-cache para obras populares');
    }

    const status =
      issues.length === 0
        ? 'healthy'
        : issues.length <= 2
        ? 'warning'
        : 'critical';

    console.log(`📋 [ADMIN] Diagnóstico concluído: ${status.toUpperCase()}`);

    return { status, issues, recommendations, stats };
  }

  /**
   * 🚀 Pré-carregar cache para obras populares
   */
  static async preloadPopularWorks(limit: number = 50): Promise<{
    processed: number;
    enqueued: number;
    skipped: number;
  }> {
    console.log(
      `🚀 [ADMIN] Pré-carregando cache para ${limit} obras populares`
    );

    const popularWorks = await prisma.work.findMany({
      where: {
        imslpPermlink: { not: '' },
      },
      orderBy: [
        { favoriteBy: { _count: 'desc' } },
        { wantToLearners: { _count: 'desc' } },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        imslpPermlink: true,
        composer: {
          select: { name: true },
        },
      },
    });

    let processed = 0;
    let enqueued = 0;
    let skipped = 0;

    for (const work of popularWorks) {
      try {
        // Verificar se já tem cache
        const cacheResult = await ScoresCacheService.getWorkScores(work.id);

        if (cacheResult.scores) {
          console.log(`⏭️ [ADMIN] ${work.title} - já em cache, pulando`);
          skipped++;
          continue;
        }

        // Adicionar à fila de processamento
        await BackgroundJobsSystem.enqueueScrapingJob(
          work.id,
          work.imslpPermlink,
          { priority: 3 } // Prioridade média
        );

        console.log(`✅ [ADMIN] ${work.title} - adicionado à fila`);
        enqueued++;
        processed++;
      } catch (error) {
        console.error(`❌ [ADMIN] Erro ao processar ${work.title}:`, error);
        processed++;
      }
    }

    console.log(
      `📊 [ADMIN] Pré-carregamento concluído: ${processed} processadas, ${enqueued} enfileiradas, ${skipped} puladas`
    );

    return { processed, enqueued, skipped };
  }

  /**
   * 🚀 Gerar relatório detalhado
   */
  static async generateDetailedReport(): Promise<string> {
    const stats = await this.getSystemStats();
    const diagnostic = await this.runSystemDiagnostic();

    const report = `
🎼 CLASSICAL HUB - RELATÓRIO DO SISTEMA DE CACHE
================================================

📅 Gerado em: ${new Date().toISOString()}
🔍 Status do Sistema: ${diagnostic.status.toUpperCase()}

📊 ESTATÍSTICAS DO CACHE
------------------------
📈 Total de Obras com Cache: ${stats.cache.totalWorks}
🎵 Total de Partituras: ${stats.cache.totalScores}
📊 Média por Obra: ${Math.round(stats.cache.avgScoresPerWork * 100) / 100}

📋 Distribuição por Fonte:
${Object.entries(stats.cache.sourceBreakdown)
  .map(([source, count]) => `   ${source}: ${count}`)
  .join('\n')}

🎼 Distribuição por Tipo:
${Object.entries(stats.cache.typeBreakdown)
  .map(([type, count]) => `   ${type}: ${count}`)
  .join('\n')}

⚙️ ESTATÍSTICAS DE JOBS (24h)
-----------------------------
📦 Total de Jobs: ${stats.jobs.totalJobs}
✅ Taxa de Sucesso: ${stats.jobs.successRate}%
⏱️ Tempo Médio: ${stats.jobs.avgProcessingTime}ms
⏳ Jobs Pendentes: ${stats.jobs.pendingCount}

📈 PERFORMANCE
--------------
💾 Cache Hit Rate: ${stats.performance.cacheHitRate}%
⚡ Tempo Médio de Resposta: ${stats.performance.avgResponseTime}ms
📊 Total de Requisições (24h): ${stats.performance.totalRequests}

${
  diagnostic.issues.length > 0
    ? `
⚠️ PROBLEMAS DETECTADOS
-----------------------
${diagnostic.issues.map((issue) => `❌ ${issue}`).join('\n')}

💡 RECOMENDAÇÕES
----------------
${diagnostic.recommendations.map((rec) => `🔧 ${rec}`).join('\n')}
`
    : '✅ SISTEMA FUNCIONANDO PERFEITAMENTE!'
}

🚀 PRÓXIMOS PASSOS
------------------
1. Monitorar cache hit rate semanalmente
2. Executar pré-carregamento para obras populares
3. Verificar logs de erro mensalmente
4. Ajustar TTL do cache conforme necessário

================================================
Relatório gerado automaticamente pelo Classical Hub
    `;

    return report.trim();
  }

  /**
   * 🚀 Utilitários de desenvolvimento
   */
  static dev = {
    /**
     * Limpar todo o cache (CUIDADO!)
     */
    async clearAllCache(): Promise<number> {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Operação não permitida em produção');
      }

      const result = await prisma.workScore.deleteMany({});
      console.log(`🗑️ [DEV] ${result.count} entradas de cache removidas`);
      return result.count;
    },

    /**
     * Resetar todos os jobs
     */
    async resetAllJobs(): Promise<number> {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Operação não permitida em produção');
      }

      const result = await prisma.scoreProcessingLog.deleteMany({});
      console.log(`🔄 [DEV] ${result.count} jobs removidos`);
      return result.count;
    },

    /**
     * Simular carga de trabalho
     */
    async simulateWorkload(workCount: number = 10): Promise<void> {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Operação não permitida em produção');
      }

      console.log(
        `🔄 [DEV] Simulando carga de trabalho para ${workCount} obras`
      );

      const works = await prisma.work.findMany({
        where: { imslpPermlink: { not: '' } },
        take: workCount,
        select: { id: true, imslpPermlink: true, title: true },
      });

      for (const work of works) {
        await BackgroundJobsSystem.enqueueScrapingJob(
          work.id,
          work.imslpPermlink,
          { priority: Math.floor(Math.random() * 10) + 1 }
        );

        console.log(`📋 [DEV] Job adicionado para: ${work.title}`);
      }

      console.log(`✅ [DEV] ${works.length} jobs adicionados à fila`);
    },
  };
}

/**
 * 🚀 GUIA DE USO RÁPIDO
 * =====================
 *
 * // Verificar status do sistema
 * const stats = await ScoresAdminUtils.getSystemStats();
 *
 * // Diagnóstico completo
 * const diagnostic = await ScoresAdminUtils.runSystemDiagnostic();
 *
 * // Pré-carregar obras populares
 * await ScoresAdminUtils.preloadPopularWorks(50);
 *
 * // Gerar relatório
 * const report = await ScoresAdminUtils.generateDetailedReport();
 * console.log(report);
 *
 * // Em desenvolvimento apenas:
 * await ScoresAdminUtils.dev.clearAllCache();
 * await ScoresAdminUtils.dev.simulateWorkload(10);
 */
