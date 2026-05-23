// app/teacher/lessons/pageClient.tsx - Client Component para Gerenciamento de Aulas - ATUALIZADO

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPlus,
  FiEye,
  FiEdit3,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiMapPin,
  FiBookOpen,
  FiFilter,
  FiSearch,
  FiMoreVertical,
  FiUserCheck,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { LessonData, TeacherLessonsData } from './pageServer';
import Link from 'next/link';
import Image from 'next/image';
import Select from '@/app/components/Common/Select';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import { useTeacherLessons } from '@/app/hooks/lessonsSystem/useTeacherLessons';
import { translateNivel } from '@/app/utils';
import { useTranslation } from '@/app/context/TranslationContext';

interface TeacherLessonsPageClientProps {
  initialData: TeacherLessonsData;
  errorMessage?: string;
}

type StatusFilter = 'all' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'past';

export default function TeacherLessonsPageClient({
  initialData,
  errorMessage,
}: TeacherLessonsPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/lessons'] });

  // Initialize hook with server data
  const {
    lessons,
    stats,
    pagination,
    loading,
    error,
    fetchLessons,
    refreshLessons,
    loadMoreLessons,
    cancelLesson,
    markAttendance,
    setInitialData,
    clearError,
  } = useTeacherLessons(initialData);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null);

  // Initialize hook data on mount and apply default filter
  useEffect(() => {
    if (initialData && initialData.lessons.length > 0) {
      setInitialData(initialData);
    }
    handleFilterChange();
  }, [initialData, setInitialData]);

  // Filter options
  const statusOptions = [
    { value: 'all', label: t('filter_status_all') },
    { value: 'SCHEDULED', label: t('filter_status_scheduled') },
    { value: 'COMPLETED', label: t('filter_status_completed') },
    { value: 'CANCELLED', label: t('filter_status_cancelled') },
    { value: 'NO_SHOW', label: t('filter_status_no_show') },
  ];

  const timeOptions = [
    { value: 'all', label: t('filter_time_all') },
    { value: 'today', label: t('filter_time_today') },
    { value: 'week', label: t('filter_time_week') },
    { value: 'month', label: t('filter_time_month') },
    { value: 'past', label: t('filter_time_past') },
  ];

  const studentOptions = [
    { value: 'all', label: t('filter_student_all') },
    ...initialData.students.map((student) => ({
      value: student.id,
      label: student.name,
    })),
  ];

  // Filter lessons com prioridade para aulas que precisam de atenção
  const filteredLessons = useMemo(() => {
    const now = new Date();
    let filtered = [...lessons];

    // 1. Aplicar filtro de status PRIMEIRO (em toda a lista)
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lesson) => lesson.status === statusFilter);
    }

    // 2. Aplicar filtro de tempo
    if (timeFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      filtered = filtered.filter((lesson) => {
        const lessonDate = new Date(lesson.scheduledAt);

        switch (timeFilter) {
          case 'today':
            return lessonDate.toDateString() === today.toDateString();
          case 'week':
            return lessonDate >= weekStart;
          case 'month':
            return lessonDate >= monthStart;
          case 'past':
            return lessonDate < now;
          default:
            return true;
        }
      });
    }

    // 3. Aplicar filtro de aluno
    if (selectedStudent !== 'all') {
      filtered = filtered.filter(
        (lesson) => lesson.student.id === selectedStudent
      );
    }

    // 4. Aplicar filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.student.name.toLowerCase().includes(query) ||
          lesson.description?.toLowerCase().includes(query) ||
          lesson.location?.toLowerCase().includes(query)
      );
    }

    // 5. Separar "needs attention" APENAS para ordenação com prioridade
    const needsAttention = filtered.filter((lesson) => {
      const lessonTime = new Date(lesson.scheduledAt);
      return lessonTime < now && lesson.status === 'SCHEDULED';
    });

    const regular = filtered.filter((lesson) => {
      const lessonTime = new Date(lesson.scheduledAt);
      return !(lessonTime < now && lesson.status === 'SCHEDULED');
    });

    // 6. Ordenar cada grupo
    const now_ts = now.getTime();

    const sortedRegular = regular.sort((a, b) => {
      const aTime = new Date(a.scheduledAt).getTime();
      const bTime = new Date(b.scheduledAt).getTime();
      const aIsFuture = aTime >= now_ts;
      const bIsFuture = bTime >= now_ts;

      if (aIsFuture && !bIsFuture) return -1;
      if (!aIsFuture && bIsFuture) return 1;
      if (aIsFuture && bIsFuture) return aTime - bTime;
      return bTime - aTime;
    });

    const sortedAttention = needsAttention.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    return [...sortedAttention, ...sortedRegular];
  }, [lessons, statusFilter, timeFilter, selectedStudent, searchQuery]);

  console.log('LESSONS', { lessons, filteredLessons });
  // Função para verificar se aula passou e precisa de atenção
  const getLessonStatusInfo = useCallback((lesson: any) => {
    const now = new Date();
    const lessonTime = new Date(lesson.scheduledAt);
    const hasPassedScheduledTime = lessonTime < now;
    const needsAttention =
      hasPassedScheduledTime && lesson.status === 'SCHEDULED';

    return {
      hasPassedScheduledTime,
      needsAttention,
      isPast: lessonTime < now,
      isToday: lessonTime.toDateString() === now.toDateString(),
    };
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshLessons();
  }, [refreshLessons]);

  // Handle filter change
  const handleFilterChange = useCallback(async () => {
    const filters: any = {};

    if (statusFilter !== 'all') filters.status = statusFilter;
    if (selectedStudent !== 'all') filters.studentId = selectedStudent;

    // Add date filters based on timeFilter
    if (timeFilter !== 'all') {
      const now = new Date();
      switch (timeFilter) {
        case 'today':
          filters.dateFrom = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          filters.dateTo = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          filters.dateFrom = weekStart;
          break;
        case 'month':
          filters.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
    }

    filters.includeStats = true;
    filters.forceRefresh = true;

    await fetchLessons(filters);
  }, [statusFilter, selectedStudent, timeFilter, fetchLessons]);

  // Apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFilterChange();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, timeFilter, selectedStudent]);

  // Quick actions
  const handleQuickAttendance = useCallback(
    async (lessonId: string, present: boolean) => {
      const success = await markAttendance(lessonId, {
        studentPresent: present,
        punctuality: present ? 'on_time' : undefined,
      });

      if (success) {
        setShowQuickActions(null);
        setTimeout(() => {
          handleRefresh();
        }, 500);
      }
    },
    [markAttendance, handleRefresh]
  );

  const handleQuickCancel = useCallback(
    async (lessonId: string) => {
      const success = await cancelLesson(lessonId, 'Cancelada pelo professor');
      if (success) {
        setShowQuickActions(null);
        setTimeout(() => {
          handleRefresh();
        }, 500);
      }
    },
    [cancelLesson, handleRefresh]
  );

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-accent-green/10 border-accent-green/30 text-green-400';
      case 'CANCELLED':
        return 'bg-accent-red/10 border-accent-red/30 text-red-600';
      case 'NO_SHOW':
        return 'bg-accent-yellow/10 border-accent-yellow/30 text-yellow-400';
      case 'SCHEDULED':
        return 'bg-accent-blue/10 border-accent-blue/30 text-theme-secondary';
      default:
        return 'bg-theme-secondary/10 border-theme-secondary/30 text-theme-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return t('status_completed');
      case 'CANCELLED':
        return t('status_cancelled');
      case 'NO_SHOW':
        return t('status_no_show');
      case 'SCHEDULED':
        return t('status_scheduled');
      default:
        return status;
    }
  };

  // Force refresh when page gains focus
  useEffect(() => {
    const handleFocus = () => {
      handleRefresh();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleRefresh]);

  // Render lesson card component
  const renderLessonCard = useCallback(
    (lesson: LessonData, index: number) => {
      const statusInfo = getLessonStatusInfo(lesson);

      return (
        <AnimatedCard
          key={lesson.id}
          hover="lift"
          className={`classical-card p-6   relative ${
            statusInfo.needsAttention ? ' border !border-red-400 0' : ''
          }`}
          delay={index * 0.05}
        >
          {/* Indicativo de atenção necessária */}
          {statusInfo.needsAttention && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-red rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-col items-start justify-between mb-4">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-bold text-theme-primary classical-title truncate">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        lesson.status
                      )}`}
                    >
                      {getStatusLabel(lesson.status)}
                    </span>

                    <div className="relative isolate">
                      <button
                        onClick={() =>
                          setShowQuickActions(
                            showQuickActions === lesson.id ? null : lesson.id
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                      >
                        <FiMoreVertical className="w-4 h-4 text-theme-tertiary" />
                      </button>

                      {/* Quick Actions Menu com z-index máximo */}
                      {showQuickActions === lesson.id && (
                        <>
                          {/* BACKDROP PARA FECHAR AO CLICAR FORA */}
                          <div
                            className="fixed inset-0 z-[999998]"
                            onClick={() => setShowQuickActions(null)}
                          />

                          {/* Menu com posicionamento próximo ao botão */}
                          <div
                            className="absolute right-0 top-10 bg-theme-elevated border border-theme-secondary rounded-lg shadow-xl py-2 min-w-48"
                            style={{
                              zIndex: 999999,
                              maxHeight: '90vh',
                              overflowY: 'auto',
                            }}
                          >
                            <Link
                              href={`/teacher/lessons/${lesson.id}`}
                              className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-theme-primary"
                            >
                              <FiEye className="w-4 h-4" />
                              <span>{t('view_details')}</span>
                            </Link>

                            {lesson.status === 'SCHEDULED' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickAttendance(lesson.id, true)
                                  }
                                  className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-green w-full text-left"
                                >
                                  <FiUserCheck className="w-4 h-4" />
                                  <span>{t('mark_attendance')}</span>
                                </button>

                                <button
                                  onClick={() =>
                                    handleQuickAttendance(lesson.id, false)
                                  }
                                  className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-yellow w-full text-left"
                                >
                                  <FiX className="w-4 h-4" />
                                  <span>{t('mark_absence')}</span>
                                </button>

                                <Link
                                  href={`/teacher/lessons/${lesson.id}`}
                                  className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-theme-primary"
                                >
                                  <FiEdit3 className="w-4 h-4" />
                                  <span>{t('edit')}</span>
                                </Link>

                                <button
                                  onClick={() => handleQuickCancel(lesson.id)}
                                  className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-red w-full text-left"
                                >
                                  <FiX className="w-4 h-4" />
                                  <span>{t('cancel')}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-4 text-sm w-full text-theme-secondary mt-1">
                  <div className="flex items-center space-x-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDateTime(lesson.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>
                      {lesson.duration}
                      {t('min_abbreviation')}
                    </span>
                  </div>
                  {lesson.location && (
                    <div className="flex items-center space-x-1">
                      <FiMapPin className="w-4 h-4" />
                      <span>{lesson.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Info */}
              <div className="flex items-center space-x-3 mb-4">
                {lesson.student.image ? (
                  <div className="w-10 h-10 relative rounded-full overflow-hidden">
                    <Image
                      src={lesson.student.image}
                      alt={lesson.student.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-theme-primary">
                    {lesson.student.name}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {t('level_label')} {translateNivel(lesson.student.level)}
                  </div>
                </div>
              </div>

              {/* Lesson Info */}
              {lesson.description && (
                <p className="text-theme-secondary text-sm mb-3">
                  {lesson.description}
                </p>
              )}

              {/* Objectives & Topics */}
              {(lesson.objectives.length > 0 || lesson.topics.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {lesson.objectives.slice(0, 3).map((objective, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-xs"
                    >
                      {objective}
                    </span>
                  ))}
                  {lesson.topics.slice(0, 2).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                  {(lesson.objectives.length > 3 ||
                    lesson.topics.length > 2) && (
                    <span className="text-xs text-theme-tertiary">
                      +{lesson.objectives.length + lesson.topics.length - 5}{' '}
                      {t('more')}
                    </span>
                  )}
                </div>
              )}

              {/* Progress Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {lesson.studentPresent !== undefined &&
                    lesson.studentPresent !== null && (
                      <div
                        className={`flex items-center space-x-1 ${
                          lesson.studentPresent
                            ? 'text-accent-green'
                            : 'text-accent-red'
                        }`}
                      >
                        {lesson.studentPresent ? (
                          <FiCheck className="w-4 h-4" />
                        ) : (
                          <FiX className="w-4 h-4" />
                        )}
                        <span>
                          <span>{getStatusLabel(lesson.status)}</span>
                        </span>
                      </div>
                    )}

                  {lesson.homework && (
                    <div className="flex items-center space-x-1 text-accent-yellow">
                      <FiBookOpen className="w-4 h-4" />
                      <span>{t('with_homework')}</span>
                    </div>
                  )}

                  {lesson.studentFeedback && (
                    <div className="flex items-center space-x-1 text-accent-blue">
                      <FiMessageSquare className="w-4 h-4" />
                      <span>{t('with_feedback')}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-theme-tertiary">
                  {lesson.isRecurring && `🔄 ${t('recurring')} • `}
                  {t('created_on')} {formatDate(lesson.createdAt)}
                </div>
              </div>
              {/* Alerta para aulas que precisam de atenção */}
              {statusInfo.needsAttention && (
                <div className="flex items-center justify-center space-x-1 mt-3 text-accent-red">
                  <FiAlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="strong text-red-600">
                    {t('needs_status_update')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </AnimatedCard>
      );
    },
    [
      getLessonStatusInfo,
      getStatusColor,
      getStatusLabel,
      formatDateTime,
      formatDate,
      showQuickActions,
      handleQuickAttendance,
      handleQuickCancel,
      t,
    ]
  );

  // Render lesson list item component
  const renderLessonListItem = useCallback(
    (lesson: any) => {
      const statusInfo = getLessonStatusInfo(lesson);

      return (
        <AnimatedCard
          key={lesson.id}
          hover="lift"
          className={`classical-card p-6 relative ${
            statusInfo.needsAttention ? ' border !border-red-400 0' : ''
          }`}
        >
          {/* Indicativo de atenção necessária */}
          {statusInfo.needsAttention && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-red rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-theme-primary mb-2">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDateTime(lesson.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>
                        {lesson.duration}
                        {t('min_abbreviation')}
                      </span>
                    </div>
                    {lesson.location && (
                      <div className="flex items-center space-x-1">
                        <FiMapPin className="w-4 h-4" />
                        <span>{lesson.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      lesson.status
                    )}`}
                  >
                    {getStatusLabel(lesson.status)}
                  </span>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowQuickActions(
                          showQuickActions === lesson.id ? null : lesson.id
                        )
                      }
                      className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                    >
                      <FiMoreVertical className="w-4 h-4 text-theme-tertiary" />
                    </button>

                    {/* Quick Actions Menu */}
                    {showQuickActions === lesson.id && (
                      <div
                        className="fixed inset-0 z-[999999]"
                        style={{ zIndex: 999999 }}
                      >
                        <div
                          className="absolute inset-0"
                          onClick={() => setShowQuickActions(null)}
                        />
                        <div
                          className="absolute bg-theme-elevated border border-theme-secondary rounded-lg shadow-xl py-2 min-w-48"
                          style={{
                            position: 'fixed',
                            right: '4rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1000000,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                          }}
                        >
                          <Link
                            href={`/teacher/lessons/${lesson.id}`}
                            className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-theme-primary"
                          >
                            <FiEye className="w-4 h-4" />
                            <span>{t('view_details')}</span>
                          </Link>

                          {lesson.status === 'SCHEDULED' && (
                            <>
                              <button
                                onClick={() =>
                                  handleQuickAttendance(lesson.id, true)
                                }
                                className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-green w-full text-left"
                              >
                                <FiUserCheck className="w-4 h-4" />
                                <span>{t('mark_attendance')}</span>
                              </button>

                              <button
                                onClick={() =>
                                  handleQuickAttendance(lesson.id, false)
                                }
                                className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-yellow w-full text-left"
                              >
                                <FiX className="w-4 h-4" />
                                <span>{t('mark_absence')}</span>
                              </button>

                              <Link
                                href={`/teacher/lessons/${lesson.id}`}
                                className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-theme-primary"
                              >
                                <FiEdit3 className="w-4 h-4" />
                                <span>{t('edit')}</span>
                              </Link>

                              <button
                                onClick={() => handleQuickCancel(lesson.id)}
                                className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-red w-full text-left"
                              >
                                <FiX className="w-4 h-4" />
                                <span>{t('cancel')}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="flex items-center space-x-3 mb-4">
                {lesson.student.image ? (
                  <div className="w-10 h-10 relative rounded-full overflow-hidden">
                    <Image
                      src={lesson.student.image}
                      alt={lesson.student.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-theme-primary">
                    {lesson.student.name}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {t('level_label')} {translateNivel(lesson.student.level)}
                  </div>
                </div>
              </div>

              {/* Lesson Info */}
              {lesson.description && (
                <p className="text-theme-secondary text-sm mb-3">
                  {lesson.description}
                </p>
              )}

              {/* Objectives & Topics */}
              {(lesson.objectives.length > 0 || lesson.topics.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {lesson.objectives
                    .slice(0, 3)
                    .map((objective: any, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-xs"
                      >
                        {objective}
                      </span>
                    ))}
                  {lesson.topics
                    .slice(0, 2)
                    .map((topic: any, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  {(lesson.objectives.length > 3 ||
                    lesson.topics.length > 2) && (
                    <span className="text-xs text-theme-tertiary">
                      +{lesson.objectives.length + lesson.topics.length - 5}{' '}
                      {t('more')}
                    </span>
                  )}
                </div>
              )}

              {/* Progress Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {lesson.studentPresent !== undefined &&
                    lesson.studentPresent !== null && (
                      <div
                        className={`flex items-center space-x-1 ${
                          lesson.studentPresent
                            ? 'text-accent-green'
                            : 'text-accent-red'
                        }`}
                      >
                        {lesson.studentPresent ? (
                          <FiCheck className="w-4 h-4" />
                        ) : (
                          <FiX className="w-4 h-4" />
                        )}
                        <span>
                          <span>{getStatusLabel(lesson.status)}</span>
                        </span>
                      </div>
                    )}

                  {lesson.homework && (
                    <div className="flex items-center space-x-1 text-accent-yellow">
                      <FiBookOpen className="w-4 h-4" />
                      <span>{t('with_homework')}</span>
                    </div>
                  )}

                  {lesson.studentFeedback && (
                    <div className="flex items-center space-x-1 text-accent-blue">
                      <FiMessageSquare className="w-4 h-4" />
                      <span>{t('with_feedback')}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-theme-tertiary">
                  {lesson.isRecurring && `🔄 ${t('recurring')} • `}
                  {t('created_on')} {formatDate(lesson.createdAt)}
                </div>
              </div>
              {/* Alerta para aulas que precisam de atenção */}
              {statusInfo.needsAttention && (
                <div className="flex items-center justify-center space-x-1 mt-3 text-accent-red">
                  <FiAlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="strong text-red-600">
                    {t('needs_status_update')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </AnimatedCard>
      );
    },
    [
      getLessonStatusInfo,
      getStatusColor,
      getStatusLabel,
      formatDateTime,
      showQuickActions,
      handleQuickAttendance,
      handleQuickCancel,
      t,
    ]
  );

  // Render error state
  if ((error || errorMessage) && lessons.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiBookOpen className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_lessons')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                disabled={loading.lessons}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading.lessons ? 'animate-spin' : ''}`}
                />
                <span>{loading.lessons ? t('updating') : t('try_again')}</span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  {t('clear_error')}
                </button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiBookOpen className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('page_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="overflow-x-auto sm:overflow-x-hidden overflow-y-hidden pb-2 mb-8">
            <div className="grid grid-cols-5 gap-6 min-w-[700px]">
              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiBookOpen className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.total}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('stats_total')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiCalendar className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.scheduled}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('stats_scheduled')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.completed}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('stats_completed')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiClock className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.today}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('stats_today')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiXCircle className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.cancelled}
                </div>
                <div className="text-sm text-theme-tertiary">
                  {t('stats_cancelled')}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 ">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-classical w-full !pl-10"
                  />
                </div>
              </div>

              {/* Filters and Controls */}
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-classical-secondary flex items-center space-x-2 ${
                      showFilters
                        ? 'bg-brand-primary/10 border-brand-primary/30'
                        : ''
                    }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    <span>{t('filters')}</span>
                  </button>

                  <button
                    onClick={handleRefresh}
                    disabled={loading.lessons}
                    className="btn-classical-secondary flex items-center space-x-2"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 ${
                        loading.lessons ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{t('refresh')}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <Link
                    href="/teacher/lessons/create"
                    className="btn-classical-primary flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>{t('new_lesson')}</span>
                  </Link>
                  {/* VIEW MODE TOGGLE */}
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-theme-secondary">
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  options={statusOptions}
                  className="input-classical-2"
                />

                <Select
                  label="Período"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  options={timeOptions}
                  className="input-classical-2"
                />

                <Select
                  label="Aluno"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  options={studentOptions}
                  className="input-classical-2"
                />
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Lessons List */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="space-y-4">
            {loading.lessons && lessons.length === 0 ? (
              <div className="text-center py-12">
                <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
                <p className="text-theme-secondary">{t('loading_lessons')}</p>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-12">
                <FiBookOpen className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-theme-primary mb-2">
                  {t('no_lessons_found')}
                </h3>
                <p className="text-theme-tertiary mb-6">
                  {searchQuery ||
                  statusFilter !== 'all' ||
                  selectedStudent !== 'all'
                    ? t('no_lessons_description')
                    : t('no_lessons_yet')}
                </p>
                <Link
                  href="/teacher/lessons/create"
                  className="btn-classical-primary"
                >
                  {t('create_first_lesson')}
                </Link>
              </div>
            ) : (
              <>
                {/* CONDITIONAL RENDERING BASED ON VIEW MODE */}
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map(renderLessonCard)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLessons.map(renderLessonListItem)}
                  </div>
                )}
              </>
            )}

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center py-8">
                <button
                  onClick={loadMoreLessons}
                  disabled={loading.lessons}
                  className="btn-classical-secondary flex items-center space-x-2 mx-auto"
                >
                  {loading.lessons ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiPlus className="w-4 h-4" />
                  )}
                  <span>
                    {loading.lessons ? t('updating') : t('load_more')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
