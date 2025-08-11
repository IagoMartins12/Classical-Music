// app/libs/logging.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

// Tipos para o sistema de logging
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  category: 'system' | 'security' | 'audit' | 'performance' | 'user' | 'api';
  service: string;
  action: string;
  message: string;
  userId?: string | null;
  userName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  endpoint?: string | null;
  statusCode?: number;
  duration?: number;
  details?: any;
  sessionId?: string | null;
  traceId?: string | null;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: {
    before: any;
    after: any;
  };
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
}

// Logger singleton
class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private auditEvents: AuditEvent[] = [];
  private maxLogs = 10000; // Máximo de logs em memória

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Métodos para criar logs
  log(entry: Partial<LogEntry>): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level: entry.level || 'info',
      category: entry.category || 'system',
      service: entry.service || 'unknown',
      action: entry.action || 'unknown',
      message: entry.message || '',
      traceId: entry.traceId || this.generateTraceId(),
      ...entry,
    };

    this.logs.unshift(logEntry);

    // Limitar número de logs em memória
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log crítico para console também
    if (entry.level === 'error') {
      console.error(
        `[${logEntry.category}/${logEntry.service}] ${logEntry.message}`,
        logEntry.details
      );
    } else if (entry.level === 'warn') {
      console.warn(
        `[${logEntry.category}/${logEntry.service}] ${logEntry.message}`,
        logEntry.details
      );
    }
  }

  // Métodos específicos por nível
  error(message: string, details?: any, context?: Partial<LogEntry>): void {
    this.log({
      level: 'error',
      message,
      details,
      ...context,
    });
  }

  warn(message: string, details?: any, context?: Partial<LogEntry>): void {
    this.log({
      level: 'warn',
      message,
      details,
      ...context,
    });
  }

  info(message: string, details?: any, context?: Partial<LogEntry>): void {
    this.log({
      level: 'info',
      message,
      details,
      ...context,
    });
  }

  debug(message: string, details?: any, context?: Partial<LogEntry>): void {
    this.log({
      level: 'debug',
      message,
      details,
      ...context,
    });
  }

  // Criar evento de auditoria
  audit(event: Partial<AuditEvent>): void {
    const auditEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: event.userId || 'system',
      userName: event.userName || 'System',
      action: event.action || 'unknown',
      resource: event.resource || 'unknown',
      ipAddress: event.ipAddress || 'unknown',
      userAgent: event.userAgent || 'unknown',
      sessionId: event.sessionId || 'unknown',
      success: event.success !== false,
      ...event,
    };

    this.auditEvents.unshift(auditEvent);

    // Limitar número de eventos de auditoria
    if (this.auditEvents.length > this.maxLogs) {
      this.auditEvents = this.auditEvents.slice(0, this.maxLogs);
    }
  }

  // Buscar logs
  getLogs(filters?: {
    level?: string;
    category?: string;
    service?: string;
    limit?: number;
    offset?: number;
    search?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level && filters.level !== 'all') {
        filteredLogs = filteredLogs.filter(
          (log) => log.level === filters.level
        );
      }

      if (filters.category && filters.category !== 'all') {
        filteredLogs = filteredLogs.filter(
          (log) => log.category === filters.category
        );
      }

      if (filters.service && filters.service !== 'all') {
        filteredLogs = filteredLogs.filter(
          (log) => log.service === filters.service
        );
      }

      if (filters.userId) {
        filteredLogs = filteredLogs.filter(
          (log) => log.userId === filters.userId
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.message.toLowerCase().includes(searchLower) ||
            log.userName?.toLowerCase().includes(searchLower) ||
            log.service.toLowerCase().includes(searchLower) ||
            log.action.toLowerCase().includes(searchLower)
        );
      }

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp >= filters.startDate!
        );
      }

      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp <= filters.endDate!
        );
      }

      // Paginação
      if (filters.offset) {
        filteredLogs = filteredLogs.slice(filters.offset);
      }

      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
    }

    return filteredLogs;
  }

  // Buscar eventos de auditoria
  getAuditEvents(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
    offset?: number;
  }): AuditEvent[] {
    let filteredEvents = [...this.auditEvents];

    if (filters) {
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(
          (event) => event.userId === filters.userId
        );
      }

      if (filters.action) {
        filteredEvents = filteredEvents.filter(
          (event) => event.action === filters.action
        );
      }

      if (filters.resource) {
        filteredEvents = filteredEvents.filter(
          (event) => event.resource === filters.resource
        );
      }

      // Paginação
      if (filters.offset) {
        filteredEvents = filteredEvents.slice(filters.offset);
      }

      if (filters.limit) {
        filteredEvents = filteredEvents.slice(0, filters.limit);
      }
    }

    return filteredEvents;
  }

  // Calcular estatísticas
  getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    byService: Record<string, number>;
    last24h: number;
    errorRate: number;
    topErrors: Array<{
      message: string;
      count: number;
      lastSeen: Date;
      level: string;
    }>;
    performanceMetrics: {
      avgResponseTime: number;
      slowQueries: number;
      failedRequests: number;
    };
    activityByHour: Array<{
      hour: number;
      count: number;
    }>;
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Contadores por nível
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contadores por categoria
    const byCategory = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contadores por serviço
    const byService = this.logs.reduce((acc, log) => {
      acc[log.service] = (acc[log.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Logs das últimas 24h
    const last24hCount = this.logs.filter(
      (log) => log.timestamp >= last24h
    ).length;

    // Taxa de erro
    const errorCount = (byLevel.error || 0) + (byLevel.warn || 0);
    const errorRate =
      this.logs.length > 0 ? (errorCount / this.logs.length) * 100 : 0;

    // Top erros
    const errorLogs = this.logs.filter(
      (log) => log.level === 'error' || log.level === 'warn'
    );
    const errorGroups = errorLogs.reduce((acc, log) => {
      const key = log.message;
      if (!acc[key]) {
        acc[key] = {
          message: key,
          count: 0,
          lastSeen: log.timestamp,
          level: log.level,
        };
      }
      acc[key].count++;
      if (log.timestamp > acc[key].lastSeen) {
        acc[key].lastSeen = log.timestamp;
      }
      return acc;
    }, {} as Record<string, { message: string; count: number; lastSeen: Date; level: string }>);

    const topErrors = Object.values(errorGroups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Métricas de performance
    const logsWithDuration = this.logs.filter((log) => log.duration);
    const avgResponseTime =
      logsWithDuration.length > 0
        ? logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) /
          logsWithDuration.length
        : 0;

    const slowQueries = this.logs.filter(
      (log) => (log.duration || 0) > 1000
    ).length;
    const failedRequests = this.logs.filter(
      (log) => (log.statusCode || 0) >= 400
    ).length;

    // Atividade por hora
    const activityByHour = Array.from({ length: 24 }, (_, hour) => {
      const count = this.logs.filter(
        (log) => log.timestamp.getHours() === hour
      ).length;
      return { hour, count };
    });

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      byService,
      last24h: last24hCount,
      errorRate,
      topErrors,
      performanceMetrics: {
        avgResponseTime: Math.round(avgResponseTime),
        slowQueries,
        failedRequests,
      },
      activityByHour,
    };
  }

  // Utilitários
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateTraceId(): string {
    return 'trace_' + Math.random().toString(36).substring(2, 10);
  }

  // Limpar logs antigos
  clearOldLogs(olderThan: Date): void {
    this.logs = this.logs.filter((log) => log.timestamp > olderThan);
    this.auditEvents = this.auditEvents.filter(
      (event) => event.timestamp > olderThan
    );
  }
}

// Instância global do logger
export const logger = Logger.getInstance();

// Middleware para logging automático de APIs
export function withLogging(handler: any) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const traceId = logger['generateTraceId']();

    // Extrair informações da requisição
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    try {
      // Tentar obter informações do usuário
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id;
      const userName = session?.user
        ? `${session.user.firstName || ''} ${
            session.user.lastName || ''
          }`.trim() || session.user.email
        : undefined;

      // Log da requisição
      logger.info(
        `${method} ${url}`,
        {
          method,
          url,
          userAgent,
          ipAddress,
        },
        {
          category: 'api',
          service: 'http',
          action: `${method.toLowerCase()}_request`,
          userId,
          userName,
          ipAddress,
          userAgent,
          endpoint: url,
          traceId,
        }
      );

      // Executar o handler
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      // Log da resposta
      const statusCode = response.status || 200;
      const level =
        statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      logger.log({
        level,
        category: 'api',
        service: 'http',
        action: `${method.toLowerCase()}_response`,
        message: `${method} ${url} - ${statusCode} (${duration}ms)`,
        userId,
        userName,
        ipAddress,
        userAgent,
        endpoint: url,
        statusCode,
        duration,
        traceId,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log do erro
      logger.error(
        `${method} ${url} - Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        {
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                }
              : error,
        },
        {
          category: 'api',
          service: 'http',
          action: `${method.toLowerCase()}_error`,
          ipAddress,
          userAgent,
          endpoint: url,
          statusCode: 500,
          duration,
          traceId,
        }
      );

      throw error;
    }
  };
}

// Helper para logging de ações de usuário
export function logUserAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
) {
  return async (
    userId: string,
    userName: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    logger.audit({
      userId,
      userName,
      action,
      resource: resourceType,
      resourceId,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      sessionId: `sess_${Math.random().toString(36).substring(7)}`,
      success: true,
      metadata: details,
    });
  };
}

// Helper para logging de mudanças de dados
export function logDataChange(
  action: string,
  resourceType: string,
  resourceId: string,
  before: any,
  after: any
) {
  return async (
    userId: string,
    userName: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    logger.audit({
      userId,
      userName,
      action,
      resource: resourceType,
      resourceId,
      changes: { before, after },
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      sessionId: `sess_${Math.random().toString(36).substring(7)}`,
      success: true,
    });
  };
}

// Cleanup automático (executar periodicamente)
setInterval(() => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  logger.clearOldLogs(oneWeekAgo);
}, 60 * 60 * 1000); // A cada hora
