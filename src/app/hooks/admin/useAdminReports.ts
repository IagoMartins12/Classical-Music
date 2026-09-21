// app/hooks/admin/useAdminReports.ts
import { useCallback, useEffect, useState } from 'react';
import { adminKeys, errorMessage, useAdminQuery } from './query';
import { toast } from 'react-hot-toast';
import {
  deleteReportRequest,
  downloadReportRequest,
  generateReportRequest,
  listReports,
} from '@/app/requests/admin/operations';

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
  const [actionError, setActionError] = useState<string | null>(null);
  // Enquanto houver relatório em geração, a consulta se atualiza sozinha.
  const [generating, setGenerating] = useState(false);

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

  /**
   * Relatórios e métricas numa consulta só (TanStack Query). Enquanto houver
   * relatório sendo gerado, ela se atualiza de 30 em 30 s — como o legado
   * fazia com `setInterval`, mas parando sozinha quando não há o que esperar.
   */
  const reports = useAdminQuery(
    adminKeys.area('reports'),
    async () => {
      const data = await listReports();
      const results: ReportResult[] = data.results.map((result) => ({
        ...result,
        size: result.size ?? undefined,
        error: result.error ?? undefined,
        downloadUrl: result.downloadUrl ?? undefined,
        generatedAt: new Date(result.generatedAt),
      }));

      return {
        results,
        stats: data.stats,
        metrics: await fetchRealMetrics(data.stats),
      };
    },
    {
      refetchInterval: generating ? 30_000 : false,
    }
  );

  const results = reports.data?.results ?? [];

  useEffect(() => {
    setGenerating(results.some((result) => result.status === 'generating'));
  }, [reports.data]);

  // A API gera CSV (o formato pedido na tela não muda o arquivo).
  const generateReport = useCallback(
    async (
      type: string,
      format: 'pdf' | 'excel' | 'csv',
      period: string
    ): Promise<boolean> => {
      try {
        const result = await generateReportRequest(type, period);

        if (result.status === 'failed') {
          throw new Error(result.error || 'Erro ao gerar relatório');
        }

        setActionError(null);
        await reports.refetch();
        toast.success('Relatório gerado com sucesso!');
        return true;
      } catch (error) {
        const message = errorMessage(error);
        setActionError(message);
        toast.error(message);
        console.error('Erro ao gerar relatório:', error);
        return false;
      }
    },
    [reports]
  );

  const deleteReport = useCallback(
    async (reportId: string): Promise<boolean> => {
      try {
        await deleteReportRequest(reportId);
        setActionError(null);
        await reports.refetch();
        toast.success('Relatório excluído com sucesso!');
        return true;
      } catch (error) {
        const message = errorMessage(error);
        setActionError(message);
        toast.error(message);
        console.error('Erro ao excluir relatório:', error);
        return false;
      }
    },
    [reports]
  );

  // O download passa pela API com a sessão (o link direto não levaria o cookie).
  const downloadReport = useCallback((result: ReportResult) => {
    if (result.status !== 'ready') {
      toast.error('Relatório ainda não está pronto');
      return;
    }

    downloadReportRequest(result)
      .then(() => toast.success('Download iniciado!'))
      .catch((error) => {
        console.error('Erro ao fazer download:', error);
        toast.error('Erro ao iniciar download');
      });
  }, []);

  return {
    results,
    metrics: reports.data?.metrics ?? [],
    stats: reports.data?.stats ?? null,
    loading: reports.loading,
    error: reports.error ?? actionError,
    generateReport,
    deleteReport,
    downloadReport,
    refreshData: reports.refetch,
    templates: [], // Manter compatibilidade, mas vazio
  };
};
