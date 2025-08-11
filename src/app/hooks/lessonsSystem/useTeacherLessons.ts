// app/hooks/useTeacherLessons.ts - Hook para gerenciar aulas do professor - CORRIGIDO

import {
  LessonData,
  LessonsStats,
  TeacherLessonsData,
} from '@/app/(teacher)/teacher/lessons/pageServer';
import { useState, useCallback } from 'react';

interface UseTeacherLessonsState {
  lessons: LessonData[];
  stats: LessonsStats;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  loading: {
    lessons: boolean;
    createLesson: boolean;
    updateLesson: boolean;
    deleteLesson: boolean;
  };
  error: string | null;
}

interface UseTeacherLessonsActions {
  // Data fetching
  fetchLessons: (filters?: {
    status?: string;
    studentId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
    includeStats?: boolean;
    forceRefresh?: boolean;
  }) => Promise<void>;

  refreshLessons: () => Promise<void>;
  loadMoreLessons: () => Promise<void>;

  // Lesson management
  createLesson: (data: {
    studentUserId: string;
    title: string;
    description?: string;
    scheduledAt: string;
    duration?: number;
    type?: string;
    location?: string;
    objectives?: string[];
    isRecurring?: boolean;
    recurrenceType?: string;
    recurrenceEnd?: string;
    workScoreIds?: string[]; // 🆕 PARTITURAS VINCULADAS
    workIds?: string[]; // 🆕 OBRAS VINCULADAS (para referência futura)
  }) => Promise<boolean>;

  updateLesson: (
    lessonId: string,
    updates: Partial<LessonData>
  ) => Promise<boolean>;

  cancelLesson: (
    lessonId: string,
    reason?: string,
    cancelSeries?: boolean
  ) => Promise<boolean>;

  markAttendance: (
    lessonId: string,
    attendance: {
      studentPresent: boolean;
      punctuality?: string;
      engagement?: number;
      preparation?: number;
    }
  ) => Promise<boolean>;

  addLessonNotes: (
    lessonId: string,
    notes: {
      teacherNotes?: string;
      publicNotes?: string;
      lessonSummary?: string;
      homework?: string;
      skillsWorked?: string[];
      improvements?: string[];
      challenges?: string[];
    }
  ) => Promise<boolean>;

  // State management
  setInitialData: (data: TeacherLessonsData) => void;
  updateLessonInState: (lessonId: string, updates: Partial<LessonData>) => void;
  addLessonToState: (lesson: LessonData) => void;
  removeLessonFromState: (lessonId: string) => void;
  clearError: () => void;
}

// 🆕 FUNÇÃO PARA RECALCULAR STATS LOCALMENTE
function calculateStatsFromLessons(lessons: LessonData[]): LessonsStats {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const stats = {
    total: lessons.length,
    scheduled: lessons.filter((l) => l.status === 'SCHEDULED').length,
    completed: lessons.filter((l) => l.status === 'COMPLETED').length,
    cancelled: lessons.filter((l) => l.status === 'CANCELLED').length,
    noShow: lessons.filter((l) => l.status === 'NO_SHOW').length,
    today: lessons.filter((l) => {
      const lessonDate = new Date(l.scheduledAt);
      return lessonDate >= today && lessonDate < tomorrow;
    }).length,
    thisWeek: lessons.filter((l) => {
      const lessonDate = new Date(l.scheduledAt);
      return lessonDate >= startOfWeek && lessonDate < endOfWeek;
    }).length,
    thisMonth: lessons.filter((l) => {
      const lessonDate = new Date(l.scheduledAt);
      return lessonDate >= startOfMonth && lessonDate <= endOfMonth;
    }).length,
    averageDuration:
      lessons.length > 0
        ? Math.round(
            lessons.reduce((sum, l) => sum + l.duration, 0) / lessons.length
          )
        : 60,
    completionRate:
      lessons.length > 0
        ? Math.round(
            (lessons.filter((l) => l.status === 'COMPLETED').length /
              lessons.length) *
              100 *
              10
          ) / 10
        : 0,
  };

  return stats;
}

