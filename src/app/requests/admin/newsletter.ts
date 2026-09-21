/**
 * Newsletter no painel (`/admin/newsletter/*` da API), no formato das telas.
 *
 * O que muda para quem usa o painel:
 * - a lista de modelos da API não traz o conteúdo; ele vem do detalhe de cada
 *   modelo (os modelos são poucos);
 * - não há modelo "padrão", descrição, contagem de uso, fragmentos, preview
 *   pelo servidor, relatório, sugestões nem comparação de modelos — rotas que
 *   o legado chamava e, na maioria, nunca existiram;
 * - o teste de campanha manda para um endereço por vez
 *   (`POST /campaigns/:id/test`, até 10 por minuto): o envio para as listas
 *   de teste é um laço sobre os e-mails delas;
 * - a campanha não pausa: a API só cancela.
 */
import { apiFetch } from '@/app/libs/api/client';
import { pick } from '@/app/requests/api-result';
import {
  type AdminPeriod,
  type ApiPagination,
  analyticsPeriod,
  downloadFromApi,
} from '@/app/requests/admin/common';

const SUBSCRIPTION_STATUSES = [
  'PENDING',
  'ACTIVE',
  'UNSUBSCRIBED',
  'BOUNCED',
  'BLOCKED',
];
const CAMPAIGN_STATUSES = [
  'DRAFT',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'PAUSED',
  'CANCELLED',
  'FAILED',
];
const SUBSCRIBER_SORT_FIELDS = [
  'subscribedAt',
  'email',
  'emailOpenCount',
  'avgEngagementScore',
];
const SEGMENT_KEYS = [
  'interests',
  'favoriteInstruments',
  'favoriteEpochs',
  'experienceLevel',
  'frequency',
  'language',
  'engagedSince',
];

/** As taxas da API vêm em percentual (uma casa); o painel da newsletter lia fração (0–1). */
const toFraction = (rate: number | null | undefined) => (rate ?? 0) / 100;
const toPercent = (rate: number | null | undefined) => rate ?? 0;

export function newsletterPagination(pagination: ApiPagination) {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    pages: pagination.totalPages,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1,
  };
}

const upper = (value: unknown, allowed: string[]) => {
  const text = String(value ?? '').toUpperCase();
  return allowed.includes(text) ? text : undefined;
};

// ---- Assinantes

export async function listSubscribers(
  page: number,
  filters: Record<string, unknown>
) {
  const data = await apiFetch<{
    subscribers: unknown[];
    pagination: ApiPagination;
  }>('/admin/newsletter/subscribers', {
    query: {
      page,
      limit: 20,
      status: upper(filters.status, SUBSCRIPTION_STATUSES),
      search: (filters.search as string) || undefined,
      sortBy: SUBSCRIBER_SORT_FIELDS.includes(String(filters.sortBy))
        ? String(filters.sortBy)
        : undefined,
      sortOrder: filters.sortOrder === 'asc' ? 'asc' : undefined,
    },
    cache: 'no-store',
  });

  return {
    subscribers: data.subscribers,
    pagination: newsletterPagination(data.pagination),
  };
}

export function updateSubscriberRequest(
  id: string,
  data: Record<string, unknown>
) {
  return apiFetch<Record<string, unknown>>(
    `/admin/newsletter/subscribers/${id}`,
    {
      method: 'PATCH',
      body: pick(data, [
        'status',
        'firstName',
        'lastName',
        'frequency',
        'interests',
        'experienceLevel',
      ]),
    }
  );
}

export function deleteSubscriberRequest(id: string) {
  return apiFetch(`/admin/newsletter/subscribers/${id}`, { method: 'DELETE' });
}

export function exportSubscribersRequest(filters: Record<string, unknown>) {
  return downloadFromApi(
    '/admin/newsletter/subscribers/export',
    {
      status: upper(filters.status, SUBSCRIPTION_STATUSES),
      search: (filters.search as string) || undefined,
      format: 'csv',
    },
    `subscribers-${new Date().toISOString().split('T')[0]}.csv`
  );
}

// ---- Modelos

interface ApiTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  variables?: string[];
  senderName?: string | null;
  senderEmail?: string | null;
  replyToEmail?: string | null;
  isActive: boolean;
  htmlContent?: string;
  textContent?: string;
  createdAt: string;
  updatedAt: string;
}

