// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './utils/auth';

// ==================================================================================
// SISTEMA DE LOGGING AVANÇADO INTEGRADO
// ==================================================================================

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  category: 'system' | 'security' | 'audit' | 'performance' | 'user' | 'api';
  service: string;
  action: string;
  message: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string | null;
  statusCode?: number | null;
  duration?: number | null;
  details?: any;
  sessionId?: string | null;
  traceId?: string | null;
}

interface AuditEvent {
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

interface RequestMetrics {
  count: number;
  totalDuration: number;
  errors: number;
  lastAccess: number;
  statusCodes: Record<number, number>;
  userAgents: Record<string, number>;
}

interface SecurityEvent {
  timestamp: Date;
  type: 'suspicious' | 'blocked' | 'unauthorized' | 'bot' | 'rate_limit';
  details: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ==================================================================================
// LOGGER AVANÇADO
// ==================================================================================

class AdvancedLogger {
  private static instance: AdvancedLogger;
  private logs: LogEntry[] = [];
  private auditEvents: AuditEvent[] = [];
  private securityEvents: SecurityEvent[] = [];
  private maxLogs = 10000;

  private constructor() {}

  static getInstance(): AdvancedLogger {
    if (!AdvancedLogger.instance) {
      AdvancedLogger.instance = new AdvancedLogger();
    }
    return AdvancedLogger.instance;
  }

  // Métodos principais de logging
  log(entry: Partial<LogEntry>): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level: entry.level || 'info',
      category: entry.category || 'system',
      service: entry.service || 'middleware',
      action: entry.action || 'unknown',
      message: entry.message || '',
      traceId: entry.traceId || this.generateTraceId(),
      ...entry,
    };

    this.logs.unshift(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log crítico para console
    if (entry.level === 'error') {
      console.error(
        `🔴 [${logEntry.category}/${logEntry.service}] ${logEntry.message}`,
        logEntry.details
      );
    } else if (entry.level === 'warn') {
      console.warn(
        `🟡 [${logEntry.category}/${logEntry.service}] ${logEntry.message}`,
        logEntry.details
      );
    } else if (
      process.env.NODE_ENV === 'development' &&
      entry.level === 'info'
    ) {
      console.log(
        `🔵 [${logEntry.category}/${logEntry.service}] ${logEntry.message}`
      );
    }
  }

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

  // Log de segurança
  security(event: Partial<SecurityEvent>): void {
    const securityEvent: SecurityEvent = {
      timestamp: new Date(),
      type: event.type || 'suspicious',
      details: event.details || '',
      severity: event.severity || 'medium',
      ...event,
    };

    this.securityEvents.unshift(securityEvent);

    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(0, 1000);
    }

    // Log de segurança sempre vai para console
    const emoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }[securityEvent.severity];

    console.warn(
      `${emoji} Security Event [${securityEvent.type.toUpperCase()}]: ${
        securityEvent.details
      }`,
      {
        ip: securityEvent.ip,
        userAgent: securityEvent.userAgent?.slice(0, 50),
        userId: securityEvent.userId,
        timestamp: securityEvent.timestamp.toISOString(),
      }
    );

