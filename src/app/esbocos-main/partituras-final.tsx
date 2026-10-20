'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiArrowSquareOut,
  PiBookmarkSimple,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiDownloadSimple,
  PiFiles,
  PiMagnifyingGlass,
  PiUploadSimple,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import Image from '@/app/components/SmartImage';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { MINIATURAS } from './fichas-dados';
import { Coracao } from './coracao';
import { linkTexto, useEsboco } from './pecas';

/**
 * Partituras como o IMSLP as organiza — e como o as-is já mostra
 * (`IMSLPTabsIncremental` + `ScoreCard`, 06/10, 2ª rodada):
 *
 * - **Aba** = o tipo (partituras, partes, arranjos…).
 * - **Seção** = o `groupTitle`, o h5 da página do IMSLP ("Partitura
 *   completa", "Para orquestra (Mouton)").
 * - **Edição** = um `groupIndex`, a caixa do IMSLP: uma miniatura e uma ficha
 *   (editora, ano, editor) para todos os arquivos dela — a partitura
 *   completa e os números avulsos, ou as partes de uma orquestração. No
 *   as-is os arquivos do grupo vêm colados e só o último mostra miniatura e
 *   ficha; aqui é a mesma ideia, numa caixa só.
 * - Nem toda partitura tem miniatura (699 no banco): no lugar, uma folha
 *   tipográfica. Nem toda edição tem editora (o banco grava pouco).
 *
 * Clicar abre a prévia do esboço C numa folha média (não em tela cheia).
 */

export interface ArquivoP {
  id: string;
  titulo: string;
  paginas?: number;
  tamanho?: string;
  miniatura?: string;
}

export interface Edicao {
  editora: string;
  ano?: string;
  editor?: string;
  nota?: string;
}

export interface Versao {
  id: string;
  /** Envio de alguém daqui (não veio do IMSLP). */
  autor?: string;
  edicao?: Edicao;
  arquivos: ArquivoP[];
}

export interface Secao {
  titulo: string;
  comunidade?: boolean;
  versoes: Versao[];
}

export type TipoP =
  | 'partituras'
  | 'partes'
  | 'arranjos'
  | 'libretos'
  | 'outros'
  | 'fontes';
export const ROTULO_TIPO: Record<TipoP, string> = {
  partituras: 'Partituras',
  partes: 'Partes',
  arranjos: 'Arranjos',
  libretos: 'Libretos',
  outros: 'Outros',
  fontes: 'Arquivos-fonte',
};

// ---------------------------------------------------------------------------
// Os dados dos Noturnos, Op. 9 (grupos e títulos reais do banco)
// ---------------------------------------------------------------------------

const PAGS = [13, 11, 12, 14, 14, 15, 25, 17, 7, 8, 3, 4];
const TAMS = [
  '1,87 MB',
  '3,82 MB',
  '1,49 MB',
  '1,29 MB',
  '3,07 MB',
  '1,83 MB',
  '3,04 MB',
  '1,71 MB',
];
const umArquivo = (
  id: string,
  i: number,
  titulo = 'Partitura completa',
  semMiniatura = false
): Versao => ({
  id,
  arquivos: [
    {
      id: `${id}-0`,
      titulo,
      paginas: semMiniatura ? undefined : PAGS[i % PAGS.length],
      tamanho: TAMS[i % TAMS.length],
      miniatura: semMiniatura ? undefined : MINIATURAS[i % MINIATURAS.length],
    },
  ],
});

const NUMEROS_OP9 = [
  'Partitura completa',
  'Nº 1 em si♭ menor',
  'Nº 2 em mi♭ maior',
  'Nº 3 em si maior',
];
/** Uma caixa do IMSLP com a obra inteira e os números avulsos. */
const edicaoCompleta = (
  id: string,
  i: number,
  edicao: Edicao,
  titulos = NUMEROS_OP9
): Versao => ({
  id,
  edicao,
  arquivos: titulos.map((t, k) => ({
    id: `${id}-${k}`,
    titulo: t,
    paginas: k === 0 ? PAGS[i % PAGS.length] : 4 + k,
    tamanho: TAMS[(i + k) % TAMS.length],
    miniatura: MINIATURAS[(i + k) % MINIATURAS.length],
  })),
});

