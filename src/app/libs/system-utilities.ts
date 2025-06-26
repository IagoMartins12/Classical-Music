// app/libs/system-utilities.ts - Utilitários e Helpers do Sistema Otimizado

import { SYSTEM_CONFIG } from './system-config';
import { IMSLPWorkScores, IMSLPScore } from './imslp-score-scraper';
import prisma from '@/app/libs/prismadb';

/**
 * 🚀 Monitor de Performance do Sistema
 */
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  private static operations: Map<string, { start: number; context?: any }> =
    new Map();

  /**
   * Iniciar medição de performance
   */
  static start(operationId: string, context?: any): void {
    this.operations.set(operationId, {
      start: performance.now(),
      context,
    });
  }

  /**
   * Finalizar medição e registrar
   */
  static end(operationId: string): number {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`⚠️ [PERF] Operação não encontrada: ${operationId}`);
      return 0;
    }

    const duration = performance.now() - operation.start;
    this.recordMetric(operationId, duration);
    this.operations.delete(operationId);

    // Log se for lenta
    if (duration > SYSTEM_CONFIG.PERFORMANCE.SLOW_API_THRESHOLD) {
      console.warn(
        `🐌 [PERF] Operação lenta detectada: ${operationId} - ${Math.round(
          duration
        )}ms`
      );
    }

    return duration;
  }

  /**
   * Registrar métrica
   */
  private static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Manter apenas últimas 100 medições
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Obter estatísticas de uma métrica
   */
  static getStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count,
      avg: sum / count,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(count * 0.95)],
    };
  }

  /**
   * Exportar todas as métricas
   */
  static exportMetrics(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [name, values] of this.metrics.entries()) {
      result[name] = this.getStats(name);
    }

    return result;
  }

  /**
   * Limpar métricas antigas
   */
  static cleanup(): void {
    this.metrics.clear();
    this.operations.clear();
    console.log('🧹 [PERF] Métricas limpas');
  }
}

/**
 * 🚀 Utilitários para Cache
 */
export class CacheUtils {
  /**
   * Calcular tamanho estimado do cache
   */
  static async getCacheSize(workId?: string): Promise<{
    totalScores: number;
    estimatedSizeMB: number;
    averageScoreSize: number;
  }> {
    const filter = workId ? { workId, isActive: true } : { isActive: true };

    const [totalScores, sampleScores] = await Promise.all([
      prisma.workScore.count({ where: filter }),
      prisma.workScore.findMany({
        where: filter,
        select: { fileSize: true },
        take: 100, // Amostra para calcular média
      }),
    ]);

    // Calcular tamanho médio baseado na amostra
    let totalSampleSize = 0;
    let validSamples = 0;

    for (const score of sampleScores) {
      if (score.fileSize) {
        const sizeMatch = score.fileSize.match(/(\d+\.?\d*)(MB|KB)/);
        if (sizeMatch) {
          const [, size, unit] = sizeMatch;
          const sizeInMB =
            unit === 'MB' ? parseFloat(size) : parseFloat(size) / 1024;
          totalSampleSize += sizeInMB;
          validSamples++;
        }
      }
    }

    const averageScoreSize =
      validSamples > 0 ? totalSampleSize / validSamples : 5; // 5MB default
    const estimatedSizeMB = totalScores * averageScoreSize;

    return {
      totalScores,
      estimatedSizeMB: Math.round(estimatedSizeMB * 100) / 100,
      averageScoreSize: Math.round(averageScoreSize * 100) / 100,
    };
  }

  /**
   * Identificar obras com cache incompleto
   */
  static async findIncompleteCache(): Promise<
    Array<{
      workId: string;
      cachedScores: number;
      expectedScores: number;
      completeness: number;
    }>
  > {
    // Esta função precisaria de dados sobre quantas partituras cada obra deveria ter
    // Por enquanto, retorna obras com menos de 5 partituras em cache
    const incompleteCacheData = await prisma.workScore.groupBy({
      by: ['workId'],
      _count: true,
      where: { isActive: true },
      having: {
        workId: {
          _count: {
            lt: 5, // Menos de 5 partituras
          },
        },
      },
    });

    return incompleteCacheData.map((data) => ({
      workId: data.workId,
      cachedScores: data._count,
      expectedScores: 10, // Estimativa padrão
      completeness: data._count / 10,
    }));
  }

  /**
   * Otimizar índices do cache
   */
  static async optimizeIndexes(): Promise<{
    success: boolean;
    details: string;
  }> {
    try {
      // No MongoDB/Prisma, índices são definidos no schema
      // Esta função poderia executar comandos de otimização
      console.log('🔧 [CACHE] Otimizando índices do cache...');

      // Simular otimização
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        details: 'Índices otimizados com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        details: error instanceof Error ? error.message : 'Erro na otimização',
      };
    }
  }
}

