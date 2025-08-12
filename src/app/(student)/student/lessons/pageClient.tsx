// app/student/lessons/pageClient.tsx - Client Component para Aulas do Aluno

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiMessageSquare,
  FiBookOpen,
  FiMapPin,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
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

export default function StudentLessonsPageClient({
  initialData,
  errorMessage,
}: StudentLessonsPageClientProps) {
  // Initialize hook with server data
  const { lessons, loading, error, fetchLessons, refreshLessons, clearError } =
    useStudentLessons();

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<LessonFilter>('scheduled'); // Mudança aqui: padrão agora é 'scheduled'
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
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

    // Ordenação: sempre das mais próximas para as mais distantes quando status é 'scheduled'
    // Para outros status ou com filtros extras, ordem decrescente
    return filtered.sort((a, b) => {
      if (statusFilter === 'scheduled') {
        // Status 'scheduled': sempre das mais próximas para as mais distantes (próxima aula primeiro)
        return (
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
      } else {
        // Outros status: das mais recentes para as mais antigas (decrescente)
        return (
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        );
      }
    });
  }, [displayLessons, searchTerm, selectedTeacher, statusFilter, timeFilter]);

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
  const getLessonStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
          label: 'Concluída',
          icon: FiCheck,
        };
      case 'CANCELLED':
        return {
          color: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
          label: 'Cancelada',
          icon: FiX,
        };
      case 'NO_SHOW':
        return {
          color:
            'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow',
          label: 'Faltou',
          icon: FiX,
        };
      case 'RESCHEDULED':
        return {
          color:
            'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
          label: 'Reagendada',
          icon: FiClock,
        };
      default:
        return {
          color: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
          label: 'Agendada',
          icon: FiCalendar,
        };
    }
  };

  // Error state para "no teachers"
  if (errorMessage === 'no_teachers') {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiUser className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Nenhum Professor Vinculado
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              Você ainda não tem professores vinculados à sua conta. Entre em
              contato com um professor para começar suas aulas.
            </p>
            <Link href="/student" className="btn-classical-primary">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state geral
  if ((error || errorMessage) && displayLessons.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiCalendar className="w-8 h-8 text-theme-primary" />
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
              Minhas Aulas
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Acompanhe seu progresso e acesse os materiais de estudo
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCalendar className="w-6 h-6 text-theme-primary" />
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
                <FiClock className="w-6 h-6 text-theme-primary" />
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
                <FiCheck className="w-6 h-6 text-theme-primary" />
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
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiX className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.cancelled}
              </div>
              <div className="text-sm text-theme-tertiary">Canceladas</div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Search and Filters */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar aulas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-classical pl-10 w-full"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-classical-secondary flex items-center space-x-2 ${
                    showFilters ? 'bg-brand-primary/10 text-brand-primary' : ''
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
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-theme-secondary grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Professor
                  </label>
                  <Select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    options={[
                      { value: 'all', label: 'Todos os professores' },
                      ...teachersOptions.map((teacher) => ({
                        value: teacher.teacherId,
                        label: teacher.teacherName,
                      })),
                    ]}
                    className="input-classical w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as LessonFilter)
                    }
                    options={[
                      { value: 'all', label: 'Todos os status' },
                      { value: 'scheduled', label: 'Agendadas' },
                      { value: 'completed', label: 'Concluídas' },
                      { value: 'cancelled', label: 'Canceladas' },
                    ]}
                    className="input-classical w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Período
                  </label>
                  <Select
                    value={timeFilter}
                    onChange={(e) =>
                      setTimeFilter(e.target.value as TimeFilter)
                    }
                    options={[
                      { value: 'all', label: 'Todos os períodos' },
                      { value: 'today', label: 'Hoje' },
                      { value: 'upcoming', label: 'Próximas' },
                      { value: 'past', label: 'Passadas' },
                      { value: 'this_week', label: 'Esta semana' },
                      { value: 'this_month', label: 'Este mês' },
                    ]}
                    className="input-classical w-full"
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
              <p className="text-theme-secondary text-sm">
                Mostrando {filteredLessons.length} de {displayLessons.length}{' '}
                aulas
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            </div>
          </AnimatedItem>
        )}

        {/* Lessons Grid */}
        <AnimatedItem direction="up" springType="gentle">
          {paginatedLessons.length === 0 ? (
            <div className="text-center py-12">
              <FiBookOpen className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-theme-primary mb-2">
                {filteredLessons.length === 0 && displayLessons.length > 0
                  ? 'Nenhuma aula encontrada'
                  : 'Nenhuma aula agendada'}
              </h3>
              <p className="text-theme-tertiary">
                {filteredLessons.length === 0 && displayLessons.length > 0
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Suas aulas aparecerão aqui quando forem agendadas pelo professor.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedLessons.map((lesson, index) => {
                const statusInfo = getLessonStatusInfo(lesson.status);
                const StatusIcon = statusInfo.icon;
                const isToday =
                  new Date(lesson.scheduledAt).toDateString() ===
                  new Date().toDateString();
                // const isPast = new Date(lesson.scheduledAt) < new Date();

                return (
                  <AnimatedCard
                    key={lesson.id}
                    hover="lift"
                    className={`classical-card p-6 relative ${
                      isToday ? 'ring-2 ring-brand-primary/30' : ''
                    }`}
                    delay={index * 0.1}
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusInfo.label}
                      </span>
                      {isToday && (
                        <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium">
                          Hoje
                        </span>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <h3 className="font-bold text-theme-primary mb-2 line-clamp-2">
                      {lesson.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-theme-secondary">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        {formatDateTime(lesson.scheduledAt)}
                      </div>

                      <div className="flex items-center text-sm text-theme-secondary">
                        <FiClock className="w-4 h-4 mr-2" />
                        {lesson.duration} minutos
                      </div>

                      <div className="flex items-center text-sm text-theme-secondary">
                        <FiUser className="w-4 h-4 mr-2" />
                        {lesson.teacher.name}
                      </div>

                      {lesson.location && (
                        <div className="flex items-center text-sm text-theme-secondary">
                          <FiMapPin className="w-4 h-4 mr-2" />
                          {lesson.location}
                        </div>
                      )}
                    </div>

                    {/* Objectives Preview */}
                    {lesson.objectives.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-theme-tertiary mb-1">
                          Objetivos:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {lesson.objectives
                            .slice(0, 2)
                            .map((objective, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-xs rounded"
                              >
                                {objective}
                              </span>
                            ))}
                          {lesson.objectives.length > 2 && (
                            <span className="text-xs text-theme-tertiary">
                              +{lesson.objectives.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Feedback Status */}
                    {lesson.status === 'COMPLETED' && (
                      <div className="mb-4">
                        {lesson.studentFeedback ? (
                          <div className="flex items-center text-sm text-accent-green">
                            <FiMessageSquare className="w-4 h-4 mr-2" />
                            Feedback enviado
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-accent-yellow">
                            <FiMessageSquare className="w-4 h-4 mr-2" />
                            Pendente feedback
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <Link
                      href={`/student/lessons/${lesson.id}`}
                      className="btn-classical-primary w-full text-center flex items-center justify-center space-x-2"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Ver Detalhes</span>
                    </Link>
                  </AnimatedCard>
                );
              })}
            </div>
          )}
        </AnimatedItem>

        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-classical-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center space-x-2">
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
                              ? 'bg-brand-primary text-theme-primary'
                              : 'text-theme-secondary hover:bg-theme-elevated'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-classical-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Próxima</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
