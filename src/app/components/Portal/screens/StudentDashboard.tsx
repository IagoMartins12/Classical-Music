'use client';

// O painel do aluno — esboço B (04/10/2026). A frase do dia diz a próxima
// aula e o que levar; depois a semana em pauta com a prática, as tarefas e o
// estudo (o mesmo "quero aprender / já aprendi" da biblioteca).

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import {
  PiCalendarBlank,
  PiCalendarPlus,
  PiClipboardText,
  PiMusicNotes,
  PiTimer,
} from 'react-icons/pi';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  portalKeys,
  useCalendar,
  usePortalMutation,
  useRepertoire,
  useStudentDashboard,
} from '@/app/hooks/portal/query';
import { useSession } from '@/app/libs/session';
import * as api from '@/app/requests/portal/api';
import type { StudentDashboard as Dashboard } from '@/app/requests/portal/api';
import {
  addDays,
  dayOf,
  dayShort,
  duration,
  firstName,
  greeting,
  longDate,
  shortDate,
  spokenTime,
  startOfDay,
  today,
  weekOf,
  when,
} from '../format';
import {
  Empty,
  PageHeader,
  PhraseAction,
  ProgressBar,
  ScreenError,
  ScreenLoading,
  Section,
  TextLink,
  WorkCited,
} from '../pieces';
import { usePortal, type SheetRequest } from '../PortalProvider';
import { Staff, type StaffDay } from '../schedule/Staff';
import { PendingInvites } from './StudentGate';

export function StudentDashboard() {
  const { data, isPending, error } = useStudentDashboard();
  if (isPending) return <ScreenLoading label="Carregando o painel" />;
  if (error || !data) return <ScreenError message={errorText(error)} />;
  return <Board data={data} />;
}

function Board({ data }: { data: Dashboard }) {
  const { open } = usePortal();
  const { data: session } = useSession();
  const name = session?.user?.firstName ?? '';

  return (
    <>
      <PageHeader
        title={`${greeting()}${name ? `, ${name}` : ''}.`}
        description={<span data-ajuda="frase">{phrase(data, open)}</span>}
        actions={
          <>
            <Button
              variante="primario"
              icone={PiTimer}
              onClick={() => open({ type: 'practice' })}
            >
              Registrar prática
            </Button>
            <Button
              icone={PiCalendarPlus}
              onClick={() => open({ type: 'request' })}
            >
              Pedir uma aula
            </Button>
          </>
        }
      >
        <span className="t-legenda first-letter:uppercase">
          {longDate(today())}
        </span>
      </PageHeader>

      <PendingInvites />
      <div className="flex flex-col gap-14">
        <Week data={data} />
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Assignments data={data} />
          <Study />
        </div>
        {data.lessonRequests.length > 0 && <Requests data={data} />}
      </div>
    </>
  );
}

function phrase(data: Dashboard, open: (r: SheetRequest) => void): ReactNode {
  const next = data.upcomingLessons[0];
  const prep = data.recentLessons.find((l) => l.nextLessonPrep)?.nextLessonPrep;
  const overdue = data.overdueAssignments.length;
  return (
    <>
      {next ? (
        <>
          Sua próxima aula com{' '}
          <PhraseAction onClick={() => open({ type: 'lesson', id: next.id })}>
            {firstName(next.counterpart.name)} é {when(dayOf(next.scheduledAt))}
            , às {spokenTime(next.scheduledAt)}
          </PhraseAction>
          .{prep ? <> Leve: {prep.replace(/\.$/, '')}.</> : null}
        </>
      ) : (
        <>Nenhuma aula marcada por enquanto. </>
      )}
      {overdue > 0 && (
        <>
          {' '}
          <PhraseAction href="/student/assignments?status=OVERDUE">
            {overdue === 1
              ? 'Uma tarefa passou do prazo'
              : `${overdue} tarefas passaram do prazo`}
          </PhraseAction>
          .
        </>
      )}
    </>
  );
}

