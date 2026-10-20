'use client';

import { useCallback } from 'react';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import {
  useLearningModalStore,
  type LearningType,
} from '@/app/stores/useLearningModalStore';
import { useLearningStore } from '@/app/stores/useLearningStore';
import type { ScoreFile } from '@/app/requests/work-score-library';
import { toSelectedScore } from './scoreLabels';

export interface StudyContext {
  workId: string;
  workTitle: string;
  composerName: string;
  epochName?: string;
  instrumentName?: string;
}

/**
 * Opens the study sheet ("want to study" / "learned"), optionally with a
 * score. When the work is already on that list the sheet edits it; on the
 * other list, saving moves it (the API keeps the two exclusive).
 */
export function useStudy(context: StudyContext) {
  const allowed = useSignInGate();
  const openModal = useLearningModalStore((s) => s.openModal);
  const isWant = useLearningStore((s) => s.isWantToLearn);
  const isLearned = useLearningStore((s) => s.isLearned);
  return useCallback(
    (type: LearningType, score?: ScoreFile) => {
      if (!allowed('study')) return;
      openModal({
        ...context,
        type,
        isCurrentlyActive:
          type === 'want-to-learn'
            ? isWant(context.workId)
            : isLearned(context.workId),
        initialWorkScore: score ? toSelectedScore(score) : undefined,
      });
    },
    [allowed, openModal, context, isWant, isLearned]
  );
}
