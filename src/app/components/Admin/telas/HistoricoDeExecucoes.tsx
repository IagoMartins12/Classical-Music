'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Secao } from '@/app/components/Admin/painel/Cabecalho';
import { BarraDeSelecao } from '@/app/components/Admin/painel/Controles';
import {
  FiltroData,
  FiltroSelecao,
  fimDoDia,
  inicioDoDia,
} from '@/app/components/Admin/painel/Filtros';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import {
  bytes,
  dataHora,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminInfinite,
  useAdminMutation,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import {
  apagarExecucoes,
  listarExecucoes,
  resumoDasExecucoes,
  type ExecucaoDeTarefa,
} from '@/app/requests/admin/maintenance';

/**
 * O histórico de execuções das tarefas: manutenção, lembretes do portal,
 * prazo das denúncias, publicação de artigos e rodadas de scraper.
 *
 * Fica no banco (`task_runs`), não na fila: a fila guarda sete dias e no
 * máximo mil jobs, e a publicação de artigos — de minuto em minuto — renovava
 * esse limite em menos de um dia. Cada linha diz quem disparou (o agendamento
 * ou uma pessoa), quanto levou e o que mudou. As varreduras de minuto só
 * entram quando fizeram algo: o histórico não é depósito de "nada a fazer".
 *
 * Apagar: as marcadas, ou tudo antes de uma data — sempre com confirmação.
 */

const legivel = (chave: string) =>
  chave
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());

const valor = (chave: string, v: unknown) =>
  typeof v === 'number'
    ? /bytes|tamanho/i.test(chave)
      ? bytes(v)
      : numero(v)
    : String(v);

const duracaoDe = (ms: number) =>
  ms < 1000
    ? `${ms} ms`
    : ms < 60_000
      ? `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`
      : `${Math.round(ms / 60_000)} min`;

const resumoCurto = (r: ExecucaoDeTarefa) =>
  r.error
    ? r.error
    : Object.entries(r.summary ?? {})
        .slice(0, 3)
        .map(([k, v]) => `${legivel(k).toLowerCase()}: ${valor(k, v)}`)
        .join(' · ');

