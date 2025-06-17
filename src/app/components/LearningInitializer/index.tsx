// components/LearningInitializer/LearningInitializer.tsx
'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { useEffect } from 'react';
import { WantToLearnItem, LearnedItem } from '@/app/stores/useLearningStore';

interface LearningInitializerProps {
  learningData: {
    wantToLearn: WantToLearnItem[];
    learned: LearnedItem[];
  };
}

export const LearningInitializer = ({
  learningData,
}: LearningInitializerProps) => {
  const { initializeLearning, initialized } = useLearningStore();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.id &&
      !initialized &&
      (learningData.wantToLearn.length > 0 || learningData.learned.length > 0)
    ) {
      initializeLearning(learningData.wantToLearn, learningData.learned);
    }
  }, [
    learningData,
    initializeLearning,
    initialized,
    isAuthenticated,
    user?.id,
  ]);

  return null;
};
