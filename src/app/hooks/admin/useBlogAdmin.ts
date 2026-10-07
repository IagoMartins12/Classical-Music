'use client';

import {
  loadFeaturedArticles,
  reorderFeaturedArticles,
} from '@/app/requests/blog/admin-actions';
import {
  agendarScraper,
  desagendarScraper,
  getAgendamentosScraper,
  getCasas,
  rodarScraper,
  rodarTodosScrapers,
  apagarCategoria,
  apagarTag,
  ativarCategoria,
  getCategoriasAdmin,
  getTagsAdmin,
  reordenarCategorias,
  apagarArtigo,
  aprovarArtigo,
  definirSecoesDoInicio,
  destacarArtigo,
  duplicarArtigo,
  getArtigos,
  getCategoriasDoBlog,
  getPanoramaArtigos,
  publicarArtigo,
  type ArtigoAdmin,
  getComentarios,
  getConversa,
  moderarComentario,
  type AcaoComentario,
  type ComentarioAdmin,
  type EstadoComentario,
} from '@/app/requests/admin/blog';
import {
  adminKeys,
  useAdminInfinite,
  useAdminMutation,
  useAdminQuery,
} from './query';

export const useComentarios = (f: {
  status?: EstadoComentario;
  onlyReplies?: boolean;
}) =>
  useAdminInfinite<ComentarioAdmin>(
    adminKeys.list('blog', { comentarios: f }),
    async (cursor) => {
      const pagina = Number(cursor ?? 1);
      const r = await getComentarios(f, pagina);
      return {
        items: r.comments,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

/** As contagens por estado vêm em toda página; esta busca só a primeira. */
export const useContagemComentarios = () =>
  useAdminQuery(
    adminKeys.list('blog', 'contagens'),
    async () => (await getComentarios({}, 1)).counts
  );

export const useConversa = (id: string | null) =>
  useAdminQuery(
    adminKeys.list('blog', { conversa: id }),
    () => getConversa(id as string),
    { enabled: !!id }
  );

export const useModerarComentario = () =>
  useAdminMutation(
    (id: string, acao: AcaoComentario, notas?: string) =>
      moderarComentario(id, acao, notas),
    ['blog', 'pendencias', 'auditoria']
  );

export const usePanoramaArtigos = () =>
  useAdminQuery(adminKeys.list('blog', 'panorama'), getPanoramaArtigos);

export const useArtigos = (f: Parameters<typeof getArtigos>[0]) =>
  useAdminInfinite<ArtigoAdmin>(
    adminKeys.list('blog', { artigos: f }),
    async (cursor) => {
      const pagina = Number(cursor ?? 1);
      const r = await getArtigos(f, pagina);
      return {
        items: r.articles,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

export const useCategoriasDoBlog = () =>
  useAdminQuery(adminKeys.list('blog', 'categorias'), getCategoriasDoBlog, {
    staleTime: 10 * 60_000,
  });

const TOCA_BLOG = ['blog', 'pendencias', 'auditoria'];
export const usePublicarArtigo = () =>
  useAdminMutation(
    (id: string, a: 'publish' | 'unpublish') => publicarArtigo(id, a),
    TOCA_BLOG
  );
export const useAprovarArtigo = () =>
  useAdminMutation((id: string) => aprovarArtigo(id), TOCA_BLOG);
export const useDestacarArtigo = () =>
  useAdminMutation(
    (id: string, v: boolean) => destacarArtigo(id, v),
    TOCA_BLOG
  );
export const useDuplicarArtigo = () =>
  useAdminMutation((id: string) => duplicarArtigo(id), TOCA_BLOG);
export const useApagarArtigo = () =>
  useAdminMutation((id: string) => apagarArtigo(id), TOCA_BLOG);

export const useCategoriasAdmin = () =>
  useAdminQuery(adminKeys.list('blog', 'categorias-admin'), getCategoriasAdmin);
export const useTagsAdmin = () =>
  useAdminQuery(adminKeys.list('blog', 'tags-admin'), getTagsAdmin);
export const useAtivarCategoria = () =>
  useAdminMutation(
    (id: string, v: boolean) => ativarCategoria(id, v),
    TOCA_BLOG
  );
export const useApagarCategoria = () =>
  useAdminMutation((id: string) => apagarCategoria(id), TOCA_BLOG);
export const useReordenarCategorias = () =>
  useAdminMutation(
    (ordem: { id: string; order: number }[]) => reordenarCategorias(ordem),
    TOCA_BLOG
  );
export const useSecoesDoInicio = () =>
  useAdminMutation((ids: string[]) => definirSecoesDoInicio(ids), TOCA_BLOG);
export const useDestaquesDoBlog = () =>
  useAdminQuery(adminKeys.list('blog', 'destaques'), loadFeaturedArticles);
export const useReordenarDestaques = () =>
  useAdminMutation(
    (ordem: { id: string; featuredOrder: number }[]) =>
      reorderFeaturedArticles(ordem),
    TOCA_BLOG
  );
export const useApagarTag = () =>
  useAdminMutation((id: string) => apagarTag(id), TOCA_BLOG);

export const useCasas = () =>
  useAdminQuery(adminKeys.list('scrapers', 'casas'), getCasas, {
    staleTime: 60 * 60_000,
  });
export const useAgendamentosScraper = () =>
  useAdminQuery(
    adminKeys.list('scrapers', 'agendamentos'),
    getAgendamentosScraper
  );
const TOCA_SCRAPER = ['scrapers', 'auditoria'];
export const useAgendarScraper = () =>
  useAdminMutation(
    (id: string, cron: string) => agendarScraper(id, cron),
    TOCA_SCRAPER
  );
export const useDesagendarScraper = () =>
  useAdminMutation((id: string) => desagendarScraper(id), TOCA_SCRAPER);
export const useRodarTodosScrapers = () =>
  useAdminMutation(() => rodarTodosScrapers(), [...TOCA_SCRAPER, 'jobs']);
export const useRodarScraper = () =>
  useAdminMutation((id: string) => rodarScraper(id), [...TOCA_SCRAPER, 'jobs']);
