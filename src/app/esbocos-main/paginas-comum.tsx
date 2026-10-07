'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiArrowRight,
  PiBookOpenText,
  PiCaretLeft,
  PiCaretRight,
  PiChalkboardTeacher,
  PiCheckCircle,
  PiMagnifyingGlass,
  PiMedal,
  PiMusicNotes,
  PiPlay,
  PiSpotifyLogo,
  PiWaveform,
  PiYoutubeLogo,
  PiX,
  PiNotePencil,
  PiUploadSimple,
} from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { cx } from '@/app/components/ui/cx';
import {
  CHOPIN,
  HOJE,
  PESSOA,
  destino,
  formatar,
  rota,
  type EsbocoId,
} from './dados';
import { EPOCAS_HISTORIA } from './epocas-dados';
import { INSTRUMENTOS } from './instrumentos-dados';
import {
  LISTA_COMPOSITORES,
  type ItemCompositor,
  type ItemObra,
} from './listas-dados';
import { Retrato, linkTexto, retratoDe, useEsboco } from './pecas';

// ---------------------------------------------------------------------------
// O compositor do dia — o herói do esboço A, que vira o layout da seção
// ---------------------------------------------------------------------------

/**
 * O retrato inteiro à esquerda, o nome em tamanho de capa, uma frase e duas
 * ações. Decisão do dono (03/10): este é o layout do "compositor do dia" — no
 * A ele é o herói; no B e no C, uma seção da home. `depois` recebe o que vem
 * abaixo das ações (a busca no A).
 */
