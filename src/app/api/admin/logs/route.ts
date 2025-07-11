// app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

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
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  details?: any;
  sessionId?: string;
  traceId?: string;
}

interface LogStats {
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
  }>;
  performanceMetrics: {
    avgResponseTime: number;
    slowQueries: number;
    failedRequests: number;
  };
}

// Gerar logs mockados (em produção, vir de sistema de logs real)
const generateMockLogs = async (filters: any = {}): Promise<LogEntry[]> => {
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: 'error',
      category: 'system',
      service: 'api',
      action: 'upload_file',
      message: 'Failed to upload file: disk space full',
      userId: 'user123',
      userName: 'João Silva',
      ipAddress: '192.168.1.100',
      endpoint: '/api/upload',
      statusCode: 500,
      duration: 5420,
      details: {
        fileName: 'score.pdf',
        fileSize: '2.4MB',
        error: 'ENOSPC: no space left on device',
      },
      sessionId: 'sess_abc123',
      traceId: 'trace_xyz789',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      level: 'warn',
      category: 'performance',
      service: 'database',
      action: 'slow_query',
      message: 'Slow query detected: SELECT * FROM works WHERE...',
      duration: 2350,
      details: {
        query: 'SELECT * FROM works WHERE composer_id = ? AND epoch_id = ?',
        params: ['comp123', 'epoch456'],
        executionTime: 2350,
        rowsExamined: 15000,
      },
      traceId: 'trace_slow123',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      level: 'info',
      category: 'audit',
      service: 'auth',
      action: 'user_login',
      message: 'User login successful',
      userId: 'user456',
      userName: 'Maria Santos',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        loginMethod: 'email',
        rememberMe: true,
        location: 'São Paulo, BR',
      },
      sessionId: 'sess_def456',
    },
  ];

  // Aplicar filtros
  return logs.filter((log) => {
    if (filters.level && filters.level !== 'all' && log.level !== filters.level)
      return false;
    if (
      filters.category &&
      filters.category !== 'all' &&
      log.category !== filters.category
    )
      return false;
    if (
      filters.service &&
      filters.service !== 'all' &&
      log.service !== filters.service
    )
      return false;
    if (
      filters.search &&
      !log.message.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });
};

const getLogStats = async (): Promise<LogStats> => {
  // Mock stats (em produção, calcular a partir dos logs reais)
  return {
    total: 15647,
    byLevel: {
      error: 234,
      warn: 567,
      info: 12456,
      debug: 2156,
      trace: 234,
    },
    byCategory: {
      system: 4567,
      security: 234,
      audit: 1234,
      performance: 567,
      user: 8234,
      api: 811,
    },
    byService: {
      api: 5678,
      database: 2345,
      auth: 1234,
      cache: 567,
      upload: 789,
      others: 5034,
    },
    last24h: 2456,
    errorRate: 1.5,
    topErrors: [
      {
        message: 'Database connection timeout',
        count: 45,
        lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        message: 'File upload failed: size limit exceeded',
        count: 32,
        lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        message: 'Authentication token expired',
        count: 28,
        lastSeen: new Date(Date.now() - 8 * 60 * 1000),
      },
    ],
    performanceMetrics: {
      avgResponseTime: 245,
      slowQueries: 12,
      failedRequests: 89,
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'logs';

    if (action === 'stats') {
      const stats = await getLogStats();

      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'logs') {
      const filters = {
        level: searchParams.get('level'),
        category: searchParams.get('category'),
        service: searchParams.get('service'),
        search: searchParams.get('search'),
        timeRange: searchParams.get('timeRange'),
      };

      const logs = await generateMockLogs(filters);

      return NextResponse.json({
        success: true,
        logs,
        filters,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de logs do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
