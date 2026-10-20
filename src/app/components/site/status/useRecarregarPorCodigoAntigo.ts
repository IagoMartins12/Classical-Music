import { useEffect, useState } from 'react';
import { recarregarTudo } from '@/app/libs/pwa/recarregar';

const RECARREGOU = 'opus-atlas:recarregou-por-chunk';

/**
 * A page's code that no longer exists: a new build went out (and the new
 * service worker took over, dropping the old files) while this tab still
 * ran the previous one. Opening a screen whose code was not loaded yet then
 * fails — it is not a failure of ours, and a fresh load fixes it.
 */
const ehCodigoAntigo = (error: Error) =>
  error.name === 'ChunkLoadError' ||
  /Loading (CSS )?chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    error.message
  );

/**
 * `true` while the tab reloads by itself because of stale code — once: if it
 * fails again within fifteen seconds this is `false` and the error shows, so
 * it never loops. Any other error is logged and returns `false`.
 */
export function useRecarregarPorCodigoAntigo(error: Error): boolean {
  // Decided on the first render, so the error page never flashes first.
  const [recarregar] = useState(() => {
    if (typeof window === 'undefined' || !ehCodigoAntigo(error)) return false;
    try {
      return (
        Date.now() - Number(sessionStorage.getItem(RECARREGOU) ?? 0) > 15_000
      );
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!recarregar) {
      console.error('Application error:', error);
      return;
    }
    try {
      sessionStorage.setItem(RECARREGOU, String(Date.now()));
    } catch {
      // No storage: this single reload still happens.
    }
    void recarregarTudo();
  }, [error, recarregar]);

  return recarregar;
}
