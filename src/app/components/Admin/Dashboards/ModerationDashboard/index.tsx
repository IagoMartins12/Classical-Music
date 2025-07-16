// app/components/Admin/Moderation/ModerationDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiShield,
  FiFlag,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiUsers,
  FiFileText,
  FiMusic,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiMoreHorizontal,
  FiAward,
  FiTarget,
  FiActivity,
  FiTrendingUp,
  FiMessageSquare,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';

interface ModerationItem {
  id: string;
  type: 'composer' | 'work' | 'score' | 'annotation';
  title: string;
  uploader: {
    id: string;
    name: string;
    email: string;
    uploadScore: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: Date;
  reportCount: number;
  qualityScore?: number;
  issues: string[];
  content: {
    description?: string;
    metadata?: any;
    fileUrl?: string;
  };
}

interface ModerationStats {
  pending: number;
  processed: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
  topModerators: Array<{
    id: string;
    name: string;
    processed: number;
    accuracy: number;
  }>;
  qualityTrends: Array<{
    date: string;
    avgQuality: number;
    totalItems: number;
  }>;
}



export default function ModerationDashboard() {
  const router = useRouter();
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Mock data para demonstração
  const mockModerationItems: ModerationItem[] = [
    {
      id: '1',
      type: 'composer',
      title: 'Claude Debussy',
      uploader: {
        id: 'u1',
        name: 'João Silva',
        email: 'joao@email.com',
        uploadScore: 4.7,
      },
      status: 'pending',
      priority: 'high',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reportCount: 2,
      qualityScore: 8.5,
      issues: ['Biografia incompleta', 'Falta verificação de datas'],
      content: {
        description: 'Compositor francês do período impressionista...',
        metadata: { birthYear: 1862, deathYear: 1918 },
      },
    },
    {
      id: '2',
      type: 'work',
      title: 'Sonata para Piano No. 1',
      uploader: {
        id: 'u2',
        name: 'Maria Santos',
        email: 'maria@email.com',
        uploadScore: 4.2,
      },
      status: 'flagged',
      priority: 'urgent',
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      reportCount: 5,
      qualityScore: 6.2,
      issues: ['Informações conflitantes', 'Possível duplicata'],
      content: {
        description: 'Primeira sonata composta em 1798...',
        metadata: { opus: 'Op. 1', key: 'C major' },
      },
    },
    {
      id: '3',
      type: 'score',
      title: 'Für Elise - Partitura Simplificada',
      uploader: {
        id: 'u3',
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        uploadScore: 3.9,
      },
      status: 'pending',
      priority: 'normal',
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      reportCount: 0,
      qualityScore: 7.8,
      issues: [],
      content: {
        description: 'Versão simplificada para iniciantes',
        fileUrl: '/uploads/fur-elise-simple.pdf',
      },
    },
  ];

  const mockStats: ModerationStats = {
    pending: 47,
    processed: 234,
    approved: 189,
    rejected: 45,
    avgProcessingTime: 3.2, // horas
    topModerators: [
      { id: 'm1', name: 'Ana Moderadora', processed: 156, accuracy: 94.5 },
      { id: 'm2', name: 'Carlos Admin', processed: 134, accuracy: 92.1 },
      { id: 'm3', name: 'Lucia Expert', processed: 98, accuracy: 96.8 },
    ],
    qualityTrends: [
      { date: '2024-01-01', avgQuality: 7.2, totalItems: 45 },
      { date: '2024-01-02', avgQuality: 7.8, totalItems: 52 },
      { date: '2024-01-03', avgQuality: 8.1, totalItems: 38 },
    ],
  };

  useEffect(() => {
    setModerationItems(mockModerationItems);
    setStats(mockStats);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-accent-amber bg-accent-amber/10';
      case 'approved':
        return 'text-accent-green bg-accent-green/10';
      case 'rejected':
        return 'text-accent-red bg-accent-red/10';
      case 'flagged':
        return 'text-accent-purple bg-accent-purple/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-accent-red';
      case 'high':
        return 'text-accent-amber';
      case 'normal':
        return 'text-accent-blue';
      case 'low':
        return 'text-theme-tertiary';
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
      case 'annotation':
        return FiMessageSquare;
      default:
        return FiFileText;
    }
  };

  const handleApprove = async (itemId: string) => {
    console.log('Aprovando item:', itemId);
    // Implementar lógica de aprovação
  };

  const handleReject = async (itemId: string) => {
    console.log('Rejeitando item:', itemId);
    // Implementar lógica de rejeição
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'flag') => {
    console.log(`Ação em lote: ${action} para`, Array.from(selectedItems));
    // Implementar ações em lote
  };

  const filteredItems = moderationItems.filter((item) => {
    const matchesStatus =
      selectedFilter === 'all' || item.status === selectedFilter;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesPriority =
      selectedPriority === 'all' || item.priority === selectedPriority;
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uploader.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesPriority && matchesSearch;
  });

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiShield className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Centro de Moderação
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Controle de qualidade e moderação de conteúdo
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Overview */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Itens Pendentes"
              value={stats?.pending || 0}
              change={{ value: -12.3, isPositive: false }}
              icon={FiClock}
              color="#F59E0B"
            />

            <MetricCard
              title="Processados Hoje"
              value={stats?.processed || 0}
              change={{ value: 8.7, isPositive: true }}
              icon={FiCheck}
              color="#10B981"
            />

            <MetricCard
              title="Taxa de Aprovação"
              value={`${(
                ((stats?.approved || 0) / (stats?.processed || 1)) *
                100
              ).toFixed(1)}%`}
              change={{ value: 5.2, isPositive: true }}
              icon={FiAward}
              color="#3B82F6"
            />

            <MetricCard
              title="Tempo Médio"
              value={`${stats?.avgProcessingTime.toFixed(1)}h`}
              change={{ value: -15.4, isPositive: true }}
              icon={FiActivity}
              color="#8B5CF6"
            />
          </div>
        </AnimatedItem>

        {/* Filters and Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            {/* Left side filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-classical-2 pl-10 w-64"
                />
              </div>

              <Select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos os Status' },
                  { value: 'pending', label: 'Pendentes' },
                  { value: 'flagged', label: 'Reportados' },
                  { value: 'approved', label: 'Aprovados' },
                  { value: 'rejected', label: 'Rejeitados' },
                ]}
                className="input-classical-2"
              />

              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos os Tipos' },
                  { value: 'composer', label: 'Compositores' },
                  { value: 'work', label: 'Obras' },
                  { value: 'score', label: 'Partituras' },
                  { value: 'annotation', label: 'Anotações' },
                ]}
                className="input-classical-2"
              />

              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas as Prioridades' },
                  { value: 'urgent', label: 'Urgente' },
                  { value: 'high', label: 'Alta' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'low', label: 'Baixa' },
                ]}
                className="input-classical-2"
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {selectedItems.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-theme-secondary">
                    {selectedItems.size} selecionados
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiCheck />}
                    onClick={() => handleBulkAction('approve')}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiX />}
                    onClick={() => handleBulkAction('reject')}
                  >
                    Rejeitar
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                }
                onClick={() => setRefreshing(!refreshing)}
              >
                Atualizar
              </Button>

              <Button variant="primary" size="sm" leftIcon={<FiFilter />}>
                Filtros Avançados
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* Moderation Queue */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card overflow-hidden">
            <div className="p-6 border-b border-theme-secondary">
              <h3 className="text-xl font-bold text-theme-primary">
                Fila de Moderação ({filteredItems.length})
              </h3>
            </div>

            <div className="divide-y divide-theme-secondary">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-theme-secondary/50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedItems);
                            if (e.target.checked) {
                              newSelected.add(item.id);
                            } else {
                              newSelected.delete(item.id);
                            }
                            setSelectedItems(newSelected);
                          }}
                          className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                        />
                      </div>

                      {/* Type Icon */}
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-5 h-5 text-theme-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-bold text-theme-primary truncate">
                                {item.title}
                              </h4>

                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {item.status === 'pending'
                                  ? 'Pendente'
                                  : item.status === 'approved'
                                  ? 'Aprovado'
                                  : item.status === 'rejected'
                                  ? 'Rejeitado'
                                  : 'Reportado'}
                              </span>

                              <span
                                className={`text-xs font-medium ${getPriorityColor(
                                  item.priority
                                )}`}
                              >
                                {item.priority === 'urgent'
                                  ? 'URGENTE'
                                  : item.priority === 'high'
                                  ? 'ALTA'
                                  : item.priority === 'normal'
                                  ? 'NORMAL'
                                  : 'BAIXA'}
                              </span>

                              {item.reportCount > 0 && (
                                <div className="flex items-center space-x-1">
                                  <FiFlag className="w-3 h-3 text-accent-red" />
                                  <span className="text-xs text-accent-red font-medium">
                                    {item.reportCount} reports
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-theme-secondary mb-3">
                              <span>Por {item.uploader.name}</span>
                              <span>•</span>
                              <span>
                                Score: {item.uploader.uploadScore.toFixed(1)}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(item.submittedAt).toLocaleString(
                                  'pt-BR'
                                )}
                              </span>
                              {item.qualityScore && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Qualidade: {item.qualityScore.toFixed(1)}/10
                                  </span>
                                </>
                              )}
                            </div>

                            {item.content.description && (
                              <p className="text-sm text-theme-secondary mb-3 line-clamp-2">
                                {item.content.description}
                              </p>
                            )}

                            {item.issues.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.issues.map((issue, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-accent-amber/10 text-accent-amber text-xs rounded-lg"
                                  >
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() =>
                            router.push(`/admin/moderate/${item.id}`)
                          }
                        >
                          Revisar
                        </Button>

                        {item.status === 'pending' ||
                        item.status === 'flagged' ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<FiCheck />}
                              onClick={() => handleApprove(item.id)}
                              className="text-accent-green hover:bg-accent-green/10"
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<FiX />}
                              onClick={() => handleReject(item.id)}
                              className="text-accent-red hover:bg-accent-red/10"
                            >
                              Rejeitar
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiMoreHorizontal />}
                          >
                            Ações
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="p-12 text-center">
                <FiShield className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-theme-primary mb-2">
                  Nenhum item encontrado
                </h3>
                <p className="text-theme-secondary">
                  Não há itens que correspondam aos filtros selecionados.
                </p>
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Top Moderators */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiTarget className="w-5 h-5 text-accent-green" />
              <span>Top Moderadores</span>
            </h3>
            <div className="space-y-4">
              {stats?.topModerators.map((moderator, index) => (
                <div
                  key={moderator.id}
                  className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-theme-primary">
                      {moderator.name}
                    </p>
                    <p className="text-sm text-theme-tertiary">
                      {moderator.processed} processados •{' '}
                      {moderator.accuracy.toFixed(1)}% precisão
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Quality Metrics */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiTrendingUp className="w-5 h-5 text-accent-blue" />
              <span>Métricas de Qualidade</span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    Taxa de Aprovação Geral
                  </span>
                  <span className="text-2xl font-bold text-accent-green">
                    {(
                      ((stats?.approved || 0) / (stats?.processed || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full"
                    style={{
                      width: `${
                        ((stats?.approved || 0) / (stats?.processed || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-theme-secondary rounded-xl">
                  <div className="text-lg font-bold text-accent-blue">
                    {stats?.avgProcessingTime.toFixed(1)}h
                  </div>
                  <div className="text-xs text-theme-tertiary">Tempo Médio</div>
                </div>
                <div className="text-center p-3 bg-theme-secondary rounded-xl">
                  <div className="text-lg font-bold text-accent-purple">
                    {stats?.pending || 0}
                  </div>
                  <div className="text-xs text-theme-tertiary">Na Fila</div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