const MOUTON = [
  'Regente (piano)',
  'Flauta',
  'Oboé',
  'Clarinete 1/2 (si♭)',
  'Fagote',
  'Trompa 1/2 (fá)',
  'Tímpanos',
  'Violinos I',
  'Violinos II',
  'Viola',
  'Violoncelos',
  'Contrabaixos',
];

export const PARTITURAS_OBRA: Partial<Record<TipoP, Secao[]>> = {
  partituras: [
    {
      titulo: 'Enviadas por quem estuda aqui',
      comunidade: true,
      versoes: [
        {
          id: 'u1',
          autor: 'Marina D.',
          arquivos: [
            {
              id: 'u1-0',
              titulo: 'Nº 2 com digitação',
              paginas: 4,
              tamanho: '0,8 MB',
            },
          ],
        },
      ],
    },
    {
      titulo: 'Partitura completa',
      versoes: [
        edicaoCompleta('br', 0, {
          editora: 'Breitkopf & Härtel',
          ano: '1878',
          editor: 'Woldemar Bargiel, Johannes Brahms e outros',
          nota: 'Obras completas de Chopin, volume 4',
        }),
        edicaoCompleta(
          'du',
          2,
          {
            editora: 'Durand',
            ano: '1915',
            editor: 'Claude Debussy',
          },
          ['Partitura completa', 'Nº 2 em mi♭ maior']
        ),
        {
          ...umArquivo('ki', 4),
          edicao: {
            editora: 'Fr. Kistner',
            ano: '1833',
            nota: 'Primeira edição alemã',
          },
        },
        {
          ...umArquivo('sc', 5),
          edicao: {
            editora: 'G. Schirmer',
            ano: '1894',
            editor: 'Karl Mikuli',
          },
        },
        {
          ...umArquivo('pe', 6),
          edicao: {
            editora: 'C.F. Peters',
            ano: 'c. 1880',
            editor: 'Hermann Scholtz',
          },
        },
        ...Array.from({ length: 23 }, (_, i) => umArquivo(`pc${i}`, i + 7)),
        umArquivo('pc28', 9, 'Partitura completa', true),
      ],
    },
    {
      titulo: '1. Larghetto',
      versoes: [
        umArquivo('lg0', 3, '1. Larghetto'),
        umArquivo('lg1', 5, '1. Larghetto'),
      ],
    },
  ],
  arranjos: [
    {
      titulo: 'Para orquestra (Mouton)',
      versoes: [
        {
          id: 'mt',
          edicao: {
            editora: 'J. Hamelle',
            ano: 'c. 1900',
            editor: 'Henri Mouton',
          },
          arquivos: MOUTON.map((t, i) => ({
            id: `mt-${i}`,
            titulo: t,
            paginas: i === 0 ? 4 : i > 6 ? 2 : 1,
            tamanho: i === 0 ? '0,47 MB' : '0,06 MB',
            miniatura: MINIATURAS[(i + 2) % 8],
          })),
        },
      ],
    },
    {
      titulo: 'Para orquestra (Caplet)',
      versoes: [
        {
          id: 'cp',
          arquivos: [
            { id: 'cp-0', titulo: 'Partitura completa', tamanho: '0,02 MB' },
          ],
        },
      ],
    },
    {
      titulo: 'Para instrumento e piano (Larocque)',
      versoes: [
        {
          id: 'lr',
          edicao: {
            editora: 'Edição do arranjador',
            ano: '2019',
            editor: 'Jacques Larocque',
          },
          arquivos: [
            'Flauta',
            'Oboé',
            'Clarinete',
            'Violino',
            'Violoncelo',
            'Piano',
          ].map((t, i) => ({
            id: `lr-${i}`,
            titulo: `Partitura completa (${t})`,
            paginas: 4,
            tamanho: '0,12 MB',
            miniatura: MINIATURAS[(i + 4) % 8],
          })),
        },
      ],
    },
    {
      titulo: 'Para violão (Tárrega)',
      versoes: [
        umArquivo('tg0', 5, 'Partitura completa'),
        umArquivo('tg1', 6, 'Partitura completa'),
        umArquivo('tg2', 7, 'Partitura completa'),
      ],
    },
    {
      titulo: 'Para violino e piano (Roelens)',
      versoes: [
        {
          id: 'rl',
          edicao: {
            editora: 'Schott',
            ano: 'c. 1910',
            editor: 'Édouard Roelens',
          },
          arquivos: [
            { id: 'rl-0', titulo: 'Partitura completa', tamanho: '0,01 MB' },
            { id: 'rl-1', titulo: 'Violino', tamanho: '0,01 MB' },
          ],
        },
      ],
    },
  ],
};

