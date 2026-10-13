'use client';

// O calendário — escolha de 04/10/2026:
// - computador: a pauta do B, ajustada à altura da janela (sem rolagem
//   vertical), com o detalhe da aula ao lado (como no C) e um mês discreto;
// - tablet: a pauta do B, a aula abre na folha;
// - telefone: a semana e o mês do A (um dia de cada vez, escolhido na
//   fileira) e a lista do B, cada modo com o seu título, e "Marcar aula".
// Mais: assinar no celular e baixar o .ics.

import { useEffect, useMemo, useState } from 'react';
import {
  PiCalendarCheck,
  PiCalendarPlus,
  PiCaretLeft,
  PiCaretRight,
  PiClock,
  PiPlus,
} from 'react-icons/pi';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  useAvailability,
  useCalendar,
  useStudentDashboard,
  useTeacherFreeSlots,
} from '@/app/hooks/portal/query';
import type {
  CalendarEvent,
  LessonStatus,
  Role,
} from '@/app/requests/portal/api';
import {
  addDays,
  clock,
  dayOf,
  dayOfMonth,
  dayShort,
  duration,
  firstName,
  longDate,
  monthName,
  monthWeeks,
  sameMonth,
  shortDate,
  startOfDay,
  today,
  weekOf,
  weekStart,
} from '../format';
import { LessonPanel, useLessonSelection } from '../lesson/LessonPanel';
import { Empty, LessonStatusLabel, PageHeader, ScreenError } from '../pieces';
import { usePortal } from '../PortalProvider';
import { Staff, StaffLegend, type StaffDay } from '../schedule/Staff';

type Mode = 'week' | 'month' | 'list';

const MODE_LABEL: Record<Mode, string> = {
  week: 'Semana',
  month: 'Mês',
  list: 'Lista',
};

