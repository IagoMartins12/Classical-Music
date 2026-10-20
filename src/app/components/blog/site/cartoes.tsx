import Link from 'next/link';
import { Stack } from '@/app/components/ui/Layout';
import { cx } from '@/app/components/ui/cx';
import { nomeDeArtigo } from '@/app/components/ui/nomeDeArtigo';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import type { ResumoDeArtigo } from '@/app/requests/blog/leitura';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { Capa } from './Capa';
import { Meta, TituloLink } from './pecas';

/**
 * Os cards de artigo. Cada um é um link só (o título cobre a caixa, ver
 * `.blog-titulo-link`) e leva `data-vira`: ao clicar, o card vira o
 * cabeçalho do artigo (`ui/CartoesQueViram`).
 *
 * **Computador e telefone na mesma marcação.** O blog escolhido em 30/09 tem
 * a composição do esboço C no computador e a do A no telefone. As duas saem
 * do mesmo HTML, com classes por largura — escrever o card duas vezes
 * (`hidden lg:block`) duplicaria links para o leitor de tela e o buscador.
 */

/** O véu sob o título que fica por cima da capa. Igual nos dois temas. */
export const VEU =
  'absolute inset-0 bg-gradient-to-t from-veu-foto from-[12%] via-veu-foto/55 via-[48%] to-transparent to-[85%]';

const inicialDe = (titulo: string) => titulo.trim().charAt(0) || 'O';

/**
 * A peça do topo. No computador, o título sobre a capa (esboço C); no
 * telefone, a capa em cima e o texto embaixo, no fundo da página (esboço A).
 */
export function Peca({
  artigo,
  idioma,
  grande = false,
  prioridade = false,
  className,
}: {
  artigo: ResumoDeArtigo;
  idioma: Idioma;
  grande?: boolean;
  prioridade?: boolean;
  className?: string;
}) {
  return (
    <article
      data-vira={nomeDeArtigo(artigo.slug)}
      className={cx(
        'relative isolate flex flex-col gap-4 lg:min-h-[17rem] lg:justify-end lg:overflow-hidden lg:rounded-card',
        className
      )}
    >
      <Capa
        src={artigo.capa}
        alt=""
        inicial={inicialDe(artigo.titulo)}
        sizes={
          grande
            ? '(min-width: 1024px) 760px, 100vw'
            : '(min-width: 1024px) 540px, 100vw'
        }
        prioridade={prioridade}
        className={cx(
          'rounded-card lg:absolute lg:inset-0 lg:aspect-auto lg:rounded-none',
          grande ? 'aspect-[4/3]' : 'aspect-[3/2]'
        )}
      />
      <span aria-hidden="true" className={cx(VEU, 'hidden lg:block')} />
      <div
        className={cx(
          'relative flex flex-col gap-2 lg:p-6',
          grande && 'lg:max-w-[40rem] lg:gap-3 lg:p-9'
        )}
      >
        <Meta artigo={artigo} idioma={idioma} sobreFoto="lg" />
        <TituloLink
          artigo={artigo}
          idioma={idioma}
          as="h2"
          className={cx(
            'lg:text-sobre-foto',
            grande
              ? 'text-[2rem] leading-[1.05] tracking-[-0.015em] sm:text-[2.5rem] lg:text-[3rem] xl:text-[3.25rem]'
              : 'text-[1.625rem] leading-[1.1] sm:text-[1.875rem]'
          )}
        />
        {artigo.resumo && (
          <p
            className={cx(
              'max-w-[46ch] text-[1.0625rem] leading-[1.55] text-texto-suave lg:text-sobre-foto/85',
              grande ? 'max-sm:line-clamp-3' : 'line-clamp-2 lg:hidden'
            )}
          >
            {artigo.resumo}
          </p>
        )}
      </div>
    </article>
  );
}

/** A capa em cima, o título embaixo (a grade das listas). */
export function Cartao({
  artigo,
  idioma,
  proporcao = 'aspect-[3/2]',
  sizes = '(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw',
  comResumo = false,
  className,
}: {
  artigo: ResumoDeArtigo;
  idioma: Idioma;
  proporcao?: string;
  sizes?: string;
  comResumo?: boolean;
  className?: string;
}) {
  return (
    <article
      data-vira={nomeDeArtigo(artigo.slug)}
      className={cx('relative flex flex-col gap-3.5', className)}
    >
      <Capa
        src={artigo.capa}
        alt=""
        inicial={inicialDe(artigo.titulo)}
        sizes={sizes}
        className={cx(proporcao, 'rounded-card')}
      />
      <Stack gap={2}>
        <Meta artigo={artigo} idioma={idioma} />
        <TituloLink
          artigo={artigo}
          idioma={idioma}
          className="text-[1.5rem] leading-[1.14]"
        />
        {comResumo && artigo.resumo && (
          <p className="line-clamp-2 text-[0.9375rem] leading-[1.55] text-texto-suave">
            {artigo.resumo}
          </p>
        )}
      </Stack>
    </article>
  );
}

/**
 * O card da prateleira. No telefone é a linha do esboço A (texto à
 * esquerda, miniatura à direita); no computador, o card em pé do esboço C.
 */