export const contarTipo = (s?: Secao[]) =>
  (s ?? []).reduce((n, x) => n + x.versoes.length, 0);

// ---------------------------------------------------------------------------
// A folha tipográfica: no lugar da miniatura que não existe
// ---------------------------------------------------------------------------

function FolhaSemMiniatura({
  titulo,
  paginas,
  pequena = false,
}: {
  titulo: string;
  paginas?: number;
  pequena?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sobre-foto p-3 text-center text-sobre-ouro"
    >
      <span className="flex w-3/4 flex-col gap-[3px]">
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="h-px bg-sobre-ouro/30" />
        ))}
      </span>
      {!pequena && (
        <span className="line-clamp-2 font-display text-[0.9375rem] leading-tight">
          {titulo}
        </span>
      )}
      <span className="t-dado text-[0.6875rem] opacity-70">
        {paginas ? `${paginas} pág.` : 'PDF'}
      </span>
    </span>
  );
}

function Pagina({
  a,
  sizes,
  pequena = false,
  prioridade = false,
}: {
  a: ArquivoP;
  sizes: string;
  pequena?: boolean;
  prioridade?: boolean;
}) {
  const [quebrou, setQuebrou] = useState(false);
  return a.miniatura && !quebrou ? (
    <Image
      src={a.miniatura}
      alt=""
      fill
      sizes={sizes}
      priority={prioridade}
      onError={() => setQuebrou(true)}
      className="object-contain"
    />
  ) : (
    <FolhaSemMiniatura
      titulo={a.titulo}
      paginas={a.paginas}
      pequena={pequena}
    />
  );
}

// ---------------------------------------------------------------------------
// A caixa de edição (o `groupIndex` do IMSLP)
// ---------------------------------------------------------------------------

export type Alvo = { v: Versao; s: Secao; n: number; k: number };

