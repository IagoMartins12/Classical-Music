/**
 * Newsletter no painel redesenhado, no formato da API
 * (`/admin/newsletter/*`). As ações de campanha (enviar, cancelar, duplicar,
 * apagar) reaproveitam `newsletter.ts`.
 */
import { apiFetch } from '@/app/libs/api/client';
import { downloadFromApi } from './common';

const noStore = { cache: 'no-store' as const };

export type PeriodoNews = '7d' | '30d' | '90d' | '1y';

export interface EstatisticasNews {
  subscribersByStatus: Record<string, number>;
  campaignsByStatus: Record<string, number>;
  emails: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    deliveryRate: number | null;
    openRate: number | null;
    clickRate: number | null;
  };
}

export interface NumerosNews {
  period: PeriodoNews;
  subscribers: { gained: number; lost: number; net: number };
  campaigns: { sent: number };
  emails: EstatisticasNews['emails'];
  topCampaigns: {
    id: string;
    name: string;
    sentAt: string | null;
    emailsSent: number;
    emailsDelivered: number;
    emailsOpened: number;
    emailsClicked: number;
    openRate: number | null;
  }[];
}

export const getEstatisticasNews = () =>
  apiFetch<EstatisticasNews>('/admin/newsletter/stats', noStore);

export const getNumerosNews = (period: PeriodoNews) =>
  apiFetch<NumerosNews>('/admin/newsletter/analytics', {
    ...noStore,
    query: { period },
  });

export const exportarNumerosNews = (period: PeriodoNews) =>
  downloadFromApi(
    '/admin/newsletter/analytics/export',
    { period, format: 'csv' },
    `newsletter-${period}-${new Date().toISOString().slice(0, 10)}.csv`
  );

export type EstadoCampanha =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'PAUSED'
  | 'CANCELLED'
  | 'FAILED';

export interface Campanha {
  id: string;
  name: string;
  subject: string;
  status: EstadoCampanha;
  templateId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  totalSubscribers: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsBounced?: number;
  emailsComplained?: number;
  emailsUnsubscribed?: number;
  testEmailSent?: boolean;
  targetAll?: boolean;
}

export const getCampanhas = (
  f: { status?: EstadoCampanha; search?: string },
  page: number
) =>
  apiFetch<{
    campaigns: Campanha[];
    pagination: { total: number; totalPages: number };
  }>('/admin/newsletter/campaigns', {
    ...noStore,
    query: {
      page,
      limit: 20,
      status: f.status,
      search: f.search?.trim() || undefined,
    },
  });

export const getCampanha = (id: string) =>
  apiFetch<Campanha & Record<string, unknown>>(
    `/admin/newsletter/campaigns/${id}`,
    noStore
  );

export type EstadoAssinante =
  | 'ACTIVE'
  | 'PENDING'
  | 'UNSUBSCRIBED'
  | 'BOUNCED'
  | 'BLOCKED';

export interface AssinanteNews {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: EstadoAssinante;
  frequency: string | null;
  language: string | null;
  interests: string[];
  experienceLevel: string | null;
  emailOpenCount: number;
  emailClickCount: number;
  avgEngagementScore: number | null;
  lastEmailOpenedAt: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export const getAssinantesNews = (
  f: { status?: EstadoAssinante; search?: string },
  page: number
) =>
  apiFetch<{
    subscribers: AssinanteNews[];
    pagination: { total: number; totalPages: number };
  }>('/admin/newsletter/subscribers', {
    ...noStore,
    query: {
      page,
      limit: 30,
      status: f.status,
      search: f.search?.trim() || undefined,
      sortBy: 'subscribedAt',
      sortOrder: 'desc',
    },
  });

export const exportarAssinantesNews = (status?: EstadoAssinante) =>
  downloadFromApi(
    '/admin/newsletter/subscribers/export',
    { status, format: 'csv' },
    `assinantes-newsletter-${new Date().toISOString().slice(0, 10)}.csv`
  );

export const descadastrarAssinante = (id: string) =>
  apiFetch(`/admin/newsletter/subscribers/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Modelos e listas de teste
// ---------------------------------------------------------------------------

export interface Modelo {
  id: string;
  name: string;
  type: string;
  subject: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Só a lista: o conteúdo de cada modelo vem no detalhe, quando for usado. */
export const getModelos = (f: { search?: string; isActive?: boolean }) =>
  apiFetch<{ templates: Modelo[] }>('/admin/newsletter/templates', {
    ...noStore,
    query: {
      limit: 100,
      search: f.search?.trim() || undefined,
      isActive: f.isActive,
    },
  }).then((r) => r.templates);

export const apagarModelos = (ids: string[]) =>
  apiFetch('/admin/newsletter/templates/bulk-delete', {
    method: 'POST',
    body: { templateIds: ids },
  });

export { getTemplateRequest as getModelo } from './newsletter';
export {
  listTestListsRequest as getListasDeTeste,
  type ApiTestList as ListaDeTeste,
} from './newsletter';

/** Um e-mail como o assinante recebe: variáveis preenchidas, no layout. */
export interface EmailPronto {
  subject: string;
  html: string;
  text: string;
}

export const previaDeEmail = (conteudo: {
  subject: string;
  htmlContent: string;
  textContent?: string;
}) =>
  apiFetch<EmailPronto>('/admin/newsletter/templates/preview', {
    method: 'POST',
    body: conteudo,
  });
