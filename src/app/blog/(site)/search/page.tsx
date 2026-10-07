import type { Metadata } from 'next';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { Cartao } from '@/app/components/blog/site/cartoes';
import { PAGINA, Paginacao } from '@/app/components/blog/site/pecas';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { cx } from '@/app/components/ui/cx';
import { BLOG } from '@/app/conteudo/blog';
import { buscarArtigos, listarCategorias } from '@/app/requests/blog/leitura';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

/**
 * A busca do blog. Por pedido: lê os parâmetros a cada visita e fica fora
 * do buscador (`noindex, follow` — os links dos resultados ainda contam).
 * O formulário é um GET simples: funciona sem JavaScript.
 */

type Props = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    ordem?: string;
    page?: string;
  }>;
};

const ORDENS = {
  relevancia: 'relevance',
  recente: 'newest',
  popular: 'popular',
} as const;

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const idioma = await getServerLanguageStatic();
  const { q } = await searchParams;
  const t = BLOG[idioma].resultados;
  return {
    title: q?.trim() ? t.para(q.trim()) : t.titulo,
    robots: { index: false, follow: true },
  };
}

export default async function Busca({ searchParams }: Props) {
  const idioma = await getServerLanguageStatic();
  const t = BLOG[idioma].resultados;
  const params = await searchParams;
  const q = params.q?.trim() ?? '';
  const ordem = (Object.keys(ORDENS) as Array<keyof typeof ORDENS>).includes(
    params.ordem as keyof typeof ORDENS
  )
    ? (params.ordem as keyof typeof ORDENS)
    : q
      ? 'relevancia'
      : 'recente';
  const pagina = Math.max(1, Number(params.page) || 1);

  const [{ artigos, paginacao }, categorias] = await Promise.all([
    buscarArtigos({
      q,
      categoria: params.categoria,
      ordem: ORDENS[ordem],
      pagina,
      idioma,
    }),
    listarCategorias({ idioma }).catch(() => []),
  ]);

  const link = (mudar: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const atual = {
      q: q || undefined,
      categoria: params.categoria,
      ordem,
      ...mudar,
    };
    for (const [k, v] of Object.entries(atual)) if (v) p.set(k, v);
    return `${rotasDoBlog.busca()}?${p.toString()}`;
  };

  const ficha = (ativo: boolean) =>
    cx(
      'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm transition-[border-color,color] duration-[var(--t-resposta)] ease-saida [@media(pointer:coarse)]:min-h-[var(--alvo)]',
      ativo
        ? 'border-ouro/50 tint-ouro font-medium text-ouro-na-tinta'
        : 'border-linha-forte text-texto-suave hover:border-ouro/45 hover:text-ouro-texto'
    );

  return (
    <div className={cx(PAGINA, 'pt-10 lg:pt-14')}>
      <header className="flex flex-col gap-6">
        <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] text-balance sm:text-[3.25rem]">
          {q ? t.para(q) : t.titulo}
        </h1>
        <form
          role="search"
          action={rotasDoBlog.busca()}
          className="flex max-w-2xl gap-2"
        >
          <label htmlFor="q" className="sr-only">
            {t.campo}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            enterKeyHint="search"
            defaultValue={q}
            minLength={2}
            placeholder={BLOG[idioma].busca.dica}
            className="input-classical !pl-4 min-w-0 flex-1"
          />
          {params.categoria && (
            <input type="hidden" name="categoria" value={params.categoria} />
          )}
          <Button type="submit" variante="primario" icone={PiMagnifyingGlass}>
            {t.buscar}
          </Button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label={BLOG[idioma].lista.filtro}>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href={link({ categoria: undefined, page: undefined })}
                  aria-current={!params.categoria ? 'page' : undefined}
                  className={ficha(!params.categoria)}
                >
                  {BLOG[idioma].lista.todas}
                </Link>
              </li>
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={link({ categoria: c.slug })}
                    aria-current={
                      params.categoria === c.slug ? 'page' : undefined
                    }
                    className={ficha(params.categoria === c.slug)}
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav
            aria-label={t.ordem}
            className="flex items-center gap-1 text-[0.875rem]"
          >
            {(q
              ? (['relevancia', 'recente', 'popular'] as const)
              : (['recente', 'popular'] as const)
            ).map((o) => (
              <Link
                key={o}
                href={link({ ordem: o })}
                aria-current={ordem === o ? 'page' : undefined}
                className={cx(
                  'flex min-h-[var(--alvo)] items-center rounded-controle px-3',
                  ordem === o
                    ? 'font-medium text-ouro-texto'
                    : 'text-texto-suave hover:text-texto'
                )}
              >
                {o === 'relevancia'
                  ? t.relevancia
                  : o === 'recente'
                    ? t.recentes
                    : t.populares}
              </Link>
            ))}
          </nav>
        </div>
        <p className="t-legenda">
          {BLOG[idioma].lista.contagem(paginacao.total)}
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-12">
        {artigos.length === 0 ? (
          <Vazio
            icone={PiMagnifyingGlass}
            titulo={q ? t.nada(q) : BLOG[idioma].lista.vazio}
            descricao={t.nadaDescricao}
          />
        ) : (
          <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {artigos.map((artigo) => (
              <li key={artigo.id}>
                <Cartao artigo={artigo} idioma={idioma} comResumo />
              </li>
            ))}
          </ul>
        )}
        <Paginacao
          paginacao={paginacao}
          caminho={rotasDoBlog.busca()}
          idioma={idioma}
          extra={{ q: q || undefined, categoria: params.categoria, ordem }}
        />
      </div>
    </div>
  );
}
