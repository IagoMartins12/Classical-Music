import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  PiArrowRight,
  PiCaretRight,
  PiDownloadSimple,
  PiHeart,
  PiRss,
} from 'react-icons/pi';
import { GiGrandPiano } from 'react-icons/gi';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import {
  CATEGORIAS,
  CITADOS,
  COMENTARIOS,
  ESBOCOS,
  SUMARIO,
  VISTAS,
  categoriaDe,
  dataCurta,
  diaDoMes,
  mesCurto,
  rota,
  type Artigo,
  type Autor,
  type Bloco,
  type Concerto,
  type EsbocoId,
  type Vista,
} from './dados';
import { Capa, Comentar } from './ilhas';

/**
 * Peças comuns aos três esboços, todas de servidor. O que muda entre eles é a
 * casca e a composição de cada página; o vocabulário (a linha de dados do
 * artigo, o corpo, a capa com reserva, a agenda) é um só, como seria no blog
 * de verdade.
 */

/** A largura de catálogo, com o recuo lateral de cada faixa de tela. */
export const PAGINA = 'mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10';

/** Link de texto do blog: dourado, com o sublinhado que firma ao passar. */
export const LINK =
  'inline-flex min-h-6 items-center gap-1.5 font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[5px] transition-colors duration-[var(--t-toque)] hover:decoration-ouro';

// ---------------------------------------------------------------------------
// A linha de dados do artigo: categoria, data, tempo de leitura. A categoria
// não tem cor nem emoji — é texto, e o ouro diz que é link.
// ---------------------------------------------------------------------------

export function Meta({
  artigo,
  esboco,
  sobreFoto = false,
  comAutor = false,
  className,
}: {
  artigo: Artigo;
  esboco: EsbocoId;
  /** Sobre a capa: as cores não mudam com o tema, como a foto. */
  sobreFoto?: boolean;
  comAutor?: boolean;
  className?: string;
}) {
  const categoria = categoriaDe(artigo.categoria);

  return (
    <p
      className={cx(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] leading-6',
        sobreFoto ? 'text-sobre-foto/85' : 'text-texto-fraco',
        className
      )}
    >
      <Link
        href={rota(esboco, 'lista', categoria.slug)}
        className={cx(
          // Acima do `::after` do título, que cobre o card inteiro.
          'relative z-elevado font-medium underline decoration-transparent underline-offset-4 transition-colors duration-[var(--t-toque)] hover:decoration-current',
          sobreFoto ? 'text-ouro' : 'text-ouro-texto'
        )}
      >
        {categoria.nome}
      </Link>
      <time dateTime={artigo.data} className="t-dado">
        {dataCurta(artigo.data)}
      </time>
      <span className="t-dado">{artigo.minutos} min</span>
      {comAutor && <span>{artigo.autor.nome}</span>}
    </p>
  );
}

/** O título de um artigo numa lista: o link que cobre o card inteiro. */
export function TituloLink({
  artigo,
  esboco,
  as: Tag = 'h3',
  className,
}: {
  artigo: Artigo;
  esboco: EsbocoId;
  as?: 'h2' | 'h3';
  className?: string;
}) {
  return (
    <Tag className={cx('font-display text-balance', className)}>
      <Link href={rota(esboco, 'artigo')} className="blog-titulo-link">
        {artigo.titulo}
      </Link>
    </Tag>
  );
}

/** As iniciais de quem escreve: não há foto de perfil obrigatória. */
export function Avatar({
  iniciais,
  grande = false,
}: {
  iniciais: string;
  grande?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid shrink-0 place-items-center rounded-full bg-sup-2 font-display text-ouro-texto',
        grande ? 'h-14 w-14 text-xl' : 'h-10 w-10 text-base'
      )}
    >
      {iniciais}
    </span>
  );
}

