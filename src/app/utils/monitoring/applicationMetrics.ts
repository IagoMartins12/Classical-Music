// app/utils/monitoring/applicationMetrics.ts
import prisma from '@/app/libs/prismadb';
import { Redis } from 'ioredis';

export interface ApplicationMetrics {
  users: {
    active: number;
    peak: number;
    concurrent: number;
    newToday: number;
    totalOnline: number;
    totalUsers: number;
  };
  sessions: {
    total: number;
    active: number;
    avg_duration: number;
    bounce_rate: number;
    newToday: number;
  };
  features: {
    uploads: number;
    annotations: number;
    studies: number;
    favorites: number;
    searches: number;
  };
  errors: {
    count: number;
    rate: number;
    critical: number;
    warnings: number;
  };
  performance: {
    avgResponseTime: number;
    slowQueries: number;
    cacheHitRate: number;
    errorRate: number;
  };
  cache: {
    redis?: {
      memory: number;
      hits: number;
      misses: number;
      ratio: number;
      keys: number;
      clients: number;
    };
    application: {
      size: number;
      entries: number;
      hitRate: number;
    };
  };
}

export interface RequestMetrics {
  path: string;
  method: string;
  timestamp: number;
  duration: number;
  status: number;
  error?: string;
}

class ApplicationMonitor {
  private static instance: ApplicationMonitor;
  private redisClient: Redis | null = null;
  private metricsCache: ApplicationMetrics | null = null;
  private lastMetricsCheck: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 segundos

  // Armazenar métricas em memória (em produção, usar Redis ou BD)
  private requestMetrics: RequestMetrics[] = [];
  private errorLog: Array<{
    timestamp: number;
    error: string;
    critical: boolean;
  }> = [];
  private activeUsers: Set<string> = new Set();
  private activeSessions: Set<string> = new Set();

  private constructor() {
    this.initializeRedis();
    this.startCleanupInterval();
  }

  public static getInstance(): ApplicationMonitor {
    if (!ApplicationMonitor.instance) {
      ApplicationMonitor.instance = new ApplicationMonitor();
    }
    return ApplicationMonitor.instance;
  }

