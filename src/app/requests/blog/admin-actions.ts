// app/requests/blog/admin-actions.ts — ações do painel do blog, pela API (Etapa 6)
//
// Navegador: vão com a sessão (cookie). A API recusa campo desconhecido, então
// cada corpo é montado campo a campo a partir do formulário.
import { apiFetch } from '@/app/libs/api/client';

type Method = 'POST' | 'PATCH' | 'DELETE';

const call = <T = unknown>(path: string, method: Method, body?: unknown) =>
  apiFetch<T>(path, { method, body });

// ---------------------------------------------------------------------------
// Artigos
// ---------------------------------------------------------------------------

/** O que o formulário de artigo guarda (`ArticleForm`). */
export interface ArticleFormValues {
  title: string;
  slug: string;
  description?: string | null;
  content: unknown;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  coverImageCredit?: string | null;
  status: string;
  isFeatured: boolean;
  featuredOrder?: number | null;
  types: string[];
  categoryIds: string[];
  tags: string[];
  composerIds: string[];
  workIds: string[];
  scoreIds: string[];
  instrumentIds: string[];
  epochIds: string[];
  backgroundMusic?: {
    url?: string;
    title?: string;
    volume?: number;
    loop?: boolean;
    autoplay?: boolean;
  };
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords: string[];
  scheduledFor?: string | null;
  readTime?: number;
}

const blank = (value?: string | null) =>
  value && value.trim() ? value.trim() : null;

/**
 * O corpo do artigo, campo a campo. A edição carrega o artigo inteiro da API
 * (autor, contagens, mídia...) no formulário; nada disso pode ir de volta.
 * As tags vão pelo nome — a API cria as que não existem.
 */
export function articleBody(values: ArticleFormValues) {
  const music = values.backgroundMusic;

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    description: blank(values.description),
    content: values.content ?? {},
    coverImage: blank(values.coverImage),
    coverImageAlt: blank(values.coverImageAlt),
    coverImageCredit: blank(values.coverImageCredit),
    status: values.status,
    isFeatured: values.isFeatured,
    ...(values.isFeatured && typeof values.featuredOrder === 'number'
      ? { featuredOrder: values.featuredOrder }
      : {}),
    types: values.types,
    categoryIds: values.categoryIds,
    tags: values.tags,
    composerIds: values.composerIds,
    workIds: values.workIds,
    scoreIds: values.scoreIds,
    instrumentIds: values.instrumentIds,
    epochIds: values.epochIds,
    backgroundMusic: music?.url
      ? {
          url: music.url,
          title: blank(music.title),
          volume: music.volume,
          loop: music.loop,
          autoplay: music.autoplay,
        }
      : null,
    metaTitle: blank(values.metaTitle),
    metaDescription: blank(values.metaDescription),
    keywords: values.keywords,
    // O campo da tela é `datetime-local` (sem fuso): vai em ISO.
    scheduledFor: values.scheduledFor
      ? new Date(values.scheduledFor).toISOString()
      : null,
    ...(values.readTime ? { readTime: values.readTime } : {}),
  };
}

interface SavedArticle {
  article?: { id: string; slug: string };
}

export const createArticle = (values: ArticleFormValues) =>
  call<SavedArticle>('/blog/articles', 'POST', articleBody(values));

export const updateArticle = (id: string, values: ArticleFormValues) =>
  call<SavedArticle>(`/blog/articles/${id}`, 'PATCH', articleBody(values));

/** O artigo como a API manda (categorias e tags planas), para a edição. */
export async function loadArticleForEdit(id: string) {
  const data = await apiFetch<{ article: Record<string, any> }>(
    `/blog/articles/${id}`,
    { cache: 'no-store' }
  );

  return data.article;
}

export const deleteArticle = (id: string) =>
  call(`/blog/articles/${id}`, 'DELETE');

export const duplicateArticle = (id: string) =>
  call(`/blog/articles/${id}/duplicate`, 'POST');

/** Aprova e publica (a prévia). */
export const approveArticle = (id: string) =>
  call(`/blog/articles/${id}/approve`, 'POST');