/** Quem escreveu, quando e quanto tempo leva. */
export function Assinatura({
  artigo,
  sobreFoto = false,
}: {
  artigo: Artigo;
  sobreFoto?: boolean;
}) {
  return (
    <Inline gap={3}>
      <Avatar iniciais={artigo.autor.iniciais} />
      <span className="flex flex-col">
        <a
          href="#autor"
          className={cx(
            'text-[0.9375rem] font-medium underline decoration-transparent underline-offset-4 hover:decoration-ouro',
            sobreFoto ? 'text-sobre-foto' : 'text-texto'
          )}
        >
          {artigo.autor.nome}
        </a>
        <span className="flex gap-3 text-[0.8125rem] text-texto-fraco">
          <time dateTime={artigo.data} className="t-dado">
            {dataCurta(artigo.data)}
          </time>
          <span className="t-dado">{artigo.minutos} min de leitura</span>
        </span>
      </span>
    </Inline>
  );
}

// ---------------------------------------------------------------------------
// Trilha: Blog › Categoria. É a mesma que vai no dado estruturado
// (`BreadcrumbList`).
// ---------------------------------------------------------------------------

export function Trilha({
  artigo,
  esboco,
  sobreFoto = false,
}: {
  artigo: Artigo;
  esboco: EsbocoId;
  sobreFoto?: boolean;
}) {
  const categoria = categoriaDe(artigo.categoria);
  const cor = sobreFoto
    ? 'text-sobre-foto/85 hover:text-sobre-foto'
    : 'text-texto-fraco hover:text-texto';

  return (
    <nav aria-label="Trilha">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
        <li>
          <Link href={rota(esboco)} className={cx('min-h-6 py-1', cor)}>
            Blog
          </Link>
        </li>
        <li className="flex items-center gap-1.5">
          <Icon
            de={PiCaretRight}
            tamanho="pp"
            className={sobreFoto ? 'text-sobre-foto/60' : 'text-texto-fraco'}
          />
          <Link
            href={rota(esboco, 'lista', categoria.slug)}
            className={cx('min-h-6 py-1', cor)}
          >
            {categoria.nome}
          </Link>
        </li>
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// O corpo do artigo, renderizado no servidor. Hoje o `ArticleContent` monta o
// texto no navegador com `innerHTML`: o robô não o lê. Aqui cada bloco do
// editor vira um elemento de verdade, e os `h2` ganham o id do sumário.
// ---------------------------------------------------------------------------

export function Corpo({
  blocos,
  capitular = false,
}: {
  blocos: Bloco[];
  capitular?: boolean;
}) {
  return (
    <div className={cx('blog-corpo', capitular && 'blog-capitular')}>
      {blocos.map((bloco, i) => {
        switch (bloco.tipo) {
          case 'p':
            return <p key={i}>{bloco.texto}</p>;
          case 'h2':
            return (
              <h2 key={i} id={bloco.id}>
                {bloco.texto}
              </h2>
            );
          case 'lista':
            return (
              <ul key={i}>
                {bloco.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case 'citacao':
            return (
              <blockquote key={i}>
                <p lang="la">{bloco.texto}</p>
                <footer>{bloco.fonte}</footer>
              </blockquote>
            );
          case 'figura':
            return (
              <figure key={i}>
                <Capa
                  src={bloco.src}
                  alt={bloco.alt}
                  inicial="B"
                  foco={bloco.foco}
                  sizes="(min-width: 768px) 720px, 100vw"
                  className="aspect-[3/2] rounded-card"
                />
                <figcaption>{bloco.legenda}</figcaption>
              </figure>
            );
        }
      })}
    </div>
  );
}

/** O sumário no telefone: recolhido, antes do texto. */
export function SumarioRecolhido({ className }: { className?: string }) {
  return (
    <details className={cx('rounded-card bg-sup-2 px-4', className)}>
      <summary className="flex min-h-[var(--alvo)] cursor-pointer items-center justify-between text-[0.9375rem] font-medium">
        Sumário
        <span className="t-legenda t-dado">{SUMARIO.length} seções</span>
      </summary>
      <ol className="flex flex-col pb-3">
        {SUMARIO.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-[var(--alvo)] items-center gap-3 text-[0.9375rem] text-texto-suave"
            >
              <span className="t-dado text-texto-fraco">{item.numero}.</span>
              {item.titulo}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Tags e autor: hoje os dois links levam a páginas que não existem
// (`/blog/tag/...`, `/autor/...`). No blog novo, as duas páginas nascem.
// ---------------------------------------------------------------------------

export function Tags({ tags, esboco }: { tags: string[]; esboco: EsbocoId }) {
  return (
    <ul aria-label="Assuntos do artigo" className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={rota(esboco, 'lista')}
            className="inline-flex min-h-9 items-center rounded-full border border-linha-forte px-3.5 text-sm text-texto-suave transition-[border-color,color] duration-[var(--t-resposta)] ease-saida hover:border-ouro/45 hover:text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CaixaDoAutor({
  autor,
  esboco,
}: {
  autor: Autor;
  esboco: EsbocoId;
}) {
  return (
    <section
      id="autor"
      aria-label="Sobre quem escreveu"
      className="flex scroll-mt-28 gap-4 rounded-card bg-sup-2 p-5 sm:p-6"
    >
      <Avatar iniciais={autor.iniciais} grande />
      <Stack gap={2}>
        <div>
          <h2 className="font-display text-2xl leading-tight">{autor.nome}</h2>
          <Text papel="legenda" as="p">
            {autor.papel}
          </Text>
        </div>
        <Text papel="rotulo" tom="suave" as="p" className="max-w-[52ch]">
          {autor.bio}
        </Text>
        <Link href={rota(esboco, 'lista')} className={LINK}>
          Todos os artigos de {autor.nome.split(' ')[0]}
          <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      </Stack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// "Neste artigo": o que o texto cita da enciclopédia. O dado já existe em
// todo artigo (`composerIds`, `workIds`, `scoreIds`) e nunca apareceu na tela.
// Cada esboço compõe estas três peças do seu jeito.
// ---------------------------------------------------------------------------

export function CompositorCitado({
  compositor,
  retrato = true,
}: {
  compositor: (typeof CITADOS.compositores)[number];
  retrato?: boolean;
}) {
  return (
    <Link
      href={`/composer/${compositor.id}`}
      className="group/cit flex min-h-[var(--alvo)] items-center gap-3.5 rounded-controle py-2"
    >
      {retrato &&
        (compositor.retrato ? (
          <Capa
            src={compositor.retrato}
            alt=""
            inicial={compositor.iniciais.charAt(0)}
            foco={compositor.foco}
            sizes="56px"
            className="h-14 w-14 shrink-0 rounded-controle"
          />
        ) : (
          // Sem retrato, as iniciais: a pauta não se lê em 56px.
          <span
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-controle bg-sup-2 font-display text-xl text-ouro-texto"
          >
            {compositor.iniciais}
          </span>
        ))}
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-xl leading-tight underline decoration-transparent underline-offset-4 transition-colors duration-[var(--t-toque)] group-hover/cit:decoration-ouro">
          {compositor.nome}
        </span>
        <span className="t-legenda flex gap-2.5">
          <span className="t-dado">{compositor.anos}</span>
          {compositor.epoca}
        </span>
      </span>
    </Link>
  );
}

export function ObraCitada({ obra }: { obra: (typeof CITADOS.obras)[number] }) {
  return (
    <Link
      href={`/works/${obra.id}`}
      className="group/cit flex min-h-[var(--alvo)] items-baseline justify-between gap-4 py-2.5"
    >
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-xl leading-tight underline decoration-transparent underline-offset-4 transition-colors duration-[var(--t-toque)] group-hover/cit:decoration-ouro">
          {obra.titulo}
        </span>
        <span className="t-legenda">
          {obra.autor}, {obra.ano}
        </span>
      </span>
      <span className="t-dado shrink-0 text-[0.8125rem] text-texto-suave">
        {obra.catalogo}
      </span>
    </Link>
  );
}

export function PartituraCitada() {
  return (
    <Link
      href="/works/bwv-1079"
      className="group/cit flex min-h-[var(--alvo)] items-center gap-3 py-2.5"
    >
      <Icon de={PiDownloadSimple} tamanho="m" className="text-ouro-texto" />
      <span className="flex min-w-0 flex-col">
        <span className="text-[0.9375rem] font-medium underline decoration-transparent underline-offset-4 group-hover/cit:decoration-ouro">
          {CITADOS.partitura.titulo}
        </span>
        <span className="t-legenda">{CITADOS.partitura.detalhe}</span>
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Comentários.
// ---------------------------------------------------------------------------

export function Comentarios({ total }: { total: number }) {
  return (
    <section aria-labelledby="comentarios" className="flex flex-col gap-6">
      <h2 id="comentarios" className="flex items-baseline gap-3 t-subtitulo">
        Comentários
        <span className="t-dado text-base text-texto-fraco">{total}</span>
      </h2>
      <Comentar />
      <ul>
        {COMENTARIOS.map((c) => (
          <li key={c.id} className="flex gap-3.5 border-t border-linha py-5">
            <Avatar iniciais={c.iniciais} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="flex flex-wrap items-baseline gap-x-3 text-[0.9375rem]">
                <span className="font-medium">{c.nome}</span>
                <span className="t-legenda">{c.quando}</span>
              </p>
              <p className="t-corpo text-texto-suave">{c.texto}</p>
              <p className="flex items-center gap-4 text-[0.8125rem] text-texto-fraco">
                <span className="inline-flex items-center gap-1.5">
                  <Icon de={PiHeart} tamanho="pp" />
                  <span className="t-dado">{c.curtidas}</span>
                </span>
                <span>Responder</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Agenda: a data como dado (mono), o programa como título.
// ---------------------------------------------------------------------------

/** O dia e o mês de um concerto, empilhados. */
export function DataDoConcerto({
  concerto,
  className,
}: {
  concerto: Concerto;
  className?: string;
}) {
  return (
    <time
      dateTime={concerto.data}
      className={cx('flex flex-col leading-none', className)}
    >
      <span className="font-display text-[2rem] leading-none">
        {diaDoMes(concerto.data)}
      </span>
      <span className="t-dado mt-1 text-[0.8125rem] text-texto-fraco">
        {mesCurto(concerto.data)}
      </span>
    </time>
  );
}

// ---------------------------------------------------------------------------
// Filtro por categoria, como links: cada categoria é um endereço.
// ---------------------------------------------------------------------------

export function Categorias({
  esboco,
  atual,
  className,
}: {
  esboco: EsbocoId;
  /** `undefined` é "Todos". */
  atual?: string;
  className?: string;
}) {
  const itens = [
    { slug: undefined as string | undefined, nome: 'Todos' },
    ...CATEGORIAS,
  ];

  return (
    <nav aria-label="Categorias" className={className}>
      <ul className="flex flex-wrap gap-2">
        {itens.map((item) => {
          const ativo = item.slug === atual;
          return (
            <li key={item.nome}>
              <Link
                href={rota(esboco, 'lista', item.slug)}
                aria-current={ativo ? 'page' : undefined}
                className={cx(
                  'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm transition-[border-color,color] duration-[var(--t-resposta)] ease-saida [@media(pointer:coarse)]:min-h-[var(--alvo)]',
                  ativo
                    ? 'border-ouro/50 tint-ouro font-medium text-ouro-na-tinta'
                    : 'border-linha-forte text-texto-suave hover:border-ouro/45 hover:text-ouro-texto'
                )}
              >
                {item.nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Paginacao({ esboco }: { esboco: EsbocoId }) {
  return (
    <nav
      aria-label="Páginas"
      className="flex items-center justify-between border-t border-linha pt-6"
    >
      <span className="text-[0.9375rem] text-texto-fraco">Anterior</span>
      <Text papel="legenda" as="p">
        Página <span className="t-dado">1</span> de{' '}
        <span className="t-dado">3</span>
      </Text>
      <Link href={rota(esboco, 'lista')} className={LINK}>
        Próxima
        <Icon de={PiArrowRight} tamanho="pp" />
      </Link>
    </nav>
  );
}

/** Título de seção com o link "ver todos" na mesma linha. */
export function TituloDeSecao({
  children,
  href,
  rotuloDoLink,
  id,
}: {
  children: ReactNode;
  href?: string;
  rotuloDoLink?: string;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h2 id={id} className="t-titulo">
        {children}
      </h2>
      {href && (
        <Link href={href} className={LINK}>
          {rotuloDoLink}
          <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rodapé. No blog de verdade é o `Footer` do site; aqui, o mínimo para a
// página terminar: os links do blog, o RSS e os dois idiomas.
// ---------------------------------------------------------------------------

export function Rodape({ esboco }: { esboco: EsbocoId }) {
  const colunas = [
    {
      titulo: 'Blog',
      links: ['Artigos', 'Categorias', 'Agenda de concertos'],
    },
    {
      titulo: 'Enciclopédia',
      links: ['Compositores', 'Obras', 'História da música'],
    },
    { titulo: 'Sua conta', links: ['Artigos salvos', 'Artigos curtidos'] },
  ];

  return (
    <footer className="mt-24 border-t border-linha">
      <div
        className={cx(
          PAGINA,
          'grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]'
        )}
      >
        <Stack gap={3}>
          <Inline gap={2}>
            <GiGrandPiano className="h-6 w-6 text-ouro" aria-hidden="true" />
            <span className="font-display text-xl">Opus Atlas</span>
          </Inline>
          <Text papel="rotulo" tom="suave" as="p" className="max-w-[36ch]">
            Enciclopédia de música clássica, lugar de estudo e de ensino.
          </Text>
          <Link href={rota(esboco)} className={LINK}>
            <Icon de={PiRss} tamanho="pp" />
            Assinar por RSS
          </Link>
        </Stack>
        {colunas.map((coluna) => (
          <Stack gap={2} key={coluna.titulo}>
            <h2 className="text-sm font-semibold">{coluna.titulo}</h2>
            <ul className="flex flex-col">
              {coluna.links.map((link) => (
                <li key={link}>
                  <Link
                    href={rota(esboco, 'lista')}
                    className="flex min-h-9 items-center text-sm text-texto-suave hover:text-texto"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </Stack>
        ))}
      </div>
      <div
        className={cx(
          PAGINA,
          'flex flex-wrap justify-between gap-3 pb-28 pt-2'
        )}
      >
        <Text papel="legenda" as="p">
          © 2026 Opus Atlas
        </Text>
        <p className="t-legenda flex gap-4">
          <span aria-current="true">Português</span>
          <span className="text-texto-suave">English</span>
        </p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Troca entre esboços e entre vistas. Ferramenta de quem compara, não parte
// da proposta.
// ---------------------------------------------------------------------------

export function BarraDoEsboco({
  esboco,
  vista,
}: {
  esboco: EsbocoId;
  vista: Vista;
}) {
  return (
    <nav
      aria-label="Trocar de esboço"
      className="sup-alta fixed bottom-4 left-1/2 z-aviso flex -translate-x-1/2 items-center gap-1 !rounded-full p-1 text-sm"
    >
      <Link
        href="/esbocos-blog"
        className="px-3 py-1.5 text-texto-fraco hover:text-texto max-sm:hidden"
      >
        Esboços
      </Link>
      {ESBOCOS.map((e) => (
        <Link
          key={e}
          href={rota(e, vista)}
          aria-current={e === esboco ? 'true' : undefined}
          aria-label={`Esboço ${e.toUpperCase()}`}
          className={cx(
            'grid h-8 w-8 place-items-center rounded-full font-medium uppercase',
            e === esboco
              ? 'fill-ouro text-sobre-ouro'
              : 'text-texto-suave hover:text-texto'
          )}
        >
          {e}
        </Link>
      ))}
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-linha-forte" />
      {VISTAS.map((v) => (
        <Link
          key={v.id}
          href={rota(esboco, v.id)}
          aria-current={v.id === vista ? 'page' : undefined}
          className={cx(
            'rounded-full px-2.5 py-1.5 sm:px-3',
            v.id === vista
              ? 'bg-sup-2 font-medium text-texto'
              : 'text-texto-suave hover:text-texto'
          )}
        >
          {v.rotulo}
        </Link>
      ))}
    </nav>
  );
}
