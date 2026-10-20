'use client';

// components/Portal/schedule/Staff.tsx — a semana desenhada como pauta
//
// A assinatura do esboço B, escolhido para painel e calendário: cada dia é um
// compasso, as aulas são as notas, a altura é a hora do dia. É uma leitura
// real — dá para ver de relance os dias cheios e os vazios.
//
// A faixa de horas se ajusta às aulas (das 8h às 21h, abrindo se houver aula
// fora disso). No telefone a pauta corre de lado e já abre no dia de hoje.

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cx } from '@/app/components/ui/cx';
import type { LessonStatus } from '@/app/requests/portal/api';
import {
  clock,
  dayOf,
  dayOfMonth,
  dayShort,
  duration,
  hasPassed,
  longDate,
  minuteOfDay,
  today,
} from '../format';

export interface StaffLesson {
  id: string;
  start: string;
  duration: number;
  status: LessonStatus;
  /** Quem aparece na nota: o aluno (professor) ou o professor (aluno). */
  who: string;
  title: string;
}

export interface StaffDay {
  day: string;
  lessons: StaffLesson[];
  /** Período sem atendimento que cobre o dia. */
  blocked?: string | null;
  /** Janelas livres do dia (instantes ISO). */
  free?: Array<{ start: string; end: string }>;
  /** Minutos livres do dia; `null` sem agenda declarada. */
  freeMinutes?: number | null;
}

const FIRST = 8;
const LAST = 21;

