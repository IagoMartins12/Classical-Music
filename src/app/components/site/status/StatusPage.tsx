import type { CSSProperties, ReactNode } from 'react';
import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import { BrandSeal } from '../BrandSeal';

export interface StatusPath {
  label: string;
  text: string;
  href: string;
}

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * 404, 401 and 403 in one composition: the seal, the status as a catalog
 * number ("Op. 404"), what happened in one sentence, what to do, three paths
 * and a line about music.
 */
export function StatusPage({
  number,
  name,
  op,
  title,
  text,
  action,
  note,
  paths,
  pathsLabel,
  quote,
}: {
  number: string;
  name: string;
  op: string;
  title: string;
  text?: string;
  action: ReactNode;
  note?: ReactNode;
  paths: StatusPath[];
  pathsLabel: string;
  quote: { text: string; author: string };
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <NotasAoFundo className="-z-10" />
      <div className="section-wrap flex flex-col items-center gap-7 py-12 text-center md:py-16">
        <BrandSeal className="entra w-16" priority />
        <div
          className="entra flex flex-col items-center gap-1"
          aria-hidden="true"
        >
          <span className="flex items-baseline gap-3 font-display leading-none text-ouro-texto">
            <span className="text-[clamp(2rem,4vw,3rem)] italic">{op}</span>
            <span className="text-[clamp(6rem,15vw,10.5rem)] tabular-nums tracking-[-0.03em]">
              {number}
            </span>
          </span>
          <span className="font-display text-[1.125rem] italic text-texto-suave">
            {name}
          </span>
        </div>
        <h1 className="entra max-w-[18ch] text-balance font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
          {title}
        </h1>
        {text && (
          <p
            className="entra t-corpo max-w-[52ch] text-texto-suave"
            style={step(1)}
          >
            {text}
          </p>
        )}
        <div
          className="entra flex w-full flex-col items-center gap-4"
          style={step(2)}
        >
          {action}
        </div>
        {note && (
          <div className="entra" style={step(3)}>
            {note}
          </div>
        )}
        <nav
          aria-label={pathsLabel}
          className="entra mt-4 w-full max-w-4xl"
          style={step(3)}
        >
          <ul className="grid grid-cols-1 divide-y divide-[var(--linha)] border-y border-[var(--linha)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {paths.map((p) => (
              <li key={p.href + p.label}>
                <Link
                  href={p.href}
                  className="group flex h-full flex-col gap-1 px-5 py-5"
                >
                  <span className="inline-flex items-center justify-center gap-2 font-display text-[1.375rem] leading-tight group-hover:text-ouro-texto">
                    {p.label}
                    <Icon
                      de={PiArrowRight}
                      tamanho="pp"
                      className="text-texto-fraco transition-transform group-hover:translate-x-0.5 group-hover:text-ouro-texto"
                    />
                  </span>
                  <span className="t-rotulo text-texto-suave">{p.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <figure
          className="entra mt-4 flex max-w-[40ch] flex-col items-center gap-2"
          style={step(4)}
        >
          <blockquote className="font-display text-[1.375rem] italic leading-snug text-texto-suave">
            “{quote.text}”
          </blockquote>
          <figcaption className="t-rotulo text-ouro-texto">
            {quote.author}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
