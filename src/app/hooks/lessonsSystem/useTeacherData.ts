// app/hooks/useTeacherData.ts
import { useState, useCallback } from 'react';
import type {
  TeacherDashboardData,
  TeacherStudentsData,
} from '@/app/requests/teacher-request';
import {
  loadTeacherCalendar,
  loadTeacherDashboard,
  loadTeacherStudents,
} from '@/app/requests/portal/teacher';
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
        // Os mesmos três blocos da página servidora: painel, alunos ativos e
        // os próximos 30 dias do calendário.
        const start = new Date();
        const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [dashboard, students, calendar] = await Promise.all([
          loadTeacherDashboard(),
          loadTeacherStudents('active', 20, 0),
          loadTeacherCalendar(start, end),
        ]);

        setData({
          dashboard,
          students,
          calendar: {
            success: true,
            events: calendar.events,
            period: { start, end, view: 'month' },
            metadata: {
              totalEvents: calendar.events.length,
              lessonCount: calendar.events.length,
            },
          },
        });

        if (showToast) {
          toast.success('Dados atualizados com sucesso!');
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
