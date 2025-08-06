// app/hooks/useStudentDashboard.ts - Hook específico para dashboard do aluno

import { StudentDashboardData } from '@/app/(main)/student/pageServer';
import { useState, useCallback } from 'react';

interface UseStudentDashboardState {
  dashboardData: StudentDashboardData | null;
  loading: {
    dashboard: boolean;
    refreshing: boolean;
  };
  error: string | null;
}

interface UseStudentDashboardActions {
  // Dashboard data
  refreshDashboard: () => Promise<void>;

  // Data manipulation
  setInitialData: (data: StudentDashboardData) => void;
  updateDashboardData: (
    updates: Partial<StudentDashboardData['dashboard']>
  ) => void;

  // Utilities
  clearError: () => void;
}

export function useStudentDashboard(
  initialData?: StudentDashboardData | null
): UseStudentDashboardState & UseStudentDashboardActions {
  const [state, setState] = useState<UseStudentDashboardState>({
    dashboardData: initialData || null,
    loading: {
      dashboard: false,
      refreshing: false,
    },
    error: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentDashboardState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: StudentDashboardData) => {
    setState((prev) => ({
      ...prev,
      dashboardData: data,
    }));
  }, []);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    setLoading('refreshing', true);
    setError(null);

    try {
      const response = await fetch('/api/student/dashboard', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Dashboard API returned error');
      }

      setState((prev) => ({
        ...prev,
        dashboardData: data,
      }));
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('refreshing', false);
    }
  }, [setLoading, setError]);

  // Update dashboard data in state
  const updateDashboardData = useCallback(
    (updates: Partial<StudentDashboardData['dashboard']>) => {
      setState((prev) => ({
        ...prev,
        dashboardData: prev.dashboardData
          ? {
              ...prev.dashboardData,
              dashboard: {
                ...prev.dashboardData.dashboard,
                ...updates,
              },
            }
          : null,
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
    refreshDashboard,
    setInitialData,
    updateDashboardData,
    clearError,
  };
}
