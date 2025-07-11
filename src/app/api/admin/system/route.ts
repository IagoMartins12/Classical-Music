// app/api/admin/system/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface SystemMetrics {
  server: {
    cpu: { usage: number; cores: number; load: number[] };
    memory: { used: number; total: number; percentage: number };
    disk: { used: number; total: number; percentage: number };
    uptime: number;
    processes: number;
  };
  database: {
    connections: { active: number; max: number; percentage: number };
    queries: { slow: number; average: number; total: number };
    size: { tables: number; indexes: number; total: string };
    performance: { reads: number; writes: number; locks: number };
  };
  cache: {
    redis: { memory: number; hits: number; misses: number; ratio: number };
    application: { size: number; entries: number; hitRate: number };
    cdn: { requests: number; bandwidth: string; hitRate: number };
  };
  network: {
    requests: { current: number; peak: number; avg: number };
    bandwidth: { incoming: number; outgoing: number; total: number };
    errors: { rate: number; total: number; codes: Record<string, number> };
    latency: { p50: number; p95: number; p99: number };
  };
  application: {
    users: { active: number; peak: number; concurrent: number };
    sessions: { total: number; avg_duration: number; bounce_rate: number };
    features: { uploads: number; annotations: number; studies: number };
    errors: { count: number; rate: number; critical: number };
  };
}

// Simular métricas do sistema (em produção, vir de monitoramento real)
const getSystemMetrics = async (): Promise<SystemMetrics> => {
  // Buscar dados reais do banco
  const [
    activeUsers,
    totalSessions,
    totalUploads,
    totalAnnotations,
    totalStudies,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.studySession.count(),
    prisma.uploadHistory.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.workAnnotation.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.studySession.count({
      where: {
        date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  // Mock data para métricas de sistema
  return {
    server: {
      cpu: {
        usage: Math.random() * 50 + 25,
        cores: 8,
        load: [1.2, 1.5, 1.8],
      },
      memory: {
        used: 6.2,
        total: 16,
        percentage: Math.random() * 30 + 35,
      },
      disk: {
        used: 145.6,
        total: 500,
        percentage: 29.12,
      },
      uptime: 2847200,
      processes: 127,
    },
    database: {
      connections: {
        active: Math.floor(Math.random() * 20) + 15,
        max: 100,
        percentage: 23,
      },
      queries: {
        slow: Math.floor(Math.random() * 10) + 5,
        average: Math.random() * 50 + 30,
        total: 15847,
      },
      size: { tables: 28, indexes: 156, total: '2.4 GB' },
      performance: {
        reads: Math.floor(Math.random() * 500) + 1000,
        writes: Math.floor(Math.random() * 200) + 300,
        locks: Math.floor(Math.random() * 5),
      },
    },
    cache: {
      redis: {
        memory: 512,
        hits: 8967,
        misses: 234,
        ratio: Math.random() * 5 + 95,
      },
      application: {
        size: 1.2,
        entries: 5634,
        hitRate: Math.random() * 10 + 85,
      },
      cdn: {
        requests: 45782,
        bandwidth: '234 GB',
        hitRate: Math.random() * 5 + 90,
      },
    },
    network: {
      requests: {
        current: Math.floor(Math.random() * 100) + 100,
        peak: 892,
        avg: 234,
      },
      bandwidth: {
        incoming: Math.random() * 20 + 40,
        outgoing: Math.random() * 10 + 20,
        total: 69.1,
      },
      errors: {
        rate: Math.random() * 0.05,
        total: 45,
        codes: { '404': 23, '500': 12, '503': 8, '429': 2 },
      },
      latency: {
        p50: Math.floor(Math.random() * 50) + 100,
        p95: Math.floor(Math.random() * 200) + 400,
        p99: Math.floor(Math.random() * 300) + 700,
      },
    },
    application: {
      users: {
        active: activeUsers,
        peak: 4521,
        concurrent: Math.floor(Math.random() * 200) + 400,
      },
      sessions: {
        total: totalSessions,
        avg_duration: 24.5,
        bounce_rate: 23.4,
      },
      features: {
        uploads: totalUploads,
        annotations: totalAnnotations,
        studies: totalStudies,
      },
      errors: {
        count: Math.floor(Math.random() * 10) + 15,
        rate: Math.random() * 0.02,
        critical: Math.floor(Math.random() * 3),
      },
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await getSystemMetrics();

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na API de sistema do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
