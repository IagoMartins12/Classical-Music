// app/libs/background-jobs-system.ts - Sistema de Jobs em Background
import prisma from '@/app/libs/prismadb';
import { ScoresCacheService } from './scores-cache-service';
import { IMSLPScraper } from './imslp-score-scraper';
import { ProcessingStatus, ScoreSource } from '@prisma/client';

export interface JobQueue {
  id: string;
  workId: string;
  imslpUrl: string;
  priority: number;
  priorityScoreId?: string;
  createdAt: Date;
  attempts: number;
}

export class BackgroundJobsSystem {
  private static isProcessing = false;
  private static readonly MAX_CONCURRENT_JOBS = 3;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 5000; // 5 segundos

  /**
   * 🚀 Adicionar trabalho na fila de processamento
   */
  static async enqueueScrapingJob(
    workId: string,
    imslpUrl: string,
    options: {
      priority?: number;
      priorityScoreId?: string;
      scheduledFor?: Date;
    } = {}
  ): Promise<string> {
    const { priority = 5, priorityScoreId, scheduledFor } = options;

    console.log(`📋 [JOBS] Adicionando job para obra ${workId} na fila`);

    const job = await prisma.scoreProcessingLog.create({
      data: {
        workId,
        action: 'cache_scores',
        status: ProcessingStatus.PENDING,
        priority,
        scheduledFor,
        details: {
          imslpUrl,
          priorityScoreId,
          jobType: 'scraping',
          source: 'background_queue',
        },
      },
    });

    console.log(
      `✅ [JOBS] Job ${job.id} adicionado à fila com prioridade ${priority}`
    );

    // Iniciar processamento se não estiver rodando
    if (!this.isProcessing) {
      this.processQueue().catch(console.error);
    }

    return job.id;
  }

