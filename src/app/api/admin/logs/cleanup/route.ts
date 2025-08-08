// app/api/admin/logs/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { systemLogger, LogCategory } from '@/app/libs/logging/systemLogger';
import fs from 'fs/promises';
import path from 'path';
import { authOptions } from '@/app/libs/auth';

const LOGS_DIR = path.join(process.cwd(), 'SystemLogs');

// DELETE - Deletar arquivos específicos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dates }: { dates: string[] } = await request.json();

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { error: 'Dates array is required' },
        { status: 400 }
      );
    }

    const results = {
      deletedCount: 0,
      errors: [] as string[],
    };

    // Verificar se o diretório existe
    try {
      await fs.access(LOGS_DIR);
    } catch {
      return NextResponse.json(results);
    }

    // Deletar cada arquivo
    for (const date of dates) {
      try {
        // Validar formato da data
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          results.errors.push(`Invalid date format: ${date}`);
          continue;
        }

        const fileName = `${date}.json`;
        const filePath = path.join(LOGS_DIR, fileName);

        // Verificar se o arquivo existe
        try {
          await fs.access(filePath);
        } catch {
          results.errors.push(`File not found: ${fileName}`);
          continue;
        }

        // Deletar o arquivo
        await fs.unlink(filePath);
        results.deletedCount++;

        systemLogger.logAdminAction(`Log file deleted: ${fileName}`, {
          userId: session.user.id,
          userName: `${session.user.firstName} ${session.user.lastName}`,
          metadata: { deletedFile: fileName },
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Failed to delete ${date}: ${errorMsg}`);

        systemLogger.error(
          LogCategory.ADMIN,
          `Failed to delete log file: ${date}`,
          {
            userId: session.user.id,
            error: { message: errorMsg },
          }
        );
      }
    }

    systemLogger.logAuditEvent(
      'Bulk log deletion completed',
      'log-management',
      {
        userId: session.user.id,
        userName: `${session.user.firstName} ${session.user.lastName}`,
        metadata: {
          requestedDates: dates.length,
          deletedCount: results.deletedCount,
          errorCount: results.errors.length,
        },
      }
    );

    return NextResponse.json(results);
  } catch (error) {
    systemLogger.error(LogCategory.ADMIN, 'Error in log cleanup API', {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/admin/logs/cleanup/auto/route.ts
// POST - Limpeza automática por dias
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days }: { days: number } = await request.json();

    if (!days || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    const results = {
      deletedCount: 0,
      errors: [] as string[],
    };

    // Verificar se o diretório existe
    try {
      await fs.access(LOGS_DIR);
    } catch {
      return NextResponse.json(results);
    }

    // Calcular data de corte
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    // Listar arquivos no diretório
    const files = await fs.readdir(LOGS_DIR);
    const logFiles = files.filter(
      (file) => file.endsWith('.json') && /^\d{4}-\d{2}-\d{2}\.json$/.test(file)
    );

    // Deletar arquivos antigos
    for (const file of logFiles) {
      try {
        const dateStr = file.replace('.json', '');

        if (dateStr < cutoffDateStr) {
          const filePath = path.join(LOGS_DIR, file);
          await fs.unlink(filePath);
          results.deletedCount++;

          systemLogger.logAdminAction(`Old log file deleted: ${file}`, {
            userId: session.user.id,
            userName: `${session.user.firstName} ${session.user.lastName}`,
            metadata: {
              deletedFile: file,
              cutoffDays: days,
              cutoffDate: cutoffDateStr,
            },
          });
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Failed to delete ${file}: ${errorMsg}`);

        systemLogger.error(
          LogCategory.ADMIN,
          `Failed to delete old log file: ${file}`,
          {
            userId: session.user.id,
            error: { message: errorMsg },
          }
        );
      }
    }

    systemLogger.logAuditEvent(
      'Automatic log cleanup completed',
      'log-management',
      {
        userId: session.user.id,
        userName: `${session.user.firstName} ${session.user.lastName}`,
        metadata: {
          cutoffDays: days,
          cutoffDate: cutoffDateStr,
          totalFiles: logFiles.length,
          deletedCount: results.deletedCount,
          errorCount: results.errors.length,
        },
      }
    );

    return NextResponse.json(results);
  } catch (error) {
    systemLogger.error(
      LogCategory.ADMIN,
      'Error in automatic log cleanup API',
      {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
