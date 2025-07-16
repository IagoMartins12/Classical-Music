// app/components/Admin/Reports/AdvancedReports.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiFileText,
  FiDownload,
  FiPlay,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiMusic,
  FiActivity,
  FiRefreshCw,
  FiShare2,
  FiClock,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiLoader,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';
import { useAdminReports } from '@/app/hooks/admin/useAdminReports';
import { toast } from 'react-hot-toast';

export default function AdvancedReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    results,
    metrics,
    loading,
    error,
    generateReport,
    deleteReport,
    downloadReport,
    refreshData,
    stats,
  } = useAdminReports();

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(
    new Set()
  );
  const [deletingReports, setDeletingReports] = useState<Set<string>>(
    new Set()
  );

  const handleGenerateReport = async (type: string) => {
    setGeneratingReports((prev) => new Set(prev).add(type));

    try {
      const success = await generateReport(
        type,
        selectedFormat as any,
        selectedPeriod
      );
      if (success) {
        toast.success(
          'Relatório iniciado! Acompanhe o progresso na aba "Relatórios Gerados".'
        );
      }
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGeneratingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    setDeletingReports((prev) => new Set(prev).add(reportId));

    try {
      const success = await deleteReport(reportId);
      if (success) {
        toast.success('Relatório excluído com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao excluir relatório:', err);
      toast.error('Erro ao excluir relatório');
    } finally {
      setDeletingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleDownloadReport = (result: any) => {
    downloadReport(result);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <FiCheck className="w-5 h-5" />;
      case 'generating':
        return <FiLoader className="w-5 h-5 animate-spin" />;
      case 'failed':
        return <FiX className="w-5 h-5" />;
      default:
        return <FiClock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-accent-green bg-accent-green/10';
      case 'generating':
        return 'text-accent-blue bg-accent-blue/10';
      case 'failed':
        return 'text-accent-red bg-accent-red/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Pronto';
      case 'generating':
        return 'Gerando';
      case 'failed':
        return 'Falhou';
      default:
        return 'Pendente';
    }
  };

  const reportTypes = [
    {
      id: 'users-overview',
      name: 'Resumo de Usuários',
      description:
        'Estatísticas completas de usuários ativos, novos registros, tipos de usuário e principais contribuidores',
      category: 'users',
      icon: FiUsers,
      color: 'text-accent-blue',
      metrics: [
        'Total de usuários',
        'Usuários ativos (30d)',
        'Novos registros',
        'Principais contribuidores',
        'Tempo médio de sessão',
        'Usuários por tipo',
      ],
    },
    {
      id: 'content-analysis',
      name: 'Análise de Conteúdo',
      description:
        'Performance detalhada de obras, compositores, partituras e épocas mais populares',
      category: 'content',
      icon: FiMusic,
      color: 'text-accent-green',
      metrics: [
        'Total de obras',
        'Compositores por época',
        'Partituras disponíveis',
        'Obras mais populares',
        'Instrumentos mais utilizados',
        'Novos conteúdos adicionados',
      ],
    },
    {
      id: 'engagement-metrics',
      name: 'Métricas de Engajamento',
      description:
        'Análise profunda de interação dos usuários com sessões de estudo, anotações e metas',
      category: 'engagement',
      icon: FiActivity,
      color: 'text-accent-purple',
      metrics: [
        'Sessões de estudo',
        'Anotações por categoria',
        'Obras mais estudadas',
        'Metas de aprendizado',
        'Tempo total de estudo',
        'Engajamento mensal',
      ],
    },
  ];

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Relatórios
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button
            variant="primary"
            leftIcon={<FiRefreshCw />}
            onClick={refreshData}
          >
            Tentar Novamente
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (loading && !stats) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando dados do sistema...
            </p>
            <p className="text-theme-secondary mt-2">
              Buscando estatísticas reais da plataforma
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Real Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Total de Usuários"
            value={formatNumber(stats.totalUsers)}
            change={{ value: 12.5, isPositive: true }}
            icon={FiUsers}
            color="#3B82F6"
          />

          <MetricCard
            title="Total de Obras"
            value={formatNumber(stats.totalWorks)}
            change={{ value: 8.3, isPositive: true }}
            icon={FiMusic}
            color="#10B981"
          />

          <MetricCard
            title="Relatórios Gerados"
            value={results.length}
            change={{ value: results.length > 0 ? 100 : 0, isPositive: true }}
            icon={FiFileText}
            color="#F59E0B"
          />

          <MetricCard
            title="Sessões de Estudo (30d)"
            value={formatNumber(stats.studySessions)}
            change={{ value: 15.7, isPositive: true }}
            icon={FiActivity}
            color="#8B5CF6"
          />
        </div>
      )}

      {/* Additional Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Usuários Ativos (30d)"
            value={formatNumber(stats.activeUsers)}
            change={{ value: 5.2, isPositive: true }}
            icon={FiUsers}
            color="#06B6D4"
          />

          <MetricCard
            title="Novos Usuários (7d)"
            value={formatNumber(stats.newUsers)}
            change={{ value: 23.1, isPositive: true }}
            icon={FiTrendingUp}
            color="#84CC16"
          />

          <MetricCard
            title="Total de Partituras"
            value={formatNumber(stats.totalScores)}
            change={{ value: 4.8, isPositive: true }}
            icon={FiFileText}
            color="#EF4444"
          />

          <MetricCard
            title="Anotações Públicas"
            value={formatNumber(stats.totalAnnotations)}
            change={{ value: 18.9, isPositive: true }}
            icon={FiEdit}
            color="#F97316"
          />
        </div>
      )}

      {/* Report Generation */}
      <AnimatedCard className="classical-card p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Gerar Novo Relatório
            </h3>
            <p className="text-theme-secondary">
              Selecione o período e formato para gerar relatórios com dados
              reais da plataforma
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              options={[
                { value: '7d', label: 'Últimos 7 dias' },
                { value: '30d', label: 'Últimos 30 dias' },
                { value: '90d', label: 'Últimos 90 dias' },
                { value: '1y', label: 'Último ano' },
              ]}
              className="input-classical-2"
            />

            <Select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'excel', label: 'Excel' },
                { value: 'csv', label: 'CSV' },
              ]}
              className="input-classical-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {reportTypes.map((type) => {
            const isGenerating = generatingReports.has(type.id);

            return (
              <div
                key={type.id}
                className="p-4 bg-theme-secondary rounded-xl border-2 border-transparent hover:border-theme-primary/20 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-theme-primary/10 ${type.color}`}
                  >
                    <type.icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-theme-primary mb-1">
                      {type.name}
                    </h4>
                    <p className="text-sm text-theme-secondary mb-3">
                      {type.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {type.metrics.slice(0, 3).map((metric, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-theme-primary/10 rounded text-xs text-theme-secondary font-medium"
                        >
                          {metric}
                        </span>
                      ))}
                      {type.metrics.length > 3 && (
                        <span className="px-2 py-1 bg-theme-primary/10 rounded text-xs text-theme-secondary font-medium">
                          +{type.metrics.length - 3} mais
                        </span>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={
                        isGenerating ? (
                          <FiRefreshCw className="animate-spin" />
                        ) : (
                          <FiPlay />
                        )
                      }
                      onClick={() => handleGenerateReport(type.id)}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AnimatedCard>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-theme-primary">
            Relatórios Gerados
          </h3>
          <p className="text-theme-secondary">
            {results.length} relatório{results.length !== 1 ? 's' : ''}{' '}
            disponível{results.length !== 1 ? 'eis' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiRefreshCw />}
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => {
            const isDeleting = deletingReports.has(result.id);

            return (
              <AnimatedCard key={result.id} className="classical-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {getStatusIcon(result.status)}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-theme-primary">
                        {result.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
                        <span>Gerado: {formatDate(result.generatedAt)}</span>
                        <span className="uppercase font-medium">
                          {result.format}
                        </span>
                        {result.size && <span>{result.size}</span>}
                        <span className="uppercase font-medium">
                          {result.period}
                        </span>
                        {result.downloadCount && result.downloadCount > 0 && (
                          <span>
                            {result.downloadCount} download
                            {result.downloadCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            result.status
                          )}`}
                        >
                          {getStatusText(result.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {result.status === 'ready' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<FiDownload />}
                          onClick={() => handleDownloadReport(result)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiShare2 />}
                          onClick={() => {
                            navigator.clipboard.writeText(
                              window.location.origin + result.downloadUrl
                            );
                            toast.success(
                              'Link copiado para a área de transferência!'
                            );
                          }}
                        />
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={
                        isDeleting ? (
                          <FiRefreshCw className="animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )
                      }
                      className="text-accent-red hover:bg-accent-red/10"
                      onClick={() => handleDeleteReport(result.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Excluindo...' : ''}
                    </Button>
                  </div>
                </div>

                {result.error && (
                  <div className="mt-3 p-3 bg-accent-red/10 border border-accent-red rounded-lg">
                    <p className="text-sm text-accent-red">
                      <FiAlertTriangle className="inline w-4 h-4 mr-2" />
                      {result.error}
                    </p>
                  </div>
                )}
              </AnimatedCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiFileText className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme-primary mb-2">
            Nenhum relatório gerado ainda
          </h3>
          <p className="text-theme-secondary mb-4">
            Gere seu primeiro relatório na aba &quot;Visão Geral&quot; para ver
            dados reais da plataforma.
          </p>
          <Button
            variant="primary"
            leftIcon={<FiPlus />}
            onClick={() => setActiveTab('overview')}
          >
            Gerar Primeiro Relatório
          </Button>
        </div>
      )}
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-theme-primary">
          Métricas Disponíveis
        </h3>
        <p className="text-theme-secondary">
          {metrics.filter((m) => m.available).length} de {metrics.length}{' '}
          métricas disponíveis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <AnimatedCard key={metric.id} className="classical-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    metric.available
                      ? 'text-accent-green bg-accent-green/10'
                      : 'text-theme-tertiary bg-theme-secondary'
                  }`}
                >
                  <FiBarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-theme-primary">
                    {metric.name}
                  </h4>
                  <span className="text-xs text-theme-tertiary capitalize">
                    {metric.category}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  metric.available
                    ? 'text-accent-green bg-accent-green/10'
                    : 'text-theme-tertiary bg-theme-secondary'
                }`}
              >
                {metric.available ? 'Disponível' : 'Em desenvolvimento'}
              </span>
            </div>

            <p className="text-sm text-theme-secondary mb-2">
              {metric.description}
            </p>

            <div className="text-xs text-theme-tertiary">
              Tipo: <span className="capitalize">{metric.type}</span>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: FiBarChart2 },
    {
      id: 'results',
      label: `Relatórios (${results.length})`,
      icon: FiDownload,
    },
    { id: 'metrics', label: 'Métricas', icon: FiActivity },
  ];

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiFileText className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Relatórios do Sistema
            </h1>
            <p className="text-lg md:text-xl text-theme-secondary classical-subtitle">
              Geração automática de relatórios com dados reais da plataforma
            </p>
            {stats && (
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-theme-tertiary">
                <span>{formatNumber(stats.totalUsers)} usuários</span>
                <span>•</span>
                <span>{formatNumber(stats.totalWorks)} obras</span>
                <span>•</span>
                <span>{formatNumber(stats.totalScores)} partituras</span>
                <span>•</span>
                <span>{results.length} relatórios gerados</span>
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* Tabs */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-wrap gap-2 mb-8 p-2 bg-theme-elevated rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-lg'
                    : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </AnimatedItem>

        {/* Content */}
        <AnimatedItem direction="up" springType="gentle">
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'results' && renderResults()}
            {activeTab === 'metrics' && renderMetrics()}
          </div>
        </AnimatedItem>

        {/* Quick Actions */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-8 border-t border-theme-secondary">
            <Button
              variant="primary"
              leftIcon={<FiUsers />}
              onClick={() => {
                setActiveTab('overview');
                handleGenerateReport('users-overview');
              }}
              className="flex-1"
            >
              Gerar Relatório de Usuários
            </Button>
            <Button
              variant="secondary"
              leftIcon={<FiMusic />}
              onClick={() => {
                setActiveTab('overview');
                handleGenerateReport('content-analysis');
              }}
              className="flex-1"
            >
              Relatório de Conteúdo
            </Button>
            <Button
              variant="secondary"
              leftIcon={<FiActivity />}
              onClick={() => {
                setActiveTab('overview');
                handleGenerateReport('engagement-metrics');
              }}
              className="flex-1"
            >
              Métricas de Engajamento
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
