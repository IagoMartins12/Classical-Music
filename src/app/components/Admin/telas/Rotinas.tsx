'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlay, PiStop } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Erro } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  dataHora,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import { errorMessage } from '@/app/hooks/admin/query';
import {
  estaAtiva,
  useDispararRotina,
  useExecucao,
  useHistorico,
  usePararExecucao,
  useRotinas,
} from '@/app/hooks/admin/useRotinas';
import type {
  EstadoDaExecucao,
  Execucao,
  Rotina,
} from '@/app/requests/admin/rotinas';

/**
 * Rotinas do acervo: as correções em lote do catálogo (épocas, nacionalidades,
 * dificuldades, edições do IMSLP…), que antes só rodavam no terminal.
 *
 * Cada rotina **simula primeiro**: "Simular" conta o que mudaria e não grava
 * nada; "Gravar" faz de verdade. As que juntam ou apagam registros pedem uma
 * confirmação a mais. Roda no worker, uma por vez; esta tela mostra se está na
 * fila, rodando (com a barra e o log), se deu certo ou o que falhou, e deixa
 * parar uma rotina longa.
 */

const GRUPOS: Record<Rotina['group'], string> = {
  compositores: 'Compositores',
  obras: 'Obras',
  partituras: 'Partituras',
  colecoes: 'Coleções',
  blog: 'Blog',
};

const NOME_DO_ESTADO: Record<EstadoDaExecucao, string> = {
  queued: 'Na fila',
  running: 'Rodando',
  ok: 'Concluída',
  failed: 'Falhou',
  stopped: 'Parada',
  interrupted: 'Interrompida',
};

const TOM: Record<
  EstadoDaExecucao,
  'neutro' | 'ok' | 'atencao' | 'erro' | 'ouro'
> = {
  queued: 'neutro',
  running: 'ouro',
  ok: 'ok',
  failed: 'erro',
  stopped: 'atencao',
  interrupted: 'erro',
};

const percentual = (e: Execucao) =>
  e.status === 'ok'
    ? 100
    : e.progress.total
      ? Math.min(100, Math.round((e.progress.done / e.progress.total) * 100))
      : null;

function duracao(e: Execucao) {
  if (!e.startedAt) return null;
  const fim = e.finishedAt ? new Date(e.finishedAt) : new Date();
  const s = Math.max(
    0,
    Math.round((fim.getTime() - new Date(e.startedAt).getTime()) / 1000)
  );
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${s % 60} s`;
  return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`;
}

function Selo({ e }: { e: Execucao }) {
  const pct = percentual(e);
  return (
    <Badge estado={TOM[e.status]}>
      {NOME_DO_ESTADO[e.status]}
      {e.status === 'running' && pct !== null ? ` · ${pct}%` : ''}
      {e.status !== 'queued' && !e.apply && e.status !== 'running'
        ? ' · simulação'
        : ''}
    </Badge>
  );
}

export default function Rotinas() {
  const lista = useRotinas();
  const [aberta, setAberta] = useState<string | null>(null);
  const rotinas = lista.data ?? [];
  const atual = rotinas.find((r) => r.id === aberta) ?? null;
  const emAndamento = rotinas.find((r) => r.active);

  const grupos = (Object.keys(GRUPOS) as Rotina['group'][])
    .map((g) => ({ g, itens: rotinas.filter((r) => r.group === g) }))
    .filter((x) => x.itens.length);

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Rotinas do acervo"
        descricao="Correções em lote do catálogo. Simule primeiro: nada é gravado até você pedir. Uma rotina por vez."
        aoAtualizar={lista.refetch}
        atualizando={lista.fetching}
      />

      {emAndamento?.active && (
        <button
          type="button"
          onClick={() => setAberta(emAndamento.id)}
          className="flex flex-col gap-2 rounded-card tint-ouro p-4 text-left text-ouro-na-tinta"
        >
          <span className="font-medium">Em andamento: {emAndamento.name}</span>
          <Barra e={emAndamento.active} />
        </button>
      )}

      {lista.error ? (
        <Erro
          titulo="Não foi possível carregar as rotinas"
          descricao={lista.error}
          acao={
            <Button tamanho="p" onClick={() => void lista.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : lista.loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        grupos.map(({ g, itens }) => (
          <Stack key={g} gap={3}>
            <Text papel="titulo" as="h2">
              {GRUPOS[g]}
            </Text>
            <div className="flex flex-col">
              {itens.map((r) => {
                const e = r.active ?? r.last;
                return (
                  <Row
                    key={r.id}
                    clicavel
                    onClick={() => setAberta(r.id)}
                    titulo={r.name}
                    detalhe={
                      e
                        ? `${e.apply ? 'Gravou' : 'Simulou'} ${relativo(e.finishedAt ?? e.queuedAt)}`
                        : 'Nunca rodou'
                    }
                    valor={e ? <Selo e={e} /> : <Badge>Nunca rodou</Badge>}
                  />
                );
              })}
            </div>
          </Stack>
        ))
      )}

      <Painel
        rotina={atual}
        outraAtiva={!!emAndamento && emAndamento.id !== atual?.id}
        aoFechar={() => setAberta(null)}
      />
    </Stack>
  );
}

function Barra({ e }: { e: Execucao }) {
  const pct = percentual(e);
  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
        aria-label="Andamento da rotina"
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--linha)]"
      >
        <div
          className={cx(
            'h-full rounded-full bg-ouro transition-[width] duration-500',
            pct === null && 'w-1/3 animate-pulse'
          )}
          style={pct === null ? undefined : { width: `${pct}%` }}
        />
      </div>
      <p className="t-legenda" aria-live="polite">
        {e.status === 'queued'
          ? 'Na fila, esperando o worker pegar…'
          : [
              pct !== null
                ? `${numero(e.progress.done)} de ${numero(e.progress.total)}`
                : e.progress.done
                  ? numero(e.progress.done)
                  : null,
              e.progress.message,
            ]
              .filter(Boolean)
              .join(' · ') || 'Rodando…'}
      </p>
    </div>
  );
}

