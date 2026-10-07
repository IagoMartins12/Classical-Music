'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  PiArrowRight,
  PiBell,
  PiBookOpen,
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiChalkboardTeacher,
  PiDownloadSimple,
  PiFileText,
  PiMagnifyingGlass,
  PiMusicNote,
  PiMusicNotes,
  PiNewspaper,
  PiPencilSimple,
  PiStarFill,
} from 'react-icons/pi';
import LocalizedLink from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { cx } from '@/app/components/ui/cx';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { SOBRE } from '@/app/conteudo/sobre';

/**
 * "O que você encontra aqui": as quatro partes do site num quadro com abas.
 * Cada aba tem o texto de verdade (o que o robô lê — os painéis inativos
 * ficam no HTML, só escondidos) e uma **ilustração que se monta** ao abrir: a
 * busca que digita, a lista de estudo que enche, a semana de aulas, a agenda.
 *
 * **Troca sozinha, sempre**, a cada 8s, com a barra da aba mostrando o
 * tempo. Clicar numa aba pula para ela e a contagem recomeça dali. A barra
 * só espera fora da tela e com o ponteiro ou o foco dentro do quadro (quem
 * está lendo não vê a aba trocar debaixo do cursor — WCAG 2.2.2). Com
 * movimento reduzido, não troca sozinho.
 *
 * As ilustrações são desenho (`aria-hidden`): nomes de obra e de sala de
 * concerto nelas são exemplos, não dados.
 */
export type Retrato = {
  id: string;
  nome: string;
  nomeCompleto: string;
  anos: string;
  foto: string;
  epoca: string;
  verificado: boolean;
};

const ICONES = {
  enciclopedia: PiBookOpen,
  estudo: PiMusicNotes,
  ensino: PiChalkboardTeacher,
  blog: PiNewspaper,
} as const;

const TEMPO = 8000;