    // Registrar também como log normal
    this.log({
      level:
        securityEvent.severity === 'critical' ||
        securityEvent.severity === 'high'
          ? 'error'
          : 'warn',
      category: 'security',
      service: 'middleware',
      action: `security_${securityEvent.type}`,
      message: securityEvent.details,
      userId: securityEvent.userId,
      ipAddress: securityEvent.ip,
      userAgent: securityEvent.userAgent,
      details: {
        type: securityEvent.type,
        severity: securityEvent.severity,
      },
    });
  }

  // Auditoria
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

    if (this.auditEvents.length > this.maxLogs) {
      this.auditEvents = this.auditEvents.slice(0, this.maxLogs);
    }

    // Log de auditoria
    this.log({
      level: auditEvent.success ? 'info' : 'warn',
      category: 'audit',
      service: 'middleware',
      action: auditEvent.action,
      message: `Audit: ${auditEvent.action} on ${auditEvent.resource}${
        auditEvent.resourceId ? ` (${auditEvent.resourceId})` : ''
      } by ${auditEvent.userName}`,
      userId: auditEvent.userId,
      ipAddress: auditEvent.ipAddress,
      userAgent: auditEvent.userAgent,
      details: {
        resource: auditEvent.resource,
        resourceId: auditEvent.resourceId,
        changes: auditEvent.changes,
        metadata: auditEvent.metadata,
        success: auditEvent.success,
      },
    });
  }

  // Buscar logs com filtros
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

      if (filters.offset) {
        filteredLogs = filteredLogs.slice(filters.offset);
      }

      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
    }

    return filteredLogs;
  }

  // Obter eventos de auditoria
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

      if (filters.offset) {
        filteredEvents = filteredEvents.slice(filters.offset);
      }

      if (filters.limit) {
        filteredEvents = filteredEvents.slice(0, filters.limit);
      }
    }

    return filteredEvents;
  }

  // Obter eventos de segurança
  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents.slice(0, limit);
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
    security: {
      eventsLast24h: number;
      criticalEvents: number;
      blockedRequests: number;
      suspiciousActivity: number;
    };
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

    // Estatísticas de segurança
    const securityEvents24h = this.securityEvents.filter(
      (event) => event.timestamp >= last24h
    );
    const criticalEvents = securityEvents24h.filter(
      (event) => event.severity === 'critical'
    ).length;
    const blockedRequests = securityEvents24h.filter(
      (event) => event.type === 'blocked' || event.type === 'rate_limit'
    ).length;
    const suspiciousActivity = securityEvents24h.filter(
      (event) => event.type === 'suspicious'
    ).length;

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
      security: {
        eventsLast24h: securityEvents24h.length,
        criticalEvents,
        blockedRequests,
        suspiciousActivity,
      },
    };
  }

  // Utilitários privados
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
    this.securityEvents = this.securityEvents.filter(
      (event) => event.timestamp > olderThan
    );
  }
}

// ==================================================================================
// MÉTRICAS DE REQUEST (FUNCIONALIDADE ORIGINAL MANTIDA)
// ==================================================================================

const requestMetrics = new Map<string, RequestMetrics>();
const logger = AdvancedLogger.getInstance();

// Cache para evitar spam de logs
const logCache = new Set<string>();

// Função para registrar métricas de request (atualizada com logging avançado)
function logRequestMetrics(
  path: string,
  method: string,
  duration: number,
  status: number,
  userAgent?: string,
  userId?: string,
  userName?: string,
  ip?: string,
  error?: string,
  traceId?: string
) {
  const key = `${method}:${path}`;
  const current = requestMetrics.get(key) || {
    count: 0,
    totalDuration: 0,
    errors: 0,
    lastAccess: 0,
    statusCodes: {},
    userAgents: {},
  };

  // Atualizar métricas originais
  current.count++;
  current.totalDuration += duration;
  current.lastAccess = Date.now();
  current.statusCodes[status] = (current.statusCodes[status] || 0) + 1;

  if (userAgent) {
    const shortUA = userAgent.split(' ')[0];
    current.userAgents[shortUA] = (current.userAgents[shortUA] || 0) + 1;
  }

  if (status >= 400) {
    current.errors++;
  }

  requestMetrics.set(key, current);

  // NOVO: Logging avançado
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

  logger.log({
    level,
    category: 'api',
    service: 'middleware',
    action: `${method.toLowerCase()}_request`,
    message: error
      ? `${method} ${path} - ${status} (${duration}ms) - Error: ${error}`
      : `${method} ${path} - ${status} (${duration}ms)`,
    userId,
    userName,
    ipAddress: ip,
    userAgent,
    endpoint: path,
    statusCode: status,
    duration,
    traceId,
    details: error
      ? {
          error,
          method,
          path,
          status,
          duration,
        }
      : undefined,
  });

  // Log para desenvolvimento (mantido original)
  if (process.env.NODE_ENV === 'development') {
    const logKey = `${method}:${path}:${status}`;
    if (!logCache.has(logKey)) {
      console.log(
        `[${method}] ${path} - ${status} - ${duration}ms${
          userId ? ` - User: ${userId}` : ''
        }${error ? ` - Error: ${error}` : ''}`
      );
      logCache.add(logKey);
      setTimeout(() => logCache.delete(logKey), 60000);
    }
  }
}

