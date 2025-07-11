// app/hooks/admin/useAdminReports.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface ReportResult {
  id: string;
  name: string;
  type: string;
  generatedAt: Date;
  format: 'pdf' | 'excel' | 'csv';
  size?: string;
  downloadUrl?: string;
  status: 'generating' | 'ready' | 'failed';
  error?: string;
  period: string;
  downloadCount?: number;
}

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'content' | 'engagement' | 'system';
  type: 'count' | 'sum' | 'avg' | 'ratio';
  available: boolean;
}

export interface ReportStats {
  totalUsers: number;
  totalWorks: number;
  totalComposers: number;
  totalAnnotations: number;
  activeUsers: number;
  newUsers: number;
  studySessions: number;
  uploads: number;
  totalScores: number;
}

interface UseAdminReportsReturn {
  results: ReportResult[];
  metrics: MetricDefinition[];
  stats: ReportStats | null;
  loading: boolean;
  error: string | null;
  generateReport: (
    type: string,
    format: 'pdf' | 'excel' | 'csv',
    period: string
  ) => Promise<boolean>;
  deleteReport: (reportId: string) => Promise<boolean>;
  downloadReport: (result: ReportResult) => void;
  refreshData: () => Promise<void>;
  templates: any[]; // Manter compatibilidade
}

