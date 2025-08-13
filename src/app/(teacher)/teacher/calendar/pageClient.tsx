// app/teacher/calendar/pageClient.tsx - Client Component para Calendário do Professor com Indicativos - COMPLETO

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEdit3,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiMapPin,
  FiBookOpen,
  FiTrash2,
  FiExternalLink,
  FiAlertTriangle,
  FiInfo,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { TeacherCalendarData, CalendarEvent } from './pageServer';
import Link from 'next/link';
import Image from 'next/image';
import { useTeacherCalendar } from '@/app/hooks/useTeacherCalendar';
import Select from '@/app/components/Common/Select';
import Modal from '@/app/components/Modal';
import { useLessonDetails } from '@/app/hooks/lessonsSystem/useLessonDetails';

interface TeacherCalendarPageClientProps {
  initialData: TeacherCalendarData;
  errorMessage?: string;
}

type CalendarView = 'month' | 'week' | 'day';
type EventFilter =
  | 'all'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'needs_attention';

// Helper functions
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function TeacherCalendarPageClient({
  initialData,
  errorMessage,
}: TeacherCalendarPageClientProps) {
  // Initialize hook with server data
  const {
    // State do hook
    events,
    conflicts,
    hasConflicts,
    loading,
    error,

    // Actions do hook
    refreshCalendar,
    setInitialData,
    clearError,
  } = useTeacherCalendar(initialData);

  // Local UI states (não relacionados aos dados do calendário)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarView>('month');
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventModal, setShowEventModal] = useState(false);

  // Estados para Modal de todas as aulas do dia
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>(
    []
  );
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    lessonId: string;
    newStatus: string;
    statusLabel: string;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Initialize hook data on mount
  useEffect(() => {
    if (initialData && initialData.events.length > 0) {
      setInitialData({
        events: initialData.events,
        stats: initialData.stats,
        conflicts: initialData.conflicts,
        hasConflicts: initialData.hasConflicts,
      });
    }
  }, [initialData, setInitialData]);

  // 🆕 FUNÇÃO PARA VERIFICAR SE EVENTO PASSOU E PRECISA DE ATENÇÃO
  const getEventStatusInfo = useCallback((event: CalendarEvent) => {
    const now = new Date();
    const eventTime = new Date(event.start);
    const eventEndTime = new Date(event.end);
    const hasPassedScheduledTime = eventEndTime < now; // Verifica se já passou do horário de fim
    const needsAttention =
      hasPassedScheduledTime && event.status === 'SCHEDULED';

    return {
      hasPassedScheduledTime,
      needsAttention,
      isPast: eventEndTime < now,
      isToday: eventTime.toDateString() === now.toDateString(),
      isUpcoming: eventTime > now,
      hoursOverdue: needsAttention
        ? Math.floor(
            (now.getTime() - eventEndTime.getTime()) / (1000 * 60 * 60)
          )
        : 0,
    };
  }, []);

  // Calendar navigation
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Handle calendar refresh
  const handleRefreshCalendar = useCallback(async () => {
    const startDate = new Date(currentDate);
    startDate.setDate(1);

    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + 2);
    endDate.setDate(0);

    await refreshCalendar(startDate, endDate, viewMode);
  }, [currentDate, viewMode, refreshCalendar]);

  // Filter events using hook data
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Filter by status
    if (eventFilter !== 'all') {
      filtered = filtered.filter((event) => {
        switch (eventFilter) {
          case 'scheduled':
            return event.status === 'SCHEDULED';
          case 'completed':
            return event.status === 'COMPLETED';
          case 'cancelled':
            return event.status === 'CANCELLED';
          case 'needs_attention':
            return getEventStatusInfo(event).needsAttention;
          default:
            return true;
        }
      });
    }

    // Filter by student
    if (selectedStudent !== 'all') {
      filtered = filtered.filter(
        (event) => event.student?.id === selectedStudent
      );
    }

    return filtered;
  }, [events, eventFilter, selectedStudent, getEventStatusInfo]);

  // Opções do select com filtro para "Precisam Atenção"
  const SelectedStudentsOptions = [
    { value: 'all', label: 'Todos os alunos' },
    ...initialData.students.map((student) => ({
      label: student.name,
      value: student.id,
    })),
  ];

  const stateOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'scheduled', label: 'Agendadas' },
    { value: 'completed', label: 'Concluídas' },
    { value: 'cancelled', label: 'Canceladas' },
    { value: 'needs_attention', label: 'Precisam Atenção' },
  ];

  // Get calendar days for month view
  const getCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Get events for specific day
  const getEventsForDay = useCallback(
    (date: Date) => {
      const dateStr = date.toDateString();
      return filteredEvents.filter(
        (event) => new Date(event.start).toDateString() === dateStr
      );
    },
    [filteredEvents]
  );

  // Get week days for week view
  const getWeekDays = useCallback(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  // Handler para abrir modal com todas as aulas do dia
  const handleShowDayEvents = useCallback(
    (date: Date, events: CalendarEvent[]) => {
      setSelectedDayDate(date);
      setSelectedDayEvents(events);
      setShowDayEventsModal(true);
    },
    []
  );

  // Handler para cancelar aula rapidamente
  const handleQuickCancelLesson = useCallback(
    async (lessonId: string) => {
      if (confirm('Tem certeza que deseja cancelar esta aula?')) {
        try {
          const response = await fetch(`/api/lessons?id=${lessonId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            await handleRefreshCalendar();
            setShowDayEventsModal(false);
          } else {
            alert('Erro ao cancelar aula');
          }
        } catch (error) {
          console.error('Erro ao cancelar aula:', error);
          alert('Erro ao cancelar aula');
        }
      }
    },
    [handleRefreshCalendar]
  );

  // Format functions
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatEventTime = (start: Date | string, end: Date | string) => {
    const startTime = formatTime(start);
    const endTime = formatTime(end);
    return `${startTime} - ${endTime}`;
  };

  // Event status color
  const getEventStatusColor = (
    status: string,
    needsAttention: boolean = false
  ) => {
    if (needsAttention) {
      return ' border-red-400 text-red-400';
    }

    switch (status) {
      case 'COMPLETED':
        return 'border-green-400 text-green-400';
      case 'CANCELLED':
        return ' border-red-400 text-red-400';
      case 'NO_SHOW':
        return 'border-yellow-300 text-yellow-300';
      case 'RESCHEDULED':
        return 'border-purple-300 text-purple-300';
      default:
        return 'border-blue-300 text-blue-300';
    }
  };

  // 🆕 FUNÇÃO ATUALIZADA PARA ATUALIZAR STATUS COM CONFIRMAÇÃO
  const handleRequestStatusUpdate = useCallback(
    (lessonId: string, newStatus: string) => {
      const statusLabels: Record<string, string> = {
        COMPLETED: 'Concluída',
        NO_SHOW: 'Faltou',
        CANCELLED: 'Cancelada',
        SCHEDULED: 'Agendada',
      };

      setPendingStatusUpdate({
        lessonId,
        newStatus,
        statusLabel: statusLabels[newStatus] || newStatus,
      });
      setShowStatusUpdateModal(true);
    },
    []
  );

  // 🆕 FUNÇÃO PARA EXECUTAR A ATUALIZAÇÃO DO STATUS
  const executeStatusUpdate = useCallback(async () => {
    if (!pendingStatusUpdate) return;

    setUpdatingStatus(true);

    try {
      console.log(
        `📝 [CALENDAR] Atualizando status da aula ${pendingStatusUpdate.lessonId} para ${pendingStatusUpdate.newStatus}`
      );

      const response = await fetch(
        `/api/lessons/${pendingStatusUpdate.lessonId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: pendingStatusUpdate.newStatus,
            // Adicionar timestamps relevantes
            ...(pendingStatusUpdate.newStatus === 'COMPLETED' && {
              actualEndTime: new Date().toISOString(),
            }),
            ...(pendingStatusUpdate.newStatus === 'CANCELLED' && {
              cancelledAt: new Date().toISOString(),
              cancelledBy: 'teacher',
            }),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar status da aula');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar status da aula');
      }

      console.log(
        `✅ [CALENDAR] Status atualizado com sucesso: ${pendingStatusUpdate.newStatus}`
      );

      // Fechar modais
      setShowStatusUpdateModal(false);
      setShowEventModal(false);
      setPendingStatusUpdate(null);

      // Atualizar calendário
      await handleRefreshCalendar();
    } catch (error) {
      console.error('❌ [CALENDAR] Erro ao atualizar status:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar status da aula'
      );
    } finally {
      setUpdatingStatus(false);
    }
  }, [pendingStatusUpdate, handleRefreshCalendar]);

  // Statistics for current view
  const viewStats = useMemo(() => {
    const now = new Date();
    const eventsInView = filteredEvents.filter((event) => {
      const eventDate = new Date(event.start);

      if (viewMode === 'month') {
        return (
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (viewMode === 'week') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return eventDate >= weekStart && eventDate <= weekEnd;
      } else {
        return eventDate.toDateString() === currentDate.toDateString();
      }
    });

    return {
      total: eventsInView.length,
      scheduled: eventsInView.filter((e) => e.status === 'SCHEDULED').length,
      completed: eventsInView.filter((e) => e.status === 'COMPLETED').length,
      cancelled: eventsInView.filter((e) => e.status === 'CANCELLED').length,
      today: filteredEvents.filter(
        (e) => new Date(e.start).toDateString() === now.toDateString()
      ).length,
      needsAttention: eventsInView.filter(
        (e) => getEventStatusInfo(e).needsAttention
      ).length,
    };
  }, [filteredEvents, viewMode, currentDate, getEventStatusInfo]);

  // Render error state
  if ((error || errorMessage) && events.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiCalendar className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Calendário
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefreshCalendar}
                disabled={loading.calendar}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${
                    loading.calendar ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.calendar ? 'Carregando...' : 'Tentar Novamente'}
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
                <FiCalendar className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Calendário de Aulas
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Gerencie sua agenda e visualize suas aulas de forma organizada
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCalendar className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {viewStats.total}
              </div>
              <div className="text-sm text-theme-tertiary">
                Total no{' '}
                {viewMode === 'month'
                  ? 'Mês'
                  : viewMode === 'week'
                  ? 'Semana'
                  : 'Dia'}
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiClock className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {viewStats.scheduled}
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
                {viewStats.completed}
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
                {viewStats.cancelled}
              </div>
              <div className="text-sm text-theme-tertiary">Canceladas</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiAlertCircle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {viewStats.today}
              </div>
              <div className="text-sm text-theme-tertiary">Hoje</div>
            </AnimatedCard>

            {/* Card para aulas que precisam de atenção */}
            <AnimatedCard
              hover="scale"
              className={`classical-card p-6 text-center ${
                viewStats.needsAttention > 0 ? 'ring-2 ring-accent-red/30' : ''
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiAlertTriangle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {viewStats.needsAttention}
              </div>
              <div className="text-sm text-theme-tertiary">
                Precisam Atenção
              </div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Alerta para aulas que precisam de atenção */}
        {viewStats.needsAttention > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard
              hover="lift"
              className="classical-card p-4 mb-6 border-l-4 flex items-center justify-between !border-red-600"
            >
              <div className="flex items-center space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-accent-red" />
                <div>
                  <h4 className="font-semibold text-accent-red">
                    {viewStats.needsAttention} aula
                    {viewStats.needsAttention !== 1 ? 's' : ''} precisam de
                    atenção
                  </h4>
                  <p className="text-sm text-theme-secondary">
                    Há aulas que já passaram da data agendada mas ainda estão
                    marcadas como "Agendadas". Atualize o status para
                    "Concluída", "Cancelada" ou "Faltou".
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEventFilter('needs_attention')}
                className="btn-classical-secondary text-sm whitespace-nowrap"
              >
                Ver Todas
              </button>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Calendar Controls */}
        <AnimatedItem direction="up" className="mb-4" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      viewMode === 'month'
                        ? navigateMonth('prev')
                        : navigateWeek('prev')
                    }
                    disabled={loading.calendar}
                    className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group disabled:opacity-50"
                  >
                    <FiChevronLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
                  </button>

                  <div className="text-center px-4">
                    <div className="text-lg font-bold text-theme-primary">
                      {viewMode === 'month' &&
                        `${
                          MONTHS[currentDate.getMonth()]
                        } ${currentDate.getFullYear()}`}
                      {viewMode === 'week' &&
                        `Semana de ${formatDate(getWeekDays()[0])}`}
                      {viewMode === 'day' && formatDate(currentDate)}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      viewMode === 'month'
                        ? navigateMonth('next')
                        : navigateWeek('next')
                    }
                    disabled={loading.calendar}
                    className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group disabled:opacity-50"
                  >
                    <FiChevronRight className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
                  </button>
                </div>

                <button
                  onClick={goToToday}
                  disabled={loading.calendar}
                  className="btn-classical-secondary text-sm disabled:opacity-50"
                >
                  Hoje
                </button>

                <button
                  onClick={handleRefreshCalendar}
                  disabled={loading.calendar}
                  className="btn-classical-secondary text-sm flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={`w-4 h-4 ${
                      loading.calendar ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Atualizar</span>
                </button>
              </div>

              {/* View Mode and Filters */}
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-theme-secondary rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'month'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Mês
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'week'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'day'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Dia
                  </button>
                </div>

                {/* Student Filter */}
                <Select
                  value={selectedStudent}
                  options={SelectedStudentsOptions}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input-classical-2 w-auto min-w-48"
                />

                {/* Status Filter */}
                <Select
                  options={stateOptions}
                  value={eventFilter}
                  onChange={(e) =>
                    setEventFilter(e.target.value as EventFilter)
                  }
                  className="input-classical-2 w-auto min-w-40"
                />

                {/* Create Button */}
                <Link
                  href="/teacher/lessons/create"
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Nova Aula</span>
                </Link>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Loading State */}
        {loading.calendar && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
              <p className="text-theme-secondary">Carregando calendário...</p>
            </div>
          </AnimatedItem>
        )}

        {/* Calendar Content */}
        {!loading.calendar && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="none" className="classical-card p-6">
              {viewMode === 'month' && (
                <MonthView
                  days={getCalendarDays()}
                  currentDate={currentDate}
                  getEventsForDay={getEventsForDay}
                  getEventStatusInfo={getEventStatusInfo}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                  onShowDayEvents={handleShowDayEvents}
                  formatTime={formatTime}
                  getEventStatusColor={getEventStatusColor}
                />
              )}

              {viewMode === 'week' && (
                <WeekView
                  days={getWeekDays()}
                  getEventsForDay={getEventsForDay}
                  getEventStatusInfo={getEventStatusInfo}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                  formatTime={formatTime}
                  formatEventTime={formatEventTime}
                  getEventStatusColor={getEventStatusColor}
                />
              )}

              {viewMode === 'day' && (
                <DayView
                  date={currentDate}
                  events={getEventsForDay(currentDate)}
                  getEventStatusInfo={getEventStatusInfo}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                  formatTime={formatTime}
                  formatEventTime={formatEventTime}
                  getEventStatusColor={getEventStatusColor}
                />
              )}
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Conflicts Warning */}
        {hasConflicts && conflicts && conflicts.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 border-l-4 border-accent-red"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-accent-red/10 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="w-5 h-5 text-accent-red" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-accent-red mb-2">
                    Conflitos de Horário Detectados
                  </h3>
                  <p className="text-theme-secondary text-sm mb-4">
                    Foram encontrados {conflicts.length} conflito(s) em sua
                    agenda.
                  </p>

                  <div className="space-y-2">
                    {conflicts.slice(0, 3).map((conflict, index) => (
                      <div key={index} className="classical-card-2 p-3">
                        <div className="font-medium text-theme-primary text-sm">
                          {formatDate(conflict.date)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {conflict.conflicts.length} aulas conflitantes
                        </div>
                      </div>
                    ))}
                  </div>

                  {conflicts.length > 3 && (
                    <p className="text-xs text-theme-tertiary mt-2">
                      E mais {conflicts.length - 3} conflito(s)...
                    </p>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      {showStatusUpdateModal && pendingStatusUpdate && (
        <Modal
          isOpen
          onClose={() => setShowStatusUpdateModal(false)}
          maxWidth="md"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  pendingStatusUpdate.newStatus === 'COMPLETED'
                    ? 'bg-accent-green/10'
                    : pendingStatusUpdate.newStatus === 'NO_SHOW'
                    ? 'bg-accent-yellow/10'
                    : 'bg-accent-red/10'
                }`}
              >
                {pendingStatusUpdate.newStatus === 'COMPLETED' && (
                  <FiCheck className="w-6 h-6 text-accent-green" />
                )}
                {pendingStatusUpdate.newStatus === 'NO_SHOW' && (
                  <FiUser className="w-6 h-6 text-accent-yellow" />
                )}
                {pendingStatusUpdate.newStatus === 'CANCELLED' && (
                  <FiX className="w-6 h-6 text-accent-red" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Confirmar Atualização
                </h2>
                <p className="text-theme-secondary">
                  Alterar status da aula para "{pendingStatusUpdate.statusLabel}
                  "
                </p>
              </div>
            </div>

            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <FiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent-blue mb-1">
                    Confirmação de Status
                  </p>
                  <p className="text-theme-secondary">
                    {pendingStatusUpdate.newStatus === 'COMPLETED' &&
                      'A aula será marcada como concluída e o horário de término será registrado.'}
                    {pendingStatusUpdate.newStatus === 'NO_SHOW' &&
                      'A aula será marcada como "Falta do Aluno" e permanecerá no histórico.'}
                    {pendingStatusUpdate.newStatus === 'CANCELLED' &&
                      'A aula será marcada como cancelada e o horário de cancelamento será registrado.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowStatusUpdateModal(false)}
                className="btn-classical-secondary"
                disabled={updatingStatus}
              >
                Cancelar
              </button>
              <button
                onClick={executeStatusUpdate}
                disabled={updatingStatus}
                className={`btn-classical-primary flex items-center space-x-2 ${
                  pendingStatusUpdate.newStatus === 'CANCELLED'
                    ? 'bg-accent-red border-accent-red hover:bg-accent-red/90'
                    : pendingStatusUpdate.newStatus === 'COMPLETED'
                    ? 'bg-accent-green border-accent-green hover:bg-accent-green/90'
                    : 'bg-accent-yellow border-accent-yellow hover:bg-accent-yellow/90'
                }`}
              >
                {updatingStatus ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {pendingStatusUpdate.newStatus === 'COMPLETED' && (
                      <FiCheck className="w-4 h-4" />
                    )}
                    {pendingStatusUpdate.newStatus === 'NO_SHOW' && (
                      <FiUser className="w-4 h-4" />
                    )}
                    {pendingStatusUpdate.newStatus === 'CANCELLED' && (
                      <FiX className="w-4 h-4" />
                    )}
                  </>
                )}
                <span className="truncate">
                  {updatingStatus
                    ? 'Atualizando...'
                    : `Confirmar ${pendingStatusUpdate.statusLabel}`}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          getEventStatusInfo={getEventStatusInfo}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onUpdateStatus={handleRequestStatusUpdate}
          formatTime={formatTime}
          formatDate={formatDate}
          getEventStatusColor={getEventStatusColor}
        />
      )}

      {/* Modal de Todas as Aulas do Dia */}
      {showDayEventsModal && selectedDayDate && (
        <DayEventsModal
          date={selectedDayDate}
          events={selectedDayEvents}
          getEventStatusInfo={getEventStatusInfo}
          onClose={() => {
            setShowDayEventsModal(false);
            setSelectedDayDate(null);
            setSelectedDayEvents([]);
          }}
          onEventClick={(event) => {
            setShowDayEventsModal(false);
            setSelectedEvent(event);
            setShowEventModal(true);
          }}
          onCancelEvent={handleQuickCancelLesson}
          onUpdateStatus={handleRequestStatusUpdate}
          formatTime={formatTime}
          formatEventTime={formatEventTime}
          getEventStatusColor={getEventStatusColor}
        />
      )}
    </PageContainer>
  );
}

// Month View Component
interface MonthViewProps {
  days: Date[];
  currentDate: Date;
  getEventsForDay: (date: Date) => CalendarEvent[];
  getEventStatusInfo: (event: CalendarEvent) => any;
  onEventClick: (event: CalendarEvent) => void;
  onShowDayEvents: (date: Date, events: CalendarEvent[]) => void;
  formatTime: (date: Date | string) => string;
  getEventStatusColor: (status: string, needsAttention?: boolean) => string;
}

function MonthView({
  days,
  currentDate,
  getEventsForDay,
  getEventStatusInfo,
  onEventClick,
  onShowDayEvents,
  formatTime,
  getEventStatusColor,
}: MonthViewProps) {
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-3 text-center font-semibold text-theme-tertiary text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const isCurrentMonth = day.getMonth() === currentMonth;
          const events = getEventsForDay(day);
          const hasMoreThan3 = events.length > 3;
          const eventsNeedingAttention = events.filter(
            (event) => getEventStatusInfo(event).needsAttention
          );
          const hasAttentionEvents = eventsNeedingAttention.length > 0;

          return (
            <div
              key={index}
              className={`min-h-24 p-2 border border-theme-secondary/50 rounded-lg transition-all hover:border-brand-primary/30 ${
                isToday
                  ? 'bg-brand-primary/5 border-brand-primary/30'
                  : isCurrentMonth
                  ? 'bg-theme-elevated/50'
                  : 'bg-theme-secondary/20 opacity-60'
              } ${hasAttentionEvents ? 'ring-1 ring-accent-red/40' : ''}`}
            >
              <div
                className={`text-sm font-medium mb-1 flex items-center justify-between ${
                  isToday
                    ? 'text-brand-primary'
                    : isCurrentMonth
                    ? 'text-theme-primary'
                    : 'text-theme-tertiary'
                }`}
              >
                <span>{day.getDate()}</span>
                {hasAttentionEvents && (
                  <FiAlertTriangle className="w-3 h-3 text-accent-red" />
                )}
              </div>

              <div className="space-y-1">
                {events.slice(0, 3).map((event) => {
                  const statusInfo = getEventStatusInfo(event);
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`w-full text-left p-1 rounded text-xs font-medium transition-all hover:scale-105 relative ${getEventStatusColor(
                        event.status,
                        statusInfo.needsAttention
                      )}`}
                    >
                      {statusInfo.needsAttention && (
                        <FiAlertTriangle className="absolute -top-1 -right-1 w-2 h-2 text-accent-red" />
                      )}
                      <div className="truncate">
                        {formatTime(event.start)} {event.title}
                      </div>
                    </button>
                  );
                })}

                {hasMoreThan3 && (
                  <button
                    onClick={() => onShowDayEvents(day, events)}
                    className="w-full text-left p-1 rounded text-xs font-medium bg-theme-elevated hover:bg-brand-primary/10 text-theme-tertiary hover:text-brand-primary transition-all border border-dashed border-theme-secondary hover:border-brand-primary/30"
                  >
                    <div className="truncate">
                      +{events.length - 3} aula
                      {events.length - 3 !== 1 ? 's' : ''}
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component
interface WeekViewProps {
  days: Date[];
  getEventsForDay: (date: Date) => CalendarEvent[];
  getEventStatusInfo: (event: CalendarEvent) => any;
  onEventClick: (event: CalendarEvent) => void;
  formatTime: (date: Date | string) => string;
  formatEventTime: (start: Date | string, end: Date | string) => string;
  getEventStatusColor: (status: string, needsAttention?: boolean) => string;
}

function WeekView({
  days,
  getEventsForDay,
  getEventStatusInfo,
  onEventClick,
  formatEventTime,
  getEventStatusColor,
}: WeekViewProps) {
  const today = new Date();

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-4 mb-4">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const events = getEventsForDay(day);
          const eventsNeedingAttention = events.filter(
            (event) => getEventStatusInfo(event).needsAttention
          );
          const hasAttentionEvents = eventsNeedingAttention.length > 0;

          return (
            <div
              key={index}
              className={`text-center p-3 rounded-lg ${
                isToday
                  ? 'bg-brand-primary/10 border border-brand-primary/30'
                  : 'bg-theme-elevated'
              } ${hasAttentionEvents ? 'ring-1 ring-accent-red/40' : ''}`}
            >
              <div className="text-sm text-theme-tertiary flex items-center justify-center space-x-1">
                <span>{WEEKDAYS[index]}</span>
                {hasAttentionEvents && (
                  <FiAlertTriangle className="w-3 h-3 text-accent-red" />
                )}
              </div>
              <div
                className={`text-lg font-bold ${
                  isToday ? 'text-brand-primary' : 'text-theme-primary'
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Events */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => {
          const events = getEventsForDay(day);

          return (
            <div key={index} className="space-y-2 min-h-96">
              {events.map((event) => {
                const statusInfo = getEventStatusInfo(event);
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`w-full text-left p-3 rounded-lg transition-all hover:scale-105 relative ${getEventStatusColor(
                      event.status,
                      statusInfo.needsAttention
                    )}`}
                  >
                    {statusInfo.needsAttention && (
                      <FiAlertTriangle className="absolute -top-1 -right-1 w-3 h-3 text-accent-red" />
                    )}
                    <div className="font-medium text-sm truncate">
                      {event.title}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatEventTime(event.start, event.end)}
                    </div>
                    {event.student && (
                      <div className="text-xs opacity-75 truncate">
                        {event.student.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Day View Component
interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  getEventStatusInfo: (event: CalendarEvent) => any;
  onEventClick: (event: CalendarEvent) => void;
  formatTime: (date: Date | string) => string;
  formatEventTime: (start: Date | string, end: Date | string) => string;
  getEventStatusColor: (status: string, needsAttention?: boolean) => string;
}

function DayView({
  date,
  events,
  getEventStatusInfo,
  onEventClick,
  formatEventTime,
  getEventStatusColor,
}: DayViewProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-theme-primary">
          {date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-theme-primary mb-2">
              Nenhuma aula agendada
            </h3>
            <p className="text-theme-tertiary">
              Você não tem aulas marcadas para este dia.
            </p>
          </div>
        ) : (
          sortedEvents.map((event) => {
            const statusInfo = getEventStatusInfo(event);
            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`w-full text-left p-6 rounded-lg transition-all hover:scale-105 relative ${getEventStatusColor(
                  event.status,
                  statusInfo.needsAttention
                )}`}
              >
                {statusInfo.needsAttention && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-red rounded-full flex items-center justify-center">
                    <FiAlertTriangle className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <FiClock className="w-4 h-4" />
                        <span>{formatEventTime(event.start, event.end)}</span>
                      </div>

                      {event.student && (
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4" />
                          <span>{event.student.name}</span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {statusInfo.needsAttention && (
                        <div className="flex items-center space-x-2 text-accent-red">
                          <FiAlertTriangle className="w-4 h-4" />
                          <span className="font-medium">
                            Aula passou há {statusInfo.hoursOverdue}h - Status
                            precisa ser atualizado
                          </span>
                        </div>
                      )}

                      {event.objectives && event.objectives.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <FiBookOpen className="w-4 h-4 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {event.objectives
                              .slice(0, 3)
                              .map((objective, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-theme-elevated rounded text-xs"
                                >
                                  {objective}
                                </span>
                              ))}
                            {event.objectives.length > 3 && (
                              <span className="text-xs opacity-75">
                                +{event.objectives.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <FiEye className="w-5 h-5 opacity-50" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// Event Details Modal
interface EventDetailsModalProps {
  event: CalendarEvent;
  getEventStatusInfo: (event: CalendarEvent) => any;
  onClose: () => void;
  onUpdateStatus: (lessonId: string, newStatus: string) => void;
  formatTime: (date: Date | string) => string;
  formatDate: (date: Date | string) => string;
  getEventStatusColor: (status: string, needsAttention?: boolean) => string;
}

function EventDetailsModal({
  event,
  getEventStatusInfo,
  onClose,
  onUpdateStatus, // Agora será a função handleRequestStatusUpdate
  formatTime,
  formatDate,
  getEventStatusColor,
}: EventDetailsModalProps) {
  const statusInfo = getEventStatusInfo(event);

  return (
    <Modal isOpen onClose={onClose} maxWidth="3xl">
      <AnimatedCard hover="none">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                {event.title}
              </h2>
              <div className="flex items-center space-x-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getEventStatusColor(
                    event.status,
                    statusInfo.needsAttention
                  )}`}
                >
                  {event.status === 'SCHEDULED'
                    ? 'Agendada'
                    : event.status === 'COMPLETED'
                    ? 'Concluída'
                    : event.status === 'CANCELLED'
                    ? 'Cancelada'
                    : event.status === 'NO_SHOW'
                    ? 'Faltou'
                    : event.status === 'RESCHEDULED'
                    ? 'Reagendada'
                    : event.status}
                </span>
                {event.details?.isRecurring && (
                  <span className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm">
                    Recorrente
                  </span>
                )}
                {statusInfo.needsAttention && (
                  <span className="px-3 py-1 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-full text-sm flex items-center space-x-1">
                    <FiAlertTriangle className="w-3 h-3" />
                    <span>Precisa Atenção</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 🆕 ALERTA DE ATENÇÃO EXPANDIDO E MELHORADO */}
          {statusInfo.needsAttention && (
            <div className="mb-6 p-6 border border-red-600 rounded-lg bg-accent-red/5">
              <div className="flex flex-col items-center text-center space-y-4">
                <FiAlertTriangle className="w-12 h-12 text-accent-red" />
                <div>
                  <h4 className="font-bold text-accent-red text-lg mb-2">
                    Esta aula precisa de atenção
                  </h4>
                  <p className="text-sm text-theme-secondary mb-1">
                    A aula terminou há {statusInfo.hoursOverdue} hora
                    {statusInfo.hoursOverdue !== 1 ? 's' : ''} mas ainda está
                    marcada como "Agendada".
                  </p>
                  <p className="text-sm text-theme-secondary">
                    Atualize o status para refletir o que realmente aconteceu.
                  </p>
                </div>

                {/* 🆕 BOTÕES DE AÇÃO MELHORADOS */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={() => onUpdateStatus(event.id, 'COMPLETED')}
                    className="btn-classical-primary bg-accent-green border-accent-green hover:bg-accent-green/90 text-white flex items-center space-x-2 px-4 py-2"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Marcar como Concluída</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(event.id, 'NO_SHOW')}
                    className="btn-classical-secondary bg-accent-yellow/10 border-accent-yellow text-accent-yellow hover:bg-accent-yellow/20 flex items-center space-x-2 px-4 py-2"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Aluno Faltou</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(event.id, 'CANCELLED')}
                    className="btn-classical-secondary bg-accent-red/10 border-accent-red text-accent-red hover:bg-accent-red/20 flex items-center space-x-2 px-4 py-2"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Foi Cancelada</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Data e Hora
                </label>
                <div className="text-theme-primary">
                  <div>{formatDate(event.start)}</div>
                  <div>
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </div>
                </div>
              </div>

              {event.student && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-2">
                    Aluno
                  </label>
                  <div className="flex items-center space-x-3">
                    {event.student.image ? (
                      <div className="w-8 h-8 relative rounded-full overflow-hidden">
                        <Image
                          src={event.student.image}
                          alt={event.student.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-theme-primary" />
                      </div>
                    )}
                    <div>
                      <div className="text-theme-primary font-medium">
                        {event.student.name}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Nível: {event.student.level}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            {event.location && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Local
                </label>
                <div className="text-theme-primary">{event.location}</div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Descrição
                </label>
                <div className="text-theme-primary">{event.description}</div>
              </div>
            )}

            {/* Objectives */}
            {event.objectives && event.objectives.length > 0 && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Objetivos
                </label>
                <div className="flex flex-wrap gap-2">
                  {event.objectives.map((objective, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm"
                    >
                      {objective}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {event.details?.topics && event.details.topics.length > 0 && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Tópicos
                </label>
                <div className="flex flex-wrap gap-2">
                  {event.details.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-theme-elevated text-theme-secondary rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Homework */}
            {event.details?.homework && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Tarefa de Casa
                </label>
                <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                  <div className="text-theme-primary">
                    {event.details.homework}
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Notes */}
            {event.details?.teacherNotes && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Anotações do Professor
                </label>
                <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                  <div className="text-theme-primary whitespace-pre-wrap">
                    {event.details.teacherNotes}
                  </div>
                </div>
              </div>
            )}

            {/* 🆝 SEÇÃO DE AÇÕES RÁPIDAS PARA AULAS AGENDADAS */}
            {event.status === 'SCHEDULED' && !statusInfo.needsAttention && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-3">
                  Ações Rápidas
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onUpdateStatus(event.id, 'COMPLETED')}
                    className="btn-classical-secondary bg-accent-green/10 border-accent-green text-accent-green hover:bg-accent-green/20 flex items-center space-x-2 text-sm"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Concluir Aula</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(event.id, 'NO_SHOW')}
                    className="btn-classical-secondary bg-accent-yellow/10 border-accent-yellow text-accent-yellow hover:bg-accent-yellow/20 flex items-center space-x-2 text-sm"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Marcar Falta</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(event.id, 'CANCELLED')}
                    className="btn-classical-secondary bg-accent-red/10 border-accent-red text-accent-red hover:bg-accent-red/20 flex items-center space-x-2 text-sm"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-theme-secondary">
              <Link
                href={`/teacher/lessons/${event.id}`}
                className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <FiEye className="w-4 h-4" />
                <span>Ver Detalhes Completos</span>
              </Link>

              <div className="flex items-center space-x-3">
                {event.status === 'SCHEDULED' && (
                  <Link
                    href={`/teacher/lessons/${event.id}`}
                    className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                      statusInfo.needsAttention
                        ? 'text-accent-red hover:text-accent-red/80'
                        : 'text-accent-blue hover:text-accent-purple'
                    }`}
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>
                      {statusInfo.needsAttention
                        ? 'Atualizar Status'
                        : 'Editar'}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </Modal>
  );
}

// Modal para todas as aulas do dia
interface DayEventsModalProps {
  date: Date;
  events: CalendarEvent[];
  getEventStatusInfo: (event: CalendarEvent) => any;
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onCancelEvent: (lessonId: string) => void;
  onUpdateStatus: (lessonId: string, newStatus: string) => void;
  formatTime: (date: Date | string) => string;
  formatEventTime: (start: Date | string, end: Date | string) => string;
  getEventStatusColor: (status: string, needsAttention?: boolean) => string;
}

function DayEventsModal({
  date,
  events,
  getEventStatusInfo,
  onClose,
  onEventClick,
  onCancelEvent,
  onUpdateStatus,
  formatEventTime,
  getEventStatusColor,
}: DayEventsModalProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const eventsNeedingAttention = sortedEvents.filter(
    (event) => getEventStatusInfo(event).needsAttention
  );

  return (
    <Modal isOpen onClose={onClose} maxWidth="4xl">
      <AnimatedCard hover="none">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                Aulas do Dia
              </h2>
              <p className="text-theme-secondary">
                {date.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                • {events.length} aula{events.length !== 1 ? 's' : ''}
                {eventsNeedingAttention.length > 0 && (
                  <span className="text-accent-red">
                    {' '}
                    • {eventsNeedingAttention.length} precisam de atenção
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-theme-secondary transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4 text-theme-tertiary" />
            </button>
          </div>

          {/* Alerta geral se houver eventos precisando de atenção */}
          {eventsNeedingAttention.length > 0 && (
            <div className="mb-6 p-4 bg-accent-red/5 border border-accent-red/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-accent-red" />
                <div>
                  <h4 className="font-semibold text-accent-red">
                    {eventsNeedingAttention.length} aula
                    {eventsNeedingAttention.length !== 1 ? 's' : ''} precisam de
                    atenção
                  </h4>
                  <p className="text-sm text-theme-secondary">
                    Há aulas que já passaram da data agendada mas ainda estão
                    marcadas como "Agendadas".
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedEvents.map((event) => {
              const statusInfo = getEventStatusInfo(event);

              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border transition-all ${getEventStatusColor(
                    event.status,
                    statusInfo.needsAttention
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(
                            event.status,
                            statusInfo.needsAttention
                          )}`}
                        >
                          {event.status === 'SCHEDULED'
                            ? 'Agendada'
                            : event.status === 'COMPLETED'
                            ? 'Concluída'
                            : event.status === 'CANCELLED'
                            ? 'Cancelada'
                            : event.status}
                        </span>
                        {statusInfo.needsAttention && (
                          <span className="px-2 py-1 bg-accent-red/20 text-accent-red rounded-full text-xs flex items-center space-x-1">
                            <FiAlertTriangle className="w-3 h-3" />
                            <span>Atenção</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <FiClock className="w-4 h-4" />
                            <span>
                              {formatEventTime(event.start, event.end)}
                            </span>
                          </div>

                          {event.student && (
                            <div className="flex items-center space-x-2">
                              <FiUser className="w-4 h-4" />
                              <span>{event.student.name}</span>
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center space-x-2">
                              <FiMapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {statusInfo.needsAttention && (
                            <div className="flex items-center space-x-2 text-accent-red">
                              <FiAlertTriangle className="w-4 h-4" />
                              <span className="font-medium text-xs">
                                Passou há {statusInfo.hoursOverdue}h
                              </span>
                            </div>
                          )}
                        </div>

                        {event.objectives && event.objectives.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-theme-tertiary block mb-1">
                              Objetivos
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {event.objectives
                                .slice(0, 2)
                                .map((objective, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-theme-elevated rounded text-xs"
                                  >
                                    {objective}
                                  </span>
                                ))}
                              {event.objectives.length > 2 && (
                                <span className="text-xs opacity-75">
                                  +{event.objectives.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ações Rápidas */}
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <button
                          onClick={() => onEventClick(event)}
                          className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>Ver Detalhes</span>
                        </button>

                        {event.status === 'SCHEDULED' && (
                          <>
                            <Link
                              href={`/teacher/lessons/${event.id}`}
                              className="text-accent-blue hover:text-accent-purple text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <FiEdit3 className="w-4 h-4" />
                              <span>Editar</span>
                              <FiExternalLink className="w-3 h-3" />
                            </Link>

                            {statusInfo.needsAttention && (
                              <>
                                <button
                                  onClick={() =>
                                    onUpdateStatus(event.id, 'COMPLETED')
                                  }
                                  className="text-accent-green hover:text-accent-green/80 text-sm font-medium transition-colors flex items-center space-x-1"
                                >
                                  <FiCheck className="w-4 h-4" />
                                  <span>Concluída</span>
                                </button>

                                <button
                                  onClick={() =>
                                    onUpdateStatus(event.id, 'NO_SHOW')
                                  }
                                  className="text-accent-yellow hover:text-accent-yellow/80 text-sm font-medium transition-colors flex items-center space-x-1"
                                >
                                  <FiUser className="w-4 h-4" />
                                  <span>Faltou</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => onCancelEvent(event.id)}
                              className="text-accent-red hover:text-accent-red/80 text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              <span>Cancelar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-theme-secondary">
            <Link
              href="/teacher/lessons/create"
              className="btn-classical-primary flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nova Aula</span>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    </Modal>
  );
}
