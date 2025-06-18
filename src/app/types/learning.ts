// app/learning/types.ts
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ViewMode = 'grid' | 'list';
export type FilterTab = 'all' | 'want-to-learn' | 'learned';
export type SortOption = 'priority' | 'mastery' | 'date' | 'title' | 'composer';
export type SortDirection = 'asc' | 'desc';

export interface LearningStats {
  totalItems: number;
  wantToLearnCount: number;
  learnedCount: number;
  avgPriority: number;
  avgMastery: number;
  highPriorityCount: number;
  expertLevelCount: number;
}

export interface FilterState {
  activeTab: FilterTab;
  searchQuery: string;
  difficultyFilter: DifficultyLevel | 'all';
  priorityFilter: number | 'all';
  sortBy: SortOption;
  sortDirection: SortDirection;
}

// app/learning/utils.ts
import { WantToLearnItem, LearnedItem } from '@/app/stores/useLearningStore';

export const getDifficultyLabel = (difficulty?: DifficultyLevel): string => {
  const labels = {
    BEGINNER: 'Iniciante',
    INTERMEDIATE: 'Intermediário',
    ADVANCED: 'Avançado',
  };
  return difficulty ? labels[difficulty] : 'Não definido';
};

export const getDifficultyColor = (difficulty?: DifficultyLevel): string => {
  const colors = {
    BEGINNER: 'text-accent-green border-accent-green/30 bg-accent-green/10',
    INTERMEDIATE: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10',
    ADVANCED: 'text-accent-red border-accent-red/30 bg-accent-red/10',
  };
  return difficulty
    ? colors[difficulty]
    : 'text-theme-tertiary border-theme-secondary bg-theme-secondary';
};

export const formatDate = (dateString?: string): string | null => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatDuration = (duration?: number): string | null => {
  if (!duration) return null;
  if (duration === 1) return '1 dia';
  if (duration < 30) return `${duration} dias`;
  if (duration < 365) return `${Math.round(duration / 30)} meses`;
  return `${Math.round(duration / 365)} anos`;
};

export const calculateLearningStats = (
  wantToLearn: WantToLearnItem[],
  learned: LearnedItem[]
): LearningStats => {
  const totalItems = wantToLearn.length + learned.length;
  const avgPriority =
    wantToLearn.reduce((acc, item) => acc + item.priority, 0) /
    (wantToLearn.length || 1);
  const avgMastery =
    learned.reduce((acc, item) => acc + item.mastery, 0) /
    (learned.length || 1);
  const highPriorityCount = wantToLearn.filter(
    (item) => item.priority >= 4
  ).length;
  const expertLevelCount = learned.filter((item) => item.mastery >= 4).length;

  return {
    totalItems,
    wantToLearnCount: wantToLearn.length,
    learnedCount: learned.length,
    avgPriority: Math.round(avgPriority * 10) / 10,
    avgMastery: Math.round(avgMastery * 10) / 10,
    highPriorityCount,
    expertLevelCount,
  };
};

export const filterLearningData = (
  wantToLearn: WantToLearnItem[],
  learned: LearnedItem[],
  filters: FilterState
) => {
  let wantToLearnFiltered = [...wantToLearn];
  let learnedFiltered = [...learned];

  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    wantToLearnFiltered = wantToLearnFiltered.filter(
      (item) =>
        item.work?.title.toLowerCase().includes(query) ||
        item.work?.composer.name.toLowerCase().includes(query) ||
        item.work?.composer.fullName.toLowerCase().includes(query) ||
        item.motivation?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
    );
    learnedFiltered = learnedFiltered.filter(
      (item) =>
        item.work?.title.toLowerCase().includes(query) ||
        item.work?.composer.name.toLowerCase().includes(query) ||
        item.work?.composer.fullName.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.technicalChallenges?.toLowerCase().includes(query) ||
        item.musicalInsights?.toLowerCase().includes(query)
    );
  }

  // Difficulty filter
  if (filters.difficultyFilter !== 'all') {
    wantToLearnFiltered = wantToLearnFiltered.filter(
      (item) => item.difficulty === filters.difficultyFilter
    );
    learnedFiltered = learnedFiltered.filter(
      (item) => item.difficulty === filters.difficultyFilter
    );
  }

  // Priority filter (only for want-to-learn)
  if (filters.priorityFilter !== 'all') {
    wantToLearnFiltered = wantToLearnFiltered.filter(
      (item) => item.priority === filters.priorityFilter
    );
  }

  // Sorting
  const sortWantToLearn = (a: WantToLearnItem, b: WantToLearnItem) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'priority':
        comparison = a.priority - b.priority;
        break;
      case 'date':
        comparison =
          new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        break;
      case 'title':
        comparison = (a.work?.title || '').localeCompare(b.work?.title || '');
        break;
      case 'composer':
        comparison = (a.work?.composer.name || '').localeCompare(
          b.work?.composer.name || ''
        );
        break;
      default:
        comparison = b.priority - a.priority; // Default: high priority first
    }

    return filters.sortDirection === 'desc' ? -comparison : comparison;
  };

  const sortLearned = (a: LearnedItem, b: LearnedItem) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'mastery':
        comparison = a.mastery - b.mastery;
        break;
      case 'date':
        comparison =
          new Date(a.learnedAt).getTime() - new Date(b.learnedAt).getTime();
        break;
      case 'title':
        comparison = (a.work?.title || '').localeCompare(b.work?.title || '');
        break;
      case 'composer':
        comparison = (a.work?.composer.name || '').localeCompare(
          b.work?.composer.name || ''
        );
        break;
      default:
        comparison = b.mastery - a.mastery; // Default: high mastery first
    }

    return filters.sortDirection === 'desc' ? -comparison : comparison;
  };

  wantToLearnFiltered.sort(sortWantToLearn);
  learnedFiltered.sort(sortLearned);

  return { wantToLearn: wantToLearnFiltered, learned: learnedFiltered };
};

export const exportLearningData = (
  wantToLearn: WantToLearnItem[],
  learned: LearnedItem[]
) => {
  const data = {
    exportDate: new Date().toISOString(),
    summary: {
      totalWorks: wantToLearn.length + learned.length,
      wantToLearnCount: wantToLearn.length,
      learnedCount: learned.length,
    },
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
