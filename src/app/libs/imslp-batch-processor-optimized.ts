// lib/imslp-batch-processor-optimized.ts - Processamento em Lote Ultra-Otimizado

import { IMSLPDirectUrlResolverOptimized } from './imslp-url-resolver';

interface BatchRequest {
  hiddenLink: string;
  scoreId: string;
}

interface BatchResult {
  scoreId: string;
  downloadUrl: string;
  processingTime: number;
  success: boolean;
  error?: string;
}

export class IMSLPBatchProcessorOptimized {
  private static readonly DEFAULT_CONCURRENCY = 4; // Otimizado para o novo sistema
  private static readonly BATCH_TIMEOUT = 30000; // 30s timeout total por batch

  /**
   * 🚀 Processa múltiplas partituras em paralelo com limite de concorrência otimizado
   */
  static async processBatch(
    scoreRequests: BatchRequest[],
    concurrencyLimit = this.DEFAULT_CONCURRENCY
  ): Promise<BatchResult[]> {
    console.log(
      `🚀 [BATCH] Processando ${scoreRequests.length} partituras (concorrência: ${concurrencyLimit})`
    );

    const results: BatchResult[] = [];
    const startTime = Date.now();

    // 🚀 ESTRATÉGIA: Processar em grupos limitados para evitar sobrecarga
    for (let i = 0; i < scoreRequests.length; i += concurrencyLimit) {
      const batch = scoreRequests.slice(i, i + concurrencyLimit);
      const batchNumber = Math.floor(i / concurrencyLimit) + 1;
      const totalBatches = Math.ceil(scoreRequests.length / concurrencyLimit);

      console.log(
        `📦 [BATCH] Processando lote ${batchNumber}/${totalBatches} (${batch.length} itens)`
      );

      // Processar lote atual em paralelo com timeout
      const batchPromises = batch.map(({ hiddenLink, scoreId }) =>
        this.processWithTimeout(hiddenLink, scoreId)
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        // Converter resultados e adicionar ao array principal
        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          const originalRequest = batch[j];

          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Fallback para URLs que falharam
            results.push({
              scoreId: originalRequest.scoreId,
              downloadUrl: `https://imslp.org${originalRequest.hiddenLink}`,
              processingTime: 0,
              success: false,
              error: result.reason?.message || 'Timeout ou erro desconhecido',
            });
          }
        }

        // Log de progresso
        const batchTime = Date.now() - startTime;
        console.log(
          `✅ [BATCH] Lote ${batchNumber} concluído em ${batchTime}ms`
        );

        // Pequena pausa entre lotes para não sobrecarregar
        if (i + concurrencyLimit < scoreRequests.length) {
          await this.sleep(500); // 500ms entre lotes
        }
      } catch (error) {
        console.error(`❌ [BATCH] Erro no lote ${batchNumber}:`, error);

        // Fallback para todo o lote em caso de erro crítico
        for (const request of batch) {
          results.push({
            scoreId: request.scoreId,
            downloadUrl: `https://imslp.org${request.hiddenLink}`,
            processingTime: 0,
            success: false,
            error: 'Erro crítico no processamento do lote',
          });
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;
    const avgTime =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.processingTime, 0) / results.length
        : 0;

    console.log(`🎯 [BATCH] Processamento completo!`);
    console.log(`   ⏱️ Tempo total: ${totalTime}ms`);
    console.log(
      `   ✅ Sucessos: ${successCount}/${results.length} (${(
        (successCount / results.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(`   📊 Tempo médio por URL: ${Math.round(avgTime)}ms`);
    console.log(
      `   🚀 Throughput: ${((results.length / totalTime) * 1000).toFixed(
        2
      )} URLs/segundo\n`
    );

    return results;
  }

  /**
   * 🚀 Processa uma URL individual com timeout e métricas
   */
  private static async processWithTimeout(
    hiddenLink: string,
    scoreId: string
  ): Promise<BatchResult> {
    const startTime = Date.now();

    try {
      // Usar o resolver otimizado com timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000); // 10s timeout por URL
      });

      const resolvePromise =
        IMSLPDirectUrlResolverOptimized.getDirectDownloadUrl(
          hiddenLink,
          scoreId
        );

      const downloadUrl = await Promise.race([resolvePromise, timeoutPromise]);
      const processingTime = Date.now() - startTime;

      return {
        scoreId,
        downloadUrl,
        processingTime,
        success: true,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';

      console.log(
        `   ❌ [BATCH] Falha em ${scoreId}: ${errorMessage} (${processingTime}ms)`
      );

      return {
        scoreId,
        downloadUrl: `https://imslp.org${hiddenLink}`, // Fallback
        processingTime,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 🚀 Versão super-otimizada para casos especiais
   */
  static async processBatchSuperFast(
    scoreRequests: BatchRequest[],
    maxConcurrency = 8
  ): Promise<BatchResult[]> {
    console.log(
      `⚡ [SUPER-BATCH] Modo ultra-rápido: ${scoreRequests.length} URLs`
    );

    const startTime = Date.now();

    // Processar todos de uma vez com limite máximo
    const semaphore = new Semaphore(maxConcurrency);

    const promises = scoreRequests.map(async ({ hiddenLink, scoreId }) => {
      await semaphore.acquire();

      try {
        return await this.processWithTimeout(hiddenLink, scoreId);
      } finally {
        semaphore.release();
      }
    });

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    console.log(
      `⚡ [SUPER-BATCH] ${results.length} URLs processadas em ${totalTime}ms`
    );

    return results;
  }

  /**
   * 🚀 Processamento adaptativo baseado no tamanho do lote
   */
  static async processBatchAdaptive(
    scoreRequests: BatchRequest[]
  ): Promise<BatchResult[]> {
    const count = scoreRequests.length;

    // Estratégia adaptativa baseada no número de URLs
    if (count <= 5) {
      // Lotes pequenos: processar tudo em paralelo
      console.log(
        `🎯 [ADAPTIVE] Lote pequeno (${count}): processamento paralelo total`
      );
      return this.processBatchSuperFast(scoreRequests, count);
    } else if (count <= 20) {
      // Lotes médios: concorrência moderada
      console.log(`⚖️ [ADAPTIVE] Lote médio (${count}): concorrência moderada`);
      return this.processBatch(scoreRequests, 6);
    } else {
      // Lotes grandes: concorrência conservadora para estabilidade
      console.log(
        `🐘 [ADAPTIVE] Lote grande (${count}): concorrência conservadora`
      );
      return this.processBatch(scoreRequests, 4);
    }
  }

  /**
   * 🚀 Análise de performance de um lote
   */
  static analyzePerformance(results: BatchResult[]): {
    summary: string;
    metrics: {
      totalRequests: number;
      successCount: number;
      failureCount: number;
      successRate: number;
      avgResponseTime: number;
      fastestTime: number;
      slowestTime: number;
      medianTime: number;
    };
    recommendations: string[];
  } {
    const total = results.length;
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    const times = successful.map((r) => r.processingTime).sort((a, b) => a - b);
    const avgTime =
      times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const medianTime =
      times.length > 0 ? times[Math.floor(times.length / 2)] : 0;

    const recommendations: string[] = [];
    const successRate = (successful.length / total) * 100;

    if (successRate < 80) {
      recommendations.push(
        'Taxa de sucesso baixa - verificar conectividade ou ajustar timeouts'
      );
    }

    if (avgTime > 3000) {
      recommendations.push(
        'Tempo médio alto - considerar reduzir concorrência ou otimizar cache'
      );
    }

    if (failed.length > total * 0.3) {
      recommendations.push(
        'Muitas falhas - implementar retry automático ou ajustar estratégia'
      );
    }

    const summary = `Processado ${total} URLs: ${
      successful.length
    } sucessos (${successRate.toFixed(1)}%), tempo médio ${avgTime.toFixed(
      0
    )}ms`;

    return {
      summary,
      metrics: {
        totalRequests: total,
        successCount: successful.length,
        failureCount: failed.length,
        successRate,
        avgResponseTime: avgTime,
        fastestTime: times[0] || 0,
        slowestTime: times[times.length - 1] || 0,
        medianTime,
      },
      recommendations,
    };
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 🚀 Semáforo para controle de concorrência
 */
class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.permits--;
      next();
    }
  }
}

// 🚀 Export das interfaces para compatibilidade
export type { BatchRequest, BatchResult };
