// app/hooks/admin/useBackupManagement.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface BackupInfo {
  id: string;
  name: string;
  size: string;
  date: Date | string;
  status: 'completed' | 'failed' | 'in_progress';
  totalRecords?: number;
  collections?: number;
  duration?: string;
  error?: string;
}

export interface BackupStats {
  totalBackups: number;
  lastBackupDate: Date | string | null;
  totalSize: string;
  oldestBackup: string | null;
  newestBackup: string | null;
  maxBackups: number;
  isBackupRunning: boolean;
  scheduledBackupStatus: 'active' | 'inactive';
}

interface UseBackupManagementReturn {
  backups: BackupInfo[];
  stats: BackupStats | null;
  loading: boolean;
  error: string | null;
  isCreatingBackup: boolean;
  isRestoringBackup: boolean;
  refreshBackups: () => Promise<void>;
  createBackup: () => Promise<void>;
  restoreBackup: (backupId: string) => Promise<void>;
  deleteBackup: (backupId: string) => Promise<void>;
  checkBackupStatus: () => Promise<boolean>;
  lastUpdated: Date | null;

  // Utility functions
  formatBackupDate: (date: Date | string) => string;
  getBackupAge: (date: Date | string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export const useBackupManagement = (): UseBackupManagementReturn => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Função para buscar lista de backups
  const fetchBackups = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/backup?action=list', {
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
        if (response.status === 403) {
          throw new Error('Permissão negada');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setBackups(data.backups || []);
        setStats(data.stats || null);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Erro ao carregar backups');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar backups:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Função para verificar status de backup em execução
  const checkBackupStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/backup?action=status', {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return data.isRunning || false;
      }
    } catch (error) {
      console.error('Erro ao verificar status do backup:', error);
    }

    return false;
  }, []);

  // Função para criar novo backup
  const createBackup = useCallback(async () => {
    if (isCreatingBackup) return;

    // Verificar se já há backup rodando
    const isRunning = await checkBackupStatus();
    if (isRunning) {
      toast.error('Já há um backup em execução');
      return;
    }

    setIsCreatingBackup(true);
    setError(null);

    const toastId = toast.loading('Iniciando backup...', {
      duration: Infinity,
    });

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create' }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Backup criado com sucesso!', { id: toastId });

        // Aguardar um pouco antes de atualizar a lista
        setTimeout(() => {
          fetchBackups();
        }, 2000);
      } else {
        throw new Error(data.error || 'Erro ao criar backup');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao criar backup: ${errorMessage}`, { id: toastId });
      console.error('Erro ao criar backup:', err);
    } finally {
      setIsCreatingBackup(false);
    }
  }, [isCreatingBackup, checkBackupStatus, fetchBackups]);

  // Função para restaurar backup
  const restoreBackup = useCallback(
    async (backupId: string) => {
      if (isRestoringBackup) return;

      const confirmed = window.confirm(
        'Tem certeza que deseja restaurar este backup? Esta ação pode sobrescrever dados existentes.'
      );

      if (!confirmed) return;

      setIsRestoringBackup(true);
      setError(null);

      const toastId = toast.loading('Restaurando backup...', {
        duration: Infinity,
      });

      try {
        const response = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'restore',
            backupId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Backup restaurado com sucesso!', { id: toastId });
        } else {
          throw new Error(data.error || 'Erro ao restaurar backup');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao restaurar backup: ${errorMessage}`, {
          id: toastId,
        });
        console.error('Erro ao restaurar backup:', err);
      } finally {
        setIsRestoringBackup(false);
      }
    },
    [isRestoringBackup]
  );

  // Função para deletar backup
  const deleteBackup = useCallback(
    async (backupId: string) => {
      const confirmed = window.confirm(
        'Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.'
      );

      if (!confirmed) return;

      const toastId = toast.loading('Removendo backup...');

      try {
        const response = await fetch(`/api/admin/backup?id=${backupId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Backup removido com sucesso!', { id: toastId });
          fetchBackups(); // Atualizar lista
        } else {
          throw new Error(data.error || 'Erro ao remover backup');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        toast.error(`Erro ao remover backup: ${errorMessage}`, { id: toastId });
        console.error('Erro ao remover backup:', err);
      }
    },
    [fetchBackups]
  );

  // Refresh wrapper
  const refreshBackups = useCallback(async () => {
    return fetchBackups();
  }, [fetchBackups]);

  // Utility functions
  const formatBackupDate = useCallback((date: Date | string): string => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getBackupAge = useCallback((date: Date | string): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} min`;
    }
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-accent-green bg-accent-green/10';
      case 'failed':
        return 'text-accent-red bg-accent-red/10';
      case 'in_progress':
        return 'text-accent-amber bg-accent-amber/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  }, []);

  const getStatusIcon = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
        return 'FiCheckCircle';
      case 'failed':
        return 'FiX';
      case 'in_progress':
        return 'FiRefreshCw';
      default:
        return 'FiClock';
    }
  }, []);

  const getStatusLabel = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      case 'in_progress':
        return 'Em Progresso';
      default:
        return 'Desconhecido';
    }
  }, []);

  // Carregar backups iniciais
  useEffect(() => {
    fetchBackups();
  }, []);

  // Auto-refresh a cada 30 segundos se há backup rodando
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkAndRefresh = async () => {
      const isRunning = await checkBackupStatus();
      if (isRunning || isCreatingBackup) {
        fetchBackups();
      }
    };

    if (stats?.isBackupRunning || isCreatingBackup) {
      interval = setInterval(checkAndRefresh, 30000); // 30 segundos
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    stats?.isBackupRunning,
    isCreatingBackup,
    checkBackupStatus,
    fetchBackups,
  ]);

  // Auto-refresh geral a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isCreatingBackup && !isRestoringBackup) {
        fetchBackups();
      }
    }, 2 * 60 * 1000); // 2 minutos

    return () => clearInterval(interval);
  }, [loading, isCreatingBackup, isRestoringBackup, fetchBackups]);

  return {
    backups,
    stats,
    loading,
    error,
    isCreatingBackup,
    isRestoringBackup,
    refreshBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    checkBackupStatus,
    lastUpdated,

    // Utility functions
    formatBackupDate,
    getBackupAge,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
  };
};
