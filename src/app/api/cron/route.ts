// app/api/cron/route.ts - API para Jobs Agendados e Manutenção Automática
import { NextRequest, NextResponse } from 'next/server';
import {
  runBackgroundMaintenance,
  processBackgroundQueue,
  BackgroundJobsSystem,
} from '@/app/libs/background-jobs-system';
import { ScoresCacheService } from '@/app/libs/scores-cache-service';
import prisma from '@/app/libs/prismadb';

/**
 * 🚀 Endpoint para execução de jobs agendados via cron
 * Pode ser chamado por:
 * - Vercel Cron (vercel.json)
 * - GitHub Actions
 * - Sistemas externos de agendamento
 * - Webhooks
 */

// Chaves de autenticação para proteger os endpoints
const VALID_CRON_KEYS = [
  process.env.CRON_SECRET_KEY,
  process.env.INTERNAL_API_KEY,
  'classical-hub-cron-2024', // Fallback para desenvolvimento
].filter(Boolean);

function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronKey = request.headers.get('x-cron-key');
  const userAgent = request.headers.get('user-agent');

  // Verificar chave de autorização
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    if (VALID_CRON_KEYS.includes(token)) {
      return true;
    }
  }

  // Verificar header específico para cron
  if (cronKey && VALID_CRON_KEYS.includes(cronKey)) {
    return true;
  }

  // Verificar se é do Vercel Cron
  if (
    userAgent?.includes('vercel-cron') ||
    userAgent?.includes('github-actions')
  ) {
    return true;
  }

  // Em desenvolvimento, permitir qualquer requisição
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verificar autenticação
    if (!isValidCronRequest(request)) {
      console.log('❌ [CRON] Requisição não autorizada');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }

    const { action, options = {} } = await request
      .json()
      .catch(() => ({ action: 'daily-maintenance' }));

    console.log(`\n🚀 [CRON] === EXECUÇÃO AGENDADA INICIADA ===`);
    console.log(`🎯 Ação: ${action}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
    console.log(`🌐 User-Agent: ${request.headers.get('user-agent')}`);

    let results: any = {};

    switch (action) {
      case 'daily-maintenance':
        console.log(`🧹 [CRON] Executando manutenção diária`);

        results = {
          maintenance: await runBackgroundMaintenance(),
          queueProcessing: await processQueueSafely(),
          cacheStats: await ScoresCacheService.getCacheStatistics(),
        };

        console.log(
          `✅ [CRON] Manutenção diária concluída:`,
          results.maintenance
        );
        break;

      case 'process-queue':
        console.log(`⚙️ [CRON] Processando fila de jobs`);

        await processBackgroundQueue();
        results = {
          message: 'Fila processada com sucesso',
          queueStats: await BackgroundJobsSystem.getQueueStats(),
        };

        console.log(`✅ [CRON] Processamento da fila concluído`);
        break;

      case 'cleanup-cache':
        console.log(`🗑️ [CRON] Limpeza de cache`);

        const daysOld = options.daysOld || 30;
        const cleanedCount = await ScoresCacheService.cleanExpiredCache(
          daysOld
        );

        results = {
          cleanedCache: cleanedCount,
          message: `${cleanedCount} entradas de cache limpas`,
        };

        console.log(
          `✅ [CRON] Cache limpo: ${cleanedCount} entradas removidas`
        );
        break;

      case 'health-check':
        console.log(`🏥 [CRON] Verificação de saúde do sistema`);

        results = {
          queueStats: await BackgroundJobsSystem.getQueueStats(),
          cacheStats: await ScoresCacheService.getCacheStatistics(),
          systemHealth: await getSystemHealth(),
        };

        console.log(`✅ [CRON] Verificação de saúde concluída`);
        break;

      case 'weekly-deep-clean':
        console.log(`🧽 [CRON] Limpeza profunda semanal`);

        results = {
          maintenance: await runBackgroundMaintenance(),
          deepCacheClean: await ScoresCacheService.cleanExpiredCache(7), // 7 dias
          queueCleanup: await cleanupOldJobs(60), // 60 dias
        };

        console.log(`✅ [CRON] Limpeza profunda concluída:`, results);
        break;

      default:
        console.log(`❌ [CRON] Ação não reconhecida: ${action}`);
        return NextResponse.json(
          {
            error: 'Ação não reconhecida',
            availableActions: [
              'daily-maintenance',
              'process-queue',
              'cleanup-cache',
              'health-check',
              'weekly-deep-clean',
            ],
          },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;

    console.log(`\n✅ [CRON] === EXECUÇÃO CONCLUÍDA ===`);
    console.log(`⏱️ Duração: ${duration}ms`);
    console.log(`📊 Resultados:`, JSON.stringify(results, null, 2));
    console.log(`${'='.repeat(50)}\n`);

    return NextResponse.json({
      success: true,
      action,
      duration,
      results,
      timestamp: new Date().toISOString(),
      version: '1.0',
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`\n❌ [CRON] === ERRO APÓS ${duration}ms ===`);
    console.error(`🔥 Erro:`, error);

    if (error instanceof Error) {
      console.error('- Mensagem:', error.message);
      console.error('- Stack:', error.stack);
    }
    console.error(`${'='.repeat(50)}\n`);

    return NextResponse.json(
      {
        error: 'Erro na execução do job agendado',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET - Status e informações sobre o sistema de cron
export async function GET(request: NextRequest) {
  try {
    if (!isValidCronRequest(request)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'status';

    switch (type) {
      case 'status':
        const status = {
          cronSystem: {
            isActive: true,
            lastExecution: await getLastCronExecution(),
            nextScheduled: getNextScheduledTime(),
          },
          queues: await BackgroundJobsSystem.getQueueStats(),
          cache: await ScoresCacheService.getCacheStatistics(),
          health: await getSystemHealth(),
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json(status);

      case 'schedule':
        // Retornar informações sobre agendamentos
        const schedule = {
          dailyMaintenance: '00:00 UTC',
          queueProcessing: 'A cada 30 minutos',
          weeklyDeepClean: 'Domingo 02:00 UTC',
          healthCheck: 'A cada 6 horas',
          timezone: 'UTC',
          nextExecutions: {
            dailyMaintenance: getNextMidnight(),
            weeklyDeepClean: getNextSunday(),
          },
        };

        return NextResponse.json(schedule);

      default:
        return NextResponse.json(
          { error: 'Tipo não reconhecido. Use: status, schedule' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [CRON] Erro na requisição GET:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * 🚀 Utilitários internos
 */

async function processQueueSafely(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await processBackgroundQueue();
    return { success: true, message: 'Fila processada com sucesso' };
  } catch (error) {
    console.error('❌ [CRON] Erro ao processar fila:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

async function cleanupOldJobs(daysOld: number): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const cleanup = await prisma.scoreProcessingLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'FAILED'] },
      },
    });

    return cleanup.count;
  } catch (error) {
    console.error('❌ [CRON] Erro na limpeza de jobs:', error);
    return 0;
  }
}

async function getSystemHealth(): Promise<any> {
  try {
    const queueStats = await BackgroundJobsSystem.getQueueStats();
    const cacheStats = await ScoresCacheService.getCacheStatistics();

    // Verificar se há muitos jobs falhando
    const recentFailures = queueStats.stats
      .filter((stat: any) => stat.status === 'FAILED')
      .reduce((sum: number, stat: any) => sum + stat._count, 0);

    // Verificar se há muitos jobs pendentes
    const pendingJobs = queueStats.stats
      .filter((stat: any) => stat.status === 'PENDING')
      .reduce((sum: number, stat: any) => sum + stat._count, 0);

    const isHealthy = recentFailures < 10 && pendingJobs < 100;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      metrics: {
        recentFailures,
        pendingJobs,
        cacheEntries: cacheStats.cacheStats.length,
        isProcessing: queueStats.isProcessing,
      },
      issues: isHealthy
        ? []
        : [
            recentFailures >= 10 ? 'Muitas falhas recentes detectadas' : null,
            pendingJobs >= 100 ? 'Muitos jobs acumulados na fila' : null,
          ].filter(Boolean),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

async function getLastCronExecution(): Promise<string | null> {
  try {
    const lastJob = await prisma.scoreProcessingLog.findFirst({
      where: {
        action: 'maintenance',
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    return lastJob?.completedAt?.toISOString() || null;
  } catch (error) {
    console.log('CRON ERROR', error)
    return null;
  }
}

function getNextScheduledTime(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

function getNextMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

function getNextSunday(): string {
  const now = new Date();
  const nextSunday = new Date(now);
  const daysUntilSunday = (7 - now.getUTCDay()) % 7;
  nextSunday.setUTCDate(
    now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday)
  );
  nextSunday.setUTCHours(2, 0, 0, 0);
  return nextSunday.toISOString();
}