/** A altura da pauta que cabe na janela, sem rolar a página. */
function useFitHeight() {
  const [h, setH] = useState(520);
  useEffect(() => {
    const fit = () =>
      setH(Math.max(360, Math.min(760, window.innerHeight - 340)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return h;
}

/** Janelas livres que caem num período (aluno: as do professor). */
const inRange = (slots: Array<{ start: string; end: string }>, day: string) =>
  slots.filter((s) => dayOf(s.start) === day);

export function CalendarScreen({ role }: { role: Role }) {
  const { open } = usePortal();
  const [mode, setMode] = useState<Mode>('week');
  const [anchor, setAnchor] = useState(today());
  const [phoneDay, setPhoneDay] = useState(today());
  const [showFree, setShowFree] = useState(role === 'teacher');
  const { selected, select, clear, wide } = useLessonSelection();
  const height = useFitHeight();

  const range = useMemo(() => {
    if (mode === 'month') {
      const weeks = monthWeeks(anchor);
      return { from: weeks[0][0], to: addDays(weeks[weeks.length - 1][6], 1) };
    }
    const start = weekStart(anchor);
    return { from: start, to: addDays(start, mode === 'list' ? 14 : 7) };
  }, [mode, anchor]);

  const query = useMemo(
    () => ({
      as: role,
      from: startOfDay(range.from).toISOString(),
      to: startOfDay(range.to).toISOString(),
      freeSlots: role === 'teacher' && showFree,
    }),
    [role, range, showFree]
  );
  const calendar = useCalendar(query);
  const availability = useAvailability(role === 'teacher');

  // Aluno: os horários livres do professor (o primeiro da lista).
  const student = useStudentDashboard(role === 'student');
  const teacher = student.data?.teachers[0];
  const studentFree = useTeacherFreeSlots(
    role === 'student' && showFree ? teacher?.userId : null,
    {
      from: query.from,
      to: query.to,
      minMinutes: 60,
    }
  );

  const lessons = useMemo(
    () => (calendar.data?.events ?? []).filter((e) => e.type === 'lesson'),
    [calendar.data]
  );
  const freeSlots =
    role === 'teacher'
      ? (calendar.data?.freeSlots ?? [])
      : (studentFree.data?.slots ?? []);
  const blocks = availability.data?.blocks ?? [];
  // Bloqueio que cobre qualquer parte do dia (férias, feriado).
  const blockOf = (day: string) => {
    const start = startOfDay(day).getTime();
    const end = startOfDay(addDays(day, 1)).getTime();
    const block = blocks.find(
      (b) =>
        new Date(b.startsAt).getTime() < end &&
        new Date(b.endsAt).getTime() > start
    );
    return block ? block.reason || 'Sem atendimento' : null;
  };

  const next = lessons.find(
    (e) => e.status === 'SCHEDULED' && new Date(e.start).getTime() > Date.now()
  );
  const onFree = (start: string) =>
    role === 'teacher'
      ? open({ type: 'schedule', start })
      : open({ type: 'request', start });

  const days = weekOf(anchor);
  const staffDays: StaffDay[] = days.map((day) => {
    const free = inRange(freeSlots, day);
    return {
      day,
      blocked: role === 'teacher' ? blockOf(day) : null,
      free,
      freeMinutes: showFree
        ? free.reduce(
            (s, w) =>
              s +
              (new Date(w.end).getTime() - new Date(w.start).getTime()) /
                60_000,
            0
          )
        : undefined,
      lessons: lessons
        .filter((e) => dayOf(e.start) === day)
        .map((e) => ({
          id: e.id,
          start: e.start,
          duration: e.lesson?.duration ?? 60,
          status: e.status as LessonStatus,
          who: firstName(e.counterpart.name),
          title: e.title,
        })),
    };
  });

  const move = (dir: -1 | 1) =>
    setAnchor((a) =>
      mode === 'month'
        ? dayOf(
            new Date(Number(a.slice(0, 4)), Number(a.slice(5, 7)) - 1 + dir, 1)
          )
        : addDays(a, 7 * dir)
    );
  const title =
    mode === 'month'
      ? `${monthName(anchor)} de ${anchor.slice(0, 4)}`
      : `${shortDate(range.from)} a ${shortDate(addDays(range.to, -1))}`;

  const freeLabel =
    role === 'teacher'
      ? 'Horas livres'
      : teacher
        ? `Horários livres de ${firstName(teacher.name)}`
        : 'Horários livres';

  return (
    <div
      className={cx(
        'grid gap-10',
        wide && selected && 'xl:grid-cols-[minmax(0,1fr)_360px]'
      )}
    >
      <div className="flex min-w-0 flex-col gap-8">
        <PageHeader
          className="!pb-0"
          title={<span className="first-letter:uppercase">{title}</span>}
          description={
            <span className="text-base sm:text-lg">
              {MODE_LABEL[mode]} ·{' '}
              {calendar.data
                ? `${lessons.length} ${lessons.length === 1 ? 'aula' : 'aulas'}`
                : '…'}
            </span>
          }
          actions={
            <>
              <Button
                icone={PiCalendarCheck}
                onClick={() => open({ type: 'calendar-sync' })}
                data-ajuda="sincronizar"
              >
                No celular
              </Button>
              {role === 'teacher' ? (
                <>
                  <span data-ajuda="atendimento" className="max-sm:hidden">
                    <Button
                      icone={PiClock}
                      onClick={() => open({ type: 'availability' })}
                    >
                      Atendimento
                    </Button>
                  </span>
                  <Button
                    variante="primario"
                    icone={PiCalendarPlus}
                    onClick={() => open({ type: 'schedule' })}
                  >
                    Marcar aula
                  </Button>
                </>
              ) : (
                <Button
                  variante="primario"
                  icone={PiCalendarPlus}
                  onClick={() => open({ type: 'request' })}
                >
                  Pedir aula
                </Button>
              )}
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <span data-ajuda="modos">
            <Abas rotulo="Ver por">
              {(['week', 'month', 'list'] as Mode[]).map((m) => (
                <Aba key={m} ativa={mode === m} onClick={() => setMode(m)}>
                  {MODE_LABEL[m]}
                </Aba>
              ))}
            </Abas>
          </span>
          <span className="flex items-center gap-1">
            <Button
              variante="fantasma"
              icone={PiCaretLeft}
              rotulo="Anterior"
              onClick={() => move(-1)}
            />
            <Button
              variante="fantasma"
              icone={PiCaretRight}
              rotulo="Seguinte"
              onClick={() => move(1)}
            />
            <Button
              variante="texto"
              onClick={() => (setAnchor(today()), setPhoneDay(today()))}
            >
              Hoje
            </Button>
          </span>
          <span data-ajuda="livres" className="sm:ml-auto">
            <Chip selecionado={showFree} onClick={() => setShowFree((v) => !v)}>
              {freeLabel}
            </Chip>
          </span>
        </div>

        {calendar.error ? (
          <ScreenError message={errorText(calendar.error)} />
        ) : (
          <div
            data-ajuda="grade"
            className={cx(
              'transition-opacity',
              calendar.isFetching && !calendar.isPending && 'opacity-70'
            )}
          >
            {mode === 'week' && (
              <>
                <div className="max-md:hidden">
                  <Staff
                    days={staffDays}
                    height={height}
                    hours
                    showFree={showFree}
                    nextLessonId={next?.id}
                    onLesson={select}
                    onFree={onFree}
                    selectedId={wide ? selected : undefined}
                    label="Semana em pauta, uma coluna por dia"
                  />
                </div>
                <div className="flex flex-col gap-4 md:hidden">
                  <ol className="grid grid-cols-7 gap-1">
                    {days.map((d) => (
                      <li key={d}>
                        <button
                          type="button"
                          aria-pressed={d === phoneDay}
                          onClick={() => setPhoneDay(d)}
                          className={cx(
                            'flex w-full flex-col items-center rounded-controle py-2 [@media(pointer:coarse)]:min-h-[var(--alvo)]',
                            d === phoneDay
                              ? 'fill-ouro text-sobre-ouro'
                              : d === today()
                                ? 'text-ouro-texto'
                                : 'text-texto-suave'
                          )}
                        >
                          <span className="text-xs">{dayShort(d)}</span>
                          <span className="t-dado text-lg">
                            {dayOfMonth(d)}
                          </span>
                          {staffDays.find((x) => x.day === d)?.lessons
                            .length ? (
                            <span
                              aria-hidden="true"
                              className={cx(
                                'h-1 w-1 rounded-full',
                                d === phoneDay ? 'bg-sobre-ouro' : 'bg-ouro'
                              )}
                            />
                          ) : (
                            <span className="h-1" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ol>
                  <DayList
                    day={days.includes(phoneDay) ? phoneDay : days[0]}
                    role={role}
                    lessons={lessons}
                    free={showFree ? freeSlots : []}
                    blocked={
                      role === 'teacher'
                        ? blockOf(days.includes(phoneDay) ? phoneDay : days[0])
                        : null
                    }
                    onLesson={select}
                    onFree={onFree}
                  />
                </div>
                <div className="pt-3">
                  <StaffLegend showFree={showFree} role={role} />
                </div>
              </>
            )}
            {mode === 'month' && (
              <Month
                anchor={anchor}
                lessons={lessons}
                blocked={role === 'teacher' ? blockOf : () => null}
                onDay={(d) => (setAnchor(d), setPhoneDay(d), setMode('week'))}
              />
            )}
            {mode === 'list' && (
              <ByDay
                from={range.from}
                days={14}
                role={role}
                lessons={lessons}
                free={showFree ? freeSlots : []}
                blockedOf={role === 'teacher' ? blockOf : () => null}
                onLesson={select}
                onFree={onFree}
              />
            )}
          </div>
        )}
      </div>

      {wide && selected && (
        <LessonPanel id={selected} role={role} onClose={clear} />
      )}
    </div>
  );
}

function LessonRow({
  e,
  role,
  onLesson,
}: {
  e: CalendarEvent;
  role: Role;
  onLesson: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onLesson(e.id)}
      className="grid w-full grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-b border-linha py-3 text-left transition-colors hover:bg-sup-2/60"
    >
      <span className="t-dado text-sm text-texto-suave">{clock(e.start)}</span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{e.counterpart.name}</span>
        <span className="truncate text-sm text-texto-fraco">
          {e.title}
          {e.location ? ` · ${e.location}` : ''}
        </span>
      </span>
      <LessonStatusLabel
        lesson={{
          status: e.status as LessonStatus,
          scheduledAt: e.start,
          duration: e.lesson?.duration ?? 60,
        }}
        role={role}
      />
    </button>
  );
}

function FreeRow({
  w,
  role,
  onFree,
}: {
  w: { start: string; end: string };
  role: Role;
  onFree: (s: string) => void;
}) {
  const minutes =
    (new Date(w.end).getTime() - new Date(w.start).getTime()) / 60_000;
  return (
    <button
      type="button"
      onClick={() => onFree(w.start)}
      className="group/livre grid w-full grid-cols-[64px_minmax(0,1fr)] items-center gap-3 py-1.5 text-left"
    >
      <span className="t-dado text-sm text-texto-fraco">{clock(w.start)}</span>
      <span className="flex min-h-10 items-center justify-between rounded-controle border border-dashed border-linha-forte px-3 text-sm text-texto-fraco transition-[border-color,color] group-hover/livre:border-ouro/60 group-hover/livre:text-ouro-texto">
        <span>
          Livre até {clock(w.end)} · {duration(minutes)}
        </span>
        <span className="inline-flex items-center gap-1 font-medium">
          <Icon de={PiPlus} tamanho="pp" />{' '}
          {role === 'teacher' ? 'Marcar' : 'Pedir'}
        </span>
      </span>
    </button>
  );
}

/** Um dia (telefone): as aulas e as horas livres em ordem. */
function DayList({
  day,
  role,
  lessons,
  free,
  blocked,
  onLesson,
  onFree,
}: {
  day: string;
  role: Role;
  lessons: CalendarEvent[];
  free: Array<{ start: string; end: string }>;
  blocked: string | null;
  onLesson: (id: string) => void;
  onFree: (s: string) => void;
}) {
  const items = [
    ...lessons
      .filter((e) => dayOf(e.start) === day)
      .map((e) => ({
        at: e.start,
        node: <LessonRow key={e.id} e={e} role={role} onLesson={onLesson} />,
      })),
    ...inRange(free, day).map((w) => ({
      at: w.start,
      node: <FreeRow key={w.start} w={w} role={role} onFree={onFree} />,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-display text-2xl leading-tight first-letter:uppercase">
        {longDate(day)}
      </h2>
      {blocked ? (
        <Empty titulo={blocked} descricao="Você não atende neste dia." />
      ) : items.length === 0 ? (
        <Empty titulo="Nada neste dia" />
      ) : (
        <ol className="flex flex-col">
          {items.map((i) => (
            <li key={i.at}>{i.node}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** O mês, discreto: o número do dia e um ponto por aula. */
function Month({
  anchor,
  lessons,
  blocked,
  onDay,
}: {
  anchor: string;
  lessons: CalendarEvent[];
  blocked: (day: string) => string | null;
  onDay: (day: string) => void;
}) {
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of lessons)
      m.set(dayOf(e.start), [...(m.get(dayOf(e.start)) ?? []), e]);
    return m;
  }, [lessons]);
  const weeks = monthWeeks(anchor);
  return (
    <div className="max-w-3xl">
      <div className="grid grid-cols-7 pb-2 text-center text-xs text-texto-fraco">
        {weeks[0].map((d) => (
          <span key={d}>{dayShort(d)}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card border border-linha bg-linha">
        {weeks.flat().map((d) => {
          const list = byDay.get(d) ?? [];
          const label = `${longDate(d)}: ${list.length ? `${list.length} ${list.length === 1 ? 'aula' : 'aulas'}` : 'sem aula'}`;
          return (
            <button
              key={d}
              type="button"
              aria-label={label}
              title={
                list
                  .map(
                    (e) => `${clock(e.start)} ${firstName(e.counterpart.name)}`
                  )
                  .join('\n') || undefined
              }
              onClick={() => onDay(d)}
              className={cx(
                'flex aspect-square flex-col items-center justify-center gap-1.5 bg-fundo text-sm transition-colors hover:bg-sup-2 sm:aspect-[4/3]',
                !sameMonth(d, anchor) && 'text-texto-fraco/60',
                blocked(d) && 'portal-hachura'
              )}
            >
              <span
                className={cx(
                  't-dado',
                  d === today() &&
                    'grid h-7 w-7 place-items-center rounded-full fill-ouro text-sobre-ouro'
                )}
              >
                {dayOfMonth(d)}
              </span>
              <span aria-hidden="true" className="flex h-1.5 gap-0.5">
                {list.slice(0, 4).map((e) => (
                  <span
                    key={e.id}
                    className={cx(
                      'h-1.5 w-1.5 rounded-full',
                      e.status === 'CANCELLED'
                        ? 'bg-linha-forte'
                        : e.status === 'SCHEDULED' &&
                            new Date(e.end).getTime() < Date.now()
                          ? 'border border-ouro'
                          : 'bg-ouro'
                    )}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="t-legenda pt-3">Toque num dia para abrir a semana dele.</p>
    </div>
  );
}

/** A lista por dia (B): só os dias com aula, hora livre ou bloqueio. */
function ByDay({
  from,
  days,
  role,
  lessons,
  free,
  blockedOf,
  onLesson,
  onFree,
}: {
  from: string;
  days: number;
  role: Role;
  lessons: CalendarEvent[];
  free: Array<{ start: string; end: string }>;
  blockedOf: (d: string) => string | null;
  onLesson: (id: string) => void;
  onFree: (s: string) => void;
}) {
  const list = Array.from({ length: days }, (_, i) => addDays(from, i)).filter(
    (d) =>
      lessons.some((e) => dayOf(e.start) === d) ||
      inRange(free, d).length ||
      blockedOf(d)
  );
  if (!list.length)
    return (
      <Empty
        titulo="Nada nestas duas semanas"
        descricao="Ande com as setas, ou ligue as horas livres."
      />
    );
  return (
    <ol className="flex flex-col gap-10">
      {list.map((d) => (
        <li key={d} className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <h2
            className={cx(
              'font-display text-2xl leading-tight first-letter:uppercase',
              d === today() && 'text-ouro-texto'
            )}
          >
            {longDate(d)}
          </h2>
          <div className="flex flex-col">
            {blockedOf(d) && (
              <p className="portal-hachura rounded-controle px-4 py-3 text-sm text-texto-suave">
                {blockedOf(d)}
              </p>
            )}
            {[
              ...lessons
                .filter((e) => dayOf(e.start) === d)
                .map((e) => ({
                  at: e.start,
                  node: (
                    <LessonRow
                      key={e.id}
                      e={e}
                      role={role}
                      onLesson={onLesson}
                    />
                  ),
                })),
              ...inRange(free, d).map((w) => ({
                at: w.start,
                node: (
                  <FreeRow key={w.start} w={w} role={role} onFree={onFree} />
                ),
              })),
            ]
              .sort((a, b) => a.at.localeCompare(b.at))
              .map((i) => i.node)}
          </div>
        </li>
      ))}
    </ol>
  );
}
