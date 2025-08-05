// app/hooks/useStudent.ts - Hook para gerenciar dados do aluno

import { useState, useCallback, useEffect } from 'react';

export interface StudentStats {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  missedLessons: number;
  totalStudyTime: number; // em minutos
  averageAttendance: number;
  currentStreak: number;
  longestStreak: number;
}

export interface StudentLesson {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  type: string;
  location?: string;
  objectives: string[];
  homework?: string;
  publicNotes?: string;
  studentFeedback?: string;
  lessonSummary?: string;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];
  teacher: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  dueDate?: Date;
  isCompleted: boolean;
  progress?: number;
  workScoreIds: string[];
  practiceGoals: string[];
  technicalGoals: string[];
  musicalGoals: string[];
  lesson: {
    id: string;
    title: string;
    scheduledAt: Date;
    teacher: {
      name: string;
      image?: string;
    };
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  level: string;
  mainInstrument?: string;
  musicalGoals?: string;
  preferredGenres: string[];
  musicalBackground?: string;
  allowPublicProgress: boolean;
  allowProgressShare: boolean;
  profileVisibility: string;
  practiceTime?: number;
  practiceSchedule?: any;
  learningPace?: string;
  specialNeeds?: string;
  status: string;
  enrollmentDate: Date;
  lastLessonAt?: Date;
  lastActiveAt?: Date;
  preferredContact: string;
  reminderPreferences?: any;
  totalLessonsAttended: number;
  totalAssignments: number;
  completedAssignments: number;
  currentStreak: number;
  longestStreak: number;
  progressScore?: number;
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    image?: string;
    experienceLevel: string | null;
  };
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherImage?: string;
    isActive: boolean;
    startDate: Date;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    nextLessonAt?: Date;
    totalLessons: number;
  }>;
}

interface UseStudentState {
  // Data
  stats: StudentStats | null;
  lessons: StudentLesson[];
  assignments: StudentAssignment[];
  profile: StudentProfile | null;

  // Loading states
  loading: {
    dashboard: boolean;
    lessons: boolean;
    assignments: boolean;
    profile: boolean;
    updateProfile: boolean;
    submitAssignment: boolean;
    addFeedback: boolean;
  };

  // Error handling
  error: string | null;
  hasTeachers: boolean;
}

