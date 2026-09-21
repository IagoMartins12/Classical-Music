// app/requests/blog/interactions.ts — o que o leitor faz no blog, pela API (Etapa 6)
//
// Navegador, com a sessão (cookie): curtir, salvar, comentar e denunciar, as
// listas "salvos" e "curtidos", o áudio do artigo e o envio de mídia do
// editor. Devolve o formato que os componentes liam das rotas do legado.
import { apiFetch } from '@/app/libs/api/client';
import { legacyArticle, type ApiArticle, type ApiPagination } from './articles';

// ---------------------------------------------------------------------------
// Curtir e salvar
// ---------------------------------------------------------------------------

export interface ArticleInteractionState {
  likesCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export const loadArticleInteractions = (articleId: string) =>
  apiFetch<ArticleInteractionState>(
    `/blog/interactions/articles/${articleId}`,
    { cache: 'no-store' }
  );

export const setArticleLiked = (articleId: string, liked: boolean) =>
  apiFetch(`/blog/interactions/articles/${articleId}/like`, {
    method: liked ? 'POST' : 'DELETE',
  });

export const setArticleBookmarked = (articleId: string, saved: boolean) =>
  apiFetch(`/blog/interactions/articles/${articleId}/bookmark`, {
    method: saved ? 'POST' : 'DELETE',
  });

/**
 * "Salvos" e "curtidos": a API já manda as categorias no formato aninhado
 * (`{ category }`) — o componente não embrulha de novo.
 */
async function savedArticles(
  path: 'my-likes' | 'my-bookmarks',
  key: 'likes' | 'bookmarks',
  page: number,
  category?: string
) {
  const data = await apiFetch<
    { pagination: ApiPagination } & Partial<
      Record<'likes' | 'bookmarks', Array<{ article: ApiArticle }>>
    >
  >(`/blog/interactions/${path}`, {
    query: {
      page,
      limit: 12,
      category: category && category !== 'all' ? category : undefined,
    },
    cache: 'no-store',
  });

  return {
    articles: (data[key] ?? []).map((entry) => legacyArticle(entry.article)),
    pagination: data.pagination,
  };
}

export const loadMyLikes = (page: number, category?: string) =>
  savedArticles('my-likes', 'likes', page, category);

export const loadMyBookmarks = (page: number, category?: string) =>
  savedArticles('my-bookmarks', 'bookmarks', page, category);

// ---------------------------------------------------------------------------
// Comentários
// ---------------------------------------------------------------------------

interface ApiComment {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  status: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  } | null;
  deleted?: boolean;
  userLiked?: boolean;
  likeCount?: number;
  _count?: { likes: number };
  replies?: ApiComment[];
}

export interface LegacyComment extends Omit<
  ApiComment,
  'createdAt' | 'user' | 'replies'
> {
  createdAt: Date;
  user: NonNullable<ApiComment['user']>;
  replies: LegacyComment[];
  _count: { likes: number };
}

/**
 * Comentário apagado que ainda tem resposta vem como "Comentário removido",
 * sem autor: fica um autor vazio, que não é dono de nada.
 */
function legacyComment(comment: ApiComment): LegacyComment {
  return {
    ...comment,
    createdAt: new Date(comment.createdAt),
    user: comment.user ?? {
      id: '',
      firstName: null,
      lastName: null,
      image: null,
    },
    _count: { likes: comment._count?.likes ?? comment.likeCount ?? 0 },
    replies: (comment.replies ?? []).map(legacyComment),
  };
}

export async function loadComments(articleId: string) {
  const data = await apiFetch<{ comments: ApiComment[] }>(
    `/blog/comments/article/${articleId}`,
    { cache: 'no-store' }
  );

  return data.comments.map(legacyComment);
}

/** A API tira o artigo do endereço: o corpo leva só o texto e a resposta. */
export const createComment = (
  articleId: string,
  content: string,
  parentId?: string
) =>
  apiFetch(`/blog/comments/article/${articleId}`, {
    method: 'POST',
    body: parentId ? { content, parentId } : { content },
  });

export const updateComment = (id: string, content: string) =>
  apiFetch(`/blog/comments/${id}`, { method: 'PATCH', body: { content } });

export const deleteComment = (id: string) =>
  apiFetch(`/blog/comments/${id}`, { method: 'DELETE' });

export const setCommentLiked = (id: string, liked: boolean) =>
  apiFetch(`/blog/comments/${id}/like`, { method: liked ? 'POST' : 'DELETE' });

/**
 * A tela pede só o motivo; a API pede também a categoria da denúncia, que
 * vai como "outro".
 */
export const reportComment = (id: string, reason: string) =>
  apiFetch(`/blog/comments/${id}/flag`, {
    method: 'POST',
    body: { category: 'other', reason },
  });

// ---------------------------------------------------------------------------
// Áudio do artigo (texto para fala)
// ---------------------------------------------------------------------------

/**
 * Gera (ou devolve o já gerado) o áudio do artigo. A API lê o texto do
 * próprio artigo, no servidor — o texto montado na página não vai.
 */
export async function generateArticleAudio(
  articleId: string,
  options: {
    voiceName?: string;
    speakingRate?: number;
    regenerate?: boolean;
  } = {}
) {
  const data = await apiFetch<{ audioUrl: string }>('/blog/tts/google', {
    method: 'POST',
    body: { articleId, ...options },
  });

  return data.audioUrl;
}

// ---------------------------------------------------------------------------
// Mídia do editor
// ---------------------------------------------------------------------------

export type BlogMediaFolder =
  | 'thumbnail'
  | 'content'
  | 'timeline'
  | 'gallery'
  | 'images'
  | 'audio';

/**
 * Envia imagem ou áudio do editor e devolve a URL. Artigo novo ainda não tem
 * id: o arquivo vai com a sessão do editor e é ligado ao artigo quando ele é
 * salvo.
 */
export async function uploadBlogMedia(
  file: Blob,
  options: {
    folder: BlogMediaFolder;
    articleId?: string;
    sessionId?: string;
    fileName?: string;
  }
): Promise<string> {
  const form = new FormData();
  form.append('folder', options.folder);

  if (options.articleId) {
    form.append('articleId', options.articleId);
  } else if (options.sessionId) {
    form.append('sessionId', options.sessionId);
  }

  if (options.fileName) {
    form.append('file', file, options.fileName);
  } else {
    form.append('file', file);
  }

  const data = await apiFetch<{ url: string }>('/blog/media/upload', {
    method: 'POST',
    body: form,
  });

  return data.url;
}

/**
 * Tira um arquivo enviado pelo editor. A API só apaga o que ela mesma enviou
 * e o que não está em uso; nos outros casos responde `deleted: false`.
 */
export const removeBlogMedia = (url: string) =>
  apiFetch<{ deleted: boolean; message?: string }>('/blog/media/upload', {
    method: 'DELETE',
    query: { url },
  });
