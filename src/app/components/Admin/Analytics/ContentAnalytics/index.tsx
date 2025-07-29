// app/components/Admin/Content/ContentAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMusic,
  FiUsers,
  FiFileText,
  FiStar,
  FiHeart,
  FiMessageSquare,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiShield,
  FiBarChart2,
  FiActivity,
  FiTarget,
  FiDatabase,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import {
  AdminBarChart,
  AdminPieChart,
  MetricCard,
} from '@/app/components/Admin/Charts/AdminCharts';
import { useAdminStats, formatNumber } from '@/app/hooks/admin/useAdminStats';

interface ContentMetrics {
  totalComposers: number;
  verifiedComposers: number;
  totalWorks: number;
  totalScores: number;
  avgScoresPerWork: number;
  mostPopularWorks: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    studySessionsCount: number;
    annotationsCount: number;
    scoresCount: number;
  }>;
  mostPopularComposers: Array<{
    id: string;
    name: string;
    worksCount: number;
    totalFavorites: number;
    totalStudySessions: number;
    epoch: string;
  }>;
  contentByEpoch: Array<{
    epoch: string;
    composersCount: number;
    worksCount: number;
    scoresCount: number;
  }>;
  qualityMetrics: {
    highQualityContent: number;
    mediumQualityContent: number;
    lowQualityContent: number;
    averageQualityScore: number;
  };
  recentContent: Array<{
    id: string;
    type: 'composer' | 'work' | 'score';
    title: string;
    uploader: string;
    uploadDate: Date;
    quality: string;
    verified: boolean;
  }>;
}