function Week({ data }: { data: Dashboard }) {
  const { open } = usePortal();
  const days = weekOf(today());
  const range = useMemo(
    () => ({
      as: 'student' as const,
      from: startOfDay(days[0]).toISOString(),
      to: startOfDay(addDays(days[6], 1)).toISOString(),
    }),

    [days[0]]
  );
  const calendar = useCalendar(range);
  const staff: StaffDay[] = days.map((day) => ({
    day,
    lessons: (calendar.data?.events ?? [])
      .filter((e) => e.type === 'lesson' && dayOf(e.start) === day)
      .map((e) => ({
        id: e.id,
        start: e.start,
        duration: e.lesson?.duration ?? 60,
        status: e.status as api.LessonStatus,
        who: firstName(e.counterpart.name),
        title: e.title,
      })),
  }));
  return (
    <Section
      id="semana"
      help="semana"
      title="Sua semana"
      detail={`${shortDate(days[0])} a ${shortDate(days[6])}`}
      action={<TextLink href="/student/calendar">Abrir o calendário</TextLink>}
    >
      <Staff
        days={staff}
        height={180}
        nextLessonId={data.upcomingLessons[0]?.id}
        onLesson={(id) => open({ type: 'lesson', id })}
        label="Suas aulas da semana"
        footer={practiceRow(days, data.practice, () =>
          open({ type: 'practice' })
        )}
      />
    </Section>
  );
}

const BAR_HEIGHT = 44;

/**
 * A prática como uma linha da pauta: cada dia ganha sua barra embaixo do
 * próprio compasso, com o tempo ao lado — a mesma semana das aulas (dom a
 * sáb), não os "últimos 7 dias". A meta diária, quando há, é o tracejado.
 */
function practiceRow(
  days: string[],
  p: api.PracticeSummary,
  onRegister: () => void
) {
  const todayIso = today();
  const byDay = new Map(p.days.map((d) => [d.date, d.minutes]));
  const minutesOf = (day: string) =>
    day > todayIso ? 0 : (byDay.get(day) ?? 0);
  const total = days.reduce((s, d) => s + minutesOf(d), 0);
  const goal = p.weeklyGoalMinutes;
  const daily = goal ? goal / 7 : 0;
  const top = Math.max(daily * 1.5, ...days.map(minutesOf), 30);
  const practiced = days.filter((d) => minutesOf(d) > 0);

  return {
    className: 'mt-5 border-t border-linha pt-4 pb-3',
    label: (
      <span
        data-ajuda="pratica"
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
      >
        <span className="t-rotulo font-medium text-texto">Prática</span>
        <span className="text-sm text-texto-suave">
          {total > 0 ? (
            <>
              <span className="t-dado text-texto">{duration(total)}</span> nesta
              semana
              {goal
                ? total >= goal
                  ? ` · meta de ${duration(goal)} cumprida`
                  : ` · meta de ${duration(goal)}`
                : ''}
            </>
          ) : (
            'Nada registrado nesta semana'
          )}
        </span>
        {total === 0 && (
          <button
            type="button"
            onClick={onRegister}
            className="text-sm font-medium text-ouro-texto hover:underline"
          >
            Registrar a primeira
          </button>
        )}
        {practiced.length > 0 && (
          <span className="sr-only">{`Por dia: ${practiced.map((d) => `${dayShort(d)}, ${duration(minutesOf(d))}`).join('; ')}.`}</span>
        )}
      </span>
    ),
    cell: (day: string) => {
      const m = minutesOf(day);
      const isToday = day === todayIso;
      return (
        <div
          aria-hidden="true"
          className="relative"
          style={{ height: BAR_HEIGHT }}
        >
          {daily > 0 && (
            <span
              className="absolute -inset-x-2 border-t border-dashed border-ouro/40"
              style={{ bottom: `${(daily / top) * 100}%` }}
            />
          )}
          <span className="absolute inset-0 flex items-end gap-2">
            {day > todayIso ? (
              <span className="h-0 w-6 border-t border-dashed border-linha-forte" />
            ) : m > 0 ? (
              <>
                <span
                  className={cx(
                    'portal-sobe block w-6 rounded-t-[3px]',
                    isToday ? 'bg-ouro' : 'bg-texto-fraco'
                  )}
                  style={{ height: `${Math.max(8, (m / top) * 100)}%` }}
                />
                <span
                  className={cx(
                    't-dado text-[0.6875rem] leading-none',
                    isToday ? 'text-ouro-texto' : 'text-texto-suave'
                  )}
                >
                  {duration(m)}
                </span>
              </>
            ) : (
              <span className="h-[2px] w-6 bg-linha-forte" />
            )}
          </span>
        </div>
      );
    },
  };
}

