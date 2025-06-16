// hooks/useOnboardingCheck.ts
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface OnboardingStatus {
  needsOnboarding: boolean;
  isLoading: boolean;
  hasChecked: boolean;
}

export function useOnboardingCheck(): OnboardingStatus {
  const { data: session, status } = useSession();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (status !== 'loading') {
      setHasChecked(true);
    }
  }, [status]);

  const needsOnboarding = Boolean(
    session?.user && !session.user.onboardingCompleted && hasChecked
  );

  return {
    needsOnboarding,
    isLoading: status === 'loading',
    hasChecked,
  };
}
