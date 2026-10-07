'use client';

import { useEffect, useRef } from 'react';

/**
 * Closes a popover on Escape and on a pointer press outside of it.
 * Listeners exist only while it is open.
 */
export function useDismiss<T extends HTMLElement>(
  open: boolean,
  close: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  return ref;
}
