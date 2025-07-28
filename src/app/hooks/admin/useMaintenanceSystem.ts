// app/hooks/admin/useMaintenanceSystem.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

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

export const useMaintenanceSystem = (): UseMaintenanceSystemReturn => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(
    []
  );
  const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([]);
  const [availableCollections, setAvailableCollections] = useState<
    CollectionInfo[]
  >([]);
  const [runningTasks, setRunningTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch all maintenance data
  const fetchMaintenanceData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/maintenance?action=overview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acesso não autorizado');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSystemHealth(data.systemHealth);
        setMaintenanceTasks(data.maintenanceTasks);
        setBackupSchedules(data.backupSchedules);
        setRunningTasks(data.runningTasks);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Erro ao carregar dados de manutenção');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar dados de manutenção:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Fetch available collections
  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/maintenance?action=collections');
      const data = await response.json();

      if (data.success) {
        setAvailableCollections(data.collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  }, []);

  // Run maintenance task
  const runTask = useCallback(
    async (taskId: string) => {
      setError(null);
      const toastId = toast.loading('Executando tarefa...');

      try {
        const response = await fetch('/api/admin/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'run-task',
            taskId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Tarefa executada com sucesso!', { id: toastId });

          // Update task status immediately
          setMaintenanceTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? { ...task, status: 'running', progress: 0 }
                : task
            )
          );

          // Refresh data after a delay
          setTimeout(() => {
            fetchMaintenanceData();
          }, 2000);
        } else {
          throw new Error(data.error || 'Erro ao executar tarefa');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro: ${errorMessage}`, { id: toastId });
      }
    },
    [fetchMaintenanceData]
  );

  // Update task configuration
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<MaintenanceTask>) => {
      setError(null);

      try {
        const response = await fetch('/api/admin/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-task',
            taskId,
            scheduleData: updates,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setMaintenanceTasks((prev) =>
            prev.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          );
          toast.success('Tarefa atualizada com sucesso!');
        } else {
          throw new Error(data.error || 'Erro ao atualizar tarefa');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro: ${errorMessage}`);
      }
    },
    []
  );

  // Create backup schedule
  const createBackupSchedule = useCallback(
    async (scheduleData: Partial<BackupSchedule>) => {
      setError(null);
      const toastId = toast.loading('Criando agendamento...');

      try {
        const response = await fetch('/api/admin/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create-schedule',
            scheduleData,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setBackupSchedules((prev) => [...prev, data.schedule]);
          toast.success('Agendamento criado com sucesso!', { id: toastId });
        } else {
          throw new Error(data.error || 'Erro ao criar agendamento');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro: ${errorMessage}`, { id: toastId });
      }
    },
    []
  );

  // Update backup schedule
  const updateBackupSchedule = useCallback(
    async (scheduleId: string, updates: Partial<BackupSchedule>) => {
      setError(null);

      try {
        setBackupSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === scheduleId
              ? { ...schedule, ...updates, updatedAt: new Date() }
              : schedule
          )
        );
        toast.success('Agendamento atualizado!');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro: ${errorMessage}`);
      }
    },
    []
  );

  // Delete backup schedule
  const deleteBackupSchedule = useCallback(async (scheduleId: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/admin/maintenance?id=${scheduleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setBackupSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
        toast.success('Agendamento removido!');
      } else {
        throw new Error(data.error || 'Erro ao remover agendamento');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
    }
  }, []);

  // Refresh data wrapper
  const refreshData = useCallback(async () => {
    return fetchMaintenanceData();
  }, [fetchMaintenanceData]);

  // Utility functions
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
      case 'scheduled':
        return 'FiClock';
      case 'pending':
        return 'FiClock';
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

    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Em ${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Em ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diff > 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `Em ${minutes} min`;
    } else {
      return 'Vencido';
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchMaintenanceData();
    fetchCollections();
  }, []);

  // Auto-refresh for running tasks
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (runningTasks.length > 0) {
      interval = setInterval(() => {
        fetchMaintenanceData();
      }, 5000); // Refresh every 5 seconds when tasks are running
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [runningTasks.length, fetchMaintenanceData]);

  // General auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && runningTasks.length === 0) {
        fetchMaintenanceData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, runningTasks.length, fetchMaintenanceData]);

  return {
    // Data
    systemHealth,
    maintenanceTasks,
    backupSchedules,
    availableCollections,
    runningTasks,

    // State
    loading,
    error,
    lastUpdated,

    // Actions
    refreshData,
    runTask,
    updateTask,
    createBackupSchedule,
    updateBackupSchedule,
    deleteBackupSchedule,

    // Utilities
    getStatusColor,
    getStatusIcon,
    getImpactColor,
    formatFileSize,
    getNextRunFormatted,
  };
};
