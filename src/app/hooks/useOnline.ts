'use client';

import { useSyncExternalStore } from 'react';

const assinar = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

/** Whether the browser has a connection (true on the server). */
export function useOnline() {
  return useSyncExternalStore(
    assinar,
    () => navigator.onLine,
    () => true
  );
}
