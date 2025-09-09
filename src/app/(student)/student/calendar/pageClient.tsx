// app/student/calendar/pageClient.tsx - Client Component para Calendário do Aluno
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiX,
  FiRefreshCw,
  FiMapPin,
  FiBookOpen,
  FiMessageSquare,
  FiUserCheck,
  FiHome,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { StudentCalendarData } from './pageServer';
import Link from 'next/link';
import Image from 'next/image';
import Select from '@/app/components/Common/Select';
import { useStudentCalendar } from '@/app/hooks/lessonsSystem/useStudentCalendar';
import Modal from '@/app/components/Modal';
import { useTranslation } from '@/app/context/TranslationContext';

interface StudentCalendarPageClientProps {
  initialData: StudentCalendarData | null;
  errorMessage?: string;
}

type CalendarView = 'month' | 'week' | 'day';
type EventFilter = 'all' | 'scheduled' | 'completed' | 'cancelled';

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

export default function StudentCalendarPageClient({
  initialData,
  errorMessage,
}: StudentCalendarPageClientProps) {
  const { t } = useTranslation({ sections: ['student/calendar'] });

  // Initialize hook with server data
  const {
    // State do hook
    calendarData,
    loading,
    error,

    // Actions do hook
    refreshCalendar,
    addFeedbackToLesson,
    setInitialData,
    clearError,
  } = useStudentCalendar(initialData);

  // Local UI states (não relacionados aos dados do calendário)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarView>('month');
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Initialize hook data on mount
  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

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
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    await refreshCalendar(startDate, endDate, viewMode);
  }, [currentDate, viewMode, refreshCalendar]);

  // Filter events using hook data
  const filteredEvents = useMemo(() => {
    if (!calendarData) return [];

    let filtered = [...calendarData.events];

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
          default:
            return true;
        }
      });
    }

    // Filter by teacher
    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(
        (event) => event.teacher?.id === selectedTeacher
      );
    }

    return filtered;
  }, [calendarData, eventFilter, selectedTeacher]);

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
      // 6 weeks * 7 days
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
  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-green-400 text-green-400';
      case 'CANCELLED':
        return ' border-red-400 text-red-400';
      case 'NO_SHOW':
        return 'border-yellow-300 text-yellow-300';
      case 'RESCHEDULED':
        return ' border-purple-300 text-purple-300';
      default:
        return ' border-blue-300 text-blue-300';
    }
  };

  // Add feedback to lesson
  const handleAddFeedback = useCallback(async () => {
    if (!selectedEvent || !feedbackText.trim()) return;

    const success = await addFeedbackToLesson(
      selectedEvent.id,
      feedbackText.trim()
    );

    if (success) {
      setSelectedEvent((prev: any) => ({
        ...prev,
        details: {
          ...prev.details,
          studentFeedback: feedbackText.trim(),
          canProvideFeedback: false,
        },
      }));

      setShowFeedbackModal(false);
      setFeedbackText('');
      console.log('Feedback adicionado com sucesso!');
    }
  }, [selectedEvent, feedbackText, addFeedbackToLesson]);

  // Statistics for current view
  // const viewStats = useMemo(() => {
  //   if (!calendarData)
  //     return { total: 0, scheduled: 0, completed: 0, cancelled: 0, today: 0 };

  //   const now = new Date();
  //   const eventsInView = filteredEvents.filter((event) => {
  //     const eventDate = new Date(event.start);

  //     if (viewMode === 'month') {
  //       return (
  //         eventDate.getMonth() === currentDate.getMonth() &&
  //         eventDate.getFullYear() === currentDate.getFullYear()
  //       );
  //     } else if (viewMode === 'week') {
  //       const weekStart = new Date(currentDate);
  //       weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  //       const weekEnd = new Date(weekStart);
  //       weekEnd.setDate(weekStart.getDate() + 6);
  //       return eventDate >= weekStart && eventDate <= weekEnd;
  //     } else {
  //       return eventDate.toDateString() === currentDate.toDateString();
  //     }
  //   });

  //   return {
  //     total: eventsInView.length,
  //     scheduled: eventsInView.filter((e) => e.status === 'SCHEDULED').length,
  //     completed: eventsInView.filter((e) => e.status === 'COMPLETED').length,
  //     cancelled: eventsInView.filter((e) => e.status === 'CANCELLED').length,
  //     today: filteredEvents.filter(
  //       (e) => new Date(e.start).toDateString() === now.toDateString()
  //     ).length,
  //   };
  // }, [filteredEvents, viewMode, currentDate, calendarData]);

  // Render estado sem professores
  if (error === 'no_teachers' || errorMessage === 'no_teachers') {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiUserCheck className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-2xl font-bold text-theme-primary classical-title mb-4">
              {t('student_calendar_no_teacher_title')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {t('student_calendar_no_teacher_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/student"
                className="btn-classical-primary flex items-center space-x-2"
              >
                <FiHome className="w-4 h-4" />
                <span>{t('student_calendar_no_teacher_back')}</span>
              </Link>
              <Link href="/contact" className="btn-classical-secondary">
                {t('student_calendar_no_teacher_contact')}
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Render error state
  if (
    (error || errorMessage) &&
    error !== 'no_teachers' &&
    errorMessage !== 'no_teachers' &&
    !calendarData
  ) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiCalendar className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('student_calendar_error_title')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefreshCalendar}
                disabled={loading.refreshing}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${
                    loading.refreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.refreshing
                    ? t('student_calendar_error_try_again') + '...'
                    : t('student_calendar_error_try_again')}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  {t('student_calendar_error_clear')}
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
              {t('student_calendar_header_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('student_calendar_header_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Calendar Controls */}
        <AnimatedItem direction="up" springType="gentle">
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
                    disabled={loading.refreshing}
                    className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group disabled:opacity-50"
                  >
                    <FiChevronLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
                  </button>

                  <div className="text-center min-w-48">
                    <div className="text-lg font-bold text-theme-primary">
                      {viewMode === 'month' &&
                        `${
                          MONTHS[currentDate.getMonth()]
                        } ${currentDate.getFullYear()}`}
                      {viewMode === 'week' &&
                        `${t('student_calendar_week_of')} ${formatDate(
                          getWeekDays()[0]
                        )}`}
                      {viewMode === 'day' && formatDate(currentDate)}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      viewMode === 'month'
                        ? navigateMonth('next')
                        : navigateWeek('next')
                    }
                    disabled={loading.refreshing}
                    className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group disabled:opacity-50"
                  >
                    <FiChevronRight className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
                  </button>
                </div>

                <button
                  onClick={goToToday}
                  disabled={loading.refreshing}
                  className="btn-classical-secondary text-sm disabled:opacity-50"
                >
                  {t('student_calendar_today')}
                </button>
              </div>

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
                  {t('student_calendar_view_month')}
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'week'
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  {t('student_calendar_view_week')}
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'day'
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  {t('student_calendar_view_day')}
                </button>
              </div>

              {/* View Mode and Filters */}
              <div className="flex items-center space-x-4">
                {/* Teacher Filter */}
                {calendarData && calendarData.teachers.length > 1 && (
                  <Select
                    options={[
                      {
                        value: 'all',
                        label: t('student_calendar_filter_all_teachers'),
                      },
                      ...calendarData.teachers.map((teacher) => ({
                        value: teacher.id,
                        label: `Prof. ${teacher.name}`,
                      })),
                    ]}
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="input-classical-2 w-auto min-w-48"
                  />
                )}

                {/* Status Filter */}
                <Select
                  options={[
                    {
                      value: 'all',
                      label: t('student_calendar_filter_all_status'),
                    },
                    {
                      value: 'scheduled',
                      label: t('student_calendar_filter_scheduled'),
                    },
                    {
                      value: 'completed',
                      label: t('student_calendar_filter_completed'),
                    },
                    {
                      value: 'cancelled',
                      label: t('student_calendar_filter_cancelled'),
                    },
                  ]}
                  value={eventFilter}
                  onChange={(e) =>
                    setEventFilter(e.target.value as EventFilter)
                  }
                  className="input-classical-2 w-auto min-w-40"
                />

                <button
                  onClick={handleRefreshCalendar}
                  disabled={loading.refreshing}
                  className="btn-classical-secondary text-sm flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={`w-4 h-4 ${
                      loading.refreshing ? 'animate-spin' : ''
                    }`}
                  />
                  <span>{t('student_calendar_refresh')}</span>
                </button>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Calendar Content */}
        <AnimatedItem direction="up" springType="gentle" className="mt-4">
          <AnimatedCard hover="none" className="classical-card p-6">
            {viewMode === 'month' && (
              <MonthView
                days={getCalendarDays()}
                currentDate={currentDate}
                getEventsForDay={getEventsForDay}
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
                formatTime={formatTime}
                getEventStatusColor={getEventStatusColor}
                moreEventsText={t('student_calendar_more_events')}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                days={getWeekDays()}
                getEventsForDay={getEventsForDay}
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
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
                formatTime={formatTime}
                formatEventTime={formatEventTime}
                getEventStatusColor={getEventStatusColor}
                noLessonsTitle={t('student_calendar_no_lessons_today')}
                noLessonsDesc={t('student_calendar_no_lessons_today_desc')}
              />
            )}
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <StudentEventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onAddFeedback={() => {
            setShowEventModal(false);
            setShowFeedbackModal(true);
          }}
          formatTime={formatTime}
          formatDate={formatDate}
          getEventStatusColor={getEventStatusColor}
          t={t}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedEvent && (
        <FeedbackModal
          event={selectedEvent}
          feedbackText={feedbackText}
          setFeedbackText={setFeedbackText}
          onSubmit={handleAddFeedback}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackText('');
          }}
          loading={loading.addingFeedback}
          t={t}
        />
      )}
    </PageContainer>
  );
}

// Month View Component (similar to teacher but simplified)
interface MonthViewProps {
  days: Date[];
  currentDate: Date;
  getEventsForDay: (date: Date) => any[];
  onEventClick: (event: any) => void;
  formatTime: (date: Date | string) => string;
  getEventStatusColor: (status: string) => string;
  moreEventsText: string;
}

function MonthView({
  days,
  currentDate,
  getEventsForDay,
  onEventClick,
  formatTime,
  getEventStatusColor,
  moreEventsText,
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

          return (
            <div
              key={index}
              className={`min-h-24 p-2 border border-theme-secondary/50 rounded-lg transition-all hover:border-brand-primary/30 ${
                isToday
                  ? 'bg-brand-primary/5 border-brand-primary/30'
                  : isCurrentMonth
                    ? 'bg-theme-elevated/50'
                    : 'bg-theme-secondary/20 opacity-60'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? 'text-brand-primary'
                    : isCurrentMonth
                      ? 'text-theme-primary'
                      : 'text-theme-tertiary'
                }`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {events.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`w-full text-left p-1 rounded text-xs font-medium transition-all hover:scale-105 ${getEventStatusColor(
                      event.status
                    )}`}
                  >
                    <div className="truncate">
                      {formatTime(event.start)} {event.title}
                    </div>
                  </button>
                ))}

                {events.length > 2 && (
                  <div className="text-xs text-theme-tertiary">
                    {moreEventsText.replace(
                      '{count}',
                      String(events.length - 2)
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component (simplified)
interface WeekViewProps {
  days: Date[];
  getEventsForDay: (date: Date) => any[];
  onEventClick: (event: any) => void;
  formatTime: (date: Date | string) => string;
  formatEventTime: (start: Date | string, end: Date | string) => string;
  getEventStatusColor: (status: string) => string;
}

function WeekView({
  days,
  getEventsForDay,
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

          return (
            <div
              key={index}
              className={`text-center p-3 rounded-lg ${
                isToday
                  ? 'bg-brand-primary/10 border border-brand-primary/30'
                  : 'bg-theme-elevated'
              }`}
            >
              <div className="text-sm text-theme-tertiary">
                {WEEKDAYS[index]}
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
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`w-full text-left p-3 rounded-lg transition-all hover:scale-105 ${getEventStatusColor(
                    event.status
                  )}`}
                >
                  <div className="font-medium text-sm truncate">
                    {event.title}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatEventTime(event.start, event.end)}
                  </div>
                  {event.teacher && (
                    <div className="text-xs opacity-75 truncate">
                      Prof. {event.teacher.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Day View Component (simplified)
interface DayViewProps {
  date: Date;
  events: any[];
  onEventClick: (event: any) => void;
  formatTime: (date: Date | string) => string;
  formatEventTime: (start: Date | string, end: Date | string) => string;
  getEventStatusColor: (status: string) => string;
  noLessonsTitle: string;
  noLessonsDesc: string;
}

function DayView({
  date,
  events,
  onEventClick,
  formatEventTime,
  getEventStatusColor,
  noLessonsTitle,
  noLessonsDesc,
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
              {noLessonsTitle}
            </h3>
            <p className="text-theme-tertiary">{noLessonsDesc}</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`w-full text-left p-6 rounded-lg transition-all hover:scale-105 ${getEventStatusColor(
                event.status
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{event.title}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4" />
                      <span>{formatEventTime(event.start, event.end)}</span>
                    </div>

                    {event.teacher && (
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4" />
                        <span>Prof. {event.teacher.name}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.objectives && event.objectives.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <FiBookOpen className="w-4 h-4 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {event.objectives
                            .slice(0, 3)
                            .map((objective: any, index: number) => (
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
          ))
        )}
      </div>
    </div>
  );
}

// Student Event Details Modal
interface StudentEventDetailsModalProps {
  event: any;
  onClose: () => void;
  onAddFeedback: () => void;
  formatTime: (date: Date | string) => string;
  formatDate: (date: Date | string) => string;
  getEventStatusColor: (status: string) => string;
  t: (key: string, options?: any) => string;
}

function StudentEventDetailsModal({
  event,
  onClose,
  onAddFeedback,
  formatTime,
  formatDate,
  getEventStatusColor,
  t,
}: StudentEventDetailsModalProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return t('student_calendar_status_scheduled');
      case 'COMPLETED':
        return t('student_calendar_status_completed');
      case 'CANCELLED':
        return t('student_calendar_status_cancelled');
      case 'NO_SHOW':
        return t('student_calendar_status_no_show');
      case 'RESCHEDULED':
        return t('student_calendar_status_rescheduled');
      default:
        return status;
    }
  };

  return (
    <Modal isOpen onClose={onClose} maxWidth="4xl">
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
                    event.status
                  )}`}
                >
                  {getStatusText(event.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  {t('student_calendar_modal_date_time')}
                </label>
                <div className="text-theme-primary">
                  <div>{formatDate(event.start)}</div>
                  <div>
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </div>
                </div>
              </div>

              {event.teacher && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-2">
                    {t('student_calendar_modal_teacher')}
                  </label>
                  <div className="flex items-center space-x-3">
                    {event.teacher.image ? (
                      <div className="w-8 h-8 relative rounded-full overflow-hidden">
                        <Image
                          src={event.teacher.image}
                          alt={event.teacher.name}
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
                        Prof. {event.teacher.name}
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
                  {t('student_calendar_modal_location')}
                </label>
                <div className="text-theme-primary">{event.location}</div>
              </div>
            )}

            {/* Objectives */}
            {event.objectives && event.objectives.length > 0 && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  {t('student_calendar_modal_objectives')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {event.objectives.map((objective: any, index: number) => (
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

            {/* Public Notes */}
            {event.publicNotes && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  {t('student_calendar_modal_teacher_notes')}
                </label>
                <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                  <div className="text-theme-primary whitespace-pre-wrap">
                    {event.publicNotes}
                  </div>
                </div>
              </div>
            )}

            {/* Homework */}
            {event.homework && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  {t('student_calendar_modal_homework')}
                </label>
                <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                  <div className="text-theme-primary">{event.homework}</div>
                </div>
              </div>
            )}

            {/* Lesson Summary (if completed) */}
            {event.status === 'COMPLETED' && event.details?.lessonSummary && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  {t('student_calendar_modal_lesson_summary')}
                </label>
                <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                  <div className="text-theme-primary">
                    {event.details.lessonSummary}
                  </div>
                </div>
              </div>
            )}

            {/* Skills Worked */}
            {event.details?.skillsWorked &&
              event.details.skillsWorked.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-2">
                    {t('student_calendar_modal_skills_worked')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {event.details.skillsWorked.map(
                      (skill: any, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-theme-elevated text-theme-secondary rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Improvements */}
            {event.details?.improvements &&
              event.details.improvements.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-2">
                    {t('student_calendar_modal_improvements')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {event.details.improvements.map(
                      (improvement: any, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm"
                        >
                          {improvement}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Student Feedback */}
            {event.details?.studentFeedback && (
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  {t('student_calendar_modal_student_feedback')}
                </label>
                <div className="bg-theme-tertiary rounded-md p-4">
                  <div className="text-theme-primary whitespace-pre-wrap">
                    {event.details.studentFeedback}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-theme-secondary">
              <Link
                href={`/student/lessons/${event.id}`}
                className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <FiEye className="w-4 h-4" />
                <span>{t('student_calendar_modal_view_details')}</span>
              </Link>

              <div className="flex items-center space-x-3">
                {event.details?.canProvideFeedback && (
                  <button
                    onClick={onAddFeedback}
                    className="text-accent-blue hover:text-accent-purple text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    <span>{t('student_calendar_modal_add_feedback')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </Modal>
  );
}

// Feedback Modal
interface FeedbackModalProps {
  event: any;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
  t: (key: string, options?: any) => string;
}

function FeedbackModal({
  event,
  feedbackText,
  setFeedbackText,
  onSubmit,
  onClose,
  loading,
  t,
}: FeedbackModalProps) {
  return (
    <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatedCard hover="none" className="classical-card w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                {t('student_calendar_feedback_modal_title')}
              </h2>
              <p className="text-theme-tertiary text-sm">
                {t('student_calendar_feedback_modal_lesson')} {event.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4 text-theme-tertiary" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-tertiary mb-2">
                {t('student_calendar_feedback_modal_question')}
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t('student_calendar_feedback_modal_placeholder')}
                className="input-classical-2 w-full h-32 resize-none"
                maxLength={500}
              />
              <div className="text-xs text-theme-tertiary mt-1">
                {t('student_calendar_feedback_modal_characters', {
                  current: feedbackText.length,
                  max: 500,
                })}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onSubmit}
                disabled={loading || !feedbackText.trim()}
                className="btn-classical-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin"></div>
                    <span>{t('student_calendar_feedback_modal_sending')}</span>
                  </>
                ) : (
                  <>
                    <FiMessageSquare className="w-4 h-4" />
                    <span>{t('student_calendar_feedback_modal_send')}</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="btn-classical-secondary"
              >
                {t('student_calendar_feedback_modal_cancel')}
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
