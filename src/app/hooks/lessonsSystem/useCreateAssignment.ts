// app/hooks/lessonsSystem/useCreateAssignment.ts - Hook para criar nova tarefa

import { useState, useCallback } from 'react';

interface CreateAssignmentData {
  lessonId: string;
  studentUserId: string;
  title: string;
  description: string;
  type?: string;
  priority?: string;
  dueDate?: string;
  estimatedTime?: number;
  workScoreIds?: string[];
  exercises?: string[];
  practiceGoals?: string[];
  technicalGoals?: string[];
  musicalGoals?: string[];
}

interface UseCreateAssignmentState {
  loading: {
    createAssignment: boolean;
  };
  error: string | null;
}

interface UseCreateAssignmentActions {
  createAssignment: (data: CreateAssignmentData) => Promise<boolean>;
  clearError: () => void;
}

export function useCreateAssignment(): UseCreateAssignmentState &
  UseCreateAssignmentActions {
  const [state, setState] = useState<UseCreateAssignmentState>({
    loading: {
      createAssignment: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseCreateAssignmentState['loading'], value: boolean) => {
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

  // Create assignment
  const createAssignment = useCallback(
    async (data: CreateAssignmentData): Promise<boolean> => {
      setLoading('createAssignment', true);
      setError(null);

      try {
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            practiceGoals:
              data.practiceGoals?.filter((goal) => goal.trim()) || [],
            technicalGoals:
              data.technicalGoals?.filter((goal) => goal.trim()) || [],
            musicalGoals:
              data.musicalGoals?.filter((goal) => goal.trim()) || [],
            exercises: data.exercises?.filter((ex) => ex.trim()) || [],
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Erro ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar tarefa');
        }

        console.log('✅ Tarefa criada com sucesso!');

        return true;
      } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('createAssignment', false);
      }
    },
    [setLoading, setError]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    createAssignment,
    clearError,
  };
}
