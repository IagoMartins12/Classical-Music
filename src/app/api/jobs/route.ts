// app/api/jobs/route.ts - API Otimizada para Gerenciar Jobs em Background
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/app/libs/prismadb';
import { ProcessingStatus } from '@prisma/client';
import { BackgroundJobsSystemOptimized } from '@/app/libs/background-jobs-system';

// POST - Criar e gerenciar jobs otimizados
export async function POST(request: NextRequest) {
  try {
    const { action, workId, imslpUrl, priority, scheduledFor, details } =
      await request.json();

    console.log(`📋 [JOBS-API-OPT] Ação solicitada: ${action}`);

    switch (action) {
      case 'enqueue-scraping':
        if (!workId || !imslpUrl) {
          return NextResponse.json(
            { error: 'workId e imslpUrl são obrigatórios' },
            { status: 400 }
          );
        }

        console.log(
          `🕷️ [JOBS-API-OPT] Enfileirando scraping para workId: ${workId}`
        );

        const jobId = await BackgroundJobsSystemOptimized.enqueueScrapingJob(
          workId,
          imslpUrl,
          {
            priority: priority || 5,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
            details: details || {},
          }
        );

        return NextResponse.json({
          success: true,
          jobId,
          message: 'Job adicionado à fila com sucesso',
          estimatedProcessingTime: '30-60 segundos',
        });

      case 'process-queue':
        console.log(
          `⚙️ [JOBS-API-OPT] Processamento manual da fila solicitado`
        );

        // Processar fila manualmente
        BackgroundJobsSystemOptimized.forceProcessQueue().catch(console.error);

        return NextResponse.json({
          success: true,
          message: 'Processamento da fila iniciado',
          timestamp: new Date().toISOString(),
        });

      case 'schedule-maintenance':
        const scheduledDate = scheduledFor
          ? new Date(scheduledFor)
          : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        console.log(
          `📅 [JOBS-API-OPT] Agendando manutenção para: ${scheduledDate.toISOString()}`
        );

        const maintenanceJobId =
          await BackgroundJobsSystemOptimized.scheduleMaintenanceJob(
            scheduledDate
          );

        return NextResponse.json({
          success: true,
          jobId: maintenanceJobId,
          scheduledFor: scheduledDate,
          message: 'Manutenção agendada com sucesso',
        });

      case 'smart-enqueue':
        // 🆕 Enfileiramento inteligente baseado em prioridade e cache
        if (!workId || !imslpUrl) {
          return NextResponse.json(
            { error: 'workId e imslpUrl são obrigatórios' },
            { status: 400 }
          );
        }

        // Verificar se já existe cache
        const existingCache = await prisma.workScore.count({
          where: { workId, isActive: true },
        });

        const smartPriority = existingCache > 0 ? 3 : 7; // Menor prioridade se já tem cache
        const smartDelay = existingCache > 0 ? 5000 : 1000; // Mais delay se já tem cache

        const smartJobId =
          await BackgroundJobsSystemOptimized.enqueueScrapingJob(
            workId,
            imslpUrl,
            {
              priority: smartPriority,
              scheduledFor: new Date(Date.now() + smartDelay),
              details: {
                smart: true,
                existingCacheCount: existingCache,
                ...details,
              },
            }
          );

        return NextResponse.json({
          success: true,
          jobId: smartJobId,
          message: 'Job inteligente adicionado à fila',
          priority: smartPriority,
          delay: smartDelay,
          existingCache: existingCache,
        });

      default:
        return NextResponse.json(
          {
            error: 'Ação não reconhecida',
            availableActions: [
              'enqueue-scraping',
              'process-queue',
              'maintenance',
              'schedule-maintenance',
              'smart-enqueue',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(
      '❌ [JOBS-API-OPT] Erro ao processar requisição POST:',
      error
    );

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET - Obter informações otimizadas sobre jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const workId = searchParams.get('workId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log(`📊 [JOBS-API-OPT] Solicitação GET: ${type}`);

    switch (type) {
      case 'stats':
        const queueStats = await BackgroundJobsSystemOptimized.getQueueStats();
        return NextResponse.json({
          ...queueStats,
          systemHealth: queueStats.failed < 5 ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
        });

      case 'queue':
        const queueFilter: any = {
          status: ProcessingStatus.PENDING,
        };

        if (workId) {
          queueFilter.workId = workId;
        }

        const queueJobs = await prisma.scoreProcessingLog.findMany({
          where: queueFilter,
          orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
          take: limit,
          select: {
            id: true,
            workId: true,
            action: true,
            status: true,
            priority: true,
            createdAt: true,
            scheduledFor: true,
            retryCount: true,
            details: true,
          },
        });

        return NextResponse.json({
          jobs: queueJobs,
          count: queueJobs.length,
          nextScheduled: queueJobs[0]?.scheduledFor || null,
          timestamp: new Date().toISOString(),
        });

      case 'history':
        const historyFilter: any = {};

        if (workId) {
          historyFilter.workId = workId;
        }

        if (status) {
          historyFilter.status = status.toUpperCase();
        }

        const historyJobs = await prisma.scoreProcessingLog.findMany({
          where: historyFilter,
          orderBy: { createdAt: 'desc' },
          take: limit,
          select: {
            id: true,
            workId: true,
            action: true,
            status: true,
            priority: true,
            createdAt: true,
            startedAt: true,
            completedAt: true,
            duration: true,
            itemsTotal: true,
            itemsSuccess: true,
            itemsFailed: true,
            itemsSkipped: true,
            error: true,
            retryCount: true,
            details: true,
          },
        });

        return NextResponse.json({
          jobs: historyJobs,
          count: historyJobs.length,
          timestamp: new Date().toISOString(),
        });

      case 'work-jobs':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório para work-jobs' },
            { status: 400 }
          );
        }

        const workJobs = await BackgroundJobsSystemOptimized.getJobsByWorkId(
          workId,
          limit
        );
        return NextResponse.json({
          workId,
          jobs: workJobs,
          count: workJobs.length,
          timestamp: new Date().toISOString(),
        });

      case 'performance':
        // 🆕 Estatísticas de performance otimizadas
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [performanceStats, averages] = await Promise.all([
          prisma.scoreProcessingLog.findMany({
            where: {
              createdAt: { gt: sevenDaysAgo },
              status: ProcessingStatus.COMPLETED,
              duration: { not: null },
            },
            select: {
              action: true,
              duration: true,
              itemsTotal: true,
              itemsSuccess: true,
              createdAt: true,
              priority: true,
            },
          }),
          prisma.scoreProcessingLog.aggregate({
            where: {
              createdAt: { gt: sevenDaysAgo },
              status: ProcessingStatus.COMPLETED,
              duration: { not: null },
            },
            _avg: {
              duration: true,
              itemsSuccess: true,
              priority: true,
            },
            _count: true,
          }),
        ]);

        const actionStats = performanceStats.reduce((acc, job) => {
          if (!acc[job.action]) {
            acc[job.action] = {
              count: 0,
              totalDuration: 0,
              totalItems: 0,
              avgPriority: 0,
              priorities: [],
            };
          }
          acc[job.action].count++;
          acc[job.action].totalDuration += job.duration || 0;
          acc[job.action].totalItems += job.itemsSuccess || 0;
          acc[job.action].priorities.push(job.priority || 0);
          return acc;
        }, {} as any);

        // Calcular médias por ação
        Object.keys(actionStats).forEach((action) => {
          const stats = actionStats[action];
          stats.avgDuration = Math.round(stats.totalDuration / stats.count);
          stats.avgItems = Math.round(stats.totalItems / stats.count);
          stats.avgPriority = Math.round(
            stats.priorities.reduce((a: number, b: number) => a + b, 0) /
              stats.priorities.length
          );
          delete stats.priorities; // Limpar dados temporários
        });

        return NextResponse.json({
          period: '7 days',
          totalJobs: performanceStats.length,
          averages: {
            duration: Math.round(averages._avg.duration || 0),
            itemsSuccess: Math.round(averages._avg.itemsSuccess || 0),
            priority: Math.round(averages._avg.priority || 0),
          },
          actionBreakdown: actionStats,
          performanceTrend: 'stable', // Pode ser calculado comparando com período anterior
          timestamp: new Date().toISOString(),
        });

      case 'health':
        const [recentFailures, pendingJobs, processingJobs, queueHealth] =
          await Promise.all([
            prisma.scoreProcessingLog.count({
              where: {
                status: ProcessingStatus.FAILED,
                createdAt: {
                  gt: new Date(Date.now() - 60 * 60 * 1000), // Última hora
                },
              },
            }),
            prisma.scoreProcessingLog.count({
              where: { status: ProcessingStatus.PENDING },
            }),
            prisma.scoreProcessingLog.count({
              where: { status: ProcessingStatus.PROCESSING },
            }),
            BackgroundJobsSystemOptimized.getQueueStats(),
          ]);

        const isHealthy =
          recentFailures < 5 && pendingJobs < 50 && processingJobs < 10;
        const healthScore = Math.max(
          0,
          100 - recentFailures * 10 - pendingJobs * 0.5 - processingJobs * 5
        );

        return NextResponse.json({
          status: isHealthy ? 'healthy' : 'degraded',
          score: Math.round(healthScore),
          metrics: {
            recentFailures,
            pendingJobs,
            processingJobs,
            isProcessing: queueHealth.isProcessing,
            lastProcessed: queueHealth.lastProcessed,
          },
          recommendations: isHealthy
            ? []
            : [
                recentFailures >= 5
                  ? 'Muitas falhas recentes - verificar conectividade'
                  : null,
                pendingJobs >= 50
                  ? 'Muitos jobs pendentes - considerar aumentar capacidade'
                  : null,
                processingJobs >= 10
                  ? 'Muitos jobs em processamento - possível travamento'
                  : null,
              ].filter(Boolean),
          timestamp: new Date().toISOString(),
        });

      case 'dashboard':
        // 🆕 Endpoint consolidado para dashboard
        const [stats, health, recentJobs] = await Promise.all([
          BackgroundJobsSystemOptimized.getQueueStats(),
          // Reutilizar lógica de health check
          Promise.all([
            prisma.scoreProcessingLog.count({
              where: {
                status: ProcessingStatus.FAILED,
                createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
              },
            }),
            prisma.scoreProcessingLog.count({
              where: { status: ProcessingStatus.PENDING },
            }),
            prisma.scoreProcessingLog.count({
              where: { status: ProcessingStatus.PROCESSING },
            }),
          ]).then(([failures, pending, processing]) => ({
            isHealthy: failures < 5 && pending < 50 && processing < 10,
            score: Math.max(
              0,
              100 - failures * 10 - pending * 0.5 - processing * 5
            ),
            failures,
            pending,
            processing,
          })),
          // Jobs recentes
          prisma.scoreProcessingLog.findMany({
            where: {
              createdAt: { gt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // Últimas 2h
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              action: true,
              status: true,
              createdAt: true,
              duration: true,
              itemsSuccess: true,
              workId: true,
            },
          }),
        ]);

        return NextResponse.json({
          stats,
          health,
          recentJobs,
          summary: {
            totalActive: stats.pending + stats.processing,
            successRate:
              stats.completed > 0
                ? Math.round(
                    (stats.completed / (stats.completed + stats.failed)) * 100
                  )
                : 100,
            avgProcessingTime:
              recentJobs.length > 0
                ? Math.round(
                    recentJobs.reduce(
                      (sum, job) => sum + (job.duration || 0),
                      0
                    ) / recentJobs.length
                  )
                : 0,
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            error: 'Tipo não reconhecido',
            availableTypes: [
              'stats',
              'queue',
              'history',
              'work-jobs',
              'performance',
              'health',
              'dashboard',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [JOBS-API-OPT] Erro ao processar requisição GET:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar jobs existentes com operações otimizadas
export async function PUT(request: NextRequest) {
  try {
    const { jobId, action, bulkJobIds } = await request.json();

    console.log(`🔄 [JOBS-API-OPT] Ação de atualização: ${action}`);

    if (!jobId && !bulkJobIds) {
      return NextResponse.json(
        { error: 'jobId ou bulkJobIds é obrigatório' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'cancel':
        if (bulkJobIds) {
          // 🆕 Cancelamento em lote
          const results = await Promise.allSettled(
            bulkJobIds.map((id: string) =>
              BackgroundJobsSystemOptimized.cancelJob(id)
            )
          );

          const successful = results.filter(
            (r) => r.status === 'fulfilled' && r.value
          ).length;

          return NextResponse.json({
            success: true,
            message: `${successful}/${bulkJobIds.length} jobs cancelados com sucesso`,
            details: { successful, total: bulkJobIds.length },
          });
        } else {
          const success = await BackgroundJobsSystemOptimized.cancelJob(jobId);
          return NextResponse.json({
            success,
            message: success
              ? 'Job cancelado com sucesso'
              : 'Falha ao cancelar job',
          });
        }

      case 'retry':
        await prisma.scoreProcessingLog.update({
          where: { id: jobId },
          data: {
            status: ProcessingStatus.PENDING,
            scheduledFor: new Date(),
            error: null,
            retryCount: 0, // Reset retry count
          },
        });

        // Processar fila para pegar o job imediatamente
        BackgroundJobsSystemOptimized.forceProcessQueue().catch(console.error);

        return NextResponse.json({
          success: true,
          message: 'Job reagendado para retry',
        });

      case 'prioritize':
        await prisma.scoreProcessingLog.update({
          where: { id: jobId },
          data: {
            priority: 10, // Prioridade máxima
            scheduledFor: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Job priorizado com sucesso',
        });

      case 'bulk-prioritize':
        if (!bulkJobIds) {
          return NextResponse.json(
            { error: 'bulkJobIds é obrigatório para bulk-prioritize' },
            { status: 400 }
          );
        }

        const updateResult = await prisma.scoreProcessingLog.updateMany({
          where: {
            id: { in: bulkJobIds },
            status: ProcessingStatus.PENDING,
          },
          data: {
            priority: 8, // Alta prioridade para lote
            scheduledFor: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `${updateResult.count} jobs priorizados com sucesso`,
          updated: updateResult.count,
        });

      default:
        return NextResponse.json(
          {
            error: 'Ação não reconhecida',
            availableActions: [
              'cancel',
              'retry',
              'prioritize',
              'bulk-prioritize',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [JOBS-API-OPT] Erro ao processar requisição PUT:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Limpeza otimizada de jobs
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    console.log(`🗑️ [JOBS-API-OPT] Ação de limpeza: ${action}`);

    switch (action) {
      case 'cleanup-old':
        const daysOld = parseInt(searchParams.get('days') || '30');
        const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

        const cleanup = await prisma.scoreProcessingLog.deleteMany({
          where: {
            createdAt: { lt: cutoffDate },
            status: {
              in: [ProcessingStatus.COMPLETED, ProcessingStatus.FAILED],
            },
          },
        });

        return NextResponse.json({
          success: true,
          deletedCount: cleanup.count,
          message: `${cleanup.count} jobs antigos removidos (>${daysOld} dias)`,
        });

      case 'cleanup-failed':
        const failedCleanup = await prisma.scoreProcessingLog.deleteMany({
          where: {
            status: ProcessingStatus.FAILED,
            createdAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Mais de 24h
            },
          },
        });

        return NextResponse.json({
          success: true,
          deletedCount: failedCleanup.count,
          message: `${failedCleanup.count} jobs falhados antigos removidos`,
        });

      case 'cancel-pending':
        const workId = searchParams.get('workId');
        const cancelFilter: any = { status: ProcessingStatus.PENDING };

        if (workId) {
          cancelFilter.workId = workId;
        }

        const cancelUpdate = await prisma.scoreProcessingLog.updateMany({
          where: cancelFilter,
          data: {
            status: ProcessingStatus.CANCELLED,
            completedAt: new Date(),
            error: 'Jobs cancelados em lote via API',
          },
        });

        return NextResponse.json({
          success: true,
          cancelledCount: cancelUpdate.count,
          message: `${cancelUpdate.count} jobs pendentes cancelados`,
        });

      case 'smart-cleanup':
        // 🆕 Limpeza inteligente baseada em critérios múltiplos
        const [oldCompleted, oldFailed, stuckProcessing] = await Promise.all([
          // Jobs completos antigos (>30 dias)
          prisma.scoreProcessingLog.deleteMany({
            where: {
              status: ProcessingStatus.COMPLETED,
              createdAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          // Jobs falhados antigos (>7 dias)
          prisma.scoreProcessingLog.deleteMany({
            where: {
              status: ProcessingStatus.FAILED,
              createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          }),
          // Jobs "presos" em processamento (>1 hora)
          prisma.scoreProcessingLog.updateMany({
            where: {
              status: ProcessingStatus.PROCESSING,
              startedAt: { lt: new Date(Date.now() - 60 * 60 * 1000) },
            },
            data: {
              status: ProcessingStatus.FAILED,
              completedAt: new Date(),
              error: 'Job travado detectado pela limpeza inteligente',
            },
          }),
        ]);

        const totalCleaned =
          oldCompleted.count + oldFailed.count + stuckProcessing.count;

        return NextResponse.json({
          success: true,
          message: `Limpeza inteligente concluída: ${totalCleaned} jobs processados`,
          details: {
            oldCompleted: oldCompleted.count,
            oldFailed: oldFailed.count,
            stuckProcessing: stuckProcessing.count,
            total: totalCleaned,
          },
        });

      default:
        return NextResponse.json(
          {
            error: 'Ação não reconhecida',
            availableActions: [
              'cleanup-old',
              'cleanup-failed',
              'cancel-pending',
              'smart-cleanup',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(
      '❌ [JOBS-API-OPT] Erro ao processar requisição DELETE:',
      error
    );

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
