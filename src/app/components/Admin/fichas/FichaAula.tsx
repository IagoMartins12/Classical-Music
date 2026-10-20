'use client';

import type { ReactNode } from 'react';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { dataCurta, dataHora } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminQuery } from '@/app/hooks/admin/query';
import {
  NOME_DA_SITUACAO,
  NOME_DO_ESTADO_DA_AULA,
  NOME_DO_TIPO_DE_AULA,
  getAulaDoPortal,
} from '@/app/requests/admin/portal';

/**
 * A ficha de uma aula do portal: quando, quem, o que foi trabalhado, como foi
 * e as tarefas que saíram dela. Só leitura — a aula é do professor.
 */
export function FichaAula({
  aulaId,
  aoFechar,
}: {
  aulaId: string;
  aoFechar: () => void;
}) {
  const navegar = useNavegar();
  const q = useAdminQuery(adminKeys.list('portal', { aula: aulaId }), () =>
    getAulaDoPortal(aulaId)
  );
  const a = q.data;

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={a?.title ?? 'Aula'}
      descricao={
        a
          ? `${dataHora(a.scheduledAt)} · ${a.duration} min · ${NOME_DO_ESTADO_DA_AULA[a.status] ?? a.status}`
          : undefined
      }
      largura="m"
    >
      {!a ? (
        q.error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {q.error}
          </Text>
        ) : (
          <Row.Skeleton repetir={6} />
        )
      ) : (
        <Stack gap={6}>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Info rotulo="Professor">
              {a.professor.userId ? (
                <Elo onClick={() => navegar.usuario(a.professor.userId!)}>
                  {a.professor.nome}
                </Elo>
              ) : (
                '—'
              )}
            </Info>
            <Info rotulo="Aluno">
              {a.aluno.userId ? (
                <Elo onClick={() => navegar.usuario(a.aluno.userId!)}>
                  {a.aluno.nome}
                </Elo>
              ) : (
                '—'
              )}
            </Info>
            <Info rotulo="Tipo">
              {NOME_DO_TIPO_DE_AULA[a.type] ?? a.type}
              {a.isRecurring ? ' · recorrente' : ''}
            </Info>
            <Info rotulo="Local">{a.location ?? '—'}</Info>
            <Info rotulo="Presença">
              {a.studentPresent === null
                ? 'não registrada'
                : a.studentPresent
                  ? 'presente'
                  : 'faltou'}
              {a.punctuality ? ` · ${a.punctuality}` : ''}
            </Info>
            <Info rotulo="Engajamento e preparo">
              {a.engagement !== null || a.preparation !== null
                ? `${a.engagement ?? '—'}/5 · ${a.preparation ?? '—'}/5`
                : '—'}
            </Info>
            {a.cancelReason && (
              <Info rotulo="Por que foi cancelada">{a.cancelReason}</Info>
            )}
            {a.rescheduleReason && (
              <Info rotulo="Por que foi reagendada">
                {a.rescheduleReason}
                {a.rescheduledFrom
                  ? ` (era ${dataHora(a.rescheduledFrom)})`
                  : ''}
              </Info>
            )}
          </dl>

          {a.description && <Bloco titulo="Descrição">{a.description}</Bloco>}
          <Lista titulo="Objetivos" itens={a.objectives} />
          <Lista titulo="Repertório" itens={a.repertoire} />
          <Lista titulo="Temas" itens={a.topics} />
          <Lista titulo="Técnicas" itens={a.techniques} />
          {a.lessonSummary && (
            <Bloco titulo="Resumo da aula">{a.lessonSummary}</Bloco>
          )}
          <Lista titulo="O que melhorou" itens={a.improvements} />
          <Lista titulo="Desafios" itens={a.challenges} />
          {a.homework && <Bloco titulo="Para casa">{a.homework}</Bloco>}
          {a.studentFeedback && (
            <Bloco titulo="O que o aluno disse">{a.studentFeedback}</Bloco>
          )}

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              Tarefas desta aula
            </Text>
            {a.assignments.length === 0 ? (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhuma tarefa saiu desta aula.
              </Text>
            ) : (
              <ul className="flex flex-col">
                {a.assignments.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-baseline gap-3 border-b border-linha py-2 text-sm last:border-0"
                  >
                    <Elo
                      onClick={() => navegar.tarefa(t.id)}
                      className="min-w-0 flex-1 truncate"
                    >
                      {t.title}
                    </Elo>
                    <span className="t-legenda shrink-0">
                      {NOME_DA_SITUACAO[t.status] ?? t.status}
                      {t.dueDate ? ` · até ${dataCurta(t.dueDate)}` : ''}
                    </span>
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

export function Info({
  rotulo,
  children,
}: {
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd className="text-sm text-texto">{children}</dd>
    </div>
  );
}

export function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <Stack gap={1}>
      <Text papel="legenda" as="p">
        {titulo}
      </Text>
      <p className="whitespace-pre-line text-sm text-texto-suave">{children}</p>
    </Stack>
  );
}

export function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens?.length) return null;
  return (
    <Stack gap={1}>
      <Text papel="legenda" as="p">
        {titulo}
      </Text>
      <p className="text-sm text-texto-suave">{itens.join(' · ')}</p>
    </Stack>
  );
}
