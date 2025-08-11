// app/hooks/lessonsSystem/useEditLesson.ts - Hook para editar aula (CORRIGIDO)

import { useState, useCallback } from 'react';

interface UpdateLessonData {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  type?: string;
  location?: string;
  status?: string;
  objectives?: string[];
  topics?: string[];
  techniques?: string[];
  homework?: string;
  teacherNotes?: string;
  publicNotes?: string;
}

interface UseEditLessonState {
  loading: {
    updateLesson: boolean;
    cancelLesson: boolean;
  };
  error: string | null;
}

interface UseEditLessonActions {
  updateLesson: (lessonId: string, data: UpdateLessonData) => Promise<boolean>;
  cancelLesson: (lessonId: string, reason?: string) => Promise<boolean>;
  clearError: () => void;
}

// 🔧 FUNÇÃO HELPER PARA GARANTIR FORMATO CORRETO DE DATETIME
const ensureFullDatetime = (dateStr: string): string => {
  // Se a string tem apenas 16 caracteres (YYYY-MM-DDTHH:MM), adicionar segundos
  if (dateStr.length === 16) {
    return dateStr + ':00';
  }

  // Se tem 19 caracteres (YYYY-MM-DDTHH:MM:SS), está correto
  if (dateStr.length === 19) {
    return dateStr;
  }

  // Se é uma data ISO completa, usar slice para pegar até os segundos
  if (dateStr.includes('Z') || dateStr.includes('+')) {
    return new Date(dateStr).toISOString().slice(0, 19);
  }

  // Fallback: tentar criar uma data válida
  try {
    return new Date(dateStr).toISOString().slice(0, 19);
  } catch  {
    console.warn('⚠️ [DATETIME] Data inválida recebida:', dateStr);
    return dateStr; // Retorna como estava
  }
};

export function useEditLesson(): UseEditLessonState & UseEditLessonActions {
  const [state, setState] = useState<UseEditLessonState>({
    loading: {
      updateLesson: false,
      cancelLesson: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseEditLessonState['loading'], value: boolean) => {
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

  // Update lesson
  const updateLesson = useCallback(
    async (lessonId: string, data: UpdateLessonData): Promise<boolean> => {
      setLoading('updateLesson', true);
      setError(null);

      try {
        // 🔧 CORREÇÃO: Garantir formato correto de datetime antes de enviar
        const cleanData = {
          ...data,
          // Garantir que scheduledAt tenha formato completo se estiver presente
          ...(data.scheduledAt && {
            scheduledAt: ensureFullDatetime(data.scheduledAt),
          }),
          objectives: data.objectives?.filter((obj) => obj.trim()) || [],
          topics: data.topics?.filter((topic) => topic.trim()) || [],
          techniques: data.techniques?.filter((tech) => tech.trim()) || [],
        };

        console.log('📅✏️ [LESSONS] Enviando dados para atualização:', {
          lessonId,
          scheduledAt: cleanData.scheduledAt,
          // outros campos...
        });

        const response = await fetch('/api/lessons', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lessonId,
            ...cleanData,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle conflict errors specially
          if (response.status === 409 && result.conflicts) {
            throw new Error(
              `Conflito de horário detectado com ${result.conflicts.length} aula(s)`
            );
          }

          throw new Error(result.error || `Erro ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.error || 'Erro ao atualizar aula');
        }

        console.log('✅ Aula atualizada com sucesso!');

        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar aula:', error);
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
    async (lessonId: string, reason?: string): Promise<boolean> => {
      setLoading('cancelLesson', true);
      setError(null);

      try {
        const params = new URLSearchParams({
          id: lessonId,
          ...(reason && { reason }),
        });

        const response = await fetch(`/api/lessons?${params}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Erro ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.error || 'Erro ao cancelar aula');
        }

        console.log('✅ Aula cancelada com sucesso!');

        return true;
      } catch (error) {
        console.error('❌ Erro ao cancelar aula:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('cancelLesson', false);
      }
    },
    [setLoading, setError]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    updateLesson,
    cancelLesson,
    clearError,
  };
}
