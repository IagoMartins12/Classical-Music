'use client';

import { useEffect } from 'react';

const SELETOR =
  ':is(.revela, .revela-filhos):not([data-pronto]):not([data-visivel])';

/**
 * The one observer behind every `Revelar`: what is already on screen stays
 * as it is; what is below the fold gets `data-pronto` (hidden by the CSS)
 * and `data-visivel` when scrolled into view. Blocks that arrive with a
 * client navigation are picked up as they enter the DOM.
 */
export function RevelarAoRolar() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document
        .querySelectorAll<HTMLElement>(SELETOR)
        .forEach((el) => (el.dataset.visivel = ''));
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.visivel = '';
          observador.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    const preparar = () => {
      for (const el of document.querySelectorAll<HTMLElement>(SELETOR)) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
          el.dataset.visivel = '';
        } else {
          el.dataset.pronto = '';
          observador.observe(el);
        }
      }
    };
    preparar();
    let pendente = 0;
    const novos = new MutationObserver(() => {
      cancelAnimationFrame(pendente);
      pendente = requestAnimationFrame(preparar);
    });
    novos.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(pendente);
      novos.disconnect();
      observador.disconnect();
    };
  }, []);
  return null;
}
