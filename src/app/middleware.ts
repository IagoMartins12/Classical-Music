// middleware.ts - ATUALIZADO COM LOGGING INTEGRADO
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './utils/auth';
import { systemLogger, LogLevel } from './libs/logging/systemLogger';
import { loggingMiddleware } from './libs/logging/loggingMiddleware';

// ==================================================================================
// SISTEMA DE MÉTRICAS ORIGINAL (MANTIDO)
// ==================================================================================

interface RequestMetrics {
  count: number;
  totalDuration: number;
  errors: number;
  lastAccess: number;
  statusCodes: Record<number, number>;
  userAgents: Record<string, number>;
}

const requestMetrics = new Map<string, RequestMetrics>();
const logCache = new Set<string>();

// Função para registrar métricas de request (mantida original + logging integrado)
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

  // ✅ NOVO: O logging já é feito pelo loggingMiddleware
  // Não duplicamos aqui para evitar logs duplicados

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
  severity?: 'low' | 'medium' | 'high' | 'critical';
} {
  const key = `${method}:${path}`;
  const metric = requestMetrics.get(key);

  if (!metric) return { isSuspicious: false };

  // Taxa de erro muito alta
  const errorRate = (metric.errors / metric.count) * 100;
  if (errorRate > 50 && metric.count > 10) {
    const reason = `High error rate: ${errorRate.toFixed(1)}%`;
    systemLogger.logSecurityEvent(reason, 'high', {
      ipAddress: ip,
      userAgent,
      userId,
      path,
      method,
      metadata: { errorRate, totalRequests: metric.count },
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
    systemLogger.logSecurityEvent(reason, 'critical', {
      ipAddress: ip,
      userAgent,
      userId,
      path,
      method,
      metadata: { requestsPerMinute: recentRequests },
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
      systemLogger.logSecurityEvent(reason, 'high', {
        ipAddress: ip,
        userAgent,
        userId,
        path,
        method,
        metadata: {
          detectedPattern: suspiciousPatterns.find((p) => p.test(userAgent))
            ?.source,
        },
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

// Função para limpar dados antigos (mantida original)
function cleanupOldData() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, metric] of requestMetrics.entries()) {
    if (metric.lastAccess < oneHourAgo) {
      requestMetrics.delete(key);
    }
  }
}

// ==================================================================================
// MIDDLEWARE PRINCIPAL (INTEGRADO COM LOGGING)
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
      ? `${token.firstName || ''} ${token.lastName || ''}`.trim() ||
        (token.email as string)
      : undefined;

    // ✅ INTEGRAÇÃO COM O SISTEMA DE LOGGING
    // Usar o loggingMiddleware que já lida com tudo
    return loggingMiddleware(req, async () => {
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

      // Detectar atividade suspeita (usando o sistema original)
      const suspiciousCheck = detectSuspiciousActivity(
        pathname,
        method,
        ip,
        userAgent || undefined,
        userId as string | undefined
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
          // Log já feito pela função detectSuspiciousActivity
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
            userAgent || undefined,
            userId as string | undefined,
            userName as string | undefined,
            ip,
            suspiciousCheck.reason
          );

          return response;
        }
      }

      // Verificar acesso admin (logs de auditoria já são feitos pelo loggingMiddleware)
      if (pathname.startsWith('/admin') || pathname.includes('/moderation')) {
        if (!token || token.role !== 2) {
          const duration = Date.now() - startTime;
          logRequestMetrics(
            pathname,
            method,
            duration,
            401,
            userAgent || undefined,
            userId as string | undefined,
            userName as string | undefined,
            ip,
            'Unauthorized admin access'
          );

          return NextResponse.redirect(new URL('/', req.url));
        }
      }

      // Criar response
      const response = NextResponse.next();

      // Headers (mantidos originais)
      const requestId = crypto.randomUUID();
      response.headers.set('X-Request-ID', requestId);
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
          userAgent || undefined,
          userId as string | undefined,
          userName as string | undefined,
          ip
        );
      }, 0);

      return response;
    });
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

          // Log de tentativas de acesso não autorizadas (feito pelo loggingMiddleware)
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
// FUNÇÕES EXPORTADAS PARA USO PELA API (MANTIDAS ORIGINAIS)
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

// Função para obter resumo de métricas (mantida + integração com logs)
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
  };
}

// Configurar limpeza automática (mantida)
if (typeof globalThis !== 'undefined') {
  const cleanupInterval = setInterval(cleanupOldData, 30 * 60 * 1000); // 30 minutos

  // Limpar interval quando o processo terminar
  process.on('exit', () => clearInterval(cleanupInterval));
  process.on('SIGINT', () => clearInterval(cleanupInterval));
  process.on('SIGTERM', () => clearInterval(cleanupInterval));

  // Log de inicialização do sistema
  systemLogger.logSystemEvent(
    'Middleware de logging inicializado',
    LogLevel.INFO,
    {
      metadata: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    }
  );
}
