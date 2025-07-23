// app/hooks/useNewsletterSubscription.ts - VERSÃO ATUALIZADA
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

// 🆕 NOVO: Resposta expandida com verificação de duplicados
interface SubscribeResponse {
  success: boolean;
  message: string;
  status: string;
  error?: string;
  errorCode?: string;
  subscribedAt?: string;
  needsConfirmation?: boolean;
  canResendConfirmation?: boolean;
  existingToken?: string;
  subscriber?: {
    email: string;
    firstName?: string;
    subscribedAt: string;
  };
}

interface UseNewsletterSubscriptionReturn {
  subscribe: (data: SubscribeData) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  loading: boolean;
  success: boolean;
  error: string | null;
  errorCode: string | null;
  status: string | null;
  canResend: boolean;
  reset: () => void;
}

export const useNewsletterSubscription =
  (): UseNewsletterSubscriptionReturn => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🆕 NOVO: Estados adicionais para verificação
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(false);

    const subscribe = useCallback(async (data: SubscribeData) => {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      setStatus(null);
      setSuccess(false);
      setCanResend(false);

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
          setStatus(result.status);
          setError(null);
        } else {
          setError(result.error || 'Erro na inscrição');
          setErrorCode(result.errorCode || null);
          setStatus(result.status || null);
          setSuccess(false);

          // 🆕 NOVO: Verificar se pode reenviar confirmação
          setCanResend(result.canResendConfirmation || false);
        }
      } catch (err) {
        console.error('Erro na inscrição da newsletter:', err);
        setError('Erro de conexão. Tente novamente.');
        setSuccess(false);
        setErrorCode('CONNECTION_ERROR');
      } finally {
        setLoading(false);
      }
    }, []);

    // 🆕 NOVO: Função para reenviar confirmação
    const resendConfirmation = useCallback(async (email: string) => {
      setLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            action: 'resend-confirmation',
          }),
        });

        const result = await response.json();

        if (result.success) {
          setSuccess(true);
          setError(null);
          setCanResend(false); // Desabilitar botão após reenvio bem-sucedido
        } else {
          setError(result.error || 'Erro ao reenviar confirmação');
          setSuccess(false);
        }
      } catch (err) {
        console.error('Erro ao reenviar confirmação:', err);
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
      setErrorCode(null);
      setStatus(null);
      setCanResend(false);
    }, []);

    return {
      subscribe,
      resendConfirmation, // 🆕 NOVO
      loading,
      success,
      error,
      errorCode, // 🆕 NOVO
      status, // 🆕 NOVO
      canResend, // 🆕 NOVO
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

interface UseNewsletterPreferencesReturn {
  preferences: NewsletterPreferences | null;
  updatePreferences: (
    newPreferences: Partial<NewsletterPreferences>
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useNewsletterPreferences = (): UseNewsletterPreferencesReturn => {
  const [preferences, setPreferences] = useState<NewsletterPreferences | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePreferences = useCallback(
    async (newPreferences: Partial<NewsletterPreferences>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/newsletter/preferences', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPreferences),
        });

        const result = await response.json();

        if (result.success) {
          setPreferences(result.preferences);
        } else {
          setError(result.error || 'Erro ao atualizar preferências');
        }
      } catch (err) {
        console.error('Erro ao atualizar preferências:', err);
        setError('Erro de conexão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    preferences,
    updatePreferences,
    loading,
    error,
  };
};

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
    emailsSent?: number;
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

// 🆕 NOVO: Utility functions expandidas
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

// 🆕 NOVO: Funções para tratamento de erros específicos
export const getSubscriptionErrorMessage = (
  errorCode: string,
  status?: string
): string => {
  switch (errorCode) {
    case 'ALREADY_SUBSCRIBED':
      return 'Este email já está inscrito na nossa newsletter.';
    case 'PENDING_CONFIRMATION':
      return 'Este email já foi cadastrado mas ainda não foi confirmado.';
    case 'EMAIL_BOUNCED':
      return 'Este email teve problemas de entrega anteriormente.';
    case 'EMAIL_BLOCKED':
      return 'Este email foi bloqueado por política de segurança.';
    case 'CONNECTION_ERROR':
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
};

export const getSubscriptionErrorAction = (errorCode: string): string => {
  switch (errorCode) {
    case 'ALREADY_SUBSCRIBED':
      return 'Você já está recebendo nossa newsletter.';
    case 'PENDING_CONFIRMATION':
      return 'Verifique seu email ou solicite um novo link de confirmação.';
    case 'EMAIL_BOUNCED':
      return 'Verifique se o endereço está correto ou use outro email.';
    case 'EMAIL_BLOCKED':
      return 'Entre em contato conosco se acredita que isso é um erro.';
    case 'CONNECTION_ERROR':
      return 'Tente novamente em alguns instantes.';
    default:
      return 'Tente novamente ou entre em contato conosco.';
  }
};

// 🆕 NOVO: Hook para gerenciar estado do formulário de newsletter
export const useNewsletterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Limpar erro quando usuário digita
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: '' }));
      }
    },
    [formErrors]
  );

  const validateForm = useCallback((): {
    valid: boolean;
    errors: Record<string, string>;
  } => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (
      formData.firstName.trim().length > 0 &&
      formData.firstName.trim().length < 2
    ) {
      errors.firstName = 'Nome deve ter pelo menos 2 caracteres';
    }

    setFormErrors(errors);
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({ email: '', firstName: '' });
    setFormErrors({});
  }, []);

  return {
    formData,
    formErrors,
    updateField,
    validateForm,
    resetForm,
  };
};
