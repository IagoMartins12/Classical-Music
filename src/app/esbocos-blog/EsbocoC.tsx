import Link from 'next/link';
import { IndiceDoDocumento } from '@/app/components/ui/IndiceDoDocumento';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
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
  milhar,
  rota,
  type Artigo,
  type Vista,
} from './dados';
import { AgendaC } from './agenda';
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
 * Esboço C — Atlas.
 *
 * O blog como galeria do acervo: a capa conduz. O topo é um mosaico com o
 * título sobre a imagem, os últimos correm numa prateleira, e cada assunto
 * tem a sua composição. No artigo, a capa abre a página de ponta a ponta e a
 * lateral mostra o que o texto cita da enciclopédia, com retrato.
 */

const E = 'c' as const;

/** O véu sob o título que fica por cima da capa. Igual nos dois temas. */
const VEU =
  'absolute inset-0 bg-gradient-to-t from-veu-foto from-[12%] via-veu-foto/55 via-[48%] to-transparent to-[85%]';

export function EsbocoC({
  vista,
  categoria,
}: {
  vista: Vista;
  categoria?: string;
}) {
  return (
    <div className="min-h-dvh bg-fundo text-texto">
      <Cabecalho esboco={E} forma="site" atual={vista} />
      {vista === 'inicio' && <Inicio />}
      {vista === 'artigo' && <PaginaDoArtigo />}
      {vista === 'lista' && <Lista categoria={categoria} />}
      {vista === 'agenda' && <AgendaC />}
      <Rodape esboco={E} />
      <BarraDoEsboco esboco={E} vista={vista} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// As duas formas de card do esboço.
// ---------------------------------------------------------------------------

/** O título sobre a capa: a peça do mosaico. */
function Peca({
  artigo,
  grande = false,
  prioridade = false,
  className,
}: {
  artigo: Artigo;
  grande?: boolean;
  prioridade?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cx(
        'relative isolate flex min-h-[17rem] items-end overflow-hidden rounded-card',
        className
      )}
    >
      <Capa
        src={artigo.capa}
        alt=""
        inicial={artigo.titulo.charAt(0)}
        foco={artigo.foco}
        sizes={
          grande
            ? '(min-width: 1024px) 760px, 100vw'
            : '(min-width: 1024px) 540px, 100vw'
        }
        prioridade={prioridade}
        preencher
      />
      <span aria-hidden="true" className={VEU} />
      <div
        className={cx(
          'relative flex flex-col gap-2.5 p-5 sm:p-6',
          grande && 'lg:max-w-[40rem] lg:gap-3.5 lg:p-9'
        )}
      >
        <Meta artigo={artigo} esboco={E} sobreFoto />
        <TituloLink
          artigo={artigo}
          esboco={E}
          as="h2"
          className={cx(
            'text-sobre-foto',
            grande
              ? 'text-[2rem] leading-[1.05] tracking-[-0.015em] sm:text-[2.5rem] lg:text-[3.25rem]'
              : 'text-[1.625rem] leading-[1.1] sm:text-[1.875rem]'
          )}
        />
        {grande && (
          <p className="max-w-[46ch] text-[1.0625rem] leading-[1.5] text-sobre-foto/85 max-sm:hidden">
            {artigo.resumo}
          </p>
        )}
      </div>
    </article>
  );
}

/** A capa em cima, o título embaixo. */
function Cartao({
  artigo,
  proporcao,
  sizes,
  comResumo = false,
  className,
}: {
  artigo: Artigo;
  proporcao: string;
  sizes: string;
  comResumo?: boolean;
  className?: string;
}) {
  return (
    <article className={cx('relative flex flex-col gap-3.5', className)}>
      <Capa
        src={artigo.capa}
        alt=""
        inicial={artigo.titulo.charAt(0)}
        foco={artigo.foco}
        sizes={sizes}
        className={cx(proporcao, 'rounded-card')}
      />
      <Stack gap={2}>
        <Meta artigo={artigo} esboco={E} />
        <TituloLink
          artigo={artigo}
          esboco={E}
          className="text-[1.5rem] leading-[1.14]"
        />
        {comResumo && (
          <p className="line-clamp-2 text-[0.9375rem] leading-[1.55] text-texto-suave">
            {artigo.resumo}
          </p>
        )}
      </Stack>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

function Inicio() {
  const [principal, segunda, , quarta] = ARTIGOS;
  const ultimos = ARTIGOS.slice(4, 12);
  const instrumentos = artigosDe('instrumentos');
  const compositores = artigosDe('compositores').slice(0, 4);

  return (
    <main>
      <h1 className="sr-only">
        Blog do Opus Atlas: artigos sobre música clássica
      </h1>

      {/* Mosaico: uma peça grande e duas ao lado. */}
      <section aria-label="Em destaque" className={cx(PAGINA, 'pt-4 lg:pt-6')}>
        <div className="entra grid gap-3 lg:h-[min(74dvh,660px)] lg:grid-cols-12 lg:grid-rows-2">
          <Peca
            artigo={principal}
            grande
            prioridade
            className="min-h-[24rem] lg:col-span-7 lg:row-span-2"
          />
          <Peca artigo={segunda} className="lg:col-span-5" />
          <Peca artigo={quarta} className="lg:col-span-5" />
        </div>
      </section>

      {/* Prateleira dos últimos: capas em pé, como as pinturas que são. */}
      <section aria-labelledby="ultimos-c" className="mt-20">
        <div className={PAGINA}>
          <TituloDeSecao
            id="ultimos-c"
            href={rota(E, 'lista')}
            rotuloDoLink="Todos os artigos"
          >
            Últimos artigos
          </TituloDeSecao>
        </div>
        <div
          role="region"
          aria-labelledby="ultimos-c"
          tabIndex={0}
          className="blog-prateleira mx-auto mt-6 max-w-[1360px] auto-cols-[minmax(15rem,17.5rem)] gap-5 px-4 pb-2 [scroll-padding-inline:1rem] sm:px-6 lg:px-10 lg:[scroll-padding-inline:2.5rem]"
        >
          {ultimos.map((artigo) => (
            <Cartao
              key={artigo.slug}
              artigo={artigo}
              proporcao="aspect-[4/5]"
              sizes="280px"
            />
          ))}
        </div>
      </section>

      {/* Agenda: uma faixa rebaixada, quatro datas. */}
      <section
        id="agenda"
        aria-labelledby="agenda-c"
        className="mt-20 scroll-mt-20 bg-sup-2"
      >
        <div className={cx(PAGINA, 'py-12')}>
          <TituloDeSecao
            id="agenda-c"
            href={rota(E, 'agenda')}
            rotuloDoLink="Agenda completa"
          >
            Agenda de concertos
          </TituloDeSecao>
          <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {AGENDA.slice(0, 4).map((concerto) => (
              <li key={concerto.id} className="flex flex-col gap-3">
                <div className="flex items-end justify-between border-b border-linha-forte pb-3">
                  <DataDoConcerto concerto={concerto} />
                  <span className="t-dado text-[0.8125rem] text-texto-fraco">
                    {concerto.semana} {concerto.hora}
                  </span>
                </div>
                <p className="font-display text-[1.375rem] leading-snug">
                  {concerto.programa}
                </p>
                <p className="t-legenda">
                  {concerto.casa}, {concerto.cidade}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Instrumentos: uma capa larga e a lista ao lado. */}
      <section aria-labelledby="instrumentos-c" className={cx(PAGINA, 'mt-20')}>
        <TituloDeSecao
          id="instrumentos-c"
          href={rota(E, 'lista', 'instrumentos')}
          rotuloDoLink="Ver a categoria"
        >
          Instrumentos
        </TituloDeSecao>
        <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <Cartao
            artigo={instrumentos[0]}
            proporcao="aspect-[16/10]"
            sizes="(min-width: 1024px) 720px, 100vw"
            comResumo
            className="lg:col-span-7"
          />
          <ul className="lg:col-span-5">
            {instrumentos.slice(1).map((artigo) => (
              <li
                key={artigo.slug}
                className="relative grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-5 border-b border-linha py-6 first:pt-0 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
              >
                <Capa
                  src={artigo.capa}
                  alt=""
                  inicial={artigo.titulo.charAt(0)}
                  foco={artigo.foco}
                  sizes="176px"
                  className="aspect-[4/3] rounded-controle"
                />
                <Stack gap={2}>
                  <Meta artigo={artigo} esboco={E} />
                  <TituloLink
                    artigo={artigo}
                    esboco={E}
                    className="text-[1.375rem] leading-[1.15] sm:text-[1.625rem]"
                  />
                  <p className="line-clamp-2 text-[0.9375rem] leading-[1.55] text-texto-suave max-sm:hidden">
                    {artigo.resumo}
                  </p>
                </Stack>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Compositores: os retratos, em pé. */}
      <section aria-labelledby="compositores-c" className={cx(PAGINA, 'mt-20')}>
        <TituloDeSecao
          id="compositores-c"
          href={rota(E, 'lista', 'compositores')}
          rotuloDoLink="Ver a categoria"
        >
          Compositores
        </TituloDeSecao>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {compositores.map((artigo) => (
            <Cartao
              key={artigo.slug}
              artigo={artigo}
              proporcao="aspect-[3/4]"
              sizes="(min-width: 1024px) 300px, 50vw"
            />
          ))}
        </div>
      </section>

      <div
        className={cx(PAGINA, 'mt-24 grid gap-x-16 gap-y-14 lg:grid-cols-12')}
      >
        <section aria-labelledby="mais-lidos-c" className="lg:col-span-7">
          <h2 id="mais-lidos-c" className="t-titulo">
            Mais lidos
          </h2>
          <ol className="mt-4">
            {MAIS_LIDOS.map((artigo, i) => (
              <li
                key={artigo.slug}
                className="relative grid grid-cols-[2.25rem_4.5rem_minmax(0,1fr)] items-center gap-4 border-t border-linha py-4"
              >
                <span className="font-display text-[1.75rem] italic leading-none text-ouro-texto">
                  {i + 1}
                </span>
                <Capa
                  src={artigo.capa}
                  alt=""
                  inicial={artigo.titulo.charAt(0)}
                  foco={artigo.foco}
                  sizes="72px"
                  className="aspect-square rounded-controle"
                />
                <span className="flex flex-col gap-0.5">
                  <Link
                    href={rota(E, 'artigo')}
                    className="blog-titulo-link font-display text-[1.375rem] leading-snug"
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

        <section
          aria-labelledby="newsletter-c"
          className="sup-1 flex flex-col gap-5 self-start p-6 sm:p-8 lg:col-span-5"
        >
          <div>
            <h2 id="newsletter-c" className="t-titulo text-balance">
              Receba os artigos por e-mail
            </h2>
            <p className="mt-3 text-texto-suave t-corpo">
              Um e-mail quando sai artigo novo. Você confirma a inscrição e
              cancela quando quiser.
            </p>
          </div>
          <Newsletter className="sm:flex-col sm:items-stretch" />
        </section>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Artigo: a capa abre a página; a lateral liga o texto à enciclopédia.
// ---------------------------------------------------------------------------

function PaginaDoArtigo() {
  const artigo = ARTIGO_ABERTO;
  const relacionados = artigosDe(artigo.categoria)
    .filter((a) => a.slug !== artigo.slug)
    .slice(0, 3);

  return (
    <main>
      <span aria-hidden="true" className="blog-progresso" />

      <article>
        <header className="mx-auto w-full max-w-[1360px] lg:px-10 lg:pt-6">
          <div className="relative isolate flex h-[min(70dvh,640px)] min-h-[26rem] items-end overflow-hidden lg:rounded-card">
            <Capa
              src={artigo.capa}
              alt={artigo.alt}
              inicial={artigo.titulo.charAt(0)}
              foco={artigo.foco}
              sizes="(min-width: 1360px) 1280px, 100vw"
              prioridade
              preencher
            />
            <span aria-hidden="true" className={VEU} />
            <div className="relative flex w-full max-w-[56rem] flex-col gap-4 p-5 sm:p-8 lg:p-12">
              <Trilha artigo={artigo} esboco={E} sobreFoto />
              <h1 className="font-display text-[2.375rem] leading-[1.03] tracking-[-0.015em] text-balance text-sobre-foto sm:text-[3.25rem] lg:text-[4rem]">
                {artigo.titulo}
              </h1>
              <p className="max-w-[52ch] text-[1.125rem] leading-[1.5] text-sobre-foto/85 sm:text-[1.25rem]">
                {artigo.resumo}
              </p>
            </div>
          </div>
          <p className="t-legenda mt-2.5 max-lg:px-4 sm:max-lg:px-6">
            {artigo.credito}
          </p>
        </header>

        <div className="mx-auto mt-8 grid w-full max-w-[1360px] gap-x-16 gap-y-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-x-12 lg:px-10 xl:grid-cols-[minmax(0,var(--largura-texto))_22rem] xl:justify-between xl:pl-[5.5rem]">
          <div className="flex min-w-0 flex-col gap-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-linha pb-6">
                <Assinatura artigo={artigo} />
                <Ouvir minutos={artigo.minutos} musica={CITADOS.musica} />
              </div>
              <SumarioRecolhido className="lg:hidden" />
              <Corpo blocos={CORPO} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-5">
              <Tags tags={artigo.tags} esboco={E} />
              <Acoes curtidas={86} />
            </div>

            <CaixaDoAutor autor={artigo.autor} esboco={E} />

            <section
              aria-labelledby="newsletter-artigo-c"
              className="flex flex-col gap-4"
            >
              <div>
                <h2 id="newsletter-artigo-c" className="t-subtitulo">
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

          <aside>
            <div className="flex flex-col gap-10 lg:sticky lg:top-24">
              <section aria-labelledby="neste-artigo-c" className="sup-1 p-5">
                <h2 id="neste-artigo-c" className="t-secao">
                  Neste artigo
                </h2>
                <ul className="mt-2">
                  {CITADOS.compositores.map((c) => (
                    <li key={c.id} className="border-b border-linha py-1">
                      <CompositorCitado compositor={c} />
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
              <div className="max-lg:hidden">
                <IndiceDoDocumento itens={SUMARIO} rotulo="Sumário" />
              </div>
            </div>
          </aside>
        </div>
      </article>

      <section aria-labelledby="relacionados-c" className={cx(PAGINA, 'mt-20')}>
        <TituloDeSecao
          id="relacionados-c"
          href={rota(E, 'lista', artigo.categoria)}
          rotuloDoLink="Ver a categoria"
        >
          Mais em {categoriaDe(artigo.categoria).nome}
        </TituloDeSecao>
        <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {relacionados.map((a) => (
            <Cartao
              key={a.slug}
              artigo={a}
              proporcao="aspect-[3/2]"
              sizes="(min-width: 1024px) 420px, 100vw"
              comResumo
            />
          ))}
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Lista: a categoria abre com uma capa do acervo; os artigos em grade.
// ---------------------------------------------------------------------------

function Lista({ categoria }: { categoria?: string }) {
  const atual = categoria ? categoriaDe(categoria) : undefined;
  const artigos = artigosDe(atual?.slug);
  const abertura = artigos.find((a) => a.capa) ?? artigos[0];

  return (
    <main>
      <header className="mx-auto w-full max-w-[1360px] lg:px-10 lg:pt-6">
        <div className="relative isolate flex min-h-[17rem] items-end overflow-hidden lg:min-h-[20rem] lg:rounded-card">
          <Capa
            src={abertura.capa}
            alt=""
            inicial={(atual?.nome ?? 'T').charAt(0)}
            foco={abertura.foco}
            sizes="(min-width: 1360px) 1280px, 100vw"
            prioridade
            preencher
          />
          <span aria-hidden="true" className={VEU} />
          <div className="relative flex flex-col gap-3 p-5 sm:p-8 lg:p-12">
            <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] text-sobre-foto sm:text-[3.5rem]">
              {atual ? atual.nome : 'Todos os artigos'}
            </h1>
            <p className="max-w-[52ch] text-[1.125rem] leading-[1.5] text-sobre-foto/85">
              {atual
                ? atual.descricao
                : 'Artigos, análises e histórias sobre música clássica.'}
            </p>
          </div>
        </div>
      </header>

      <div className={cx(PAGINA, 'mt-8')}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Categorias esboco={E} atual={atual?.slug} />
          <Text papel="legenda" as="p">
            <span className="t-dado">{artigos.length}</span>{' '}
            {artigos.length === 1 ? 'artigo' : 'artigos'}
          </Text>
        </div>

        <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {artigos.map((artigo) => (
            <Cartao
              key={artigo.slug}
              artigo={artigo}
              proporcao="aspect-[3/2]"
              sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
              comResumo
            />
          ))}
        </div>

        <div className="mt-12">
          <Paginacao esboco={E} />
        </div>
      </div>
    </main>
  );
}
