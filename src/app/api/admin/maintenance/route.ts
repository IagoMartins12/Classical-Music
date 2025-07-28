// app/api/admin/maintenance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import { performBackup } from '../../../../../scripts/backup/backup';
import { checkBackupHealth } from '../../../../../scripts/backup/backup-monitor';
import {
  cleanCache,
  cleanupOldBackups,
  optimizeDatabase,
  rotateLogFiles,
} from '../../../../../scripts/backup/backup-utils';

const prisma = new PrismaClient();

interface MaintenanceTask {
  id: string;
  name: string;
  type:
    | 'cleanup'
    | 'optimization'
    | 'reindex'
    | 'vacuum'
    | 'analyze'
    | 'backup';
  category: 'database' | 'files' | 'cache' | 'logs' | 'system';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun?: Date;
  nextRun?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  impact: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  description: string;
  enabled: boolean;
  progress?: number;
  script?: string;
  options?: any;
}

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  enabled: boolean;
  collections?: string[]; // Specific collections to backup
  retentionDays: number;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SystemHealth {
  diskSpace: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
  database: {
    size: number;
    collections: number;
    totalRecords: number;
    indexHealth: number;
  };

  backups: {
    count: number;
    totalSize: string;
    lastBackup?: Date;
    health: 'healthy' | 'warning' | 'critical';
  };
}

// Storage for maintenance tasks and schedules (in production, use database)
const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'database-cleanup',
    name: 'Limpeza do Banco de Dados',
    type: 'cleanup',
    category: 'database',
    status: 'pending',
    frequency: 'weekly',
    impact: 'medium',
    estimatedDuration: 15,
    description: 'Remove registros temporários e otimiza índices',
    enabled: true,
    script: 'database-cleanup',
  },
  {
    id: 'old-backups-cleanup',
    name: 'Limpeza de Backups Antigos',
    type: 'cleanup',
    category: 'files',
    status: 'pending',
    frequency: 'daily',
    impact: 'low',
    estimatedDuration: 5,
    description: 'Remove backups antigos baseado na política de retenção',
    enabled: true,
    script: 'cleanup-old-backups',
  },
  {
    id: 'log-rotation',
    name: 'Rotação de Logs',
    type: 'cleanup',
    category: 'logs',
    status: 'pending',
    frequency: 'weekly',
    impact: 'low',
    estimatedDuration: 10,
    description: 'Arquiva logs antigos e mantém limites de tamanho',
    enabled: true,
    script: 'log-rotation',
  },
  {
    id: 'cache-optimization',
    name: 'Otimização de Cache',
    type: 'optimization',
    category: 'cache',
    status: 'pending',
    frequency: 'daily',
    impact: 'low',
    estimatedDuration: 3,
    description: 'Limpa cache desnecessário e otimiza performance',
    enabled: true,
    script: 'cache-optimization',
  },
  {
    id: 'index-optimization',
    name: 'Otimização de Índices',
    type: 'reindex',
    category: 'database',
    status: 'pending',
    frequency: 'monthly',
    impact: 'high',
    estimatedDuration: 60,
    description: 'Reconstrói índices fragmentados para melhor performance',
    enabled: false,
    script: 'index-optimization',
  },
];

let BACKUP_SCHEDULES: BackupSchedule[] = [];
let runningTasks = new Set<string>();

// Função para calcular próxima execução
function calculateNextRun(frequency: string, time?: string): Date {
  const now = new Date();
  const next = new Date();

  if (time) {
    const [hour, minute] = time.split(':').map(Number);
    next.setHours(hour, minute, 0, 0);
  }

  switch (frequency) {
    case 'daily':
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      break;
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay()));
      if (next <= now) {
        next.setDate(next.getDate() + 7);
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1, 1);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      break;
  }

  return next;
}