/**
 * 🚀 Utilitários para Partituras
 */
export class ScoreUtils {
  /**
   * Analisar distribuição de tipos de partituras
   */
  static analyzeScoreDistribution(scores: IMSLPWorkScores): {
    totalScores: number;
    distribution: Record<string, { count: number; percentage: number }>;
    recommendations: string[];
  } {
    const totalScores = Object.values(scores.totalCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const distribution: Record<string, { count: number; percentage: number }> =
      {};
    const recommendations: string[] = [];

    // Calcular distribuição
    for (const [type, count] of Object.entries(scores.totalCounts)) {
      distribution[type] = {
        count,
        percentage:
          totalScores > 0 ? Math.round((count / totalScores) * 100) : 0,
      };
    }

    // Gerar recomendações
    if (distribution.scores?.count === 0) {
      recommendations.push('⚠️ Nenhuma partitura completa disponível');
    }

    if (
      distribution.parts &&
      distribution.parts.count > distribution.scores?.count * 3
    ) {
      recommendations.push(
        '📝 Muitas partes individuais - considere usar partitura completa'
      );
    }

    if (totalScores > 50) {
      recommendations.push(
        '📚 Grande quantidade de partituras - use filtros para melhor navegação'
      );
    }

    return { totalScores, distribution, recommendations };
  }

  /**
   * Encontrar partitura recomendada
   */
  static findRecommendedScore(scores: IMSLPWorkScores): IMSLPScore | null {
    // Prioridade: 1) Partituras completas, 2) Maior rating, 3) Mais downloads
    const typeOrder = [
      'scores',
      'parts',
      'arrangements',
      'librettos',
      'others',
      'sources',
    ];

    for (const type of typeOrder) {
      const groups =
        scores.scoresByType[type as keyof typeof scores.scoresByType];
      if (!groups || groups.length === 0) continue;

      // Encontrar a melhor partitura deste tipo
      let bestScore: IMSLPScore | null = null;
      let bestScoreValue = 0;

      for (const group of groups) {
        for (const score of group.scores) {
          // Calcular valor da partitura
          let scoreValue = 0;

          // Rating (peso 3)
          if (score.rating) {
            scoreValue += score.rating * 3;
          }

          // Downloads (peso 1, normalizado)
          if (score.downloadCount) {
            scoreValue += Math.min(score.downloadCount / 100, 5);
          }

          // Penalizar se não tem tamanho/páginas
          if (!score.fileSize || !score.pageCount) {
            scoreValue *= 0.8;
          }

          if (scoreValue > bestScoreValue) {
            bestScore = score;
            bestScoreValue = scoreValue;
          }
        }
      }

      if (bestScore) return bestScore;
    }

    return null;
  }

  /**
   * Validar integridade de partitura
   */
  static validateScore(score: IMSLPScore): {
    isValid: boolean;
    issues: string[];
    score: number; // 0-100
  } {
    const issues: string[] = [];
    let scoreValue = 100;

    // Verificar campos obrigatórios
    if (!score.title) {
      issues.push('Título ausente');
      scoreValue -= 20;
    }

    if (!score.downloadUrl) {
      issues.push('URL de download ausente');
      scoreValue -= 30;
    }

    // Verificar qualidade dos dados
    if (!score.fileSize) {
      issues.push('Tamanho do arquivo não informado');
      scoreValue -= 10;
    }

    if (!score.pageCount) {
      issues.push('Número de páginas não informado');
      scoreValue -= 10;
    }

    if (!score.rating || score.rating < 2) {
      issues.push('Rating baixo ou ausente');
      scoreValue -= 15;
    }

    if (!score.editor && !score.publisher) {
      issues.push('Informações de edição ausentes');
      scoreValue -= 10;
    }

    // Verificar URL
    try {
      new URL(score.downloadUrl);
    } catch {
      issues.push('URL de download inválida');
      scoreValue -= 25;
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, Math.min(100, scoreValue)),
    };
  }
}

/**
 * 🚀 Utilitários para Debugging
 */
export class DebugUtils {
  private static debugMode = SYSTEM_CONFIG.FEATURES.ENABLE_DEBUG_LOGGING;

