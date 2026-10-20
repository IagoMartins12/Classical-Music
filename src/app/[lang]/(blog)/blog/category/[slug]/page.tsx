import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListaDeArtigos } from '@/app/components/blog/site/ListaDeArtigos';
import { JsonLd } from '@/app/components/blog/site/pecas';
import { BLOG } from '@/app/conteudo/blog';
import {
  lerCategoria,
  listarArtigos,
  listarCategorias,
  listarMaisLidos,
} from '@/app/requests/blog/leitura';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import {
  descricaoDaCategoria,
  jsonLdDaColecao,
  jsonLdDaTrilha,
  metadadosDePagina,
} from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

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
  const categoria = await lerCategoria(slug, { idioma });
  if (!categoria) return { robots: { index: false } };
  const sufixo = n > 1 ? `?page=${n}` : '';
  return metadadosDePagina({
    idioma,
    titulo: BLOG[idioma].lista.comPagina(
      categoria.metaTitulo || categoria.nome,
      n
    ),
    descricao: descricaoDaCategoria(categoria, idioma),
    caminhoPt: rotasDoBlog.categoria(slug, 'pt') + sufixo,
    caminhoEn: rotasDoBlog.categoria(slug, 'en') + sufixo,
    imagem: categoria.imagem,
  });
}

export default async function Categoria({ params, searchParams }: Props) {
  const idioma = await routeLanguage(params);
  const { slug } = await params;
  const n = pagina((await searchParams).page);

  const categoria = await lerCategoria(slug, { idioma });
  if (!categoria) notFound();

  const [{ artigos, paginacao }, categorias, maisLidos] = await Promise.all([
    listarArtigos({ categoria: slug, pagina: n, porPagina: 12 }, { idioma }),
    listarCategorias({ idioma }),
    listarMaisLidos(5, { idioma }),
  ]);
  const caminho = rotasDoBlog.categoria(slug, idioma);

  return (
    <>
      <JsonLd dados={jsonLdDaColecao(categoria.nome, caminho, artigos)} />
      <JsonLd
        dados={jsonLdDaTrilha([
          { nome: BLOG[idioma].nav.blog, caminho: rotasDoBlog.inicio(idioma) },
          {
            nome: BLOG[idioma].lista.categorias,
            caminho: rotasDoBlog.categorias(idioma),
          },
          { nome: categoria.nome, caminho },
        ])}
      />
      <ListaDeArtigos
        idioma={idioma}
        titulo={categoria.nome}
        descricao={descricaoDaCategoria(categoria, idioma)}
        imagem={categoria.imagem}
        artigos={artigos}
        paginacao={paginacao}
        caminho={caminho}
        categorias={categorias}
        categoriaAtual={slug}
        maisLidos={maisLidos}
      />
    </>
  );
}
