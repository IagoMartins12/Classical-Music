// ========================================
// 5. app/hooks/useTeacherCalendar.ts - Hook específico para calendário (OPCIONAL)
// ========================================

import { useState, useCallback } from 'react';
import {
  CalendarConflict,
  CalendarEvent,
  CalendarStats,
} from '../(teacher)/teacher/calendar/pageServer';
import {
  createQuickLessonAPI,
  getTeacherCalendarAPI,
  moveLessonAPI,
} from '../requests/teacher-request';

interface UseTeacherCalendarState {
  events: CalendarEvent[];
  stats?: CalendarStats;
  conflicts?: CalendarConflict[];
  hasConflicts?: boolean;
  loading: {
    calendar: boolean;
    createLesson: boolean;
    moveLesson: boolean;
  };
  error: string | null;
}

interface UseTeacherCalendarActions {
  // Calendar data
  fetchCalendar: (
    startDate: Date,
    endDate: Date,
    view?: string,
    includeStats?: boolean,
    detectConflicts?: boolean
  ) => Promise<void>;
  refreshCalendar: (
    startDate: Date,
    endDate: Date,
    view?: string
  ) => Promise<void>;

  // Lesson management
  createQuickLesson: (data: {
    studentUserId: string;
    title: string;
    start: string;
    duration?: number;
    location?: string;
    objectives?: string[];
  }) => Promise<boolean>;

  moveLesson: (
    lessonId: string,
    newStart: string,
    newDuration?: number
  ) => Promise<boolean>;

  // Event manipulation
  updateEventInState: (
    eventId: string,
    updates: Partial<CalendarEvent>
  ) => void;
  addEventToState: (event: CalendarEvent) => void;
  removeEventFromState: (eventId: string) => void;

  // Utilities
  setInitialData: (data: {
    events: CalendarEvent[];
    stats?: CalendarStats;
    conflicts?: CalendarConflict[];
    hasConflicts?: boolean;
  }) => void;
  clearError: () => void;
}

export function useTeacherCalendar(initialData?: {
  events: CalendarEvent[];
  stats?: CalendarStats;
  conflicts?: CalendarConflict[];
  hasConflicts?: boolean;
}): UseTeacherCalendarState & UseTeacherCalendarActions {
  const [state, setState] = useState<UseTeacherCalendarState>({
    events: initialData?.events || [],
    stats: initialData?.stats,
    conflicts: initialData?.conflicts,
    hasConflicts: initialData?.hasConflicts || false,
    loading: {
      calendar: false,
      createLesson: false,
      moveLesson: false,
    },
    error: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseTeacherCalendarState['loading'], value: boolean) => {
      setState((prev) => ({
        ...prev,
        loading: {
          ...prev.loading,
          [key]: value,
        },
      }));
    },
    []
  );

  // Helper function to set error
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  // Set initial data
  const setInitialData = useCallback(
    (data: {
      events: CalendarEvent[];
      stats?: CalendarStats;
      conflicts?: CalendarConflict[];
      hasConflicts?: boolean;
    }) => {
      setState((prev) => ({
        ...prev,
        events: data.events,
        stats: data.stats,
        conflicts: data.conflicts,
        hasConflicts: data.hasConflicts || false,
      }));
    },
    []
  );

  // Fetch calendar data
  const fetchCalendar = useCallback(
    async (
      startDate: Date,
      endDate: Date,
      view: string = 'month',
      includeStats: boolean = false,
      detectConflicts: boolean = false
    ) => {
      setLoading('calendar', true);
      setError(null);

      try {
        const calendarData = await getTeacherCalendarAPI(
          startDate,
          endDate,
          view,
          includeStats,
          detectConflicts
        );

        if (!calendarData) {
          throw new Error('Erro ao carregar calendário');
        }

        setState((prev) => ({
          ...prev,
          events: calendarData.events,
          stats: calendarData.stats,
          conflicts: calendarData.conflicts,
          hasConflicts: calendarData.hasConflicts || false,
        }));
      } catch (error) {
        console.error('Erro ao buscar calendário:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('calendar', false);
      }
    },
    [setLoading, setError]
  );

  // Refresh calendar (wrapper for fetchCalendar)
  const refreshCalendar = useCallback(
    async (startDate: Date, endDate: Date, view: string = 'month') => {
      await fetchCalendar(startDate, endDate, view, true, true);
    },
    [fetchCalendar]
  );

  // Create quick lesson
  const createQuickLesson = useCallback(
    async (data: {
      studentUserId: string;
      title: string;
      start: string;
      duration?: number;
      location?: string;
      objectives?: string[];
    }): Promise<boolean> => {
      setLoading('createLesson', true);
      setError(null);

      try {
        const result = await createQuickLessonAPI(data);

        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar aula');
        }

        // Add event to local state
        if (result.event) {
          setState((prev) => ({
            ...prev,
            events: [...prev.events, result.event!],
          }));
        }

        return true;
      } catch (error) {
        console.error('Erro ao criar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('createLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Move lesson
  const moveLesson = useCallback(
    async (
      lessonId: string,
      newStart: string,
      newDuration?: number
    ): Promise<boolean> => {
      setLoading('moveLesson', true);
      setError(null);

      try {
        const result = await moveLessonAPI(lessonId, newStart, newDuration);

        if (!result.success) {
          throw new Error(result.error || 'Erro ao mover aula');
        }

        // Update event in local state
        setState((prev) => ({
          ...prev,
          events: prev.events.map((event) => {
            if (event.id === lessonId) {
              const newStartDate = new Date(newStart);
              const duration =
                newDuration ||
                (event.end.getTime() - event.start.getTime()) / (1000 * 60);

              return {
                ...event,
                start: newStartDate,
                end: new Date(newStartDate.getTime() + duration * 60000),
              };
            }
            return event;
          }),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao mover aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('moveLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Update event in state
  const updateEventInState = useCallback(
    (eventId: string, updates: Partial<CalendarEvent>) => {
      setState((prev) => ({
        ...prev,
        events: prev.events.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event
        ),
      }));
    },
    []
  );

  // Add event to state
  const addEventToState = useCallback((event: CalendarEvent) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }));
  }, []);

  // Remove event from state
  const removeEventFromState = useCallback((eventId: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((event) => event.id !== eventId),
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    fetchCalendar,
    refreshCalendar,
    createQuickLesson,
    moveLesson,
    updateEventInState,
    addEventToState,
    removeEventFromState,
    setInitialData,
    clearError,
  };
}
