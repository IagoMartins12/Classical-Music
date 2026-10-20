import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaginaDoArtigo } from '@/app/components/blog/site/PaginaDoArtigo';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import { lerArtigo, listarArtigos } from '@/app/requests/blog/leitura';
import { metadadosDoArtigo } from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/**
 * O artigo, estático (ISR). A API revalida a tag `blog-articles` quando o
 * artigo muda; os 10 minutos são só a rede de segurança.
 *
 * Sem `loading.tsx` de propósito: com ele o Next responderia 200 antes de
 * saber se o artigo existe, e o "não encontrado" viraria soft 404 (ver
 * `[lang]/(main)/README-loading.md`). A navegação espera a página, e o card
 * clicado vira o cabeçalho.
 */

export const revalidate = 600;

type Props = { params: LangParams<{ slug: string }> };

/** Só artigo publicado; rascunho ou inexistente é 404. */
async function carregar(slug: string, idioma: Idioma) {
  const artigo = await lerArtigo(slug, { revalidate, idioma });
  return artigo?.status === 'PUBLISHED' ? artigo : null;
}

/**
 * Lista vazia: nada é gerado no build, mas a rota passa a ser guardada — a
 * primeira visita de cada artigo renderiza, as seguintes vêm do cache.
 */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const { slug } = await params;
  const artigo = await carregar(slug, idioma);
  if (!artigo)
    return { title: BLOG[idioma].lista.vazio, robots: { index: false } };
  return metadadosDoArtigo(artigo, idioma);
}

export default async function Artigo({ params }: Props) {
  const idioma = await routeLanguage(params);
  const { slug } = await params;
  const artigo = await carregar(slug, idioma);
  if (!artigo) notFound();

  const maisDaCategoria = artigo.categoria
    ? (
        await listarArtigos(
          { categoria: artigo.categoria.slug, porPagina: 4 },
          { revalidate, idioma }
        ).catch(() => ({ artigos: [] }))
      ).artigos.filter((a) => a.id !== artigo.id)
    : [];

  return (
    <PaginaDoArtigo
      artigo={artigo}
      idioma={idioma}
      maisDaCategoria={maisDaCategoria}
    />
  );
}
