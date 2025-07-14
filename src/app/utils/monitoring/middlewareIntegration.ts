// app/utils/monitoring/middlewareIntegration.ts

import { getMetricsSummary, getRequestMetrics } from '@/app/middleware';

export interface MiddlewareMetrics {
  requests: {
    total: number;
    lastHour: number;
    lastDay: number;
    errorRate: number;
    averageDuration: number;
  };
  endpoints: Array<{
    method: string;
    path: string;
    count: number;
    errorRate: number;
    averageDuration: number;
    lastAccess: Date;
    statusCodes: Record<number, number>;
    topUserAgents: Record<string, number>;
  }>;
  security: {
    suspiciousActivity: number;
    blockedRequests: number;
    adminAccessAttempts: number;
    botRequests: number;
  };
  performance: {
    slowRequests: number;
    fastestEndpoint: string;
    slowestEndpoint: string;
    p95Duration: number;
    p99Duration: number;
  };
}

class MiddlewareMonitor {
  private static instance: MiddlewareMonitor;
  private securityEvents: Array<{
    timestamp: Date;
    type: 'suspicious' | 'blocked' | 'unauthorized' | 'bot';
    details: string;
    ip?: string;
    userAgent?: string;
  }> = [];

  private constructor() {}

  public static getInstance(): MiddlewareMonitor {
    if (!MiddlewareMonitor.instance) {
      MiddlewareMonitor.instance = new MiddlewareMonitor();
    }
    return MiddlewareMonitor.instance;
  }

  // Registrar evento de segurança
  public logSecurityEvent(
    type: 'suspicious' | 'blocked' | 'unauthorized' | 'bot',
    details: string,
    ip?: string,
    userAgent?: string
  ): void {
    this.securityEvents.push({
      timestamp: new Date(),
      type,
      details,
      ip,
      userAgent,
    });

    // Manter apenas eventos das últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(
      (event) => event.timestamp > oneDayAgo
    );

