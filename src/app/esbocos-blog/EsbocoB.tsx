import Link from 'next/link';
import { PiArrowRight } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { IndiceDoDocumento } from '@/app/components/ui/IndiceDoDocumento';
import { Text } from '@/app/components/ui/Text';
import {
  AGENDA,
  ARTIGOS,
  ARTIGO_ABERTO,
  CITADOS,
  CORPO,
  MAIS_LIDOS,
  SUMARIO,
  artigosDe,
  categoriaDe,
  dataCurta,
  diaDoMes,
  mesCurto,
  milhar,
  porMes,
  rota,
  type Artigo,
  type Vista,
} from './dados';
import { AgendaB } from './agenda';
import { Acoes, Cabecalho, Capa, Newsletter, Ouvir } from './ilhas';
import {
  Avatar,
  BarraDoEsboco,
  CaixaDoAutor,
  Categorias,
  Comentarios,
  CompositorCitado,
  Corpo,
  LINK,
  Meta,
  ObraCitada,
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
 * Esboço B — Caderno.
 *
 * O blog como o sumário de uma enciclopédia: um índice por mês, em uma coluna,
 * com o dia em mono à esquerda e o título em serifada grande. A capa existe em
 * todo artigo, mas pequena, ao lado: quem manda é o texto. No artigo, o que
 * não é texto (quem escreveu, sumário, ouvir, compartilhar) mora na margem,
 * como nota de edição.
 */

const E = 'b' as const;

/** Uma coluna só, na largura de conteúdo. */
const COLUNA =
  'mx-auto w-full max-w-[var(--largura-conteudo)] px-4 sm:px-6 lg:px-10';

export function EsbocoB({
  vista,
  categoria,
}: {
  vista: Vista;
  categoria?: string;
}) {
  return (
    <div className="min-h-dvh bg-fundo text-texto">
      <Cabecalho esboco={E} forma="fino" atual={vista} />
      {vista === 'inicio' && <Inicio />}
      {vista === 'artigo' && <PaginaDoArtigo />}
      {vista === 'lista' && <Lista categoria={categoria} />}
      {vista === 'agenda' && <AgendaB />}
      <Rodape esboco={E} />
      <BarraDoEsboco esboco={E} vista={vista} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// O índice: os artigos de um mês, com o mês parado na margem enquanto a
// lista passa.
// ---------------------------------------------------------------------------

function Indice({ artigos }: { artigos: Artigo[] }) {
  return (
    <div className="flex flex-col gap-12">
      {porMes(artigos).map((grupo) => (
        <section
          key={grupo.mes}
          aria-label={grupo.mes}
          className="grid gap-x-10 lg:grid-cols-[9.5rem_minmax(0,1fr)]"
        >
          <h2 className="t-dado self-start pb-3 text-[0.8125rem] text-texto-fraco lg:sticky lg:top-20 lg:pt-7">
            {grupo.mes}
          </h2>
          <ol>
            {grupo.artigos.map((artigo) => (
              <li
                key={artigo.slug}
                className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-t border-linha py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-x-6"
              >
                <time
                  dateTime={artigo.data}
                  className="pt-1 font-display text-[1.75rem] leading-none text-texto-fraco sm:text-[2rem]"
                >
                  {diaDoMes(artigo.data)}
                  <span className="sr-only"> de {grupo.mes}</span>
                </time>
                <div className="flex min-w-0 flex-col gap-2">
                  <TituloLink
                    artigo={artigo}
                    esboco={E}
                    as="h3"
                    className="text-[1.625rem] leading-[1.12] sm:text-[2rem]"
                  />
                  <p className="max-w-[58ch] text-[1rem] leading-[1.55] text-texto-suave">
                    {artigo.resumo}
                  </p>
                  <p className="flex flex-wrap gap-x-3 text-[0.8125rem] text-texto-fraco">
                    <Link
                      href={rota(E, 'lista', artigo.categoria)}
                      className="relative z-elevado font-medium text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-current"
                    >
                      {categoriaDe(artigo.categoria).nome}
                    </Link>
                    <span className="t-dado">{artigo.minutos} min</span>
                    <span>{artigo.autor.nome}</span>
                  </p>
                </div>
                <Capa
                  src={artigo.capa}
                  alt=""
                  inicial={artigo.titulo.charAt(0)}
                  foco={artigo.foco}
                  sizes="144px"
                  className="aspect-square w-36 rounded-controle max-sm:hidden"
                />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

function Inicio() {
  const [principal, ...resto] = ARTIGOS;

  return (
    <main className={COLUNA}>
      <header className="entra flex flex-col gap-5 pb-12 pt-12 lg:pt-20">
        <h1 className="font-display text-[3.5rem] leading-none tracking-[-0.02em] sm:text-[5rem]">
          Blog
        </h1>
        <p className="max-w-[48ch] text-[1.25rem] leading-[1.5] text-texto-suave">
          Artigos, análises e histórias sobre música clássica, compositores e
          obras.
        </p>
        <Categorias esboco={E} className="pt-3" />
      </header>

      {/* O artigo mais recente: o único com a capa grande. */}
      <article className="relative grid gap-6 border-t border-linha-forte pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12">
        <div className="flex flex-col gap-4">
          <Meta artigo={principal} esboco={E} comAutor />
          <TituloLink
            artigo={principal}
            esboco={E}
            as="h2"
            className="text-[2.25rem] leading-[1.05] tracking-[-0.015em] sm:text-[3rem]"
          />
          <p className="max-w-[44ch] text-[1.1875rem] leading-[1.55] text-texto-suave">
            {principal.resumo}
          </p>
        </div>
        <Capa
          src={principal.capa}
          alt=""
          inicial={principal.titulo.charAt(0)}
          foco={principal.foco}
          sizes="(min-width: 1024px) 560px, 100vw"
          prioridade
          className="aspect-[3/2] rounded-card max-lg:order-first"
        />
      </article>

      <div className="mt-16">
        <Indice artigos={resto.slice(0, 9)} />
        <div className="mt-8 lg:pl-[12rem]">
          <Link href={rota(E, 'lista')} className={LINK}>
            Todos os artigos
            <Icon de={PiArrowRight} tamanho="pp" />
          </Link>
        </div>
      </div>

      {/* A agenda como programa impresso: data, programa, casa. */}
      <section
        id="agenda"
        aria-labelledby="agenda-b"
        className="mt-24 scroll-mt-24"
      >
        <TituloDeSecao
          id="agenda-b"
          href={rota(E, 'agenda')}
          rotuloDoLink="Agenda completa"
        >
          Agenda de concertos
        </TituloDeSecao>
        <ul className="mt-6">
          {AGENDA.map((concerto) => (
            <li
              key={concerto.id}
              className="grid gap-x-8 gap-y-1 border-t border-linha py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,16rem)] sm:items-baseline"
            >
              <time
                dateTime={concerto.data}
                className="t-dado text-[0.875rem] text-texto-suave"
              >
                {diaDoMes(concerto.data)} {mesCurto(concerto.data)},{' '}
                {concerto.semana} {concerto.hora}
              </time>
              <p className="font-display text-[1.375rem] leading-snug">
                {concerto.programa}
              </p>
              <p className="text-[0.9375rem] text-texto-suave sm:text-right">
                {concerto.casa}, {concerto.cidade}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-24 grid gap-x-16 gap-y-14 lg:grid-cols-2">
        <section aria-labelledby="mais-lidos-b">
          <h2 id="mais-lidos-b" className="t-titulo">
            Mais lidos
          </h2>
          <ol className="mt-4">
            {MAIS_LIDOS.map((artigo, i) => (
              <li
                key={artigo.slug}
                className="relative grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 border-t border-linha py-4"
              >
                <span className="font-display text-[1.75rem] italic leading-none text-ouro-texto">
                  {i + 1}
                </span>
                <Link
                  href={rota(E, 'artigo')}
                  className="blog-titulo-link font-display text-[1.375rem] leading-snug"
                >
                  {artigo.titulo}
                </Link>
                <span className="t-dado text-[0.8125rem] text-texto-fraco max-sm:hidden">
                  {milhar(artigo.leituras)}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="newsletter-b"
          className="flex flex-col gap-5 self-start rounded-card bg-sup-2 p-6 sm:p-8"
        >
          <div>
            <h2 id="newsletter-b" className="t-titulo text-balance">
              Receba os artigos por e-mail
            </h2>
            <p className="mt-3 text-texto-suave t-corpo">
              Um e-mail quando sai artigo novo. Você confirma a inscrição e
              cancela quando quiser.
            </p>
          </div>
          <Newsletter />
        </section>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Artigo: o texto numa coluna, o resto na margem.
// ---------------------------------------------------------------------------

function PaginaDoArtigo() {
  const artigo = ARTIGO_ABERTO;
  const relacionados = artigosDe(artigo.categoria)
    .filter((a) => a.slug !== artigo.slug)
    .slice(0, 3);

  return (
    <main className={COLUNA}>
      <span aria-hidden="true" className="blog-progresso" />

      <article className="grid gap-x-14 pt-10 lg:grid-cols-[13rem_minmax(0,42.5rem)] lg:pt-16">
        <header className="flex flex-col gap-5 lg:col-start-2">
          <Trilha artigo={artigo} esboco={E} />
          <h1 className="font-display text-[2.5rem] leading-[1.02] tracking-[-0.02em] text-balance sm:text-[3.5rem] lg:text-[4rem]">
            {artigo.titulo}
          </h1>
          <p className="font-display text-[1.5rem] italic leading-[1.35] text-texto-suave">
            {artigo.resumo}
          </p>
        </header>

        {/* A margem: no computador acompanha a leitura; no telefone vira o
            bloco de abertura, antes do texto. */}
        <aside className="mt-8 lg:col-start-1 lg:row-start-2 lg:mt-12">
          <div className="flex flex-col gap-8 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 lg:flex-col lg:items-start">
              <Avatar iniciais={artigo.autor.iniciais} />
              <p className="flex flex-col text-[0.875rem] leading-snug">
                <a
                  href="#autor"
                  className="font-medium underline decoration-transparent underline-offset-4 hover:decoration-ouro"
                >
                  {artigo.autor.nome}
                </a>
                <time
                  dateTime={artigo.data}
                  className="t-dado text-texto-fraco"
                >
                  {dataCurta(artigo.data)}
                </time>
                <span className="t-dado text-texto-fraco">
                  {artigo.minutos} min de leitura
                </span>
              </p>
            </div>
            <div className="max-lg:hidden">
              <IndiceDoDocumento itens={SUMARIO} rotulo="Sumário" />
            </div>
            <Ouvir minutos={artigo.minutos} musica={CITADOS.musica} empilhado />
            <div className="max-lg:hidden">
              <Acoes curtidas={86} empilhado />
            </div>
          </div>
        </aside>

        <div className="mt-8 flex min-w-0 flex-col gap-12 lg:col-start-2 lg:row-start-2 lg:mt-12">
          <div className="flex flex-col gap-8">
            <figure>
              <Capa
                src={artigo.capa}
                alt={artigo.alt}
                inicial={artigo.titulo.charAt(0)}
                foco={artigo.foco}
                sizes="(min-width: 768px) 680px, 100vw"
                prioridade
                className="aspect-[3/2] rounded-card"
              />
              <figcaption className="t-legenda mt-2.5">
                {artigo.credito}
              </figcaption>
            </figure>
            <SumarioRecolhido className="lg:hidden" />
            <Corpo blocos={CORPO} capitular />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-5">
            <Tags tags={artigo.tags} esboco={E} />
            <div className="lg:hidden">
              <Acoes curtidas={86} />
            </div>
          </div>

          {/* O "Neste artigo" como nota de rodapé: uma lista só, sem retrato. */}
          <section aria-labelledby="citados-b">
            <h2 id="citados-b" className="t-subtitulo">
              Citados neste artigo
            </h2>
            <ul className="mt-2">
              {CITADOS.compositores.map((c) => (
                <li key={c.id} className="border-b border-linha">
                  <CompositorCitado compositor={c} retrato={false} />
                </li>
              ))}
              {CITADOS.obras.map((o) => (
                <li key={o.id} className="border-b border-linha">
                  <ObraCitada obra={o} />
                </li>
              ))}
              <li>
                <PartituraCitada />
              </li>
            </ul>
          </section>

          <CaixaDoAutor autor={artigo.autor} esboco={E} />

          <section
            aria-labelledby="newsletter-artigo-b"
            className="flex flex-col gap-4"
          >
            <div>
              <h2 id="newsletter-artigo-b" className="t-subtitulo">
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
      </article>

      <section aria-labelledby="relacionados-b" className="mt-20">
        <TituloDeSecao
          id="relacionados-b"
          href={rota(E, 'lista', artigo.categoria)}
          rotuloDoLink="Ver a categoria"
        >
          Mais em {categoriaDe(artigo.categoria).nome}
        </TituloDeSecao>
        <div className="mt-6">
          <Indice artigos={relacionados} />
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Lista
// ---------------------------------------------------------------------------

function Lista({ categoria }: { categoria?: string }) {
  const atual = categoria ? categoriaDe(categoria) : undefined;
  const artigos = artigosDe(atual?.slug);

  return (
    <main className={COLUNA}>
      <header className="flex flex-col gap-4 pb-12 pt-12 lg:pt-16">
        <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-[-0.02em] sm:text-[4rem]">
          {atual ? atual.nome : 'Todos os artigos'}
        </h1>
        <p className="max-w-[48ch] text-[1.25rem] leading-[1.5] text-texto-suave">
          {atual
            ? atual.descricao
            : 'Artigos, análises e histórias sobre música clássica.'}
        </p>
        <Categorias esboco={E} atual={atual?.slug} className="pt-3" />
      </header>

      <Indice artigos={artigos} />
      <div className="mt-2">
        <Paginacao esboco={E} />
      </div>
    </main>
  );
}