// Função para obter informações do sistema
async function getSystemHealth(): Promise<SystemHealth> {
  try {
    // Disk space
    const backupsDir = path.join(process.cwd(), 'backups');
    let diskUsed = 0;
    let backupCount = 0;

    try {
      const entries = await fs.readdir(backupsDir, { withFileTypes: true });
      backupCount = entries.filter((entry) => entry.isDirectory()).length;

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const dirPath = path.join(backupsDir, entry.name);
          diskUsed += await getDirSize(dirPath);
        }
      }
    } catch {
      // Directory doesn't exist
    }

    // Database stats
    const userCount = await prisma.user.count();
    const composerCount = await prisma.composer.count();
    const workCount = await prisma.work.count();
    const totalRecords = userCount + composerCount + workCount;

    // Backup health
    const backupHealthInfo = await checkBackupHealth();

    const health: SystemHealth = {
      diskSpace: {
        total: 100 * 1024 * 1024 * 1024, // 100GB simulado
        used: diskUsed,
        available: 100 * 1024 * 1024 * 1024 - diskUsed,
        percentage: (diskUsed / (100 * 1024 * 1024 * 1024)) * 100,
      },
      database: {
        size: diskUsed * 0.6, // Aproximação
        collections: 15, // Número de models principais
        totalRecords,
        indexHealth: 95, // Simulado
      },

      backups: {
        count: backupCount,
        totalSize: formatBytes(diskUsed),
        lastBackup: backupHealthInfo.lastBackupDate
          ? new Date(backupHealthInfo.lastBackupDate)
          : undefined,
        health: backupHealthInfo.status,
      },
    };

    return health;
  } catch (error) {
    console.error('Error getting system health:', error);
    throw error;
  }
}

// Utilitário para calcular tamanho de diretório
async function getDirSize(dirPath: string): Promise<number> {
  let size = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += await getDirSize(entryPath);
      } else {
        const stats = await fs.stat(entryPath);
        size += stats.size;
      }
    }
  } catch (error) {
    // Ignore errors
  }
  return size;
}

// Formatar bytes
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// Executar tarefa de manutenção
async function executeMaintenanceTask(taskId: string): Promise<void> {
  const task = MAINTENANCE_TASKS.find((t) => t.id === taskId);
  if (!task || runningTasks.has(taskId)) {
    throw new Error('Task not found or already running');
  }

  runningTasks.add(taskId);
  task.status = 'running';
  task.progress = 0;

  try {
    switch (task.script) {
      case 'cleanup-old-backups':
        console.log('🧹 Executando limpeza de backups antigos...');
        await cleanupOldBackups(30);
        break;

      case 'database-cleanup':
        console.log('🗄️ Executando limpeza do banco de dados...');
        await optimizeDatabase();
        break;

      case 'log-rotation':
        console.log('📋 Executando rotação de logs...');
        await rotateLogFiles();
        break;

      case 'cache-optimization':
        console.log('⚡ Executando otimização de cache...');
        await cleanCache();
        break;

      case 'index-optimization':
        console.log('🔧 Executando otimização de índices...');

        // Executar otimização real do banco
        await optimizeDatabase();
        break;

      default:
        throw new Error('Unknown task script');
    }

    task.status = 'completed';
    task.progress = 100;
    task.lastRun = new Date();
    task.nextRun = calculateNextRun(task.frequency);
  } catch (error) {
    task.status = 'failed';
    console.error(`Erro na tarefa ${taskId}:`, error);
    throw error;
  } finally {
    runningTasks.delete(taskId);
  }
}