function Assignments({ data }: { data: Dashboard }) {
  const list = [
    ...data.overdueAssignments,
    ...data.assignmentsDueSoon.filter(
      (a) => !data.overdueAssignments.some((o) => o.id === a.id)
    ),
  ];
  return (
    <Section
      id="tarefas"
      help="tarefas"
      title="Tarefas"
      detail={`${data.stats.pendingAssignments} ${data.stats.pendingAssignments === 1 ? 'aberta' : 'abertas'}`}
      action={<TextLink href="/student/assignments">Ver todas</TextLink>}
    >
      {list.length === 0 ? (
        <Empty
          icone={PiClipboardText}
          titulo="Nenhuma tarefa para os próximos dias"
          descricao="As tarefas que seus professores passarem aparecem aqui, com o prazo."
        />
      ) : (
        <ul className="flex flex-col">
          {list.map((t) => {
            const overdue = data.overdueAssignments.some((o) => o.id === t.id);
            const due = t.dueDate ? dayOf(t.dueDate) : null;
            return (
              <li key={t.id} className="border-b border-linha last:border-0">
                <Link
                  href={`/student/assignments/${t.id}`}
                  className="group/tarefa flex flex-col gap-3 py-4"
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-xl leading-tight group-hover/tarefa:text-ouro-texto">
                      {t.title}
                    </span>
                    {overdue ? (
                      <Badge estado="atencao">Atrasada</Badge>
                    ) : due ? (
                      <span className="t-legenda shrink-0 first-letter:uppercase">
                        {due === today() ? 'Para hoje' : `Até ${when(due)}`}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-3">
                    <ProgressBar
                      value={t.progress ?? 0}
                      label={`Andamento de ${t.title}`}
                      className="flex-1"
                    />
                    <span className="t-dado w-10 text-right text-sm text-texto-suave">
                      {t.progress ?? 0}%
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

function Study() {
  const repertoire = useRepertoire();
  const r = repertoire.data;
  const want = r?.wantToLearn.slice(0, 3) ?? [];
  const learned = r?.learned.slice(0, 3) ?? [];
  return (
    <Section
      id="estudo"
      help="estudo"
      title="Estudo"
      action={<TextLink href="/student/study">Abrir</TextLink>}
    >
      {repertoire.isPending ? null : want.length === 0 &&
        learned.length === 0 ? (
        <Empty
          icone={PiMusicNotes}
          titulo="Sua biblioteca está vazia"
          descricao="Marque obras como “quero aprender” ou “já aprendi” — pelas aulas ou pela página de cada obra. Seus professores veem para planejar."
          acao={<TextLink href="/works">Explorar obras</TextLink>}
        />
      ) : (
        <div className="flex flex-col gap-4 pt-1">
          {want.length > 0 && <span className="t-legenda">Quero aprender</span>}
          {want.map((w) => (
            <WorkCited key={w.id} work={w.work} />
          ))}
          {learned.length > 0 && (
            <span className="t-legenda pt-3">Já aprendi</span>
          )}
          {learned.map((l) => (
            <WorkCited key={l.id} work={l.work} />
          ))}
        </div>
      )}
    </Section>
  );
}

function Requests({ data }: { data: Dashboard }) {
  const cancel = usePortalMutation(
    (id: string) => api.cancelLessonRequest(id),
    {
      success: 'Pedido cancelado.',
      invalidate: [portalKeys.dashboard('student'), ['portal', 'requests']],
    }
  );
  return (
    <Section title="Pedidos de aula" detail="Esperando a resposta do professor">
      <ul className="flex flex-col">
        {data.lessonRequests.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-4 border-b border-linha py-3 last:border-0"
          >
            <span className="flex items-center gap-3">
              <Icon de={PiCalendarBlank} className="text-texto-fraco" />
              <span className="flex flex-col">
                <span className="font-medium first-letter:uppercase">
                  {when(dayOf(r.scheduledAt))}, {spokenTime(r.scheduledAt)} ·{' '}
                  {duration(r.duration)}
                </span>
                <span className="t-legenda">Com {r.teacher?.name}</span>
              </span>
            </span>
            <Button
              tamanho="p"
              variante="fantasma"
              carregando={cancel.isPending && cancel.variables === r.id}
              onClick={() => cancel.mutate(r.id)}
            >
              Cancelar pedido
            </Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
