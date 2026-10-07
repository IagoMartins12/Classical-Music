'use client';

import {
  cancelCampaignRequest,
  deleteCampaignRequest,
  duplicateCampaignRequest,
  sendCampaignRequest,
} from '@/app/requests/admin/newsletter';
import {
  apagarModelos,
  getListasDeTeste,
  getModelos,
  descadastrarAssinante,
  getAssinantesNews,
  getCampanha,
  getCampanhas,
  getEstatisticasNews,
  getNumerosNews,
  type AssinanteNews,
  type Campanha,
  type EstadoAssinante,
  type EstadoCampanha,
  type PeriodoNews,
} from '@/app/requests/admin/newsletterPainel';
import {
  adminKeys,
  useAdminInfinite,
  useAdminMutation,
  useAdminQuery,
} from './query';

/** Toda escrita da newsletter mexe nas listas, nos números, no painel e na trilha. */
const TOCA = ['newsletter', 'pendencias', 'auditoria'];

export const useEstatisticasNews = () =>
  useAdminQuery(adminKeys.list('newsletter', 'stats'), getEstatisticasNews);

export const useNumerosNews = (period: PeriodoNews) =>
  useAdminQuery(adminKeys.list('newsletter', { numeros: period }), () =>
    getNumerosNews(period)
  );

export const useCampanhas = (f: { status?: EstadoCampanha; search?: string }) =>
  useAdminInfinite<Campanha>(
    adminKeys.list('newsletter', { campanhas: f }),
    async (cursor) => {
      const pagina = Number(cursor ?? 1);
      const r = await getCampanhas(f, pagina);
      return {
        items: r.campaigns,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

export const useCampanha = (id: string | null) =>
  useAdminQuery(
    adminKeys.list('newsletter', { campanha: id }),
    () => getCampanha(id as string),
    { enabled: !!id }
  );

export const useAssinantesNews = (f: {
  status?: EstadoAssinante;
  search?: string;
}) =>
  useAdminInfinite<AssinanteNews>(
    adminKeys.list('newsletter', { assinantes: f }),
    async (cursor) => {
      const pagina = Number(cursor ?? 1);
      const r = await getAssinantesNews(f, pagina);
      return {
        items: r.subscribers,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

export const useEnviarCampanha = () =>
  useAdminMutation((id: string) => sendCampaignRequest(id), TOCA);
export const useCancelarCampanha = () =>
  useAdminMutation((id: string) => cancelCampaignRequest(id), TOCA);
export const useApagarCampanha = () =>
  useAdminMutation((id: string) => deleteCampaignRequest(id), TOCA);
export const useDuplicarCampanha = () =>
  useAdminMutation((id: string) => duplicateCampaignRequest(id), TOCA);
export const useDescadastrar = () =>
  useAdminMutation((id: string) => descadastrarAssinante(id), TOCA);

export const useModelos = (f: { search?: string; isActive?: boolean }) =>
  useAdminQuery(adminKeys.list('newsletter', { modelos: f }), () =>
    getModelos(f)
  );
export const useApagarModelos = () =>
  useAdminMutation((ids: string[]) => apagarModelos(ids), TOCA);
export const useListasDeTeste = () =>
  useAdminQuery(adminKeys.list('newsletter', 'listas-teste'), getListasDeTeste);
