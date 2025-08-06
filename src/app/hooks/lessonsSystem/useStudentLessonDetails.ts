// app/hooks/useStudentLessonDetails.ts - Hook para gerenciar detalhes de uma aula específica

import { useState, useCallback } from 'react';

interface LessonDetails {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: string;
  type: string;
  location?: string;

  // Recorrência
  isRecurring: boolean;
  recurrenceType?: string;
  parentLessonId?: string;
  recurrenceEnd?: Date;

  // Conteúdo da aula
  objectives: string[];
  workScoreIds: string[];
  topics: string[];
  techniques: string[];
  repertoire: string[];
  homework?: string;
  practiceGoals: string[];
  nextLessonPrep?: string;

  // Anotações (visão do aluno)
  publicNotes?: string;
  studentFeedback?: string;
  lessonSummary?: string;

  // Avaliação e progresso
  studentProgress?: any;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];

  // Presença
  studentPresent?: boolean;
  punctuality?: string;
  engagement?: number;
  preparation?: number;

  // Dados do professor
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
    level: string;
  };

  // Contexto
  relationship: {
    totalLessons: number;
    completedLessons: number;
    relationshipDuration: string;
  };

  // WorkScores relacionados
  workScores?: Array<{
    id: string;
    title: string;
    composer: string;
    workTitle: string;
    type: string;
    downloadUrl?: string;
  }>;

  // Assignments relacionados
  assignments?: Array<{
    id: string;
    title: string;
    description: string;
    dueDate?: Date;
    status: string;
    isCompleted: boolean;
  }>;

  // Aulas relacionadas
  relatedLessons?: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    status: string;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Permissões
  permissions: {
    canEdit: boolean;
    canCancel: boolean;
    canReschedule: boolean;
    canViewTeacherNotes: boolean;
    canAddFeedback: boolean;
    canMarkAttendance: boolean;
  };
}

interface UseStudentLessonDetailsState {
  lesson: LessonDetails | null;
  loading: {
    lesson: boolean;
    addFeedback: boolean;
  };
  error: string | null;
}

interface UseStudentLessonDetailsActions {
  fetchLessonDetails: (lessonId: string) => Promise<void>;

  addFeedback: (feedback: string, rating?: number) => Promise<boolean>;

  refreshLesson: () => Promise<void>;

  clearError: () => void;

  clearLesson: () => void;
}

export function useStudentLessonDetails(): UseStudentLessonDetailsState &
  UseStudentLessonDetailsActions {
  const [state, setState] = useState<UseStudentLessonDetailsState>({
    lesson: null,
    loading: {
      lesson: false,
      addFeedback: false,
    },
    error: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentLessonDetailsState['loading'], value: boolean) => {
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

  // Fetch lesson details
  const fetchLessonDetails = useCallback(
    async (lessonId: string) => {
      setLoading('lesson', true);
      setError(null);

      try {
        const response = await fetch(`/api/lessons/${lessonId}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao carregar detalhes da aula');
        }

        setState((prev) => ({
          ...prev,
          lesson: data.lesson,
        }));
      } catch (error) {
        console.error('Erro ao buscar detalhes da aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('lesson', false);
      }
    },
    [setLoading, setError]
  );

  // Add feedback to lesson
  const addFeedback = useCallback(
    async (feedback: string, rating?: number): Promise<boolean> => {
      if (!state.lesson) {
        setError('Nenhuma aula carregada');
        return false;
      }

      setLoading('addFeedback', true);
      setError(null);

      try {
        const response = await fetch(`/api/lessons/${state.lesson.id}`, {
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
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao adicionar feedback');
        }

        // Update lesson in state
        setState((prev) => ({
          ...prev,
          lesson: prev.lesson
            ? {
                ...prev.lesson,
                studentFeedback: feedback,
              }
            : null,
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
    [state.lesson, setLoading, setError]
  );

  // Refresh lesson (wrapper for fetchLessonDetails)
  const refreshLesson = useCallback(async () => {
    if (state.lesson) {
      await fetchLessonDetails(state.lesson.id);
    }
  }, [state.lesson, fetchLessonDetails]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Clear lesson
  const clearLesson = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lesson: null,
      error: null,
    }));
  }, []);

  return {
    // State
    ...state,

    // Actions
    fetchLessonDetails,
    addFeedback,
    refreshLesson,
    clearError,
    clearLesson,
  };
}
