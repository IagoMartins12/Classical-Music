// app/hooks/lessonsSystem/useTeacherProgressReport.ts - Hook para relatório detalhado

import { useState, useCallback, useEffect } from 'react';
import type {
  TeacherProgressReportResponse,
  PeriodOption,
  PeriodFilter,
} from '@/app/types/teacherProgressReport';
import {
  loadTeacherProgressReport,
  shareProgressReport,
} from '@/app/requests/portal/progress-report';

interface UseTeacherProgressReportState {
  reportData: TeacherProgressReportResponse | null;
  loading: {
    initial: boolean;
    refreshing: boolean;
    changingPeriod: boolean;
    sharing: boolean;
  };
  error: string | null;
  currentPeriod: PeriodFilter;
}

interface UseTeacherProgressReportActions {
  // Data management
  setInitialData: (data: TeacherProgressReportResponse) => void;
  refreshReport: () => Promise<void>;
  changePeriod: (
    period: PeriodOption,
    customDates?: { start: Date; end: Date }
  ) => Promise<void>;

  // Report actions
  shareWithStudent: () => Promise<boolean>;

  // Utilities
  clearError: () => void;
  setError: (error: string) => void;
}

const PERIOD_OPTIONS: Record<PeriodOption, (baseDate: Date) => PeriodFilter> = {
  '1month': (now) => ({
    type: '1month',
    startDate: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    endDate: now,
    label: 'Último mês',
  }),
  '3months': (now) => ({
    type: '3months',
    startDate: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
    endDate: now,
    label: 'Últimos 3 meses',
  }),
  '6months': (now) => ({
    type: '6months',
    startDate: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
    endDate: now,
    label: 'Últimos 6 meses',
  }),
  '1year': (now) => ({
    type: '1year',
    startDate: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    endDate: now,
    label: 'Último ano',
  }),
  all: (now) => ({
    type: 'all',
    startDate: new Date(2020, 0, 1),
    endDate: now,
    label: 'Todo o período',
  }),
  custom: (now) => ({
    type: 'custom',
    startDate: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
    endDate: now,
    label: 'Personalizado',
  }),
};

