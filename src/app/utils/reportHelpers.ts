// app/utils/reportHelpers.ts
export const REPORT_REASONS = {
  inappropriate_content: {
    label: 'Conteúdo inadequado',
    description: 'Conteúdo ofensivo ou impróprio',
    severity: 'high',
    icon: '🚫',
  },
  copyright_violation: {
    label: 'Violação de direitos autorais',
    description: 'Uso não autorizado de material protegido',
    severity: 'urgent',
    icon: '©️',
  },
  false_information: {
    label: 'Informações falsas',
    description: 'Dados incorretos ou enganosos',
    severity: 'medium',
    icon: '❌',
  },
  spam: {
    label: 'Spam',
    description: 'Conteúdo repetitivo ou não relacionado',
    severity: 'low',
    icon: '📧',
  },
  duplicate_content: {
    label: 'Conteúdo duplicado',
    description: 'Item já existe na plataforma',
    severity: 'low',
    icon: '📋',
  },
  poor_quality: {
    label: 'Baixa qualidade',
    description: 'Conteúdo de qualidade inferior',
    severity: 'low',
    icon: '📉',
  },
  incorrect_metadata: {
    label: 'Metadados incorretos',
    description: 'Informações de catalogação incorretas',
    severity: 'medium',
    icon: '🏷️',
  },
  broken_links: {
    label: 'Links quebrados',
    description: 'Links que não funcionam',
    severity: 'medium',
    icon: '🔗',
  },
  other: {
    label: 'Outros',
    description: 'Outro motivo não listado',
    severity: 'medium',
    icon: '❓',
  },
} as const;

export const VERIFICATION_STATUS = {
  pending: {
    label: 'Pendente',
    color: 'text-accent-amber bg-accent-amber/10',
    icon: '⏳',
  },
  verified: {
    label: 'Verificado',
    color: 'text-accent-blue bg-accent-blue/10',
    icon: '✅',
  },
  rejected: {
    label: 'Rejeitado',
    color: 'text-accent-red bg-accent-red/10',
    icon: '❌',
  },
} as const;

export const getReportPriority = (
  reason: string,
  createdAt: Date
): 'low' | 'normal' | 'high' | 'urgent' => {
  const reasonConfig = REPORT_REASONS[reason as keyof typeof REPORT_REASONS];
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Prioridade baseada no tipo
  if (reasonConfig?.severity === 'urgent') return 'urgent';
  if (reasonConfig?.severity === 'high') return 'high';

  // Escalar prioridade baseada no tempo
  if (daysSinceCreated > 7) return 'urgent';
  if (daysSinceCreated > 3) return 'high';
  if (reasonConfig?.severity === 'low') return 'low';

  return 'normal';
};

export const formatReportStats = (stats: any) => {
  return {
    total: stats.totalReports || 0,
    pending: stats.pendingReports || 0,
    resolved: stats.resolvedReports || 0,
    resolutionRate: stats.resolutionRate || 0,
    avgResolutionTime: stats.averageResolutionTime || 0,
  };
};

export const getEntityTypeLabel = (type: string): string => {
  const labels = {
    composer: 'Compositor',
    work: 'Obra',
    score: 'Partitura',
  };
  return labels[type as keyof typeof labels] || type;
};

export const getEntityTypePlural = (type: string): string => {
  const plurals = {
    composer: 'Compositores',
    work: 'Obras',
    score: 'Partituras',
  };
  return plurals[type as keyof typeof plurals] || type;
};

// app/hooks/useReportAnalytics.ts
import { useState, useEffect, useCallback } from 'react';

interface ReportAnalytics {
  summary: {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    resolutionRate: number;
  };
  breakdown: {
    topReasons: Array<{ reason: string; _count: { id: number } }>;
    topTypes: Array<{ entityType: string; _count: { id: number } }>;
  };
  recentActivity: any[];
}

export const useReportAnalytics = (period: string = '7d') => {
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/summary?period=${period}`);

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao carregar analytics');
      }
    } catch (err) {
      console.error('Erro ao buscar analytics:', err);
      setError('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh,
  };
};
