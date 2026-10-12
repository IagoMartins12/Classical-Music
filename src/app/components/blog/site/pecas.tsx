import type { ReactNode } from 'react';
import Link from 'next/link';
import { FaixaQueRola } from './FaixaQueRola';
import { PiArrowLeft, PiArrowRight, PiCaretRight } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import type {
  AutorRef,
  CategoriaRef,
  Paginacao as PaginacaoDados,
  ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import { dataCurta } from '@/app/utils/blog/formatos';
import { rotasDoBlog } from '@/app/utils/blog/rotas';

/**
 * Peças pequenas do blog, todas de servidor: a linha de dados do artigo, o
 * título que é link do card inteiro, a trilha, a paginação.
 */

/** A largura das páginas do blog: a de catálogo, com o recuo de cada tela. */
export const PAGINA = 'mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10';

/** A largura do texto, para o que acompanha a coluna de leitura. */
export const COLUNA =
  'mx-auto w-full max-w-[var(--largura-conteudo)] px-4 sm:px-6 lg:px-10';

/** Link de texto do blog: dourado, com o sublinhado que firma ao passar. */
export const LINK =
  'inline-flex min-h-6 items-center gap-1.5 font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[5px] transition-colors duration-[var(--t-toque)] hover:decoration-ouro';

/**
 * A linha de dados do artigo: categoria, data, tempo de leitura. A
 * categoria não tem cor nem emoji (decisão de 30/09): é texto, e o ouro diz
 * que é link.
 */
export function Meta({
  artigo,
  idioma,
  sobreFoto = false,
  comAutor = false,
  className,
}: {
  artigo: Pick<
    ResumoDeArtigo,
    'categoria' | 'publicadoEm' | 'minutos' | 'autor'
  >;
  idioma: Idioma;
  /**
   * Sobre a capa: cores fixas, como a foto. `'lg'`: só no computador — no
   * telefone o texto sai de cima da foto (a composição do esboço A).
   */
  sobreFoto?: boolean | 'lg';
  comAutor?: boolean;
  className?: string;
}) {
  const t = BLOG[idioma].artigo;
  return (
    <p
      className={cx(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] leading-6',
        sobreFoto === true
          ? 'text-sobre-foto/85'
          : sobreFoto === 'lg'
            ? 'text-texto-fraco lg:text-sobre-foto/85'
            : 'text-texto-fraco',
        className
      )}
    >
      {artigo.categoria && (
        <CategoriaLink
          categoria={artigo.categoria}
          idioma={idioma}
          sobreFoto={sobreFoto}
        />
      )}
      {artigo.publicadoEm && (
        <time dateTime={artigo.publicadoEm} className="t-dado">
          {dataCurta(artigo.publicadoEm, idioma)}
        </time>
      )}
      <span className="t-dado">{t.minutosCurto(artigo.minutos)}</span>
      {comAutor && <span>{artigo.autor.nome}</span>}
    </p>
  );
}

function CategoriaLink({
  categoria,
  idioma,
  sobreFoto,
}: {
  categoria: CategoriaRef;
  idioma: Idioma;
  sobreFoto: boolean | 'lg';
}) {
  return (
    <Link
      href={rotasDoBlog.categoria(categoria.slug, idioma)}
      className={cx(
        // Acima do `::after` do título, que cobre o card inteiro.
        'relative z-elevado inline-flex min-h-6 items-center font-medium underline decoration-transparent underline-offset-4 transition-colors duration-[var(--t-toque)] hover:decoration-current',
        sobreFoto === true
          ? 'text-ouro'
          : sobreFoto === 'lg'
            ? 'text-ouro-texto lg:text-ouro'
            : 'text-ouro-texto'
      )}
    >
      {categoria.nome}
    </Link>
  );
}

/** O título de um artigo numa lista: o link que cobre o card inteiro. */
export function TituloLink({
  artigo,
  idioma,
  as: Tag = 'h3',
  className,
}: {
  artigo: Pick<ResumoDeArtigo, 'slug' | 'titulo'>;
  idioma: Idioma;
  as?: 'h2' | 'h3';
  className?: string;
}) {
  return (
    <Tag className={cx('font-display text-balance', className)}>
      <Link
        href={rotasDoBlog.artigo(artigo.slug, idioma)}
        className="blog-titulo-link"
      >
        {artigo.titulo}
      </Link>
    </Tag>
  );
}

/** Up to two initials of a name, for avatars without a photo. */
export const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('') || 'OA';

/**
 * Quem escreveu: a foto, ou as iniciais em Garamond (não o boneco genérico).
 */
export function Avatar({
  autor,
  tamanho = 'm',
}: {
  autor: Pick<AutorRef, 'nome' | 'imagem'>;
  tamanho?: 'p' | 'm' | 'g' | 'gg';
}) {
  const medida = { p: 32, m: 40, g: 56, gg: 112 }[tamanho];
  const classe = {
    p: 'h-8 w-8 text-sm',
    m: 'h-10 w-10 text-base',
    g: 'h-14 w-14 text-xl',
    gg: 'h-28 w-28 text-4xl',
  }[tamanho];

  if (autor.imagem) {
    return (
      <Image
        src={autor.imagem}
        alt=""
        width={medida}
        height={medida}
        className={cx('shrink-0 rounded-full object-cover', classe)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid shrink-0 place-items-center rounded-full bg-sup-2 font-display text-ouro-texto',
        classe
      )}
    >
      {iniciais(autor.nome)}
    </span>
  );
}

