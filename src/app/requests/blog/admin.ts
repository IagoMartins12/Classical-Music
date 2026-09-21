// app/requests/blog/admin.ts — leituras do painel do blog, pela API (Etapa 6)
//
// Servidor, com o token de quem está logado (administrador) e sem cache. Cada
// função devolve o formato que as páginas do painel liam do Prisma; o que a
// API não mede é somado aqui a partir das listas, nunca inventado.
import { apiFetch } from '@/app/libs/api/client';
import { listArticles, type LegacyArticle } from './articles';
import {
  legacyCategory,
  listCategories,
  type ApiCategory,
  type ApiTag,
} from './taxonomy';

function adminRead<T>(
  path: string,
  query: Record<string, string | number | boolean | undefined> | undefined,
  token?: string
): Promise<T> {
  return apiFetch<T>(path, { query, token, cache: 'no-store' });
}

// ---------------------------------------------------------------------------
// Artigos
// ---------------------------------------------------------------------------

export interface AdminArticlesParams {
  page?: string;
  search?: string;
  status?: string;
  category?: string;
  author?: string;
  type?: string;
}

/**
 * A lista do painel: com token de administrador a API mostra todos os
 * estados. A ordem é a da API (publicação mais recente primeiro; sem data de
 * publicação, no fim) — o legado ordenava pela última edição.
 */
export function loadAdminArticles(params: AdminArticlesParams, token?: string) {
  return listArticles(
    {
      page: Math.max(1, parseInt(params.page || '1') || 1),
      limit: 20,
      search: params.search || undefined,
      status: params.status || undefined,
      categories: params.category ? [params.category] : undefined,
      authorId: params.author || undefined,
      types: params.type ? [params.type] : undefined,
      sortBy: 'newest',
    },
    { token }
  );
}

const countArticles = async (status: string | undefined, token?: string) =>
  (await listArticles({ status, limit: 1 }, { token })).pagination.total;

/** Até 2.000 artigos (20 páginas de 100): a API não tem agregado. */
const MAX_SCAN_PAGES = 20;

async function scanArticles(token?: string): Promise<LegacyArticle[]> {
  const first = await listArticles({ page: 1, limit: 100 }, { token });
  const pages = Math.min(first.pagination.totalPages, MAX_SCAN_PAGES);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
      listArticles({ page: index + 2, limit: 100 }, { token })
    )
  );

  return [first, ...rest].flatMap((page) => page.articles);
}

/**
 * Os cartões e os filtros do painel de artigos. As visitas somadas e a lista
 * de autores saem da varredura dos artigos — o legado listava no filtro todas
 * as contas do site; agora só quem tem artigo.
 */
