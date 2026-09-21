// app/hooks/useTeacherStudentDetail.ts - Hook ATUALIZADO com edição de relacionamento

import type { StudentDetailData } from '@/app/(teacher)/teacher/students/[studentId]/pageServer';
import { useState, useCallback } from 'react';
import {
  PAUSE_NOT_SUPPORTED,
  updateRelationshipRequest,
} from '@/app/requests/portal/relationship-actions';
import { loadTeacherStudentDetail } from '@/app/requests/portal/teacher';

interface UseTeacherStudentDetailState {
  studentData: StudentDetailData;
  loading: {
    updateNotes: boolean;
    toggleStatus: boolean;
    refresh: boolean;
    updateRelationship: boolean; // 🆕 NOVO
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
  updateRelationship: (updates: RelationshipUpdates) => Promise<boolean>; // 🆕 NOVO

  // Local state updates
  updateStudentDataInState: (updates: Partial<StudentDetailData>) => void;

  // Utilities
  clearError: () => void;
}

// 🆕 INTERFACE PARA ATUALIZAÇÕES DA RELAÇÃO
interface RelationshipUpdates {
  maxLessonsPerWeek?: number;
  lessonDuration?: number;
  preferredDays?: string[];
  preferredTimes?: string[];
  learningPlan?: string;
  currentFocus?: string[];
  teacherNotes?: string;
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
      updateRelationship: false, // 🆕 NOVO
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
      const studentData = await loadTeacherStudentDetail(
        state.studentData.student.id
      );

      if (!studentData) {
        throw new Error('Aluno não está mais entre os seus vínculos');
      }

      setState((prev) => ({
        ...prev,
        studentData,
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
        await updateRelationshipRequest(
          state.studentData.relationship.relationshipId,
          { teacherNotes: notes }
        );

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

    try {
      // A API não tem pausa de vínculo (fica ativo ou é encerrado).
      throw new Error(PAUSE_NOT_SUPPORTED);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading('toggleStatus', false);
    }
  }, [state.studentData.relationship, setLoading, setError]);

  // 🆕 NOVO: Update relationship configuration
  const updateRelationship = useCallback(
    async (updates: RelationshipUpdates): Promise<boolean> => {
      setLoading('updateRelationship', true);
      setError(null);

      try {
        console.log('🔄 [HOOK] Atualizando relação:', updates);

        await updateRelationshipRequest(
          state.studentData.relationship.relationshipId,
          updates
        );

        console.log('✅ [HOOK] Relação atualizada com sucesso');

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
        console.error('❌ [HOOK] Erro ao atualizar relação:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateRelationship', false);
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
    updateRelationship, // 🆕 NOVO
    updateStudentDataInState,
    clearError,
  };
}
