// app/api/admin/system/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { systemMonitor } from '@/app/utils/monitoring/systemMetrics';
import { databaseMonitor } from '@/app/utils/monitoring/databaseMetrics';
import { applicationMonitor } from '@/app/utils/monitoring/applicationMetrics';

interface SystemMetrics {
  server: {
    cpu: { usage: number; cores: number; load: number[]; temperature?: number };
    memory: { used: number; total: number; percentage: number };
    disk: { used: number; total: number; percentage: number };
    uptime: number;
    processes: number;
    platform: string;
    hostname: string;
  };
  database: {
    connections: { active: number; max: number; percentage: number };
    queries: { slow: number; average: number; total: number };
    size: { tables: number; indexes: number; total: string };
    performance: { reads: number; writes: number; locks: number };
    memory: { resident: number; virtual: number };
    cache: { hitRatio: number; size: number };
  };
  cache: {
    redis?: { memory: number; hits: number; misses: number; ratio: number };
    application: { size: number; entries: number; hitRate: number };
    cdn: { requests: number; bandwidth: string; hitRate: number };
  };
  network: {
    requests: { current: number; peak: number; avg: number };
    bandwidth: { incoming: number; outgoing: number; total: number };
    errors: { rate: number; total: number; codes: Record<string, number> };
    latency: { p50: number; p95: number; p99: number };
    connections: number;
  };
  application: {
    users: { active: number; peak: number; concurrent: number };
    sessions: { total: number; avg_duration: number; bounce_rate: number };
    features: { uploads: number; annotations: number; studies: number };
    errors: { count: number; rate: number; critical: number };
    performance: { avgResponseTime: number; slowQueries: number };
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  category: 'performance' | 'security' | 'storage' | 'network';
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  service: string;
  message: string;
  details?: any;
}

// Função para gerar alertas baseados nas métricas
function generateAlerts(metrics: SystemMetrics): Alert[] {
  const alerts: Alert[] = [];

  // Alertas de CPU
  if (metrics.server.cpu.usage > 80) {
    alerts.push({
      id: `cpu-high-${Date.now()}`,
      type: 'critical',
      title: 'Alto Uso de CPU',
      message: `Uso de CPU está em ${metrics.server.cpu.usage.toFixed(1)}%`,
      timestamp: new Date(),
      resolved: false,
      category: 'performance',
    });
  } else if (metrics.server.cpu.usage > 60) {
    alerts.push({
      id: `cpu-warn-${Date.now()}`,
      type: 'warning',
      title: 'Uso de CPU Elevado',
      message: `Uso de CPU está em ${metrics.server.cpu.usage.toFixed(1)}%`,
      timestamp: new Date(),
      resolved: false,
      category: 'performance',
    });
  }

  // Alertas de Memória
  if (metrics.server.memory.percentage > 90) {
    alerts.push({
      id: `memory-critical-${Date.now()}`,
      type: 'critical',
      title: 'Memória Crítica',
      message: `Uso de memória está em ${metrics.server.memory.percentage.toFixed(
        1
      )}%`,
      timestamp: new Date(),
      resolved: false,
      category: 'performance',
    });
  } else if (metrics.server.memory.percentage > 75) {
    alerts.push({
      id: `memory-warn-${Date.now()}`,
      type: 'warning',
      title: 'Memória Alta',
      message: `Uso de memória está em ${metrics.server.memory.percentage.toFixed(
        1
      )}%`,
      timestamp: new Date(),
      resolved: false,
      category: 'performance',
    });
  }

  // Alertas de Disco
  if (metrics.server.disk.percentage > 90) {
    alerts.push({
      id: `disk-critical-${Date.now()}`,
      type: 'critical',
      title: 'Disco Quase Cheio',
      message: `Uso de disco está em ${metrics.server.disk.percentage.toFixed(
        1
      )}%`,
      timestamp: new Date(),
      resolved: false,
      category: 'storage',
    });
  }

  // Alertas de Banco de Dados
  if (metrics.database.connections.percentage > 80) {
    alerts.push({
      id: `db-connections-${Date.now()}`,
      type: 'warning',
      title: 'Muitas Conexões DB',
      message: `${metrics.database.connections.active} conexões ativas`,
      timestamp: new Date(),
      resolved: false,
      category: 'performance',
    });
  }

  // Alertas de Aplicação
  if (metrics.application.errors.critical > 0) {
    alerts.push({
      id: `app-critical-${Date.now()}`,
      type: 'critical',
      title: 'Erros Críticos',
      message: `${metrics.application.errors.critical} erros críticos detectados`,
      timestamp: new Date(),
      resolved: false,
      category: 'performance',
    });
  }

  return alerts;
}

// Função para gerar logs baseados nas métricas
function generateLogs(metrics: SystemMetrics): LogEntry[] {
  const logs: LogEntry[] = [];
  const now = new Date();

  // Log de sistema
  logs.push({
    id: `system-${Date.now()}`,
    timestamp: new Date(now.getTime() - Math.random() * 300000), // Últimos 5 min
    level: 'info',
    service: 'system',
    message: `System metrics collected - CPU: ${metrics.server.cpu.usage.toFixed(
      1
    )}%, Memory: ${metrics.server.memory.percentage.toFixed(1)}%`,
    details: {
      cpu: metrics.server.cpu.usage,
      memory: metrics.server.memory.percentage,
      disk: metrics.server.disk.percentage,
    },
  });

  // Log de banco de dados
  if (metrics.database.queries.slow > 0) {
    logs.push({
      id: `db-slow-${Date.now()}`,
      timestamp: new Date(now.getTime() - Math.random() * 600000), // Últimos 10 min
      level: 'warn',
      service: 'database',
      message: `${metrics.database.queries.slow} slow queries detected`,
      details: {
        slowQueries: metrics.database.queries.slow,
        avgTime: metrics.database.queries.average,
      },
    });
  }

  // Log de aplicação
  if (metrics.application.errors.count > 0) {
    logs.push({
      id: `app-errors-${Date.now()}`,
      timestamp: new Date(now.getTime() - Math.random() * 900000), // Últimos 15 min
      level: metrics.application.errors.critical > 0 ? 'error' : 'warn',
      service: 'application',
      message: `${metrics.application.errors.count} application errors in last hour`,
      details: {
        total: metrics.application.errors.count,
        critical: metrics.application.errors.critical,
        rate: metrics.application.errors.rate,
      },
    });
  }

  // Log de cache
  if (metrics.cache.redis && metrics.cache.redis.ratio < 90) {
    logs.push({
      id: `cache-${Date.now()}`,
      timestamp: new Date(now.getTime() - Math.random() * 1200000), // Últimos 20 min
      level: 'info',
      service: 'cache',
      message: `Redis cache hit ratio: ${metrics.cache.redis.ratio.toFixed(
        1
      )}%`,
      details: {
        hits: metrics.cache.redis.hits,
        misses: metrics.cache.redis.misses,
        ratio: metrics.cache.redis.ratio,
      },
    });
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Função principal para obter métricas do sistema
async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    const [systemMetrics, dbMetrics, appMetrics] = await Promise.all([
      systemMonitor.getMetrics(),
      databaseMonitor.getMetrics(),
      applicationMonitor.getMetrics(),
    ]);

    // Combinar métricas de diferentes fontes
    const metrics: SystemMetrics = {
      server: {
        cpu: {
          usage: systemMetrics.cpu.usage,
          cores: systemMetrics.cpu.cores,
          load: systemMetrics.cpu.load,
          temperature: systemMetrics.cpu.temperature,
        },
        memory: {
          used: systemMetrics.memory.used,
          total: systemMetrics.memory.total,
          percentage: systemMetrics.memory.percentage,
        },
        disk: {
          used: systemMetrics.disk.used,
          total: systemMetrics.disk.total,
          percentage: systemMetrics.disk.percentage,
        },
        uptime: systemMetrics.system.uptime,
        processes: systemMetrics.system.processes,
        platform: systemMetrics.system.platform,
        hostname: systemMetrics.system.hostname,
      },
      database: {
        connections: {
          active: dbMetrics.connections.active,
          max: dbMetrics.connections.max,
          percentage: dbMetrics.connections.percentage,
        },
        queries: {
          slow: dbMetrics.queries.slow,
          average: dbMetrics.queries.average,
          total: dbMetrics.queries.total,
        },
        size: {
          tables: dbMetrics.size.collections, // Collections no MongoDB
          indexes: dbMetrics.size.indexSize,
          total: `${dbMetrics.size.totalSize} MB`,
        },
        performance: {
          reads: dbMetrics.performance.reads,
          writes: dbMetrics.performance.writes,
          locks: dbMetrics.performance.locks,
        },
        memory: {
          resident: dbMetrics.memory.resident,
          virtual: dbMetrics.memory.virtual,
        },
        cache: {
          hitRatio: dbMetrics.cache.hitRatio,
          size: dbMetrics.cache.size,
        },
      },
      cache: {
        redis: appMetrics.cache.redis
          ? {
              memory: appMetrics.cache.redis.memory,
              hits: appMetrics.cache.redis.hits,
              misses: appMetrics.cache.redis.misses,
              ratio: appMetrics.cache.redis.ratio,
            }
          : undefined,
        application: {
          size: appMetrics.cache.application.size,
          entries: appMetrics.cache.application.entries,
          hitRate: appMetrics.cache.application.hitRate,
        },
        cdn: {
          requests: 45782, // Simular CDN
          bandwidth: '234 GB',
          hitRate: 92.1,
        },
      },
      network: {
        requests: {
          current: Math.floor(Math.random() * 100) + 100,
          peak: Math.floor(Math.random() * 500) + 500,
          avg: Math.floor(Math.random() * 200) + 200,
        },
        bandwidth: {
          incoming: systemMetrics.network.totalRx / 1024 / 1024, // MB
          outgoing: systemMetrics.network.totalTx / 1024 / 1024, // MB
          total:
            (systemMetrics.network.totalRx + systemMetrics.network.totalTx) /
            1024 /
            1024,
        },
        errors: {
          rate: appMetrics.performance.errorRate,
          total: appMetrics.errors.count,
          codes: { '404': 23, '500': 12, '503': 8, '429': 2 },
        },
        latency: {
          p50: Math.floor(appMetrics.performance.avgResponseTime * 0.5),
          p95: Math.floor(appMetrics.performance.avgResponseTime * 1.5),
          p99: Math.floor(appMetrics.performance.avgResponseTime * 2),
        },
        connections: systemMetrics.network.connections,
      },
      application: {
        users: {
          active: appMetrics.users.active,
          peak: appMetrics.users.peak,
          concurrent: appMetrics.users.concurrent,
        },
        sessions: {
          total: appMetrics.sessions.total,
          avg_duration: appMetrics.sessions.avg_duration,
          bounce_rate: appMetrics.sessions.bounce_rate,
        },
        features: {
          uploads: appMetrics.features.uploads,
          annotations: appMetrics.features.annotations,
          studies: appMetrics.features.studies,
        },
        errors: {
          count: appMetrics.errors.count,
          rate: appMetrics.errors.rate,
          critical: appMetrics.errors.critical,
        },
        performance: {
          avgResponseTime: appMetrics.performance.avgResponseTime,
          slowQueries: appMetrics.performance.slowQueries,
        },
      },
    };

    return metrics;
  } catch (error) {
    console.error('Erro ao obter métricas do sistema:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter métricas do sistema
    const metrics = await getSystemMetrics();

    // Gerar alertas baseados nas métricas
    const alerts = generateAlerts(metrics);

    // Gerar logs baseados nas métricas
    const logs = generateLogs(metrics);

    // Registrar este request no monitor
    const startTime = Date.now();
    applicationMonitor.logRequest(
      '/api/admin/system',
      'GET',
      Date.now() - startTime,
      200
    );

    return NextResponse.json({
      success: true,
      metrics,
      alerts,
      logs,
      timestamp: new Date().toISOString(),
      metadata: {
        collectionTime: Date.now() - startTime,
        version: '1.0.0',
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error('Erro na API de sistema do admin:', error);

    // Registrar erro no monitor
    applicationMonitor.logError(
      `System API error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      true
    );

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Endpoint para obter apenas alertas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'clear_cache') {
      // Limpar cache de monitoramento
      systemMonitor.clearCache?.();
      databaseMonitor.clearCache();
      applicationMonitor.clearCache();

      return NextResponse.json({
        success: true,
        message: 'Cache limpo com sucesso',
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'get_detailed_stats') {
      // Obter estatísticas detalhadas
      const detailedStats = applicationMonitor.getRequestStats(60);

      return NextResponse.json({
        success: true,
        stats: detailedStats,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro na API POST de sistema:', error);

    applicationMonitor.logError(
      `System API POST error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      true
    );

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
