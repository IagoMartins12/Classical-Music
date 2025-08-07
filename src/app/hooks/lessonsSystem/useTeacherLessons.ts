// app/hooks/useTeacherLessons.ts - Hook para gerenciar aulas do professor

import {
  LessonData,
  LessonsStats,
  TeacherLessonsData,
} from '@/app/(teacher)/teacher/lessons/pageServer';
import { useState, useCallback } from 'react';

interface UseTeacherLessonsState {
  lessons: LessonData[];
  stats: LessonsStats;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  loading: {
    lessons: boolean;
    createLesson: boolean;
    updateLesson: boolean;
    deleteLesson: boolean;
  };
  error: string | null;
}

interface UseTeacherLessonsActions {
  // Data fetching
  fetchLessons: (filters?: {
    status?: string;
    studentId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) => Promise<void>;

  refreshLessons: () => Promise<void>;
  loadMoreLessons: () => Promise<void>;

  // Lesson management
  createLesson: (data: {
    studentUserId: string;
    title: string;
    description?: string;
    scheduledAt: string;
    duration?: number;
    type?: string;
    location?: string;
    objectives?: string[];
    isRecurring?: boolean;
    recurrenceType?: string;
    recurrenceEnd?: string;
  }) => Promise<boolean>;

  updateLesson: (
    lessonId: string,
    updates: Partial<LessonData>
  ) => Promise<boolean>;

  cancelLesson: (
    lessonId: string,
    reason?: string,
    cancelSeries?: boolean
  ) => Promise<boolean>;

  markAttendance: (
    lessonId: string,
    attendance: {
      studentPresent: boolean;
      punctuality?: string;
      engagement?: number;
      preparation?: number;
    }
  ) => Promise<boolean>;

  addLessonNotes: (
    lessonId: string,
    notes: {
      teacherNotes?: string;
      publicNotes?: string;
      lessonSummary?: string;
      homework?: string;
      skillsWorked?: string[];
      improvements?: string[];
      challenges?: string[];
    }
  ) => Promise<boolean>;

  // State management
  setInitialData: (data: TeacherLessonsData) => void;
  updateLessonInState: (lessonId: string, updates: Partial<LessonData>) => void;
  addLessonToState: (lesson: LessonData) => void;
  removeLessonFromState: (lessonId: string) => void;
  clearError: () => void;
}

export function useTeacherLessons(
  initialData?: TeacherLessonsData
): UseTeacherLessonsState & UseTeacherLessonsActions {
  const [state, setState] = useState<UseTeacherLessonsState>({
    lessons: initialData?.lessons || [],
    stats: initialData?.stats || {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      averageDuration: 60,
      completionRate: 0,
    },
    pagination: initialData?.pagination || {
      offset: 0,
      limit: 20,
      total: 0,
      hasMore: false,
    },
    loading: {
      lessons: false,
      createLesson: false,
      updateLesson: false,
      deleteLesson: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseTeacherLessonsState['loading'], value: boolean) => {
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

  // Helper to set error
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  // Set initial data
  const setInitialData = useCallback((data: TeacherLessonsData) => {
    setState((prev) => ({
      ...prev,
      lessons: data.lessons,
      stats: data.stats,
      pagination: data.pagination,
    }));
  }, []);

  // Fetch lessons with filters
  const fetchLessons = useCallback(
    async (filters?: {
      status?: string;
      studentId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }) => {
      setLoading('lessons', true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters?.status) params.append('status', filters.status);
        if (filters?.studentId) params.append('studentId', filters.studentId);
        if (filters?.dateFrom)
          params.append('dateFrom', filters.dateFrom.toISOString());
        if (filters?.dateTo)
          params.append('dateTo', filters.dateTo.toISOString());
        params.append('limit', (filters?.limit || 20).toString());
        params.append('offset', (filters?.offset || 0).toString());
        params.append('includeStats', 'true');

        const response = await fetch(`/api/lessons?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar aulas');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro desconhecido');
        }

        setState((prev) => ({
          ...prev,
          lessons: filters?.offset
            ? [...prev.lessons, ...data.lessons]
            : data.lessons,
          stats: data.stats || prev.stats,
          pagination: data.pagination,
        }));
      } catch (error) {
        console.error('Erro ao buscar aulas:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('lessons', false);
      }
    },
    [setLoading, setError]
  );

  // Refresh lessons
  const refreshLessons = useCallback(async () => {
    await fetchLessons({ limit: state.pagination.limit, offset: 0 });
  }, [fetchLessons, state.pagination.limit]);

  // Load more lessons
  const loadMoreLessons = useCallback(async () => {
    if (!state.pagination.hasMore || state.loading.lessons) return;

    await fetchLessons({
      limit: state.pagination.limit,
      offset: state.pagination.offset + state.pagination.limit,
    });
  }, [fetchLessons, state.pagination, state.loading.lessons]);

  // Create lesson
  const createLesson = useCallback(
    async (data: {
      studentUserId: string;
      title: string;
      description?: string;
      scheduledAt: string;
      duration?: number;
      type?: string;
      location?: string;
      objectives?: string[];
      isRecurring?: boolean;
      recurrenceType?: string;
      recurrenceEnd?: string;
    }): Promise<boolean> => {
      setLoading('createLesson', true);
      setError(null);

      try {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Erro ao criar aula');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar aula');
        }

        // Add new lessons to state
        if (result.lessons && Array.isArray(result.lessons)) {
          setState((prev) => ({
            ...prev,
            lessons: [...result.lessons, ...prev.lessons],
            stats: {
              ...prev.stats,
              total: prev.stats.total + result.lessons.length,
              scheduled: prev.stats.scheduled + result.lessons.length,
            },
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

  // Update lesson
  const updateLesson = useCallback(
    async (
      lessonId: string,
      updates: Partial<LessonData>
    ): Promise<boolean> => {
      setLoading('updateLesson', true);
      setError(null);

      try {
        const response = await fetch('/api/lessons', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId, ...updates }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar aula');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao atualizar aula');
        }

        // Update lesson in state
        setState((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, ...updates } : lesson
          ),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Cancel lesson
  const cancelLesson = useCallback(
    async (
      lessonId: string,
      reason?: string,
      cancelSeries?: boolean
    ): Promise<boolean> => {
      setLoading('deleteLesson', true);
      setError(null);

      try {
        const params = new URLSearchParams({
          id: lessonId,
          ...(reason && { reason }),
          ...(cancelSeries && { cancelSeries: 'true' }),
        });

        const response = await fetch(`/api/lessons?${params}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao cancelar aula');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao cancelar aula');
        }

        // Update lessons in state
        setState((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, status: 'CANCELLED' as const }
              : lesson
          ),
          stats: {
            ...prev.stats,
            scheduled: Math.max(0, prev.stats.scheduled - 1),
            cancelled: prev.stats.cancelled + 1,
          },
        }));

        return true;
      } catch (error) {
        console.error('Erro ao cancelar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('deleteLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Mark attendance
  const markAttendance = useCallback(
    async (
      lessonId: string,
      attendance: {
        studentPresent: boolean;
        punctuality?: string;
        engagement?: number;
        preparation?: number;
      }
    ): Promise<boolean> => {
      return await updateLesson(lessonId, attendance);
    },
    [updateLesson]
  );

  // Add lesson notes
  const addLessonNotes = useCallback(
    async (
      lessonId: string,
      notes: {
        teacherNotes?: string;
        publicNotes?: string;
        lessonSummary?: string;
        homework?: string;
        skillsWorked?: string[];
        improvements?: string[];
        challenges?: string[];
      }
    ): Promise<boolean> => {
      return await updateLesson(lessonId, notes);
    },
    [updateLesson]
  );

  // Update lesson in state
  const updateLessonInState = useCallback(
    (lessonId: string, updates: Partial<LessonData>) => {
      setState((prev) => ({
        ...prev,
        lessons: prev.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, ...updates } : lesson
        ),
      }));
    },
    []
  );

  // Add lesson to state
  const addLessonToState = useCallback((lesson: LessonData) => {
    setState((prev) => ({
      ...prev,
      lessons: [lesson, ...prev.lessons],
      stats: {
        ...prev.stats,
        total: prev.stats.total + 1,
        scheduled: prev.stats.scheduled + 1,
      },
    }));
  }, []);

  // Remove lesson from state
  const removeLessonFromState = useCallback((lessonId: string) => {
    setState((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
      stats: {
        ...prev.stats,
        total: Math.max(0, prev.stats.total - 1),
      },
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
    fetchLessons,
    refreshLessons,
    loadMoreLessons,
    createLesson,
    updateLesson,
    cancelLesson,
    markAttendance,
    addLessonNotes,
    setInitialData,
    updateLessonInState,
    addLessonToState,
    removeLessonFromState,
    clearError,
  };
}
