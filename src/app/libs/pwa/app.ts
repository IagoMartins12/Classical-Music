'use client';

import { CACHE_PARTITURAS } from './caches';

/** This device has opened the installed app at least once. */
const CHAVE_APP = 'opus-atlas:app-instalado';

/** Opened from the icon on the home screen, not from a browser tab. */
export const emAppInstalado = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * The offline layer belongs to the installed app only. In the app, the
 * service worker is registered and the device remembers it has the app. In
 * a browser tab, nothing is registered — the site is always the live one —
 * and a worker left by an earlier visit (or a production build tried on
 * localhost) is removed with its saved pages, so an old copy never stands
 * in for the site. A phone that also has the app keeps the worker: the
 * browser and the app share it.
 */
export async function prepararAppInstalado() {
  if (!('serviceWorker' in navigator)) return;
  const app = emAppInstalado();
  try {
    if (app) localStorage.setItem(CHAVE_APP, '1');
    else if (localStorage.getItem(CHAVE_APP)) return;
  } catch {
    // No storage: decide by this window alone.
  }
  // `public/sw.js` is only built for production (see `next.config`).
  if (app && process.env.NODE_ENV === 'production') {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return;
  }
  const registros = await navigator.serviceWorker.getRegistrations();
  if (!registros.length) return;
  await Promise.all(registros.map((r) => r.unregister()));
  if (typeof caches !== 'undefined') {
    const nomes = await caches.keys();
    await Promise.all(
      nomes.filter((n) => n !== CACHE_PARTITURAS).map((n) => caches.delete(n))
    );
  }
}