function fichaDaEdicao(v: Versao, n: number) {
  if (v.autor)
    return {
      titulo: `Enviada por ${v.autor}`,
      detalhe: 'Opus Atlas · comunidade',
    };
  if (!v.edicao)
    return {
      titulo: `Edição ${n}`,
      detalhe: 'IMSLP · domínio público · sem editora informada',
    };
  const e = v.edicao;
  return {
    titulo: [e.editora, e.ano].filter(Boolean).join(', '),
    detalhe: [
      e.editor && `Editor: ${e.editor}`,
      e.nota,
      'IMSLP · domínio público',
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

function CaixaDeEdicao({
  v,
  secao,
  numero,
  aoAbrir,
  aoEstudar,
  kEscolhido = null,
}: {
  v: Versao;
  secao: Secao;
  numero: number;
  aoAbrir: (k: number) => void;
  aoEstudar: (t: string) => void;
  /** Qual arquivo desta edição está na lateral (lg+). */
  kEscolhido?: number | null;
}) {
  const capa = v.arquivos[0];
  const ficha = fichaDaEdicao(v, numero);
  return (
    <li
      className={cx(
        'flex gap-4 rounded-card p-3 sm:gap-5 sm:p-4',
        'bg-sup-2',
        kEscolhido !== null && 'lg:ring-1 lg:ring-[var(--ouro)]'
      )}
    >
      <button
        type="button"
        onClick={() => aoAbrir(0)}
        aria-label={`Ver a primeira página — ${ficha.titulo}`}
        className="group relative block aspect-[1/1.3] w-16 shrink-0 self-start overflow-hidden rounded-[6px] bg-sobre-foto shadow-[var(--sombra-1)] transition-shadow duration-[var(--t-resposta)] hover:shadow-[var(--sombra-2)] sm:w-24"
      >
        <Pagina a={capa} sizes="96px" pequena />
        {v.arquivos.length > 1 && (
          <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-[var(--veu-foto)] px-1.5 py-0.5 text-[0.6875rem] text-sobre-foto">
            <Icon de={PiFiles} tamanho="pp" /> {v.arquivos.length}
          </span>
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-col">
          <span
            className={cx(
              'font-display text-[1.125rem] leading-snug',
              v.autor && 'text-ouro-texto'
            )}
          >
            {ficha.titulo}
          </span>
          <span className="t-legenda">{ficha.detalhe}</span>
        </div>
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {v.arquivos.map((a, k) => (
            <li key={a.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => aoAbrir(k)}
                aria-current={kEscolhido === k ? 'true' : undefined}
                className="group flex min-h-11 min-w-0 flex-1 flex-col justify-center py-1.5 text-left"
              >
                <span
                  className={cx(
                    'truncate text-[0.9375rem] group-hover:text-ouro-texto',
                    kEscolhido === k && 'lg:text-ouro-texto'
                  )}
                >
                  {a.titulo}
                </span>
                <span className="t-dado text-[0.6875rem] text-texto-fraco">
                  {['PDF', a.paginas && `${a.paginas} pág.`, a.tamanho]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </button>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiDownloadSimple}
                rotulo={`Baixar ${a.titulo}`}
              />
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiBookmarkSimple}
                rotulo={`Estudar com ${a.titulo}`}
                onClick={() =>
                  aoEstudar(`${secao.titulo} · ${ficha.titulo} · ${a.titulo}`)
                }
                className="max-sm:hidden"
              />
              <Coracao
                rotulo={`${a.titulo} (${ficha.titulo})`}
                className="!h-8 !w-8"
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function SecaoP({
  s,
  aberta: inicial,
  aoAbrir,
  aoEstudar,
  escolhida,
}: {
  s: Secao;
  aberta: boolean;
  aoAbrir: (a: Alvo) => void;
  aoEstudar: (t: string) => void;
  escolhida?: Alvo | null;
}) {
  const [aberta, setAberta] = useState(inicial);
  const [todas, setTodas] = useState(false);
  const limite = 4;
  const visiveis = todas ? s.versoes : s.versoes.slice(0, limite);
  const arquivos = s.versoes.reduce((n, v) => n + v.arquivos.length, 0);
  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={aberta}
        onClick={() => setAberta(!aberta)}
        className="flex min-h-[var(--alvo)] items-center justify-between gap-3 border-b border-[var(--linha)] text-left"
      >
        <span className="flex min-w-0 items-baseline gap-3">
          <span
            className={cx(
              'truncate font-display text-[1.25rem]',
              s.comunidade && 'text-ouro-texto'
            )}
          >
            {s.titulo}
          </span>
          <span className="t-dado shrink-0 text-[0.75rem] text-texto-fraco">
            {s.versoes.length === 1
              ? '1 edição'
              : `${s.versoes.length} edições`}
            {arquivos > s.versoes.length ? ` · ${arquivos} arquivos` : ''}
          </span>
        </span>
        <Icon
          de={PiCaretDown}
          tamanho="p"
          className={cx(
            'shrink-0 text-texto-fraco transition-transform duration-[var(--t-resposta)]',
            aberta && 'rotate-180'
          )}
        />
      </button>
      {aberta && (
        <>
          <ul className="flex flex-col gap-3">
            {visiveis.map((v, i) => (
              <CaixaDeEdicao
                key={v.id}
                v={v}
                secao={s}
                numero={i + 1}
                aoAbrir={(k) => aoAbrir({ v, s, n: i + 1, k })}
                aoEstudar={aoEstudar}
                kEscolhido={escolhida?.v.id === v.id ? escolhida.k : null}
              />
            ))}
          </ul>
          {s.versoes.length > limite && !todas && (
            <Button
              variante="texto"
              className="self-start"
              onClick={() => setTodas(true)}
            >
              Ver as {s.versoes.length} edições
            </Button>
          )}
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// A prévia (a do esboço C): na lateral da obra, ou numa folha no telefone
// ---------------------------------------------------------------------------

/** O arquivo da vez dentro da edição; ← → trocam quando `teclado`. */
function useArquivoDaVez(alvo: Alvo | null, teclado: boolean) {
  const [k, setK] = useState(alvo?.k ?? 0);
  const arquivos = alvo?.v.arquivos ?? [];
  useEffect(() => {
    if (alvo) setK(alvo.k);
  }, [alvo]);
  const mover = useCallback(
    (d: 1 | -1) => setK((x) => (x + d + arquivos.length) % arquivos.length),
    [arquivos.length]
  );
  useEffect(() => {
    if (!teclado || !alvo || arquivos.length < 2) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [teclado, alvo, arquivos.length, mover]);
  return { k, setK, mover, arquivos, a: arquivos[k] ?? arquivos[0] };
}

/** A página grande, com o véu embaixo: nome, "arquivo x de y" e as setas. */
function PaginaComSetas({
  arquivos,
  k,
  mover,
  className,
  sizes,
}: {
  arquivos: ArquivoP[];
  k: number;
  mover: (d: 1 | -1) => void;
  className?: string;
  sizes: string;
}) {
  const toque = useRef<number | null>(null);
  const a = arquivos[k] ?? arquivos[0];
  return (
    <div
      className={cx(
        'relative aspect-[1/1.3] overflow-hidden rounded-card bg-sobre-foto shadow-[var(--sombra-2)]',
        className
      )}
      onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (toque.current === null) return;
        const d = e.changedTouches[0].clientX - toque.current;
        if (Math.abs(d) > 50 && arquivos.length > 1) mover(d < 0 ? 1 : -1);
        toque.current = null;
      }}
    >
      <span key={a.id} className="boas-vindas-passo absolute inset-0">
        <Pagina a={a} sizes={sizes} prioridade />
      </span>
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-veu-foto to-transparent p-4 pt-12 text-sobre-foto">
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-display text-[1.1875rem]">
            {a.titulo}
          </span>
          <span className="text-[0.8125rem] opacity-90">
            {arquivos.length > 1
              ? `Arquivo ${k + 1} de ${arquivos.length}`
              : 'Prévia da 1ª página'}
            {a.paginas ? ` · ${a.paginas} páginas` : ''}
          </span>
        </span>
        {arquivos.length > 1 && (
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => mover(-1)}
              className="grid h-10 w-10 place-items-center rounded-full bg-[var(--veu-foto)] hover:text-[var(--ouro)]"
            >
              <Icon de={PiCaretLeft} tamanho="p" rotulo="Arquivo anterior" />
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              className="grid h-10 w-10 place-items-center rounded-full bg-[var(--veu-foto)] hover:text-[var(--ouro)]"
            >
              <Icon de={PiCaretRight} tamanho="p" rotulo="Próximo arquivo" />
            </button>
          </span>
        )}
      </span>
    </div>
  );
}

/** Os outros arquivos da mesma edição (partes, números avulsos). */
function FaixaDeArquivos({
  arquivos,
  k,
  setK,
}: {
  arquivos: ArquivoP[];
  k: number;
  setK: (j: number) => void;
}) {
  if (arquivos.length < 2) return null;
  return (
    <ul
      aria-label="Arquivos desta edição"
      className="faixa-rola -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {arquivos.map((x, j) => (
        <li key={x.id} className="shrink-0">
          <button
            type="button"
            aria-current={j === k ? 'true' : undefined}
            onClick={() => setK(j)}
            className={cx(
              'flex w-40 items-center gap-2.5 rounded-controle p-2 text-left',
              j === k
                ? 'tint-ouro text-ouro-na-tinta'
                : 'bg-sup-2 hover:bg-[var(--interactive-hover)]'
            )}
          >
            <span className="relative aspect-[1/1.3] w-8 shrink-0 overflow-hidden rounded-[4px] bg-sobre-foto">
              <Pagina a={x} sizes="32px" pequena />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[0.8125rem]">{x.titulo}</span>
              <span className="t-dado text-[0.6875rem] opacity-70">
                {x.paginas ? `${x.paginas} pág.` : 'PDF'}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * A partitura ao lado da lista (06/10, 3ª rodada — como no esboço C): ao
 * clicar numa partitura, a coluna da ficha mostra a página com as setas e,
 * embaixo, a seção, a edição e o arquivo, com baixar, estudar e favoritar, e
 * os outros arquivos da edição. Outro clique troca o que aparece aqui.
 */
export function PartituraNaLateral({
  alvo,
  aoEstudar,
}: {
  alvo: Alvo | null;
  aoEstudar: (t: string) => void;
}) {
  const { k, setK, mover, arquivos, a } = useArquivoDaVez(alvo, true);
  if (!alvo || !a) return null;
  const ficha = fichaDaEdicao(alvo.v, alvo.n);
  return (
    <div className="flex flex-col gap-5">
      <PaginaComSetas
        arquivos={arquivos}
        k={k}
        mover={mover}
        sizes="(max-width: 1024px) 100vw, 30vw"
        className="mx-auto h-[min(46dvh,30rem)] max-w-full"
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="t-legenda">{alvo.s.titulo}</span>
            <span
              className={cx(
                'font-display text-[1.375rem] leading-snug',
                alvo.v.autor && 'text-ouro-texto'
              )}
            >
              {ficha.titulo}
            </span>
            <span className="t-rotulo text-texto-suave">{ficha.detalhe}</span>
          </span>
          <Coracao
            rotulo={`${a.titulo} (${ficha.titulo})`}
            className="bg-sup-2"
          />
        </div>
        <dl className="grid grid-cols-3 gap-3 border-y border-[var(--linha)] py-2.5">
          {[
            ['Arquivo', a.titulo],
            ['Páginas', a.paginas ? String(a.paginas) : '—'],
            ['Tamanho', a.tamanho ?? '—'],
          ].map(([t, v]) => (
            <div key={t} className="flex min-w-0 flex-col">
              <dt className="t-legenda">{t}</dt>
              <dd className="truncate text-[0.9375rem]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-2">
          <Button variante="primario" icone={PiDownloadSimple}>
            Baixar PDF
          </Button>
          <Button
            icone={PiBookmarkSimple}
            onClick={() =>
              aoEstudar(`${alvo.s.titulo} · ${ficha.titulo} · ${a.titulo}`)
            }
          >
            Estudar esta
          </Button>
        </div>
        <FaixaDeArquivos arquivos={arquivos} k={k} setK={setK} />
      </div>
    </div>
  );
}

/** No telefone (sem lateral): a mesma prévia numa folha de baixo. */
function Previa({
  obra,
  alvo,
  aoFechar,
  aoEstudar,
}: {
  obra: string;
  alvo: Alvo | null;
  aoFechar: () => void;
  aoEstudar: (t: string) => void;
}) {
  const { k, setK, mover, arquivos, a } = useArquivoDaVez(alvo, !!alvo);
  const ficha = alvo ? fichaDaEdicao(alvo.v, alvo.n) : null;
  return (
    <Sheet
      aberto={!!alvo}
      aoFechar={aoFechar}
      titulo={obra}
      descricao={
        alvo && ficha ? `${alvo.s.titulo} · ${ficha.titulo}` : undefined
      }
      largura="m"
      rodape={
        alvo && a ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variante="primario" icone={PiDownloadSimple}>
              Baixar PDF
            </Button>
            <Button
              icone={PiBookmarkSimple}
              onClick={() =>
                aoEstudar(`${alvo.s.titulo} · ${ficha?.titulo} · ${a.titulo}`)
              }
            >
              Estudar esta
            </Button>
            <Button
              variante="fantasma"
              icone={PiArrowSquareOut}
              className="sm:ml-auto"
            >
              PDF completo
            </Button>
          </div>
        ) : undefined
      }
    >
      {alvo && a && (
        <div className="flex flex-col gap-4">
          <PaginaComSetas
            arquivos={arquivos}
            k={k}
            mover={mover}
            sizes="352px"
            className="mx-auto h-[min(50dvh,28rem)] max-w-full"
          />
          <FaixaDeArquivos arquivos={arquivos} k={k} setK={setK} />
        </div>
      )}
    </Sheet>
  );
}

// ---------------------------------------------------------------------------

export function PartiturasFinal({
  obra,
  estado,
  aoEstudar,
  escolhida,
  aoEscolher,
}: {
  obra: string;
  estado: 'stored' | 'pending' | 'none';
  aoEstudar: (t: string) => void;
  /** Com lateral (computador): a partitura que a lateral mostra. */
  escolhida?: Alvo | null;
  aoEscolher?: (a: Alvo) => void;
}) {
  const tipos = (Object.keys(ROTULO_TIPO) as TipoP[]).filter(
    (t) => contarTipo(PARTITURAS_OBRA[t]) > 0
  );
  const [tipo, setTipo] = useState<TipoP>(tipos[0] ?? 'partituras');
  const [alvo, setAlvo] = useState<Alvo | null>(null);
  const { logado, abrirEntrar } = useEsboco();
  /** No computador a lateral mostra; no telefone abre a folha. */
  const abrir = (x: Alvo) => {
    if (aoEscolher && window.matchMedia('(min-width: 1024px)').matches)
      aoEscolher(x);
    else setAlvo(x);
  };
  const enviar = () =>
    logado
      ? toast('Abre o envio de partitura, com esta obra já escolhida')
      : abrirEntrar();

  if (estado === 'pending') {
    return (
      <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-6">
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--fundo)] text-ouro-texto">
            <Icon de={PiMagnifyingGlass} tamanho="p" />
          </span>
          <span className="flex flex-col">
            <span className="font-medium">Buscando as partituras no IMSLP</span>
            <span className="t-rotulo text-texto-suave">
              É a primeira visita a esta obra. Leva alguns segundos; a página se
              atualiza sozinha.
            </span>
          </span>
        </span>
        <ul
          className="grid grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))] gap-4"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <li
              key={i}
              className="loading-skeleton aspect-[1/1.3] rounded-[8px]"
            />
          ))}
        </ul>
      </div>
    );
  }
  if (estado === 'none' || !tipos.length) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-6">
        <span className="font-medium">
          O IMSLP não tem partitura desta obra
        </span>
        <span className="t-rotulo text-texto-suave">
          Tem uma de domínio público, ou uma digitação sua? Envie: entra no ar
          na hora, com o seu nome.
        </span>
        <Button icone={PiUploadSimple} onClick={enviar}>
          Enviar partitura
        </Button>
      </div>
    );
  }

  const secoes = PARTITURAS_OBRA[tipo] ?? [];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo="Tipo de partitura">
          {tipos.map((t) => (
            <Aba key={t} ativa={tipo === t} onClick={() => setTipo(t)}>
              {ROTULO_TIPO[t]} · {contarTipo(PARTITURAS_OBRA[t])}
            </Aba>
          ))}
        </Abas>
        <span className="t-legenda">Domínio público · PDF · grátis</span>
      </div>
      <div className="flex flex-col gap-8">
        {secoes.map((s, i) => (
          <SecaoP
            key={s.titulo}
            s={s}
            aberta={i < 2}
            aoAbrir={abrir}
            aoEstudar={aoEstudar}
            escolhida={escolhida}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={enviar}
        className={cx(
          'inline-flex items-center gap-2 self-start t-rotulo text-texto-suave',
          linkTexto
        )}
      >
        <Icon de={PiUploadSimple} tamanho="p" /> Enviar uma partitura desta obra
      </button>
      <Previa
        obra={obra}
        alvo={alvo}
        aoFechar={() => setAlvo(null)}
        aoEstudar={(t) => {
          setAlvo(null);
          aoEstudar(t);
        }}
      />
    </div>
  );
}
