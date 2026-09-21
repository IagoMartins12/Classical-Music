// app/requests/blog/composer-articles.ts — artigos de um compositor, pela API
//
// Mora à parte do `blog-requests.ts` (que ainda lê o banco até a Etapa 6)
// para a página do compositor não depender dele.
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

export interface BlogArticlePreview {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  publishedAt: Date | null;
  readTime?: number;
  authorName?: string;
  authorImage?: string;
}

type ArticleSummary = ApiSchema<'ArticleSummaryDto'>;

/**
 * Os artigos publicados que citam o compositor, mais recentes primeiro. É
 * conteúdo secundário da página: se a API falhar, a seção só não aparece.
 */
export async function getComposerArticles(
  composerId: string,
  limit: number = 5
): Promise<{ articles: BlogArticlePreview[]; totalCount: number }> {
  try {
    const response = await apiFetch<ApiSchema<'ArticleListResponseDto'>>(
      '/blog/articles',
      {
        query: { composerId, page: 1, limit },
        next: { revalidate: 1800, tags: ['blog-articles'] },
      }
    );

    return {
      articles: response.articles.map(toPreview),
      totalCount: response.pagination.total,
    };
  } catch (error) {
    console.error('Erro ao buscar artigos do compositor:', error);
    return { articles: [], totalCount: 0 };
  }
}

function toPreview(article: ArticleSummary): BlogArticlePreview {
  const { firstName, lastName, username, image } = article.author;
  const authorName =
    [firstName, lastName].filter(Boolean).join(' ') || username || undefined;

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    coverImage: article.coverImage || undefined,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    readTime: article.estimatedReadTime || undefined,
    authorName,
    authorImage: image || undefined,
  };
}
