'use client';

// O estudo de um aluno visto pelo professor — o gráfico do esboço C, que
// abre no chevron da lista de alunos (em todos os tamanhos) e mora também na
// página do aluno: a semana dia a dia, as quatro últimas semanas e o que ele
// mais estudou.

import { useMemo } from 'react';
import { cx } from '@/app/components/ui/cx';
import { errorText, usePractice } from '@/app/hooks/portal/query';
import {
  addDays,
  dayOf,
  duration,
  shortDate,
  today,
  weekStart,
} from '../format';
import { PracticeWeek, ScreenError } from '../pieces';
import { Skeleton } from '@/app/components/ui/Skeleton';

export function StudentPractice({
  studentId,
  compact = false,
}: {
  studentId: string;
  compact?: boolean;
}) {
  const from = useMemo(() => addDays(weekStart(today()), -21), []);
  const practice = usePractice({ studentId, from });

  const weeks = useMemo(() => {
    const entries = practice.data?.entries ?? [];
    return [0, 1, 2, 3].map((i) => {
      const start = addDays(from, i * 7);
      const end = addDays(start, 7);
      const minutes = entries
        .filter((e) => {
          const d = dayOf(e.practicedAt);
          return d >= start && d < end;
        })
        .reduce((s, e) => s + e.minutes, 0);
      return { start, minutes };
    });
  }, [practice.data, from]);

  if (practice.isPending)
    return (
      <div className="grid gap-6 sm:grid-cols-2" aria-busy="true">
        <Skeleton forma="bloco" className="h-24 w-full" />
        <Skeleton forma="bloco" className="h-24 w-full" />
      </div>
    );
  if (practice.error)
    return (
      <ScreenError
        message={errorText(practice.error)}
        onRetry={() => practice.refetch()}
      />
    );

  const p = practice.data!;
  const weekAgo = addDays(today(), -6);
  const last7 = p.days.filter((d) => d.date >= weekAgo);
  const goal = p.weeklyGoalMinutes;
  const top = Math.max(goal ?? 0, ...weeks.map((w) => w.minutes), 1);
  const nothing = weeks.every((w) => w.minutes === 0);

  if (nothing)
    return (
      <p className="text-sm text-texto-fraco">
        Nenhuma prática registrada nas últimas quatro semanas. O aluno registra
        pelo portal, com o cronômetro ou dizendo o tempo.
      </p>
    );

  return (
    <div
      className={cx(
        'grid gap-8',
        compact
          ? 'sm:grid-cols-2'
          : 'md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]'
      )}
    >
      <div className="flex flex-col gap-2">
        <span className="t-legenda">
          Últimos 7 dias · {duration(last7.reduce((s, d) => s + d.minutes, 0))}
          {goal ? ` de ${duration(goal)}` : ''}
        </span>
        <PracticeWeek days={last7} goal={goal} height={64} />
      </div>
      <figure className="flex flex-col gap-2">
        <figcaption className="t-legenda">Por semana</figcaption>
        <ul className="flex flex-col gap-2">
          {weeks.map((w) => (
            <li
              key={w.start}
              className="grid grid-cols-[52px_minmax(0,1fr)_56px] items-center gap-2 text-sm"
            >
              <span className="t-dado text-texto-fraco">
                {shortDate(w.start)}
              </span>
              <span
                className="relative block h-2 rounded-full bg-sup-2"
                aria-hidden="true"
              >
                <span
                  className="portal-cresce absolute inset-y-0 left-0 rounded-full bg-ouro"
                  style={{ width: `${(w.minutes / top) * 100}%` }}
                />
              </span>
              <span className="t-dado text-right text-texto-suave">
                {duration(w.minutes)}
              </span>
            </li>
          ))}
        </ul>
      </figure>
      {!compact && p.subjects.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="t-legenda">O que mais estudou</span>
          <ul className="flex flex-col gap-1.5">
            {p.subjects.slice(0, 4).map((s) => (
              <li
                key={s.subject}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="truncate text-texto">{s.subject}</span>
                <span className="t-dado shrink-0 text-texto-suave">
                  {duration(s.minutes)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
