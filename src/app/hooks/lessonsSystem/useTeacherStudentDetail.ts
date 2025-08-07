// app/hooks/useTeacherStudentDetail.ts - Hook específico para detalhes do aluno

import { StudentDetailData } from '@/app/(teacher)/teacher/students/[studentId]/pageServer';
import { useState, useCallback } from 'react';

interface UseTeacherStudentDetailState {
  studentData: StudentDetailData;
  loading: {
    updateNotes: boolean;
    toggleStatus: boolean;
    refresh: boolean;
  };
  error: string | null;
}

interface UseTeacherStudentDetailActions {
  // Data management
  refreshStudentData: () => Promise<void>;
  setInitialData: (data: StudentDetailData) => void;

  // Student management
  updateTeacherNotes: (notes: string) => Promise<boolean>;
  toggleStudentStatus: () => Promise<boolean>;
  updateRelationship: (updates: any) => Promise<boolean>;

  // Local state updates
  updateStudentDataInState: (updates: Partial<StudentDetailData>) => void;

  // Utilities
  clearError: () => void;
}

export function useTeacherStudentDetail(
  initialData: StudentDetailData
): UseTeacherStudentDetailState & UseTeacherStudentDetailActions {
  const [state, setState] = useState<UseTeacherStudentDetailState>({
    studentData: initialData,
    loading: {
      updateNotes: false,
      toggleStatus: false,
      refresh: false,
    },
    error: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseTeacherStudentDetailState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: StudentDetailData) => {
    setState((prev) => ({
      ...prev,
      studentData: data,
    }));
  }, []);

  // Refresh student data
  const refreshStudentData = useCallback(async () => {
    setLoading('refresh', true);
    setError(null);

    try {
      const response = await fetch(
        `/api/teacher/students/${state.studentData.student.id}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do aluno');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Erro na API de detalhes do aluno');
      }

      setState((prev) => ({
        ...prev,
        studentData: data.student,
      }));
    } catch (error) {
      console.error('Erro ao atualizar dados do aluno:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('refresh', false);
    }
  }, [state.studentData.student.id, setLoading, setError]);

  // Update teacher notes
  const updateTeacherNotes = useCallback(
    async (notes: string): Promise<boolean> => {
      setLoading('updateNotes', true);
      setError(null);

      try {
        const response = await fetch('/api/teacher/students', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationshipId: state.studentData.relationship.relationshipId,
            teacherNotes: notes,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao atualizar anotações');
        }

        if (!data.success) {
          throw new Error('Erro na atualização das anotações');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          studentData: {
            ...prev.studentData,
            relationship: {
              ...prev.studentData.relationship,
              teacherNotes: notes,
            },
          },
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar anotações:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateNotes', false);
      }
    },
    [state.studentData.relationship.relationshipId, setLoading, setError]
  );

  // Toggle student status (pause/resume)
  const toggleStudentStatus = useCallback(async (): Promise<boolean> => {
    setLoading('toggleStatus', true);
    setError(null);

    const isPaused = !!state.studentData.relationship.pausedAt;

    try {
      const response = await fetch('/api/teacher/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationshipId: state.studentData.relationship.relationshipId,
          pausedAt: isPaused ? null : new Date(),
          pauseReason: isPaused ? null : 'Pausado pelo professor',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar status');
      }

      if (!data.success) {
        throw new Error('Erro na atualização do status');
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        studentData: {
          ...prev.studentData,
          relationship: {
            ...prev.studentData.relationship,
            pausedAt: isPaused ? null : new Date(),
            pauseReason: isPaused ? null : 'Pausado pelo professor',
          },
        },
      }));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading('toggleStatus', false);
    }
  }, [state.studentData.relationship, setLoading, setError]);

  // Update relationship details
  const updateRelationship = useCallback(
    async (updates: any): Promise<boolean> => {
      setLoading('updateNotes', true); // Reusing updateNotes loading state
      setError(null);

      try {
        const response = await fetch('/api/teacher/students', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationshipId: state.studentData.relationship.relationshipId,
            ...updates,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao atualizar relacionamento');
        }

        if (!data.success) {
          throw new Error('Erro na atualização do relacionamento');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          studentData: {
            ...prev.studentData,
            relationship: {
              ...prev.studentData.relationship,
              ...updates,
            },
          },
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar relacionamento:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateNotes', false);
      }
    },
    [state.studentData.relationship.relationshipId, setLoading, setError]
  );

  // Update student data in state
  const updateStudentDataInState = useCallback(
    (updates: Partial<StudentDetailData>) => {
      setState((prev) => ({
        ...prev,
        studentData: {
          ...prev.studentData,
          ...updates,
        },
      }));
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    refreshStudentData,
    setInitialData,
    updateTeacherNotes,
    toggleStudentStatus,
    updateRelationship,
    updateStudentDataInState,
    clearError,
  };
}
