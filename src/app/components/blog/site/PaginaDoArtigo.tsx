import type { CSSProperties } from 'react';
import Link from 'next/link';
import { PiArrowRight, PiDownloadSimple } from 'react-icons/pi';
import { IndiceDoDocumento } from '@/app/components/ui/IndiceDoDocumento';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { nomeDeArtigo } from '@/app/components/ui/nomeDeArtigo';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import type {
  ArtigoCompleto,
  ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import { dataCurta, dataLonga } from '@/app/utils/blog/formatos';
import { absoluto, rotasDoBlog } from '@/app/utils/blog/rotas';
import { jsonLdDaTrilha, jsonLdDoArtigo } from '@/app/utils/blog/seo';
import { titulosDoArtigo } from '@/app/utils/blog/tiptap';
import { AdminDoArtigo } from './AdminDoArtigo';
import { Capa } from './Capa';
import { Cartao, VEU } from './cartoes';
import { Comentarios } from './Comentarios';
import { CorpoDoArtigo } from './CorpoDoArtigo';
import { AcoesDoArtigo, ContadorDeLeitura, Newsletter } from './interacoes';
import { Avatar, JsonLd, LINK, TituloDeSecao, Trilha } from './pecas';
import { PlayerDoArtigo } from './PlayerDoArtigo';

/**
 * A página do artigo (escolha de 30/09/2026).
 *
 * **Computador: o esboço C.** A capa abre a página de ponta a ponta com o
 * título por cima; o texto corre numa coluna de 720px e a lateral mostra o
 * que o artigo cita da enciclopédia, com retrato, e o sumário.
 * **Telefone: o esboço A.** O título vem antes da capa, no fundo da página;
 * o sumário fica recolhido antes do texto; o "Neste artigo" vem depois.
 * As duas composições saem do mesmo HTML.
 *
 * Estática (ISR): nada aqui lê sessão. Curtir, salvar, comentar, contar a
 * visita e o que é de administrador decidem no navegador.
 */
export function PaginaDoArtigo({
  artigo,
  idioma,
  maisDaCategoria,
  previa = false,
}: {
  artigo: ArtigoCompleto;
  idioma: Idioma;
  /** Os artigos da mesma categoria (o "Continue lendo"). */
  maisDaCategoria: ResumoDeArtigo[];
  previa?: boolean;
}) {
  const t = BLOG[idioma];
  const titulos = titulosDoArtigo(artigo.conteudo);
  const sumario = titulos
    .filter((s) => s.nivel === 2)
    .map((s, i) => ({ id: s.id, numero: i + 1, titulo: s.texto }));
  const url = absoluto(rotasDoBlog.artigo(artigo.slug, artigo.idiomaDoTexto));
  const lingua = artigo.idiomaDoTexto === 'en' ? 'en' : 'pt-BR';

  const trilha = [
    { nome: t.nav.blog, href: rotasDoBlog.inicio(idioma) },
    ...(artigo.categoria
      ? [
          {
            nome: artigo.categoria.nome,
            href: rotasDoBlog.categoria(artigo.categoria.slug, idioma),
          },
        ]
      : []),
  ];

  const citados =
    artigo.compositores.length + artigo.obras.length + artigo.partituras.length;

  const continue_ = maisDaCategoria.length ? maisDaCategoria : null;

  return (
    <>
      {!previa && (
        <>
          <JsonLd dados={jsonLdDoArtigo(artigo)} />
          <JsonLd
            dados={jsonLdDaTrilha([
              ...trilha.map((p) => ({ nome: p.nome, caminho: p.href })),
              {
                nome: artigo.titulo,
                caminho: rotasDoBlog.artigo(artigo.slug, idioma),
              },
            ])}
          />
        </>
      )}
      <span aria-hidden="true" className="blog-progresso" />
      <ContadorDeLeitura
        artigoId={artigo.id}
        fimId="fim-do-texto"
        desligado={previa}
      />

      {previa && (
        <p
          role="status"
          className="bg-sup-2 px-4 py-3 text-center t-rotulo text-texto-suave"
        >
          {t.artigo.previa}
        </p>
      )}

      <article>
        <header className="mx-auto w-full max-w-[1360px] lg:px-10 lg:pt-6">
          <div
            className="relative isolate flex flex-col lg:h-[min(70dvh,640px)] lg:min-h-[26rem] lg:justify-end lg:overflow-hidden lg:rounded-card"
            style={
              {
                // O card clicado (lista, início) vira esta caixa.
                viewTransitionName: nomeDeArtigo(artigo.slug),
                viewTransitionClass: 'cartao',
              } as CSSProperties
            }
          >
            <Capa
              src={artigo.capa}
              alt={artigo.capaAlt || artigo.titulo}
              inicial={artigo.titulo}
              sizes="(min-width: 1360px) 1280px, 100vw"
              prioridade
              className="order-2 mx-4 aspect-[16/10] rounded-card sm:mx-6 lg:absolute lg:inset-0 lg:order-none lg:mx-0 lg:aspect-auto lg:rounded-none"
            />
            <span aria-hidden="true" className={cx(VEU, 'hidden lg:block')} />
            <div className="relative order-1 flex flex-col gap-5 px-4 pb-8 pt-8 sm:px-6 lg:order-none lg:max-w-[56rem] lg:p-12">
              <Trilha passos={trilha} idioma={idioma} sobreFoto />
              <h1
                lang={lingua}
                className="font-display text-[2.375rem] leading-[1.03] tracking-[-0.015em] text-balance sm:text-[3.25rem] lg:text-[3.5rem] lg:text-sobre-foto xl:text-[4rem]"
              >
                {artigo.titulo}
              </h1>
              {artigo.resumo && (
                <p
                  lang={lingua}
                  className="max-w-[52ch] text-[1.125rem] leading-[1.5] text-texto-suave sm:text-[1.25rem] lg:text-sobre-foto/85"
                >
                  {artigo.resumo}
                </p>
              )}
            </div>
          </div>
          {artigo.creditoDaCapa && (
            <p className="t-legenda mt-2.5 px-4 sm:px-6 lg:px-0">
              <span className="sr-only">{t.artigo.creditoCapa}: </span>
              {artigo.creditoDaCapa}
            </p>
          )}
        </header>

        <div className="mx-auto mt-8 grid w-full max-w-[1360px] gap-y-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-x-12 lg:px-10 xl:grid-cols-[minmax(0,var(--largura-texto))_22rem] xl:justify-between xl:pl-[5.5rem]">
          {/* O texto */}
          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-linha pb-6">
              <div className="flex items-center gap-3">
                <Link
                  href={rotasDoBlog.autor(artigo.autor.usuario, idioma)}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="shrink-0 rounded-full"
                >
                  <Avatar autor={artigo.autor} />
                </Link>
                <span className="flex flex-col">
                  <Link
                    href={rotasDoBlog.autor(artigo.autor.usuario, idioma)}
                    rel="author"
                    className="text-[0.9375rem] font-medium underline decoration-transparent underline-offset-4 hover:decoration-ouro"
                  >
                    {artigo.autor.nome}
                  </Link>
                  <span className="flex flex-wrap gap-x-3 text-[0.8125rem] text-texto-fraco">
                    {artigo.publicadoEm && (
                      <time dateTime={artigo.publicadoEm} className="t-dado">
                        {dataCurta(artigo.publicadoEm, idioma)}
                      </time>
                    )}
                    <span className="t-dado">
                      {t.artigo.minutos(artigo.minutos)}
                    </span>
                    {idioma !== artigo.idiomaDoTexto && (
                      <span>
                        {artigo.idiomaDoTexto === 'pt'
                          ? t.artigo.textoEmPortugues
                          : t.artigo.textoEmIngles}
                      </span>
                    )}
                  </span>
                </span>
              </div>
              <PlayerDoArtigo
                idioma={idioma}
                artigo={{
                  id: artigo.id,
                  titulo: artigo.titulo,
                  autor: artigo.autor.nome,
                  capa: artigo.capa,
                }}
                narracao={artigo.narracao}
                musica={artigo.musica}
                minutos={artigo.minutos}
              />
              <AdminDoArtigo
                idioma={idioma}
                artigoId={artigo.id}
                visitas={artigo.visitas}
              />
            </div>

            {sumario.length > 1 && (
              <details className="rounded-card bg-sup-2 px-4 lg:hidden">
                <summary className="flex min-h-[var(--alvo)] cursor-pointer items-center justify-between text-[0.9375rem] font-medium">
                  {t.artigo.sumario}
                  <span className="t-legenda t-dado">
                    {t.artigo.secoes(sumario.length)}
                  </span>
                </summary>
                <ol className="flex flex-col pb-3">
                  {sumario.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex min-h-[var(--alvo)] items-center gap-3 text-[0.9375rem] text-texto-suave"
                      >
                        <span className="t-dado text-texto-fraco">
                          {s.numero}.
                        </span>
                        {s.titulo}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <CorpoDoArtigo
              conteudo={artigo.conteudo}
              idioma={idioma}
              lang={lingua}
            />
            <span id="fim-do-texto" aria-hidden="true" />

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-5">
              {artigo.tags.length > 0 && (
                <ul
                  aria-label={t.artigo.assuntos}
                  className="flex flex-wrap gap-2"
                >
                  {artigo.tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={rotasDoBlog.tag(tag.slug, idioma)}
                        rel="tag"
                        className="inline-flex min-h-9 items-center rounded-full border border-linha-forte px-3.5 text-sm text-texto-suave transition-[border-color,color] duration-[var(--t-resposta)] ease-saida hover:border-ouro/45 hover:text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
                      >
                        {tag.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {!previa && (
                <AcoesDoArtigo
                  idioma={idioma}
                  artigoId={artigo.id}
                  titulo={artigo.titulo}
                  url={url}
                  capa={artigo.capa}
                  curtidasIniciais={artigo.curtidas}
                />
              )}
            </div>
          </div>

          {/* A lateral: o que o artigo cita, e o sumário */}
          <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="flex flex-col gap-10 lg:sticky lg:top-24">
              {citados > 0 && <NesteArtigo artigo={artigo} idioma={idioma} />}
              {sumario.length > 1 && (
                <div className="max-lg:hidden">
                  <IndiceDoDocumento
                    itens={sumario}
                    rotulo={t.artigo.sumario}
                  />
                </div>
              )}
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-12 lg:col-start-1">
            <section
              aria-labelledby="sobre-autor"
              className="flex gap-4 rounded-card bg-sup-2 p-5 sm:p-6"
            >
              <Link
                href={rotasDoBlog.autor(artigo.autor.usuario, idioma)}
                tabIndex={-1}
                aria-hidden="true"
                className="shrink-0 self-start rounded-full"
              >
                <Avatar autor={artigo.autor} tamanho="g" />
              </Link>
              <div className="flex min-w-0 flex-col gap-2">
                <div>
                  <p className="t-legenda">{t.artigo.sobreAutor}</p>
                  <h2
                    id="sobre-autor"
                    className="font-display text-2xl leading-tight"
                  >
                    <Link
                      href={rotasDoBlog.autor(artigo.autor.usuario, idioma)}
                      rel="author"
                      className="underline decoration-transparent underline-offset-4 hover:decoration-ouro"
                    >
                      {artigo.autor.nome}
                    </Link>
                  </h2>
                </div>
                <p className="t-rotulo max-w-[52ch] text-texto-suave">
                  {artigo.autor.bio || t.autor.semBio}
                </p>
                <Link
                  href={rotasDoBlog.autor(artigo.autor.usuario, idioma)}
                  className={LINK}
                >
                  {t.artigo.todosDoAutor(artigo.autor.nome.split(' ')[0])}
                  <Icon de={PiArrowRight} tamanho="pp" />
                </Link>
              </div>
            </section>

            {!previa && (
              <section
                aria-labelledby="newsletter-artigo"
                className="flex flex-col gap-4"
              >
                <div>
                  <h2 id="newsletter-artigo" className="t-subtitulo">
                    {t.newsletter.tituloArtigo}
                  </h2>
                  <p className="t-rotulo text-texto-suave">
                    {t.newsletter.textoCurto}
                  </p>
                </div>
                <Newsletter idioma={idioma} origem="blog-artigo" />
              </section>
            )}

            {!previa && (
              <Comentarios
                idioma={idioma}
                artigoId={artigo.id}
                total={artigo.comentarios}
              />
            )}
          </div>
        </div>

        {artigo.publicadoEm && artigo.atualizadoEm > artigo.publicadoEm && (
          <p className="sr-only">
            {t.artigo.atualizado} {dataLonga(artigo.atualizadoEm, idioma)}
          </p>
        )}
      </article>

      {continue_ && (
        <section
          aria-labelledby="continue-lendo"
          className="mx-auto mt-20 w-full max-w-[1360px] px-4 sm:px-6 lg:px-10"
        >
          <TituloDeSecao
            id="continue-lendo"
            href={
              artigo.categoria
                ? rotasDoBlog.categoria(artigo.categoria.slug, idioma)
                : rotasDoBlog.artigos(idioma)
            }
            rotuloDoLink={
              artigo.categoria
                ? t.artigo.maisEm(artigo.categoria.nome)
                : t.inicio.todos
            }
          >
            {t.artigo.continueLendo}
          </TituloDeSecao>
          <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {continue_.slice(0, 3).map((a) => (
              <Cartao key={a.id} artigo={a} idioma={idioma} comResumo />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** O que o artigo cita da enciclopédia — o dado que já existia e não aparecia. */
function NesteArtigo({
  artigo,
  idioma,
}: {
  artigo: ArtigoCompleto;
  idioma: Idioma;
}) {
  const t = BLOG[idioma].artigo;
  const linkDeNome =
    'underline decoration-transparent underline-offset-4 transition-colors duration-[var(--t-toque)] group-hover/cit:decoration-ouro';

  return (
    <section aria-labelledby="neste-artigo" className="sup-1 p-5">
      <h2 id="neste-artigo" className="t-secao">
        {t.nesteArtigo}
      </h2>
      <ul className="mt-2">
        {artigo.compositores.map((c) => (
          <li key={c.id} className="border-b border-linha py-1 last:border-b-0">
            <Link
              href={`/composer/${c.id}`}
              className="group/cit flex min-h-[var(--alvo)] items-center gap-3.5 py-2"
            >
              {c.retrato ? (
                <Capa
                  src={c.retrato}
                  alt=""
                  inicial={c.nome}
                  sizes="56px"
                  className="h-14 w-14 shrink-0 rounded-controle"
                />
              ) : (
                <Avatar autor={{ nome: c.nome, imagem: null }} tamanho="g" />
              )}
              <span className="flex min-w-0 flex-col">
                <span
                  className={cx(
                    'font-display text-xl leading-tight',
                    linkDeNome
                  )}
                >
                  {c.nome}
                </span>
                <span className="t-legenda flex flex-wrap gap-x-2.5">
                  {(c.nascimento || c.morte) && (
                    <span className="t-dado">
                      {[c.nascimento, c.morte]
                        .map((d) => d?.match(/\d{4}/)?.[0])
                        .filter(Boolean)
                        .join(' – ')}
                    </span>
                  )}
                  {c.epoca && <span>{c.epoca}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {artigo.obras.map((o) => (
          <li key={o.id} className="border-b border-linha last:border-b-0">
            <Link
              href={`/works/${o.id}`}
              className="group/cit flex min-h-[var(--alvo)] items-baseline justify-between gap-4 py-2.5"
            >
              <span className="flex min-w-0 flex-col">
                <span
                  className={cx(
                    'font-display text-xl leading-tight',
                    linkDeNome
                  )}
                >
                  {o.titulo}
                </span>
                <span className="t-legenda">{o.compositor.nome}</span>
              </span>
              {o.catalogo && (
                <span className="t-dado shrink-0 text-[0.8125rem] text-texto-suave">
                  {o.catalogo}
                </span>
              )}
            </Link>
          </li>
        ))}
        {artigo.partituras.map((p) => (
          <li key={p.id} className="border-b border-linha last:border-b-0">
            <a
              href={p.arquivo ?? `/works/${p.obra.id}#scores`}
              {...(p.arquivo
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="group/cit flex min-h-[var(--alvo)] items-center gap-3 py-2.5"
            >
              <Icon
                de={PiDownloadSimple}
                tamanho="m"
                className="text-ouro-texto"
              />
              <span className="flex min-w-0 flex-col">
                <span
                  className={cx('text-[0.9375rem] font-medium', linkDeNome)}
                >
                  {p.titulo}
                </span>
                <span className="t-legenda">
                  {[p.obra.titulo, p.obra.compositor]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </span>
              <span className="sr-only">{t.baixar}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
