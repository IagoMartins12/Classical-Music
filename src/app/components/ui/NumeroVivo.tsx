'use client';

import { useEffect, useRef } from 'react';

/**
 * A count that changes in place: the new number rises into view when the
 * value moves (a favorite removed, a notification arriving), never on the
 * first paint. Up rises from below, down drops from above.
 */
export function NumeroVivo({
  valor,
  className,
  oculto,
}: {
  valor: number;
  className?: string;
  /** When a label beside it already says the number to screen readers. */
  oculto?: boolean;
}) {
  const anterior = useRef<number | null>(null);
  const sentido =
    anterior.current === null || anterior.current === valor
      ? null
      : valor > anterior.current
        ? 'sobe'
        : 'desce';
  useEffect(() => {
    anterior.current = valor;
  }, [valor]);

  return (
    <span
      key={valor}
      aria-hidden={oculto || undefined}
      className={
        [sentido && `numero-${sentido}`, className].filter(Boolean).join(' ') ||
        undefined
      }
    >
      {valor}
    </span>
  );
}