function Painel({
  rotina,
  outraAtiva,
  aoFechar,
}: {
  rotina: Rotina | null;
  outraAtiva: boolean;
  aoFechar: () => void;
}) {
  const disparar = useDispararRotina();
  const parar = usePararExecucao();
  const historico = useHistorico(rotina?.id ?? null);
  const [verId, setVerId] = useState<string | null>(null);
  const [limit, setLimit] = useState('');
  const [pause, setPause] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [pedindo, setPedindo] = useState(false);

  // Ao trocar de rotina, volta para a execução mais recente dela.
  const id = rotina?.id;
  useEffect(() => {
    setVerId(null);
    setLimit('');
    setPause('');
  }, [id]);

  const alvoId = verId ?? rotina?.active?.id ?? rotina?.last?.id ?? null;
  const exec = useExecucao(alvoId);
  const e = exec.data ?? null;
  const ativa = rotina?.active ?? null;

  const logRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [e?.log?.length]);

  const rodar = async (apply: boolean, confirm = false) => {
    if (!rotina) return;
    setPedindo(true);
    try {
      const novo = await disparar.mutateAsync([
        rotina.id,
        {
          apply,
          confirm,
          limit: limit.trim() ? Number(limit) : undefined,
          pause: pause.trim() ? Number(pause) : undefined,
        },
      ]);
      setVerId(novo.id);
      toast.success(
        apply ? 'Gravação na fila.' : 'Simulação na fila. Nada será gravado.'
      );
    } catch (erro) {
      toast.error(errorMessage(erro));
    } finally {
      setPedindo(false);
      setConfirmando(false);
    }
  };

  const pedirParada = async () => {
    if (!ativa) return;
    try {
      await parar.mutateAsync([ativa.id]);
      toast.success('Pedido de parada enviado. Ela encerra no próximo passo.');
    } catch (erro) {
      toast.error(errorMessage(erro));
    }
  };

  return (
    <>
      <Sheet
        aberto={!!rotina}
        aoFechar={aoFechar}
        titulo={rotina?.name ?? ''}
        descricao={rotina ? GRUPOS[rotina.group] : undefined}
        largura="g"
        rodape={
          rotina ? (
            <div className="flex w-full flex-wrap items-center justify-end gap-2">
              {ativa ? (
                <Button
                  icone={PiStop}
                  onClick={() => void pedirParada()}
                  disabled={ativa.stopRequested}
                >
                  {ativa.stopRequested ? 'Parando…' : 'Parar'}
                </Button>
              ) : (
                <>
                  <Button
                    icone={PiPlay}
                    onClick={() => void rodar(false)}
                    carregando={pedindo}
                    disabled={outraAtiva}
                  >
                    Simular
                  </Button>
                  <Button
                    variante={rotina.destructive ? 'perigo' : 'primario'}
                    onClick={() =>
                      rotina.destructive
                        ? setConfirmando(true)
                        : void rodar(true)
                    }
                    disabled={pedindo || outraAtiva}
                  >
                    Gravar
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      >
        {rotina && (
          <Stack gap={6}>
            <p className="text-[0.9375rem] leading-relaxed text-texto-suave">
              {rotina.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {rotina.slow && <Badge>Pode levar horas</Badge>}
              {rotina.external && <Badge>Consulta site externo</Badge>}
              {rotina.destructive && (
                <Badge estado="atencao">Junta ou apaga registros</Badge>
              )}
            </div>
            {outraAtiva && (
              <p role="status" className="t-rotulo text-texto-suave">
                Há outra rotina em andamento. Espere terminar para disparar
                esta.
              </p>
            )}

            {rotina.params.length > 0 && !ativa && (
              <div className="grid gap-4 sm:grid-cols-2">
                {rotina.params.map((p) => (
                  <Field
                    key={p.key}
                    label={p.label}
                    ajuda={p.help}
                    inputMode="numeric"
                    placeholder={p.placeholder}
                    value={p.key === 'limit' ? limit : pause}
                    onChange={(ev) =>
                      (p.key === 'limit' ? setLimit : setPause)(
                        ev.target.value.replace(/\D/g, '')
                      )
                    }
                  />
                ))}
              </div>
            )}

            <Andamento e={e} carregando={exec.loading} logRef={logRef} />

            {(historico.data?.length ?? 0) > 1 && (
              <Stack gap={2}>
                <Text papel="titulo" as="h3">
                  Execuções anteriores
                </Text>
                <div className="flex flex-col">
                  {historico.data?.map((h) => (
                    <Row
                      key={h.id}
                      clicavel
                      onClick={() => setVerId(h.id)}
                      titulo={dataHora(h.queuedAt)}
                      detalhe={[h.apply ? 'Gravou' : 'Simulou', duracao(h)]
                        .filter(Boolean)
                        .join(' · ')}
                      valor={<Selo e={h} />}
                      className={cx(h.id === alvoId && 'bg-sup-2')}
                    />
                  ))}
                </div>
              </Stack>
            )}
          </Stack>
        )}
      </Sheet>

      <ConfirmModal
        isOpen={confirmando}
        onClose={() => setConfirmando(false)}
        onConfirm={() => rodar(true, true)}
        type="danger"
        title={`Gravar “${rotina?.name ?? ''}”?`}
        message="Esta rotina junta ou apaga registros e não dá para desfazer pelo painel. Rode a simulação antes e leia o resultado. Tire um backup se houver dúvida."
        confirmText="Gravar mesmo assim"
        cancelText="Voltar"
      />
    </>
  );
}

function Andamento({
  e,
  carregando,
  logRef,
}: {
  e: Execucao | null;
  carregando: boolean;
  logRef: React.RefObject<HTMLPreElement | null>;
}) {
  if (!e)
    return carregando ? (
      <Skeleton className="h-32 w-full" />
    ) : (
      <p className="t-rotulo text-texto-suave">
        Esta rotina ainda não rodou. Comece por “Simular”: ela só conta o que
        mudaria.
      </p>
    );

  const resumo = Object.entries(e.summary ?? {});
  return (
    <Stack gap={4}>
      <div className="flex flex-wrap items-center gap-3">
        <Selo e={e} />
        <span className="t-legenda">
          {[
            e.apply ? 'Gravando' : 'Simulação',
            `pedida ${relativo(e.queuedAt)}`,
            duracao(e) && `duração ${duracao(e)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>

      {estaAtiva(e) && <Barra e={e} />}

      {e.status === 'interrupted' && (
        <p role="alert" className="t-rotulo text-erro">
          O worker parou de responder no meio. O que já foi gravado fica; rode
          de novo para continuar.
        </p>
      )}
      {e.error && (
        <p role="alert" className="t-rotulo text-erro">
          {e.error}
        </p>
      )}

      {resumo.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {resumo.map(([k, v]) => (
            <div key={k} className="flex min-w-0 flex-col">
              <dt className="t-legenda">{k}</dt>
              <dd className="font-display text-[1.375rem]">
                {typeof v === 'number' ? numero(v) : v}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {e.warnings.length > 0 && (
        <Stack gap={1}>
          <Text papel="rotulo" as="p">
            Avisos
          </Text>
          <ul className="t-legenda list-disc pl-5">
            {e.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Stack>
      )}
      {e.sample.length > 0 && (
        <Stack gap={1}>
          <Text papel="rotulo" as="p">
            Exemplos
          </Text>
          <ul className="t-legenda list-disc pl-5">
            {e.sample.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Stack>
      )}

      {(e.log?.length ?? 0) > 0 && (
        <Stack gap={1}>
          <Text papel="rotulo" as="p">
            Log
          </Text>
          <pre
            ref={logRef}
            tabIndex={0}
            className="max-h-72 overflow-auto rounded-controle bg-sup-2 p-3 text-[0.75rem] leading-relaxed whitespace-pre-wrap"
          >
            {e.log?.join('\n')}
          </pre>
        </Stack>
      )}
      <p className="t-legenda">
        {e.finishedAt
          ? `Terminou ${relativo(e.finishedAt)}`
          : e.heartbeatAt
            ? `Último sinal do worker ${relativo(e.heartbeatAt)}`
            : null}
      </p>
    </Stack>
  );
}
