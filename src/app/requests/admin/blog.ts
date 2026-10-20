/**
 * Admin do blog no painel redesenhado (`/blog/admin/*` da API), chamado do
 * navegador como o resto do painel. As páginas antigas liam no servidor e
 * recarregavam a página inteira (`router.refresh()`) a cada aprovação.
 */
import { apiFetch } from '@/app/libs/api/client';

const noStore = { cache: 'no-store' as const };

export type EstadoComentario =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'FLAGGED'
  | 'SPAM';

export interface ComentarioAdmin {
  id: string;
  content: string;
  status: EstadoComentario;
  createdAt: string;
  isEdited: boolean;
  isFlagged?: boolean;
  parentId: string | null;
  pendingReports: number;
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

export interface ContagemComentarios {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  FLAGGED: number;
  SPAM: number;
  total: number;
  replies: number;
}

export const getComentarios = (
  f: { status?: EstadoComentario; onlyReplies?: boolean },
  page: number
) =>
  apiFetch<{
    comments: ComentarioAdmin[];
    counts: ContagemComentarios;
    pagination: { page: number; total: number; totalPages: number };
  }>('/blog/admin/comments', {
    ...noStore,
    query: {
      status: f.status,
      onlyReplies: f.onlyReplies || undefined,
      page,
      limit: 30,
    },
  });

export type AcaoComentario = 'approve' | 'reject' | 'spam';

export const moderarComentario = (
  id: string,
  action: AcaoComentario,
  notes?: string
) =>
  apiFetch(`/blog/admin/comments/${id}`, {
    method: 'PATCH',
    body: notes?.trim() ? { action, notes: notes.trim() } : { action },
  });

export interface NoDaConversa {
  id: string;
  content: string;
  status: EstadoComentario;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    image?: string | null;
  } | null;
  replies?: NoDaConversa[];
}

export const getConversa = (id: string) =>
  apiFetch<{ thread: NoDaConversa }>(
    `/blog/admin/comments/${id}/thread`,
    noStore
  ).then((r) => r.thread);

// ---------------------------------------------------------------------------
// Artigos
// ---------------------------------------------------------------------------

export type EstadoArtigo =
  | 'DRAFT'
  | 'REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface ArtigoAdmin {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  status: EstadoArtigo;
  isFeatured: boolean;
  types: string[];
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
  viewCount: number;
  readCount: number;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  categories: Array<{
    id?: string;
    name?: string;
    category?: { id: string; name: string };
  }>;
  _count: { comments: number; likes: number };
}

export interface PanoramaArtigos {
  total: number;
  porEstado: Partial<Record<EstadoArtigo, number>>;
  visualizacoes: number;
  autores: {
    id: string;
    nome: string;
    imagem: string | null;
    artigos: number;
  }[];
}

export const getPanoramaArtigos = () =>
  apiFetch<PanoramaArtigos>('/blog/articles/admin/overview', noStore);

export const getArtigos = (
  f: {
    status?: EstadoArtigo;
    search?: string;
    category?: string;
    type?: string;
    authorId?: string;
  },
  page: number
) =>
  apiFetch<{
    articles: ArtigoAdmin[];
    pagination: { page: number; total: number; totalPages: number };
  }>('/blog/articles', {
    ...noStore,
    query: {
      page,
      limit: 20,
      status: f.status,
      search: f.search?.trim() || undefined,
      categories: f.category || undefined,
      types: f.type || undefined,
      authorId: f.authorId || undefined,
      sortBy: 'newest',
    },
  });

export const publicarArtigo = (id: string, action: 'publish' | 'unpublish') =>
  apiFetch(`/blog/articles/${id}/publish`, {
    method: 'PATCH',
    body: { action },
  });
export const aprovarArtigo = (id: string) =>
  apiFetch(`/blog/articles/${id}/approve`, { method: 'POST' });
export const destacarArtigo = (id: string, isFeatured: boolean) =>
  apiFetch(`/blog/articles/${id}/feature`, {
    method: 'PATCH',
    body: { isFeatured },
  });
