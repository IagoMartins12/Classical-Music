// app/hooks/lessonsSystem/useStudentAssignments.ts - Hook para gerenciar tarefas do aluno

import { StudentAssignmentsData } from '@/app/(student)/student/assignments/pageServer';
import { useState, useCallback } from 'react';

interface UseStudentAssignmentsState {
  assignments: StudentAssignmentsData['assignments'];
  stats: StudentAssignmentsData['stats'];
  pagination: StudentAssignmentsData['pagination'];
  loading: {
    assignments: boolean;
    updateAssignment: boolean;
    loadMore: boolean;
  };
  error: string | null;
}

interface UseStudentAssignmentsActions {
  setInitialData: (data: StudentAssignmentsData) => void;
  refreshAssignments: () => Promise<void>;
  loadMoreAssignments: () => Promise<void>;
  updateAssignment: (assignmentId: string, updates: any) => Promise<boolean>;
  completeAssignment: (
    assignmentId: string,
    notes?: string,
    rating?: number
  ) => Promise<boolean>;
  addSubmission: (assignmentId: string, submissions: any) => Promise<boolean>;
  updateProgress: (
    assignmentId: string,
    progress: number,
    actualTime?: number
  ) => Promise<boolean>;
  // 🆕 Função específica para atualizar progressMilestones
  updateProgressMilestones: (
    assignmentId: string,
    progressMilestones: any,
    progress?: number
  ) => Promise<boolean>;
  clearError: () => void;
}

export function useStudentAssignments(
  initialData?: StudentAssignmentsData | null
): UseStudentAssignmentsState & UseStudentAssignmentsActions {
  const [state, setState] = useState<UseStudentAssignmentsState>({
    assignments: initialData?.assignments || [],
    stats: initialData?.stats || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    },
    pagination: initialData?.pagination || {
      offset: 0,
      limit: 50,
      total: 0,
      hasMore: false,
    },
    loading: {
      assignments: false,
      updateAssignment: false,
      loadMore: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentAssignmentsState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: StudentAssignmentsData) => {
    setState((prev) => ({
      ...prev,
      assignments: data.assignments,
      stats: data.stats,
      pagination: data.pagination,
    }));
  }, []);

  // Refresh assignments
  const refreshAssignments = useCallback(async () => {
    setLoading('assignments', true);
    setError(null);

    try {
      const response = await fetch('/api/assignments?limit=50&offset=0');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar assignments');
      }

      setState((prev) => ({
        ...prev,
        assignments: data.assignments,
        stats: data.stats,
        pagination: data.pagination,
      }));

      console.log('✅ Assignments atualizados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar assignments:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('assignments', false);
    }
  }, [setLoading, setError]);

  // Load more assignments (pagination)
  const loadMoreAssignments = useCallback(async () => {
    if (!state.pagination.hasMore) return;

    setLoading('loadMore', true);
    setError(null);

    try {
      const nextOffset = state.pagination.offset + state.pagination.limit;
      const response = await fetch(
        `/api/assignments?limit=${state.pagination.limit}&offset=${nextOffset}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar mais assignments');
      }

      setState((prev) => ({
        ...prev,
        assignments: [...prev.assignments, ...data.assignments],
        pagination: data.pagination,
      }));

      console.log('✅ Mais assignments carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar mais assignments:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('loadMore', false);
    }
  }, [state.pagination, setLoading, setError]);

  // Update assignment (função principal)
  const updateAssignment = useCallback(
    async (assignmentId: string, updates: any): Promise<boolean> => {
      setLoading('updateAssignment', true);
      setError(null);

      try {
        console.log(
          `📋 [UPDATE-ASSIGNMENT] Updating assignment ${assignmentId}`,
          {
            fields: Object.keys(updates),
            hasProgressMilestones: !!updates.progressMilestones,
          }
        );

        const response = await fetch('/api/assignments', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignmentId,
            ...updates,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Erro ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar assignment');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          assignments: prev.assignments.map((assignment) =>
            assignment.id === assignmentId
              ? { ...assignment, ...data.assignment }
              : assignment
          ),
        }));

        console.log('✅ Assignment atualizado com sucesso!');
        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar assignment:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateAssignment', false);
      }
    },
    [setLoading, setError]
  );

  // 🆕 Update progress milestones (função específica)
  const updateProgressMilestones = useCallback(
    async (
      assignmentId: string,
      progressMilestones: any,
      progress?: number
    ): Promise<boolean> => {
      console.log(
        `📊 [UPDATE-PROGRESS-MILESTONES] Updating milestones for assignment ${assignmentId}`,
        {
          milestones: progressMilestones,
          progress,
        }
      );

      return updateAssignment(assignmentId, {
        progressMilestones,
        progress,
        // Automaticamente determinar status baseado no progresso
        status: progress
          ? progress >= 100
            ? 'COMPLETED'
            : progress > 0
            ? 'IN_PROGRESS'
            : 'PENDING'
          : undefined,
        // Se completou 100%, marcar como concluído
        isCompleted: progress ?? 0 >= 100,
        completedAt:
          progress ?? 0 >= 100 ? new Date().toISOString() : undefined,
      });
    },
    [updateAssignment]
  );

  // Complete assignment
  const completeAssignment = useCallback(
    async (
      assignmentId: string,
      notes?: string,
      rating?: number
    ): Promise<boolean> => {
      return updateAssignment(assignmentId, {
        isCompleted: true,
        status: 'COMPLETED',
        studentNotes: notes,
        studentRating: rating,
        completedAt: new Date().toISOString(),
        submissionDate: new Date().toISOString(),
        progress: 100, // Marca como 100% completo
        // Marcar todos os progressMilestones como completos
        progressMilestones: {
          learnedLeftHand: true,
          learnedRightHand: true,
          playedWithMetronome: true,
          memorized: true,
          playedAtTempo: true,
          masteredDynamics: true,
          performedForOthers: true,
        },
      });
    },
    [updateAssignment]
  );

  // Add submission
  const addSubmission = useCallback(
    async (assignmentId: string, submissions: any): Promise<boolean> => {
      return updateAssignment(assignmentId, {
        submissions,
        submissionDate: new Date().toISOString(),
        status: 'COMPLETED', // Assume completed when submitting
      });
    },
    [updateAssignment]
  );

  // Update progress
  const updateProgress = useCallback(
    async (
      assignmentId: string,
      progress: number,
      actualTime?: number
    ): Promise<boolean> => {
      const updates: any = {
        progress,
        status:
          progress >= 100
            ? 'COMPLETED'
            : progress > 0
            ? 'IN_PROGRESS'
            : 'PENDING',
      };

      if (actualTime !== undefined) {
        updates.actualTime = actualTime;
      }

      if (progress >= 100) {
        updates.isCompleted = true;
        updates.completedAt = new Date().toISOString();
      }

      return updateAssignment(assignmentId, updates);
    },
    [updateAssignment]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    setInitialData,
    refreshAssignments,
    loadMoreAssignments,
    updateAssignment,
    completeAssignment,
    addSubmission,
    updateProgress,
    updateProgressMilestones, // 🆕 Nova função
    clearError,
  };
}
