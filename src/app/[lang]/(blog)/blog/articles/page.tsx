import type { Metadata } from 'next';
import { ListaDeArtigos } from '@/app/components/blog/site/ListaDeArtigos';
import { JsonLd } from '@/app/components/blog/site/pecas';
import { BLOG } from '@/app/conteudo/blog';
import {
  listarArtigos,
  listarCategorias,
  listarMaisLidos,
} from '@/app/requests/blog/leitura';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { jsonLdDaColecao, metadadosDePagina } from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

type Props = {
  params: LangParams;
  searchParams: Promise<{ page?: string }>;
};

const pagina = (valor?: string) => Math.max(1, Number(valor) || 1);

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const n = pagina((await searchParams).page);
  const t = BLOG[idioma].lista;
  const sufixo = n > 1 ? `?page=${n}` : '';
  return metadadosDePagina({
    idioma,
    titulo: t.comPagina(t.todos, n),
    descricao: t.todosDescricao,
    caminhoPt: rotasDoBlog.artigos('pt') + sufixo,
    caminhoEn: rotasDoBlog.artigos('en') + sufixo,
  });
}

export default async function TodosOsArtigos({ params, searchParams }: Props) {
  const idioma = await routeLanguage(params);
  const n = pagina((await searchParams).page);
  const t = BLOG[idioma].lista;

  const [{ artigos, paginacao }, categorias, maisLidos] = await Promise.all([
    listarArtigos({ pagina: n, porPagina: 12 }, { idioma }),
    listarCategorias({ idioma }),
    listarMaisLidos(5, { idioma }),
  ]);

  return (
    <>
      <JsonLd
        dados={jsonLdDaColecao(t.todos, rotasDoBlog.artigos(idioma), artigos)}
      />
      <ListaDeArtigos
        idioma={idioma}
        titulo={t.todos}
        descricao={t.todosDescricao}
        artigos={artigos}
        paginacao={paginacao}
        caminho={rotasDoBlog.artigos(idioma)}
        categorias={categorias}
        maisLidos={maisLidos}
      />
    </>
  );
}
