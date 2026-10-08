import type { ComponentType, CSSProperties, ReactNode, SVGProps } from 'react';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import { cx } from '@/app/components/ui/cx';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * The pages opened from e-mail links: a symbol, one sentence about what
 * happened, one about what to do, and the action. Centered like a book page.
 * `done` draws a check mark in place of the icon.
 */
export function TokenFrame({
  icon,
  title,
  text,
  done = false,
  busy = false,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  text?: ReactNode;
  done?: boolean;
  busy?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <NotasAoFundo className="-z-10" />
      <div
        role={busy ? 'status' : undefined}
        aria-live="polite"
        className="mx-auto flex min-h-[72dvh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-20 text-center"
      >
        <span
          className={cx(
            'entra grid h-16 w-16 shrink-0 place-items-center rounded-full',
            done ? 'tint-ouro text-ouro-na-tinta' : 'bg-sup-2 text-ouro-texto',
            busy && 'animate-pulse motion-reduce:animate-none'
          )}
        >
          {done ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="engraving h-8 w-8"
            >
              <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <Icon de={icon} tamanho="g" />
          )}
        </span>
        <h1
          className="entra text-balance font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.015em]"
          style={step(1)}
        >
          {title}
        </h1>
        {text && (
          <div
            className="entra t-corpo max-w-[48ch] text-texto-suave"
            style={step(2)}
          >
            {text}
          </div>
        )}
        {children && (
          <div
            className="entra flex w-full flex-wrap justify-center gap-3 pt-2"
            style={step(3)}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
