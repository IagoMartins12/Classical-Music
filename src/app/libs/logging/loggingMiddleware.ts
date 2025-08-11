// app/libs/logging/loggingMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  systemLogger,
  LogCategory,
  LogLevel,
  extractRequestContext,
  captureError,
} from './systemLogger';

// Rotas que devem ser ignoradas pelo logging
const IGNORED_ROUTES = [
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/.well-known',
  '/api/auth/session', // Muito frequente
];

// Rotas que precisam de logging detalhado
const DETAILED_LOGGING_ROUTES = [
  '/api/admin',
  '/api/uploads',
  '/api/auth/signin',
  '/api/auth/signup',
  '/admin',
];

// Rotas de autenticação
const AUTH_ROUTES = ['/api/auth', '/signin', '/signup', '/login'];

// Rotas administrativas
const ADMIN_ROUTES = ['/admin', '/api/admin'];

// Interface para contexto da requisição
interface RequestContext {
  startTime: number;
  traceId: string;
  userId?: string;
  userName?: string;
  userRole?: number;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  isIgnored: boolean;
  isDetailed: boolean;
  isAuth: boolean;
  isAdmin: boolean;
}

// Função para verificar se a rota deve ser ignorada
function shouldIgnoreRoute(pathname: string): boolean {
  return (
    IGNORED_ROUTES.some((route) => pathname.startsWith(route)) ||
    !!pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|map)$/)
  );
}

// Função para verificar se precisa de logging detalhado
function needsDetailedLogging(pathname: string): boolean {
  return DETAILED_LOGGING_ROUTES.some((route) => pathname.startsWith(route));
}

// Função para verificar se é rota de autenticação
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

// Função para verificar se é rota administrativa
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

// Função principal do middleware de logging
export async function loggingMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const traceId = `req_${startTime}_${Math.random().toString(36).substring(2)}`;
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Verificar se deve ignorar esta rota
  const isIgnored = shouldIgnoreRoute(pathname);
  if (isIgnored) {
    return next();
  }

  // Extrair contexto da requisição
  const requestContext = extractRequestContext(request);

  // Tentar obter informações do usuário
  let userId: string | undefined;
  let userName: string | undefined;
  let userRole: number | undefined;
  let sessionId: string | undefined;

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      userId = token.id as string;
      userName =
        token.firstName && token.lastName
          ? `${token.firstName} ${token.lastName}`.trim()
          : (token.email as string);
      userRole = token.role as number;
      sessionId = token.jti as string;
    }
  } catch (error) {
    // Falha ao obter token não é crítica
    console.warn('Failed to get token in logging middleware:', error);
  }

  // Criar contexto da requisição
  const context: RequestContext = {
    startTime,
    traceId,
    userId,
    userName,
    userRole,
    sessionId,
    ...requestContext,
    isIgnored,
    isDetailed: needsDetailedLogging(pathname),
    isAuth: isAuthRoute(pathname),
    isAdmin: isAdminRoute(pathname),
  };

  // Log de início da requisição (apenas para rotas importantes)
  if (context.isDetailed || context.isAuth || context.isAdmin) {
    systemLogger.trace(
      LogCategory.API,
      `Request started: ${method} ${pathname}`,
      {
        traceId,
        method,
        path: pathname,
        userId,
        userName,
        sessionId,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
        metadata: {
          isAuth: context.isAuth,
          isAdmin: context.isAdmin,
          userRole,
        },
      }
    );
  }

  // Log especial para tentativas de acesso admin
  if (context.isAdmin && (!userId || userRole !== 2)) {
    systemLogger.logSecurityEvent(
      `Unauthorized admin access attempt to ${pathname}`,
      userRole !== undefined ? 'medium' : 'high',
      {
        traceId,
        method,
        path: pathname,
        userId,
        userName,
        sessionId,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
        metadata: {
          userRole: userRole || 'none',
          hasSession: !!userId,
        },
      }
    );
  }

  let response: NextResponse;
  let error: Error | null = null;

  try {
    // Executar próximo middleware/handler
    response = await next();
  } catch (err) {
    error = err as Error;

    // Log do erro
    systemLogger.error(
      LogCategory.API,
      `Request failed: ${method} ${pathname}`,
      {
        traceId,
        method,
        path: pathname,
        statusCode: 500,
        duration: Date.now() - startTime,
        userId,
        userName,
        sessionId,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
        error: captureError(error),
      }
    );

    // Re-throw o erro
    throw error;
  }

  // Calcular duração
  const duration = Date.now() - startTime;
  const statusCode = response.status;

  // Adicionar headers de trace
  response.headers.set('X-Trace-ID', traceId);
  response.headers.set('X-Response-Time', `${duration}ms`);

  // Determinar nível do log baseado no status
  let logLevel: LogLevel;
  let logCategory: LogCategory;

  if (statusCode >= 500) {
    logLevel = LogLevel.ERROR;
    logCategory = LogCategory.API;
  } else if (statusCode >= 400) {
    logLevel = LogLevel.WARN;
    logCategory = LogCategory.API;
  } else {
    logLevel = LogLevel.INFO;
    logCategory = LogCategory.API;
  }

  console.log('LOGS', { logLevel, logCategory });
  // Log especial para rotas de autenticação
  if (context.isAuth) {
    const success = statusCode < 400;
    systemLogger.logAuthEvent(`${method} ${pathname}`, success, {
      traceId,
      method,
      path: pathname,
      statusCode,
      duration,
      userId,
      userName,
      sessionId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });
  }

  // Log especial para ações administrativas
  if (context.isAdmin && userId && userRole === 2) {
    systemLogger.logAdminAction(`${method} ${pathname}`, {
      traceId,
      method,
      path: pathname,
      statusCode,
      duration,
      userId,
      userName,
      sessionId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });
  }

  // Log de auditoria para operações importantes
  if (method !== 'GET' && (context.isDetailed || context.isAdmin)) {
    systemLogger.logAuditEvent(`${method} request`, pathname, {
      traceId,
      method,
      path: pathname,
      statusCode,
      duration,
      userId,
      userName,
      sessionId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      metadata: {
        success: statusCode < 400,
        userRole,
      },
    });
  }

  // Log geral da requisição
  systemLogger.logAPIRequest(method, pathname, statusCode, duration, {
    traceId,
    userId,
    userName,
    sessionId,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
    metadata: {
      isAuth: context.isAuth,
      isAdmin: context.isAdmin,
      userRole,
      detailed: context.isDetailed,
    },
  });

  // Log de performance para requests lentos
  if (duration > 5000) {
    // 5 segundos
    systemLogger.warn(
      LogCategory.PERFORMANCE,
      `Slow request: ${method} ${pathname} (${duration}ms)`,
      {
        traceId,
        method,
        path: pathname,
        statusCode,
        duration,
        userId,
        userName,
        sessionId,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
      }
    );
  }

  // Detectar possível atividade suspeita
  await detectSuspiciousActivity(request, context, statusCode, duration);

  return response;
}