/** A trilha visível (`Blog › Categoria`); a mesma vai no `BreadcrumbList`. */
export function Trilha({
  passos,
  idioma,
  sobreFoto = false,
  className,
}: {
  passos: Array<{ nome: string; href: string }>;
  idioma: Idioma;
  /** Sobre a capa no computador; no telefone a trilha sai da foto. */
  sobreFoto?: boolean;
  className?: string;
}) {
  const cor = sobreFoto
    ? 'text-texto-fraco hover:text-texto lg:text-sobre-foto/85 lg:hover:text-sobre-foto'
    : 'text-texto-fraco hover:text-texto';

  return (
    <nav aria-label={BLOG[idioma].artigo.trilha} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
        {passos.map((passo, i) => (
          <li key={passo.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <Icon
                de={PiCaretRight}
                tamanho="pp"
                className={
                  sobreFoto
                    ? 'text-texto-fraco lg:text-sobre-foto/60'
                    : 'text-texto-fraco'
                }
              />
            )}
            <Link
              href={passo.href}
              className={cx('inline-flex min-h-6 items-center', cor)}
            >
              {passo.nome}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Título de seção, com o link "ver todos" na mesma linha. */
export function TituloDeSecao({
  children,
  href,
  rotuloDoLink,
  id,
  className,
}: {
  children: ReactNode;
  href?: string;
  rotuloDoLink?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1',
        className
      )}
    >
      <h2 id={id} className="t-titulo text-balance">
        {children}
      </h2>
      {href && rotuloDoLink && (
        <Link href={href} className={LINK}>
          {rotuloDoLink}
          <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      )}
    </div>
  );
}

/**
 * Paginação por link: cada página é um endereço (`?page=2`), que o buscador
 * segue. A primeira página não leva o parâmetro.
 */
export function Paginacao({
  paginacao,
  caminho,
  idioma,
  extra,
}: {
  paginacao: PaginacaoDados;
  caminho: string;
  idioma: Idioma;
  /** Outros parâmetros da página (`ordem`…), mantidos nos links. */
  extra?: Record<string, string | undefined>;
}) {
  const t = BLOG[idioma].lista;
  if (paginacao.paginas <= 1) return null;

  const href = (pagina: number) => {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(extra ?? {})) {
      if (valor) params.set(chave, valor);
    }
    if (pagina > 1) params.set('page', String(pagina));
    const query = params.toString();
    return query ? `${caminho}?${query}` : caminho;
  };

  const anterior = paginacao.pagina > 1 ? paginacao.pagina - 1 : null;
  const proxima =
    paginacao.pagina < paginacao.paginas ? paginacao.pagina + 1 : null;

  return (
    <nav
      aria-label={t.paginas}
      className="flex items-center justify-between gap-4 border-t border-linha pt-6"
    >
      {anterior ? (
        <Link href={href(anterior)} rel="prev" className={LINK}>
          <Icon de={PiArrowLeft} tamanho="pp" />
          {t.anterior}
        </Link>
      ) : (
        <span className="text-[0.9375rem] text-texto-fraco">{t.anterior}</span>
      )}
      <p className="t-legenda">
        {t.pagina(paginacao.pagina, paginacao.paginas)}
      </p>
      {proxima ? (
        <Link href={href(proxima)} rel="next" className={LINK}>
          {t.proxima}
          <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      ) : (
        <span className="text-[0.9375rem] text-texto-fraco">{t.proxima}</span>
      )}
    </nav>
  );
}

/**
 * Categorias como links: cada uma é um endereço. A ativa leva o ouro (a
 * única cor que marca seleção no sistema).
 */
export function CategoriasEmFichas({
  categorias,
  atual,
  idioma,
  className,
}: {
  categorias: CategoriaRef[];
  /** `undefined` é "Todos". */
  atual?: string;
  idioma: Idioma;
  className?: string;
}) {
  const t = BLOG[idioma].lista;
  const itens = [
    { slug: undefined as string | undefined, nome: t.todas },
    ...categorias,
  ];

  return (
    <nav aria-label={t.filtro} className={className}>
      <FaixaQueRola>
        {itens.map((item) => {
          const ativo = item.slug === atual;
          return (
            <li key={item.slug ?? 'todos'}>
              <Link
                href={
                  item.slug
                    ? rotasDoBlog.categoria(item.slug, idioma)
                    : rotasDoBlog.artigos(idioma)
                }
                aria-current={ativo ? 'page' : undefined}
                className={cx(
                  'inline-flex min-h-9 items-center whitespace-nowrap rounded-full border px-3.5 text-sm transition-[border-color,color] duration-[var(--t-resposta)] ease-saida [@media(pointer:coarse)]:min-h-[var(--alvo)]',
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
      </FaixaQueRola>
    </nav>
  );
}

/** O dado estruturado da página, num `<script>` de verdade. */
export function JsonLd({ dados }: { dados: unknown }) {
  return (
    <script
      type="application/ld+json"
      // O JSON vem de dado nosso; `<` escapado impede fechar o `<script>`.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, '\\u003c'),
      }}
    />
  );
}