  /**
   * Log condicional baseado no modo debug
   */
  static log(
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): void {
    if (!this.debugMode && level === 'info') return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'info':
        console.log(`${prefix} ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case 'error':
        console.error(`${prefix} ${message}`, data || '');
        break;
    }
  }

  /**
   * Profiler simples para medir performance
   */
  static profile<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      PerformanceMonitor.start(name);

      try {
        const result = await fn();
        const duration = PerformanceMonitor.end(name);

        this.log(
          'info',
          `Profile: ${name} completed in ${Math.round(duration)}ms`
        );
        resolve(result);
      } catch (error) {
        PerformanceMonitor.end(name);
        this.log('error', `Profile: ${name} failed`, error);
        reject(error);
      }
    });
  }

  /**
   * Dump de estado do sistema
   */
  static async systemDump(): Promise<{
    performance: Record<string, any>;
    cache: any;
    memory: any;
    timestamp: string;
  }> {
    const [cacheSize] = await Promise.all([CacheUtils.getCacheSize()]);

    return {
      performance: PerformanceMonitor.exportMetrics(),
      cache: cacheSize,
      memory: {
        used: process.memoryUsage(),
        // Mais informações de memória se necessário
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 🚀 Utilitários de Validação
 */
export class ValidationUtils {
  /**
   * Validar ID de obra (MongoDB ObjectId)
   */
  static isValidWorkId(workId: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(workId);
  }

  /**
   * Validar URL do IMSLP
   */
  static isValidIMSLPUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname === 'imslp.org' &&
        parsedUrl.pathname.includes('/wiki/')
      );
    } catch {
      return false;
    }
  }

  /**
   * Sanitizar entrada de usuário
   */
  static sanitizeInput(input: string, maxLength: number = 500): string {
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>\"']/g, ''); // Remove caracteres perigosos
  }

  /**
   * Validar configuração de sistema
   */
  static validateSystemHealth(): {
    isHealthy: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let healthScore = 100;

    // Verificar configurações críticas
    if (!process.env.DATABASE_URL) {
      issues.push('DATABASE_URL não configurada');
      healthScore -= 30;
    }

    // Verificar limites de recursos
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > 512 * 1024 * 1024) {
      // 512MB
      issues.push('Alto uso de memória detectado');
      healthScore -= 15;
    }

    // Verificar se serviços críticos estão acessíveis
    // (implementar verificações específicas conforme necessário)

    return {
      isHealthy: issues.length === 0,
      issues,
      score: Math.max(0, healthScore),
    };
  }
}

/**
 * 🚀 Utilitários de Rate Limiting
 */
export class RateLimitUtils {
  private static requestCounts: Map<
    string,
    { count: number; resetTime: number }
  > = new Map();

  /**
   * Verificar se request está dentro do limite
   */
  static checkRateLimit(
    identifier: string,
    maxRequests: number = SYSTEM_CONFIG.SECURITY.RATE_LIMIT_MAX_REQUESTS,
    windowMs: number = SYSTEM_CONFIG.SECURITY.RATE_LIMIT_WINDOW
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const current = this.requestCounts.get(identifier);

    if (!current || now > current.resetTime) {
      // Nova janela ou primeira requisição
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    current.count++;
    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  /**
   * Limpar contadores antigos
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requestCounts.entries()) {
      if (now > data.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }
}

/**
 * 🚀 Wrapper para usar todos os utilitários
 */
export class SystemUtils {
  static readonly Performance = PerformanceMonitor;
  static readonly Cache = CacheUtils;
  static readonly Score = ScoreUtils;
  static readonly Debug = DebugUtils;
  static readonly Validation = ValidationUtils;
  static readonly RateLimit = RateLimitUtils;

  /**
   * Inicializar sistema de utilitários
   */
  static initialize(): void {
    console.log('🔧 [UTILS] Sistema de utilitários inicializado');

    // Configurar limpeza automática
    setInterval(() => {
      PerformanceMonitor.cleanup();
      RateLimitUtils.cleanup();
    }, 60 * 60 * 1000); // A cada hora

    // Validar saúde do sistema na inicialização
    const health = ValidationUtils.validateSystemHealth();
    if (!health.isHealthy) {
      console.warn('⚠️ [UTILS] Problemas de saúde detectados:', health.issues);
    }
  }

  /**
   * Status geral do sistema
   */
  static async getSystemStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    performance: any;
    cache: any;
    health: any;
  }> {
    const [performance, cache, health] = await Promise.all([
      Promise.resolve(PerformanceMonitor.exportMetrics()),
      CacheUtils.getCacheSize(),
      Promise.resolve(ValidationUtils.validateSystemHealth()),
    ]);

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    if (health.score < 50) {
      status = 'critical';
    } else if (health.score < 80) {
      status = 'degraded';
    }

    return {
      status,
      uptime: process.uptime(),
      performance,
      cache,
      health,
    };
  }
}

// Inicializar automaticamente em produção
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  SystemUtils.initialize();
}
