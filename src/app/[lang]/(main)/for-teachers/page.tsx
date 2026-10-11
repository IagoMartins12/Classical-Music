import type { Metadata } from 'next';
import { PiArrowRight, PiCaretDown } from 'react-icons/pi';
import LocalizedLink from '@/app/components/LocalizedLink';
import { BotaoCriarConta } from '@/app/components/auth/BotaoCriarConta';
import { Gravura } from '@/app/components/site/Gravura';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Revelar } from '@/app/components/ui/Revelar';
import { TextoRico } from '@/app/components/ui/TextoRico';
import { PROFESSORES } from '@/app/conteudo/professores';
import { alternatesFor } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { buscarPrecos } from '../pricing/buscarPrecos';
import { QuadroDePlanos } from '../pricing/QuadroDePlanos';

/** Prices come from the same cached call as /pricing; the plan is decided in the browser. */
export const revalidate = 3600;

const LINK =
  'inline-flex min-h-6 items-center gap-1.5 font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[5px] transition-colors hover:decoration-ouro';

export async function generateMetadata({
  params,
}: {
  params: LangParams;
}): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const c = PROFESSORES[idioma];
  return {
    title: c.meta.titulo,
    description: c.meta.descricao,
    alternates: alternatesFor('/for-teachers', idioma),
  };
}

/**
 * "Para professores": what the teacher portal does, how to start, the
 * Mentor and Maestro cards (the /pricing component and prices), questions
 * and contact. Same editorial frame as /about-us and /pricing.
 */
export default async function ParaProfessores({
  params,
}: {
  params: LangParams;
}) {
  const idioma = await routeLanguage(params);
  const c = PROFESSORES[idioma];
  const precos = await buscarPrecos().catch(() => null);

  return (
    <div className="pb-24 md:pb-32">
      <header className="section-wrap grid items-center gap-10 pt-8 md:pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div>
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
                {c.migalha}
              </li>
            </ol>
          </nav>
          <h1
            className="entra classical-title mt-6 max-w-[20ch] text-balance text-[2.375rem] leading-[1.06] tracking-[-0.015em] text-texto sm:text-5xl md:mt-8 lg:text-[3.5rem]"
            style={{ ['--i' as string]: 1 }}
          >
            {c.titulo}
          </h1>
          <p
            className="entra mt-6 max-w-[56ch] text-lg leading-relaxed text-texto-suave"
            style={{ ['--i' as string]: 2 }}
          >
            {c.abertura}
          </p>
          <div
            className="entra mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ ['--i' as string]: 3 }}
          >
            <a href="#planos" className={classesDeBotao('primario')}>
              {c.acoes.planos}
              <PiArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <BotaoCriarConta
              seLogado={
                <LocalizedLink href="/teacher" className={classesDeBotao()}>
                  {c.acoes.portal}
                </LocalizedLink>
              }
            >
              {c.acoes.criarConta}
            </BotaoCriarConta>
          </div>
        </div>
        <Gravura
          src="/illustrations/music-lesson.webp"
          width={1000}
          height={715}
          alt={c.gravura}
        />
      </header>

      <section
        aria-labelledby="recursos"
        className="section-wrap mt-20 md:mt-32"
      >
        <div className="rounded-card bg-sup-2 px-6 py-10 md:px-12 md:py-16 lg:px-16">
          <h2
            id="recursos"
            className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
          >
            {c.recursos.titulo}
          </h2>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-texto-suave">
            {c.recursos.abertura}
          </p>
          <Revelar
            as="dl"
            cascata
            className="mt-10 grid gap-x-12 gap-y-10 md:mt-14 md:grid-cols-2 lg:grid-cols-3"
          >
            {c.recursos.itens.map((item, i) => (
              <div key={item.titulo} style={{ ['--i' as string]: i }}>
                <dt className="flex flex-wrap items-baseline gap-x-2 font-semibold text-texto">
                  {item.titulo}
                  {item.maestro && (
                    <span className="text-[0.8125rem] font-normal text-ouro-texto">
                      {c.recursos.soMaestro}
                    </span>
                  )}
                </dt>
                <dd className="mt-2.5 text-[0.9375rem] leading-[1.7] text-texto-suave">
                  {item.texto}
                </dd>
              </div>
            ))}
          </Revelar>
        </div>
      </section>

      <Revelar
        as="section"
        aria-labelledby="comecar"
        className="section-wrap mt-24 md:mt-36"
      >
        <h2
          id="comecar"
          className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
        >
          {c.passos.titulo}
        </h2>
        <ol className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-12">
          {c.passos.itens.map((p, i) => (
            <li key={p.titulo} className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="classical-title text-[3rem] leading-none text-texto-fraco"
              >
                {i + 1}
              </span>
              <span className="font-semibold text-texto">{p.titulo}</span>
              <span className="text-[0.9375rem] leading-[1.7] text-texto-suave">
                {p.texto}
              </span>
            </li>
          ))}
        </ol>
      </Revelar>

      <section
        id="planos"
        aria-labelledby="planos-titulo"
        className="mt-24 scroll-mt-24 md:mt-36"
      >
        <div className="section-wrap">
          <h2
            id="planos-titulo"
            className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
          >
            {c.planos.titulo}
          </h2>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-texto-suave">
            {c.planos.texto}
          </p>
        </div>
        {precos && (
          <QuadroDePlanos
            idioma={idioma}
            precos={precos}
            planoInicial={null}
            grupo="ensinar"
            comparar="/pricing?para=ensinar"
          />
        )}
      </section>

      <section
        aria-labelledby="perguntas"
        className="section-wrap mt-24 md:mt-32"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
          <h2
            id="perguntas"
            className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem] lg:sticky lg:top-28 lg:self-start"
          >
            {c.perguntas.titulo}
          </h2>
          <Revelar cascata className="border-t border-linha">
            {c.perguntas.itens.map((q, i) => (
              <details
                key={q.pergunta}
                style={{ ['--i' as string]: i }}
                className="group border-b border-linha"
              >
                <summary className="flex min-h-[var(--alvo)] cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.0625rem] font-medium text-texto transition-colors hover:text-ouro-texto [&::-webkit-details-marker]:hidden">
                  <h3 className="font-medium">{q.pergunta}</h3>
                  <PiCaretDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-texto-fraco transition-transform duration-[var(--t-resposta)] group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-[62ch] pb-6 text-[1rem] leading-[1.75] text-texto-suave">
                  <TextoRico texto={q.resposta} />
                </p>
              </details>
            ))}
          </Revelar>
        </div>
      </section>

      <Revelar
        as="section"
        aria-labelledby="fecho"
        className="section-wrap mt-24 md:mt-36"
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-20">
          <h2
            id="fecho"
            className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
          >
            {c.fecho.titulo}
          </h2>
          <div>
            <p className="max-w-[60ch] text-lg leading-relaxed text-texto-suave">
              {c.fecho.texto}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[0.9375rem]">
              {c.fecho.links.map((l) => (
                <li key={l.href}>
                  <LocalizedLink href={l.href} className={LINK}>
                    {l.rotulo}
                    <PiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Revelar>
    </div>
  );
}
