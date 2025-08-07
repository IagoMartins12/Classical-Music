// app/hooks/useStudentCalendar.ts - Hook específico para calendário do aluno

import { StudentCalendarData } from '@/app/(student)/student/calendar/pageServer';
import { useState, useCallback } from 'react';

interface StudentCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'lesson' | 'assignment_due' | 'practice_reminder';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  teacher: {
    id: string;
    name: string;
    image?: string;
  };
  location?: string | null;
  description?: string | null;
  objectives?: string[] | null;
  homework?: string;
  publicNotes?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  details?: {
    workScoreIds?: string[] | null;
    topics?: string[];
    techniques?: string[];
    lessonSummary?: string;
    skillsWorked?: string[];
    improvements?: string[];
    challenges?: string[];
    studentProgress?: any;
    nextLessonPrep?: string;
    canProvideFeedback: boolean;
    studentFeedback?: string;
  } | null;
}

interface UseStudentCalendarState {
  calendarData: StudentCalendarData | null;
  loading: {
    calendar: boolean;
    refreshing: boolean;
    addingFeedback: boolean;
  };
  error: string | null;
}

interface UseStudentCalendarActions {
  // Calendar data
  refreshCalendar: (
    startDate: Date,
    endDate: Date,
    view?: string
  ) => Promise<void>;

  // Feedback management
  addFeedbackToLesson: (
    lessonId: string,
    feedback: string,
    rating?: number
  ) => Promise<boolean>;

  // Event manipulation
  updateEventInState: (
    eventId: string,
    updates: Partial<StudentCalendarEvent>
  ) => void;

  // Utilities
  setInitialData: (data: StudentCalendarData) => void;
  clearError: () => void;
}

export function useStudentCalendar(
  initialData?: StudentCalendarData | null
): UseStudentCalendarState & UseStudentCalendarActions {
  const [state, setState] = useState<UseStudentCalendarState>({
    calendarData: initialData || null,
    loading: {
      calendar: false,
      refreshing: false,
      addingFeedback: false,
    },
    error: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentCalendarState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: StudentCalendarData) => {
    setState((prev) => ({
      ...prev,
      calendarData: data,
    }));
  }, []);

  // Refresh calendar data
  const refreshCalendar = useCallback(
    async (startDate: Date, endDate: Date, view: string = 'month') => {
      setLoading('refreshing', true);
      setError(null);

      try {
        const params = new URLSearchParams({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          view,
          stats: 'true',
        });

        const response = await fetch(`/api/student/calendar?${params}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Calendar API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error('Calendar API returned error');
        }

        setState((prev) => ({
          ...prev,
          calendarData: {
            events: data.events,
            period: data.period,
            metadata: data.metadata,
            stats: data.stats,
            teachers: prev.calendarData?.teachers || [],
          },
        }));
      } catch (error) {
        console.error('Erro ao atualizar calendário:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('refreshing', false);
      }
    },
    [setLoading, setError]
  );

  // Add feedback to lesson
  const addFeedbackToLesson = useCallback(
    async (
      lessonId: string,
      feedback: string,
      rating?: number
    ): Promise<boolean> => {
      setLoading('addingFeedback', true);
      setError(null);

      try {
        const response = await fetch('/api/student/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lessonId,
            feedback,
            rating,
          }),
        });

        if (!response.ok) {
          throw new Error(`Feedback API error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao adicionar feedback');
        }

        // Update local state
        setState((prev) => {
          if (!prev.calendarData) return prev;

          return {
            ...prev,
            calendarData: {
              ...prev.calendarData,
              events: prev.calendarData.events.map((event) =>
                event.id === lessonId
                  ? {
                      ...event,
                      details: {
                        ...event.details,
                        studentFeedback: feedback,
                        canProvideFeedback: false,
                      },
                    }
                  : event
              ),
            },
          };
        });

        return true;
      } catch (error) {
        console.error('Erro ao adicionar feedback:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('addingFeedback', false);
      }
    },
    [setLoading, setError]
  );

  // Update event in state
  const updateEventInState = useCallback(
    (eventId: string, updates: Partial<StudentCalendarEvent>) => {
      setState((prev) => {
        if (!prev.calendarData) return prev;

        return {
          ...prev,
          calendarData: {
            ...prev.calendarData,
            events: prev.calendarData.events.map((event) =>
              event.id === eventId ? { ...event, ...updates } : event
            ),
          },
        };
      });
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    refreshCalendar,
    addFeedbackToLesson,
    updateEventInState,
    setInitialData,
    clearError,
  };
}
