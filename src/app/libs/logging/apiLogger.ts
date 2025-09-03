// app/libs/logging/apiLogger.ts - WRAPPER PARA LOGGING AUTOMÁTICO
import { NextRequest, NextResponse } from 'next/server';
import {
  systemLogger,
  LogCategory,
  LogLevel,
  extractRequestContext,
} from './systemLogger';

interface ApiRequestContext {
  method: string;
  path: string;
  userId?: string;
  userName?: string;
  userRole?: number;
  traceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Extrair contexto dos headers do middleware
function extractMiddlewareContext(request: NextRequest): ApiRequestContext {
  const contextHeader = request.headers.get('x-request-context');

  if (contextHeader) {
    try {
      return JSON.parse(contextHeader);
    } catch (error) {
      console.warn('Failed to parse request context:', error);
    }
  }

  // Fallback para contexto básico
  return {
    method: request.method,
    path: request.nextUrl.pathname,
    traceId: request.headers.get('x-trace-id') || undefined,
    ...extractRequestContext(request),
  };
}

// Wrapper principal para APIs
export function withLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options?: {
    skipSuccessLogs?: boolean;
    category?: LogCategory;
    operationName?: string;
  }
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const context = extractMiddlewareContext(request);
    const category = options?.category || LogCategory.API;
    const operationName =
      options?.operationName || `${context.method} ${context.path}`;

    try {
      // Log início da operação (apenas para operações importantes)
      if (!options?.skipSuccessLogs && process.env.NODE_ENV === 'development') {
        systemLogger.trace(category, `Starting ${operationName}`, {
          traceId: context.traceId,
          userId: context.userId,
          userName: context.userName,
          method: context.method,
          path: context.path,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }

      // Executar handler
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      // Determinar se foi sucesso ou erro baseado no status
      const status = response.status;
      const isError = status >= 400;
      const isWarning = status >= 300 && status < 400;

      // Log resultado
      const level = isError
        ? LogLevel.ERROR
        : isWarning
        ? LogLevel.WARN
        : LogLevel.INFO;

      // Para sucessos, só logar se não for skipSuccessLogs ou se for lento
      const shouldLog =
        !options?.skipSuccessLogs || isError || isWarning || duration > 5000;

      if (shouldLog) {
        systemLogger.log({
          level,
          category,
          message: `${operationName} - ${status} (${duration}ms)`,
          method: context.method,
          path: context.path,
          statusCode: status,
          duration,
          userId: context.userId,
          userName: context.userName,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          traceId: context.traceId,
          metadata: {
            operationName,
            responseHeaders: Object.fromEntries(response.headers.entries()),
          },
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log erro
      systemLogger.error(
        category,
        `${operationName} failed after ${duration}ms`,
        {
          method: context.method,
          path: context.path,
          duration,
          userId: context.userId,
          userName: context.userName,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          traceId: context.traceId,
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
          metadata: {
            operationName,
          },
        }
      );

      // Re-throw para não mascarar o erro
      throw error;
    }
  };
}

// Wrapper específico para operações de banco
export function withDatabaseLogging<T extends any[]>(
  operation: (...args: T) => Promise<any>,
  model: string,
  operationType: string,
  context?: Partial<ApiRequestContext>
) {
  return async (...args: T) => {
    const startTime = Date.now();
    const traceId =
      context?.traceId ||
      `db_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    try {
      const result = await operation(...args);
      const duration = Date.now() - startTime;

      // Log query bem-sucedida
      systemLogger.logPrismaQuery(model, operationType, duration, {
        traceId,
        userId: context?.userId,
        userName: context?.userName,
        metadata: {
          args: args.length > 0 ? JSON.stringify(args[0]) : undefined,
          resultCount: Array.isArray(result) ? result.length : result ? 1 : 0,
        },
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      systemLogger.error(
        LogCategory.DATABASE,
        `${model}.${operationType} failed`,
        {
          traceId,
          duration,
          userId: context?.userId,
          userName: context?.userName,
          error: {
            message: error instanceof Error ? error.message : 'Database error',
            stack: error instanceof Error ? error.stack : undefined,
          },
          query: { model, operation: operationType, duration },
          metadata: {
            args: args.length > 0 ? JSON.stringify(args[0]) : undefined,
          },
        }
      );

      throw error;
    }
  };
}

// Helper para logar atividades do usuário
export function logUserActivity(
  action: string,
  entityType: string,
  entityId?: string,
  entityName?: string,
  context?: ApiRequestContext,
  additionalData?: Record<string, any>
) {
  if (!context?.userId) return;

  systemLogger.logAuditEvent(`${action} ${entityType}`, entityType, {
    traceId: context.traceId,
    userId: context.userId,
    userName: context.userName,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: {
      action,
      entityType,
      entityId,
      entityName,
      ...additionalData,
    },
  });
}

// Helper para logar eventos de segurança
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: ApiRequestContext,
  additionalData?: Record<string, any>
) {
  systemLogger.logSecurityEvent(event, severity, {
    traceId: context?.traceId,
    userId: context?.userId,
    userName: context?.userName,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    metadata: {
      ...additionalData,
    },
  });
}
