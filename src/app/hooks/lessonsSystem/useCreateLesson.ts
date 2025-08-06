// app/hooks/lessonsSystem/useCreateLesson.ts - Hook para criar nova aula

import { useState, useCallback } from 'react';

interface CreateLessonData {
  studentUserId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration?: number;
  type?: string;
  location?: string;
  objectives?: string[];
  topics?: string[];
  techniques?: string[];
  homework?: string;
  teacherNotes?: string;
  publicNotes?: string;
  // Recorrência
  isRecurring?: boolean;
  recurrenceType?: string;
  recurrenceEnd?: string;
}

interface UseCreateLessonState {
  loading: {
    createLesson: boolean;
  };
  error: string | null;
  conflicts: any[];
}

interface UseCreateLessonActions {
  createLesson: (data: CreateLessonData) => Promise<boolean>;
  clearError: () => void;
  checkConflicts: (data: {
    scheduledAt: string;
    duration: number;
  }) => Promise<any[]>;
}

export function useCreateLesson(): UseCreateLessonState &
  UseCreateLessonActions {
  const [state, setState] = useState<UseCreateLessonState>({
    loading: {
      createLesson: false,
    },
    error: null,
    conflicts: [],
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseCreateLessonState['loading'], value: boolean) => {
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

  // Create lesson
  const createLesson = useCallback(
    async (data: CreateLessonData): Promise<boolean> => {
      setLoading('createLesson', true);
      setError(null);

      try {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            objectives: data.objectives?.filter((obj) => obj.trim()) || [],
            topics: data.topics?.filter((topic) => topic.trim()) || [],
            techniques: data.techniques?.filter((tech) => tech.trim()) || [],
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle conflict errors specially
          if (response.status === 409 && result.conflicts) {
            setState((prev) => ({
              ...prev,
              conflicts: result.conflicts,
            }));
            throw new Error(
              `Conflito de horário detectado com ${result.conflicts.length} aula(s)`
            );
          }

          throw new Error(result.error || `Erro ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar aula');
        }

        console.log(
          `✅ Aula${result.isRecurring ? 's' : ''} criada${
            result.isRecurring ? 's' : ''
          } com sucesso!`
        );

        return true;
      } catch (error) {
        console.error('❌ Erro ao criar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('createLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Check for schedule conflicts
  const checkConflicts = useCallback(
    async (data: { scheduledAt: string; duration: number }): Promise<any[]> => {
      try {
        const params = new URLSearchParams({
          scheduledAt: data.scheduledAt,
          duration: data.duration.toString(),
          checkOnly: 'true',
        });

        const response = await fetch(`/api/lessons/conflicts?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          return [];
        }

        const result = await response.json();
        return result.conflicts || [];
      } catch (error) {
        console.error('❌ Erro ao verificar conflitos:', error);
        return [];
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setState((prev) => ({
      ...prev,
      conflicts: [],
    }));
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    createLesson,
    checkConflicts,
    clearError,
  };
}
