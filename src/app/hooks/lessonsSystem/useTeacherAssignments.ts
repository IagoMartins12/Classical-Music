// app/hooks/lessonsSystem/useTeacherAssignments.ts - Hook específico para gerenciamento de tarefas

import { useState, useCallback } from 'react';
import type {
  TeacherAssignmentsData,
  TeacherAssignment,
} from '@/app/(teacher)/teacher/assignments/pageServer';
import {
  createAssignmentRequest,
  deleteAssignmentRequest,
  updateAssignmentRequest,
} from '@/app/requests/portal/assignment-actions';
import { legacyAssignmentRow } from '@/app/requests/portal/records';
import { loadTeacherAssignments } from '@/app/requests/portal/teacher';

interface UseTeacherAssignmentsState {
  assignments: TeacherAssignment[];
  stats: TeacherAssignmentsData['stats'];
  students: TeacherAssignmentsData['students'];
  pagination: TeacherAssignmentsData['pagination'];
  loading: {
    assignments: boolean;
    createAssignment: boolean;
    updateAssignment: boolean;
    deleteAssignment: boolean;
  };
  error: string | null;
}

interface UseTeacherAssignmentsActions {
  // Data management
  refreshAssignments: () => Promise<void>;
  setInitialData: (data: TeacherAssignmentsData) => void;

  // Assignment management
  createAssignment: (assignmentData: any) => Promise<boolean>;
  updateAssignment: (assignmentId: string, updates: any) => Promise<boolean>;
  deleteAssignment: (assignmentId: string) => Promise<boolean>;

  // Local state updates
  updateAssignmentInState: (
    assignmentId: string,
    updates: Partial<TeacherAssignment>
  ) => void;
  addAssignmentToState: (assignment: TeacherAssignment) => void;
  removeAssignmentFromState: (assignmentId: string) => void;

  // Utilities
  clearError: () => void;
}

export function useTeacherAssignments(
  initialData?: TeacherAssignmentsData
): UseTeacherAssignmentsState & UseTeacherAssignmentsActions {
  const [state, setState] = useState<UseTeacherAssignmentsState>({
    assignments: initialData?.assignments || [],
    stats: initialData?.stats || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      completionRate: 0,
      averageTime: 0,
    },
    students: initialData?.students || [],
    pagination: initialData?.pagination || {
      offset: 0,
      limit: 50,
      total: 0,
      hasMore: false,
    },
    loading: {
      assignments: false,
      createAssignment: false,
      updateAssignment: false,
      deleteAssignment: false,
    },
    error: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseTeacherAssignmentsState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: TeacherAssignmentsData) => {
    setState((prev) => ({
      ...prev,
      assignments: data.assignments,
      stats: data.stats,
      students: data.students,
      pagination: data.pagination,
    }));
  }, []);

  // Refresh assignments data
  const refreshAssignments = useCallback(async () => {
    setLoading('assignments', true);
    setError(null);

    try {
      const data = await loadTeacherAssignments(
        undefined,
        undefined,
        undefined,
        50,
        0
      );

      setState((prev) => ({
        ...prev,
        assignments: data.assignments,
        stats: data.stats,
        pagination: data.pagination,
      }));
    } catch (error) {
      console.error('Erro ao atualizar tarefas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('assignments', false);
    }
  }, [setLoading, setError]);

  // Create assignment
  const createAssignment = useCallback(
    async (assignmentData: any): Promise<boolean> => {
      setLoading('createAssignment', true);
      setError(null);

      try {
        // Na API toda tarefa pertence a uma aula (o aluno vem dela).
        if (!assignmentData.lessonId) {
          throw new Error('Escolha a aula a que a tarefa pertence');
        }

        const created = await createAssignmentRequest({
          ...assignmentData,
          practiceGoals:
            assignmentData.practiceGoals?.filter((g: string) => g.trim()) || [],
          technicalGoals:
            assignmentData.technicalGoals?.filter((g: string) => g.trim()) ||
            [],
          musicalGoals:
            assignmentData.musicalGoals?.filter((g: string) => g.trim()) || [],
          exercises:
            assignmentData.exercises?.filter((ex: string) => ex.trim()) || [],
          worksIds: assignmentData.worksIds || [],
          workScoreIds: assignmentData.workScoreIds || [],
        });

        // Add to local state
        setState((prev) => ({
          ...prev,
          assignments: [legacyAssignmentRow(created), ...prev.assignments],
          stats: {
            ...prev.stats,
            total: prev.stats.total + 1,
            pending: prev.stats.pending + 1,
          },
        }));

        return true;
      } catch (error) {
        console.error('❌ [HOOK] Erro ao criar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('createAssignment', false);
      }
    },
    [setLoading, setError]
  );

  // Update assignment
  const updateAssignment = useCallback(
    async (assignmentId: string, updates: any): Promise<boolean> => {
      setLoading('updateAssignment', true);
      setError(null);

      try {
        await updateAssignmentRequest(assignmentId, updates);

        // Update local state
        setState((prev) => ({
          ...prev,
          assignments: prev.assignments.map((assignment) =>
            assignment.id === assignmentId
              ? { ...assignment, ...updates }
              : assignment
          ),
        }));

        return true;
      } catch (error) {
        console.error('❌ [HOOK] Erro ao atualizar tarefa:', error);
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
        await deleteAssignmentRequest(assignmentId);

        // Remove from local state
        setState((prev) => ({
          ...prev,
          assignments: prev.assignments.filter(
            (assignment) => assignment.id !== assignmentId
          ),
          stats: {
            ...prev.stats,
            total: prev.stats.total - 1,
          },
        }));

        return true;
      } catch (error) {
        console.error('❌ [HOOK] Erro ao deletar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('deleteAssignment', false);
      }
    },
    [setLoading, setError]
  );

  // Update assignment in state
  const updateAssignmentInState = useCallback(
    (assignmentId: string, updates: Partial<TeacherAssignment>) => {
      setState((prev) => ({
        ...prev,
        assignments: prev.assignments.map((assignment) =>
          assignment.id === assignmentId
            ? { ...assignment, ...updates }
            : assignment
        ),
      }));
    },
    []
  );

  // Add assignment to state
  const addAssignmentToState = useCallback((assignment: TeacherAssignment) => {
    setState((prev) => ({
      ...prev,
      assignments: [assignment, ...prev.assignments],
      stats: {
        ...prev.stats,
        total: prev.stats.total + 1,
      },
    }));
  }, []);

  // Remove assignment from state
  const removeAssignmentFromState = useCallback((assignmentId: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter(
        (assignment) => assignment.id !== assignmentId
      ),
      stats: {
        ...prev.stats,
        total: prev.stats.total - 1,
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
    refreshAssignments,
    setInitialData,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    updateAssignmentInState,
    addAssignmentToState,
    removeAssignmentFromState,
    clearError,
  };
}
