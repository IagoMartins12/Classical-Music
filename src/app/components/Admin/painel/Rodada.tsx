'use client';

import type { ReactNode } from 'react';
import { PiCheckCircle, PiHourglass, PiWarningCircle } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { useJob } from '@/app/hooks/admin/useJobs';
import type { Fila, Job } from '@/app/requests/admin/jobs';
import { dataHora, relativo } from './formatos';

/**
 * O acompanhamento de uma rodada da fila (scraper, tarefa de manutenção):
 * em que pé está, a frase do que está fazendo agora, quanto levou, e — quando
 * termina — o que achou e o que fez.
 *
 * A tela antiga do scraper chamava rotas que a API não tem mais
 * (`/scrapers/:id/scrape`, `/scrapers/status/:id`), sem a sessão: o job
 * rodava no worker e a tela ficava parada em "Iniciando".
 */

export const NOME_DO_ESTADO: Record<string, string> = {
  waiting: 'Na fila',
  delayed: 'Agendada',
  active: 'Rodando',
  completed: 'Concluída',
  failed: 'Falhou',
  unknown: 'Sem notícia',
};

export function duracao(j: Pick<Job, 'processedAt' | 'finishedAt'>) {
  if (!j.processedAt) return null;
  const fim = j.finishedAt ? new Date(j.finishedAt) : new Date();
  const s = Math.max(
    0,
    Math.round((fim.getTime() - new Date(j.processedAt).getTime()) / 1000)
  );
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
}

/** Selo e frase do estado, para listas de rodadas. */
export function EstadoDaRodada({ job }: { job: Job }) {
  const icone =
    job.state === 'completed'
      ? PiCheckCircle
      : job.state === 'failed'
        ? PiWarningCircle
        : PiHourglass;
  return (
    <span
      className={cx(
        't-rotulo inline-flex items-center gap-1.5',
        job.state === 'failed'
          ? 'text-erro'
          : job.state === 'completed'
            ? 'text-texto'
            : 'text-texto-suave'
      )}
    >
      <Icon de={icone} tamanho="pp" />
      {NOME_DO_ESTADO[job.state] ?? job.state}
      {job.state === 'active' && job.progress
        ? ` · ${job.progress.percent}%`
        : ''}
    </span>
  );
}

export function BarraDeProgresso({ job }: { job: Job }) {
  const pct =
    job.state === 'completed' ? 100 : Math.min(100, job.progress?.percent ?? 0);
  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Andamento da rodada"
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--linha)]"
      >
        <div
          className={cx(
            'h-full rounded-full transition-[width] duration-500 ease-saida',
            job.state === 'failed' ? 'bg-erro' : 'bg-ouro'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="t-legenda" aria-live="polite">
        {job.state === 'waiting' || job.state === 'delayed'
          ? 'Esperando o worker pegar a rodada…'
          : job.state === 'failed'
            ? 'A rodada parou com erro.'
            : job.progress?.message
              ? job.progress.message
              : job.state === 'completed'
                ? 'Concluída.'
                : 'Rodando…'}
      </p>
    </div>
  );
}

export function AcompanhamentoDeRodada<R>({
  fila,
  jobId,
  titulo,
  aoFechar,
  resultado,
  rodape,
}: {
  fila: Fila;
  jobId: string | null;
  titulo: string;
  aoFechar: () => void;
  /** Como mostrar o que a rodada devolveu. */
  resultado: (r: R) => ReactNode;
  rodape?: ReactNode;
}) {
  const q = useJob<R>(fila, jobId);
  const j = q.data;

  return (
    <Sheet
      aberto={!!jobId}
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={
        j
          ? `${NOME_DO_ESTADO[j.state] ?? j.state}${j.requestedAt ? ` · pedida ${relativo(j.requestedAt)}` : ''}`
          : 'Consultando a fila…'
      }
      largura="g"
      rodape={rodape}
    >
      {!j ? (
        q.error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {q.error}
          </Text>
        ) : (
          <Text papel="rotulo" tom="suave" as="p">
            Consultando a fila…
          </Text>
        )
      ) : (
        <Stack gap={6}>
          <BarraDeProgresso job={j} />

          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-4">
            <Dado rotulo="Estado">
              <EstadoDaRodada job={j} />
            </Dado>
            <Dado rotulo="Começou">
              {j.processedAt ? dataHora(j.processedAt) : '—'}
            </Dado>
            <Dado rotulo="Terminou">
              {j.finishedAt ? dataHora(j.finishedAt) : '—'}
            </Dado>
            <Dado rotulo="Duração">{duracao(j) ?? '—'}</Dado>
            {j.attemptsMade > 1 && (
              <Dado rotulo="Tentativas">{j.attemptsMade}</Dado>
            )}
          </dl>

          {j.state === 'failed' && (
            <div
              role="alert"
              className="rounded-controle border border-erro/35 bg-erro/10 px-4 py-3 text-sm text-erro"
            >
              {j.failedReason ?? 'A rodada falhou sem dizer o motivo.'}
            </div>
          )}

          {j.state === 'completed' && j.result != null && (
            <Stack gap={3}>
              <Text papel="secao" as="h3">
                O que a rodada fez
              </Text>
              {resultado(j.result)}
            </Stack>
          )}
        </Stack>
      )}
    </Sheet>
  );
}

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd className="text-sm text-texto">{children}</dd>
    </div>
  );
}
