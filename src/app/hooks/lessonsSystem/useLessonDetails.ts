// app/hooks/useLessonDetails.ts - Hook ATUALIZADO com função DELETE real

import type { LessonDetailsData } from '@/app/(teacher)/teacher/lessons/[id]/pageServer';
import { useState, useCallback } from 'react';
import {
  createAssignmentRequest,
  updateAssignmentRequest,
} from '@/app/requests/portal/assignment-actions';
import {
  cancelLessonRequest,
  updateLessonRequest,
} from '@/app/requests/portal/lesson-actions';
import { loadTeacherLessonDetails } from '@/app/requests/portal/teacher';

interface UseLessonDetailsState {
  lesson: LessonDetailsData | null;
  loading: {
    update: boolean;
    attendance: boolean;
    notes: boolean;
    assignments: boolean;
    delete: boolean; // 🆕 NOVO LOADING PARA DELETE
  };
  error: string | null;
  isEditing: {
    basicInfo: boolean;
    notes: boolean;
    objectives: boolean;
    homework: boolean;
  };
}

interface UseLessonDetailsActions {
  // Data management
  setLesson: (lesson: LessonDetailsData) => void;
  refreshLesson: () => Promise<void>;

  // Lesson updates
  updateBasicInfo: (updates: {
    title?: string;
    description?: string;
    scheduledAt?: string;
    duration?: number;
    location?: string;
    type?: string;
    status?: string; // 🆕 PERMITIR ATUALIZAR STATUS
  }) => Promise<boolean>;

  updateObjectives: (objectives: string[]) => Promise<boolean>;

  updateTopicsAndTechniques: (data: {
    topics?: string[];
    techniques?: string[];
    repertoire?: string[];
  }) => Promise<boolean>;

  // Notes and feedback
  updateTeacherNotes: (notes: string) => Promise<boolean>;
  updatePublicNotes: (notes: string) => Promise<boolean>;
  updateLessonSummary: (summary: string) => Promise<boolean>;
  updateHomework: (
    homework: string,
    practiceGoals?: string[]
  ) => Promise<boolean>;

  // Progress and evaluation
  updateProgress: (progress: {
    skillsWorked?: string[];
    improvements?: string[];
    challenges?: string[];
    studentProgress?: any;
  }) => Promise<boolean>;

  // Attendance
  markAttendance: (data: {
    studentPresent: boolean;
    punctuality?: string;
    engagement?: number;
    preparation?: number;
    actualStartTime?: Date;
    actualEndTime?: Date;
  }) => Promise<boolean>;

  // Status changes
  completeLesson: (summary?: string) => Promise<boolean>;
  cancelLesson: (reason?: string) => Promise<boolean>;
  rescheduleLesson: (newDate: Date, reason?: string) => Promise<boolean>;

  // 🆕 DELETE REAL DA AULA
  deleteLesson: (options?: {
    reason?: string;
    deleteAll?: boolean;
    futureOnly?: boolean;
  }) => Promise<boolean>;

  // Assignments
  createAssignment: (data: {
    title: string;
    description: string;
    type?: string;
    priority?: string;
    dueDate?: Date;
    workScoreIds?: string[];
    practiceGoals?: string[];
  }) => Promise<boolean>;

  updateAssignment: (assignmentId: string, updates: any) => Promise<boolean>;

  // UI state management
  setEditMode: (
    field: keyof UseLessonDetailsState['isEditing'],
    editing: boolean
  ) => void;
  clearError: () => void;
}

