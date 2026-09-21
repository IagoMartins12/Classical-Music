// app/hooks/useStudentLessons.ts - Hook para gerenciar aulas do aluno

import { useState, useCallback } from 'react';
import { apiFetch } from '@/app/libs/api/client';
import { loadStudentLessons } from '@/app/requests/portal/student';

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
        const data = await loadStudentLessons({
          ...filters,
          limit: filters.limit || 20,
          offset: filters.offset || 0,
        });

        setState((prev) => ({
          ...prev,
          lessons: data.lessons.map(
            (lesson): StudentLesson => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description ?? undefined,
              scheduledAt: lesson.scheduledAt,
              duration: lesson.duration,
              status: lesson.status,
              type: lesson.type,
              location: lesson.location ?? undefined,
              objectives: lesson.objectives,
              homework: lesson.homework ?? undefined,
              publicNotes: lesson.publicNotes ?? undefined,
              studentFeedback: lesson.studentFeedback ?? undefined,
              lessonSummary: lesson.lessonSummary ?? undefined,
              skillsWorked: lesson.skillsWorked,
              improvements: lesson.improvements,
              challenges: lesson.challenges,
              teacher: {
                id: lesson.teacher.id,
                name: lesson.teacher.name,
                email: lesson.teacher.email,
                image: lesson.teacher.image ?? undefined,
              },
              createdAt: lesson.createdAt,
              // A API não devolve a data de atualização da aula.
              updatedAt: lesson.createdAt,
            })
          ),
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
      // A API guarda só o texto do feedback do aluno; nota não tem campo.
      _rating?: number
    ): Promise<boolean> => {
      setLoading('addFeedback', true);
      setError(null);

      try {
        await apiFetch(`/lessons/${lessonId}/feedback`, {
          method: 'PATCH',
          body: { feedback },
        });

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