  /**
   * 🚀 Processar fila de jobs
   */
  static async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log(`⏸️ [JOBS] Processamento já em andamento, pulando...`);
      return;
    }

    this.isProcessing = true;
    console.log(`🚀 [JOBS] Iniciando processamento da fila`);

    try {
      while (true) {
        // Buscar próximos jobs pendentes
        const pendingJobs = await prisma.scoreProcessingLog.findMany({
          where: {
            status: ProcessingStatus.PENDING,
            OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
          },
          orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
          take: this.MAX_CONCURRENT_JOBS,
        });

        if (pendingJobs.length === 0) {
          console.log(`✅ [JOBS] Nenhum job pendente encontrado`);
          break;
        }

        console.log(
          `📦 [JOBS] Processando ${pendingJobs.length} jobs em paralelo`
        );

        // Processar jobs em paralelo
        const jobPromises = pendingJobs.map((job) => this.processJob(job));
        await Promise.allSettled(jobPromises);

        // Pequena pausa entre batches
        await this.sleep(1000);
      }
    } catch (error) {
      console.error(`❌ [JOBS] Erro no processamento da fila:`, error);
    } finally {
      this.isProcessing = false;
      console.log(`🏁 [JOBS] Processamento da fila finalizado`);
    }
  }

  /**
   * 🚀 Processar job individual
   */
  private static async processJob(job: any): Promise<void> {
    const startTime = Date.now();
    console.log(`🔄 [JOBS] Iniciando job ${job.id} para obra ${job.workId}`);

    try {
      // Marcar como processando
      await prisma.scoreProcessingLog.update({
        where: { id: job.id },
        data: {
          status: ProcessingStatus.PROCESSING,
          startedAt: new Date(),
        },
      });

      const { imslpUrl, priorityScoreId } = job.details;

      // Verificar se já temos cache válido
      const cacheResult = await ScoresCacheService.getWorkScores(job.workId);

      if (cacheResult.scores && !cacheResult.needsProcessing) {
        console.log(
          `💾 [JOBS] Job ${job.id} - Cache já válido, pulando scraping`
        );

        await prisma.scoreProcessingLog.update({
          where: { id: job.id },
          data: {
            status: ProcessingStatus.COMPLETED,
            completedAt: new Date(),
            duration: Date.now() - startTime,
            itemsSuccess: Object.values(cacheResult.scores.totalCounts).reduce(
              (sum: number, count: number) => sum + count,
              0
            ),
            itemsSkipped: 1,
            details: {
              ...job.details,
              result: 'cache_hit',
              message: 'Cache já válido, scraping desnecessário',
            },
          },
        });

        return;
      }

      // Fazer scraping
      console.log(
        `🕷️ [JOBS] Job ${job.id} - Iniciando scraping de ${imslpUrl}`
      );
      const scoresData = await IMSLPScraper.fetchAndExtractScores(imslpUrl);

      // Salvar no cache
      await ScoresCacheService.cacheScoresFromIMSLP(
        job.workId,
        scoresData,
        priorityScoreId
      );

      const totalScores = Object.values(scoresData.totalCounts).reduce(
        (sum: number, count: number) => sum + count,
        0
      );

      // Marcar como concluído
      await prisma.scoreProcessingLog.update({
        where: { id: job.id },
        data: {
          status: ProcessingStatus.COMPLETED,
          completedAt: new Date(),
          duration: Date.now() - startTime,
          itemsTotal: totalScores,
          itemsSuccess: totalScores,
          details: {
            ...job.details,
            result: 'success',
            scrapedCounts: scoresData.totalCounts,
          },
        },
      });

      console.log(
        `✅ [JOBS] Job ${
          job.id
        } concluído - ${totalScores} partituras processadas em ${
          Date.now() - startTime
        }ms`
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';

      console.error(
        `❌ [JOBS] Job ${job.id} falhou após ${duration}ms:`,
        errorMessage
      );

      // Incrementar tentativas
      const newAttempts = (job.retryCount || 0) + 1;

      if (newAttempts < this.MAX_RETRIES) {
        // Reagendar para retry
        const retryDelay = this.RETRY_DELAY * Math.pow(2, newAttempts - 1); // Backoff exponencial
        const scheduledFor = new Date(Date.now() + retryDelay);

        await prisma.scoreProcessingLog.update({
          where: { id: job.id },
          data: {
            status: ProcessingStatus.PENDING,
            retryCount: newAttempts,
            scheduledFor,
            error: `Tentativa ${newAttempts}/${this.MAX_RETRIES}: ${errorMessage}`,
            details: {
              ...job.details,
              lastError: errorMessage,
              lastErrorAt: new Date().toISOString(),
            },
          },
        });

        console.log(
          `🔄 [JOBS] Job ${job.id} reagendado para retry ${newAttempts}/${this.MAX_RETRIES} em ${retryDelay}ms`
        );
      } else {
        // Marcar como falha permanente
        await prisma.scoreProcessingLog.update({
          where: { id: job.id },
          data: {
            status: ProcessingStatus.FAILED,
            completedAt: new Date(),
            duration,
            error: `Falha após ${this.MAX_RETRIES} tentativas: ${errorMessage}`,
            details: {
              ...job.details,
              finalError: errorMessage,
              failedAt: new Date().toISOString(),
            },
          },
        });

        console.error(
          `💀 [JOBS] Job ${job.id} falhou permanentemente após ${this.MAX_RETRIES} tentativas`
        );
      }
    }
  }

  /**
   * 🚀 Limpeza e manutenção automática
   */
  static async performMaintenance(): Promise<{
    cleanedCache: number;
    cleanedLogs: number;
    revalidatedUrls: number;
  }> {
    console.log(`🧹 [JOBS] Iniciando manutenção automática`);

    const results = {
      cleanedCache: 0,
      cleanedLogs: 0,
      revalidatedUrls: 0,
    };

    try {
      // 1. Limpar cache expirado (30 dias)
      results.cleanedCache = await ScoresCacheService.cleanExpiredCache(30);

      // 2. Limpar logs antigos (60 dias)
      const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const logCleanup = await prisma.scoreProcessingLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: [ProcessingStatus.COMPLETED, ProcessingStatus.FAILED] },
        },
      });
      results.cleanedLogs = logCleanup.count;

      // 3. Revalidar URLs que não foram acessadas há muito tempo
      const staleScores = await prisma.workScore.findMany({
        where: {
          lastAccessed: {
            lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 dias
          },
          isActive: true,
          source: ScoreSource.IMSLP,
        },
        take: 50, // Limitar para não sobrecarregar
      });

      for (const score of staleScores) {
        try {
          // Verificar se URL ainda é válida
          const response = await fetch(score.downloadUrl || '', {
            method: 'HEAD',
          });

          if (!response.ok) {
            // Marcar como inativa se URL inválida
            await prisma.workScore.update({
              where: { id: score.id },
              data: {
                isActive: false,
                processingStatus: ProcessingStatus.FAILED,
                processingError: `URL inválida: ${response.status}`,
              },
            });
          } else {
            // Atualizar timestamp se URL válida
            await prisma.workScore.update({
              where: { id: score.id },
              data: { lastVerified: new Date() },
            });
          }

          results.revalidatedUrls++;
        } catch (error) {
          console.error(
            `❌ [JOBS] Erro ao revalidar partitura ${score.id}:`,
            error
          );
        }
      }

      console.log(`✅ [JOBS] Manutenção completa:`, results);
      return results;
    } catch (error) {
      console.error(`❌ [JOBS] Erro na manutenção:`, error);
      throw error;
    }
  }

  /**
   * 🚀 Agendar job para horário específico (para cron diário)
   */
  static async scheduleMaintenanceJob(scheduledFor: Date): Promise<string> {
    const job = await prisma.scoreProcessingLog.create({
      data: {
        workId: 'system',
        action: 'maintenance',
        status: ProcessingStatus.PENDING,
        priority: 1, // Baixa prioridade
        scheduledFor,
        details: {
          jobType: 'maintenance',
          source: 'scheduled_cron',
        },
      },
    });

    console.log(
      `📅 [JOBS] Job de manutenção agendado para ${scheduledFor.toISOString()}`
    );
    return job.id;
  }

  /**
   * 🚀 Obter estatísticas da fila
   */
  static async getQueueStats() {
    const stats = await prisma.scoreProcessingLog.groupBy({
      by: ['status', 'action'],
      _count: true,
      where: {
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
    });

    const totalJobs = await prisma.scoreProcessingLog.count({
      where: {
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      stats,
      totalJobs,
      isProcessing: this.isProcessing,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🚀 Forçar processamento imediato da fila
   */
  static async forceProcessQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log(`⚠️ [JOBS] Processamento já em andamento`);
      return;
    }

    console.log(`🚀 [JOBS] Forçando processamento imediato da fila`);
    await this.processQueue();
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 🚀 Função utilitária para usar em API routes ou cron jobs
 */
export async function runBackgroundMaintenance() {
  try {
    console.log(
      `🕐 [CRON] Iniciando manutenção agendada às ${new Date().toISOString()}`
    );

    const results = await BackgroundJobsSystem.performMaintenance();

    console.log(`✅ [CRON] Manutenção concluída:`, results);
    return results;
  } catch (error) {
    console.error(`❌ [CRON] Erro na manutenção agendada:`, error);
    throw error;
  }
}

/**
 * 🚀 Função para processar fila via cron ou trigger manual
 */
export async function processBackgroundQueue() {
  try {
    console.log(`🚀 [CRON] Processando fila de jobs`);
    await BackgroundJobsSystem.processQueue();
    console.log(`✅ [CRON] Processamento da fila concluído`);
  } catch (error) {
    console.error(`❌ [CRON] Erro no processamento da fila:`, error);
    throw error;
  }
}
