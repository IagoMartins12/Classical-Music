// app/hooks/useTeacherStudents.ts - Hook específico para gestão de alunos

import { TeacherStudentsServerData } from '@/app/(main)/teacher/students/pageServer';
import {
  addStudentAPI,
  searchStudentsData,
} from '@/app/requests/teacher-request';

import { useState, useCallback } from 'react';

type StudentRelationship = TeacherStudentsServerData['students'][0];

interface SearchStudentResult {
  id: string;
  name: string;
  email: string | null;
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
  addStudent: (studentUserId: string, options?: any) => Promise<boolean>;
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
      const response = await fetch(
        '/api/teacher/students?status=all&limit=100'
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar alunos');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Erro na API de alunos');
      }

      setState((prev) => ({
        ...prev,
        students: data.students,
        summary: data.summary,
      }));
    } catch (error) {
      console.error('Erro ao atualizar alunos:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('students', false);
    }
  }, [setLoading, setError]);

  // Search students
  const searchStudents = useCallback(
    async (email: string) => {
      if (email.length < 3) {
        setState((prev) => ({ ...prev, searchResults: [] }));
        return;
      }

      setLoading('searchStudents', true);
      setError(null);

      try {
        const results = await searchStudentsData(email, 10);
        setState((prev) => ({ ...prev, searchResults: results }));
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setError(error instanceof Error ? error.message : 'Erro na busca');
      } finally {
        setLoading('searchStudents', false);
      }
    },
    [setLoading, setError]
  );

  // Add student
  const addStudent = useCallback(
    async (studentUserId: string, options: any = {}): Promise<boolean> => {
      setLoading('addStudent', true);
      setError(null);

      try {
        const result = await addStudentAPI(studentUserId, options);

        if (!result.success) {
          throw new Error(result.error || 'Erro ao adicionar aluno');
        }

        // Refresh data after adding student
        await refreshStudents();

        // Clear search results
        setState((prev) => ({ ...prev, searchResults: [] }));

        return true;
      } catch (error) {
        console.error('Erro ao adicionar aluno:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('addStudent', false);
      }
    },
    [setLoading, setError, refreshStudents]
  );

  // Update student relationship
  const updateStudentRelationship = useCallback(
    async (relationshipId: string, updates: any): Promise<boolean> => {
      setLoading('updateStudent', true);
      setError(null);

      try {
        const response = await fetch('/api/teacher/students', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ relationshipId, ...updates }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao atualizar aluno');
        }

        if (!data.success) {
          throw new Error(data.error || 'Erro na atualização');
        }

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

        return true;
      } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateStudent', false);
      }
    },
    [setLoading, setError]
  );

  // Toggle student status (pause/resume)
  const toggleStudentStatus = useCallback(
    async (relationshipId: string, isPaused: boolean): Promise<boolean> => {
      const updates = {
        pausedAt: isPaused ? null : new Date(),
        pauseReason: isPaused ? null : 'Pausado pelo professor',
      };

      return await updateStudentRelationship(relationshipId, updates);
    },
    [updateStudentRelationship]
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
    addStudent,
    updateStudentRelationship,
    toggleStudentStatus,
    updateStudentInState,
    removeStudentFromState,
    clearError,
    clearSearchResults,
  };
}
