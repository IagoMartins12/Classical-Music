'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PiArrowRight,
  PiCaretDown,
  PiHeart,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiShareNetwork,
  PiUser,
  PiNewspaper,
} from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { cx } from '@/app/components/ui/cx';
import {
  BUSCA_EXEMPLO,
  COLECAO_PIANO,
  COLECOES,
  DIA,
  EPOCAS,
  FAMOSOS,
  HOJE,
  OBRAS_POR_ANO,
  PESSOA,
  TELAS_PESSOAIS,
  destino,
  formatar,
  rota,
  type Compositor,
  type Tela,
} from './dados';
import {
  AcoesDaConta,
  ITENS,
  LinkPlanos,
  ListaExplorar,
  MenuDoTelefone,
  NivelEXp,
  PESSOAIS,
  Rodape,
  Tema,
  useFechaFora,
} from './navegacao';
import {
  ArtigosLigados,
  BotoesDeEstudo,
  CompletarFicha,
  CuriosidadesDoCompositor,
  FichaTecnica,
  Multimidia,
  PartiturasAgrupadas,
  QuemEstuda,
  SobreCompositor,
  VideoDoCompositor,
  useEstudoDaObra,
} from './fichas';
import { CompositoresB, HistoriaB, InstrumentosB, ObrasB } from './paginasB';
import { PaginaEstudar } from './paginas-comum';
import { HomeFinal } from './home-final';
import {
  fichaCompositor,
  fichaObra,
  type FichaCompositor,
  type QualFicha,
} from './fichas-dados';
import {
  Anotacoes,
  Conquistas,
  Envios,
  Estudo,
  Favoritos,
  Perfil,
} from './pessoais';
import {
  Marca,
  Retrato,
  Rostos,
  anos,
  linkTexto,
  retratoDe,
  useEsboco,
} from './pecas';
import { ConfirmarConta, ConviteDeProfessor, NovaSenha } from './sistema';
import { AcessoNegadoFinal, NaoEncontradaFinal } from './sistema-final';

/**
 * B — Atlas.
 *
 * O nome levado ao pé da letra: a enciclopédia como um mapa do tempo. A home
 * abre numa linha do tempo de 1600 a hoje com os compositores no ano em que
 * nasceram — tocar num rosto mostra a vida dele esticada entre as épocas.
 * O compositor vira uma vida desenhada (obras por ano, os contemporâneos ao
 * lado); a obra aparece no ponto da vida em que foi escrita. A busca é uma
 * paleta (⌘K) que abre de qualquer lugar.
 */

const B = 'b' as const;
const INICIO = 1600;
const FIM = 2026;
const pos = (ano: number) => ((ano - INICIO) / (FIM - INICIO)) * 100;

// ---------------------------------------------------------------------------
// Paleta de busca (⌘K)
// ---------------------------------------------------------------------------