export function useLessonDetails(
  initialLesson?: LessonDetailsData | null
): UseLessonDetailsState & UseLessonDetailsActions {
  const [state, setState] = useState<UseLessonDetailsState>({
    lesson: initialLesson || null,
    loading: {
      update: false,
      attendance: false,
      notes: false,
      assignments: false,
      delete: false, // 🆕 NOVO LOADING
    },
    error: null,
    isEditing: {
      basicInfo: false,
      notes: false,
      objectives: false,
      homework: false,
    },
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseLessonDetailsState['loading'], value: boolean) => {
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

  // Set lesson
  const setLesson = useCallback((lesson: LessonDetailsData) => {
    setState((prev) => ({
      ...prev,
      lesson,
    }));
  }, []);

  // Refresh lesson
  const refreshLesson = useCallback(async () => {
    if (!state.lesson?.id) return;

    setLoading('update', true);
    setError(null);

    try {
      const data = await loadTeacherLessonDetails(state.lesson.id);

      setLesson(data.lesson);
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('update', false);
    }
  }, [state.lesson?.id, setLesson, setLoading, setError]);

  // Generic update function
  const updateLesson = useCallback(
    async (
      updates: any,
      loadingKey: keyof UseLessonDetailsState['loading'] = 'update'
    ): Promise<boolean> => {
      if (!state.lesson?.id) return false;

      setLoading(loadingKey, true);
      setError(null);

      try {
        await updateLessonRequest(state.lesson.id, updates);

        // Update lesson in state
        setState((prev) => ({
          ...prev,
          lesson: prev.lesson ? { ...prev.lesson, ...updates } : null,
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading(loadingKey, false);
      }
    },
    [state.lesson?.id, setLoading, setError]
  );

  // Update basic info
  const updateBasicInfo = useCallback(
    async (updates: {
      title?: string;
      description?: string;
      scheduledAt?: string;
      duration?: number;
      location?: string;
      type?: string;
      status?: string; // 🆕 PERMITIR ATUALIZAR STATUS
    }): Promise<boolean> => {
      return await updateLesson(updates);
    },
    [updateLesson]
  );

  // Update objectives
  const updateObjectives = useCallback(
    async (objectives: string[]): Promise<boolean> => {
      return await updateLesson({ objectives });
    },
    [updateLesson]
  );

  // Update topics and techniques
  const updateTopicsAndTechniques = useCallback(
    async (data: {
      topics?: string[];
      techniques?: string[];
      repertoire?: string[];
    }): Promise<boolean> => {
      return await updateLesson(data);
    },
    [updateLesson]
  );

  // Update teacher notes
  const updateTeacherNotes = useCallback(
    async (teacherNotes: string): Promise<boolean> => {
      return await updateLesson({ teacherNotes }, 'notes');
    },
    [updateLesson]
  );

  // Update public notes
  const updatePublicNotes = useCallback(
    async (publicNotes: string): Promise<boolean> => {
      return await updateLesson({ publicNotes }, 'notes');
    },
    [updateLesson]
  );

  // Update lesson summary
  const updateLessonSummary = useCallback(
    async (lessonSummary: string): Promise<boolean> => {
      return await updateLesson({ lessonSummary }, 'notes');
    },
    [updateLesson]
  );

  // Update homework
  const updateHomework = useCallback(
    async (homework: string, practiceGoals?: string[]): Promise<boolean> => {
      const updates: any = { homework };
      if (practiceGoals) {
        updates.practiceGoals = practiceGoals;
      }
      return await updateLesson(updates);
    },
    [updateLesson]
  );

  // Update progress
  const updateProgress = useCallback(
    async (progress: {
      skillsWorked?: string[];
      improvements?: string[];
      challenges?: string[];
      studentProgress?: any;
    }): Promise<boolean> => {
      return await updateLesson(progress);
    },
    [updateLesson]
  );

  // Mark attendance
  const markAttendance = useCallback(
    async (data: {
      studentPresent: boolean;
      punctuality?: string;
      engagement?: number;
      preparation?: number;
      actualStartTime?: Date;
      actualEndTime?: Date;
    }): Promise<boolean> => {
      return await updateLesson(data, 'attendance');
    },
    [updateLesson]
  );

  // Complete lesson
  const completeLesson = useCallback(
    async (summary?: string): Promise<boolean> => {
      const updates: any = {
        status: 'COMPLETED',
        actualEndTime: new Date(),
      };

      if (summary) {
        updates.lessonSummary = summary;
      }

      return await updateLesson(updates);
    },
    [updateLesson]
  );

  // Cancel lesson (ATUALIZADO para usar PATCH, não DELETE)
  const cancelLesson = useCallback(
    async (reason?: string): Promise<boolean> => {
      const updates: any = {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
        cancelledBy: 'teacher',
      };

      return await updateLesson(updates);
    },
    [updateLesson]
  );

  // Reschedule lesson
  const rescheduleLesson = useCallback(
    async (newDate: Date, reason?: string): Promise<boolean> => {
      const updates = {
        scheduledAt: newDate.toISOString(),
        status: 'RESCHEDULED',
        rescheduledFrom: state.lesson?.scheduledAt,
        rescheduleReason: reason,
      };

      return await updateLesson(updates);
    },
    [updateLesson, state.lesson?.scheduledAt]
  );

  // 🆕 DELETE LESSON - APAGAR REAL DO BANCO DE DADOS
  const deleteLesson = useCallback(
    async (options?: {
      reason?: string;
      deleteAll?: boolean;
      futureOnly?: boolean;
    }): Promise<boolean> => {
      if (!state.lesson?.id) return false;

      setLoading('delete', true);
      setError(null);

      try {
        // A API não apaga aula (o histórico do aluno depende dela): "apagar"
        // vira cancelar, com a série inteira quando pedido.
        await cancelLessonRequest(
          state.lesson.id,
          options?.reason || 'Aula removida pelo professor',
          options?.deleteAll
        );

        return true;
      } catch (error) {
        console.error('❌ [useLessonDetails] Erro ao apagar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('delete', false);
      }
    },
    [state.lesson?.id, setLoading, setError]
  );

  // Create assignment
  const createAssignment = useCallback(
    async (data: {
      title: string;
      description: string;
      type?: string;
      priority?: string;
      dueDate?: Date;
      workScoreIds?: string[];
      practiceGoals?: string[];
    }): Promise<boolean> => {
      if (!state.lesson?.id) return false;

      setLoading('assignments', true);
      setError(null);

      try {
        const created = await createAssignmentRequest({
          lessonId: state.lesson.id,
          ...data,
        });

        // Add assignment to lesson state
        setState((prev) => ({
          ...prev,
          lesson: prev.lesson
            ? {
                ...prev.lesson,
                assignments: [
                  ...(prev.lesson.assignments || []),
                  {
                    id: created.id,
                    title: created.title,
                    description: created.description,
                    dueDate: created.dueDate
                      ? new Date(created.dueDate)
                      : undefined,
                    status: created.status,
                    isCompleted: created.isCompleted,
                  },
                ],
              }
            : null,
        }));

        return true;
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('assignments', false);
      }
    },
    [state.lesson?.id, state.lesson?.student.id, setLoading, setError]
  );

  // Update assignment
  const updateAssignment = useCallback(
    async (assignmentId: string, updates: any): Promise<boolean> => {
      setLoading('assignments', true);
      setError(null);

      try {
        await updateAssignmentRequest(assignmentId, updates);

        // Update assignment in lesson state
        setState((prev) => ({
          ...prev,
          lesson: prev.lesson
            ? {
                ...prev.lesson,
                assignments: prev.lesson.assignments?.map((assignment) =>
                  assignment.id === assignmentId
                    ? { ...assignment, ...updates }
                    : assignment
                ),
              }
            : null,
        }));

        return true;
      } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('assignments', false);
      }
    },
    [setLoading, setError]
  );

  // Set edit mode
  const setEditMode = useCallback(
    (field: keyof UseLessonDetailsState['isEditing'], editing: boolean) => {
      setState((prev) => ({
        ...prev,
        isEditing: {
          ...prev.isEditing,
          [field]: editing,
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
    setLesson,
    refreshLesson,
    updateBasicInfo,
    updateObjectives,
    updateTopicsAndTechniques,
    updateTeacherNotes,
    updatePublicNotes,
    updateLessonSummary,
    updateHomework,
    updateProgress,
    markAttendance,
    completeLesson,
    cancelLesson,
    rescheduleLesson,
    deleteLesson, // 🆕 NOVA FUNÇÃO
    createAssignment,
    updateAssignment,
    setEditMode,
    clearError,
  };
}
