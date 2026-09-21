// app/hooks/lessonsSystem/useAssignmentDetails.ts - Hook para gerenciar detalhes da tarefa

import { useState, useCallback } from 'react';
import {
  giveAssignmentFeedback,
  updateAssignmentRequest,
} from '@/app/requests/portal/assignment-actions';

interface AssignmentData {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  dueDate?: Date | null;
  estimatedTime?: number | null;
  actualTime?: number | null;
  isOverdue: boolean;
  isCompleted: boolean;
  completedAt?: Date | null;
  progress?: number | null;
  teacherFeedback?: string | null;
  teacherRating?: number | null;
  studentNotes?: string | null;
  studentRating?: number | null;
  submissions?: any;
  submissionDate?: Date | null;
  student: {
    id: string;
    name: string;
    image?: string | null;
  };
  lesson: {
    id: string;
    title: string;
    scheduledAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UseAssignmentDetailsState {
  assignment: AssignmentData | null;
  loading: {
    updateFeedback: boolean;
    approve: boolean;
    update: boolean;
  };
  error: string | null;
}

interface UseAssignmentDetailsActions {
  updateAssignmentFeedback: (
    assignmentId: string,
    feedback: {
      teacherFeedback?: string;
      teacherRating?: number;
    }
  ) => Promise<boolean>;

  approveAssignment: (
    assignmentId: string,
    approvalData: {
      teacherFeedback?: string;
      teacherRating?: number;
    }
  ) => Promise<boolean>;

  updateAssignmentStatus: (
    assignmentId: string,
    updates: any
  ) => Promise<boolean>;

  setAssignment: (assignment: AssignmentData) => void;
  clearError: () => void;
}

export function useAssignmentDetails(
  initialAssignment?: AssignmentData | null
): UseAssignmentDetailsState & UseAssignmentDetailsActions {
  const [state, setState] = useState<UseAssignmentDetailsState>({
    assignment: initialAssignment || null,
    loading: {
      updateFeedback: false,
      approve: false,
      update: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseAssignmentDetailsState['loading'], value: boolean) => {
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

  // Set assignment
  const setAssignment = useCallback((assignment: AssignmentData) => {
    setState((prev) => ({
      ...prev,
      assignment,
    }));
  }, []);

  // Update assignment feedback
  const updateAssignmentFeedback = useCallback(
    async (
      assignmentId: string,
      feedback: {
        teacherFeedback?: string;
        teacherRating?: number;
      }
    ): Promise<boolean> => {
      setLoading('updateFeedback', true);
      setError(null);

      try {
        await giveAssignmentFeedback(assignmentId, feedback);

        // Update assignment in state
        setState((prev) => ({
          ...prev,
          assignment: prev.assignment
            ? {
                ...prev.assignment,
                ...feedback,
              }
            : null,
        }));

        console.log('✅ Feedback atualizado com sucesso!');

        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar feedback:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateFeedback', false);
      }
    },
    [setLoading, setError]
  );

  // Approve assignment
  const approveAssignment = useCallback(
    async (
      assignmentId: string,
      approvalData: {
        teacherFeedback?: string;
        teacherRating?: number;
      }
    ): Promise<boolean> => {
      setLoading('approve', true);
      setError(null);

      try {
        // Na API quem conclui a tarefa é o aluno; a aprovação do professor é
        // o feedback com a nota, que também avisa o aluno.
        await giveAssignmentFeedback(assignmentId, approvalData);

        setState((prev) => ({
          ...prev,
          assignment: prev.assignment
            ? { ...prev.assignment, ...approvalData }
            : null,
        }));

        console.log('✅ Tarefa aprovada com sucesso!');

        return true;
      } catch (error) {
        console.error('❌ Erro ao aprovar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('approve', false);
      }
    },
    [setLoading, setError]
  );

  // Update assignment status
  const updateAssignmentStatus = useCallback(
    async (assignmentId: string, updates: any): Promise<boolean> => {
      setLoading('update', true);
      setError(null);

      try {
        await updateAssignmentRequest(assignmentId, updates);

        // Update assignment in state
        setState((prev) => ({
          ...prev,
          assignment: prev.assignment
            ? {
                ...prev.assignment,
                ...updates,
              }
            : null,
        }));

        console.log('✅ Tarefa atualizada com sucesso!');

        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('update', false);
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
    updateAssignmentFeedback,
    approveAssignment,
    updateAssignmentStatus,
    setAssignment,
    clearError,
  };
}
