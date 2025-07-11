// app/hooks/useAdminBackup.ts
import { useState, useEffect, useCallback } from 'react';

export interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';
  size: string;
  duration: number;
  createdAt: Date;
  scheduledAt?: Date;
  retentionDays: number;
  includeFiles: boolean;
  includeDatabase: boolean;
  compression: boolean;
  encryption: boolean;
  progress?: number;
  error?: string;
}

export interface MaintenanceTask {
  id: string;
  name: string;
  type: 'cleanup' | 'optimization' | 'reindex' | 'vacuum' | 'analyze';
  category: 'database' | 'files' | 'cache' | 'logs';
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  impact: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  description: string;
  enabled: boolean;
  progress?: number;
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
    tables: number;
    indexes: number;
    deadTuples: number;
    fragmentationLevel: number;
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
}

interface UseAdminBackupReturn {
  backups: BackupJob[];
  tasks: MaintenanceTask[];
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createBackup: (config: any) => Promise<boolean>;
  runTask: (taskId: string) => Promise<boolean>;
}

export const useAdminBackup = (): UseAdminBackupReturn => {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/backup');

      if (!response.ok) {
        throw new Error('Erro ao carregar dados de backup');
      }

      const data = await response.json();

      if (data.success) {
        setBackups(data.backups || []);
        setTasks(data.tasks || []);
        setHealth(data.health || null);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar dados de backup:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackup = useCallback(
    async (config: any): Promise<boolean> => {
      try {
        const response = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_backup', config }),
        });

        if (!response.ok) throw new Error('Erro ao criar backup');

        const data = await response.json();
        if (data.success) {
          await fetchData(); // Refresh data
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao criar backup:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        return false;
      }
    },
    [fetchData]
  );

  const runTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'run_task', taskId }),
        });

        if (!response.ok) throw new Error('Erro ao executar tarefa');

        const data = await response.json();
        if (data.success) {
          await fetchData(); // Refresh data
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao executar tarefa:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        return false;
      }
    },
    [fetchData]
  );

  const refreshData = useCallback(async () => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    backups,
    tasks,
    health,
    loading,
    error,
    refreshData,
    createBackup,
    runTask,
  };
};