export function HistoricoDeExecucoes({
  tarefaInicial = '',
  id = 'tarefas-historico',
}: {
  /** Abre filtrado por uma tarefa (do detalhe da tarefa). */
  tarefaInicial?: string;
  id?: string;
}) {
  const navegar = useNavegar();
  const [tarefa, setTarefa] = useState(tarefaInicial);
  const [gatilho, setGatilho] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [ate, setAte] = useState('');
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [aberta, setAberta] = useState<ExecucaoDeTarefa | null>(null);
  const [apagando, setApagando] = useState<
    { tipo: 'marcadas' } | { tipo: 'antes'; data: string } | null
  >(null);
  const [antesDe, setAntesDe] = useState('');

  const filtro = {
    task: tarefa || undefined,
    trigger: gatilho || undefined,
    status: estado || undefined,
    from: inicioDoDia(desde),
    to: fimDoDia(ate),
  };
  const resumo = useAdminQuery(
    adminKeys.list('cron', 'execucoes-resumo'),
    resumoDasExecucoes
  );
  const lista = useAdminInfinite<ExecucaoDeTarefa>(
    adminKeys.list('cron', { execucoes: filtro }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await listarExecucoes(filtro, pagina);
      return {
        items: r.items,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );
  const apagar = useAdminMutation(
    (c: { ids?: string[]; before?: string; task?: string }) =>
      apagarExecucoes(c),
    ['cron', 'auditoria']
  );

  const tarefas = resumo.data ?? [];

  const colunas: Coluna<ExecucaoDeTarefa>[] = [
    {
      id: 'tarefa',
      titulo: 'Tarefa',
      principal: true,
      celula: (r) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">
            {r.taskName}
          </span>
          <span className="t-legenda truncate">{resumoCurto(r)}</span>
        </span>
      ),
    },
    {
      id: 'quem',
      titulo: 'Quem rodou',
      celula: (r) =>
        r.trigger === 'agendado' ? (
          <span className="text-sm">Agendamento</span>
        ) : r.requestedBy ? (
          <Elo
            onClick={() => navegar.usuario(r.requestedBy!)}
            className="text-sm"
          >
            {r.requestedByName ?? 'Conta'}
          </Elo>
        ) : (
          <span className="text-sm">Sistema</span>
        ),
    },
    {
      id: 'estado',
      titulo: 'Estado',
      celula: (r) => (
        <span className="flex flex-wrap gap-1">
          {r.status === 'falhou' ? (
            <Badge estado="erro">Falhou</Badge>
          ) : (
            <span className="text-sm">Concluída</span>
          )}
          {r.dryRun && <Badge>Simulação</Badge>}
        </span>
      ),
    },
    {
      id: 'duracao',
      titulo: 'Duração',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (r) => (
        <span className="t-dado text-sm">{duracaoDe(r.durationMs)}</span>
      ),
    },
    {
      id: 'quando',
      titulo: 'Quando',
      alinhar: 'fim',
      celula: (r) => (
        <span className="t-dado text-sm" title={dataHora(r.startedAt)}>
          {relativo(r.startedAt)}
        </span>
      ),
    },
  ];

  return (
    <Secao
      titulo="Histórico de execuções"
      id={id}
      detalhe={
        lista.total !== null ? `${numero(lista.total)} execuções` : undefined
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <FiltroSelecao
          rotulo="Tarefa"
          valor={tarefa}
          aoMudar={setTarefa}
          todos="Todas"
          opcoes={tarefas.map((t) => ({
            value: t.task,
            label: `${t.taskName} (${numero(t.total)})`,
          }))}
        />
        <FiltroSelecao
          rotulo="Quem rodou"
          valor={gatilho}
          aoMudar={setGatilho}
          opcoes={[
            { value: 'agendado', label: 'O agendamento' },
            { value: 'manual', label: 'Uma pessoa' },
          ]}
        />
        <FiltroSelecao
          rotulo="Estado"
          valor={estado}
          aoMudar={setEstado}
          opcoes={[
            { value: 'ok', label: 'Concluídas' },
            { value: 'falhou', label: 'Falharam' },
          ]}
        />
        <FiltroData rotulo="De" valor={desde} aoMudar={setDesde} />
        <FiltroData rotulo="Até" valor={ate} aoMudar={setAte} />
      </div>

      <BarraDeSelecao
        quantidade={marcadas.length}
        singular="execução marcada"
        plural="execuções marcadas"
        aoLimpar={() => setMarcadas([])}
      >
        <Button
          tamanho="p"
          variante="perigo"
          icone={PiTrash}
          onClick={() => setApagando({ tipo: 'marcadas' })}
        >
          Apagar do histórico
        </Button>
      </BarraDeSelecao>

      <Tabela
        rotulo="Execuções das tarefas"
        colunas={colunas}
        linhas={lista.items}
        chave={(r) => r.id}
        carregando={lista.loading}
        aoClicar={setAberta}
        selecionadas={marcadas}
        aoSelecionar={setMarcadas}
        rotuloSelecao={(r) => `${r.taskName}, ${dataHora(r.startedAt)}`}
        maisItens={lista.hasMore}
        carregandoMais={lista.loadingMore}
        aoCarregarMais={lista.loadMore}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Text papel="rotulo" tom="suave" as="p" className="px-5 py-6">
            Nenhuma execução com esses filtros.
          </Text>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-52">
          <FiltroData
            rotulo="Apagar o que rodou antes de"
            valor={antesDe}
            aoMudar={setAntesDe}
          />
        </div>
        <Button
          tamanho="p"
          variante="perigo"
          icone={PiTrash}
          disabled={!antesDe}
          onClick={() => setApagando({ tipo: 'antes', data: antesDe })}
        >
          {tarefa ? 'Apagar desta tarefa' : 'Apagar de todas'}
        </Button>
      </div>

      <DetalheDaExecucao execucao={aberta} aoFechar={() => setAberta(null)} />

      <ConfirmModal
        isOpen={!!apagando}
        onClose={() => setApagando(null)}
        onConfirm={async () => {
          if (!apagando) return;
          try {
            const r = await apagar.mutateAsync([
              apagando.tipo === 'marcadas'
                ? { ids: marcadas }
                : {
                    before: inicioDoDia(apagando.data),
                    task: tarefa || undefined,
                  },
            ]);
            toast.success(
              `${numero(r.apagados)} ${r.apagados === 1 ? 'execução apagada' : 'execuções apagadas'} do histórico.`
            );
            setMarcadas([]);
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível apagar.'
            );
          }
          setApagando(null);
        }}
        type="danger"
        title="Apagar do histórico?"
        message={
          apagando?.tipo === 'marcadas'
            ? `${numero(marcadas.length)} ${marcadas.length === 1 ? 'execução sai' : 'execuções saem'} do histórico. A tarefa e o que ela fez não mudam; some só o registro. Não dá para desfazer.`
            : `Tudo o que ${tarefa ? 'esta tarefa rodou' : 'as tarefas rodaram'} antes de ${apagando ? new Date(`${apagando.data}T12:00:00`).toLocaleDateString('pt-BR') : ''} sai do histórico. Não dá para desfazer.`
        }
        confirmText="Apagar"
        isLoading={apagar.isPending}
      />
    </Secao>
  );
}

/** Uma execução inteira: quem, quando, o resumo, a amostra, os avisos, o erro. */
function DetalheDaExecucao({
  execucao: r,
  aoFechar,
}: {
  execucao: ExecucaoDeTarefa | null;
  aoFechar: () => void;
}) {
  const navegar = useNavegar();
  const itens = Object.entries(r?.summary ?? {});

  return (
    <Sheet
      aberto={!!r}
      aoFechar={aoFechar}
      titulo={r?.taskName ?? ''}
      descricao={
        r
          ? `${dataHora(r.startedAt)} · ${duracaoDe(r.durationMs)}${r.attempt > 1 ? ` · tentativa ${r.attempt}` : ''}`
          : undefined
      }
      largura="m"
    >
      {r && (
        <Stack gap={6}>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="t-legenda">Quem rodou</dt>
              <dd className="text-sm text-texto">
                {r.trigger === 'agendado' ? (
                  'O agendamento'
                ) : r.requestedBy ? (
                  <Elo onClick={() => navegar.usuario(r.requestedBy!)}>
                    {r.requestedByName ?? 'Conta'}
                  </Elo>
                ) : (
                  'Sistema'
                )}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="t-legenda">Estado</dt>
              <dd className="text-sm text-texto">
                {r.status === 'falhou' ? 'Falhou' : 'Concluída'}
                {r.dryRun ? ' (simulação: nada foi alterado)' : ''}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="t-legenda">Terminou</dt>
              <dd className="text-sm text-texto">{dataHora(r.finishedAt)}</dd>
            </div>
          </dl>

          {r.error && (
            <div
              role="alert"
              className="rounded-controle border border-erro/35 bg-erro/10 px-4 py-3 text-sm text-erro"
            >
              {r.error}
            </div>
          )}

          {itens.length > 0 && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                O que mudou
              </Text>
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
            </Stack>
          )}

          {r.warnings.length > 0 && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                Avisos
              </Text>
              <ul className="flex flex-col gap-1">
                {r.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-texto-suave">
                    {w}
                  </li>
                ))}
              </ul>
            </Stack>
          )}

          {r.sample.length > 0 && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                Dados afetados (amostra)
              </Text>
              <ul className="t-dado rolagem-discreta flex max-h-72 flex-col overflow-y-auto rounded-controle bg-sup-2 px-4 py-2 text-xs text-texto-suave">
                {r.sample.map((s, i) => (
                  <li key={i} className="break-all py-0.5">
                    {s}
                  </li>
                ))}
              </ul>
            </Stack>
          )}
        </Stack>
      )}
    </Sheet>
  );
}
