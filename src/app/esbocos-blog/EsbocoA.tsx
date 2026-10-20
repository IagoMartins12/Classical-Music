import type { CSSProperties } from 'react';
import Link from 'next/link';
import { PiArrowRight } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { IndiceDoDocumento } from '@/app/components/ui/IndiceDoDocumento';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import {
  AGENDA,
  ARTIGOS,
  ARTIGO_ABERTO,
  CATEGORIAS,
  CITADOS,
  CORPO,
  MAIS_LIDOS,
  SUMARIO,
  artigosDe,
  categoriaDe,
  milhar,
  rota,
  type Artigo,
  type Vista,
} from './dados';
import { AgendaA } from './agenda';
import { Acoes, Cabecalho, Capa, Newsletter, Ouvir } from './ilhas';
import {
  Assinatura,
  BarraDoEsboco,
  CaixaDoAutor,
  Categorias,
  Comentarios,
  CompositorCitado,
  Corpo,
  DataDoConcerto,
  LINK,
  Meta,
  ObraCitada,
  PAGINA,
  Paginacao,
  PartituraCitada,
  Rodape,
  SumarioRecolhido,
  Tags,
  TituloDeSecao,
  TituloLink,
  Trilha,
} from './pecas';

/**
 * Esboço A — Primeira página.
 *
 * O blog como a capa de um periódico: alguém escolheu o que vem primeiro.
 * Uma matéria principal, duas secundárias, os mais lidos ao lado; depois os
 * últimos em linhas com miniatura e a agenda da semana fixa na lateral.
 * O artigo é uma coluna de 720px com o sumário acompanhando à direita.
 */

const E = 'a' as const;

export function EsbocoA({
  vista,
  categoria,
}: {
  vista: Vista;
  categoria?: string;
}) {
  return (
    <div className="min-h-dvh bg-fundo text-texto">
      <Cabecalho
        esboco={E}
        forma="jornal"
        atual={vista}
        faixa={<Secoes atual={vista === 'lista' ? categoria : undefined} />}
      />
      {vista === 'inicio' && <Inicio />}
      {vista === 'artigo' && <PaginaDoArtigo />}
      {vista === 'lista' && <Lista categoria={categoria} />}
      {vista === 'agenda' && <AgendaA />}
      <Rodape esboco={E} />
      <BarraDoEsboco esboco={E} vista={vista} />
    </div>
  );
}