export function CartaoDaPrateleira({
  artigo,
  idioma,
  vertical = false,
}: {
  artigo: ResumoDeArtigo;
  idioma: Idioma;
  /** Capa em cima também no telefone (no carrossel, que rola de lado). */
  vertical?: boolean;
}) {
  return (
    <article
      data-vira={nomeDeArtigo(artigo.slug)}
      className={cx(
        'relative grid items-start',
        vertical
          ? 'grid-cols-1 gap-3.5'
          : 'grid-cols-[minmax(0,1fr)_auto] gap-5 border-t border-linha py-5 lg:grid-cols-1 lg:gap-3.5 lg:border-t-0 lg:py-0'
      )}
    >
      <Capa
        src={artigo.capa}
        alt=""
        inicial={inicialDe(artigo.titulo)}
        sizes={
          vertical
            ? '(min-width: 1024px) 280px, 70vw'
            : '(min-width: 1024px) 280px, 176px'
        }
        className={
          vertical
            ? 'order-first aspect-[4/5] w-full rounded-card'
            : 'aspect-[4/3] w-28 rounded-controle sm:w-44 lg:order-first lg:aspect-[4/5] lg:w-full lg:rounded-card'
        }
      />
      <div
        className={cx(
          'flex min-w-0 flex-col gap-2',
          !vertical && 'max-lg:row-start-1'
        )}
      >
        <Meta artigo={artigo} idioma={idioma} />
        <TituloLink
          artigo={artigo}
          idioma={idioma}
          className="text-[1.5rem] leading-[1.14] sm:text-[1.625rem] lg:text-[1.5rem]"
        />
        {artigo.resumo && (
          <p className="line-clamp-2 max-w-[58ch] text-[0.9375rem] leading-[1.55] text-texto-suave max-sm:hidden lg:hidden">
            {artigo.resumo}
          </p>
        )}
      </div>
    </article>
  );
}

/** Um artigo em linha, com miniatura (o "Continue lendo", a categoria). */
export function LinhaDeArtigo({
  artigo,
  idioma,
  as: Tag = 'li',
}: {
  artigo: ResumoDeArtigo;
  idioma: Idioma;
  as?: 'li' | 'div';
}) {
  return (
    <Tag
      data-vira={nomeDeArtigo(artigo.slug)}
      className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 border-t border-linha py-6 sm:gap-8"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <Meta artigo={artigo} idioma={idioma} />
        <TituloLink
          artigo={artigo}
          idioma={idioma}
          className="text-[1.5rem] leading-[1.15] sm:text-[1.75rem]"
        />
        {artigo.resumo && (
          <p className="line-clamp-2 max-w-[58ch] text-[0.9375rem] leading-[1.55] text-texto-suave max-sm:hidden">
            {artigo.resumo}
          </p>
        )}
      </div>
      <Capa
        src={artigo.capa}
        alt=""
        inicial={inicialDe(artigo.titulo)}
        sizes="(min-width: 640px) 192px, 112px"
        className="aspect-[4/3] w-28 rounded-controle sm:w-48"
      />
    </Tag>
  );
}

/**
 * Os mais lidos, numerados (o número diz a posição, não enfeita), com a
 * miniatura de cada um.
 */
export function MaisLidos({
  artigos,
  idioma,
  titulo,
  comMiniatura = true,
  comResumo = false,
  id = 'mais-lidos',
  className,
}: {
  artigos: ResumoDeArtigo[];
  idioma: Idioma;
  titulo?: string;
  comMiniatura?: boolean;
  /** O resumo do artigo sob o título (o início, onde a lista tem espaço). */
  comResumo?: boolean;
  /** O id do título (a seção se nomeia por ele). */
  id?: string;
  className?: string;
}) {
  const t = BLOG[idioma].maisLidos;
  if (artigos.length === 0) return null;

  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="t-titulo">
        {titulo ?? t.titulo}
      </h2>
      <ol className="mt-4">
        {artigos.map((artigo, i) => (
          <li
            key={artigo.id}
            className={cx(
              'relative grid gap-4 border-t border-linha py-4',
              comResumo ? 'items-start' : 'items-center',
              comMiniatura
                ? 'grid-cols-[2.25rem_4.5rem_minmax(0,1fr)]'
                : 'grid-cols-[2.25rem_minmax(0,1fr)]'
            )}
          >
            <span className="font-display text-[1.75rem] italic leading-none text-ouro-texto">
              {i + 1}
            </span>
            {comMiniatura && (
              <Capa
                src={artigo.capa}
                alt=""
                inicial={inicialDe(artigo.titulo)}
                sizes="72px"
                className="aspect-square rounded-controle"
              />
            )}
            <span className="flex min-w-0 flex-col gap-0.5">
              <Link
                href={rotasDoBlog.artigo(artigo.slug, idioma)}
                className="blog-titulo-link font-display text-[1.375rem] leading-snug"
              >
                {artigo.titulo}
              </Link>
              {comResumo && artigo.resumo && (
                <span className="line-clamp-2 text-[0.9375rem] leading-[1.5] text-texto-suave">
                  {artigo.resumo}
                </span>
              )}
              <span className="t-legenda">{t.leituras(artigo.visitas)}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