export function useTeacherProgressReport(
  studentId: string,
  initialData?: TeacherProgressReportResponse | null,
  initialPeriod: PeriodOption = '6months'
): UseTeacherProgressReportState & UseTeacherProgressReportActions {
  const [state, setState] = useState<UseTeacherProgressReportState>({
    reportData: initialData || null,
    loading: {
      initial: false,
      refreshing: false,
      changingPeriod: false,
      sharing: false,
    },
    error: null,
    currentPeriod: PERIOD_OPTIONS[initialPeriod](new Date()),
  });

  // Helper function to update loading states
  const setLoading = useCallback(
    (key: keyof UseTeacherProgressReportState['loading'], value: boolean) => {
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
  const setInitialData = useCallback((data: TeacherProgressReportResponse) => {
    setState((prev) => ({
      ...prev,
      reportData: data,
    }));
  }, []);

  // Fetch report data from API
  const fetchReportData = useCallback(
    async (
      period: PeriodFilter
    ): Promise<TeacherProgressReportResponse | null> => {
      try {
        const data = await loadTeacherProgressReport(
          studentId,
          period.type,
          period.type === 'custom' && period.startDate && period.endDate
            ? { start: period.startDate, end: period.endDate }
            : undefined
        );

        if (!data) {
          throw new Error('Aluno não está entre os seus vínculos');
        }

        return data;
      } catch (error) {
        console.error('Error fetching progress report:', error);
        throw error;
      }
    },
    [studentId]
  );

  // Refresh current report data
  const refreshReport = useCallback(async () => {
    setLoading('refreshing', true);
    setError(null);

    try {
      const data = await fetchReportData(state.currentPeriod);

      setState((prev) => ({
        ...prev,
        reportData: data,
      }));

      console.log('Progress report refreshed successfully');
    } catch (error) {
      console.error('Error refreshing progress report:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('refreshing', false);
    }
  }, [state.currentPeriod, fetchReportData, setLoading, setError]);

  // Change period and reload data
  const changePeriod = useCallback(
    async (period: PeriodOption, customDates?: { start: Date; end: Date }) => {
      let newPeriodFilter: PeriodFilter;

      if (period === 'custom' && customDates) {
        newPeriodFilter = {
          type: 'custom',
          startDate: customDates.start,
          endDate: customDates.end,
          label: `${customDates.start.toLocaleDateString(
            'pt-BR'
          )} - ${customDates.end.toLocaleDateString('pt-BR')}`,
        };
      } else {
        newPeriodFilter = PERIOD_OPTIONS[period](new Date());
      }

      if (
        newPeriodFilter.type === state.currentPeriod.type &&
        newPeriodFilter.startDate?.getTime() ===
          state.currentPeriod.startDate?.getTime() &&
        newPeriodFilter.endDate?.getTime() ===
          state.currentPeriod.endDate?.getTime()
      ) {
        return; // Same period, no need to reload
      }

      setLoading('changingPeriod', true);
      setError(null);

      try {
        const data = await fetchReportData(newPeriodFilter);

        setState((prev) => ({
          ...prev,
          currentPeriod: newPeriodFilter,
          reportData: data,
        }));

        console.log(`Period changed to ${period} successfully`);
      } catch (error) {
        console.error('Error changing period:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading('changingPeriod', false);
      }
    },
    [state.currentPeriod, fetchReportData, setLoading, setError]
  );

  // Share report with student
  const shareWithStudent = useCallback(async (): Promise<boolean> => {
    if (!state.reportData) return false;

    setLoading('sharing', true);
    setError(null);

    try {
      // A API gera o conteúdo compartilhado a partir dos dados do período.
      await shareProgressReport(studentId, state.currentPeriod);

      console.log('Report shared with student successfully');
      return true;
    } catch (error) {
      console.error('Error sharing report:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading('sharing', false);
    }
  }, [studentId, state.reportData, setLoading, setError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Auto-load data on mount if no initial data
  useEffect(() => {
    if (!initialData && !state.reportData && !state.loading.initial) {
      setLoading('initial', true);
      fetchReportData(state.currentPeriod)
        .then((data) => {
          setState((prev) => ({
            ...prev,
            reportData: data,
          }));
        })
        .catch((error) => {
          console.error('Error loading initial report data:', error);
          setError(
            error instanceof Error ? error.message : 'Erro desconhecido'
          );
        })
        .finally(() => setLoading('initial', false));
    }
  }, [
    initialData,
    state.reportData,
    state.loading.initial,
    state.currentPeriod,
    fetchReportData,
    setLoading,
    setError,
  ]);

  return {
    // State
    ...state,

    // Actions
    setInitialData,
    refreshReport,
    changePeriod,
    shareWithStudent,
    clearError,
    setError,
  };
}

// Helper functions for formatting and calculations

export const formatPeriodLabel = (period: PeriodFilter): string => {
  return period.label;
};

export const getProgressTrend = (
  current: number,
  previous: number
): 'improving' | 'stable' | 'declining' => {
  const change = ((current - previous) / previous) * 100;
  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
};

export const getEngagementColor = (score: number): string => {
  if (score >= 4) return 'accent-green';
  if (score >= 3) return 'accent-blue';
  if (score >= 2) return 'accent-yellow';
  return 'accent-red';
};

export const getAttendanceColor = (rate: number): string => {
  if (rate >= 90) return 'accent-green';
  if (rate >= 80) return 'accent-blue';
  if (rate >= 70) return 'accent-yellow';
  return 'accent-red';
};

export const getDifficultyLabel = (level: string): string => {
  const labels: Record<string, string> = {
    BEGINNER: 'Iniciante',
    INTERMEDIATE: 'Intermediário',
    ADVANCED: 'Avançado',
    EXPERT: 'Expert',
  };
  return labels[level] || level;
};

export const getInsightIcon = (insight: string): string => {
  const icons: Record<string, string> = {
    consistent_student: '🎯',
    morning_performer: '🌅',
    classical_preference: '🎼',
    technique_focus: '💪',
    quick_learner: '⚡',
    needs_encouragement: '🌟',
  };
  return icons[insight] || '💡';
};

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
  gradient: [
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#06B6D4',
    '#EC4899',
    '#F97316',
  ],
} as const;

export const PERIOD_FILTER_OPTIONS: Array<{
  value: PeriodOption;
  label: string;
}> = [
  { value: '1month', label: 'Último mês' },
  { value: '3months', label: 'Últimos 3 meses' },
  { value: '6months', label: 'Últimos 6 meses' },
  { value: '1year', label: 'Último ano' },
  { value: 'all', label: 'Todo o período' },
  { value: 'custom', label: 'Personalizado' },
];