function toTemplate(template: ApiTemplate) {
  return {
    ...template,
    htmlContent: template.htmlContent ?? '',
    textContent: template.textContent ?? '',
    senderName: template.senderName ?? '',
    senderEmail: template.senderEmail ?? '',
    replyToEmail: template.replyToEmail ?? undefined,
    variables: template.variables ?? [],
    isDefault: false,
    timesUsed: 0,
    priority: 0,
    tags: [] as string[],
  };
}

export function getTemplateRequest(id: string) {
  return apiFetch<ApiTemplate>(`/admin/newsletter/templates/${id}`, {
    cache: 'no-store',
  }).then(toTemplate);
}

/** Lista com o conteúdo de cada modelo, que a lista da API não traz. */
export async function listTemplatesRequest(
  filters: Record<string, unknown> = {}
) {
  const status = String(filters.status ?? '');
  const data = await apiFetch<{ templates: ApiTemplate[] }>(
    '/admin/newsletter/templates',
    {
      query: {
        limit: 100,
        search: (filters.search as string) || undefined,
        type: (filters.type as string) || undefined,
        isActive:
          status === 'active'
            ? true
            : status === 'inactive'
              ? false
              : undefined,
      },
      cache: 'no-store',
    }
  );

  return Promise.all(
    data.templates.map((template) => getTemplateRequest(template.id))
  );
}

const TEMPLATE_KEYS = [
  'name',
  'type',
  'subject',
  'htmlContent',
  'textContent',
  'variables',
  'senderName',
  'replyToEmail',
  'isActive',
];

// A resposta da escrita não traz o conteúdo do modelo: volta o detalhe.
export async function createTemplateRequest(data: Record<string, unknown>) {
  const template = await apiFetch<ApiTemplate>('/admin/newsletter/templates', {
    method: 'POST',
    body: pick(data, TEMPLATE_KEYS, ['senderName', 'replyToEmail']),
  });

  return getTemplateRequest(template.id);
}

export async function updateTemplateRequest(
  id: string,
  data: Record<string, unknown>
) {
  await apiFetch<ApiTemplate>(`/admin/newsletter/templates/${id}`, {
    method: 'PATCH',
    body: pick(data, TEMPLATE_KEYS, ['senderName', 'replyToEmail']),
  });

  return getTemplateRequest(id);
}

export function deleteTemplatesRequest(templateIds: string[]) {
  return apiFetch('/admin/newsletter/templates/bulk-delete', {
    method: 'POST',
    body: { templateIds },
  });
}

export function analyzeTemplateRequest(id: string) {
  return apiFetch(`/admin/newsletter/templates/${id}/analysis`, {
    cache: 'no-store',
  });
}

// ---- Campanhas

interface ApiCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  templateId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  totalSubscribers: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  createdAt: string;
  [key: string]: unknown;
}

function toCampaign(
  campaign: ApiCampaign,
  templates: Map<string, { name: string; type: string }>
) {
  const template = campaign.templateId
    ? templates.get(campaign.templateId)
    : undefined;

  return {
    ...campaign,
    scheduledAt: campaign.scheduledAt ?? undefined,
    sentAt: campaign.sentAt ?? undefined,
    openRate: campaign.emailsDelivered
      ? Math.round((campaign.emailsOpened / campaign.emailsDelivered) * 10000) /
        100
      : 0,
    clickRate: campaign.emailsOpened
      ? Math.round((campaign.emailsClicked / campaign.emailsOpened) * 10000) /
        100
      : 0,
    template: {
      id: campaign.templateId ?? '',
      name: template?.name ?? (campaign.templateId ? '' : 'Conteúdo próprio'),
      type: template?.type ?? '',
    },
  };
}

async function templateNames() {
  const data = await apiFetch<{ templates: ApiTemplate[] }>(
    '/admin/newsletter/templates',
    {
      query: { limit: 100 },
      cache: 'no-store',
    }
  );

  return new Map(data.templates.map((template) => [template.id, template]));
}