function Paleta({
  aberta,
  aoFechar,
}: {
  aberta: boolean;
  aoFechar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [termo, setTermo] = useState('noturno');
  const [ativo, setAtivo] = useState(0);

  const itens = useMemo(
    () =>
      [
        ...BUSCA_EXEMPLO.compositores.map((c) => ({
          tipo: 'Compositor',
          titulo: c.nome,
          detalhe: c.detalhe,
          icone: PiUser,
          href: rota(B, 'compositor'),
        })),
        ...BUSCA_EXEMPLO.obras.map((o) => ({
          tipo: 'Obra',
          titulo: o.titulo,
          detalhe: `${o.compositor} · ${o.partituras} partituras`,
          icone: PiMusicNotes,
          href: rota(B, 'obra'),
        })),
        ...BUSCA_EXEMPLO.artigos.map((a) => ({
          tipo: 'Artigo',
          titulo: a.titulo,
          detalhe: a.autor,
          icone: PiNewspaper,
          href: destino(B, 'blog'),
        })),
      ].filter(
        (i) =>
          !termo ||
          i.titulo.toLowerCase().includes(termo.toLowerCase().slice(0, 4)) ||
          i.tipo !== 'Obra'
      ),
    [termo]
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) d.showModal();
    if (!aberta && d.open) d.close();
  }, [aberta]);

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      aria-label="Buscar no Opus Atlas"
      className="sup-alta m-0 mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] max-w-none !rounded-card p-0 text-texto backdrop:bg-[var(--veu-foto)]"
    >
      <div className="c-resultados flex flex-col">
        <div className="flex items-center gap-3 border-b border-[var(--linha)] px-5">
          <Icon
            de={PiMagnifyingGlass}
            tamanho="m"
            className="text-texto-fraco"
          />
          <label htmlFor="paleta" className="sr-only">
            Buscar
          </label>
          <input
            id="paleta"
            autoFocus
            type="search"
            value={termo}
            onChange={(e) => {
              setTermo(e.target.value);
              setAtivo(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setAtivo((a) => Math.min(a + 1, itens.length - 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setAtivo((a) => Math.max(a - 1, 0));
              }
              if (e.key === 'Enter' && itens[ativo]) {
                aoFechar();
                router.push(itens[ativo].href);
              }
            }}
            placeholder="Compositor, obra, partitura, artigo…"
            className="min-h-16 min-w-0 flex-1 bg-transparent text-[1.125rem] outline-none placeholder:text-texto-fraco"
          />
          <kbd className="t-dado rounded-[6px] bg-sup-2 px-2 py-1 text-[0.75rem] text-texto-fraco">
            esc
          </kbd>
        </div>
        <ul
          role="listbox"
          aria-label="Resultados"
          className="flex max-h-[50vh] flex-col overflow-y-auto p-2"
        >
          {itens.map((i, k) => (
            <li key={i.titulo} role="option" aria-selected={k === ativo}>
              <Link
                href={i.href}
                onClick={aoFechar}
                onMouseEnter={() => setAtivo(k)}
                className={cx(
                  'flex items-center gap-4 rounded-controle px-3 py-2.5',
                  k === ativo && 'bg-sup-2'
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sup-2 text-texto-suave">
                  <Icon de={i.icone} tamanho="p" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-[1.125rem]">
                    {i.titulo}
                  </span>
                  <span className="t-rotulo truncate text-texto-suave">
                    {i.detalhe}
                  </span>
                </span>
                <span className="t-legenda">{i.tipo}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--linha)] px-5 py-3 t-legenda">
          <span>↑ ↓ para escolher · Enter para abrir</span>
          <Link
            href={rota(B, 'busca')}
            onClick={aoFechar}
            className={cx('text-ouro-texto', linkTexto)}
          >
            Todos os resultados
          </Link>
        </div>
      </div>
    </dialog>
  );
}

// ---------------------------------------------------------------------------
// Casca
// ---------------------------------------------------------------------------

function Barra({ abrirPaleta }: { abrirPaleta: () => void }) {
  const [explorar, setExplorar] = useState(false);
  const ref = useFechaFora<HTMLDivElement>(explorar, () => setExplorar(false));
  return (
    <header ref={ref} className="navbar-classical sticky top-0 z-barra">
      <div className="section-wrap flex min-h-16 items-center gap-4">
        <Marca href={rota(B)} encolhe />
        <button
          type="button"
          aria-expanded={explorar}
          onClick={() => setExplorar(!explorar)}
          className="flex min-h-10 items-center gap-1.5 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:text-texto max-lg:hidden"
        >
          Explorar
          <Icon
            de={PiCaretDown}
            tamanho="pp"
            className={cx('transition-transform', explorar && 'rotate-180')}
          />
        </button>
        <button
          type="button"
          onClick={abrirPaleta}
          className="mx-auto flex min-h-11 w-full max-w-md items-center gap-3 rounded-full bg-[var(--campo)] px-4 text-left text-texto-fraco transition-colors hover:text-texto-suave max-sm:max-w-none max-sm:flex-1"
        >
          <Icon de={PiMagnifyingGlass} tamanho="m" />
          <span className="flex-1 truncate text-[0.9375rem]">
            Buscar no atlas
          </span>
          <kbd className="t-dado rounded-[6px] bg-sup-2 px-1.5 py-0.5 text-[0.75rem] max-sm:hidden">
            ⌘K
          </kbd>
        </button>
        <nav
          aria-label="Principal"
          className="flex items-center gap-1 max-lg:hidden"
        >
          {ITENS.map((i) => (
            <Link
              key={i.chave}
              href={destino(B, i.chave)}
              className="flex min-h-10 items-center rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:text-texto"
            >
              {i.rotulo}
            </Link>
          ))}
          <LinkPlanos esboco={B} className="ml-1" />
        </nav>
        <div className="flex items-center gap-1">
          <span className="max-lg:hidden">
            <Tema />
          </span>
          <AcoesDaConta esboco={B} compacta />
          <MenuDoTelefone esboco={B} />
        </div>
      </div>
      {explorar && (
        <div className="c-resultados absolute inset-x-0 top-full z-menu sup-alta !rounded-none !rounded-b-card">
          <div className="section-wrap flex flex-col gap-6 py-6">
            <LinhaMini />
            <ListaExplorar esboco={B} aoEscolher={() => setExplorar(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

/** A régua das épocas, pequena (no Explorar e no topo do compositor). */
function LinhaMini({
  marca,
}: {
  marca?: { de: number; ate: number; rotulo: string };
}) {
  return (
    <div className="relative" aria-hidden="true">
      <div className="flex h-9 overflow-hidden rounded-full">
        {EPOCAS.map((e, i) => (
          <span
            key={e.id}
            className={cx(
              'flex items-center justify-center text-[0.75rem] text-texto-suave',
              i % 2 ? 'bg-sup-2' : 'bg-[var(--linha)]'
            )}
            style={{ width: `${pos(e.ate) - pos(e.de)}%` }}
          >
            <span className="truncate px-1">{e.nome}</span>
          </span>
        ))}
      </div>
      {marca && (
        <span
          className="b-vida absolute -bottom-2 h-1.5 rounded-full fill-ouro"
          style={{
            left: `${pos(marca.de)}%`,
            width: `${pos(marca.ate) - pos(marca.de)}%`,
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Início: a linha do tempo
// ---------------------------------------------------------------------------

/** Distribui os rostos em faixas para não se sobreporem. */

function Secao({
  titulo,
  acao,
  children,
  className,
}: {
  titulo: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Revelar
      as="section"
      className={cx('section-wrap flex flex-col gap-6 py-12', className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{titulo}</h2>
        {acao}
      </div>
      {children}
    </Revelar>
  );
}

// ---------------------------------------------------------------------------
// Compositor: a vida desenhada (precisa só das datas — 97% têm)
// ---------------------------------------------------------------------------

/** Obras por ano: só quando há anos de composição bastantes (o Chopin tem; 63% das obras não). */
function ObrasPorAno() {
  const max = Math.max(...OBRAS_POR_ANO.map((o) => o.n));
  const de = 1810;
  const ate = 1849;
  const x = (a: number) => ((a - de) / (ate - de)) * 100;
  const marcos = [
    { ano: 1810, texto: 'Nasce em Żelazowa Wola' },
    { ano: 1826, texto: 'Conservatório de Varsóvia' },
    { ano: 1831, texto: 'Chega a Paris' },
    { ano: 1838, texto: 'Inverno em Maiorca' },
    { ano: 1849, texto: 'Morre em Paris' },
  ];
  return (
    <div className="faixa-rola -mx-4 overflow-x-auto px-4">
      <div className="relative min-w-[40rem]">
        <div
          className="flex h-36 items-end gap-[2px]"
          role="img"
          aria-label="Obras de Chopin por ano: o auge entre 1829 e 1839"
        >
          {Array.from({ length: ate - de + 1 }, (_, i) => de + i).map((a) => {
            const n = OBRAS_POR_ANO.find((o) => o.ano === a)?.n ?? 0;
            return (
              <span key={a} className="flex h-full flex-1 flex-col justify-end">
                <span
                  className="b-sobe block rounded-t-[3px] fill-ouro"
                  style={{
                    height: `${(n / max) * 100}%`,
                    minHeight: n ? 3 : 0,
                    opacity: n ? 1 : 0,
                  }}
                />
              </span>
            );
          })}
        </div>
        <div className="relative mt-2 h-24 border-t border-[var(--linha-forte)]">
          {marcos.map((m, k) => (
            <span
              key={m.ano}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${x(m.ano)}%` }}
            >
              <span
                className={cx(
                  'w-px bg-[var(--linha-forte)]',
                  k % 2 ? 'h-10' : 'h-2'
                )}
              />
              <span className="t-dado text-[0.75rem] text-texto-fraco">
                {m.ano}
              </span>
              <span className="whitespace-nowrap text-[0.75rem] text-texto-suave">
                {m.texto}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Quem viveu no mesmo tempo: calculado pelas datas, serve para qualquer compositor. */
function Contemporaneos({ c }: { c: FichaCompositor }) {
  const fim = c.morte ?? FIM;
  const outros = FAMOSOS.filter(
    (f) => f.nome !== c.nome && f.nasc < fim && (f.morte ?? FIM) > c.nasc
  ).slice(0, 7);
  const de = Math.min(c.nasc, ...outros.map((o) => o.nasc)) - 5;
  const ate = Math.max(fim, ...outros.map((o) => o.morte ?? FIM)) + 5;
  const x = (a: number) => ((a - de) / (ate - de)) * 100;
  const linhas = [
    {
      nome: c.nome,
      nasc: c.nasc,
      morte: c.morte,
      retrato: c.retrato ?? null,
      eu: true,
    },
    ...outros.map((o) => ({ ...o, eu: false })),
  ].sort((a, b) => a.nasc - b.nasc);
  return (
    <div className="faixa-rola -mx-4 overflow-x-auto px-4">
      <div className="flex min-w-[40rem] flex-col gap-2">
        {linhas.map((l) => (
          <Link
            key={l.nome}
            href={rota(B, l.eu ? 'compositor-tipico' : 'compositor')}
            className="group relative flex h-9 items-center"
          >
            <span
              className={cx(
                'absolute flex h-full items-center gap-2 rounded-full pr-3',
                l.eu
                  ? 'fill-ouro text-sobre-ouro'
                  : 'bg-sup-2 group-hover:bg-[var(--interactive-hover)]'
              )}
              style={{
                left: `${x(l.nasc)}%`,
                width: `${x(l.morte ?? FIM) - x(l.nasc)}%`,
              }}
            >
              <Retrato
                nome={l.nome}
                src={l.retrato}
                sizes="36px"
                className="h-9 w-9 shrink-0 rounded-full"
              />
              <span className="truncate text-[0.8125rem]">
                {l.nome}{' '}
                <span className="t-dado opacity-70">
                  {anos(l.nasc, l.morte)}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Compositor({ q }: { q: QualFicha }) {
  const c = fichaCompositor(q);
  const { compartilhar } = useEsboco();
  const obraTela = q === 'completa' ? 'obra' : 'obra-tipica';
  return (
    <article className="flex flex-col">
      <header className="section-wrap grid grid-cols-1 gap-8 pb-8 pt-10 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <Retrato
          nome={c.nomeCompleto}
          src={c.retrato}
          prioridade
          sizes="200px"
          className="h-40 w-40 rounded-full text-[2rem] shadow-[var(--sombra-2)] md:h-48 md:w-48"
        />
        <div className="flex flex-col gap-4">
          <h1
            data-vira={`compositor-${c.id}`}
            className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none tracking-[-0.015em]"
          >
            {c.nomeCompleto}
            {c.verificado && (
              <SeloVerificada
                desenhar
                className="ml-2 inline-block h-[0.45em] w-[0.45em] align-[0.3em] text-verificado"
              />
            )}
          </h1>
          <p className="t-corpo text-texto-suave">
            {[
              c.papel && c.papel[0].toUpperCase() + c.papel.slice(1),
              c.pais,
              anos(c.nasc, c.morte),
              `${c.obras} obras`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button icone={PiHeart}>Favoritar</Button>
            <Button
              icone={PiShareNetwork}
              onClick={() =>
                compartilhar({
                  titulo: `${c.nomeCompleto} — ${c.obras} obras no Opus Atlas`,
                  url: `https://opusatlas.com.br/composer/${c.id}`,
                  imagem: c.retrato ?? undefined,
                })
              }
            >
              Compartilhar
            </Button>
          </div>
        </div>
      </header>

      <section className="section-wrap flex flex-col gap-4 py-6">
        <LinhaMini
          marca={{ de: c.nasc, ate: c.morte ?? FIM, rotulo: c.nome }}
        />
      </section>

      <Secao titulo="No mesmo tempo">
        <Contemporaneos c={c} />
      </Secao>

      {q === 'completa' && (
        <Secao titulo="A vida em obras">
          <ObrasPorAno />
        </Secao>
      )}

      <section className="section-wrap grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-6">
          <h2 className="t-titulo">Quem foi</h2>
          <SobreCompositor c={c} />
          <CuriosidadesDoCompositor c={c} />
          <CompletarFicha falta={c.falta} alvo="compositor" />
        </div>
        <aside className="flex flex-col gap-4">
          <h2 className="t-subtitulo">Por onde começar</h2>
          <ul className="flex flex-col gap-2">
            {c.destaques.slice(0, 4).map((o) => (
              <li key={o.id}>
                <Link
                  href={rota(B, obraTela)}
                  data-vira={`obra-${o.id}`}
                  className="group flex items-center justify-between gap-3 rounded-card bg-sup-2 p-4"
                >
                  <span className="flex flex-col">
                    <span className="font-display text-[1.1875rem] group-hover:text-ouro-texto">
                      {o.titulo}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {o.detalhe}
                    </span>
                  </span>
                  <Icon
                    de={PiArrowRight}
                    tamanho="p"
                    className="text-texto-fraco group-hover:text-ouro-texto"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {c.video && (
        <Secao titulo="Para ver">
          <div className="max-w-3xl">
            <VideoDoCompositor c={c} />
          </div>
        </Secao>
      )}

      <Secao
        titulo="Catálogo"
        acao={
          <span className="t-rotulo text-texto-suave">{c.obras} obras</span>
        }
      >
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {c.porGenero.map((g) => (
            <li key={g.nome}>
              <Link
                href={rota(B, 'colecao')}
                className="group flex items-baseline justify-between rounded-card bg-sup-2 p-4"
              >
                <span className="font-display text-[1.1875rem] group-hover:text-ouro-texto">
                  {g.nome}
                </span>
                <span className="t-dado text-[0.8125rem] text-texto-fraco">
                  {g.n}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Secao>

      {c.artigos.length > 0 && (
        <Secao titulo="Para ler">
          <ArtigosLigados artigos={c.artigos} esboco={B} />
        </Secao>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Obra
// ---------------------------------------------------------------------------

function Obra({ q }: { q: QualFicha }) {
  const o = fichaObra(q);
  const c = fichaCompositor(q);
  const { compartilhar } = useEsboco();
  const estudo = useEstudoDaObra(o);
  const anoInicial = o.ano ? Number(o.ano.slice(0, 4)) : null;
  const x = (a: number) => ((a - c.nasc) / ((c.morte ?? FIM) - c.nasc)) * 100;

  return (
    <article className="flex flex-col">
      <header className="section-wrap flex flex-col gap-6 pb-6 pt-10">
        <Link
          href={rota(B, q === 'completa' ? 'compositor' : 'compositor-tipico')}
          className={cx(
            'flex items-center gap-3 self-start t-rotulo text-texto-suave',
            linkTexto
          )}
        >
          <Retrato
            nome={o.compositor.nomeCompleto}
            src={o.compositor.retrato}
            sizes="40px"
            className="h-9 w-9 rounded-full"
          />
          {o.compositor.nomeCompleto} · {o.compositor.anos}
        </Link>
        <h1
          data-vira={`obra-${o.id}`}
          className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-[-0.015em]"
        >
          {o.titulo}
          {o.catalogo && (
            <span className="text-texto-suave">, {o.catalogo}</span>
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <BotoesDeEstudo estudo={estudo} />
          <Button
            icone={PiShareNetwork}
            onClick={() =>
              compartilhar({
                titulo: `${o.titulo} — ${o.compositor.nomeCompleto}`,
                url: `https://opusatlas.com.br/works/${o.id}`,
                imagem: o.compositor.retrato ?? undefined,
              })
            }
          >
            Compartilhar
          </Button>
          <QuemEstuda obra={o} />
        </div>
      </header>

      {/* Onde a obra cai na vida — só quando se sabe o ano (37% das obras). */}
      {anoInicial && (
        <section className="section-wrap py-6">
          <div className="rounded-card bg-sup-2 p-5">
            <p className="t-rotulo mb-5 text-texto-suave">
              Escrita aos {anoInicial - c.nasc} anos
              {c.morte ? `, ${c.morte - anoInicial} antes de morrer` : ''}.
            </p>
            <div className="relative h-12">
              <span className="absolute inset-x-0 top-3 h-px bg-[var(--linha-forte)]" />
              <span
                className="b-vida absolute top-1 h-[18px] min-w-[18px] rounded-full fill-ouro"
                style={{
                  left: `${x(anoInicial)}%`,
                  width: `${x(anoInicial + 2) - x(anoInicial)}%`,
                }}
              />
              {[c.nasc, anoInicial, c.morte ?? FIM].map((a) => (
                <span
                  key={a}
                  className="t-dado absolute top-7 -translate-x-1/2 text-[0.75rem] text-texto-fraco"
                  style={{ left: `${x(a)}%` }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-wrap grid grid-cols-1 gap-12 py-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <h2 className="t-titulo">Partituras</h2>
          <PartiturasAgrupadas
            obra={o}
            aoEstudar={(t) => estudo.abrir('estudar', t)}
          />
        </div>
        <aside className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="t-subtitulo">Ouvir e assistir</h2>
            <Multimidia midia={o.midia} />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="t-subtitulo">Ficha</h2>
            <FichaTecnica obra={o} />
          </div>
          <CompletarFicha falta={o.falta} alvo="obra" />
        </aside>
      </section>

      {o.artigos.length > 0 && (
        <Secao titulo="Para ler">
          <ArtigosLigados artigos={o.artigos} esboco={B} />
        </Secao>
      )}

      <Secao titulo={`Mais de ${o.compositor.nome}`}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {c.destaques
            .filter((d) => d.id !== o.id)
            .slice(0, 4)
            .map((d) => (
              <li key={d.id}>
                <Link
                  href={rota(B, q === 'completa' ? 'obra' : 'obra-tipica')}
                  className="group flex h-full flex-col gap-1 rounded-card bg-sup-2 p-5"
                >
                  <span className="font-display text-[1.1875rem] group-hover:text-ouro-texto">
                    {d.titulo}
                  </span>
                  <span className="t-rotulo text-texto-suave">{d.detalhe}</span>
                </Link>
              </li>
            ))}
        </ul>
      </Secao>
      {estudo.folhas}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Busca, dia, coleção, ensino
// ---------------------------------------------------------------------------

function BuscaPagina() {
  const b = BUSCA_EXEMPLO;
  return (
    <div className="section-wrap grid grid-cols-1 gap-10 py-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6">
        <h1 className="t-titulo">“{b.termo}”</h1>
        <div className="flex flex-col gap-1">
          {[
            ['Tudo', 618],
            ['Obras', 612],
            ['Compositores', 1],
            ['Partituras', 2140],
            ['Artigos', 1],
          ].map(([f, n], i) => (
            <button
              key={f}
              type="button"
              className={cx(
                'flex min-h-10 items-center justify-between rounded-controle px-3 text-[0.9375rem]',
                i === 0
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'text-texto-suave hover:bg-sup-2'
              )}
            >
              {f}{' '}
              <span className="t-dado text-[0.75rem] opacity-70">
                {formatar(n as number)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="t-legenda">Época</span>
          <LinhaMini />
        </div>
      </aside>
      <div className="flex flex-col gap-8">
        <Link
          href={rota(B, 'compositor')}
          className="group flex items-center gap-4 rounded-card bg-sup-2 p-5"
        >
          <Retrato
            nome="John Field"
            sizes="64px"
            className="h-14 w-14 rounded-full"
          />
          <span className="flex flex-col">
            <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
              John Field
            </span>
            <span className="t-rotulo text-texto-suave">
              {b.compositores[0].detalhe}
            </span>
          </span>
        </Link>
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {b.obras.map((o) => (
            <li key={o.titulo}>
              <Link
                href={rota(B, 'obra')}
                className="group flex items-center gap-4 py-4"
              >
                <Retrato
                  nome={o.compositor}
                  src={retratoDe(o.compositor)}
                  sizes="44px"
                  className="h-11 w-11 rounded-full"
                />
                <span className="flex flex-1 flex-col">
                  <span className="font-display text-[1.25rem] group-hover:text-ouro-texto">
                    {o.titulo}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {o.compositor} · {o.partituras} partituras
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Dia() {
  const todos = [
    ...DIA.nasceram.map((p) => ({
      ...p,
      evento: 'nasceu' as const,
      marco: p.ano,
    })),
    ...DIA.morreram.map((p) => ({
      ...p,
      evento: 'morreu' as const,
      marco: p.ano,
    })),
  ].sort((a, b) => a.marco - b.marco);
  return (
    <div className="section-wrap flex flex-col gap-10 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] leading-none">
          {HOJE.rotulo}
        </h1>
        <p className="t-corpo text-texto-suave">
          Neste dia, ao longo de três séculos.
        </p>
      </header>
      <ol className="relative flex flex-col pl-8 before:absolute before:bottom-0 before:left-3 before:top-0 before:w-px before:bg-[var(--linha-forte)]">
        {todos.map((p) => (
          <li key={p.id} className="relative py-4">
            <span
              className={cx(
                'absolute -left-[1.4rem] top-[2.1rem] h-3 w-3 rounded-full',
                p.evento === 'nasceu'
                  ? 'fill-ouro'
                  : 'border-2 border-[var(--linha-forte)] bg-[var(--fundo)]'
              )}
              aria-hidden="true"
            />
            <Link
              href={rota(B, 'compositor')}
              className="group flex items-center gap-5"
            >
              <Retrato
                nome={p.nome}
                src={p.retrato}
                sizes="72px"
                className="h-16 w-16 shrink-0 rounded-full"
              />
              <span className="flex flex-col">
                <span className="t-dado text-ouro-texto">
                  {p.marco} · {p.evento}
                </span>
                <span className="font-display text-[1.5rem] leading-tight group-hover:text-ouro-texto">
                  {p.nome}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {p.pais} · {p.obras} obras no acervo
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Colecao() {
  const c = COLECOES[0];
  return (
    <div className="section-wrap flex flex-col gap-10 py-12">
      <header className="flex flex-col gap-4">
        <Rostos nomes={c.rostos} tamanho="h-12 w-12" />
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
          {c.titulo}
        </h1>
        <p className="t-corpo max-w-[56ch] text-texto-suave">{c.descricao}</p>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COLECAO_PIANO.map((o) => (
          <li key={o.titulo}>
            <Link
              href={rota(B, 'obra')}
              className="group flex h-full items-start gap-4 rounded-card bg-sup-2 p-4"
            >
              <Retrato
                nome={o.compositor}
                src={retratoDe(o.compositor)}
                sizes="48px"
                className="h-12 w-12 shrink-0 rounded-full"
              />
              <span className="flex flex-col">
                <span className="font-display text-[1.1875rem] leading-snug group-hover:text-ouro-texto">
                  {o.titulo}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {o.compositor}, {o.catalogo}
                </span>
                <span className="t-dado mt-1 text-[0.75rem] text-texto-fraco">
                  {o.min} min · {o.nivel}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Ensino() {
  const etapas = [
    [
      'Abra seu horário',
      'Diga quando atende, a folga entre aulas e o tempo de deslocamento.',
    ],
    [
      'Convide os alunos',
      'Por e-mail. Eles entram de graça e trazem o repertório que já têm.',
    ],
    [
      'Dê a aula',
      'Com a obra e a partitura na tela; feche em um minuto: presença, o que viu, a tarefa.',
    ],
    [
      'Acompanhe',
      'O diário de prática e os relatórios mostram para onde foi a semana de cada um.',
    ],
  ];
  return (
    <div className="flex flex-col">
      <section className="section-wrap flex flex-col gap-6 py-14 md:py-20">
        <h1 className="entra font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] tracking-[-0.015em] max-w-[18ch]">
          O portal para quem ensina música
        </h1>
        <p
          className="t-corpo entra max-w-[56ch] text-texto-suave"
          style={{ ['--i' as string]: 1 }}
        >
          Agenda, aulas, tarefas e o repertório dos alunos, ligado a todas as
          obras do atlas.
        </p>
        <div
          className="entra flex flex-wrap gap-3"
          style={{ ['--i' as string]: 2 }}
        >
          <Link
            href={destino(B, 'planos')}
            className={classesDeBotao('primario', 'm')}
          >
            Ver planos
          </Link>
        </div>
      </section>
      <section className="section-wrap py-10">
        <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
          <span
            className="absolute left-0 right-0 top-5 h-px bg-[var(--linha-forte)] max-md:hidden"
            aria-hidden="true"
          />
          {etapas.map(([t, d], i) => (
            <li key={t} className="relative flex flex-col gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-full fill-ouro font-display text-[1.125rem] text-sobre-ouro">
                {i + 1}
              </span>
              <h2 className="t-subtitulo">{t}</h2>
              <p className="t-rotulo text-texto-suave">{d}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="section-wrap py-10">
        <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-8 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-[1.75rem] leading-snug">
            Mentor, até 7 alunos · Maestro, sem limite
          </p>
          <Link
            href={destino(B, 'planos')}
            className={classesDeBotao('primario', 'm')}
          >
            Comparar planos
          </Link>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pessoais: "seu atlas"
// ---------------------------------------------------------------------------

function Pessoal({ tela }: { tela: Tela }) {
  const { logado, abrirEntrar } = useEsboco();
  const item = PESSOAIS.find((p) => p.tela === tela);
  const corpo = {
    estudo: <Estudo />,
    favoritos: <Favoritos />,
    anotacoes: <Anotacoes />,
    envios: <Envios />,
    conquistas: <Conquistas />,
    perfil: <Perfil />,
  }[tela as 'estudo'];

  if (!logado) {
    return (
      <div className="section-wrap flex flex-col items-start gap-4 py-24">
        <h1 className="t-titulo">Seu atlas aparece quando você entra</h1>
        <Button variante="primario" onClick={abrirEntrar}>
          Entrar
        </Button>
      </div>
    );
  }

  return (
    <div className="section-wrap grid grid-cols-1 gap-10 py-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sup-2 font-display text-[1.375rem] text-ouro-texto">
            M
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[1.25rem]">
              {PESSOA.nomeCompleto}
            </span>
            <span className="t-legenda">{PESSOA.sequencia} dias seguidos</span>
          </span>
        </div>
        <NivelEXp />
        <nav
          aria-label="Suas páginas"
          className="faixa-rola -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0"
        >
          {PESSOAIS.map((p) => (
            <Link
              key={p.tela}
              href={rota(B, p.tela)}
              aria-current={p.tela === tela ? 'page' : undefined}
              className={cx(
                'flex min-h-[var(--alvo)] shrink-0 items-center gap-3 rounded-controle px-3 text-[0.9375rem]',
                p.tela === tela
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
              )}
            >
              <Icon de={p.icone} tamanho="p" />
              {p.rotulo}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col gap-8">
        <h1 className="t-titulo">{item?.rotulo}</h1>
        {corpo}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EsbocoB({ tela }: { tela: Tela }) {
  const [paleta, setPaleta] = useState(false);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaleta(true);
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, []);

  const sistema: Partial<Record<Tela, ReactNode>> = {
    confirmar: <ConfirmarConta variante={B} />,
    redefinir: <NovaSenha variante={B} />,
    convite: <ConviteDeProfessor variante={B} />,
    '404': <NaoEncontradaFinal esboco={B} />,
    negado: <AcessoNegadoFinal esboco={B} />,
  };
  const publico: Partial<Record<Tela, ReactNode>> = {
    inicio: <HomeFinal esboco={B} heroi="faixa" />,
    compositor: <Compositor q="completa" />,
    'compositor-tipico': <Compositor q="tipica" />,
    obra: <Obra q="completa" />,
    'obra-tipica': <Obra q="tipica" />,
    busca: <BuscaPagina />,
    dia: <Dia />,
    colecao: <Colecao />,
    ensino: <Ensino />,
    compositores: <CompositoresB />,
    obras: <ObrasB />,
    historia: <HistoriaB />,
    instrumentos: <InstrumentosB />,
    estudar: <PaginaEstudar esboco={B} />,
  };

  return (
    <div className="min-h-dvh bg-fundo text-texto">
      <Barra abrirPaleta={() => setPaleta(true)} />
      <main className="pb-24">
        {TELAS_PESSOAIS.includes(tela) ? (
          <Pessoal tela={tela} />
        ) : (
          (sistema[tela] ?? publico[tela])
        )}
      </main>
      <Rodape esboco={B} />
      <Paleta aberta={paleta} aoFechar={() => setPaleta(false)} />
    </div>
  );
}