// Função para detectar ataques (atualizada com logging de segurança)
function detectSuspiciousActivity(
  path: string,
  method: string,
  ip?: string,
  userAgent?: string,
  userId?: string
): {
  isSuspicious: boolean;
  reason?: string;
  severity?: SecurityEvent['severity'];
} {
  const key = `${method}:${path}`;
  const metric = requestMetrics.get(key);

  if (!metric) return { isSuspicious: false };

  // Taxa de erro muito alta
  const errorRate = (metric.errors / metric.count) * 100;
  if (errorRate > 50 && metric.count > 10) {
    const reason = `High error rate: ${errorRate.toFixed(1)}%`;
    logger.security({
      type: 'suspicious',
      details: reason,
      ip,
      userAgent,
      userId,
      severity: 'high',
    });
    return {
      isSuspicious: true,
      reason,
      severity: 'high',
    };
  }

  // Rate limiting
  const recentRequests = Array.from(requestMetrics.values())
    .filter((m) => Date.now() - m.lastAccess < 60000)
    .reduce((sum, m) => sum + m.count, 0);

  if (recentRequests > 100) {
    const reason = `High request rate: ${recentRequests} req/min`;
    logger.security({
      type: 'rate_limit',
      details: reason,
      ip,
      userAgent,
      userId,
      severity: 'critical',
    });
    return {
      isSuspicious: true,
      reason,
      severity: 'critical',
    };
  }

  // User agent suspeito
  if (userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /node/i,
      /postman/i,
      /insomnia/i,
    ];

    const isBotUA = suspiciousPatterns.some((pattern) =>
      pattern.test(userAgent)
    );
    if (isBotUA && path.startsWith('/admin')) {
      const reason = `Bot accessing admin area: ${userAgent.slice(0, 50)}`;
      logger.security({
        type: 'bot',
        details: reason,
        ip,
        userAgent,
        userId,
        severity: 'high',
      });
      return {
        isSuspicious: true,
        reason,
        severity: 'high',
      };
    }
  }

  return { isSuspicious: false };
}

// Função para limpar dados antigos (atualizada)
function cleanupOldData() {
  // Limpar métricas antigas (mantido original)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, metric] of requestMetrics.entries()) {
    if (metric.lastAccess < oneHourAgo) {
      requestMetrics.delete(key);
    }
  }

  // NOVO: Limpar logs antigos (7 dias)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  logger.clearOldLogs(oneWeekAgo);
}

// ==================================================================================
// MIDDLEWARE PRINCIPAL (ATUALIZADO COM FUNCIONALIDADES AVANÇADAS)
// ==================================================================================

