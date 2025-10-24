// app/components/Admin/Logs/LogsAudit/index.tsx - CORRIGIDO
'use client';

import {
  FiFileText,
  FiActivity,
  FiUser,
  FiSearch,
  FiRefreshCw,
  FiFilter,
  FiLoader,
  FiClock,
  FiUpload,
  FiMessageSquare,
  FiHeart,
  FiMusic,
  FiX,
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
import { useAdminActivity } from '@/app/hooks/admin/useAdminActivity';
import { formatNumber } from '../../Utils';
import toast from 'react-hot-toast';
import Input from '@/app/components/Common/Inputs';

interface ActivityItem {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: 'composer' | 'work' | 'score' | 'user';
    id: string;
    name: string;
  };
  timestamp: Date;
  metadata?: any;
  status?: 'success' | 'warning' | 'error';
}

export default function LogsAudit() {
  const {
    activities,
    loading: activitiesLoading,
    filters: activityFilters,
    pagination: activityPagination,
    setActivityFilters,
    refreshActivities,
    loadMoreActivities,
  } = useAdminActivity();

  const handleRefresh = async () => {
    try {
      await refreshActivities();
      toast.success('Dados atualizados com sucesso!');
    } catch {
      toast.error('Erro ao atualizar dados');
    }
  };

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      UPLOAD: FiUpload, // 🆕 Ícone para uploads
      FAVORITE_COMPOSER: FiHeart,
      UNFAVORITE_COMPOSER: FiHeart,
      FAVORITE_WORK: FiMusic,
      UNFAVORITE_WORK: FiMusic,
      FAVORITE_SCORE: FiFileText,
      UNFAVORITE_SCORE: FiFileText,
      ADD_WANT_TO_LEARN: FiUpload,
      REMOVE_WANT_TO_LEARN: FiUpload,
      UPDATE_WANT_TO_LEARN: FiUpload,
      ADD_LEARNED: FiActivity,
      REMOVE_LEARNED: FiActivity,
      UPDATE_LEARNED: FiActivity,
      CREATE_ANNOTATION: FiMessageSquare,
      UPDATE_ANNOTATION: FiMessageSquare,
      DELETE_ANNOTATION: FiMessageSquare,
      VOTE_ANNOTATION_HELPFUL: FiMessageSquare,
      VOTE_ANNOTATION_NOT_HELPFUL: FiMessageSquare,
      REPORT_UPLOAD: FiActivity,
      UPLOAD_VIDEO: FiUpload,
      DELETE_VIDEO: FiUpload,
      UPDATE_PROFILE: FiUser,
    };
    return iconMap[type] || FiActivity;
  };

  const getActivityColor = (type: string) => {
    if (type === 'UPLOAD') return 'text-accent-blue'; // 🆕
    if (type.includes('FAVORITE')) return 'text-accent-red';
    if (type.includes('LEARNED')) return 'text-accent-green';
    if (type.includes('WANT_TO_LEARN')) return 'text-accent-blue';
    if (type.includes('ANNOTATION')) return 'text-accent-purple';
    if (type.includes('REPORT')) return 'text-accent-amber';
    if (type.includes('VIDEO')) return 'text-accent-blue';
    return 'text-accent-blue';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-accent-green bg-accent-green/10';
      case 'warning':
        return 'text-accent-amber bg-accent-amber/10';
      case 'error':
        return 'text-accent-red bg-accent-red/10';
      default:
        return 'text-accent-blue bg-accent-blue/10';
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const periodOptions = [
    { value: 'hoje', label: 'Hoje' },
    { value: 'ontem', label: 'Ontem' },
    { value: 'esta_semana', label: 'Esta Semana' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '3m', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Último ano' },
    { value: 'todos', label: 'Todos' },
  ];

  const activityTypeOptions = [
    { value: 'all', label: 'Todas as atividades' },
    { value: 'UPLOAD', label: 'Uploads (Criação/Edição)' }, // 🆕
    { value: 'FAVORITE_COMPOSER', label: 'Favoritos - Compositores' },
    { value: 'FAVORITE_WORK', label: 'Favoritos - Obras' },
    { value: 'FAVORITE_SCORE', label: 'Favoritos - Partituras' },
    { value: 'ADD_WANT_TO_LEARN', label: 'Quero Aprender' },
    { value: 'ADD_LEARNED', label: 'Já Aprendi' },
    { value: 'CREATE_ANNOTATION', label: 'Anotações' },
    { value: 'REPORT_UPLOAD', label: 'Denúncias' },
    { value: 'UPLOAD_VIDEO', label: 'Uploads de Vídeo' },
  ];

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiActivity className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Atividades Recentes
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle mb-6">
              Monitoramento completo das ações dos usuários
            </p>

            {/* Status Summary */}
            <div className="flex items-center justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-blue">
                  {formatNumber(activityPagination.total)}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Total de Atividades
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-theme-primary">
                  {activities.length}
                </div>
                <div className="text-sm text-theme-tertiary">Carregadas</div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Filtros */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              {/* Filtro de Período Temporal */}
              <Select
                value={activityFilters.period || '7d'}
                onChange={(e) => setActivityFilters({ period: e.target.value })}
                options={periodOptions}
                className="input-classical-2 min-w-48"
              />

              {/* Filtro de Tipo */}
              <Select
                value={activityFilters.type || 'all'}
                onChange={(e) =>
                  setActivityFilters({
                    type: e.target.value === 'all' ? undefined : e.target.value,
                  })
                }
                options={activityTypeOptions}
                className="input-classical-2 min-w-64"
              />

              {/* Busca */}
              <div className="relative flex-1 min-w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por usuário, ação..."
                  value={activityFilters.search || ''}
                  onChange={(e) =>
                    setActivityFilters({ search: e.target.value })
                  }
                  className="input-classical-2 pl-10 w-full"
                />
              </div>

              {/* Botão Refresh */}
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw
                    className={activitiesLoading ? 'animate-spin' : ''}
                  />
                }
                onClick={handleRefresh}
                disabled={activitiesLoading}
              >
                {activitiesLoading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>

            {/* Info de filtros ativos */}
            {(activityFilters.search ||
              activityFilters.type ||
              activityFilters.period) && (
              <div className="flex items-center justify-between p-3 mt-4 bg-accent-blue/10 border border-accent-blue rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-accent-blue">
                  <FiFilter className="w-4 h-4" />
                  <span>
                    Filtros ativos:{' '}
                    {[
                      activityFilters.search && `"${activityFilters.search}"`,
                      activityFilters.type && activityFilters.type,
                      activityFilters.period &&
                        periodOptions.find(
                          (p) => p.value === activityFilters.period
                        )?.label,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActivityFilters({})}
                  leftIcon={<FiX />}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Lista de Atividades */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-8">
            {activitiesLoading && activities.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-theme-primary font-medium mt-4">
                    Carregando atividades...
                  </p>
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <FiActivity className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-theme-primary mb-2">
                  Nenhuma atividade encontrada
                </h3>
                <p className="text-theme-secondary">
                  Ajuste os filtros para encontrar as atividades desejadas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity: ActivityItem) => {
                  const ActivityIcon = getActivityIcon(activity.type);

                  return (
                    <div
                      key={activity.id}
                      className="p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center bg-theme-primary ${getActivityColor(
                            activity.type
                          )} flex-shrink-0`}
                        >
                          <ActivityIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xs text-theme-tertiary flex items-center space-x-1">
                              <FiClock className="w-3 h-3" />
                              <span>
                                {getRelativeTime(activity.timestamp.toString())}
                              </span>
                            </span>
                            {activity.status && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  activity.status
                                )}`}
                              >
                                {activity.status === 'success'
                                  ? 'Sucesso'
                                  : activity.status === 'warning'
                                    ? 'Aviso'
                                    : 'Erro'}
                              </span>
                            )}
                          </div>

                          <p className="text-theme-primary font-medium mb-2">
                            <span className="font-bold">
                              {activity.user.name}
                            </span>{' '}
                            {activity.action}
                            {activity.target && (
                              <span className="inline-flex items-center space-x-1 ml-1">
                                <span className="font-semibold truncate">
                                  {activity.target.name}
                                </span>
                              </span>
                            )}
                          </p>

                          {/* 🔧 CORREÇÃO DO ERRO TYPESCRIPT */}
                          {activity.metadata && (
                            <div className="text-xs text-theme-tertiary">
                              {Object.entries(activity.metadata)
                                .filter(
                                  ([_, value]) => value != null && value !== ''
                                ) // Filtrar valores inválidos
                                .map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More */}
                {activityPagination.hasMore && (
                  <div className="text-center pt-6">
                    <Button
                      variant="secondary"
                      onClick={loadMoreActivities}
                      disabled={activitiesLoading}
                      leftIcon={
                        activitiesLoading ? (
                          <FiLoader className="animate-spin" />
                        ) : undefined
                      }
                    >
                      {activitiesLoading
                        ? 'Carregando...'
                        : `Carregar mais (${
                            activityPagination.total - activities.length
                          } restantes)`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
