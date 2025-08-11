// app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  LogCategory,
  LogLevel,
  systemLogger,
} from '@/app/libs/logging/systemLogger';

// GET - Buscar logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parâmetros de filtro
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const level = searchParams.get('level') as LogLevel;
    const category = searchParams.get('category') as LogCategory;
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Buscar logs com filtros
    const result = await systemLogger.searchLogs({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      level,
      category,
      search: search || undefined,
      userId: userId || undefined,
      limit: page * limit,
    });

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = result.logs.slice(startIndex, endIndex);

    // Estatísticas gerais
    const stats = await systemLogger.getStats(7); // Últimos 7 dias

    // Análise de performance de queries (últimos logs de database)
    // const dbLogs = result.logs
    //   .filter(
    //     (log) =>
    //       log.category === LogCategory.DATABASE &&
    //       log.query?.duration !== undefined
    //   )
    //   .map((log) => ({
    //     model: log.query!.model || 'unknown',
    //     operation: log.query!.operation || 'unknown',
    //     duration: log.query!.duration!,
    //     timestamp: log.timestamp,
    //   }));


    // Datas disponíveis
    const availableDates = await systemLogger.getAvailableDates();

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
        hasMore: endIndex < result.total,
      },
      stats: {
        overview: stats,
        availableDates: availableDates.slice(0, 30), // Últimos 30 dias
        searchedDates: result.dates,
      },
      filters: {
        dateFrom,
        dateTo,
        level,
        category,
        search,
        userId,
      },
    });
  } catch (error: any) {
    console.error('Erro na API de logs:', error);

    // Log do próprio erro
    systemLogger.error(LogCategory.SYSTEM, 'Error in logs API', {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      path: '/api/admin/logs',
      method: 'GET',
    });

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Ações de gerenciamento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'cleanup_old_logs': {
        const { daysOld = 14 } = data || {};
        const deletedCount = await systemLogger.cleanupOldLogs(daysOld);

        // Log da ação administrativa
        systemLogger.logAdminAction(
          `Cleaned up logs older than ${daysOld} days (${deletedCount} files deleted)`,
          {
            userId: session.user.id,
            userName:
              session.user.firstName && session.user.lastName
                ? `${session.user.firstName} ${session.user.lastName}`
                : session.user.email || 'Admin',
            metadata: {
              daysOld,
              deletedCount,
            },
          }
        );

        return NextResponse.json({
          success: true,
          message: `${deletedCount} arquivos de log deletados`,
          deletedCount,
        });
      }

      case 'delete_specific_date': {
        const { date } = data;
        if (!date) {
          return NextResponse.json(
            { error: 'Data é obrigatória' },
            { status: 400 }
          );
        }

        const deleted = await systemLogger.deleteLogs(date);

        if (deleted) {
          systemLogger.logAdminAction(`Deleted logs for date: ${date}`, {
            userId: session.user.id,
            userName:
              session.user.firstName && session.user.lastName
                ? `${session.user.firstName} ${session.user.lastName}`
                : session.user.email || 'Admin',
            metadata: { date },
          });

          return NextResponse.json({
            success: true,
            message: `Logs de ${date} deletados com sucesso`,
          });
        } else {
          return NextResponse.json(
            { error: 'Falha ao deletar logs ou arquivo não encontrado' },
            { status: 400 }
          );
        }
      }

      case 'export_logs': {
        const {
          dateFrom,
          dateTo,
          level,
          category,
          format = 'json',
        } = data || {};

        // Buscar logs para exportação
        const result = await systemLogger.searchLogs({
          dateFrom,
          dateTo,
          level,
          category,
          limit: 10000, // Limite maior para exportação
        });

        let exportData: string;
        let contentType: string;
        let fileName: string;

        if (format === 'csv') {
          // Converter para CSV
          const headers = [
            'timestamp',
            'level',
            'category',
            'message',
            'method',
            'path',
            'statusCode',
            'duration',
            'userId',
            'userName',
            'ipAddress',
            'userAgent',
          ];

          const csvRows = [
            headers.join(','),
            ...result.logs.map((log) =>
              [
                log.timestamp,
                log.level,
                log.category,
                `"${log.message.replace(/"/g, '""')}"`,
                log.method || '',
                log.path || '',
                log.statusCode || '',
                log.duration || '',
                log.userId || '',
                log.userName || '',
                log.ipAddress || '',
                log.userAgent ? `"${log.userAgent.replace(/"/g, '""')}"` : '',
              ].join(',')
            ),
          ];

          exportData = csvRows.join('\n');
          contentType = 'text/csv';
          fileName = `logs_${dateFrom || 'all'}_${dateTo || 'all'}.csv`;
        } else {
          // JSON (padrão)
          exportData = JSON.stringify(
            {
              exportDate: new Date().toISOString(),
              filters: { dateFrom, dateTo, level, category },
              totalLogs: result.total,
              logs: result.logs,
            },
            null,
            2
          );
          contentType = 'application/json';
          fileName = `logs_${dateFrom || 'all'}_${dateTo || 'all'}.json`;
        }

        // Log da exportação
        systemLogger.logAdminAction(
          `Exported ${result.logs.length} logs as ${format.toUpperCase()}`,
          {
            userId: session.user.id,
            userName:
              session.user.firstName && session.user.lastName
                ? `${session.user.firstName} ${session.user.lastName}`
                : session.user.email || 'Admin',
            metadata: {
              format,
              totalLogs: result.logs.length,
              dateFrom,
              dateTo,
              level,
              category,
            },
          }
        );

        // Retornar dados para download
        return new NextResponse(exportData, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': Buffer.byteLength(exportData).toString(),
          },
        });
      }

      case 'get_detailed_stats': {
        const { days = 7 } = data || {};
        const stats = await systemLogger.getStats(days);

        // Estatísticas adicionais
        const availableDates = await systemLogger.getAvailableDates();
        const recentLogs = await systemLogger.searchLogs({
          limit: 1000,
        });

        // Análise de erros frequentes
        const errorMessages = new Map<string, number>();
        recentLogs.logs
          .filter((log) => log.level === LogLevel.ERROR)
          .forEach((log) => {
            const count = errorMessages.get(log.message) || 0;
            errorMessages.set(log.message, count + 1);
          });

        const topErrors = Array.from(errorMessages.entries())
          .map(([message, count]) => ({ message, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Análise de IPs mais ativos
        const ipActivity = new Map<string, number>();
        recentLogs.logs
          .filter((log) => log.ipAddress)
          .forEach((log) => {
            const count = ipActivity.get(log.ipAddress!) || 0;
            ipActivity.set(log.ipAddress!, count + 1);
          });

        const topIPs = Array.from(ipActivity.entries())
          .map(([ip, count]) => ({ ip, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return NextResponse.json({
          success: true,
          detailedStats: {
            ...stats,
            topErrors,
            topIPs,
            totalDates: availableDates.length,
            oldestDate: availableDates[availableDates.length - 1],
            newestDate: availableDates[0],
          },
        });
      }

      case 'test_logging': {
        // Função para testar o sistema de logging
        const testTraceId = `test_${Date.now()}`;

        systemLogger.info(
          LogCategory.SYSTEM,
          'Test log entry created from admin',
          {
            traceId: testTraceId,
            userId: session.user.id,
            userName:
              session.user.firstName && session.user.lastName
                ? `${session.user.firstName} ${session.user.lastName}`
                : session.user.email || 'Admin',
            metadata: {
              testType: 'manual_test',
              requestedBy: 'admin_panel',
            },
          }
        );

        return NextResponse.json({
          success: true,
          message: 'Log de teste criado com sucesso',
          traceId: testTraceId,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Erro na API POST de logs:', error);

    systemLogger.error(LogCategory.SYSTEM, 'Error in logs API POST', {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      path: '/api/admin/logs',
      method: 'POST',
    });

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar logs específicos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dates = searchParams.get('dates')?.split(',') || [];

    if (dates.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma data especificada' },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const date of dates) {
      try {
        const deleted = await systemLogger.deleteLogs(date.trim());
        if (deleted) {
          deletedCount++;
        } else {
          errors.push(`Falha ao deletar logs de ${date}`);
        }
      } catch (error: any) {
        errors.push(`Erro ao deletar logs de ${date}: ${error.message}`);
      }
    }

    // Log da ação
    systemLogger.logAdminAction(
      `Bulk delete logs: ${deletedCount} files deleted, ${errors.length} errors`,
      {
        userId: session.user.id,
        userName:
          session.user.firstName && session.user.lastName
            ? `${session.user.firstName} ${session.user.lastName}`
            : session.user.email || 'Admin',
        metadata: {
          requestedDates: dates,
          deletedCount,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      }
    );

    return NextResponse.json({
      success: true,
      deletedCount,
      errors,
      message: `${deletedCount} arquivos deletados${
        errors.length > 0 ? ` com ${errors.length} erros` : ''
      }`,
    });
  } catch (error: any) {
    console.error('Erro na API DELETE de logs:', error);

    systemLogger.error(LogCategory.SYSTEM, 'Error in logs API DELETE', {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      path: '/api/admin/logs',
      method: 'DELETE',
    });

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
