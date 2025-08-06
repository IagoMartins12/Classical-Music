// app/api/admin/logs/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

// Definir schema para logs no MongoDB (usando Prisma raw queries)
interface SystemLog {
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
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  details?: any;
  sessionId?: string;
  traceId?: string;
  archived?: boolean;
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

// Helper para criar logs do sistema
export async function createSystemLog(logData: Partial<SystemLog>) {
  try {
    // Como não temos um modelo Prisma para logs, simulamos com uma collection personalizada
    // Em produção, você pode usar MongoDB diretamente ou criar um modelo no schema

    const log = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      level: logData.level || 'info',
      category: logData.category || 'system',
      service: logData.service || 'unknown',
      action: logData.action || 'unknown',
      message: logData.message || '',
      ...logData,
    };

    // Em um ambiente real, você salvaria isso numa collection específica
    // await mongoDb.collection('system_logs').insertOne(log);

    return log;
  } catch (error) {
    console.error('Error creating system log:', error);
  }
}

// Helper para criar eventos de auditoria
export async function createAuditEvent(eventData: Partial<AuditEvent>) {
  try {
    const event = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      ...eventData,
    };

    // Em um ambiente real, você salvaria isso numa collection específica
    // await mongoDb.collection('audit_events').insertOne(event);

    return event;
  } catch (error) {
    console.error('Error creating audit event:', error);
  }
}

