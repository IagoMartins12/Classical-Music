// app/hooks/admin/useNewsletterAdmin.ts - VERSÃO COMPLETA
import { useState, useCallback } from 'react';

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
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
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
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  editor?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
}

// 🆕 NOVA: Interface para fragmentos de template
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
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 🆕 NOVA: Interface para estatísticas de templates
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

// 🆕 NOVAS: Interfaces para teste de campanha
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
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
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

  // 🆕 NOVO: Template Fragments
  fragments: TemplateFragment[];
  fragmentsLoading: boolean;
  fetchFragments: (filters?: any) => Promise<void>;
  createFragment: (data: any) => Promise<TemplateFragment>;
  updateFragment: (id: string, data: any) => Promise<TemplateFragment>;
  deleteFragment: (id: string) => Promise<void>;

  // 🆕 NOVO: Template Quality & Analytics
  generateTemplateReport: (id: string) => Promise<any>;
  validateTemplate: (
    data: any
  ) => Promise<{ valid: boolean; errors: string[] }>;
  suggestImprovements: (id: string) => Promise<string[]>;
  compareTemplates: (id1: string, id2: string) => Promise<any>;

  // 🆕 NOVO: Test Campaign Methods
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

export const useNewsletterAdmin = (): UseNewsletterAdminReturn => {
  // Estados existentes
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersPagination, setSubscribersPagination] =
    useState<Pagination>();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsPagination, setCampaignsPagination] = useState<Pagination>();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateStats, setTemplateStats] = useState<TemplateStats | null>(
    null
  );

  // 🆕 NOVOS ESTADOS
  const [fragments, setFragments] = useState<TemplateFragment[]>([]);
  const [fragmentsLoading, setFragmentsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>();

  // === SUBSCRIBERS METHODS (manter existentes) ===
  const fetchSubscribers = useCallback(
    async (page: number, filters: any = {}) => {
      setSubscribersLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...filters,
        });

        const response = await fetch(
          `/api/admin/newsletter/subscribers?${queryParams}`
        );
        const result = await response.json();

        if (result.success) {
          setSubscribers(result.data.subscribers);
          setSubscribersPagination(result.data.pagination);
          setPagination(result.data.pagination);
        } else {
          setError(result.error || 'Erro ao carregar subscribers');
        }
      } catch (err) {
        console.error('Erro ao buscar subscribers:', err);
        setError('Erro de conexão');
      } finally {
        setSubscribersLoading(false);
      }
    },
    []
  );

  const updateSubscriber = useCallback(async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSubscribers((prev) =>
          prev.map((sub) =>
            sub.id === id ? { ...sub, ...result.subscriber } : sub
          )
        );
      } else {
        throw new Error(result.error || 'Erro ao atualizar subscriber');
      }
    } catch (err) {
      console.error('Erro ao atualizar subscriber:', err);
      throw err;
    }
  }, []);

  const deleteSubscriber = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
      } else {
        throw new Error(result.error || 'Erro ao deletar subscriber');
      }
    } catch (err) {
      console.error('Erro ao deletar subscriber:', err);
      throw err;
    }
  }, []);

  const exportSubscribers = useCallback(async (filters: any = {}) => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `/api/admin/newsletter/subscribers/export?${queryParams}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${
          new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Erro no export');
      }
    } catch (err) {
      console.error('Erro ao exportar subscribers:', err);
      throw err;
    }
  }, []);

  // === CAMPAIGNS METHODS (manter existentes + melhorias) ===
  const fetchCampaigns = useCallback(
    async (page: number, filters: any = {}) => {
      setCampaignsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...filters,
        });

        const response = await fetch(
          `/api/admin/newsletter/campaigns?${queryParams}`
        );
        const result = await response.json();

        if (result.success) {
          setCampaigns(result.data.campaigns);
          setCampaignsPagination(result.data.pagination);
          setPagination(result.data.pagination);
        } else {
          setError(result.error || 'Erro ao carregar campanhas');
        }
      } catch (err) {
        console.error('Erro ao buscar campanhas:', err);
        setError('Erro de conexão');
      } finally {
        setCampaignsLoading(false);
      }
    },
    []
  );

  const createCampaign = useCallback(async (data: any): Promise<Campaign> => {
    try {
      const campaignData = {
        name: data.name,
        subject: data.subject,
        templateType: data.templateType,
        templateId: data.templateId || '',
        customContent: data.customContent,
        customHtmlContent: data.customHtmlContent,
        customTextContent: data.customTextContent,
        customSubject: data.customSubject,
        scheduledAt: data.scheduledAt,
        status: data.status || 'DRAFT',
        targetSegments: data.targetSegments,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        replyToEmail: data.replyToEmail,
        useCustomTemplate: data.useCustomTemplate,
      };

      const response = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (result.success) {
        setCampaigns((prev) => [result.campaign, ...prev]);
        return result.campaign;
      } else {
        throw new Error(result.error || 'Erro ao criar campanha');
      }
    } catch (err) {
      console.error('Erro ao criar campanha:', err);
      throw err;
    }
  }, []);

  const updateCampaign = useCallback(
    async (id: string, data: any): Promise<Campaign> => {
      try {
        const response = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setCampaigns((prev) =>
            prev.map((camp) =>
              camp.id === id ? { ...camp, ...result.campaign } : camp
            )
          );
          return result.campaign;
        } else {
          throw new Error(result.error || 'Erro ao atualizar campanha');
        }
      } catch (err) {
        console.error('Erro ao atualizar campanha:', err);
        throw err;
      }
    },
    []
  );

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCampaigns((prev) => prev.filter((camp) => camp.id !== id));
      } else {
        throw new Error(result.error || 'Erro ao deletar campanha');
      }
    } catch (err) {
      console.error('Erro ao deletar campanha:', err);
      throw err;
    }
  }, []);

  const sendCampaign = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/campaigns/${id}/send`,
        {
          method: 'POST',
        }
      );

      const result = await response.json();

      if (result.success) {
        setCampaigns((prev) =>
          prev.map((camp) =>
            camp.id === id
              ? { ...camp, status: 'SENDING', sentAt: new Date().toISOString() }
              : camp
          )
        );
      } else {
        throw new Error(result.error || 'Erro ao enviar campanha');
      }
    } catch (err) {
      console.error('Erro ao enviar campanha:', err);
      throw err;
    }
  }, []);

  // 🆕 NOVO: Duplicar campanha
  const duplicateCampaign = useCallback(
    async (id: string): Promise<Campaign> => {
      try {
        const response = await fetch(
          `/api/admin/newsletter/campaigns/${id}/duplicate`,
          {
            method: 'POST',
          }
        );

        const result = await response.json();

        if (result.success) {
          setCampaigns((prev) => [result.campaign, ...prev]);
          return result.campaign;
        } else {
          throw new Error(result.error || 'Erro ao duplicar campanha');
        }
      } catch (err) {
        console.error('Erro ao duplicar campanha:', err);
        throw err;
      }
    },
    []
  );

  // === TEMPLATES METHODS - VERSÃO COMPLETA ===
  const fetchTemplates = useCallback(async (filters: any = {}) => {
    setTemplatesLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.type) queryParams.set('type', filters.type);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.category) queryParams.set('category', filters.category);

      const response = await fetch(
        `/api/admin/newsletter/templates?${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        setTemplates(result.templates);
      } else {
        setError(result.error || 'Erro ao carregar templates');
      }
    } catch (err) {
      console.error('Erro ao buscar templates:', err);
      setError('Erro de conexão');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const fetchTemplate = useCallback(
    async (id: string): Promise<Template | null> => {
      try {
        const response = await fetch(`/api/admin/newsletter/templates/${id}`);
        const result = await response.json();

        if (result.success) {
          return result.template;
        } else {
          setError(result.error || 'Erro ao carregar template');
          return null;
        }
      } catch (err) {
        console.error('Erro ao buscar template:', err);
        setError('Erro de conexão');
        return null;
      }
    },
    []
  );

  const createTemplate = useCallback(async (data: any): Promise<Template> => {
    try {
      const response = await fetch('/api/admin/newsletter/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setTemplates((prev) => [result.template, ...prev]);
        return result.template;
      } else {
        throw new Error(result.error || 'Erro ao criar template');
      }
    } catch (err) {
      console.error('Erro ao criar template:', err);
      throw err;
    }
  }, []);

  const updateTemplate = useCallback(
    async (id: string, data: any): Promise<Template> => {
      try {
        const response = await fetch(`/api/admin/newsletter/templates/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setTemplates((prev) =>
            prev.map((temp) =>
              temp.id === id ? { ...temp, ...result.template } : temp
            )
          );
          return result.template;
        } else {
          throw new Error(result.error || 'Erro ao atualizar template');
        }
      } catch (err) {
        console.error('Erro ao atualizar template:', err);
        throw err;
      }
    },
    []
  );

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/newsletter/templates/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setTemplates((prev) => prev.filter((temp) => temp.id !== id));
      } else {
        throw new Error(result.error || 'Erro ao deletar template');
      }
    } catch (err) {
      console.error('Erro ao deletar template:', err);
      throw err;
    }
  }, []);

  // 🆕 NOVO: Deletar múltiplos templates
  const deleteTemplates = useCallback(async (ids: string[]) => {
    try {
      const response = await fetch('/api/admin/newsletter/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds: ids }),
      });

      const result = await response.json();

      if (result.success) {
        setTemplates((prev) => prev.filter((temp) => !ids.includes(temp.id)));
      } else {
        throw new Error(result.error || 'Erro ao deletar templates');
      }
    } catch (err) {
      console.error('Erro ao deletar templates:', err);
      throw err;
    }
  }, []);

  const duplicateTemplate = useCallback(
    async (id: string): Promise<Template> => {
      try {
        const originalTemplate = await fetchTemplate(id);
        if (!originalTemplate) {
          throw new Error('Template original não encontrado');
        }

        const duplicateData = {
          name: `${originalTemplate.name} (Cópia)`,
          type: originalTemplate.type,
          subject: originalTemplate.subject,
          htmlContent: originalTemplate.htmlContent,
          textContent: originalTemplate.textContent,
          description: originalTemplate.description,
          senderName: originalTemplate.senderName,
          senderEmail: originalTemplate.senderEmail,
          replyToEmail: originalTemplate.replyToEmail,
          variables: originalTemplate.variables,
          category: originalTemplate.category,
          tags: originalTemplate.tags,
          isActive: false,
          isDefault: false,
        };

        return await createTemplate(duplicateData);
      } catch (err) {
        console.error('Erro ao duplicar template:', err);
        throw err;
      }
    },
    [fetchTemplate, createTemplate]
  );

  const setAsDefault = useCallback(
    async (id: string): Promise<void> => {
      try {
        await updateTemplate(id, { isDefault: true });
      } catch (err) {
        console.error('Erro ao definir template como padrão:', err);
        throw err;
      }
    },
    [updateTemplate]
  );

  const toggleTemplateStatus = useCallback(
    async (id: string): Promise<void> => {
      try {
        const template = templates.find((t) => t.id === id);
        if (!template) throw new Error('Template não encontrado');

        await updateTemplate(id, { isActive: !template.isActive });
      } catch (err) {
        console.error('Erro ao alterar status do template:', err);
        throw err;
      }
    },
    [templates, updateTemplate]
  );

  // 🆕 NOVO: Preview de template
  const previewTemplate = useCallback(async (id: string, variables?: any) => {
    try {
      const url = `/api/admin/newsletter/templates/${id}/preview`;
      const method = variables ? 'POST' : 'GET';
      const body = variables ? JSON.stringify({ variables }) : undefined;

      const response = await fetch(url, {
        method,
        headers: variables ? { 'Content-Type': 'application/json' } : {},
        body,
      });

      const result = await response.json();

      if (result.success) {
        return result.preview;
      } else {
        throw new Error(result.error || 'Erro ao gerar preview');
      }
    } catch (err) {
      console.error('Erro ao gerar preview:', err);
      throw err;
    }
  }, []);

  // 🆕 NOVO: Analisar template
  const analyzeTemplate = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/templates/${id}/analyze`
      );
      const result = await response.json();

      if (result.success) {
        return result.analysis;
      } else {
        throw new Error(result.error || 'Erro ao analisar template');
      }
    } catch (err) {
      console.error('Erro ao analisar template:', err);
      throw err;
    }
  }, []);

  // 🆕 NOVO: Buscar estatísticas de templates
  const fetchTemplateStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter/templates/stats');
      const result = await response.json();

      if (result.success) {
        setTemplateStats(result.stats);
      } else {
        setError(result.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro de conexão');
    }
  }, []);

  // === TEMPLATE FRAGMENTS METHODS ===
  const fetchFragments = useCallback(async (filters: any = {}) => {
    setFragmentsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `/api/admin/newsletter/fragments?${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        setFragments(result.fragments);
      } else {
        setError(result.error || 'Erro ao carregar fragmentos');
      }
    } catch (err) {
      console.error('Erro ao buscar fragmentos:', err);
      setError('Erro de conexão');
    } finally {
      setFragmentsLoading(false);
    }
  }, []);

  const createFragment = useCallback(
    async (data: any): Promise<TemplateFragment> => {
      try {
        const response = await fetch('/api/admin/newsletter/fragments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setFragments((prev) => [result.fragment, ...prev]);
          return result.fragment;
        } else {
          throw new Error(result.error || 'Erro ao criar fragmento');
        }
      } catch (err) {
        console.error('Erro ao criar fragmento:', err);
        throw err;
      }
    },
    []
  );

  const updateFragment = useCallback(
    async (id: string, data: any): Promise<TemplateFragment> => {
      try {
        const response = await fetch(`/api/admin/newsletter/fragments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setFragments((prev) =>
            prev.map((frag) =>
              frag.id === id ? { ...frag, ...result.fragment } : frag
            )
          );
          return result.fragment;
        } else {
          throw new Error(result.error || 'Erro ao atualizar fragmento');
        }
      } catch (err) {
        console.error('Erro ao atualizar fragmento:', err);
        throw err;
      }
    },
    []
  );

  const deleteFragment = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/newsletter/fragments/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setFragments((prev) => prev.filter((frag) => frag.id !== id));
      } else {
        throw new Error(result.error || 'Erro ao deletar fragmento');
      }
    } catch (err) {
      console.error('Erro ao deletar fragmento:', err);
      throw err;
    }
  }, []);

  // === TEMPLATE QUALITY & ANALYTICS ===
  const generateTemplateReport = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/templates/${id}/report`
      );
      const result = await response.json();

      if (result.success) {
        return result.report;
      } else {
        throw new Error(result.error || 'Erro ao gerar relatório');
      }
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      throw err;
    }
  }, []);

  const validateTemplate = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/admin/newsletter/templates/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return { valid: result.valid, errors: result.errors };
      } else {
        throw new Error(result.error || 'Erro ao validar template');
      }
    } catch (err) {
      console.error('Erro ao validar template:', err);
      throw err;
    }
  }, []);

  const suggestImprovements = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/templates/${id}/suggestions`
      );
      const result = await response.json();

      if (result.success) {
        return result.suggestions;
      } else {
        throw new Error(result.error || 'Erro ao obter sugestões');
      }
    } catch (err) {
      console.error('Erro ao obter sugestões:', err);
      throw err;
    }
  }, []);

  const compareTemplates = useCallback(async (id1: string, id2: string) => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/templates/compare?template1=${id1}&template2=${id2}`
      );
      const result = await response.json();

      if (result.success) {
        return result.comparison;
      } else {
        throw new Error(result.error || 'Erro ao comparar templates');
      }
    } catch (err) {
      console.error('Erro ao comparar templates:', err);
      throw err;
    }
  }, []);

  // === 🆕 TEST CAMPAIGN METHODS ===

  /**
   * Enviar campanha para listas de teste
   */
  const sendTestCampaign = useCallback(
    async (
      id: string,
      data: SendTestCampaignData
    ): Promise<SendTestResult | null> => {
      try {
        const response = await fetch(
          `/api/admin/newsletter/campaigns/${id}/send-test`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();

        if (result.success) {
          // Atualizar estatísticas da campanha se necessário
          setCampaigns((prev) =>
            prev.map((camp) =>
              camp.id === id
                ? {
                    ...camp,
                    // Adicionar metadados de teste se desejar
                    lastTestSent: new Date().toISOString(),
                  }
                : camp
            )
          );

          return {
            success: result.success,
            message: result.message,
            results: result.results,
            metadata: result.metadata,
          };
        } else {
          throw new Error(result.error || 'Erro ao enviar teste');
        }
      } catch (err) {
        console.error('Erro ao enviar teste de campanha:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        return null;
      }
    },
    []
  );

  /**
   * Obter informações de teste para uma campanha
   */
  const getCampaignTestInfo = useCallback(
    async (id: string): Promise<CampaignTestInfo | null> => {
      try {
        const response = await fetch(
          `/api/admin/newsletter/campaigns/${id}/send-test`
        );
        const result = await response.json();

        if (result.success) {
          return {
            campaign: result.campaign,
            testLists: result.testLists,
            stats: result.stats,
          };
        } else {
          setError(result.error || 'Erro ao carregar informações de teste');
          return null;
        }
      } catch (err) {
        console.error('Erro ao buscar informações de teste:', err);
        setError('Erro de conexão');
        return null;
      }
    },
    []
  );

  // 🆕 NOVO: Refresh geral
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTemplates(),
        fetchTemplateStats(),
        fetchFragments(),
      ]);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates, fetchTemplateStats, fetchFragments]);

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
    duplicateCampaign,

    // Templates - VERSÃO COMPLETA
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
    fragmentsLoading,
    fetchFragments,
    createFragment,
    updateFragment,
    deleteFragment,

    // Template Quality & Analytics
    generateTemplateReport,
    validateTemplate,
    suggestImprovements,
    compareTemplates,

    // 🆕 Test Campaign Methods
    sendTestCampaign,
    getCampaignTestInfo,

    // General
    loading:
      subscribersLoading ||
      campaignsLoading ||
      templatesLoading ||
      fragmentsLoading,
    error,
    pagination,
    refreshAll,
  };
};
