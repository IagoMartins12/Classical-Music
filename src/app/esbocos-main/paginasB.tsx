'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PiCaretDown } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS, formatar, rota } from './dados';
import { EPOCAS_HISTORIA } from './epocas-dados';
import { INSTRUMENTOS } from './instrumentos-dados';
import {
  FILTROS_OBRAS,
  LISTA_COMPOSITORES,
  LISTA_OBRAS,
  PAISES_FILTRO,
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
import { Ficha, Retrato, anos } from './pecas';

/**
 * B — no Atlas, filtrar é escolher um trecho do tempo. As listagens abrem
 * numa régua de épocas (largura pelo número de compositores); a história é a
 * régua; os instrumentos, uma linha do tempo das invenções.
 */

const B = 'b' as const;

const EPOCAS_REGUA = FILTROS_OBRAS.epocas.map((e) => {
  const h = EPOCAS_HISTORIA.find((x) => x.id === e.nome);
  const compositores =
    {
      Medieval: 49,
      Renascentista: 703,
      Barroco: 1489,
      Clássico: 2873,
      Romântico: 10365,
      Modernismo: 1070,
      Contemporâneo: 2627,
    }[e.nome] ?? 0;
  return {
    nome: e.nome,
    obras: e.n,
    compositores,
    periodo: h?.periodo ?? '1950–hoje',
  };
});

/** A régua clicável: cada época com largura pela quantidade (mínimo legível). */
function Regua({
  ativa,
  aoEscolher,
  medida,
}: {
  ativa: string | null;
  aoEscolher: (e: string | null) => void;
  medida: 'compositores' | 'obras';
}) {
  const total = EPOCAS_REGUA.reduce((n, e) => n + e[medida], 0);
  return (
    <div className="faixa-rola -mx-4 overflow-x-auto px-4">
      <div
        role="group"
        aria-label="Filtrar por época"
        className="flex min-w-[44rem] gap-1"
      >
        {EPOCAS_REGUA.map((e) => {
          const sel = ativa === e.nome;
          return (
            <button
              key={e.nome}
              type="button"
              aria-pressed={sel}
              onClick={() => aoEscolher(sel ? null : e.nome)}
              className={cx(
                'flex min-h-20 flex-col justify-between rounded-controle p-3 text-left transition-colors duration-[var(--t-toque)]',
                sel
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'bg-sup-2 hover:bg-[var(--interactive-hover)]'
              )}
              style={{
                flexGrow: Math.max(e[medida] / total, 0.07) * 100,
                flexBasis: 0,
              }}
            >
              <span className="truncate text-[0.875rem] font-medium">
                {e.nome}
              </span>
              <span className="t-dado truncate text-[0.75rem] opacity-80">
                {formatar(e[medida])}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CompositoresB() {
  const [epoca, setEpoca] = useState<string | null>('Romântico');
  const [pais, setPais] = useState<string | null>(null);
  return (
    <div className="section-wrap flex flex-col gap-8 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
          Compositores
        </h1>
        <p className="t-corpo text-texto-suave">
          {formatar(TOTAIS.compositores)} no atlas. Escolha um trecho do tempo,
          um país, ou procure pelo nome.
        </p>
      </header>
      <Regua ativa={epoca} aoEscolher={setEpoca} medida="compositores" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <CampoDeBusca
          id="b-busca-compositores"
          placeholder="Buscar compositor"
        />
        <span className="t-rotulo text-texto-suave">
          {epoca
            ? `${formatar(EPOCAS_REGUA.find((e) => e.nome === epoca)?.compositores ?? 0)} no ${epoca}`
            : 'Todas as épocas'}
        </span>
      </div>
      <div className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4">
        {PAISES_FILTRO.map((p) => (
          <Ficha
            key={p}
            ativa={pais === p}
            onClick={() => setPais(pais === p ? null : p)}
          >
            {p}
          </Ficha>
        ))}
      </div>
      <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {LISTA_COMPOSITORES.map((c) => (
          <li key={c.id}>
            <CartaoCompositor c={c} esboco={B} forma="circulo" />
          </li>
        ))}
      </ul>
      <Paginacao total={10365} />
    </div>
  );
}

function Faceta({
  titulo,
  itens,
  abertaInicial = true,
}: {
  titulo: string;
  itens: { nome: string; n?: number }[];
  abertaInicial?: boolean;
}) {
  const [aberta, setAberta] = useState(abertaInicial);
  const max = Math.max(...itens.map((i) => i.n ?? 0), 1);
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--linha)] pb-4">
      <button
        type="button"
        aria-expanded={aberta}
        onClick={() => setAberta(!aberta)}
        className="flex min-h-10 items-center justify-between t-rotulo font-medium"
      >
        {titulo}
        <Icon
          de={PiCaretDown}
          tamanho="pp"
          className={cx('transition-transform', aberta && 'rotate-180')}
        />
      </button>
      {aberta && (
        <ul className="flex flex-col gap-1">
          {itens.map((i, k) => (
            <li key={i.nome}>
              <label className="relative flex min-h-9 cursor-pointer items-center gap-3 overflow-hidden rounded-controle px-2 t-rotulo hover:bg-sup-2">
                {i.n ? (
                  <span
                    className="absolute inset-y-1 left-0 rounded-r-[4px] bg-[var(--interactive-hover)]"
                    style={{ width: `${(i.n / max) * 100}%` }}
                    aria-hidden="true"
                  />
                ) : null}
                <input
                  type="checkbox"
                  defaultChecked={k === 0 && titulo === 'Instrumento'}
                  className="relative accent-[var(--ouro)]"
                />
                <span className="relative flex-1 truncate">{i.nome}</span>
                {i.n ? (
                  <span className="t-dado relative text-[0.75rem] text-texto-fraco">
                    {formatar(i.n)}
                  </span>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ObrasB() {
  const [epoca, setEpoca] = useState<string | null>('Romântico');
  return (
    <div className="section-wrap flex flex-col gap-8 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
          Obras
        </h1>
        <p className="t-corpo text-texto-suave">
          {formatar(TOTAIS.obras)} obras. A régua mostra onde elas se
          concentram.
        </p>
      </header>
      <Regua ativa={epoca} aoEscolher={setEpoca} medida="obras" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Faceta titulo="Instrumento" itens={FILTROS_OBRAS.instrumentos} />
          <Faceta
            titulo="Gênero"
            itens={FILTROS_OBRAS.generos.map((g) => ({ nome: g }))}
            abertaInicial={false}
          />
          <Faceta
            titulo="Categoria"
            itens={FILTROS_OBRAS.categorias.map((g) => ({ nome: g }))}
            abertaInicial={false}
          />
          <Faceta
            titulo="Tem"
            itens={[
              { nome: 'Gravação ou vídeo' },
              { nome: 'Partitura já guardada' },
              { nome: 'Ano de composição' },
            ]}
          />
        </aside>
        <div className="flex min-w-0 flex-col gap-5">
          <CampoDeBusca
            id="b-busca-obras"
            placeholder="Título, opus ou compositor"
          />
          <FiltrosAtivos filtros={['Piano', epoca ?? 'Todas as épocas']} />
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {LISTA_OBRAS.map((o) => (
              <li key={o.id}>
                <LinhaObra o={o} esboco={B} />
              </li>
            ))}
          </ul>
          <Paginacao total={86827} />
        </div>
      </div>
    </div>
  );
}

export function HistoriaB() {
  const [sel, setSel] = useState<string>('Romântico');
  const e = EPOCAS_HISTORIA.find((x) => x.id === sel) ?? EPOCAS_HISTORIA[0];
  const rostos = FAMOSOS.filter(
    (f) =>
      (
        ({
          barroco: 'Barroco',
          classico: 'Clássico',
          romantico: 'Romântico',
          moderno: 'Modernismo',
          contemporaneo: 'Modernismo',
        }) as Record<string, string>
      )[f.epoca] === e.id
  );
  const [de, ate] = e.periodo
    .split('-')
    .map((x) => (x === 'presente' ? 2026 : Number(x)));
  return (
    <div className="flex flex-col">
      <section className="section-wrap flex flex-col gap-6 pt-10">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
          A história da música
        </h1>
        <p className="t-corpo max-w-[56ch] text-texto-suave">
          De 500 a hoje. Escolha uma época na régua; o resto da página muda com
          ela.
        </p>
        <div className="faixa-rola -mx-4 overflow-x-auto px-4">
          <ol className="flex min-w-[48rem] gap-1">
            {EPOCAS_HISTORIA.map((x) => (
              <li key={x.id} className="flex-1">
                <button
                  type="button"
                  aria-pressed={sel === x.id}
                  onClick={() => setSel(x.id)}
                  className="group relative flex h-28 w-full flex-col justify-end overflow-hidden rounded-controle p-3 text-left"
                >
                  <Image
                    src={x.imagem}
                    alt=""
                    fill
                    sizes="200px"
                    className={cx(
                      'object-cover transition-[opacity,filter] duration-[var(--t-entrada)]',
                      sel === x.id
                        ? 'opacity-100'
                        : 'opacity-35 grayscale group-hover:opacity-60'
                    )}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-veu-foto to-transparent" />
                  <span className="relative text-[0.875rem] font-medium text-sobre-foto">
                    {x.nome}
                  </span>
                  <span className="t-dado relative text-[0.6875rem] text-sobre-foto/85">
                    {x.periodo.replace('-', '–')}
                  </span>
                  {sel === x.id && (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-[var(--ouro)]" />
                  )}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        key={e.id}
        className="boas-vindas-passo section-wrap grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
      >
        <div className="flex flex-col gap-6">
          <h2 className="t-titulo">
            {e.nome}{' '}
            <span className="t-dado text-[1rem] text-texto-suave">
              {e.periodo.replace('-', '–')}
            </span>
          </h2>
          <DetalheEpoca e={e} esboco={B} />
        </div>
        <aside className="flex flex-col gap-4">
          <h3 className="t-subtitulo">Quem viveu nela</h3>
          {rostos.length ? (
            <>
              <ul className="flex flex-col divide-y divide-[var(--linha)] md:hidden">
                {rostos.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={rota(B, 'compositor')}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <Retrato
                        nome={r.nome}
                        src={r.retrato}
                        sizes="40px"
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="flex-1">{r.nome}</span>
                      <span className="t-dado text-[0.75rem] text-texto-fraco">
                        {anos(r.nasc, r.morte)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 overflow-hidden max-md:hidden">
                {rostos.map((r) => {
                  const x = (a: number) =>
                    Math.min(100, Math.max(0, ((a - de) / (ate - de)) * 100));
                  return (
                    <Link
                      key={r.id}
                      href={rota(B, 'compositor')}
                      className="group relative flex h-9 items-center"
                    >
                      <span
                        className="absolute flex h-full items-center gap-2 rounded-full bg-sup-2 pr-3 group-hover:bg-[var(--interactive-hover)]"
                        style={{
                          left: `${Math.min(x(r.nasc), 66)}%`,
                          width: `${Math.max(x(r.morte ?? 2026) - x(r.nasc), 34)}%`,
                        }}
                      >
                        <Retrato
                          nome={r.nome}
                          src={r.retrato}
                          sizes="36px"
                          className="h-9 w-9 shrink-0 rounded-full"
                        />
                        <span className="truncate text-[0.8125rem]">
                          {r.nome}{' '}
                          <span className="t-dado opacity-70">
                            {anos(r.nasc, r.morte)}
                          </span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="t-rotulo text-texto-suave">
              Os compositores desta época ainda não têm retrato no acervo.{' '}
              <Link href={rota(B, 'compositores')} className="text-ouro-texto">
                Ver a lista
              </Link>
              .
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}

const ORDEM_INVENCAO = [
  'harpa',
  'orgao',
  'clavicordio',
  'violino',
  'violoncelo',
  'orquestra',
  'piano',
];

export function InstrumentosB() {
  const [aberto, setAberto] = useState<string>('piano');
  const lista = ORDEM_INVENCAO.map(
    (id) => INSTRUMENTOS.find((i) => i.id === id)!
  ).filter(Boolean);
  return (
    <div className="section-wrap flex flex-col gap-10 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
          Instrumentos
        </h1>
        <p className="t-corpo max-w-[56ch] text-texto-suave">
          Cinco mil anos de invenções, da harpa ao piano. Toque num instrumento
          para abrir a história dele.
        </p>
      </header>
      <ol className="relative flex flex-col pl-10 before:absolute before:bottom-4 before:left-[0.9rem] before:top-4 before:w-px before:bg-[var(--linha-forte)]">
        {lista.map((i) => {
          const sel = aberto === i.id;
          return (
            <li key={i.id} className="relative py-3">
              <span
                className={cx(
                  'absolute -left-[1.85rem] top-7 h-3.5 w-3.5 rounded-full',
                  sel
                    ? 'fill-ouro'
                    : 'border-2 border-[var(--linha-forte)] bg-[var(--fundo)]'
                )}
                aria-hidden="true"
              />
              <button
                type="button"
                aria-expanded={sel}
                onClick={() => setAberto(sel ? '' : i.id)}
                className="flex w-full flex-wrap items-baseline gap-x-5 gap-y-1 rounded-controle py-2 text-left"
              >
                <span className="t-dado w-32 shrink-0 text-ouro-texto">
                  {i.periodo}
                </span>
                <span className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-none">
                  {i.nome}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {i.familia} · {formatar(i.obras)} obras
                </span>
              </button>
              {sel && (
                <div className="boas-vindas-passo mt-4 rounded-card bg-sup-2 p-6">
                  <DetalheInstrumento i={i} esboco={B} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
