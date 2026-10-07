'use client';

// Os alunos — escolha de 04/10/2026: a tabela do esboço A dentro da
// composição do B (topo animado, abas), e o gráfico de estudo do C num
// chevron por aluno, em todos os tamanhos. No tablet e no telefone a linha
// vira o índice do B, com o mesmo chevron.

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { PiCaretDown, PiEnvelopeSimple, PiUserPlus } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  usePortalMutation,
  useStudents,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type { StudentRow } from '@/app/requests/portal/api';
import {
  dayOf,
  duration,
  firstName,
  shortDateYear,
  spokenTime,
  when,
} from '../format';
import { PLAN_NAME } from '../plans';
import {
  Avatar,
  Empty,
  PageHeader,
  ProgressBar,
  ScreenError,
  ScreenLoading,
  SearchBox,
} from '../pieces';
import { usePortal } from '../PortalProvider';
import { StudentPractice } from '../student/StudentPractice';
import { useDebounced } from '../useDebounced';

type Tab = 'active' | 'invites' | 'ended';

const LEVEL: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

const nameOfRow = (r: StudentRow) =>
  [r.student.user.firstName, r.student.user.lastName]
    .filter(Boolean)
    .join(' ') ||
  r.student.user.email ||
  'Aluno';

export function StudentsScreen() {
  const { open } = usePortal();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    params.get('tab') === 'invites' ? 'invites' : 'active'
  );
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim(), 300);
  const [expanded, setExpanded] = useState<string | null>(null);
  const plan = useTeacherDashboard().data?.plan;

  useEffect(() => {
    if (params.get('invite') === '1') open({ type: 'invite' });
  }, []);

  const active = useStudents({
    inviteStatus: 'ACCEPTED',
    limit: 100,
    q: q || undefined,
  });
  const invites = useStudents({
    inviteStatus: 'PENDING',
    limit: 100,
    q: q || undefined,
  });
  const ended = useStudents(
    {
      inviteStatus: 'ACCEPTED',
      onlyActive: false,
      limit: 100,
      q: q || undefined,
    },
    tab === 'ended'
  );

  const rows = useMemo(() => {
    if (tab === 'active') return active.data?.students ?? [];
    if (tab === 'invites') return invites.data?.students ?? [];
    return (ended.data?.students ?? []).filter((r) => !r.isActive);
  }, [tab, active.data, invites.data, ended.data]);
  const current =
    tab === 'active' ? active : tab === 'invites' ? invites : ended;

  const activeCount = active.data?.pagination.total ?? 0;
  const inviteCount = invites.data?.pagination.total ?? 0;
  const planText = plan
    ? plan.maxStudents !== null
      ? `${plan.activeStudents} de ${plan.maxStudents} vagas do plano ${PLAN_NAME[plan.name] ?? plan.name}.`
      : `Plano ${PLAN_NAME[plan.name] ?? plan.name}, sem limite de alunos.`
    : '';

  return (
    <>
      <PageHeader
        title="Alunos"
        description={`${planText} Convite pendente não ocupa vaga; vínculo encerrado guarda o histórico.`.trim()}
        actions={
          <>
            <Button
              variante="primario"
              icone={PiUserPlus}
              onClick={() => open({ type: 'invite' })}
            >
              Convidar aluno
            </Button>
            {activeCount > 0 && (
              <Button
                icone={PiEnvelopeSimple}
                onClick={() => open({ type: 'announce' })}
              >
                Avisar a turma
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span
            data-ajuda="abas"
            className="max-w-full overflow-x-auto [scrollbar-width:none]"
          >
            <Abas rotulo="Quais alunos">
              <Aba ativa={tab === 'active'} onClick={() => setTab('active')}>
                Ativos · {activeCount}
              </Aba>
              <Aba ativa={tab === 'invites'} onClick={() => setTab('invites')}>
                Convites · {inviteCount}
              </Aba>
              <Aba ativa={tab === 'ended'} onClick={() => setTab('ended')}>
                Encerrados
              </Aba>
            </Abas>
          </span>
          <SearchBox
            value={search}
            onChange={setSearch}
            label="Buscar aluno"
            className="w-full sm:ml-auto sm:w-64"
          />
        </div>

        {current.isPending ? (
          <ScreenLoading rows={4} label="Carregando os alunos" />
        ) : current.error ? (
          <ScreenError
            message={errorText(current.error)}
            onRetry={() => current.refetch()}
          />
        ) : rows.length === 0 ? (
          <Empty
            icone={tab === 'active' ? PiUserPlus : undefined}
            titulo={
              q
                ? 'Ninguém com esse nome'
                : tab === 'active'
                  ? 'Nenhum aluno ainda'
                  : tab === 'invites'
                    ? 'Nenhum convite pendente'
                    : 'Nenhum vínculo encerrado'
            }
            descricao={
              q
                ? 'Troque a busca ou a aba.'
                : tab === 'active'
                  ? 'Convide pelo nome ou e-mail. Quando o aluno aceita, aulas, tarefas e calendário passam a ser de vocês dois.'
                  : undefined
            }
            acao={
              tab === 'active' && !q ? (
                <Button onClick={() => open({ type: 'invite' })}>
                  Convidar aluno
                </Button>
              ) : undefined
            }
          />
        ) : tab === 'invites' ? (
          <InviteList rows={rows} />
        ) : (
          <div
            data-ajuda="lista"
            className={cx(
              'transition-opacity',
              current.isFetching && 'opacity-70'
            )}
          >
            <Table
              rows={rows}
              ended={tab === 'ended'}
              expanded={expanded}
              onToggle={(id) => setExpanded((e) => (e === id ? null : id))}
            />
          </div>
        )}
      </div>
    </>
  );
}

function Chevron({
  open,
  name,
  onClick,
}: {
  open: boolean;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={
        open ? `Fechar o estudo de ${name}` : `Ver o estudo de ${name}`
      }
      className="grid h-10 w-10 shrink-0 place-items-center rounded-controle text-texto-suave transition-colors hover:bg-sup-2 hover:text-texto [@media(pointer:coarse)]:h-[var(--alvo)] [@media(pointer:coarse)]:w-[var(--alvo)]"
    >
      <Icon
        de={PiCaretDown}
        className={cx(
          'transition-transform duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
          open && 'rotate-180'
        )}
      />
    </button>
  );
}

function Practice({ s }: { s: NonNullable<StudentRow['stats']> }) {
  if (!s.practiceGoalMinutes)
    return (
      <span className="t-dado text-sm text-texto-suave">
        {s.practiceMinutes7d ? duration(s.practiceMinutes7d) : '—'}
      </span>
    );
  return (
    <span className="flex items-center gap-3">
      <span className="t-dado w-12 text-sm text-texto-suave">
        {duration(s.practiceMinutes7d)}
      </span>
      <ProgressBar
        value={(s.practiceMinutes7d / s.practiceGoalMinutes) * 100}
        label="Prática da semana"
        className="w-20"
      />
    </span>
  );
}

/** A tabela do A no computador; o índice do B (linhas grandes) abaixo de `lg`. */
function Table({
  rows,
  ended,
  expanded,
  onToggle,
}: {
  rows: StudentRow[];
  ended: boolean;
  expanded: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <table className="w-full text-left text-[0.9375rem] max-lg:hidden">
        <thead className="text-xs text-texto-fraco">
          <tr className="border-b border-linha">
            <th className="py-2 pr-4 font-normal">Aluno</th>
            <th className="py-2 pr-4 font-normal">Desde</th>
            <th className="py-2 pr-4 font-normal">
              {ended ? 'Encerrado' : 'Próxima aula'}
            </th>
            <th className="py-2 pr-4 font-normal">Presença</th>
            <th className="py-2 pr-4 font-normal">Prática, 7 dias</th>
            <th className="py-2 pr-4 font-normal">Tarefas abertas</th>
            <th className="py-2 font-normal">
              <span className="sr-only">Estudo</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const name = nameOfRow(r);
            const s = r.stats;
            const isOpen = expanded === r.relationshipId;
            return (
              <Fragment key={r.relationshipId}>
                <tr
                  className={cx(
                    'border-b border-linha transition-colors hover:bg-sup-2/60',
                    isOpen && 'bg-sup-2/60'
                  )}
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/teacher/students/${r.student.id}`}
                      className="group/aluno flex items-center gap-3"
                    >
                      <Avatar
                        name={name}
                        image={r.student.user.image}
                        size="p"
                      />
                      <span className="flex flex-col">
                        <span className="font-display text-lg leading-tight group-hover/aluno:text-ouro-texto">
                          {name}
                        </span>
                        <span className="t-legenda">
                          {[
                            r.student.level && LEVEL[r.student.level],
                            r.student.mainInstrument,
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'Aluno'}
                        </span>
                        {r.student.user.email && (
                          <span className="t-legenda break-all text-texto-fraco">
                            {r.student.user.email}
                          </span>
                        )}
                      </span>
                    </Link>
                  </td>
                  <td className="t-dado py-3 pr-4 text-sm text-texto-suave">
                    {shortDateYear(dayOf(r.startDate))}
                  </td>
                  <td className="py-3 pr-4 text-texto-suave first-letter:uppercase">
                    {ended
                      ? r.endDate
                        ? shortDateYear(dayOf(r.endDate))
                        : '—'
                      : s?.nextLessonAt
                        ? `${when(dayOf(s.nextLessonAt))}, ${spokenTime(s.nextLessonAt)}`
                        : 'Sem aula marcada'}
                  </td>
                  <td className="t-dado py-3 pr-4 text-sm text-texto-suave">
                    {s?.attendanceRate === null || !s
                      ? 'Sem dado'
                      : `${s.attendanceRate}%`}
                  </td>
                  <td className="py-3 pr-4">{s ? <Practice s={s} /> : '—'}</td>
                  <td className="t-dado py-3 pr-4 text-sm text-texto-suave">
                    {s?.openAssignments ? (
                      <>
                        {s.openAssignments}
                        {s.overdueAssignments ? (
                          <span className="text-atencao">
                            {' '}
                            · {s.overdueAssignments} atrasada
                            {s.overdueAssignments > 1 ? 's' : ''}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <Chevron
                      open={isOpen}
                      name={firstName(name)}
                      onClick={() => onToggle(r.relationshipId)}
                    />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="border-b border-linha bg-sup-2/40">
                    <td colSpan={7} className="entra px-4 py-5">
                      <StudentPractice studentId={r.student.id} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      <ul className="lg:hidden">
        {rows.map((r) => {
          const name = nameOfRow(r);
          const s = r.stats;
          const isOpen = expanded === r.relationshipId;
          return (
            <li key={r.relationshipId} className="border-b border-linha">
              <div className="flex items-center gap-4 py-5">
                <Link
                  href={`/teacher/students/${r.student.id}`}
                  className="group/aluno flex min-w-0 flex-1 flex-col gap-1.5"
                >
                  <span className="truncate font-display text-[1.5rem] leading-tight transition-colors group-hover/aluno:text-ouro-texto">
                    {name}
                  </span>
                  <span className="t-rotulo text-texto-suave first-letter:uppercase">
                    {[
                      r.student.level && LEVEL[r.student.level],
                      `desde ${shortDateYear(dayOf(r.startDate))}`,
                      !ended && s?.nextLessonAt
                        ? `próxima ${when(dayOf(s.nextLessonAt))}, ${spokenTime(s.nextLessonAt)}`
                        : null,
                      ended && r.endDate
                        ? `encerrado em ${shortDateYear(dayOf(r.endDate))}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {r.student.user.email && (
                    <span className="t-legenda break-all">
                      {r.student.user.email}
                    </span>
                  )}
                  {s && (
                    <span className="text-sm text-texto-fraco">
                      Presença{' '}
                      {s.attendanceRate === null
                        ? 'sem dado'
                        : `${s.attendanceRate}%`}{' '}
                      · {s.openAssignments}{' '}
                      {s.openAssignments === 1
                        ? 'tarefa aberta'
                        : 'tarefas abertas'}
                    </span>
                  )}
                </Link>
                {s && s.practiceGoalMinutes ? (
                  <span className="flex w-28 flex-col items-end gap-1.5 max-sm:hidden">
                    <span className="t-dado text-sm text-texto-suave">
                      {duration(s.practiceMinutes7d)} de{' '}
                      {duration(s.practiceGoalMinutes)}
                    </span>
                    <ProgressBar
                      value={
                        (s.practiceMinutes7d / s.practiceGoalMinutes) * 100
                      }
                      label={`Prática de ${firstName(name)}`}
                      className="w-full"
                    />
                  </span>
                ) : null}
                <Chevron
                  open={isOpen}
                  name={firstName(name)}
                  onClick={() => onToggle(r.relationshipId)}
                />
              </div>
              {isOpen && (
                <div className="entra pb-6">
                  <StudentPractice studentId={r.student.id} compact />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function InviteList({ rows }: { rows: StudentRow[] }) {
  const [cancel, setCancel] = useState<StudentRow | null>(null);
  const resend = usePortalMutation((id: string) => api.resendInvite(id), {
    success: 'Convite reenviado.',
  });
  const end = usePortalMutation((id: string) => api.endRelationship(id), {
    success: 'Convite cancelado.',
    onSuccess: () => setCancel(null),
  });
  return (
    <>
      <ul data-ajuda="lista">
        {rows.map((r) => {
          const name = nameOfRow(r);
          return (
            <li
              key={r.relationshipId}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-linha py-5"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar name={name} image={r.student.user.image} />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-display text-xl leading-tight text-texto-suave">
                    {name}
                  </span>
                  <span className="t-legenda">
                    Convite enviado em {shortDateYear(dayOf(r.startDate))} ·{' '}
                    {r.student.user.email}
                  </span>
                </span>
              </span>
              <span className="flex gap-2">
                <Button variante="fantasma" onClick={() => setCancel(r)}>
                  Cancelar convite
                </Button>
                <Button
                  carregando={
                    resend.isPending && resend.variables === r.relationshipId
                  }
                  onClick={() => resend.mutate(r.relationshipId)}
                >
                  Reenviar
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
      <ConfirmModal
        isOpen={cancel !== null}
        onClose={() => setCancel(null)}
        onConfirm={() => {
          if (cancel) end.mutate(cancel.relationshipId);
        }}
        isLoading={end.isPending}
        type="warning"
        title="Cancelar este convite?"
        message={
          cancel
            ? `O link enviado a ${nameOfRow(cancel)} para de funcionar. Dá para convidar de novo depois.`
            : ''
        }
        confirmText="Cancelar convite"
        cancelText="Voltar"
      />
    </>
  );
}