// Função para detectar atividade suspeita
async function detectSuspiciousActivity(
  request: NextRequest,
  context: RequestContext,
  statusCode: number,
  duration: number
): Promise<void> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Múltiplos 404s podem indicar scanning
  if (statusCode === 404 && pathname.includes('..')) {
    systemLogger.logSecurityEvent('Path traversal attempt detected', 'high', {
      traceId: context.traceId,
      method,
      path: pathname,
      statusCode,
      duration,
      userId: context.userId,
      userName: context.userName,
      sessionId: context.sessionId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: {
        suspiciousPath: pathname,
        reason: 'path_traversal',
      },
    });
  }

  // SQL injection patterns
  const sqlPatterns = [
    'union select',
    'or 1=1',
    'drop table',
    'insert into',
    'delete from',
    'script>',
    '<script',
    'javascript:',
    'eval(',
    'base64',
  ];

  const fullUrl = request.url.toLowerCase();
  const suspiciousPattern = sqlPatterns.find(
    (pattern) =>
      fullUrl.includes(pattern) || pathname.toLowerCase().includes(pattern)
  );

  if (suspiciousPattern) {
    systemLogger.logSecurityEvent(
      `Potential attack detected: ${suspiciousPattern}`,
      'critical',
      {
        traceId: context.traceId,
        method,
        path: pathname,
        statusCode,
        duration,
        userId: context.userId,
        userName: context.userName,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          pattern: suspiciousPattern,
          fullUrl: request.url,
          reason: 'potential_injection',
        },
      }
    );
  }

  // User agent suspeito
  const userAgent = context.userAgent?.toLowerCase() || '';
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python',
    'node',
    'postman',
    'insomnia',
  ];

  const isBot = botPatterns.some((pattern) => userAgent.includes(pattern));
  if (isBot && (context.isAdmin || context.isAuth)) {
    systemLogger.logSecurityEvent(
      `Bot accessing sensitive area: ${userAgent}`,
      'medium',
      {
        traceId: context.traceId,
        method,
        path: pathname,
        statusCode,
        duration,
        userId: context.userId,
        userName: context.userName,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          reason: 'bot_sensitive_access',
          detectedPattern: botPatterns.find((p) => userAgent.includes(p)),
        },
      }
    );
  }

  // Request muito lento pode indicar DoS
  if (duration > 30000) {
    // 30 segundos
    systemLogger.logSecurityEvent(
      `Extremely slow request detected: ${duration}ms`,
      'medium',
      {
        traceId: context.traceId,
        method,
        path: pathname,
        statusCode,
        duration,
        userId: context.userId,
        userName: context.userName,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          reason: 'slow_request_dos',
          threshold: 30000,
        },
      }
    );
  }
}

// Função utilitária para logging manual em APIs
export function withAPILogging<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string,
  category: LogCategory = LogCategory.API
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    const traceId = `op_${startTime}_${Math.random()
      .toString(36)
      .substring(2)}`;

    try {
      systemLogger.trace(category, `Operation started: ${operationName}`, {
        traceId,
        metadata: { operationName },
      });

      const result = await operation(...args);
      const duration = Date.now() - startTime;

      systemLogger.info(
        category,
        `Operation completed: ${operationName} (${duration}ms)`,
        {
          traceId,
          duration,
          metadata: {
            operationName,
            success: true,
          },
        }
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      systemLogger.error(
        category,
        `Operation failed: ${operationName} (${duration}ms)`,
        {
          traceId,
          duration,
          error: captureError(error as Error),
          metadata: { operationName },
        }
      );

      throw error;
    }
  };
}

// Função para criar wrapper de API com logging automático
export function createLoggedAPIHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  handlerName: string
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    return loggingMiddleware(req, async () => {
      return withAPILogging(handler, handlerName)(req);
    });
  };
}
