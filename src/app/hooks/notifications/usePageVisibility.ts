// app/hooks/notifications/usePageVisibility.ts - CORRIGIDO
'use client';

import { useState, useEffect, useRef } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      setIsVisible(newVisibility);
    };

    // Set initial state only once
    if (!initialized.current) {
      setIsVisible(!document.hidden);
      initialized.current = true;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty deps - only run once

  return isVisible;
};
