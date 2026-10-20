'use client';

import { useEffect } from 'react';

const marcar = (img: HTMLImageElement) => img.setAttribute('data-falhou', '');

/**
 * Hides portraits whose photo failed (`Portrait`), revealing the initial
 * drawn underneath. One listener for the whole page instead of a client
 * component per picture; photos that failed before hydration are caught by
 * the first sweep.
 */
export function RetratosQueFalham() {
  useEffect(() => {
    document
      .querySelectorAll<HTMLImageElement>('img[data-retrato]')
      .forEach((img) => {
        if (img.complete && img.naturalWidth === 0) marcar(img);
      });
    const aoFalhar = (e: Event) => {
      const alvo = e.target;
      if (alvo instanceof HTMLImageElement && alvo.hasAttribute('data-retrato'))
        marcar(alvo);
    };
    // `error` does not bubble: listen in the capture phase.
    document.addEventListener('error', aoFalhar, true);
    return () => document.removeEventListener('error', aoFalhar, true);
  }, []);
  return null;
}
