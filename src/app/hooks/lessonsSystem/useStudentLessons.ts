// app/hooks/useStudentLessons.ts - Hook para gerenciar aulas do aluno

import { useState, useCallback } from 'react';

interface StudentLesson {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  status: string;
  type: string;
  location?: string;
  objectives: string[];
  homework?: string;
  publicNotes?: string;
  studentFeedback?: string;
  lessonSummary?: string;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];
  teacher: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UseStudentLessonsState {
  lessons: StudentLesson[];
  loading: {
    lessons: boolean;
    addFeedback: boolean;
  };
  error: string | null;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface UseStudentLessonsActions {
  fetchLessons: (filters?: {
    teacherId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;

  addLessonFeedback: (
    lessonId: string,
    feedback: string,
    rating?: number
  ) => Promise<boolean>;

  refreshLessons: () => Promise<void>;

  clearError: () => void;
}

export function useStudentLessons(): UseStudentLessonsState &
  UseStudentLessonsActions {
  const [state, setState] = useState<UseStudentLessonsState>({
    lessons: [],
    loading: {
      lessons: false,
      addFeedback: false,
    },
    error: null,
    pagination: {
      offset: 0,
      limit: 20,
      total: 0,
      hasMore: false,
    },
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentLessonsState['loading'], value: boolean) => {
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

  // Fetch lessons
  const fetchLessons = useCallback(
    async (
      filters: {
        teacherId?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
      } = {}
    ) => {
      setLoading('lessons', true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.teacherId) params.append('teacherId', filters.teacherId);
        if (filters.status) params.append('status', filters.status);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        params.append('limit', (filters.limit || 20).toString());
        params.append('offset', (filters.offset || 0).toString());

        const response = await fetch(`/api/lessons?${params}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao carregar aulas');
        }

        setState((prev) => ({
          ...prev,
          lessons: data.lessons,
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

  // Add lesson feedback
  const addLessonFeedback = useCallback(
    async (
      lessonId: string,
      feedback: string,
      rating?: number
    ): Promise<boolean> => {
      setLoading('addFeedback', true);
      setError(null);

      try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentFeedback: feedback,
            studentRating: rating,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao adicionar feedback');
        }

        // Update lesson in state
        setState((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, studentFeedback: feedback }
              : lesson
          ),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao adicionar feedback:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('addFeedback', false);
      }
    },
    [setLoading, setError]
  );

  // Refresh lessons (wrapper for fetchLessons)
  const refreshLessons = useCallback(async () => {
    await fetchLessons();
  }, [fetchLessons]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    fetchLessons,
    addLessonFeedback,
    refreshLessons,
    clearError,
  };
}
