import { GiGrandPiano } from 'react-icons/gi';
import Link from '@/app/components/LocalizedLink';
import { cx } from '@/app/components/ui/cx';

/** The piano and the gold "Opus Atlas": the way home from anywhere. */
export function BrandLink({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={label}
      className={cx(
        'group/brand flex min-h-[var(--alvo)] shrink-0 items-center gap-2.5 rounded-controle',
        className
      )}
    >
      <GiGrandPiano
        aria-hidden="true"
        className="icon-glow h-7 w-7 shrink-0 text-ouro-texto transition-transform duration-300 group-hover/brand:-rotate-6 motion-reduce:transition-none"
      />
      <span className="gold-shine font-display text-[1.375rem] font-semibold leading-none">
        Opus Atlas
      </span>
    </Link>
  );
}
