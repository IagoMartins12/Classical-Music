'use client';

import { useId, type ReactNode } from 'react';
import { cx } from './cx';

/**
 * The label of a field that is not a plain input (`SeletorDeData`,
 * `SelecaoComBusca`), with the look of `Field`'s. The label points at the
 * field by `id` instead of wrapping it: a floating panel inside a `<label>`
 * would send every click in it back to the field, closing the panel.
 */
export function Rotulado({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="t-rotulo font-medium text-texto">
        {label}
      </label>
      {children(id)}
    </div>
  );
}
