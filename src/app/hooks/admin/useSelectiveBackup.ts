// app/hooks/admin/useSelectiveBackup.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../useToast';

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

export const useSelectiveBackup = (): UseSelectiveBackupReturn => {
  const [selectiveBackups, setSelectiveBackups] = useState<
    SelectiveBackupInfo[]
  >([]);
  const [availableCollections, setAvailableCollections] = useState<
    CollectionInfo[]
  >([]);
  const [maxBackups, setMaxBackups] = useState(25);
  const [totalBackups, setTotalBackups] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const toast = useToast();
  // Função para buscar lista de backups seletivos
  const fetchSelectiveBackups = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/backup/selective?action=list', {
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
        setSelectiveBackups(data.backups || []);
        setMaxBackups(data.maxBackups || 25);
        setTotalBackups(data.totalBackups || 0);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Erro ao carregar backups seletivos');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar backups seletivos:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Função para carregar collections disponíveis
  const loadAvailableCollections = useCallback(async () => {
    try {
      const response = await fetch(
        '/api/admin/backup/selective?action=collections',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableCollections(data.collections || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar collections:', error);
    }
  }, []);

  // Função para criar backup seletivo
  const createSelectiveBackup = useCallback(
    async (
      collections: string[],
      includeDependencies: boolean,
      name?: string
    ) => {
      if (isCreatingBackup) return;

      if (!collections || collections.length === 0) {
        toast.error('Selecione pelo menos uma tabela para backup');
        return;
      }

      setIsCreatingBackup(true);
      setError(null);

      const toastId = toast.loading('Criando backup seletivo...', null, {
        duration: Infinity,
      });

      try {
        const response = await fetch('/api/admin/backup/selective', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create',
            collections,
            includeDependencies,
            name,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Backup seletivo criado com sucesso!');

          // Aguardar um pouco antes de atualizar a lista
          setTimeout(() => {
            fetchSelectiveBackups();
          }, 2000);
        } else {
          throw new Error(data.error || 'Erro ao criar backup seletivo');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao criar backup: ${errorMessage}`);
        console.error('Erro ao criar backup seletivo:', err);
      } finally {
        setIsCreatingBackup(false);
      }
    },
    [isCreatingBackup, fetchSelectiveBackups]
  );

  // Função para restaurar backup seletivo
  const restoreSelectiveBackup = useCallback(
    async (backupId: string) => {
      if (isRestoringBackup) return;

      const confirmed = window.confirm(
        'Tem certeza que deseja restaurar este backup seletivo? Esta ação pode sobrescrever dados existentes nas tabelas selecionadas.'
      );

      if (!confirmed) return;

      setIsRestoringBackup(true);
      setError(null);

      const toastId = toast.loading('Restaurando backup seletivo...', null, {
        duration: Infinity,
      });

      try {
        const response = await fetch('/api/admin/backup/selective', {
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
          toast.success('Backup seletivo restaurado com sucesso!');
        } else {
          throw new Error(data.error || 'Erro ao restaurar backup seletivo');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao restaurar backup: ${errorMessage}`);
        console.error('Erro ao restaurar backup seletivo:', err);
      } finally {
        setIsRestoringBackup(false);
      }
    },
    [isRestoringBackup]
  );

  // Função para deletar backup seletivo
  const deleteSelectiveBackup = useCallback(
    async (backupId: string) => {
      const confirmed = window.confirm(
        'Tem certeza que deseja excluir este backup seletivo? Esta ação não pode ser desfeita.'
      );

      if (!confirmed) return;

      const toastId = toast.loading('Removendo backup seletivo...');

      try {
        const response = await fetch(
          `/api/admin/backup/selective?id=${backupId}`,
          {
            method: 'DELETE',
          }
        );

        const data = await response.json();

        if (data.success) {
          toast.success('Backup seletivo removido com sucesso!');
          fetchSelectiveBackups(); // Atualizar lista
        } else {
          throw new Error(data.error || 'Erro ao remover backup seletivo');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        toast.error(`Erro ao remover backup: ${errorMessage}`);
        console.error('Erro ao remover backup seletivo:', err);
      }
    },
    [fetchSelectiveBackups]
  );

  // Refresh wrapper
  const refreshBackups = useCallback(async () => {
    return fetchSelectiveBackups();
  }, [fetchSelectiveBackups]);

  // Função para resolver dependências
  const resolveDependencies = useCallback(
    (collections: string[]): string[] => {
      const resolved = new Set<string>();
      const toProcess = [...collections];

      while (toProcess.length > 0) {
        const current = toProcess.pop()!;

        if (resolved.has(current)) continue;

        resolved.add(current);

        // Adicionar dependências
        const collection = availableCollections.find((c) => c.name === current);
        if (collection && collection.dependencies) {
          for (const dep of collection.dependencies) {
            if (!resolved.has(dep)) {
              toProcess.push(dep);
            }
          }
        }
      }

      // Ordenar por ordem de dependência (independentes primeiro)
      const ordered = Array.from(resolved).sort((a, b) => {
        const aDeps =
          availableCollections.find((c) => c.name === a)?.dependencies
            ?.length || 0;
        const bDeps =
          availableCollections.find((c) => c.name === b)?.dependencies
            ?.length || 0;
        return aDeps - bDeps;
      });

      return ordered;
    },
    [availableCollections]
  );

  // Função para categorizar collections
  const getCollectionsByCategory = useCallback((): {
    [category: string]: CollectionInfo[];
  } => {
    const categories: { [category: string]: CollectionInfo[] } = {
      'Sistema Base': [],
      'Conteúdo Musical': [],
      'Dados dos Usuários': [],
      Interações: [],
      Comunicação: [],
    };

    availableCollections.forEach((collection) => {
      if (['user', 'epoch', 'role', 'instrument'].includes(collection.name)) {
        categories['Sistema Base'].push(collection);
      } else if (['composer', 'work', 'workScore'].includes(collection.name)) {
        categories['Conteúdo Musical'].push(collection);
      } else if (
        ['userInstrument', 'studySession', 'learningGoal'].includes(
          collection.name
        )
      ) {
        categories['Dados dos Usuários'].push(collection);
      } else if (
        [
          'annotation',
          'workAnnotation',
          'favoriteWork',
          'favoriteComposer',
          'favoriteScore',
          'wantToLearn',
          'learned',
        ].includes(collection.name)
      ) {
        categories['Interações'].push(collection);
      } else if (
        ['newsletterSubscriber', 'advertisement'].includes(collection.name)
      ) {
        categories['Comunicação'].push(collection);
      }
    });

    return categories;
  }, [availableCollections]);

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

  // Carregar dados iniciais
  useEffect(() => {
    loadAvailableCollections();
    fetchSelectiveBackups();
  }, []);

  // Auto-refresh a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isCreatingBackup) {
        fetchSelectiveBackups();
      }
    }, 2 * 60 * 1000); // 2 minutos

    return () => clearInterval(interval);
  }, [loading, isCreatingBackup, fetchSelectiveBackups]);

  return {
    // Data
    selectiveBackups,
    availableCollections,
    maxBackups,
    totalBackups,

    // State
    loading,
    error,
    isCreatingBackup,
    isRestoringBackup,
    lastUpdated,

    // Actions
    refreshBackups,
    createSelectiveBackup,
    restoreSelectiveBackup,
    deleteSelectiveBackup,
    loadAvailableCollections,

    // Utilities
    formatBackupDate,
    getBackupAge,
    getStatusColor,
    getStatusLabel,
    resolveDependencies,
    getCollectionsByCategory,
  };
};
