// app/hooks/useTeacher.ts - Hook atualizado para usar APIs client-side

import { useState, useCallback } from 'react';
import { addStudentAPI, searchStudentsAPI } from '../requests/teacher-request';

// ====================================
// INTERFACES (mantendo as existentes)
// ====================================

export interface TeacherStats {
  totalStudents: number;
  activeStudents: number;
  lessonsThisWeek: number;
  lessonsThisMonth: number;
  completedLessons: number;
  cancelledLessons: number;
  avgLessonsPerWeek: number;
  completionRate: number;
}

export interface StudentRelationship {
  relationshipId: string;
  student: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    location?: string;
    experienceLevel?: string;
    level: string;
    mainInstrument?: string;
    musicalGoals?: string[];
    practiceTime?: number;
  };
  relationship: {
    isActive: boolean;
    startDate: Date;
    endDate?: Date;
    pausedAt?: Date;
    pauseReason?: string;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    preferredDays?: string[];
    preferredTimes?: string[];
    learningPlan?: string;
    currentFocus?: string[];
    teacherNotes?: string;
  };
  stats: {
    totalLessons: number;
    completedLessons: number;
    scheduledLessons: number;
    cancelledLessons: number;
    completionRate: number;
  };
  nextLesson?: {
    id: string;
    scheduledAt: Date;
    title: string;
    duration: number;
  };
}

export interface TeacherLesson {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  type: string;
  location?: string;
  objectives: string[];
  workScoreIds: string[];
  topics: string[];
  techniques: string[];
  homework?: string;
  teacherNotes?: string;
  publicNotes?: string;
  studentFeedback?: string;
  teacher: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface StudentSearchResult {
  id: string;
  name: string;
  email: string;
  image?: string;
  location?: string;
  experienceLevel?: string;
  mainInstrument?: string;
  studentLevel?: string;
  isAlreadyStudent: boolean;
  relationshipId?: string;
  hasStudentProfile: boolean;
}

// ====================================
// HOOK STATE & ACTIONS
// ====================================

interface UseTeacherState {
  // Data (agora recebida como initial props)
  stats: TeacherStats | null;
  students: StudentRelationship[];
  lessons: TeacherLesson[];

  // Loading states
  loading: {
    dashboard: boolean;
    students: boolean;
    lessons: boolean;
    search: boolean;
    addStudent: boolean;
    updateStudent: boolean;
    createLesson: boolean;
  };

  // Search
  searchResults: StudentSearchResult[];

  // Error handling
  error: string | null;
}

interface UseTeacherActions {
  // Dashboard
  refreshDashboard: () => Promise<void>;

