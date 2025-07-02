// app/libs/background-jobs-system-optimized.ts - Sistema Ultra-Otimizado de Jobs em Background
import prisma from '@/app/libs/prismadb';
import { ProcessingStatus } from '@prisma/client';
import { ScoresCacheServiceOptimized } from './scores-cache-service-optimized';
import { IMSLPScraper } from './imslp-score-scraper';

export interface BackgroundJobOptions {
  priority?: number; // 1-10 (10 = máxima prioridade)
  scheduledFor?: Date; // Para agendamento
  maxRetries?: number;
  details?: any; // Dados específicos do job
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  isProcessing: boolean;
  lastProcessed: Date | null;
  stats: any[];
}

export class BackgroundJobsSystemOptimized {
  private static isProcessingQueue = false;
  private static readonly MAX_CONCURRENT_JOBS = 3;
  private static readonly DEFAULT_RETRY_DELAYS = [1000, 5000, 15000]; // ms

  /**
   * 🚀 Adicionar job de scraping à fila com prioridade otimizada
   */
  static async enqueueScrapingJob(
    workId: string,
    imslpUrl: string,
    options: BackgroundJobOptions = {}
  ): Promise<string> {
    const {
      priority = 5,
      scheduledFor,
      maxRetries = 3,
      details = {},
    } = options;

    console.log(
      `📋 [JOBS-OPT] Adicionando job de scraping à fila para workId: ${workId}`
    );

    // Verificar se já existe um job pendente ou em processamento para esta obra
    const existingJob = await prisma.scoreProcessingLog.findFirst({
      where: {
        workId,
        action: { in: ['cache_scores', 'cache_scores_background'] },
        status: { in: [ProcessingStatus.PENDING, ProcessingStatus.PROCESSING] },
      },
    });

    if (existingJob) {
      console.log(
        `⏩ [JOBS-OPT] Job já existe para workId: ${workId}, atualizando prioridade`
      );

      // Atualizar prioridade se a nova for maior
      if (priority > existingJob.priority) {
        await prisma.scoreProcessingLog.update({
          where: { id: existingJob.id },
          data: { priority, scheduledFor: scheduledFor || new Date() },
        });
      }

      return existingJob.id;
    }

    // Criar novo job
    const job = await prisma.scoreProcessingLog.create({
      data: {
        workId,
        action: 'cache_scores',
        status: ProcessingStatus.PENDING,
        priority,
        scheduledFor: scheduledFor || new Date(),
        maxRetries,
        details: {
          imslpUrl,
          ...details,
        },
      },
    });

    console.log(
      `✅ [JOBS-OPT] Job criado com ID: ${job.id}, prioridade: ${priority}`
    );

    // Processar fila automaticamente se não estiver processando
    if (!this.isProcessingQueue) {
      this.forceProcessQueue().catch(console.error);
    }

    return job.id;
  }