  // Inicializar Redis se disponível
  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        this.redisClient = new Redis(redisUrl);
        console.log('Redis conectado para monitoramento');
      }
    } catch (_error) {
      console.log('Redis não disponível, usando cache em memória');
    }
  }

  // Limpeza automática de dados antigos
  private startCleanupInterval(): void {
    setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      // Limpar métricas antigas
      this.requestMetrics = this.requestMetrics.filter(
        (metric) => metric.timestamp > oneHourAgo
      );

      this.errorLog = this.errorLog.filter(
        (error) => error.timestamp > oneHourAgo
      );
    }, 5 * 60 * 1000); // A cada 5 minutos
  }

  // Registrar request
  public logRequest(
    path: string,
    method: string,
    duration: number,
    status: number,
    error?: string
  ): void {
    this.requestMetrics.push({
      path,
      method,
      timestamp: Date.now(),
      duration,
      status,
      error,
    });

    // Manter apenas últimos 1000 requests
    if (this.requestMetrics.length > 1000) {
      this.requestMetrics = this.requestMetrics.slice(-1000);
    }
  }

  // Registrar erro
  public logError(error: string, critical: boolean = false): void {
    this.errorLog.push({
      timestamp: Date.now(),
      error,
      critical,
    });

    // Manter apenas últimos 500 erros
    if (this.errorLog.length > 500) {
      this.errorLog = this.errorLog.slice(-500);
    }
  }

  // Registrar usuário ativo
  public registerActiveUser(userId: string): void {
    this.activeUsers.add(userId);
  }

  // Registrar sessão ativa
  public registerActiveSession(sessionId: string): void {
    this.activeSessions.add(sessionId);
  }

  // Obter métricas de usuários
  private async getUserMetrics(): Promise<ApplicationMetrics['users']> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [activeUsers, newToday, totalUsers, recentSessions] =
        await Promise.all([
          // Usuários ativos nas últimas 24 horas
          prisma.user.count({
            where: {
              updatedAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          }),
          // Novos usuários hoje
          prisma.user.count({
            where: {
              createdAt: {
                gte: today,
              },
            },
          }),
          // Total de usuários
          prisma.user.count(),
          // Sessões ativas
          prisma.session.count({
            where: {
              expires: {
                gt: new Date(),
              },
            },
          }),
        ]);

      return {
        active: activeUsers,
        peak: Math.max(activeUsers, 100), // Simular pico
        concurrent: this.activeUsers.size,
        newToday,
        totalOnline: recentSessions,
        totalUsers: totalUsers,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de usuários:', error);
      return {
        active: 0,
        peak: 0,
        concurrent: 0,
        newToday: 0,
        totalOnline: 0,
        totalUsers: 0,
      };
    }
  }

  // Obter métricas de sessões
  private async getSessionMetrics(): Promise<ApplicationMetrics['sessions']> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalSessions, activeSessions, todaySessions, avgDuration] =
        await Promise.all([
          prisma.session.count(),
          prisma.session.count({
            where: {
              expires: {
                gt: new Date(),
              },
            },
          }),
          prisma.studySession.count({
            where: {
              date: {
                gte: today,
              },
            },
          }),
          prisma.studySession.aggregate({
            _avg: {
              durationMin: true,
            },
          }),
        ]);

      return {
        total: totalSessions,
        active: activeSessions,
        avg_duration: avgDuration._avg.durationMin || 0,
        bounce_rate: Math.random() * 30 + 15, // Simular bounce rate
        newToday: todaySessions,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de sessões:', error);
      return {
        total: 0,
        active: 0,
        avg_duration: 0,
        bounce_rate: 0,
        newToday: 0,
      };
    }
  }

  // Obter métricas de features
  private async getFeatureMetrics(): Promise<ApplicationMetrics['features']> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [uploads, annotations, studies, favorites] = await Promise.all([
        prisma.uploadHistory.count({
          where: {
            createdAt: {
              gte: today,
            },
          },
        }),
        prisma.workAnnotation.count({
          where: {
            createdAt: {
              gte: today,
            },
          },
        }),
        prisma.studySession.count({
          where: {
            date: {
              gte: today,
            },
          },
        }),
        prisma.favoriteScore.count({
          where: {
            createdAt: {
              gte: today,
            },
          },
        }),
      ]);

      return {
        uploads,
        annotations,
        studies,
        favorites,
        searches: Math.floor(Math.random() * 1000) + 500, // Simular buscas
      };
    } catch (error) {
      console.error('Erro ao obter métricas de features:', error);
      return {
        uploads: 0,
        annotations: 0,
        studies: 0,
        favorites: 0,
        searches: 0,
      };
    }
  }

  // Obter métricas de erros
  private async getErrorMetrics(): Promise<ApplicationMetrics['errors']> {
    try {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentErrors = this.errorLog.filter(
        (error) => error.timestamp > oneHourAgo
      );

      const criticalErrors = recentErrors.filter((error) => error.critical);
      const warningErrors = recentErrors.filter((error) => !error.critical);

      const totalRequests = this.requestMetrics.length;
      const errorRate =
        totalRequests > 0 ? (recentErrors.length / totalRequests) * 100 : 0;

      return {
        count: recentErrors.length,
        rate: Math.round(errorRate * 100) / 100,
        critical: criticalErrors.length,
        warnings: warningErrors.length,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de erros:', error);
      return {
        count: 0,
        rate: 0,
        critical: 0,
        warnings: 0,
      };
    }
  }

  // Obter métricas de performance
  private async getPerformanceMetrics(): Promise<
    ApplicationMetrics['performance']
  > {
    try {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentRequests = this.requestMetrics.filter(
        (req) => req.timestamp > oneHourAgo
      );

      const avgResponseTime =
        recentRequests.length > 0
          ? recentRequests.reduce((sum, req) => sum + req.duration, 0) /
            recentRequests.length
          : 0;

      const slowQueries = recentRequests.filter(
        (req) => req.duration > 1000
      ).length;
      const errorRequests = recentRequests.filter(
        (req) => req.status >= 400
      ).length;
      const errorRate =
        recentRequests.length > 0
          ? (errorRequests / recentRequests.length) * 100
          : 0;

      return {
        avgResponseTime: Math.round(avgResponseTime),
        slowQueries,
        cacheHitRate: Math.random() * 20 + 80, // Simular cache hit rate
        errorRate: Math.round(errorRate * 100) / 100,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de performance:', error);
      return {
        avgResponseTime: 0,
        slowQueries: 0,
        cacheHitRate: 0,
        errorRate: 0,
      };
    }
  }

  // Obter métricas do Redis
  private async getRedisMetrics(): Promise<
    ApplicationMetrics['cache']['redis']
  > {
    if (!this.redisClient) {
      return undefined;
    }

    try {
      const info = await this.redisClient.info();
      const lines = info.split('\r\n');

      const getInfoValue = (key: string): string => {
        const line = lines.find((line: any) => line.startsWith(key));
        return line ? line.split(':')[1] : '0';
      };

      const usedMemory = parseInt(getInfoValue('used_memory')) / 1024 / 1024; // MB
      const hits = parseInt(getInfoValue('keyspace_hits'));
      const misses = parseInt(getInfoValue('keyspace_misses'));
      const ratio = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
      const keys = parseInt(
        getInfoValue('db0').split(',')[0].split('=')[1] || '0'
      );
      const clients = parseInt(getInfoValue('connected_clients'));

      return {
        memory: Math.round(usedMemory * 100) / 100,
        hits,
        misses,
        ratio: Math.round(ratio * 100) / 100,
        keys,
        clients,
      };
    } catch (error) {
      console.error('Erro ao obter métricas do Redis:', error);
      return undefined;
    }
  }

  // Obter métricas de cache da aplicação
  private async getApplicationCacheMetrics(): Promise<
    ApplicationMetrics['cache']['application']
  > {
    try {
      // Simular métricas de cache da aplicação
      // Em produção, você pode usar uma biblioteca de cache como node-cache
      return {
        size: Math.random() * 2 + 1, // MB
        entries: Math.floor(Math.random() * 5000) + 1000,
        hitRate: Math.random() * 15 + 85, // 85-100%
      };
    } catch (error) {
      console.error('Erro ao obter métricas de cache da aplicação:', error);
      return {
        size: 0,
        entries: 0,
        hitRate: 0,
      };
    }
  }

  // Método principal para obter todas as métricas
  public async getMetrics(): Promise<ApplicationMetrics> {
    const now = Date.now();

    // Usar cache se disponível e não expirado
    if (
      this.metricsCache &&
      now - this.lastMetricsCheck < this.CACHE_DURATION
    ) {
      return this.metricsCache;
    }

    try {
      const [
        users,
        sessions,
        features,
        errors,
        performance,
        redisMetrics,
        appCacheMetrics,
      ] = await Promise.all([
        this.getUserMetrics(),
        this.getSessionMetrics(),
        this.getFeatureMetrics(),
        this.getErrorMetrics(),
        this.getPerformanceMetrics(),
        this.getRedisMetrics(),
        this.getApplicationCacheMetrics(),
      ]);

      const metrics: ApplicationMetrics = {
        users,
        sessions,
        features,
        errors,
        performance,
        cache: {
          redis: redisMetrics,
          application: appCacheMetrics,
        },
      };

      this.metricsCache = metrics;
      this.lastMetricsCheck = now;

      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas da aplicação:', error);

      // Retornar métricas padrão em caso de erro
      return {
        users: {
          active: 0,
          peak: 0,
          concurrent: 0,
          newToday: 0,
          totalOnline: 0,
          totalUsers: 0,
        },
        sessions: {
          total: 0,
          active: 0,
          avg_duration: 0,
          bounce_rate: 0,
          newToday: 0,
        },
        features: {
          uploads: 0,
          annotations: 0,
          studies: 0,
          favorites: 0,
          searches: 0,
        },
        errors: { count: 0, rate: 0, critical: 0, warnings: 0 },
        performance: {
          avgResponseTime: 0,
          slowQueries: 0,
          cacheHitRate: 0,
          errorRate: 0,
        },
        cache: {
          application: { size: 0, entries: 0, hitRate: 0 },
        },
      };
    }
  }

  // Limpar cache manualmente
  public clearCache(): void {
    this.metricsCache = null;
    this.lastMetricsCheck = 0;
  }

  // Obter estatísticas detalhadas de requests
  public getRequestStats(minutes: number = 60): {
    total: number;
    byStatus: Record<number, number>;
    byPath: Record<string, number>;
    avgDuration: number;
    slowRequests: number;
  } {
    const since = Date.now() - minutes * 60 * 1000;
    const requests = this.requestMetrics.filter((req) => req.timestamp > since);

    const byStatus: Record<number, number> = {};
    const byPath: Record<string, number> = {};
    let totalDuration = 0;
    let slowRequests = 0;

    requests.forEach((req) => {
      byStatus[req.status] = (byStatus[req.status] || 0) + 1;
      byPath[req.path] = (byPath[req.path] || 0) + 1;
      totalDuration += req.duration;

      if (req.duration > 1000) {
        slowRequests++;
      }
    });

    return {
      total: requests.length,
      byStatus,
      byPath,
      avgDuration: requests.length > 0 ? totalDuration / requests.length : 0,
      slowRequests,
    };
  }

  // Fechar conexões
  public async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
  }
}

export const applicationMonitor = ApplicationMonitor.getInstance();