export interface FeaturedEntry {
  id: string;
  title: string;
  featuredOrder: number;
}

export async function loadFeaturedArticles(): Promise<FeaturedEntry[]> {
  const data = await apiFetch<{
    articles: Array<{
      id: string;
      title: string;
      featuredOrder: number | null;
    }>;
  }>('/blog/articles/featured', { cache: 'no-store' });

  return data.articles.map((article) => ({
    ...article,
    featuredOrder: article.featuredOrder ?? 0,
  }));
}

export const reorderFeaturedArticles = (
  articles: Array<{ id: string; featuredOrder: number }>
) =>
  call('/blog/articles/featured/reorder', 'POST', {
    articles: articles.map(({ id, featuredOrder }) => ({ id, featuredOrder })),
  });

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

/** A imagem não vai no corpo: sobe pela rota própria, com o id da categoria. */
const categoryBody = (input: CategoryInput) => ({
  name: input.name.trim(),
  slug: input.slug.trim(),
  description: input.description.trim() || null,
  icon: input.icon.trim() || null,
  color: input.color || null,
  isActive: input.isActive,
});

export async function createCategory(
  input: CategoryInput
): Promise<{ id: string }> {
  const data = await call<{ category?: { id: string }; id?: string }>(
    '/blog/admin/categories',
    'POST',
    categoryBody(input)
  );

  return { id: data.category?.id ?? data.id ?? '' };
}

export const updateCategory = (id: string, input: CategoryInput) =>
  call(`/blog/admin/categories/${id}`, 'PATCH', categoryBody(input));

export const setCategoryActive = (id: string, isActive: boolean) =>
  call(`/blog/admin/categories/${id}`, 'PATCH', { isActive });

export const deleteCategory = (id: string) =>
  call(`/blog/admin/categories/${id}`, 'DELETE');

export const reorderCategories = (
  categories: Array<{ id: string; order: number }>
) =>
  call('/blog/admin/categories/reorder', 'POST', {
    categories: categories.map(({ id, order }) => ({ id, order })),
  });

/** Envia a imagem da categoria e devolve a URL gravada. */
export async function uploadCategoryImage(
  id: string,
  file: File
): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const data = await apiFetch<{
    url?: string;
    image?: string;
    category?: { image?: string | null };
  }>(`/blog/admin/categories/${id}/image`, { method: 'POST', body: form });

  return data.url ?? data.image ?? data.category?.image ?? '';
}

export const removeCategoryImage = (id: string) =>
  call(`/blog/admin/categories/${id}/image`, 'DELETE');

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export interface TagInput {
  name: string;
  slug: string;
  description: string;
  color: string;
}

const tagBody = (input: TagInput) => ({
  name: input.name.trim(),
  slug: input.slug.trim(),
  description: input.description.trim() || null,
  color: input.color || null,
});

export const createTag = (input: TagInput) =>
  call('/blog/admin/tags', 'POST', tagBody(input));

export const updateTag = (id: string, input: TagInput) =>
  call(`/blog/admin/tags/${id}`, 'PATCH', tagBody(input));

export const deleteTag = (id: string) =>
  call(`/blog/admin/tags/${id}`, 'DELETE');

// ---------------------------------------------------------------------------
// Moderação de comentários
// ---------------------------------------------------------------------------

export type ModerationAction = 'approve' | 'reject' | 'spam';

/**
 * Reprovar exige justificativa na API. Pergunta aqui; `null` quando a pessoa
 * desistiu ou deixou em branco.
 */
export function askRejectionNotes(): string | null {
  const notes = window.prompt('Motivo da reprovação (obrigatório):');
  return notes?.trim() ? notes.trim() : null;
}

export const moderateComment = (
  id: string,
  action: ModerationAction,
  notes?: string
) =>
  call(
    `/blog/admin/comments/${id}`,
    'PATCH',
    notes ? { action, notes } : { action }
  );

export async function loadCommentThread<T>(id: string): Promise<T> {
  const data = await apiFetch<{ thread: T }>(
    `/blog/admin/comments/${id}/thread`,
    { cache: 'no-store' }
  );

  return data.thread;
}
