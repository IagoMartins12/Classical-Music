'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiCaretRight, PiPlay } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { TextoRico } from '@/app/components/ui/TextoRico';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  AcompanhamentoDeRodada,
  EstadoDaRodada,
  duracao,
} from '@/app/components/Admin/painel/Rodada';
import {
  bytes,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  errorMessage,
  useAdminMutation,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import { useJobsRecentes } from '@/app/hooks/admin/useJobs';
import { rolarAte } from '@/app/components/Admin/painel/Numeros';
import { HistoricoDeExecucoes } from './HistoricoDeExecucoes';
import type { Job } from '@/app/requests/admin/jobs';
import {
  deleteMaintenanceSchedule,
  listMaintenanceTasks,
  runMaintenanceTask,
  setMaintenanceSchedule,
  resumoDasExecucoes,
  type ApiMaintenanceTask,
  type MaintenanceOutcome,
  type ResumoDeTarefa,
} from '@/app/requests/admin/maintenance';

/**
 * Tarefas agendadas: quando cada tarefa de manutenção roda, e o que cada
 * rodada fez.
 *
 * **O catálogo é fechado, definido no código da API**: a tela escolhe
 * *quando*, nunca *o quê*. Desligar é tirar o agendamento — a tarefa continua
 * e pode rodar à mão. Tarefa que apaga dado, rodada daqui, só simula: quem
 * apaga de verdade usa a tela da área, que pede a frase de confirmação.
 *
 * Cada tarefa abre um painel com as últimas rodadas; cada rodada, o
 * acompanhamento — na fila, rodando (com a frase do que está fazendo),
 * concluída com o que achou e o que fez, ou a falha com o motivo. Antes,
 * "Rodar agora" esperava um minuto e mostrava um aviso de "concluída" ou os
 * avisos soltos, e o que a tarefa tinha feito não aparecia em lugar nenhum.
 */

const PRONTAS = [
  { value: '0 * * * *', label: 'A cada hora' },
  { value: '0 3 * * *', label: 'Todo dia, 3h' },
  { value: '0 5 * * *', label: 'Todo dia, 5h' },
  { value: '0 4 * * 0', label: 'Domingo, 4h' },
  { value: '0 4 1 * *', label: 'Dia 1 do mês, 4h' },
];

type Rodada = Job<MaintenanceOutcome>;

/** "removidosDoProvedor" → "Removidos do provedor". */
const legivel = (chave: string) => {
  const t = chave
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export default function TarefasAgendadas() {
  const [aberta, setAberta] = useState<ApiMaintenanceTask | null>(null);
  const [acompanhando, setAcompanhando] = useState<{
    jobId: string;
    tarefa: string;
  } | null>(null);
  const [rodando, setRodando] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<ApiMaintenanceTask | null>(null);
  // O histórico abre filtrado pela tarefa escolhida no detalhe.
  const [tarefaDoHistorico, setTarefaDoHistorico] = useState('');
  const resumoDoHistorico = useAdminQuery(
    adminKeys.list('cron', 'execucoes-resumo'),
    resumoDasExecucoes
  );
  const historicoDe = (taskId: string) =>
    resumoDoHistorico.data?.find((r) => r.task === taskId);

  const tarefas = useAdminQuery(
    adminKeys.area('cron'),
    () => listMaintenanceTasks(),
    { refetchInterval: 30_000 }
  );
  const recentes = useJobsRecentes<MaintenanceOutcome>('maintenance', {
    limit: 60,
  });
  const agendar = useAdminMutation(
    (id: string, cron: string) => setMaintenanceSchedule(id, cron),
    ['cron', 'maintenance', 'backup', 'auditoria', 'pendencias']
  );
  const desagendar = useAdminMutation(
    (id: string) => deleteMaintenanceSchedule(id),
    ['cron', 'maintenance', 'backup', 'auditoria']
  );

  const ultimaDe = (taskId: string) =>
    (recentes.data ?? []).find((j) => j.payload?.taskId === taskId);

  const mudar = async (t: ApiMaintenanceTask, cron: string) => {
    try {
      if (cron) await agendar.mutateAsync([t.id, cron]);
      else await desagendar.mutateAsync([t.id]);
      toast.success(
        cron
          ? 'Agendamento salvo.'
          : 'Agendamento tirado; a tarefa só roda à mão.'
      );
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const executar = async (t: ApiMaintenanceTask) => {
    setRodando(t.id);
    try {
      // Daqui, tarefa destrutiva só simula (sem `confirm`).
      const { jobId, aviso } = await runMaintenanceTask(t.id, !t.destructive);
      if (aviso) toast(aviso);
      setAcompanhando({ jobId, tarefa: t.name });
      void recentes.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setRodando(null);
      setConfirmar(null);
    }
  };

  const lista = tarefas.data?.tasks ?? [];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Tarefas agendadas"
        descricao={`Horário de ${tarefas.data?.timezone === 'America/Sao_Paulo' ? 'Brasília' : (tarefas.data?.timezone ?? '—')}. Sem agendamento, a tarefa só roda quando alguém manda.`}
      />

      {tarefas.loading ? (
        <Row.Lista>
          <Row.Skeleton repetir={5} />
        </Row.Lista>
      ) : tarefas.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {tarefas.error}
        </Text>
      ) : (
        <ul className="sup-1 flex flex-col !p-0">
          {lista.map((t) => {
            const cron = t.schedule?.cron ?? '';
            const conhecida = PRONTAS.some((p) => p.value === cron);
            const opcoes = [
              { value: '', label: 'Só à mão' },
              ...PRONTAS,
              ...(t.suggestedCron &&
              !PRONTAS.some((p) => p.value === t.suggestedCron)
                ? [
                    {
                      value: t.suggestedCron,
                      label: `Sugerida (${t.suggestedCron})`,
                    },
                  ]
                : []),
              ...(cron && !conhecida && cron !== t.suggestedCron
                ? [{ value: cron, label: `Atual (${cron})` }]
                : []),
            ];
            const ultima = ultimaDe(t.id);
            return (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-4 border-t border-linha px-5 py-4 first:border-0"
              >
                <button
                  type="button"
                  onClick={() => setAberta(t)}
                  className="-mx-2 flex min-w-0 flex-1 basis-72 flex-col gap-0.5 rounded-controle px-2 py-1 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.9375rem] font-medium text-texto">
                      {t.name}
                    </span>
                    {t.destructive && (
                      <Badge estado="atencao">Apaga dado</Badge>
                    )}
                    <Icon
                      de={PiCaretRight}
                      tamanho="pp"
                      className="text-texto-fraco"
                    />
                  </span>
                  <span className="t-rotulo line-clamp-2 text-texto-suave">
                    <TextoRico texto={t.description.replace(/`/g, '')} />
                  </span>
                  <span className="t-legenda flex flex-wrap items-center gap-x-2">
                    {ultima ? (
                      <>
                        <EstadoDaRodada job={ultima} />
                        <span>
                          {relativo(
                            ultima.finishedAt ??
                              ultima.processedAt ??
                              ultima.requestedAt
                          )}
                        </span>
                        <span aria-hidden="true">·</span>
                      </>
                    ) : null}
                    {cron
                      ? `Próxima ${relativo(t.schedule?.nextRunAt)}`
                      : 'Sem agendamento'}
                    {historicoDe(t.id) && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          rodou {numero(historicoDe(t.id)!.total)}{' '}
                          {historicoDe(t.id)!.total === 1 ? 'vez' : 'vezes'}
                        </span>
                      </>
                    )}
                  </span>
                </button>
                <span className="w-full sm:w-56">
                  <label htmlFor={`tarefa-${t.id}`} className="sr-only">
                    Quando {t.name} roda
                  </label>
                  <Selecao
                    id={`tarefa-${t.id}`}
                    valor={cron}
                    aoMudar={(v) => mudar(t, v)}
                    opcoes={opcoes}
                    disabled={agendar.isPending || desagendar.isPending}
                  />
                </span>
                <Button
                  tamanho="p"
                  icone={PiPlay}
                  carregando={rodando === t.id}
                  onClick={() => setConfirmar(t)}
                  className="max-sm:w-full"
                >
                  {t.destructive ? 'Simular' : 'Rodar agora'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmModal
        isOpen={!!confirmar}
        onClose={() => setConfirmar(null)}
        onConfirm={() => (confirmar ? executar(confirmar) : undefined)}
        type="question"
        title={
          confirmar?.destructive
            ? `Simular “${confirmar?.name}”?`
            : `Rodar “${confirmar?.name}” agora?`
        }
        message={
          confirmar?.destructive
            ? 'Daqui ela só conta o que apagaria — nada sai do banco. O resultado aparece em seguida.'
            : 'A tarefa entra na fila e o acompanhamento abre em seguida.'
        }
        confirmText={confirmar?.destructive ? 'Simular' : 'Rodar'}
        isLoading={!!rodando}
      />

      <HistoricoDeExecucoes
        key={tarefaDoHistorico}
        tarefaInicial={tarefaDoHistorico}
      />

      <DetalheDaTarefa
        tarefa={aberta}
        resumo={aberta ? historicoDe(aberta.id) : undefined}
        aoVerHistorico={() => {
          if (!aberta) return;
          setTarefaDoHistorico(aberta.id);
          setAberta(null);
          setTimeout(() => rolarAte('tarefas-historico'), 80);
        }}
        rodadas={(recentes.data ?? []).filter(
          (j) => j.payload?.taskId === aberta?.id
        )}
        carregando={recentes.loading}
        aoFechar={() => setAberta(null)}
        aoAbrirRodada={(j) =>
          setAcompanhando({ jobId: j.jobId, tarefa: aberta?.name ?? '' })
        }
        aoRodar={() => aberta && setConfirmar(aberta)}
      />

      <AcompanhamentoDeRodada<MaintenanceOutcome>
        fila="maintenance"
        jobId={acompanhando?.jobId ?? null}
        titulo={acompanhando?.tarefa ?? ''}
        aoFechar={() => {
          setAcompanhando(null);
          void recentes.refetch();
        }}
        resultado={(r) => <ResultadoDaTarefa r={r} />}
      />
    </Stack>
  );
}

function DetalheDaTarefa({
  tarefa: t,
  resumo,
  aoVerHistorico,
  rodadas,
  carregando,
  aoFechar,
  aoAbrirRodada,
  aoRodar,
}: {
  tarefa: ApiMaintenanceTask | null;
  /** O que o histórico (banco) diz desta tarefa. */
  resumo?: ResumoDeTarefa;
  aoVerHistorico: () => void;
  rodadas: Rodada[];
  carregando: boolean;
  aoFechar: () => void;
  aoAbrirRodada: (j: Rodada) => void;
  aoRodar: () => void;
}) {
  return (
    <Sheet
      aberto={!!t}
      aoFechar={aoFechar}
      titulo={t?.name ?? ''}
      descricao={
        t
          ? t.schedule?.cron
            ? `Agendada (${t.schedule.cron}) · próxima ${relativo(t.schedule.nextRunAt)}`
            : 'Sem agendamento — só roda à mão'
          : undefined
      }
      largura="g"
      rodape={
        t && (
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPlay}
            onClick={aoRodar}
          >
            {t.destructive ? 'Simular agora' : 'Rodar agora'}
          </Button>
        )
      }
    >
      {t && (
        <Stack gap={6}>
          <p className="text-sm text-texto-suave">
            <TextoRico texto={t.description.replace(/`/g, '')} />
          </p>
          {t.destructive && (
            <Text papel="rotulo" as="p" className="text-texto-suave">
              <Badge estado="atencao" className="mr-2">
                Apaga dado
              </Badge>
              Rodada daqui, só simula. A execução agendada aplica.
            </Text>
          )}
          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No histórico
            </Text>
            {resumo ? (
              <Text papel="rotulo" tom="suave" as="p">
                Rodou {numero(resumo.total)}{' '}
                {resumo.total === 1 ? 'vez' : 'vezes'} —{' '}
                {numero(resumo.agendadas)} pelo agendamento,{' '}
                {numero(resumo.manuais)} à mão
                {resumo.falhas ? `, ${numero(resumo.falhas)} com falha` : ''}. A
                última foi {relativo(resumo.ultimaEm)}.
              </Text>
            ) : (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhuma execução registrada ainda.
              </Text>
            )}
            <Button
              tamanho="p"
              variante="texto"
              className="self-start"
              onClick={aoVerHistorico}
            >
              Ver o histórico desta tarefa
            </Button>
          </Stack>
          <Stack gap={2}>
            <Text papel="secao" as="h3">
              Na fila, nos últimos dias
            </Text>
            {carregando ? (
              <Row.Skeleton repetir={3} />
            ) : rodadas.length === 0 ? (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhuma rodada nos últimos dias (feitas ficam 7 dias na fila;
                falhas, 30).
              </Text>
            ) : (
              <ul className="flex flex-col">
                {rodadas.map((j) => (
                  <li
                    key={j.jobId}
                    className="border-b border-linha last:border-0"
                  >
                    <button
                      type="button"
                      onClick={() => aoAbrirRodada(j)}
                      className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] flex-wrap items-center gap-x-4 gap-y-1 rounded-controle px-2 py-2 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                    >
                      <EstadoDaRodada job={j} />
                      {j.payload?.dryRun ? <Badge>Simulação</Badge> : null}
                      <span className="t-legenda min-w-0 flex-1 truncate">
                        {resumoCurto(j.result)}
                      </span>
                      <span className="t-legenda t-dado">
                        {duracao(j) ?? ''}
                      </span>
                      <span className="t-legenda">
                        {relativo(
                          j.finishedAt ?? j.processedAt ?? j.requestedAt
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Stack>
        </Stack>
      )}
    </Sheet>
  );
}

function resumoCurto(r: MaintenanceOutcome | null) {
  if (!r) return '';
  return Object.entries(r.summary)
    .slice(0, 3)
    .map(([k, v]) => `${legivel(k).toLowerCase()}: ${valor(k, v)}`)
    .join(' · ');
}

function valor(chave: string, v: unknown) {
  if (typeof v === 'number') {
    return /bytes|tamanho/i.test(chave) ? bytes(v) : numero(v);
  }
  return String(v);
}

/** O que a tarefa achou e o que fez: o resumo, a amostra e os avisos. */
function ResultadoDaTarefa({ r }: { r: MaintenanceOutcome }) {
  const itens = Object.entries(r.summary);
  return (
    <Stack gap={4}>
      {itens.length > 0 && (
        <dl className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
          {itens.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-4 px-4 py-2.5"
            >
              <dt className="t-rotulo text-texto-suave">{legivel(k)}</dt>
              <dd className="t-dado break-all text-right text-sm text-texto">
                {valor(k, v)}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {r.warnings && r.warnings.length > 0 && (
        <Stack gap={2}>
          <Text papel="rotulo" as="h4" className="font-medium">
            Avisos
          </Text>
          <ul className="flex flex-col gap-1">
            {r.warnings.map((w, i) => (
              <li key={i} className="text-sm text-atencao">
                {w}
              </li>
            ))}
          </ul>
        </Stack>
      )}
      {r.sample && r.sample.length > 0 && (
        <Stack gap={2}>
          <Text papel="rotulo" as="h4" className="font-medium">
            Amostra do que foi encontrado
          </Text>
          <ul className="t-dado rolagem-discreta flex max-h-64 flex-col overflow-y-auto rounded-controle bg-sup-2 px-4 py-2 text-xs text-texto-suave">
            {r.sample.map((s, i) => (
              <li key={i} className="break-all py-0.5">
                {s}
              </li>
            ))}
          </ul>
        </Stack>
      )}
    </Stack>
  );
}
