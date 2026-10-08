import type {
  LearningType,
  SelectedWorkScore,
} from '@/app/stores/useLearningModalStore';
import type {
  LearnedItem,
  WantToLearnItem,
} from '@/app/stores/useLearningStore';

type StudyItem = WantToLearnItem | LearnedItem;

const day = (iso?: string) => (iso ? iso.split('T')[0] : '');

/** What the study modal needs to edit an item already on a list. */
export function studyEditParams(item: StudyItem, type: LearningType) {
  const work = item.work;
  const score = item.selectedWorkScore;
  const initialWorkScore: SelectedWorkScore | null = score
    ? { ...score }
    : null;
  const base = {
    workId: item.workId,
    workTitle: work?.title ?? '',
    epochName: item.epochName,
    composerName: work?.composer.fullName ?? '',
    instrumentName: work?.instrument?.name,
    type,
    isCurrentlyActive: true,
    initialWorkScore,
  };
  if (type === 'want-to-learn') {
    const w = item as WantToLearnItem;
    return {
      ...base,
      initialWantToLearnData: {
        priority: w.priority || 0,
        notes: w.notes || '',
        targetDate: day(w.targetDate),
        estimatedStudyTime: w.estimatedStudyTime,
        difficulty: w.difficulty,
        motivation: w.motivation || '',
        context: w.context || '',
        selectedWorkScoreId: w.selectedWorkScoreId,
      },
    };
  }
  const l = item as LearnedItem;
  return {
    ...base,
    initialLearnedData: {
      mastery: l.mastery || 0,
      studyStartDate: day(l.studyStartDate),
      studyDuration: l.studyDuration,
      notes: l.notes || '',
      wouldRecommend: l.wouldRecommend ?? true,
      publicPerformance: l.publicPerformance || false,
      difficulty: l.difficulty,
      enjoyment: l.enjoyment,
      technicalChallenges: l.technicalChallenges || '',
      musicalInsights: l.musicalInsights || '',
      selectedWorkScoreId: l.selectedWorkScoreId,
    },
  };
}

/** Whole days from today to a date (negative when it passed). */
export function daysUntil(iso: string, now = new Date()) {
  const target = new Date(`${day(iso)}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