export function CompositorDoDia({
  esboco,
  heroi = false,
  depois,
}: {
  esboco: EsbocoId;
  heroi?: boolean;
  depois?: ReactNode;
}) {
  const c = CHOPIN;
  const Titulo = heroi ? 'h2' : 'h3';
  return (
    <div className={cx('relative isolate', heroi && 'overflow-hidden')}>
      {heroi && <NotasAoFundo className="-z-10" />}
      <div
        className={cx(
          'section-wrap grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16',
          heroi ? 'py-12 md:py-16' : 'py-12'
        )}
      >
        <Link
          href={rota(esboco, 'compositor')}
          data-vira={`compositor-${c.id}`}
          className="relative block"
        >
          <Retrato
            nome={c.nomeCompleto}
            src={c.retrato}
            prioridade={heroi}
            sizes="(max-width: 768px) 100vw, 40vw"
            className={cx(
              'aspect-[4/5] w-full rounded-card shadow-[var(--sombra-2)]',
              heroi && 'a-descobre'
            )}
          />
        </Link>
        <div className="flex flex-col gap-6">
          <Titulo
            className="entra font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em]"
            style={{ ['--i' as string]: 0 }}
          >
            Frédéric
            <br />
            Chopin
          </Titulo>
          <p
            className="t-corpo entra max-w-[52ch] text-texto-suave"
            style={{ ['--i' as string]: 1 }}
          >
            O compositor de hoje, {HOJE.rotulo}: o pianista polonês que fez do
            piano uma voz. {c.obras} obras, {formatar(c.partituras)} partituras
            — todas de domínio público, para baixar de graça.
          </p>
          <div
            className="entra flex flex-wrap gap-3"
            style={{ ['--i' as string]: 2 }}
          >
            <Link
              href={rota(esboco, 'compositor')}
              className={classesDeBotao('primario', 'm')}
            >
              Abrir Chopin
            </Link>
            <Link
              href={rota(esboco, 'obra')}
              className={classesDeBotao('secundario', 'm')}
            >
              <Icon de={PiPlay} tamanho="p" />
              Ouvir o Noturno Op. 9
            </Link>
          </div>
          {depois && (
            <div className="entra pt-2" style={{ ['--i' as string]: 3 }}>
              {depois}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// O gatilho do herói: estudar, planos, sobre
// ---------------------------------------------------------------------------

/**
 * Todo herói leva a quem chega um passo além da enciclopédia: criar a estante
 * (estudo grátis), conhecer os planos ou entender o que é o Opus Atlas. Para
 * quem já entrou, vira "continuar estudando". Três formas, uma por esboço.
 */
export function GatilhoDoHeroi({
  esboco,
  forma = 'linha',
}: {
  esboco: EsbocoId;
  forma?: 'linha' | 'cartoes' | 'faixa';
}) {
  const { logado, abrirEntrar } = useEsboco();

  if (logado) {
    const e = PESSOA.estudando[0];
    return (
      <Link
        href={rota(esboco, 'estudo')}
        className="group flex items-center gap-3 rounded-card bg-sup-2 p-3 pr-4"
      >
        <Retrato
          nome={e.compositor}
          src={retratoDe(e.compositor)}
          sizes="40px"
          className="h-10 w-10 shrink-0 rounded-full"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate t-rotulo">
            Continuar{' '}
            <span className="font-display text-[1.0625rem]">{e.obra}</span>
          </span>
          <span className="t-legenda">
            {PESSOA.sequencia} dias seguidos · nível {PESSOA.nivel}
          </span>
        </span>
        <Icon de={PiArrowRight} tamanho="p" className="text-ouro-texto" />
      </Link>
    );
  }

  const caminhos = [
    {
      icone: PiBookOpenText,
      titulo: 'Estude por aqui',
      texto:
        'Monte sua estante, escolha a partitura e acompanhe o progresso. Grátis.',
      href: rota(esboco, 'estudar'),
      acao: 'Como funciona',
    },
    {
      icone: PiChalkboardTeacher,
      titulo: 'Dá aula?',
      texto: 'Alunos, agenda e repertório num portal só.',
      href: rota(esboco, 'ensino'),
      acao: 'Para professores',
    },
    {
      icone: PiMedal,
      titulo: 'Planos',
      texto: 'Free para sempre; Plus, Mentor e Maestro quando precisar.',
      href: destino(esboco, 'planos'),
      acao: 'Ver planos',
    },
  ];

  if (forma === 'cartoes') {
    return (
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {caminhos.map((c) => (
          <li key={c.titulo}>
            <Link
              href={c.href}
              className="group flex h-full flex-col gap-2 rounded-card bg-sup-2 p-4"
            >
              <Icon de={c.icone} tamanho="m" className="text-ouro-texto" />
              <span className="font-medium group-hover:text-ouro-texto">
                {c.titulo}
              </span>
              <span className="t-rotulo text-texto-suave">{c.texto}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-1 t-rotulo text-ouro-texto">
                {c.acao} <Icon de={PiArrowRight} tamanho="pp" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  if (forma === 'faixa') {
    return (
      <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 t-rotulo text-texto-suave">
        <span>Grátis, sem conta.</span>
        <button
          type="button"
          onClick={abrirEntrar}
          className={cx('text-ouro-texto', linkTexto)}
        >
          Crie sua estante
        </button>
        <Link
          href={rota(esboco, 'estudar')}
          className={cx('text-texto', linkTexto)}
        >
          Como estudar aqui
        </Link>
        <Link
          href={rota(esboco, 'ensino')}
          className={cx('text-texto', linkTexto)}
        >
          Para professores
        </Link>
        <Link
          href={destino(esboco, 'planos')}
          className={cx('text-texto', linkTexto)}
        >
          Planos
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card bg-sup-2 px-5 py-4">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">Estude com o Opus Atlas, de graça</span>
        <span className="t-rotulo text-texto-suave">
          Sua estante, a partitura escolhida e o progresso de cada obra.
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-3">
        <Button variante="primario" tamanho="p" onClick={abrirEntrar}>
          Criar minha estante
        </Button>
        <Link
          href={rota(esboco, 'estudar')}
          className={cx('t-rotulo text-texto', linkTexto)}
        >
          Como funciona
        </Link>
        <Link
          href={destino(esboco, 'planos')}
          className={cx('t-rotulo text-ouro-texto', linkTexto)}
        >
          Planos
        </Link>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Listagens: cartões, linhas, paginação, filtros
// ---------------------------------------------------------------------------

export function CartaoCompositor({
  c,
  esboco,
  forma = 'retrato',
}: {
  c: ItemCompositor;
  esboco: EsbocoId;
  forma?: 'retrato' | 'circulo' | 'linha';
}) {
  const href = rota(
    esboco,
    c.ficha === 'completa' ? 'compositor' : 'compositor-tipico'
  );
  const vida = c.nasc || c.morte ? `${c.nasc ?? '?'}–${c.morte ?? ''}` : null;
  const detalhe = [vida, c.pais].filter(Boolean).join(' · ');

  if (forma === 'linha') {
    return (
      <Link href={href} className="group flex items-center gap-4 py-3">
        <Retrato
          nome={c.nomeCompleto}
          src={c.retrato}
          sizes="48px"
          className="h-12 w-12 shrink-0 rounded-full"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1.5 truncate font-display text-[1.1875rem] group-hover:text-ouro-texto">
            {c.nomeCompleto}
            {c.verificado && (
              <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
            )}
          </span>
          <span className="t-rotulo truncate text-texto-suave">
            {detalhe || c.epoca}
          </span>
        </span>
        <span className="t-rotulo text-texto-suave max-sm:hidden">
          {c.epoca}
        </span>
        <span className="t-dado w-20 text-right text-[0.8125rem] text-texto-fraco">
          {formatar(c.obras)} obras
        </span>
      </Link>
    );
  }

  if (forma === 'circulo') {
    return (
      <Link
        href={href}
        className="group flex flex-col items-center gap-2 text-center"
      >
        <Retrato
          nome={c.nomeCompleto}
          src={c.retrato}
          sizes="112px"
          className="aspect-square w-full max-w-28 rounded-full text-[1.25rem] transition-[box-shadow] group-hover:ring-2 group-hover:ring-[var(--ouro)]"
        />
        <span className="line-clamp-2 font-display text-[1.0625rem] leading-tight group-hover:text-ouro-texto">
          {c.nomeCompleto}
        </span>
        <span className="t-dado -mt-1 text-[0.75rem] text-texto-fraco">
          {vida ?? c.epoca}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      data-vira={`compositor-${c.id}`}
      className="group flex flex-col gap-3"
    >
      <Retrato
        nome={c.nomeCompleto}
        src={c.retrato}
        sizes="(max-width: 640px) 50vw, 20vw"
        className="aspect-[4/5] w-full rounded-card text-[1.75rem]"
      />
      <span className="flex flex-col">
        <span className="flex items-center gap-1.5 font-display text-[1.25rem] leading-tight group-hover:text-ouro-texto">
          {c.nome}
          {c.verificado && (
            <SeloVerificada className="h-4 w-4 text-verificado" />
          )}
        </span>
        <span className="t-rotulo text-texto-suave">{detalhe || c.epoca}</span>
        <span className="t-dado text-[0.75rem] text-texto-fraco">
          {formatar(c.obras)} obras
        </span>
      </span>
    </Link>
  );
}

const ICONE_MIDIA = {
  spotify: PiSpotifyLogo,
  youtube: PiYoutubeLogo,
  audio: PiWaveform,
} as const;

export function LinhaObra({
  o,
  esboco,
  grande = false,
}: {
  o: ItemObra;
  esboco: EsbocoId;
  grande?: boolean;
}) {
  const situacao = o.partituras
    ? `${o.partituras} partituras`
    : 'Partituras no IMSLP';
  return (
    <Link
      href={rota(esboco, o.ficha === 'completa' ? 'obra' : 'obra-tipica')}
      data-vira={`obra-${o.id}`}
      className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <Retrato
        nome={o.compositor}
        src={
          retratoDe(o.compositor) ??
          LISTA_COMPOSITORES.find((c) => c.nome === o.compositor)?.retrato
        }
        sizes="48px"
        className="h-11 w-11 rounded-full"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cx(
            'font-display group-hover:text-ouro-texto sm:truncate',
            grande ? 'text-[1.375rem]' : 'text-[1.1875rem]'
          )}
        >
          {o.titulo}
          {o.catalogo && (
            <span className="text-texto-suave">, {o.catalogo}</span>
          )}
        </span>
        <span className="t-rotulo truncate text-texto-suave">
          {[o.compositor, o.instrumentacao, o.ano].filter(Boolean).join(' · ')}
        </span>
        {/* No telefone a situação desce para cá: o título não fica espremido. */}
        <span className="flex items-center gap-2 t-legenda sm:hidden">
          {situacao}
          {o.midia?.map((m) => (
            <Icon key={m} de={ICONE_MIDIA[m]} tamanho="pp" rotulo={m} />
          ))}
        </span>
      </span>
      <span className="flex flex-col items-end gap-1 max-sm:hidden">
        <span className="t-rotulo whitespace-nowrap text-texto-suave">
          {situacao}
        </span>
        {o.midia?.length ? (
          <span className="flex gap-1.5 text-texto-fraco">
            {o.midia.map((m) => (
              <Icon key={m} de={ICONE_MIDIA[m]} tamanho="pp" rotulo={m} />
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function Paginacao({
  pagina = 1,
  total,
}: {
  pagina?: number;
  total: number;
}) {
  const paginas = Math.ceil(total / 24);
  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <span className="t-rotulo text-texto-suave">
        Página {pagina} de {formatar(paginas)}
      </span>
      <span className="flex items-center gap-1">
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiCaretLeft}
          rotulo="Página anterior"
          disabled
        />
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === pagina ? 'page' : undefined}
            className={cx(
              'grid h-9 min-w-9 place-items-center rounded-controle px-2 t-dado text-[0.875rem]',
              p === pagina
                ? 'fill-ouro text-sobre-ouro'
                : 'text-texto-suave hover:bg-sup-2'
            )}
          >
            {p}
          </button>
        ))}
        <span className="px-1 text-texto-fraco">…</span>
        <button
          type="button"
          className="grid h-9 min-w-9 place-items-center rounded-controle px-2 t-dado text-[0.875rem] text-texto-suave hover:bg-sup-2"
        >
          {formatar(paginas)}
        </button>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiCaretRight}
          rotulo="Próxima página"
        />
      </span>
    </nav>
  );
}

export function CampoDeBusca({
  id,
  placeholder,
  valor,
  grande = false,
}: {
  id: string;
  placeholder: string;
  valor?: string;
  grande?: boolean;
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={cx(
        'c-busca flex w-full items-center gap-3 rounded-full bg-[var(--campo)]',
        grande ? 'min-h-14 p-1.5 pl-5' : 'min-h-11 p-1 pl-4'
      )}
    >
      <Icon
        de={PiMagnifyingGlass}
        tamanho="m"
        className="shrink-0 text-texto-fraco"
      />
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type="search"
        enterKeyHint="search"
        defaultValue={valor}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-texto-fraco"
      />
      <Button
        variante="primario"
        type="submit"
        tamanho="p"
        className="shrink-0"
      >
        Buscar
      </Button>
    </form>
  );
}

export function FiltrosAtivos({ filtros }: { filtros: string[] }) {
  if (!filtros.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filtros.map((f) => (
        <span
          key={f}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full tint-ouro pl-3 pr-1 text-[0.8125rem] text-ouro-na-tinta"
        >
          {f}
          <button
            type="button"
            className="grid h-6 w-6 place-items-center rounded-full hover:bg-[var(--interactive-hover)]"
          >
            <Icon de={PiX} tamanho="pp" rotulo={`Tirar o filtro ${f}`} />
          </button>
        </span>
      ))}
      <button
        type="button"
        className={cx('t-rotulo text-texto-suave', linkTexto)}
      >
        Limpar tudo
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Épocas e instrumentos: o conteúdo (cada esboço compõe a página)
// ---------------------------------------------------------------------------

export type Epoca = (typeof EPOCAS_HISTORIA)[number];
export type Instrumento = (typeof INSTRUMENTOS)[number];

export function DetalheEpoca({
  e,
  esboco,
  compacto = false,
}: {
  e: Epoca;
  esboco: EsbocoId;
  compacto?: boolean;
}) {
  const blocos = [
    ['Características', e.caracteristicas],
    ['Desenvolvimentos', e.desenvolvimentos],
    ['Formas', e.formas],
    ['Instrumentos', e.instrumentos],
  ] as const;
  return (
    <div className="flex flex-col gap-6">
      <p className="t-corpo max-w-[60ch]">{e.descricao}</p>
      <p className="t-rotulo text-texto-suave">
        <span className="t-dado text-texto">{formatar(e.compositores)}</span>{' '}
        compositores e{' '}
        <span className="t-dado text-texto">{formatar(e.obras)}</span> obras
        desta época no acervo.{' '}
        <Link
          href={rota(esboco, 'obras')}
          className={cx('text-ouro-texto', linkTexto)}
        >
          Ver as obras
        </Link>
      </p>
      <div
        className={cx('grid grid-cols-1 gap-6', !compacto && 'sm:grid-cols-2')}
      >
        {blocos.map(([t, itens]) => (
          <div key={t} className="flex flex-col gap-2">
            <h4 className="t-legenda">{t}</h4>
            <ul className="flex flex-col gap-1.5">
              {itens.map((i) => (
                <li key={i} className="flex gap-2 t-rotulo">
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
  );
}

export function DetalheInstrumento({
  i,
  esboco,
}: {
  i: Instrumento;
  esboco: EsbocoId;
}) {
  const fatos = [
    ['Família', i.familia],
    ['Origem', i.origem],
    ['Inventor', i.inventor],
    ['Quando', i.periodo],
  ].filter(([, v]) => v) as [string, string][];
  return (
    <div className="flex flex-col gap-6">
      <p className="t-corpo max-w-[60ch]">{i.descricao}.</p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {fatos.map(([t, v]) => (
          <div key={t} className="flex flex-col">
            <dt className="t-legenda">{t}</dt>
            <dd className="font-display text-[1.125rem] leading-snug">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="t-rotulo max-w-[60ch] text-texto-suave">{i.historia}</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h4 className="t-legenda">Características</h4>
          <ul className="flex flex-col gap-1.5">
            {i.caracteristicas.map((c) => (
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
        <div className="flex flex-col gap-2">
          <h4 className="t-legenda">Quem tocou</h4>
          <ul className="flex flex-wrap gap-2">
            {i.interpretes.map((p) => (
              <li
                key={p}
                className="inline-flex min-h-8 items-center rounded-full bg-sup-2 px-3 text-[0.8125rem]"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link
        href={rota(esboco, 'obras')}
        className={cx(
          'inline-flex items-center gap-1.5 self-start t-rotulo text-ouro-texto',
          linkTexto
        )}
      >
        <Icon de={PiMusicNotes} tamanho="p" /> {formatar(i.obras)} obras para{' '}
        {i.nome.toLowerCase()} no acervo
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estudar: a página do autodidata (o par da página Ensino)
// ---------------------------------------------------------------------------

/**
 * Para quem estuda sozinho: o que a conta grátis faz, mostrado com as telas
 * de verdade em miniatura. É a página para onde os heróis apontam ("como
 * funciona") e o contraponto da Ensino; Planos fica para a decisão de pagar.
 */
export function PaginaEstudar({ esboco }: { esboco: EsbocoId }) {
  const { abrirEntrar } = useEsboco();
  const passos = [
    {
      icone: PiMagnifyingGlass,
      titulo: 'Ache a obra',
      texto:
        'Todas as obras, com as partituras de domínio público para baixar de graça, sem precisar de conta.',
    },
    {
      icone: PiBookOpenText,
      titulo: 'Escolha a partitura e guarde',
      texto:
        '"Quero estudar" leva a obra para a sua estante, com a partitura que você escolheu.',
    },
    {
      icone: PiNotePencil,
      titulo: 'Anote e acompanhe',
      texto:
        'Onde parou, o dedilhado que resolveu, quanto tempo falta. As anotações podem ser públicas.',
    },
    {
      icone: PiCheckCircle,
      titulo: 'Marque o que aprendeu',
      texto:
        '"Já aprendi", com o domínio e, se quiser, um vídeo tocando. As conquistas chegam na hora.',
    },
    {
      icone: PiUploadSimple,
      titulo: 'Complete o acervo',
      texto:
        'Falta uma partitura, uma gravação, uma biografia? Envie — entra no ar com o seu nome e vale XP.',
    },
  ];
  return (
    <div className="flex flex-col">
      <section className="relative isolate">
        <NotasAoFundo className="-z-10" />
        <div className="section-wrap flex flex-col items-start gap-6 py-16 md:py-24">
          <h1 className="entra max-w-[16ch] font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.96] tracking-[-0.02em]">
            Estude música clássica no seu ritmo
          </h1>
          <p
            className="t-corpo entra max-w-[56ch] text-texto-suave"
            style={{ ['--i' as string]: 1 }}
          >
            Sem professor, ou entre uma aula e outra: a sua estante guarda o que
            você estuda, com a partitura escolhida e o progresso de cada obra. A
            conta é grátis.
          </p>
          <div
            className="entra flex flex-wrap gap-3"
            style={{ ['--i' as string]: 2 }}
          >
            <Button variante="primario" onClick={abrirEntrar}>
              Criar minha estante
            </Button>
            <Link
              href={destino(esboco, 'planos')}
              className={classesDeBotao('secundario', 'm')}
            >
              O que o Plus acrescenta
            </Link>
          </div>
        </div>
      </section>
      <section className="section-wrap py-10">
        <ol className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {passos.map((p) => (
            <li key={p.titulo} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sup-2 text-ouro-texto">
                <Icon de={p.icone} tamanho="m" />
              </span>
              <span className="flex flex-col gap-1">
                <h2 className="t-secao">{p.titulo}</h2>
                <p className="t-rotulo text-texto-suave">{p.texto}</p>
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section className="section-wrap py-10">
        <div className="grid grid-cols-1 gap-6 rounded-card bg-sup-2 p-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:p-10">
          <div className="flex flex-col gap-2">
            <h2 className="t-titulo">Free e Plus</h2>
            <p className="t-rotulo text-texto-suave">
              No Free: enciclopédia, estante, anotações, conquistas, 20 envios e
              4 vídeos. No Plus (R$ 19,90/mês): envios e vídeos sem limite — e o
              que vem em breve.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              href={destino(esboco, 'planos')}
              className={classesDeBotao('primario', 'm')}
            >
              Comparar planos
            </Link>
            <Link
              href={rota(esboco, 'ensino')}
              className={classesDeBotao('fantasma', 'm')}
            >
              Tem professor? Veja o portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
