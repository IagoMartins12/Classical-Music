// app/components/Admin/Activity/RecentActivity.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiActivity,
  FiUsers,
  FiUpload,
  FiMessageSquare,
  FiHeart,
  FiShield,
  FiEye,
  FiClock,
  FiUser,
  FiDatabase,
  FiMusic,
  FiFileText,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';

interface ActivityItem {
  id: string;
  type:
    | 'user_registration'
    | 'upload'
    | 'annotation'
    | 'favorite'
    | 'moderation'
    | 'system'
    | 'study_session';
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

interface RecentActivityResponse {
  success: boolean;
  activities: ActivityItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export default function RecentActivity() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        type: filter !== 'all' ? filter : '',
        limit: '20',
        page: '1',
      });

      const response = await fetch(`/api/admin/activity?${searchParams}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar atividades');
      }

      const data: RecentActivityResponse = await response.json();

      if (data.success) {
        setActivities(data.activities || []);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      // Fallback para dados básicos em caso de erro
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchActivities();
    }
  }, [filter, mounted]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return FiUser;
      case 'upload':
        return FiUpload;
      case 'annotation':
        return FiMessageSquare;
      case 'favorite':
        return FiHeart;
      case 'moderation':
        return FiShield;
      case 'system':
        return FiDatabase;
      case 'study_session':
        return FiActivity;
      default:
        return FiActivity;
    }
  };

  const getTargetIcon = (type?: string) => {
    switch (type) {
      case 'composer':
        return FiUsers;
      case 'work':
        return FiMusic;
      case 'score':
        return FiFileText;
      case 'user':
        return FiUser;
      default:
        return FiDatabase;
    }
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

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'text-accent-blue';
      case 'upload':
        return 'text-accent-green';
      case 'annotation':
        return 'text-accent-purple';
      case 'favorite':
        return 'text-accent-red';
      case 'moderation':
        return 'text-accent-amber';
      case 'system':
        return 'text-theme-tertiary';
      case 'study_session':
        return 'text-accent-blue';
      default:
        return 'text-accent-blue';
    }
  };

  const formatTimeAgo = (date: Date) => {
    if (!mounted) return 'Carregando...';

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'Registros';
      case 'upload':
        return 'Uploads';
      case 'annotation':
        return 'Anotações';
      case 'favorite':
        return 'Favoritos';
      case 'moderation':
        return 'Moderação';
      case 'system':
        return 'Sistema';
      case 'study_session':
        return 'Sessões de Estudo';
      default:
        return 'Outras';
    }
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  const activityRecentsOpcions = [
    { value: 'all', label: 'Todas as atividades' },
    { value: 'user_registration', label: 'Registros' },
    { value: 'upload', label: 'Uploads' },
    { value: 'annotation', label: 'Anotações' },
    { value: 'favorite', label: 'Favoritos' },
    { value: 'moderation', label: 'Moderação' },
    { value: 'study_session', label: 'Sessões' },
    { value: 'system', label: 'Sistema' },
  ];
  return (
    <AnimatedCard className="classical-card p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-theme-primary flex items-center space-x-3">
          <FiActivity className="w-5 h-5 lg:w-6 lg:h-6 text-accent-blue" />
          <span>Atividade Recente</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Select
            options={activityRecentsOpcions}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-classical-2 text-sm w-full sm:w-auto"
          />

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl">
          <p className="text-accent-red text-sm">
            {error}. Exibindo dados em cache.
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading && activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-theme-secondary">Carregando atividades...</p>
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const TargetIcon = getTargetIcon(activity.target?.type);

            return (
              <AnimatedItem
                key={activity.id}
                direction="up"
                springType="gentle"
                delay={index * 0.05}
              >
                <div className="flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-all cursor-pointer group">
                  <div
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center bg-theme-primary ${getActivityColor(
                      activity.type
                    )} flex-shrink-0`}
                  >
                    <ActivityIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-theme-primary font-medium text-sm lg:text-base">
                          <span className="font-bold">
                            {activity.user.name}
                          </span>{' '}
                          {activity.action}
                          {activity.target && (
                            <span className="inline-flex items-center space-x-1 ml-1">
                              <TargetIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                              <span className="font-semibold truncate">
                                {activity.target.name}
                              </span>
                            </span>
                          )}
                        </p>

                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-theme-tertiary">
                            <FiClock className="w-3 h-3" />
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                          </div>

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

                          {activity.target && (
                            <span className="text-xs text-theme-tertiary capitalize">
                              {activity.target.type}
                            </span>
                          )}
                        </div>

                        {activity.metadata && (
                          <div className="mt-2 text-xs text-theme-tertiary">
                            {activity.metadata.error && (
                              <span className="text-accent-red">
                                Erro: {activity.metadata.error}
                              </span>
                            )}
                            {activity.metadata.size && (
                              <span>Tamanho: {activity.metadata.size}</span>
                            )}
                            {activity.metadata.duration && (
                              <span className="ml-2">
                                Duração: {activity.metadata.duration}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        {activity.target && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEye />}
                            onClick={(e) => {
                              e.stopPropagation();
                              const path =
                                activity.target?.type === 'user'
                                  ? '/admin/users'
                                  : activity.target?.type === 'composer'
                                  ? '/composer'
                                  : activity.target?.type === 'work'
                                  ? '/works'
                                  : '/admin';
                              router.push(`${path}/${activity.target?.id}`);
                            }}
                            className="text-accent-blue hover:bg-accent-blue/10"
                          />
                        )}

                        {activity.type === 'moderation' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiShield />}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push('/moderation');
                            }}
                            className="text-accent-amber hover:bg-accent-amber/10"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            );
          })
        ) : (
          <div className="text-center py-8">
            <FiActivity className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-theme-secondary text-sm">
              {filter === 'all'
                ? 'Ainda não há atividades para mostrar.'
                : `Não há atividades do tipo "${getActivityTypeLabel(
                    filter
                  )}" recentemente.`}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-theme-secondary">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => router.push('/admin/logs')}
        >
          Ver Histórico Completo
        </Button>
      </div>
    </AnimatedCard>
  );
}
