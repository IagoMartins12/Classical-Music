import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListaDeArtigos } from '@/app/components/blog/site/ListaDeArtigos';
import { JsonLd } from '@/app/components/blog/site/pecas';
import { BLOG } from '@/app/conteudo/blog';
import {
  lerTag,
  listarArtigos,
  listarCategorias,
  listarMaisLidos,
} from '@/app/requests/blog/leitura';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import {
  descricaoDaTag,
  jsonLdDaColecao,
  metadadosDePagina,
} from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/**
 * Um assunto (tag). O link existia em todo artigo e levava a uma página que
 * não existia (404); agora é uma lista como a da categoria.
 */

type Props = {
  params: LangParams<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const pagina = (valor?: string) => Math.max(1, Number(valor) || 1);

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const { slug } = await params;
  const n = pagina((await searchParams).page);
  const tag = await lerTag(slug, { idioma });
  if (!tag) return { robots: { index: false } };
  const sufixo = n > 1 ? `?page=${n}` : '';
  return metadadosDePagina({
    idioma,
    titulo: BLOG[idioma].lista.comPagina(BLOG[idioma].lista.tag(tag.nome), n),
    descricao: descricaoDaTag(tag, idioma),
    caminhoPt: rotasDoBlog.tag(slug, 'pt') + sufixo,
    caminhoEn: rotasDoBlog.tag(slug, 'en') + sufixo,
    // Assunto com um artigo só não ganha página no buscador: seria um
    // resumo do próprio artigo competindo com ele.
    indexar: tag.artigos > 1,
  });
}

export default async function Assunto({ params, searchParams }: Props) {
  const idioma = await routeLanguage(params);
  const { slug } = await params;
  const n = pagina((await searchParams).page);

  const tag = await lerTag(slug, { idioma });
  if (!tag) notFound();

  const [{ artigos, paginacao }, categorias, maisLidos] = await Promise.all([
    listarArtigos({ tag: slug, pagina: n, porPagina: 12 }, { idioma }),
    listarCategorias({ idioma }),
    listarMaisLidos(5, { idioma }),
  ]);
  const caminho = rotasDoBlog.tag(slug, idioma);
  const titulo = BLOG[idioma].lista.tag(tag.nome);

  return (
    <>
      <JsonLd dados={jsonLdDaColecao(titulo, caminho, artigos)} />
      <ListaDeArtigos
        idioma={idioma}
        titulo={titulo}
        descricao={descricaoDaTag(tag, idioma)}
        artigos={artigos}
        paginacao={paginacao}
        caminho={caminho}
        categorias={categorias}
        maisLidos={maisLidos}
      />
    </>
  );
}