export const duplicarArtigo = (id: string) =>
  apiFetch<{ id?: string; article?: { id: string } }>(
    `/blog/articles/${id}/duplicate`,
    { method: 'POST' }
  );
export const apagarArtigo = (id: string) =>
  apiFetch(`/blog/articles/${id}`, { method: 'DELETE' });

export const getCategoriasDoBlog = () =>
  apiFetch<
    | { categories?: { id: string; name: string; slug: string }[] }
    | { id: string; name: string; slug: string }[]
  >('/blog/categories', noStore).then((r) =>
    Array.isArray(r) ? r : (r.categories ?? [])
  );

export const TIPOS_DE_ARTIGO: Record<string, string> = {
  COMPOSER_ANALYSIS: 'Análise de compositor',
  WORK_ANALYSIS: 'Análise de obra',
  INSTRUMENT_GUIDE: 'Guia de instrumento',
  MUSIC_HISTORY: 'História da música',
  TUTORIAL: 'Tutorial',
  TOP_LIST: 'Lista',
  INTERVIEW: 'Entrevista',
  NEWS: 'Notícia',
  CURIOSITY: 'Curiosidades',
  PERFORMANCE_VIDEO: 'Vídeo de performance',
  CONCERT_GUIDE: 'Guia de concerto',
  GENERAL: 'Geral',
};

// ---------------------------------------------------------------------------
// Categorias e tags
// ---------------------------------------------------------------------------

export interface CategoriaAdmin {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  showInMenu: boolean;
  isActive: boolean;
  image: string | null;
  order: number;
  showOnHome?: boolean;
  homeOrder?: number | null;
  articleCount?: number;
  _count?: { articles: number };
}

export interface TagAdmin {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
  _count?: { articles: number };
}

export const getCategoriasAdmin = () =>
  apiFetch<{ categories: CategoriaAdmin[] }>(
    '/blog/admin/categories',
    noStore
  ).then((r) => [...r.categories].sort((a, b) => a.order - b.order));

export const getTagsAdmin = () =>
  apiFetch<{ tags: TagAdmin[] }>('/blog/admin/tags', noStore).then(
    (r) => r.tags
  );

export const ativarCategoria = (id: string, isActive: boolean) =>
  apiFetch(`/blog/admin/categories/${id}`, {
    method: 'PATCH',
    body: { isActive },
  });
export const apagarCategoria = (id: string) =>
  apiFetch(`/blog/admin/categories/${id}`, { method: 'DELETE' });
export const reordenarCategorias = (ordem: { id: string; order: number }[]) =>
  apiFetch('/blog/admin/categories/reorder', {
    method: 'POST',
    body: { categories: ordem },
  });
/** As seções do início, de cima para baixo; as que ficam fora saem do início. */
export const definirSecoesDoInicio = (ids: string[]) =>
  apiFetch('/blog/admin/categories/home-sections', {
    method: 'POST',
    body: { ids },
  });
