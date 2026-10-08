'use client';

import { PiRows, PiSquaresFour } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { trocarVista } from '@/app/components/ui/transicao';
import { LISTS } from '@/app/conteudo/site/lists';
import { useListView } from '@/app/hooks/useListView';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { ListView } from '@/app/libs/api/profile';

/** Cards or list, from sm up (phones always get the list). Saved per person. */
export function ViewToggle({ className }: { className?: string }) {
  const copy = LISTS[useRouteLanguage().language].common;
  const [view, setView] = useListView();
  const options: [ListView, typeof PiSquaresFour, string][] = [
    ['cards', PiSquaresFour, copy.cards],
    ['list', PiRows, copy.list],
  ];
  return (
    <div
      role="group"
      aria-label={copy.view}
      className={cx(
        'flex gap-0.5 rounded-full bg-sup-2 p-1 max-sm:hidden',
        className
      )}
    >
      {options.map(([value, glyph, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          aria-label={label}
          title={label}
          onClick={() => view !== value && trocarVista(() => setView(value))}
          className={cx(
            'grid h-8 w-8 place-items-center rounded-full transition-colors duration-[var(--t-toque)]',
            view === value
              ? 'bg-[var(--fundo)] text-ouro-texto shadow-[var(--sombra-1)]'
              : 'text-texto-fraco hover:text-texto'
          )}
        >
          <Icon de={glyph} />
        </button>
      ))}
    </div>
  );
}

/** The list itself: carries the view so its items can lay out as cards or rows. */
export function ListResults({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const [view] = useListView();
  return (
    <ul data-view={view} className={className}>
      {children}
    </ul>
  );
}