export async function listCampaignsRequest(
  page: number,
  filters: Record<string, unknown>
) {
  const [data, templates] = await Promise.all([
    apiFetch<{ campaigns: ApiCampaign[]; pagination: ApiPagination }>(
      '/admin/newsletter/campaigns',
      {
        query: {
          page,
          limit: 20,
          status: upper(filters.status, CAMPAIGN_STATUSES),
          search: (filters.search as string) || undefined,
        },
        cache: 'no-store',
      }
    ),
    templateNames(),
  ]);

  return {
    campaigns: data.campaigns.map((campaign) =>
      toCampaign(campaign, templates)
    ),
    pagination: newsletterPagination(data.pagination),
  };
}

/** Público: segmentos conhecidos da API; sem nenhum, a campanha vai para todos. */
function audience(segments: unknown) {
  if (Array.isArray(segments)) {
    const interests = segments.filter((item) => item && item !== 'all');
    return interests.length
      ? { targetAll: false, targetSegments: { interests } }
      : { targetAll: true };
  }

  if (segments && typeof segments === 'object') {
    const picked = pick(segments, SEGMENT_KEYS, SEGMENT_KEYS);
    const filled = Object.entries(picked).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
    return filled.length
      ? { targetAll: false, targetSegments: Object.fromEntries(filled) }
      : { targetAll: true };
  }

  return { targetAll: true };
}

function campaignBody(data: Record<string, unknown>, isUpdate: boolean) {
  const body = pick(
    data,
    [
      'name',
      'subject',
      'templateId',
      'customHtmlContent',
      'customTextContent',
      'senderName',
      'replyToEmail',
      'scheduledAt',
    ],
    [
      'templateId',
      'customHtmlContent',
      'customTextContent',
      'senderName',
      'replyToEmail',
      'scheduledAt',
    ]
  );

  // Na edição, tirar o agendamento é mandar `null`.
  if (isUpdate && data.scheduledAt === null) {
    body.scheduledAt = null;
  }

  return { ...body, ...audience(data.targetSegments) };
}

export async function createCampaignRequest(data: Record<string, unknown>) {
  const campaign = await apiFetch<ApiCampaign>('/admin/newsletter/campaigns', {
    method: 'POST',
    body: campaignBody(data, false),
  });

  return toCampaign(campaign, await templateNames());
}

export async function updateCampaignRequest(
  id: string,
  data: Record<string, unknown>
) {
  const campaign = await apiFetch<ApiCampaign>(
    `/admin/newsletter/campaigns/${id}`,
    {
      method: 'PATCH',
      body: campaignBody(data, true),
    }
  );

  return toCampaign(campaign, await templateNames());
}

export function deleteCampaignRequest(id: string) {
  return apiFetch(`/admin/newsletter/campaigns/${id}`, { method: 'DELETE' });
}

export function sendCampaignRequest(id: string) {
  return apiFetch(`/admin/newsletter/campaigns/${id}/send`, { method: 'POST' });
}

export function cancelCampaignRequest(id: string) {
  return apiFetch(`/admin/newsletter/campaigns/${id}/cancel`, {
    method: 'PATCH',
  });
}

/** A API não duplica: a cópia é uma campanha nova, em rascunho, com o mesmo conteúdo. */
export async function duplicateCampaignRequest(id: string) {
  const original = await apiFetch<ApiCampaign>(
    `/admin/newsletter/campaigns/${id}`,
    {
      cache: 'no-store',
    }
  );

  return createCampaignRequest({
    ...original,
    name: `${original.name} (Cópia)`,
    scheduledAt: undefined,
  });
}

// ---- Listas de teste

