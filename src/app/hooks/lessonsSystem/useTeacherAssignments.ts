// app/hooks/lessonsSystem/useTeacherAssignments.ts - Hook específico para gerenciamento de tarefas

import { useState, useCallback } from 'react';
import {
  TeacherAssignmentsData,
  TeacherAssignment,
} from '@/app/(teacher)/teacher/assignments/pageServer';

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
      const response = await fetch('/api/assignments?limit=50&offset=0');

      if (!response.ok) {
        throw new Error('Erro ao carregar tarefas');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Erro na API de tarefas');
      }

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
        console.log('🚀 [HOOK] Enviando dados para API:', assignmentData);

        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...assignmentData,
            practiceGoals:
              assignmentData.practiceGoals?.filter((g: string) => g.trim()) ||
              [],
            technicalGoals:
              assignmentData.technicalGoals?.filter((g: string) => g.trim()) ||
              [],
            musicalGoals:
              assignmentData.musicalGoals?.filter((g: string) => g.trim()) ||
              [],
            exercises:
              assignmentData.exercises?.filter((ex: string) => ex.trim()) || [],
            // 🆕 INCLUIR PEÇAS MUSICAIS
            worksIds: assignmentData.worksIds || [], // IDs das obras
            workScoreIds: assignmentData.workScoreIds || [], // IDs das partituras
            dueDate: assignmentData.dueDate
              ? new Date(assignmentData.dueDate).toISOString()
              : null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao criar tarefa');
        }

        if (!data.success) {
          throw new Error('Erro na criação da tarefa');
        }

        console.log('✅ [HOOK] Tarefa criada com sucesso:', data.assignment);

        // Add to local state
        setState((prev) => ({
          ...prev,
          assignments: [data.assignment, ...prev.assignments],
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
        console.log('🔄 [HOOK] Atualizando assignment:', assignmentId, updates);

        const response = await fetch('/api/assignments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignmentId,
            ...updates,
            // 🆕 INCLUIR PEÇAS MUSICAIS SE FORNECIDAS
            ...(updates.worksIds && { worksIds: updates.worksIds }),
            ...(updates.workScoreIds && { workScoreIds: updates.workScoreIds }),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao atualizar tarefa');
        }

        if (!data.success) {
          throw new Error('Erro na atualização da tarefa');
        }

        console.log('✅ [HOOK] Tarefa atualizada com sucesso');

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
        console.log('🗑️ [HOOK] Deletando assignment:', assignmentId);

        const response = await fetch(`/api/assignments?id=${assignmentId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao deletar tarefa');
        }

        if (!data.success) {
          throw new Error('Erro na exclusão da tarefa');
        }

        console.log('✅ [HOOK] Tarefa deletada com sucesso');

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
