'use client';

import { CACHE_PARTITURAS } from './caches';

/**
 * "Tentar de novo" everywhere: a full reload, like Ctrl+Shift+R. The app
 * caches (saved pages, API answers) are emptied so nothing stale comes
 * back, the page itself is fetched past the browser cache, and then the
 * window reloads. Scores saved on the device stay: the person chose them.
 */
export async function recarregarTudo() {
  try {
    if (typeof caches !== 'undefined') {
      const nomes = await caches.keys();
      await Promise.all(
        nomes
          .filter((n) => n !== CACHE_PARTITURAS && !n.includes('precache'))
          .map((n) => caches.delete(n))
      );
    }
    await fetch(window.location.href, {
      cache: 'reload',
      credentials: 'include',
    });
  } catch {
    // Offline or blocked storage: the plain reload below still runs.
  }
  window.location.reload();
}
