'use client';

import { porIdioma } from '@/app/utils/porIdioma';
import { CACHE_PARTITURAS } from './caches';

/**
 * The veil shown until the new page paints: plain DOM, not React — the page
 * is about to be thrown away. The gold body orbiting a ring is the same
 * loading sign as the notices (`Avisos`).
 */
function mostrarVeu() {
  if (document.getElementById('recarregando-veu')) return;
  const veu = document.createElement('div');
  veu.id = 'recarregando-veu';
  veu.setAttribute('role', 'status');
  veu.innerHTML = `
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="11" fill="none" stroke="var(--linha-forte)" stroke-width="1"/>
      <g class="aviso-astro">
        <path d="M14 3a11 11 0 0 1 11 11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="25" cy="14" r="2" fill="currentColor"/>
      </g>
    </svg>
    <span></span>`;
  veu.querySelector('span')!.textContent = porIdioma(
    'Recarregando…',
    'Reloading…'
  );
  document.body.appendChild(veu);
}

/**
 * "Tentar de novo" everywhere: a full reload, like Ctrl+Shift+R. The app
 * caches (saved pages, API answers) are emptied so nothing stale comes
 * back, the page itself is fetched past the browser cache, and then the
 * window reloads. Scores saved on the device stay: the person chose them.
 */
export async function recarregarTudo() {
  document.documentElement.classList.add('recarregando');
  mostrarVeu();
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
