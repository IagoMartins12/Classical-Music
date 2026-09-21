// app/hooks/useTeacherStudents.ts - Hook específico para gestão de alunos

import type { TeacherStudentsServerData } from '@/app/(teacher)/teacher/students/pageServer';
import { useState, useCallback } from 'react';
import { useToast } from '../useToast';
import {
  PAUSE_NOT_SUPPORTED,
  inviteStudentRequest,
  searchInvitableStudents,
  updateRelationshipRequest,
} from '@/app/requests/portal/relationship-actions';
import { loadTeacherStudents } from '@/app/requests/portal/teacher';

// 🆕 INTERFACE PARA O PLANO DE ESTUDOS
interface StudyPlanData {
  maxLessonsPerWeek: number;
  lessonDuration: number;
  preferredDays: string[];
  preferredTimes: string[];
  currentFocus: string[];
  learningPlan?: string;
  studyGoals?: string;
  practiceFrequency?: string;
  homeworkExpectation?: string;
  specialInstructions?: string;
  teacherNotes?: string;
}

type StudentRelationship = TeacherStudentsServerData['students'][0];

interface SearchStudentResult {
  id: string;
  name: string;
  email: string;
  image?: string;
  location?: string | null;
  experienceLevel?: string | null;
  mainInstrument?: string | null;
  studentLevel?: string | null;
  isAlreadyStudent: boolean;
  relationshipId?: string | null;
  hasStudentProfile: boolean;
}

interface UseTeacherStudentsState {
  students: StudentRelationship[];
  summary: TeacherStudentsServerData['summary'];
  loading: {
    students: boolean;
    addStudent: boolean;
    updateStudent: boolean;
    searchStudents: boolean;
  };
  error: string | null;
  searchResults: SearchStudentResult[];
}

interface UseTeacherStudentsActions {
  // Student data management
  refreshStudents: () => Promise<void>;
  setInitialData: (data: TeacherStudentsServerData) => void;

  // Student search and management
  searchStudents: (email: string) => Promise<void>;
  addStudent: (
    studentUserId: string,
    studyPlan?: StudyPlanData
  ) => Promise<boolean>; // 🔥 ATUALIZADO
  updateStudentRelationship: (
    relationshipId: string,
    updates: any
  ) => Promise<boolean>;
  toggleStudentStatus: (
    relationshipId: string,
    isPaused: boolean
  ) => Promise<boolean>;

  // Local state manipulation
  updateStudentInState: (
    relationshipId: string,
    updates: Partial<StudentRelationship>
  ) => void;
  removeStudentFromState: (relationshipId: string) => void;

  // Utilities
  clearError: () => void;
  clearSearchResults: () => void;
}