  // Students
  fetchStudents: (
    status?: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  searchStudents: (email: string) => Promise<void>;
  addStudent: (
    studentUserId: string,
    options?: Partial<StudentRelationship['relationship']>
  ) => Promise<boolean>;
  updateStudentRelationship: (
    relationshipId: string,
    updates: Partial<StudentRelationship['relationship']>
  ) => Promise<boolean>;
  removeStudent: (relationshipId: string, reason?: string) => Promise<boolean>;

  // Lessons
  fetchLessons: (filters?: {
    teacherId?: string;
    studentId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  createLesson: (lessonData: Partial<TeacherLesson>) => Promise<string | null>;
  updateLesson: (
    lessonId: string,
    updates: Partial<TeacherLesson>
  ) => Promise<boolean>;
  cancelLesson: (
    lessonId: string,
    reason?: string,
    cancelSeries?: boolean
  ) => Promise<boolean>;

  // Calendar
  refreshCalendar: () => Promise<void>;

  // Utilities
  clearError: () => void;
  clearSearchResults: () => void;
  setInitialData: (data: {
    stats?: TeacherStats;
    students?: StudentRelationship[];
    lessons?: TeacherLesson[];
  }) => void;
}

// ====================================
// HOOK IMPLEMENTATION
// ====================================

export function useTeacher(initialData?: {
  stats?: TeacherStats;
  students?: StudentRelationship[];
  lessons?: TeacherLesson[];
}): UseTeacherState & UseTeacherActions {
  const [state, setState] = useState<UseTeacherState>({
    // Usar dados iniciais se fornecidos
    stats: initialData?.stats || null,
    students: initialData?.students || [],
    lessons: initialData?.lessons || [],
    loading: {
      dashboard: false,
      students: false,
      lessons: false,
      search: false,
      addStudent: false,
      updateStudent: false,
      createLesson: false,
    },
    searchResults: [],
    error: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseTeacherState['loading'], value: boolean) => {
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

  // Set initial data (usado pelo client component quando recebe dados do server)
  const setInitialData = useCallback(
    (data: {
      stats?: TeacherStats;
      students?: StudentRelationship[];
      lessons?: TeacherLesson[];
    }) => {
      setState((prev) => ({
        ...prev,
        stats: data.stats || prev.stats,
        students: data.students || prev.students,
        lessons: data.lessons || prev.lessons,
      }));
    },
    []
  );

  // ====================================
  // DASHBOARD FUNCTIONS
  // ====================================

  const refreshDashboard = useCallback(async () => {
    setLoading('dashboard', true);
    setError(null);

    try {
      const response = await fetch('/api/teacher/dashboard');

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar dashboard');
      }

      setState((prev) => ({
        ...prev,
        stats: data.dashboard.stats,
      }));
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('dashboard', false);
    }
  }, [setLoading, setError]);

  // ====================================
  // STUDENTS FUNCTIONS
  // ====================================

  const fetchStudents = useCallback(
    async (
      status: string = 'active',
      limit: number = 50,
      offset: number = 0
    ) => {
      setLoading('students', true);
      setError(null);

      try {
        const params = new URLSearchParams({
          status,
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/teacher/students?${params}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao carregar alunos');
        }

        setState((prev) => ({
          ...prev,
          students:
            offset === 0 ? data.students : [...prev.students, ...data.students],
        }));
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('students', false);
      }
    },
    [setLoading, setError]
  );

  const searchStudents = useCallback(
    async (email: string) => {
      if (email.length < 3) {
        setState((prev) => ({ ...prev, searchResults: [] }));
        return;
      }

      setLoading('search', true);

      try {
        const results = await searchStudentsAPI(email, 10);
        setState((prev) => ({
          ...prev,
          searchResults: results,
        }));
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setState((prev) => ({ ...prev, searchResults: [] }));
      } finally {
        setLoading('search', false);
      }
    },
    [setLoading]
  );

  const addStudent = useCallback(
    async (
      studentUserId: string,
      options: Partial<StudentRelationship['relationship']> = {}
    ): Promise<boolean> => {
      setLoading('addStudent', true);
      setError(null);

      try {
        const result = await addStudentAPI(studentUserId, options);

        if (!result.success) {
          throw new Error(result.error || 'Erro ao adicionar aluno');
        }

        // Refresh students list
        await fetchStudents();

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
    [setLoading, setError, fetchStudents]
  );

  const updateStudentRelationship = useCallback(
    async (
      relationshipId: string,
      updates: Partial<StudentRelationship['relationship']>
    ): Promise<boolean> => {
      setLoading('updateStudent', true);
      setError(null);

      try {
        const response = await fetch('/api/teacher/students', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            relationshipId,
            ...updates,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar aluno');
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

  const removeStudent = useCallback(
    async (
      relationshipId: string,
      reason: string = 'Desvinculado pelo professor'
    ): Promise<boolean> => {
      setLoading('updateStudent', true);
      setError(null);

      try {
        const response = await fetch(
          `/api/teacher/students?id=${relationshipId}&reason=${encodeURIComponent(
            reason
          )}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao remover aluno');
        }

        // Remove from local state
        setState((prev) => ({
          ...prev,
          students: prev.students.filter(
            (student) => student.relationshipId !== relationshipId
          ),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao remover aluno:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateStudent', false);
      }
    },
    [setLoading, setError]
  );

  // ====================================
  // LESSONS FUNCTIONS
  // ====================================

  const fetchLessons = useCallback(
    async (filters = {}) => {
      setLoading('lessons', true);
      setError(null);

      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/lessons?${params}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao carregar aulas');
        }

        setState((prev) => ({
          ...prev,
          lessons: data.lessons,
        }));
      } catch (error) {
        console.error('Erro ao buscar aulas:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('lessons', false);
      }
    },
    [setLoading, setError]
  );

  const createLesson = useCallback(
    async (lessonData: Partial<TeacherLesson>): Promise<string | null> => {
      setLoading('createLesson', true);
      setError(null);

      try {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao criar aula');
        }

        // Add to local state if it's a single lesson
        if (data.lessons && Array.isArray(data.lessons)) {
          setState((prev) => ({
            ...prev,
            lessons: [...prev.lessons, ...data.lessons],
          }));

          return data.lessons[0]?.id || null;
        }

        return null;
      } catch (error) {
        console.error('Erro ao criar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return null;
      } finally {
        setLoading('createLesson', false);
      }
    },
    [setLoading, setError]
  );

  const updateLesson = useCallback(
    async (
      lessonId: string,
      updates: Partial<TeacherLesson>
    ): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch('/api/lessons', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lessonId,
            ...updates,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar aula');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, ...updates } : lesson
          ),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      }
    },
    [setError]
  );

  const cancelLesson = useCallback(
    async (
      lessonId: string,
      reason: string = 'Cancelada pelo professor',
      cancelSeries: boolean = false
    ): Promise<boolean> => {
      setError(null);

      try {
        const params = new URLSearchParams({
          id: lessonId,
          reason,
          cancelSeries: cancelSeries.toString(),
        });

        const response = await fetch(`/api/lessons?${params}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao cancelar aula');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, status: 'CANCELLED' as const }
              : lesson
          ),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao cancelar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      }
    },
    [setError]
  );

  // ====================================
  // CALENDAR FUNCTIONS
  // ====================================

  const refreshCalendar = useCallback(async () => {
    // Esta função pode ser implementada se necessário
    console.log('Refresh calendar called');
  }, []);

  // ====================================
  // UTILITY FUNCTIONS
  // ====================================

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const clearSearchResults = useCallback(() => {
    setState((prev) => ({ ...prev, searchResults: [] }));
  }, []);

  return {
    // State
    ...state,

    // Actions
    refreshDashboard,
    fetchStudents,
    searchStudents,
    addStudent,
    updateStudentRelationship,
    removeStudent,
    fetchLessons,
    createLesson,
    updateLesson,
    cancelLesson,
    refreshCalendar,
    clearError,
    clearSearchResults,
    setInitialData,
  };
}
