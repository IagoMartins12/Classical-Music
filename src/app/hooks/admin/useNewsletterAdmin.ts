// app/hooks/admin/useNewsletterAdmin.ts - VERSÃO COMPLETA
import { useCallback, useMemo, useState } from 'react';
import { adminKeys, useAdminQuery, useInvalidateAdmin } from './query';
import {
  analyzeTemplateRequest,
  cancelCampaignRequest,
  createCampaignRequest,
  createTemplateRequest,
  deleteCampaignRequest,
  deleteSubscriberRequest,
  deleteTemplatesRequest,
  duplicateCampaignRequest,
  exportSubscribersRequest,
  getCampaignTestInfoRequest,
  getTemplateRequest,
  listCampaignsRequest,
  listSubscribers,
  listTemplatesRequest,
  sendCampaignRequest,
  sendCampaignTestRequest,
  updateCampaignRequest,
  updateSubscriberRequest,
  updateTemplateRequest,
} from '@/app/requests/admin/newsletter';

// Interfaces existentes (manter todas)
interface Subscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  confirmedAt?: string;
  lastEmailOpenedAt?: string;
  emailOpenCount: number;
  emailClickCount: number;
  avgEngagementScore?: number;
  interests: string[];
  frequency: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    role: number;
  };
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  totalSubscribers: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  openRate?: number;
  clickRate?: number;
  template: {
    id: string;
    name: string;
    type: string;
  };
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  description?: string;
  senderName: string;
  senderEmail: string;
  replyToEmail?: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  timesUsed: number;
  avgOpenRate?: number;
  avgClickRate?: number;
  qualityScore?: number;
  category?: string;
  priority: number;
  tags: string[];

  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
}

// Fragmentos de modelo: nunca existiram na API (nem no legado as rotas existiam).
interface TemplateFragment {
  id: string;
  name: string;
  description?: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: string;
  tags: string[];
  isActive: boolean;
  isPublic: boolean;
  timesUsed: number;

  createdAt: string;
  updatedAt: string;
}

interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  defaultTemplates: number;
  totalUsage: number;
  avgQualityScore: number;
  topPerformingTemplates: Template[];
  templatesByType: Record<string, number>;
  recentActivity: {
    created: number;
    updated: number;
    used: number;
  };
  performanceMetrics: {
    avgOpenRate: number;
    avgClickRate: number;
    bestOpenRate: number;
    bestClickRate: number;
  };
}

