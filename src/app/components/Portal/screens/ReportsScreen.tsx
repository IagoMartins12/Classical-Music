'use client';

// Relatórios — esboço B em todos os tamanhos (04/10/2026).
// Professor: os próximos relatórios num carrossel (quem está para receber e
// quem nunca recebeu), os dois tipos (só seu / compartilhado), filtro por
// período e por aluno. Aluno: os relatórios que os professores
// compartilharam.

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PiChartLineUp } from 'react-icons/pi';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  useReports,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type {
  ReportSummary,
  ReportVisibility,
  Role,
} from '@/app/requests/portal/api';
import {
  addDays,
  ago,
  dayOf,
  daysBetween,
  firstName,
  shortDateYear,
  startOfDay,
  today,
} from '../format';
import {
  Empty,
  FilterChips,
  PageHeader,
  ScreenError,
  ScreenLoading,
  Section,
} from '../pieces';
import { usePortal } from '../PortalProvider';

type Kind = 'all' | ReportVisibility;

export function ReportsScreen({
  role,
  initialId,
}: {
  role: Role;
  initialId?: string;
}) {
  const { open } = usePortal();
  const params = useSearchParams();
  const [kind, setKind] = useState<Kind>('all');
  const [student, setStudent] = useState(params.get('student') ?? '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const board = useTeacherDashboard(role === 'teacher');
  const students = board.data?.students ?? [];

  useEffect(() => {
    if (initialId) open({ type: 'report', id: initialId });
    else if (role === 'teacher' && params.get('new') === '1')
      open({
        type: 'new-report',
        studentId: params.get('student') ?? undefined,
      });
  }, []);

  const query = useMemo(
    () => ({
      as: role,
      limit: 100,
      ...(role === 'teacher' && kind !== 'all' ? { visibility: kind } : {}),
      ...(role === 'teacher' && student ? { studentId: student } : {}),
      ...(from ? { from: startOfDay(from).toISOString() } : {}),
      ...(to ? { to: startOfDay(addDays(to, 1)).toISOString() } : {}),
    }),
    [role, kind, student, from, to]
  );
  const list = useReports(query);
  // Para o carrossel: todos os relatórios do professor, sem filtro.
  const all = useReports({ as: 'teacher', limit: 100 }, role === 'teacher');
  const reports = list.data?.reports ?? [];

  return (
    <>
      <PageHeader
        title="Relatórios"
        description={
          role === 'teacher'
            ? 'O relatório é montado pelo servidor com os números do período: ninguém escolhe o que o aluno lê sobre o próprio aprendizado.'
            : 'O que seus professores escreveram sobre o seu estudo. Comente para responder.'
        }
        actions={
          role === 'teacher' ? (
            <Button
              variante="primario"
              icone={PiChartLineUp}
              onClick={() =>
                open({ type: 'new-report', studentId: student || undefined })
              }
            >
              Gerar relatório
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-14">
        {role === 'teacher' && board.data && (
          <Upcoming
            students={students}
            reports={all.data?.reports ?? []}
            attention={board.data.attention}
          />
        )}

        <Section
          title={role === 'teacher' ? 'Relatórios' : 'Seus relatórios'}
          help="lista"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            {role === 'teacher' ? (
              <FilterChips
                value={kind}
                onChange={setKind}
                label="Tipo"
                options={[
                  ['all', 'Todos'],
                  ['SHARED', 'Compartilhados'],
                  ['TEACHER_ONLY', 'Só seus'],
                ]}
              />
            ) : (
              <span />
            )}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
              {role === 'teacher' && students.length > 1 && (
                <Field.Selecao
                  label="Aluno"
                  rotuloOculto
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className="col-span-2 sm:w-52"
                >
                  <option value="">Todos os alunos</option>
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name}
                    </option>
                  ))}
                </Field.Selecao>
              )}
              <Field
                label="De"
                type="date"
                max={to || today()}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="sm:w-40"
              />
              <Field
                label="Até"
                type="date"
                min={from || undefined}
                max={today()}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="sm:w-40"
              />
            </div>
          </div>

          {list.isPending ? (
            <ScreenLoading rows={3} label="Carregando os relatórios" />
          ) : list.error ? (
            <ScreenError
              message={errorText(list.error)}
              onRetry={() => list.refetch()}
            />
          ) : reports.length === 0 ? (
            <Empty
              icone={PiChartLineUp}
              titulo={
                from || to || student || kind !== 'all'
                  ? 'Nenhum relatório com esses filtros'
                  : 'Nenhum relatório ainda'
              }
              descricao={
                role === 'teacher'
                  ? 'O primeiro sai com os números das aulas, da presença e das tarefas do período.'
                  : 'Quando um professor compartilhar um relatório com você, ele aparece aqui.'
              }
            />
          ) : (
            <ul
              className={cx(
                'grid gap-4 sm:grid-cols-2 transition-opacity',
                list.isFetching && 'opacity-70'
              )}
            >
              {reports.map((r) => (
                <li key={r.id}>
                  <ReportCard
                    r={r}
                    role={role}
                    onOpen={() => open({ type: 'report', id: r.id })}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}

function ReportCard({
  r,
  role,
  onOpen,
}: {
  r: ReportSummary;
  role: Role;
  onOpen: () => void;
}) {
  const who =
    role === 'teacher' ? api.nameOf(r.student) : `De ${api.nameOf(r.teacher)}`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full w-full flex-col gap-4 rounded-card bg-sup-2 p-6 text-left transition-[box-shadow] hover:shadow-[var(--sombra-2)]"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="font-display text-2xl leading-tight">{r.title}</span>
        {role === 'teacher' &&
          (r.visibility === 'TEACHER_ONLY' ? (
            <Badge estado="ouro">Só seu</Badge>
          ) : !r.isActive ? (
            <Badge>Desfeito</Badge>
          ) : null)}
      </span>
      <span className="t-legenda">
        {who} · {shortDateYear(dayOf(r.periodStart))} a{' '}
        {shortDateYear(dayOf(r.periodEnd))}
      </span>
      {r.description && (
        <p className="line-clamp-2 text-[0.9375rem] text-texto-suave">
          {r.description}
        </p>
      )}
      <span
        className={cx(
          'mt-auto text-sm',
          role === 'teacher' && r.visibility === 'SHARED' && !r.lastViewedAt
            ? 'text-ouro-texto'
            : 'text-texto-fraco'
        )}
      >
        {role === 'teacher'
          ? r.visibility === 'TEACHER_ONLY'
            ? `Criado ${ago(r.createdAt)} · o aluno não vê`
            : r.lastViewedAt
              ? `Visto ${ago(r.lastViewedAt)}`
              : 'Ainda não visto'
          : `Compartilhado ${ago(r.sharedAt ?? r.createdAt)}`}
      </span>
    </button>
  );
}

/**
 * Próximos relatórios: um cartão por aluno, de quem está há mais tempo sem
 * relatório (ou nunca recebeu) para o mais recente. Num carrossel que corre
 * de lado em qualquer tamanho.
 */
function Upcoming({
  students,
  reports,
  attention,
}: {
  students: api.TeacherDashboard['students'];
  reports: ReportSummary[];
  attention: api.AttentionSignal[];
}) {
  const { open } = usePortal();
  const cards = useMemo(() => {
    const last = new Map<string, string>();
    for (const r of reports) {
      const prev = last.get(r.student.id);
      if (!prev || r.createdAt > prev) last.set(r.student.id, r.createdAt);
    }
    const flagged = new Set(
      attention.filter((a) => a.kind === 'report').map((a) => a.studentId)
    );
    return students
      .map((s) => {
        const at = last.get(s.studentId) ?? null;
        const days = at ? daysBetween(dayOf(at), today()) : null;
        return {
          s,
          at,
          days,
          late: flagged.has(s.studentId) || (days !== null && days > 35),
        };
      })
      .sort((a, b) => (b.days ?? 9999) - (a.days ?? 9999));
  }, [students, reports, attention]);

  if (!cards.length) return null;
  return (
    <Section
      title="Próximos relatórios"
      detail="De quem está há mais tempo sem relatório"
      help="proximos"
    >
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 rolagem-discreta sm:mx-0 sm:px-0">
        {cards.map(({ s, at, days, late }) => (
          <li key={s.studentId} className="w-56 shrink-0 snap-start">
            <button
              type="button"
              onClick={() =>
                open({ type: 'new-report', studentId: s.studentId })
              }
              className="flex h-full w-full flex-col gap-2 rounded-card bg-sup-2 p-4 text-left transition-[box-shadow] hover:shadow-[var(--sombra-2)]"
            >
              <span className="truncate font-medium">{s.name}</span>
              <span
                className={cx(
                  't-dado text-sm',
                  late || !at ? 'text-atencao' : 'text-ouro-texto'
                )}
              >
                {at
                  ? late
                    ? 'Atrasado'
                    : `Último ${ago(at)}`
                  : 'Nunca recebeu'}
              </span>
              <span className="t-legenda">
                {s.totalLessons} {s.totalLessons === 1 ? 'aula' : 'aulas'}
                {days !== null ? ` · há ${days} dias` : ''} · gerar para{' '}
                {firstName(s.name)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
