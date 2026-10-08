import { cx } from '@/app/components/ui/cx';

/** A pill that toggles a filter or picks an option (lists, catalog, welcome). */
export const chip = (active: boolean) =>
  cx(
    'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
    active
      ? 'tint-ouro text-ouro-na-tinta'
      : 'bg-sup-2 text-texto-suave hover:text-texto'
  );
