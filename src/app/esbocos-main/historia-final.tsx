'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PiArrowDown,
  PiArrowLeft,
  PiArrowRight,
  PiLightbulb,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import { Revelar } from '@/app/components/ui/Revelar';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS, formatar, rota, type EsbocoId } from './dados';
import { CURIOSIDADES_EPOCA } from './curiosidades-epoca';
import { EPOCAS_HISTORIA } from './epocas-dados';
import { EMBLEMATICAS, PERIODOS } from './final-dados';
import { INSTRUMENTOS } from './instrumentos-dados';
import { Coracao } from './coracao';
import { Retrato, anos, linkTexto } from './pecas';

/**
 * História da música e instrumentos (06/10): a estrutura do esboço B (a
 * régua do tempo manda na página) com uma apresentação na abertura e
 * capítulos encorpados. Todo texto é o que o site já tem
 * (`epochsHistoricalDataTranslated`, `instruments.json`, as 300 curiosidades).
 */

const ORDEM = [
  'Medieval',
  'Renascentista',
  'Barroco',
  'Clássico',
  'Romântico',
  'Modernismo',
  'Contemporâneo',
];
const EPOCA_FAMOSO: Record<string, string> = {
  barroco: 'Barroco',
  classico: 'Clássico',
  romantico: 'Romântico',
  moderno: 'Modernismo',
  contemporaneo: 'Contemporâneo',
};

// ---------------------------------------------------------------------------
// História
// ---------------------------------------------------------------------------

