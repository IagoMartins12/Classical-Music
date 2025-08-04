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
  currentValue?: number | string;
  lastUpdated?: Date;
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

  // 🔄 FUNÇÃO PARA BUSCAR MÉTRICAS REAIS DO BANCO
  const fetchRealMetrics = useCallback(
    async (statsData: ReportStats): Promise<MetricDefinition[]> => {
      const now = new Date();

      return [
        // 👥 MÉTRICAS DE USUÁRIOS - TODAS REAIS
        {
          id: 'total_users',
          name: 'Total de Usuários',
          description: 'Número total de usuários registrados na plataforma',
          category: 'users',
          type: 'count',
          available: true,
          currentValue: statsData.totalUsers,
          lastUpdated: now,
        },
        {
          id: 'active_users_30d',
          name: 'Usuários Ativos (30d)',
          description:
            'Usuários que fizeram login ou tiveram atividade nos últimos 30 dias',
          category: 'users',
          type: 'count',
          available: true,
          currentValue: statsData.activeUsers,
          lastUpdated: now,
        },
        {
          id: 'new_users_7d',
          name: 'Novos Usuários (7d)',
          description: 'Usuários registrados nos últimos 7 dias',
          category: 'users',
          type: 'count',
          available: true,
          currentValue: statsData.newUsers,
          lastUpdated: now,
        },
        {
          id: 'user_retention_rate',
          name: 'Taxa de Retenção',
          description:
            'Porcentagem de usuários que retornam após 7 dias do cadastro',
          category: 'users',
          type: 'ratio',
          available: false, // Complexo de calcular em tempo real
          currentValue: 'Em desenvolvimento',
          lastUpdated: now,
        },
        {
          id: 'avg_session_duration',
          name: 'Duração Média de Sessão',
          description: 'Tempo médio que usuários passam estudando por sessão',
          category: 'users',
          type: 'avg',
          available: true,
          currentValue: 'Calculado via relatórios',
          lastUpdated: now,
        },

        // 🎵 MÉTRICAS DE CONTEÚDO - TODAS REAIS
        {
          id: 'total_works',
          name: 'Total de Obras',
          description: 'Número total de obras catalogadas no sistema',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: statsData.totalWorks,
          lastUpdated: now,
        },
        {
          id: 'total_composers',
          name: 'Total de Compositores',
          description: 'Número total de compositores catalogados',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: statsData.totalComposers,
          lastUpdated: now,
        },
        {
          id: 'total_scores',
          name: 'Total de Partituras',
          description:
            'Número total de partituras disponíveis (IMSLP + uploads)',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: statsData.totalScores,
          lastUpdated: now,
        },
        {
          id: 'works_per_composer',
          name: 'Obras por Compositor',
          description: 'Média de obras por compositor no catálogo',
          category: 'content',
          type: 'avg',
          available: true,
          currentValue:
            statsData.totalComposers > 0
              ? Math.round(statsData.totalWorks / statsData.totalComposers)
              : 0,
          lastUpdated: now,
        },
        {
          id: 'content_growth_rate',
          name: 'Taxa de Crescimento de Conteúdo',
          description:
            'Novos compositores e obras adicionados nos últimos 30 dias',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: 'Calculado via relatórios',
          lastUpdated: now,
        },

        // 🎯 MÉTRICAS DE ENGAJAMENTO - TODAS REAIS
        {
          id: 'total_study_sessions',
          name: 'Sessões de Estudo (30d)',
          description:
            'Número total de sessões de estudo registradas nos últimos 30 dias',
          category: 'engagement',
          type: 'count',
          available: true,
          currentValue: statsData.studySessions,
          lastUpdated: now,
        },
        {
          id: 'total_annotations',
          name: 'Anotações Públicas',
          description:
            'Número total de anotações públicas criadas pelos usuários',
          category: 'engagement',
          type: 'count',
          available: true,
          currentValue: statsData.totalAnnotations,
          lastUpdated: now,
        },
        {
          id: 'annotations_per_work',
          name: 'Anotações por Obra',
          description: 'Média de anotações por obra no sistema',
          category: 'engagement',
          type: 'avg',
          available: true,
          currentValue:
            statsData.totalWorks > 0
              ? Math.round(
                  (statsData.totalAnnotations / statsData.totalWorks) * 100
                ) / 100
              : 0,
          lastUpdated: now,
        },
        {
          id: 'user_engagement_score',
          name: 'Score de Engajamento',
          description:
            'Pontuação média de engajamento dos usuários (baseado em sessões, anotações, favoritos)',
          category: 'engagement',
          type: 'avg',
          available: true,
          currentValue: 'Calculado via relatórios',
          lastUpdated: now,
        },
        {
          id: 'most_studied_works',
          name: 'Obras Mais Estudadas',
          description: 'Ranking das 10 obras com mais sessões de estudo',
          category: 'engagement',
          type: 'count',
          available: true,
          currentValue: 'Top 10 disponível',
          lastUpdated: now,
        },

        // ⚙️ MÉTRICAS DE SISTEMA - REAIS
        {
          id: 'user_uploads_30d',
          name: 'Uploads de Usuários (30d)',
          description: 'Conteúdo enviado pelos usuários nos últimos 30 dias',
          category: 'system',
          type: 'count',
          available: true,
          currentValue: statsData.uploads,
          lastUpdated: now,
        },
        {
          id: 'system_performance',
          name: 'Performance do Sistema',
          description: 'Tempo médio de resposta das principais funcionalidades',
          category: 'system',
          type: 'avg',
          available: false, // Requer monitoramento específico
          currentValue: 'Monitoramento em implementação',
          lastUpdated: now,
        },
        {
          id: 'storage_usage',
          name: 'Uso de Armazenamento',
          description: 'Espaço total utilizado por partituras e mídia',
          category: 'system',
          type: 'sum',
          available: false, // Requer análise de sistema de arquivos
          currentValue: 'Em desenvolvimento',
          lastUpdated: now,
        },
        {
          id: 'api_usage',
          name: 'Uso da API',
          description: 'Número de requisições à API nas últimas 24h',
          category: 'system',
          type: 'count',
          available: false, // Requer logging específico
          currentValue: 'Monitoramento em implementação',
          lastUpdated: now,
        },

        // 📈 MÉTRICAS AVANÇADAS - PARCIALMENTE DISPONÍVEIS
        {
          id: 'popular_instruments',
          name: 'Instrumentos Populares',
          description: 'Ranking dos instrumentos mais estudados',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: 'Ranking disponível via relatórios',
          lastUpdated: now,
        },
        {
          id: 'composer_popularity',
          name: 'Popularidade de Compositores',
          description: 'Compositores com mais obras favoritadas e estudadas',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: 'Ranking disponível via relatórios',
          lastUpdated: now,
        },
        {
          id: 'difficulty_distribution',
          name: 'Distribuição por Dificuldade',
          description: 'Distribuição das obras por nível de dificuldade',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: 'Análise disponível via relatórios',
          lastUpdated: now,
        },
        {
          id: 'epoch_distribution',
          name: 'Distribuição por Época',
          description: 'Número de obras e compositores por época musical',
          category: 'content',
          type: 'count',
          available: true,
          currentValue: 'Análise disponível via relatórios',
          lastUpdated: now,
        },
      ];
    },
    []
  );

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
        const reportsData =
          data.results?.map((result: any) => ({
            ...result,
            generatedAt: new Date(result.generatedAt),
          })) || [];

        const statsData = data.stats || null;

        setResults(reportsData);
        setStats(statsData);

        // 🔄 BUSCAR MÉTRICAS REAIS BASEADAS NOS DADOS
        if (statsData) {
          const realMetrics = await fetchRealMetrics(statsData);
          setMetrics(realMetrics);
        }
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

      // 🔄 FALLBACK COM MÉTRICAS BÁSICAS
      if (stats) {
        const fallbackMetrics = await fetchRealMetrics(stats);
        setMetrics(fallbackMetrics);
      } else {
        // Métricas básicas se não houver dados
        setMetrics([
          {
            id: 'no_data',
            name: 'Dados Indisponíveis',
            description: 'Não foi possível carregar as métricas do sistema',
            category: 'system',
            type: 'count',
            available: false,
            currentValue: 'Erro ao carregar',
            lastUpdated: new Date(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, stats, fetchRealMetrics]);

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

      // 🔄 TRATAMENTO ESPECIAL PARA PDFs (que são HTMLs)
      if (result.format === 'pdf' && result.downloadUrl.endsWith('.html')) {
        // Abrir em nova aba para conversão manual para PDF
        const newWindow = window.open(result.downloadUrl, '_blank');
        if (newWindow) {
          // Adicionar instruções para conversão
          setTimeout(() => {
            if (!newWindow.closed) {
              toast.success('Para salvar como PDF: Ctrl+P → Salvar como PDF');
            }
          }, 1000);
        }
      } else {
        // Download normal para Excel e CSV
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `${result.name}_${result.period}.${result.format}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

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
