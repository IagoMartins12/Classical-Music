// app/requests/blog/blog-requests.ts — vitrine da home do blog, pela API (Etapa 6)
//
// Cada função devolve o formato que a home lia do Prisma (via `articles.ts` e
// `taxonomy.ts`), com ISR e as tags que a API revalida.
import {
  getFeaturedArticles as featuredArticles,
  listArticles,
} from './articles';
import { listCategories } from './taxonomy';

// Os artigos de um compositor já vinham da API desde a Etapa 3.
export type { BlogArticlePreview } from './composer-articles';
export { getComposerArticles } from './composer-articles';

/** Os destaques do carrossel (até 6), na ordem do painel. */
export function getFeaturedArticles() {
  return featuredArticles(6);
}

export async function getLatestArticles() {
  const { articles } = await listArticles({ limit: 9, sortBy: 'newest' });
  return articles;
}

/** "Mais lidos" como no legado: os mais visitados. */
export async function getMostReadArticles() {
  const { articles } = await listArticles({ limit: 5, sortBy: 'popular' });
  return articles;
}

export async function getCategories() {
  const categories = await listCategories();
  return categories.slice(0, 8);
}
