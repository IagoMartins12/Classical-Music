// app/components/Admin/ReportsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiFlag,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiMusic,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';
import { useReports } from '@/app/hooks/useReports';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import LoadingAdminState from '../../Common/LoadingState';

interface ReportStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
}

interface ReportsByType {
  entityType: string;
  _count: { id: number };
}

interface ReportsByReason {
  reason: string;
  _count: { id: number };
}

export default function ReportsDashboard() {
  const router = useRouter();
  const { loading, fetchStats } = useReports();

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [reportsByType, setReportsByType] = useState<ReportsByType[]>([]);
  const [reportsByReason, setReportsByReason] = useState<ReportsByReason[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    setRefreshing(true);
    try {
      const data = await fetchStats();
      if (data) {
        setStats(data.stats);
        setReportsByType(data.reportsByType || []);
        setReportsByReason(data.reportsByReason || []);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Conteúdo inadequado',
      copyright_violation: 'Violação de direitos autorais',
      false_information: 'Informações falsas',
      spam: 'Spam',
      duplicate_content: 'Conteúdo duplicado',
      other: 'Outros',
    };
    return labels[reason] || reason;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      composer: 'Compositores',
      work: 'Obras',
      score: 'Partituras',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'composer':
        return <FiUser className="w-5 h-5" />;
      case 'work':
        return <FiMusic className="w-5 h-5" />;
      case 'score':
        return <FiFileText className="w-5 h-5" />;
      default:
        return <FiFlag className="w-5 h-5" />;
    }
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiFlag className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Dashboard de Reports
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Monitore e gerencie reports da plataforma
            </p>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                options={[
                  { value: '24h', label: 'Últimas 24h' },
                  { value: '7d', label: 'Últimos 7 dias' },
                  { value: '30d', label: 'Últimos 30 dias' },
                  { value: '90d', label: 'Últimos 90 dias' },
                ]}
                className="input-classical-2"
              />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                }
                onClick={loadStats}
                disabled={refreshing}
              >
                Atualizar
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                leftIcon={<FiFilter />}
                onClick={() => router.push('moderation/moderate')}
              >
                Moderação
              </Button>
              <Button
                variant="primary"
                leftIcon={<FiTrendingUp />}
                onClick={() => router.push('/admin/analytics')}
              >
                Analytics
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedCard className="classical-card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
                  <FiFlag className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {stats?.totalReports || 0}
              </div>
              <div className="text-sm text-theme-tertiary">
                Total de Reports
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-2xl flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {stats?.pendingReports || 0}
              </div>
              <div className="text-sm text-theme-tertiary">Pendentes</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {stats?.approvedReports || 0}
              </div>
              <div className="text-sm text-theme-tertiary">Aprovados</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-2xl flex items-center justify-center">
                  <FiXCircle className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {stats?.rejectedReports || 0}
              </div>
              <div className="text-sm text-theme-tertiary">Rejeitados</div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Reports by Type */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiUsers className="w-5 h-5 text-accent-blue" />
              <span>Reports por Tipo</span>
            </h3>

            {reportsByType.length > 0 ? (
              <div className="space-y-4">
                {reportsByType.map((item) => (
                  <div
                    key={item.entityType}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                        {getTypeIcon(item.entityType)}
                      </div>
                      <span className="font-medium text-theme-primary">
                        {getTypeLabel(item.entityType)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-theme-primary">
                        {item._count.id}
                      </span>
                      <div className="w-16 h-2 bg-theme-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (item._count.id / (stats?.pendingReports || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-theme-tertiary">
                <FiFlag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum report pendente</p>
              </div>
            )}
          </AnimatedCard>

          {/* Reports by Reason */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-accent-red" />
              <span>Reports por Motivo</span>
            </h3>

            {reportsByReason.length > 0 ? (
              <div className="space-y-4">
                {reportsByReason.map((item) => (
                  <div
                    key={item.reason}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-amber rounded-lg flex items-center justify-center">
                        <FiFlag className="w-4 h-4 text-theme-primary" />
                      </div>
                      <span className="font-medium text-theme-primary">
                        {getReasonLabel(item.reason)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-theme-primary">
                        {item._count.id}
                      </span>
                      <div className="w-16 h-2 bg-theme-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-red to-accent-amber rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (item._count.id / (stats?.pendingReports || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-theme-tertiary">
                <FiAlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum report pendente</p>
              </div>
            )}
          </AnimatedCard>
        </div>

        {/* Quick Actions */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedCard className="classical-card p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-amber rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-6 h-6 text-theme-primary" />
              </div>
              <h3 className="text-lg font-bold text-theme-primary mb-2">
                Reports Pendentes
              </h3>
              <p className="text-theme-secondary mb-4">
                {stats?.pendingReports || 0} reports aguardando moderação
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('moderation/moderate')}
              >
                Moderar Agora
              </Button>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-6 h-6 text-theme-primary" />
              </div>
              <h3 className="text-lg font-bold text-theme-primary mb-2">
                Usuários Reportados
              </h3>
              <p className="text-theme-secondary mb-4">
                Gerenciar usuários com múltiplos reports
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/users')}
              >
                Ver Usuários
              </Button>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-6 h-6 text-theme-primary" />
              </div>
              <h3 className="text-lg font-bold text-theme-primary mb-2">
                Relatórios Avançados
              </h3>
              <p className="text-theme-secondary mb-4">
                Análises detalhadas e métricas
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/analytics')}
              >
                Ver Relatórios
              </Button>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Loading State */}
        {loading && <LoadingAdminState loadingName="estatísticas" />}
      </AnimatedContainer>
    </PageContainer>
  );
}
