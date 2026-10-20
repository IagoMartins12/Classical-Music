import { SITE_URL } from '@/app/utils/seoAlternates';
import type { Idioma } from '@/app/conteudo/blog';

/**
 * Os endereços do blog, num lugar só.
 *
 * Português é o caminho limpo; inglês leva `/en` na frente — igual ao resto
 * do site (`utils/localizedRoutes`). As páginas por pessoa (salvos,
 * curtidos, busca) não têm versão em inglês: são dinâmicas e ficam fora de
 * `[lang]`.
 */

const prefixo = (idioma: Idioma) => (idioma === 'en' ? '/en' : '');

export const rotasDoBlog = {
  inicio: (idioma: Idioma = 'pt') => `${prefixo(idioma)}/blog`,
  artigos: (idioma: Idioma = 'pt') => `${prefixo(idioma)}/blog/articles`,
  artigo: (slug: string, idioma: Idioma = 'pt') =>
    `${prefixo(idioma)}/blog/${slug}`,
  categorias: (idioma: Idioma = 'pt') => `${prefixo(idioma)}/blog/category`,
  categoria: (slug: string, idioma: Idioma = 'pt') =>
    `${prefixo(idioma)}/blog/category/${slug}`,
  tag: (slug: string, idioma: Idioma = 'pt') =>
    `${prefixo(idioma)}/blog/tag/${slug}`,
  autor: (usuario: string, idioma: Idioma = 'pt') =>
    `${prefixo(idioma)}/blog/autor/${encodeURIComponent(usuario)}`,
  agenda: (idioma: Idioma = 'pt') => `${prefixo(idioma)}/blog/calendar`,
  rss: () => '/blog/rss.xml',
  busca: (q?: string) =>
    q ? `/blog/search?q=${encodeURIComponent(q)}` : '/blog/search',
  salvos: () => '/blog/bookmarks',
  curtidos: () => '/blog/liked',
  previa: (slug: string) => `/blog/preview/${slug}`,
  editar: (id: string) => `/blog/admin/articles/${id}/edit`,
  escrever: () => '/blog/admin/articles/create',
  painel: () => '/blog/admin/articles',
  // Professor escreve fora do painel (o painel é só do administrador).
  escreverComoAutor: () => '/blog/articles/create',
  editarComoAutor: (id: string) => `/blog/articles/edit/${id}`,
  meusArtigos: () => '/blog/my-articles',
};

/** O endereço absoluto, para `canonical`, Open Graph, RSS e dado estruturado. */
export const absoluto = (caminho: string) =>
  caminho.startsWith('http') ? caminho : `${SITE_URL}${caminho}`;

/** O endereço público de quem escreve: o nome de usuário, ou o id. */
export function usuarioDoAutor(autor: {
  id: string;
  username?: string | null;
}): string {
  return autor.username || autor.id;
}
