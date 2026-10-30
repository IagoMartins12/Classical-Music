'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * A new page opens at its top. The App Router only scrolls when the new
 * segment's first element is out of view, and the card that waits for the
 * page (`CartoesQueViram`) plus the sticky header sometimes left it "in
 * view": the next page opened halfway down (owner's report, 29/10).
 *
 * Back and forward keep the browser's own restoration; a link to an anchor
 * (`#...`) keeps its jump; the admin changes its path in place on purpose
 * (`router.replace(..., { scroll: false })`) and is left alone.
 */
export function TopoAoNavegar() {
  const pathname = usePathname();
  const primeira = useRef(true);
  const voltando = useRef(false);

  useEffect(() => {
    const aoVoltar = () => {
      voltando.current = true;
    };
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    if (voltando.current) {
      voltando.current = false;
      return;
    }
    if (window.location.hash || pathname.startsWith('/admin')) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
