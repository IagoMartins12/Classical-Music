// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './utils/auth';

// Armazenar métricas em memória (em produção, usar Redis ou BD)
const requestMetrics = new Map<
  string,
  {
    count: number;
    totalDuration: number;
    errors: number;
    lastAccess: number;
    statusCodes: Record<number, number>;
    userAgents: Record<string, number>;
  }
>();

// Cache para evitar spam de logs
const logCache = new Set<string>();

// Função para registrar métricas de request
function logRequestMetrics(
  path: string,
  method: string,
  duration: number,
  status: number,
  userAgent?: string,
  userId?: string,
  error?: string
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

  // Atualizar métricas
  current.count++;
  current.totalDuration += duration;
  current.lastAccess = Date.now();
  current.statusCodes[status] = (current.statusCodes[status] || 0) + 1;

  if (userAgent) {
    const shortUA = userAgent.split(' ')[0]; // Primeiro token do user agent
    current.userAgents[shortUA] = (current.userAgents[shortUA] || 0) + 1;
  }

  if (status >= 400) {
    current.errors++;
  }

  requestMetrics.set(key, current);

  // Log para desenvolvimento e debugging
  if (process.env.NODE_ENV === 'development') {
    const logKey = `${method}:${path}:${status}`;
    if (!logCache.has(logKey)) {
      console.log(
        `[${method}] ${path} - ${status} - ${duration}ms${
          userId ? ` - User: ${userId}` : ''
        }${error ? ` - Error: ${error}` : ''}`
      );
      logCache.add(logKey);

      // Limpar cache de log periodicamente
      setTimeout(() => logCache.delete(logKey), 60000); // 1 minuto
    }
  }

  // Registrar no monitor de aplicação se disponível
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).applicationMonitor
  ) {
    (globalThis as any).applicationMonitor.logRequest(
      path,
      method,
      duration,
      status,
      error
    );

    if (error) {
      (globalThis as any).applicationMonitor.logError(error, status >= 500);
    }

    if (userId) {
      (globalThis as any).applicationMonitor.registerActiveUser(userId);
    }
  }
}

// Função para limpar métricas antigas (executa a cada 30 minutos)
function cleanupOldMetrics() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  for (const [key, metric] of requestMetrics.entries()) {
    if (metric.lastAccess < oneHourAgo) {
      requestMetrics.delete(key);
    }
  }
}

// Configurar limpeza automática
if (typeof globalThis !== 'undefined') {
  const cleanupInterval = setInterval(cleanupOldMetrics, 30 * 60 * 1000);

  // Limpar interval quando o processo terminar
  process.on('exit', () => clearInterval(cleanupInterval));
  process.on('SIGINT', () => clearInterval(cleanupInterval));
  process.on('SIGTERM', () => clearInterval(cleanupInterval));
}

// Função para detectar ataques ou comportamento suspeito
function detectSuspiciousActivity(
  path: string,
  method: string,
  userAgent?: string
): { isSuspicious: boolean; reason?: string } {
  const key = `${method}:${path}`;
  const metric = requestMetrics.get(key);

  if (!metric) return { isSuspicious: false };

  // Taxa de erro muito alta
  const errorRate = (metric.errors / metric.count) * 100;
  if (errorRate > 50 && metric.count > 10) {
    return {
      isSuspicious: true,
      reason: `High error rate: ${errorRate.toFixed(1)}%`,
    };
  }

  // Muitos requests em pouco tempo (rate limiting básico)
  const recentRequests = Array.from(requestMetrics.values())
    .filter((m) => Date.now() - m.lastAccess < 60000) // Último minuto
    .reduce((sum, m) => sum + m.count, 0);

  if (recentRequests > 100) {
    // Mais de 100 requests por minuto
    return {
      isSuspicious: true,
      reason: `High request rate: ${recentRequests} req/min`,
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
      return {
        isSuspicious: true,
        reason: `Bot accessing admin area: ${userAgent.slice(0, 50)}`,
      };
    }
  }

  return { isSuspicious: false };
}

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

    // Detectar atividade suspeita
    const suspiciousCheck = detectSuspiciousActivity(
      pathname,
      method,
      userAgent
    );
    if (suspiciousCheck.isSuspicious) {
      console.warn(
        `🚨 Suspicious activity detected: ${suspiciousCheck.reason} - IP: ${ip} - Path: ${pathname}`
      );

      // Log no monitor se disponível
      if (
        typeof globalThis !== 'undefined' &&
        (globalThis as any).applicationMonitor
      ) {
        (globalThis as any).applicationMonitor.logError(
          `Suspicious activity: ${suspiciousCheck.reason}`,
          true
        );
      }

      // Para atividade muito suspeita, bloquear
      if (
        suspiciousCheck.reason?.includes('High request rate') ||
        suspiciousCheck.reason?.includes('Bot accessing admin')
      ) {
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
          suspiciousCheck.reason
        );

        return response;
      }
    }

    // Verificar se é admin para rotas administrativas
    if (pathname.startsWith('/admin') || pathname.includes('/moderation')) {
      if (!token || token.role !== 2) {
        const duration = Date.now() - startTime;
        logRequestMetrics(
          pathname,
          method,
          duration,
          401,
          userAgent,
          userId,
          'Unauthorized admin access'
        );

        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Criar response
    const response = NextResponse.next();

    // Adicionar headers de monitoramento
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Timestamp', new Date().toISOString());

    // Headers de segurança básicos
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

    // Log da requisição (será executado quando a response for enviada)
    const duration = Date.now() - startTime;
    const status = response.status || 200;
    logRequestMetrics(pathname, method, duration, status, userAgent, userId);

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const startTime = Date.now();

        // Allow access to public routes
        if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for protected routes
        if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
          const isAuthorized = !!token;

          // Log tentativas de acesso não autorizadas
          if (!isAuthorized) {
            const duration = Date.now() - startTime;
            logRequestMetrics(
              pathname,
              req.method || 'GET',
              duration,
              401,
              req.headers.get('user-agent') || undefined,
              undefined,
              'Unauthorized access attempt'
            );
          }

          return isAuthorized;
        }

        // Default to allowing access
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};

// Função para obter métricas (pode ser usada pela API de admin)
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
    .sort((a, b) => b.count - a.count); // Ordenar por quantidade de requests
}

// Função para obter estatísticas resumidas
export function getMetricsSummary() {
  const metrics = Array.from(requestMetrics.values());
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Métricas da última hora
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
