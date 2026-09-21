// app/requests/blog/cached-blog-function.ts — a vitrine da home do blog
//
// O cache do blog agora é o do `fetch` (ISR com as tags que a API revalida
// quando algo muda); o cache híbrido no Redis do front saiu do blog. Os nomes
// ficam para não mexer em quem importa.
import { revalidateTag } from 'next/cache';
import { BLOG_TAGS } from './articles';

export {
  getFeaturedArticles as getCachedFeaturedArticles,
  getLatestArticles as getCachedLatestArticles,
  getMostReadArticles as getCachedMostReadArticles,
  getCategories as getCachedCategories,
} from './blog-requests';

/**
 * Para as rotas do legado que ainda escrevem no banco (`api/blog/**`): a API
 * não fica sabendo dessas escritas, então elas derrubam as páginas aqui.
 */
export const invalidateBlogCache = async () => {
  revalidateTag(BLOG_TAGS.articles);
};

export const invalidateBlogCategories = async () => {
  revalidateTag(BLOG_TAGS.categories);
};