export const useAdminReports = (): UseAdminReportsReturn => {
  const [results, setResults] = useState<ReportResult[]>([]);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Métricas baseadas no schema real do Prisma
  const availableMetrics: MetricDefinition[] = [
    {
      id: 'total_users',
      name: 'Total de Usuários',
      description: 'Número total de usuários registrados na plataforma',
      category: 'users',
      type: 'count',
      available: true,
    },
    {
      id: 'active_users',
      name: 'Usuários Ativos',
      description: 'Usuários que fizeram login nos últimos 30 dias',
      category: 'users',
      type: 'count',
      available: true,
    },
    {
      id: 'new_users',
      name: 'Novos Usuários',
      description: 'Usuários registrados no período selecionado',
      category: 'users',
      type: 'count',
      available: true,
    },
    {
      id: 'avg_session_time',
      name: 'Tempo Médio de Sessão',
      description: 'Duração média das sessões de estudo em minutos',
      category: 'users',
      type: 'avg',
      available: true,
    },
    {
      id: 'total_works',
      name: 'Total de Obras',
      description: 'Número total de obras catalogadas',
      category: 'content',
      type: 'count',
      available: true,
    },
    {
      id: 'total_composers',
      name: 'Total de Compositores',
      description: 'Número total de compositores no catálogo',
      category: 'content',
      type: 'count',
      available: true,
    },
    {
      id: 'total_scores',
      name: 'Total de Partituras',
      description: 'Número total de partituras disponíveis',
      category: 'content',
      type: 'count',
      available: true,
    },
    {
      id: 'total_annotations',
      name: 'Total de Anotações',
      description: 'Número total de anotações públicas criadas pelos usuários',
      category: 'engagement',
      type: 'count',
      available: true,
    },
    {
      id: 'study_sessions',
      name: 'Sessões de Estudo',
      description:
        'Número total de sessões de estudo registradas nos últimos 30 dias',
      category: 'engagement',
      type: 'count',
      available: true,
    },
    {
      id: 'user_uploads',
      name: 'Uploads de Usuários',
      description: 'Conteúdo enviado pelos usuários nos últimos 30 dias',
      category: 'engagement',
      type: 'count',
      available: true,
    },
    {
      id: 'popular_works',
      name: 'Obras Populares',
      description: 'Obras mais estudadas e favoritadas',
      category: 'content',
      type: 'count',
      available: true,
    },
    {
      id: 'top_contributors',
      name: 'Principais Contribuidores',
      description: 'Usuários com maior pontuação de upload',
      category: 'users',
      type: 'count',
      available: true,
    },
    {
      id: 'annotations_by_category',
      name: 'Anotações por Categoria',
      description: 'Distribuição de anotações por categoria',
      category: 'engagement',
      type: 'count',
      available: true,
    },
    {
      id: 'user_retention',
      name: 'Retenção de Usuários',
      description: 'Taxa de usuários que retornam à plataforma',
      category: 'users',
      type: 'ratio',
      available: false, // Complexo de calcular
    },
  ];

  const fetchData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/reports', {
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acesso não autorizado');
        }
        throw new Error(
          `Erro ${response.status}: Falha ao carregar relatórios`
        );
      }

      const data = await response.json();

      if (data.success) {
        setResults(
          data.results?.map((result: any) => ({
            ...result,
            generatedAt: new Date(result.generatedAt),
          })) || []
        );
        setStats(data.stats || null);
        setMetrics(availableMetrics);
      } else {
        throw new Error(
          data.error || 'Erro desconhecido ao carregar relatórios'
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar dados de relatórios:', err);

      // Fallback para métricas mesmo com erro
      setMetrics(availableMetrics);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const generateReport = useCallback(
    async (
      type: string,
      format: 'pdf' | 'excel' | 'csv',
      period: string
    ): Promise<boolean> => {
      try {
        // Adicionar relatório temporário na lista
        const tempId = `temp_${Date.now()}`;
        const tempReport: ReportResult = {
          id: tempId,
          name: getReportDisplayName(type),
          type,
          format,
          period,
          generatedAt: new Date(),
          status: 'generating',
        };

        setResults((prev) => [tempReport, ...prev]);

        const response = await fetch('/api/admin/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            type,
            format,
            period,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao gerar relatório');
        }

        const data = await response.json();

        if (data.success && data.result) {
          // Remover relatório temporário e adicionar o real
          setResults((prev) => {
            const filtered = prev.filter((r) => r.id !== tempId);
            const newResult: ReportResult = {
              id: data.result.id,
              name: data.result.name,
              type: data.result.type,
              format: data.result.format,
              period: data.result.period,
              generatedAt: new Date(data.result.generatedAt),
              status: data.result.status,
              size: data.result.size,
              downloadUrl: data.result.downloadUrl,
            };
            return [newResult, ...filtered];
          });

          toast.success('Relatório gerado com sucesso!');
          return true;
        } else {
          throw new Error(data.error || 'Erro ao gerar relatório');
        }
      } catch (err) {
        // Remover relatório temporário em caso de erro
        setResults((prev) => prev.filter((r) => r.id !== `temp_${Date.now()}`));

        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao gerar relatório';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Erro ao gerar relatório:', err);
        return false;
      }
    },
    []
  );

  const deleteReport = useCallback(
    async (reportId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/reports?id=${reportId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao excluir relatório');
        }

        const data = await response.json();

        if (data.success) {
          // Remover da lista local
          setResults((prev) => prev.filter((r) => r.id !== reportId));
          toast.success('Relatório excluído com sucesso!');
          return true;
        } else {
          throw new Error(data.error || 'Erro ao excluir relatório');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao excluir relatório';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Erro ao excluir relatório:', err);
        return false;
      }
    },
    []
  );

  const downloadReport = useCallback((result: ReportResult) => {
    if (!result.downloadUrl) {
      toast.error('URL de download não disponível');
      return;
    }

    try {
      // Incrementar contador de download localmente
      setResults((prev) =>
        prev.map((r) =>
          r.id === result.id
            ? { ...r, downloadCount: (r.downloadCount || 0) + 1 }
            : r
        )
      );

      // Iniciar download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `${result.name}_${result.period}.${result.format}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download iniciado!');
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      toast.error('Erro ao iniciar download');
    }
  }, []);

  const refreshData = useCallback(async () => {
    return fetchData();
  }, [fetchData]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh a cada 30 segundos para verificar status dos relatórios
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        const hasGenerating = results.some((r) => r.status === 'generating');
        if (hasGenerating) {
          fetchData(); // Atualizar status dos relatórios em geração
        }
      }
    }, 30 * 1000); // 30 segundos

    return () => clearInterval(interval);
  }, [loading, results, fetchData]);

  return {
    results,
    metrics,
    stats,
    loading,
    error,
    generateReport,
    deleteReport,
    downloadReport,
    refreshData,
    templates: [], // Manter compatibilidade, mas vazio
  };
};

// Função auxiliar para obter nome de exibição do relatório
function getReportDisplayName(type: string): string {
  const names = {
    'users-overview': 'Resumo de Usuários',
    'content-analysis': 'Análise de Conteúdo',
    'engagement-metrics': 'Métricas de Engajamento',
    'growth-trends': 'Tendências de Crescimento',
  };

  return names[type as keyof typeof names] || 'Relatório Personalizado';
}