export default withAuth(
  function middleware(req) {
    const startTime = Date.now();
    const { pathname } = req.nextUrl;
    const method = req.method;
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const token = req.nextauth.token;
    const userId = token?.id || undefined;
    const userName = token
      ? `${token.firstName || ''} ${token.lastName || ''}`.trim() || token.email
      : undefined;

    // Gerar trace ID único
    const traceId = logger['generateTraceId']();

    // Pular monitoramento para recursos estáticos
    if (
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/_next/image') ||
      pathname.startsWith('/api/auth') ||
      pathname.includes('.ico') ||
      pathname.includes('.png') ||
      pathname.includes('.jpg') ||
      pathname.includes('.jpeg') ||
      pathname.includes('.gif') ||
      pathname.includes('.svg') ||
      pathname.includes('.webp') ||
      pathname.includes('.css') ||
      pathname.includes('.js') ||
      pathname.includes('.map')
    ) {
      return NextResponse.next();
    }

    // NOVO: Log inicial da requisição
    logger.info(
      `Request started: ${method} ${pathname}`,
      {
        method,
        pathname,
        userAgent,
        ip,
        userId,
        userName,
      },
      {
        category: 'api',
        service: 'middleware',
        action: 'request_start',
        userId,
        userName,
        ipAddress: ip,
        userAgent,
        endpoint: pathname,
        traceId,
      }
    );

    // Detectar atividade suspeita (atualizado)
    const suspiciousCheck = detectSuspiciousActivity(
      pathname,
      method,
      ip,
      userAgent,
      userId
    );

    if (suspiciousCheck.isSuspicious) {
      console.warn(
        `🚨 Suspicious activity detected: ${suspiciousCheck.reason} - IP: ${ip} - Path: ${pathname}`
      );

      // Para atividade muito suspeita, bloquear
      if (
        suspiciousCheck.severity === 'critical' ||
        suspiciousCheck.reason?.includes('High request rate') ||
        suspiciousCheck.reason?.includes('Bot accessing admin')
      ) {
        logger.security({
          type: 'blocked',
          details: `Request blocked: ${suspiciousCheck.reason}`,
          ip,
          userAgent,
          userId,
          severity: 'critical',
        });

        const response = NextResponse.json(
          { error: 'Rate limit exceeded or unauthorized access' },
          { status: 429 }
        );

        const duration = Date.now() - startTime;
        logRequestMetrics(
          pathname,
          method,
          duration,
          429,
          userAgent,
          userId,
          userName,
          ip,
          suspiciousCheck.reason,
          traceId
        );

        return response;
      }
    }

    // Verificar acesso admin (atualizado com auditoria)
    if (pathname.startsWith('/admin') || pathname.includes('/moderation')) {
      if (!token || token.role !== 2) {
        // NOVO: Log de auditoria para tentativa de acesso não autorizado
        logger.audit({
          userId: userId || 'anonymous',
          userName: userName || 'Anonymous',
          action: 'unauthorized_admin_access',
          resource: 'admin_area',
          resourceId: pathname,
          ipAddress: ip,
          userAgent: userAgent || 'unknown',
          sessionId: `sess_${crypto.randomUUID()}`,
          success: false,
          errorMessage: 'User does not have admin role',
          metadata: {
            requestedPath: pathname,
            userRole: token?.role || 'none',
          },
        });

        logger.security({
          type: 'unauthorized',
          details: `Unauthorized admin access attempt to ${pathname}`,
          ip,
          userAgent,
          userId,
          severity: 'high',
        });

        const duration = Date.now() - startTime;
        logRequestMetrics(
          pathname,
          method,
          duration,
          401,
          userAgent,
          userId,
          userName,
          ip,
          'Unauthorized admin access',
          traceId
        );

        return NextResponse.redirect(new URL('/', req.url));
      } else {
        // NOVO: Log de auditoria para acesso admin autorizado
        logger.audit({
          userId,
          userName: userName || 'Admin',
          action: 'admin_access',
          resource: 'admin_area',
          resourceId: pathname,
          ipAddress: ip,
          userAgent: userAgent || 'unknown',
          sessionId: `sess_${crypto.randomUUID()}`,
          success: true,
          metadata: {
            accessedPath: pathname,
            userRole: token.role,
          },
        });
      }
    }

    // Criar response
    const response = NextResponse.next();

    // Headers (mantidos originais + novos)
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Trace-ID', traceId);
    response.headers.set('X-Timestamp', new Date().toISOString());

    // Headers de segurança
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Headers de debug em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - startTime;
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-Node-Env', process.env.NODE_ENV);
      response.headers.set(
        'X-User-Role',
        token?.role?.toString() || 'anonymous'
      );
    }

    // Log da resposta (será executado após a response)
    setTimeout(() => {
      const duration = Date.now() - startTime;
      const status = response.status || 200;
      logRequestMetrics(
        pathname,
        method,
        duration,
        status,
        userAgent,
        userId,
        userName,
        ip,
        undefined,
        traceId
      );
    }, 0);

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for protected routes
        if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
          const isAuthorized = !!token;

          // NOVO: Log de tentativas de acesso não autorizadas
          if (!isAuthorized) {
            const ip =
              req.headers.get('x-forwarded-for') ||
              req.headers.get('x-real-ip') ||
              'unknown';
            const userAgent = req.headers.get('user-agent');

            logger.security({
              type: 'unauthorized',
              details: `Unauthorized access attempt to protected route: ${pathname}`,
              ip,
              userAgent: userAgent || undefined,
              severity: 'medium',
            });
          }

          return isAuthorized;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};

// ==================================================================================
// FUNÇÕES EXPORTADAS PARA USO PELA API
// ==================================================================================

