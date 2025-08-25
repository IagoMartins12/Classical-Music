// app/hooks/lessonsSystem/useEditAssignment.ts - Hook para editar tarefa existente

import { useState, useCallback } from 'react';

interface EditAssignmentData {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  dueDate?: string | null;
  estimatedTime?: number;
  workScoreIds?: string[];
  exercises?: string[];
  practiceGoals?: string[];
  technicalGoals?: string[];
  musicalGoals?: string[];
  tempoTargets?: any;
}

interface UseEditAssignmentState {
  loading: {
    updateAssignment: boolean;
    deleteAssignment: boolean;
  };
  error: string | null;
}

interface UseEditAssignmentActions {
  updateAssignment: (
    assignmentId: string,
    data: EditAssignmentData
  ) => Promise<boolean>;
  deleteAssignment: (assignmentId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useEditAssignment(): UseEditAssignmentState &
  UseEditAssignmentActions {
  const [state, setState] = useState<UseEditAssignmentState>({
    loading: {
      updateAssignment: false,
      deleteAssignment: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseEditAssignmentState['loading'], value: boolean) => {
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

  // Update assignment
  const updateAssignment = useCallback(
    async (
      assignmentId: string,
      data: EditAssignmentData
    ): Promise<boolean> => {
      setLoading('updateAssignment', true);
      setError(null);

      try {
        const response = await fetch(`/api/assignments/${assignmentId}`, {
          method: 'PUT',
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
          throw new Error(result.error || 'Erro ao atualizar tarefa');
        }

        console.log('✅ Tarefa atualizada com sucesso!');
        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateAssignment', false);
      }
    },
    [setLoading, setError]
  );

  // Delete assignment
  const deleteAssignment = useCallback(
    async (assignmentId: string): Promise<boolean> => {
      setLoading('deleteAssignment', true);
      setError(null);

      try {
        const response = await fetch(`/api/assignments?id=${assignmentId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Erro ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.error || 'Erro ao deletar tarefa');
        }

        return true;
      } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('deleteAssignment', false);
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
    updateAssignment,
    deleteAssignment,
    clearError,
  };
}