export interface ApiTestList {
  id: string;
  name: string;
  description?: string | null;
  emails: string[];
  color: string;
  isActive: boolean;
  totalEmails: number;
  timesUsed: number;
  lastUsed?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function listTestListsRequest() {
  return apiFetch<ApiTestList[]>('/admin/newsletter/test-lists', {
    cache: 'no-store',
  });
}

const TEST_LIST_KEYS = ['name', 'description', 'emails', 'color', 'isActive'];

export function createTestListRequest(data: Record<string, unknown>) {
  return apiFetch<ApiTestList>('/admin/newsletter/test-lists', {
    method: 'POST',
    body: pick(data, TEST_LIST_KEYS, ['description', 'color']),
  });
}

export function updateTestListRequest(
  id: string,
  data: Record<string, unknown>
) {
  return apiFetch<ApiTestList>(`/admin/newsletter/test-lists/${id}`, {
    method: 'PATCH',
    body: pick(data, TEST_LIST_KEYS, ['description', 'color']),
  });
}

export function deleteTestListRequest(id: string) {
  return apiFetch(`/admin/newsletter/test-lists/${id}`, { method: 'DELETE' });
}

export function testListStats(lists: ApiTestList[]) {
  return {
    total: lists.length,
    active: lists.filter((list) => list.isActive).length,
    inactive: lists.filter((list) => !list.isActive).length,
    totalEmails: lists.reduce(
      (sum, list) => sum + (list.totalEmails ?? list.emails.length),
      0
    ),
    totalUses: lists.reduce((sum, list) => sum + (list.timesUsed ?? 0), 0),
  };
}

// ---- Teste de campanha

export async function getCampaignTestInfoRequest(id: string) {
  const [campaign, lists, templates] = await Promise.all([
    apiFetch<ApiCampaign>(`/admin/newsletter/campaigns/${id}`, {
      cache: 'no-store',
    }),
    listTestListsRequest(),
    templateNames(),
  ]);
  const testLists = lists.filter((list) => list.isActive);
  const view = toCampaign(campaign, templates);
  const totalEmails = testLists.reduce(
    (sum, list) => sum + list.emails.length,
    0
  );

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      templateType: view.template.type,
      templateName: view.template.name,
    },
    testLists,
    stats: {
      totalLists: testLists.length,
      totalEmails,
      averageListSize: testLists.length
        ? Math.round(totalEmails / testLists.length)
        : 0,
      mostUsedList:
        [...testLists].sort(
          (a, b) => (b.timesUsed ?? 0) - (a.timesUsed ?? 0)
        )[0] ?? null,
    },
  };
}

/** Um envio por endereço das listas escolhidas (a API manda o teste a um e-mail por vez). */
export async function sendCampaignTestRequest(
  id: string,
  testListIds: string[]
) {
  const startedAt = Date.now();
  const [campaign, lists] = await Promise.all([
    apiFetch<ApiCampaign>(`/admin/newsletter/campaigns/${id}`, {
      cache: 'no-store',
    }),
    listTestListsRequest(),
  ]);
  const selected = lists.filter((list) => testListIds.includes(list.id));
  const emails = [...new Set(selected.flatMap((list) => list.emails))];
  const errors: string[] = [];

  for (const to of emails) {
    try {
      await apiFetch(`/admin/newsletter/campaigns/${id}/test`, {
        method: 'POST',
        body: { to },
      });
    } catch (error) {
      errors.push(
        `${to}: ${error instanceof Error ? error.message : 'falhou'}`
      );
    }
  }

  const successful = emails.length - errors.length;

  return {
    success: successful > 0,
    message: `${successful} de ${emails.length} e-mails de teste enviados`,
    results: {
      total: emails.length,
      successful,
      failed: errors.length,
      successRate: emails.length
        ? ((successful / emails.length) * 100).toFixed(1)
        : '0',
      errors: errors.slice(0, 5),
      hasMoreErrors: errors.length > 5,
    },
    metadata: {
      processingTime: Date.now() - startedAt,
      sendMode: 'individual',
      campaignName: campaign.name,
      templateType: '',
      listsUsed: selected.map((list) => ({
        id: list.id,
        name: list.name,
        emailCount: list.emails.length,
      })),
    },
  };
}

// ---- Números

