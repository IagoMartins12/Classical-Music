import type { Metadata } from 'next';
import Link from 'next/link';
import { PiArrowRight } from 'react-icons/pi';
import { Capa } from '@/app/components/blog/site/Capa';
import { VEU } from '@/app/components/blog/site/cartoes';
import { JsonLd, PAGINA } from '@/app/components/blog/site/pecas';
import { cx } from '@/app/components/ui/cx';
import { Icon } from '@/app/components/ui/Icon';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import { tolerarApiForaNoBuild } from '@/app/libs/api/build-tolerance';
import {
  listarArtigos,
  listarCategorias,
  type CategoriaDoBlog,
} from '@/app/requests/blog/leitura';
import { absoluto, rotasDoBlog } from '@/app/utils/blog/rotas';
import { metadadosDePagina } from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/**
 * As categorias do blog: cada uma com a sua capa (a da categoria, senão a
 * do artigo mais recente dela), o nome por cima e quantos artigos tem. Sem
 * cor nem emoji de categoria (decisão de 30/09).
 */

export const revalidate = 600;

type Props = { params: LangParams };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const t = BLOG[idioma].lista;
  return metadadosDePagina({
    idioma,
    titulo: t.categorias,
    descricao: t.categoriasDescricao,
    caminhoPt: rotasDoBlog.categorias('pt'),
    caminhoEn: rotasDoBlog.categorias('en'),
  });
}

async function carregar(idioma: Idioma) {
  const categorias = await listarCategorias({ revalidate, idioma });
  return Promise.all(
    categorias.map(async (categoria) => {
      const { artigos, paginacao } = await listarArtigos(
        { categoria: categoria.slug, porPagina: 1 },
        { revalidate, idioma }
      );
      return {
        categoria,
        total: paginacao.total,
        capa: categoria.imagem ?? artigos[0]?.capa ?? null,
      };
    })
  );
}

export default async function Categorias({ params }: Props) {
  const idioma = await routeLanguage(params);
  const t = BLOG[idioma].lista;
  const itens = await tolerarApiForaNoBuild(
    () => carregar(idioma),
    [] as Array<{
      categoria: CategoriaDoBlog;
      total: number;
      capa: string | null;
    }>,
    'blog: categorias'
  );
  const comArtigos = itens.filter((i) => i.total > 0);

  return (
    <div className={cx(PAGINA, 'pt-10 lg:pt-14')}>
      <JsonLd
        dados={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t.categorias,
          url: absoluto(rotasDoBlog.categorias(idioma)),
          hasPart: comArtigos.map(({ categoria }) => ({
            '@type': 'CollectionPage',
            name: categoria.nome,
            url: absoluto(rotasDoBlog.categoria(categoria.slug, idioma)),
          })),
        }}
      />
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] sm:text-[3.5rem]">
          {t.categorias}
        </h1>
        <p className="max-w-[52ch] text-[1.1875rem] leading-[1.5] text-texto-suave">
          {t.categoriasDescricao}
        </p>
      </header>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {comArtigos.map(({ categoria, total, capa }) => (
          <li key={categoria.id}>
            <article className="relative isolate flex min-h-[15rem] items-end overflow-hidden rounded-card lg:min-h-[18rem]">
              <Capa
                src={capa}
                alt=""
                inicial={categoria.nome}
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                preencher
              />
              <span aria-hidden="true" className={VEU} />
              <div className="relative flex flex-col gap-1.5 p-5 sm:p-6">
                <h2 className="font-display text-[1.875rem] leading-tight text-sobre-foto">
                  <Link
                    href={rotasDoBlog.categoria(categoria.slug, idioma)}
                    className="blog-titulo-link"
                  >
                    {categoria.nome}
                  </Link>
                </h2>
                {categoria.descricao && (
                  <p className="line-clamp-2 max-w-[44ch] text-[0.9375rem] leading-[1.5] text-sobre-foto/85">
                    {categoria.descricao}
                  </p>
                )}
                <p className="flex items-center gap-3 text-[0.8125rem] text-sobre-foto/85">
                  <span className="t-dado">{t.contagem(total)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-ouro">
                    {t.explorar}
                    <Icon de={PiArrowRight} tamanho="pp" />
                  </span>
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