/** A segunda linha do cabeçalho: as seções, como num jornal. */
function Secoes({ atual }: { atual?: string }) {
  return (
    <nav aria-label="Seções" className="border-t border-linha">
      <ul
        className={cx(
          PAGINA,
          'flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        )}
      >
        {CATEGORIAS.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={rota(E, 'lista', c.slug)}
              aria-current={c.slug === atual ? 'page' : undefined}
              className={cx(
                'flex min-h-[var(--alvo)] items-center text-sm transition-colors duration-[var(--t-toque)]',
                c.slug === atual
                  ? 'font-medium text-ouro-texto'
                  : 'text-texto-suave hover:text-texto'
              )}
            >
              {c.nome}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

function Inicio() {
  const [principal, segunda, terceira, ...resto] = ARTIGOS;
  const ultimos = resto.slice(0, 6);

  return (
    <main>
      <h1 className="sr-only">
        Blog do Opus Atlas: artigos sobre música clássica
      </h1>

      {/* A matéria principal: a capa ao lado, o título com o peso da página. */}
      <section aria-label="Em destaque" className={cx(PAGINA, 'pt-8 lg:pt-12')}>
        <article className="entra relative grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
          <Capa
            src={principal.capa}
            alt=""
            inicial={principal.titulo.charAt(0)}
            foco={principal.foco}
            sizes="(min-width: 1024px) 760px, 100vw"
            prioridade
            className="aspect-[4/3] rounded-card lg:col-span-7"
          />
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Meta artigo={principal} esboco={E} />
            <TituloLink
              artigo={principal}
              esboco={E}
              as="h2"
              className="text-[2.25rem] leading-[1.04] tracking-[-0.015em] sm:text-[2.75rem] xl:text-[3.5rem]"
            />
            <p className="max-w-[46ch] text-[1.1875rem] leading-[1.55] text-texto-suave">
              {principal.resumo}
            </p>
            <Text papel="rotulo" tom="fraco" as="p">
              Por {principal.autor.nome}
            </Text>
          </div>
        </article>

        {/* Duas secundárias e os mais lidos: três colunas, duas formas. */}
        <div className="mt-12 grid gap-x-12 gap-y-10 border-t border-linha pt-10 lg:grid-cols-3">
          {[segunda, terceira].map((artigo, i) => (
            <article
              key={artigo.slug}
              className="entra relative flex flex-col gap-4"
              style={{ '--i': i + 1 } as CSSProperties}
            >
              <Capa
                src={artigo.capa}
                alt=""
                inicial={artigo.titulo.charAt(0)}
                foco={artigo.foco}
                sizes="(min-width: 1024px) 400px, 100vw"
                className="aspect-[3/2] rounded-card"
              />
              <Stack gap={2}>
                <Meta artigo={artigo} esboco={E} />
                <TituloLink
                  artigo={artigo}
                  esboco={E}
                  className="text-[1.75rem] leading-[1.12]"
                />
                <Text
                  papel="rotulo"
                  tom="suave"
                  as="p"
                  className="line-clamp-2 text-[0.9375rem]"
                >
                  {artigo.resumo}
                </Text>
              </Stack>
            </article>
          ))}

          <section aria-labelledby="mais-lidos-a">
            <h2 id="mais-lidos-a" className="t-subtitulo">
              Mais lidos
            </h2>
            <ol className="mt-2">
              {MAIS_LIDOS.map((artigo, i) => (
                <li
                  key={artigo.slug}
                  className="relative grid grid-cols-[2rem_1fr] items-baseline gap-2 border-b border-linha py-3.5 last:border-b-0"
                >
                  <span className="font-display text-2xl italic leading-none text-ouro-texto">
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <Link
                      href={rota(E, 'artigo')}
                      className="blog-titulo-link font-display text-xl leading-snug"
                    >
                      {artigo.titulo}
                    </Link>
                    <span className="t-legenda">
                      <span className="t-dado">{milhar(artigo.leituras)}</span>{' '}
                      leituras
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>

      {/* Últimos, em linhas; a agenda acompanha ao lado. */}
      <div
        className={cx(PAGINA, 'mt-20 grid gap-x-12 gap-y-16 lg:grid-cols-12')}
      >
        <section aria-labelledby="ultimos-a" className="lg:col-span-8">
          <TituloDeSecao
            id="ultimos-a"
            href={rota(E, 'lista')}
            rotuloDoLink="Todos os artigos"
          >
            Últimos artigos
          </TituloDeSecao>
          <ul className="mt-4">
            {ultimos.map((artigo) => (
              <LinhaDeArtigo key={artigo.slug} artigo={artigo} />
            ))}
          </ul>
        </section>

        <aside className="lg:col-span-4">
          <section
            id="agenda"
            aria-labelledby="agenda-a"
            className="scroll-mt-32 rounded-card bg-sup-2 p-6 lg:sticky lg:top-32"
          >
            <h2 id="agenda-a" className="t-subtitulo">
              Agenda da semana
            </h2>
            <ul className="mt-2">
              {AGENDA.slice(0, 4).map((concerto) => (
                <li
                  key={concerto.id}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-b border-linha py-4 last:border-b-0"
                >
                  <DataDoConcerto concerto={concerto} />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[0.9375rem] font-medium leading-snug">
                      {concerto.programa}
                    </p>
                    <p className="t-legenda">
                      {concerto.casa}, {concerto.cidade}
                    </p>
                    <p className="t-legenda t-dado">
                      {concerto.semana} {concerto.hora}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href={rota(E, 'agenda')} className={cx(LINK, 'mt-3')}>
              Agenda completa
              <Icon de={PiArrowRight} tamanho="pp" />
            </Link>
          </section>
        </aside>
      </div>

      {/* Por assunto: um índice em texto, sem imagem. */}
      <section aria-labelledby="assuntos-a" className={cx(PAGINA, 'mt-24')}>
        <TituloDeSecao id="assuntos-a">Por assunto</TituloDeSecao>
        <div className="mt-6 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIAS.map((c) => (
            <div key={c.slug} className="flex flex-col gap-3">
              <div>
                <h3 className="font-display text-2xl leading-tight">
                  <Link
                    href={rota(E, 'lista', c.slug)}
                    className="underline decoration-transparent underline-offset-4 transition-colors duration-[var(--t-toque)] hover:decoration-ouro"
                  >
                    {c.nome}
                  </Link>
                </h3>
                <Text papel="legenda" as="p">
                  {c.descricao}
                </Text>
              </div>
              <ul>
                {artigosDe(c.slug)
                  .slice(0, 3)
                  .map((artigo) => (
                    <li key={artigo.slug} className="border-t border-linha">
                      <Link
                        href={rota(E, 'artigo')}
                        className="flex min-h-[var(--alvo)] items-center py-2.5 text-[0.9375rem] leading-snug text-texto-suave transition-colors duration-[var(--t-toque)] hover:text-texto"
                      >
                        {artigo.titulo}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="newsletter-a" className="mt-24 bg-sup-2">
        <div
          className={cx(
            PAGINA,
            'grid items-center gap-8 py-14 lg:grid-cols-2 lg:gap-16'
          )}
        >
          <div>
            <h2 id="newsletter-a" className="t-titulo text-balance">
              Receba os artigos por e-mail
            </h2>
            <p className="mt-3 max-w-[48ch] text-texto-suave t-corpo">
              Um e-mail quando sai artigo novo. Você confirma a inscrição e
              cancela quando quiser.
            </p>
          </div>
          <Newsletter />
        </div>
      </section>
    </main>
  );
}

/** Um artigo em linha: texto à esquerda, miniatura à direita. */
function LinhaDeArtigo({ artigo }: { artigo: Artigo }) {
  return (
    <li className="relative grid grid-cols-[1fr_auto] items-start gap-5 border-t border-linha py-6 sm:gap-8">
      <div className="flex min-w-0 flex-col gap-2">
        <Meta artigo={artigo} esboco={E} />
        <TituloLink
          artigo={artigo}
          esboco={E}
          className="text-[1.5rem] leading-[1.15] sm:text-[1.75rem]"
        />
        <p className="line-clamp-2 max-w-[58ch] text-[0.9375rem] leading-[1.55] text-texto-suave max-sm:hidden">
          {artigo.resumo}
        </p>
      </div>
      <Capa
        src={artigo.capa}
        alt=""
        inicial={artigo.titulo.charAt(0)}
        foco={artigo.foco}
        sizes="(min-width: 640px) 192px, 112px"
        className="aspect-[4/3] w-28 rounded-controle sm:w-48"
      />
    </li>
  );
}

// ---------------------------------------------------------------------------
// Artigo
// ---------------------------------------------------------------------------

function PaginaDoArtigo() {
  const artigo = ARTIGO_ABERTO;
  const relacionados = artigosDe(artigo.categoria)
    .filter((a) => a.slug !== artigo.slug)
    .slice(0, 3);

  return (
    <main>
      <span aria-hidden="true" className="blog-progresso" />

      <article className="mx-auto w-full max-w-[var(--largura-conteudo)] px-4 pt-8 sm:px-6 lg:px-10 lg:pt-12">
        <header className="flex max-w-[var(--largura-texto)] flex-col gap-5">
          <Trilha artigo={artigo} esboco={E} />
          <h1 className="font-display text-[2.5rem] leading-[1.04] tracking-[-0.015em] text-balance sm:text-[3.25rem] lg:text-[3.75rem]">
            {artigo.titulo}
          </h1>
          <p className="text-[1.25rem] leading-[1.5] text-texto-suave">
            {artigo.resumo}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-1">
            <Assinatura artigo={artigo} />
            <Ouvir minutos={artigo.minutos} musica={CITADOS.musica} />
          </div>
        </header>

        <figure className="mt-10">
          <Capa
            src={artigo.capa}
            alt={artigo.alt}
            inicial={artigo.titulo.charAt(0)}
            foco={artigo.foco}
            sizes="(min-width: 1120px) 1040px, 100vw"
            prioridade
            className="aspect-[16/9] rounded-card"
          />
          <figcaption className="t-legenda mt-2.5">{artigo.credito}</figcaption>
        </figure>

        <div className="mt-10 grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,var(--largura-texto))_minmax(0,1fr)] xl:gap-x-16">
          <div className="flex min-w-0 flex-col gap-12">
            <div className="flex flex-col gap-8">
              <SumarioRecolhido className="lg:hidden" />
              <Corpo blocos={CORPO} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-5">
              <Tags tags={artigo.tags} esboco={E} />
              <div className="lg:hidden">
                <Acoes curtidas={86} />
              </div>
            </div>

            <section
              aria-labelledby="neste-artigo-a"
              className="flex flex-col gap-2"
            >
              <h2 id="neste-artigo-a" className="t-subtitulo">
                Neste artigo
              </h2>
              <div className="grid gap-x-10 sm:grid-cols-2">
                <ul>
                  {CITADOS.compositores.map((c) => (
                    <li key={c.id} className="border-b border-linha">
                      <CompositorCitado compositor={c} />
                    </li>
                  ))}
                </ul>
                <ul>
                  {CITADOS.obras.map((o) => (
                    <li key={o.id} className="border-b border-linha">
                      <ObraCitada obra={o} />
                    </li>
                  ))}
                  <li>
                    <PartituraCitada />
                  </li>
                </ul>
              </div>
            </section>

            <CaixaDoAutor autor={artigo.autor} esboco={E} />

            <section
              aria-labelledby="newsletter-artigo-a"
              className="flex flex-col gap-4"
            >
              <div>
                <h2 id="newsletter-artigo-a" className="t-subtitulo">
                  Receba os próximos artigos
                </h2>
                <Text papel="rotulo" tom="suave" as="p">
                  Um e-mail quando sai artigo novo.
                </Text>
              </div>
              <Newsletter />
            </section>

            <Comentarios total={artigo.comentarios} />
          </div>

          <aside className="max-lg:hidden">
            <div className="sticky top-36 flex flex-col gap-8">
              <IndiceDoDocumento itens={SUMARIO} rotulo="Sumário" />
              <Acoes curtidas={86} empilhado />
            </div>
          </aside>
        </div>
      </article>

      <section
        aria-labelledby="relacionados-a"
        className="mx-auto mt-20 w-full max-w-[var(--largura-conteudo)] px-4 sm:px-6 lg:px-10"
      >
        <TituloDeSecao
          id="relacionados-a"
          href={rota(E, 'lista', artigo.categoria)}
          rotuloDoLink={`Mais em ${categoriaDe(artigo.categoria).nome}`}
        >
          Continue lendo
        </TituloDeSecao>
        <ul className="mt-4 max-w-[var(--largura-texto)]">
          {relacionados.map((a) => (
            <LinhaDeArtigo key={a.slug} artigo={a} />
          ))}
        </ul>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Lista (todos os artigos, ou uma categoria)
// ---------------------------------------------------------------------------

function Lista({ categoria }: { categoria?: string }) {
  const atual = categoria ? categoriaDe(categoria) : undefined;
  const artigos = artigosDe(atual?.slug);

  return (
    <main className={cx(PAGINA, 'pt-10 lg:pt-14')}>
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <header className="flex flex-col gap-3">
            <h1 className="font-display text-[2.5rem] leading-[1.05] tracking-[-0.015em] sm:text-[3.25rem]">
              {atual ? atual.nome : 'Todos os artigos'}
            </h1>
            <p className="max-w-[52ch] text-[1.1875rem] leading-[1.55] text-texto-suave">
              {atual
                ? atual.descricao
                : 'Artigos, análises e histórias sobre música clássica.'}
            </p>
            <Text papel="legenda" as="p">
              <span className="t-dado">{artigos.length}</span>{' '}
              {artigos.length === 1 ? 'artigo' : 'artigos'}
            </Text>
            <Categorias esboco={E} atual={atual?.slug} className="mt-3" />
          </header>

          <ul className="mt-8">
            {artigos.map((artigo) => (
              <LinhaDeArtigo key={artigo.slug} artigo={artigo} />
            ))}
          </ul>
          <Paginacao esboco={E} />
        </div>

        <aside className="lg:col-span-4">
          <section
            aria-labelledby="mais-lidos-lista-a"
            className="rounded-card bg-sup-2 p-6 lg:sticky lg:top-32"
          >
            <h2 id="mais-lidos-lista-a" className="t-subtitulo">
              Mais lidos
            </h2>
            <ol className="mt-2">
              {MAIS_LIDOS.map((artigo, i) => (
                <li
                  key={artigo.slug}
                  className="relative grid grid-cols-[2rem_1fr] items-baseline gap-2 border-b border-linha py-3.5 last:border-b-0"
                >
                  <span className="font-display text-2xl italic leading-none text-ouro-texto">
                    {i + 1}
                  </span>
                  <Link
                    href={rota(E, 'artigo')}
                    className="blog-titulo-link font-display text-xl leading-snug"
                  >
                    {artigo.titulo}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </main>
  );
}