export function useTeacherStudents(
  initialData?: TeacherStudentsServerData
): UseTeacherStudentsState & UseTeacherStudentsActions {
  const toast = useToast();

  const [state, setState] = useState<UseTeacherStudentsState>({
    students: initialData?.students || [],
    summary: initialData?.summary || { total: 0, active: 0, inactive: 0 },
    loading: {
      students: false,
      addStudent: false,
      updateStudent: false,
      searchStudents: false,
    },
    error: null,
    searchResults: [],
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseTeacherStudentsState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: TeacherStudentsServerData) => {
    setState((prev) => ({
      ...prev,
      students: data.students,
      summary: data.summary,
    }));
  }, []);

  // Refresh students data
  const refreshStudents = useCallback(async () => {
    setLoading('students', true);
    setError(null);

    try {
      console.log('🔄 [useTeacherStudents] Refreshing students data...');

      const data = await loadTeacherStudents('all', 100, 0);

      setState((prev) => ({
        ...prev,
        students: data.students,
        summary: data.summary,
      }));

      console.log('✅ [useTeacherStudents] Students refreshed successfully');
    } catch (error) {
      console.error(
        '❌ [useTeacherStudents] Error refreshing students:',
        error
      );
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setError(message);
      toast.error(message);
    } finally {
      setLoading('students', false);
    }
  }, [setLoading, setError, toast]);

  // 🆕 BUSCA DE ALUNOS ATUALIZADA - usando fetch direto como no pageClient
  const searchStudents = useCallback(
    async (email: string) => {
      if (email.length < 3) {
        setState((prev) => ({ ...prev, searchResults: [] }));
        return;
      }

      setLoading('searchStudents', true);
      setError(null);

      try {
        console.log('🔍 [useTeacherStudents] Searching students:', email);

        const students = await searchInvitableStudents(email);

        setState((prev) => ({
          ...prev,
          searchResults: students,
        }));
      } catch (error) {
        console.error(
          '❌ [useTeacherStudents] Error searching students:',
          error
        );
        const message =
          error instanceof Error ? error.message : 'Erro na busca';
        setError(message);
        setState((prev) => ({ ...prev, searchResults: [] }));
      } finally {
        setLoading('searchStudents', false);
      }
    },
    [setLoading, setError]
  );

  // 🆕 ADICIONAR ALUNO ATUALIZADO - com suporte ao plano de estudos
  const addStudent = useCallback(
    async (
      studentUserId: string,
      studyPlan?: StudyPlanData
    ): Promise<boolean> => {
      setLoading('addStudent', true);
      setError(null);

      try {
        console.log('🎯 [useTeacherStudents] Adding student with plan:', {
          studentUserId,
          hasStudyPlan: !!studyPlan,
          studyPlan: studyPlan
            ? {
                maxLessonsPerWeek: studyPlan.maxLessonsPerWeek,
                lessonDuration: studyPlan.lessonDuration,
                preferredDaysCount: studyPlan.preferredDays?.length || 0,
                preferredTimesCount: studyPlan.preferredTimes?.length || 0,
                currentFocusCount: studyPlan.currentFocus?.length || 0,
              }
            : null,
        });

        // A API guarda o que tem campo (limite, duração, dias, horários,
        // foco, plano e anotações); metas e instruções extras do formulário
        // não têm onde ficar. O vínculo nasce como convite pendente.
        await inviteStudentRequest(studentUserId, {
          maxLessonsPerWeek: studyPlan?.maxLessonsPerWeek || 1,
          lessonDuration: studyPlan?.lessonDuration || 60,
          preferredDays: studyPlan?.preferredDays || [],
          preferredTimes: studyPlan?.preferredTimes || [],
          learningPlan: studyPlan?.learningPlan,
          currentFocus: studyPlan?.currentFocus || [],
          teacherNotes: studyPlan?.teacherNotes,
        });

        toast.success('Convite enviado ao aluno!');

        // Refresh data after adding student
        await refreshStudents();

        // Clear search results
        setState((prev) => ({ ...prev, searchResults: [] }));

        return true;
      } catch (error) {
        console.error('❌ [useTeacherStudents] Error adding student:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Erro ao adicionar aluno. Tente novamente.';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setLoading('addStudent', false);
      }
    },
    [setLoading, setError, refreshStudents, toast]
  );

  // Update student relationship
  const updateStudentRelationship = useCallback(
    async (relationshipId: string, updates: any): Promise<boolean> => {
      setLoading('updateStudent', true);
      setError(null);

      try {
        console.log(
          '🔧 [useTeacherStudents] Updating student relationship:',
          relationshipId
        );

        await updateRelationshipRequest(relationshipId, updates);

        // Update local state
        setState((prev) => ({
          ...prev,
          students: prev.students.map((student) =>
            student.relationshipId === relationshipId
              ? {
                  ...student,
                  relationship: { ...student.relationship, ...updates },
                }
              : student
          ),
        }));

        toast.success('Aluno atualizado com sucesso!');
        console.log(
          '✅ [useTeacherStudents] Student relationship updated successfully'
        );
        return true;
      } catch (error) {
        console.error(
          '❌ [useTeacherStudents] Error updating student relationship:',
          error
        );
        const message =
          error instanceof Error ? error.message : 'Erro desconhecido';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setLoading('updateStudent', false);
      }
    },
    [setLoading, setError, toast]
  );

  // Toggle student status (pause/resume)
  const toggleStudentStatus = useCallback(
    async (relationshipId: string, isPaused: boolean): Promise<boolean> => {
      setLoading('updateStudent', true);
      setError(null);

      try {
        console.log('🔄 [useTeacherStudents] Toggling student status:', {
          relationshipId,
          isPaused,
        });

        // A API não tem pausa de vínculo (fica ativo ou é encerrado).
        throw new Error(PAUSE_NOT_SUPPORTED);
      } catch (error) {
        console.error(
          '❌ [useTeacherStudents] Error toggling student status:',
          error
        );
        const message =
          error instanceof Error
            ? error.message
            : 'Erro ao alterar status do aluno';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setLoading('updateStudent', false);
      }
    },
    [setLoading, setError, refreshStudents, toast]
  );

  // Update student in state
  const updateStudentInState = useCallback(
    (relationshipId: string, updates: Partial<StudentRelationship>) => {
      setState((prev) => ({
        ...prev,
        students: prev.students.map((student) =>
          student.relationshipId === relationshipId
            ? { ...student, ...updates }
            : student
        ),
      }));
    },
    []
  );

  // Remove student from state
  const removeStudentFromState = useCallback((relationshipId: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter(
        (student) => student.relationshipId !== relationshipId
      ),
      summary: {
        ...prev.summary,
        total: prev.summary.total - 1,
      },
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setState((prev) => ({ ...prev, searchResults: [] }));
  }, []);

  return {
    // State
    ...state,

    // Actions
    refreshStudents,
    setInitialData,
    searchStudents,
    addStudent, // 🔥 Agora com suporte ao StudyPlanData
    updateStudentRelationship,
    toggleStudentStatus,
    updateStudentInState,
    removeStudentFromState,
    clearError,
    clearSearchResults,
  };
}