export const apagarTag = (id: string) =>
  apiFetch(`/blog/admin/tags/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Eventos importados (scrapers)
// ---------------------------------------------------------------------------

export interface CasaDeConcerto {
  id: string;
  venueName: string;
  venueSlug: string;
  baseUrl: string;
  /** Por que a casa está fora do ar; `null` quando roda. */
  desativado?: string | null;
}

export interface AgendamentoScraper {
  scraperId: string;
  cron: string | null;
  nextRunAt: string | null;
}

export const getCasas = () =>
  apiFetch<{ scrapers: CasaDeConcerto[] }>('/scrapers', noStore).then(
    (r) => r.scrapers
  );
export const getAgendamentosScraper = () =>
  apiFetch<{ schedules: AgendamentoScraper[]; timezone: string }>(
    '/scrapers/schedules',
    noStore
  );
export const agendarScraper = (id: string, cron: string) =>
  apiFetch(`/scrapers/schedules/${id}`, { method: 'PUT', body: { cron } });
export const desagendarScraper = (id: string) =>
  apiFetch(`/scrapers/schedules/${id}`, { method: 'DELETE' });
export const rodarTodosScrapers = () =>
  apiFetch<{ queued: number; jobs: { jobId: string }[] }>('/scrapers/run-all', {
    method: 'POST',
  });
export const rodarScraper = (id: string) =>
  apiFetch<{ jobId: string; alreadyQueued: boolean }>(`/scrapers/${id}/run`, {
    method: 'POST',
  });

/** O que uma rodada de scraper devolve ao terminar. */
export interface ResultadoDoScraper {
  scraperId: string;
  venueName: string;
  eventsFound: number;
  imported: number;
  duplicates: number;
  failed: number;
  durationMs: number;
  problems: string[];
  /**
   * `previa`: rodada pedida à mão, que só leu o site — nada entrou até alguém
   * escolher. `importar`: a agendada, que importa sozinha.
   */
  modo?: 'previa' | 'importar';
  /** Cada evento lido e o que houve com ele (até 300; rodadas antigas não têm). */
  eventos?: EventoDaRodada[];
}

export interface EventoDaRodada {
  /** Posição na prévia: é o que se escolhe para importar. */
  indice?: number;
  titulo: string;
  data: string | null;
  hora?: string | null;
  local?: string | null;
  url?: string | null;
  estado: 'novo' | 'importado' | 'ja-existia' | 'falhou';
  mensagem: string;
  eventId: string | null;
}

/** A prévia de uma rodada manual, conferida de novo contra a agenda. */
export const getPreviaDaRodada = (jobId: string) =>
  apiFetch<{
    scraperId: string;
    venueName: string;
    lidos: number;
    novos: number;
    eventos: EventoDaRodada[];
  }>(`/scrapers/runs/${jobId}/preview`, noStore);

/** Importa os escolhidos da prévia, pelas posições. */
export const importarDaPrevia = (jobId: string, indices: number[]) =>
  apiFetch<{
    escolhidos: number;
    importados: number;
    jaExistiam: number;
    falharam: number;
    eventos: EventoDaRodada[];
  }>(`/scrapers/runs/${jobId}/import`, {
    method: 'POST',
    body: { indices },
  });

export type EstadoDoEvento =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'CANCELLED'
  | 'POSTPONED'
  | 'COMPLETED';

export const NOME_DO_ESTADO_DO_EVENTO: Record<EstadoDoEvento, string> = {
  DRAFT: 'Rascunho',
  PENDING: 'Aguardando revisão',
  PUBLISHED: 'Publicado',
  CANCELLED: 'Cancelado',
  POSTPONED: 'Adiado',
  COMPLETED: 'Realizado',
};

/** Um evento que entrou por scraper, já no banco. */
export interface EventoImportado {
  id: string;
  title: string;
  slug: string;
  status: EstadoDoEvento;
  startDate: string;
  startTime: string | null;
  room: string | null;
  externalUrl: string | null;
  ticketUrl: string | null;
  createdAt: string;
  venue: { id: string; name: string; slug: string; city: string } | null;
}

export interface FiltroDeEventosImportados {
  scraperId?: string;
  status?: string;
  search?: string;
  when?: 'futuros' | 'passados';
  importedFrom?: string;
}

export const getEventosImportados = (
  filtro: FiltroDeEventosImportados,
  page = 1,
  limit = 25
) =>
  apiFetch<{
    items: EventoImportado[];
    pagination: { page: number; total: number; totalPages: number };
  }>('/scrapers/events', {
    cache: 'no-store',
    query: { ...filtro, page, limit },
  });

export interface EventoImportadoCompleto extends EventoImportado {
  subtitle: string | null;
  type: string;
  source: string;
  endDate: string | null;
  description: string | null;
  conductor: string | null;
  ensemble: string | null;
  soloists: string[];
  ticketInfo: string | null;
  isFree: boolean;
  imageUrl: string | null;
  externalId: string | null;
  updatedAt: string;
}

export const getEventoImportado = (id: string) =>
  apiFetch<EventoImportadoCompleto>(`/scrapers/events/${id}`, {
    cache: 'no-store',
  });
