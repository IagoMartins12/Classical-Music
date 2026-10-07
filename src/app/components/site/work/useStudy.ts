'use client';

import { useCallback } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useLoginModal } from '@/app/stores/authStore';
import {
  useLearningModalStore,
  type LearningType,
} from '@/app/stores/useLearningModalStore';
import type { ScoreFile } from '@/app/requests/work-score-library';
import { toSelectedScore } from './scoreLabels';

export interface StudyContext {
  workId: string;
  workTitle: string;
  composerName: string;
  epochName?: string;
  instrumentName?: string;
}

/** Opens the study modal ("want to study" / "learned"), optionally with a score. */
export function useStudy(context: StudyContext) {
  const { isAuthenticated } = useAuth();
  const { open: openLogin } = useLoginModal();
  const openModal = useLearningModalStore((s) => s.openModal);
  return useCallback(
    (type: LearningType, score?: ScoreFile) => {
      if (!isAuthenticated) return openLogin();
      openModal({
        ...context,
        type,
        initialWorkScore: score ? toSelectedScore(score) : undefined,
      });
    },
    [isAuthenticated, openLogin, openModal, context]
  );
}
