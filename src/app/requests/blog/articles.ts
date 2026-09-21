// app/requests/blog/articles.ts — artigos do blog pela API (Etapa 6)
//
// Isomórfico. Leitura pública vai com ISR e a tag que a API revalida quando o
// artigo muda (`blog-articles`); leitura de administrador vai com o token e
// sem cache. Cada função devolve o formato que as telas do legado liam:
// categorias e tags aninhadas (`{ category }`, `{ tag }`) e datas como `Date`.
import { apiFetch } from '@/app/libs/api/client';

/** As tags do Next que a API revalida (`blog:articles` → `blog-articles`). */
export const BLOG_TAGS = {
  articles: 'blog-articles',
  categories: 'blog-categories',
  tags: 'blog-tags',
  calendar: 'blog-calendar',
} as const;

/** Como a leitura é feita: pública com ISR, ou autenticada sem cache. */
export interface BlogReadOptions {
  token?: string;
  /** Segundos de ISR na leitura pública (padrão 300). */
  revalidate?: number;
  /** Ignora o cache (leitura de administrador ou por pessoa). */
  fresh?: boolean;
}

type QueryValue = string | number | boolean | null | undefined;

export function blogRead<T>(
  path: string,
  query: Record<string, QueryValue> | undefined,
  options: BlogReadOptions = {},
  tags: string[] = [BLOG_TAGS.articles]
): Promise<T> {
  if (options.fresh || options.token) {
    return apiFetch<T>(path, {
      query,
      token: options.token,
      cache: 'no-store',
    });
  }

  return apiFetch<T>(path, {
    query,
    next: { revalidate: options.revalidate ?? 300, tags },
  });
}

export interface ApiCategoryRef {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  description?: string | null;
}

export interface ApiTagRef {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface ApiAuthorRef {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  image: string | null;
  bio?: string | null;
}

export interface ApiArticle {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: any;
  coverImage: string | null;
  coverImageAlt: string | null;
  coverImageCredit: string | null;
  ttsAudioUrl: string | null;
  status: string;
  isFeatured: boolean;
  featuredOrder: number | null;
  types: string[];
  authorId: string;
  publishedAt: string | null;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  readTime: number | null;
  estimatedReadTime: number | null;
  composerIds: string[];
  workIds: string[];
  scoreIds: string[];
  instrumentIds: string[];
  epochIds: string[];
  backgroundMusicUrl: string | null;
  backgroundMusicTitle: string | null;
  viewCount: number;
  readCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  author: ApiAuthorRef;
  categories: Array<ApiCategoryRef | { category: ApiCategoryRef }>;
  tags: Array<ApiTagRef | { tag: ApiTagRef }>;
  _count: { comments: number; likes: number; bookmarks?: number };
  media?: any[];
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const toDate = (value: string | null | undefined) =>
  value ? new Date(value) : null;

/** Artigo no formato das telas do legado. */
export function legacyArticle(article: ApiArticle) {
  return {
    ...article,
    publishedAt: toDate(article.publishedAt),
    scheduledFor: toDate(article.scheduledFor),
    createdAt: new Date(article.createdAt),
    updatedAt: new Date(article.updatedAt),
    readTime: article.readTime ?? article.estimatedReadTime ?? 0,
    categories: article.categories.map((entry) =>
      'category' in entry ? entry : { category: entry }
    ),
    tags: (article.tags ?? []).map((entry) =>
      'tag' in entry ? entry : { tag: entry }
    ),
    _count: {
      comments: article._count?.comments ?? 0,
      likes: article._count?.likes ?? 0,
    },
  };
}

export type LegacyArticle = ReturnType<typeof legacyArticle>;

export interface ArticleListQuery {
  page?: number;
  limit?: number;
  status?: string;
  types?: string[];
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  authorId?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'mostRead';
}

const list = (values?: string[]) =>
  values && values.length > 0 ? values.join(',') : undefined;

/**
 * Lista de artigos. Para o público, só os publicados; com token de
 * administrador, todos os estados (e o filtro `status` vale).
 */
export async function listArticles(
  query: ArticleListQuery = {},
  options: BlogReadOptions = {}
) {
  const data = await blogRead<{
    articles: ApiArticle[];
    pagination: ApiPagination;
  }>(
    '/blog/articles',
    {
      page: query.page,
      limit: query.limit,
      status: query.status,
      types: list(query.types),
      categories: list(query.categories),
      tags: list(query.tags),
      featured: query.featured,
      authorId: query.authorId,
      search: query.search,
      sortBy: query.sortBy,
    },
    options
  );

  return {
    articles: data.articles.map(legacyArticle),
    pagination: data.pagination,
  };
}

/** Os destaques do carrossel, na ordem escolhida no painel. */
export async function getFeaturedArticles(
  limit = 6,
  options: BlogReadOptions = {}
) {
  const { articles } = await listArticles(
    { featured: true, limit: 20 },
    options
  );

  return articles
    .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
    .slice(0, limit);
}

/**
 * Detalhe do artigo pelo id ou pelo slug. Publicado para qualquer um;
 * rascunho só para o autor ou administrador (com token).
 */
export async function getArticle(
  idOrSlug: string,
  options: BlogReadOptions = {}
) {
  const data = await blogRead<{
    article: ApiArticle & {
      relatedArticles?: unknown[];
      userLiked?: boolean;
      userBookmarked?: boolean;
    };
  }>(`/blog/articles/${encodeURIComponent(idOrSlug)}`, undefined, options);

  return legacyArticle(data.article);
}

/**
 * Relacionados como o legado mostrava: os mais recentes da primeira categoria
 * do artigo, no formato de cartão (o `relatedArticles` do detalhe não traz
 * autor nem contagens).
 */
export async function getRelatedArticles(
  article: Pick<LegacyArticle, 'id' | 'categories'>,
  limit = 4,
  options: BlogReadOptions = {}
) {
  const slug = article.categories[0]?.category.slug;

  if (!slug) {
    return [];
  }

  const { articles } = await listArticles(
    { categories: [slug], limit: limit + 1 },
    options
  );

  return articles.filter((item) => item.id !== article.id).slice(0, limit);
}

/** Tipo do áudio de fundo, como a página do artigo decidia. */
export function backgroundAudioType(
  url?: string | null
): 'upload' | 'youtube' | null {
  if (!url || url.trim() === '') return null;
  return url.includes('youtube.com') || url.includes('youtu.be')
    ? 'youtube'
    : 'upload';
}
