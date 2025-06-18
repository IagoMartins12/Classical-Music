// app/hooks/useLearningPage.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import {
  useLearningStore,
  WantToLearnItem,
  LearnedItem,
} from '../stores/useLearningStore';
import {
  FilterState,
  LearningStats,
  calculateLearningStats,
  filterLearningData,
} from '../types/learning';

interface UseLearningPageReturn {
  // Data
  wantToLearn: WantToLearnItem[];
  learned: LearnedItem[];
  filteredData: { wantToLearn: WantToLearnItem[]; learned: LearnedItem[] };
  stats: LearningStats;

  // State
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  refetch: () => Promise<void>;
  exportData: () => void;

  // Helpers
  getItemById: (
    workId: string,
    type: 'want-to-learn' | 'learned'
  ) => WantToLearnItem | LearnedItem | undefined;
  hasItem: (workId: string, type: 'want-to-learn' | 'learned') => boolean;
}

export function useLearningPage(initialData?: {
  wantToLearn: WantToLearnItem[];
  learned: LearnedItem[];
}): UseLearningPageReturn {
  const { user, isAuthenticated } = useAuth();
  const {
    wantToLearn,
    learned,
    initializeLearning,
    initialized,
    isWantToLearn,
    isLearned,
    getWantToLearnItem,
    getLearnedItem,
  } = useLearningStore();

  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFiltersState] = useState<FilterState>({
    activeTab: 'all',
    searchQuery: '',
    difficultyFilter: 'all',
    priorityFilter: 'all',
    sortBy: 'priority',
    sortDirection: 'desc',
  });

  // Initialize data on mount
  useEffect(() => {
    if (!initialized && initialData && isAuthenticated) {
      initializeLearning(initialData.wantToLearn, initialData.learned);
    }
  }, [initialized, initialData, isAuthenticated, initializeLearning]);

  // Fetch data function
  const fetchLearningData = async () => {
    if (!isAuthenticated || !user?.id) return;

    setIsLoading(true);
    try {
      const [wantToLearnResponse, learnedResponse] = await Promise.all([
        fetch('/api/learning/want-to-learn'),
        fetch('/api/learning/learned'),
      ]);

      if (wantToLearnResponse.ok && learnedResponse.ok) {
        const [wantToLearnData, learnedData] = await Promise.all([
          wantToLearnResponse.json(),
          learnedResponse.json(),
        ]);

        initializeLearning(
          wantToLearnData.items || [],
          learnedData.items || []
        );
      }
    } catch (error) {
      console.error('Erro ao carregar dados de aprendizado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on authentication change
  useEffect(() => {
    if (isAuthenticated && user?.id && !initialized) {
      fetchLearningData();
    }
  }, [isAuthenticated, user?.id, initialized]);

  // Update filters helper
  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateLearningStats(wantToLearn, learned);
  }, [wantToLearn, learned]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return filterLearningData(wantToLearn, learned, filters);
  }, [wantToLearn, learned, filters]);

  // Export data function
  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      summary: stats,
      wantToLearn: wantToLearn.map((item) => ({
        title: item.work?.title,
        composer: item.work?.composer.fullName,
        priority: item.priority,
        difficulty: item.difficulty,
        targetDate: item.targetDate,
        estimatedStudyTime: item.estimatedStudyTime,
        motivation: item.motivation,
        context: item.context,
        notes: item.notes,
        addedAt: item.addedAt,
      })),
      learned: learned.map((item) => ({
        title: item.work?.title,
        composer: item.work?.composer.fullName,
        mastery: item.mastery,
        difficulty: item.difficulty,
        studyDuration: item.studyDuration,
        enjoyment: item.enjoyment,
        wouldRecommend: item.wouldRecommend,
        publicPerformance: item.publicPerformance,
        technicalChallenges: item.technicalChallenges,
        musicalInsights: item.musicalInsights,
        notes: item.notes,
        learnedAt: item.learnedAt,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu-aprendizado-musical-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper functions
  const getItemById = (workId: string, type: 'want-to-learn' | 'learned') => {
    return type === 'want-to-learn'
      ? getWantToLearnItem(workId)
      : getLearnedItem(workId);
  };

  const hasItem = (workId: string, type: 'want-to-learn' | 'learned') => {
    return type === 'want-to-learn' ? isWantToLearn(workId) : isLearned(workId);
  };

  return {
    // Data
    wantToLearn,
    learned,
    filteredData,
    stats,

    // State
    filters,
    setFilters,
    isLoading,
    isInitialized: initialized,

    // Actions
    refetch: fetchLearningData,
    exportData,

    // Helpers
    getItemById,
    hasItem,
  };
}