interface UseStudentActions {
  // Dashboard
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // Profile
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: {
    userData?: any;
    studentData?: any;
  }) => Promise<boolean>;
  updateProfileField: (
    field: string,
    value: any,
    action?: 'set' | 'add' | 'remove'
  ) => Promise<boolean>;

  // Lessons
  fetchLessons: (filters?: {
    teacherId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  getLesson: (lessonId: string) => Promise<StudentLesson | null>;
  addLessonFeedback: (
    lessonId: string,
    feedback: string,
    rating?: number
  ) => Promise<boolean>;

  // Assignments
  fetchAssignments: (filters?: {
    teacherId?: string;
    status?: string;
    lessonId?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  updateAssignment: (assignmentId: string, updates: any) => Promise<boolean>;
  submitAssignment: (assignmentId: string, submission: any) => Promise<boolean>;

  // Calendar
  fetchCalendar: (
    startDate: Date,
    endDate: Date,
    options?: {
      view?: string;
      stats?: boolean;
      teacherId?: string;
    }
  ) => Promise<any>;

  // Utilities
  clearError: () => void;
}

export function useStudent(): UseStudentState & UseStudentActions {
  const [state, setState] = useState<UseStudentState>({
    stats: null,
    lessons: [],
    assignments: [],
    profile: null,
    loading: {
      dashboard: false,
      lessons: false,
      assignments: false,
      profile: false,
      updateProfile: false,
      submitAssignment: false,
      addFeedback: false,
    },
    error: null,
    hasTeachers: false,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentState['loading'], value: boolean) => {
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

  // Dashboard functions
  const fetchDashboard = useCallback(async () => {
    setLoading('dashboard', true);
    setError(null);

    try {
      const response = await fetch('/api/student/dashboard');

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
        hasTeachers: data.dashboard.teachers.length > 0,
      }));
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('dashboard', false);
    }
  }, [setLoading, setError]);

  const refreshDashboard = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  // Profile functions
  const fetchProfile = useCallback(async () => {
    setLoading('profile', true);
    setError(null);

    try {
      const response = await fetch('/api/student/profile');

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar perfil');
      }

      setState((prev) => ({
        ...prev,
        profile: data.profile,
        hasTeachers: data.profile.teachers.length > 0,
      }));
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('profile', false);
    }
  }, [setLoading, setError]);

  const updateProfile = useCallback(
    async (updates: {
      userData?: any;
      studentData?: any;
    }): Promise<boolean> => {
      setLoading('updateProfile', true);
      setError(null);

      try {
        const response = await fetch('/api/student/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar perfil');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          profile: data.profile,
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateProfile', false);
      }
    },
    [setLoading, setError]
  );

  const updateProfileField = useCallback(
    async (
      field: string,
      value: any,
      action: 'set' | 'add' | 'remove' = 'set'
    ): Promise<boolean> => {
      setLoading('updateProfile', true);
      setError(null);

      try {
        const response = await fetch('/api/student/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ field, value, action }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar campo');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          profile: data.profile,
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar campo:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateProfile', false);
      }
    },
    [setLoading, setError]
  );

  // Lessons functions
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

  const getLesson = useCallback(
    async (lessonId: string): Promise<StudentLesson | null> => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao carregar aula');
        }

        return data.lesson;
      } catch (error) {
        console.error('Erro ao buscar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return null;
      }
    },
    [setError]
  );

  const addLessonFeedback = useCallback(
    async (
      lessonId: string,
      feedback: string,
      rating?: number
    ): Promise<boolean> => {
      setLoading('addFeedback', true);
      setError(null);

      try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentFeedback: feedback,
            studentRating: rating,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao adicionar feedback');
        }

        // Update local state if lesson is in current lessons list
        setState((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, studentFeedback: feedback }
              : lesson
          ),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao adicionar feedback:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('addFeedback', false);
      }
    },
    [setLoading, setError]
  );

  // Assignments functions
  const fetchAssignments = useCallback(
    async (filters = {}) => {
      setLoading('assignments', true);
      setError(null);

      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/assignments?${params}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao carregar tarefas');
        }

        setState((prev) => ({
          ...prev,
          assignments: data.assignments,
        }));
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('assignments', false);
      }
    },
    [setLoading, setError]
  );

  const updateAssignment = useCallback(
    async (assignmentId: string, updates: any): Promise<boolean> => {
      setError(null);

      try {
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar tarefa');
        }

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
        console.error('Erro ao atualizar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      }
    },
    [setError]
  );

  const submitAssignment = useCallback(
    async (assignmentId: string, submission: any): Promise<boolean> => {
      setLoading('submitAssignment', true);
      setError(null);

      try {
        const response = await fetch('/api/assignments', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignmentId,
            submissions: submission,
            isCompleted: true,
            progress: 100,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao enviar tarefa');
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          assignments: prev.assignments.map((assignment) =>
            assignment.id === assignmentId
              ? {
                  ...assignment,
                  isCompleted: true,
                  progress: 100,
                  status: 'COMPLETED',
                }
              : assignment
          ),
        }));

        return true;
      } catch (error) {
        console.error('Erro ao enviar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('submitAssignment', false);
      }
    },
    [setLoading, setError]
  );

  // Calendar function
  const fetchCalendar = useCallback(
    async (
      startDate: Date,
      endDate: Date,
      options: {
        view?: string;
        stats?: boolean;
        teacherId?: string;
      } = {}
    ) => {
      try {
        const params = new URLSearchParams({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          view: options.view || 'month',
          stats: (options.stats || false).toString(),
        });

        if (options.teacherId) {
          params.append('teacherId', options.teacherId);
        }

        const response = await fetch(`/api/student/calendar?${params}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao carregar calendário');
        }

        return data;
      } catch (error) {
        console.error('Erro ao buscar calendário:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return null;
      }
    },
    [setError]
  );

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    fetchDashboard,
    refreshDashboard,
    fetchProfile,
    updateProfile,
    updateProfileField,
    fetchLessons,
    getLesson,
    addLessonFeedback,
    fetchAssignments,
    updateAssignment,
    submitAssignment,
    fetchCalendar,
    clearError,
  };
}
