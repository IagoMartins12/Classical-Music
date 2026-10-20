'use client';

import { useState } from 'react';
import { PiCalendarBlank, PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import {
  ON_THIS_DAY,
  daySlug,
  daysInMonth,
  today,
  type CalendarDay,
} from '@/app/conteudo/site/onThisDay';

const monthName = (month: number, language: Idioma) =>
  new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    timeZone: 'UTC',
    month: 'long',
  }).format(new Date(Date.UTC(2024, month - 1, 1)));

/**
 * "Pick a day": a month at a time, its days as a grid. No weekdays, because
 * the page is about a date in any year; every day links to its own page.
 */
export function DayPicker({
  current,
  language,
}: {
  current: CalendarDay;
  language: Idioma;
}) {
  const copy = ON_THIS_DAY[language];
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(current.month);
  const now = today();
  const shift = (by: 1 | -1) => setMonth((m) => ((m - 1 + by + 12) % 12) + 1);

  return (
    <>
      <Button
        tamanho="p"
        icone={PiCalendarBlank}
        onClick={() => {
          setMonth(current.month);
          setOpen(true);
        }}
      >
        {copy.pick}
      </Button>
      <Sheet
        aberto={open}
        aoFechar={() => setOpen(false)}
        titulo={copy.pick}
        largura="p"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiCaretLeft}
              rotulo={copy.prevMonth}
              onClick={() => shift(-1)}
            />
            <p
              className="font-display text-[1.5rem] first-letter:uppercase"
              aria-live="polite"
            >
              {monthName(month, language)}
            </p>
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiCaretRight}
              rotulo={copy.nextMonth}
              onClick={() => shift(1)}
            />
          </div>
          <ol className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: daysInMonth(month) }, (_, i) => {
              const day = { month, day: i + 1 };
              const isCurrent =
                current.month === month && current.day === i + 1;
              const isToday = now.month === month && now.day === i + 1;
              return (
                <li key={i}>
                  <Link
                    href={`/on-this-day/${daySlug(day)}`}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent ? 'date' : undefined}
                    className={cx(
                      't-dado grid aspect-square place-items-center rounded-controle text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
                      isCurrent
                        ? 'tint-ouro text-ouro-na-tinta'
                        : 'bg-sup-2 hover:text-ouro-texto',
                      isToday && !isCurrent && 'ring-1 ring-[var(--ouro)]'
                    )}
                  >
                    {i + 1}
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link
            href={`/on-this-day/${daySlug(now)}`}
            onClick={() => setOpen(false)}
            className={cx(classesDeBotao('texto', 'p'), 'self-start')}
          >
            {copy.goToday}
          </Link>
        </div>
      </Sheet>
    </>
  );
}