interface TestEmailList {
  id: string;
  name: string;
  description?: string;
  emails: string[];
  color: string;
  isActive: boolean;
  totalEmails: number;
  timesUsed: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

interface SendTestCampaignData {
  testListIds: string[];
  customVariables?: Record<string, any>;
  sendMode?: 'bulk' | 'individual';
}

interface SendTestResult {
  success: boolean;
  message: string;
  results: {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
    errors?: string[];
    hasMoreErrors?: boolean;
  };
  metadata: {
    processingTime: number;
    sendMode: string;
    campaignName: string;
    templateType: string;
    listsUsed: Array<{
      id: string;
      name: string;
      emailCount: number;
    }>;
  };
}

interface CampaignTestInfo {
  campaign: {
    id: string;
    name: string;
    subject: string;
    templateType: string;
    templateName: string;
  };
  testLists: TestEmailList[];
  stats: {
    totalLists: number;
    totalEmails: number;
    averageListSize: number;
    mostUsedList: TestEmailList | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseNewsletterAdminReturn {
  // Subscribers
  subscribers: Subscriber[];
  subscribersLoading: boolean;
  subscribersPagination?: Pagination;
  fetchSubscribers: (page: number, filters?: any) => Promise<void>;
  updateSubscriber: (id: string, data: any) => Promise<void>;
  deleteSubscriber: (id: string) => Promise<void>;
  exportSubscribers: (filters?: any) => Promise<void>;

  // Campaigns
  campaigns: Campaign[];
  campaignsLoading: boolean;
  campaignsPagination?: Pagination;
  fetchCampaigns: (page: number, filters?: any) => Promise<void>;
  createCampaign: (data: any) => Promise<Campaign>;
  updateCampaign: (id: string, data: any) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
  cancelCampaign: (id: string) => Promise<void>;
  duplicateCampaign: (id: string) => Promise<Campaign>;

  // Templates - VERSÃO COMPLETA
  templates: Template[];
  templatesLoading: boolean;
  templateStats: TemplateStats | null;
  fetchTemplates: (filters?: any) => Promise<void>;
  fetchTemplate: (id: string) => Promise<Template | null>;
  createTemplate: (data: any) => Promise<Template>;
  updateTemplate: (id: string, data: any) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  deleteTemplates: (ids: string[]) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<Template>;
  setAsDefault: (id: string) => Promise<void>;
  toggleTemplateStatus: (id: string) => Promise<void>;
  previewTemplate: (id: string, variables?: any) => Promise<any>;
  analyzeTemplate: (id: string) => Promise<any>;
  fetchTemplateStats: () => Promise<void>;

  // Template Fragments
  fragments: TemplateFragment[];
  fragmentsLoading: boolean;
  fetchFragments: (filters?: any) => Promise<void>;
  createFragment: (data: any) => Promise<TemplateFragment>;
  updateFragment: (id: string, data: any) => Promise<TemplateFragment>;
  deleteFragment: (id: string) => Promise<void>;

  // Template Quality & Analytics
  generateTemplateReport: (id: string) => Promise<any>;
  validateTemplate: (
    data: any
  ) => Promise<{ valid: boolean; errors: string[] }>;
  suggestImprovements: (id: string) => Promise<string[]>;
  compareTemplates: (id1: string, id2: string) => Promise<any>;

  // Test Campaign Methods
  sendTestCampaign: (
    id: string,
    data: SendTestCampaignData
  ) => Promise<SendTestResult | null>;
  getCampaignTestInfo: (id: string) => Promise<CampaignTestInfo | null>;

  // General
  loading: boolean;
  error: string | null;
  pagination?: Pagination;
  refreshAll: () => Promise<void>;
}

const message = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const unavailable = (what: string) =>
  new Error(`${what} não existe na API da newsletter`);

/**
 * Newsletter no painel: inscritos, campanhas e modelos.
 *
 * As três listas são estado de servidor (TanStack Query), cada uma com a
 * chave dos seus filtros. Cada escrita invalida a área, e a lista volta do
 * servidor — o legado remendava o array na tela e a página seguinte voltava
 * com o dado velho.
 */
export const useNewsletterAdmin = (): UseNewsletterAdminReturn => {
  const [subscribersRequest, setSubscribersRequest] = useState<{
    page: number;
    filters: any;
  }>({ page: 1, filters: {} });
  const [campaignsRequest, setCampaignsRequest] = useState<{
    page: number;
    filters: any;
  }>({ page: 1, filters: {} });
  const [templateFilters, setTemplateFilters] = useState<any>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const setError = setActionError;
  const invalidate = useInvalidateAdmin();

  const subscribersQuery = useAdminQuery(
    adminKeys.list('newsletter-subscribers', subscribersRequest),
    () => listSubscribers(subscribersRequest.page, subscribersRequest.filters)
  );

  const campaignsQuery = useAdminQuery(
    adminKeys.list('newsletter-campaigns', campaignsRequest),
    () => listCampaignsRequest(campaignsRequest.page, campaignsRequest.filters)
  );

  const templatesQuery = useAdminQuery(
    adminKeys.list('newsletter-templates', templateFilters),
    () => listTemplatesRequest(templateFilters) as Promise<Template[]>
  );

  // A API não tem estatística de modelos: é contada sobre a lista inteira.
  const templateStatsQuery = useAdminQuery(
    adminKeys.area('newsletter-template-stats'),
    async () => {
      const list = (await listTemplatesRequest()) as Template[];
      const byType: Record<string, number> = {};

      for (const template of list) {
        byType[template.type] = (byType[template.type] ?? 0) + 1;
      }

      return {
        totalTemplates: list.length,
        activeTemplates: list.filter((template) => template.isActive).length,
        defaultTemplates: 0,
        totalUsage: 0,
        avgQualityScore: 0,
        topPerformingTemplates: [],
        templatesByType: byType,
        recentActivity: { created: 0, updated: 0, used: 0 },
        performanceMetrics: {
          avgOpenRate: 0,
          avgClickRate: 0,
          bestOpenRate: 0,
          bestClickRate: 0,
        },
      } as TemplateStats;
    }
  );

  const subscribers = (subscribersQuery.data?.subscribers ??
    []) as Subscriber[];
  const subscribersLoading = subscribersQuery.loading;
  const subscribersPagination = subscribersQuery.data?.pagination;

  const campaigns = (campaignsQuery.data?.campaigns ??
    []) as unknown as Campaign[];
  const campaignsLoading = campaignsQuery.loading;
  const campaignsPagination = campaignsQuery.data?.pagination;

  const templates = templatesQuery.data ?? [];
  const templatesLoading = templatesQuery.loading;
  const templateStats = templateStatsQuery.data ?? null;

  const fragments = useMemo<TemplateFragment[]>(() => [], []);
  const pagination = subscribersPagination ?? campaignsPagination;
  const error =
    subscribersQuery.error ??
    campaignsQuery.error ??
    templatesQuery.error ??
    actionError;

  // === SUBSCRIBERS ===
  const fetchSubscribers = useCallback(
    async (page: number, filters: any = {}) => {
      setSubscribersRequest({ page, filters });
    },
    []
  );

  const updateSubscriber = useCallback(
    async (id: string, data: any) => {
      await updateSubscriberRequest(id, data);
      await invalidate('newsletter-subscribers');
    },
    [invalidate]
  );

  const deleteSubscriber = useCallback(
    async (id: string) => {
      await deleteSubscriberRequest(id);
      await invalidate('newsletter-subscribers');
    },
    [invalidate]
  );

  const exportSubscribers = useCallback(async (filters: any = {}) => {
    await exportSubscribersRequest(filters);
  }, []);

  // === CAMPAIGNS ===
  const fetchCampaigns = useCallback(
    async (page: number, filters: any = {}) => {
      setCampaignsRequest({ page, filters });
    },
    []
  );

  const createCampaign = useCallback(
    async (data: any): Promise<Campaign> => {
      const campaign = (await createCampaignRequest(
        data
      )) as unknown as Campaign;
      await invalidate('newsletter-campaigns');
      return campaign;
    },
    [invalidate]
  );

  const updateCampaign = useCallback(
    async (id: string, data: any): Promise<Campaign> => {
      const campaign = (await updateCampaignRequest(
        id,
        data
      )) as unknown as Campaign;
      await invalidate('newsletter-campaigns');
      return campaign;
    },
    [invalidate]
  );

  const deleteCampaign = useCallback(
    async (id: string) => {
      await deleteCampaignRequest(id);
      await invalidate('newsletter-campaigns');
    },
    [invalidate]
  );

  // O envio vai para a fila da API; a campanha passa a "enviando".
  const sendCampaign = useCallback(
    async (id: string) => {
      await sendCampaignRequest(id);
      await invalidate('newsletter-campaigns');
    },
    [invalidate]
  );

  const cancelCampaign = useCallback(
    async (id: string) => {
      await cancelCampaignRequest(id);
      await invalidate('newsletter-campaigns');
    },
    [invalidate]
  );

  const duplicateCampaign = useCallback(
    async (id: string): Promise<Campaign> => {
      const campaign = (await duplicateCampaignRequest(
        id
      )) as unknown as Campaign;
      await invalidate('newsletter-campaigns');
      return campaign;
    },
    [invalidate]
  );

  // === TEMPLATES ===
  const fetchTemplates = useCallback(async (filters: any = {}) => {
    setTemplateFilters(filters);
  }, []);

  const fetchTemplate = useCallback(
    async (id: string): Promise<Template | null> => {
      try {
        return (await getTemplateRequest(id)) as Template;
      } catch (err) {
        console.error('Erro ao buscar template:', err);
        setActionError(message(err, 'Erro ao carregar template'));
        return null;
      }
    },
    []
  );

  const refreshTemplates = useCallback(async () => {
    await Promise.all([
      invalidate('newsletter-templates'),
      templateStatsQuery.refetch(),
    ]);
  }, [invalidate, templateStatsQuery]);

  const createTemplate = useCallback(
    async (data: any): Promise<Template> => {
      const template = (await createTemplateRequest(data)) as Template;
      await refreshTemplates();
      return template;
    },
    [refreshTemplates]
  );

  const updateTemplate = useCallback(
    async (id: string, data: any): Promise<Template> => {
      const template = (await updateTemplateRequest(id, data)) as Template;
      await refreshTemplates();
      return template;
    },
    [refreshTemplates]
  );

  const deleteTemplates = useCallback(
    async (ids: string[]) => {
      await deleteTemplatesRequest(ids);
      await refreshTemplates();
    },
    [refreshTemplates]
  );

  const deleteTemplate = useCallback(
    (id: string) => deleteTemplates([id]),
    [deleteTemplates]
  );

  const duplicateTemplate = useCallback(
    async (id: string): Promise<Template> => {
      const original = await fetchTemplate(id);

      if (!original) {
        throw new Error('Template original não encontrado');
      }

      return createTemplate({
        ...original,
        name: `${original.name} (Cópia)`,
        isActive: false,
      });
    },
    [fetchTemplate, createTemplate]
  );

  const setAsDefault = useCallback(async (): Promise<void> => {
    throw unavailable('Modelo padrão');
  }, []);

  const toggleTemplateStatus = useCallback(
    async (id: string): Promise<void> => {
      const template = templates.find((item) => item.id === id);

      if (!template) throw new Error('Template não encontrado');

      await updateTemplate(id, { isActive: !template.isActive });
    },
    [templates, updateTemplate]
  );

  // O preview é montado com o conteúdo do modelo; a API não tem rota de preview.
  const previewTemplate = useCallback(async (id: string) => {
    const template = await getTemplateRequest(id);

    return {
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent,
    };
  }, []);

  const analyzeTemplate = useCallback(
    (id: string) => analyzeTemplateRequest(id),
    []
  );

  const fetchTemplateStats = templateStatsQuery.refetch;

  // === FRAGMENTS (não existem na API) ===
  const fetchFragments = useCallback(async () => {}, []);
  const createFragment = useCallback(async (): Promise<TemplateFragment> => {
    throw unavailable('Fragmento de modelo');
  }, []);
  const updateFragment = useCallback(async (): Promise<TemplateFragment> => {
    throw unavailable('Fragmento de modelo');
  }, []);
  const deleteFragment = useCallback(async (): Promise<void> => {
    throw unavailable('Fragmento de modelo');
  }, []);

  // === QUALIDADE DO MODELO ===
  const generateTemplateReport = useCallback(async () => {
    throw unavailable('Relatório de modelo');
  }, []);

  // Conferência local do que a API exige para salvar um modelo.
  const validateTemplate = useCallback(async (data: any) => {
    const errors: string[] = [];
    if (!data?.name?.trim()) errors.push('Nome é obrigatório');
    if (!data?.subject?.trim()) errors.push('Assunto é obrigatório');
    if (!data?.htmlContent?.trim()) errors.push('Conteúdo HTML é obrigatório');
    if (!data?.textContent?.trim())
      errors.push('Conteúdo em texto é obrigatório');
    return { valid: errors.length === 0, errors };
  }, []);

  const suggestImprovements = useCallback(async (): Promise<string[]> => {
    throw unavailable('Sugestão de melhoria');
  }, []);

  const compareTemplates = useCallback(async () => {
    throw unavailable('Comparação de modelos');
  }, []);

  // === TESTE DE CAMPANHA ===
  const sendTestCampaign = useCallback(
    async (
      id: string,
      data: SendTestCampaignData
    ): Promise<SendTestResult | null> => {
      try {
        return await sendCampaignTestRequest(id, data.testListIds);
      } catch (err) {
        console.error('Erro ao enviar teste de campanha:', err);
        setError(message(err, 'Erro desconhecido'));
        return null;
      }
    },
    []
  );

  const getCampaignTestInfo = useCallback(
    async (id: string): Promise<CampaignTestInfo | null> => {
      try {
        return (await getCampaignTestInfoRequest(
          id
        )) as unknown as CampaignTestInfo;
      } catch (err) {
        console.error('Erro ao buscar informações de teste:', err);
        setError(message(err, 'Erro ao carregar informações de teste'));
        return null;
      }
    },
    []
  );

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([fetchTemplates(), fetchTemplateStats()]);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  }, [fetchTemplates, fetchTemplateStats]);

  return {
    // Subscribers
    subscribers,
    subscribersLoading,
    subscribersPagination,
    fetchSubscribers,
    updateSubscriber,
    deleteSubscriber,
    exportSubscribers,

    // Campaigns
    campaigns,
    campaignsLoading,
    campaignsPagination,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    cancelCampaign,
    duplicateCampaign,

    // Templates
    templates,
    templatesLoading,
    templateStats,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    deleteTemplates,
    duplicateTemplate,
    setAsDefault,
    toggleTemplateStatus,
    previewTemplate,
    analyzeTemplate,
    fetchTemplateStats,

    // Template Fragments
    fragments,
    fragmentsLoading: false,
    fetchFragments,
    createFragment,
    updateFragment,
    deleteFragment,

    // Template Quality & Analytics
    generateTemplateReport,
    validateTemplate,
    suggestImprovements,
    compareTemplates,

    // Test Campaign Methods
    sendTestCampaign,
    getCampaignTestInfo,

    // General
    loading: subscribersLoading || campaignsLoading || templatesLoading,
    error,
    pagination,
    refreshAll,
  };
};
