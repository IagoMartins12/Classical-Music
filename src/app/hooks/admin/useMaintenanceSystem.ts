// app/hooks/admin/useMaintenanceSystem.ts
import { useCallback, useMemo, useState } from 'react';
import { adminKeys, errorMessage, useAdminQuery } from './query';
import toast from 'react-hot-toast';
import {
  type ApiMaintenanceTask,
  deleteMaintenanceSchedule,
  listMaintenanceSchedules,
  listMaintenanceTasks,
  runMaintenanceTask,
  setMaintenanceSchedule,
  waitForMaintenanceJob,
} from '@/app/requests/admin/maintenance';
import { getMaintenanceHealth } from '@/app/requests/admin/operations';
import { BACKUP_NOT_IN_API } from './useBackupManagement';

export interface MaintenanceTask {
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
  lastRun?: Date | null;
  nextRun?: Date | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  impact: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  description: string;
  enabled: boolean;
  progress?: number;
}

export interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  collections?: string[];
  retentionDays: number;
  lastRun?: Date | null;
  nextRun?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemHealth {
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
  cache: {
    size: number;
    hitRate: number;
    evictions: number;
    memory: number;
  };
  logs: {
    size: number;
    errorCount: number;
    warningCount: number;
    oldestEntry: Date;
  };
  backups: {
    count: number;
    totalSize: string;
    lastBackup?: Date;
    health: 'healthy' | 'warning' | 'critical';
  };
}

export interface CollectionInfo {
  name: string;
  displayName: string;
  estimatedRecords: number;
}

interface UseMaintenanceSystemReturn {
  // Data
  systemHealth: SystemHealth | null;
  maintenanceTasks: MaintenanceTask[];
  backupSchedules: BackupSchedule[];
  availableCollections: CollectionInfo[];
  runningTasks: string[];

  // State
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  refreshData: () => Promise<void>;
  runTask: (taskId: string) => Promise<void>;
  updateTask: (
    taskId: string,
    updates: Partial<MaintenanceTask>
  ) => Promise<void>;
  createBackupSchedule: (
    scheduleData: Partial<BackupSchedule>
  ) => Promise<void>;
  updateBackupSchedule: (
    scheduleId: string,
    updates: Partial<BackupSchedule>
  ) => Promise<void>;
  deleteBackupSchedule: (scheduleId: string) => Promise<void>;

  // Utilities
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  getImpactColor: (impact: string) => string;
  formatFileSize: (bytes: number) => string;
  getNextRunFormatted: (date: Date | undefined) => string;
}

const CATEGORY: Record<string, MaintenanceTask['category']> = {
  storage: 'files',
  database: 'database',
  search: 'database',
  audit: 'logs',
  notifications: 'database',
};

const TYPE: Record<string, MaintenanceTask['type']> = {
  storage: 'cleanup',
  database: 'cleanup',
  search: 'reindex',
};

const CRON_BY_FREQUENCY: Record<string, string> = {
  daily: '0 4 * * *',
  weekly: '0 5 * * 0',
  monthly: '0 5 1 * *',
};

function frequencyOf(cron?: string | null): MaintenanceTask['frequency'] {
  if (!cron) return 'manual';
  const [, , dayOfMonth, , dayOfWeek] = cron.split(' ');
  if (dayOfMonth && dayOfMonth !== '*') return 'monthly';
  if (dayOfWeek && dayOfWeek !== '*') return 'weekly';
  return 'daily';
}

function toTask(
  task: ApiMaintenanceTask,
  schedule: { cron: string | null; nextRunAt: string | null } | undefined,
  running: boolean
): MaintenanceTask {
  return {
    id: task.id,
    name: task.name,
    type: TYPE[task.category] ?? 'optimization',
    category: CATEGORY[task.category] ?? 'system',
    status: running ? 'running' : schedule ? 'scheduled' : 'pending',
    lastRun: null,
    nextRun: schedule?.nextRunAt ? new Date(schedule.nextRunAt) : null,
    frequency: frequencyOf(schedule?.cron),
    impact: task.impact,
    estimatedDuration: 0,
    description: task.description,
    enabled: Boolean(schedule),
  };
}

const outcomeText = (summary: Record<string, number>) =>
  Object.entries(summary)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

/**
 * Manutenção pela API: tarefas do catálogo (`/admin/maintenance/tasks`),
 * agendamento por cron e saúde do banco. Agendamento de backup não existe —
 * backup é da infraestrutura do banco.
 */
/**
 * Manutenção do sistema. As tarefas, os agendamentos e a saúde vêm numa
 * consulta só (TanStack Query), que se atualiza a cada 30 s — e para de se
 * atualizar enquanto alguma tarefa está rodando, como antes.
 */
