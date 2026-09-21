/**
 * Backup do banco (`/admin/backup/*`).
 *
 * **Rodar o backup não mora aqui.** Ele é uma tarefa do catálogo de manutenção
 * (`database.backup`), então executar e agendar usam `requests/admin/maintenance`
 * — as mesmas funções das outras tarefas. Aqui ficam a configuração, o
 * histórico e os arquivos.
 */
import { apiFetch } from '@/app/libs/api/client';

const noStore = { cache: 'no-store' as const };

/** O identificador da tarefa no catálogo de manutenção. */
export const BACKUP_TASK_ID = 'database.backup';

export interface BackupCollectionConfig {
  name: string;
  /** Nulo é "tudo". */
  limit: number | null;
}

export interface BackupAvailableCollection {
  /** Nome no banco — é o que vai no arquivo. */
  name: string;
  /** Nome do model, que é o que a tela mostra. */
  model: string;
  documents: number;
}

export interface BackupSettings {
  keep: number;
  collections: BackupCollectionConfig[];
  /** O que impede o backup de rodar, quando impede. */
  storageIssue: string | null;
}

export interface BackupFile {
  key: string;
  sizeBytes: number;
  createdAt: string;
}

export interface BackupRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: 'running' | 'ok' | 'failed' | string;
  objectKey: string | null;
  sizeBytes: number | null;
  documentCount: number | null;
  verifiedAt: string | null;
  error: string | null;
  collections?: Array<{ name: string; documents: number }>;
  rotated?: string[];
}

export const listBackupCollections = () =>
  apiFetch<BackupAvailableCollection[]>('/admin/backup/collections', noStore);

export const getBackupSettings = () =>
  apiFetch<BackupSettings>('/admin/backup/settings', noStore);

export const saveBackupSettings = (
  keep: number,
  collections: BackupCollectionConfig[]
) =>
  apiFetch<BackupSettings>('/admin/backup/settings', {
    method: 'PUT',
    // A API recusa campo desconhecido: o corpo vai montado, não repassado.
    body: {
      keep,
      collections: collections.map((colecao) => ({
        name: colecao.name,
        ...(colecao.limit === null ? {} : { limit: colecao.limit }),
      })),
    },
  });

export const listBackupFiles = () =>
  apiFetch<BackupFile[]>('/admin/backup/files', noStore);

export const listBackupRuns = (limit = 20) =>
  apiFetch<BackupRun[]>('/admin/backup/runs', { ...noStore, query: { limit } });

/** Link assinado, válido por uma hora — o bucket continua privado. */
export const getBackupDownloadUrl = (key: string) =>
  apiFetch<{ url: string; expiresInSeconds: number }>(
    '/admin/backup/files/download',
    { ...noStore, query: { key } }
  );
