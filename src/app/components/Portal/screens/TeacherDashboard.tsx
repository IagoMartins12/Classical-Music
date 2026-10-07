'use client';

// O painel do professor — esboço B, escolhido em 04/10/2026.
//
// Abre com uma frase que conta o dia, e cada pedaço da frase é a ação (fechar
// a aula, ouvir a entrega, responder o pedido). Depois, na ordem pedida: a
// semana em pauta, o que pede atenção, os alunos e o repertório. No
// computador o "Esperando você" mora na lateral; no telefone, um sumário de
// ícones leva a cada parte e "A semana" alterna com "Hoje".

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  PiCalendarBlank,
  PiCalendarPlus,
  PiClock,
  PiMusicNotes,
  PiTray,
  PiUserPlus,
  PiUsers,
  PiWarningCircle,
} from 'react-icons/pi';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { NumeroRolante } from '@/app/components/ui/NumeroRolante';
import { cx } from '@/app/components/ui/cx';
import { errorText, useTeacherDashboard } from '@/app/hooks/portal/query';
import { useSession } from '@/app/libs/session';
import type {
  AttentionSignal,
  TeacherDashboard as Dashboard,
} from '@/app/requests/portal/api';
import {
  ago,
  clock,
  countWord,
  dayOf,
  duration,
  firstName,
  greeting,
  hasPassed,
  joinNames,
  longDate,
  minuteOfDay,
  shortDate,
  spokenTime,
  timeRange,
  today,
  when,
} from '../format';
import {
  Avatar,
  AddButton,
  Empty,
  LessonStatusLabel,
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

export function TeacherDashboard() {
  const { data, isPending, error, refetch } = useTeacherDashboard();
  if (isPending) return <ScreenLoading label="Carregando o painel" />;
  if (error || !data)
    return <ScreenError message={errorText(error)} onRetry={() => refetch()} />;
  return <Board data={data} />;
}

function Board({ data }: { data: Dashboard }) {
  const { open } = usePortal();
  const { data: session } = useSession();
  const name = session?.user?.firstName ?? '';
  const [mode, setMode] = useState<'week' | 'today'>('week');
  const params = useSearchParams();

  // O aviso de pedido de aula leva a `/teacher?request=<id>`.
  useEffect(() => {
    const request = params.get('request');
    if (request) open({ type: 'lesson-request', id: request });
  }, []);

  const queue =
    data.pendingOutcome.length +
    data.assignmentsAwaitingFeedback.length +
    data.lessonRequests.length;
  const nextLesson = data.upcomingLessons[0] ?? null;
  const days: StaffDay[] = useMemo(
    () =>
      data.weeklySchedule.map((d) => ({
        day: d.localDate,
        freeMinutes: d.freeMinutes,
        lessons: d.lessons.map((l) => ({
          id: l.id,
          start: l.start,
          duration: l.duration,
          status: l.status,
          who: firstName(l.studentName),
          title: l.title,
        })),
      })),
    [data.weeklySchedule]
  );
  const weekLessons = days.reduce(
    (s, d) => s + d.lessons.filter((l) => l.status !== 'CANCELLED').length,
    0
  );
  const first = days[0]?.day;
  const last = days[days.length - 1]?.day;

  return (
    <>
      <PageHeader
        title={`${greeting()}${name ? `, ${name}` : ''}.`}
        description={<span data-ajuda="frase">{phrase(data, open)}</span>}
        actions={
          <>
            <Button
              variante="primario"
              icone={PiCalendarPlus}
              onClick={() => open({ type: 'schedule' })}
            >
              Marcar aula
            </Button>
            <Button
              icone={PiClock}
              onClick={() => open({ type: 'availability' })}
            >
              Horário de atendimento
            </Button>
          </>
        }
      >
        <span className="t-legenda first-letter:uppercase">
          {longDate(today())}
        </span>
      </PageHeader>

      <Summary queue={queue} attention={data.attention.length} />

      <div className="grid gap-14 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-14">
          <Section
            id="semana"
            help="semana"
            title={mode === 'week' ? 'A semana' : 'Hoje'}
            detail={
              mode === 'week'
                ? `${first ? `${shortDate(first)} a ${shortDate(last)} · ` : ''}${weekLessons} ${weekLessons === 1 ? 'aula' : 'aulas'}${
                    data.freeMinutesThisWeek !== null
                      ? ` · ${duration(data.freeMinutesThisWeek)} livres`
                      : ''
                  }`
                : `${data.todayLessons.length} ${data.todayLessons.length === 1 ? 'aula' : 'aulas'} pela frente`
            }
            action={
              <span className="flex items-center gap-3">
                <span className="sm:hidden">
                  <Abas rotulo="Ver">
                    <Aba
                      ativa={mode === 'week'}
                      onClick={() => setMode('week')}
                    >
                      Semana
                    </Aba>
                    <Aba
                      ativa={mode === 'today'}
                      onClick={() => setMode('today')}
                    >
                      Hoje
                    </Aba>
                  </Abas>
                </span>
                <span className="max-sm:hidden">
                  <TextLink href="/teacher/calendar">
                    Abrir o calendário
                  </TextLink>
                </span>
              </span>
            }
          >
            <div className={cx(mode === 'today' && 'max-sm:hidden')}>
              <Staff
                days={days}
                nextLessonId={nextLesson?.id}
                onLesson={(id) => open({ type: 'lesson', id })}
                label="Aulas da semana, uma coluna por dia"
              />
              {weekLessons === 0 && (
                <p className="pt-2 text-sm text-texto-suave">
                  Nenhuma aula nesta semana.{' '}
                  <PhraseAction onClick={() => open({ type: 'schedule' })}>
                    Marcar uma
                  </PhraseAction>
                  .
                </p>
              )}
            </div>
            {mode === 'today' && (
              <div className="sm:hidden">
                <TodayLine data={data} />
              </div>
            )}
            {mode === 'week' && <NextLessonCard data={data} />}
          </Section>

          <div className="xl:hidden">
            <Waiting data={data} />
          </div>

          <Attention signals={data.attention} />

          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Students data={data} />
            <Repertoire data={data} />
          </div>
        </div>

        <aside className="max-xl:hidden xl:sticky xl:top-24 xl:self-start">
          <Waiting data={data} />
        </aside>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// A frase do dia
// ---------------------------------------------------------------------------

function phrase(data: Dashboard, open: (r: SheetRequest) => void): ReactNode {
  const ahead = data.todayLessons.filter((l) => !hasPassed(l.scheduledAt));
  const next = ahead[0];
  const parts: ReactNode[] = [];
  const pending = data.pendingOutcome;
  const deliveries = data.assignmentsAwaitingFeedback;
  const requests = data.lessonRequests;

  if (pending.length)
    parts.push(
      <PhraseAction
        key="d"
        onClick={() => open({ type: 'close', id: pending[0].id })}
      >
        {pending.length === 1
          ? 'uma aula espera desfecho'
          : `${countWord(pending.length)} aulas esperam desfecho`}
      </PhraseAction>
    );
  if (deliveries.length) {
    const who = [...new Set(deliveries.map((d) => firstName(d.student.name)))];
    parts.push(
      <PhraseAction
        key="e"
        onClick={() => open({ type: 'delivery', id: deliveries[0].id })}
      >
        {who.length > 2
          ? `${countWord(who.length, false)} alunos`
          : joinNames(who)}{' '}
        {deliveries.length > 1 ? 'entregaram tarefas' : 'entregou uma tarefa'}
      </PhraseAction>
    );
  }
  if (requests.length)
    parts.push(
      <PhraseAction
        key="p"
        onClick={() => open({ type: 'lesson-request', id: requests[0].id })}
      >
        {requests.length === 1
          ? `${firstName(requests[0].student?.name ?? '')} pediu uma aula ${when(dayOf(requests[0].scheduledAt))}`
          : `${countWord(requests.length, false)} pedidos de aula`}
      </PhraseAction>
    );

  return (
    <>
      {ahead.length === 0 ? (
        data.todayLessons.length ? (
          'As aulas de hoje já passaram. '
        ) : (
          'Nenhuma aula hoje. '
        )
      ) : (
        <>
          {ahead.length === 1
            ? 'Uma aula'
            : `${countWord(ahead.length).replace(/^./, (c) => c.toUpperCase())} aulas`}{' '}
          pela frente hoje; a próxima é com{' '}
          <PhraseAction onClick={() => open({ type: 'lesson', id: next.id })}>
            {firstName(next.counterpart.name)}, às{' '}
            {spokenTime(next.scheduledAt)}
          </PhraseAction>
          .{' '}
        </>
      )}
      {parts.length === 0
        ? 'Nada mais esperando você.'
        : parts.map((p, i) => (
            <span
              key={i}
              className={
                i === 0 ? '[&>*:first-child]:first-letter:uppercase' : undefined
              }
            >
              {p}
              {i < parts.length - 2
                ? ', '
                : i === parts.length - 2
                  ? ' e '
                  : '.'}
            </span>
          ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Sumário de ícones (telefone): leva a cada parte do painel
// ---------------------------------------------------------------------------

function Summary({ queue, attention }: { queue: number; attention: number }) {
  const items = [
    { href: '#semana', icon: PiCalendarBlank, label: 'A semana' },
    { href: '#esperando', icon: PiTray, label: 'Esperando você', n: queue },
    {
      href: '#atencao',
      icon: PiWarningCircle,
      label: 'Pedem atenção',
      n: attention,
    },
    { href: '#alunos', icon: PiUsers, label: 'Alunos' },
    { href: '#repertorio', icon: PiMusicNotes, label: 'Repertório' },
  ];
  return (
    <nav
      data-ajuda="sumario"
      aria-label="Partes do painel"
      className="sticky top-14 z-elevado -mx-4 mb-10 flex justify-between gap-1 border-b border-linha bg-fundo/95 px-4 py-2 backdrop-blur sm:hidden"
    >
      {items.map((i) => (
        <a
          key={i.href}
          href={i.href}
          title={i.label}
          aria-label={i.n ? `${i.label}, ${i.n}` : i.label}
          className="group/dica relative grid h-11 w-11 place-items-center rounded-controle text-texto-suave transition-colors hover:bg-sup-2 hover:text-texto focus-visible:bg-sup-2"
        >
          <Icon de={i.icon} tamanho="m" />
          {i.n ? (
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ouro"
            />
          ) : null}
          <span
            role="tooltip"
            className="pointer-events-none absolute top-full z-menu mt-1 whitespace-nowrap rounded-controle bg-sup-alta px-2 py-1 text-xs text-texto opacity-0 shadow-[var(--sombra-2)] transition-opacity group-hover/dica:opacity-100 group-focus-visible/dica:opacity-100"
          >
            {i.label}
          </span>
        </a>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Hoje (telefone): as aulas do dia como linha do tempo, com o "agora"
// ---------------------------------------------------------------------------

function TodayLine({ data }: { data: Dashboard }) {
  const { open } = usePortal();
  const todayIso = today();
  const lessons =
    data.weeklySchedule.find((d) => d.localDate === todayIso)?.lessons ?? [];
  const now = minuteOfDay(new Date());
  if (!lessons.length)
    return (
      <Empty
        titulo="Nenhuma aula hoje"
        descricao={
          data.upcomingLessons[0]
            ? `A próxima é ${when(dayOf(data.upcomingLessons[0].scheduledAt))}, às ${spokenTime(data.upcomingLessons[0].scheduledAt)}.`
            : 'Nenhuma aula marcada pela frente.'
        }
        acao={
          <Button onClick={() => open({ type: 'schedule' })}>
            Marcar aula
          </Button>
        }
      />
    );
  const items: Array<{ at: number; node: ReactNode; key: string }> =
    lessons.map((l) => ({
      at: minuteOfDay(l.start),
      key: l.id,
      node: (
        <button
          type="button"
          onClick={() => open({ type: 'lesson', id: l.id })}
          className="grid w-full grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-controle py-3 text-left transition-colors hover:bg-sup-2"
        >
          <span
            className={cx(
              't-dado text-sm',
              hasPassed(l.start, l.duration)
                ? 'text-texto-fraco'
                : 'text-texto-suave'
            )}
          >
            {clock(l.start)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{l.studentName}</span>
            <span className="truncate text-sm text-texto-fraco">{l.title}</span>
          </span>
          <LessonStatusLabel
            lesson={{
              status: l.status,
              scheduledAt: l.start,
              duration: l.duration,
            }}
          />
        </button>
      ),
    }));
  items.push({
    at: now - 0.5,
    key: 'agora',
    node: (
      <div
        className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 py-1"
        aria-label={`Agora, ${clock(new Date())}`}
      >
        <span className="t-dado text-xs font-medium text-ouro-texto">
          {clock(new Date())}
        </span>
        <span aria-hidden="true" className="portal-agora relative h-px bg-ouro">
          <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-ouro" />
        </span>
      </div>
    ),
  });
  return (
    <ol className="flex flex-col">
      {items
        .sort((a, b) => a.at - b.at)
        .map((i) => (
          <li key={i.key}>{i.node}</li>
        ))}
    </ol>
  );
}

/** A próxima aula em destaque, embaixo da pauta. */
function NextLessonCard({ data }: { data: Dashboard }) {
  const { open } = usePortal();
  const next = data.upcomingLessons[0];
  if (!next) return null;
  const minutes = Math.round(
    (new Date(next.scheduledAt).getTime() - Date.now()) / 60_000
  );
  const soon = minutes >= 0 && minutes < 120;
  const day = dayOf(next.scheduledAt);
  return (
    <button
      type="button"
      onClick={() => open({ type: 'lesson', id: next.id })}
      className="group/proxima flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-card bg-sup-2 p-4 text-left transition-shadow hover:shadow-[var(--sombra-2)]"
    >
      <Avatar name={next.counterpart.name} image={next.counterpart.image} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="t-legenda">Próxima aula</span>
        <span className="truncate font-medium group-hover/proxima:text-ouro-texto">
          {next.counterpart.name} · {next.title}
        </span>
      </span>
      <span className="t-rotulo font-medium text-ouro-texto first-letter:uppercase">
        {soon
          ? `em ${duration(minutes)}`
          : `${when(day)}, ${timeRange(next.scheduledAt, next.duration)}`}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Esperando você
// ---------------------------------------------------------------------------

function Waiting({ data }: { data: Dashboard }) {
  const { open } = usePortal();
  const groups: Array<{
    title: string;
    items: Array<{
      id: string;
      who: string;
      image: string | null;
      detail: string;
      action: string;
      sheet: SheetRequest;
    }>;
  }> = [
    {
      title: 'Fechar aula',
      items: data.pendingOutcome.map((l) => ({
        id: l.id,
        who: l.counterpart.name,
        image: l.counterpart.image,
        detail: `${when(dayOf(l.scheduledAt))}, ${spokenTime(l.scheduledAt)} · ${l.title}`,
        action: 'Fechar',
        sheet: { type: 'close', id: l.id },
      })),
    },
    {
      title: 'Entregas',
      items: data.assignmentsAwaitingFeedback.map((a) => ({
        id: a.id,
        who: a.student.name,
        image: a.student.image,
        detail: `${a.title}${a.completedAt ? ` · ${ago(a.completedAt)}` : ''}`,
        action: 'Ouvir',
        sheet: { type: 'delivery', id: a.id },
      })),
    },
    {
      title: 'Pedidos de aula',
      items: data.lessonRequests.map((r) => ({
        id: r.id,
        who: r.student?.name ?? '',
        image: r.student?.image ?? null,
        detail: `Pede ${when(dayOf(r.scheduledAt))}, ${spokenTime(r.scheduledAt)}`,
        action: 'Responder',
        sheet: { type: 'lesson-request', id: r.id },
      })),
    },
  ];
  const total = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <section
      id="esperando"
      data-ajuda="fila"
      className="flex scroll-mt-24 flex-col gap-4 rounded-card bg-sup-2 p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[1.5rem] leading-tight">
          Esperando você
        </h2>
        <NumeroRolante
          valor={String(total)}
          className="t-dado text-2xl text-ouro-texto"
        />
      </div>
      {total === 0 ? (
        <p className="text-[0.9375rem] text-texto-suave">
          Nada esperando: aulas fechadas, entregas respondidas, pedidos
          decididos.
        </p>
      ) : (
        groups
          .filter((g) => g.items.length)
          .map((g) => (
            <div key={g.title} className="flex flex-col">
              <h3 className="t-legenda pb-1">{g.title}</h3>
              <ul className="flex flex-col">
                {g.items.map((i) => (
                  <li key={i.id} className="portal-linha">
                    <div className="flex items-center gap-3 border-b border-linha py-3">
                      <Avatar name={i.who} image={i.image} size="p" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[0.9375rem] font-medium">
                          {i.who}
                        </span>
                        <span className="truncate text-sm text-texto-suave first-letter:uppercase">
                          {i.detail}
                        </span>
                      </span>
                      <Button tamanho="p" onClick={() => open(i.sheet)}>
                        {i.action}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Pedem atenção — os sinais que o professor não vê sem procurar
// ---------------------------------------------------------------------------

function Attention({ signals }: { signals: AttentionSignal[] }) {
  const { open } = usePortal();
  if (!signals.length) return null;

  const describe = (
    s: AttentionSignal
  ): { text: string; action: string; run?: () => void; href?: string } => {
    switch (s.kind) {
      case 'practice':
        return {
          text: `Praticou ${duration(s.minutes ?? 0)} de ${duration(s.goalMinutes ?? 0)} nesta semana — menos da metade da meta.`,
          action: 'Ver ficha',
          run: () => open({ type: 'student', studentId: s.studentId }),
        };
      case 'overdue':
        return {
          text: `${s.count === 1 ? 'Uma tarefa passou' : `${countWord(s.count ?? 0)} tarefas passaram`} do prazo${
            s.since ? ` — a mais antiga ${ago(s.since)}` : ''
          }.`,
          action: 'Ver tarefas',
          href: `/teacher/assignments?student=${s.studentId}&status=OVERDUE`,
        };
      case 'invite':
        return {
          text: `O convite está parado${s.since ? ` desde ${shortDate(dayOf(s.since))}` : ''}.`,
          action: 'Ver convite',
          href: '/teacher/students?tab=invites',
        };
      default:
        return {
          text: s.since
            ? `${s.count} aulas, e o último relatório foi ${ago(s.since)}.`
            : `${s.count} aulas e nenhum relatório ainda.`,
          action: 'Gerar',
          href: `/teacher/reports?student=${s.studentId}&new=1`,
        };
    }
  };

  return (
    <Section
      id="atencao"
      help="atencao"
      title="Pedem atenção"
      detail={`${signals.length} ${signals.length === 1 ? 'sinal' : 'sinais'}`}
    >
      <ul className="flex flex-col">
        {signals.map((s) => {
          const d = describe(s);
          return (
            <li
              key={`${s.kind}-${s.studentId}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-linha py-3 last:border-0"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-display text-lg leading-tight">
                  {s.studentName}
                </span>
                <span className="text-sm text-texto-suave">{d.text}</span>
              </span>
              {d.href ? (
                <Link
                  href={d.href}
                  className={classesDeBotao('secundario', 'p')}
                >
                  {d.action}
                </Link>
              ) : (
                <Button tamanho="p" onClick={d.run}>
                  {d.action}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Alunos e repertório
// ---------------------------------------------------------------------------

const LEVEL: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

function Students({ data }: { data: Dashboard }) {
  const { open } = usePortal();
  const plan = data.plan;
  const add = (
    <AddButton href="/teacher/students?invite=1">Convidar aluno</AddButton>
  );
  return (
    <Section
      id="alunos"
      help="alunos"
      title="Alunos"
      detail={
        plan.maxStudents !== null
          ? `${plan.activeStudents} de ${plan.maxStudents} vagas do plano`
          : `${data.students.length} ativos`
      }
      action={add}
    >
      {data.students.length === 0 && data.pendingInvites.length === 0 ? (
        <Empty
          icone={PiUserPlus}
          titulo="Nenhum aluno ainda"
          descricao="O convite vai por e-mail; quando o aluno aceita, aulas, tarefas e calendário passam a ser de vocês dois."
          acao={
            <TextLink href="/teacher/students?invite=1">
              Convidar o primeiro aluno
            </TextLink>
          }
        />
      ) : (
        <ul className="flex flex-col">
          {data.students.map((s) => (
            <li key={s.studentId}>
              <button
                type="button"
                onClick={() =>
                  open({ type: 'student', studentId: s.studentId })
                }
                className="group/aluno flex w-full items-center gap-4 border-b border-linha py-4 text-left"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-display text-xl leading-tight transition-colors duration-[var(--t-toque)] group-hover/aluno:text-ouro-texto">
                    {s.name}
                  </span>
                  <span className="t-legenda">
                    {[
                      s.level && LEVEL[s.level],
                      s.nextLessonAt
                        ? `próxima ${when(dayOf(s.nextLessonAt))}, ${spokenTime(s.nextLessonAt)}`
                        : 'sem aula marcada',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="flex w-28 flex-col items-end gap-1.5">
                  <span className="t-dado text-sm text-texto-suave">
                    {duration(s.practiceMinutes7d)}
                  </span>
                  {s.practiceGoalMinutes ? (
                    <ProgressBar
                      value={
                        (s.practiceMinutes7d / s.practiceGoalMinutes) * 100
                      }
                      label={`Prática de ${firstName(s.name)} na semana`}
                      className="w-full"
                    />
                  ) : (
                    <span className="t-legenda">sem meta</span>
                  )}
                </span>
              </button>
            </li>
          ))}
          {data.pendingInvites.map((i) => (
            <li
              key={i.relationshipId}
              className="flex items-center justify-between gap-4 border-b border-linha py-4 last:border-0"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-display text-xl leading-tight text-texto-suave">
                  {i.name}
                </span>
                <span className="t-legenda">
                  Convite enviado em {shortDate(dayOf(i.sentAt))} · ainda não
                  aceitou
                </span>
              </span>
              <Link
                href="/teacher/students?tab=invites"
                className={classesDeBotao('secundario', 'p')}
              >
                Ver convite
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Repertoire({ data }: { data: Dashboard }) {
  return (
    <Section
      id="repertorio"
      help="repertorio"
      title="Repertório"
      detail="O que seus alunos vão tocar nas próximas aulas"
    >
      {data.repertoire.length === 0 ? (
        <p className="text-[0.9375rem] text-texto-suave">
          Ligue obras às aulas (na criação completa) e elas aparecem aqui, com
          quem está tocando cada uma.
        </p>
      ) : (
        <ul className="flex flex-col">
          {data.repertoire.map((r) => (
            <li
              key={r.workId}
              className="flex items-start justify-between gap-4 border-b border-linha py-4 last:border-0"
            >
              <WorkCited
                work={{ id: r.workId, title: r.title, composer: r.composer }}
              />
              <span className="t-legenda shrink-0 pt-1 text-right">
                {joinNames(r.students)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
