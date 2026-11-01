'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/** Back or forward keeps its place only if the path changes this soon after. */
const JANELA_DO_VOLTAR_MS = 1500;
/** Later passes: what still moves the page after it opens. */
const REPETICOES_MS = [60, 200, 500];

/**
 * A new page opens at its top, every time. The App Router only scrolls when
 * the new segment's first element is out of view, and that is not enough
 * here: the card waiting for the page (`CartoesQueViram`) and the sticky
 * header can leave it "in view", and a dialog that closes on the way returns
 * the focus to its button, which scrolls the old position back.
 *
 * So it scrolls when the path changes and again over the next half second,
 * until the person touches the page. Back and forward keep the browser's
 * restoration; that is told by time, not by a flag: a back that changed no
 * path (a closed sheet, a filter) left a flag on, and the next link did not
 * scroll, the intermittent failure of 31/10.
 *
 * A link to an anchor (`#...`) keeps its jump; the admin changes its path in
 * place on purpose (`router.replace(..., { scroll: false })`).
 */
export function TopoAoNavegar() {
  const pathname = usePathname();
  const anterior = useRef(pathname);
  const voltouEm = useRef(0);

  useEffect(() => {
    const aoVoltar = () => {
      voltouEm.current = Date.now();
    };
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  useEffect(() => {
    if (anterior.current === pathname) return;
    anterior.current = pathname;
    if (Date.now() - voltouEm.current < JANELA_DO_VOLTAR_MS) return;
    if (window.location.hash || pathname.startsWith('/admin')) return;

    const subir = () =>
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    subir();
    const quadro = requestAnimationFrame(subir);
    const tempos = REPETICOES_MS.map((ms) => setTimeout(subir, ms));

    const parar = () => {
      cancelAnimationFrame(quadro);
      tempos.forEach(clearTimeout);
      eventos.forEach((e) => window.removeEventListener(e, parar));
    };
    const eventos = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    eventos.forEach((e) =>
      window.addEventListener(e, parar, { passive: true })
    );
    const fim = setTimeout(parar, REPETICOES_MS[REPETICOES_MS.length - 1] + 50);

    return () => {
      clearTimeout(fim);
      parar();
    };
  }, [pathname]);

  return null;
}
