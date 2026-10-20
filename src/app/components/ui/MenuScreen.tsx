'use client';

import type { ReactNode } from 'react';
import { PiCaretLeft } from 'react-icons/pi';
import { Button } from './Button';
import { cx } from './cx';

/**
 * One screen of a sliding mobile menu (main → profile → submenu).
 * Screens that are not in view slide out to their side and leave the
 * accessibility tree and the tab order (`inert`). Used by the site header
 * and the blog header.
 */
export function MenuScreen({
  active,
  side,
  children,
}: {
  active: boolean;
  side: 'left' | 'right';
  children: ReactNode;
}) {
  return (
    <div
      inert={!active}
      className={cx(
        'transition-transform duration-300 ease-saida motion-reduce:transition-none',
        active
          ? 'translate-x-0'
          : cx(
              'absolute left-0 top-0 w-full',
              side === 'left' ? '-translate-x-full' : 'translate-x-full'
            )
      )}
    >
      {children}
    </div>
  );
}

/** The title row of a secondary screen, with the way back. */
export function MenuScreenHeader({
  title,
  backLabel,
  onBack,
}: {
  title: string;
  backLabel: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-linha pb-3">
      <Button
        variante="fantasma"
        tamanho="p"
        icone={PiCaretLeft}
        rotulo={backLabel}
        onClick={onBack}
      />
      <h3 className="font-medium text-texto">{title}</h3>
    </div>
  );
}
