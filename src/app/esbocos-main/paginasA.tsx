'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PiCaretDown, PiRows, PiSquaresFour } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS, formatar, rota } from './dados';
import { EPOCAS_HISTORIA } from './epocas-dados';
import { INSTRUMENTOS } from './instrumentos-dados';
import {
  FILTROS_OBRAS,
  LISTA_COMPOSITORES,
  LISTA_OBRAS,
  TOTAIS,
} from './listas-dados';
import {
  CampoDeBusca,
  CartaoCompositor,
  DetalheEpoca,
  DetalheInstrumento,
  FiltrosAtivos,
  LinhaObra,
  Paginacao,
} from './paginas-comum';
import { Ficha, Retrato, anos, linkTexto } from './pecas';

/**
 * A — as listagens e as páginas de leitura como numa revista: título de capa,
 * uma frase, e a lista larga. História e instrumentos são capítulos.
 */

const A = 'a' as const;
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const EPOCAS = [
  'Todas',
  'Medieval',
  'Renascentista',
  'Barroco',
  'Clássico',
  'Romântico',
  'Modernismo',
  'Contemporâneo',
];

function Cabeca({ titulo, frase }: { titulo: string; frase: string }) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="entra font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em]">
        {titulo}
      </h1>
      <p
        className="t-corpo entra max-w-[56ch] text-texto-suave"
        style={{ ['--i' as string]: 1 }}
      >
        {frase}
      </p>
    </header>
  );
}