    // Log crítico para console
    if (type === 'blocked' || type === 'suspicious') {
      console.warn(`🚨 Security Event [${type.toUpperCase()}]: ${details}`, {
        ip,
        userAgent: userAgent?.slice(0, 50),
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Obter métricas de segurança
  public getSecurityMetrics(): MiddlewareMetrics['security'] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = this.securityEvents.filter(
      (e) => e.timestamp > oneHourAgo
    );

    return {
      suspiciousActivity: recentEvents.filter((e) => e.type === 'suspicious')
        .length,
      blockedRequests: recentEvents.filter((e) => e.type === 'blocked').length,
      adminAccessAttempts: recentEvents.filter((e) => e.type === 'unauthorized')
        .length,
      botRequests: recentEvents.filter((e) => e.type === 'bot').length,
    };
  }

  // Obter métricas de performance
  public getPerformanceMetrics(): MiddlewareMetrics['performance'] {
    try {
      const requestMetrics = getRequestMetrics();

      if (!requestMetrics || requestMetrics.length === 0) {
        return {
          slowRequests: 0,
          fastestEndpoint: 'N/A',
          slowestEndpoint: 'N/A',
          p95Duration: 0,
          p99Duration: 0,
        };
      }

      // Calcular métricas de performance
      const durations = requestMetrics
        .map((m) => m.averageDuration)
        .sort((a, b) => a - b);
      const slowRequests = requestMetrics.filter(
        (m) => m.averageDuration > 1000
      ).length;

      const fastestEndpoint = requestMetrics.reduce((fastest, current) =>
        current.averageDuration < fastest.averageDuration ? current : fastest
      );

      const slowestEndpoint = requestMetrics.reduce((slowest, current) =>
        current.averageDuration > slowest.averageDuration ? current : slowest
      );

      // Calcular percentis
      const p95Index = Math.floor(durations.length * 0.95);
      const p99Index = Math.floor(durations.length * 0.99);

      return {
        slowRequests,
        fastestEndpoint: `${fastestEndpoint.method} ${fastestEndpoint.path}`,
        slowestEndpoint: `${slowestEndpoint.method} ${slowestEndpoint.path}`,
        p95Duration: durations[p95Index] || 0,
        p99Duration: durations[p99Index] || 0,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de performance:', error);
      return {
        slowRequests: 0,
        fastestEndpoint: 'N/A',
        slowestEndpoint: 'N/A',
        p95Duration: 0,
        p99Duration: 0,
      };
    }
  }

  // Obter todas as métricas do middleware
  public getMetrics(): MiddlewareMetrics {
    try {
      const summary = getMetricsSummary();
      const requestMetrics = getRequestMetrics();
      const securityMetrics = this.getSecurityMetrics();
      const performanceMetrics = this.getPerformanceMetrics();

      return {
        requests: {
          total: summary.total.requests,
          lastHour: summary.lastHour.requests,
          lastDay: summary.lastDay.requests,
          errorRate: summary.total.errorRate,
          averageDuration: summary.total.averageDuration,
        },
        endpoints: requestMetrics,
        security: securityMetrics,
        performance: performanceMetrics,
      };
    } catch (error) {
      console.error('Erro ao obter métricas do middleware:', error);
      return {
        requests: {
          total: 0,
          lastHour: 0,
          lastDay: 0,
          errorRate: 0,
          averageDuration: 0,
        },
        endpoints: [],
        security: {
          suspiciousActivity: 0,
          blockedRequests: 0,
          adminAccessAttempts: 0,
          botRequests: 0,
        },
        performance: {
          slowRequests: 0,
          fastestEndpoint: 'N/A',
          slowestEndpoint: 'N/A',
          p95Duration: 0,
          p99Duration: 0,
        },
      };
    }
  }

  // Obter eventos de segurança recentes
  public getRecentSecurityEvents(limit: number = 50): Array<{
    timestamp: Date;
    type: string;
    details: string;
    ip?: string;
    userAgent?: string;
  }> {
    return this.securityEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Verificar se há alertas de segurança ativos
  public getSecurityAlerts(): Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    category: 'security';
  }> {
    const alerts = [];
    const metrics = this.getSecurityMetrics();
    const now = new Date();

    // Alerta para muitas tentativas de acesso não autorizado
    if (metrics.adminAccessAttempts > 5) {
      alerts.push({
        id: `security-admin-${Date.now()}`,
        type: 'critical' as const,
        title: 'Tentativas de Acesso Admin',
        message: `${metrics.adminAccessAttempts} tentativas não autorizadas de acesso admin`,
        timestamp: now,
        category: 'security' as const,
      });
    }

    // Alerta para requests bloqueados
    if (metrics.blockedRequests > 10) {
      alerts.push({
        id: `security-blocked-${Date.now()}`,
        type: 'warning' as const,
        title: 'Requests Bloqueados',
        message: `${metrics.blockedRequests} requests foram bloqueados por atividade suspeita`,
        timestamp: now,
        category: 'security' as const,
      });
    }

    // Alerta para atividade suspeita
    if (metrics.suspiciousActivity > 20) {
      alerts.push({
        id: `security-suspicious-${Date.now()}`,
        type: 'warning' as const,
        title: 'Atividade Suspeita',
        message: `${metrics.suspiciousActivity} atividades suspeitas detectadas`,
        timestamp: now,
        category: 'security' as const,
      });
    }

    return alerts;
  }

  // Limpar dados antigos
  public cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(
      (event) => event.timestamp > oneDayAgo
    );
  }
}

// Instância singleton
export const middlewareMonitor = MiddlewareMonitor.getInstance();

// Expor globalmente para uso no middleware
if (typeof globalThis !== 'undefined') {
  (globalThis as any).middlewareMonitor = middlewareMonitor;
}

// Utilitários para formatação
export const MiddlewareUtils = {
  formatDuration: (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  },

  formatRequestCount: (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  },

  getStatusCodeColor: (code: number): string => {
    if (code < 300) return 'text-accent-green';
    if (code < 400) return 'text-accent-blue';
    if (code < 500) return 'text-accent-amber';
    return 'text-accent-red';
  },

  getSecurityEventColor: (type: string): string => {
    switch (type) {
      case 'critical':
      case 'blocked':
        return 'text-accent-red bg-accent-red/10 border-accent-red';
      case 'suspicious':
      case 'unauthorized':
        return 'text-accent-amber bg-accent-amber/10 border-accent-amber';
      case 'bot':
        return 'text-accent-blue bg-accent-blue/10 border-accent-blue';
      default:
        return 'text-theme-tertiary bg-theme-secondary border-theme-secondary';
    }
  },

  formatSecurityEventType: (type: string): string => {
    switch (type) {
      case 'suspicious':
        return 'Atividade Suspeita';
      case 'blocked':
        return 'Request Bloqueado';
      case 'unauthorized':
        return 'Acesso Não Autorizado';
      case 'bot':
        return 'Bot Detectado';
      default:
        return type;
    }
  },
};

// Auto-cleanup a cada hora
if (typeof globalThis !== 'undefined') {
  const cleanupInterval = setInterval(() => {
    middlewareMonitor.cleanup();
  }, 60 * 60 * 1000); // 1 hora

  // Limpar interval quando o processo terminar
  process.on('exit', () => clearInterval(cleanupInterval));
  process.on('SIGINT', () => clearInterval(cleanupInterval));
  process.on('SIGTERM', () => clearInterval(cleanupInterval));
}
