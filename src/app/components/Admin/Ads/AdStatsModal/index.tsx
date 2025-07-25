// app/admin/ads/components/AdStatsModal.tsx - SEGUINDO O SCHEMA ATUAL
'use client';

import Button from '@/app/components/Common/Button';
import { useAds } from '@/app/hooks/admin/useAds';
import { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiTrendingUp,
  FiEye,
  FiMousePointer,
  FiClock,
  FiDownload,
} from 'react-icons/fi';
import { AdminPieChart, TrendAreaChart } from '../../Charts/AdminCharts';
import Select from '@/app/components/Common/Select';
import Modal from '@/app/components/Modal';

interface AdStatsModalProps {
  ad: any;
  onClose: () => void;
  statsAd: boolean;
}

const periodOptions = [
  { value: 'week', label: 'Última Semana' },
  { value: 'month', label: 'Último Mês' },
  { value: 'year', label: 'Último Ano' },
];

const groupByOptions = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];

export default function AdStatsModal({
  ad,
  onClose,
  statsAd,
}: AdStatsModalProps) {
  const { getAdStats } = useAds();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetchStats();
  }, [period, groupBy]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getAdStats(ad.id, period);
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportStats = () => {
    if (!stats) return;

    const csv = [
      ['Data', 'Impressões', 'Cliques', 'CTR', 'Tempo Hover (ms)'],
      ...stats.chartData.map((item: any) => [
        item.date,
        item.impressions || 0,
        item.clicks || 0,
        (item.impressions || 0) > 0
          ? (((item.clicks || 0) / (item.impressions || 0)) * 100).toFixed(2) +
            '%'
          : '0%',
        item.hoverTime || 0,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats-${ad.title}-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função auxiliar para formatar números com segurança
  const safeNumber = (value: any): number => {
    return typeof value === 'number' ? value : 0;
  };

  // Função auxiliar para formatar números com localização
  const formatNumber = (value: any): string => {
    return safeNumber(value).toLocaleString();
  };

  // Função auxiliar para formatar percentuais
  const formatPercentage = (value: any): string => {
    const num = safeNumber(value);
    return num.toFixed(2);
  };

  // Função para formatar tempo de hover em formato legível
  const formatHoverTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    return `${minutes.toFixed(1)}min`;
  };

  return (
    <Modal isOpen={statsAd} maxWidth="4xl" onClose={onClose}>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Estatísticas da Publicidade
              </h2>
              <p className="text-sm text-theme-tertiary">{ad.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={exportStats}
              disabled={!stats}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-theme-primary">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <Select
                label="Período"
                options={periodOptions}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>

            <div>
              <Select
                label="Agrupar por"
                options={groupByOptions}
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-theme-secondary">
                  Carregando estatísticas...
                </p>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Métricas Principais - APENAS CAMPOS EXISTENTES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-theme-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">
                      Impressões
                    </span>
                    <FiEye className="w-4 h-4 text-accent-blue" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {formatNumber(stats.totals?.impressions)}
                  </div>
                </div>

                <div className="bg-theme-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">Cliques</span>
                    <FiMousePointer className="w-4 h-4 text-accent-green" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {formatNumber(stats.totals?.clicks)}
                  </div>
                </div>

                <div className="bg-theme-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">CTR</span>
                    <FiTrendingUp className="w-4 h-4 text-accent-purple" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {formatPercentage(stats.totals?.ctr)}%
                  </div>
                </div>
              </div>

              {/* Métrica de Hover Time (se relevante) */}
              {stats.totals?.avgHoverTime > 0 && (
                <div className="bg-theme-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">
                      Tempo Médio de Hover
                    </span>
                    <FiClock className="w-4 h-4 text-accent-amber" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {formatHoverTime(stats.totals.avgHoverTime)}
                  </div>
                </div>
              )}

              {/* Gráfico de Tendência */}
              <div className="bg-theme-secondary rounded-xl p-6">
                <TrendAreaChart
                  data={(stats.chartData || []).map((item: any) => ({
                    name: new Date(item.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    }),
                    value: safeNumber(item.impressions),
                  }))}
                  title="Impressões ao Longo do Tempo"
                  subtitle={`Período: ${
                    period === 'week'
                      ? 'Última semana'
                      : period === 'month'
                      ? 'Último mês'
                      : 'Último ano'
                  }`}
                  color="#3B82F6"
                  height={300}
                />
              </div>

              {/* Gráficos Lado a Lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Breakdown por Dispositivo */}
                <div className="bg-theme-secondary rounded-xl p-6">
                  <AdminPieChart
                    data={[
                      {
                        name: 'Desktop',
                        value: (stats.chartData || []).reduce(
                          (sum: number, item: any) =>
                            sum + safeNumber(item.devices?.desktop),
                          0
                        ),
                      },
                      {
                        name: 'Mobile',
                        value: (stats.chartData || []).reduce(
                          (sum: number, item: any) =>
                            sum + safeNumber(item.devices?.mobile),
                          0
                        ),
                      },
                      {
                        name: 'Tablet',
                        value: (stats.chartData || []).reduce(
                          (sum: number, item: any) =>
                            sum + safeNumber(item.devices?.tablet),
                          0
                        ),
                      },
                    ].filter((item) => item.value > 0)}
                    title="Impressões por Dispositivo"
                    height={250}
                    innerRadius={50}
                  />
                </div>

                {/* Top Países */}
                <div className="bg-theme-secondary rounded-xl p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Top Países
                  </h3>
                  <div className="space-y-3">
                    {(stats.topCountries || [])
                      .slice(0, 5)
                      .map((country: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-theme-primary font-medium">
                            {country.country || 'Desconhecido'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-theme-primary rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-accent-blue rounded-full transition-all duration-1000"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (safeNumber(country._sum?.impressions) /
                                      Math.max(
                                        1,
                                        safeNumber(stats.totals?.impressions)
                                      )) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-theme-tertiary w-12 text-right">
                              {formatNumber(country._sum?.impressions)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Top Páginas */}
              {stats.topPages && stats.topPages.length > 0 && (
                <div className="bg-theme-secondary rounded-xl p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Páginas com Mais Impressões
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-theme-primary">
                          <th className="text-left py-2 text-theme-primary font-medium">
                            Página
                          </th>
                          <th className="text-right py-2 text-theme-primary font-medium">
                            Impressões
                          </th>
                          <th className="text-right py-2 text-theme-primary font-medium">
                            Cliques
                          </th>
                          <th className="text-right py-2 text-theme-primary font-medium">
                            CTR
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topPages
                          .slice(0, 5)
                          .map((page: any, index: number) => {
                            const impressions = safeNumber(
                              page._sum?.impressions
                            );
                            const clicks = safeNumber(page._sum?.clicks);
                            const ctr =
                              impressions > 0
                                ? (clicks / impressions) * 100
                                : 0;

                            return (
                              <tr
                                key={index}
                                className="border-b border-theme-secondary"
                              >
                                <td className="py-2 text-theme-primary max-w-xs truncate">
                                  {page.pageUrl?.replace(
                                    typeof window !== 'undefined'
                                      ? window.location.origin
                                      : '',
                                    ''
                                  ) || '/'}
                                </td>
                                <td className="py-2 text-theme-secondary text-right">
                                  {formatNumber(impressions)}
                                </td>
                                <td className="py-2 text-theme-secondary text-right">
                                  {formatNumber(clicks)}
                                </td>
                                <td className="py-2 text-theme-secondary text-right">
                                  {formatPercentage(ctr)}%
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiBarChart2 className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-medium text-theme-primary mb-2">
                Nenhuma estatística disponível
              </h3>
              <p className="text-theme-tertiary">
                Esta publicidade ainda não tem dados suficientes para exibir
                estatísticas.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
