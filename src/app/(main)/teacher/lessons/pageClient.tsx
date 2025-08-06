// app/teacher/lessons/pageClient.tsx - Client Component para Gerenciamento de Aulas

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
  FiAlertCircle,
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
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { TeacherLessonsData, LessonData } from './pageServer';
import Link from 'next/link';
import Image from 'next/image';
import Select from '@/app/components/Common/Select';
import { useTeacherLessons } from '@/app/hooks/lessonsSystem/useTeacherLessons';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface TeacherLessonsPageClientProps {
  initialData: TeacherLessonsData;
  teacherProfile: TeacherProfile;
  errorMessage?: string;
}

type StatusFilter = 'all' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'past';

export default function TeacherLessonsPageClient({
  initialData,
  teacherProfile,
  errorMessage,
}: TeacherLessonsPageClientProps) {
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
    updateLesson,
    cancelLesson,
    markAttendance,
    addLessonNotes,
    setInitialData,
    clearError,
  } = useTeacherLessons(initialData);

  // Local UI state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null);

  // Initialize hook data on mount
  useEffect(() => {
    if (initialData && initialData.lessons.length > 0) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'SCHEDULED', label: 'Agendadas' },
    { value: 'COMPLETED', label: 'Concluídas' },
    { value: 'CANCELLED', label: 'Canceladas' },
    { value: 'NO_SHOW', label: 'Faltas' },
  ];

  const timeOptions = [
    { value: 'all', label: 'Todo período' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' },
    { value: 'past', label: 'Passadas' },
  ];

  const studentOptions = [
    { value: 'all', label: 'Todos os alunos' },
    ...initialData.students.map((student) => ({
      value: student.id,
      label: student.name,
    })),
  ];

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let filtered = [...lessons];
    const now = new Date();

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lesson) => lesson.status === statusFilter);
    }

    // Time filter
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

    // Student filter
    if (selectedStudent !== 'all') {
      filtered = filtered.filter(
        (lesson) => lesson.student.id === selectedStudent
      );
    }

    // Search filter
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

    return filtered.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }, [lessons, statusFilter, timeFilter, selectedStudent, searchQuery]);

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

    await fetchLessons(filters);
  }, [statusFilter, selectedStudent, timeFilter, fetchLessons]);

  // Quick actions
  const handleQuickAttendance = useCallback(
    async (lessonId: string, present: boolean) => {
      const success = await markAttendance(lessonId, {
        studentPresent: present,
        punctuality: present ? 'on_time' : undefined,
      });

      if (success) {
        setShowQuickActions(null);
      }
    },
    [markAttendance]
  );

  const handleQuickCancel = useCallback(
    async (lessonId: string) => {
      const success = await cancelLesson(lessonId, 'Cancelada pelo professor');
      if (success) {
        setShowQuickActions(null);
      }
    },
    [cancelLesson]
  );

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
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
        return 'bg-accent-green/10 border-accent-green/30 text-accent-green';
      case 'CANCELLED':
        return 'bg-accent-red/10 border-accent-red/30 text-accent-red';
      case 'NO_SHOW':
        return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow';
      case 'SCHEDULED':
        return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
      default:
        return 'bg-theme-secondary/10 border-theme-secondary/30 text-theme-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'Faltou';
      case 'SCHEDULED':
        return 'Agendada';
      default:
        return status;
    }
  };

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
              Erro ao Carregar Aulas
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
                <span>
                  {loading.lessons ? 'Carregando...' : 'Tentar Novamente'}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  Limpar Erro
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
              Gerenciar Aulas
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Visualize, edite e acompanhe o progresso de todas as suas aulas
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
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
              <div className="text-sm text-theme-tertiary">Total</div>
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
              <div className="text-sm text-theme-tertiary">Agendadas</div>
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
              <div className="text-sm text-theme-tertiary">Concluídas</div>
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
              <div className="text-sm text-theme-tertiary">Hoje</div>
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
              <div className="text-sm text-theme-tertiary">Canceladas</div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar aulas, alunos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-classical-2 pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
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
                  <span>Filtros</span>
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
                  <span>Atualizar</span>
                </button>

                <Link
                  href="/teacher/lessons/create"
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Nova Aula</span>
                </Link>
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
                <p className="text-theme-secondary">Carregando aulas...</p>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-12">
                <FiBookOpen className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-theme-primary mb-2">
                  Nenhuma aula encontrada
                </h3>
                <p className="text-theme-tertiary mb-6">
                  {searchQuery ||
                  statusFilter !== 'all' ||
                  selectedStudent !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Você ainda não tem aulas cadastradas.'}
                </p>
                <Link
                  href="/teacher/lessons/create"
                  className="btn-classical-primary"
                >
                  Criar Primeira Aula
                </Link>
              </div>
            ) : (
              filteredLessons.map((lesson) => (
                <AnimatedCard
                  key={lesson.id}
                  hover="lift"
                  className="classical-card p-6"
                >
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
                              <span>{lesson.duration}min</span>
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
                                  showQuickActions === lesson.id
                                    ? null
                                    : lesson.id
                                )
                              }
                              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                            >
                              <FiMoreVertical className="w-4 h-4 text-theme-tertiary" />
                            </button>

                            {/* Quick Actions Menu */}
                            {showQuickActions === lesson.id && (
                              <div className="absolute right-0 top-10 bg-theme-elevated border border-theme-secondary rounded-lg shadow-lg py-2 z-10 min-w-48">
                                <Link
                                  href={`/teacher/lessons/${lesson.id}`}
                                  className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-theme-primary"
                                >
                                  <FiEye className="w-4 h-4" />
                                  <span>Ver Detalhes</span>
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
                                      <span>Marcar Presença</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleQuickAttendance(lesson.id, false)
                                      }
                                      className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-yellow w-full text-left"
                                    >
                                      <FiX className="w-4 h-4" />
                                      <span>Marcar Falta</span>
                                    </button>

                                    <Link
                                      href={`/teacher/lessons/${lesson.id}/edit`}
                                      className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-theme-primary"
                                    >
                                      <FiEdit3 className="w-4 h-4" />
                                      <span>Editar</span>
                                    </Link>

                                    <button
                                      onClick={() =>
                                        handleQuickCancel(lesson.id)
                                      }
                                      className="flex items-center space-x-3 px-4 py-2 hover:bg-interactive-hover transition-colors text-accent-red w-full text-left"
                                    >
                                      <FiX className="w-4 h-4" />
                                      <span>Cancelar</span>
                                    </button>
                                  </>
                                )}
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
                            Nível: {lesson.student.level}
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
                      {(lesson.objectives.length > 0 ||
                        lesson.topics.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {lesson.objectives
                            .slice(0, 3)
                            .map((objective, index) => (
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
                              +
                              {lesson.objectives.length +
                                lesson.topics.length -
                                5}{' '}
                              mais
                            </span>
                          )}
                        </div>
                      )}

                      {/* Progress Indicators */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          {lesson.studentPresent !== undefined && (
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
                                {lesson.studentPresent ? 'Presente' : 'Faltou'}
                              </span>
                            </div>
                          )}

                          {lesson.homework && (
                            <div className="flex items-center space-x-1 text-accent-yellow">
                              <FiBookOpen className="w-4 h-4" />
                              <span>Com homework</span>
                            </div>
                          )}

                          {lesson.studentFeedback && (
                            <div className="flex items-center space-x-1 text-accent-blue">
                              <FiMessageSquare className="w-4 h-4" />
                              <span>Com feedback</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-theme-tertiary">
                          {lesson.isRecurring && '🔄 Recorrente • '}
                          Criada em {formatDate(lesson.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))
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
                    {loading.lessons ? 'Carregando...' : 'Carregar Mais'}
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