interface ApiNewsletterStats {
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

interface ApiNewsletterAnalytics {
  period: string;
  subscribers: { gained: number; lost: number; net: number };
  campaigns: { sent: number };
  emails: ApiNewsletterStats['emails'];
  topCampaigns: {
    id: string;
    name: string;
    subject?: string;
    sentAt: string | null;
    openRate: number | null;
    clickRate: number | null;
    emailsSent?: number;
  }[];
}

const sum = (record: Record<string, number>) =>
  Object.values(record).reduce((total, value) => total + value, 0);

const newsletterStats = () =>
  apiFetch<ApiNewsletterStats>('/admin/newsletter/stats', {
    cache: 'no-store',
  });

const newsletterAnalytics = (period: string) =>
  apiFetch<ApiNewsletterAnalytics>('/admin/newsletter/analytics', {
    query: { period },
    cache: 'no-store',
  });

/** Números do painel da newsletter (taxas em fração, como a tela lia). */
export async function getNewsletterDashboardStats() {
  const [stats, month, recent] = await Promise.all([
    newsletterStats(),
    newsletterAnalytics('30d'),
    apiFetch<{
      subscribers: {
        id: string;
        email: string;
        firstName: string | null;
        subscribedAt: string;
        status: string;
      }[];
    }>('/admin/newsletter/subscribers', {
      query: { page: 1, limit: 5, sortBy: 'subscribedAt', sortOrder: 'desc' },
      cache: 'no-store',
    }),
  ]);
  const byStatus = stats.subscribersByStatus;

  return {
    totalSubscribers: sum(byStatus),
    activeSubscribers: byStatus.ACTIVE ?? 0,
    pendingSubscribers: byStatus.PENDING ?? 0,
    unsubscribedSubscribers: byStatus.UNSUBSCRIBED ?? 0,
    bouncedSubscribers: byStatus.BOUNCED ?? 0,
    totalCampaigns: sum(stats.campaignsByStatus),
    avgOpenRate: toFraction(stats.emails.openRate),
    avgClickRate: toFraction(stats.emails.clickRate),
    recentSubscribers: recent.subscribers.map((subscriber) => ({
      ...subscriber,
      firstName: subscriber.firstName ?? undefined,
    })),
    topPerformingCampaigns: month.topCampaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject ?? '',
      openRate: toFraction(campaign.openRate),
      clickRate: toFraction(campaign.clickRate),
      sentAt: campaign.sentAt ?? '',
      emailsSent: campaign.emailsSent,
    })),
    newSubscribersLast30Days: month.subscribers.gained,
  };
}

/** Análises no formato da tela (taxas em percentual); o que a API não mede vem zerado. */
export async function getNewsletterAnalyticsRequest(range: AdminPeriod) {
  const [current, week, month, stats] = await Promise.all([
    newsletterAnalytics(analyticsPeriod(range)),
    newsletterAnalytics('7d'),
    newsletterAnalytics('30d'),
    newsletterStats(),
  ]);
  const byStatus = stats.subscribersByStatus;
  const byCampaign = stats.campaignsByStatus;
  const emails = current.emails;

  return {
    subscribers: {
      total: sum(byStatus),
      active: byStatus.ACTIVE ?? 0,
      pending: byStatus.PENDING ?? 0,
      unsubscribed: byStatus.UNSUBSCRIBED ?? 0,
      growth: current.subscribers.net,
      newLast7Days: week.subscribers.gained,
      newLast30Days: month.subscribers.gained,
      highEngagement: 0,
      mediumEngagement: 0,
      lowEngagement: 0,
    },
    campaigns: {
      total: sum(byCampaign),
      sent: byCampaign.SENT ?? 0,
      draft: byCampaign.DRAFT ?? 0,
      scheduled: byCampaign.SCHEDULED ?? 0,
      totalSent: emails.sent,
      sentGrowth: 0,
    },
    engagement: {
      avgOpenRate: toPercent(emails.openRate),
      avgClickRate: toPercent(emails.clickRate),
      avgDeliveryRate: toPercent(emails.deliveryRate),
      avgBounceRate: emails.sent
        ? Math.round((emails.bounced / emails.sent) * 10000) / 100
        : 0,
      avgUnsubscribeRate: 0,
      openRateChange: 0,
      clickRateChange: 0,
    },
    topCampaigns: current.topCampaigns.map((campaign) => ({
      ...campaign,
      openRate: toPercent(campaign.openRate),
      clickRate: toPercent(campaign.clickRate),
    })),
    recentActivity: [],
    chartData: {
      subscriberGrowth: [],
      engagementTrends: [],
      campaignPerformance: [],
    },
  };
}

export function exportNewsletterAnalytics(range: AdminPeriod) {
  const period = analyticsPeriod(range);

  return downloadFromApi(
    '/admin/newsletter/analytics/export',
    { period, format: 'csv' },
    `newsletter-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
  );
}
