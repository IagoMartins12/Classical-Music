import Link from '@/app/components/LocalizedLink';
import { cx } from '@/app/components/ui/cx';

/**
 * The horizontal signature — the piano under the sky and OPUS ATLAS with the
 * atlas O — with the gold shine running through it: the way home from
 * anywhere.
 */
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
        'flex min-h-[var(--alvo)] shrink-0 items-center rounded-controle',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="marca marca-assinatura marca-brilho h-[22px] xl:h-6"
      />
    </Link>
  );
}
