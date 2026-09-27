// app/student/lessons/pageClient.tsx - Client Component para Aulas do Aluno - ATUALIZADO COM ORDENAÇÃO

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiChatCenteredText,
  PiCheck,
  PiClock,
  PiEye,
  PiFunnel,
  PiMagnifyingGlass,
  PiMapPin,
  PiUser,
  PiWarning,
  PiX,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { StudentLessonsData } from './pageServer';
import Link from 'next/link';
import { useStudentLessons } from '@/app/hooks/lessonsSystem/useStudentLessons';
import Select from '@/app/components/Common/Select';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import { useTranslation } from '@/app/context/TranslationContext';
import Button from '@/app/components/Common/Button';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface StudentLessonsPageClientProps {
  initialData: StudentLessonsData | null;
  errorMessage?: string;
}

type LessonFilter = 'all' | 'scheduled' | 'completed' | 'cancelled';
type TimeFilter =
  | 'all'
  | 'past'
  | 'today'
  | 'upcoming'
  | 'this_week'
  | 'this_month';
type SortOption =
  | 'scheduled_asc'
  | 'scheduled_desc'
  | 'created_asc'
  | 'created_desc'
  | 'status'
  | 'teacher';

export default function StudentLessonsPageClient({
  initialData,
  errorMessage,
}: StudentLessonsPageClientProps) {
  const { t } = useTranslation({ sections: ['student/lessons'] });

  // Initialize hook with server data
  const { lessons, loading, error, fetchLessons, refreshLessons, clearError } =
    useStudentLessons();

  // 🆕 VIEW MODE STATE
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<LessonFilter>('scheduled'); // Mudança aqui: padrão agora é 'scheduled'
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('scheduled_asc'); // 🆕 ESTADO DE ORDENAÇÃO
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Initialize with server data
  useEffect(() => {
    if (initialData && initialData.lessons.length > 0) {
      // Se temos dados iniciais, não precisamos fazer fetch
      console.log('📚 Usando dados iniciais do servidor');
    } else if (!errorMessage && errorMessage !== 'no_teachers') {
      // Se não há dados iniciais e não há erro, fazer fetch
      fetchLessons({ limit: 50 });
    }
  }, [initialData, errorMessage, fetchLessons]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshLessons();
  }, [refreshLessons]);

  // Use initial data or hook data
  const displayLessons = initialData?.lessons || lessons;
  const teachersOptions = initialData?.teachers || [];

  // 🆕 FUNÇÃO PARA VERIFICAR SE AULA PASSOU E PRECISA DE ATENÇÃO
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

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let filtered = [...displayLessons];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(term) ||
          lesson.description?.toLowerCase().includes(term) ||
          lesson.teacher.name.toLowerCase().includes(term) ||
          lesson.objectives.some((obj) => obj.toLowerCase().includes(term))
      );
    }

    // Teacher filter
    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(
        (lesson) => lesson.teacher.id === selectedTeacher
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lesson) => {
        switch (statusFilter) {
          case 'scheduled':
            return lesson.status === 'SCHEDULED';
          case 'completed':
            return lesson.status === 'COMPLETED';
          case 'cancelled':
            return lesson.status === 'CANCELLED';
          default:
            return true;
        }
      });
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filtered = filtered.filter((lesson) => {
        const lessonDate = new Date(lesson.scheduledAt);

        switch (timeFilter) {
          case 'past':
            return lessonDate < now;
          case 'today':
            return lessonDate >= today && lessonDate < tomorrow;
          case 'upcoming':
            return lessonDate > now;
          case 'this_week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            return lessonDate >= weekStart && lessonDate < weekEnd;
          case 'this_month':
            const monthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1
            );
            const monthEnd = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0
            );
            return lessonDate >= monthStart && lessonDate <= monthEnd;
          default:
            return true;
        }
      });
    }

    // 🆕 APLICAR ORDENAÇÃO
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'scheduled_asc':
          return (
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
          );

        case 'scheduled_desc':
          return (
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
          );

        case 'created_asc':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        case 'created_desc':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        case 'status':
          const statusOrder = { SCHEDULED: 1, COMPLETED: 2, CANCELLED: 3 };
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 4;
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 4;
          if (aOrder === bOrder) {
            // Se status igual, ordenar por data agendada (próximas primeiro)
            return (
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
            );
          }
          return aOrder - bOrder;

        case 'teacher':
          const teacherCompare = a.teacher.name.localeCompare(b.teacher.name);
          if (teacherCompare === 0) {
            // Se professor igual, ordenar por data agendada (próximas primeiro)
            return (
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
            );
          }
          return teacherCompare;

        default:
          // Default: próximas aulas primeiro para scheduled, mais recentes primeiro para outros
          if (statusFilter === 'scheduled') {
            return (
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
            );
          } else {
            return (
              new Date(b.scheduledAt).getTime() -
              new Date(a.scheduledAt).getTime()
            );
          }
      }
    });
  }, [
    displayLessons,
    searchTerm,
    selectedTeacher,
    statusFilter,
    timeFilter,
    sortBy,
  ]);

  console.log('lessons', { filteredLessons, displayLessons });
  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLessons = filteredLessons.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    return {
      total: displayLessons.length,
      scheduled: displayLessons.filter((l) => l.status === 'SCHEDULED').length,
      completed: displayLessons.filter((l) => l.status === 'COMPLETED').length,
      cancelled: displayLessons.filter((l) => l.status === 'CANCELLED').length,
      filtered: filteredLessons.length,
    };
  }, [displayLessons, filteredLessons]);

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = new Date(date);
    return `${formatDate(dateObj)} às ${formatTime(dateObj)}`;
  };

  // Get lesson status info
  const getLessonStatusInfoDisplay = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'border-green-400 text-green-400',
          label: t('status_completed'),
          icon: PiCheck,
        };
      case 'CANCELLED':
        return {
          color: 'border-red-400 text-red-400',
          label: t('status_cancelled'),
          icon: PiX,
        };
      case 'NO_SHOW':
        return {
          color: 'border-yellow-300 text-yellow-300',
          label: t('status_no_show'),
          icon: PiX,
        };
      case 'RESCHEDULED':
        return {
          color: 'border-purple-300 text-purple-300',
          label: t('status_rescheduled'),
          icon: PiClock,
        };
      default:
        return {
          color: 'border-blue-300 text-blue-300',
          label: t('status_scheduled'),
          icon: PiCalendarBlank,
        };
    }
  };

  // 🆕 RENDER LESSON CARD COMPONENT
  const renderLessonCard = useCallback(
    (lesson: any, index: number) => {
      const statusInfo = getLessonStatusInfo(lesson);
      const statusDisplayInfo = getLessonStatusInfoDisplay(lesson.status);
      const StatusIcon = statusDisplayInfo.icon;
      const isToday = statusInfo.isToday;

      return (
        <AnimatedCard
          key={lesson.id}
          hover="lift"
          className={`classical-card p-6 relative ${
            isToday ? ' ring-yellow-400 ring-2' : ''
          } ${statusInfo.needsAttention ? 'ring-2 ring-red-400' : ''}`}
          delay={index * 0.1}
        >
          {/* 🆕 INDICATIVO DE ATENÇÃO NECESSÁRIA */}
          {statusInfo.needsAttention && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <PiWarning className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium bg-sup-2 ${statusDisplayInfo.color}`}
            >
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {statusDisplayInfo.label}
            </span>
            {isToday && (
              <Text
                papel="legenda"
                tom="ouro"
                className="px-2 py-1 rounded-full font-medium"
              >
                {t('today')}
              </Text>
            )}
          </div>

          {/* Lesson Info */}
          <h3 className="font-bold text-theme-primary mb-2 line-clamp-2">
            {lesson.title}
          </h3>

          <Stack gap={2} className="mb-4">
            <Text
              papel="rotulo"
              tom="suave"
              as="div"
              className="flex items-center"
            >
              <PiCalendarBlank className="w-4 h-4 mr-2" />
              {formatDateTime(lesson.scheduledAt)}
            </Text>

            <Text
              papel="rotulo"
              tom="suave"
              as="div"
              className="flex items-center"
            >
              <PiClock className="w-4 h-4 mr-2" />
              {lesson.duration} {t('minutes')}
            </Text>

            <Text
              papel="rotulo"
              tom="suave"
              as="div"
              className="flex items-center"
            >
              <PiUser className="w-4 h-4 mr-2" />
              {lesson.teacher.name}
            </Text>

            {lesson.location && (
              <Text
                papel="rotulo"
                tom="suave"
                as="div"
                className="flex items-center"
              >
                <PiMapPin className="w-4 h-4 mr-2" />
                {lesson.location}
              </Text>
            )}
          </Stack>

          {/* Objectives Preview */}
          {lesson.objectives.length > 0 && (
            <Stack gap={1} className="mb-4">
              <Text papel="legenda" tom="fraco" as="div">
                {t('objectives')}:
              </Text>
              <div className="flex flex-wrap gap-1">
                {lesson.objectives
                  .slice(0, 2)
                  .map((objective: any, idx: number) => (
                    <span key={idx} className="px-2 py-1 text-xs rounded">
                      {objective}
                    </span>
                  ))}
                {lesson.objectives.length > 2 && (
                  <Text papel="legenda" tom="fraco">
                    +{lesson.objectives.length - 2}
                  </Text>
                )}
              </div>
            </Stack>
          )}

          {/* Feedback Status */}
          {lesson.status === 'COMPLETED' && (
            <div className="mb-4">
              {lesson.studentFeedback ? (
                <div className="flex items-center text-sm">
                  <PiChatCenteredText className="w-4 h-4 mr-2" />
                  {t('feedback_sent')}
                </div>
              ) : (
                <div className="flex items-center text-sm">
                  <PiChatCenteredText className="w-4 h-4 mr-2" />
                  {t('feedback_pending')}
                </div>
              )}
            </div>
          )}

          {/* 🆕 ALERTA PARA AULAS QUE PRECISAM DE ATENÇÃO */}
          {statusInfo.needsAttention && (
            <div className="mb-4">
              <div className="flex items-center text-sm text-red-600">
                <PiWarning className="w-4 h-4 mr-2" />
                {t('status_needs_update')}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Link
            href={`/student/lessons/${lesson.id}`}
            className="btn-classical-primary w-full text-center flex items-center justify-center space-x-2"
          >
            <PiEye className="w-4 h-4" />
            <span>{t('see_details')}</span>
          </Link>
        </AnimatedCard>
      );
    },
    [getLessonStatusInfo, getLessonStatusInfoDisplay, formatDateTime, t]
  );

  // 🆕 RENDER LESSON LIST ITEM COMPONENT
  const renderLessonListItem = useCallback(
    (lesson: any, index: number) => {
      const statusInfo = getLessonStatusInfo(lesson);
      const statusDisplayInfo = getLessonStatusInfoDisplay(lesson.status);
      const isToday = statusInfo.isToday;

      return (
        <AnimatedCard
          key={lesson.id}
          hover="lift"
          className={`classical-card p-4 ${
            isToday ? 'ring-2 ring-yellow-400' : ''
          } ${statusInfo.needsAttention ? 'ring-2 ring-red-600' : ''}`}
          delay={index * 0.05}
        >
          <div className="flex items-center justify-between">
            <Inline gap={4} className="flex-1">
              {/* Status Indicator */}
              <Inline gap={2}>
                <span
                  className={`w-3 h-3 rounded-full ${
                    lesson.status === 'COMPLETED'
                      ? ''
                      : lesson.status === 'CANCELLED'
                        ? ''
                        : lesson.status === 'NO_SHOW'
                          ? ''
                          : ''
                  }`}
                />
                {statusInfo.needsAttention && <PiWarning className="w-4 h-4" />}
                {isToday && (
                  <Text
                    papel="legenda"
                    tom="ouro"
                    className="px-2 py-1 rounded-full font-medium"
                  >
                    {t('today')}
                  </Text>
                )}
              </Inline>

              {/* Lesson Info */}
              <div className="flex-1 min-w-0">
                <Inline gap={3}>
                  <h3 className="font-semibold text-theme-primary truncate">
                    {lesson.title}
                  </h3>
                  <Text papel="rotulo" tom="suave">
                    {lesson.teacher.name}
                  </Text>
                </Inline>
                <Inline gap={4} className="text-sm text-theme-tertiary">
                  <span>{formatDateTime(lesson.scheduledAt)}</span>
                  <span>{lesson.duration}min</span>
                  {lesson.location && <span>{lesson.location}</span>}
                  {statusInfo.needsAttention && (
                    <span className="">{t('status_pending')}</span>
                  )}
                </Inline>
              </div>

              {/* Status */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplayInfo.color}`}
              >
                {statusDisplayInfo.label}
              </span>
            </Inline>

            {/* Actions */}
            <Inline gap={2} className="ml-4">
              <Link
                href={`/student/lessons/${lesson.id}`}
                className="w-8 h-8 rounded-lg bg-theme-elevated transition-colors flex items-center justify-center group"
              >
                <PiEye className="w-4 h-4 text-theme-tertiary transition-colors" />
              </Link>
            </Inline>
          </div>
        </AnimatedCard>
      );
    },
    [getLessonStatusInfo, getLessonStatusInfoDisplay, formatDateTime, t]
  );

  // Error state para "no teachers"
  if (errorMessage === 'no_teachers') {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiUser className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('no_teachers_title')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {t('no_teachers_description')}
            </p>
            <Link href="/student" className="btn-classical-primary">
              {t('back_to_dashboard')}
            </Link>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Error state geral
  if ((error || errorMessage) && displayLessons.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiCalendarBlank className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_lessons')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <Inline
                as="button"
                gap={2}
                onClick={handleRefresh}
                disabled={loading.lessons}
                className="btn-classical-primary w-full justify-center"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${loading.lessons ? 'animate-spin' : ''}`}
                />
                <span>{loading.lessons ? t('loading') : t('try_again')}</span>
              </Inline>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  {t('clear_error')}
                </button>
              )}
            </div>
          </Card>
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
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiBookOpen className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('my_lessons_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle medida-texto mx-auto">
              {t('my_lessons_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="overflow-x-auto sm:overflow-x-hidden overflow-y-hidden pb-2 mb-8 scroll-smooth snap-x snap-mandatory scrollbar-hide">
            <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-6 sm:grid-flow-row sm:grid-cols-4 sm:auto-cols-auto">
              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center snap-start"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiCalendarBlank className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.total}
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  {t('total')}
                </Text>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center snap-start"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiClock className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.scheduled}
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  {t('scheduled')}
                </Text>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center snap-start"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiCheck className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.completed}
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  {t('completed')}
                </Text>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center snap-start"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiX className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.cancelled}
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  {t('cancelled')}
                </Text>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedItem>

        {/* Search and Filters */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder={t('search_lessons')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-classical pl-10 w-full"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-center space-x-4">
                <Button
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-classical-secondary w-full sm:w-auto flex items-center space-x-2 ${
                    showFilters ? 'text-ouro-texto' : ''
                  }`}
                  leftIcon={<PiFunnel className="w-4 h-4" />}
                >
                  <span>{t('filters')}</span>
                </Button>

                <Button
                  size="lg"
                  onClick={handleRefresh}
                  disabled={loading.lessons}
                  className="btn-classical-secondary w-full sm:w-auto  flex items-center space-x-2"
                  leftIcon={
                    <PiArrowsClockwise
                      className={`w-4 h-4 ${
                        loading.lessons ? 'animate-spin' : ''
                      }`}
                    />
                  }
                >
                  <span>{t('refresh')}</span>
                </Button>

                {/* 🆕 VIEW MODE TOGGLE */}
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-theme-secondary grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Select
                    label={t('teacher')}
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    options={[
                      { value: 'all', label: t('all_teachers') },
                      ...teachersOptions.map((teacher) => ({
                        value: teacher.teacherId,
                        label: teacher.teacherName,
                      })),
                    ]}
                    className="input-classical w-full"
                  />
                </div>

                <div>
                  <Select
                    label={t('status')}
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as LessonFilter)
                    }
                    options={[
                      { value: 'all', label: t('all_status') },
                      { value: 'scheduled', label: t('scheduled') },
                      { value: 'completed', label: t('completed') },
                      { value: 'cancelled', label: t('cancelled') },
                    ]}
                    className="input-classical w-full"
                  />
                </div>

                <div>
                  <Select
                    label={t('period')}
                    value={timeFilter}
                    onChange={(e) =>
                      setTimeFilter(e.target.value as TimeFilter)
                    }
                    options={[
                      { value: 'all', label: t('all_periods') },
                      { value: 'today', label: t('today') },
                      { value: 'upcoming', label: t('upcoming') },
                      { value: 'past', label: t('past') },
                      { value: 'this_week', label: t('this_week') },
                      { value: 'this_month', label: t('this_month') },
                    ]}
                    className="input-classical w-full"
                  />
                </div>

                <div>
                  <Select
                    label={t('ordered')}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    options={[
                      {
                        value: 'scheduled_asc',
                        label: t('student_lessons_sort_scheduled_asc'),
                      },
                      {
                        value: 'scheduled_desc',
                        label: t('student_lessons_sort_scheduled_desc'),
                      },
                      {
                        value: 'created_desc',
                        label: t('student_lessons_sort_newest'),
                      },
                      {
                        value: 'created_asc',
                        label: t('student_lessons_sort_oldest'),
                      },
                      {
                        value: 'status',
                        label: t('student_lessons_sort_status'),
                      },
                      {
                        value: 'teacher',
                        label: t('student_lessons_sort_teacher'),
                      },
                    ]}
                    className="!w-full !sm:w-auto"
                  />
                </div>
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Results Info */}
        {filteredLessons.length !== displayLessons.length && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-6">
              <Text papel="rotulo" tom="suave" as="p">
                {t('showing_results', {
                  filtered: filteredLessons.length,
                  total: displayLessons.length,
                })}
                {searchTerm && ` para "${searchTerm}"`}
              </Text>
            </div>
          </AnimatedItem>
        )}

        {/* Lessons Grid */}
        <AnimatedItem direction="up" springType="gentle">
          {paginatedLessons.length === 0 ? (
            <div className="text-center py-12">
              <PiBookOpen className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-theme-primary mb-2">
                {filteredLessons.length === 0 && displayLessons.length > 0
                  ? t('no_lessons_found')
                  : t('no_lessons_scheduled')}
              </h3>
              <p className="text-theme-tertiary">
                {filteredLessons.length === 0 && displayLessons.length > 0
                  ? t('try_adjust_filters')
                  : t('lessons_will_appear')}
              </p>
            </div>
          ) : (
            <>
              {/* 🆕 CONDITIONAL RENDERING BASED ON VIEW MODE */}
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedLessons.map(renderLessonCard)}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedLessons.map(renderLessonListItem)}
                </div>
              )}
            </>
          )}
        </AnimatedItem>

        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" springType="gentle">
            <Inline gap={4} className="justify-center mt-8">
              <Inline
                as="button"
                gap={2}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-classical-secondary disabled:opacity-50"
              >
                <PiCaretLeft className="w-4 h-4" />
                <span>{t('previous')}</span>
              </Inline>

              <Inline gap={2}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    const distance = Math.abs(page - currentPage);
                    return distance <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-theme-tertiary">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'text-theme-primary'
                              : 'text-theme-secondary'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </Inline>

              <Inline
                as="button"
                gap={2}
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-classical-secondary disabled:opacity-50"
              >
                <span>{t('next')}</span>
                <PiCaretRight className="w-4 h-4" />
              </Inline>
            </Inline>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
