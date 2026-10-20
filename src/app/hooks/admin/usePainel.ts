'use client';

import {
  getAssinatura,
  getAtividade,
  getUsuario,
  getItensDoUsuario,
  getResumoUsuarios,
  type ItemDoUsuario,
  type TipoDeItem,
  getDenuncias,
  getEstatisticasDenuncias,
  resolverDenuncia,
  resolverDenuncias,
  getAnaliseUsuarios,
  getContribuidores,
  getInsightsDaArea,
  getMaisAnotadas,
  getMetricasCatalogo,
  getObrasPorEpoca,
  getPanorama,
  getAssinaturas,
  getAuditoria,
  getFacetasAuditoria,
  getPanoramaAssinaturas,
  getPendencias,
  getResumoAuditoria,
  type AcaoDenuncia,
  type Denuncia,
  type EstadoDenuncia,
  type FiltrosAssinatura,
  type FiltrosAuditoria,
  type LinhaAssinatura,
  type PeriodoAnalise,
  type RegistroAuditoria,
} from '@/app/requests/admin/painel';
import {
  adminKeys,
  useAdminInfinite,
  useAdminMutation,
  useAdminQuery,
} from './query';
import {
  listAdminUsers,
  type UserListFilters,
} from '@/app/requests/admin/users';
import type { AdminUser } from '@/app/requests/admin/users';

/**
 * Os hooks das telas redesenhadas (29/09/2026). Mesma base dos outros
 * (`query.ts`): cache por área, cursor nas listas, invalidação por área.
 */

/**
 * As pendências alimentam o topo do painel **e** os números do menu, que
 * ficam de pé em toda tela: uma chamada a cada dois minutos, compartilhada.
 */
export const usePendencias = (ativo = true) =>
  useAdminQuery(adminKeys.list('pendencias'), getPendencias, {
    enabled: ativo,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

export const usePanoramaAssinaturas = (dias: number) =>
  useAdminQuery(adminKeys.list('assinaturas', { panorama: dias }), () =>
    getPanoramaAssinaturas(dias)
  );

export const useAssinaturas = (filtros: FiltrosAssinatura) =>
  useAdminInfinite<LinhaAssinatura>(
    adminKeys.list('assinaturas', { lista: filtros }),
    async (cursor) => {
      const r = await getAssinaturas(filtros, cursor);
      return { items: r.items, total: r.total, nextCursor: r.nextCursor };
    }
  );

export const useAssinatura = (id: string | null) =>
  useAdminQuery(
    adminKeys.list('assinaturas', { detalhe: id }),
    () => getAssinatura(id as string),
    { enabled: !!id }
  );

export const useAuditoria = (filtros: FiltrosAuditoria, limit = 50) =>
  useAdminInfinite<RegistroAuditoria>(
    adminKeys.list('auditoria', { filtros, limit }),
    async (cursor) => {
      const r = await getAuditoria(filtros, cursor, limit);
      return {
        items: r.entries,
        total: r.pagination.total,
        nextCursor: r.pagination.nextCursor,
      };
    }
  );

export const useFacetasAuditoria = () =>
  useAdminQuery(adminKeys.list('auditoria', 'facetas'), getFacetasAuditoria, {
    staleTime: 5 * 60_000,
  });

export const useResumoAuditoria = (dias: number) =>
  useAdminQuery(adminKeys.list('auditoria', { resumo: dias }), () =>
    getResumoAuditoria(dias)
  );

export const useAtividade = (dias: number) =>
  useAdminQuery(adminKeys.list('atividade', dias), () => getAtividade(dias), {
    staleTime: 5 * 60_000,
  });

export const usePanorama = () =>
  useAdminQuery(adminKeys.list('panorama'), getPanorama, {
    staleTime: 5 * 60_000,
  });

const CINCO_MIN = 5 * 60_000;

export const useAnaliseUsuarios = (period: PeriodoAnalise) =>
  useAdminQuery(adminKeys.list('uso', { usuarios: period }), () =>
    getAnaliseUsuarios(period)
  );

export const useMetricasCatalogo = () =>
  useAdminQuery(adminKeys.list('uso', 'catalogo'), getMetricasCatalogo, {
    staleTime: CINCO_MIN,
  });

export const useObrasPorEpoca = () =>
  useAdminQuery(adminKeys.list('uso', 'epocas'), getObrasPorEpoca, {
    staleTime: CINCO_MIN,
  });

export const useMaisAnotadas = () =>
  useAdminQuery(adminKeys.list('uso', 'anotadas'), getMaisAnotadas, {
    staleTime: CINCO_MIN,
  });

export const useContribuidores = () =>
  useAdminQuery(adminKeys.list('uso', 'contribuidores'), getContribuidores, {
    staleTime: CINCO_MIN,
  });

export const useInsightsDaArea = (areas: string) =>
  useAdminQuery(
    adminKeys.list('insights', areas),
    () => getInsightsDaArea(areas),
    {
      staleTime: CINCO_MIN,
    }
  );

// A fila de denúncias pagina por página, não por cursor: o número da página
// faz as vezes de cursor para a lista acumular ao rolar.
export const useDenuncias = (filtros: {
  status: EstadoDenuncia;
  entityType?: string;
  entityId?: string;
}) =>
  useAdminInfinite<Denuncia>(
    adminKeys.list('denuncias', filtros),
    async (cursor) => {
      const pagina = Number(cursor ?? 1);
      const r = await getDenuncias(filtros, pagina);
      return {
        items: r.reports,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

export const useEstatisticasDenuncias = (dias = 30) =>
  useAdminQuery(adminKeys.list('denuncias', { estatisticas: dias }), () =>
    getEstatisticasDenuncias(dias)
  );

/** Resolver mexe na fila, nos números e no contador do menu. */
export const useResolverDenuncia = () =>
  useAdminMutation(
    (id: string, action: AcaoDenuncia, notes?: string) =>
      resolverDenuncia(id, action, notes),
    ['denuncias', 'pendencias', 'auditoria']
  );

export const useResolverDenuncias = () =>
  useAdminMutation(
    (ids: string[], action: Exclude<AcaoDenuncia, 'delete'>) =>
      resolverDenuncias(ids, action),
    ['denuncias', 'pendencias', 'auditoria']
  );

export const useUsuarios = (filtros: UserListFilters) =>
  useAdminInfinite<AdminUser>(
    adminKeys.list('usuarios', filtros),
    async (cursor) => {
      const r = await listAdminUsers({ ...filtros, limit: 50 }, cursor);
      return { items: r.users, total: r.total, nextCursor: r.nextCursor };
    }
  );

export const useResumoUsuarios = () =>
  useAdminQuery(adminKeys.list('usuarios', { resumo: true }), () =>
    getResumoUsuarios()
  );

/** A lista por trás de um número do detalhe; a página é o cursor. */
export const useItensDoUsuario = (id: string | null, tipo: TipoDeItem | null) =>
  useAdminInfinite<ItemDoUsuario>(
    adminKeys.list('usuarios', { itens: id, tipo }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await getItensDoUsuario(
        id as string,
        tipo as TipoDeItem,
        pagina
      );
      return {
        items: r.items,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    },
    { enabled: !!id && !!tipo }
  );

export const useUsuario = (id: string | null) =>
  useAdminQuery(
    adminKeys.list('usuarios', { detalhe: id }),
    () => getUsuario(id as string),
    {
      enabled: !!id,
    }
  );
