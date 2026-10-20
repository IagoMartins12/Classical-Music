'use client';

// O horário de atendimento, de um jeito que se entende olhando: um modelo
// pronto para começar (tardes, manhãs, noites, dia inteiro), e cada dia com
// o interruptor, as horas em listas de meia em meia hora e uma faixa das 6h
// às 23h com o trecho em que você atende. Embaixo, o total da semana.

import { Chip } from '@/app/components/ui/Badge';
import { Selecao } from '@/app/components/ui/Selecao';
import { cx } from '@/app/components/ui/cx';
import { duration } from '../format';

export type WeekHours = Record<
  number,
  { on: boolean; from: string; to: string }
>;

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const START = 6 * 60;
const END = 23 * 60;
const minutesOf = (t: string) =>
  Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const pad = (n: number) => String(n).padStart(2, '0');
const TIMES = Array.from({ length: (END - START) / 30 + 1 }, (_, i) => {
  const m = START + i * 30;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
});
/** A lista de meia em meia hora, com o valor atual se ele estiver fora dela. */
const timesWith = (value: string) =>
  TIMES.includes(value) ? TIMES : [...TIMES, value].sort();
const spoken = (t: string) =>
  t.endsWith(':00')
    ? `${Number(t.slice(0, 2))}h`
    : `${Number(t.slice(0, 2))}h${t.slice(3)}`;

const PRESETS: Array<{
  label: string;
  days: number[];
  from: string;
  to: string;
}> = [
  {
    label: 'Tardes, seg a sex',
    days: [1, 2, 3, 4, 5],
    from: '14:00',
    to: '20:00',
  },
  {
    label: 'Manhãs, seg a sex',
    days: [1, 2, 3, 4, 5],
    from: '08:00',
    to: '12:00',
  },
  {
    label: 'Noites, seg a sex',
    days: [1, 2, 3, 4, 5],
    from: '18:00',
    to: '22:00',
  },
  {
    label: 'Dia inteiro, seg a sáb',
    days: [1, 2, 3, 4, 5, 6],
    from: '09:00',
    to: '19:00',
  },
];

export const weekMinutes = (days: WeekHours) =>
  Object.values(days)
    .filter((d) => d.on)
    .reduce((s, d) => s + Math.max(0, minutesOf(d.to) - minutesOf(d.from)), 0);

export function WeekHoursEditor({
  days,
  onChange,
}: {
  days: WeekHours;
  onChange: (days: WeekHours) => void;
}) {
  const set = (d: number, patch: Partial<WeekHours[number]>) =>
    onChange({ ...days, [d]: { ...days[d], ...patch } });
  const x = (m: number) => ((m - START) / (END - START)) * 100;
  const total = weekMinutes(days);
  const active = ORDER.filter((d) => days[d].on).length;
  const isPreset = (p: (typeof PRESETS)[number]) =>
    ORDER.every((d) =>
      p.days.includes(d)
        ? days[d].on && days[d].from === p.from && days[d].to === p.to
        : !days[d].on
    );

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="t-rotulo mb-2 font-medium text-texto">
          Comece por um modelo
        </legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Chip
              key={p.label}
              selecionado={isPreset(p)}
              onClick={() =>
                onChange(
                  Object.fromEntries(
                    ORDER.map((d) => [
                      d,
                      { on: p.days.includes(d), from: p.from, to: p.to },
                    ])
                  ) as WeekHours
                )
              }
            >
              {p.label}
            </Chip>
          ))}
        </div>
        <p className="t-legenda">
          Depois ajuste dia a dia. O almoço e outros intervalos você divide
          depois, no Horário de atendimento.
        </p>
      </fieldset>

      <ul className="flex flex-col rounded-card bg-sup-2 px-4">
        {ORDER.map((d) => {
          const day = days[d];
          const a = minutesOf(day.from);
          const b = minutesOf(day.to);
          const invalid = day.on && b <= a;
          return (
            <li
              key={d}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-linha py-3 last:border-0 sm:grid-cols-[132px_minmax(0,1fr)_auto]"
            >
              <button
                type="button"
                role="switch"
                aria-checked={day.on}
                onClick={() => set(d, { on: !day.on })}
                className="flex min-h-10 items-center gap-3 text-left text-[0.9375rem]"
              >
                <span
                  className={cx(
                    'relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-[var(--t-resposta)]',
                    day.on ? 'bg-ouro' : 'bg-linha-forte'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-fundo shadow-[var(--sombra-1)] transition-transform duration-[var(--t-resposta)] ease-saida',
                      day.on ? 'translate-x-[1.125rem]' : 'translate-x-0.5'
                    )}
                  />
                </span>
                <span
                  className={
                    day.on ? 'font-medium text-texto' : 'text-texto-fraco'
                  }
                >
                  {WEEKDAYS[d]}
                </span>
              </button>

              {/* A faixa do dia, das 6h às 23h. */}
              <span
                aria-hidden="true"
                className="relative order-last col-span-2 h-2.5 rounded-full bg-fundo sm:order-none sm:col-span-1"
              >
                {day.on && !invalid && (
                  <span
                    className="absolute inset-y-0 rounded-full bg-ouro transition-[left,width] duration-[var(--t-entrada)] ease-saida"
                    style={{ left: `${x(a)}%`, width: `${x(b) - x(a)}%` }}
                  />
                )}
                {[12, 18].map((h) => (
                  <span
                    key={h}
                    className="absolute -bottom-4 -translate-x-1/2 text-[0.625rem] text-texto-fraco"
                    style={{ left: `${x(h * 60)}%` }}
                  >
                    {h}h
                  </span>
                ))}
              </span>

              {day.on ? (
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="w-[6.5rem]">
                    <Selecao
                      aria-label={`${WEEKDAYS[d]}, das`}
                      className="t-dado py-1.5!"
                      opcoes={timesWith(day.from).map((t) => ({
                        value: t,
                        label: spoken(t),
                      }))}
                      valor={day.from}
                      aoMudar={(v) => set(d, { from: v })}
                    />
                  </span>
                  <span className="text-texto-fraco">às</span>
                  <span className="w-[6.5rem]">
                    <Selecao
                      aria-label={`${WEEKDAYS[d]}, até`}
                      className="t-dado py-1.5!"
                      opcoes={timesWith(day.to).map((t) => ({
                        value: t,
                        label: spoken(t),
                      }))}
                      valor={day.to}
                      aoMudar={(v) => set(d, { to: v })}
                    />
                  </span>
                </span>
              ) : (
                <span className="text-sm text-texto-fraco">Não atende</span>
              )}
              {invalid && (
                <span className="col-span-full text-sm text-erro">
                  O fim precisa vir depois do começo.
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-[0.9375rem] text-texto-suave">
        {active === 0 ? (
          'Nenhum dia marcado: sem horário declarado, os alunos não veem horas livres para pedir aula.'
        ) : (
          <>
            <span className="t-dado text-texto">{duration(total)}</span> por
            semana, em {active} {active === 1 ? 'dia' : 'dias'}.
          </>
        )}
      </p>
    </div>
  );
}
