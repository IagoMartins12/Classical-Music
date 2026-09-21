// app/hooks/admin/useSelectiveBackup.ts
import { useState, useCallback } from 'react';
import { useToast } from '../useToast';
import { BACKUP_NOT_IN_API } from './useBackupManagement';

export interface SelectiveBackupInfo {
  id: string;
  name: string;
  size: string;
  date: Date | string;
  status: 'completed' | 'failed' | 'in_progress';
  collections: string[];
  totalRecords?: number;
  duration?: string;
  error?: string;
  type: 'selective';
}

export interface CollectionInfo {
  name: string;
  displayName: string;
  dependencies: string[];
  description: string;
}

interface UseSelectiveBackupReturn {
  // Data
  selectiveBackups: SelectiveBackupInfo[];
  availableCollections: CollectionInfo[];
  maxBackups: number;
  totalBackups: number;

  // State
  loading: boolean;
  error: string | null;
  isCreatingBackup: boolean;
  isRestoringBackup: boolean;
  lastUpdated: Date | null;

  // Actions
  refreshBackups: () => Promise<void>;
  createSelectiveBackup: (
    collections: string[],
    includeDependencies: boolean,
    name?: string
  ) => Promise<void>;
  restoreSelectiveBackup: (backupId: string) => Promise<void>;
  deleteSelectiveBackup: (backupId: string) => Promise<void>;
  loadAvailableCollections: () => Promise<void>;

  // Utilities
  formatBackupDate: (date: Date | string) => string;
  getBackupAge: (date: Date | string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  resolveDependencies: (collections: string[]) => string[];
  getCollectionsByCategory: () => { [category: string]: CollectionInfo[] };
}

/** Backup por tabela: também é da infraestrutura do banco, não da API (ver `useBackupManagement`). */
export const useSelectiveBackup = (): UseSelectiveBackupReturn => {
  const toast = useToast();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshBackups = useCallback(async () => {
    setLastUpdated(new Date());
  }, []);

  const unavailable = useCallback(async () => {
    toast.error(BACKUP_NOT_IN_API);
  }, [toast]);

  const noop = useCallback(async () => {}, []);

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

  const resolveDependencies = useCallback(
    (collections: string[]) => collections,
    []
  );

  const getCollectionsByCategory = useCallback(() => ({}), []);

  return {
    selectiveBackups: [],
    availableCollections: [],
    maxBackups: 0,
    totalBackups: 0,

    loading: false,
    error: BACKUP_NOT_IN_API,
    isCreatingBackup: false,
    isRestoringBackup: false,
    lastUpdated,

    refreshBackups,
    createSelectiveBackup: unavailable,
    restoreSelectiveBackup: unavailable,
    deleteSelectiveBackup: unavailable,
    loadAvailableCollections: noop,

    formatBackupDate,
    getBackupAge,
    getStatusColor,
    getStatusLabel,
    resolveDependencies,
    getCollectionsByCategory,
  };
};
