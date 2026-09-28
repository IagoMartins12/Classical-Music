/**
 * O nome de transição de um artigo do blog (`artigo-{slug}`), o mesmo no card
 * e no cabeçalho da página dele. Arquivo à parte, sem `react-dom`: o
 * cabeçalho do artigo é componente de servidor.
 *
 * O slug vira um nome CSS válido — acento, ponto e afins trocados por hífen.
 */
export function nomeDeArtigo(slug: string) {
  return `artigo-${slug.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

/** Caminhos de `/blog/...` que não são artigo. */
export const ROTAS_DO_BLOG = new Set([
  'articles',
  'bookmarks',
  'calendar',
  'category',
  'liked',
  'preview',
  'search',
  'admin',
]);
