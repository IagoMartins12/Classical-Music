// app/hooks/admin/useBackupManagement.ts
import { useState, useCallback } from 'react';
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

/**
 * O backup saiu do painel: é da infraestrutura do banco (cópia gerenciada do
 * MongoDB), não da API. A rota do legado gravava o dump no disco do servidor
 * do Next, que não sobrevive a um novo deploy. A tela mostra o aviso.
 */
export const BACKUP_NOT_IN_API =
  'O backup é feito pela infraestrutura do banco, não pelo painel. Esta tela não cria nem restaura cópias.';

export const useBackupManagement = (): UseBackupManagementReturn => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshBackups = useCallback(async () => {
    setLastUpdated(new Date());
  }, []);

  const unavailable = useCallback(async () => {
    toast.error(BACKUP_NOT_IN_API);
  }, []);

  const checkBackupStatus = useCallback(async () => false, []);

  const formatBackupDate = useCallback(
    (date: Date | string): string =>
      new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  );

  const getBackupAge = useCallback((date: Date | string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${Math.floor(diff / (1000 * 60))} min`;
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

  return {
    backups: [],
    stats: null,
    loading: false,
    error: BACKUP_NOT_IN_API,
    isCreatingBackup: false,
    isRestoringBackup: false,
    refreshBackups,
    createBackup: unavailable,
    restoreBackup: unavailable,
    deleteBackup: unavailable,
    checkBackupStatus,
    lastUpdated,

    formatBackupDate,
    getBackupAge,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
  };
};