export async function loadAdminArticleOverview(token?: string) {
  const [total, published, draft, review, articles, categories] =
    await Promise.all([
      countArticles(undefined, token),
      countArticles('PUBLISHED', token),
      countArticles('DRAFT', token),
      countArticles('REVIEW', token),
      scanArticles(token),
      listCategories({ fresh: true }),
    ]);

  const totalViews = articles
    .filter((article) => article.status === 'PUBLISHED')
    .reduce((sum, article) => sum + (article.viewCount ?? 0), 0);

  const authors = new Map<string, LegacyArticle['author']>();
  for (const article of articles) {
    if (article.author && !authors.has(article.author.id)) {
      authors.set(article.author.id, article.author);
    }
  }

  return {
    stats: { total, published, draft, review, totalViews },
    filters: {
      categories: categories
        .map(({ id, name, slug, icon }) => ({ id, name, slug, icon }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      authors: [...authors.values()]
        .map(({ id, firstName, lastName, image }) => ({
          id,
          firstName,
          lastName,
          image,
        }))
        .sort((a, b) => (a.firstName ?? '').localeCompare(b.firstName ?? '')),
    },
  };
}

const publishedCount = () =>
  listArticles({ limit: 1 }, { fresh: true }).then(
    (page) => page.pagination.total
  );

// ---------------------------------------------------------------------------
// Categorias e tags
// ---------------------------------------------------------------------------

/** Todas as categorias (ativas e inativas), na ordem do painel. */
export async function loadAdminCategories(token?: string) {
  const data = await adminRead<{ categories: ApiCategory[] }>(
    '/blog/admin/categories',
    undefined,
    token
  );

  return data.categories.map(legacyCategory);
}

export async function loadAdminCategoriesPage(token?: string) {
  const [categories, totalArticles] = await Promise.all([
    loadAdminCategories(token),
    publishedCount(),
  ]);

  return {
    categories,
    stats: {
      totalCategories: categories.length,
      activeCategories: categories.filter((category) => category.isActive)
        .length,
      totalArticles,
    },
  };
}

/** A categoria pelo id, para a edição (a API busca só por slug). */
export async function loadAdminCategory(id: string, token?: string) {
  const categories = await loadAdminCategories(token);
  return categories.find((category) => category.id === id) ?? null;
}

/** Todas as tags, com a contagem real de artigos (incluindo rascunhos). */
export async function loadAdminTags(token?: string) {
  const data = await adminRead<{ tags: ApiTag[] }>(
    '/blog/admin/tags',
    undefined,
    token
  );

  return data.tags.map((tag) => ({
    ...tag,
    _count: { articles: tag._count?.articles ?? tag.articleCount ?? 0 },
  }));
}

export async function loadAdminTagsPage(search?: string, token?: string) {
  const [tags, totalArticles] = await Promise.all([
    loadAdminTags(token),
    publishedCount(),
  ]);

  const term = search?.trim().toLowerCase();
  const filtered = term
    ? tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(term) ||
          tag.slug.toLowerCase().includes(term)
      )
    : tags;

  return {
    tags: filtered,
    stats: {
      totalTags: tags.length,
      tagsWithArticles: tags.filter((tag) => tag._count.articles > 0).length,
      totalArticles,
    },
  };
}

export async function loadAdminTag(id: string, token?: string) {
  const tags = await loadAdminTags(token);
  return tags.find((tag) => tag.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Moderação de comentários
// ---------------------------------------------------------------------------

interface ApiAdminComment {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  isEdited: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
  parentId: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  } | null;
  article: { id: string; title: string; slug: string };
  _count?: { replies: number; likes?: number };
}

interface ApiCommentCounts {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  FLAGGED: number;
  SPAM: number;
  total: number;
  replies: number;
}

const MODERATION_FILTERS: Record<string, Record<string, string | boolean>> = {
  pending: { status: 'PENDING' },
  approved: { status: 'APPROVED' },
  rejected: { status: 'REJECTED' },
  spam: { status: 'SPAM' },
  flagged: { status: 'FLAGGED' },
  replies: { onlyReplies: true },
};

/**
 * Os 100 comentários mais recentes do filtro e as contagens. O comentário
 * respondido vem da própria página quando está nela (a API não o traz junto);
 * fora dela, a resposta aparece sem o trecho do original.
 */
export async function loadModeration(filter: string, token?: string) {
  const data = await adminRead<{
    comments: ApiAdminComment[];
    counts: ApiCommentCounts;
  }>(
    '/blog/admin/comments',
    { ...(MODERATION_FILTERS[filter] ?? {}), limit: 100 },
    token
  );

  const byId = new Map(data.comments.map((comment) => [comment.id, comment]));

  const comments = data.comments.map((comment) => {
    const parent = comment.parentId ? byId.get(comment.parentId) : undefined;

    return {
      ...comment,
      createdAt: new Date(comment.createdAt),
      user: comment.user ?? {
        id: '',
        firstName: null,
        lastName: null,
        email: null,
        image: null,
      },
      parent: parent
        ? {
            id: parent.id,
            content: parent.content,
            user: {
              firstName: parent.user?.firstName ?? null,
              lastName: parent.user?.lastName ?? null,
            },
          }
        : null,
    };
  });

  const counts = data.counts;

  return {
    comments,
    stats: {
      pending: counts.PENDING ?? 0,
      approved: counts.APPROVED ?? 0,
      rejected: counts.REJECTED ?? 0,
      spam: counts.SPAM ?? 0,
      flagged: counts.FLAGGED ?? 0,
      total: counts.total ?? 0,
      replies: counts.replies ?? 0,
    },
  };
}