export const useMaintenanceSystem = (): UseMaintenanceSystemReturn => {
  const [runningTasks, setRunningTasks] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const maintenance = useAdminQuery(
    adminKeys.area('maintenance'),
    async () => {
      const [tasks, schedules, health] = await Promise.all([
        listMaintenanceTasks(),
        listMaintenanceSchedules(),
        getMaintenanceHealth(),
      ]);

      return {
        tasks: tasks.tasks,
        schedules: schedules.schedules,
        health,
      };
    },
    { refetchInterval: runningTasks.length === 0 ? 30_000 : false }
  );

  const apiTasks = useMemo(
    () => maintenance.data?.tasks ?? [],
    [maintenance.data]
  );

  const maintenanceTasks = useMemo(() => {
    const byTask = new Map(
      (maintenance.data?.schedules ?? []).map((schedule) => [
        schedule.taskId,
        schedule,
      ])
    );

    return apiTasks.map((task) =>
      toTask(task, byTask.get(task.id), runningTasks.includes(task.id))
    );
  }, [apiTasks, maintenance.data, runningTasks]);

  const systemHealth = useMemo<SystemHealth | null>(() => {
    const health = maintenance.data?.health;

    if (!health) return null;

    const disk = health.databaseHostDisk;

    return {
      diskSpace: {
        total: disk?.totalBytes ?? 0,
        used: disk?.usedBytes ?? 0,
        available: (disk?.totalBytes ?? 0) - (disk?.usedBytes ?? 0),
        percentage: disk?.usedPercent ?? 0,
      },
      database: {
        size: health.database.dataSizeBytes,
        collections: health.database.collections,
        totalRecords: health.database.documents,
        indexHealth: health.search.allIndexed ? 100 : 0,
      },
      cache: { size: 0, hitRate: 0, evictions: 0, memory: 0 },
      logs: {
        size: 0,
        errorCount: 0,
        warningCount: 0,
        oldestEntry: new Date(),
      },
      backups: { count: 0, totalSize: '—', health: 'warning' },
    };
  }, [maintenance.data]);

  const availableCollections = useMemo<CollectionInfo[]>(
    () =>
      (maintenance.data?.health.search.collections ?? []).map((item) => ({
        name: item.collection,
        displayName: item.collection,
        estimatedRecords: 0,
      })),
    [maintenance.data]
  );

  // Executa de verdade (`confirm: true`), como o botão do legado; o
  // resultado chega quando o job termina.
  const runTask = useCallback(
    async (taskId: string) => {
      setActionError(null);
      const toastId = toast.loading('Enfileirando tarefa...');

      try {
        const { jobId } = await runMaintenanceTask(taskId, true);
        toast.loading('Tarefa em execução...', { id: toastId });
        setRunningTasks((previous) => [...previous, taskId]);

        const outcome = await waitForMaintenanceJob(jobId);
        toast.success(`Tarefa concluída — ${outcomeText(outcome.summary)}`, {
          id: toastId,
          duration: 8000,
        });
      } catch (error) {
        const message = errorMessage(error);
        setActionError(message);
        toast.error(`Erro: ${message}`, { id: toastId });
      } finally {
        setRunningTasks((previous) => previous.filter((id) => id !== taskId));
        await maintenance.refetch();
      }
    },
    [maintenance]
  );

  // Ativar agenda pelo cron sugerido (ou pela frequência escolhida); desativar
  // remove o agendamento.
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<MaintenanceTask>) => {
      setActionError(null);

      try {
        const task = apiTasks.find((item) => item.id === taskId);
        const current = maintenanceTasks.find((item) => item.id === taskId);
        const enabled = updates.enabled ?? current?.enabled ?? false;

        if (!enabled) {
          await deleteMaintenanceSchedule(taskId);
        } else {
          const frequency = updates.frequency ?? current?.frequency;
          const cron =
            (frequency && CRON_BY_FREQUENCY[frequency]) ||
            task?.suggestedCron ||
            CRON_BY_FREQUENCY.daily;
          await setMaintenanceSchedule(taskId, cron);
        }

        toast.success('Tarefa atualizada com sucesso!');
        await maintenance.refetch();
      } catch (error) {
        const message = errorMessage(error);
        setActionError(message);
        toast.error(`Erro: ${message}`);
      }
    },
    [apiTasks, maintenanceTasks, maintenance]
  );

  const backupUnavailable = useCallback(async () => {
    toast.error(BACKUP_NOT_IN_API);
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'running':
        return 'text-accent-blue bg-accent-blue/10';
      case 'completed':
        return 'text-accent-green bg-accent-green/10';
      case 'failed':
        return 'text-accent-red bg-accent-red/10';
      case 'scheduled':
        return 'text-accent-purple bg-accent-purple/10';
      case 'pending':
        return 'text-accent-amber bg-accent-amber/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  }, []);

  const getStatusIcon = useCallback((status: string): string => {
    switch (status) {
      case 'running':
        return 'FiRefreshCw';
      case 'completed':
        return 'FiCheckCircle';
      case 'failed':
        return 'FiX';
      default:
        return 'FiClock';
    }
  }, []);

  const getImpactColor = useCallback((impact: string): string => {
    switch (impact) {
      case 'high':
        return 'text-accent-red';
      case 'medium':
        return 'text-accent-amber';
      case 'low':
        return 'text-accent-green';
      default:
        return 'text-theme-tertiary';
    }
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, []);

  const getNextRunFormatted = useCallback((date: Date | undefined): string => {
    if (!date) return 'Não agendado';

    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Em ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Em ${hours} hora${hours > 1 ? 's' : ''}`;
    if (diff > 0) return `Em ${Math.floor(diff / (1000 * 60))} min`;
    return 'Vencido';
  }, []);

  return {
    systemHealth,
    maintenanceTasks,
    backupSchedules: [],
    availableCollections,
    runningTasks,

    loading: maintenance.loading,
    error: maintenance.error ?? actionError,
    lastUpdated: maintenance.updatedAt,

    refreshData: maintenance.refetch,
    runTask,
    updateTask,
    createBackupSchedule: backupUnavailable,
    updateBackupSchedule: backupUnavailable,
    deleteBackupSchedule: backupUnavailable,

    getStatusColor,
    getStatusIcon,
    getImpactColor,
    formatFileSize,
    getNextRunFormatted,
  };
};
