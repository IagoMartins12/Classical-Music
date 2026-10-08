'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';

/** The study modal's code loads only once someone opens it. */
const LearningModal = dynamic(() => import('@/app/components/LearningModal'), {
  ssr: false,
});

/** Mounts the study modal ("want to learn" / "learned") the first time it opens. */
export function LearningModalHost() {
  const active = useLearningModalStore((s) => s.isOpen || s.isInSelectionMode);
  const [used, setUsed] = useState(false);
  useEffect(() => {
    if (active) setUsed(true);
  }, [active]);
  return used ? <LearningModal /> : null;
}
