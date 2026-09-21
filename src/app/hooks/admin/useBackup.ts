import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  adminKeys,
  errorMessage,
  useAdminMutation,
  useAdminQuery,
} from './query';
import {
  BACKUP_TASK_ID,
  type BackupCollectionConfig,
  getBackupDownloadUrl,
  getBackupSettings,
  listBackupCollections,
  listBackupFiles,
  listBackupRuns,
  saveBackupSettings,
} from '@/app/requests/admin/backup';
import {
  listMaintenanceTasks,
  runMaintenanceTask,
  waitForMaintenanceJob,
} from '@/app/requests/admin/maintenance';

/**
 * O backup no painel.
 *
 * **Executar passa pela manutenção**, não por uma rota própria: o backup é a
 * tarefa `database.backup` do catálogo, então herda a fila, o job consultável
 * e o agendamento das outras tarefas. Uma rota que gerasse o backup dentro da
 * requisição HTTP seria meia hora de conexão aberta — foi o que o legado
 * fazia, com `spawn('npm run backup')` e timeout de 30 minutos.
 */
export function useBackup() {
  const [executando, setExecutando] = useState(false);

  const dados = useAdminQuery(
    adminKeys.area('backup'),
    async () => {
      const [settings, colecoes, arquivos, execucoes, tarefas] =
        await Promise.all([
          getBackupSettings(),
          listBackupCollections(),
          listBackupFiles(),
          listBackupRuns(20),
          listMaintenanceTasks(),
        ]);

      return {
        settings,
        colecoes,
        arquivos,
        execucoes,
        agendamento:
          tarefas.tasks.find((tarefa) => tarefa.id === BACKUP_TASK_ID) ?? null,
      };
    },
    // Enquanto um backup roda, a tela se atualiza sozinha.
    { refetchInterval: executando ? 5_000 : 60_000 }
  );

  const salvar = useAdminMutation(
    (keep: number, collections: BackupCollectionConfig[]) =>
      saveBackupSettings(keep, collections),
    ['backup']
  );

  const executar = useCallback(async () => {
    setExecutando(true);

    try {
      // `confirm: true` porque a tarefa não é destrutiva: ela não simula.
      const { jobId } = await runMaintenanceTask(BACKUP_TASK_ID, true);
      const resultado = await waitForMaintenanceJob(jobId);

      if (resultado.warnings?.length) {
        resultado.warnings.forEach((aviso) => toast.error(aviso));
      } else {
        toast.success(
          `Backup concluído: ${resultado.summary.documentos ?? 0} documentos.`
        );
      }

      await dados.refetch();
    } catch (erro) {
      toast.error(errorMessage(erro));
    } finally {
      setExecutando(false);
    }
  }, [dados]);

  const baixar = useCallback(async (key: string) => {
    try {
      const { url } = await getBackupDownloadUrl(key);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (erro) {
      toast.error(errorMessage(erro));
    }
  }, []);

  const ultimoBom = useMemo(
    () =>
      dados.data?.execucoes.find(
        (execucao) => execucao.status === 'ok' && execucao.verifiedAt
      ) ?? null,
    [dados.data]
  );

  return {
    ...dados,
    salvar,
    executar,
    executando,
    baixar,
    ultimoBom,
  };
}
