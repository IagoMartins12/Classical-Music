import type { ReactNode } from 'react';
import { cx } from '@/app/components/ui/cx';

/**
 * A slowly turning engraved layer (the graduated rim of the atlas, the globe,
 * the editorial orbits). Its own `<svg>`, laid over the drawing with the same
 * `viewBox`, so the turn is a transform of an HTML box: the GPU rotates it
 * without repainting the engraving underneath. Turning a `<g>` inside the
 * drawing repainted the whole illustration every frame.
 */
export function CamadaQueGira({
  children,
  className,
  opacity,
}: {
  children: ReactNode;
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 600 600"
      aria-hidden="true"
      opacity={opacity}
      className={cx('coroa-gira absolute inset-0 h-full w-full', className)}
    >
      {children}
    </svg>
  );
}
