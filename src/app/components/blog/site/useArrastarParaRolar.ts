'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Arrastar com o mouse rola uma faixa horizontal (o toque já rola sozinho).
 *
 * Só começa depois de 6px de movimento, para um clique continuar sendo
 * clique; e o clique que encerra um arraste é engolido, para soltar o botão
 * em cima de um cartão não abrir o artigo. Durante o arraste a faixa perde
 * o `snap` (senão ela puxa de volta a cada pixel) e o devolve no fim.
 */
export function useArrastarParaRolar(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inicioX = 0;
    let inicioRolagem = 0;
    let apertado = false;
    let arrastou = false;
    let snap = '';

    const apertar = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      apertado = true;
      arrastou = false;
      inicioX = e.clientX;
      inicioRolagem = el.scrollLeft;
    };
    const mover = (e: PointerEvent) => {
      if (!apertado) return;
      const dx = e.clientX - inicioX;
      if (!arrastou && Math.abs(dx) < 6) return;
      if (!arrastou) {
        arrastou = true;
        snap = el.style.scrollSnapType;
        el.style.scrollSnapType = 'none';
        el.style.cursor = 'grabbing';
        el.setPointerCapture(e.pointerId);
      }
      el.scrollLeft = inicioRolagem - dx;
    };
    const soltar = (e: PointerEvent) => {
      if (!apertado) return;
      apertado = false;
      if (!arrastou) return;
      el.style.scrollSnapType = snap;
      el.style.cursor = '';
      if (el.hasPointerCapture(e.pointerId))
        el.releasePointerCapture(e.pointerId);
    };
    const clicar = (e: MouseEvent) => {
      if (arrastou) {
        e.preventDefault();
        e.stopPropagation();
        arrastou = false;
      }
    };
    // Imagens e links começariam o arrastar nativo do navegador.
    const naoArrastarNativo = (e: DragEvent) => e.preventDefault();

    el.addEventListener('pointerdown', apertar);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('click', clicar, true);
    el.addEventListener('dragstart', naoArrastarNativo);
    return () => {
      el.removeEventListener('pointerdown', apertar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
      el.removeEventListener('click', clicar, true);
      el.removeEventListener('dragstart', naoArrastarNativo);
    };
  }, [ref]);
}