export function useTeacherLessons(
  initialData?: TeacherLessonsData
): UseTeacherLessonsState & UseTeacherLessonsActions {
  const [state, setState] = useState<UseTeacherLessonsState>({
    lessons: initialData?.lessons || [],
    stats: initialData?.stats || {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      averageDuration: 60,
      completionRate: 0,
    },
    pagination: initialData?.pagination || {
      offset: 0,
      limit: 20,
      total: 0,
      hasMore: false,
    },
    loading: {
      lessons: false,
      createLesson: false,
      updateLesson: false,
      deleteLesson: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseTeacherLessonsState['loading'], value: boolean) => {
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

  // 🆕 FUNÇÃO PARA RECALCULAR E ATUALIZAR STATS
  const recalculateStats = useCallback((lessons: LessonData[]) => {
    const newStats = calculateStatsFromLessons(lessons);
    setState((prev) => ({
      ...prev,
      stats: newStats,
    }));
    console.log('📊 Stats recalculados:', newStats);
  }, []);

  // Set initial data
  const setInitialData = useCallback((data: TeacherLessonsData) => {
    setState((prev) => ({
      ...prev,
      lessons: data.lessons,
      stats: data.stats,
      pagination: data.pagination,
    }));
  }, []);

  // Fetch lessons with filters
  const fetchLessons = useCallback(
    async (filters?: {
      status?: string;
      studentId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
      includeStats?: boolean;
      forceRefresh?: boolean;
    }) => {
      setLoading('lessons', true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters?.status) params.append('status', filters.status);
        if (filters?.studentId) params.append('studentId', filters.studentId);
        if (filters?.dateFrom)
          params.append('dateFrom', filters.dateFrom.toISOString());
        if (filters?.dateTo)
          params.append('dateTo', filters.dateTo.toISOString());
        params.append('limit', (filters?.limit || 20).toString());
        params.append('offset', (filters?.offset || 0).toString());
        params.append('includeStats', 'true'); // 🆕 SEMPRE INCLUIR STATS

        // 🆕 HEADER PARA FORÇAR REFRESH DO CACHE
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (filters?.forceRefresh) {
          headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
          headers['Pragma'] = 'no-cache';
          headers['Expires'] = '0';
        }

        const response = await fetch(`/api/lessons?${params}`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar aulas');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro desconhecido');
        }

        setState((prev) => ({
          ...prev,
          lessons: filters?.offset
            ? [...prev.lessons, ...data.lessons]
            : data.lessons,
          stats: data.stats || calculateStatsFromLessons(data.lessons), // 🆕 FALLBACK LOCAL
          pagination: data.pagination,
        }));

        console.log(
          `✅ Lessons carregadas: ${data.lessons?.length}, Stats atualizados`
        );
      } catch (error) {
        console.error('Erro ao buscar aulas:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('lessons', false);
      }
    },
    [setLoading, setError]
  );

  // Refresh lessons
  const refreshLessons = useCallback(async () => {
    await fetchLessons({
      limit: state.pagination.limit,
      offset: 0,
      includeStats: true,
      forceRefresh: true,
    });
  }, [fetchLessons, state.pagination.limit]);

  // Load more lessons
  const loadMoreLessons = useCallback(async () => {
    if (!state.pagination.hasMore || state.loading.lessons) return;

    await fetchLessons({
      limit: state.pagination.limit,
      offset: state.pagination.offset + state.pagination.limit,
      includeStats: true,
    });
  }, [fetchLessons, state.pagination, state.loading.lessons]);

  // Create lesson
  const createLesson = useCallback(
    async (data: {
      studentUserId: string;
      title: string;
      description?: string;
      scheduledAt: string;
      duration?: number;
      type?: string;
      location?: string;
      objectives?: string[];
      isRecurring?: boolean;
      recurrenceType?: string;
      recurrenceEnd?: string;
    }): Promise<boolean> => {
      setLoading('createLesson', true);
      setError(null);

      // 🆕 VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
      const errors: string[] = [];

      if (!data.studentUserId) errors.push('Aluno é obrigatório');
      if (!data.title?.trim()) errors.push('Título é obrigatório');
      if (!data.scheduledAt) errors.push('Data e hora são obrigatórias');

      // Validar data futura
      const scheduledDate = new Date(data.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        errors.push('Data e hora inválidas');
      } else if (scheduledDate < new Date()) {
        errors.push('Data e hora devem ser no futuro');
      }

      // Validar duração
      if (data.duration && (data.duration < 15 || data.duration > 300)) {
        errors.push('Duração deve estar entre 15 e 300 minutos');
      }

      // Validar recorrência
      if (data.isRecurring) {
        if (!data.recurrenceType || data.recurrenceType === 'NONE') {
          errors.push(
            'Tipo de recorrência é obrigatório para aulas recorrentes'
          );
        }
        if (!data.recurrenceEnd) {
          errors.push('Data final é obrigatória para aulas recorrentes');
        }

        if (data.recurrenceEnd) {
          const endDate = new Date(data.recurrenceEnd);
          if (endDate <= scheduledDate) {
            errors.push(
              'Data final deve ser posterior à data da primeira aula'
            );
          }

          // Limite de 3 meses
          const maxDate = new Date(scheduledDate);
          maxDate.setMonth(maxDate.getMonth() + 3);
          if (endDate > maxDate) {
            errors.push('Recorrência limitada a 3 meses máximo');
          }
        }
      }

      if (errors.length > 0) {
        setError(`Erros de validação:\n• ${errors.join('\n• ')}`);
        setLoading('createLesson', false);
        return false;
      }

      try {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar aula');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar aula');
        }

        // 🆕 ATUALIZAR STATE E RECALCULAR STATS
        if (result.lessons && Array.isArray(result.lessons)) {
          setState((prev) => {
            const updatedLessons = [...result.lessons, ...prev.lessons];
            const newStats = calculateStatsFromLessons(updatedLessons);

            console.log(
              `✅ ${result.lessons.length} aula(s) criada(s), stats recalculados`
            );

            return {
              ...prev,
              lessons: updatedLessons,
              stats: newStats,
              pagination: {
                ...prev.pagination,
                total: prev.pagination.total + result.lessons.length,
              },
            };
          });
        }

        return true;
      } catch (error) {
        console.error('Erro ao criar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('createLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Update lesson
  const updateLesson = useCallback(
    async (
      lessonId: string,
      updates: Partial<LessonData>
    ): Promise<boolean> => {
      setLoading('updateLesson', true);
      setError(null);

      try {
        const response = await fetch('/api/lessons', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId, ...updates }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar aula');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao atualizar aula');
        }

        // 🆕 ATUALIZAR STATE E RECALCULAR STATS
        setState((prev) => {
          const updatedLessons = prev.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, ...updates } : lesson
          );
          const newStats = calculateStatsFromLessons(updatedLessons);

          console.log('✅ Aula atualizada, stats recalculados');

          return {
            ...prev,
            lessons: updatedLessons,
            stats: newStats,
          };
        });

        return true;
      } catch (error) {
        console.error('Erro ao atualizar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Cancel lesson
  const cancelLesson = useCallback(
    async (
      lessonId: string,
      reason?: string,
      cancelSeries?: boolean
    ): Promise<boolean> => {
      setLoading('deleteLesson', true);
      setError(null);

      try {
        const params = new URLSearchParams({
          id: lessonId,
          ...(reason && { reason }),
          ...(cancelSeries && { cancelSeries: 'true' }),
        });

        const response = await fetch(`/api/lessons?${params}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao cancelar aula');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao cancelar aula');
        }

        // 🆕 ATUALIZAR STATE E RECALCULAR STATS
        setState((prev) => {
          const updatedLessons = prev.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, status: 'CANCELLED' as const }
              : lesson
          );
          const newStats = calculateStatsFromLessons(updatedLessons);

          console.log('✅ Aula cancelada, stats recalculados');

          return {
            ...prev,
            lessons: updatedLessons,
            stats: newStats,
          };
        });

        return true;
      } catch (error) {
        console.error('Erro ao cancelar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('deleteLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Mark attendance
  const markAttendance = useCallback(
    async (
      lessonId: string,
      attendance: {
        studentPresent: boolean;
        punctuality?: string;
        engagement?: number;
        preparation?: number;
      }
    ): Promise<boolean> => {
      const success = await updateLesson(lessonId, attendance);

      // Se foi marcar presença, também atualizar status para COMPLETED
      if (success && attendance.studentPresent) {
        await updateLesson(lessonId, { status: 'COMPLETED' });
      }

      return success;
    },
    [updateLesson]
  );

  // Add lesson notes
  const addLessonNotes = useCallback(
    async (
      lessonId: string,
      notes: {
        teacherNotes?: string;
        publicNotes?: string;
        lessonSummary?: string;
        homework?: string;
        skillsWorked?: string[];
        improvements?: string[];
        challenges?: string[];
      }
    ): Promise<boolean> => {
      return await updateLesson(lessonId, notes);
    },
    [updateLesson]
  );

  // Update lesson in state
  const updateLessonInState = useCallback(
    (lessonId: string, updates: Partial<LessonData>) => {
      setState((prev) => {
        const updatedLessons = prev.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, ...updates } : lesson
        );
        const newStats = calculateStatsFromLessons(updatedLessons);

        return {
          ...prev,
          lessons: updatedLessons,
          stats: newStats,
        };
      });
    },
    []
  );

  // Add lesson to state
  const addLessonToState = useCallback((lesson: LessonData) => {
    setState((prev) => {
      const updatedLessons = [lesson, ...prev.lessons];
      const newStats = calculateStatsFromLessons(updatedLessons);

      return {
        ...prev,
        lessons: updatedLessons,
        stats: newStats,
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total + 1,
        },
      };
    });
  }, []);

  // Remove lesson from state
  const removeLessonFromState = useCallback((lessonId: string) => {
    setState((prev) => {
      const updatedLessons = prev.lessons.filter(
        (lesson) => lesson.id !== lessonId
      );
      const newStats = calculateStatsFromLessons(updatedLessons);

      return {
        ...prev,
        lessons: updatedLessons,
        stats: newStats,
        pagination: {
          ...prev.pagination,
          total: Math.max(0, prev.pagination.total - 1),
        },
      };
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    fetchLessons,
    refreshLessons,
    loadMoreLessons,
    createLesson,
    updateLesson,
    cancelLesson,
    markAttendance,
    addLessonNotes,
    setInitialData,
    updateLessonInState,
    addLessonToState,
    removeLessonFromState,
    clearError,
  };
}
