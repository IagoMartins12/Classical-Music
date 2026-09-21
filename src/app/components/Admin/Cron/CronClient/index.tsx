'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiAlertTriangle,
  FiCalendar,
  FiPause,
  FiPlay,
  FiSave,
} from 'react-icons/fi';
import {
  adminKeys,
  errorMessage,
  useAdminMutation,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import {
  type ApiMaintenanceTask,
  deleteMaintenanceSchedule,
  listMaintenanceTasks,
  runMaintenanceTask,
  setMaintenanceSchedule,
  waitForMaintenanceJob,
} from '@/app/requests/admin/maintenance';

/**
 * As tarefas agendadas.
 *
 * **O catálogo é fechado, definido no código da API.** Não dá para criar uma
 * tarefa por aqui, e isso é de propósito: no legado, a rota de atualização
 * escrevia o corpo cru da requisição por cima do objeto da tarefa — inclusive
 * sobre o campo que decide qual código roda. Aqui a tela escolhe **quando**,
 * nunca **o quê**.
 *
 * Desligar é apagar o agendamento; a tarefa continua no catálogo e pode ser
 * executada à mão.
 */

const PRESETS: Array<{ rotulo: string; cron: string }> = [
  { rotulo: 'A cada hora', cron: '0 * * * *' },
  { rotulo: 'Diário, 3h', cron: '0 3 * * *' },
  { rotulo: 'Diário, 5h', cron: '0 5 * * *' },
  { rotulo: 'Semanal, domingo 4h', cron: '0 4 * * 0' },
  { rotulo: 'Mensal, dia 1 às 4h', cron: '0 4 1 * *' },
];

function quando(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString('pt-BR') : '—';
}

export default function CronClient() {
  const [rodando, setRodando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});

  const tarefas = useAdminQuery(
    adminKeys.area('cron'),
    () => listMaintenanceTasks(),
    { refetchInterval: 30_000 }
  );

  const agendar = useAdminMutation(
    (taskId: string, cron: string) => setMaintenanceSchedule(taskId, cron),
    ['cron', 'maintenance', 'backup']
  );

  const desagendar = useAdminMutation(
    (taskId: string) => deleteMaintenanceSchedule(taskId),
    ['cron', 'maintenance', 'backup']
  );

  async function executar(tarefa: ApiMaintenanceTask) {
    // Tarefa destrutiva sem confirmação a API só simula — e é o que queremos
    // por aqui: quem apaga de verdade usa a tela da área, que pede a frase.
    setRodando(tarefa.id);

    try {
      const { jobId } = await runMaintenanceTask(
        tarefa.id,
        !tarefa.destructive
      );
      const resultado = await waitForMaintenanceJob(jobId);

      if (resultado.warnings?.length) {
        resultado.warnings.forEach((aviso) => toast.error(aviso));
      } else {
        toast.success(`${tarefa.name}: concluída.`);
      }

      await tarefas.refetch();
    } catch (erro) {
      toast.error(errorMessage(erro));
    } finally {
      setRodando(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-theme-primary classical-title">
          Tarefas agendadas
        </h1>
        <p className="text-theme-secondary text-sm mt-1">
          O horário é {tarefas.data?.timezone ?? '—'}. Sem agendamento, a tarefa
          só roda quando alguém manda.
        </p>
      </header>

      <div className="space-y-3">
        {(tarefas.data?.tasks ?? []).map((tarefa) => {
          const cronAtual = tarefa.schedule?.cron ?? '';
          const valor = rascunho[tarefa.id] ?? cronAtual;

          return (
            <section key={tarefa.id} className="classical-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-theme-primary font-semibold">
                      {tarefa.name}
                    </h2>
                    {tarefa.destructive && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent-red bg-accent-red/10 rounded-full px-2 py-0.5">
                        <FiAlertTriangle className="w-3 h-3" />
                        apaga dado
                      </span>
                    )}
                  </div>
                  <p className="text-theme-secondary text-sm mt-1 max-w-2xl">
                    {tarefa.description}
                  </p>
                  <p className="text-theme-tertiary text-xs mt-1 flex items-center gap-1.5">
                    <FiCalendar className="w-3 h-3" />
                    {cronAtual
                      ? `${cronAtual} · próxima ${quando(tarefa.schedule?.nextRunAt)}`
                      : 'sem agendamento'}
                  </p>
                </div>

                <button
                  onClick={() => void executar(tarefa)}
                  disabled={rodando === tarefa.id}
                  className="btn-classical-secondary flex items-center gap-1.5 text-sm px-3 py-1.5 disabled:opacity-50"
                >
                  <FiPlay className="w-3.5 h-3.5" />
                  {rodando === tarefa.id ? 'Rodando…' : 'Rodar agora'}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <input
                  value={valor}
                  onChange={(evento) =>
                    setRascunho((anterior) => ({
                      ...anterior,
                      [tarefa.id]: evento.target.value,
                    }))
                  }
                  placeholder={tarefa.suggestedCron ?? '0 3 * * *'}
                  className="w-44 rounded-md border border-theme-primary bg-theme-elevated px-3 py-1.5 text-sm font-mono text-theme-primary"
                  aria-label={`Expressão cron de ${tarefa.name}`}
                />

                <select
                  value=""
                  onChange={(evento) =>
                    setRascunho((anterior) => ({
                      ...anterior,
                      [tarefa.id]: evento.target.value,
                    }))
                  }
                  className="rounded-md border border-theme-primary bg-theme-elevated px-2 py-1.5 text-sm text-theme-primary"
                  aria-label={`Frequências prontas para ${tarefa.name}`}
                >
                  <option value="">Frequências prontas…</option>
                  {PRESETS.map((preset) => (
                    <option key={preset.cron} value={preset.cron}>
                      {preset.rotulo} ({preset.cron})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    void agendar
                      .mutateAsync([tarefa.id, valor])
                      .then(() => toast.success('Agendamento salvo.'))
                      .catch(() => undefined)
                  }
                  disabled={!valor.trim() || valor === cronAtual}
                  className="btn-classical-primary flex items-center gap-1.5 text-sm px-3 py-1.5 disabled:opacity-40"
                >
                  <FiSave className="w-3.5 h-3.5" />
                  Salvar
                </button>

                {cronAtual && (
                  <button
                    onClick={() =>
                      void desagendar
                        .mutateAsync([tarefa.id])
                        .then(() => {
                          setRascunho((anterior) => ({
                            ...anterior,
                            [tarefa.id]: '',
                          }));
                          toast.success('Agendamento removido.');
                        })
                        .catch(() => undefined)
                    }
                    className="btn-classical-secondary flex items-center gap-1.5 text-sm px-3 py-1.5"
                  >
                    <FiPause className="w-3.5 h-3.5" />
                    Desligar
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