export default function ContentAnalytics() {
  const router = useRouter();
  const { refreshStats } = useAdminStats();
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics | null>(
    null
  );
  const [timeframe, setTimeframe] = useState('30d');
  const [contentType, setContentType] = useState('all');
  const [epochFilter, setEpochFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Dados mockados (em produção, vir da API)
  const mockContentMetrics: ContentMetrics = {
    totalComposers: 1247,
    verifiedComposers: 892,
    totalWorks: 15432,
    totalScores: 34567,
    avgScoresPerWork: 2.24,
    mostPopularWorks: [
      {
        id: '1',
        title: 'Für Elise',
        composer: 'Ludwig van Beethoven',
        favoritesCount: 1234,
        studySessionsCount: 5678,
        annotationsCount: 234,
        scoresCount: 12,
      },
      {
        id: '2',
        title: 'Canon in D',
        composer: 'Johann Pachelbel',
        favoritesCount: 1098,
        studySessionsCount: 4523,
        annotationsCount: 189,
        scoresCount: 8,
      },
      {
        id: '3',
        title: 'Clair de Lune',
        composer: 'Claude Debussy',
        favoritesCount: 987,
        studySessionsCount: 3456,
        annotationsCount: 167,
        scoresCount: 6,
      },
    ],
    mostPopularComposers: [
      {
        id: '1',
        name: 'Ludwig van Beethoven',
        worksCount: 234,
        totalFavorites: 8756,
        totalStudySessions: 23456,
        epoch: 'Clássico',
      },
      {
        id: '2',
        name: 'Johann Sebastian Bach',
        worksCount: 312,
        totalFavorites: 7234,
        totalStudySessions: 19876,
        epoch: 'Barroco',
      },
      {
        id: '3',
        name: 'Wolfgang Amadeus Mozart',
        worksCount: 187,
        totalFavorites: 6789,
        totalStudySessions: 18234,
        epoch: 'Clássico',
      },
    ],
    contentByEpoch: [
      {
        epoch: 'Barroco',
        composersCount: 123,
        worksCount: 2345,
        scoresCount: 5678,
      },
      {
        epoch: 'Clássico',
        composersCount: 156,
        worksCount: 3456,
        scoresCount: 7890,
      },
      {
        epoch: 'Romântico',
        composersCount: 234,
        worksCount: 4567,
        scoresCount: 9876,
      },
      {
        epoch: 'Moderno',
        composersCount: 189,
        worksCount: 2890,
        scoresCount: 6543,
      },
      {
        epoch: 'Contemporâneo',
        composersCount: 98,
        worksCount: 1234,
        scoresCount: 2987,
      },
    ],
    qualityMetrics: {
      highQualityContent: 65.4,
      mediumQualityContent: 28.3,
      lowQualityContent: 6.3,
      averageQualityScore: 4.2,
    },
    recentContent: [
      {
        id: '1',
        type: 'composer',
        title: 'Camille Saint-Saëns',
        uploader: 'João Silva',
        uploadDate: new Date(),
        quality: 'high',
        verified: true,
      },
      {
        id: '2',
        type: 'work',
        title: 'Sonata No. 14 "Moonlight"',
        uploader: 'Maria Santos',
        uploadDate: new Date(),
        quality: 'high',
        verified: false,
      },
    ],
  };

  useEffect(() => {
    setContentMetrics(mockContentMetrics);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    // Refresh content metrics
    setRefreshing(false);
  };

  const handleExportData = () => {
    console.log('Exportando dados de conteúdo...');
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high':
        return 'text-accent-green';
      case 'medium':
        return 'text-accent-amber';
      case 'low':
        return 'text-accent-red';
      default:
        return 'text-theme-tertiary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'composer':
        return FiUsers;
      case 'work':
        return FiMusic;
      case 'score':
        return FiFileText;
      default:
        return FiDatabase;
    }
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiDatabase className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Análise de Conteúdo
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Insights sobre compositores, obras e partituras
            </p>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                options={[
                  { value: '7d', label: 'Últimos 7 dias' },
                  { value: '30d', label: 'Últimos 30 dias' },
                  { value: '90d', label: 'Últimos 90 dias' },
                  { value: '1y', label: 'Último ano' },
                ]}
                className="input-classical-2"
              />

              <Select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                options={[
                  { value: 'all', label: 'Todo Conteúdo' },
                  { value: 'composers', label: 'Compositores' },
                  { value: 'works', label: 'Obras' },
                  { value: 'scores', label: 'Partituras' },
                ]}
                className="input-classical-2"
              />

              <Select
                value={epochFilter}
                onChange={(e) => setEpochFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas as Épocas' },
                  { value: 'baroque', label: 'Barroco' },
                  { value: 'classical', label: 'Clássico' },
                  { value: 'romantic', label: 'Romântico' },
                  { value: 'modern', label: 'Moderno' },
                  { value: 'contemporary', label: 'Contemporâneo' },
                ]}
                className="input-classical-2"
              />

              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                }
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Atualizar
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiDownload />}
                onClick={handleExportData}
              >
                Exportar
              </Button>
              <Button variant="primary" size="sm" leftIcon={<FiFilter />}>
                Filtros Avançados
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* Overview Metrics */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total de Compositores"
              value={contentMetrics?.totalComposers || 0}
              change={{ value: 5.2, isPositive: true }}
              icon={FiUsers}
              color="#3B82F6"
            />

            <MetricCard
              title="Obras Catalogadas"
              value={contentMetrics?.totalWorks || 0}
              change={{ value: 12.8, isPositive: true }}
              icon={FiMusic}
              color="#10B981"
            />

            <MetricCard
              title="Partituras Disponíveis"
              value={contentMetrics?.totalScores || 0}
              change={{ value: 8.4, isPositive: true }}
              icon={FiFileText}
              color="#F59E0B"
            />

            <MetricCard
              title="Score de Qualidade"
              value={
                contentMetrics?.qualityMetrics.averageQualityScore.toFixed(1) ||
                '0.0'
              }
              change={{ value: 3.1, isPositive: true }}
              icon={FiStar}
              color="#8B5CF6"
            />
          </div>
        </AnimatedItem>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Content by Epoch */}
          <AnimatedCard className="classical-card p-6">
            <AdminBarChart
              data={
                contentMetrics?.contentByEpoch.map((e) => ({
                  name: e.epoch,
                  value: e.worksCount,
                })) || []
              }
              title="Obras por Época"
              subtitle="Distribuição do conteúdo por período histórico"
              color="#3B82F6"
              height={350}
            />
          </AnimatedCard>

          {/* Quality Distribution */}
          <AnimatedCard className="classical-card p-6">
            <AdminPieChart
              data={[
                {
                  name: 'Alta Qualidade',
                  value: contentMetrics?.qualityMetrics.highQualityContent || 0,
                },
                {
                  name: 'Média Qualidade',
                  value:
                    contentMetrics?.qualityMetrics.mediumQualityContent || 0,
                },
                {
                  name: 'Baixa Qualidade',
                  value: contentMetrics?.qualityMetrics.lowQualityContent || 0,
                },
              ]}
              title="Distribuição de Qualidade"
              subtitle="Percentual de conteúdo por nível de qualidade"
              height={350}
              innerRadius={60}
            />
          </AnimatedCard>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Most Popular Works */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiMusic className="w-5 h-5 text-accent-blue" />
              <span>Obras Mais Populares</span>
            </h3>
            <div className="space-y-4">
              {contentMetrics?.mostPopularWorks
                .slice(0, 5)
                .map((work, index) => (
                  <div
                    key={work.id}
                    className="p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-theme-primary truncate">
                          {work.title}
                        </p>
                        <p className="text-sm text-theme-tertiary truncate">
                          {work.composer}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center space-x-1">
                            <FiHeart className="w-3 h-3 text-accent-red" />
                            <span className="text-xs text-theme-tertiary">
                              {work.favoritesCount}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiActivity className="w-3 h-3 text-accent-green" />
                            <span className="text-xs text-theme-tertiary">
                              {work.studySessionsCount}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiMessageSquare className="w-3 h-3 text-accent-blue" />
                            <span className="text-xs text-theme-tertiary">
                              {work.annotationsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => router.push('/admin/works')}
            >
              Ver Todas as Obras
            </Button>
          </AnimatedCard>

          {/* Most Popular Composers */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiUsers className="w-5 h-5 text-accent-green" />
              <span>Compositores Populares</span>
            </h3>
            <div className="space-y-4">
              {contentMetrics?.mostPopularComposers
                .slice(0, 5)
                .map((composer, index) => (
                  <div
                    key={composer.id}
                    className="p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-theme-primary truncate">
                          {composer.name}
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          {composer.epoch} • {composer.worksCount} obras
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-accent-red">
                            {formatNumber(composer.totalFavorites)} favoritos
                          </span>
                          <span className="text-xs text-accent-green">
                            {formatNumber(composer.totalStudySessions)} sessões
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => router.push('/admin/composers')}
            >
              Ver Todos os Compositores
            </Button>
          </AnimatedCard>

          {/* Content Quality Insights */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiTarget className="w-5 h-5 text-accent-amber" />
              <span>Insights de Qualidade</span>
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    Compositores Verificados
                  </span>
                  <span className="text-lg font-bold text-accent-green">
                    {(
                      ((contentMetrics?.verifiedComposers || 0) /
                        (contentMetrics?.totalComposers || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        ((contentMetrics?.verifiedComposers || 0) /
                          (contentMetrics?.totalComposers || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    Partituras por Obra
                  </span>
                  <span className="text-lg font-bold text-accent-blue">
                    {contentMetrics?.avgScoresPerWork.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        (contentMetrics?.avgScoresPerWork || 0) * 20,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 bg-theme-secondary rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-purple mb-1">
                    {contentMetrics?.qualityMetrics.averageQualityScore.toFixed(
                      1
                    )}
                    /5.0
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Score Médio de Qualidade
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Recent Uploads and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Content */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiCalendar className="w-5 h-5 text-accent-purple" />
              <span>Conteúdo Recente</span>
            </h3>
            <div className="space-y-3">
              {contentMetrics?.recentContent.map((content) => {
                const IconComponent = getTypeIcon(content.type);
                return (
                  <div
                    key={content.id}
                    className="flex items-start space-x-3 p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-theme-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-theme-primary truncate">
                        {content.title}
                      </p>
                      <p className="text-sm text-theme-tertiary">
                        Por {content.uploader} • {content.type}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-xs ${getQualityColor(
                            content.quality
                          )}`}
                        >
                          Qualidade {content.quality}
                        </span>
                        {content.verified && (
                          <span className="text-xs text-accent-green">
                            Verificado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" leftIcon={<FiEye />}>
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<FiEdit />}>
                        Editar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => router.push('/admin/uploads')}
            >
              Ver Todos os Uploads
            </Button>
          </AnimatedCard>

          {/* Content Statistics */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiBarChart2 className="w-5 h-5 text-accent-blue" />
              <span>Estatísticas Detalhadas</span>
            </h3>

            <div className="space-y-4">
              {contentMetrics?.contentByEpoch.map((epoch) => (
                <div
                  key={epoch.epoch}
                  className="p-3 bg-theme-secondary rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-theme-primary">
                      {epoch.epoch}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-accent-blue">
                        {epoch.composersCount}
                      </span>
                      <span className="text-xs text-theme-tertiary">
                        compositores
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-theme-primary rounded">
                      <div className="font-bold text-accent-green">
                        {formatNumber(epoch.worksCount)}
                      </div>
                      <div className="text-theme-tertiary">Obras</div>
                    </div>
                    <div className="text-center p-2 bg-theme-primary rounded">
                      <div className="font-bold text-accent-amber">
                        {formatNumber(epoch.scoresCount)}
                      </div>
                      <div className="text-theme-tertiary">Partituras</div>
                    </div>
                    <div className="text-center p-2 bg-theme-primary rounded">
                      <div className="font-bold text-accent-purple">
                        {(epoch.scoresCount / epoch.worksCount).toFixed(1)}
                      </div>
                      <div className="text-theme-tertiary">P/Obra</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Action Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              variant="secondary"
              className="h-auto p-6 flex-col"
              onClick={() => router.push('/admin/composers')}
            >
              <FiUsers className="w-8 h-8 mb-3 text-accent-blue" />
              <span className="font-bold mb-2">Gerenciar Compositores</span>
              <span className="text-sm text-theme-tertiary text-center">
                {formatNumber(contentMetrics?.totalComposers || 0)} compositores
                cadastrados
              </span>
            </Button>

            <Button
              variant="secondary"
              className="h-auto p-6 flex-col"
              onClick={() => router.push('/admin/works')}
            >
              <FiMusic className="w-8 h-8 mb-3 text-accent-green" />
              <span className="font-bold mb-2">Gerenciar Obras</span>
              <span className="text-sm text-theme-tertiary text-center">
                {formatNumber(contentMetrics?.totalWorks || 0)} obras
                catalogadas
              </span>
            </Button>

            <Button
              variant="secondary"
              className="h-auto p-6 flex-col"
              onClick={() => router.push('/admin/scores')}
            >
              <FiFileText className="w-8 h-8 mb-3 text-accent-amber" />
              <span className="font-bold mb-2">Gerenciar Partituras</span>
              <span className="text-sm text-theme-tertiary text-center">
                {formatNumber(contentMetrics?.totalScores || 0)} partituras
                disponíveis
              </span>
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
