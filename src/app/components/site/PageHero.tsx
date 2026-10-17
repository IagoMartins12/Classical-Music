import type { ReactNode } from 'react';
import LocalizedLink from '@/app/components/LocalizedLink';
import { VistoQueSeDesenha } from '@/app/components/ui/VistoQueSeDesenha';

/**
 * The opening of the institutional pages (about-us, pricing, for-teachers):
 * breadcrumb, title, lead, an optional extra line, the actions, and an
 * engraved orbit on the right from `lg` up.
 *
 * One component so the three heroes stay the same size: the same type
 * scale, the same rhythm and a common minimum height. The height is the
 * about-us one (its title runs four lines on desktop); pages with shorter
 * copy keep it, text from the top.
 */
export function PageHero({
  idioma,
  migalha,
  titulo,
  abertura,
  extra,
  destaques,
  acoes,
  ilustracao,
}: {
  idioma: 'pt' | 'en';
  migalha: string;
  titulo: ReactNode;
  abertura: ReactNode;
  /**
   * A line between the lead and the actions: about-us, faces of the library;
   * for-teachers and pricing, the archive's size (`LinhaDoAcervo`).
   */
  extra?: ReactNode;
  /** Short facts, each with a gold check (pricing: the billing guarantees). */
  destaques?: string[];
  acoes: ReactNode;
  ilustracao: ReactNode;
}) {
  return (
    <header className="section-wrap grid items-center gap-10 pt-8 md:pt-14 lg:min-h-[38rem] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      {/* Text from the top, so breadcrumb and title start at the same
          point on every page; the orbit stays centered. */}
      <div className="lg:self-start">
        <nav
          aria-label={idioma === 'pt' ? 'Você está em' : 'You are here'}
          className="entra"
        >
          <ol className="flex items-center gap-2 text-sm text-texto-fraco">
            <li>
              <LocalizedLink href="/" className="hover:text-texto">
                Opus Atlas
              </LocalizedLink>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-texto-suave">
              {migalha}
            </li>
          </ol>
        </nav>
        <h1
          className="entra classical-title mt-6 max-w-[20ch] text-balance text-[2.375rem] leading-[1.06] tracking-[-0.015em] text-texto sm:text-5xl md:mt-8 lg:text-[3.5rem]"
          style={{ ['--i' as string]: 1 }}
        >
          {titulo}
        </h1>
        <p
          className="entra mt-6 max-w-[56ch] text-lg leading-relaxed text-texto-suave [&_strong]:tabular-nums"
          style={{ ['--i' as string]: 2 }}
        >
          {abertura}
        </p>
        {extra}
        {destaques && destaques.length > 0 && (
          <ul
            className="entra mt-6 flex flex-col gap-2.5 text-[0.9375rem] text-texto-suave"
            style={{ ['--i' as string]: 3 }}
          >
            {destaques.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <VistoQueSeDesenha className="h-4 w-4 shrink-0 text-ouro" />
                {item}
              </li>
            ))}
          </ul>
        )}
        <div
          className="entra mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ ['--i' as string]: 3 }}
        >
          {acoes}
        </div>
      </div>
      {ilustracao}
    </header>
  );
}
