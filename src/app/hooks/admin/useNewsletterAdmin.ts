// app/hooks/admin/useNewsletterAdmin.ts
import { useState, useCallback } from 'react';

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
  isActive: boolean;
  isDefault: boolean;
  variables: string[];
  timesUsed: number;
  avgOpenRate?: number;
  avgClickRate?: number;
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
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

  // Templates
  templates: Template[];
  templatesLoading: boolean;
  fetchTemplates: (filters?: any) => Promise<void>;
  createTemplate: (data: any) => Promise<Template>;
  updateTemplate: (id: string, data: any) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;

  // General
  loading: boolean;
  error: string | null;
  pagination?: Pagination;
}

export const useNewsletterAdmin = (): UseNewsletterAdminReturn => {
  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersPagination, setSubscribersPagination] =
    useState<Pagination>();

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsPagination, setCampaignsPagination] = useState<Pagination>();

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>();

  // Subscribers methods
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar subscriber na lista
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
        // Remover subscriber da lista
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

  // Campaigns methods
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
      // 🆕 PREPARAR DADOS CORRETAMENTE
      const campaignData = {
        name: data.name,
        subject: data.subject,
        templateType: data.templateType, // 🆕 SEMPRE ENVIAR templateType
        templateId: data.templateId || '', // 🆕 Pode ser vazio para templates built-in
        customContent: data.customContent,
        scheduledAt: data.scheduledAt,
        status: data.status || 'DRAFT',
        targetSegments: data.targetSegments,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        replyToEmail: data.replyToEmail,
      };

      console.log('📤 Enviando dados da campanha:', campaignData);

      const response = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (result.success) {
        // Adicionar campanha à lista
        setCampaigns((prev) => [result.campaign, ...prev]);
        return result.campaign;
      } else {
        throw new Error(result.error || 'Erro ao criar campanha');
      }
    } catch (err) {
      console.error('❌ Erro ao criar campanha:', err);
      throw err;
    }
  }, []);
  const updateCampaign = useCallback(
    async (id: string, data: any): Promise<Campaign> => {
      try {
        const response = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          // Atualizar campanha na lista
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
        // Remover campanha da lista
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
        // Atualizar status da campanha
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

  // Templates methods
  const fetchTemplates = useCallback(async (filters: any = {}) => {
    setTemplatesLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(filters);
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

  const createTemplate = useCallback(async (data: any): Promise<Template> => {
    try {
      const response = await fetch('/api/admin/newsletter/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Adicionar template à lista
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          // Atualizar template na lista
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
        // Remover template da lista
        setTemplates((prev) => prev.filter((temp) => temp.id !== id));
      } else {
        throw new Error(result.error || 'Erro ao deletar template');
      }
    } catch (err) {
      console.error('Erro ao deletar template:', err);
      throw err;
    }
  }, []);

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

    // Templates
    templates,
    templatesLoading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // General
    loading: subscribersLoading || campaignsLoading || templatesLoading,
    error,
    pagination,
  };
};
