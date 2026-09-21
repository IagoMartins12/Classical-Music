// app/hooks/useStudentProgress.ts - Hook para gerenciar progresso do aluno

import { useState, useCallback, useEffect } from 'react';
import {
  loadStudentProgress,
  type StudentProgressResponse,
} from '@/app/requests/portal/student-progress';

interface UseStudentProgressState {
  progressData: StudentProgressResponse | null;
  loading: {
    initial: boolean;
    refreshing: boolean;
    changingPeriod: boolean;
  };
  error: string | null;
  currentPeriod: string;
}

interface UseStudentProgressActions {
  // Data management
  setInitialData: (data: StudentProgressResponse) => void;
  refreshProgress: () => Promise<void>;
  changePeriod: (period: string) => Promise<void>;

  // Utilities
  clearError: () => void;
  setError: (error: string) => void;
}

type PeriodOption = '3months' | '6months' | '1year' | 'all';

export function useStudentProgress(
  initialData?: StudentProgressResponse | null,
  initialPeriod: string = '6months'
): UseStudentProgressState & UseStudentProgressActions {
  const [state, setState] = useState<UseStudentProgressState>({
    progressData: initialData || null,
    loading: {
      initial: false,
      refreshing: false,
      changingPeriod: false,
    },
    error: null,
    currentPeriod: initialPeriod,
  });

  // Helper function to update loading states
  const setLoading = useCallback(
    (key: keyof UseStudentProgressState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: StudentProgressResponse) => {
    setState((prev) => ({
      ...prev,
      progressData: data,
      currentPeriod: data.period.label.includes('3 meses')
        ? '3months'
        : data.period.label.includes('6 meses')
          ? '6months'
          : data.period.label.includes('ano')
            ? '1year'
            : 'all',
    }));
  }, []);

  // Refresh current progress data
  const refreshProgress = useCallback(async () => {
    setLoading('refreshing', true);
    setError(null);

    try {
      const data = await loadStudentProgress(state.currentPeriod);

      if (!data) {
        throw new Error('Perfil de aluno não encontrado');
      }

      setState((prev) => ({
        ...prev,
        progressData: data,
      }));

      console.log('✅ Progress data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing progress:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading('refreshing', false);
    }
  }, [state.currentPeriod, setLoading, setError]);

  // Change period and reload data
  const changePeriod = useCallback(
    async (period: string) => {
      if (period === state.currentPeriod) return;

      setLoading('changingPeriod', true);
      setError(null);

      try {
        const data = await loadStudentProgress(period);

        if (!data) {
          throw new Error('Perfil de aluno não encontrado');
        }

        setState((prev) => ({
          ...prev,
          currentPeriod: period,
          progressData: data,
        }));

        console.log(`✅ Period changed to ${period} successfully`);
      } catch (error) {
        console.error('❌ Error changing period:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading('changingPeriod', false);
      }
    },
    [state.currentPeriod, setLoading, setError]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Auto-refresh on mount if no initial data
  useEffect(() => {
    if (!initialData && !state.progressData && !state.loading.initial) {
      setLoading('initial', true);
      refreshProgress().finally(() => setLoading('initial', false));
    }
  }, [
    initialData,
    state.progressData,
    state.loading.initial,
    refreshProgress,
    setLoading,
  ]);

  return {
    // State
    ...state,

    // Actions
    setInitialData,
    refreshProgress,
    changePeriod,
    clearError,
    setError,
  };
}

// Helper functions for formatting and calculations

export const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

export const formatPeriodLabel = (period: string): string => {
  switch (period) {
    case '3months':
      return 'Últimos 3 meses';
    case '6months':
      return 'Últimos 6 meses';
    case '1year':
      return 'Último ano';
    case 'all':
      return 'Todo o período';
    default:
      return 'Período selecionado';
  }
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-accent-green';
  if (percentage >= 60) return 'text-accent-blue';
  if (percentage >= 40) return 'text-accent-yellow';
  return 'text-accent-red';
};

export const getProgressBgColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-accent-green/10 border-accent-green/30';
  if (percentage >= 60) return 'bg-accent-blue/10 border-accent-blue/30';
  if (percentage >= 40) return 'bg-accent-yellow/10 border-accent-yellow/30';
  return 'bg-accent-red/10 border-accent-red/30';
};

export const getStreakEmoji = (streakDays: number): string => {
  if (streakDays >= 30) return '🔥';
  if (streakDays >= 14) return '⭐';
  if (streakDays >= 7) return '💪';
  if (streakDays >= 3) return '👍';
  return '🌱';
};

export const getAssignmentTypeLabel = (type: string): string => {
  const typeLabels: Record<string, string> = {
    practice: 'Prática',
    theory: 'Teoria',
    listening: 'Audição',
    composition: 'Composição',
    technique: 'Técnica',
    sight_reading: 'Leitura à primeira vista',
    memorization: 'Memorização',
    performance: 'Performance',
  };

  return typeLabels[type] || type;
};

export const PERIOD_OPTIONS: Array<{ value: PeriodOption; label: string }> = [
  { value: '3months', label: 'Últimos 3 meses' },
  { value: '6months', label: 'Últimos 6 meses' },
  { value: '1year', label: 'Último ano' },
  { value: 'all', label: 'Todo o período' },
];

export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  gradient: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'],
} as const;