// Função para obter métricas (mantida original)
export function getRequestMetrics() {
  return Array.from(requestMetrics.entries())
    .map(([key, metric]) => {
      const [method, path] = key.split(':');
      return {
        method,
        path,
        count: metric.count,
        averageDuration: metric.totalDuration / metric.count,
        errorRate: (metric.errors / metric.count) * 100,
        lastAccess: new Date(metric.lastAccess),
        statusCodes: metric.statusCodes,
        topUserAgents: Object.entries(metric.userAgents)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5)
          .reduce((obj, [ua, count]) => ({ ...obj, [ua]: count }), {}),
      };
    })
    .sort((a, b) => b.count - a.count);
}

// NOVO: Função para obter logs através do logger avançado
export function getSystemLogs(filters?: {
  level?: string;
  category?: string;
  service?: string;
  limit?: number;
  offset?: number;
  search?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return logger.getLogs(filters);
}

// NOVO: Função para obter eventos de auditoria
export function getAuditEvents(filters?: {
  userId?: string;
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
}) {
  return logger.getAuditEvents(filters);
}

// NOVO: Função para obter eventos de segurança
export function getSecurityEvents(limit?: number) {
  return logger.getSecurityEvents(limit);
}

// NOVO: Função para obter estatísticas completas
export function getAdvancedStats() {
  return logger.getStats();
}

// Função para obter resumo de métricas (atualizada)
export function getMetricsSummary() {
  const metrics = Array.from(requestMetrics.values());
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const lastHourMetrics = metrics.filter((m) => m.lastAccess > oneHourAgo);
  const lastDayMetrics = metrics.filter((m) => m.lastAccess > oneDayAgo);

  const totalRequests = metrics.reduce((sum, m) => sum + m.count, 0);
  const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
  const avgDuration =
    metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.totalDuration / m.count, 0) /
        metrics.length
      : 0;

  const lastHourRequests = lastHourMetrics.reduce((sum, m) => sum + m.count, 0);
  const lastHourErrors = lastHourMetrics.reduce((sum, m) => sum + m.errors, 0);

  // NOVO: Incluir estatísticas de segurança
  const advancedStats = logger.getStats();

  return {
    total: {
      requests: totalRequests,
      errors: totalErrors,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      averageDuration: Math.round(avgDuration),
    },
    lastHour: {
      requests: lastHourRequests,
      errors: lastHourErrors,
      errorRate:
        lastHourRequests > 0 ? (lastHourErrors / lastHourRequests) * 100 : 0,
    },
    lastDay: {
      requests: lastDayMetrics.reduce((sum, m) => sum + m.count, 0),
      errors: lastDayMetrics.reduce((sum, m) => sum + m.errors, 0),
    },
    uniquePaths: requestMetrics.size,
    oldestMetric:
      metrics.length > 0
        ? new Date(Math.min(...metrics.map((m) => m.lastAccess)))
        : null,
    // NOVO: Estatísticas de segurança
    security: advancedStats.security,
    logs: {
      total: advancedStats.total,
      last24h: advancedStats.last24h,
      errorRate: advancedStats.errorRate,
    },
  };
}

// NOVO: Função para criar logs manuais (para uso em outras partes da aplicação)
export function createLog(entry: Partial<LogEntry>) {
  logger.log(entry);
}

// NOVO: Função para criar eventos de auditoria manuais
export function createAuditEvent(event: Partial<AuditEvent>) {
  logger.audit(event);
}

// NOVO: Função para registrar eventos de segurança
export function logSecurityEvent(event: Partial<SecurityEvent>) {
  logger.security(event);
}

// Configurar limpeza automática (atualizada)
if (typeof globalThis !== 'undefined') {
  const cleanupInterval = setInterval(cleanupOldData, 30 * 60 * 1000); // 30 minutos

  // Limpar interval quando o processo terminar
  process.on('exit', () => clearInterval(cleanupInterval));
  process.on('SIGINT', () => clearInterval(cleanupInterval));
  process.on('SIGTERM', () => clearInterval(cleanupInterval));

  // NOVO: Expor logger globalmente para uso em outras partes da aplicação
  (globalThis as any).systemLogger = logger;
}
