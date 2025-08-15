// app/teacher/history/pageClient.tsx - Cliente do Histórico de Atividades do Professor

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiActivity,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiPlus,
  FiEdit,
  FiUserPlus,
  FiFileText,
  FiUser,
  FiClock,
  FiMessageSquare,
  FiStar,
  FiRotateCcw,
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

interface TeacherHistoryClientProps {
  initialFilters: {
    page: number;
    action: string;
    entityType: string;
    dateFrom: string;
    dateTo: string;
  };
}

const TeacherHistoryClient = ({
  initialFilters,
}: TeacherHistoryClientProps) => {
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

  // Opções de filtro específicas para professor
  const actionOptions = [
    { value: 'all', label: 'Todas as ações' },
    { value: 'STUDENT_ADDED', label: 'Alunos adicionados' },
    { value: 'LESSON_CREATED', label: 'Aulas criadas' },
    { value: 'LESSON_UPDATED', label: 'Aulas editadas' },
    { value: 'LESSON_STATUS_CHANGED', label: 'Status de aula alterado' },
    { value: 'ASSIGNMENT_CREATED', label: 'Tarefas criadas' },
    { value: 'ASSIGNMENT_UPDATED', label: 'Tarefas editadas' },
    { value: 'ASSIGNMENT_FEEDBACK_GIVEN', label: 'Feedbacks dados' },
    { value: 'LESSON_NOTES_ADDED', label: 'Anotações adicionadas' },
    { value: 'TEACHER_PROFILE_UPDATED', label: 'Perfil atualizado' },
    { value: 'USER_PROFILE_UPDATED', label: 'Dados pessoais atualizados' },
  ];

  const entityTypeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'student', label: 'Alunos' },
    { value: 'lesson', label: 'Aulas' },
    { value: 'assignment', label: 'Tarefas' },
    { value: 'profile', label: 'Perfil' },
    { value: 'user', label: 'Dados pessoais' },
  ];

  useEffect(() => {
    fetchActivities();
  }, [page, selectedAction, selectedEntityType, dateFrom, dateTo]);

  const fetchActivities = async () => {
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
      } else {
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
    router.push(`/teacher/history?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedAction('all');
    setSelectedEntityType('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    router.push('/teacher/history');
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
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'STUDENT_ADDED':
        return <FiUserPlus className="w-5 h-5" />;
      case 'LESSON_CREATED':
        return <FiPlus className="w-5 h-5" />;
      case 'LESSON_UPDATED':
        return <FiEdit className="w-5 h-5" />;
      case 'LESSON_STATUS_CHANGED':
        return <FiRotateCcw className="w-5 h-5" />;
      case 'ASSIGNMENT_CREATED':
        return <FiFileText className="w-5 h-5" />;
      case 'ASSIGNMENT_UPDATED':
        return <FiEdit className="w-5 h-5" />;
      case 'ASSIGNMENT_FEEDBACK_GIVEN':
        return <FiStar className="w-5 h-5" />;
      case 'LESSON_NOTES_ADDED':
        return <FiMessageSquare className="w-5 h-5" />;
      case 'TEACHER_PROFILE_UPDATED':
      case 'USER_PROFILE_UPDATED':
        return <FiUser className="w-5 h-5" />;
      default:
        return <FiActivity className="w-5 h-5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'STUDENT_ADDED':
      case 'LESSON_CREATED':
      case 'ASSIGNMENT_CREATED':
        return 'from-green-400 to-green-600';
      case 'LESSON_UPDATED':
      case 'ASSIGNMENT_UPDATED':
      case 'LESSON_STATUS_CHANGED':
        return 'from-orange-400 to-orange-600';
      case 'ASSIGNMENT_FEEDBACK_GIVEN':
        return 'from-yellow-400 to-yellow-600';
      case 'LESSON_NOTES_ADDED':
        return 'from-indigo-400 to-indigo-600';
      case 'TEACHER_PROFILE_UPDATED':
      case 'USER_PROFILE_UPDATED':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getCardBorderColor = (action: string) => {
    switch (action) {
      case 'STUDENT_ADDED':
      case 'LESSON_CREATED':
      case 'ASSIGNMENT_CREATED':
        return 'border-l-4 border-l-green-500';
      case 'LESSON_UPDATED':
      case 'ASSIGNMENT_UPDATED':
      case 'LESSON_STATUS_CHANGED':
        return 'border-l-4 border-l-orange-500';
      case 'ASSIGNMENT_FEEDBACK_GIVEN':
        return 'border-l-4 border-l-yellow-500';
      case 'LESSON_NOTES_ADDED':
        return 'border-l-4 border-l-indigo-500';
      case 'TEACHER_PROFILE_UPDATED':
      case 'USER_PROFILE_UPDATED':
        return 'border-l-4 border-l-purple-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      STUDENT_ADDED: 'Aluno Adicionado',
      LESSON_CREATED: 'Aula Criada',
      LESSON_UPDATED: 'Aula Editada',
      LESSON_STATUS_CHANGED: 'Status Alterado',
      ASSIGNMENT_CREATED: 'Tarefa Criada',
      ASSIGNMENT_UPDATED: 'Tarefa Editada',
      ASSIGNMENT_FEEDBACK_GIVEN: 'Feedback Dado',
      LESSON_NOTES_ADDED: 'Anotações Adicionadas',
      TEACHER_PROFILE_UPDATED: 'Perfil Atualizado',
      USER_PROFILE_UPDATED: 'Dados Atualizados',
    };

    return labels[action] || action;
  };

  const getEntityLink = (activity: Activity) => {
    if (!activity.entityExists || !activity.entityId) return null;

    switch (activity.entityType) {
      case 'lesson':
        return `/teacher/lessons/${activity.entityId}`;
      case 'assignment':
        return `/teacher/assignments/${activity.entityId}`;
      case 'student':
        return `/teacher/students/${activity.entityId}`;
      case 'profile':
        return '/teacher/profile';
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
          Alterações:
        </h5>
        <div className="space-y-2">
          {changesList.slice(0, 3).map(([key, change]: [string, any]) => (
            <div key={key} className="text-xs">
              <div className="font-medium text-blue-700 mb-1">{key}:</div>
              <div className="pl-2 border-l-2 border-blue-300">
                <div className="text-red-600 flex items-center">
                  <span className="w-8 text-xs">De:</span>
                  <span>{String(change.from)}</span>
                </div>
                <div className="text-green-600 flex items-center">
                  <span className="w-8 text-xs">Para:</span>
                  <span>{String(change.to)}</span>
                </div>
              </div>
            </div>
          ))}
          {changesList.length > 3 && (
            <div className="text-xs text-blue-600">
              +{changesList.length - 3} alterações adicionais
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiActivity className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Histórico de Atividades
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Acompanhe todas as suas ações como professor na plataforma
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
                  Total de Atividades
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiClock className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.recentActivity || 0}
                </div>
                <div className="text-sm text-theme-tertiary">Últimas 24h</div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiPlus className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {(stats.breakdown?.byAction?.LESSON_CREATED || 0) +
                    (stats.breakdown?.byAction?.ASSIGNMENT_CREATED || 0)}
                </div>
                <div className="text-sm text-theme-tertiary">Itens Criados</div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiEdit className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {(stats.breakdown?.byAction?.LESSON_UPDATED || 0) +
                    (stats.breakdown?.byAction?.ASSIGNMENT_UPDATED || 0)}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Itens Editados
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
                    Filtros
                  </h3>
                  <p className="text-sm text-theme-tertiary">
                    {totalCount} atividades encontradas
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-theme-secondary hover:bg-theme-tertiary text-theme-primary rounded-lg transition-colors"
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filtros</span>
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
                        Ação
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
                        Tipo
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
                        Data Inicial
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
                        Data Final
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
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={clearFilters}
                      className="btn-classical-secondary"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={fetchActivities}
                      disabled={loading}
                      className="btn-classical-secondary flex items-center space-x-2"
                    >
                      <FiRefreshCw
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                      />
                      <span>Atualizar</span>
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
                  Erro ao carregar atividades
                </h3>
                <p className="text-theme-secondary mb-4">{error}</p>
                <button
                  onClick={fetchActivities}
                  className="btn-classical-primary"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : activities.length === 0 ? (
              <div className="classical-card p-12 text-center">
                <FiActivity className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Nenhuma atividade encontrada
                </h3>
                <p className="text-theme-secondary">
                  Não há atividades registradas com os filtros aplicados.
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
                        {getActionIcon(activity.action)}
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
                                <span className="font-medium">Item:</span>{' '}
                                {activity.entityDisplayName}
                              </div>
                            )}

                            {activity.changesSummary && (
                              <div className="text-xs text-theme-tertiary">
                                {activity.changesSummary}
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
                      router.push(`/teacher/history?${params.toString()}`);
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

export default TeacherHistoryClient;
