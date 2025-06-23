'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  FiDownload,
  FiRefreshCw,
  FiDatabase,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiActivity,
} from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';

interface AnalyticsData {
  cache: {
    totalEntries: number;
    avgConfidence: number;
    avgResponseTime: number;
  };
  logs: {
    totalEntries: number;
    cacheHitRate: number;
    successRate: number;
    averageTime: number;
    topSubdomains: Array<{ subdomain: string; count: number }>;
  };
  ai: {
    patterns: number;
    globalStats: {
      totalRequests: number;
      successfulRequests: number;
      averageResponseTime: number;
      mostReliableSubdomain: string;
    };
  };
}

interface PatternAnalysis {
  topPatterns: Array<{
    pattern: string;
    data: {
      successRate: number;
      averageTime: number;
      confidence: number;
      subdomains: string[];
    };
  }>;
  subdomainRanking: Array<{ subdomain: string; score: number }>;
  recommendations: string[];
  insights: string[];
}

const COLORS = ['#d4af37', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

const IMSLPAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(
    new Date().toLocaleString('pt-BR')
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar estatísticas gerais
      const statsResponse = await fetch('/api/imslp-scores?type=stats');
      if (!statsResponse.ok) throw new Error('Erro ao carregar estatísticas');
      const statsData = await statsResponse.json();

      // Buscar análise de padrões
      const analysisResponse = await fetch('/api/imslp-scores?type=analysis');
      if (!analysisResponse.ok) throw new Error('Erro ao carregar análise');
      const analysisData = await analysisResponse.json();

      setData(statsData);
      setAnalysis(analysisData);
      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const clearData = async (type: string) => {
    try {
      const response = await fetch(`/api/imslp-scores?action=${type}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao limpar dados');

      // Recarregar dados
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar dados');
    }
  };

  const exportData = (type: string) => {
    const url = `/api/imslp-scores?type=${type}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-700">
            Carregando analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiActivity className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Erro no Dashboard
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subdomainChartData =
    data?.logs.topSubdomains.map((item) => ({
      subdomain: item.subdomain.replace('.imslp.org', '').replace('imslp.', ''),
      count: item.count,
    })) || [];

  const patternChartData =
    analysis?.topPatterns.slice(0, 8).map((item) => ({
      pattern:
        item.pattern.length > 15
          ? item.pattern.substring(0, 15) + '...'
          : item.pattern,
      successRate: (item.data.successRate * 100).toFixed(1),
      avgTime: item.data.averageTime,
      confidence: (item.data.confidence * 100).toFixed(1),
    })) || [];

  const performanceData = [
    {
      metric: 'Cache Hit Rate',
      value: data?.logs.cacheHitRate || 0,
      target: 80,
    },
    { metric: 'Success Rate', value: data?.logs.successRate || 0, target: 90 },
    {
      metric: 'AI Confidence',
      value: (data?.cache.avgConfidence || 0) * 100,
      target: 70,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BiBrain className="text-blue-500" />
                IMSLP Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema inteligente de monitoramento e análise de performance
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Atualizar
              </button>

              <button
                onClick={() => exportData('export')}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export Logs
              </button>

              <button
                onClick={() => exportData('export-patterns')}
                className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <BiBrain className="w-4 h-4" />
                Export IA
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Requests
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.logs.totalEntries || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {data?.ai.globalStats.successfulRequests || 0} sucessos
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Cache Hit Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(data?.logs.cacheHitRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDatabase className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {data?.cache.totalEntries || 0} entradas em cache
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(data?.logs.averageTime || 0).toFixed(0)}ms
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Resposta média do sistema</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Padrões IA</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.ai.patterns || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BiBrain className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Padrões aprendidos</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTarget className="text-green-500" />
              Métricas vs Targets
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="Atual" />
                <Bar dataKey="target" fill="#10B981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subdomain Usage */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" />
              Uso por Subdomain
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subdomainChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subdomain, percent }) =>
                    `${subdomain} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {subdomainChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Padrões de Performance */}
        {patternChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BiBrain className="text-purple-500" />
              Top Padrões por Performance
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={patternChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pattern" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="successRate"
                  fill="#10B981"
                  name="Success Rate %"
                />
                <Bar dataKey="confidence" fill="#8B5CF6" name="Confidence %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Insights e Recomendações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          {analysis?.insights && analysis.insights.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BiBrain className="text-blue-500" />
                Insights da IA
              </h3>
              <div className="space-y-3">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendações */}
          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiTarget className="text-green-500" />
                Recomendações
              </h3>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Ações de Manutenção
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => clearData('clear-cache')}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Limpar Cache
            </button>

            <button
              onClick={() => clearData('clear-logs')}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Limpar Logs
            </button>

            <button
              onClick={() => clearData('clear-patterns')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset IA
            </button>

            <button
              onClick={() => clearData('clear-all')}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Limpar Tudo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-500 text-sm">
          <p>Dashboard atualizado automaticamente a cada 30 segundos</p>
          <p className="mt-1">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IMSLPAnalyticsDashboard;
