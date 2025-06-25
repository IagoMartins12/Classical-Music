// app/api/jobs/route.ts - API para Gerenciar Jobs em Background
import { NextRequest, NextResponse } from 'next/server';
import {
  BackgroundJobsSystem,
  runBackgroundMaintenance,
  processBackgroundQueue,
} from '@/app/libs/background-jobs-system';
import prisma from '@/app/libs/prismadb';
import { ProcessingStatus } from '@prisma/client';

// POST - Criar novos jobs
export async function POST(request: NextRequest) {
  try {
    const {
      action,
      workId,
      imslpUrl,
      priority,
      priorityScoreId,
      scheduledFor,
    } = await request.json();

    switch (action) {
      case 'enqueue-scraping':
        if (!workId || !imslpUrl) {
          return NextResponse.json(
            { error: 'workId e imslpUrl são obrigatórios' },
            { status: 400 }
          );
        }

        const jobId = await BackgroundJobsSystem.enqueueScrapingJob(
          workId,
          imslpUrl,
          {
            priority: priority || 5,
            priorityScoreId,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          }
        );

        return NextResponse.json({
          success: true,
          jobId,
          message: 'Job adicionado à fila com sucesso',
        });

      case 'process-queue':
        // Processar fila manualmente
        BackgroundJobsSystem.forceProcessQueue().catch(console.error);

        return NextResponse.json({
          success: true,
          message: 'Processamento da fila iniciado',
        });

      case 'maintenance':
        // Executar manutenção manual
        const maintenanceResults = await runBackgroundMaintenance();

        return NextResponse.json({
          success: true,
          results: maintenanceResults,
          message: 'Manutenção executada com sucesso',
        });

      case 'schedule-maintenance':
        const scheduledDate = scheduledFor
          ? new Date(scheduledFor)
          : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        const maintenanceJobId =
          await BackgroundJobsSystem.scheduleMaintenanceJob(scheduledDate);

        return NextResponse.json({
          success: true,
          jobId: maintenanceJobId,
          scheduledFor: scheduledDate,
          message: 'Manutenção agendada com sucesso',
        });

      default:
        return NextResponse.json(
          {
            error:
              'Ação não reconhecida. Use: enqueue-scraping, process-queue, maintenance, schedule-maintenance',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [JOBS-API] Erro ao processar requisição POST:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// GET - Obter informações sobre jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const workId = searchParams.get('workId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    switch (type) {
      case 'stats':
        const queueStats = await BackgroundJobsSystem.getQueueStats();
        return NextResponse.json(queueStats);

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

      case 'job-detail':
        const jobId = searchParams.get('jobId');
        if (!jobId) {
          return NextResponse.json(
            { error: 'jobId é obrigatório' },
            { status: 400 }
          );
        }

        const jobDetail = await prisma.scoreProcessingLog.findUnique({
          where: { id: jobId },
        });

        if (!jobDetail) {
          return NextResponse.json(
            { error: 'Job não encontrado' },
            { status: 404 }
          );
        }

        return NextResponse.json(jobDetail);

      case 'performance':
        // Estatísticas de performance dos últimos 7 dias
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const performanceStats = await prisma.scoreProcessingLog.findMany({
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
          },
        });

        const avgDuration =
          performanceStats.reduce((sum, job) => sum + (job.duration || 0), 0) /
          performanceStats.length;
        const totalItemsProcessed = performanceStats.reduce(
          (sum, job) => sum + (job.itemsSuccess || 0),
          0
        );

        const actionStats = performanceStats.reduce((acc, job) => {
          if (!acc[job.action]) {
            acc[job.action] = { count: 0, totalDuration: 0, totalItems: 0 };
          }
          acc[job.action].count++;
          acc[job.action].totalDuration += job.duration || 0;
          acc[job.action].totalItems += job.itemsSuccess || 0;
          return acc;
        }, {} as any);

        return NextResponse.json({
          period: '7 days',
          totalJobs: performanceStats.length,
          avgDuration: Math.round(avgDuration),
          totalItemsProcessed,
          actionBreakdown: actionStats,
          timestamp: new Date().toISOString(),
        });

      case 'health':
        const recentFailures = await prisma.scoreProcessingLog.count({
          where: {
            status: ProcessingStatus.FAILED,
            createdAt: {
              gt: new Date(Date.now() - 60 * 60 * 1000), // Última hora
            },
          },
        });

        const pendingJobs = await prisma.scoreProcessingLog.count({
          where: { status: ProcessingStatus.PENDING },
        });

        const processingJobs = await prisma.scoreProcessingLog.count({
          where: { status: ProcessingStatus.PROCESSING },
        });

        const isHealthy =
          recentFailures < 5 && pendingJobs < 50 && processingJobs < 10;

        return NextResponse.json({
          status: isHealthy ? 'healthy' : 'degraded',
          metrics: {
            recentFailures,
            pendingJobs,
            processingJobs,
            isProcessing: (await BackgroundJobsSystem.getQueueStats())
              .isProcessing,
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

      default:
        return NextResponse.json(
          {
            error:
              'Tipo não reconhecido. Use: stats, queue, history, job-detail, performance, health',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [JOBS-API] Erro ao processar requisição GET:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar jobs existentes
export async function PUT(request: NextRequest) {
  try {
    const { jobId, action } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId é obrigatório' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'cancel':
        await prisma.scoreProcessingLog.update({
          where: { id: jobId },
          data: {
            status: ProcessingStatus.FAILED,
            completedAt: new Date(),
            error: 'Job cancelado manualmente',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Job cancelado com sucesso',
        });

      case 'retry':
        await prisma.scoreProcessingLog.update({
          where: { id: jobId },
          data: {
            status: ProcessingStatus.PENDING,
            scheduledFor: new Date(),
            error: null,
          },
        });

        // Processar fila para pegar o job imediatamente
        BackgroundJobsSystem.forceProcessQueue().catch(console.error);

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

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida. Use: cancel, retry, prioritize' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [JOBS-API] Erro ao processar requisição PUT:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Limpar jobs antigos ou cancelar múltiplos jobs
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

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
          message: `${cleanup.count} jobs antigos removidos`,
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
            status: ProcessingStatus.FAILED,
            completedAt: new Date(),
            error: 'Jobs cancelados em lote',
          },
        });

        return NextResponse.json({
          success: true,
          cancelledCount: cancelUpdate.count,
          message: `${cancelUpdate.count} jobs pendentes cancelados`,
        });

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida. Use: cleanup-old, cancel-pending' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [JOBS-API] Erro ao processar requisição DELETE:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