export function Staff({
  days,
  height = 220,
  hours = false,
  showFree = false,
  nextLessonId,
  onLesson,
  onFree,
  label,
  selectedId,
  footer,
}: {
  days: StaffDay[];
  height?: number;
  hours?: boolean;
  showFree?: boolean;
  nextLessonId?: string | null;
  onLesson: (id: string) => void;
  onFree?: (startIso: string) => void;
  label: string;
  selectedId?: string | null;
  /** Uma linha própria embaixo da pauta, no lugar das horas livres: o título
   * ocupa a largura toda e cada dia ganha sua célula, alinhada ao compasso. */
  footer?: {
    label: ReactNode;
    cell: (day: string) => ReactNode;
    className?: string;
  };
}) {
  const todayIso = today();
  const scroller = useRef<HTMLDivElement>(null);

  // A faixa de horas cobre todas as aulas da semana.
  const [from, to] = useMemo(() => {
    let lo = FIRST * 60;
    let hi = LAST * 60;
    for (const d of days)
      for (const l of d.lessons) {
        lo = Math.min(lo, minuteOfDay(l.start));
        hi = Math.max(hi, minuteOfDay(l.start) + l.duration);
      }
    return [
      Math.floor(lo / 60) * 60,
      Math.min(24 * 60, Math.ceil(hi / 60) * 60),
    ];
  }, [days]);
  const y = (minutes: number) => ((minutes - from) / (to - from)) * 100;

  // No telefone, a pauta abre no dia de hoje.
  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const col = el.querySelector<HTMLElement>(`[data-dia="${todayIso}"]`);
    if (col) el.scrollLeft = Math.max(0, col.offsetLeft - 56);
  }, [todayIso, days]);

  const nowMinute = minuteOfDay(new Date());
  const ticks = [];
  for (let h = Math.ceil(from / 60 / 3) * 3; h * 60 <= to; h += 3)
    ticks.push(h);
  let n = 0;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="sr-only">{label}</figcaption>
      <div
        ref={scroller}
        className="-mx-4 overflow-x-auto px-4 pb-2 rolagem-discreta sm:mx-0 sm:px-0"
      >
        <div
          className={cx(
            'grid min-w-[700px]',
            hours ? 'grid-cols-[44px_repeat(7,minmax(0,1fr))]' : 'grid-cols-7'
          )}
        >
          {hours && <span />}
          {days.map(({ day }) => (
            <span key={day} className="flex items-baseline gap-1.5 px-2 pb-2">
              <span
                className={cx(
                  'text-xs',
                  day === todayIso
                    ? 'font-medium text-ouro-texto'
                    : 'text-texto-fraco'
                )}
              >
                {dayShort(day)}
              </span>
              <span
                className={cx(
                  't-dado text-sm',
                  day === todayIso ? 'text-ouro-texto' : 'text-texto-suave'
                )}
              >
                {dayOfMonth(day)}
              </span>
            </span>
          ))}

          {hours && (
            <div className="relative" style={{ height }}>
              {ticks.map((h) => (
                <span
                  key={h}
                  className="t-dado absolute right-2 -translate-y-1/2 text-[0.6875rem] text-texto-fraco"
                  style={{ top: `${y(h * 60)}%` }}
                >
                  {h}h
                </span>
              ))}
            </div>
          )}

          {days.map((d, i) => (
            <div
              key={d.day}
              data-dia={d.day}
              className={cx(
                'pauta-compasso relative',
                i === 0 && 'border-l-2 border-l-texto-suave/70',
                i === days.length - 1 && 'pauta-final',
                d.blocked && 'portal-hachura'
              )}
              style={{ height }}
            >
              <span
                aria-hidden="true"
                className="pauta-linhas absolute inset-0"
              />
              {d.blocked && (
                <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-controle bg-fundo px-2 py-1 text-center text-xs text-texto-suave">
                  {d.blocked}
                </span>
              )}
              {showFree &&
                onFree &&
                (d.free ?? []).map((w) => {
                  const top = y(minuteOfDay(w.start));
                  const bottom = y(
                    dayOf(w.end) === d.day ? minuteOfDay(w.end) : to
                  );
                  if (bottom - top <= 0) return null;
                  return (
                    <button
                      key={w.start}
                      type="button"
                      onClick={() => onFree(w.start)}
                      aria-label={`Livre de ${clock(w.start)} a ${clock(w.end)}, ${longDate(d.day)}`}
                      className="absolute inset-x-1.5 rounded-controle border border-dashed border-ouro/45 transition-colors hover:border-ouro hover:bg-ouro/5"
                      style={{
                        top: `${Math.max(0, top)}%`,
                        height: `${Math.min(100, bottom) - Math.max(0, top)}%`,
                      }}
                    />
                  );
                })}
              {d.lessons.map((l) => {
                const pending =
                  l.status === 'SCHEDULED' && hasPassed(l.start, l.duration);
                const next = l.id === nextLessonId;
                const selected = l.id === selectedId;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onLesson(l.id)}
                    aria-label={`${clock(l.start)}, ${l.who}, ${l.title}${pending ? ', sem desfecho' : ''}`}
                    aria-pressed={
                      selectedId !== undefined ? selected : undefined
                    }
                    className={cx(
                      'pauta-nota absolute inset-x-1.5 z-elevado flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-left text-xs',
                      'transition-[box-shadow,transform] duration-[var(--t-toque)] ease-saida hover:shadow-[var(--sombra-2)]',
                      selected &&
                        'outline outline-2 outline-offset-2 outline-ouro',
                      pending
                        ? 'border border-dashed border-ouro bg-fundo text-texto'
                        : l.status === 'CANCELLED'
                          ? 'bg-fundo text-texto-fraco line-through'
                          : next
                            ? 'fill-ouro text-sobre-ouro'
                            : l.status !== 'SCHEDULED' ||
                                hasPassed(l.start, l.duration)
                              ? 'border border-linha-forte bg-fundo text-texto-suave'
                              : 'sup-1 text-texto'
                    )}
                    style={
                      {
                        top: `calc(${y(minuteOfDay(l.start))}% - 14px)`,
                        '--i': n++,
                      } as CSSProperties
                    }
                  >
                    <span className="t-dado">{clock(l.start)}</span>
                    <span className="truncate font-medium">{l.who}</span>
                  </button>
                );
              })}
              {d.day === todayIso && nowMinute >= from && nowMinute <= to && (
                <span
                  aria-hidden="true"
                  className="portal-agora absolute inset-x-0 z-elevado h-0.5 bg-ouro"
                  style={{ top: `${y(nowMinute)}%` }}
                />
              )}
            </div>
          ))}

          {footer ? (
            <>
              <div className={cx('col-span-full', footer.className)}>
                <div className="sticky left-0 w-fit max-w-full">
                  {footer.label}
                </div>
              </div>
              {hours && <span />}
              {days.map((d) => (
                <div key={d.day} className="px-2">
                  {footer.cell(d.day)}
                </div>
              ))}
            </>
          ) : (
            <>
              {hours && <span />}
              {days.map((d) => (
                <span
                  key={d.day}
                  className="t-dado px-2 pt-2 text-[0.6875rem] text-texto-fraco"
                >
                  {d.day < todayIso ||
                  d.freeMinutes === undefined ||
                  d.freeMinutes === null ||
                  d.blocked
                    ? ' '
                    : d.freeMinutes > 0
                      ? `${duration(d.freeMinutes)} livres`
                      : 'cheio'}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </figure>
  );
}

/** A legenda da pauta. */
export function StaffLegend({
  showFree,
  role,
}: {
  showFree?: boolean;
  role: 'teacher' | 'student';
}) {
  return (
    <p className="t-legenda flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-6 rounded-full fill-ouro" /> Próxima aula
      </span>
      {role === 'teacher' && (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-6 rounded-full border border-dashed border-ouro" />{' '}
          Sem desfecho
        </span>
      )}
      {showFree && (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-6 rounded-full border border-dashed border-ouro/45" />{' '}
          Livre — toque para {role === 'teacher' ? 'marcar' : 'pedir'}
        </span>
      )}
    </p>
  );
}
