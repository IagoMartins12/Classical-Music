// app/hooks/useTeacherData.ts
import { useState, useCallback } from 'react';
import {
  TeacherDashboardData,
  TeacherStudentsData,
} from '@/app/requests/teacher-request';
import { useToast } from '../useToast';

interface TeacherDataState {
  dashboard: TeacherDashboardData | null;
  students: TeacherStudentsData | null;
  calendar: any | null;
}

interface UseTeacherDataProps {
  initialData: TeacherDataState;
}

interface UseTeacherDataReturn {
  data: TeacherDataState;
  refreshing: boolean;
  error: string | undefined;
  refreshData: (showToast?: boolean) => Promise<void>;
  updateData: (updates: Partial<TeacherDataState>) => void;
  clearError: () => void;
}

export function useTeacherData({
  initialData,
}: UseTeacherDataProps): UseTeacherDataReturn {
  const [data, setData] = useState<TeacherDataState>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const toast = useToast();

  // Função principal de refresh
  const refreshData = useCallback(
    async (showToast: boolean = true) => {
      setRefreshing(true);
      setError(undefined);

      try {
        console.log('🔄 [useTeacherData] Refreshing teacher data...');

        const response = await fetch('/api/teacher/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setData({
            dashboard: result.data.dashboard,
            students: result.data.students,
            calendar: result.data.calendar,
          });

          if (showToast) {
            toast.success('Dados atualizados com sucesso!');
          }
          console.log('✅ [useTeacherData] Data refreshed successfully');
        } else {
          throw new Error(
            result.error || 'Erro desconhecido ao atualizar dados'
          );
        }
      } catch (error) {
        console.error('❌ [useTeacherData] Error refreshing data:', error);
        const message =
          error instanceof Error ? error.message : 'Erro ao atualizar dados';
        setError(message);
        toast.error(message);
      } finally {
        setRefreshing(false);
      }
    },
    [toast]
  );

  // Função para atualizar dados parcialmente (útil para mutations)
  const updateData = useCallback((updates: Partial<TeacherDataState>) => {
    setData((prevData) => ({
      ...prevData,
      ...updates,
    }));
  }, []);

  // Função para limpar erros
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  return {
    data,
    refreshing,
    error,
    refreshData,
    updateData,
    clearError,
  };
}

// Hook específico para refresh de dados de alunos
export function useStudentRefresh() {
  const toast = useToast();

  const refreshStudentData = useCallback(
    async (studentId?: string) => {
      try {
        console.log(
          `🔄 [useStudentRefresh] Refreshing student data ${
            studentId || 'all'
          }...`
        );

        const url = studentId
          ? `/api/teacher/students/${studentId}/refresh`
          : '/api/teacher/students/refresh';

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success('Dados do aluno atualizados!');
          return result.data;
        } else {
          throw new Error(result.error || 'Erro ao atualizar dados do aluno');
        }
      } catch (error) {
        console.error('❌ [useStudentRefresh] Error:', error);
        const message =
          error instanceof Error ? error.message : 'Erro ao atualizar dados';
        toast.error(message);
        throw error;
      }
    },
    [toast]
  );

  return { refreshStudentData };
}

// Hook específico para operações de aula
export function useLessonOperations() {
  const toast = useToast();

  const createLesson = useCallback(
    async (lessonData: any) => {
      try {
        console.log('📚 [useLessonOperations] Creating lesson...');

        const response = await fetch('/api/teacher/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success('Aula criada com sucesso!');
          return result.lesson;
        } else {
          throw new Error(result.error || 'Erro ao criar aula');
        }
      } catch (error) {
        console.error('❌ [useLessonOperations] Error creating lesson:', error);
        const message =
          error instanceof Error ? error.message : 'Erro ao criar aula';
        toast.error(message);
        throw error;
      }
    },
    [toast]
  );

  const updateLesson = useCallback(
    async (lessonId: string, updates: any) => {
      try {
        console.log(`📚 [useLessonOperations] Updating lesson ${lessonId}...`);

        const response = await fetch(`/api/teacher/lessons/${lessonId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success('Aula atualizada com sucesso!');
          return result.lesson;
        } else {
          throw new Error(result.error || 'Erro ao atualizar aula');
        }
      } catch (error) {
        console.error('❌ [useLessonOperations] Error updating lesson:', error);
        const message =
          error instanceof Error ? error.message : 'Erro ao atualizar aula';
        toast.error(message);
        throw error;
      }
    },
    [toast]
  );

  const deleteLesson = useCallback(
    async (lessonId: string) => {
      try {
        console.log(`📚 [useLessonOperations] Deleting lesson ${lessonId}...`);

        const response = await fetch(`/api/teacher/lessons/${lessonId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success('Aula removida com sucesso!');
          return true;
        } else {
          throw new Error(result.error || 'Erro ao remover aula');
        }
      } catch (error) {
        console.error('❌ [useLessonOperations] Error deleting lesson:', error);
        const message =
          error instanceof Error ? error.message : 'Erro ao remover aula';
        toast.error(message);
        throw error;
      }
    },
    [toast]
  );

  return {
    createLesson,
    updateLesson,
    deleteLesson,
  };
}

// Hook para cache management
export function useCacheInvalidation() {
  const revalidateCache = useCallback(async (tags?: string[]) => {
    try {
      console.log('🗑️ [useCacheInvalidation] Invalidating cache...');

      const response = await fetch('/api/teacher/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        throw new Error('Erro ao invalidar cache');
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ [useCacheInvalidation] Cache invalidated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Erro ao invalidar cache');
      }
    } catch (error) {
      console.error('❌ [useCacheInvalidation] Error:', error);
      throw error;
    }
  }, []);

  return { revalidateCache };
}