export function QuadroDoSite({
  idioma,
  retratos,
  empilhado = false,
}: {
  idioma: Idioma;
  retratos: Retrato[];
  /** Abas em cima em qualquer largura (ver `SET_ALWAYS_LAYOUT_MOBILE`). */
  empilhado?: boolean;
}) {
  const c = SOBRE[idioma];
  const itens = c.camadas.itens;
  const [ativa, setAtiva] = useState(0);
  const [auto, setAuto] = useState(false); // ligada ao montar
  const [emEspera, setEmEspera] = useState(false);
  const [naTela, setNaTela] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);

  // Liga a troca automática só depois de montar, e só sem movimento reduzido.
  useEffect(() => {
    // `/about-us#estudo` abre direto naquela aba e segue trocando dali.
    const pedida = itens.findIndex(
      (it) => `#${it.id}` === window.location.hash
    );
    if (pedida >= 0) setAtiva(pedida);
    setAuto(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = raiz.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setNaTela(e.isIntersecting), {
      threshold: 0.35,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const correndo = auto && naTela && !emEspera;

  function escolher(i: number, foco = false) {
    setAtiva(i);
    if (foco) abas.current[i]?.focus();
  }

  function teclado(e: KeyboardEvent) {
    const n = itens.length;
    const mapa: Record<string, number> = {
      ArrowRight: (ativa + 1) % n,
      ArrowDown: (ativa + 1) % n,
      ArrowLeft: (ativa - 1 + n) % n,
      ArrowUp: (ativa - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    if (e.key in mapa) {
      e.preventDefault();
      escolher(mapa[e.key], true);
    }
  }

  return (
    <div
      ref={raiz}
      onPointerEnter={() => setEmEspera(true)}
      onPointerLeave={() => setEmEspera(false)}
      onFocusCapture={() => setEmEspera(true)}
      onBlurCapture={() => setEmEspera(false)}
      className={cx(
        'mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 md:mt-12',
        !empilhado && 'lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14'
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div
          role="tablist"
          aria-label={c.quadro.rotulo}
          aria-orientation={empilhado ? 'horizontal' : 'vertical'}
          onKeyDown={teclado}
          className={cx(
            '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            empilhado
              ? 'md:mx-0 md:px-0'
              : 'lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0'
          )}
        >
          {itens.map((item, i) => {
            const Icone = ICONES[item.id as keyof typeof ICONES];
            const sel = ativa === i;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  abas.current[i] = el;
                }}
                role="tab"
                id={`aba-${item.id}`}
                aria-selected={sel}
                aria-controls={`painel-${item.id}`}
                tabIndex={sel ? 0 : -1}
                onClick={() => escolher(i)}
                className={cx(
                  'group/aba relative flex shrink-0 items-center gap-3 overflow-hidden rounded-card px-4 py-3 text-left transition-colors duration-[var(--t-entrada)]',
                  !empilhado && 'lg:px-5 lg:py-4',
                  sel ? 'bg-sup-2' : 'hover:bg-[var(--interactive-hover)]'
                )}
              >
                <Icone
                  aria-hidden="true"
                  className={cx(
                    'h-5 w-5 shrink-0 transition-colors',
                    !empilhado && 'lg:h-6 lg:w-6',
                    sel ? 'text-ouro-texto' : 'text-texto-fraco'
                  )}
                />
                <span className="flex flex-col">
                  <span
                    className={cx(
                      'classical-title whitespace-nowrap text-lg leading-tight',
                      !empilhado && 'lg:text-[1.5rem]',
                      sel ? 'text-texto' : 'text-texto-suave'
                    )}
                  >
                    {item.nome}
                  </span>
                  <span
                    className={cx(
                      'hidden text-xs font-medium text-ouro-texto',
                      !empilhado && 'lg:block'
                    )}
                  >
                    {item.acesso}
                  </span>
                </span>
                {/* A barra do tempo até a próxima aba. */}
                {sel && auto && (
                  <span
                    aria-hidden="true"
                    key={`barra-${ativa}`}
                    onAnimationEnd={() =>
                      setAtiva((a) => (a + 1) % itens.length)
                    }
                    className="quadro-tempo absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ouro"
                    style={{
                      animationDuration: `${TEMPO}ms`,
                      animationPlayState: correndo ? 'running' : 'paused',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {itens.map((item, i) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`painel-${item.id}`}
          aria-labelledby={`aba-${item.id}`}
          hidden={ativa !== i}
          className="min-w-0"
        >
          {ativa === i && (
            <div
              key={`palco-${i}`}
              className="relative h-[20rem] overflow-hidden rounded-card bg-sup-2 sm:h-[21rem]"
            >
              <span className="sr-only">{c.quadro.ilustracao}</span>
              <div aria-hidden="true" className="absolute inset-0">
                {item.id === 'enciclopedia' && (
                  <Busca retratos={retratos} idioma={idioma} />
                )}
                {item.id === 'estudo' && <Estudo idioma={idioma} />}
                {item.id === 'ensino' && <Semana idioma={idioma} />}
                {item.id === 'blog' && <Agenda idioma={idioma} />}
              </div>
            </div>
          )}

          <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-10">
            <div>
              <p
                className={cx(
                  'text-xs font-semibold text-ouro-texto',
                  !empilhado && 'lg:hidden'
                )}
              >
                {item.acesso}
              </p>
              <h3
                className={cx(
                  'classical-title mt-1 text-2xl text-texto',
                  !empilhado && 'lg:mt-0'
                )}
              >
                {item.nome}
              </h3>
              <p className="mt-3 text-[1.0625rem] leading-[1.75] text-texto-suave">
                {item.texto}
              </p>
              {item.links.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 text-[0.9375rem]">
                  {item.links.map((l) => (
                    <li key={l.href}>
                      <LocalizedLink
                        href={l.href}
                        className="inline-flex min-h-6 items-center gap-1.5 font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[5px] transition-colors hover:decoration-ouro"
                      >
                        {l.rotulo}
                        <PiArrowRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {item.pontos.length > 0 && (
              <ul className="flex flex-col gap-2.5 text-[0.9375rem] leading-snug text-texto">
                {item.pontos.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[0.55em] h-1 w-3 shrink-0 rounded-full bg-ouro"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ——— As ilustrações: as telas de verdade, em miniatura. Cada peça entra
   por CSS (`.cena-*`), em cascata por `--i`. ——— */

/** A listagem de compositores: a busca com "Buscar" e os cards, como em `/composers`. */
function Busca({ retratos, idioma }: { retratos: Retrato[]; idioma: Idioma }) {
  const pt = idioma === 'pt';
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="cena-surge flex gap-2">
        <span className="flex min-w-0 flex-1 items-center gap-2.5 rounded-controle border border-linha-forte fundo-sup-1 px-3.5 py-2.5 text-sm text-texto-fraco">
          <PiMagnifyingGlass className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {pt ? 'Digite o nome do compositor…' : 'Type the composer’s name…'}
          </span>
        </span>
        <span className="flex items-center gap-1.5 rounded-controle fill-ouro px-3.5 text-sm font-semibold text-sobre-ouro">
          <PiMagnifyingGlass className="h-4 w-4" />
          {pt ? 'Buscar' : 'Search'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {retratos.slice(0, 3).map((r, i) => (
          <div
            key={r.id}
            className={cx(
              'cena-surge flex flex-col items-center rounded-card fundo-sup-1 px-3 pb-3 pt-4 text-center shadow-sm',
              i === 2 && 'hidden sm:flex'
            )}
            style={{ ['--i' as string]: i + 2 }}
          >
            <span className="relative h-14 w-14 overflow-hidden rounded-full bg-sup-2 ring-2 ring-[var(--linha-forte)]">
              <Image
                src={r.foto}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
            <span className="classical-title mt-2.5 text-base leading-tight text-texto">
              {r.nome}
            </span>
            <span className="mt-0.5 flex max-w-full items-center gap-1 text-[0.6875rem] text-texto-suave">
              <span className="truncate">{r.nomeCompleto}</span>
              {r.verificado && (
                <SeloVerificada
                  desenhar
                  className="h-3 w-3 shrink-0 text-verificado"
                />
              )}
            </span>
            <span className="mt-1.5 flex items-center gap-1 text-[0.6875rem] text-texto-fraco">
              <PiCalendarBlank className="h-3 w-3" />
              {r.anos}
            </span>
            <span className="mt-2 flex items-center gap-1 rounded-full bg-sup-2 px-2 py-0.5 text-[0.6875rem] font-medium text-ouro-texto">
              <PiMusicNote className="h-3 w-3" />
              {r.epoca}
            </span>
            <span className="mt-3 flex w-full items-center justify-center gap-1 border-t border-linha pt-2.5 text-[0.6875rem] text-texto-suave">
              {pt ? 'Explorar obras' : 'Explore works'}
              <PiCaretRight className="h-3 w-3" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Quero aprender": as abas e os cards, como em `/learning`. */
function Estudo({ idioma }: { idioma: Idioma }) {
  const pt = idioma === 'pt';
  const itens = [
    {
      obra: pt ? 'Noturno Op. 9 nº 2' : 'Nocturne Op. 9 No. 2',
      autor: 'Frédéric Chopin',
      prioridade: 5,
      nivel: pt ? 'Intermediário' : 'Intermediate',
      meta: pt ? 'dez. 2026' : 'Dec 2026',
      partitura: pt ? 'Partitura completa · 5 págs.' : 'Full score · 5 pp.',
    },
    {
      obra: pt
        ? 'Prelúdio em Dó maior, BWV 846'
        : 'Prelude in C major, BWV 846',
      autor: 'Johann Sebastian Bach',
      prioridade: 3,
      nivel: pt ? 'Iniciante' : 'Beginner',
      meta: pt ? 'mar. 2027' : 'Mar 2027',
      partitura: pt ? 'Partitura completa · 2 págs.' : 'Full score · 2 pp.',
    },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-4 sm:p-6">
      <div className="cena-surge flex gap-1 self-start rounded-full fundo-sup-1 p-1 text-xs font-medium">
        <span className="rounded-full fundo-sup-2 px-3 py-1.5 text-ouro-texto shadow-sm">
          {pt ? 'Quero aprender' : 'Want to learn'} · 2
        </span>
        <span className="px-3 py-1.5 text-texto-suave">
          {pt ? 'Já aprendi' : 'Already learned'} · 7
        </span>
      </div>
      {itens.map((it, i) => (
        <div
          key={it.obra}
          className="cena-surge rounded-card fundo-sup-1 p-4 shadow-sm"
          style={{ ['--i' as string]: i + 1 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="classical-title truncate text-base font-bold leading-tight text-texto">
                {it.obra}
              </p>
              <p className="truncate text-xs text-texto-suave">{it.autor}</p>
            </div>
            <span className="flex shrink-0 gap-1.5 text-texto-fraco">
              <PiDownloadSimple className="h-4 w-4" />
              <PiPencilSimple className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.6875rem] text-texto-fraco">
            <span className="flex items-center gap-1">
              {pt ? 'Prioridade:' : 'Priority:'}
              <span className="flex">
                {[0, 1, 2, 3, 4].map((e) => (
                  <PiStarFill
                    key={e}
                    className={cx(
                      'h-3 w-3',
                      e < it.prioridade ? 'text-ouro' : 'text-texto-fraco/30'
                    )}
                  />
                ))}
              </span>
            </span>
            <span className="rounded-full bg-sup-2 px-2 py-0.5 font-medium text-texto-suave">
              {it.nivel}
            </span>
            <span className="flex items-center gap-1">
              <PiCalendarBlank className="h-3 w-3" />
              {it.meta}
            </span>
          </div>
          <div className="mt-3 hidden items-center gap-2.5 rounded-controle bg-sup-2 px-3 py-2 sm:flex">
            <PiFileText className="h-4 w-4 shrink-0 text-ouro-texto" />
            <span className="min-w-0 flex-1 truncate text-xs text-texto-suave">
              {it.partitura}
            </span>
            <span className="flex items-center gap-1 rounded-controle border border-linha-forte px-2 py-1 text-[0.6875rem] font-medium text-texto">
              <PiDownloadSimple className="h-3 w-3" />
              {pt ? 'Baixar' : 'Download'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Semana({ idioma }: { idioma: Idioma }) {
  const pt = idioma === 'pt';
  const dias = pt
    ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  // [dia, início (0–1), altura (0–1)]
  const aulas: [number, number, number][] = [
    [0, 0.08, 0.2],
    [1, 0.42, 0.22],
    [2, 0.12, 0.18],
    [2, 0.6, 0.2],
    [3, 0.3, 0.24],
    [4, 0.52, 0.2],
  ];
  return (
    <div className="relative flex h-full flex-col p-5 sm:p-7">
      <div className="grid flex-1 grid-cols-5 gap-2">
        {dias.map((d, i) => (
          <div key={d} className="flex flex-col gap-2">
            <span className="text-center text-xs font-medium text-texto-fraco">
              {d}
            </span>
            <div className="relative flex-1 rounded-controle fundo-sup-1">
              {aulas
                .filter((a) => a[0] === i)
                .map((a, j) => (
                  <span
                    key={j}
                    className="cena-cai absolute inset-x-1 rounded-md bg-ouro/30"
                    style={{
                      top: `${a[1] * 100}%`,
                      height: `${a[2] * 100}%`,
                      ['--i' as string]: i + j,
                    }}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      <div
        className="cena-desliza absolute left-1/2 top-12 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full fundo-sup-1 px-4 py-2.5 text-xs font-medium text-texto shadow-lg sm:top-14"
        style={{ ['--i' as string]: 8 }}
      >
        <PiBell className="h-4 w-4 text-ouro-texto" />
        {pt
          ? 'Sua aula começa em 30 minutos'
          : 'Your lesson starts in 30 minutes'}
      </div>
    </div>
  );
}

/** A agenda de concertos do blog: o calendário do mês, como em `/blog/calendar`. */
function Agenda({ idioma }: { idioma: Idioma }) {
  const pt = idioma === 'pt';
  const dias = pt
    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Duas semanas do mês; eventos de exemplo, com o "+N" da tela real.
  const eventos: Record<number, [string[], number]> = {
    17: [['19:00 OSESP', pt ? '20:00 Recital' : '20:00 Recital'], 1],
    18: [[pt ? '19:00 Ópera' : '19:00 Opera'], 0],
    19: [[pt ? '17:00 Câmara' : '17:00 Chamber', '20:00 Coro'], 3],
    22: [[pt ? '19:00 Ópera' : '19:00 Opera'], 0],
    24: [[pt ? '20:00 Sinfônica' : '20:00 Symphony', '21:00 Jazz'], 1],
    26: [['17:00 OSESP'], 0],
  };
  return (
    <div className="flex h-full flex-col gap-3 p-4 sm:p-6">
      <div className="cena-surge flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-controle fundo-sup-1 text-texto-suave">
            <PiCaretLeft className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold text-texto">
            {pt ? 'Setembro' : 'September'}
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-controle fundo-sup-1 text-texto-suave">
            <PiCaretRight className="h-3.5 w-3.5" />
          </span>
        </span>
        <span className="flex gap-0.5 rounded-controle fundo-sup-1 p-0.5 text-[0.6875rem]">
          <span className="rounded fundo-sup-2 px-2 py-1 font-semibold text-texto shadow-sm">
            {pt ? 'Mês' : 'Month'}
          </span>
          <span className="px-2 py-1 text-texto-suave">
            {pt ? 'Semana' : 'Week'}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.625rem] font-medium text-texto-fraco">
        {dias.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-2 gap-1">
        {Array.from({ length: 14 }, (_, k) => {
          const dia = 13 + k;
          const [lista, mais] = eventos[dia] ?? [[], 0];
          return (
            <div
              key={dia}
              className="cena-surge flex min-w-0 flex-col gap-0.5 overflow-hidden rounded-md fundo-sup-1 p-1.5 text-left"
              style={{ ['--i' as string]: Math.floor(k / 2) }}
            >
              <span className="text-[0.6875rem] font-semibold text-texto">
                {dia}
              </span>
              {lista.map((e) => (
                <span
                  key={e}
                  className="truncate text-[0.5625rem] font-medium leading-tight text-texto-suave sm:text-[0.625rem]"
                >
                  {e}
                </span>
              ))}
              {mais > 0 && (
                <span className="truncate text-[0.5625rem] font-medium leading-tight text-ouro-texto sm:text-[0.625rem]">
                  +{mais} {pt ? 'mais' : 'more'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