// GET - Listar dados de manutenção
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';

    switch (action) {
      case 'overview':
        const systemHealth = await getSystemHealth();
        return NextResponse.json({
          success: true,
          systemHealth,
          maintenanceTasks: MAINTENANCE_TASKS,
          backupSchedules: BACKUP_SCHEDULES,
          runningTasks: Array.from(runningTasks),
        });

      case 'tasks':
        return NextResponse.json({
          success: true,
          tasks: MAINTENANCE_TASKS,
          runningTasks: Array.from(runningTasks),
        });

      case 'schedules':
        return NextResponse.json({
          success: true,
          schedules: BACKUP_SCHEDULES,
        });

      case 'health':
        const health = await getSystemHealth();
        return NextResponse.json({
          success: true,
          health,
        });

      case 'collections':
        // Lista de collections disponíveis para backup seletivo
        const collections = [
          'user',
          'composer',
          'work',
          'workScore',
          'annotation',
          'newsletterSubscriber',
          'newsletterTemplate',
          'advertisement',
        ];
        return NextResponse.json({
          success: true,
          collections: collections.map((name) => ({
            name,
            displayName: name
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase()),
            estimatedRecords: Math.floor(Math.random() * 10000) + 100,
          })),
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Maintenance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Executar tarefas e criar agendamentos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, taskId, scheduleData } = await request.json();

    switch (action) {
      case 'run-task':
        if (!taskId) {
          return NextResponse.json(
            { error: 'Task ID required' },
            { status: 400 }
          );
        }

        try {
          await executeMaintenanceTask(taskId);
          return NextResponse.json({
            success: true,
            message: 'Task executed successfully',
          });
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Task execution failed',
            },
            { status: 400 }
          );
        }

      case 'create-schedule':
        if (!scheduleData) {
          return NextResponse.json(
            { error: 'Schedule data required' },
            { status: 400 }
          );
        }

        const newSchedule: BackupSchedule = {
          id: `schedule-${Date.now()}`,
          name: scheduleData.name,
          frequency: scheduleData.frequency,
          time: scheduleData.time,
          enabled: scheduleData.enabled ?? true,
          collections: scheduleData.collections,
          retentionDays: scheduleData.retentionDays || 30,
          nextRun: calculateNextRun(scheduleData.frequency, scheduleData.time),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        BACKUP_SCHEDULES.push(newSchedule);

        // Configurar cron job se habilitado
        if (newSchedule.enabled) {
          setupBackupSchedule(newSchedule);
        }

        return NextResponse.json({
          success: true,
          schedule: newSchedule,
          message: 'Backup schedule created successfully',
        });

      case 'update-task':
        const task = MAINTENANCE_TASKS.find((t) => t.id === taskId);
        if (!task) {
          return NextResponse.json(
            { error: 'Task not found' },
            { status: 404 }
          );
        }

        Object.assign(task, scheduleData);
        return NextResponse.json({
          success: true,
          task,
          message: 'Task updated successfully',
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Maintenance POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remover agendamentos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID required' },
        { status: 400 }
      );
    }

    const scheduleIndex = BACKUP_SCHEDULES.findIndex(
      (s) => s.id === scheduleId
    );
    if (scheduleIndex === -1) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    BACKUP_SCHEDULES.splice(scheduleIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Maintenance DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Função para configurar agendamento de backup
function setupBackupSchedule(schedule: BackupSchedule): void {
  let cronExpression = '';
  const [hour, minute] = schedule.time.split(':').map(Number);

  switch (schedule.frequency) {
    case 'daily':
      cronExpression = `${minute} ${hour} * * *`;
      break;
    case 'weekly':
      cronExpression = `${minute} ${hour} * * 0`; // Sunday
      break;
    case 'monthly':
      cronExpression = `${minute} ${hour} 1 * *`; // First day of month
      break;
  }

  if (cronExpression) {
    cron.schedule(
      cronExpression,
      async () => {
        console.log(`🕐 Running scheduled backup: ${schedule.name}`);

        try {
          // Import backup function dynamically to avoid circular deps

          if (schedule.collections && schedule.collections.length > 0) {
            // Selective backup - would need to modify performBackup to accept collections
            console.log(
              `📦 Selective backup for: ${schedule.collections.join(', ')}`
            );
          }

          await performBackup();

          schedule.lastRun = new Date();
          schedule.nextRun = calculateNextRun(
            schedule.frequency,
            schedule.time
          );

          console.log(`✅ Scheduled backup completed: ${schedule.name}`);
        } catch (error) {
          console.error(`❌ Scheduled backup failed: ${schedule.name}`, error);
        }
      },
      {
        timezone: 'America/Sao_Paulo',
      }
    );
  }
}
