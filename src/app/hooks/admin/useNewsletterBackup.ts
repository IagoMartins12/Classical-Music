// app/hooks/admin/useNewsletterBackup.ts
import { useState, useCallback } from 'react';

interface BackupItem {
  id: string;
  type: 'FULL' | 'PARTIAL' | 'SCHEDULED';
  filename: string;
  fileSize: number;
  subscribersCount: number;
  campaignsCount: number;
  templatesCount: number;
  eventsCount: number;
  status: 'CREATING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  downloadUrl?: string;
}

interface BackupConfig {
  includeSubscribers: boolean;
  includeCampaigns: boolean;
  includeTemplates: boolean;
  includeEvents: boolean;
  includeSettings: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  statusFilter?: string[];
}

interface UseNewsletterBackupReturn {
  backups: BackupItem[];
  loading: boolean;
  error: string | null;
  createBackup: (config: BackupConfig) => Promise<BackupItem>;
  restoreBackup: (backupId: string) => Promise<void>;
  deleteBackup: (backupId: string) => Promise<void>;
  downloadBackup: (backupId: string) => Promise<void>;
  fetchBackups: () => Promise<void>;
}

export const useNewsletterBackup = (): UseNewsletterBackupReturn => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/newsletter/backup');
      const result = await response.json();

      if (result.success) {
        setBackups(result.backups);
      } else {
        setError(result.error || 'Erro ao carregar backups');
      }
    } catch (err) {
      console.error('Erro ao buscar backups:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackup = useCallback(
    async (config: BackupConfig): Promise<BackupItem> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/newsletter/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        });

        const result = await response.json();

        if (result.success) {
          const newBackup = result.backup;
          setBackups((prev) => [newBackup, ...prev]);
          return newBackup;
        } else {
          throw new Error(result.error || 'Erro ao criar backup');
        }
      } catch (err) {
        console.error('Erro ao criar backup:', err);
        setError(err instanceof Error ? err.message : 'Erro ao criar backup');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const restoreBackup = useCallback(async (backupId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/newsletter/backup/${backupId}/restore`,
        {
          method: 'POST',
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao restaurar backup');
      }

      // Sucesso - o backup foi restaurado
    } catch (err) {
      console.error('Erro ao restaurar backup:', err);
      setError(err instanceof Error ? err.message : 'Erro ao restaurar backup');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBackup = useCallback(async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/newsletter/backup/${backupId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setBackups((prev) => prev.filter((backup) => backup.id !== backupId));
      } else {
        throw new Error(result.error || 'Erro ao deletar backup');
      }
    } catch (err) {
      console.error('Erro ao deletar backup:', err);
      throw err;
    }
  }, []);

  const downloadBackup = useCallback(async (backupId: string) => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/backup/${backupId}/download`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Tentar obter o nome do arquivo do header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `newsletter-backup-${backupId}.json`;

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Erro no download');
      }
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      throw err;
    }
  }, []);

  return {
    backups,
    loading,
    error,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    fetchBackups,
  };
};
