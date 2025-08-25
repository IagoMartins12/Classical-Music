// app/student/history/pageClient.tsx - Cliente do Histórico de Atividades do Aluno

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiActivity,
  FiCalendar,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiUpload,
  FiCheckCircle,
  FiMessageSquare,
  FiX,
  FiUser,
  FiClock,
  FiVideo,
  FiFile,
  FiEdit,
  FiEye,
  FiChevronRight,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  LoadingSpinner,
  SequentialGrid,
} from '@/app/components/animation/AnimatedComponents';
import Select from '@/app/components/Common/Select';
import Link from 'next/link';
import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/hooks/useTranslation';

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  title: string;
  description?: string;
  changes?: any;
  metadata?: any;
  createdAt: string;
  timeAgo: string;
  entityExists: boolean;
  entityDisplayName: string;
  changesSummary?: string;
}

interface StudentHistoryClientProps {
  initialFilters: {
    page: number;
    action: string;
    entityType: string;
    dateFrom: string;
    dateTo: string;
  };
}

const StudentHistoryClient = ({
  initialFilters,
}: StudentHistoryClientProps) => {
  const { t } = useTranslation({ sections: ['student/history'] });
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Estados dos filtros
  const [page, setPage] = useState(initialFilters.page);
  const [selectedAction, setSelectedAction] = useState(initialFilters.action);
  const [selectedEntityType, setSelectedEntityType] = useState(
    initialFilters.entityType
  );
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState(initialFilters.dateTo);

  // Estados de paginação
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<any>({});

  // Opções de filtro específicas para aluno
  const actionOptions = [
    { value: 'all', label: t('student_history_action_all') },
    {
      value: 'ASSIGNMENT_SUBMISSION',
      label: t('student_history_action_submission'),
    },
    {
      value: 'ASSIGNMENT_COMPLETED',
      label: t('student_history_action_completed'),
    },
    {
      value: 'LESSON_FEEDBACK_GIVEN',
      label: t('student_history_action_feedback'),
    },
    {
      value: 'LESSON_RESCHEDULE_REQUESTED',
      label: t('student_history_action_reschedule'),
    },
    {
      value: 'LESSON_ABSENCE_INFORMED',
      label: t('student_history_action_absence'),
    },
    {
      value: 'STUDENT_PROFILE_UPDATED',
      label: t('student_history_action_profile'),
    },
  ];

  const entityTypeOptions = [
    { value: 'all', label: t('student_history_type_all') },
    { value: 'assignment', label: t('student_history_type_assignment') },
    { value: 'lesson', label: t('student_history_type_lesson') },
    { value: 'profile', label: t('student_history_type_profile') },
  ];

  const toast = useToast();
  useEffect(() => {
    fetchActivities();
  }, [page, selectedAction, selectedEntityType, dateFrom, dateTo]);

  const fetchActivities = async (showToast = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
      });

      if (selectedAction !== 'all') params.set('action', selectedAction);
      if (selectedEntityType !== 'all')
        params.set('entityType', selectedEntityType);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/school-activities?${params}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar atividades');
      }

      const data = await response.json();

      if (data.success) {
        setActivities(data.activities || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalCount(data.pagination?.totalCount || 0);
        setStats(data.stats || {});
        if (showToast) toast.success('Histórico atualizado!');
      } else {
        if (showToast) toast.error('Erro ao atualizar histórico.');

        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = () => {
    const params = new URLSearchParams();

    if (selectedAction !== 'all') params.set('action', selectedAction);
    if (selectedEntityType !== 'all')
      params.set('entityType', selectedEntityType);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    setPage(1);
    router.push(`/student/history?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedAction('all');
    setSelectedEntityType('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    router.push('/student/history');
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Função para obter ícone da ação
  const getActionIcon = (action: string, metadata?: any) => {
    switch (action) {
      case 'ASSIGNMENT_SUBMISSION':
        if (metadata?.submissionType === 'video') {
          return <FiVideo className="w-5 h-5" />;
        } else if (metadata?.submissionType === 'file') {
          return <FiFile className="w-5 h-5" />;
        }
        return <FiUpload className="w-5 h-5" />;
      case 'ASSIGNMENT_COMPLETED':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'LESSON_FEEDBACK_GIVEN':
        return <FiMessageSquare className="w-5 h-5" />;
      case 'LESSON_RESCHEDULE_REQUESTED':
        return <FiCalendar className="w-5 h-5" />;
      case 'LESSON_ABSENCE_INFORMED':
        return <FiX className="w-5 h-5" />;
      case 'STUDENT_PROFILE_UPDATED':
        return <FiUser className="w-5 h-5" />;
      default:
        return <FiActivity className="w-5 h-5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ASSIGNMENT_SUBMISSION':
      case 'ASSIGNMENT_COMPLETED':
        return 'from-green-400 to-green-600';
      case 'LESSON_FEEDBACK_GIVEN':
        return 'from-blue-400 to-blue-600';
      case 'LESSON_RESCHEDULE_REQUESTED':
        return 'from-orange-400 to-orange-600';
      case 'LESSON_ABSENCE_INFORMED':
        return 'from-red-400 to-red-600';
      case 'STUDENT_PROFILE_UPDATED':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getCardBorderColor = (action: string) => {
    switch (action) {
      case 'ASSIGNMENT_SUBMISSION':
      case 'ASSIGNMENT_COMPLETED':
        return 'border-l-4 border-l-green-500';
      case 'LESSON_FEEDBACK_GIVEN':
        return 'border-l-4 border-l-blue-500';
      case 'LESSON_RESCHEDULE_REQUESTED':
        return 'border-l-4 border-l-orange-500';
      case 'LESSON_ABSENCE_INFORMED':
        return 'border-l-4 border-l-red-500';
      case 'STUDENT_PROFILE_UPDATED':
        return 'border-l-4 border-l-purple-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      ASSIGNMENT_SUBMISSION: t('student_history_label_submission'),
      ASSIGNMENT_COMPLETED: t('student_history_label_completed'),
      LESSON_FEEDBACK_GIVEN: t('student_history_label_feedback'),
      LESSON_RESCHEDULE_REQUESTED: t('student_history_label_reschedule'),
      LESSON_ABSENCE_INFORMED: t('student_history_label_absence'),
      STUDENT_PROFILE_UPDATED: t('student_history_label_profile'),
    };

    return labels[action] || action;
  };

  const getEntityLink = (activity: Activity) => {
    if (!activity.entityExists || !activity.entityId) return null;

    switch (activity.entityType) {
      case 'lesson':
        return `/student/lessons/${activity.entityId}`;
      case 'assignment':
        return `/student/assignments/${activity.entityId}`;
      case 'profile':
        return '/student/profile';
      default:
        return null;
    }
  };

  const formatChanges = (changes: any) => {
    if (!changes || typeof changes !== 'object') return null;

    const changesList = Object.entries(changes).filter(
      ([, change]) =>
        typeof change === 'object' &&
        change !== null &&
        'from' in change &&
        'to' in change
    );

    if (changesList.length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
          <FiEdit className="w-4 h-4 mr-1" />
          {t('student_history_changes_title')}
        </h5>
        <div className="space-y-2">
          {changesList.slice(0, 3).map(([key, change]: [string, any]) => (
            <div key={key} className="text-xs">
              <div className="font-medium text-blue-700 mb-1">{key}:</div>
              <div className="pl-2 border-l-2 border-blue-300">
                <div className="text-red-600 flex items-center">
                  <span className="w-8 text-xs">
                    {t('student_history_changes_from')}
                  </span>
                  <span>{String(change.from)}</span>
                </div>
                <div className="text-green-600 flex items-center">
                  <span className="w-8 text-xs">
                    {t('student_history_changes_to')}
                  </span>
                  <span>{String(change.to)}</span>
                </div>
              </div>
            </div>
          ))}
          {changesList.length > 3 && (
            <div className="text-xs text-blue-600">
              {t('student_history_changes_additional', {
                count: changesList.length - 3,
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && activities.length === 0) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-green rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiActivity className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('student_history_header_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('student_history_header_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        {stats && Object.keys(stats).length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <SequentialGrid
              cols={4}
              gap={6}
              delayBetweenItems={0.1}
              className="mb-8"
            >
              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiActivity className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.totalActivities || 0}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('student_history_stats_total')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiUpload className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.breakdown?.byAction?.ASSIGNMENT_SUBMISSION || 0}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('student_history_stats_submissions')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.breakdown?.byAction?.ASSIGNMENT_COMPLETED || 0}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('student_history_stats_completed')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiClock className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.recentActivity || 0}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('student_history_stats_recent')}
                </div>
              </AnimatedCard>
            </SequentialGrid>
          </AnimatedItem>
        )}

        {/* Filters */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">
                    {t('student_history_filters_title')}
                  </h3>
                  <p className="text-sm text-theme-tertiary">
                    {t('student_history_filters_found', { count: totalCount })}
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-theme-secondary hover:bg-theme-tertiary text-theme-primary rounded-lg transition-colors"
                >
                  <FiFilter className="w-4 h-4" />
                  <span>{t('student_history_filters_title')}</span>
                  {showFilters ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {showFilters && (
                <AnimatedItem direction="scale" springType="gentle">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-theme-secondary">
                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        {t('student_history_filters_action')}
                      </label>
                      <Select
                        options={actionOptions}
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        {t('student_history_filters_type')}
                      </label>
                      <Select
                        options={entityTypeOptions}
                        value={selectedEntityType}
                        onChange={(e) => setSelectedEntityType(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        {t('student_history_filters_date_from')}
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        {t('student_history_filters_date_to')}
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      onClick={updateFilters}
                      className="btn-classical-primary"
                    >
                      {t('student_history_filters_apply')}
                    </button>
                    <button
                      onClick={clearFilters}
                      className="btn-classical-secondary"
                    >
                      {t('student_history_filters_clear')}
                    </button>
                    <button
                      onClick={() => {
                        fetchActivities(true);
                      }}
                      disabled={loading}
                      className="btn-classical-secondary flex items-center space-x-2"
                    >
                      <FiRefreshCw
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                      />
                      <span>{t('student_history_refresh')}</span>
                    </button>
                  </div>
                </AnimatedItem>
              )}
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Activities Timeline */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="space-y-6">
            {error ? (
              <div className="classical-card p-12 text-center">
                <FiActivity className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  {t('student_history_error_title')}
                </h3>
                <p className="text-theme-secondary mb-4">{error}</p>
                <button
                  onClick={() => {
                    fetchActivities(true);
                  }}
                  className="btn-classical-primary"
                >
                  {t('student_history_error_try_again')}
                </button>
              </div>
            ) : activities.length === 0 ? (
              <div className="classical-card p-12 text-center">
                <FiActivity className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  {t('student_history_empty_title')}
                </h3>
                <p className="text-theme-secondary">
                  {t('student_history_empty_description')}
                </p>
                <p className="text-sm text-theme-tertiary mt-2">
                  {t('student_history_empty_hint')}
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-theme-secondary"></div>

                {activities.map((activity, index) => (
                  <AnimatedItem
                    key={activity.id}
                    direction="left"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <div className="relative flex items-start space-x-4 pb-6">
                      <div
                        className={`relative z-10 w-12 h-12 bg-gradient-to-br ${getActionColor(
                          activity.action
                        )} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        {getActionIcon(activity.action, activity.metadata)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <AnimatedCard
                          className={`classical-card-2 p-4 ${getCardBorderColor(
                            activity.action
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-theme-primary">
                                {getActionLabel(activity.action)}
                              </span>
                              <span className="text-xs text-theme-tertiary">
                                {formatDistanceToNow(
                                  new Date(activity.createdAt),
                                  {
                                    addSuffix: true,
                                    locale: ptBR,
                                  }
                                )}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {activity.changes && (
                                <button
                                  onClick={() => toggleExpanded(activity.id)}
                                  className="w-6 h-6 rounded-full bg-theme-secondary hover:bg-theme-tertiary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center"
                                >
                                  {expandedItems.has(activity.id) ? (
                                    <FiChevronUp className="w-3 h-3" />
                                  ) : (
                                    <FiEye className="w-3 h-3" />
                                  )}
                                </button>
                              )}

                              {getEntityLink(activity) && (
                                <Link
                                  href={getEntityLink(activity)!}
                                  className="w-6 h-6 rounded-full bg-theme-secondary hover:bg-interactive-hover transition-colors flex items-center justify-center"
                                >
                                  <FiChevronRight className="w-3 h-3 text-theme-tertiary" />
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-semibold text-theme-primary">
                              {activity.title}
                            </h3>

                            {activity.description && (
                              <p className="text-sm text-theme-secondary">
                                {activity.description}
                              </p>
                            )}

                            {activity.entityDisplayName && (
                              <div className="text-sm text-theme-tertiary">
                                <span className="font-medium">
                                  {t('student_history_item_label')}
                                </span>{' '}
                                {activity.entityDisplayName}
                              </div>
                            )}

                            {activity.changesSummary && (
                              <div className="text-xs text-theme-tertiary">
                                {activity.changesSummary}
                              </div>
                            )}

                            {/* Metadata específica do aluno */}
                            {activity.metadata && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {activity.metadata.submissionType && (
                                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                                    {activity.metadata.submissionType ===
                                    'video'
                                      ? t('student_history_metadata_video')
                                      : activity.metadata.submissionType ===
                                        'file'
                                      ? t('student_history_metadata_file')
                                      : t('student_history_metadata_text')}
                                  </span>
                                )}
                                {activity.metadata.hasMessage && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                    {t('student_history_metadata_with_message')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {expandedItems.has(activity.id) &&
                            formatChanges(activity.changes)}
                        </AnimatedCard>
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" className="mt-8">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPage(i + 1);
                      const params = new URLSearchParams();
                      params.set('page', (i + 1).toString());
                      if (selectedAction !== 'all')
                        params.set('action', selectedAction);
                      if (selectedEntityType !== 'all')
                        params.set('entityType', selectedEntityType);
                      if (dateFrom) params.set('dateFrom', dateFrom);
                      if (dateTo) params.set('dateTo', dateTo);
                      router.push(`/student/history?${params.toString()}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === i + 1
                        ? 'bg-brand-primary text-theme-primary'
                        : 'bg-theme-secondary text-theme-tertiary hover:bg-theme-tertiary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
};

export default StudentHistoryClient;
