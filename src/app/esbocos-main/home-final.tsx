'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  PiArrowRight,
  PiArrowSquareOut,
  PiArrowsClockwise,
  PiArticle,
  PiBookOpen,
  PiBookmarkSimple,
  PiChalkboardTeacher,
  PiFunnel,
  PiHourglassMedium,
  PiLightbulb,
  PiMagnifyingGlass,
  PiPlay,
  PiPlus,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { categories, musicalFacts } from '@/app/utils/utils';
import { Carrossel as CarrosselComPontos } from '@/app/components/blog/site/Carrossel';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { cx } from '@/app/components/ui/cx';
import {
  CHOPIN,
  CONCERTOS,
  FAMOSOS,
  PESSOA,
  destino,
  rota,
  type EsbocoId,
} from './dados';
import { DescobertasEAdicoes } from './fichas';
import { MINIATURAS } from './fichas-dados';
import {
  COLECOES_FINAL,
  COMECAR_CHOPIN,
  EXTRA_CHOPIN,
  PERIODOS,
  ROTULO_COLECAO,
} from './final-dados';
import { Coracao } from './coracao';
import {
  CartaoCompositor,
  LARGURA_CARTAO_COMPOSITOR,
} from './cartao-compositor';
import {
  Retrato,
  Rostos,
  anos,
  linkTexto,
  nomeDaEpoca,
  retratoDe,
  useEsboco,
} from './pecas';

/**
 * A home consolidada (06/10), na ordem pedida pelo dono:
 * herói de boas-vindas → populares → compositor em destaque → períodos
 * (carrossel com pontos) → coleções | concertos → curiosidades musicais →
 * descobrir → gatilho de planos. O herói muda por esboço, sempre com o selo
 * do Opus Atlas: A a busca que responde, B a estante em ação, C a jornada
 * do primeiro prelúdio ao recital.
 */

export type Heroi = 'atlas' | 'faixa' | 'globo';

// ---------------------------------------------------------------------------
// Herói
// ---------------------------------------------------------------------------

function BuscaDoHeroi({ esboco }: { esboco: EsbocoId }) {
  return (
    <form
      role="search"
      action={rota(esboco, 'busca')}
      className="c-busca flex w-full items-center gap-3 rounded-full bg-[var(--campo)] p-2 pl-6 shadow-[var(--sombra-1)]"
    >
      <Icon
        de={PiMagnifyingGlass}
        tamanho="g"
        className="shrink-0 text-texto-fraco"
      />
      <label htmlFor="busca-heroi" className="sr-only">
        Buscar no Opus Atlas
      </label>
      <input
        id="busca-heroi"
        name="q"
        type="search"
        enterKeyHint="search"
        placeholder="Uma obra, um compositor, um instrumento…"
        className="min-h-12 min-w-0 flex-1 bg-transparent text-[1.0625rem] outline-none placeholder:text-texto-fraco"
      />
      <Button variante="primario" type="submit" className="shrink-0">
        Buscar
      </Button>
    </form>
  );
}