  /**
   * 🚀 Processar fila de jobs com concorrência otimizada
   */
  static async forceProcessQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      console.log(`⏸️ [JOBS-OPT] Fila já está sendo processada, ignorando`);
      return;
    }

    this.isProcessingQueue = true;
    console.log(`🚀 [JOBS-OPT] Iniciando processamento da fila`);

    try {
      while (true) {
        // Buscar jobs pendentes com prioridade
        const pendingJobs = await prisma.scoreProcessingLog.findMany({
          where: {
            status: ProcessingStatus.PENDING,
            OR: [{ scheduledFor: { lte: new Date() } }, { scheduledFor: null }],
          },
          orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
          take: this.MAX_CONCURRENT_JOBS,
        });

        if (pendingJobs.length === 0) {
          console.log(`✅ [JOBS-OPT] Nenhum job pendente na fila`);
          break;
        }

        console.log(
          `⚙️ [JOBS-OPT] Processando ${pendingJobs.length} jobs em paralelo`
        );

        // Processar jobs em paralelo
        const jobPromises = pendingJobs.map((job) => this.processJob(job));
        await Promise.allSettled(jobPromises);

        // Pequena pausa entre lotes
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ [JOBS-OPT] Erro no processamento da fila:`, error);
    } finally {
      this.isProcessingQueue = false;
      console.log(`🏁 [JOBS-OPT] Processamento da fila finalizado`);
    }
  }

  /**
   * 🚀 Processar job individual otimizado
   */
  private static async processJob(job: any): Promise<void> {
    const jobId = job.id;
    const startTime = Date.now();

    console.log(
      `⚙️ [JOBS-OPT] Processando job ${jobId} (${job.action}) para workId: ${job.workId}`
    );

    try {
      // Marcar como processando
      await prisma.scoreProcessingLog.update({
        where: { id: jobId },
        data: {
          status: ProcessingStatus.PROCESSING,
          startedAt: new Date(),
        },
      });

      let result;

      // Executar ação baseada no tipo
      switch (job.action) {
        case 'cache_scores':
          result = await this.executeCacheScoresJob(job);
          break;
        case 'cache_scores_background':
          result = await this.executeCacheScoresBackgroundJob(job);
          break;
        case 'maintenance':
          result = await this.executeMaintenanceJob();
          break;
        default:
          throw new Error(`Ação não reconhecida: ${job.action}`);
      }

      // Marcar como concluído
      await prisma.scoreProcessingLog.update({
        where: { id: jobId },
        data: {
          status: ProcessingStatus.COMPLETED,
          completedAt: new Date(),
          duration: Date.now() - startTime,
          itemsSuccess: result.success || 0,
          itemsFailed: result.failed || 0,
          itemsSkipped: result.skipped || 0,
          itemsTotal: result.total || 0,
        },
      });

      console.log(
        `✅ [JOBS-OPT] Job ${jobId} concluído com sucesso em ${
          Date.now() - startTime
        }ms`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ [JOBS-OPT] Job ${jobId} falhou:`, errorMessage);

      // Verificar se deve tentar novamente
      const shouldRetry = job.retryCount < job.maxRetries;
      const nextRetryDelay = this.DEFAULT_RETRY_DELAYS[job.retryCount] || 30000;

      if (shouldRetry) {
        console.log(
          `🔄 [JOBS-OPT] Agendando retry ${job.retryCount + 1}/${
            job.maxRetries
          } para job ${jobId} em ${nextRetryDelay}ms`
        );

        await prisma.scoreProcessingLog.update({
          where: { id: jobId },
          data: {
            status: ProcessingStatus.PENDING,
            retryCount: { increment: 1 },
            scheduledFor: new Date(Date.now() + nextRetryDelay),
            error: errorMessage,
          },
        });
      } else {
        console.log(
          `❌ [JOBS-OPT] Job ${jobId} falhou definitivamente após ${job.retryCount} tentativas`
        );

        await prisma.scoreProcessingLog.update({
          where: { id: jobId },
          data: {
            status: ProcessingStatus.FAILED,
            completedAt: new Date(),
            duration: Date.now() - startTime,
            error: errorMessage,
          },
        });
      }
    }
  }

  /**
   * 🚀 Executar job de cache de partituras
   */
  private static async executeCacheScoresJob(job: any): Promise<any> {
    const { workId, details } = job;
    const { imslpUrl, priorityScoreId } = details;

    console.log(`🕷️ [JOBS-OPT] Executando scraping para workId: ${workId}`);

    // Fazer scraping do IMSLP
    const scoresData = await IMSLPScraper.fetchAndExtractScores(imslpUrl);

    const totalScores = Object.values(scoresData.totalCounts).reduce(
      (sum: number, count: number) => sum + count,
      0
    );

    // Salvar no cache otimizado
    await ScoresCacheServiceOptimized.cacheScoresFromIMSLP(
      workId,
      scoresData,
      priorityScoreId
    );

    return {
      success: totalScores,
      failed: 0,
      skipped: 0,
      total: totalScores,
    };
  }

  /**
   * 🚀 Executar job de cache em background
   */
  private static async executeCacheScoresBackgroundJob(job: any): Promise<any> {
    const { workId } = job;

    console.log(
      `🔄 [JOBS-OPT] Executando cache background para workId: ${workId}`
    );

    // Este job seria mais específico, talvez para atualizar partituras existentes
    // ou processar uma parte específica do cache

    return {
      success: 1,
      failed: 0,
      skipped: 0,
      total: 1,
    };
  }

  /**
   * 🚀 Executar job de manutenção
   */
  private static async executeMaintenanceJob(): Promise<any> {
    console.log(`🧹 [JOBS-OPT] Executando manutenção`);

    // Limpeza de cache expirado
    const cleanedCount = await ScoresCacheServiceOptimized.cleanExpiredCache(
      30
    );

    // Limpeza de logs antigos
    const oldLogsCleaned = await this.cleanOldLogs(90); // 90 dias

    return {
      success: cleanedCount + oldLogsCleaned,
      failed: 0,
      skipped: 0,
      total: cleanedCount + oldLogsCleaned,
    };
  }

  /**
   * 🚀 Agendar job de manutenção
   */
  static async scheduleMaintenanceJob(scheduledFor: Date): Promise<string> {
    console.log(
      `📅 [JOBS-OPT] Agendando manutenção para ${scheduledFor.toISOString()}`
    );

    const job = await prisma.scoreProcessingLog.create({
      data: {
        workId: 'system', // ID especial para jobs de sistema
        action: 'maintenance',
        status: ProcessingStatus.PENDING,
        priority: 3, // Prioridade baixa
        scheduledFor,
        maxRetries: 1,
        details: {
          type: 'scheduled_maintenance',
        },
      },
    });

    return job.id;
  }

  /**
   * 🚀 Obter estatísticas da fila
   */
  static async getQueueStats(): Promise<QueueStats> {
    const stats = await prisma.scoreProcessingLog.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
    });

    const lastProcessed = await prisma.scoreProcessingLog.findFirst({
      where: { status: ProcessingStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count;
      return acc;
    }, {} as any);

    return {
      pending: statusCounts.pending || 0,
      processing: statusCounts.processing || 0,
      completed: statusCounts.completed || 0,
      failed: statusCounts.failed || 0,
      isProcessing: this.isProcessingQueue,
      lastProcessed: lastProcessed?.completedAt || null,
      stats,
    };
  }

  /**
   * 🚀 Limpar logs antigos
   */
  private static async cleanOldLogs(daysOld: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await prisma.scoreProcessingLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: [ProcessingStatus.COMPLETED, ProcessingStatus.FAILED] },
      },
    });

    console.log(`🧹 [JOBS-OPT] ${result.count} logs antigos removidos`);
    return result.count;
  }

  /**
   * 🚀 Cancelar job pendente
   */
  static async cancelJob(jobId: string): Promise<boolean> {
    try {
      await prisma.scoreProcessingLog.update({
        where: {
          id: jobId,
          status: ProcessingStatus.PENDING,
        },
        data: {
          status: ProcessingStatus.CANCELLED,
          completedAt: new Date(),
          error: 'Job cancelado manualmente',
        },
      });

      console.log(`❌ [JOBS-OPT] Job ${jobId} cancelado`);
      return true;
    } catch (error) {
      console.error(`❌ [JOBS-OPT] Erro ao cancelar job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * 🚀 Obter jobs por workId
   */
  static async getJobsByWorkId(workId: string, limit: number = 10) {
    return await prisma.scoreProcessingLog.findMany({
      where: { workId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        status: true,
        priority: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        duration: true,
        itemsSuccess: true,
        itemsFailed: true,
        error: true,
        retryCount: true,
      },
    });
  }
}

/**
 * 🚀 Funções auxiliares para compatibilidade
 */
export async function processBackgroundQueue(): Promise<void> {
  return BackgroundJobsSystemOptimized.forceProcessQueue();
}

export async function runBackgroundMaintenance(): Promise<any> {
  console.log(`🧹 [MAINTENANCE-OPT] Executando manutenção de rotina`);

  const results = {
    cacheCleanup: 0,
    logsCleanup: 0,
    queueProcessing: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Limpeza de cache expirado
    results.cacheCleanup = await ScoresCacheServiceOptimized.cleanExpiredCache(
      30
    );

    // Limpeza de logs antigos
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const logCleanup = await prisma.scoreProcessingLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: [ProcessingStatus.COMPLETED, ProcessingStatus.FAILED] },
      },
    });
    results.logsCleanup = logCleanup.count;

    // Processar fila se não estiver processando
    if (!BackgroundJobsSystemOptimized['isProcessingQueue']) {
      BackgroundJobsSystemOptimized.forceProcessQueue().catch(console.error);
      results.queueProcessing = true;
    }

    console.log(`✅ [MAINTENANCE-OPT] Manutenção concluída:`, results);
    return results;
  } catch (error) {
    console.error(`❌ [MAINTENANCE-OPT] Erro na manutenção:`, error);
    throw error;
  }
}

// Alias para compatibilidade
export const BackgroundJobsSystem = BackgroundJobsSystemOptimized;
