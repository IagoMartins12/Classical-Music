'use client';

import { useCallback, useState } from 'react';
import { PiCaretDown } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { HeaderCopy } from '@/app/conteudo/site/header';
import { useDismiss } from '@/app/hooks/useDismiss';
import { OnThisDayMenuEntry } from '../on-this-day/OnThisDayCallout';
import { EXPLORE_PATHS, isActivePath } from './navigation';

/** "Explorar": the encyclopedia's paths, in a full-width panel. */
export function ExploreMenu({
  copy,
  path,
}: {
  copy: HeaderCopy;
  path: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const active = EXPLORE_PATHS.some((p) => isActivePath(path, p.href));

  return (
    <div ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="explore-panel"
        onClick={() => setOpen(!open)}
        className={cx(
          'flex min-h-[var(--alvo)] items-center gap-1.5 rounded-controle px-3 text-[0.9375rem] font-medium',
          active || open
            ? 'text-ouro-texto'
            : 'text-texto-suave hover:text-texto'
        )}
      >
        {copy.explore}
        <Icon
          de={PiCaretDown}
          tamanho="pp"
          className={cx(
            'transition-transform duration-[var(--t-resposta)]',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div
          id="explore-panel"
          className="popover-open sup-alta absolute inset-x-0 top-full z-menu !rounded-none !rounded-b-card"
        >
          <ul className="section-wrap grid grid-cols-5 gap-4 py-6">
            {EXPLORE_PATHS.map((item) => {
              const entry = copy.explorePaths[item.key];
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={
                      isActivePath(path, item.href) ? 'page' : undefined
                    }
                    className="group flex flex-col gap-1 rounded-controle p-3 hover:bg-sup-2"
                  >
                    <span className="font-display text-[1.25rem] transition-colors group-hover:text-ouro-texto">
                      {entry.label}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {entry.detail}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li>
              <OnThisDayMenuEntry
                onNavigate={close}
                active={isActivePath(path, '/on-this-day')}
              />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