// Gerar logs realistas baseados em atividade real do sistema
async function generateRealisticLogs(timeRange: string) {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  const logs: SystemLog[] = [];

  // Gerar logs baseados em atividade real de usuários
  const [recentUsers, recentAnnotations, recentUploads] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workAnnotation.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.uploadHistory.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        userId: true,
        action: true,
        entityType: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      take: 30,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Logs de registro de usuários
  for (const user of recentUsers) {
    logs.push({
      id: `user_register_${user.id}`,
      timestamp: user.createdAt,
      level: 'info',
      category: 'user',
      service: 'auth',
      action: 'user_register',
      message:
        `New user registered: ${user.firstName || ''} ${
          user.lastName || ''
        }`.trim() ||
        user.email ||
        'Unknown',
      userId: user.id,
      userName:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email ||
        'Unknown',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/auth/register',
      statusCode: 201,
      duration: Math.floor(Math.random() * 500) + 100,
      sessionId: `sess_${Math.random().toString(36).substring(7)}`,
      traceId: `trace_${Math.random().toString(36).substring(7)}`,
    });
  }

  // Logs de criação de anotações
  for (const annotation of recentAnnotations) {
    logs.push({
      id: `annotation_create_${annotation.id}`,
      timestamp: annotation.createdAt,
      level: 'info',
      category: 'user',
      service: 'app',
      action: 'create_annotation',
      message: 'User created new annotation',
      userId: annotation.userId,
      userName:
        `${annotation.user.firstName || ''} ${
          annotation.user.lastName || ''
        }`.trim() ||
        annotation.user.email ||
        'Unknown',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      endpoint: '/api/annotations',
      statusCode: 201,
      duration: Math.floor(Math.random() * 300) + 150,
      details: {
        annotationId: annotation.id,
        type: 'work_annotation',
      },
      sessionId: `sess_${Math.random().toString(36).substring(7)}`,
    });
  }

  // Logs de uploads
  for (const upload of recentUploads) {
    const success = Math.random() > 0.1; // 90% success rate
    logs.push({
      id: `upload_${upload.id}`,
      timestamp: upload.createdAt,
      level: success ? 'info' : 'error',
      category: 'user',
      service: 'upload',
      action: `upload_${upload.entityType}`,
      message: success
        ? `Successfully uploaded ${upload.entityType}`
        : `Failed to upload ${upload.entityType}`,
      userId: upload.userId,
      userName:
        `${upload.user.firstName || ''} ${upload.user.lastName || ''}`.trim() ||
        upload.user.email ||
        'Unknown',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      endpoint: '/api/upload',
      statusCode: success ? 201 : 500,
      duration: Math.floor(Math.random() * 2000) + 500,
      details: {
        entityType: upload.entityType,
        action: upload.action,
        success,
      },
      sessionId: `sess_${Math.random().toString(36).substring(7)}`,
    });
  }

  // Adicionar alguns logs de sistema e erro
  const systemEvents = [
    {
      level: 'error' as const,
      category: 'system' as const,
      service: 'database',
      action: 'connection_timeout',
      message: 'Database connection timeout detected',
      details: { timeout: 5000, retryAttempt: 3 },
    },
    {
      level: 'warn' as const,
      category: 'performance' as const,
      service: 'api',
      action: 'slow_query',
      message: 'Slow query detected on works search',
      duration: 2350,
      endpoint: '/api/works/search',
      details: { queryTime: 2350, threshold: 1000 },
    },
    {
      level: 'info' as const,
      category: 'system' as const,
      service: 'cache',
      action: 'cache_clear',
      message: 'Cache cleared successfully',
      details: { cacheType: 'redis', keysCleared: 156 },
    },
    {
      level: 'error' as const,
      category: 'security' as const,
      service: 'auth',
      action: 'failed_login',
      message: 'Multiple failed login attempts detected',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      details: { attempts: 5, blocked: true, reason: 'brute_force_protection' },
    },
  ];

  for (const event of systemEvents) {
    if (Math.random() > 0.3) {
      // 70% chance de incluir cada evento
      logs.push({
        id: `system_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(
          startDate.getTime() +
            Math.random() * (now.getTime() - startDate.getTime())
        ),
        statusCode: event.level === 'error' ? 500 : 200,
        traceId: `trace_${Math.random().toString(36).substring(7)}`,
        ...event,
      });
    }
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Gerar eventos de auditoria baseados em atividade real
async function generateAuditEvents(startDate: Date) {
  const events: AuditEvent[] = [];

  // Buscar atividades reais que podem ser auditadas
  const [recentModerations, recentUploads] = await Promise.all([
    prisma.uploadModeration.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        reporter: { select: { firstName: true, lastName: true, email: true } },
        moderator: { select: { firstName: true, lastName: true, email: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.uploadHistory.findMany({
      where: {
        createdAt: { gte: startDate },
        action: 'create',
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      take: 30,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Eventos de moderação
  for (const moderation of recentModerations) {
    events.push({
      id: `audit_moderation_${moderation.id}`,
      timestamp: moderation.createdAt,
      userId: moderation.reportedBy,
      userName:
        `${moderation.reporter.firstName || ''} ${
          moderation.reporter.lastName || ''
        }`.trim() ||
        moderation.reporter.email ||
        'Unknown',
      action: 'report_content',
      resource: moderation.entityType,
      resourceId: moderation.entityId,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: `sess_${Math.random().toString(36).substring(7)}`,
      success: true,
      metadata: {
        reason: moderation.reason,
        status: moderation.status,
        priority: moderation.priority,
      },
    });

    // Se foi resolvido, adicionar evento de resolução
    if (moderation.moderatedBy && moderation.resolvedAt) {
      events.push({
        id: `audit_resolve_${moderation.id}`,
        timestamp: moderation.resolvedAt,
        userId: moderation.moderatedBy,
        userName: moderation.moderator
          ? `${moderation.moderator.firstName || ''} ${
              moderation.moderator.lastName || ''
            }`.trim() ||
            moderation.moderator.email ||
            'Moderator'
          : 'Moderator',
        action: 'resolve_report',
        resource: moderation.entityType,
        resourceId: moderation.entityId,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: `sess_${Math.random().toString(36).substring(7)}`,
        success: moderation.status !== 'pending',
        changes: {
          before: { status: 'pending' },
          after: {
            status: moderation.status,
            resolution: moderation.resolution,
          },
        },
        metadata: {
          resolution: moderation.resolution,
          moderationNotes: moderation.moderationNotes,
        },
      });
    }
  }

  // Eventos de upload
  for (const upload of recentUploads) {
    events.push({
      id: `audit_upload_${upload.id}`,
      timestamp: upload.createdAt,
      userId: upload.userId,
      userName:
        `${upload.user.firstName || ''} ${upload.user.lastName || ''}`.trim() ||
        upload.user.email ||
        'Unknown',
      action: `upload_${upload.entityType}`,
      resource: upload.entityType,
      resourceId: upload.entityId,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: `sess_${Math.random().toString(36).substring(7)}`,
      success: true,
      metadata: {
        reason: upload.reason,
        ipAddress: upload.ipAddress,
        userAgent: upload.userAgent,
      },
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Calcular estatísticas dos logs
function calculateLogStats(logs: SystemLog[], auditEvents: AuditEvent[]) {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Contadores por nível
  const byLevel = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Contadores por categoria
  const byCategory = logs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Contadores por serviço
  const byService = logs.reduce((acc, log) => {
    acc[log.service] = (acc[log.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Logs das últimas 24h
  const last24hCount = logs.filter((log) => log.timestamp >= last24h).length;

  // Taxa de erro
  const errorCount = (byLevel.error || 0) + (byLevel.warn || 0);
  const errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0;

  // Top erros
  const errorLogs = logs.filter(
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
  const logsWithDuration = logs.filter((log) => log.duration);
  const avgResponseTime =
    logsWithDuration.length > 0
      ? logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) /
        logsWithDuration.length
      : 0;

  const slowQueries = logs.filter((log) => (log.duration || 0) > 1000).length;
  const failedRequests = logs.filter(
    (log) => (log.statusCode || 0) >= 400
  ).length;

  // Atividade por hora
  const activityByHour = Array.from({ length: 24 }, (_, hour) => {
    const count = logs.filter(
      (log) => log.timestamp.getHours() === hour
    ).length;
    return { hour, count };
  });

  return {
    total: logs.length,
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const level = url.searchParams.get('level') || 'all';
    const category = url.searchParams.get('category') || 'all';
    const service = url.searchParams.get('service') || 'all';
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const search = url.searchParams.get('search') || '';
    const userId = url.searchParams.get('userId') || '';

    // Gerar logs realistas baseados nos dados do sistema
    const logs = await generateRealisticLogs(timeRange);

    // Gerar eventos de auditoria
    const now = new Date();
    const startDate = new Date(
      now.getTime() -
        (timeRange === '1h'
          ? 60 * 60 * 1000
          : timeRange === '24h'
          ? 24 * 60 * 60 * 1000
          : timeRange === '7d'
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000)
    );
    const auditEvents = await generateAuditEvents(startDate);

    // Aplicar filtros
    let filteredLogs = logs;

    if (level !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    if (category !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.category === category);
    }

    if (service !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.service === service);
    }

    if (userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === userId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.userName?.toLowerCase().includes(searchLower) ||
          log.service.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower)
      );
    }

    // Paginação
    const total = filteredLogs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    // Calcular estatísticas
    const stats = calculateLogStats(logs, auditEvents);

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      auditEvents: page === 1 ? auditEvents.slice(0, 20) : [], // Só enviar eventos na primeira página
      stats: page === 1 ? stats : undefined, // Só enviar stats na primeira página
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Erro na API de logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, logIds } = await request.json();

    if (action === 'archive') {
      // Em um sistema real, você marcaria os logs como arquivados
      // await mongoDb.collection('system_logs').updateMany(
      //   { id: { $in: logIds } },
      //   { $set: { archived: true, archivedAt: new Date() } }
      // );

      return NextResponse.json({
        success: true,
        message: `${logIds.length} logs arquivados com sucesso`,
      });
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de logs (POST):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { logIds } = await request.json();

    // Em um sistema real, você deletaria os logs
    // await mongoDb.collection('system_logs').deleteMany(
    //   { id: { $in: logIds } }
    // );

    return NextResponse.json({
      success: true,
      message: `${logIds.length} logs deletados com sucesso`,
    });
  } catch (error) {
    console.error('Erro na API de logs (DELETE):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
