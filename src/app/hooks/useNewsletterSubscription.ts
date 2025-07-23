// app/hooks/useNewsletterSubscription.ts
import { useState, useCallback, useEffect } from 'react';

interface SubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  frequency?: 'daily' | 'weekly' | 'monthly';
  sourceUrl?: string;
  utmSource?: string;
}

interface SubscribeResponse {
  success: boolean;
  message: string;
  status: string;
  error?: string;
}

interface UseNewsletterSubscriptionReturn {
  subscribe: (data: SubscribeData) => Promise<void>;
  loading: boolean;
  success: boolean;
  error: string | null;
  reset: () => void;
}

export const useNewsletterSubscription =
  (): UseNewsletterSubscriptionReturn => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subscribe = useCallback(async (data: SubscribeData) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result: SubscribeResponse = await response.json();

        if (result.success) {
          setSuccess(true);
          setError(null);
        } else {
          setError(result.error || 'Erro na inscrição');
          setSuccess(false);
        }
      } catch (err) {
        console.error('Erro na inscrição da newsletter:', err);
        setError('Erro de conexão. Tente novamente.');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    }, []);

    const reset = useCallback(() => {
      setLoading(false);
      setSuccess(false);
      setError(null);
    }, []);

    return {
      subscribe,
      loading,
      success,
      error,
      reset,
    };
  };

// Hook para gerenciar preferências de newsletter (para usuários logados)
interface NewsletterPreferences {
  weekly_digest: boolean;
  new_composers: boolean;
  new_works: boolean;
  study_reminders: boolean;
  marketing: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

// Hook para estatísticas de newsletter (admin)
interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  pendingSubscribers: number;
  unsubscribedSubscribers: number;
  bouncedSubscribers: number;
  totalCampaigns: number;
  avgOpenRate: number;
  avgClickRate: number;
  recentSubscribers: Array<{
    id: string;
    email: string;
    firstName?: string;
    subscribedAt: string;
    status: string;
  }>;
  topPerformingCampaigns: Array<{
    id: string;
    name: string;
    subject: string;
    openRate: number;
    clickRate: number;
    sentAt: string;
  }>;
  newSubscribersLast30Days: number;
}

interface UseNewsletterStatsReturn {
  stats: NewsletterStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useNewsletterStats = (): UseNewsletterStatsReturn => {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/newsletter/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Carregar estatísticas na inicialização
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};

// Utility functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const getSubscriptionStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'text-accent-green';
    case 'PENDING':
      return 'text-accent-amber';
    case 'UNSUBSCRIBED':
      return 'text-theme-tertiary';
    case 'BOUNCED':
      return 'text-accent-red';
    case 'BLOCKED':
      return 'text-accent-red';
    default:
      return 'text-theme-secondary';
  }
};

export const getSubscriptionStatusLabel = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Ativo';
    case 'PENDING':
      return 'Pendente';
    case 'UNSUBSCRIBED':
      return 'Cancelado';
    case 'BOUNCED':
      return 'Retornado';
    case 'BLOCKED':
      return 'Bloqueado';
    default:
      return 'Desconhecido';
  }
};
