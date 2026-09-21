// app/requests/blog/taxonomy.ts — categorias, tags e busca do blog pela API (Etapa 6)
//
// Isomórfico, como `articles.ts`: leitura pública com ISR e a tag de cada
// domínio. As contagens vêm da API (`articleCount`) no lugar do `_count` do
// Prisma; o formato devolvido é o que as telas liam.
import {
  BLOG_TAGS,
  blogRead,
  legacyArticle,
  type ApiArticle,
  type ApiPagination,
  type BlogReadOptions,
} from './articles';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  showInMenu: boolean;
  isActive: boolean;
  image: string | null;
  icon: string | null;
  color: string | null;
  coverImage: string | null;
  order: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  articleCount?: number;
  _count?: { articles: number };
}

export interface ApiTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: { articles: number };
}

/** Categoria com o `_count.articles` que as telas liam. */
export function legacyCategory(category: ApiCategory) {
  return {
    ...category,
    _count: {
      articles: category._count?.articles ?? category.articleCount ?? 0,
    },
  };
}

/**
 * Categorias ativas, na ordem do painel, com o número de artigos publicados.
 * A rota pública da API devolve também as inativas; o blog nunca as mostrou.
 */
export async function listCategories(options: BlogReadOptions = {}) {
  const data = await blogRead<{ categories: ApiCategory[] }>(
    '/blog/categories',
    { includeCount: 'true' },
    options,
    [BLOG_TAGS.categories, BLOG_TAGS.articles]
  );

  return data.categories
    .filter((category) => category.isActive)
    .map(legacyCategory);
}

/** Categoria ativa pelo slug; `null` se não existir ou estiver desativada. */
export async function getCategory(slug: string, options: BlogReadOptions = {}) {
  try {
    const data = await blogRead<{ category: ApiCategory }>(
      `/blog/categories/${encodeURIComponent(slug)}`,
      undefined,
      options,
      [BLOG_TAGS.categories, BLOG_TAGS.articles]
    );

    return data.category.isActive ? legacyCategory(data.category) : null;
  } catch (error: any) {
    if (error?.status === 404) return null;
    throw error;
  }
}

export async function listCategoryArticles(
  slug: string,
  page = 1,
  limit = 12,
  options: BlogReadOptions = {}
) {
  const data = await blogRead<{
    articles: ApiArticle[];
    pagination: ApiPagination;
  }>(
    `/blog/categories/${encodeURIComponent(slug)}/articles`,
    { page, limit },
    options,
    [BLOG_TAGS.categories, BLOG_TAGS.articles]
  );

  return {
    articles: data.articles.map(legacyArticle),
    pagination: data.pagination,
  };
}

export async function listTags(
  query: {
    limit?: number;
    sortBy?: 'popular' | 'alphabetical' | 'recent';
  } = {},
  options: BlogReadOptions = {}
) {
  const data = await blogRead<{ tags: ApiTag[] }>(
    '/blog/tags',
    { limit: query.limit, sortBy: query.sortBy },
    options,
    [BLOG_TAGS.tags, BLOG_TAGS.articles]
  );

  return data.tags;
}

export interface SearchQuery {
  q?: string;
  types?: string[];
  categories?: string[];
  tags?: string[];
  sortBy?: 'relevance' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

const list = (values?: string[]) =>
  values && values.length > 0 ? values.join(',') : undefined;

/**
 * Busca de artigos. Com termo, a busca textual da API (relevância); sem termo
 * — os links "Ver todos" da página de artigos —, a lista com os mesmos
 * filtros. Sempre sem cache: a busca é por pedido.
 */
export async function searchArticles(query: SearchQuery) {
  const q = query.q?.trim() ?? '';

  if (q.length >= 2) {
    const data = await blogRead<{
      results: ApiArticle[];
      pagination: ApiPagination;
    }>(
      '/blog/search',
      {
        q,
        types: list(query.types),
        categories: list(query.categories),
        tags: list(query.tags),
        sortBy: query.sortBy,
        page: query.page,
        limit: query.limit,
      },
      { fresh: true }
    );

    return {
      articles: data.results.map(legacyArticle),
      pagination: data.pagination,
    };
  }

  const data = await blogRead<{
    articles: ApiArticle[];
    pagination: ApiPagination;
  }>(
    '/blog/articles',
    {
      types: list(query.types),
      categories: list(query.categories),
      tags: list(query.tags),
      sortBy: query.sortBy === 'popular' ? 'popular' : 'newest',
      page: query.page,
      limit: query.limit,
    },
    { fresh: true }
  );

  return {
    articles: data.articles.map(legacyArticle),
    pagination: data.pagination,
  };
}

export interface Autocomplete {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
    articleCount?: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon?: string | null;
  }>;
}

/** Sugestões da busca (artigos, tags e categorias). */
export async function autocomplete(
  q: string,
  type: 'articles' | 'tags' | 'categories' | 'all' = 'all'
): Promise<Autocomplete> {
  const data = await blogRead<{ suggestions: Autocomplete }>(
    '/blog/search/autocomplete',
    { q, type },
    { fresh: true }
  );

  return data.suggestions ?? { articles: [], tags: [], categories: [] };
}
