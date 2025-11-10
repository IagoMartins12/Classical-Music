// app/blog/calendar/components/CustomCalendar.tsx
'use client';

import { useState, useMemo } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import WeekView from '../WeekView';
import MonthView from '../MonthView';
import DayView from '../DayView';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  isFree: boolean;
  composers: any[];
}

interface CustomCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateChange?: (start: Date, end: Date) => void;
}

type ViewType = 'month' | 'week' | 'day';

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

export default function CustomCalendar({
  events,
  onEventClick,
  onDateChange,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');

  // Navegação
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
    notifyDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    notifyDateChange(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    notifyDateChange(today);
  };

  const notifyDateChange = (date: Date) => {
    if (!onDateChange) return;

    let start: Date, end: Date;

    if (view === 'month') {
      start = new Date(date.getFullYear(), date.getMonth(), 1);
      end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } else if (view === 'week') {
      const day = date.getDay();
      start = new Date(date);
      start.setDate(date.getDate() - day);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(date);
      end = new Date(date);
    }

    onDateChange(start, end);
  };

  // Get calendar days for month view
  const getCalendarDays = () => {
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
  };

  // Get week days for week view
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Get events for specific day
  const getEventsForDay = (date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(
      (event) => new Date(event.start).toDateString() === dateStr
    );
  };

  // Título do calendário
  const calendarTitle = useMemo(() => {
    if (view === 'month') {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      const weekDays = getWeekDays();
      return `Semana de ${weekDays[0].toLocaleDateString('pt-BR')}`;
    } else {
      return currentDate.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }, [currentDate, view]);

  return (
    <div className="classical-card">
      {/* Header */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Navegação */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevious}
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <BiChevronLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </button>

              <div className="text-center min-w-48">
                <div className="text-lg font-bold text-theme-primary">
                  {calendarTitle}
                </div>
              </div>

              <button
                onClick={goToNext}
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <BiChevronRight className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="btn-classical-secondary text-sm"
            >
              Hoje
            </button>
          </div>

          {/* Botões de Visualização */}
          <div className="flex bg-theme-secondary rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'month'
                  ? 'bg-theme-tertiary text-theme-primary shadow-md'
                  : 'text-theme-tertiary hover:text-theme-primary'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'week'
                  ? 'bg-theme-tertiary text-theme-primary shadow-md'
                  : 'text-theme-tertiary hover:text-theme-primary'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'day'
                  ? 'bg-theme-tertiary text-theme-primary shadow-md'
                  : 'text-theme-tertiary hover:text-theme-primary'
              }`}
            >
              Dia
            </button>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="p-6">
        {view === 'month' && (
          <MonthView
            days={getCalendarDays()}
            currentDate={currentDate}
            getEventsForDay={getEventsForDay}
            onEventClick={onEventClick}
            weekdays={WEEKDAYS}
          />
        )}
        {view === 'week' && (
          <WeekView
            days={getWeekDays()}
            getEventsForDay={getEventsForDay}
            onEventClick={onEventClick}
            weekdays={WEEKDAYS}
          />
        )}
        {view === 'day' && (
          <DayView
            date={currentDate}
            events={getEventsForDay(currentDate)}
            onEventClick={onEventClick}
          />
        )}
      </div>
    </div>
  );
}