export function CompositoresA() {
  const [epoca, setEpoca] = useState('Todas');
  const [letra, setLetra] = useState<string | null>(null);
  const brasileiros = LISTA_COMPOSITORES.filter(
    (c) => c.pais === 'Brasil' && c.retrato
  );
  return (
    <div className="section-wrap flex flex-col gap-10 py-12">
      <Cabeca
        titulo="Compositores"
        frase={`${formatar(TOTAIS.compositores)} compositores, da Idade Média a hoje. Procure pelo nome, pela época ou pela primeira letra.`}
      />
      <div className="flex flex-col gap-5">
        <CampoDeBusca
          id="busca-compositores"
          placeholder="Nome, apelido ou transliteração (W. A. Mozart, Tchaikovsky…)"
          grande
        />
        <div className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4">
          {EPOCAS.map((e) => (
            <Ficha key={e} ativa={epoca === e} onClick={() => setEpoca(e)}>
              {e}
            </Ficha>
          ))}
        </div>
        <nav
          aria-label="Primeira letra"
          className="faixa-rola -mx-4 flex gap-0.5 overflow-x-auto px-4"
        >
          {LETRAS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={letra === l}
              onClick={() => setLetra(letra === l ? null : l)}
              className={cx(
                'grid h-10 min-w-9 shrink-0 place-items-center rounded-controle font-display text-[1.125rem]',
                letra === l
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
              )}
            >
              {l}
            </button>
          ))}
        </nav>
      </div>

      <section className="flex flex-col gap-5 rounded-card bg-sup-2 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="t-subtitulo">Do Brasil</h2>
          <Link
            href={rota(A, 'compositores')}
            className={cx('t-rotulo text-ouro-texto', linkTexto)}
          >
            Os 508 brasileiros
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {brasileiros.map((c) => (
            <li key={c.id}>
              <Link
                href={rota(A, 'compositor-tipico')}
                className="group flex items-center gap-3"
              >
                <Retrato
                  nome={c.nomeCompleto}
                  src={c.retrato}
                  sizes="56px"
                  className="h-14 w-14 shrink-0 rounded-full"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-display text-[1.125rem] group-hover:text-ouro-texto">
                    {c.nome}
                  </span>
                  <span className="t-dado text-[0.75rem] text-texto-fraco">
                    {anos(c.nasc ?? 0, c.morte)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="t-rotulo text-texto-suave">Ordem:</span>
        <span className="flex flex-1 flex-wrap gap-2">
          {['Mais procurados', 'A–Z', 'Nascimento'].map((o, i) => (
            <Ficha key={o} ativa={i === 0}>
              {o}
            </Ficha>
          ))}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {LISTA_COMPOSITORES.map((c) => (
          <li key={c.id}>
            <CartaoCompositor c={c} esboco={A} />
          </li>
        ))}
      </ul>
      <Paginacao total={TOTAIS.compositores} />
    </div>
  );
}

export function ObrasA() {
  const [grade, setGrade] = useState(false);
  const filtros = [
    { nome: 'Compositor', valor: null },
    { nome: 'Instrumento', valor: 'Piano' },
    { nome: 'Época', valor: 'Romântico' },
    { nome: 'Gênero', valor: null },
    { nome: 'Categoria', valor: null },
  ];
  return (
    <div className="section-wrap flex flex-col gap-10 py-12">
      <Cabeca
        titulo="Obras"
        frase={`${formatar(TOTAIS.obras)} obras, com as partituras de domínio público para baixar de graça. Filtre pelo instrumento que você toca.`}
      />
      <div className="flex flex-col gap-4">
        <CampoDeBusca
          id="busca-obras"
          placeholder="Título, opus ou compositor (Sonata ao luar, BWV 846, Chopin…)"
          grande
        />
        <div className="flex flex-wrap items-center gap-2">
          {filtros.map((f) => (
            <button
              key={f.nome}
              type="button"
              className={cx(
                'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[0.9375rem]',
                f.valor
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'bg-sup-2 text-texto-suave hover:text-texto'
              )}
            >
              {f.valor ? `${f.nome}: ${f.valor}` : f.nome}
              <Icon de={PiCaretDown} tamanho="pp" />
            </button>
          ))}
        </div>
        <FiltrosAtivos filtros={['Piano', 'Romântico']} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="t-rotulo text-texto-suave">
          <span className="t-dado text-texto">{formatar(86827)}</span> obras
          românticas ·{' '}
          <span className="t-dado text-texto">{formatar(108822)}</span> para
          piano
        </p>
        <span className="flex gap-1">
          <Button
            tamanho="p"
            variante={grade ? 'fantasma' : 'secundario'}
            icone={PiRows}
            rotulo="Ver em lista"
            onClick={() => setGrade(false)}
          />
          <Button
            tamanho="p"
            variante={grade ? 'secundario' : 'fantasma'}
            icone={PiSquaresFour}
            rotulo="Ver em grade"
            onClick={() => setGrade(true)}
          />
        </span>
      </div>
      {grade ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LISTA_OBRAS.map((o) => (
            <li key={o.id}>
              <Link
                href={rota(A, o.ficha === 'completa' ? 'obra' : 'obra-tipica')}
                className="group flex h-full flex-col gap-2 rounded-card bg-sup-2 p-5"
              >
                <span className="font-display text-[1.3125rem] leading-snug group-hover:text-ouro-texto">
                  {o.titulo}
                  {o.catalogo ? `, ${o.catalogo}` : ''}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {o.compositor} · {o.instrumentacao}
                </span>
                <span className="t-legenda mt-auto">
                  {o.partituras
                    ? `${o.partituras} partituras`
                    : 'Partituras no IMSLP'}
                  {o.ano ? ` · ${o.ano}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {LISTA_OBRAS.map((o) => (
            <li key={o.id}>
              <LinhaObra o={o} esboco={A} grande />
            </li>
          ))}
        </ul>
      )}
      <Paginacao total={86827} />
      <aside className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
        <span className="t-legenda">Gêneros mais procurados</span>
        <div className="flex flex-wrap gap-2">
          {FILTROS_OBRAS.generos.map((g) => (
            <Ficha key={g}>{g}</Ficha>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function HistoriaA() {
  return (
    <div className="section-wrap grid grid-cols-1 gap-12 py-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav
          aria-label="Épocas"
          className="faixa-rola -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0"
        >
          {EPOCAS_HISTORIA.map((e) => (
            <a
              key={e.id}
              href={`#${e.id}`}
              className="flex min-h-10 shrink-0 items-center justify-between gap-3 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
            >
              <span>{e.nome}</span>
              <span className="t-dado text-[0.75rem] text-texto-fraco max-lg:hidden">
                {e.periodo.split('-')[0]}
              </span>
            </a>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col gap-20">
        <Cabeca
          titulo="Uma história da música"
          frase="Mil e quinhentos anos em seis capítulos: do canto gregoriano aos que escrevem hoje. Cada época leva às obras e aos compositores dela."
        />
        {EPOCAS_HISTORIA.map((e) => {
          const rostos = FAMOSOS.filter((f) =>
            e.nome.startsWith(
              {
                barroco: 'Barroco',
                classico: 'Clássico',
                romantico: 'Romântico',
                moderno: 'Modern',
                contemporaneo: 'Contemp',
              }[f.epoca] ?? '?'
            )
          );
          return (
            <Revelar
              key={e.id}
              as="article"
              id={e.id}
              className="flex scroll-mt-24 flex-col gap-8"
            >
              <div className="relative aspect-[21/9] overflow-hidden rounded-card">
                <Image
                  src={e.imagem}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-veu-foto via-veu-foto/30 to-transparent" />
                <span className="absolute bottom-5 left-6 flex flex-col text-sobre-foto">
                  <span className="t-dado text-[0.875rem] opacity-90">
                    {e.periodo.replace('-', '–')}
                  </span>
                  <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-none">
                    {e.nome}
                  </h2>
                </span>
              </div>
              <DetalheEpoca e={e} esboco={A} />
              {rostos.length > 0 && (
                <ul className="flex flex-wrap gap-5">
                  {rostos.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={rota(A, 'compositor')}
                        className="group flex items-center gap-3"
                      >
                        <Retrato
                          nome={r.nome}
                          src={r.retrato}
                          sizes="48px"
                          className="h-12 w-12 rounded-full"
                        />
                        <span className="flex flex-col">
                          <span className="font-display text-[1.125rem] group-hover:text-ouro-texto">
                            {r.nome}
                          </span>
                          <span className="t-dado text-[0.75rem] text-texto-fraco">
                            {anos(r.nasc, r.morte)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Revelar>
          );
        })}
        <p className="t-legenda">
          O acervo tem também a época Contemporâneo (2.627 compositores), que
          ainda não tem capítulo escrito.
        </p>
      </div>
    </div>
  );
}

export function InstrumentosA() {
  return (
    <div className="section-wrap flex flex-col gap-12 py-12">
      <Cabeca
        titulo="Instrumentos"
        frase="Sete instrumentos contados do começo: quem inventou, como mudaram, quem os tocou — e as obras escritas para cada um."
      />
      <nav
        aria-label="Instrumentos"
        className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4"
      >
        {INSTRUMENTOS.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-sup-2 px-4 text-[0.9375rem] text-texto-suave hover:text-texto"
          >
            {i.nome}
          </a>
        ))}
      </nav>
      <div className="flex flex-col divide-y divide-[var(--linha)]">
        {INSTRUMENTOS.map((i, k) => (
          <Revelar
            key={i.id}
            as="article"
            id={i.id}
            className="grid scroll-mt-24 grid-cols-1 gap-8 py-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
          >
            <div
              className={cx('flex flex-col gap-2', k % 2 === 1 && 'lg:order-2')}
            >
              <span className="t-dado text-ouro-texto">{i.periodo}</span>
              <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
                {i.nome}
              </h2>
              <span className="t-rotulo text-texto-suave">
                {i.familia} · {i.origem}
              </span>
            </div>
            <DetalheInstrumento i={i} esboco={A} />
          </Revelar>
        ))}
      </div>
    </div>
  );
}
