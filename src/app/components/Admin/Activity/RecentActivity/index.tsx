// app/components/Admin/Activity/RecentActivity.tsx - CORRIGIDO
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiArrowsClockwise,
  PiChatCenteredText,
  PiClock,
  PiDatabase,
  PiEye,
  PiFileText,
  PiHeart,
  PiMusicNotes,
  PiPulse,
  PiShield,
  PiUploadSimple,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import { listAdminActivity } from '@/app/requests/admin/uploads';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
      const data = await listAdminActivity({ type: filter, limit: 20 });
      setActivities(data.activities);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
    // Mapear tipos específicos do ActivityLog
    if (type === 'UPLOAD') return PiUploadSimple;
    if (type.includes('FAVORITE')) return PiHeart;
    if (type.includes('ANNOTATION')) return PiChatCenteredText;
    if (type.includes('LEARNED') || type.includes('WANT_TO_LEARN'))
      return PiPulse;
    if (type === 'REPORT_UPLOAD') return PiShield;
    if (type.includes('VIDEO')) return PiUploadSimple;
    if (type === 'UPDATE_PROFILE') return PiUser;
    return PiPulse;
  };

  const getTargetIcon = (type?: string) => {
    switch (type) {
      case 'composer':
        return PiUsers;
      case 'work':
        return PiMusicNotes;
      case 'score':
        return PiFileText;
      case 'user':
        return PiUser;
      default:
        return PiDatabase;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return '';
      case 'warning':
        return '';
      case 'error':
        return '';
      default:
        return '';
    }
  };

  const getActivityColor = (type: string) => {
    if (type === 'UPLOAD') return '';
    if (type.includes('FAVORITE')) return '';
    if (type.includes('ANNOTATION')) return '';
    if (type.includes('LEARNED')) return '';
    if (type === 'REPORT_UPLOAD') return '';
    return '';
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
    if (type === 'UPLOAD') return 'Uploads';
    if (type === 'favorite') return 'Favoritos';
    if (type === 'annotation') return 'Anotações';
    if (type === 'study_session') return 'Sessões de Estudo';
    if (type === 'moderation') return 'Moderação';
    if (type === 'system') return 'Sistema';
    return 'Outras';
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  // Opções atualizadas com tipos genéricos suportados
  const activityRecentsOpcions = [
    { value: 'all', label: 'Todas as atividades' },
    { value: 'UPLOAD', label: 'Uploads (Criação/Edição)' },
    { value: 'favorite', label: 'Favoritos' },
    { value: 'annotation', label: 'Anotações' },
    { value: 'study_session', label: 'Sessões de Estudo' },
    { value: 'moderation', label: 'Moderação' },
    { value: 'system', label: 'Sistema' },
  ];

  return (
    <AnimatedCard className="classical-card p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Inline
          as="h2"
          gap={3}
          className="text-xl lg:text-2xl font-bold text-theme-primary"
        >
          <PiPulse className="w-5 h-5 lg:w-6 lg:h-6" />
          <span>Atividade Recente</span>
        </Inline>

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
            leftIcon={
              <PiArrowsClockwise className={loading ? 'animate-spin' : ''} />
            }
            onClick={handleRefresh}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-sup-2">
          <p className="text-sm">{error}. Exibindo dados em cache.</p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading && activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4"></div>
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
                <div className="flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 bg-theme-secondary rounded-xl transition-all cursor-pointer group">
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

                        <Inline gap={3} className="mt-1">
                          <Inline
                            gap={1}
                            className="text-xs text-theme-tertiary"
                          >
                            <PiClock className="w-3 h-3" />
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                          </Inline>

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
                            <Text
                              papel="legenda"
                              tom="fraco"
                              className="capitalize"
                            >
                              {activity.target.type}
                            </Text>
                          )}
                        </Inline>

                        {activity.metadata && (
                          <Text
                            papel="legenda"
                            tom="fraco"
                            as="div"
                            className="mt-2"
                          >
                            {activity.metadata.error && (
                              <span className="">
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
                          </Text>
                        )}
                      </div>

                      <Inline
                        gap={1}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      >
                        {activity.target && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiEye />}
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
                            className=""
                          />
                        )}

                        {activity.type === 'REPORT_UPLOAD' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiShield />}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push('/moderation');
                            }}
                            className=""
                          />
                        )}
                      </Inline>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            );
          })
        ) : (
          <div className="text-center py-8">
            <PiPulse className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              Nenhuma atividade encontrada
            </h3>
            <Text papel="rotulo" tom="suave" as="p">
              {filter === 'all'
                ? 'Ainda não há atividades para mostrar.'
                : `Não há atividades do tipo "${getActivityTypeLabel(
                    filter
                  )}" recentemente.`}
            </Text>
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
