'use client';

// components/Portal/pieces.tsx — o vocabulário comum das telas do portal
//
// Vem dos esboços de 01/10 (apagados em 05/10, depois da escolha) com os dados de
// verdade: situação de aula, obra citada, prática da semana, o que a agenda
// diz de um horário. Cor só onde pede ação (ouro) ou em atraso (atenção).

import Link from 'next/link';
import { TentarDeNovo } from '@/app/components/ui/TentarDeNovo';
import type { CSSProperties, ReactNode } from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowLeft,
  PiCheck,
  PiInfo,
  PiMagnifyingGlass,
  PiPlus,
  PiProhibit,
  PiWarning,
} from 'react-icons/pi';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Erro, Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { AreaCarregando, Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';
import type {
  Finding,
  LessonStatus,
  Role,
  Severity,
} from '@/app/requests/portal/api';
import { SKILL_LABEL, SKILLS, type Skill } from '@/app/requests/portal/api';
import {
  addDays,
  dayOf,
  dayShort,
  duration,
  hasPassed,
  initials,
  when,
} from './format';

// ---------------------------------------------------------------------------
// A marca — a família da marca do blog: o piano com brilho, "Opus Atlas" com
// o clarão dourado e o lema, que entra de novo quando o papel troca.
// ---------------------------------------------------------------------------

const MOTTO: Record<Role, string> = {
  teacher: 'Para quem ensina música',
  student: 'Para quem estuda música',
};

export function Brand({
  role,
  className,
  small = false,
}: {
  role: Role;
  className?: string;
  small?: boolean;
}) {
  return (
    <Link
      href={`/${role}`}
      aria-label={`Portal do Opus Atlas — ${MOTTO[role]}`}
      className={cx(
        'group/marca flex min-h-[var(--alvo)] shrink-0 items-center gap-2.5 rounded-controle',
        className
      )}
    >
      <GiGrandPiano
        aria-hidden="true"
        className="icon-glow h-7 w-7 shrink-0 text-ouro-texto transition-transform duration-300 group-hover/marca:scale-110 motion-reduce:transition-none sm:h-8 sm:w-8"
      />
      <span className="flex flex-col">
        <span
          className={cx(
            'whitespace-nowrap font-display leading-none',
            small ? 'text-[1.0625rem]' : 'text-[1.125rem] sm:text-[1.3125rem]'
          )}
        >
          <span className="italic text-texto-suave">Portal do </span>
          <span className="gold-shine font-semibold">Opus Atlas</span>
        </span>
        <span
          key={role}
          className="entra mt-1 text-[0.75rem] leading-none text-texto-fraco"
        >
          {MOTTO[role]}
        </span>
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Pessoa: a foto quando há, as iniciais em Garamond quando não
// ---------------------------------------------------------------------------

const AVATAR = {
  p: 'h-8 w-8 text-sm',
  m: 'h-10 w-10 text-base',
  g: 'h-14 w-14 text-xl',
} as const;

export function Avatar({
  name,
  image,
  size = 'm',
  className,
}: {
  name: string;
  image?: string | null;
  size?: keyof typeof AVATAR;
  className?: string;
}) {
  if (image)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar pequeno, de qualquer domínio
      <img
        src={image}
        alt=""
        loading="lazy"
        className={cx(
          'shrink-0 rounded-full object-cover',
          AVATAR[size],
          className
        )}
      />
    );
  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid shrink-0 place-items-center rounded-full bg-sup-2 font-display text-ouro-texto',
        AVATAR[size],
        className
      )}
    >
      {initials(name) || '·'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// O topo de cada tela — o título em Garamond entra em cascata, como na
// criação de aula escolhida em 04/10; a mesma voz em todas as telas.
// ---------------------------------------------------------------------------

export function PageHeader({
  title,
  description,
  actions,
  back,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx('flex flex-col gap-5 pb-10 sm:pb-12', className)}>
      {back && (
        <Link
          href={back.href}
          className="entra inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-ouro-texto"
        >
          <Icon de={PiArrowLeft} tamanho="p" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="flex min-w-0 max-w-[60ch] flex-col gap-4">
          <h1
            className="entra font-display text-[2.25rem] leading-[1.05] tracking-[-0.01em] first-letter:uppercase sm:text-[2.75rem]"
            style={{ '--i': 0 } as CSSProperties}
          >
            {title}
          </h1>
          {description && (
            <div
              className="entra text-balance font-display text-lg leading-snug text-texto-suave sm:text-xl"
              style={{ '--i': 1 } as CSSProperties}
            >
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div
            data-ajuda="acao"
            className="entra flex flex-wrap gap-2"
            style={{ '--i': 2 } as CSSProperties}
          >
            {actions}
          </div>
        )}
      </div>
      {children && (
        <div className="entra" style={{ '--i': 3 } as CSSProperties}>
          {children}
        </div>
      )}
    </header>
  );
}

/** Título de seção: Garamond, filete embaixo, detalhe e ação à direita. */
export function SectionTitle({
  children,
  detail,
  action,
  as: Tag = 'h2',
}: {
  children: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
  as?: 'h2' | 'h3';
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-linha pb-3">
      <span className="flex min-w-0 flex-col gap-1">
        <Tag className="font-display text-[1.625rem] leading-tight sm:text-[1.75rem]">
          {children}
        </Tag>
        {detail && <span className="t-legenda">{detail}</span>}
      </span>
      {action}
    </div>
  );
}

export function Section({
  title,
  detail,
  action,
  help,
  id,
  children,
  className,
}: {
  title: string;
  detail?: ReactNode;
  action?: ReactNode;
  help?: string;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-ajuda={help}
      className={cx('flex scroll-mt-24 flex-col gap-4', className)}
    >
      <SectionTitle detail={detail} action={action}>
        {title}
      </SectionTitle>
      {children}
    </section>
  );
}

/**
 * Um pedaço de frase que é, ao mesmo tempo, a ação ("Duas aulas esperam
 * desfecho"). Um `<button>` não quebra linha — a pontuação caía sozinha na
 * linha seguinte —; um trecho com papel de botão quebra como texto.
 */
export function PhraseAction({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const classes =
    'cursor-pointer rounded-[2px] text-texto underline decoration-ouro/50 decoration-1 underline-offset-[0.18em] transition-[text-decoration-color,color] duration-[var(--t-toque)] hover:text-ouro-texto hover:decoration-ouro';
  if (href)
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={classes}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Aula
// ---------------------------------------------------------------------------

export type LessonState =
  | 'scheduled'
  | 'pending-outcome'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'rescheduled';

/** A situação de leitura: agendada que já passou é "sem desfecho". */
export function lessonState(lesson: {
  status: LessonStatus;
  scheduledAt: string;
  duration: number;
}): LessonState {
  if (lesson.status === 'SCHEDULED')
    return hasPassed(lesson.scheduledAt, lesson.duration)
      ? 'pending-outcome'
      : 'scheduled';
  if (lesson.status === 'COMPLETED') return 'completed';
  if (lesson.status === 'CANCELLED') return 'cancelled';
  if (lesson.status === 'NO_SHOW') return 'no-show';
  return 'rescheduled';
}

const STATE_LABEL: Record<LessonState, string> = {
  scheduled: 'Marcada',
  'pending-outcome': 'Sem desfecho',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  'no-show': 'Faltou',
  rescheduled: 'Remarcada',
};

export function LessonStatusLabel({
  lesson,
  role = 'teacher',
}: {
  lesson: { status: LessonStatus; scheduledAt: string; duration: number };
  role?: Role;
}) {
  const state = lessonState(lesson);
  // Sem desfecho é trabalho do professor: ouro. Para o aluno, é só "aconteceu".
  if (state === 'pending-outcome')
    return role === 'teacher' ? (
      <Badge estado="ouro">Sem desfecho</Badge>
    ) : (
      <span className="text-[0.8125rem] text-texto-suave">
        Aguardando o registro
      </span>
    );
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap text-[0.8125rem]',
        state === 'cancelled'
          ? 'text-texto-fraco line-through decoration-texto-fraco/60'
          : 'text-texto-suave'
      )}
    >
      {state === 'completed' && <Icon de={PiCheck} tamanho="pp" />}
      {STATE_LABEL[state]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Obra citada — o que liga a aula à enciclopédia
// ---------------------------------------------------------------------------

export function WorkCited({
  work,
  compact = false,
  link = true,
}: {
  work: {
    id: string;
    title: string;
    composer?: { id?: string; name: string; fullName?: string | null } | null;
  };
  compact?: boolean;
  link?: boolean;
}) {
  const title = (
    <span
      className={cx(
        'font-display leading-snug text-texto',
        compact ? 'text-[1.0625rem]' : 'text-lg'
      )}
    >
      {work.title}
    </span>
  );
  return (
    <span className="flex min-w-0 flex-col">
      {link ? (
        <Link
          href={`/works/${work.id}`}
          className="w-fit decoration-ouro/50 underline-offset-4 hover:underline"
        >
          {title}
        </Link>
      ) : (
        title
      )}
      {work.composer && (
        <span className="t-legenda">
          {work.composer.fullName?.trim() || work.composer.name}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Progresso: um traço de ouro, sem anel nem porcentagem gritando
// ---------------------------------------------------------------------------

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx(
        'block h-1 overflow-hidden rounded-full bg-sup-2',
        className
      )}
    >
      <span
        className="portal-cresce block h-full origin-left rounded-full bg-ouro"
        style={{ width: `${v}%` }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Prática da semana — barras com o dia embaixo e a meta como linha
// ---------------------------------------------------------------------------

export function PracticeWeek({
  days: input,
  goal,
  height = 96,
  className,
}: {
  /** Os dias com prática (os outros contam zero); desenha os 7 até hoje. */
  days: Array<{ date: string; minutes: number }>;
  /** Meta semanal em minutos; `null` sem meta. */
  goal: number | null;
  height?: number;
  className?: string;
}) {
  const todayIso = dayOf(new Date());
  // A API manda só os dias com prática; a semana desenhada tem os sete dias
  // até hoje, com zero onde não houve.
  const byDay = new Map(input.map((d) => [d.date, d.minutes]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(todayIso, i - 6);
    return { date, minutes: byDay.get(date) ?? 0 };
  });
  const total = days.reduce((s, d) => s + d.minutes, 0);
  const daily = goal ? goal / 7 : 0;
  const top = Math.max(daily * 1.6, ...days.map((d) => d.minutes), 1);

  return (
    <figure className={cx('flex flex-col gap-3', className)}>
      <figcaption className="sr-only">
        {`Prática nos últimos sete dias: ${duration(total)}${goal ? ` de ${duration(goal)} da meta` : ''}.`}
      </figcaption>
      <div className="relative flex items-end gap-1.5" style={{ height }}>
        {daily > 0 && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 border-t border-dashed border-ouro/45"
            style={{ bottom: `${(daily / top) * 100}%` }}
          />
        )}
        {days.map((d) => (
          <span
            key={d.date}
            aria-hidden="true"
            title={d.minutes ? duration(d.minutes) : 'Sem prática'}
            className="relative flex h-full flex-1 items-end justify-center"
          >
            {/* Barra de largura contida: na coluna larga, um dia com prática
                não vira um bloco. */}
            <span
              className={cx(
                'portal-sobe block w-full max-w-8 rounded-t-[4px]',
                d.date === todayIso ? 'bg-ouro' : 'bg-linha-forte',
                d.minutes === 0 && 'h-[2px] rounded-none bg-linha'
              )}
              style={
                d.minutes
                  ? { height: `${(d.minutes / top) * 100}%` }
                  : undefined
              }
            />
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="flex gap-1.5">
        {days.map((d) => (
          <span
            key={d.date}
            className={cx(
              'flex-1 text-center text-[0.75rem]',
              d.date === todayIso
                ? 'font-medium text-ouro-texto'
                : 'text-texto-fraco'
            )}
          >
            {dayShort(d.date).slice(0, 3)}
          </span>
        ))}
      </div>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Pequenos
// ---------------------------------------------------------------------------

export function AddButton({
  children,
  onClick,
  href,
}: {
  children: string;
  onClick?: () => void;
  href?: string;
}) {
  const classes =
    'inline-flex min-h-9 items-center gap-1.5 rounded-controle px-2 text-sm font-medium text-ouro-texto transition-colors duration-[var(--t-toque)] hover:bg-sup-2 [@media(pointer:coarse)]:min-h-[var(--alvo)]';
  const body = (
    <>
      <Icon de={PiPlus} tamanho="p" />
      {children}
    </>
  );
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-ouro-texto hover:underline hover:underline-offset-4"
    >
      {children}
    </Link>
  );
}

export function Block({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('flex flex-col gap-3', className)}>
      <h3 className="t-rotulo font-medium text-texto">{title}</h3>
      {children}
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((i) => (
        <li key={i} className="flex gap-3 text-[0.9375rem] text-texto-suave">
          <span
            aria-hidden="true"
            className="mt-[0.7rem] h-px w-3 shrink-0 bg-ouro"
          />
          {i}
        </li>
      ))}
    </ul>
  );
}

/** Escolha de um entre poucos: fichas com `aria-pressed`. */
export function Options<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="t-rotulo mb-2 font-medium text-texto">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={String(o.value)}
            selecionado={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Fichas de filtro: quebram linha no computador e correm de lado no telefone
 * (pedido de 04/10 — a fila de fichas não empurra a lista para baixo).
 */
export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  label = 'Filtrar',
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<[T, string, number?]>;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      data-ajuda="filtros"
      className={cx(
        'flex gap-2 max-sm:-mx-4 max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-1 max-sm:[scrollbar-width:none] sm:flex-wrap',
        className
      )}
    >
      {options.map(([id, text, count]) => (
        <Chip
          key={id}
          selecionado={value === id}
          onClick={() => onChange(id)}
          className="shrink-0"
        >
          {text}
          {count ? (
            <span className="t-dado ml-1.5 text-xs opacity-80">{count}</span>
          ) : null}
        </Chip>
      ))}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <label className={cx('relative', className)}>
      <span className="sr-only">{label}</span>
      <Icon
        de={PiMagnifyingGlass}
        tamanho="p"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-fraco"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="input-classical w-full pl-9"
      />
    </label>
  );
}

/** Nota de 1 a 5 em pontos de ouro — engajamento, preparo, avaliação. */
export function Rating({
  label,
  value,
  onChange,
  ends,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  ends: [string, string];
}) {
  // Os extremos ficam embaixo dos pontos: lado a lado, numa coluna estreita,
  // o rótulo empurrava os pontos para fora (folha de fechar aula).
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="t-rotulo mb-2 font-medium text-texto">{label}</legend>
      <div className="flex w-fit flex-col gap-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} de 5${n === 1 ? ` (${ends[0]})` : n === 5 ? ` (${ends[1]})` : ''}`}
              aria-pressed={n === value}
              onClick={() => onChange(n)}
              className="grid h-10 w-10 place-items-center rounded-full [@media(pointer:coarse)]:h-[var(--alvo)] [@media(pointer:coarse)]:w-[var(--alvo)]"
            >
              <span
                className={cx(
                  'h-4 w-4 rounded-full border transition-[background-color,border-color,transform] duration-[var(--t-toque)] ease-saida',
                  n <= value
                    ? 'scale-110 border-ouro bg-ouro'
                    : 'border-linha-forte'
                )}
              />
            </button>
          ))}
        </div>
        <div aria-hidden="true" className="flex justify-between gap-4 px-1">
          <span className="t-legenda">{ends[0]}</span>
          <span className="t-legenda">{ends[1]}</span>
        </div>
      </div>
    </fieldset>
  );
}

/**
 * Nota por habilidade (relatório pedagógico): uma linha por habilidade da
 * lista fixa, cinco pontos cada. Tudo opcional — tocar no ponto marcado limpa.
 */
export function SkillRatings({
  value,
  onChange,
}: {
  value: Partial<Record<Skill, number>>;
  onChange: (next: Partial<Record<Skill, number>>) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="t-rotulo mb-1 font-medium text-texto">
        Como foi cada habilidade
      </legend>
      <p className="t-legenda mb-2">
        Opcional. Marque só o que vocês trabalharam: vira a curva de evolução do
        relatório.
      </p>
      <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        {SKILLS.map((skill) => {
          const current = value[skill] ?? 0;
          return (
            <li key={skill} className="flex items-center justify-between gap-3">
              <span
                className={cx(
                  'text-[0.9375rem]',
                  current ? 'text-texto' : 'text-texto-suave'
                )}
              >
                {SKILL_LABEL[skill]}
              </span>
              <span className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${SKILL_LABEL[skill]}: ${n} de 5`}
                    aria-pressed={n === current}
                    onClick={() => {
                      const next = { ...value };
                      if (n === current) delete next[skill];
                      else next[skill] = n;
                      onChange(next);
                    }}
                    className="grid h-9 w-8 place-items-center rounded-full [@media(pointer:coarse)]:h-[var(--alvo)]"
                  >
                    <span
                      className={cx(
                        'h-3 w-3 rounded-full border transition-[background-color,border-color] duration-[var(--t-toque)] ease-saida',
                        n <= current
                          ? 'border-ouro bg-ouro'
                          : 'border-linha-forte'
                      )}
                    />
                  </button>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// O que a agenda diz de um horário — a saída de `POST /lessons/check`
// ---------------------------------------------------------------------------

const WEIGHT = {
  blocking: { icon: PiProhibit, tone: 'text-erro', label: 'Impede' },
  conflict: { icon: PiWarning, tone: 'text-atencao', label: 'Conflito' },
  warning: { icon: PiInfo, tone: 'text-texto-suave', label: 'Aviso' },
  ok: { icon: PiCheck, tone: 'text-ouro-texto', label: 'Certo' },
} as const;

const ORDER: Severity[] = ['blocking', 'conflict', 'warning', 'ok'];

export function FindingsList({
  findings,
  className,
}: {
  findings: Finding[];
  className?: string;
}) {
  const list = findings.length
    ? [...findings].sort(
        (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity)
      )
    : [
        {
          code: 'OK',
          severity: 'ok' as const,
          message: 'Horário livre: nada choca e está dentro do atendimento.',
        },
      ];
  return (
    <ul className={cx('flex flex-col gap-3', className)} aria-live="polite">
      {list.map((f) => {
        const w = WEIGHT[f.severity];
        return (
          <li
            key={`${f.code}-${f.message}`}
            className="portal-achado flex items-start gap-3"
          >
            <Icon
              de={w.icon}
              tamanho="p"
              rotulo={w.label}
              className={cx('mt-0.5 shrink-0', w.tone)}
            />
            <span
              className={cx(
                'text-[0.9375rem]',
                f.severity === 'ok'
                  ? 'text-texto-suave'
                  : 'font-medium text-texto'
              )}
            >
              {f.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Horários sem conflito sugeridos pela API, em fichas que aplicam o horário. */
export function SlotSuggestions({
  slots,
  onPick,
}: {
  slots: string[];
  onPick: (iso: string) => void;
}) {
  if (!slots.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="t-legenda">Sem conflito</span>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-linha-forte px-3.5 text-sm text-texto-suave transition-[border-color,color] duration-[var(--t-resposta)] ease-saida hover:border-ouro/50 hover:text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
          >
            <span className="first-letter:uppercase">{when(dayOf(s))}</span>
            <span className="t-dado">
              {new Date(s).toTimeString().slice(0, 5)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estados da tela
// ---------------------------------------------------------------------------

export function ScreenLoading({
  label = 'Carregando',
  rows = 5,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <AreaCarregando rotulo={label}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-11 w-2/3 max-w-md" forma="bloco" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: rows }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full" forma="bloco" />
          ))}
        </div>
      </div>
    </AreaCarregando>
  );
}

/** A screen that failed to load; "Tentar de novo" reloads everything. */
export function ScreenError({ message }: { message: string }) {
  return (
    <Erro
      titulo="Não foi possível carregar esta tela"
      descricao={message}
      acao={<TentarDeNovo>Tentar de novo</TentarDeNovo>}
    />
  );
}

export { Vazio as Empty };
