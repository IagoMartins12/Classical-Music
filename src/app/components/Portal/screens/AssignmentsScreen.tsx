'use client';

// As tarefas — esboço B (04/10/2026), com o andamento de cada tarefa em
// porcentagem. No telefone os números de cima e as fichas correm de lado.

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PiCheck, PiClipboardText, PiPlus, PiTimer } from 'react-icons/pi';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  useAssignments,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type {
  Assignment,
  AssignmentFilter,
  Role,
} from '@/app/requests/portal/api';
import { dayOf, firstName, today, when } from '../format';
import {
  assignmentState,
  priorityLabel,
  typeLabel,
} from '../assignment/assignmentText';
import {
  Empty,
  FilterChips,
  PageHeader,
  ProgressBar,
  ScreenError,
  ScreenLoading,
} from '../pieces';
import { usePortal } from '../PortalProvider';

const PAGE = 50;

export function AssignmentsScreen({
  role,
  initialId,
  create = false,
}: {
  role: Role;
  initialId?: string;
  create?: boolean;
}) {
  const { open } = usePortal();
  const params = useSearchParams();

  // Link direto (avisos, e-mails) abre a tarefa; `/create` abre a folha nova.
  useEffect(() => {
    if (initialId) open({ type: 'assignment', id: initialId });
    else if (create && role === 'teacher')
      open({
        type: 'new-assignment',
        studentId: params.get('student') ?? undefined,
        lessonId: params.get('lesson') ?? undefined,
      });
  }, [initialId, create]);

  const initial = params.get('status') as AssignmentFilter | null;
  const [filter, setFilter] = useState<AssignmentFilter>(
    initial ?? (role === 'teacher' ? 'AWAITING_FEEDBACK' : 'OPEN')
  );
  const [student, setStudent] = useState(params.get('student') ?? '');
  const [limit, setLimit] = useState(PAGE);
  const board = useTeacherDashboard(role === 'teacher');
  const students = board.data?.students ?? [];

  const query = useMemo(
    () => ({
      as: role,
      status: filter,
      studentId: student || undefined,
      order: (filter === 'COMPLETED' || filter === 'AWAITING_FEEDBACK'
        ? 'desc'
        : 'asc') as 'asc' | 'desc',
      limit,
    }),
    [role, filter, student, limit]
  );
  const list = useAssignments(query);
  const stats = list.data?.stats;
  const items = list.data?.assignments ?? [];
  const total = list.data?.pagination.total ?? 0;

  const open_ = stats ? stats.total - stats.completed : 0;
  const deliveryRate =
    stats && stats.total
      ? Math.round((stats.completed / stats.total) * 100)
      : null;
  const numbers: Array<[string, string]> = stats
    ? role === 'teacher'
      ? [
          ['Esperando retorno', String(stats.awaitingFeedback)],
          ['Abertas', String(open_)],
          ['Atrasadas', String(stats.overdue)],
          ['Entregues', deliveryRate === null ? '—' : `${deliveryRate}%`],
        ]
      : [
          ['Abertas', String(open_)],
          ['Atrasadas', String(stats.overdue)],
          ['Entregues', String(stats.completed)],
          ['Taxa de entrega', deliveryRate === null ? '—' : `${deliveryRate}%`],
        ]
    : [];

  const filters: Array<[AssignmentFilter, string, number?]> = [
    ...(role === 'teacher'
      ? ([
          ['AWAITING_FEEDBACK', 'Esperando retorno', stats?.awaitingFeedback],
        ] as Array<[AssignmentFilter, string, number?]>)
      : []),
    ['OPEN', 'Abertas', stats ? open_ : undefined],
    ['OVERDUE', 'Atrasadas', stats?.overdue],
    ['COMPLETED', 'Entregues'],
  ];

  return (
    <>
      <PageHeader
        title="Tarefas"
        description={
          stats
            ? role === 'teacher'
              ? `${stats.awaitingFeedback} ${stats.awaitingFeedback === 1 ? 'entrega espera' : 'entregas esperam'} seu retorno · ${stats.overdue} ${stats.overdue === 1 ? 'atrasada' : 'atrasadas'}.`
              : `${open_} ${open_ === 1 ? 'aberta' : 'abertas'}, ${stats.overdue} ${stats.overdue === 1 ? 'atrasada' : 'atrasadas'}. Marque o andamento e entregue por aqui.`
            : undefined
        }
        actions={
          role === 'teacher' ? (
            <Button
              variante="primario"
              icone={PiPlus}
              onClick={() =>
                open({
                  type: 'new-assignment',
                  studentId: student || undefined,
                })
              }
            >
              Nova tarefa
            </Button>
          ) : (
            <Button
              variante="primario"
              icone={PiTimer}
              onClick={() => open({ type: 'practice' })}
            >
              Registrar prática
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-8">
        {numbers.length > 0 && (
          <dl className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:rounded-card sm:bg-sup-2 sm:p-5">
            {numbers.map(([label, value]) => (
              <div
                key={label}
                className="flex min-w-[9.5rem] shrink-0 snap-start flex-col gap-1 rounded-card bg-sup-2 p-4 sm:min-w-0 sm:bg-transparent sm:p-0"
              >
                <dt className="t-legenda">{label}</dt>
                <dd className="font-display text-[1.75rem] leading-none">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <FilterChips
            value={filter}
            onChange={(f) => (setFilter(f), setLimit(PAGE))}
            options={filters}
            label="Quais tarefas"
          />
          {role === 'teacher' && students.length > 1 && (
            <Field.Selecao
              label="Aluno"
              rotuloOculto
              value={student}
              onChange={(e) => (setStudent(e.target.value), setLimit(PAGE))}
              className="md:w-56"
            >
              <option value="">Todos os alunos</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name}
                </option>
              ))}
            </Field.Selecao>
          )}
        </div>

        {list.isPending ? (
          <ScreenLoading rows={5} label="Carregando as tarefas" />
        ) : list.error ? (
          <ScreenError
            message={errorText(list.error)}
            onRetry={() => list.refetch()}
          />
        ) : items.length === 0 ? (
          <Empty
            icone={PiClipboardText}
            titulo={
              filter === 'AWAITING_FEEDBACK'
                ? 'Nenhuma entrega esperando você'
                : filter === 'OVERDUE'
                  ? 'Nenhuma tarefa atrasada'
                  : filter === 'COMPLETED'
                    ? 'Nada entregue ainda'
                    : 'Nenhuma tarefa aberta'
            }
            descricao={
              role === 'teacher' && filter === 'OPEN'
                ? 'Passe uma tarefa daqui ou ao fechar uma aula.'
                : undefined
            }
          />
        ) : (
          <ul
            data-ajuda="lista"
            className={cx(
              'transition-opacity',
              list.isFetching && 'opacity-70'
            )}
          >
            {items.map((a) => (
              <li key={a.id}>
                <AssignmentLine
                  a={a}
                  role={role}
                  onOpen={() => open({ type: 'assignment', id: a.id })}
                />
              </li>
            ))}
          </ul>
        )}
        {total > items.length && (
          <Button
            className="self-start"
            carregando={list.isFetching}
            disabled={limit >= 100}
            onClick={() => setLimit((n) => Math.min(100, n + PAGE))}
          >
            {limit >= 100
              ? `Mostrando 100 de ${total}: escolha um aluno`
              : 'Mostrar mais'}
          </Button>
        )}
      </div>
    </>
  );
}

function AssignmentLine({
  a,
  role,
  onOpen,
}: {
  a: Assignment;
  role: Role;
  onOpen: () => void;
}) {
  const state = assignmentState(a);
  const who =
    role === 'teacher'
      ? api.nameOf(a.student)
      : `com ${firstName(api.nameOf(a.lesson.teacher))}`;
  const progress = a.isCompleted ? 100 : (a.progress ?? 0);
  const due = a.dueDate ? dayOf(a.dueDate) : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/tarefa grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 border-b border-linha py-5 text-left"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-display text-xl leading-tight transition-colors group-hover/tarefa:text-ouro-texto">
          {a.title}
        </span>
        <span className="t-legenda">
          {typeLabel(a.type)} · prioridade {priorityLabel(a.priority)} · {who}
        </span>
      </span>
      <span className="shrink-0">
        {state === 'awaiting' ? (
          <Badge estado="ouro">
            {role === 'teacher' ? 'Esperando retorno' : 'Entregue'}
          </Badge>
        ) : state === 'overdue' ? (
          <Badge estado="atencao">Atrasada</Badge>
        ) : state === 'done' ? (
          <span className="inline-flex items-center gap-1 text-[0.8125rem] text-texto-suave">
            <Icon de={PiCheck} tamanho="pp" /> Concluída
          </span>
        ) : (
          <span className="t-legenda first-letter:uppercase">
            {due
              ? due === today()
                ? 'Para hoje'
                : `Até ${when(due)}`
              : 'Sem prazo'}
          </span>
        )}
      </span>
      <span className="col-span-2 flex max-w-md items-center gap-3">
        <ProgressBar
          value={progress}
          label={`Andamento de ${a.title}`}
          className="flex-1"
        />
        <span className="t-dado w-10 text-right text-sm text-texto-suave">
          {progress}%
        </span>
      </span>
    </button>
  );
}