function Capitulo({
  nome,
  esboco,
  aoIr,
}: {
  nome: string;
  esboco: EsbocoId;
  aoIr: (e: string) => void;
}) {
  const e = EPOCAS_HISTORIA.find((x) => x.id === nome);
  const p = PERIODOS.find((x) => x.nome === nome)!;
  const k = ORDEM.indexOf(nome);
  const antes = ORDEM[k - 1];
  const depois = ORDEM[k + 1];
  const rostos = FAMOSOS.filter((f) => EPOCA_FAMOSO[f.epoca] === nome);
  const curiosidades = CURIOSIDADES_EPOCA[nome] ?? [];
  const obras = EMBLEMATICAS[nome] ?? [];
  const [de, ate] = p.anos
    .split('–')
    .map((x) => (x === 'hoje' ? 2026 : Number(x)));
  const x = (a: number) =>
    Math.min(100, Math.max(0, ((a - de) / (ate - de)) * 100));

  return (
    <article key={nome} className="boas-vindas-passo flex flex-col gap-14">
      {/* As imagens das épocas são pequenas (a do Romântico tem 194×260): ficam
          num cartão em pé, no tamanho que aguentam. */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-6 sm:gap-10">
        <span className="relative block aspect-[3/4] w-28 overflow-hidden rounded-card shadow-[var(--sombra-2)] sm:w-44">
          <Image
            src={p.imagem}
            alt=""
            fill
            sizes="176px"
            className="object-cover"
          />
        </span>
        <span className="flex flex-col gap-4">
          <span className="flex flex-col gap-1">
            <span className="t-dado text-[0.9375rem] text-ouro-texto">
              {p.anos}
            </span>
            <h2 className="font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.92] tracking-[-0.02em]">
              {nome}
            </h2>
          </span>
          <span className="flex gap-8">
            <span className="flex flex-col">
              <span className="font-display text-[2rem] leading-none">
                {formatar(p.compositores)}
              </span>
              <span className="t-legenda">compositores</span>
            </span>
            <span className="flex flex-col">
              <span className="font-display text-[2rem] leading-none">
                {formatar(p.obras)}
              </span>
              <span className="t-legenda">obras</span>
            </span>
          </span>
        </span>
      </header>

      {e ? (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-8">
            <p className="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] leading-snug">
              {e.descricao}
            </p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {(
                [
                  ['Características', e.caracteristicas],
                  ['O que mudou', e.desenvolvimentos],
                  ['Formas', e.formas],
                  ['Instrumentos', e.instrumentos],
                ] as const
              ).map(([t, itens]) => (
                <div key={t} className="flex flex-col gap-3">
                  <h3 className="t-legenda">{t}</h3>
                  <ul className="flex flex-col gap-2">
                    {itens.map((i) => (
                      <li key={i} className="flex gap-2.5 t-rotulo">
                        <span
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--ouro)]"
                          aria-hidden="true"
                        />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <aside className="flex flex-col gap-4">
            <h3 className="t-subtitulo">Em {obras.length} obras</h3>
            <ol className="flex flex-col gap-3">
              {obras.map((o, i) => (
                <li key={o.titulo} className="relative">
                  <Coracao
                    rotulo={o.titulo}
                    className="absolute right-2 top-2 z-elevado"
                  />
                  <Link
                    href={rota(esboco, 'obra-tipica')}
                    className="group flex items-center gap-4 rounded-card bg-sup-2 p-4 pr-12"
                  >
                    <span className="font-display text-[1.75rem] leading-none text-texto-fraco">
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-display text-[1.1875rem] leading-snug group-hover:text-ouro-texto">
                        {o.titulo}
                      </span>
                      <span className="t-rotulo text-texto-suave">
                        {o.compositor} · {o.ano}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link
              href={rota(esboco, 'obras')}
              className={cx('t-rotulo text-ouro-texto', linkTexto)}
            >
              Todas as {formatar(p.obras)} obras desta época
            </Link>
          </aside>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-6">
          <span className="font-medium">
            Esta época ainda não tem capítulo escrito
          </span>
          <span className="t-rotulo text-texto-suave">
            O acervo tem {formatar(p.compositores)} compositores e{' '}
            {formatar(p.obras)} obras dela. Quer escrever? O texto entra no ar
            com o seu nome.
          </span>
          <Link
            href={rota(esboco, 'compositores')}
            className={classesDeBotao('secundario', 'p')}
          >
            Ver os compositores
          </Link>
        </div>
      )}

      {rostos.length > 0 && (
        <Revelar as="section" className="flex flex-col gap-5">
          <h3 className="t-titulo">Quem viveu nela</h3>
          <ul className="flex flex-col divide-y divide-[var(--linha)] md:hidden">
            {rostos.map((r) => (
              <li key={r.id}>
                <Link
                  href={rota(esboco, 'compositor')}
                  className="flex items-center gap-3 py-2.5"
                >
                  <Retrato
                    nome={r.nome}
                    src={r.retrato}
                    sizes="40px"
                    className="h-10 w-10 rounded-full"
                  />
                  <span className="flex-1">{r.nomeCompleto}</span>
                  <span className="t-dado text-[0.75rem] text-texto-fraco">
                    {anos(r.nasc, r.morte)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 overflow-hidden max-md:hidden">
            {rostos.map((r) => (
              <Link
                key={r.id}
                href={rota(esboco, 'compositor')}
                className="group relative flex h-10 items-center"
              >
                <span
                  className="b-vida absolute flex h-full items-center gap-2 rounded-full bg-sup-2 pr-4 group-hover:bg-[var(--interactive-hover)]"
                  style={{
                    left: `${Math.min(x(r.nasc), 70)}%`,
                    width: `${Math.max(x(r.morte ?? 2026) - x(r.nasc), 28)}%`,
                  }}
                >
                  <Retrato
                    nome={r.nome}
                    src={r.retrato}
                    sizes="40px"
                    className="h-10 w-10 shrink-0 rounded-full"
                  />
                  <span className="truncate text-[0.875rem]">
                    {r.nomeCompleto}{' '}
                    <span className="t-dado opacity-70">
                      {anos(r.nasc, r.morte)}
                    </span>
                  </span>
                </span>
              </Link>
            ))}
            <div className="relative mt-2 flex h-5 justify-between">
              <span className="t-dado text-[0.75rem] text-texto-fraco">
                {de}
              </span>
              <span className="t-dado text-[0.75rem] text-texto-fraco">
                {ate === 2026 ? 'hoje' : ate}
              </span>
            </div>
          </div>
        </Revelar>
      )}

      {curiosidades.length > 0 && (
        <Revelar as="section" className="flex flex-col gap-5">
          <h3 className="t-titulo">Você sabia?</h3>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {curiosidades.map((c) => (
              <li
                key={c.titulo}
                className="flex flex-col gap-3 rounded-card bg-sup-2 p-5"
              >
                <Icon
                  de={PiLightbulb}
                  tamanho="m"
                  className="text-ouro-texto"
                />
                <span className="font-display text-[1.25rem] leading-snug">
                  {c.titulo}
                </span>
                <span className="t-rotulo text-texto-suave">{c.texto}</span>
              </li>
            ))}
          </ul>
        </Revelar>
      )}

      <nav aria-label="Outras épocas" className="grid grid-cols-2 gap-3">
        {antes ? (
          <button
            type="button"
            onClick={() => aoIr(antes)}
            className="group flex flex-col items-start gap-1 rounded-card bg-sup-2 p-5 text-left"
          >
            <span className="inline-flex items-center gap-1.5 t-legenda">
              <Icon de={PiArrowLeft} tamanho="pp" /> Antes
            </span>
            <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
              {antes}
            </span>
          </button>
        ) : (
          <span />
        )}
        {depois && (
          <button
            type="button"
            onClick={() => aoIr(depois)}
            className="group flex flex-col items-end gap-1 rounded-card bg-sup-2 p-5 text-right"
          >
            <span className="inline-flex items-center gap-1.5 t-legenda">
              Depois <Icon de={PiArrowRight} tamanho="pp" />
            </span>
            <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
              {depois}
            </span>
          </button>
        )}
      </nav>
    </article>
  );
}

export function HistoriaFinal({ esboco }: { esboco: EsbocoId }) {
  const [sel, setSel] = useState('Romântico');
  const ir = (e: string) => {
    setSel(e);
    document
      .getElementById('capitulo')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="flex flex-col">
      <section className="relative isolate overflow-hidden">
        <NotasAoFundo className="-z-10" />
        <div className="section-wrap flex flex-col gap-10 py-14 md:py-20">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <h1 className="entra font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.02em]">
              Mil e quinhentos anos de música
            </h1>
            <div
              className="entra flex flex-col gap-4"
              style={{ ['--i' as string]: 1 }}
            >
              <p className="t-corpo text-texto-suave">
                Do canto gregoriano a quem escreve hoje, em sete épocas. Cada
                capítulo conta o que mudou, quem viveu nela e por onde começar a
                ouvir.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variante="primario"
                  icone={PiArrowDown}
                  onClick={() => ir('Medieval')}
                >
                  Começar pelo começo
                </Button>
                <Button onClick={() => ir('Barroco')}>Ir ao Barroco</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label="Épocas"
        className="sticky top-16 z-elevado border-y border-[var(--linha)] bg-fundo"
      >
        <div className="section-wrap faixa-rola flex gap-1 overflow-x-auto !py-2">
          {ORDEM.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={sel === n}
              onClick={() => ir(n)}
              className={cx(
                'inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-[0.9375rem]',
                sel === n
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </nav>

      <div id="capitulo" className="section-wrap scroll-mt-32 py-12">
        <Capitulo key={sel} nome={sel} esboco={esboco} aoIr={ir} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Instrumentos
// ---------------------------------------------------------------------------

const ORDEM_INVENCAO = [
  'harpa',
  'orgao',
  'clavicordio',
  'violino',
  'violoncelo',
  'orquestra',
  'piano',
];
/** Onde cada invenção cai na régua (escala não linear: 3000 a.C. → 1700). */
const MARCA: Record<string, number> = {
  harpa: 2,
  orgao: 18,
  clavicordio: 46,
  violino: 66,
  violoncelo: 72,
  orquestra: 82,
  piano: 96,
};

export function InstrumentosFinal({ esboco }: { esboco: EsbocoId }) {
  const lista = ORDEM_INVENCAO.map(
    (id) => INSTRUMENTOS.find((i) => i.id === id)!
  ).filter(Boolean);
  const familias = [
    'Todas',
    ...Array.from(new Set(lista.map((i) => i.familia))),
  ];
  const [familia, setFamilia] = useState('Todas');
  const [aberto, setAberto] = useState('piano');
  const visiveis = lista.filter(
    (i) => familia === 'Todas' || i.familia === familia
  );

  return (
    <div className="flex flex-col">
      <section className="relative isolate overflow-hidden">
        <NotasAoFundo className="-z-10" />
        <div className="section-wrap flex flex-col gap-12 py-14 md:py-20">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <h1 className="entra font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.02em]">
              Cinco mil anos de invenção
            </h1>
            <p
              className="entra t-corpo text-texto-suave"
              style={{ ['--i' as string]: 1 }}
            >
              Da harpa da Mesopotâmia ao piano de Cristofori: quem inventou,
              como mudaram, quem tocou — e as obras escritas para cada um.
            </p>
          </div>
          {/* A régua das invenções: escala não linear, as datas marcadas. */}
          <div
            className="entra faixa-rola -mx-4 overflow-x-auto px-4"
            style={{ ['--i' as string]: 2 }}
          >
            <div className="relative h-36 min-w-[44rem]">
              <span className="b-vida absolute inset-x-0 top-1/2 h-px bg-[var(--linha-forte)]" />
              {lista.map((i, k) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => {
                    setAberto(i.id);
                    document
                      .getElementById(`inst-${i.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="b-chega group absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${MARCA[i.id]}%`, ['--i' as string]: k }}
                >
                  <span
                    className={cx(
                      'order-2 my-2 h-4 w-4 rounded-full ring-4 ring-[var(--fundo)]',
                      aberto === i.id
                        ? 'fill-ouro'
                        : 'bg-[var(--linha-forte)] group-hover:bg-[var(--ouro)]'
                    )}
                  />
                  <span
                    className={cx(
                      'font-display text-[1.25rem] leading-none',
                      k % 2 ? 'order-3' : 'order-1',
                      aberto === i.id && 'text-ouro-texto'
                    )}
                  >
                    {i.nome}
                  </span>
                  <span
                    className={cx(
                      't-dado whitespace-nowrap text-[0.6875rem] text-texto-fraco',
                      k % 2 ? 'order-4' : 'order-0'
                    )}
                  >
                    {i.periodo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-wrap flex flex-col gap-8 py-10">
        <div className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4">
          {familias.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={familia === f}
              onClick={() => setFamilia(f)}
              className={cx(
                'inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-[0.9375rem]',
                familia === f
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'bg-sup-2 text-texto-suave hover:text-texto'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <ol className="flex flex-col divide-y divide-[var(--linha)]">
          {visiveis.map((i) => {
            const sel = aberto === i.id;
            return (
              <li key={i.id} id={`inst-${i.id}`} className="scroll-mt-24">
                <button
                  type="button"
                  aria-expanded={sel}
                  onClick={() => setAberto(sel ? '' : i.id)}
                  className="grid w-full grid-cols-1 items-baseline gap-x-6 gap-y-1 py-6 text-left sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
                >
                  <span className="t-dado text-ouro-texto">{i.periodo}</span>
                  <span className="font-display text-[clamp(2rem,4.5vw,3rem)] leading-none">
                    {i.nome}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {i.familia} · {formatar(i.obras)} obras
                  </span>
                </button>
                {sel && (
                  <div className="boas-vindas-passo grid grid-cols-1 gap-10 pb-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                    <div className="flex flex-col gap-6">
                      <p className="font-display text-[1.375rem] leading-snug">
                        {i.descricao}.
                      </p>
                      <p className="t-corpo max-w-[60ch] text-texto-suave">
                        {i.historia}
                      </p>
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                        {(
                          [
                            ['Família', i.familia],
                            ['Origem', i.origem],
                            ['Inventor', i.inventor],
                            ['Quando', i.periodo],
                          ] as const
                        )
                          .filter(([, v]) => v)
                          .map(([t, v]) => (
                            <div key={t} className="flex flex-col">
                              <dt className="t-legenda">{t}</dt>
                              <dd className="font-display text-[1.125rem] leading-snug">
                                {v}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-3">
                        <h3 className="t-legenda">Como chegou até aqui</h3>
                        <ol className="relative flex flex-col gap-4 pl-6 before:absolute before:bottom-2 before:left-[0.3rem] before:top-2 before:w-px before:bg-[var(--linha-forte)]">
                          {i.evolucao.map((ev, k) => (
                            <li key={ev} className="relative t-rotulo">
                              <span
                                className={cx(
                                  'absolute -left-6 top-1 h-3 w-3 rounded-full',
                                  k === i.evolucao.length - 1
                                    ? 'fill-ouro'
                                    : 'border-2 border-[var(--linha-forte)] bg-[var(--fundo)]'
                                )}
                                aria-hidden="true"
                              />
                              {ev}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex flex-col gap-3">
                        <h3 className="t-legenda">O que o distingue</h3>
                        <ul className="flex flex-col gap-1.5">
                          {[...i.caracteristicas, ...i.destaques]
                            .slice(0, 6)
                            .map((c) => (
                              <li key={c} className="flex gap-2 t-rotulo">
                                <span
                                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--ouro)]"
                                  aria-hidden="true"
                                />
                                {c}
                              </li>
                            ))}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <h3 className="t-legenda">Quem tocou</h3>
                        <div className="flex flex-wrap gap-2">
                          {i.interpretes.map((p) => (
                            <span
                              key={p}
                              className="inline-flex min-h-8 items-center rounded-full bg-sup-2 px-3 text-[0.8125rem]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={rota(esboco, 'obras')}
                        className={classesDeBotao('primario', 'm')}
                      >
                        {formatar(i.obras)} obras para {i.nome.toLowerCase()}
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