/** As ações do herói: para quem chega, estante grátis e planos; para quem entrou, continuar. */
function AcoesDoHeroi({
  esboco,
  centro = false,
  principal = 'Criar minha estante grátis',
  segunda,
}: {
  esboco: EsbocoId;
  centro?: boolean;
  principal?: string;
  /** O segundo caminho (padrão: ver planos). */
  segunda?: { rotulo: string; href: string };
}) {
  const { logado, abrirEntrar } = useEsboco();
  if (logado) {
    const e = PESSOA.estudando[0];
    return (
      <Link
        href={rota(esboco, 'estudo')}
        className={cx(
          'group inline-flex items-center gap-3 rounded-full bg-sup-2 py-2 pl-2 pr-5',
          centro && 'self-center'
        )}
      >
        <Retrato
          nome={e.compositor}
          src={retratoDe(e.compositor)}
          sizes="40px"
          className="h-10 w-10 rounded-full"
        />
        <span className="t-rotulo">
          Continuar{' '}
          <span className="font-display text-[1.0625rem]">{e.obra}</span>
          <span className="text-texto-fraco">
            {' '}
            · {PESSOA.sequencia} dias seguidos
          </span>
        </span>
        <Icon
          de={PiArrowRight}
          tamanho="p"
          className="text-ouro-texto transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    );
  }
  return (
    <div
      className={cx(
        'flex flex-wrap items-center gap-x-6 gap-y-3',
        centro && 'justify-center'
      )}
    >
      <Button variante="primario" onClick={abrirEntrar}>
        {principal}
      </Button>
      <Link
        href={segunda?.href ?? destino(esboco, 'planos')}
        className={cx(
          'inline-flex items-center gap-1.5 t-rotulo text-texto',
          linkTexto
        )}
      >
        {segunda?.rotulo ?? 'Ver planos'}{' '}
        <Icon de={PiArrowRight} tamanho="pp" />
      </Link>
      {segunda?.href !== rota(esboco, 'ensino') && (
        <Link
          href={rota(esboco, 'ensino')}
          className={cx('t-rotulo text-texto-suave', linkTexto)}
        >
          Dá aula? Conheça o portal
        </Link>
      )}
    </div>
  );
}

/**
 * O herói-âncora (06/10, 5ª versão, com copywriting + impeccable): o Opus
 * Atlas como ecossistema da música erudita, sem números. A imagem vem do
 * nome: um atlas celeste gravado em ouro, com o selo no centro e, nas
 * órbitas, cada parte do site — conhecer, partituras, ouvir, história,
 * estudar, aulas, ler, coleções. Cada ponto é um link: o herói também é o
 * mapa do site. Um momento só: as órbitas se traçam e os pontos acendem em
 * sequência; o anel graduado gira devagar (parado com movimento reduzido).
 */

/** O selo do Opus Atlas (o logo, com a transparência tirada da própria gravura). */
function Selo({
  className,
  revela = false,
}: {
  className?: string;
  revela?: boolean;
}) {
  return (
    <span className={cx('block', revela && 'selo-revela', className)}>
      <NextImage
        src="/esbocos-main/selo-opus-atlas.webp"
        alt="Opus Atlas"
        width={721}
        height={735}
        priority
        className="selo-marca h-auto w-full"
      />
    </span>
  );
}

type Astro = {
  nome: string;
  frase: string;
  tela: string;
  /** Raio (% do mapa) e ângulo (graus, 0 = direita). */
  r: number;
  ang: number;
} & (
  | { tipo: 'retrato'; quem: string }
  | { tipo: 'pagina'; src: string }
  | { tipo: 'icone'; icone: typeof PiPlay }
);

const ASTROS: Astro[] = [
  {
    nome: 'Compositores',
    frase: 'Vidas, obras e épocas',
    tela: 'compositores',
    r: 25,
    ang: -125,
    tipo: 'retrato',
    quem: 'Bach',
  },
  {
    nome: 'Partituras',
    frase: 'Cada edição, grátis',
    tela: 'obra',
    r: 25,
    ang: -35,
    tipo: 'pagina',
    src: MINIATURAS[2],
  },
  {
    nome: 'Gravações',
    frase: 'Ouça antes de tocar',
    tela: 'obra',
    r: 25,
    ang: 55,
    tipo: 'icone',
    icone: PiPlay,
  },
  {
    nome: 'História',
    frase: 'Épocas e instrumentos',
    tela: 'historia',
    r: 25,
    ang: 145,
    tipo: 'icone',
    icone: PiHourglassMedium,
  },
  {
    nome: 'Estudo',
    frase: 'Sua estante e suas metas',
    tela: 'estudo',
    r: 43,
    ang: -80,
    tipo: 'icone',
    icone: PiBookmarkSimple,
  },
  {
    nome: 'Aulas',
    frase: 'Professor e alunos juntos',
    tela: 'ensino',
    r: 43,
    ang: 10,
    tipo: 'icone',
    icone: PiChalkboardTeacher,
  },
  {
    nome: 'Leituras',
    frase: 'Artigos e concertos',
    tela: 'blog',
    r: 43,
    ang: 100,
    tipo: 'icone',
    icone: PiArticle,
  },
  {
    nome: 'Coleções',
    frase: 'Listas de quem toca',
    tela: 'colecao',
    r: 43,
    ang: 190,
    tipo: 'retrato',
    quem: 'Chopin',
  },
];

/** O mapa: a gravura das órbitas, o selo no meio e os astros (links). */
function AtlasCeleste({ esboco }: { esboco: EsbocoId }) {
  const marcas = Array.from({ length: 72 }, (_, i) => i * 5);
  const estrelas = [
    [62, 48],
    [530, 92],
    [548, 470],
    [88, 520],
    [300, 22],
    [24, 300],
    [576, 300],
    [300, 578],
    [140, 120],
    [470, 160],
    [450, 520],
    [150, 470],
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[21rem] sm:max-w-[27rem]">
      <svg
        viewBox="0 0 600 600"
        aria-hidden="true"
        className="atlas-orbitas absolute inset-0 h-full w-full text-[var(--ouro)]"
      >
        {/* Órbitas e meridianos, gravados. */}
        {[
          { r: 150, o: 0.55, w: 1.2 },
          { r: 258, o: 0.5, w: 1.2 },
          { r: 96, o: 0.25, w: 1 },
          { r: 206, o: 0.22, w: 1 },
        ].map((c, i) => (
          <circle
            key={c.r}
            pathLength={1}
            cx={300}
            cy={300}
            r={c.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={c.w}
            opacity={c.o}
            style={{ ['--i' as string]: i }}
          />
        ))}
        <ellipse
          pathLength={1}
          cx={300}
          cy={300}
          rx={286}
          ry={110}
          transform="rotate(-24 300 300)"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.28}
          strokeDasharray="2 6"
          style={{ ['--i' as string]: 4 }}
        />
        <path
          pathLength={1}
          d="M300 14 V586 M14 300 H586"
          stroke="currentColor"
          strokeWidth={0.8}
          opacity={0.16}
          style={{ ['--i' as string]: 5 }}
        />
        {estrelas.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 ? 1.3 : 2}
            fill="currentColor"
            opacity={0.5}
          />
        ))}
        {/* O anel graduado do astrolábio: gira devagar. */}
        <g className="atlas-anel" opacity={0.45}>
          {marcas.map((g) => (
            <line
              key={g}
              x1={300}
              y1={g % 30 ? 22 : 14}
              x2={300}
              y2={30}
              stroke="currentColor"
              strokeWidth={g % 30 ? 0.8 : 1.4}
              transform={`rotate(${g} 300 300)`}
            />
          ))}
        </g>
      </svg>

      <Selo
        revela
        className="absolute left-1/2 top-1/2 w-[27%] -translate-x-1/2 -translate-y-1/2"
      />

      <ul aria-label="O que tem no Opus Atlas">
        {ASTROS.map((a, i) => {
          const rad = (a.ang * Math.PI) / 180;
          const x = 50 + a.r * Math.cos(rad);
          const y = 50 + a.r * Math.sin(rad);
          return (
            <li
              key={a.nome}
              className="surge absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                ['--atraso' as string]: `${900 + i * 120}ms`,
              }}
            >
              <Link
                href={
                  a.tela === 'blog'
                    ? destino(esboco, 'blog')
                    : rota(esboco, a.tela as 'inicio')
                }
                className="group flex flex-col items-center gap-1.5 text-center"
              >
                <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[var(--fundo)] text-ouro-texto shadow-[0_0_0_1px_var(--linha-forte),var(--sombra-1)] transition-shadow duration-[var(--t-resposta)] group-hover:shadow-[0_0_0_2px_var(--ouro),var(--sombra-2)] xl:h-12 xl:w-12">
                  {a.tipo === 'retrato' && (
                    <Retrato
                      nome={a.quem}
                      src={retratoDe(a.quem)}
                      sizes="56px"
                      className="h-full w-full"
                    />
                  )}
                  {a.tipo === 'pagina' && (
                    <span className="relative h-full w-full bg-sobre-foto">
                      <Image
                        src={a.src}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover object-top"
                      />
                    </span>
                  )}
                  {a.tipo === 'icone' && <Icon de={a.icone} tamanho="m" />}
                </span>
                <span className="flex flex-col rounded-[6px] bg-fundo px-1.5 py-0.5">
                  <span className="whitespace-nowrap font-display text-[0.9375rem] leading-tight group-hover:text-ouro-texto">
                    {a.nome}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** O texto comum: título, apoio, busca, ações e a garantia. */
function TextoDoHeroi({
  esboco,
  titulo,
  texto,
  centro = false,
}: {
  esboco: EsbocoId;
  titulo: string;
  texto: string;
  centro?: boolean;
}) {
  return (
    <div
      className={cx(
        'flex flex-col gap-6',
        centro && 'items-center text-center'
      )}
    >
      <h1
        className={cx(
          'entra text-balance font-display text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[0.98] tracking-[-0.02em]',
          centro ? 'max-w-[22ch]' : 'max-w-[14ch]'
        )}
      >
        {titulo}
      </h1>
      <p
        className="entra max-w-[52ch] t-corpo text-texto-suave"
        style={{ ['--i' as string]: 1 }}
      >
        {texto}
      </p>
      <div
        className={cx(
          'entra flex w-full flex-col gap-4',
          centro ? 'max-w-2xl items-center' : 'max-w-xl'
        )}
        style={{ ['--i' as string]: 2 }}
      >
        <BuscaDoHeroi esboco={esboco} />
        <AcoesDoHeroi
          esboco={esboco}
          centro={centro}
          principal="Começar grátis"
          segunda={{
            rotulo: 'Explorar os compositores',
            href: rota(esboco, 'compositores'),
          }}
        />
      </div>
      <p className="entra t-legenda" style={{ ['--i' as string]: 3 }}>
        Ler, ouvir e baixar é grátis. A conta guarda o que você estuda.
      </p>
    </div>
  );
}

/** A — o atlas celeste, compacto, ao lado do texto. */
function HeroiAtlas({ esboco }: { esboco: EsbocoId }) {
  return (
    <section className="section-wrap grid grid-cols-1 items-center gap-10 overflow-x-clip py-10 md:py-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
      <TextoDoHeroi
        esboco={esboco}
        titulo="O atlas da música erudita."
        texto="Conheça compositores e obras, baixe partituras de cada edição, ouça gravações, entenda cada época e organize o que você estuda. Quem dá aula acompanha os alunos aqui também. Tudo em um lugar só, em português."
      />
      <AtlasCeleste esboco={esboco} />
    </section>
  );
}

// ---- B — a faixa: o ecossistema passando devagar ---------------------------

function PecaDaFaixa({ i }: { i: number }) {
  const base = 'shrink-0 overflow-hidden rounded-card shadow-[var(--sombra-1)]';
  switch (i % 10) {
    case 0:
      return (
        <figure className={cx(base, 'relative h-36 w-28')}>
          <Retrato
            nome="Bach"
            src={retratoDe('Bach')}
            sizes="128px"
            className="h-full w-full"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-veu-foto to-transparent p-3 pt-8 font-display text-[1.0625rem] text-sobre-foto">
            Bach
          </figcaption>
        </figure>
      );
    case 1:
      return (
        <span className={cx(base, 'relative h-36 w-28 bg-sobre-foto')}>
          <Image
            src={MINIATURAS[2]}
            alt=""
            fill
            sizes="128px"
            className="object-cover object-top"
          />
        </span>
      );
    case 2:
      return (
        <span
          className={cx(
            base,
            'sup-alta flex h-36 w-60 flex-col justify-between !rounded-card p-4'
          )}
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full fill-ouro text-sobre-ouro">
              <Icon de={PiPlay} tamanho="p" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-display text-[1.0625rem]">
                Noturno nº 2
              </span>
              <span className="t-legenda">Gravação · domínio público</span>
            </span>
          </span>
          <span className="flex h-12 items-end gap-[3px]" aria-hidden="true">
            {[
              5, 9, 6, 11, 8, 12, 7, 10, 4, 9, 11, 6, 8, 12, 5, 9, 7, 10, 6, 8,
              11, 5,
            ].map((h, k) => (
              <span
                key={k}
                className={cx(
                  'w-1.5 rounded-full',
                  k < 9 ? 'fill-ouro' : 'bg-[var(--linha-forte)]'
                )}
                style={{ height: `${h * 4}px` }}
              />
            ))}
          </span>
        </span>
      );
    case 3:
      return (
        <figure className={cx(base, 'relative h-36 w-28')}>
          <Retrato
            nome="Chopin"
            src={retratoDe('Chopin')}
            sizes="128px"
            className="h-full w-full"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-veu-foto to-transparent p-3 pt-8 font-display text-[1.0625rem] text-sobre-foto">
            Chopin
          </figcaption>
        </figure>
      );
    case 4:
      return (
        <span
          className={cx(
            base,
            'sup-alta flex h-36 w-56 flex-col justify-between !rounded-card p-4'
          )}
        >
          <span className="flex items-center gap-2 t-legenda">
            <Icon
              de={PiBookmarkSimple}
              tamanho="pp"
              className="text-ouro-texto"
            />{' '}
            Sua estante
          </span>
          <span className="font-display text-[1.25rem] leading-snug">
            Noturno Op. 9 nº 2
          </span>
          <span className="flex flex-col gap-2">
            <span className="h-1.5 overflow-hidden rounded-full bg-[var(--linha)]">
              <span className="block h-full w-[45%] rounded-full fill-ouro" />
            </span>
            <span className="t-legenda">Estudando o trecho de hoje</span>
          </span>
        </span>
      );
    case 5:
      return (
        <span className={cx(base, 'relative h-36 w-28 bg-sobre-foto')}>
          <Image
            src={MINIATURAS[6]}
            alt=""
            fill
            sizes="128px"
            className="object-cover object-top"
          />
        </span>
      );
    case 6:
      return (
        <span
          className={cx(
            base,
            'sup-alta flex h-36 w-52 flex-col justify-between !rounded-card p-4'
          )}
        >
          <span className="flex items-center gap-2 t-legenda">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-sup-2 font-display text-[0.8125rem] text-ouro-texto">
              H
            </span>
            Helena · professora
          </span>
          <span className="font-display text-[1.125rem] leading-snug">
            “Respire antes do trinado. A esquerda segura o tempo.”
          </span>
          <span className="t-legenda">Anotação no compasso 16</span>
        </span>
      );
    case 7:
      return (
        <figure className={cx(base, 'relative h-36 w-28')}>
          <Retrato
            nome="Mozart"
            src={retratoDe('Mozart')}
            sizes="128px"
            className="h-full w-full"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-veu-foto to-transparent p-3 pt-8 font-display text-[1.0625rem] text-sobre-foto">
            Mozart
          </figcaption>
        </figure>
      );
    case 8:
      return (
        <span
          className={cx(
            base,
            'sup-alta flex h-36 w-56 flex-col justify-between !rounded-card p-4'
          )}
        >
          <span className="flex items-center gap-2 t-legenda">
            <Icon de={PiArticle} tamanho="pp" className="text-ouro-texto" />{' '}
            Blog
          </span>
          <span className="font-display text-[1.25rem] leading-snug">
            Chopin e os noturnos: o piano que canta
          </span>
          <span className="t-legenda">Leitura de domingo</span>
        </span>
      );
    default:
      return (
        <span
          className={cx(
            base,
            'sup-alta flex h-36 w-52 flex-col justify-between !rounded-card p-4'
          )}
        >
          <span className="t-legenda">Próximo concerto</span>
          <span className="font-display text-[1.25rem] leading-snug">
            {CONCERTOS[0].titulo}
          </span>
          <span className="t-legenda">
            {CONCERTOS[0].local}, {CONCERTOS[0].cidade}
          </span>
        </span>
      );
  }
}

/** B — o texto no centro; embaixo, uma faixa que passa devagar com o que vive aqui. */
function HeroiFaixa({ esboco }: { esboco: EsbocoId }) {
  const pecas = Array.from({ length: 10 }, (_, i) => i);
  return (
    <section className="flex flex-col gap-8 overflow-x-clip py-8 md:py-10">
      <div className="section-wrap">
        <TextoDoHeroi
          esboco={esboco}
          centro
          titulo="Toda a música erudita, num lugar só."
          texto="Leia sobre quem escreveu, ouça a obra, baixe a partitura e estude com método. Quem dá aula acompanha os alunos no mesmo lugar. Do primeiro contato com a música de concerto até o palco."
        />
      </div>
      <div aria-hidden="true" className="faixa-mascara relative">
        <div className="faixa-passa flex w-max items-center gap-4 px-2">
          {[...pecas, ...pecas].map((i, k) => (
            <PecaDaFaixa key={k} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- C — o texto do A, centrado, e o globo celeste como horizonte -----------

/**
 * C (06/10): o herói do A no centro, com a variação do atlas sem os pontos
 * por trás do banner — o globo gravado, inteiro e centrado (paralelos,
 * meridianos, a eclíptica, o anel graduado e as estrelas), suave para o
 * texto ler por cima. As linhas se traçam ao chegar; o anel gira devagar.
 */
function GloboCeleste() {
  const c = 300;
  const r = 220;
  const paralelos = [-60, -36, -12, 12, 36, 60];
  const meridianos = [20, 45, 70];
  const estrelas = [
    [40, 70],
    [110, 30],
    [520, 50],
    [570, 140],
    [560, 470],
    [500, 560],
    [70, 520],
    [20, 330],
    [585, 320],
    [300, 12],
    [300, 590],
    [150, 140],
    [455, 120],
    [150, 470],
  ];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(46rem,150vw)] -translate-x-1/2 -translate-y-1/2 opacity-60 [mask-image:radial-gradient(circle_at_50%_50%,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0.45)_38%,rgb(0_0_0)_62%)]"
    >
      <svg
        viewBox="0 0 600 600"
        className="atlas-orbitas absolute inset-0 h-full w-full text-[var(--ouro)]"
      >
        <circle
          pathLength={1}
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          opacity={0.65}
          style={{ ['--i' as string]: 0 }}
        />
        {paralelos.map((g, i) => {
          const rad = (g * Math.PI) / 180;
          const rx = r * Math.cos(rad);
          return (
            <ellipse
              key={`p${g}`}
              pathLength={1}
              cx={c}
              cy={c - r * Math.sin(rad)}
              rx={rx}
              ry={rx * 0.2}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              opacity={0.3}
              style={{ ['--i' as string]: i + 1 }}
            />
          );
        })}
        <ellipse
          pathLength={1}
          cx={c}
          cy={c}
          rx={r}
          ry={r * 0.2}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          opacity={0.5}
          style={{ ['--i' as string]: 2 }}
        />
        {meridianos.map((g, i) => (
          <ellipse
            key={`m${g}`}
            pathLength={1}
            cx={c}
            cy={c}
            rx={r * Math.cos((g * Math.PI) / 180)}
            ry={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.28}
            style={{ ['--i' as string]: i + 3 }}
          />
        ))}
        <path
          pathLength={1}
          d={`M${c} ${c - r} V${c + r}`}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.3}
          style={{ ['--i' as string]: 6 }}
        />
        {/* A eclíptica, inclinada, passando além do globo. */}
        <ellipse
          pathLength={1}
          cx={c}
          cy={c}
          rx={285}
          ry={78}
          transform={`rotate(-23 ${c} ${c})`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2 7"
          opacity={0.42}
          style={{ ['--i' as string]: 7 }}
        />
        {estrelas.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 ? 1.4 : 2.2}
            fill="currentColor"
            opacity={0.55}
          />
        ))}
        {/* O anel graduado em volta: gira devagar. */}
        <g className="atlas-anel" opacity={0.45}>
          {Array.from({ length: 90 }, (_, k) => k * 4).map((g) => (
            <line
              key={g}
              x1={c}
              y1={c - r - (g % 40 ? 22 : 32)}
              x2={c}
              y2={c - r - 12}
              stroke="currentColor"
              strokeWidth={g % 40 ? 0.8 : 1.4}
              transform={`rotate(${g} ${c} ${c})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// Constelações musicais (06/10): nas laterais do herói C, no traço do globo.
// À esquerda a Lira (a constelação real do instrumento) e a Clave; à direita
// a Fermata e as Colcheias — as notas viram estrelas. Só em telas largas.

type Ponto = [number, number, boolean?];

interface Figura {
  nome: string;
  rotulo: [number, number];
  estrelas: Ponto[];
  /** Pares de índices ligados; `seq` liga as estrelas em sequência. */
  linhas?: [number, number][];
  seq?: boolean;
}

const LADO_ESQUERDO: Figura[] = [
  {
    nome: 'Lira',
    rotulo: [80, 232],
    estrelas: [
      [70, 50, true],
      [40, 30],
      [94, 92],
      [122, 140],
      [86, 192],
      [56, 144],
    ],
    linhas: [
      [0, 1],
      [0, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 2],
    ],
  },
  {
    nome: 'Clave',
    rotulo: [176, 470],
    seq: true,
    estrelas: [
      [98, 458],
      [84, 448],
      [90, 434],
      [104, 436],
      [108, 400],
      [112, 350],
      [118, 304],
      [128, 270],
      [142, 258, true],
      [150, 278],
      [138, 304],
      [114, 330],
      [90, 356],
      [80, 388],
      [90, 414],
      [116, 424],
      [140, 410],
      [142, 384],
      [122, 370],
      [104, 382],
      [110, 398, true],
    ],
  },
];

const LADO_DIREITO: Figura[] = [
  {
    nome: 'Fermata',
    rotulo: [120, 150],
    linhas: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
    estrelas: [
      // Arredondado: senão o servidor e o navegador escrevem decimais diferentes.
      ...[180, 210, 240, 270, 300, 330, 360].map(
        (g): Ponto => [
          Math.round(120 + 62 * Math.cos((g * Math.PI) / 180)),
          Math.round(112 + 62 * Math.sin((g * Math.PI) / 180)),
        ]
      ),
      [120, 96, true],
    ],
  },
  {
    nome: 'Colcheias',
    rotulo: [124, 450],
    estrelas: [
      [80, 412, true],
      [94, 410],
      [94, 356],
      [94, 300],
      [150, 392, true],
      [164, 390],
      [164, 336],
      [164, 280],
    ],
    linhas: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [6, 7],
      [3, 7],
    ],
  },
];

function Constelacoes({
  figuras,
  lado,
}: {
  figuras: Figura[];
  lado: 'esq' | 'dir';
}) {
  let n = 0;
  return (
    <svg
      viewBox="0 0 240 490"
      aria-hidden="true"
      className={cx(
        'pointer-events-none absolute top-1/2 -z-10 hidden w-[12.5rem] -translate-y-1/2 text-[var(--ouro)] xl:block 2xl:w-[14rem]',
        lado === 'esq' ? 'left-[2.5%]' : 'right-[2.5%]'
      )}
    >
      {figuras.map((f) => {
        const pares: [number, number][] =
          f.linhas ?? f.estrelas.slice(1).map((_, i) => [i, i + 1]);
        return (
          <g key={f.nome}>
            {pares.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                pathLength={1}
                className="constelacao-linha"
                x1={f.estrelas[a][0]}
                y1={f.estrelas[a][1]}
                x2={f.estrelas[b][0]}
                y2={f.estrelas[b][1]}
                stroke="currentColor"
                strokeWidth={0.8}
                opacity={0.4}
                style={{ ['--i' as string]: n++ }}
              />
            ))}
            {f.estrelas.map(([x, y, brilho], i) => (
              <g
                key={i}
                className={brilho ? 'cintila' : undefined}
                style={{ ['--atraso' as string]: `${(i * 700) % 3000}ms` }}
              >
                {brilho && (
                  <circle
                    cx={x}
                    cy={y}
                    r={8}
                    fill="currentColor"
                    opacity={0.14}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={brilho ? 3.4 : 1.9}
                  fill="currentColor"
                  opacity={brilho ? 0.95 : 0.7}
                />
              </g>
            ))}
            {/* O nome, como nos atlas antigos: versaletes espaçados. */}
            <text
              x={f.rotulo[0]}
              y={f.rotulo[1]}
              textAnchor="middle"
              fontFamily="var(--fonte-display)"
              fontStyle="italic"
              fontSize={15}
              letterSpacing={4}
              fill="currentColor"
              opacity={0.75}
            >
              {f.nome.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HeroiGlobo({ esboco }: { esboco: EsbocoId }) {
  return (
    <section className="relative isolate overflow-hidden py-16 md:py-24">
      <GloboCeleste />
      <Constelacoes figuras={LADO_ESQUERDO} lado="esq" />
      <Constelacoes figuras={LADO_DIREITO} lado="dir" />
      <div className="section-wrap">
        <TextoDoHeroi
          esboco={esboco}
          centro
          titulo="O atlas da música erudita."
          texto="Conheça compositores e obras, baixe partituras de cada edição, ouça gravações, entenda cada época e organize o que você estuda. Quem dá aula acompanha os alunos aqui também. Tudo em um lugar só."
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

function Titulo({
  children,
  acao,
  sub,
  id,
}: {
  children: ReactNode;
  acao?: ReactNode;
  sub?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="t-titulo max-sm:!text-[1.75rem]">
          {children}
        </h2>
        {sub && <p className="t-corpo text-texto-suave">{sub}</p>}
      </div>
      {acao}
    </div>
  );
}

function VerTudo({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cx(
        'inline-flex min-h-6 items-center gap-1.5 t-rotulo text-ouro-texto',
        linkTexto
      )}
    >
      {children} <Icon de={PiArrowRight} tamanho="pp" />
    </Link>
  );
}

function Populares({ esboco }: { esboco: EsbocoId }) {
  return (
    <section className="py-12">
      <CarrosselComPontos
        sempre
        idioma="pt"
        rotulo="Compositores populares"
        largura={LARGURA_CARTAO_COMPOSITOR}
        cabecalho={
          <div>
            <Titulo
              acao={
                <VerTudo href={rota(esboco, 'compositores')}>Ver todos</VerTudo>
              }
            >
              Compositores populares
            </Titulo>
          </div>
        }
      >
        {FAMOSOS.map((c) => (
          <CartaoCompositor
            key={c.id}
            id={c.id}
            nome={c.nome}
            nomeCompleto={c.nomeCompleto}
            retrato={c.retrato}
            nasc={c.nasc}
            morte={c.morte}
            legenda={nomeDaEpoca(c.epoca)}
            verificado={c.verificado}
            href={rota(esboco, 'compositor')}
          />
        ))}
      </CarrosselComPontos>
    </section>
  );
}

/**
 * Compositor em destaque (06/10, 2ª rodada): o layout do Chopin com o que a
 * home de hoje tem — título e subtítulo, a bio curta, três obras e as
 * curiosidades — e o caminho para a página dele.
 */
function Destaque({ esboco }: { esboco: EsbocoId }) {
  const c = CHOPIN;
  return (
    <Revelar as="section" className="section-wrap flex flex-col gap-10 py-12">
      <Titulo sub="Descobrindo a genialidade de hoje">
        Compositor em destaque
      </Titulo>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="relative md:sticky md:top-24 md:self-start">
          <Link
            href={rota(esboco, 'compositor')}
            data-vira={`compositor-${c.id}`}
            className="block"
          >
            <Retrato
              nome={c.nomeCompleto}
              src={c.retrato}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="aspect-[4/5] w-full rounded-card shadow-[var(--sombra-2)]"
            />
          </Link>
          <Coracao rotulo={c.nome} sobre className="absolute right-3 top-3" />
        </div>
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">
              Frédéric Chopin
              {c.verificado && (
                <SeloVerificada className="ml-2 inline-block h-[0.4em] w-[0.4em] align-[0.35em] text-verificado" />
              )}
            </h3>
            <p className="t-rotulo text-texto-suave">
              {anos(c.nasc, c.morte)} · {nomeDaEpoca(c.epoca)} · {c.pais}
            </p>
            <p className="t-corpo max-w-[62ch] text-texto-suave">{c.bio[0]}</p>
            <div className="flex flex-wrap gap-2">
              {[
                ['Wikipédia', EXTRA_CHOPIN.wikipedia],
                ['IMSLP', EXTRA_CHOPIN.imslp],
              ].map(([n, href]) => (
                <a
                  key={n}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sup-2 px-4 text-[0.9375rem] text-texto-suave hover:text-ouro-texto"
                >
                  {n} <Icon de={PiArrowSquareOut} tamanho="pp" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="t-subtitulo">Obras</h4>
            <ul className="flex flex-col divide-y divide-[var(--linha)] border-y border-[var(--linha)]">
              {COMECAR_CHOPIN.obras.map((o) => (
                <li key={o.titulo} className="flex items-center gap-2">
                  <Link
                    href={rota(esboco, 'obra')}
                    className="group flex min-w-0 flex-1 flex-col gap-0.5 py-3.5"
                  >
                    <span className="font-display text-[1.25rem] leading-snug group-hover:text-ouro-texto">
                      {o.titulo}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {o.nivel} · {o.porque}
                    </span>
                  </Link>
                  <Coracao rotulo={o.titulo} />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="t-subtitulo">Curiosidades</h4>
            <ul className="flex flex-col gap-3">
              {EXTRA_CHOPIN.curiosidades.map((k) => (
                <li
                  key={k.texto}
                  className="flex items-start gap-3 rounded-card bg-sup-2 p-4"
                >
                  <Icon
                    de={PiLightbulb}
                    tamanho="m"
                    className="mt-0.5 shrink-0 text-ouro-texto"
                  />
                  <span className="t-rotulo">{k.texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={rota(esboco, 'compositor')}
              className={classesDeBotao('primario', 'm')}
            >
              Explorar todas as obras
            </Link>
            <Link
              href={rota(esboco, 'compositor')}
              className={classesDeBotao('fantasma', 'm')}
            >
              Ler a biografia
            </Link>
          </div>
        </div>
      </div>
    </Revelar>
  );
}

/**
 * Curiosidades Musicais: igual à home de hoje (`MusicalFacts`), sem mudar
 * nada — título e subtítulo, o filtro por período, embaralhar e quatro
 * curiosidades, duas por linha. Só o visual segue o design system.
 */
const PRIMEIRAS = [0, 47, 120, 205].map((i) => musicalFacts[i]);

function CuriosidadesDeHoje() {
  const [periodo, setPeriodo] = useState('all');
  const [lista, setLista] = useState(PRIMEIRAS);
  const sortear = (cat: string) => {
    const base =
      cat === 'all'
        ? musicalFacts
        : musicalFacts.filter((f) => f.category === cat);
    setLista([...base].sort(() => 0.5 - Math.random()).slice(0, 4));
  };
  return (
    <Revelar as="section" className="section-wrap flex flex-col gap-8 py-12">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-sup-2 text-ouro-texto">
          <Icon de={PiBookOpen} tamanho="m" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">
            Curiosidades Musicais
          </h2>
          <p className="t-corpo text-texto-suave">
            Fatos fascinantes e histórias interessantes do mundo da música
            clássica
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <label className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 t-rotulo text-texto-suave">
            <Icon de={PiFunnel} tamanho="p" /> Filtrar por período:
          </span>
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value);
              sortear(e.target.value);
            }}
            className="input-classical min-h-10 min-w-[150px] rounded-controle px-3 text-[0.9375rem]"
          >
            <option value="all">Todos os Períodos</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <Button icone={PiArrowsClockwise} onClick={() => sortear(periodo)}>
          Embaralhar
        </Button>
      </div>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {lista.map((f) => (
          <li
            key={f.id}
            className="flex flex-col gap-3 rounded-card bg-sup-2 p-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="t-subtitulo">{f.title.pt}</h3>
              <span className="t-rotulo shrink-0 text-texto-fraco">
                {f.category}
              </span>
            </div>
            <p className="t-corpo text-texto-suave">{f.content.pt}</p>
          </li>
        ))}
      </ul>
    </Revelar>
  );
}

function Periodos({ esboco }: { esboco: EsbocoId }) {
  return (
    <section className="py-12">
      <CarrosselComPontos
        sempre
        idioma="pt"
        rotulo="Explore por período"
        largura="minmax(14rem,16.5rem)"
        cabecalho={
          <div>
            <Titulo
              acao={
                <VerTudo href={rota(esboco, 'historia')}>
                  A história da música
                </VerTudo>
              }
            >
              Explore por período
            </Titulo>
          </div>
        }
      >
        {PERIODOS.map((p) => (
          <div key={p.id} role="listitem" className="snap-start">
            <Link
              href={
                p.id === 'todos'
                  ? rota(esboco, 'compositores')
                  : rota(esboco, 'historia')
              }
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-card p-5"
            >
              <Image
                src={p.imagem}
                alt=""
                fill
                sizes="264px"
                className="object-cover transition-transform duration-700 ease-[var(--saida)] group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-veu-foto via-veu-foto/45 to-transparent" />
              <span className="relative flex flex-col gap-1.5 text-sobre-foto">
                <span className="t-dado text-[0.8125rem] opacity-90">
                  {p.anos}
                </span>
                <span className="font-display text-[1.875rem] leading-none">
                  {p.nome}
                </span>
                <span className="text-[0.875rem] leading-snug opacity-90">
                  {p.frase}
                </span>
              </span>
            </Link>
          </div>
        ))}
      </CarrosselComPontos>
    </section>
  );
}

function ColecoesEConcertos({ esboco }: { esboco: EsbocoId }) {
  const naHome = COLECOES_FINAL.filter((c) => c.naHome);
  return (
    <Revelar
      as="section"
      className="section-wrap grid grid-cols-1 gap-14 py-12 lg:grid-cols-2"
    >
      <div className="flex flex-col gap-6">
        <Titulo acao={<VerTudo href={rota(esboco, 'colecao')}>Todas</VerTudo>}>
          Coleções
        </Titulo>
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {naHome.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <Link
                href={rota(esboco, 'colecao')}
                className="group flex min-w-0 flex-1 items-center gap-4 py-4"
              >
                <Rostos
                  nomes={c.rostos.filter((n) => retratoDe(n))}
                  tamanho="h-10 w-10"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-[1.3125rem] leading-snug group-hover:text-ouro-texto">
                    {c.titulo}
                  </span>
                  <span className="t-rotulo truncate text-texto-suave">
                    {ROTULO_COLECAO[c.tipo].plural} · {c.autor.nome} ·{' '}
                    {c.favoritos} favoritaram
                  </span>
                </span>
              </Link>
              <Coracao rotulo={c.titulo} />
            </li>
          ))}
        </ul>
        <Link
          href={rota(esboco, 'colecoes-minhas')}
          className={cx(
            'inline-flex items-center gap-2 self-start t-rotulo text-texto-suave',
            linkTexto
          )}
        >
          <Icon de={PiPlus} tamanho="p" /> Monte a sua coleção
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <Titulo acao={<VerTudo href={destino(esboco, 'blog')}>Agenda</VerTudo>}>
          Próximos concertos
        </Titulo>
        <ul className="flex flex-col gap-3">
          {CONCERTOS.map((c) => (
            <li key={c.id}>
              <Link
                href={destino(esboco, 'blog')}
                className="group flex items-center gap-5 rounded-card bg-sup-2 p-4"
              >
                <span className="flex w-14 shrink-0 flex-col items-center">
                  <span className="font-display text-[2.25rem] leading-none text-ouro-texto">
                    {c.dia}
                  </span>
                  <span className="t-legenda">
                    {c.mes} · {c.semana}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium leading-snug group-hover:text-ouro-texto">
                    {c.titulo}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {c.local}, {c.cidade} · {c.hora}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Revelar>
  );
}

const PLANOS = [
  {
    nome: 'Free',
    preco: 'R$ 0',
    frase: 'Enciclopédia, partituras, estante, anotações e conquistas.',
  },
  { nome: 'Plus', preco: 'R$ 19,90', frase: 'Envios e vídeos sem limite.' },
  {
    nome: 'Mentor',
    preco: 'R$ 39,90',
    frase: 'O portal de aulas, até 7 alunos.',
  },
  {
    nome: 'Maestro',
    preco: 'R$ 79,90',
    frase: 'Alunos sem limite e selo de verificado.',
  },
];

function GatilhoPlanos({ esboco }: { esboco: EsbocoId }) {
  return (
    <Revelar as="section" className="section-wrap py-16">
      <div className="grid grid-cols-1 gap-10 rounded-card bg-sup-2 p-6 md:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div className="flex flex-col gap-4">
          <h2 className="t-titulo max-w-[16ch]">
            Grátis para sempre. Mais, quando você precisar.
          </h2>
          <p className="t-corpo text-texto-suave">
            Ler, ouvir e baixar não custa nada. Os planos pagos são para quem
            envia muito ou dá aula.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={destino(esboco, 'planos')}
              className={classesDeBotao('primario', 'm')}
            >
              Ver os planos
            </Link>
            <Link
              href={rota(esboco, 'ensino')}
              className={classesDeBotao('fantasma', 'm')}
            >
              Para professores
            </Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PLANOS.map((p, i) => (
            <li
              key={p.nome}
              className={cx(
                'flex flex-col gap-2 rounded-card p-4',
                i === 1 ? 'tint-ouro' : 'bg-[var(--fundo)]'
              )}
            >
              <span
                className={cx(
                  'font-display text-[1.5rem]',
                  i === 1 && 'text-ouro-na-tinta'
                )}
              >
                {p.nome}
              </span>
              <span className="t-dado text-[0.875rem]">
                {p.preco}
                <span className="text-texto-fraco">{i ? '/mês' : ''}</span>
              </span>
              <span className="t-rotulo text-texto-suave">{p.frase}</span>
            </li>
          ))}
        </ul>
      </div>
    </Revelar>
  );
}

// ---------------------------------------------------------------------------

export function HomeFinal({
  esboco,
  heroi,
}: {
  esboco: EsbocoId;
  heroi: Heroi;
}) {
  const Topo = {
    atlas: HeroiAtlas,
    faixa: HeroiFaixa,
    globo: HeroiGlobo,
  }[heroi];
  return (
    <>
      <Topo esboco={esboco} />
      <Populares esboco={esboco} />
      <Destaque esboco={esboco} />
      <Periodos esboco={esboco} />
      <ColecoesEConcertos esboco={esboco} />
      <CuriosidadesDeHoje />
      <Revelar as="section" className="section-wrap flex flex-col gap-6 py-12">
        <Titulo>Descobrir</Titulo>
        <DescobertasEAdicoes esboco={esboco} />
      </Revelar>
      <GatilhoPlanos esboco={esboco} />
    </>
  );
}
